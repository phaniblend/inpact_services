/**
 * Renders a flowchart from nodes and edges. Supports progressive reveal: pass revealedCount
 * to show only the first N nodes (and edges between revealed nodes).
 * Node types: start, process, decision, end.
 */

const NODE_WIDTH = 140;
const NODE_HEIGHT = 44;
const HORZ_GAP = 80;
const VERT_GAP = 36;

function getNodeShape(type) {
  switch (type) {
    case "start":
    case "end":
      return "ellipse";
    case "decision":
      return "diamond";
    default:
      return "rect";
  }
}

function nodePath(id, type, x, y) {
  const w = NODE_WIDTH / 2;
  const h = NODE_HEIGHT / 2;
  const shape = getNodeShape(type);
  if (shape === "ellipse") {
    return `M ${x - w} ${y} a ${w} ${h} 0 1 1 ${w * 2} 0 a ${w} ${h} 0 1 1 -${w * 2} 0`;
  }
  if (shape === "diamond") {
    return `M ${x} ${y - h} L ${x + w} ${y} L ${x} ${y + h} L ${x - w} ${y} Z`;
  }
  return `M ${x - w} ${y - h} H ${x + w} V ${y + h} H ${x - w} Z`;
}

/**
 * Simple top-down layout: nodes in array order, stacked vertically. Edges drawn as straight lines.
 */
function layout(nodes, edges) {
  const idToIndex = {};
  nodes.forEach((n, i) => { idToIndex[n.id] = i; });
  const y0 = NODE_HEIGHT / 2 + 20;
  const positions = nodes.map((n, i) => ({
    id: n.id,
    x: 120,
    y: y0 + i * (NODE_HEIGHT + VERT_GAP),
  }));
  const edgePositions = edges
    .filter((e) => idToIndex[e.from] != null && idToIndex[e.to] != null)
    .map((e) => {
      const fromIdx = idToIndex[e.from];
      const toIdx = idToIndex[e.to];
      const fromP = positions[fromIdx];
      const toP = positions[toIdx];
      return { from: fromP, to: toP, fromIdx, toIdx };
    });
  return { positions, edgePositions };
}

export default function FlowchartDiagram({ nodes = [], edges = [], revealedCount }) {
  const showCount = typeof revealedCount === "number" ? Math.max(0, Math.min(revealedCount, nodes.length)) : nodes.length;
  const visibleIds = new Set(nodes.slice(0, showCount).map((n) => n.id));
  const { positions, edgePositions } = layout(nodes, edges);

  const visibleEdges = edgePositions.filter((e) => visibleIds.has(nodes[e.fromIdx].id) && visibleIds.has(nodes[e.toIdx].id));

  const width = 240;
  const height = nodes.length * (NODE_HEIGHT + VERT_GAP) + 40;

  return (
    <div style={{ background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "16px", minHeight: "200px" }}>
      <svg width={width} height={height} style={{ display: "block", margin: "0 auto" }}>
        {visibleEdges.map((e, i) => (
          <line
            key={i}
            x1={e.from.x}
            y1={e.from.y}
            x2={e.to.x}
            y2={e.to.y}
            stroke="#0f172a"
            strokeWidth="1.5"
            markerEnd="url(#arrowhead)"
          />
        ))}
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#0f172a" />
          </marker>
        </defs>
        {nodes.slice(0, showCount).map((node, i) => {
          const pos = positions[i];
          if (!pos) return null;
          const pathD = nodePath(node.id, node.type, pos.x, pos.y);
          const isDecision = node.type === "decision";
          return (
            <g key={node.id}>
              <path
                d={pathD}
                fill="#ffffff"
                stroke="#0f172a"
                strokeWidth="1.5"
              />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                fill="#0f172a"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {node.text.length > 18 ? node.text.slice(0, 16) + "…" : node.text}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
