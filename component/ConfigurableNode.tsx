import React, { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { Button } from "../components/ui/button";
import { Settings, CheckCircle } from "lucide-react";
import { NodeConfigPanel } from "./ui/NodeConfigPanel";
import { NodeData } from "./types";

interface ConfigurableNodeProps {
  data: NodeData;
  nodeType: string;
  children: React.ReactNode;
  onConfigChange?: (nodeId: string, config: { [key: string]: any }) => void;
}

export function ConfigurableNode({
  data,
  nodeType,
  children,
  onConfigChange,
}: ConfigurableNodeProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleConfigSave = (config: { [key: string]: any }) => {
    if (onConfigChange) {
      onConfigChange(data.id || "", config);
    }
    setIsConfigOpen(false);
  };

  const hasConfig = data.config && Object.keys(data.config).length > 0;
  const isConfigurable =
    data.isConfigurable !== false &&
    (nodeType.startsWith("oauth") ||
      nodeType.includes("database") ||
      nodeType.includes("email") ||
      nodeType === "session" ||
      nodeType === "forgotPassword" ||
      nodeType === "emailVerification");

  return (
    <div className="relative group">
      {/* Render the child component (the actual node) */}
      {children}

      {/* Configuration button - positioned absolutely over the node */}
      {isConfigurable && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white shadow-sm z-10"
          onClick={(e) => {
            e.stopPropagation();
            setIsConfigOpen(true);
          }}
        >
          {hasConfig ? (
            <CheckCircle className="w-3 h-3 text-green-600" />
          ) : (
            <Settings className="w-3 h-3" />
          )}
        </Button>
      )}

      {/* Configuration Modal */}
      <NodeConfigPanel
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        nodeType={nodeType}
        currentConfig={data.config || {}}
        onSave={handleConfigSave}
      />
    </div>
  );
}
