import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "SYSTEM DESIGN #11", title: "Search systems", body: `Inverted index, Elasticsearch architecture, relevance scoring, autocomplete, faceted search.`, usecase: "Full-text and structured search." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Inverted index", "Elasticsearch basics", "Relevance and faceted search"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "What is an inverted index? How does Elasticsearch scale? What is BM25?", answer_keywords: ["inverted index", "Elasticsearch", "shard", "BM25", "relevance"], seed_code: `// Inverted index: term -> [docIds]
// ES: shards, replicas, distributed search
// BM25: TF-IDF variant for relevance score`, feedback_correct: "✅ Inverted index: term→docs; ES shards; BM25 for scoring.", feedback_wrong: "Inverted index; Elasticsearch sharding; BM25.", expected: "Search systems" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "SD-11", title: "Search systems", shortName: "SD — SEARCH" });
