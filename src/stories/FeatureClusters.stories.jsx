import React, { useMemo, useState } from "react";
import { csvParse } from "d3-dsv";
import { GraphCanvas } from "reagraph";
import featuresCsvRaw from "../../features.csv?raw";
import intraEdgesCsvRaw from "../../edges.csv?raw";
import restEdgesCsvRaw from "../../rest_edges.csv?raw";

const UI_COLORS = {
  background: "#0b1020",
  panelBackground: "rgba(13, 19, 38, 0.82)",
  panelText: "#dbeafe",
  panelSubtle: "#93c5fd",
  intraEdge: "#38bdf8",
  crossEdge: "#f472b6",
};

const FEATURE_NODE_PALETTE = [
  "#60a5fa",
  "#22d3ee",
  "#2dd4bf",
  "#34d399",
  "#a3e635",
  "#f59e0b",
  "#fb7185",
  "#f472b6",
  "#c084fc",
  "#a78bfa",
  "#818cf8",
  "#38bdf8",
];

function colorFromFeature(feature) {
  let hash = 0;
  for (let i = 0; i < feature.length; i += 1) {
    hash = feature.charCodeAt(i) + ((hash << 5) - hash);
  }
  const paletteIndex = Math.abs(hash) % FEATURE_NODE_PALETTE.length;
  return FEATURE_NODE_PALETTE[paletteIndex];
}

function FeatureClusterGraph() {
  const [showIntraFeatureEdges, setShowIntraFeatureEdges] = useState(true);
  const [showCrossFeatureEdges, setShowCrossFeatureEdges] = useState(true);

  const graph = useMemo(() => {
    const featureRows = csvParse(featuresCsvRaw);
    const intraEdgeRows = csvParse(intraEdgesCsvRaw);
    const restEdgeRows = csvParse(restEdgesCsvRaw);

    const modelToFeature = new Map();

    featureRows.forEach((row) => {
      if (!row.model) {
        return;
      }
      const feature = row.feature || "unassigned";
      modelToFeature.set(row.model, feature);
    });

    [...intraEdgeRows, ...restEdgeRows].forEach((row) => {
      if (row.from && !modelToFeature.has(row.from)) {
        modelToFeature.set(row.from, "unassigned");
      }
      if (row.to && !modelToFeature.has(row.to)) {
        modelToFeature.set(row.to, "unassigned");
      }
    });

    const nodes = Array.from(modelToFeature.entries()).map(([model, feature]) => ({
      id: model,
      label: model,
      cluster: feature,
      fill: colorFromFeature(feature),
      data: {
        cluster: feature,
        feature,
        model,
      },
    }));

    const intraFeatureEdges = intraEdgeRows
      .filter((row) => row.from && row.to)
      .map((row) => ({
        id: `intra:${row.from}->${row.to}`,
        source: row.from,
        target: row.to,
        fill: UI_COLORS.intraEdge,
        data: { edgeType: "intra" },
      }));

    const crossFeatureEdges = restEdgeRows
      .filter((row) => row.from && row.to)
      .map((row) => ({
        id: `cross:${row.from}->${row.to}`,
        source: row.from,
        target: row.to,
        fill: UI_COLORS.crossEdge,
        dashed: true,
        data: { edgeType: "cross" },
      }));

    return { nodes, intraFeatureEdges, crossFeatureEdges };
  }, []);

  const visibleEdges = useMemo(() => {
    const edges = [];
    if (showIntraFeatureEdges) {
      edges.push(...graph.intraFeatureEdges);
    }
    if (showCrossFeatureEdges) {
      edges.push(...graph.crossFeatureEdges);
    }
    return edges;
  }, [graph, showIntraFeatureEdges, showCrossFeatureEdges]);

  const featuresCount = useMemo(
    () => new Set(graph.nodes.map((node) => node.cluster)).size,
    [graph.nodes]
  );

  return (
    <div style={{ width: "100%", height: "100vh", background: UI_COLORS.background }}>
      <div
        style={{
          position: "absolute",
          zIndex: 2,
          margin: 12,
          padding: "8px 10px",
          borderRadius: 8,
          color: UI_COLORS.panelText,
          background: UI_COLORS.panelBackground,
          fontFamily: "sans-serif",
          fontSize: 13,
          boxShadow: "0 6px 20px rgba(2, 6, 23, 0.38)",
          border: "1px solid rgba(56, 189, 248, 0.22)",
        }}
      >
        <div style={{ marginBottom: 6, color: UI_COLORS.panelSubtle }}>
          {`Nodes: ${graph.nodes.length} / Edges: ${visibleEdges.length} / Features: ${featuresCount}`}
        </div>
        <label style={{ display: "block", cursor: "pointer", marginBottom: 4 }}>
          <input
            type="checkbox"
            checked={showIntraFeatureEdges}
            onChange={(event) => setShowIntraFeatureEdges(event.target.checked)}
          />{" "}
          Intra-feature edges (`edges.csv`)
        </label>
        <label style={{ display: "block", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={showCrossFeatureEdges}
            onChange={(event) => setShowCrossFeatureEdges(event.target.checked)}
          />{" "}
          Cross-feature edges (`rest_edges.csv`)
        </label>
      </div>
      <GraphCanvas
        nodes={graph.nodes}
        edges={visibleEdges}
        layoutType="forceDirected2d"
        labelType="all"
        edgeArrowPosition="none"
        clusterAttribute="cluster"
        draggable
      />
    </div>
  );
}

const meta = {
  title: "Feature Graph/Cluster View",
  component: FeatureClusterGraph,
};

export default meta;

export const ClusterView = {};
