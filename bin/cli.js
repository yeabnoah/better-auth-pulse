#!/usr/bin/env node

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const {
  intro,
  outro,
  text,
  select,
  multiselect,
  confirm,
  spinner,
  isCancel,
  cancel,
  log,
  note
} = require('@clack/prompts')
// Remove this line - we'll use regular setTimeout
const pc = require('picocolors')

// Parse command line arguments
const args = process.argv.slice(2)
const flags = {
  file: args.find(arg => arg.startsWith('--file='))?.split('=')[1] || args.find(arg => arg.startsWith('-f='))?.split('=')[1],
  port: parseInt(args.find(arg => arg.startsWith('--port='))?.split('=')[1] || args.find(arg => arg.startsWith('-p='))?.split('=')[1] || '3001'),
  scan: args.includes('--scan') || args.includes('-s'),
  auto: args.includes('--auto') || args.includes('-a'),
  help: args.includes('--help') || args.includes('-h'),
  version: args.includes('--version') || args.includes('-v')
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
]

function showHelp() {
  console.log(`
${pc.cyan('🚀 Better Auth Pulse CLI')}

${pc.bold('USAGE:')}
  better-auth-pulse [options]

${pc.bold('OPTIONS:')}
  -f, --file=<path>     Specify auth.ts file path
  -p, --port=<number>   Set server port (default: 3001)
  -s, --scan           Deep scan entire project
  -a, --auto           Auto-select if only one file found
  -h, --help           Show this help
  -v, --version        Show version

${pc.bold('EXAMPLES:')}
  better-auth-pulse
  better-auth-pulse --file=lib/auth.ts
  better-auth-pulse --scan --auto
  better-auth-pulse --port=4000
`)
}

function showVersion() {
  const pkg = require('../package.json')
  console.log(`${pc.cyan('Better Auth Pulse')} ${pc.dim('v' + pkg.version)}`)
  console.log(`${pc.dim('Node.js')} ${process.version}`)
  console.log(`${pc.dim('Platform')} ${process.platform}`)
}

async function findAuthFiles(deepScan = false) {
  const foundFiles = []
  
  // Quick scan
  for (const pattern of AUTH_FILE_PATTERNS) {
    if (fs.existsSync(pattern)) {
      try {
        const content = fs.readFileSync(pattern, 'utf-8')
        if (content.includes('betterAuth') || content.includes('better-auth')) {
          foundFiles.push(pattern)
        }
      } catch {
        // Skip files that can't be read
      }
    }
  }
  
  // Deep scan if requested
  if (foundFiles.length === 0 && deepScan) {
    const scanDir = (dir, depth = 0) => {
      if (depth > 3) return
      
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true })
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)
          
          if (entry.isDirectory()) {
            if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(entry.name)) {
              scanDir(fullPath, depth + 1)
            }
          } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
            try {
              const content = fs.readFileSync(fullPath, 'utf-8')
              if (content.includes('betterAuth') || content.includes('better-auth')) {
                const relativePath = path.relative(process.cwd(), fullPath)
                foundFiles.push(relativePath)
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
    
    scanDir(process.cwd())
  }
  
  return foundFiles
}

