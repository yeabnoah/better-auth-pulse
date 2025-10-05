#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Simple colored output without chalk
const colors = {
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`
};

// Parse command line arguments
const args = process.argv.slice(2);
const flags = {};

// Parse flags
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith('--')) {
    const [key, value] = arg.split('=');
    const flagName = key.replace('--', '');
    flags[flagName] = value || true;
  } else if (arg.startsWith('-')) {
    const flagName = arg.replace('-', '');
    flags[flagName] = args[i + 1] || true;
    if (args[i + 1] && !args[i + 1].startsWith('-')) {
      i++; // Skip next arg as it's the value
    }
  }
}

// Handle help and version
if (flags.help || flags.h) {
  showHelp();
  process.exit(0);
}

if (flags.version || flags.v) {
  showVersion();
  process.exit(0);
}

// Common auth file patterns
const AUTH_FILE_PATTERNS = [
  'lib/auth.ts',
  'src/lib/auth.ts',
  'utils/auth.ts',
  'src/utils/auth.ts',
  'auth.ts',
  'src/auth.ts',
  'lib/better-auth.ts',
  'src/lib/better-auth.ts',
  'config/auth.ts',
  'src/config/auth.ts',
  'server/auth.ts',
  'src/server/auth.ts',
  'app/lib/auth.ts',
  'app/utils/auth.ts'
];

function showHelp() {
  console.log(colors.cyan('🚀 Better Auth Pulse CLI'));
  console.log(colors.gray('═'.repeat(50)));
  console.log('Visual authentication flow builder for better-auth');
  console.log('');
  console.log(colors.yellow('USAGE:'));
  console.log('  better-auth-pulse [options]');
  console.log('');
  console.log(colors.yellow('OPTIONS:'));
  console.log('  --file, -f <path>     Specify auth.ts file path');
  console.log('  --port, -p <number>   Set server port (default: 3001)');
  console.log('  --scan, -s           Deep scan entire project');
  console.log('  --auto, -a           Auto-select if only one file found');
  console.log('  --help, -h           Show this help message');
  console.log('  --version, -v        Show version information');
  console.log('');
  console.log(colors.yellow('EXAMPLES:'));
  console.log('  better-auth-pulse');
  console.log('  better-auth-pulse --file=lib/auth.ts');
  console.log('  better-auth-pulse --scan --auto');
  console.log('  better-auth-pulse --port=4000');
}

function showVersion() {
  console.log(colors.cyan('Better Auth Pulse CLI v1.0.0'));
  console.log('Visual authentication flow builder for better-auth');
  console.log('');
  console.log('Dependencies:');
  console.log(`  • Node.js: ${process.version}`);
  console.log(`  • Platform: ${process.platform}`);
}

function parseAuthConfig(content) {
  const config = {};

  // Database detection
  if (content.includes('drizzleAdapter')) {
    config.hasDatabase = true;
    config.databaseAdapter = 'drizzle';
    const providerMatch = content.match(/provider:\s*["'](\w+)["']/);
    config.databaseProvider = providerMatch ? providerMatch[1] : 'unknown';
  } else if (content.includes('prismaAdapter')) {
    config.hasDatabase = true;
    config.databaseAdapter = 'prisma';
    const providerMatch = content.match(/provider:\s*["'](\w+)["']/);
    config.databaseProvider = providerMatch ? providerMatch[1] : 'unknown';
  }

  // Authentication methods
  config.hasEmailPassword = content.includes('emailAndPassword');
  config.hasEmailVerification = content.includes('emailVerification');

  // Social providers
  config.socialProviders = [];
  if (content.includes('google:')) config.socialProviders.push('Google');
  if (content.includes('github:')) config.socialProviders.push('GitHub');
  if (content.includes('discord:')) config.socialProviders.push('Discord');
  if (content.includes('facebook:')) config.socialProviders.push('Facebook');

  // User fields
  if (content.includes('additionalFields')) {
    config.hasUserFields = true;
    config.userFields = [];
    if (content.includes('role:')) config.userFields.push('role');
    if (content.includes('specialty:')) config.userFields.push('specialty');
    if (content.includes('licenseNumber:')) config.userFields.push('licenseNumber');
  }

  // Plugins
  config.plugins = [];
  config.polarFeatures = [];
  
  if (content.includes('polar(')) {
    config.hasPlugins = true;
    config.plugins.push('Polar');
    
    if (content.includes('checkout(')) config.polarFeatures.push('Checkout');
    if (content.includes('portal(')) config.polarFeatures.push('Portal');
    if (content.includes('usage(')) config.polarFeatures.push('Usage');
    if (content.includes('webhooks(')) config.polarFeatures.push('Webhooks');
  }

  if (content.includes('nextCookies')) {
    config.hasNextCookies = true;
    if (!config.plugins) config.plugins = [];
    config.plugins.push('Next.js Cookies');
  }

  return config;
}

function showDetectedFeatures(config) {
  console.log(colors.cyan('🎯 Detected features:'));

  if (config.hasDatabase) {
    console.log(colors.gray(`  • Database: ${config.databaseAdapter} with ${config.databaseProvider?.toUpperCase()}`));
  }

  if (config.hasEmailPassword) {
    console.log(colors.gray('  • Email & Password Authentication'));
  }

  if (config.hasEmailVerification) {
    console.log(colors.gray('  • Email Verification'));
  }

  if (config.hasUserFields && config.userFields?.length) {
    console.log(colors.gray(`  • User Fields: ${config.userFields.join(', ')}`));
  }

  if (config.socialProviders?.length) {
    console.log(colors.gray(`  • OAuth Providers: ${config.socialProviders.join(', ')}`));
  }

  if (config.polarFeatures?.length) {
    console.log(colors.gray(`  • Polar Plugin: ${config.polarFeatures.join(', ')}`));
  }

  if (config.hasNextCookies) {
    console.log(colors.gray('  • Next.js Cookie Integration'));
  }

  console.log('');
}

function generateNodes(config) {
  const nodes = [
    {
      id: "1",
      type: "authStarter",
      position: { x: 250, y: 50 },
      data: { label: "Auth Starter" }
    }
  ];

  let nodeId = 2;
  let yPosition = 150;

  // Database nodes
  if (config.hasDatabase) {
    nodes.push({
      id: nodeId.toString(),
      type: "database",
      position: { x: 0, y: yPosition },
      data: { label: "Database" }
    });
    nodeId++;
    yPosition += 100;

    nodes.push({
      id: nodeId.toString(),
      type: config.databaseAdapter || "adapter",
      position: { x: 0, y: yPosition },
      data: { label: `${config.databaseAdapter?.charAt(0).toUpperCase()}${config.databaseAdapter?.slice(1)} Adapter` }
    });
    nodeId++;
    yPosition += 100;

    if (config.databaseProvider) {
      nodes.push({
        id: nodeId.toString(),
        type: config.databaseProvider,
        position: { x: 0, y: yPosition },
        data: { label: config.databaseProvider.toUpperCase() }
      });
      nodeId++;
    }
  }

  // Auth nodes
  if (config.hasEmailPassword) {
    nodes.push({
      id: nodeId.toString(),
      type: "emailAuth",
      position: { x: 400, y: 150 },
      data: { label: "Email & Password" }
    });
    nodeId++;
  }

  if (config.hasEmailVerification) {
    nodes.push({
      id: nodeId.toString(),
      type: "emailVerification",
      position: { x: 600, y: 150 },
      data: { label: "Email Verification" }
    });
    nodeId++;
  }

  // User config
  if (config.hasUserFields) {
    nodes.push({
      id: nodeId.toString(),
      type: "userConfig",
      position: { x: 400, y: 250 },
      data: { label: "User Configuration" }
    });
    nodeId++;
  }

  // Social providers
  if (config.socialProviders?.length) {
    let socialY = 350;
    nodes.push({
      id: nodeId.toString(),
      type: "socialLogin",
      position: { x: 400, y: socialY },
      data: { label: "Social Providers" }
    });
    nodeId++;
    socialY += 100;

    config.socialProviders.forEach(provider => {
      nodes.push({
        id: nodeId.toString(),
        type: `oauth${provider}`,
        position: { x: 600, y: socialY },
        data: { label: `${provider} OAuth` }
      });
      nodeId++;
      socialY += 80;
    });
  }

  // Plugins
  if (config.hasPlugins) {
    let pluginY = 500;
    nodes.push({
      id: nodeId.toString(),
      type: "plugins",
      position: { x: 800, y: pluginY },
      data: { label: "Plugins" }
    });
    nodeId++;
    pluginY += 100;

    if (config.polarFeatures?.length) {
      nodes.push({
        id: nodeId.toString(),
        type: "polarPlugin",
        position: { x: 1000, y: pluginY },
        data: { label: "Polar Plugin" }
      });
      nodeId++;
      pluginY += 80;

      config.polarFeatures.forEach(feature => {
        nodes.push({
          id: nodeId.toString(),
          type: `polar${feature}`,
          position: { x: 1200, y: pluginY },
          data: { label: `Polar ${feature}` }
        });
        nodeId++;
        pluginY += 60;
      });
    }

    if (config.hasNextCookies) {
      nodes.push({
        id: nodeId.toString(),
        type: "nextCookies",
        position: { x: 1000, y: pluginY },
        data: { label: "Next.js Cookies" }
      });
      nodeId++;
    }
  }

  return nodes;
}

function generateEdges(nodes) {
  const edges = [];
  
  // Connect auth starter to other main nodes
  for (let i = 1; i < nodes.length; i++) {
    edges.push({
      id: `e1-${nodes[i].id}`,
      source: "1",
      target: nodes[i].id,
      animated: true
    });
  }

  return edges;
}

function generateConfig(authContent, authPath, config) {
  const nodes = generateNodes(config);
  const edges = generateEdges(nodes);

  const configData = {
    metadata: {
      sourceFile: authPath,
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
      cli: 'better-auth-pulse-working'
    },
    nodes,
    edges,
    authContent,
    parsedConfig: config
  };

  const configPath = path.join(process.cwd(), '.better-auth-pulse.config.json');
  fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));

  return configPath;
}

function detectPackageManager() {
  const cwd = process.cwd();
  
  if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  } else if (fs.existsSync(path.join(cwd, 'yarn.lock'))) {
    return 'yarn';
  } else {
    return 'npm';
  }
}

async function launchStudio(port, configPath) {
  return new Promise((resolve, reject) => {
    // Get the CLI directory (where this script is located)
    const cliDir = path.dirname(__dirname);
    
    console.log(colors.blue(`🌍 Server will start on port ${port}`));
    
    const env = {
      ...process.env,
      BETTER_AUTH_PULSE_CONFIG: configPath,
      PORT: port.toString(),
      NODE_ENV: 'development'
    };

    const packageManager = detectPackageManager();
    console.log(colors.gray(`📦 Using package manager: ${packageManager}`));

    const server = spawn(packageManager, ['run', 'dev'], {
      cwd: cliDir,
      env,
      stdio: 'pipe'
    });

    let serverReady = false;

    server.stdout.on('data', (data) => {
      const output = data.toString();
      
      if (output.includes('Ready') || output.includes('Local:') || output.includes('started server')) {
        if (!serverReady) {
          serverReady = true;
          const url = `http://localhost:${port}`;
          
          setTimeout(() => {
            console.log('');
            console.log(colors.green('🎉 Better Auth Pulse Studio is ready!'));
            console.log(colors.cyan(`🌐 Studio URL: ${url}`));
            console.log('');
            console.log(colors.gray('📋 Available actions:'));
            console.log(colors.gray('  • Edit your auth flow visually'));
            console.log(colors.gray('  • Generate auth UI components'));
            console.log(colors.gray('  • Export updated configuration'));
            console.log(colors.gray('  • Download environment templates'));
            console.log('');
            console.log(colors.yellow('Press Ctrl+C to stop the server'));

            // Try to open browser
            try {
              const { spawn } = require('child_process');
              // Try different commands based on platform
              let openCmd;
              if (process.platform === 'darwin') openCmd = 'open';
              else if (process.platform === 'win32') openCmd = 'start';
              else openCmd = 'xdg-open';
              
              spawn(openCmd, [url], { stdio: 'ignore' }).on('error', () => {
                console.log(colors.gray('💡 Could not open browser automatically'));
              });
            } catch {
              console.log(colors.gray('💡 Please open your browser and navigate to the URL above'));
            }

            resolve();
          }, 1000);
        }
      }
    });

    server.stderr.on('data', (data) => {
      const errorOutput = data.toString();
      if (errorOutput.includes('Error:')) {
        console.log(colors.red('❌'), errorOutput.trim());
      }
    });

    server.on('close', (code) => {
      if (code === 0) {
        console.log(colors.green('\n👋 Better Auth Pulse Studio stopped gracefully'));
      } else {
        console.log(colors.yellow(`\n⚠️  Studio stopped with exit code: ${code}`));
      }
      process.exit(code || 0);
    });

    server.on('error', (error) => {
      reject(new Error(`Failed to start server: ${error.message}`));
    });

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      console.log(colors.yellow('\n🛑 Stopping Better Auth Pulse Studio...'));
      server.kill('SIGTERM');
      setTimeout(() => server.kill('SIGKILL'), 5000);
    });

    // Timeout
    setTimeout(() => {
      if (!serverReady) {
        reject(new Error('Server failed to start within 60 seconds'));
      }
    }, 60000);
  });
}

