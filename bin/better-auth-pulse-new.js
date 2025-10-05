#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');

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
  console.log(chalk.cyan('🚀 Better Auth Pulse CLI'));
  console.log(chalk.gray('═'.repeat(50)));
  console.log('Visual authentication flow builder for better-auth');
  console.log('');
  console.log(chalk.yellow('USAGE:'));
  console.log('  better-auth-pulse [options]');
  console.log('');
  console.log(chalk.yellow('OPTIONS:'));
  console.log('  --file, -f <path>     Specify auth.ts file path');
  console.log('  --port, -p <number>   Set server port (default: 3001)');
  console.log('  --scan, -s           Deep scan entire project');
  console.log('  --auto, -a           Auto-select if only one file found');
  console.log('  --help, -h           Show this help message');
  console.log('  --version, -v        Show version information');
  console.log('');
  console.log(chalk.yellow('EXAMPLES:'));
  console.log('  better-auth-pulse');
  console.log('  better-auth-pulse --file=lib/auth.ts');
  console.log('  better-auth-pulse --scan --auto');
  console.log('  better-auth-pulse --port=4000');
}

function showVersion() {
  const packageJson = require('../package.json');
  console.log(chalk.cyan(`Better Auth Pulse CLI v${packageJson.version}`));
  console.log('Visual authentication flow builder for better-auth');
  console.log('');
  console.log('Dependencies:');
  console.log(`  • Node.js: ${process.version}`);
  console.log(`  • Platform: ${process.platform}`);
}

async function findAuthFiles() {
  const foundFiles = [];

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

  return foundFiles;
}

