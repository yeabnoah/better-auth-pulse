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

const initialNodes: Node[] = [
  {
    id: "1",
    type: "authStarter",
    position: { x: 0, y: 0 },
    data: { label: "Auth Starter" },
  },
  {
    id: "2",
    type: "prismaDatabase",
    position: { x: 200, y: 150 },
    data: { label: "Prisma Database", provider: "sqlite" },
  },
];

const nodeTypes = {
  authStarter: ({ data }: any) => (
    <div className="border p-3 rounded bg-white shadow-sm">
      <Handle type="source" position={Position.Left} />
      <strong>{data.label}</strong>
      <p className="text-xs text-gray-500 mt-1">Empty auth.ts setup</p>
      <Handle type="target" position={Position.Right} />
    </div>
  ),
  prismaDatabase: ({ data }: any) => (
    <div className="border p-3 rounded bg-white shadow-sm">
      <strong>{data.label}</strong>
      <p className="text-xs text-gray-500 mt-1">Provider: {data.provider}</p>
      <Handle type="source" position={Position.Left} />
      <Handle type="target" position={Position.Right} />
    </div>
  ),
};

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
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
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
