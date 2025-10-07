"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import {
  Database,
  Shield,
  Mail,
  Users,
  Key,
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { Node, Edge } from "@xyflow/react";

interface PreviewPanelProps {
  nodes: Node[];
  edges: Edge[];
  onReset?: () => void;
}

const getNodeIcon = (nodeType: string) => {
  switch (nodeType) {
    case "authStarter":
      return <Shield className="w-4 h-4" />;
    case "database":
    case "prismaDatabase":
      return <Database className="w-4 h-4" />;
    case "emailAuth":
    case "emailVerification":
    case "emailResend":
      return <Mail className="w-4 h-4" />;
    case "signin":
    case "signup":
    case "forgotPassword":
    case "resetPassword":
    case "profile":
    case "logout":
      return <Users className="w-4 h-4" />;
    case "session":
      return <Key className="w-4 h-4" />;
    default:
      return <Settings className="w-4 h-4" />;
  }
};

const getNodeStatus = (node: Node) => {
  const hasConfig =
    node.data?.config && Object.keys(node.data.config).length > 0;
  const isConfigurable =
    node.type?.startsWith("oauth") ||
    node.type?.includes("database") ||
    node.type?.includes("email") ||
    node.type === "session" ||
    node.type === "forgotPassword" ||
    node.type === "emailVerification";

  if (!isConfigurable) return null;

  return hasConfig ? (
    <CheckCircle className="w-3 h-3 text-green-500" />
  ) : (
    <AlertCircle className="w-3 h-3 text-amber-500" />
  );
};

const getNodeCategory = (nodeType: string) => {
  if (nodeType?.startsWith("oauth")) return "OAuth";
  if (nodeType?.includes("database")) return "Database";
  if (nodeType?.includes("email")) return "Email";
  if (
    [
      "signin",
      "signup",
      "forgotPassword",
      "resetPassword",
      "profile",
      "logout",
    ].includes(nodeType)
  )
    return "Authentication";
  if (nodeType === "session") return "Session";
  if (nodeType === "authStarter") return "Core";
  return "Other";
};

const getNodeColor = (category: string) => {
  switch (category) {
    case "OAuth":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "Database":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "Email":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "Authentication":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "Session":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "Core":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

export function PreviewPanel({ nodes, edges, onReset }: PreviewPanelProps) {
  const configuredNodes = nodes.filter(
    (node) => node.data?.config && Object.keys(node.data.config).length > 0
  );

  const unconfiguredNodes = nodes.filter((node) => {
    const isConfigurable =
      node.type?.startsWith("oauth") ||
      node.type?.includes("database") ||
      node.type?.includes("email") ||
      node.type === "session" ||
      node.type === "forgotPassword" ||
      node.type === "emailVerification";
    return (
      isConfigurable &&
      (!node.data?.config || Object.keys(node.data.config).length === 0)
    );
  });

  const nodeCategories = nodes.reduce((acc, node) => {
    const category = getNodeCategory(node.type || "");
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(node);
    return acc;
  }, {} as Record<string, Node[]>);

  return (
    <div className="h-full bg-background border-l border-border">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Configuration Preview</h3>
          <Badge variant="outline" className="text-xs">
            {nodes.length} nodes, {edges.length} connections
          </Badge>
        </div>

        {/* Status Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="w-4 h-4" />
              Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Configured
              </span>
              <Badge variant="secondary" className="text-xs">
                {configuredNodes.length}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-3 h-3 text-amber-500" />
                Needs Configuration
              </span>
              <Badge variant="outline" className="text-xs">
                {unconfiguredNodes.length}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Node Categories */}
        <div className="space-y-3">
          {Object.entries(nodeCategories).map(([category, categoryNodes]) => (
            <Card key={category}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  {getNodeIcon(categoryNodes[0]?.type || "")}
                  {category}
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getNodeColor(category)}`}
                  >
                    {categoryNodes.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categoryNodes.map((node) => {
                  const category = getNodeCategory(node.type || "");
                  const hasConfig =
                    node.data?.config &&
                    Object.keys(node.data.config).length > 0;

                  return (
                    <div
                      key={node.id}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted/80 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {getNodeIcon(node.type || "")}
                        <span className="text-sm font-medium">
                          {node.data?.label || node.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getNodeStatus(node)}
                        <Badge
                          variant={hasConfig ? "default" : "outline"}
                          className="text-xs"
                        >
                          {hasConfig ? "Ready" : "Configure"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Configuration Summary */}
        {configuredNodes.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Configuration Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {configuredNodes.map((node) => (
                <div key={node.id} className="text-xs space-y-1">
                  <div className="font-medium text-foreground">
                    {node.data?.label || node.id}
                  </div>
                  <div className="text-muted-foreground">
                    {Object.entries(node.data?.config || {}).map(
                      ([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key}:</span>
                          <span className="font-mono text-xs">
                            {typeof value === "string" && value.length > 20
                              ? `${value.substring(0, 20)}...`
                              : String(value)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                  <Separator className="my-1" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              disabled={nodes.length === 0}
            >
              <Database className="w-3 h-3 mr-2" />
              Generate Database Schema
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              disabled={configuredNodes.length === 0}
            >
              <Settings className="w-3 h-3 mr-2" />
              Export Configuration
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="w-full justify-start"
              onClick={onReset}
              disabled={nodes.length === 0}
            >
              <AlertCircle className="w-3 h-3 mr-2" />
              Reset & Start Fresh
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
