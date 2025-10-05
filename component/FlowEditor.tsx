"use client";
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useFlowEditor } from "./hooks/useFlowEditor";
import { Sidebar } from "./ui/Sidebar";
import { NodeSelectorModal } from "./ui/NodeSelectorModal";
import { createNodeTypes } from "./utils/nodeTypesFactory";
import { CustomEdge } from "./edges/CustomEdge";
import { Button } from "@/components/ui/button";
import {
  convertFlowNodesToAuthConfig,
  generateAuthTs,
} from "@/app/lib/auth-conversion-service";
import { useState } from "react";

const edgeTypes = {
  custom: CustomEdge,
};

export function FlowEditor() {
  const {
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    showNodeSelector,
    setShowNodeSelector,
    selectedEdgeId,
    setSelectedEdgeId,
    reactFlowWrapper,
    onConnect,
    onDragOver,
    onDrop,
    handleAddNode,
    handleNodeSelect,
    handleAutoLayout,
  } = useFlowEditor();

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  const nodeTypes = createNodeTypes(nodes) as NodeTypes; // Create node types with handles for modern UI

  const handleSaveToAuthTs = async () => {
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      console.log("Starting save process...");
      console.log("Current nodes:", nodes);
      console.log("Current edges:", edges);

      // Convert flow nodes to auth config
      const graphNodes = nodes.map((node) => ({
        id: node.id,
        type: node.type || "generic",
        position: node.position,
        data: {
          label: (node.data as any)?.label || node.id,
          ...(node.data || {}),
        },
      }));

      const graphEdges = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: edge.animated || false,
      }));

      const authConfig = convertFlowNodesToAuthConfig(graphNodes, graphEdges);
      console.log("Generated auth config:", authConfig);

      // Generate the auth.ts code
      const authTsCode = generateAuthTs(authConfig);
      console.log("Generated auth.ts code:", authTsCode);

      // Save to auth.ts file
      const response = await fetch("/api/save-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: authTsCode }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Save successful:", result);
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        const errorText = await response.text();
        console.error("Save failed:", errorText);
        throw new Error(`Failed to save auth.ts: ${errorText}`);
      }
    } catch (error) {
      console.error("Error saving auth.ts:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-screen h-screen flex bg-background">
      <Sidebar onAddNode={handleAddNode} />

      <div className="flex-1 bg-background relative" ref={reactFlowWrapper}>
        {/* Top Right Action Buttons */}
        <div className="absolute top-4 right-4 z-10 flex space-x-2">
          <Button
            onClick={handleAutoLayout}
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            Auto Layout
          </Button>
          <Button
            onClick={() => {
              console.log("Current nodes:", nodes);
              console.log("Current edges:", edges);
            }}
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            Debug
          </Button>
          <Button
            onClick={handleSaveToAuthTs}
            disabled={isSaving}
            size="sm"
            className="rounded-full"
            variant={saveStatus === "success" ? "default" : "default"}
          >
            {isSaving
              ? "Saving..."
              : saveStatus === "success"
              ? "Saved!"
              : saveStatus === "error"
              ? "Error"
              : "Save to auth.ts"}
          </Button>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
        >
          <Background color="hsl(var(--muted))" gap={16} />
          <Controls className="bg-card border-border" />
        </ReactFlow>
      </div>

      {/* Node Selector Modal */}
      <NodeSelectorModal
        isOpen={showNodeSelector}
        onClose={() => {
          setShowNodeSelector(false);
          setSelectedEdgeId(null);
        }}
        onSelectNode={handleNodeSelect}
      />
    </div>
  );
}
