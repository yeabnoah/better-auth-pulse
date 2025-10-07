"use client";

import React, { useState } from "react";
import { NodeConfigPanel } from "../../component/ui/NodeConfigPanel";

export default function ConfigDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{
    clientId?: string;
    clientSecret?: string;
    provider?: string;
    url?: string;
    apiKey?: string;
    fromEmail?: string;
  }>({});

  const handleSave = (newConfig: Record<string, unknown>) => {
    setConfig(newConfig);
    console.log("Saved config:", newConfig);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Node Configuration Demo</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Google OAuth</h3>
            <button
              onClick={() => setIsOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Configure Google OAuth
            </button>
            {config.clientId && (
              <div className="mt-4 p-3 bg-green-50 rounded">
                <p className="text-sm text-green-800">
                  ✓ Client ID: {config.clientId}
                </p>
                <p className="text-sm text-green-800">
                  ✓ Client Secret: {config.clientSecret ? "Set" : "Not set"}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Database</h3>
            <button
              onClick={() => setIsOpen(true)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Configure Database
            </button>
            {config.provider && (
              <div className="mt-4 p-3 bg-green-50 rounded">
                <p className="text-sm text-green-800">
                  ✓ Provider: {config.provider}
                </p>
                <p className="text-sm text-green-800">
                  ✓ URL: {config.url ? "Set" : "Not set"}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Email Service</h3>
            <button
              onClick={() => setIsOpen(true)}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Configure Email
            </button>
            {config.apiKey && (
              <div className="mt-4 p-3 bg-green-50 rounded">
                <p className="text-sm text-green-800">
                  ✓ API Key: {config.apiKey ? "Set" : "Not set"}
                </p>
                <p className="text-sm text-green-800">
                  ✓ From Email: {config.fromEmail || "Not set"}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Current Configuration</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      </div>

      <NodeConfigPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        nodeType="oauthGoogle"
        currentConfig={config}
        onSave={handleSave}
      />
    </div>
  );
}
