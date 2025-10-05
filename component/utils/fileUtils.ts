export function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function loadInitialConfig(): Promise<{
  nodes: any[];
  edges: any[];
}> {
  try {
    // Try to read auth.ts file content
    const authResponse = await fetch("/utils/auth.ts");
    if (authResponse.ok) {
      const authContent = await authResponse.text();
      const { generateNodesFromAuthFile } = await import(
        "../../utils/parseAuthToNodes"
      );
      return generateNodesFromAuthFile(authContent);
    }
  } catch (error) {
    console.log("No auth.ts found, checking config.json");
  }

  // Fallback to config.json
  try {
    const configData = await import("../../.better-auth-pulse.config.json");
    const { convertPulseConfigToFlowNodes } = await import(
      "../../utils/convertPulseConfigToFlowNodes"
    );
    const { nodes: rawNodes, edges: initialEdges } =
      convertPulseConfigToFlowNodes(configData.default);
    return { nodes: rawNodes, edges: initialEdges };
  } catch (error) {
    console.log("No config.json found, using default");
  }

  // Final fallback - just auth starter
  const { generateNodesFromAuthFile } = await import(
    "../../utils/parseAuthToNodes"
  );
  return generateNodesFromAuthFile();
}
