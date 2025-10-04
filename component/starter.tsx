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

function generateAuthFile(nodes: Node[], edges: Edge[]) {
  const authNode = nodes.find((n) => n.type === "authStarter");
  const prismaNode = nodes.find((n) => n.type === "prismaDatabase");

  const prismaConnected = edges.some(
    (e) => e.source === prismaNode?.id && e.target === authNode?.id
  );

  if (prismaConnected && prismaNode) {
    return `
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "${prismaNode.data.provider || "sqlite"}",
  }),
});
`.trim();
  }

  return `
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

export const auth = betterAuth({
});
`.trim();
}

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
    const result = generateAuthFile(nodes, edges);
    setCode(result);
  };

  const handleAutoLayout = () => {
    const layoutedNodes = getLayoutedNodes(nodes, edges);
    setNodes(layoutedNodes);
  };

  const handleSaveConfig = () => {
    const config = convertFlowNodesToPulseConfig(nodes, edges);
    const configJson = JSON.stringify(config, null, 2);
    downloadFile(".better-auth-pulse.config.json", configJson);
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
        <pre className="flex-1 bg-white p-3 rounded border text-sm overflow-auto">
          {code || "No code generated yet..."}
        </pre>
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