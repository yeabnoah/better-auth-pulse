"use client";
import { useState, useEffect, useRef } from "react";
import { readAuthFile, findAuthFiles } from "../utils/fileSystemAccess";
import { generateNodesFromAuthFile } from "../utils/parseAuthToNodes";
import { Node, Edge } from "../utils/convertPulseConfigToFlowNodes";

interface CLIInterfaceProps {
  onComplete: (nodes: Node[], edges: Edge[]) => void;
  onClose: () => void;
}

interface CLIStep {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'input' | 'loading';
  timestamp: Date;
}

export default function CLIInterface({ onComplete, onClose }: CLIInterfaceProps) {
  const [steps, setSteps] = useState<CLIStep[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [foundFiles, setFoundFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeCLI();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [steps]);

  const addStep = (message: string, type: CLIStep['type'] = 'info') => {
    setSteps(prev => [...prev, {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date()
    }]);
  };

  const initializeCLI = async () => {
    addStep('🚀 Better Auth Pulse CLI', 'info');
    addStep('Initializing authentication configuration extractor...', 'info');
    
    setIsProcessing(true);
    
    try {
      addStep('📁 Scanning project for better-auth configuration files...', 'loading');
      
      const files = await findAuthFiles();
      setFoundFiles(files);
      
      if (files.length > 0) {
        addStep(`✅ Found ${files.length} auth configuration file(s):`, 'success');
        files.forEach((file, index) => {
          addStep(`  ${index + 1}. ${file}`, 'info');
        });
        addStep('', 'info');
        addStep('Select a file by entering its number, or type a custom path:', 'input');
      } else {
        addStep('⚠️  No auth files found automatically.', 'error');
        addStep('Please enter the path to your better-auth configuration file:', 'input');
      }
    } catch (error) {
      addStep('❌ Error scanning project files', 'error');
      addStep('Please enter the path to your better-auth configuration file:', 'input');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInput = async (input: string) => {
    const trimmedInput = input.trim();
    
    if (!trimmedInput) return;
    
    addStep(`> ${trimmedInput}`, 'info');
    setCurrentInput('');
    setIsProcessing(true);
    
    try {
      let filePath = '';
      
      // Check if input is a number (selecting from found files)
      const fileIndex = parseInt(trimmedInput);
      if (!isNaN(fileIndex) && fileIndex > 0 && fileIndex <= foundFiles.length) {
        filePath = foundFiles[fileIndex - 1];
        addStep(`📄 Selected: ${filePath}`, 'info');
      } else {
        filePath = trimmedInput;
        addStep(`📄 Using custom path: ${filePath}`, 'info');
      }
      
      setSelectedFile(filePath);
      
      addStep('📖 Reading file contents...', 'loading');
      
      const result = await readAuthFile(filePath);
      
      if (!result.success) {
        addStep(`❌ Error: ${result.error}`, 'error');
        addStep('Please try another path:', 'input');
        return;
      }
      
      addStep('✅ File read successfully', 'success');
      addStep('🔍 Analyzing configuration...', 'loading');
      
      // Parse the configuration
      const { nodes, edges } = generateNodesFromAuthFile(result.content);
      
      addStep(`✅ Configuration parsed successfully!`, 'success');
      addStep(`📊 Generated ${nodes.length} nodes and ${edges.length} connections`, 'info');
      
      // Show detected features
      const features = analyzeFeatures(result.content!);
      if (features.length > 0) {
        addStep('🎯 Detected features:', 'info');
        features.forEach(feature => {
          addStep(`  • ${feature}`, 'info');
        });
      }
      
      addStep('', 'info');
      addStep('🎨 Ready to generate visual flow!', 'success');
      addStep('Press Enter to continue or type "exit" to cancel...', 'input');
      
      // Store the results for completion
      (window as any).__authResults = { nodes, edges };
      
    } catch (error) {
      addStep(`❌ Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      addStep('Please try another path:', 'input');
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeFeatures = (content: string): string[] => {
    const features: string[] = [];
    
    if (content.includes('prismaAdapter')) {
      const providerMatch = content.match(/provider:\s*["'](\w+)["']/);
      const provider = providerMatch ? providerMatch[1] : 'unknown';
      features.push(`Database: ${provider.toUpperCase()}`);
    }
    
    if (content.includes('emailAndPassword')) {
      features.push('Email & Password Authentication');
    }
    
    if (content.includes('emailVerification')) {
      features.push('Email Verification');
    }
    
    if (content.includes('google:')) features.push('Google OAuth');
    if (content.includes('github:')) features.push('GitHub OAuth');
    if (content.includes('discord:')) features.push('Discord OAuth');
    if (content.includes('facebook:')) features.push('Facebook OAuth');
    
    if (content.includes('accountLinking')) {
      features.push('Account Linking');
    }
    
    if (content.includes('rateLimit')) {
      features.push('Rate Limiting');
    }
    
    if (content.includes('useSecureCookies')) {
      features.push('Advanced Security Options');
    }
    
    return features;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isProcessing) {
      if (currentInput.toLowerCase() === 'exit') {
        onClose();
        return;
      }
      
      if ((window as any).__authResults && currentInput.trim() === '') {
        // Complete the process
        const { nodes, edges } = (window as any).__authResults;
        onComplete(nodes, edges);
        return;
      }
      
      handleInput(currentInput);
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getStepIcon = (type: CLIStep['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'loading': return '⏳';
      case 'input': return '💬';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Terminal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-white font-mono text-sm">better-auth-pulse-cli</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Terminal Content */}
        <div 
          ref={terminalRef}
          className="flex-1 p-4 bg-black font-mono text-sm overflow-auto"
        >
          {steps.map((step) => (
            <div key={step.id} className="mb-1">
              <span className="text-gray-500 text-xs">
                [{formatTimestamp(step.timestamp)}]
              </span>
              <span className="ml-2">
                {getStepIcon(step.type)}
              </span>
              <span 
                className={`ml-2 ${
                  step.type === 'error' ? 'text-red-400' :
                  step.type === 'success' ? 'text-green-400' :
                  step.type === 'loading' ? 'text-yellow-400' :
                  step.type === 'input' ? 'text-blue-400' :
                  'text-gray-300'
                }`}
              >
                {step.message}
              </span>
            </div>
          ))}
          
          {/* Input Line */}
          {!isProcessing && (
            <div className="flex items-center mt-2">
              <span className="text-green-400">$</span>
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="ml-2 bg-transparent text-white outline-none flex-1 font-mono"
                placeholder="Enter command..."
                autoFocus
              />
              <span className="text-white animate-pulse">|</span>
            </div>
          )}
          
          {isProcessing && (
            <div className="flex items-center mt-2">
              <span className="text-yellow-400">⏳</span>
              <span className="ml-2 text-yellow-400">Processing...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="text-xs text-gray-400 font-mono">
            Better Auth Pulse CLI - Type "exit" to cancel
          </div>
        </div>
      </div>
    </div>
  );
}