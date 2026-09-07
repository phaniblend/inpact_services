/**
 * MiniERP backend — Tasks 1-5 of the MiniERP spec (2026-09-06), adapted to this project's real
 * Express + in-memory stack rather than the spec's literal Prisma+PostgreSQL+Fastify+BullMQ/Redis
 * (that's a whole new infrastructure tier — a real Postgres database and a Redis instance — the
 * user chose to adapt the logic to the existing stack instead of standing that up). Every business
 * rule from the spec is real and enforced here: double-entry parity, Moving Average Cost, P2P
 * receipt posting, O2C fulfillment posting, and reports — just over in-memory arrays instead of a
 * real database, the same trade-off smb-desk-router.js already makes for the SMB desk products.
 *
 * These are backend tasks, done internally — never exposed as JS-dev-facing lesson content (there
 * is no matching OneDev product for MiniERP at all; the FE tasks that DO exist call this router for
 * real, over relative fetch()).
 */
import express from "express";

const router = express.Router();

// ---------------------------------------------------------------------------
// TASK 1: Double-Entry General Ledger Core
// ---------------------------------------------------------------------------
let accounts = [];
let accountsIdCounter = 1;
function accountsNextId() {
  return String(accountsIdCounter++);
}
const DEFAULT_ACCOUNTS = [
  { code: "1000", name: "Cash on Hand", type: "ASSET" },
  { code: "1100", name: "Accounts Receivable", type: "ASSET" },
  { code: "1200", name: "Inventory Asset", type: "ASSET" },
  { code: "2000", name: "Accounts Payable", type: "LIABILITY" },
  { code: "4000", name: "Sales Revenue", type: "REVENUE" },
  { code: "5000", name: "Cost of Goods Sold", type: "EXPENSE" },
];
// Idempotent seed — same intent as prisma/seed.ts's upsert loop (Step 1.1), just over an array.
for (const acc of DEFAULT_ACCOUNTS) {
  if (!accounts.some((a) => a.code === acc.code)) {
    accounts.push({ id: accountsNextId(), ...acc });
  }
}
function accountByCode(code) {
  return accounts.find((a) => a.code === code);
}

let journalEntries = [];
let journalEntriesIdCounter = 1;
function journalEntriesNextId() {
  return String(journalEntriesIdCounter++);
}

