import { Handle, Position } from "@xyflow/react";
import { NodeData } from "../types";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

interface AuthStarterNodeProps {
  data: NodeData;
}

export function AuthStarterNode({ data }: AuthStarterNodeProps) {
  return (
    <Card className="shadow-lg backdrop-blur-sm border-primary">
      <Handle
        type="source"
        position={Position.Left}
        className="w-3 h-3 bg-background border-2 border-border"
      />
      <Handle
        type="source"
        position={Position.Top}
        className="w-3 h-3 bg-background border-2 border-border"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-background border-2 border-border"
      />
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-sm text-foreground">
            {data.label}
          </div>
          <Badge variant="default">Auth</Badge>
        </div>
        <p className="text-xs text-muted-foreground">Empty auth.ts setup</p>
      </CardContent>
      <Handle
        type="target"
        position={Position.Right}
        className="w-3 h-3 bg-background border-2 border-border"
      />
    </Card>
  );
}
