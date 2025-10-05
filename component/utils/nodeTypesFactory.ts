/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React from "react";
import { Node, Handle, Position } from "@xyflow/react";
import { GenericNode, AuthStarterNode, EmailAuthNode } from "../nodes";
import { NodeData } from "../types";

interface NodeComponentProps {
  data: NodeData;
}

export function createNodeTypes(nodes: Node[]) {
  const nodeTypes: { [key: string]: React.ComponentType<NodeComponentProps> } =
    {
      // Authentication Core
      authStarter: AuthStarterNode,
      emailAuth: EmailAuthNode,

      // Database & Storage
      database: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-blue-500 p-4 rounded-xl bg-blue-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">Database config</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),
      prisma: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-blue-500 p-4 rounded-xl bg-blue-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">Prisma adapter</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),
      drizzle: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-blue-500 p-4 rounded-xl bg-blue-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">Drizzle adapter</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),
      provider: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-blue-500 p-4 rounded-xl bg-blue-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">DB provider</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),
      sqlite: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-blue-500 p-4 rounded-xl bg-blue-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">SQLite database</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),
      postgresql: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-blue-500 p-4 rounded-xl bg-blue-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">PostgreSQL database</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),
      mysql: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-blue-500 p-4 rounded-xl bg-blue-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">MySQL database</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),

      // Security
      rateLimit: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-red-500 p-4 rounded-xl bg-red-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">Rate limiting</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),
      cors: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-red-500 p-4 rounded-xl bg-red-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">CORS config</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),
      csrf: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-red-500 p-4 rounded-xl bg-red-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">CSRF protection</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),

      // Email Services
      emailResend: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-purple-500 p-4 rounded-xl bg-purple-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">Resend email</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),
      emailSendGrid: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-purple-500 p-4 rounded-xl bg-purple-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">SendGrid email</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),
      emailNodemailer: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-purple-500 p-4 rounded-xl bg-purple-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">Nodemailer</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),

      // Configuration
      session: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-yellow-500 p-4 rounded-xl bg-yellow-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">Session config</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),
      cookies: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-yellow-500 p-4 rounded-xl bg-yellow-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">Cookie config</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),
      advanced: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-yellow-500 p-4 rounded-xl bg-yellow-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">Advanced config</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),

      // Plugins
      middleware: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-purple-500 p-4 rounded-xl bg-purple-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">Custom middleware</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),
      eventHandler: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-purple-500 p-4 rounded-xl bg-purple-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">Event handler</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),
      hooks: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-purple-500 p-4 rounded-xl bg-purple-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">Auth hooks</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),
      organization: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-purple-500 p-4 rounded-xl bg-purple-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">Organization management</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),
      organizationClient: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-purple-500 p-4 rounded-xl bg-purple-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">Organization client</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),

      // Additional auth nodes
      emailVerification: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-green-500 p-4 rounded-xl bg-green-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">Email verification</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),
      socialLogin: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-green-500 p-4 rounded-xl bg-green-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">Social providers</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),
      oauthGoogle: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-green-500 p-4 rounded-xl bg-green-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">OAuth provider</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),
      oauthGithub: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-green-500 p-4 rounded-xl bg-green-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">OAuth provider</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),
      account: ({ data }: NodeComponentProps) => (
        <div className="border-2 border-green-500 p-4 rounded-xl bg-green-900/20 shadow-lg backdrop-blur-sm">
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
          <div className="text-white font-semibold text-sm mb-1">
            {data.label}
          </div>
          <p className="text-xs text-gray-300 mt-1">Account linking</p>
          <Handle
            type="target"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-gray-600"
          />
        </div>
      ),
    };

  // Add any missing node types as generic nodes
  nodes.forEach((node) => {
    if (node.type && !nodeTypes[node.type]) {
      nodeTypes[node.type] = GenericNode;
    }
  });

  return nodeTypes;
}
