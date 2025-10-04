"use client";
import { useCallback, useState, useRef, useEffect } from "react";
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  Handle,
  Position,
  useReactFlow,
  getSmoothStepPath,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import {
  convertPulseConfigToFlowNodes,
  convertFlowNodesToPulseConfig,
  PulseConfig,
} from "../utils/convertPulseConfigToFlowNodes";
import {
  generateBetterAuthCode,
  generateEnvTemplate,
  generateOrganizationClient,
} from "../utils/generateBetterAuthCode";
import { generateNodesFromAuthFile } from "../utils/parseAuthToNodes";
import configData from "../.better-auth-pulse.config.json";

const nodeWidth = 150;
const nodeHeight = 50;

function getLayoutedNodes(nodes: Node[], edges: Edge[]): Node[] {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "TB" });

  nodes.forEach((node) =>
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  );

  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      positionAbsolute: { ...node.position },
    };
  });
}

// Function to load configuration with priority: auth.ts > config.json > default
async function loadInitialConfig(): Promise<{ nodes: Node[]; edges: Edge[] }> {
  try {
    // Try to read auth.ts file content
    const authResponse = await fetch("/utils/auth.ts");
    if (authResponse.ok) {
      const authContent = await authResponse.text();
      return generateNodesFromAuthFile(authContent);
    }
  } catch (error) {
    console.log("No auth.ts found, checking config.json");
  }

  // Fallback to config.json
  try {
    const { nodes: rawNodes, edges: initialEdges } =
      convertPulseConfigToFlowNodes(configData);
    return { nodes: rawNodes, edges: initialEdges };
  } catch (error) {
    console.log("No config.json found, using default");
  }

  // Final fallback - just auth starter
  return generateNodesFromAuthFile();
}

// Define available node types for the sidebar
const nodeTypesForSidebar = [
  // Authentication Core
  {
    type: "authStarter",
    label: "Auth Start",
    category: "authentication",
    description: "Authentication starter",
  },
  {
    type: "emailAuth",
    label: "Email + Password",
    category: "authentication",
    description: "Email and password authentication",
  },
  {
    type: "emailVerification",
    label: "Email Verification",
    category: "authentication",
    description: "Email verification settings",
  },
  {
    type: "socialLogin",
    label: "Social Login",
    category: "authentication",
    description: "Social login providers container",
  },
  {
    type: "oauthGoogle",
    label: "Google OAuth",
    category: "authentication",
    description: "Google OAuth provider",
  },
  {
    type: "oauthGithub",
    label: "GitHub OAuth",
    category: "authentication",
    description: "GitHub OAuth provider",
  },
  {
    type: "account",
    label: "Account Linking",
    category: "authentication",
    description: "Account linking configuration",
  },

  // Database & Storage
  {
    type: "database",
    label: "Database",
    category: "database",
    description: "Database configuration",
  },
  {
    type: "prisma",
    label: "Prisma Adapter",
    category: "database",
    description: "Prisma database adapter",
  },
  {
    type: "drizzle",
    label: "Drizzle Adapter",
    category: "database",
    description: "Drizzle database adapter",
  },
  {
    type: "provider",
    label: "DB Provider",
    category: "database",
    description: "Database provider selection",
  },
  {
    type: "sqlite",
    label: "SQLite",
    category: "database",
    description: "SQLite database",
  },
  {
    type: "postgresql",
    label: "PostgreSQL",
    category: "database",
    description: "PostgreSQL database",
  },
  {
    type: "mysql",
    label: "MySQL",
    category: "database",
    description: "MySQL database",
  },

  // Security & Rate Limiting
  {
    type: "rateLimit",
    label: "Rate Limiting",
    category: "security",
    description: "Rate limiting configuration",
  },
  {
    type: "cors",
    label: "CORS",
    category: "security",
    description: "CORS configuration",
  },
  {
    type: "csrf",
    label: "CSRF Protection",
    category: "security",
    description: "CSRF protection settings",
  },

  // Email & Communication
  {
    type: "emailResend",
    label: "Resend Email",
    category: "plugins",
    description: "Resend email service",
  },
  {
    type: "emailSendGrid",
    label: "SendGrid",
    category: "plugins",
    description: "SendGrid email service",
  },
  {
    type: "emailNodemailer",
    label: "Nodemailer",
    category: "plugins",
    description: "Nodemailer email service",
  },

  // Advanced Features
  {
    type: "session",
    label: "Session Config",
    category: "configuration",
    description: "Session configuration",
  },
  {
    type: "cookies",
    label: "Cookie Config",
    category: "configuration",
    description: "Cookie configuration",
  },
  {
    type: "advanced",
    label: "Advanced Config",
    category: "configuration",
    description: "Advanced authentication settings",
  },
  {
    type: "middleware",
    label: "Middleware",
    category: "plugins",
    description: "Custom middleware",
  },
  {
    type: "eventHandler",
    label: "Event Handler",
    category: "plugins",
    description: "Custom event handler",
  },
  {
    type: "hooks",
    label: "Hooks",
    category: "plugins",
    description: "Authentication hooks",
  },
  {
    type: "organization",
    label: "Organization Plugin",
    category: "plugins",
    description: "User access and permissions management",
  },
  {
    type: "organizationClient",
    label: "Organization Client",
    category: "plugins",
    description: "Organization client for frontend",
  },
];