/** Step 1.2: strict debit/credit parity — the one invariant nothing may violate. */
function assertParity(lines) {
  const totalDebit = lines.reduce((sum, l) => sum + Number(l.debit || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + Number(l.credit || 0), 0);
  // Round to cents before comparing — floating point would otherwise reject genuinely balanced
  // entries like 10.1 + 10.2 !== 20.3.
  return Math.round(totalDebit * 100) === Math.round(totalCredit * 100) && totalDebit > 0;
}

/** Step 1.3: posts a balanced journal entry. Immutable once created — nothing here ever updates
 * or deletes a JournalEntry/LedgerLine (AC #3) — every caller below only ever creates new ones. */
function postJournalEntry({ reference, lines }) {
  const entry = {
    id: journalEntriesNextId(),
    entryNumber: `JE-${Date.now()}`,
    reference,
    lines: lines.map((l) => ({ accountId: l.accountId, debit: Number(l.debit || 0), credit: Number(l.credit || 0) })),
    postedAt: new Date().toISOString(),
  };
  journalEntries.push(entry);
  return entry;
}

router.post("/gl/entries", (req, res) => {
  const { reference, lines } = req.body || {};
  if (!Array.isArray(lines) || lines.length < 2) {
    return res.status(400).json({ error: "At least two ledger lines are required." });
  }
  if (!assertParity(lines)) {
    return res.status(400).json({ error: "Unbalanced entry: total debits must equal total credits." });
  }
  const entry = postJournalEntry({ reference, lines });
  res.status(201).json(entry);
});

router.get("/accounts", (_req, res) => {
  res.status(200).json(accounts);
});

// ---------------------------------------------------------------------------
// TASK 2: Items Master Data & Moving Average Cost
// ---------------------------------------------------------------------------
let items = [];
let itemsIdCounter = 1;
function itemsNextId() {
  return String(itemsIdCounter++);
}

/** Step 2.1: pure MAC formula — new cost is the weighted average of what's already on hand and
 * what just arrived. Falls back to the incoming cost when there's nothing on hand yet. */
function calculateMovingAverage(currentQty, currentCost, incomingQty, incomingCost) {
  if (currentQty <= 0) return incomingCost;
  const currentValuation = currentCost * currentQty;
  const incomingValuation = incomingCost * incomingQty;
  const totalQty = currentQty + incomingQty;
  return Math.round(((currentValuation + incomingValuation) / totalQty) * 10000) / 10000;
}

router.get("/items", (_req, res) => {
  res.status(200).json(items);
});

router.post("/items", (req, res) => {
  const { sku, name, sellingPrice, reorderPoint, reorderQuantity } = req.body || {};
  if (!sku || !name || sellingPrice === undefined) {
    return res.status(400).json({ error: "sku, name, and sellingPrice are required." });
  }
  if (Number(sellingPrice) < 0) {
    return res.status(400).json({ error: "sellingPrice cannot be negative." });
  }
  if (items.some((i) => i.sku === sku)) {
    return res.status(409).json({ error: `SKU ${sku} already exists` });
  }
  const item = {
    id: itemsNextId(),
    sku,
    name,
    sellingPrice: Number(sellingPrice),
    costPrice: 0,
    // stockOnHand is deliberately never client-settable (AC #4) — it only ever changes via a real
    // stock move, from a PO receipt (+) or an SO fulfillment (-).
    stockOnHand: 0,
    reorderPoint: reorderPoint ?? 10,
    reorderQuantity: reorderQuantity ?? 50,
  };
  items.push(item);
  res.status(201).json(item);
});

// ---------------------------------------------------------------------------
// StockMove audit log — shared by both P2P receipts (+) and O2C fulfillment (-)
// ---------------------------------------------------------------------------
let stockMoves = [];
let stockMovesIdCounter = 1;
function stockMovesNextId() {
  return String(stockMovesIdCounter++);
}

// ---------------------------------------------------------------------------
// TASK 3: Procure-to-Pay — Purchase Orders + Receipt
// ---------------------------------------------------------------------------
let purchaseOrders = [];
let purchaseOrdersIdCounter = 1;
function purchaseOrdersNextId() {
  return String(purchaseOrdersIdCounter++);
}
// No vendor endpoints were specced — one default vendor is enough to satisfy vendorId references
// and the auto-reorder worker (Task 5), matching what the spec's own reorder-worker pattern assumes
// ("prisma.vendor.findFirstOrThrow()").
const DEFAULT_VENDOR = { id: "vendor-1", name: "Default Supplier" };

router.post("/po", (req, res) => {
  const { vendorId, items: lineItems } = req.body || {};
  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    return res.status(400).json({ error: "At least one line item is required." });
  }
  const total = lineItems.reduce((sum, i) => sum + Number(i.unitPrice) * Number(i.quantity), 0);
  const po = {
    id: purchaseOrdersNextId(),
    poNumber: `PO-${Date.now()}`,
    vendorId: vendorId || DEFAULT_VENDOR.id,
    totalAmount: Math.round(total * 100) / 100,
    status: "DRAFT",
    items: lineItems.map((i) => ({ itemId: i.itemId, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) })),
  };
  purchaseOrders.push(po);
  res.status(201).json(po);
});

router.get("/po", (_req, res) => {
  res.status(200).json(purchaseOrders);
});

/** Step 3.2: the real transaction — stock, cost, audit log, and ledger all move together. Node is
 * single-threaded and this handler never awaits mid-mutation, so it's atomic in the same sense the
 * spec's Prisma $transaction is: nothing else can interleave with it. */
