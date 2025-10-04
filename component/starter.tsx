"use client";
import { useCallback, useState } from "react";
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import { convertPulseConfigToFlowNodes, convertFlowNodesToPulseConfig, PulseConfig } from "../utils/convertPulseConfigToFlowNodes";
import { generateBetterAuthCode, generateEnvTemplate } from "../utils/generateBetterAuthCode";
import { generateNodesFromAuthFile } from "../utils/parseAuthToNodes";
import configData from "../.better-auth-pulse.config.json";

const nodeWidth = 150;
const nodeHeight = 50;

function getLayoutedNodes(nodes: Node[], edges: Edge[]): Node[] {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "TB" });

  nodes.forEach((node) =>
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  );

  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      positionAbsolute: { ...node.position },
    };
  });
}

// Function to load configuration with priority: auth.ts > config.json > default
async function loadInitialConfig(): Promise<{ nodes: Node[], edges: Edge[] }> {
  try {
    // Try to read auth.ts file content
    const authResponse = await fetch('/utils/auth.ts');
    if (authResponse.ok) {
      const authContent = await authResponse.text();
      return generateNodesFromAuthFile(authContent);
    }
  } catch (error) {
    console.log('No auth.ts found, checking config.json');
  }
  
  // Fallback to config.json
  try {
    const { nodes: rawNodes, edges: initialEdges } = convertPulseConfigToFlowNodes(configData);
    return { nodes: rawNodes, edges: initialEdges };
  } catch (error) {
    console.log('No config.json found, using default');
  }
  
  // Final fallback - just auth starter
  return generateNodesFromAuthFile();
}

// For now, use the config.json as we can't await at module level
// In a real app, you'd handle this in a useEffect
const myConfig: PulseConfig = configData;
const { nodes: rawNodes, edges: initialEdges } = convertPulseConfigToFlowNodes(myConfig);
const initialNodes = getLayoutedNodes(rawNodes, initialEdges);

// Generic node component that can handle any node type
const GenericNode = ({ data }: any) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "database": return "border-blue-200 bg-blue-50";
      case "authentication": return "border-green-200 bg-green-50";
      case "plugins": return "border-purple-200 bg-purple-50";
      default: return "border-gray-200 bg-white";
    }
  };

  const getDescription = (data: any) => {
    if (data.provider) return `Provider: ${data.provider}`;
    if (data.type) return `Type: ${data.type}`;
    if (data.category) return `${data.category.charAt(0).toUpperCase() + data.category.slice(1)} service`;
    return "Configuration node";
  };

  return (
    <div className={`border p-3 rounded shadow-sm ${getCategoryColor(data.category)}`}>
      <Handle type="source" position={Position.Left} />
      <strong>{data.label}</strong>
      <p className="text-xs text-gray-500 mt-1">{getDescription(data)}</p>
      <Handle type="target" position={Position.Right} />
    </div>
  );
};

