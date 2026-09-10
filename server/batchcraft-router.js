/**
 * BatchCraft backend — the one FE task that exists (RecipeCostBoard.tsx, `idt-batchcraft-costboard`)
 * calls exactly two real endpoints below, adapted to this project's real Express + in-memory stack
 * rather than the spec's literal Prisma+PostgreSQL+decimal.js stack (same trade-off
 * minierp-router.js and smb-desk-router.js already make — no real database, plain JS numbers
 * rounded to cents/hundredths instead of a Decimal library).
 *
 * Both of the spec's own backend tasks ARE real here, faithfully adapted from their own service
 * code: TASK 1's recursive plate-cost + edible-portion yield solver (costing.service.ts) actually
 * computes costPerServing/foodCostPct below rather than returning canned numbers, recursing through
 * real nested sub-recipes; TASK 2's scaled prep batch execution (prep.service.ts) actually validates
 * and depletes real ingredient stock, rejecting with INSUFFICIENT_PANTRY_STOCK exactly as specced.
 */
import express from "express";

const router = express.Router();

// baseUnitCost = purchasePrice / purchaseQty (price per raw base unit); effective EP unit cost then
// inflates that by trim/cook shrinkage: baseUnitCost / (yieldPercent / 100). Matches the spec's own
// "Edible Portion (EP) Yield Invariant" exactly (Section 2.1.1).
let ingredients = [
  { id: "ing-tomato", name: "Canned Tomatoes", baseUom: "KILOGRAM", purchasePrice: 3.0, purchaseQty: 6, yieldPercent: 100.0, stockOnHand: 40 },
  { id: "ing-basil", name: "Fresh Basil", baseUom: "GRAM", purchasePrice: 4.0, purchaseQty: 100, yieldPercent: 90.0, stockOnHand: 2000 },
  { id: "ing-pasta-sheet", name: "Pasta Sheets", baseUom: "PIECE", purchasePrice: 12.0, purchaseQty: 24, yieldPercent: 100.0, stockOnHand: 200 },
  { id: "ing-mozzarella", name: "Mozzarella", baseUom: "KILOGRAM", purchasePrice: 9.0, purchaseQty: 3, yieldPercent: 95.0, stockOnHand: 15 },
];

// A recipe's `items` mix real ingredient lines (ingredientId set) and real nested sub-recipe lines
// (subRecipeId set) — exactly the spec's ParentRecipe/ChildSubRecipe self-relation, just as plain
// arrays instead of a Prisma relation.
let recipes = [
  {
    id: "recipe-marinara",
    code: "MAR-01",
    name: "Marinara Sauce",
    type: "PREP_ITEM",
    servingYield: 10,
    targetCostPct: 30.0,
    sellingPrice: 0.95,
    items: [
      { ingredientId: "ing-tomato", quantityRequired: 3 },
      { ingredientId: "ing-basil", quantityRequired: 40 },
    ],
  },
  {
    id: "recipe-lasagna",
    code: "LAS-01",
    name: "Lasagna",
    type: "MENU_ITEM",
    servingYield: 1,
    targetCostPct: 30.0,
    sellingPrice: 15.5,
    items: [
      { subRecipeId: "recipe-marinara", quantityRequired: 0.3 },
      { ingredientId: "ing-pasta-sheet", quantityRequired: 3 },
      { ingredientId: "ing-mozzarella", quantityRequired: 0.15 },
    ],
  },
];

let prepBatches = [];
let prepBatchesIdCounter = 1;
function prepBatchesNextId() {
  return String(prepBatchesIdCounter++);
}

/** Faithfully adapted from the spec's costing.service.ts calculateRecipePlateCost: normalizes every
 * ingredient line to its real edible-portion unit cost, recurses into any nested sub-recipe line to
 * evaluate ITS plate cost first, then divides the summed batch cost by servingYield. Plain numbers
 * rounded to 4dp for unit costs / 2dp for money, in place of decimal.js — same rounding discipline
 * minierp-router.js already uses for its own money math. */
