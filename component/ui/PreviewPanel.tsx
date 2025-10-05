"use client";
import { useState, useEffect } from "react";
import { Node, Edge } from "@xyflow/react";
import { PreviewMode } from "../types";
import { downloadFile } from "../utils/fileUtils";
import {
  generateBetterAuthCode,
  generateEnvTemplate,
  generateOrganizationClient,
} from "../../utils/generateBetterAuthCode";
import { convertFlowNodesToPulseConfig } from "@/utils/convertPulseConfigToFlowNodes";

interface PreviewPanelProps {
  nodes: Node[];
  edges: Edge[];
  onClose: () => void;
  onNodesUpdate?: (nodes: Node[], edges: Edge[]) => void;
}

export function PreviewPanel({
  nodes,
  edges,
  onClose,
  onNodesUpdate,
}: PreviewPanelProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>("canvas-to-json");
  const [previewContent, setPreviewContent] = useState("");
  const [authInput, setAuthInput] = useState("");

  const validNodes = nodes.filter((node) => node.type && node.id);

  const handleDownload = (filename: string, content: string) => {
    downloadFile(filename, content);
  };

  const handleGenerateFromAuthInput = async () => {
    if (!authInput.trim()) {
      alert("Please paste your auth.ts code first");
      return;
    }

    try {
      const { generateNodesFromAuthFile } = await import(
        "../../utils/parseAuthToNodes"
      );
      const { nodes: newNodes, edges: newEdges } =
        generateNodesFromAuthFile(authInput);

      // Update the parent component with the generated nodes
      if (onNodesUpdate) {
        onNodesUpdate(newNodes, newEdges);
      }

      console.log("Generated nodes:", newNodes, newEdges);
      setAuthInput("");
    } catch (error) {
      console.error("Error parsing auth code:", error);
      alert("Error parsing auth.ts code. Please check the format.");
    }
  };

  const handleLoadFromAuth = async () => {
    try {
      const authResponse = await fetch("/utils/auth.ts");
      if (authResponse.ok) {
        const authContent = await authResponse.text();
        const { generateNodesFromAuthFile } = await import(
          "../../utils/parseAuthToNodes"
        );
        const { nodes: newNodes, edges: newEdges } =
          generateNodesFromAuthFile(authContent);

        // Update the parent component with the loaded nodes
        if (onNodesUpdate) {
          onNodesUpdate(newNodes, newEdges);
        }

        console.log("Loaded nodes:", newNodes, newEdges);
      } else {
        alert("No auth.ts file found. Using default configuration.");
      }
    } catch (error) {
      console.error("Error loading auth.ts:", error);
      alert("Error loading auth.ts file");
    }
  };

  // Update preview content when nodes, edges, or mode changes
  useEffect(() => {
    switch (previewMode) {
      case "canvas-to-json":
        const config = convertFlowNodesToPulseConfig(validNodes as any, edges);
        setPreviewContent(JSON.stringify(config, null, 2));
        break;
      case "json-to-auth":
      case "generate-auth":
        setPreviewContent(generateBetterAuthCode(validNodes as any, edges));
        break;
      case "organization-client":
        setPreviewContent(generateOrganizationClient(validNodes as any, edges));
        break;
      default:
        setPreviewContent("");
    }
  }, [nodes, edges, previewMode]);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Preview & Export</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setPreviewMode("canvas-to-json")}
            className={`px-4 py-3 text-sm rounded-lg font-medium transition-colors ${
              previewMode === "canvas-to-json"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Canvas → JSON
          </button>
          <button
            onClick={() => setPreviewMode("json-to-auth")}
            className={`px-4 py-3 text-sm rounded-lg font-medium transition-colors ${
              previewMode === "json-to-auth"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            JSON → Auth.ts
          </button>
          <button
            onClick={() => setPreviewMode("load-auth")}
            className={`px-4 py-3 text-sm rounded-lg font-medium transition-colors ${
              previewMode === "load-auth"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Load Auth.ts
          </button>
          <button
            onClick={() => setPreviewMode("generate-auth")}
            className={`px-4 py-3 text-sm rounded-lg font-medium transition-colors ${
              previewMode === "generate-auth"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Generate Auth.ts
          </button>
          <button
            onClick={() => setPreviewMode("organization-client")}
            className={`px-4 py-3 text-sm rounded-lg font-medium transition-colors col-span-2 ${
              previewMode === "organization-client"
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Organization Client
          </button>
        </div>
      </div>

      {/* Content based on mode */}
      <div className="flex-1 flex flex-col">
        {previewMode === "canvas-to-json" && (
          <div className="flex-1 flex flex-col">
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => handleDownload("config.json", previewContent)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Download JSON
              </button>
            </div>
            <pre className="flex-1 bg-gray-900 p-4 rounded-lg border border-gray-700 text-xs overflow-auto text-gray-300 font-mono">
              {previewContent}
            </pre>
          </div>
        )}

        {previewMode === "json-to-auth" && (
          <div className="flex-1 flex flex-col">
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => handleDownload("auth.ts", previewContent)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Download auth.ts
              </button>
              <button
                onClick={() =>
                  handleDownload(
                    ".env.example",
                    generateEnvTemplate(validNodes as any, edges)
                  )
                }
                className="bg-yellow-600 text-white px-3 py-1 rounded text-sm"
              >
                Download .env
              </button>
            </div>
            <pre className="flex-1 bg-gray-900 p-4 rounded-lg border border-gray-700 text-xs overflow-auto text-gray-300 font-mono">
              {previewContent}
            </pre>
          </div>
        )}

        {previewMode === "load-auth" && (
          <div className="flex-1 flex flex-col">
            <div className="mb-3">
              <button
                onClick={handleLoadFromAuth}
                className="bg-purple-600 text-white px-3 py-2 rounded text-sm w-full mb-2"
              >
                Load from /utils/auth.ts
              </button>
              <p className="text-xs text-gray-600 mb-3">
                Paste your auth.ts code below to generate nodes:
              </p>
              <textarea
                value={authInput}
                onChange={(e) => setAuthInput(e.target.value)}
                placeholder="Paste your entire auth.ts file content here..."
                className="w-full h-32 p-2 border rounded text-xs font-mono mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateFromAuthInput}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm flex-1"
                >
                  Generate Nodes
                </button>
                <button
                  onClick={() => setAuthInput("")}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {previewMode === "generate-auth" && (
          <div className="flex-1 flex flex-col">
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => handleDownload("auth.ts", previewContent)}
                className="bg-black text-white px-3 py-1 rounded text-sm"
              >
                Generate & Download
              </button>
            </div>
            <pre className="flex-1 bg-white p-3 rounded border text-xs overflow-auto">
              {previewContent}
            </pre>
          </div>
        )}

        {previewMode === "organization-client" && (
          <div className="flex-1 flex flex-col">
            <div className="flex gap-2 mb-3">
              <button
                onClick={() =>
                  handleDownload("organization-client.ts", previewContent)
                }
                className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
              >
                Download Client
              </button>
            </div>
            <pre className="flex-1 bg-gray-900 p-4 rounded-lg border border-gray-700 text-xs overflow-auto text-gray-300 font-mono">
              {previewContent}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