async function deepScanForAuthFiles() {
  const foundFiles = [];

  function scanDir(dir, depth = 0) {
    if (depth > 3) return; // Limit depth

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip common directories
          if (['node_modules', '.git', '.next', 'dist', 'build'].includes(entry.name)) {
            continue;
          }
          scanDir(fullPath, depth + 1);
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            if (content.includes('betterAuth') || content.includes('better-auth')) {
              const relativePath = path.relative(process.cwd(), fullPath);
              foundFiles.push(relativePath);
            }
          } catch {
            // Skip files that can't be read
          }
        }
      }
    } catch {
      // Skip directories that can't be read
    }
  }

  scanDir(process.cwd());
  return foundFiles;
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
  console.log(chalk.cyan('🎯 Detected features:'));

  if (config.hasDatabase) {
    console.log(chalk.gray(`  • Database: ${config.databaseAdapter} with ${config.databaseProvider?.toUpperCase()}`));
  }

  if (config.hasEmailPassword) {
    console.log(chalk.gray('  • Email & Password Authentication'));
  }

  if (config.hasEmailVerification) {
    console.log(chalk.gray('  • Email Verification'));
  }

  if (config.hasUserFields && config.userFields?.length) {
    console.log(chalk.gray(`  • User Fields: ${config.userFields.join(', ')}`));
  }

  if (config.socialProviders?.length) {
    console.log(chalk.gray(`  • OAuth Providers: ${config.socialProviders.join(', ')}`));
  }

  if (config.polarFeatures?.length) {
    console.log(chalk.gray(`  • Polar Plugin: ${config.polarFeatures.join(', ')}`));
  }

  if (config.hasNextCookies) {
    console.log(chalk.gray('  • Next.js Cookie Integration'));
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

async function generateConfig(authContent, authPath, config) {
  const nodes = generateNodes(config);
  const edges = generateEdges(nodes);

  const configData = {
    metadata: {
      sourceFile: authPath,
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
      cli: 'better-auth-pulse-new'
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
    const cliDir = path.dirname(__dirname);

    console.log(chalk.blue(`🌍 Server will start on port ${port}`));

    const env = {
      ...process.env,
      BETTER_AUTH_PULSE_CONFIG: configPath,
      PORT: port.toString(),
      NODE_ENV: 'development'
    };

    const packageManager = detectPackageManager();
    console.log(chalk.gray(`📦 Using package manager: ${packageManager}`));

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
            console.log(chalk.green('🎉 Better Auth Pulse Studio is ready!'));
            console.log(chalk.cyan(`🌐 Studio URL: ${url}`));
            console.log('');
            console.log(chalk.gray('📋 Available actions:'));
            console.log(chalk.gray('  • Edit your auth flow visually'));
            console.log(chalk.gray('  • Generate auth UI components'));
            console.log(chalk.gray('  • Export updated configuration'));
            console.log(chalk.gray('  • Download environment templates'));
            console.log('');
            console.log(chalk.yellow('Press Ctrl+C to stop the server'));

            // Try to open browser
            try {
              const open = require('open');
              open(url).catch(() => {
                console.log(chalk.gray('💡 Could not open browser automatically'));
              });
            } catch {
              console.log(chalk.gray('💡 Please open your browser and navigate to the URL above'));
            }

            resolve();
          }, 1000);
        }
      }
    });

    server.stderr.on('data', (data) => {
      const errorOutput = data.toString();
      if (errorOutput.includes('Error:')) {
        console.log(chalk.red('❌'), errorOutput.trim());
      }
    });

    server.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green('\n👋 Better Auth Pulse Studio stopped gracefully'));
      } else {
        console.log(chalk.yellow(`\n⚠️  Studio stopped with exit code: ${code}`));
      }
      process.exit(code || 0);
    });

    server.on('error', (error) => {
      reject(new Error(`Failed to start server: ${error.message}`));
    });

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n🛑 Stopping Better Auth Pulse Studio...'));
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
  console.log(chalk.cyan('🚀 Better Auth Pulse CLI'));
  console.log(chalk.gray('═'.repeat(50)));
  console.log(chalk.gray('Visual authentication flow builder for better-auth'));
  console.log('');

  try {
    let authFilePath = '';
    const port = flags.port || flags.p || 3001;

    if (flags.file || flags.f) {
      // Use specified file
      authFilePath = flags.file || flags.f;
      console.log(chalk.blue(`📄 Using specified file: ${authFilePath}`));
    } else {
      // Auto-detect files
      const spinner = ora('📁 Scanning for better-auth configuration files...').start();

      let foundFiles = await findAuthFiles();

      if (foundFiles.length === 0 && (flags.scan || flags.s)) {
        spinner.text = '🔍 Performing deep scan...';
        foundFiles = await deepScanForAuthFiles();
      }

      spinner.stop();

      if (foundFiles.length === 0) {
        console.log(chalk.yellow('⚠️  No auth files found automatically'));
        if (!(flags.scan || flags.s)) {
          console.log(chalk.gray('💡 Try using --scan flag for deep project scanning'));
        }

        const { customPath } = await inquirer.prompt([{
          type: 'input',
          name: 'customPath',
          message: '🔍 Enter path to your auth.ts file:',
          validate: (input) => {
            if (!input.trim()) return 'Please enter a valid path';
            return true;
          }
        }]);

        authFilePath = customPath.trim();
      } else if (foundFiles.length === 1 && (flags.auto || flags.a)) {
        authFilePath = foundFiles[0];
        console.log(chalk.green(`🎯 Auto-selected: ${authFilePath}`));
      } else {
        console.log(chalk.green(`✅ Found ${foundFiles.length} auth configuration file(s):`));
        foundFiles.forEach((file, index) => {
          console.log(chalk.gray(`  ${index + 1}. ${file}`));
        });
        console.log('');

        if (foundFiles.length === 1) {
          authFilePath = foundFiles[0];
        } else {
          const { selectedFile } = await inquirer.prompt([{
            type: 'list',
            name: 'selectedFile',
            message: '📋 Select an auth file:',
            choices: [
              ...foundFiles.map(file => ({ name: file, value: file })),
              { name: 'Enter custom path', value: 'custom' }
            ]
          }]);

          if (selectedFile === 'custom') {
            const { customPath } = await inquirer.prompt([{
              type: 'input',
              name: 'customPath',
              message: '🔍 Enter path to your auth.ts file:',
              validate: (input) => {
                if (!input.trim()) return 'Please enter a valid path';
                return true;
              }
            }]);
            authFilePath = customPath.trim();
          } else {
            authFilePath = selectedFile;
          }
        }
      }
    }

    // Read and analyze auth file
    const spinner = ora('📖 Reading auth configuration...').start();

    try {
      const fullPath = path.resolve(process.cwd(), authFilePath);

      if (!fs.existsSync(fullPath)) {
        throw new Error(`File not found: ${authFilePath}`);
      }

      const authContent = fs.readFileSync(fullPath, 'utf-8');

      if (!authContent.includes('betterAuth') && !authContent.includes('better-auth')) {
        throw new Error('File does not appear to be a better-auth configuration');
      }

      const config = parseAuthConfig(authContent);
      spinner.succeed('Configuration extracted successfully!');

      // Show detected features
      showDetectedFeatures(config);

      // Generate visual configuration
      const configSpinner = ora('🔄 Generating visual configuration...').start();
      const configPath = await generateConfig(authContent, authFilePath, config);
      configSpinner.succeed(`Configuration saved to: ${configPath}`);

      // Launch studio
      console.log('');
      console.log(chalk.green('🌐 Starting Better Auth Pulse Studio...'));
      await launchStudio(port, configPath);

    } catch (error) {
      spinner.fail('Failed to read auth file');
      throw error;
    }

  } catch (error) {
    console.error(chalk.red('❌ Error:'), error.message);
    console.log('');
    console.log(chalk.gray('🆘 Need help? Run: better-auth-pulse --help'));
    process.exit(1);
  }
}

// Start the CLI
main().catch(console.error);