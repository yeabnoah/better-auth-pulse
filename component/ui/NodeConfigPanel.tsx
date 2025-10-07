import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { X, Settings, Save } from "lucide-react";

interface ConfigField {
  key: string;
  label: string;
  type: "text" | "password" | "select" | "url";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  description?: string;
}

interface NodeConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  nodeType: string;
  currentConfig: { [key: string]: any };
  onSave: (config: { [key: string]: any }) => void;
}

const CONFIG_SCHEMAS: { [key: string]: ConfigField[] } = {
  oauthGoogle: [
    {
      key: "clientId",
      label: "Client ID",
      type: "text",
      placeholder: "Enter Google Client ID",
      required: true,
      description: "Google OAuth Client ID from Google Cloud Console",
    },
    {
      key: "clientSecret",
      label: "Client Secret",
      type: "password",
      placeholder: "Enter Google Client Secret",
      required: true,
      description: "Google OAuth Client Secret",
    },
  ],
  oauthGithub: [
    {
      key: "clientId",
      label: "Client ID",
      type: "text",
      placeholder: "Enter GitHub Client ID",
      required: true,
      description: "GitHub OAuth App Client ID",
    },
    {
      key: "clientSecret",
      label: "Client Secret",
      type: "password",
      placeholder: "Enter GitHub Client Secret",
      required: true,
      description: "GitHub OAuth App Client Secret",
    },
  ],
  oauthDiscord: [
    {
      key: "clientId",
      label: "Client ID",
      type: "text",
      placeholder: "Enter Discord Client ID",
      required: true,
      description: "Discord OAuth2 Application Client ID",
    },
    {
      key: "clientSecret",
      label: "Client Secret",
      type: "password",
      placeholder: "Enter Discord Client Secret",
      required: true,
      description: "Discord OAuth2 Application Client Secret",
    },
  ],
  oauthTwitter: [
    {
      key: "clientId",
      label: "Client ID",
      type: "text",
      placeholder: "Enter Twitter Client ID",
      required: true,
      description: "Twitter OAuth2 Client ID",
    },
    {
      key: "clientSecret",
      label: "Client Secret",
      type: "password",
      placeholder: "Enter Twitter Client Secret",
      required: true,
      description: "Twitter OAuth2 Client Secret",
    },
  ],
  database: [
    {
      key: "provider",
      label: "Database Provider",
      type: "select",
      required: true,
      options: [
        { value: "postgresql", label: "PostgreSQL" },
        { value: "mysql", label: "MySQL" },
        { value: "sqlite", label: "SQLite" },
        { value: "mongodb", label: "MongoDB" },
      ],
      description: "Select your database provider",
    },
    {
      key: "url",
      label: "Database URL",
      type: "url",
      placeholder: "postgresql://user:password@localhost:5432/dbname",
      required: true,
      description: "Database connection URL",
    },
  ],
  prismaDatabase: [
    {
      key: "provider",
      label: "Database Provider",
      type: "select",
      required: true,
      options: [
        { value: "postgresql", label: "PostgreSQL" },
        { value: "mysql", label: "MySQL" },
        { value: "sqlite", label: "SQLite" },
      ],
      description: "Select your database provider for Prisma",
    },
    {
      key: "url",
      label: "Database URL",
      type: "url",
      placeholder: "postgresql://user:password@localhost:5432/dbname",
      required: true,
      description: "Database connection URL",
    },
  ],
  emailResend: [
    {
      key: "apiKey",
      label: "Resend API Key",
      type: "password",
      placeholder: "Enter Resend API Key",
      required: true,
      description: "API key from Resend dashboard",
    },
    {
      key: "fromEmail",
      label: "From Email",
      type: "text",
      placeholder: "noreply@yourdomain.com",
      required: true,
      description: "Default sender email address",
    },
  ],
  emailSendGrid: [
    {
      key: "apiKey",
      label: "SendGrid API Key",
      type: "password",
      placeholder: "Enter SendGrid API Key",
      required: true,
      description: "API key from SendGrid dashboard",
    },
    {
      key: "fromEmail",
      label: "From Email",
      type: "text",
      placeholder: "noreply@yourdomain.com",
      required: true,
      description: "Default sender email address",
    },
  ],
  session: [
    {
      key: "expiresIn",
      label: "Session Expiry",
      type: "select",
      required: true,
      options: [
        { value: "7d", label: "7 days" },
        { value: "30d", label: "30 days" },
        { value: "90d", label: "90 days" },
        { value: "1y", label: "1 year" },
      ],
      description: "How long sessions should last",
    },
    {
      key: "updateAge",
      label: "Update Age",
      type: "select",
      required: true,
      options: [
        { value: "24h", label: "24 hours" },
        { value: "7d", label: "7 days" },
        { value: "30d", label: "30 days" },
      ],
      description: "How often to update session age",
    },
  ],
  forgotPassword: [
    {
      key: "resetTokenExpiresIn",
      label: "Reset Token Expires In",
      type: "select",
      required: true,
      options: [
        { value: "3600", label: "1 hour" },
        { value: "7200", label: "2 hours" },
        { value: "86400", label: "24 hours" },
        { value: "604800", label: "7 days" },
      ],
      description: "How long the password reset token should be valid",
    },
    {
      key: "requireEmailVerification",
      label: "Require Email Verification",
      type: "select",
      required: true,
      options: [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ],
      description:
        "Whether to require email verification before password reset",
    },
  ],
  emailVerification: [
    {
      key: "sendOnSignUp",
      label: "Send on Sign Up",
      type: "select",
      required: true,
      options: [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ],
      description: "Send verification email when user signs up",
    },
    {
      key: "sendOnSignIn",
      label: "Send on Sign In",
      type: "select",
      required: true,
      options: [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ],
      description: "Send verification email when user signs in",
    },
    {
      key: "autoSignInAfterVerification",
      label: "Auto Sign In After Verification",
      type: "select",
      required: true,
      options: [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ],
      description: "Automatically sign in user after email verification",
    },
    {
      key: "tokenExpiresIn",
      label: "Token Expires In",
      type: "select",
      required: true,
      options: [
        { value: "3600", label: "1 hour" },
        { value: "7200", label: "2 hours" },
        { value: "86400", label: "24 hours" },
        { value: "604800", label: "7 days" },
      ],
      description: "How long the verification token should be valid",
    },
  ],
};