function parseAuthConfig(content) {
  const config = {}
  
  // Database detection
  if (content.includes('drizzleAdapter')) {
    config.database = 'drizzle'
    const providerMatch = content.match(/provider:\s*["'](\w+)["']/)
    config.databaseProvider = providerMatch ? providerMatch[1] : 'unknown'
  } else if (content.includes('prismaAdapter')) {
    config.database = 'prisma'
    const providerMatch = content.match(/provider:\s*["'](\w+)["']/)
    config.databaseProvider = providerMatch ? providerMatch[1] : 'unknown'
  }
  
  // Authentication features
  config.features = []
  if (content.includes('emailAndPassword')) config.features.push('Email & Password')
  if (content.includes('emailVerification')) config.features.push('Email Verification')
  
  // Social providers
  config.socialProviders = []
  if (content.includes('google:')) config.socialProviders.push('Google')
  if (content.includes('github:')) config.socialProviders.push('GitHub')
  if (content.includes('discord:')) config.socialProviders.push('Discord')
  if (content.includes('facebook:')) config.socialProviders.push('Facebook')
  
  // User fields
  config.userFields = []
  if (content.includes('role:')) config.userFields.push('role')
  if (content.includes('specialty:')) config.userFields.push('specialty')
  if (content.includes('licenseNumber:')) config.userFields.push('licenseNumber')
  
  // Plugins
  config.plugins = []
  if (content.includes('polar(')) {
    const polarFeatures = []
    if (content.includes('checkout(')) polarFeatures.push('Checkout')
    if (content.includes('portal(')) polarFeatures.push('Portal')
    if (content.includes('usage(')) polarFeatures.push('Usage')
    if (content.includes('webhooks(')) polarFeatures.push('Webhooks')
    config.plugins.push(`Polar (${polarFeatures.join(', ')})`)
  }
  if (content.includes('nextCookies')) config.plugins.push('Next.js Cookies')
  
  return config
}

function generateNodes(config) {
  const nodes = [{
    id: "1",
    type: "authStarter", 
    position: { x: 250, y: 50 },
    data: { label: "Auth Starter" }
  }]
  
  let nodeId = 2
  let yPos = 150
  
  // Database nodes
  if (config.database) {
    nodes.push({
      id: nodeId.toString(),
      type: "database",
      position: { x: 0, y: yPos },
      data: { label: "Database" }
    })
    nodeId++
    yPos += 100
    
    nodes.push({
      id: nodeId.toString(),
      type: config.database,
      position: { x: 0, y: yPos },
      data: { label: `${config.database.charAt(0).toUpperCase()}${config.database.slice(1)} Adapter` }
    })
    nodeId++
    yPos += 100
    
    if (config.databaseProvider) {
      nodes.push({
        id: nodeId.toString(),
        type: config.databaseProvider,
        position: { x: 0, y: yPos },
        data: { label: config.databaseProvider.toUpperCase() }
      })
      nodeId++
    }
  }
  
  // Auth features
  if (config.features.includes('Email & Password')) {
    nodes.push({
      id: nodeId.toString(),
      type: "emailAuth",
      position: { x: 400, y: 150 },
      data: { label: "Email & Password" }
    })
    nodeId++
  }
  
  if (config.features.includes('Email Verification')) {
    nodes.push({
      id: nodeId.toString(),
      type: "emailVerification", 
      position: { x: 600, y: 150 },
      data: { label: "Email Verification" }
    })
    nodeId++
  }
  
  // User fields
  if (config.userFields.length > 0) {
    nodes.push({
      id: nodeId.toString(),
      type: "userConfig",
      position: { x: 400, y: 250 },
      data: { label: "User Configuration" }
    })
    nodeId++
  }
  
  // Social providers
  if (config.socialProviders.length > 0) {
    let socialY = 350
    nodes.push({
      id: nodeId.toString(),
      type: "socialLogin",
      position: { x: 400, y: socialY },
      data: { label: "Social Providers" }
    })
    nodeId++
    socialY += 100
    
    config.socialProviders.forEach(provider => {
      nodes.push({
        id: nodeId.toString(),
        type: `oauth${provider}`,
        position: { x: 600, y: socialY },
        data: { label: `${provider} OAuth` }
      })
      nodeId++
      socialY += 80
    })
  }
  
  // Plugins
  if (config.plugins.length > 0) {
    let pluginY = 500
    nodes.push({
      id: nodeId.toString(),
      type: "plugins",
      position: { x: 800, y: pluginY },
      data: { label: "Plugins" }
    })
    nodeId++
    pluginY += 100
    
    config.plugins.forEach(plugin => {
      if (plugin.startsWith('Polar')) {
        nodes.push({
          id: nodeId.toString(),
          type: "polarPlugin",
          position: { x: 1000, y: pluginY },
          data: { label: plugin }
        })
      } else {
        nodes.push({
          id: nodeId.toString(),
          type: "nextCookies",
          position: { x: 1000, y: pluginY },
          data: { label: plugin }
        })
      }
      nodeId++
      pluginY += 80
    })
  }
  
  return nodes
}

function generateEdges(nodes) {
  const edges = []
  
  // Connect auth starter to main nodes
  for (let i = 1; i < nodes.length; i++) {
    edges.push({
      id: `e1-${nodes[i].id}`,
      source: "1",
      target: nodes[i].id,
      animated: true
    })
  }
  
  return edges
}

async function launchStudio(port, configPath) {
  return new Promise((resolve, reject) => {
    const cliDir = path.dirname(__dirname)
    
    const env = {
      ...process.env,
      BETTER_AUTH_PULSE_CONFIG: configPath,
      PORT: port.toString(),
      NODE_ENV: 'development'
    }
    
    // Detect package manager
    const detectPM = () => {
      if (fs.existsSync('pnpm-lock.yaml')) return 'pnpm'
      if (fs.existsSync('yarn.lock')) return 'yarn'
      return 'npm'
    }
    
    const pm = detectPM()
    
    const server = spawn(pm, ['run', 'dev'], {
      cwd: cliDir,
      env,
      stdio: 'pipe'
    })
    
    let serverReady = false
    
    server.stdout.on('data', (data) => {
      const output = data.toString()
      
      if ((output.includes('Ready') || output.includes('Local:') || output.includes('started server')) && !serverReady) {
        serverReady = true
        const url = `http://localhost:${port}`
        
        global.setTimeout(() => {
          log.success(`🎉 Better Auth Pulse Studio is ready!`)
          log.info(`🌐 Studio URL: ${pc.cyan(url)}`)
          log.info('')
          log.info('📋 Available actions:')
          log.info('  • Edit your auth flow visually')
          log.info('  • Generate auth UI components') 
          log.info('  • Export updated configuration')
          log.info('  • Download environment templates')
          log.info('')
          log.warning('Press Ctrl+C to stop the server')
          
          // Try to open browser
          try {
            const open = require('open')
            open(url).catch(() => {})
          } catch {}
          
          resolve()
        }, 1000)
      }
    })
    
    server.stderr.on('data', (data) => {
      const errorOutput = data.toString()
      if (errorOutput.includes('Error:')) {
        log.error(errorOutput.trim())
      }
    })
    
    server.on('close', (code) => {
      if (code === 0) {
        log.success('👋 Better Auth Pulse Studio stopped gracefully')
      } else {
        log.warning(`⚠️  Studio stopped with exit code: ${code}`)
      }
      process.exit(code || 0)
    })
    
    server.on('error', (error) => {
      reject(new Error(`Failed to start server: ${error.message}`))
    })
    
    // Handle Ctrl+C
    process.on('SIGINT', () => {
      log.warning('🛑 Stopping Better Auth Pulse Studio...')
      server.kill('SIGTERM')
      global.setTimeout(() => server.kill('SIGKILL'), 5000)
    })
    
    // Timeout
    global.setTimeout(() => {
      if (!serverReady) {
        reject(new Error('Server failed to start within 60 seconds'))
      }
    }, 60000)
  })
}

async function main() {
  // Handle help and version flags
  if (flags.help) {
    showHelp()
    return
  }
  
  if (flags.version) {
    showVersion()
    return
  }
  
  intro(pc.cyan('🚀 Better Auth Pulse CLI'))
  
  try {
    let authFilePath = ''
    
    // Use specified file or find one
    if (flags.file) {
      authFilePath = flags.file
      log.info(`📄 Using specified file: ${pc.cyan(authFilePath)}`)
    } else {
      // Scan for auth files
      const s = spinner()
      s.start('📁 Scanning for better-auth configuration files...')
      
      let foundFiles = await findAuthFiles(false)
      
      if (foundFiles.length === 0 && flags.scan) {
        s.message('🔍 Performing deep scan...')
        foundFiles = await findAuthFiles(true)
      }
      
      s.stop()
      
      if (foundFiles.length === 0) {
        log.warning('⚠️  No auth files found automatically')
        if (!flags.scan) {
          note('💡 Try using --scan flag for deep project scanning', 'Tip')
        }
        
        authFilePath = await text({
          message: '🔍 Enter path to your auth.ts file:',
          placeholder: 'lib/auth.ts',
          validate: (value) => {
            if (!value.trim()) return 'Please enter a valid path'
          }
        })
        
        if (isCancel(authFilePath)) {
          cancel('Operation cancelled')
          process.exit(0)
        }
      } else if (foundFiles.length === 1 && flags.auto) {
        authFilePath = foundFiles[0]
        log.success(`🎯 Auto-selected: ${pc.cyan(authFilePath)}`)
      } else {
        log.success(`✅ Found ${foundFiles.length} auth configuration file(s):`)
        foundFiles.forEach((file, i) => {
          log.info(`  ${i + 1}. ${pc.dim(file)}`)
        })
        
        if (foundFiles.length === 1) {
          authFilePath = foundFiles[0]
        } else {
          const choices = [
            ...foundFiles.map(file => ({ value: file, label: file })),
            { value: 'custom', label: 'Enter custom path' }
          ]
          
          const selected = await select({
            message: '📋 Select an auth file:',
            options: choices
          })
          
          if (isCancel(selected)) {
            cancel('Operation cancelled')
            process.exit(0)
          }
          
          if (selected === 'custom') {
            authFilePath = await text({
              message: '🔍 Enter path to your auth.ts file:',
              placeholder: 'lib/auth.ts',
              validate: (value) => {
                if (!value.trim()) return 'Please enter a valid path'
              }
            })
            
            if (isCancel(authFilePath)) {
              cancel('Operation cancelled')
              process.exit(0)
            }
          } else {
            authFilePath = selected
          }
        }
      }
    }
    
    // Read and parse auth file
    const s2 = spinner()
    s2.start('📖 Reading auth configuration...')
    
    try {
      const fullPath = path.resolve(process.cwd(), authFilePath)
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`File not found: ${authFilePath}`)
      }
      
      const authContent = fs.readFileSync(fullPath, 'utf-8')
      
      if (!authContent.includes('betterAuth') && !authContent.includes('better-auth')) {
        throw new Error('File does not appear to be a better-auth configuration')
      }
      
      const config = parseAuthConfig(authContent)
      s2.stop('✅ Configuration extracted successfully!')
      
      // Show detected features
      log.info('')
      log.info(pc.cyan('🎯 Detected features:'))
      
      if (config.database) {
        log.info(`  • Database: ${config.database} with ${config.databaseProvider?.toUpperCase()}`)
      }
      
      if (config.features.length > 0) {
        config.features.forEach(feature => {
          log.info(`  • ${feature}`)
        })
      }
      
      if (config.userFields.length > 0) {
        log.info(`  • User Fields: ${config.userFields.join(', ')}`)
      }
      
      if (config.socialProviders.length > 0) {
        log.info(`  • OAuth Providers: ${config.socialProviders.join(', ')}`)
      }
      
      if (config.plugins.length > 0) {
        config.plugins.forEach(plugin => {
          log.info(`  • ${plugin}`)
        })
      }
      
      // Generate configuration
      const s3 = spinner()
      s3.start('🔄 Generating visual configuration...')
      
      const nodes = generateNodes(config)
      const edges = generateEdges(nodes)
      
      const configData = {
        metadata: {
          sourceFile: authFilePath,
          generatedAt: new Date().toISOString(),
          version: '1.0.0',
          cli: 'clack'
        },
        nodes,
        edges,
        authContent,
        parsedConfig: config
      }
      
      const configPath = path.join(process.cwd(), '.better-auth-pulse.config.json')
      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2))
      
      s3.stop(`📄 Configuration saved to: ${pc.dim(configPath)}`)
      
      // Launch studio
      log.info('')
      log.success('🌐 Starting Better Auth Pulse Studio...')
      log.info(`🌍 Server will start on port ${pc.cyan(flags.port)}`)
      
      await launchStudio(flags.port, configPath)
      
    } catch (error) {
      s2.stop()
      throw error
    }
    
  } catch (error) {
    log.error(`❌ ${error.message}`)
    
    if (error.message.includes('File not found')) {
      note('Make sure the file path is correct and the file exists', 'Troubleshooting')
    } else if (error.message.includes('better-auth configuration')) {
      note('Ensure the file contains betterAuth configuration', 'Troubleshooting')
    }
    
    outro(pc.red('Failed to start Better Auth Pulse'))
    process.exit(1)
  }
}

// Run the CLI
main().catch(console.error)