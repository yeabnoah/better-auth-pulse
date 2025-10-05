import dagre from "dagre";
import { Node, Edge } from "@xyflow/react";
import { NODE_DIMENSIONS } from "../types/nodeTypes";

export function getLayoutedNodes(nodes: Node[], edges: Edge[]): Node[] {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "TB" });

  nodes.forEach((node) =>
    dagreGraph.setNode(node.id, {
      width: NODE_DIMENSIONS.width,
      height: NODE_DIMENSIONS.height,
    })
  );

  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_DIMENSIONS.width / 2,
        y: nodeWithPosition.y - NODE_DIMENSIONS.height / 2,
      },
      positionAbsolute: { ...node.position },
    };
  });
}
