import { useState, useCallback, useRef, useEffect } from "react";
import {
  Node,
  Edge,
  Connection,
  useReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";
import { ALL_NODE_TYPES } from "../types/nodeTypes";
import { getLayoutedNodes } from "../utils/layout";

export function useFlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [showNodeSelector, setShowNodeSelector] = useState(false);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // Load initial configuration from auth.ts file
  useEffect(() => {
    const loadConfig = async () => {
      try {
        console.log("Loading initial config from auth.ts...");
        // Try to read auth.ts file content
        const authResponse = await fetch("/api/get-auth");
        if (authResponse.ok) {
          const authContent = await authResponse.text();
          console.log(
            "Auth.ts content loaded:",
            authContent.substring(0, 200) + "..."
          );

          const { generateNodesFromAuthFile } = await import(
            "../../utils/parseAuthToNodes"
          );
          const { nodes: initialNodes, edges: initialEdges } =
            generateNodesFromAuthFile(authContent);
          console.log("Generated nodes from auth.ts:", initialNodes);
          console.log("Generated edges from auth.ts:", initialEdges);

          const layoutedNodes = getLayoutedNodes(initialNodes, initialEdges);
          setNodes(layoutedNodes);
          setEdges(initialEdges);
          console.log("Canvas loaded with auth.ts configuration");
        } else {
          console.log("No auth.ts found, using default");
          // Fallback to default if no auth.ts
          const defaultNodes: Node[] = [
            {
              id: "auth-start-1",
              type: "authStarter",
              position: { x: 250, y: 100 },
              data: { label: "Auth Start" },
            },
          ];
          setNodes(defaultNodes);
          setEdges([]);
        }
      } catch (error) {
        console.error("Error loading initial config:", error);
        // Fallback to default auth starter node
        const defaultNodes: Node[] = [
          {
            id: "auth-start-1",
            type: "authStarter",
            position: { x: 250, y: 100 },
            data: { label: "Auth Start" },
          },
        ];
        setNodes(defaultNodes);
        setEdges([]);
      }
    };
    loadConfig();
  }, [setNodes, setEdges]);

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
        type: "custom",
        animated: true,
        data: { onAddNode: handleEdgeAddNode },
      };
      setEdges((eds: Edge[]) => addEdge(newEdge, eds));
    },
    [edges, setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label: ALL_NODE_TYPES.find((nt) => nt.type === type)?.label || type,
          category:
            ALL_NODE_TYPES.find((nt) => nt.type === type)?.category ||
            "default",
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const handleAddNode = useCallback(
    (nodeType: string, edgeId?: string) => {
      const position = {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      };
      const newNode: Node = {
        id: `${nodeType}-${Date.now()}`,
        type: nodeType,
        position,
        data: {
          label:
            ALL_NODE_TYPES.find((nt) => nt.type === nodeType)?.label ||
            nodeType,
          category:
            ALL_NODE_TYPES.find((nt) => nt.type === nodeType)?.category ||
            "default",
        },
      };

      setNodes((nds) => nds.concat(newNode));

      // If adding from an edge, create a connection
      if (edgeId) {
        const edge = edges.find((e) => e.id === edgeId);
        if (edge) {
          const newEdge: Edge = {
            id: `${edge.target}-${newNode.id}`,
            source: edge.target,
            target: newNode.id,
            type: "custom",
            animated: true,
            data: { onAddNode: handleEdgeAddNode },
          };
          setEdges((eds) => [...eds, newEdge]);
        }
      }

      setShowNodeSelector(false);
      setSelectedEdgeId(null);
    },
    [setNodes, setEdges, edges]
  );

  const handleEdgeAddNode = useCallback((edgeId: string) => {
    setSelectedEdgeId(edgeId);
    setShowNodeSelector(true);
  }, []);

  const handleNodeSelect = useCallback(
    (nodeType: string) => {
      handleAddNode(nodeType, selectedEdgeId || undefined);
    },
    [handleAddNode, selectedEdgeId]
  );

  const handleAutoLayout = useCallback(() => {
    const layoutedNodes = getLayoutedNodes(nodes, edges);
    setNodes(layoutedNodes);
  }, [nodes, edges, setNodes]);

  return {
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
    handleEdgeAddNode,
    handleNodeSelect,
    handleAutoLayout,
  };
}
