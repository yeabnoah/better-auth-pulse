"use client";
import { useState, useEffect } from "react";
import { generateNodesFromAuthFile } from "../utils/parseAuthToNodes";
import { Node, Edge } from "../utils/convertPulseConfigToFlowNodes";
import { readAuthFile, findAuthFiles, AUTH_FILE_PATTERNS } from "../utils/fileSystemAccess";

interface AuthExtractorProps {
  onAuthExtracted: (nodes: Node[], edges: Edge[]) => void;
  onClose: () => void;
}

interface ExtractedConfig {
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

export default function AuthExtractor({ onAuthExtracted, onClose }: AuthExtractorProps) {
  const [step, setStep] = useState<'locate' | 'extract' | 'preview' | 'complete'>('locate');
  const [authPath, setAuthPath] = useState('');
  const [authContent, setAuthContent] = useState('');
  const [extractedConfig, setExtractedConfig] = useState<ExtractedConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foundFiles, setFoundFiles] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);

  // Auto-scan for auth files on component mount
  useEffect(() => {
    scanForAuthFiles();
  }, []);

  const scanForAuthFiles = async () => {
    setScanning(true);
    try {
      const files = await findAuthFiles();
      setFoundFiles(files);
    } catch (error) {
      console.error('Error scanning for auth files:', error);
    } finally {
      setScanning(false);
    }
  };

  const handlePathSelect = (path: string) => {
    setAuthPath(path);
  };

  const handleManualPath = () => {
    if (!authPath.trim()) {
      setError('Please enter a valid path');
      return;
    }
    extractAuthContent();
  };

  const extractAuthContent = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await readAuthFile(authPath);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to read auth file');
      }
      
      setAuthContent(result.content!);
      
      // Extract configuration from the content
      const config = parseAuthConfiguration(result.content!);
      setExtractedConfig(config);
      
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract auth configuration');
    } finally {
      setLoading(false);
    }
  };

  const parseAuthConfiguration = (content: string): ExtractedConfig => {
    const config: ExtractedConfig = {};

    // Database configuration
    if (content.includes('prismaAdapter')) {
      config.hasDatabase = true;
      const providerMatch = content.match(/provider:\s*["'](\w+)["']/);
      config.databaseProvider = providerMatch ? providerMatch[1] : 'sqlite';
    }

    // Email and password
    if (content.includes('emailAndPassword')) {
      config.hasEmailPassword = true;
      const emailPasswordMatch = content.match(/emailAndPassword:\s*\{([^}]+)\}/);
      if (emailPasswordMatch) {
        const configText = emailPasswordMatch[1];
        config.emailPasswordConfig = {
          enabled: true,
          minLength: extractValue(configText, 'minPasswordLength') || 8,
          maxLength: extractValue(configText, 'maxPasswordLength') || 128,
          requireVerification: extractBooleanValue(configText, 'requireEmailVerification') || false,
          autoSignIn: extractBooleanValue(configText, 'autoSignIn') || true
        };
      }
    }

    // Email verification
    if (content.includes('emailVerification')) {
      config.hasEmailVerification = true;
      const emailVerificationMatch = content.match(/emailVerification:\s*\{([^}]+)\}/);
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

    // Social providers
    config.socialProviders = [];
    if (content.includes('google:')) config.socialProviders.push('google');
    if (content.includes('github:')) config.socialProviders.push('github');
    if (content.includes('discord:')) config.socialProviders.push('discord');
    if (content.includes('facebook:')) config.socialProviders.push('facebook');

    // Account linking
    if (content.includes('accountLinking')) {
      config.hasAccountLinking = true;
      const accountMatch = content.match(/accountLinking:\s*\{([^}]+)\}/);
      if (accountMatch) {
        const configText = accountMatch[1];
        config.accountLinkingConfig = {
          enabled: true,
          trustedProviders: extractArrayValue(configText, 'trustedProviders') || [],
          allowDifferentEmails: extractBooleanValue(configText, 'allowDifferentEmails') || false
        };
      }
    }

    // Rate limiting
    if (content.includes('rateLimit')) {
      config.hasRateLimit = true;
      const rateLimitMatch = content.match(/rateLimit:\s*\{([^}]+)\}/);
      if (rateLimitMatch) {
        const configText = rateLimitMatch[1];
        config.rateLimitConfig = {
          window: extractValue(configText, 'window') || 60,
          maxRequests: extractValue(configText, 'max') || 100
        };
      }
    }

    // Advanced options
    if (content.includes('useSecureCookies') || content.includes('cookiePrefix')) {
      config.hasAdvanced = true;
      config.advancedConfig = {
        useSecureCookies: true,
        httpOnlyCookies: true,
        secureCookies: true
      };
    }

    return config;
  };

  const extractValue = (text: string, key: string): number | null => {
    const match = text.match(new RegExp(`${key}:\\s*(\\d+)`));
    return match ? parseInt(match[1]) : null;
  };

  const extractBooleanValue = (text: string, key: string): boolean | null => {
    const match = text.match(new RegExp(`${key}:\\s*(true|false)`));
    return match ? match[1] === 'true' : null;
  };

  const extractArrayValue = (text: string, key: string): string[] | null => {
    const match = text.match(new RegExp(`${key}:\\s*\\[([^\\]]+)\\]`));
    if (match) {
      return match[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
    }
    return null;
  };

  const handleGenerateNodes = () => {
    if (!authContent) return;
    
    try {
      const { nodes, edges } = generateNodesFromAuthFile(authContent);
      onAuthExtracted(nodes, edges);
      setStep('complete');
    } catch (err) {
      setError('Failed to generate nodes from auth configuration');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'locate':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Locate your auth.ts file</h3>
              <p className="text-gray-400 mb-6">
                Select a common location or enter a custom path to your better-auth configuration file.
              </p>
            </div>

            {/* Auto-detected files */}
            {foundFiles.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-white mb-3">
                  Found auth files in your project:
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {foundFiles.map((path) => (
                    <button
                      key={path}
                      onClick={() => {
                        setAuthPath(path);
                        extractAuthContent();
                      }}
                      className="text-left p-3 bg-green-900/20 hover:bg-green-900/30 border border-green-600 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <code className="text-green-400">{path}</code>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Common locations fallback */}
            <div>
              <h4 className="text-md font-medium text-white mb-3">
                {foundFiles.length > 0 ? 'Other common locations:' : 'Common locations:'}
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {AUTH_FILE_PATTERNS.filter(path => !foundFiles.includes(path)).map((path) => (
                  <button
                    key={path}
                    onClick={() => {
                      setAuthPath(path);
                      extractAuthContent();
                    }}
                    className="text-left p-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors"
                  >
                    <code className="text-gray-400">{path}</code>
                  </button>
                ))}
              </div>
              
              {scanning && (
                <div className="mt-2 text-sm text-gray-400 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  Scanning project for auth files...
                </div>
              )}
            </div>

            <div>
              <h4 className="text-md font-medium text-white mb-3">Custom path:</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={authPath}
                  onChange={(e) => setAuthPath(e.target.value)}
                  placeholder="e.g., src/lib/auth.ts"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleManualPath}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Extract'}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Configuration Preview</h3>
              <p className="text-gray-400 mb-6">
                Review the extracted configuration from <code className="text-green-400">{authPath}</code>
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
              <h4 className="text-md font-medium text-white mb-3">Detected Features:</h4>
              <div className="space-y-2">
                {extractedConfig?.hasDatabase && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-gray-300">Database: {extractedConfig.databaseProvider}</span>
                  </div>
                )}
                {extractedConfig?.hasEmailPassword && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-gray-300">Email & Password Authentication</span>
                  </div>
                )}
                {extractedConfig?.hasEmailVerification && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-gray-300">Email Verification</span>
                  </div>
                )}
                {extractedConfig?.socialProviders && extractedConfig.socialProviders.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span className="text-gray-300">
                      Social Providers: {extractedConfig.socialProviders.join(', ')}
                    </span>
                  </div>
                )}
                {extractedConfig?.hasAccountLinking && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span className="text-gray-300">Account Linking</span>
                  </div>
                )}
                {extractedConfig?.hasRateLimit && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span className="text-gray-300">Rate Limiting</span>
                  </div>
                )}
                {extractedConfig?.hasAdvanced && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span className="text-gray-300">Advanced Security Options</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGenerateNodes}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Generate Visual Flow
              </button>
              <button
                onClick={() => setStep('locate')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">✓</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Configuration Extracted Successfully!</h3>
              <p className="text-gray-400">
                Your better-auth configuration has been converted to a visual flow. 
                You can now edit and manage your authentication setup visually.
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Start Editing
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[80vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Import Better-Auth Configuration</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'locate' ? 'bg-indigo-600 text-white' : 'bg-gray-600 text-gray-300'
            }`}>
              1
            </div>
            <div className={`flex-1 h-0.5 mx-2 ${
              ['preview', 'complete'].includes(step) ? 'bg-indigo-600' : 'bg-gray-600'
            }`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'preview' ? 'bg-indigo-600 text-white' : 
              step === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
            }`}>
              2
            </div>
            <div className={`flex-1 h-0.5 mx-2 ${
              step === 'complete' ? 'bg-green-600' : 'bg-gray-600'
            }`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
            }`}>
              ✓
            </div>
          </div>

          {renderStep()}
        </div>
      </div>
    </div>
  );
}