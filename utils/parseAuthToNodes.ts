import { Node, Edge } from "./convertPulseConfigToFlowNodes";

interface ParsedAuthConfig {
  hasDatabase?: boolean;
  databaseProvider?: string;
  hasEmailPassword?: boolean;
  emailPasswordConfig?: any;
  hasEmailVerification?: boolean;
  emailVerificationConfig?: any;
  socialProviders?: string[];
  hasAccountLinking?: boolean;
  accountLinkingConfig?: any;
  hasRateLimit?: boolean;
  rateLimitConfig?: any;
  hasAdvanced?: boolean;
  advancedConfig?: any;
}

function parseAuthFileContent(content: string): ParsedAuthConfig {
  const config: ParsedAuthConfig = {};
  
  // Check for database configuration
  if (content.includes('prismaAdapter')) {
    config.hasDatabase = true;
    const providerMatch = content.match(/provider:\s*["'](\w+)["']/);
    config.databaseProvider = providerMatch ? providerMatch[1] : 'sqlite';
  }
  
  // Check for email and password
  if (content.includes('emailAndPassword')) {
    config.hasEmailPassword = true;
    const emailPasswordMatch = content.match(/emailAndPassword:\s*{([^}]+)}/s);
    if (emailPasswordMatch) {
      const configText = emailPasswordMatch[1];
      config.emailPasswordConfig = {
        minLength: extractValue(configText, 'minPasswordLength') || 8,
        maxLength: extractValue(configText, 'maxPasswordLength') || 128,
        requireVerification: extractBooleanValue(configText, 'requireEmailVerification') || false,
        autoSignIn: extractBooleanValue(configText, 'autoSignIn') || true,
        resetTokenExpiresIn: extractValue(configText, 'resetPasswordTokenExpiresIn') || 3600
      };
    }
  }
  
  // Check for email verification
  if (content.includes('emailVerification')) {
    config.hasEmailVerification = true;
    const emailVerificationMatch = content.match(/emailVerification:\s*{([^}]+)}/s);
    if (emailVerificationMatch) {
      const configText = emailVerificationMatch[1];
      config.emailVerificationConfig = {
        sendOnSignUp: extractBooleanValue(configText, 'sendOnSignUp') || true,
        sendOnSignIn: extractBooleanValue(configText, 'sendOnSignIn') || false,
        autoSignInAfterVerification: extractBooleanValue(configText, 'autoSignInAfterVerification') || true,
        tokenExpiresIn: extractValue(configText, 'tokenExpiresIn') || 3600
      };
    }
  }
  
  // Check for social providers
  config.socialProviders = [];
  if (content.includes('google:')) config.socialProviders.push('google');
  if (content.includes('github:')) config.socialProviders.push('github');
  
  // Check for account linking
  if (content.includes('accountLinking')) {
    config.hasAccountLinking = true;
    const accountMatch = content.match(/accountLinking:\s*{([^}]+)}/s);
    if (accountMatch) {
      const configText = accountMatch[1];
      config.accountLinkingConfig = {
        trustedProviders: extractArrayValue(configText, 'trustedProviders') || [],
        allowDifferentEmails: extractBooleanValue(configText, 'allowDifferentEmails') || false
      };
    }
  }
  
  // Check for rate limiting
  if (content.includes('rateLimit')) {
    config.hasRateLimit = true;
    const rateLimitMatch = content.match(/rateLimit:\s*{([^}]+)}/s);
    if (rateLimitMatch) {
      const configText = rateLimitMatch[1];
      config.rateLimitConfig = {
        window: extractValue(configText, 'window') || 60,
        maxRequests: extractValue(configText, 'max') || 100,
        customRules: extractObjectValue(configText, 'customRules') || {}
      };
    }
  }
  
  // Check for advanced options
  if (content.includes('useSecureCookies') || content.includes('cookiePrefix')) {
    config.hasAdvanced = true;
    config.advancedConfig = {
      useSecureCookies: true,
      httpOnlyCookies: true,
      secureCookies: true
    };
  }
  
  return config;
}

function extractValue(text: string, key: string): number | null {
  const match = text.match(new RegExp(`${key}:\\s*(\\d+)`));
  return match ? parseInt(match[1]) : null;
}

function extractBooleanValue(text: string, key: string): boolean | null {
  const match = text.match(new RegExp(`${key}:\\s*(true|false)`));
  return match ? match[1] === 'true' : null;
}

