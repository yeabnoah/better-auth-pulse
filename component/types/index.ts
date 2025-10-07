export * from "./nodeTypes";

export type PreviewMode =
  | "canvas-to-json"
  | "json-to-auth"
  | "load-auth"
  | "generate-auth"
  | "organization-client";

export interface NodeData {
  id?: string;
  label: string;
  category?: string;
  provider?: string;
  type?: string;
  config?: {
    [key: string]: any;
  };
  isConfigurable?: boolean;
}

export interface EdgeData {
  onAddNode?: (edgeId: string) => void;
}
