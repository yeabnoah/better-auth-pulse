import { getSmoothStepPath } from "@xyflow/react";
import { EdgeData } from "../types";

interface CustomEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: any;
  targetPosition: any;
  style?: React.CSSProperties;
  data?: EdgeData;
  [key: string]: any;
}

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  ...props
}: CustomEdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={{
          ...style,
          stroke: "#6b7280",
          strokeWidth: 2,
          fill: "none",
        }}
        {...props}
      />
      <g transform={`translate(${labelX}, ${labelY})`}>
        <circle
          cx={0}
          cy={0}
          r={14}
          fill="#1f2937"
          stroke="#4b5563"
          strokeWidth={2}
          className="cursor-pointer hover:fill-gray-600 hover:stroke-gray-400 transition-all duration-200 shadow-lg"
          onClick={() => data?.onAddNode?.(id)}
        />
        <circle
          cx={0}
          cy={0}
          r={10}
          fill="transparent"
          stroke="#9ca3af"
          strokeWidth={1}
          className="pointer-events-none"
        />
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-white text-lg font-bold pointer-events-none"
        >
          +
        </text>
      </g>
    </>
  );
}