// Start with just an Auth Start node
const initialNodes: Node[] = [
  {
    id: "auth-start-1",
    type: "authStarter",
    position: { x: 250, y: 100 },
    data: { label: "Auth Start" },
  },
];

const initialEdges: Edge[] = [];

// Generic node component that can handle any node type
const GenericNode = ({ data }: any) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "database":
        return "border-blue-500 bg-blue-900/20";
      case "authentication":
        return "border-green-500 bg-green-900/20";
      case "plugins":
        return "border-purple-500 bg-purple-900/20";
      case "security":
        return "border-red-500 bg-red-900/20";
      case "configuration":
        return "border-yellow-500 bg-yellow-900/20";
      default:
        return "border-gray-600 bg-gray-800";
    }
  };

  const getDescription = (data: any) => {
    if (data.provider) return `Provider: ${data.provider}`;
    if (data.type) return `Type: ${data.type}`;
    if (data.category)
      return `${
        data.category.charAt(0).toUpperCase() + data.category.slice(1)
      } service`;
    return "Configuration node";
  };

  return (
    <div
      className={`border-2 p-4 rounded-xl shadow-lg backdrop-blur-sm ${getCategoryColor(
        data.category
      )}`}
    >
      <Handle
        type="source"
        position={Position.Left}
        className="w-3 h-3 bg-white border-2 border-gray-600"
      />
      <div className="text-white font-semibold text-sm mb-1">{data.label}</div>
      <p className="text-xs text-gray-300 mt-1">{getDescription(data)}</p>
      <Handle
        type="target"
        position={Position.Right}
        className="w-3 h-3 bg-white border-2 border-gray-600"
      />
    </div>
  );
};

