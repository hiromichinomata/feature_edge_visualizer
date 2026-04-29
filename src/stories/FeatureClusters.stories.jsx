import React, { useMemo } from "react";
import { csvParse } from "d3-dsv";
import { GraphCanvas } from "reagraph";
import featuresCsvRaw from "../../features.csv?raw";
import edgesCsvRaw from "../../rest_edges.csv?raw";

function colorFromFeature(feature) {
  let hash = 0;
  for (let i = 0; i < feature.length; i += 1) {
    hash = feature.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 45%)`;
}

function FeatureClusterGraph() {
  const graph = useMemo(() => {
    const featureRows = csvParse(featuresCsvRaw);
    const edgeRows = csvParse(edgesCsvRaw);

    const modelToFeature = new Map();

    featureRows.forEach((row) => {
      if (!row.model) {
        return;
      }
      const feature = row.feature || "unassigned";
      modelToFeature.set(row.model, feature);
    });

    edgeRows.forEach((row) => {
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

    const edges = edgeRows
      .filter((row) => row.from && row.to)
      .map((row) => ({
        id: `${row.from}->${row.to}`,
        source: row.from,
        target: row.to,
        label: `${row.from} -> ${row.to}`,
      }));

    return { nodes, edges };
  }, []);
  const featuresCount = useMemo(
    () => new Set(graph.nodes.map((node) => node.cluster)).size,
    [graph.nodes]
  );

  return (
    <div style={{ width: "100%", height: "100vh", background: "#0f172a" }}>
      <div
        style={{
          position: "absolute",
          zIndex: 2,
          margin: 12,
          padding: "8px 10px",
          borderRadius: 8,
          color: "#e2e8f0",
          background: "rgba(15, 23, 42, 0.8)",
          fontFamily: "sans-serif",
          fontSize: 13,
        }}
      >
        {`Nodes: ${graph.nodes.length} / Edges: ${graph.edges.length} / Features: ${featuresCount}`}
      </div>
      <GraphCanvas
        nodes={graph.nodes}
        edges={graph.edges}
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
