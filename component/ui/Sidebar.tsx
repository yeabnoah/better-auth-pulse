import { useState } from "react";
import {
  NODE_TYPES_FOR_SIDEBAR,
  CATEGORY_DOT_COLORS,
} from "../types/nodeTypes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { ThemeToggle } from "../../components/theme-toggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  DatabaseIcon,
  LinkIcon,
  LockIcon,
  PlugIcon,
  SearchIcon,
} from "lucide-react";

interface SidebarProps {
  onAddNode: (nodeType: string) => void;
}

interface CategoryCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  isSelected: boolean;
  onClick: () => void;
}

function CategoryCard({
  title,
  description,
  icon,
  color,
  isSelected,
  onClick,
}: CategoryCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-all py-1.5 duration-200 group hover:shadow-md ${
        isSelected ? "ring-2 ring-primary shadow-lg" : "hover:shadow-sm"
      }`}
    >
      <CardContent className="">
        <div className="flex items-start space-x-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${color} ${
              isSelected ? "ring-2 ring-primary" : ""
            }`}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm mb-1 group-hover:text-foreground">
              {title}
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Sidebar({ onAddNode }: SidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleClick = (nodeType: string) => {
    onAddNode(nodeType);
  };

  const categoryConfig = {
    database: {
      title: "Database",
      description:
        "Connect and manage your app's data with tables, fields, and queries.",
      icon: <DatabaseIcon className="w-6 h-6" />,
      color: "bg-blue-600",
    },
    integration: {
      title: "Integration",
      description:
        "Link external services like APIs, webhooks, or third-party tools to your app.",
      icon: <LinkIcon className="w-6 h-6" />,
      color: "bg-purple-600",
    },
    auth: {
      title: "Auth",
      description:
        "Add login, signup, roles, and secure access control to your application.",
      icon: <LockIcon className="w-6 h-6" />,
      color: "bg-green-600",
    },
    plugin: {
      title: "Plugin",
      description:
        "Extend functionality with reusable custom modules or third-party add-ons.",
      icon: <PlugIcon className="w-6 h-6" />,
      color: "bg-orange-600",
    },
  };

  // Group nodes by category
  const groupedNodes = NODE_TYPES_FOR_SIDEBAR.reduce((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = [];
    }
    acc[node.category].push(node);
    return acc;
  }, {} as Record<string, typeof NODE_TYPES_FOR_SIDEBAR>);

  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-sidebar-foreground mb-2">
              Better Auth Pulse
            </h1>
            <p className="text-sm text-muted-foreground">
              Build authentication flows visually
            </p>
          </div>
          <ThemeToggle />
        </div>
        <Separator />
      </div>

      {/* Category Cards */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">
          {Object.entries(categoryConfig).map(([categoryKey, config]) => (
            <CategoryCard
              key={categoryKey}
              title={config.title}
              description={config.description}
              icon={config.icon}
              color={config.color}
              isSelected={selectedCategory === categoryKey}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === categoryKey ? null : categoryKey
                )
              }
            />
          ))}
        </div>

        {/* Category Components Modal */}
        <Dialog
          open={!!selectedCategory}
          onOpenChange={() => setSelectedCategory(null)}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedCategory &&
                  categoryConfig[
                    selectedCategory as keyof typeof categoryConfig
                  ]?.icon}
                {selectedCategory &&
                  categoryConfig[
                    selectedCategory as keyof typeof categoryConfig
                  ]?.title}{" "}
                Components
                <Badge variant="secondary" className="text-xs">
                  {selectedCategory && groupedNodes[selectedCategory]?.length}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {selectedCategory &&
                  categoryConfig[
                    selectedCategory as keyof typeof categoryConfig
                  ]?.description}
              </DialogDescription>
            </DialogHeader>

            {selectedCategory && groupedNodes[selectedCategory] && (
              <div className="grid gap-2 mt-4">
                {groupedNodes[selectedCategory].map((nodeType) => (
                  <Card
                    key={nodeType.type}
                    className="cursor-pointer hover:shadow-sm transition-all duration-200 group"
                    draggable
                    onDragStart={(event) => onDragStart(event, nodeType.type)}
                    onClick={() => {
                      handleClick(nodeType.type);
                      setSelectedCategory(null); // Close modal after selection
                    }}
                  >
                    <CardContent className="">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor:
                              CATEGORY_DOT_COLORS[
                                nodeType.category as keyof typeof CATEGORY_DOT_COLORS
                              ] || CATEGORY_DOT_COLORS.default,
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground group-hover:text-primary">
                            {nodeType.label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {nodeType.description}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {nodeType.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Footer with AI Search */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/50">
        <Card className="cursor-pointer hover:shadow-sm transition-all duration-200">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <SearchIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Ask AI</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
