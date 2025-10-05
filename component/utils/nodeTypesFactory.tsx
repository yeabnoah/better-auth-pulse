/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from "react";
import { Node, Handle, Position, NodeTypes } from "@xyflow/react";
import { GenericNode, AuthStarterNode, EmailAuthNode } from "../nodes";
import { NodeData } from "../types";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

interface NodeComponentProps {
  data: NodeData;
}

export function createNodeTypes(nodes: Node[]): NodeTypes {
  const nodeTypes: NodeTypes = {
    // Authentication Core
    authStarter: AuthStarterNode,
    emailAuth: EmailAuthNode,

    // Database & Storage
    database: ({ data }: NodeComponentProps) => (
      <Card className="shadow-lg backdrop-blur-sm border-blue-500 bg-blue-50 dark:bg-blue-900/20">
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
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              Database
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">Database config</p>
        </CardContent>
        <Handle
          type="target"
          position={Position.Right}
          className="w-3 h-3 bg-background border-2 border-border"
        />
      </Card>
    ),
    prisma: ({ data }: NodeComponentProps) => (
      <Card className="shadow-lg backdrop-blur-sm border-blue-500 bg-blue-50 dark:bg-blue-900/20">
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
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              Prisma
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">Prisma adapter</p>
        </CardContent>
        <Handle
          type="target"
          position={Position.Right}
          className="w-3 h-3 bg-background border-2 border-border"
        />
      </Card>
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
      <Card className="shadow-lg backdrop-blur-sm border-red-500 bg-red-50 dark:bg-red-900/20">
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
            <Badge variant="destructive">Security</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Rate limiting</p>
        </CardContent>
        <Handle
          type="target"
          position={Position.Right}
          className="w-3 h-3 bg-background border-2 border-border"
        />
      </Card>
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