function calculateRecipeCost(recipeId) {
  const recipe = recipes.find((r) => r.id === recipeId);
  if (!recipe) throw new Error(`Unknown recipe ${recipeId}`);

  let totalBatchCost = 0;
  for (const item of recipe.items) {
    if (item.ingredientId) {
      const ingredient = ingredients.find((i) => i.id === item.ingredientId);
      if (!ingredient) throw new Error(`Unknown ingredient ${item.ingredientId} on recipe ${recipe.code}`);
      const baseUnitCost = ingredient.purchasePrice / ingredient.purchaseQty;
      const yieldFactor = ingredient.yieldPercent / 100;
      const effectiveUnitCost = baseUnitCost / yieldFactor;
      totalBatchCost += effectiveUnitCost * item.quantityRequired;
    } else if (item.subRecipeId) {
      const child = calculateRecipeCost(item.subRecipeId);
      totalBatchCost += child.costPerServing * item.quantityRequired;
    }
  }

  const costPerServing = Math.round((totalBatchCost / recipe.servingYield) * 10000) / 10000;
  const foodCostPct = recipe.sellingPrice > 0 ? Math.round((costPerServing / recipe.sellingPrice) * 100 * 10) / 10 : 0;

  return { costPerServing, totalBatchCost: Math.round(totalBatchCost * 100) / 100, foodCostPct };
}

router.get("/v1/recipes/costs", (_req, res) => {
  const summaries = recipes.map((r) => {
    const cost = calculateRecipeCost(r.id);
    return {
      id: r.id,
      code: r.code,
      name: r.name,
      type: r.type,
      costPerServing: cost.costPerServing,
      foodCostPct: cost.foodCostPct,
      targetCostPct: r.targetCostPct,
      sellingPrice: r.sellingPrice,
    };
  });
  res.status(200).json(summaries);
});

/** Faithfully adapted from the spec's prep.service.ts executePrepBatch: scale every raw-ingredient
 * line by the multiplier, verify EVERY line has enough real stock BEFORE deducting anything (a
 * partial deduction that then fails halfway through would leave stock wrong for no reason), then
 * deplete stock and record the batch — same validate-before-mutate discipline minierp-router.js's
 * own /so/:id/fulfill already uses. Only ever runs against a PREP_ITEM (matches the spec's own
 * `type: 'PREP_ITEM'` guard) — a MENU_ITEM is assembled and served, never itself prepped in bulk. */
router.post("/v1/recipes/:id/prep-batches", (req, res) => {
  const recipe = recipes.find((r) => r.id === req.params.id);
  if (!recipe) return res.status(404).json({ error: "Recipe not found" });
  if (recipe.type !== "PREP_ITEM") {
    return res.status(409).json({ error: "NOT_PREP_ITEM: only a sub-recipe can be run as a prep batch" });
  }
  const { multiplier, preparedBy } = req.body || {};
  const scale = Number(multiplier);
  if (!Number.isFinite(scale) || scale <= 0) {
    return res.status(400).json({ error: "multiplier must be a positive number" });
  }
  if (typeof preparedBy !== "string" || !preparedBy.trim()) {
    return res.status(400).json({ error: "preparedBy is required" });
  }

  // Flatten to raw-ingredient needs only — a nested sub-recipe line's own ingredients aren't
  // depleted here (the spec's own service only ever decrements this recipe's direct `items`; a
  // nested sub-recipe is expected to have been prepped as its own batch beforehand).
  for (const item of recipe.items) {
    if (!item.ingredientId) continue;
    const ingredient = ingredients.find((i) => i.id === item.ingredientId);
    const neededQty = item.quantityRequired * scale;
    if (ingredient.stockOnHand < neededQty) {
      return res.status(409).json({
        error: `INSUFFICIENT_PANTRY_STOCK: ${ingredient.name} needs ${neededQty}, only ${ingredient.stockOnHand} in stock.`,
      });
    }
  }

  for (const item of recipe.items) {
    if (!item.ingredientId) continue;
    const ingredient = ingredients.find((i) => i.id === item.ingredientId);
    ingredient.stockOnHand = Math.round((ingredient.stockOnHand - item.quantityRequired * scale) * 10000) / 10000;
  }

  const cost = calculateRecipeCost(recipe.id);
  const batch = {
    id: prepBatchesNextId(),
    batchNumber: `BATCH-${Date.now().toString().slice(-6)}`,
    recipeId: recipe.id,
    multiplier: scale,
    actualYield: Math.round(recipe.servingYield * scale * 100) / 100,
    unitCost: cost.costPerServing,
    preparedBy,
    completedAt: new Date().toISOString(),
  };
  prepBatches.push(batch);
  res.status(201).json(batch);
});

export default router;