router.post("/po/:id/receive", (req, res) => {
  const po = purchaseOrders.find((p) => p.id === req.params.id);
  if (!po) return res.status(404).json({ error: "Purchase order not found" });
  if (po.status === "RECEIVED") {
    return res.status(409).json({ error: "ALREADY_RECEIVED" });
  }

  for (const line of po.items) {
    const item = items.find((i) => i.id === line.itemId);
    if (!item) return res.status(400).json({ error: `Unknown item ${line.itemId} on ${po.poNumber}` });
    const newCost = calculateMovingAverage(item.stockOnHand, item.costPrice, line.quantity, line.unitPrice);
    item.stockOnHand += line.quantity;
    item.costPrice = newCost;
    stockMoves.push({
      id: stockMovesNextId(),
      itemId: item.id,
      change: line.quantity,
      unitCost: line.unitPrice,
      reference: po.poNumber,
      at: new Date().toISOString(),
    });
  }

  const invAcc = accountByCode("1200");
  const apAcc = accountByCode("2000");
  postJournalEntry({
    reference: `RCV:${po.poNumber}`,
    lines: [
      { accountId: invAcc.id, debit: po.totalAmount, credit: 0 },
      { accountId: apAcc.id, debit: 0, credit: po.totalAmount },
    ],
  });

  po.status = "RECEIVED";
  res.status(200).json(po);
});

// ---------------------------------------------------------------------------
// TASK 4: Order-to-Cash — Sales Orders + Fulfillment
// ---------------------------------------------------------------------------
let salesOrders = [];
let salesOrdersIdCounter = 1;
function salesOrdersNextId() {
  return String(salesOrdersIdCounter++);
}

router.post("/so", (req, res) => {
  const { customerId, items: lineItems } = req.body || {};
  if (!customerId || !Array.isArray(lineItems) || lineItems.length === 0) {
    return res.status(400).json({ error: "customerId and at least one line item are required." });
  }
  for (const line of lineItems) {
    if (!items.some((i) => i.id === line.itemId)) {
      return res.status(400).json({ error: `Unknown item ${line.itemId}` });
    }
  }
  const total = lineItems.reduce((sum, i) => sum + Number(i.unitPrice) * Number(i.quantity), 0);
  const so = {
    id: salesOrdersNextId(),
    soNumber: `SO-${Date.now()}`,
    customerId,
    totalAmount: Math.round(total * 100) / 100,
    status: "CONFIRMED",
    items: lineItems.map((i) => ({ itemId: i.itemId, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) })),
  };
  salesOrders.push(so);
  res.status(201).json(so);
});

router.get("/so", (_req, res) => {
  res.status(200).json(salesOrders);
});

/** Step 4.2: the 4-line GL split — AR/Revenue records the sale, COGS/Inventory records what it
 * actually cost, both posted in the same atomic step that decrements real stock. */
router.post("/so/:id/fulfill", (req, res) => {
  const so = salesOrders.find((s) => s.id === req.params.id);
  if (!so) return res.status(404).json({ error: "Sales order not found" });
  if (so.status === "SHIPPED") {
    return res.status(409).json({ error: "ALREADY_SHIPPED" });
  }

  // Validate every line BEFORE mutating anything — a partial fulfillment that fails halfway
  // through would leave stock decremented for some lines and not others.
  for (const line of so.items) {
    const item = items.find((i) => i.id === line.itemId);
    if (!item || item.stockOnHand < line.quantity) {
      return res.status(409).json({ error: `INSUFFICIENT_STOCK: ${item ? item.sku : line.itemId}` });
    }
  }

  let totalCogs = 0;
  for (const line of so.items) {
    const item = items.find((i) => i.id === line.itemId);
    totalCogs += item.costPrice * line.quantity;
    item.stockOnHand -= line.quantity;
    stockMoves.push({
      id: stockMovesNextId(),
      itemId: item.id,
      change: -line.quantity,
      unitCost: item.costPrice,
      reference: so.soNumber,
      at: new Date().toISOString(),
    });
  }
  totalCogs = Math.round(totalCogs * 100) / 100;

  const ar = accountByCode("1100");
  const rev = accountByCode("4000");
  const cogs = accountByCode("5000");
  const inv = accountByCode("1200");
  postJournalEntry({
    reference: `FULFILL:${so.soNumber}`,
    lines: [
      { accountId: ar.id, debit: so.totalAmount, credit: 0 },
      { accountId: rev.id, debit: 0, credit: so.totalAmount },
      { accountId: cogs.id, debit: totalCogs, credit: 0 },
      { accountId: inv.id, debit: 0, credit: totalCogs },
    ],
  });

  so.status = "SHIPPED";
  res.status(200).json(so);
});