// Create dynamic node types from the generated nodes
const createNodeTypes = (nodes: Node[]) => {
  const nodeTypes: { [key: string]: React.ComponentType<any> } = {
    authStarter: ({ data }: any) => (
      <div className="border p-3 rounded bg-white shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">Empty auth.ts setup</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
    prismaDatabase: ({ data }: any) => (
      <div className="border p-3 rounded bg-blue-50 border-blue-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">Provider: {data.provider}</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
    oauthGoogle: ({ data }: any) => (
      <div className="border p-3 rounded bg-green-50 border-green-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">OAuth provider</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
    oauthGithub: ({ data }: any) => (
      <div className="border p-3 rounded bg-green-50 border-green-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">OAuth provider</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
    emailResend: ({ data }: any) => (
      <div className="border p-3 rounded bg-purple-50 border-purple-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">Email service</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
    eventHandler: ({ data }: any) => (
      <div className="border p-3 rounded bg-yellow-50 border-yellow-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">Event handler</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
  };

  // Add any missing node types as generic nodes
  nodes.forEach(node => {
    if (!nodeTypes[node.type]) {
      nodeTypes[node.type] = GenericNode;
    }
  });

  return nodeTypes;
};

const nodeTypes = createNodeTypes(initialNodes);

const edgeTypes = {};

// Removed old generateAuthFile function - now using generateBetterAuthCode from utils

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const [code, setCode] = useState("");
  const [authInput, setAuthInput] = useState("");
  const [showAuthInput, setShowAuthInput] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => {
      // Prevent self-connections
      if (params.source === params.target) {
        return;
      }

      // Check if connection already exists
      const existingEdge = edges.find(
        (edge) => edge.source === params.source && edge.target === params.target
      );

      if (existingEdge) {
        return;
      }

      const newEdge: Edge = {
        ...params,
        id: `${params.source}-${params.target}`,
        animated: true,
      };
      setEdges((eds: Edge[]) => addEdge(newEdge, eds));
    },
    [edges]
  );

  const handleGenerate = () => {
    // Filter nodes to ensure they have required properties
    const validNodes = nodes.filter(node => node.type && node.id);
    const result = generateBetterAuthCode(validNodes as any, edges);
    setCode(result);
  };

  const handleGenerateEnv = () => {
    // Filter nodes to ensure they have required properties
    const validNodes = nodes.filter(node => node.type && node.id);
    const envTemplate = generateEnvTemplate(validNodes as any, edges);
    downloadFile(".env.example", envTemplate);
  };

  const handleLoadFromAuth = async () => {
    try {
      const authResponse = await fetch('/utils/auth.ts');
      if (authResponse.ok) {
        const authContent = await authResponse.text();
        const { nodes: newNodes, edges: newEdges } = generateNodesFromAuthFile(authContent);
        const layoutedNodes = getLayoutedNodes(newNodes, newEdges);
        setNodes(layoutedNodes);
        setEdges(newEdges);
      } else {
        alert('No auth.ts file found. Using default configuration.');
        const { nodes: newNodes, edges: newEdges } = generateNodesFromAuthFile();
        const layoutedNodes = getLayoutedNodes(newNodes, newEdges);
        setNodes(layoutedNodes);
        setEdges(newEdges);
      }
    } catch (error) {
      console.error('Error loading auth.ts:', error);
      alert('Error loading auth.ts file');
    }
  };

  const handleAutoLayout = () => {
    const layoutedNodes = getLayoutedNodes(nodes, edges);
    setNodes(layoutedNodes);
  };

  const handleSaveConfig = () => {
    // Filter nodes to ensure they have required properties
    const validNodes = nodes.filter(node => node.type && node.id);
    const config = convertFlowNodesToPulseConfig(validNodes as any, edges);
    const configJson = JSON.stringify(config, null, 2);
    downloadFile(".better-auth-pulse.config.json", configJson);
  };

  const handleGenerateFromAuthInput = () => {
    if (!authInput.trim()) {
      alert('Please paste your auth.ts code first');
      return;
    }
    
    try {
      // Use the sophisticated parser from parseAuthToNodes.ts
      const { nodes: newNodes, edges: newEdges } = generateNodesFromAuthFile(authInput);
      const layoutedNodes = getLayoutedNodes(newNodes, newEdges);
      setNodes(layoutedNodes);
      setEdges(newEdges);
      setShowAuthInput(false);
      setAuthInput("");
    } catch (error) {
      console.error('Error parsing auth code:', error);
      alert('Error parsing auth.ts code. Please check the format.');
    }
  };

  return (
    <div className="w-screen h-screen flex">
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      <div className="w-1/4 p-4 bg-gray-50 border-l flex flex-col">
        {!showAuthInput ? (
          <>
            <button
              onClick={() => setShowAuthInput(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded mb-4"
            >
              Paste auth.ts Code
            </button>
            <button
              onClick={handleLoadFromAuth}
              className="bg-purple-600 text-white px-4 py-2 rounded mb-4"
            >
              Load from auth.ts
            </button>
            <button
              onClick={handleAutoLayout}
              className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
            >
              Auto Layout
            </button>
            <button
              onClick={handleSaveConfig}
              className="bg-green-600 text-white px-4 py-2 rounded mb-4"
            >
              Save Config
            </button>
            <button
              onClick={handleGenerate}
              className="bg-black text-white px-4 py-2 rounded mb-4"
            >
              Generate Code
            </button>
            <button
              onClick={() => downloadFile("auth.ts", code)}
              className="bg-gray-800 text-white px-4 py-2 rounded mb-4"
            >
              Download auth.ts
            </button>
            <button
              onClick={handleGenerateEnv}
              className="bg-yellow-600 text-white px-4 py-2 rounded mb-4"
            >
              Download .env
            </button>
            <pre className="flex-1 bg-white p-3 rounded border text-sm overflow-auto">
              {code || "No code generated yet..."}
            </pre>
          </>
        ) : (
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Paste your auth.ts code:</h3>
              <textarea
                value={authInput}
                onChange={(e) => setAuthInput(e.target.value)}
                placeholder="Paste your entire auth.ts file content here..."
                className="w-full h-64 p-3 border rounded text-sm font-mono"
              />
            </div>
            <div className="flex gap-2 mb-4">
              <button
                onClick={handleGenerateFromAuthInput}
                className="bg-green-600 text-white px-4 py-2 rounded flex-1"
              >
                Generate Nodes
              </button>
              <button
                onClick={() => {
                  setShowAuthInput(false);
                  setAuthInput("");
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
            <div className="text-sm text-gray-600">
              <p className="mb-2">Paste your complete auth.ts file content above and click "Generate Nodes" to create a visual flow from your configuration.</p>
              <p>The parser will detect:</p>
              <ul className="list-disc list-inside text-xs">
                <li>Database configuration (Prisma adapter)</li>
                <li>Email & Password authentication</li>
                <li>Email verification settings</li>
                <li>Social providers (Google, GitHub)</li>
                <li>Account linking configuration</li>
                <li>Rate limiting rules</li>
                <li>Advanced security options</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Starter() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
    </ReactFlowProvider>
  );
}