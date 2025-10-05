export * from "./nodeTypes";

export type PreviewMode =
  | "canvas-to-json"
  | "json-to-auth"
  | "load-auth"
  | "generate-auth"
  | "organization-client";

export interface NodeData {
  label: string;
  category?: string;
  provider?: string;
  type?: string;
}

export interface EdgeData {
  onAddNode?: (edgeId: string) => void;
}