// Create dynamic node types from the generated nodes
const createNodeTypes = (nodes: Node[]) => {
  const nodeTypes: { [key: string]: React.ComponentType<any> } = {
    // Authentication Core
    authStarter: ({ data }: any) => (
      <div className="border-2 border-gray-600 p-4 rounded-xl bg-gray-800 shadow-lg backdrop-blur-sm">
        <Handle
          type="source"
          position={Position.Left}
          className="w-3 h-3 bg-white border-2 border-gray-600"
        />
        <Handle
          type="source"
          position={Position.Top}
          className="w-3 h-3 bg-white border-2 border-gray-600"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 bg-white border-2 border-gray-600"
        />
        <div className="text-white font-semibold text-sm mb-1">
          {data.label}
        </div>
        <p className="text-xs text-gray-300 mt-1">Empty auth.ts setup</p>
        <Handle
          type="target"
          position={Position.Right}
          className="w-3 h-3 bg-white border-2 border-gray-600"
        />
      </div>
    ),
    emailAuth: ({ data }: any) => (
      <div className="border-2 border-green-500 p-4 rounded-xl bg-green-900/20 shadow-lg backdrop-blur-sm">
        <Handle
          type="source"
          position={Position.Left}
          className="w-3 h-3 bg-white border-2 border-gray-600"
        />
        <Handle
          type="source"
          position={Position.Top}
          className="w-3 h-3 bg-white border-2 border-gray-600"
        />
        <Handle
          type="source"
          style={{
            left: "20%",
          }}
          position={Position.Bottom}
          className="w-3 h-3 bg-white border-2 border-gray-600"
        />
        <Handle
          type="source"
          style={{
            right: "20%",
          }}
          position={Position.Right}
          className="w-3 h-3 bg-white border-2 border-gray-600"
        />
        <div className="text-white font-semibold text-sm mb-1">
          {data.label}
        </div>
        <p className="text-xs text-gray-300 mt-1">Email & Password auth</p>
        <Handle
          type="target"
          position={Position.Right}
          className="w-3 h-3 bg-white border-2 border-gray-600"
        />
      </div>
    ),
    emailVerification: ({ data }: any) => (
      <div className="border p-3 rounded bg-green-50 border-green-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">Email verification</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
    socialLogin: ({ data }: any) => (
      <div className="border p-3 rounded bg-green-50 border-green-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">Social providers</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
    oauthGoogle: ({ data }: any) => (
      <div className="border p-3 rounded bg-green-50 border-green-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">OAuth provider</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
    oauthGithub: ({ data }: any) => (
      <div className="border p-3 rounded bg-green-50 border-green-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">OAuth provider</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
    account: ({ data }: any) => (
      <div className="border p-3 rounded bg-green-50 border-green-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">Account linking</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),

    // Database & Storage
    database: ({ data }: any) => (
      <div className="border p-3 rounded bg-blue-50 border-blue-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">Database config</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
    prisma: ({ data }: any) => (
      <div className="border p-3 rounded bg-blue-50 border-blue-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">Prisma adapter</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
    drizzle: ({ data }: any) => (
      <div className="border p-3 rounded bg-blue-50 border-blue-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">Drizzle adapter</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
    provider: ({ data }: any) => (
      <div className="border p-3 rounded bg-blue-50 border-blue-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">DB provider</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
    sqlite: ({ data }: any) => (
      <div className="border p-3 rounded bg-blue-50 border-blue-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">SQLite database</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
    postgresql: ({ data }: any) => (
      <div className="border p-3 rounded bg-blue-50 border-blue-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">PostgreSQL database</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
    mysql: ({ data }: any) => (
      <div className="border p-3 rounded bg-blue-50 border-blue-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">MySQL database</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),

    // Security
    rateLimit: ({ data }: any) => (
      <div className="border p-3 rounded bg-red-50 border-red-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">Rate limiting</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
    cors: ({ data }: any) => (
      <div className="border p-3 rounded bg-red-50 border-red-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">CORS config</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
    csrf: ({ data }: any) => (
      <div className="border p-3 rounded bg-red-50 border-red-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">CSRF protection</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),

    // Email Services
    emailResend: ({ data }: any) => (
      <div className="border p-3 rounded bg-purple-50 border-purple-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">Resend email</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
    emailSendGrid: ({ data }: any) => (
      <div className="border p-3 rounded bg-purple-50 border-purple-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">SendGrid email</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
    emailNodemailer: ({ data }: any) => (
      <div className="border p-3 rounded bg-purple-50 border-purple-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">Nodemailer</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),

    // Configuration
    session: ({ data }: any) => (
      <div className="border p-3 rounded bg-yellow-50 border-yellow-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">Session config</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
    cookies: ({ data }: any) => (
      <div className="border p-3 rounded bg-yellow-50 border-yellow-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">Cookie config</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
    advanced: ({ data }: any) => (
      <div className="border p-3 rounded bg-yellow-50 border-yellow-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">Advanced config</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),

    // Plugins
    middleware: ({ data }: any) => (
      <div className="border p-3 rounded bg-purple-50 border-purple-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">Custom middleware</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
    eventHandler: ({ data }: any) => (
      <div className="border p-3 rounded bg-purple-50 border-purple-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">Event handler</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
    hooks: ({ data }: any) => (
      <div className="border p-3 rounded bg-purple-50 border-purple-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">Auth hooks</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
    organization: ({ data }: any) => (
      <div className="border p-3 rounded bg-purple-50 border-purple-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">Organization management</p>
        <Handle type="target" position={Position.Right} />
      </div>
    ),
    organizationClient: ({ data }: any) => (
      <div className="border p-3 rounded bg-purple-50 border-purple-200 shadow-sm">
        <Handle type="source" position={Position.Left} />
        <strong>{data.label}</strong>
        <p className="text-xs text-gray-500 mt-1">Organization client</p>
        <Handle type="target" position={Position.Right} />
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
};

const nodeTypes = createNodeTypes(initialNodes);

// Custom edge component with clickable plus button
const CustomEdge = ({
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
}: any) => {
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
};

const edgeTypes = {
  custom: CustomEdge,
};

// Sidebar component with draggable nodes
const Sidebar = ({ onAddNode }: { onAddNode: (nodeType: string) => void }) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleClick = (nodeType: string) => {
    onAddNode(nodeType);
  };

  return (
    <div className="w-80 overflow-scroll bg-gray-900 border-r border-gray-700 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          Better Auth Pulse
        </h1>
        <p className="text-sm text-gray-400">
          Build authentication flows visually
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">
          Components
        </h3>
        {nodeTypesForSidebar.map((nodeType) => (
          <div
            key={nodeType.type}
            className=" p-1 bg-gray-800 border border-gray-700 rounded-xl cursor-pointer hover:bg-gray-750 hover:border-gray-600 transition-all duration-200 group"
            draggable
            onDragStart={(event) => onDragStart(event, nodeType.type)}
            onClick={() => handleClick(nodeType.type)}
          >
            <div className="flex items-start space-x-3">
              <div
                className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                style={{
                  backgroundColor:
                    nodeType.category === "authentication"
                      ? "#10b981"
                      : nodeType.category === "database"
                      ? "#3b82f6"
                      : nodeType.category === "plugins"
                      ? "#8b5cf6"
                      : nodeType.category === "security"
                      ? "#ef4444"
                      : nodeType.category === "configuration"
                      ? "#eab308"
                      : "#6b7280",
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-white group-hover:text-gray-100 transition-colors">
                  {nodeType.label}
                </div>
                <div className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {nodeType.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Removed old generateAuthFile function - now using generateBetterAuthCode from utils

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const [code, setCode] = useState("");
  const [authInput, setAuthInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<
    | "canvas-to-json"
    | "json-to-auth"
    | "load-auth"
    | "generate-auth"
    | "organization-client"
  >("canvas-to-json");
  const [previewContent, setPreviewContent] = useState("");
  const [showNodeSelector, setShowNodeSelector] = useState(false);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => {
      // Prevent self-connections
      if (params.source === params.target) {
        return;
      }

      // Check if connection already exists
      const existingEdge = edges.find(
        (edge) => edge.source === params.source && edge.target === params.target
      );

      if (existingEdge) {
        return;
      }

      const newEdge: Edge = {
        ...params,
        id: `${params.source}-${params.target}`,
        type: "custom",
        animated: true,
        data: { onAddNode: handleEdgeAddNode },
      };
      setEdges((eds: Edge[]) => addEdge(newEdge, eds));
    },
    [edges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label:
            nodeTypesForSidebar.find((nt) => nt.type === type)?.label || type,
          category:
            nodeTypesForSidebar.find((nt) => nt.type === type)?.category ||
            "default",
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const handleAddNode = useCallback(
    (nodeType: string, edgeId?: string) => {
      const position = {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      };
      const newNode: Node = {
        id: `${nodeType}-${Date.now()}`,
        type: nodeType,
        position,
        data: {
          label:
            nodeTypesForSidebar.find((nt) => nt.type === nodeType)?.label ||
            nodeType,
          category:
            nodeTypesForSidebar.find((nt) => nt.type === nodeType)?.category ||
            "default",
        },
      };

      setNodes((nds) => nds.concat(newNode));

      // If adding from an edge, create a connection
      if (edgeId) {
        const edge = edges.find((e) => e.id === edgeId);
        if (edge) {
          const newEdge: Edge = {
            id: `${edge.target}-${newNode.id}`,
            source: edge.target,
            target: newNode.id,
            type: "custom",
            animated: true,
            data: { onAddNode: handleEdgeAddNode },
          };
          setEdges((eds) => [...eds, newEdge]);
        }
      }

      setShowNodeSelector(false);
      setSelectedEdgeId(null);
    },
    [setNodes, setEdges, edges]
  );

  const handleEdgeAddNode = useCallback((edgeId: string) => {
    setSelectedEdgeId(edgeId);
    setShowNodeSelector(true);
  }, []);

  const handleNodeSelect = useCallback(
    (nodeType: string) => {
      handleAddNode(nodeType, selectedEdgeId || undefined);
    },
    [handleAddNode, selectedEdgeId]
  );

  const handleGenerate = () => {
    // Filter nodes to ensure they have required properties
    const validNodes = nodes.filter((node) => node.type && node.id);
    const result = generateBetterAuthCode(validNodes as any, edges);
    setCode(result);
  };

  const handleGenerateEnv = () => {
    // Filter nodes to ensure they have required properties
    const validNodes = nodes.filter((node) => node.type && node.id);
    const envTemplate = generateEnvTemplate(validNodes as any, edges);
    downloadFile(".env.example", envTemplate);
  };

  const handleLoadFromAuth = async () => {
    try {
      const authResponse = await fetch("/utils/auth.ts");
      if (authResponse.ok) {
        const authContent = await authResponse.text();
        const { nodes: newNodes, edges: newEdges } =
          generateNodesFromAuthFile(authContent);
        const layoutedNodes = getLayoutedNodes(newNodes, newEdges);
        setNodes(layoutedNodes);
        setEdges(newEdges);
      } else {
        alert("No auth.ts file found. Using default configuration.");
        const { nodes: newNodes, edges: newEdges } =
          generateNodesFromAuthFile();
        const layoutedNodes = getLayoutedNodes(newNodes, newEdges);
        setNodes(layoutedNodes);
        setEdges(newEdges);
      }
    } catch (error) {
      console.error("Error loading auth.ts:", error);
      alert("Error loading auth.ts file");
    }
  };

  const handleAutoLayout = () => {
    const layoutedNodes = getLayoutedNodes(nodes, edges);
    setNodes(layoutedNodes);
  };

  const handleSaveConfig = () => {
    // Filter nodes to ensure they have required properties
    const validNodes = nodes.filter((node) => node.type && node.id);
    const config = convertFlowNodesToPulseConfig(validNodes as any, edges);
    const configJson = JSON.stringify(config, null, 2);
    downloadFile(".better-auth-pulse.config.json", configJson);
  };

  const handleGenerateFromAuthInput = () => {
    if (!authInput.trim()) {
      alert("Please paste your auth.ts code first");
      return;
    }

    try {
      // Use the sophisticated parser from parseAuthToNodes.ts
      const { nodes: newNodes, edges: newEdges } =
        generateNodesFromAuthFile(authInput);
      const layoutedNodes = getLayoutedNodes(newNodes, newEdges);
      setNodes(layoutedNodes);
      setEdges(newEdges);
      setShowPreview(false);
      setAuthInput("");
    } catch (error) {
      console.error("Error parsing auth code:", error);
      alert("Error parsing auth.ts code. Please check the format.");
    }
  };

  // Helper functions for different preview modes
  const getCanvasToJson = () => {
    const validNodes = nodes.filter((node) => node.type && node.id);
    const config = convertFlowNodesToPulseConfig(validNodes as any, edges);
    return JSON.stringify(config, null, 2);
  };

  const getJsonToAuth = () => {
    const validNodes = nodes.filter((node) => node.type && node.id);
    return generateBetterAuthCode(validNodes as any, edges);
  };

  const getEnvTemplate = () => {
    const validNodes = nodes.filter((node) => node.type && node.id);
    return generateEnvTemplate(validNodes as any, edges);
  };

  const handleDownload = (filename: string, content: string) => {
    downloadFile(filename, content);
  };

  // Update preview content when nodes or edges change
  useEffect(() => {
    if (showPreview) {
      const validNodes = nodes.filter((node) => node.type && node.id);

      switch (previewMode) {
        case "canvas-to-json":
          const config = convertFlowNodesToPulseConfig(
            validNodes as any,
            edges
          );
          setPreviewContent(JSON.stringify(config, null, 2));
          break;
        case "json-to-auth":
        case "generate-auth":
          setPreviewContent(generateBetterAuthCode(validNodes as any, edges));
          break;
        case "organization-client":
          setPreviewContent(
            generateOrganizationClient(validNodes as any, edges)
          );
          break;
        default:
          setPreviewContent("");
      }
    }
  }, [nodes, edges, showPreview, previewMode]);

  return (
    <div className="w-screen h-screen flex bg-gray-900">
      <Sidebar onAddNode={handleAddNode} />
      <div className="flex-1 bg-gray-800" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
        >
          <Background color="#374151" gap={16} />
          <Controls className="bg-gray-700 border-gray-600" />
        </ReactFlow>
      </div>
      <div className="w-1/4 p-4 bg-gray-800 border-l border-gray-700 flex flex-col">
        {!showPreview ? (
          <div className="flex flex-col overflow-y-scroll h-full">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-2">Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setShowPreview(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg text-center font-medium transition-colors"
                >
                  Preview & Export
                </button>
                <button
                  onClick={handleAutoLayout}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Auto Layout
                </button>
              </div>
            </div>

            <div className="flex-1 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                Canvas Status
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Nodes:</span>
                  <span className="text-white font-medium">{nodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Edges:</span>
                  <span className="text-white font-medium">{edges.length}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                Click "Preview & Export" to see conversion options and export
                your configuration.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Preview & Export
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Mode Selection */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setPreviewMode("canvas-to-json")}
                  className={`px-4 py-3 text-sm rounded-lg font-medium transition-colors ${
                    previewMode === "canvas-to-json"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Canvas → JSON
                </button>
                <button
                  onClick={() => setPreviewMode("json-to-auth")}
                  className={`px-4 py-3 text-sm rounded-lg font-medium transition-colors ${
                    previewMode === "json-to-auth"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  JSON → Auth.ts
                </button>
                <button
                  onClick={() => setPreviewMode("load-auth")}
                  className={`px-4 py-3 text-sm rounded-lg font-medium transition-colors ${
                    previewMode === "load-auth"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Load Auth.ts
                </button>
                <button
                  onClick={() => setPreviewMode("generate-auth")}
                  className={`px-4 py-3 text-sm rounded-lg font-medium transition-colors ${
                    previewMode === "generate-auth"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Generate Auth.ts
                </button>
                <button
                  onClick={() => setPreviewMode("organization-client")}
                  className={`px-4 py-3 text-sm rounded-lg font-medium transition-colors col-span-2 ${
                    previewMode === "organization-client"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Organization Client
                </button>
              </div>
            </div>

            {/* Content based on mode */}
            <div className="flex-1 flex flex-col">
              {previewMode === "canvas-to-json" && (
                <div className="flex-1 flex flex-col">
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() =>
                        handleDownload("config.json", previewContent)
                      }
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Download JSON
                    </button>
                    <button
                      onClick={() => setCode(previewContent)}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Copy to Preview
                    </button>
                  </div>
                  <pre className="flex-1 bg-gray-900 p-4 rounded-lg border border-gray-700 text-xs overflow-auto text-gray-300 font-mono">
                    {previewContent}
                  </pre>
                </div>
              )}

              {previewMode === "json-to-auth" && (
                <div className="flex-1 flex flex-col">
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => handleDownload("auth.ts", previewContent)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Download auth.ts
                    </button>
                    <button
                      onClick={() =>
                        handleDownload(".env.example", getEnvTemplate())
                      }
                      className="bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Download .env
                    </button>
                  </div>
                  <pre className="flex-1 bg-gray-900 p-4 rounded-lg border border-gray-700 text-xs overflow-auto text-gray-300 font-mono">
                    {previewContent}
                  </pre>
                </div>
              )}

              {previewMode === "load-auth" && (
                <div className="flex-1 flex flex-col">
                  <div className="mb-3">
                    <button
                      onClick={handleLoadFromAuth}
                      className="bg-purple-600 text-white px-3 py-2 rounded text-sm w-full mb-2"
                    >
                      Load from /utils/auth.ts
                    </button>
                    <p className="text-xs text-gray-600 mb-3">
                      Paste your auth.ts code below to generate nodes:
                    </p>
                    <textarea
                      value={authInput}
                      onChange={(e) => setAuthInput(e.target.value)}
                      placeholder="Paste your entire auth.ts file content here..."
                      className="w-full h-32 p-2 border rounded text-xs font-mono mb-3"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleGenerateFromAuthInput}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm flex-1"
                      >
                        Generate Nodes
                      </button>
                      <button
                        onClick={() => setAuthInput("")}
                        className="bg-gray-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {previewMode === "generate-auth" && (
                <div className="flex-1 flex flex-col">
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => {
                        setCode(previewContent);
                        handleDownload("auth.ts", previewContent);
                      }}
                      className="bg-black text-white px-3 py-1 rounded text-sm"
                    >
                      Generate & Download
                    </button>
                    <button
                      onClick={() => setCode(previewContent)}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Preview Only
                    </button>
                  </div>
                  <pre className="flex-1 bg-white p-3 rounded border text-xs overflow-auto">
                    {code || previewContent}
                  </pre>
                </div>
              )}

              {previewMode === "organization-client" && (
                <div className="flex-1 flex flex-col">
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() =>
                        handleDownload("organization-client.ts", previewContent)
                      }
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Download Client
                    </button>
                    <button
                      onClick={() => setCode(previewContent)}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Copy to Preview
                    </button>
                  </div>
                  <pre className="flex-1 bg-gray-900 p-4 rounded-lg border border-gray-700 text-xs overflow-auto text-gray-300 font-mono">
                    {previewContent}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Node Selector Modal */}
      <NodeSelectorModal
        isOpen={showNodeSelector}
        onClose={() => {
          setShowNodeSelector(false);
          setSelectedEdgeId(null);
        }}
        onSelectNode={handleNodeSelect}
      />
    </div>
  );
}

// Node Selector Modal Component
const NodeSelectorModal = ({
  isOpen,
  onClose,
  onSelectNode,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectNode: (nodeType: string) => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Add New Node</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {nodeTypesForSidebar.map((nodeType) => (
            <button
              key={nodeType.type}
              onClick={() => onSelectNode(nodeType.type)}
              className="p-4 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-left transition-colors group"
            >
              <div className="flex items-start space-x-3">
                <div
                  className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                  style={{
                    backgroundColor:
                      nodeType.category === "authentication"
                        ? "#10b981"
                        : nodeType.category === "database"
                        ? "#3b82f6"
                        : nodeType.category === "plugins"
                        ? "#8b5cf6"
                        : nodeType.category === "security"
                        ? "#ef4444"
                        : nodeType.category === "configuration"
                        ? "#eab308"
                        : "#6b7280",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-white group-hover:text-gray-100 transition-colors">
                    {nodeType.label}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 leading-relaxed">
                    {nodeType.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Starter() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
    </ReactFlowProvider>
  );
}