function extractArrayValue(text: string, key: string): string[] | null {
  const match = text.match(new RegExp(`${key}:\\s*\\[([^\\]]+)\\]`));
  if (match) {
    return match[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
  }
  return null;
}

function extractObjectValue(text: string, key: string): any | null {
  const match = text.match(new RegExp(`${key}:\\s*({[^}]+})`));
  if (match) {
    try {
      return JSON.parse(match[1].replace(/(\w+):/g, '"$1":'));
    } catch {
      return {};
    }
  }
  return null;
}

export function generateNodesFromAuthFile(authFileContent?: string): { nodes: Node[], edges: Edge[] } {
  if (!authFileContent) {
    // Return just the auth starter if no auth file exists
    return {
      nodes: [{
        id: "1",
        type: "authStarter",
        position: { x: 250, y: 50 },
        data: { label: "Auth Starter" }
      }],
      edges: []
    };
  }
  
  const config = parseAuthFileContent(authFileContent);
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let nodeId = 1;
  let yPosition = 0;
  
  // Always add auth starter
  nodes.push({
    id: nodeId.toString(),
    type: "authStarter",
    position: { x: 0, y: yPosition },
    data: { label: "Auth Start" }
  });
  const authStarterId = nodeId.toString();
  nodeId++;
  yPosition += 150;
  
  // Add database chain if present
  if (config.hasDatabase) {
    const databaseId = nodeId.toString();
    nodes.push({
      id: databaseId,
      type: "database",
      position: { x: 0, y: yPosition },
      data: { label: "Database" }
    });
    edges.push({
      id: `e${authStarterId}-${databaseId}`,
      source: authStarterId,
      target: databaseId,
      animated: true
    });
    nodeId++;
    yPosition += 150;
    
    const prismaId = nodeId.toString();
    nodes.push({
      id: prismaId,
      type: "prisma",
      position: { x: 0, y: yPosition },
      data: { label: "Prisma Adapter" }
    });
    edges.push({
      id: `e${databaseId}-${prismaId}`,
      source: databaseId,
      target: prismaId,
      animated: true
    });
    nodeId++;
    yPosition += 150;
    
    const providerId = nodeId.toString();
    nodes.push({
      id: providerId,
      type: "provider",
      position: { x: 0, y: yPosition },
      data: { label: "DB Provider" }
    });
    edges.push({
      id: `e${prismaId}-${providerId}`,
      source: prismaId,
      target: providerId,
      animated: true
    });
    nodeId++;
    yPosition += 150;
    
    const dbTypeId = nodeId.toString();
    nodes.push({
      id: dbTypeId,
      type: config.databaseProvider || "sqlite",
      position: { x: 0, y: yPosition },
      data: { label: (config.databaseProvider || "sqlite").toUpperCase() }
    });
    edges.push({
      id: `e${providerId}-${dbTypeId}`,
      source: providerId,
      target: dbTypeId,
      animated: true
    });
    nodeId++;
  }
  
  // Add email authentication if present
  if (config.hasEmailPassword) {
    const emailAuthId = nodeId.toString();
    nodes.push({
      id: emailAuthId,
      type: "emailAuth",
      position: { x: 400, y: 0 },
      data: {
        label: "Email + Password Auth",
        ...config.emailPasswordConfig
      }
    });
    edges.push({
      id: `e${authStarterId}-${emailAuthId}`,
      source: authStarterId,
      target: emailAuthId,
      animated: true
    });
    nodeId++;
    
    // Add email verification if present
    if (config.hasEmailVerification) {
      const emailVerificationId = nodeId.toString();
      nodes.push({
        id: emailVerificationId,
        type: "emailVerification",
        position: { x: 600, y: 0 },
        data: {
          label: "Email Verification",
          ...config.emailVerificationConfig
        }
      });
      edges.push({
        id: `e${emailAuthId}-${emailVerificationId}`,
        source: emailAuthId,
        target: emailVerificationId,
        animated: true
      });
      nodeId++;
    }
    
    // Add rate limiting if present
    if (config.hasRateLimit) {
      const rateLimitId = nodeId.toString();
      nodes.push({
        id: rateLimitId,
        type: "rateLimit",
        position: { x: 400, y: 600 },
        data: {
          label: "Rate Limiting",
          ...config.rateLimitConfig
        }
      });
      edges.push({
        id: `e${emailAuthId}-${rateLimitId}`,
        source: emailAuthId,
        target: rateLimitId,
        animated: true
      });
      nodeId++;
    }
  }
  
  // Add social login if present
  if (config.socialProviders && config.socialProviders.length > 0) {
    const socialLoginId = nodeId.toString();
    nodes.push({
      id: socialLoginId,
      type: "socialLogin",
      position: { x: 400, y: 200 },
      data: { label: "Social Login Providers" }
    });
    edges.push({
      id: `e${authStarterId}-${socialLoginId}`,
      source: authStarterId,
      target: socialLoginId,
      animated: true
    });
    nodeId++;
    
    // Add individual social providers
    config.socialProviders.forEach((provider, index) => {
      const providerId = nodeId.toString();
      nodes.push({
        id: providerId,
        type: `oauth${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
        position: { x: 600 + (index * 200), y: 300 },
        data: { label: `${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth` }
      });
      edges.push({
        id: `e${socialLoginId}-${providerId}`,
        source: socialLoginId,
        target: providerId,
        animated: true
      });
      nodeId++;
    });
    
    // Add account linking if present
    if (config.hasAccountLinking) {
      const accountId = nodeId.toString();
      nodes.push({
        id: accountId,
        type: "account",
        position: { x: 600, y: 450 },
        data: {
          label: "Account Linking",
          ...config.accountLinkingConfig
        }
      });
      edges.push({
        id: `e${socialLoginId}-${accountId}`,
        source: socialLoginId,
        target: accountId,
        animated: true
      });
      nodeId++;
      
      // Add advanced options if present
      if (config.hasAdvanced) {
        const advancedId = nodeId.toString();
        nodes.push({
          id: advancedId,
          type: "advanced",
          position: { x: 600, y: 600 },
          data: {
            label: "Advanced Options",
            ...config.advancedConfig
          }
        });
        edges.push({
          id: `e${accountId}-${advancedId}`,
          source: accountId,
          target: advancedId,
          animated: true
        });
        nodeId++;
      }
    }
  }
  
  return { nodes, edges };
}

export async function loadAuthFileContent(): Promise<string | null> {
  try {
    const response = await fetch('/utils/auth.ts');
    if (response.ok) {
      return await response.text();
    }
  } catch (error) {
    console.log('No auth.ts file found, using default configuration');
  }
  return null;
}