async function main() {
  console.log(colors.cyan('🚀 Better Auth Pulse CLI'));
  console.log(colors.gray('═'.repeat(50)));
  console.log(colors.gray('Visual authentication flow builder for better-auth'));
  console.log('');

  try {
    let authFilePath = '';
    const port = flags.port || flags.p || 3001;

    if (flags.file || flags.f) {
      // Use specified file
      authFilePath = flags.file || flags.f;
      console.log(colors.blue(`📄 Using specified file: ${authFilePath}`));
    } else {
      // Auto-detect files
      console.log('📁 Scanning for better-auth configuration files...');
      
      let foundFiles = [];
      
      // Quick scan
      for (const pattern of AUTH_FILE_PATTERNS) {
        if (fs.existsSync(pattern)) {
          try {
            const content = fs.readFileSync(pattern, 'utf-8');
            if (content.includes('betterAuth') || content.includes('better-auth')) {
              foundFiles.push(pattern);
            }
          } catch {
            // Skip files that can't be read
          }
        }
      }

      if (foundFiles.length === 0) {
        console.log(colors.yellow('⚠️  No auth files found automatically'));
        console.log(colors.gray('💡 Try using --scan flag for deep project scanning'));
        
        // Simple prompt without inquirer
        process.stdout.write('🔍 Enter path to your auth.ts file: ');
        process.stdin.setEncoding('utf8');
        
        return new Promise((resolve) => {
          process.stdin.once('data', (data) => {
            authFilePath = data.toString().trim();
            continueWithFile(authFilePath, port);
          });
        });
      } else if (foundFiles.length === 1) {
        authFilePath = foundFiles[0];
        console.log(colors.green(`🎯 Auto-selected: ${authFilePath}`));
      } else {
        console.log(colors.green(`✅ Found ${foundFiles.length} auth configuration file(s):`));
        foundFiles.forEach((file, index) => {
          console.log(colors.gray(`  ${index + 1}. ${file}`));
        });
        
        // Use first file for now (can be enhanced later)
        authFilePath = foundFiles[0];
        console.log(colors.blue(`📄 Using: ${authFilePath}`));
      }
    }

    await continueWithFile(authFilePath, port);

  } catch (error) {
    console.error(colors.red('❌ Error:'), error.message);
    console.log('');
    console.log(colors.gray('🆘 Need help? Run: better-auth-pulse --help'));
    process.exit(1);
  }
}

