export function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Simplified - we start with a clean canvas and build from there
export function getDefaultNodes() {
  return [
    {
      id: "auth-start-1",
      type: "authStarter",
      position: { x: 250, y: 100 },
      data: { label: "Auth Start" },
    },
  ];
}
