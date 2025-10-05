import { Handle, Position } from "@xyflow/react";
import { NodeData } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EmailAuthNodeProps {
  data: NodeData;
}

export function EmailAuthNode({ data }: EmailAuthNodeProps) {
  return (
    <Card className="shadow-lg backdrop-blur-sm border-green-500 bg-green-50 dark:bg-green-900/20">
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
        style={{ left: "20%" }}
        position={Position.Bottom}
        className="w-3 h-3 bg-background border-2 border-border"
      />
      <Handle
        type="source"
        style={{ right: "20%" }}
        position={Position.Right}
        className="w-3 h-3 bg-background border-2 border-border"
      />
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-sm text-foreground">
            {data.label}
          </div>
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            Email
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">Email & Password auth</p>
      </CardContent>
      <Handle
        type="target"
        position={Position.Right}
        className="w-3 h-3 bg-background border-2 border-border"
      />
    </Card>
  );
}