export function NodeConfigPanel({
  isOpen,
  onClose,
  nodeType,
  currentConfig,
  onSave,
}: NodeConfigPanelProps) {
  const [config, setConfig] = useState<{ [key: string]: any }>(
    currentConfig || {}
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const fields = CONFIG_SCHEMAS[nodeType] || [];

  const handleFieldChange = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const validateConfig = () => {
    const newErrors: { [key: string]: string } = {};

    fields.forEach((field) => {
      if (
        field.required &&
        (!config[field.key] || config[field.key].trim() === "")
      ) {
        newErrors[field.key] = `${field.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateConfig()) {
      onSave(config);
      onClose();
    }
  };

  const renderField = (field: ConfigField) => {
    const hasError = !!errors[field.key];

    switch (field.type) {
      case "select":
        return (
          <Select
            value={config[field.key] || ""}
            onValueChange={(value) => handleFieldChange(field.key, value)}
          >
            <SelectTrigger className={hasError ? "border-red-500" : ""}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "password":
        return (
          <Input
            type="password"
            value={config[field.key] || ""}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={hasError ? "border-red-500" : ""}
          />
        );

      case "url":
        return (
          <Input
            type="url"
            value={config[field.key] || ""}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={hasError ? "border-red-500" : ""}
          />
        );

      default:
        return (
          <Input
            type="text"
            value={config[field.key] || ""}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={hasError ? "border-red-500" : ""}
          />
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configure{" "}
            {nodeType
              .replace("oauth", "")
              .replace(/([A-Z])/g, " $1")
              .trim()}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {fields.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                No configuration options available for this node type.
              </p>
            </div>
          ) : (
            <>
              {fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key} className="text-sm font-medium">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  {renderField(field)}
                  {field.description && (
                    <p className="text-xs text-muted-foreground">
                      {field.description}
                    </p>
                  )}
                  {errors[field.key] && (
                    <p className="text-xs text-red-500">{errors[field.key]}</p>
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Configuration
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
