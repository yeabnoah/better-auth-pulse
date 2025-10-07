export interface Node {
  id: string;
  type?: string;
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
      edges: config.edges as Edge[],
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
      },
    ],
    edges: [],
  };
}

export function parseAuthCodeToFlowData(authCode: string): FlowData {
  try {
    // Parse the auth.ts code to extract configuration
    // This is a simple parser - you might want to use a proper AST parser for production

    const nodes: Node[] = [
      {
        id: "1",
        type: "authStarter",
        position: { x: 250, y: 50 },
        data: { label: "Auth Starter" },
      },
    ];

    const edges: Edge[] = [];
    let nodeId = 2;
    let yPosition = 150;

    // Check for email/password auth
    if (authCode.includes("emailAndPassword")) {
      nodes.push({
        id: nodeId.toString(),
        type: "emailPassword",
        position: { x: 100, y: yPosition },
        data: { label: "Email & Password" },
      });
      edges.push({
        id: `e1-${nodeId}`,
        source: "1",
        target: nodeId.toString(),
      });
      nodeId++;
      yPosition += 100;
    }

    // Check for Google OAuth
    if (authCode.includes("google:")) {
      nodes.push({
        id: nodeId.toString(),
        type: "googleOAuth",
        position: { x: 400, y: yPosition },
        data: { label: "Google OAuth" },
      });
      edges.push({
        id: `e1-${nodeId}`,
        source: "1",
        target: nodeId.toString(),
      });
      nodeId++;
      yPosition += 100;
    }

    // Check for GitHub OAuth
    if (authCode.includes("github:")) {
      nodes.push({
        id: nodeId.toString(),
        type: "githubOAuth",
        position: { x: 400, y: yPosition },
        data: { label: "GitHub OAuth" },
      });
      edges.push({
        id: `e1-${nodeId}`,
        source: "1",
        target: nodeId.toString(),
      });
      nodeId++;
      yPosition += 100;
    }

    // Check for email verification
    if (authCode.includes("emailVerification")) {
      nodes.push({
        id: nodeId.toString(),
        type: "emailVerification",
        position: { x: 250, y: yPosition },
        data: { label: "Email Verification" },
      });
      edges.push({
        id: `e1-${nodeId}`,
        source: "1",
        target: nodeId.toString(),
      });
      nodeId++;
      yPosition += 100;
    }

    // Check for rate limiting
    if (authCode.includes("rateLimit")) {
      nodes.push({
        id: nodeId.toString(),
        type: "rateLimit",
        position: { x: 550, y: 150 },
        data: { label: "Rate Limiting" },
      });
      edges.push({
        id: `e1-${nodeId}`,
        source: "1",
        target: nodeId.toString(),
      });
      nodeId++;
    }

    return { nodes, edges };
  } catch (error) {
    // If parsing fails, return just the auth starter
    return {
      nodes: [
        {
          id: "1",
          type: "authStarter",
          position: { x: 250, y: 50 },
          data: { label: "Auth Starter" },
        },
      ],
      edges: [],
    };
  }
}

export async function loadConfigFromAuthFile(): Promise<FlowData> {
  try {
    // Try to load existing config first
    const configModule = await import("../../.better-auth-pulse.config.json");
    return convertPulseConfigToFlowNodes(configModule.default);
  } catch (error) {
    // If no config exists, return just the auth starter
    return {
      nodes: [
        {
          id: "1",
          type: "authStarter",
          position: { x: 250, y: 50 },
          data: { label: "Auth Starter" },
        },
      ],
      edges: [],
    };
  }
}

function getConnectedNodes(
  nodes: Node[],
  edges: Edge[],
  startNodeId: string = "1"
): Set<string> {
  const connectedNodeIds = new Set<string>();
  const visited = new Set<string>();

  function traverse(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    connectedNodeIds.add(nodeId);

    // Find all edges connected to this node (both incoming and outgoing)
    const connectedEdges = edges.filter(
      (edge) => edge.source === nodeId || edge.target === nodeId
    );

    // Traverse to connected nodes
    connectedEdges.forEach((edge) => {
      const nextNodeId = edge.source === nodeId ? edge.target : edge.source;
      if (!visited.has(nextNodeId)) {
        traverse(nextNodeId);
      }
    });
  }

  // Start traversal from the root node (usually "1")
  if (nodes.find((node) => node.id === startNodeId)) {
    traverse(startNodeId);
  }

  return connectedNodeIds;
}

export function convertFlowNodesToPulseConfig(
  nodes: Node[],
  edges: Edge[]
): PulseConfig {
  // Get only nodes connected to the main flow (starting from node "1")
  const connectedNodeIds = getConnectedNodes(nodes, edges, "1");

  // Filter nodes to only include connected ones
  const connectedNodes = nodes.filter((node) => connectedNodeIds.has(node.id));

  // Filter edges to only include those between connected nodes
  const connectedEdges = edges.filter(
    (edge) =>
      connectedNodeIds.has(edge.source) && connectedNodeIds.has(edge.target)
  );

  return {
    nodes: connectedNodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: {
        x: Math.round(node.position.x),
        y: Math.round(node.position.y),
      },
      data: node.data,
    })),
    edges: connectedEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: edge.animated || false,
    })),
  };
}