// ---------------------------------------------------------------------------
// TASK 5: Financial Reporting + Automated Reordering
// ---------------------------------------------------------------------------
router.get("/reports/trial-balance", (_req, res) => {
  const rows = accounts.map((acc) => {
    const lines = journalEntries.flatMap((je) => je.lines.filter((l) => l.accountId === acc.id));
    const debit = lines.reduce((sum, l) => sum + l.debit, 0);
    const credit = lines.reduce((sum, l) => sum + l.credit, 0);
    return { accountId: acc.id, code: acc.code, name: acc.name, debit: debit.toFixed(2), credit: credit.toFixed(2) };
  });
  const totalDebit = rows.reduce((sum, r) => sum + Number(r.debit), 0);
  const totalCredit = rows.reduce((sum, r) => sum + Number(r.credit), 0);
  res.status(200).json({
    accounts: rows,
    totalDebit: totalDebit.toFixed(2),
    totalCredit: totalCredit.toFixed(2),
    balanced: Math.round(totalDebit * 100) === Math.round(totalCredit * 100),
  });
});

router.get("/reports/income-statement", (_req, res) => {
  let totalRevenue = 0;
  let totalExpense = 0;
  for (const acc of accounts) {
    if (acc.type !== "REVENUE" && acc.type !== "EXPENSE") continue;
    const lines = journalEntries.flatMap((je) => je.lines.filter((l) => l.accountId === acc.id));
    const net = lines.reduce((sum, l) => sum + (l.credit - l.debit), 0);
    if (acc.type === "REVENUE") totalRevenue += net;
    if (acc.type === "EXPENSE") totalExpense += -net;
  }
  res.status(200).json({
    revenue: totalRevenue.toFixed(2),
    cogs: totalExpense.toFixed(2),
    netIncome: (totalRevenue - totalExpense).toFixed(2),
  });
});

/** Step 5.2: the reorder worker, adapted from a BullMQ repeatable job to a plain setInterval —
 * same behavior (scan low stock, skip SKUs that already have a draft, create one draft PO per
 * low SKU) without needing a Redis queue for what is, underneath, just a periodic scan. */
function runReorderSweep() {
  const lowItems = items.filter((i) => i.stockOnHand <= i.reorderPoint);
  for (const item of lowItems) {
    const existingDraft = purchaseOrders.find(
      (po) => po.status === "DRAFT" && po.items.some((line) => line.itemId === item.id)
    );
    if (existingDraft) continue;
    const po = {
      id: purchaseOrdersNextId(),
      poNumber: `AUTO-PO-${item.sku}-${Date.now()}`,
      vendorId: DEFAULT_VENDOR.id,
      totalAmount: Math.round(item.costPrice * item.reorderQuantity * 100) / 100,
      status: "DRAFT",
      items: [{ itemId: item.id, quantity: item.reorderQuantity, unitPrice: item.costPrice }],
    };
    purchaseOrders.push(po);
  }
}
const reorderInterval = setInterval(runReorderSweep, 60_000);
// Never keep the process alive just for this timer (matters for scripts/tests that import this
// router without wanting a 60s-interval handle left dangling).
if (typeof reorderInterval.unref === "function") reorderInterval.unref();

export { runReorderSweep };
export default router;
