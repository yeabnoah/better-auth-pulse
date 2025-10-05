"use client";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useFlowEditor } from "./hooks/useFlowEditor";
import { Sidebar } from "./ui/Sidebar";
import { PreviewPanel } from "./ui/PreviewPanel";
import { NodeSelectorModal } from "./ui/NodeSelectorModal";
import { createNodeTypes } from "./utils/nodeTypesFactory";
import { CustomEdge } from "./edges/CustomEdge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    showPreview,
    setShowPreview,
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

  const nodeTypes = createNodeTypes(nodes); // Create node types with handles for modern UI

  return (
    <div className="w-screen h-screen flex bg-background">
      <Sidebar onAddNode={handleAddNode} />

      <div className="flex-1 bg-background relative" ref={reactFlowWrapper}>
        {/* Top Right Toggle Buttons */}
        <div className="absolute top-4 right-4 z-10 flex space-x-2">
          <Button
            onClick={() => setShowPreview(false)}
            variant={!showPreview ? "default" : "outline"}
            size="sm"
            className="rounded-full"
          >
            Design
          </Button>
          <Button
            onClick={() => setShowPreview(true)}
            variant={showPreview ? "default" : "outline"}
            size="sm"
            className="rounded-full"
          >
            Preview
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

      <div className="w-1/4 p-6 bg-card border-l border-border flex flex-col">
        {!showPreview ? (
          <div className="flex flex-col overflow-y-scroll h-full space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => setShowPreview(true)}
                  className="w-full"
                  size="lg"
                >
                  Preview & Export
                </Button>
                <Button
                  onClick={handleAutoLayout}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Auto Layout
                </Button>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-sm">Canvas Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Nodes:</span>
                    <Badge variant="secondary">{nodes.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Edges:</span>
                    <Badge variant="secondary">{edges.length}</Badge>
                  </div>
                </div>
                <CardDescription className="text-xs leading-relaxed">
                  Click "Preview & Export" to see conversion options and export
                  your configuration.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        ) : (
          <PreviewPanel
            nodes={nodes}
            edges={edges}
            onClose={() => setShowPreview(false)}
          />
        )}
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
