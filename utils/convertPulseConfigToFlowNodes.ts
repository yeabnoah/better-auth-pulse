export interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

export interface FlowData {
  nodes: Node[];
  edges: Edge[];
}

export interface PulseConfig {
  [key: string]: any;
}

export function convertPulseConfigToFlowNodes(config: PulseConfig): FlowData {
  // If the config has nodes and edges arrays, use them directly
  if (config.nodes && config.edges) {
    return {
      nodes: config.nodes as Node[],
      edges: config.edges as Edge[]
    };
  }

  // Fallback: if config doesn't have nodes/edges, return empty flow with just auth starter
  return {
    nodes: [
      {
        id: "1",
        type: "authStarter",
        position: { x: 250, y: 50 },
        data: { label: "Auth Starter" },
      }
    ],
    edges: []
  };
}