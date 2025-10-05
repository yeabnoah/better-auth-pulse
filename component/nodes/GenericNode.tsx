import { Handle, Position } from "@xyflow/react";
import { CATEGORY_COLORS } from "../types/nodeTypes";
import { NodeData } from "../types";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

interface GenericNodeProps {
  data: NodeData;
}

export function GenericNode({ data }: GenericNodeProps) {
  const getCategoryColor = (category?: string) => {
    if (!category) return CATEGORY_COLORS.default;
    return (
      CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] ||
      CATEGORY_COLORS.default
    );
  };

  const getDescription = (data: NodeData) => {
    if (data.provider) return `Provider: ${data.provider}`;
    if (data.type) return `Type: ${data.type}`;
    if (data.category) {
      return `${
        data.category.charAt(0).toUpperCase() + data.category.slice(1)
      } service`;
    }
    return "Configuration node";
  };

  return (
    <Card
      className={`shadow-lg backdrop-blur-sm ${getCategoryColor(
        data.category
      )}`}
    >
      <Handle
        type="source"
        position={Position.Left}
        className="w-3 h-3 bg-background border-2 border-border"
      />
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-sm text-foreground">
            {data.label}
          </div>
          {data.category && (
            <Badge variant="secondary" className="text-xs">
              {data.category}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{getDescription(data)}</p>
      </CardContent>
      <Handle
        type="target"
        position={Position.Right}
        className="w-3 h-3 bg-background border-2 border-border"
      />
    </Card>
  );
}
