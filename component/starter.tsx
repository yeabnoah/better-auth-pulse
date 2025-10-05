"use client";
import { ReactFlowProvider } from "@xyflow/react";
import { FlowEditor } from "./FlowEditor";

export default function Starter() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
    </ReactFlowProvider>
  );
}