async function continueWithFile(authFilePath, port) {
  try {
    // Read and analyze auth file
    console.log('📖 Reading auth configuration...');
    
    const fullPath = path.resolve(process.cwd(), authFilePath);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${authFilePath}`);
    }

    const authContent = fs.readFileSync(fullPath, 'utf-8');
    
    if (!authContent.includes('betterAuth') && !authContent.includes('better-auth')) {
      throw new Error('File does not appear to be a better-auth configuration');
    }

    const config = parseAuthConfig(authContent);
    console.log(colors.green('✅ Configuration extracted successfully!'));

    // Show detected features
    showDetectedFeatures(config);

    // Generate visual configuration
    console.log('🔄 Generating visual configuration...');
    const configPath = generateConfig(authContent, authFilePath, config);
    console.log(colors.green(`✅ Configuration saved to: ${configPath}`));

    // Show summary
    const nodes = generateNodes(config);
    const edges = generateEdges(nodes);
    console.log('');
    console.log(colors.cyan('📊 Summary:'));
    console.log(colors.gray(`Nodes: ${nodes.length}`));
    console.log(colors.gray(`Edges: ${edges.length}`));
    console.log(colors.gray(`Output: ${configPath}`));

    // Launch studio
    console.log('');
    console.log(colors.green('🌐 Starting Better Auth Pulse Studio...'));
    await launchStudio(port, configPath);

  } catch (error) {
    throw error;
  }
}

// Start the CLI
main().catch(console.error);