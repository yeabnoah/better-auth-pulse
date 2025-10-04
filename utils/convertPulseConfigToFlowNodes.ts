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

function getConnectedNodes(nodes: Node[], edges: Edge[], startNodeId: string = "1"): Set<string> {
    const connectedNodeIds = new Set<string>();
    const visited = new Set<string>();
    
    function traverse(nodeId: string) {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);
        connectedNodeIds.add(nodeId);
        
        // Find all edges connected to this node (both incoming and outgoing)
        const connectedEdges = edges.filter(edge => 
            edge.source === nodeId || edge.target === nodeId
        );
        
        // Traverse to connected nodes
        connectedEdges.forEach(edge => {
            const nextNodeId = edge.source === nodeId ? edge.target : edge.source;
            if (!visited.has(nextNodeId)) {
                traverse(nextNodeId);
            }
        });
    }
    
    // Start traversal from the root node (usually "1")
    if (nodes.find(node => node.id === startNodeId)) {
        traverse(startNodeId);
    }
    
    return connectedNodeIds;
}

export function convertFlowNodesToPulseConfig(nodes: Node[], edges: Edge[]): PulseConfig {
    // Get only nodes connected to the main flow (starting from node "1")
    const connectedNodeIds = getConnectedNodes(nodes, edges, "1");
    
    // Filter nodes to only include connected ones
    const connectedNodes = nodes.filter(node => connectedNodeIds.has(node.id));
    
    // Filter edges to only include those between connected nodes
    const connectedEdges = edges.filter(edge => 
        connectedNodeIds.has(edge.source) && connectedNodeIds.has(edge.target)
    );
    
    return {
        nodes: connectedNodes.map(node => ({
            id: node.id,
            type: node.type,
            position: {
                x: Math.round(node.position.x),
                y: Math.round(node.position.y)
            },
            data: node.data
        })),
        edges: connectedEdges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            animated: edge.animated || false
        }))
    };
}