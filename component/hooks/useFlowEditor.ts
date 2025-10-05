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
import { NODE_TYPES_FOR_SIDEBAR } from "../types/nodeTypes";
import { getLayoutedNodes } from "../utils/layout";
import { loadInitialConfig } from "../utils/fileUtils";

export function useFlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showNodeSelector, setShowNodeSelector] = useState(false);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // Load initial configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { nodes: initialNodes, edges: initialEdges } =
          await loadInitialConfig();
        const layoutedNodes = getLayoutedNodes(initialNodes, initialEdges);
        setNodes(layoutedNodes);
        setEdges(initialEdges);
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
          label:
            NODE_TYPES_FOR_SIDEBAR.find((nt) => nt.type === type)?.label ||
            type,
          category:
            NODE_TYPES_FOR_SIDEBAR.find((nt) => nt.type === type)?.category ||
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
            NODE_TYPES_FOR_SIDEBAR.find((nt) => nt.type === nodeType)?.label ||
            nodeType,
          category:
            NODE_TYPES_FOR_SIDEBAR.find((nt) => nt.type === nodeType)
              ?.category || "default",
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
    handleEdgeAddNode,
    handleNodeSelect,
    handleAutoLayout,
  };
}
