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
  export: args.includes('--export') || args.includes('-e'),
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
  -e, --export         Export JSON config only (no studio)
  -h, --help           Show this help
  -v, --version        Show version

${pc.bold('EXAMPLES:')}
  better-auth-pulse
  better-auth-pulse --file=lib/auth.ts
  better-auth-pulse --scan --auto
  better-auth-pulse --port=4000
  better-auth-pulse --export --file=lib/auth.ts
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

// Enhanced auth.ts parser based on the main codebase
function parseAuthConfig(content) {
  const config = {
    hasDatabase: false,
    databaseProvider: 'sqlite',
    hasEmailPassword: false,
    emailPasswordConfig: {},
    hasEmailVerification: false,
    emailVerificationConfig: {},
    socialProviders: [],
    hasAccountLinking: false,
    accountLinkingConfig: {},
    hasRateLimit: false,
    rateLimitConfig: {},
    hasAdvanced: false,
    advancedConfig: {}
  }
  
  // Database detection
  if (content.includes('drizzleAdapter')) {
    config.hasDatabase = true
    config.database = 'drizzle'
    const providerMatch = content.match(/provider:\s*["'](\w+)["']/)
    config.databaseProvider = providerMatch ? providerMatch[1] : 'sqlite'
  } else if (content.includes('prismaAdapter')) {
    config.hasDatabase = true
    config.database = 'prisma'
    const providerMatch = content.match(/provider:\s*["'](\w+)["']/)
    config.databaseProvider = providerMatch ? providerMatch[1] : 'sqlite'
  }
  
  // Email and password configuration
  if (content.includes('emailAndPassword')) {
    config.hasEmailPassword = true
    config.features = config.features || []
    config.features.push('Email & Password')
    
    const emailPasswordMatch = content.match(/emailAndPassword:\s*{([^}]+)}/s)
    if (emailPasswordMatch) {
      const configText = emailPasswordMatch[1]
      config.emailPasswordConfig = {
        minLength: extractValue(configText, 'minPasswordLength') || 8,
        maxLength: extractValue(configText, 'maxPasswordLength') || 128,
        requireVerification: extractBooleanValue(configText, 'requireEmailVerification') || false,
        autoSignIn: extractBooleanValue(configText, 'autoSignIn') || true,
        resetTokenExpiresIn: extractValue(configText, 'resetPasswordTokenExpiresIn') || 3600
      }
    }
  }
  
  // Email verification
  if (content.includes('emailVerification')) {
    config.hasEmailVerification = true
    config.features = config.features || []
    config.features.push('Email Verification')
    
    const emailVerificationMatch = content.match(/emailVerification:\s*{([^}]+)}/s)
    if (emailVerificationMatch) {
      const configText = emailVerificationMatch[1]
      config.emailVerificationConfig = {
        sendOnSignUp: extractBooleanValue(configText, 'sendOnSignUp') || true,
        sendOnSignIn: extractBooleanValue(configText, 'sendOnSignIn') || false,
        autoSignInAfterVerification: extractBooleanValue(configText, 'autoSignInAfterVerification') || true,
        tokenExpiresIn: extractValue(configText, 'tokenExpiresIn') || 3600
      }
    }
  }
  
  // Social providers
  config.socialProviders = []
  if (content.includes('google:')) config.socialProviders.push('google')
  if (content.includes('github:')) config.socialProviders.push('github')
  if (content.includes('discord:')) config.socialProviders.push('discord')
  if (content.includes('facebook:')) config.socialProviders.push('facebook')
  if (content.includes('twitter:')) config.socialProviders.push('twitter')
  if (content.includes('linkedin:')) config.socialProviders.push('linkedin')
  
  // Account linking
  if (content.includes('accountLinking')) {
    config.hasAccountLinking = true
    const accountMatch = content.match(/accountLinking:\s*{([^}]+)}/s)
    if (accountMatch) {
      const configText = accountMatch[1]
      config.accountLinkingConfig = {
        trustedProviders: extractArrayValue(configText, 'trustedProviders') || [],
        allowDifferentEmails: extractBooleanValue(configText, 'allowDifferentEmails') || false
      }
    }
  }
  
  // Rate limiting
  if (content.includes('rateLimit')) {
    config.hasRateLimit = true
    const rateLimitMatch = content.match(/rateLimit:\s*{([^}]+)}/s)
    if (rateLimitMatch) {
      const configText = rateLimitMatch[1]
      config.rateLimitConfig = {
        window: extractValue(configText, 'window') || 60,
        maxRequests: extractValue(configText, 'max') || 100,
        customRules: extractObjectValue(configText, 'customRules') || {}
      }
    }
  }
  
  // Advanced options
  if (content.includes('useSecureCookies') || content.includes('cookiePrefix')) {
    config.hasAdvanced = true
    config.advancedConfig = {
      useSecureCookies: true,
      httpOnlyCookies: true,
      secureCookies: true
    }
  }
  
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

// Helper functions for parsing
function extractValue(text, key) {
  const match = text.match(new RegExp(`${key}:\\s*(\\d+)`))
  return match ? parseInt(match[1]) : null
}

function extractBooleanValue(text, key) {
  const match = text.match(new RegExp(`${key}:\\s*(true|false)`))
  return match ? match[1] === 'true' : null
}

function extractArrayValue(text, key) {
  const match = text.match(new RegExp(`${key}:\\s*\\[([^\\]]+)\\]`))
  if (match) {
    return match[1].split(',').map(s => s.trim().replace(/['"]/g, ''))
  }
  return null
}

function extractObjectValue(text, key) {
  const match = text.match(new RegExp(`${key}:\\s*({[^}]+})`))
  if (match) {
    try {
      return JSON.parse(match[1].replace(/(\w+):/g, '"$1":'))
    } catch {
      return {}
    }
  }
  return null
}

// Convert parsed config to JSON format compatible with the main codebase
function convertToJsonFormat(config) {
  const jsonConfig = {
    database: config.hasDatabase ? {
      type: config.database || 'prisma',
      provider: config.databaseProvider || 'sqlite'
    } : null,
    
    emailPassword: config.hasEmailPassword ? {
      enabled: true,
      ...config.emailPasswordConfig
    } : null,
    
    emailVerification: config.hasEmailVerification ? {
      enabled: true,
      ...config.emailVerificationConfig
    } : null,
    
    socialProviders: config.socialProviders && config.socialProviders.length > 0 ? 
      config.socialProviders.reduce((acc, provider) => {
        acc[provider] = { enabled: true }
        return acc
      }, {}) : null,
    
    accountLinking: config.hasAccountLinking ? {
      enabled: true,
      ...config.accountLinkingConfig
    } : null,
    
    rateLimit: config.hasRateLimit ? {
      enabled: true,
      ...config.rateLimitConfig
    } : null,
    
    advanced: config.hasAdvanced ? {
      enabled: true,
      ...config.advancedConfig
    } : null,
    
    userFields: config.userFields && config.userFields.length > 0 ? config.userFields : null,
    
    plugins: config.plugins && config.plugins.length > 0 ? config.plugins : null
  }
  
  // Remove null values
  Object.keys(jsonConfig).forEach(key => {
    if (jsonConfig[key] === null) {
      delete jsonConfig[key]
    }
  })
  
  return jsonConfig
}

function generateNodes(config) {
  const nodes = [{
    id: "1",
    type: "authStarter", 
    position: { x: 0, y: 0 },
    data: { label: "Auth Start" }
  }]
  
  const edges = []
  let nodeId = 2
  let yPosition = 150
  const authStarterId = "1"
  
  // Database chain if present
  if (config.hasDatabase) {
    const databaseId = nodeId.toString()
    nodes.push({
      id: databaseId,
      type: "database",
      position: { x: 0, y: yPosition },
      data: { label: "Database" }
    })
    edges.push({
      id: `e${authStarterId}-${databaseId}`,
      source: authStarterId,
      target: databaseId,
      animated: true
    })
    nodeId++
    yPosition += 150
    
    const adapterId = nodeId.toString()
    nodes.push({
      id: adapterId,
      type: config.database || "prisma",
      position: { x: 0, y: yPosition },
      data: { label: `${(config.database || "prisma").charAt(0).toUpperCase()}${(config.database || "prisma").slice(1)} Adapter` }
    })
    edges.push({
      id: `e${databaseId}-${adapterId}`,
      source: databaseId,
      target: adapterId,
      animated: true
    })
    nodeId++
    yPosition += 150
    
    const providerId = nodeId.toString()
    nodes.push({
      id: providerId,
      type: "provider",
      position: { x: 0, y: yPosition },
      data: { label: "DB Provider" }
    })
    edges.push({
      id: `e${adapterId}-${providerId}`,
      source: adapterId,
      target: providerId,
      animated: true
    })
    nodeId++
    yPosition += 150
    
    const dbTypeId = nodeId.toString()
    nodes.push({
      id: dbTypeId,
      type: config.databaseProvider || "sqlite",
      position: { x: 0, y: yPosition },
      data: { label: (config.databaseProvider || "sqlite").toUpperCase() }
    })
    edges.push({
      id: `e${providerId}-${dbTypeId}`,
      source: providerId,
      target: dbTypeId,
      animated: true
    })
    nodeId++
  }
  
  // Email authentication if present
  if (config.hasEmailPassword) {
    const emailAuthId = nodeId.toString()
    nodes.push({
      id: emailAuthId,
      type: "emailAuth",
      position: { x: 400, y: 0 },
      data: {
        label: "Email + Password Auth",
        ...config.emailPasswordConfig
      }
    })
    edges.push({
      id: `e${authStarterId}-${emailAuthId}`,
      source: authStarterId,
      target: emailAuthId,
      animated: true
    })
    nodeId++
    
    // Add email verification if present
    if (config.hasEmailVerification) {
      const emailVerificationId = nodeId.toString()
      nodes.push({
        id: emailVerificationId,
        type: "emailVerification",
        position: { x: 600, y: 0 },
        data: {
          label: "Email Verification",
          ...config.emailVerificationConfig
        }
      })
      edges.push({
        id: `e${emailAuthId}-${emailVerificationId}`,
        source: emailAuthId,
        target: emailVerificationId,
        animated: true
      })
      nodeId++
    }
    
    // Add rate limiting if present
    if (config.hasRateLimit) {
      const rateLimitId = nodeId.toString()
      nodes.push({
        id: rateLimitId,
        type: "rateLimit",
        position: { x: 400, y: 600 },
        data: {
          label: "Rate Limiting",
          ...config.rateLimitConfig
        }
      })
      edges.push({
        id: `e${emailAuthId}-${rateLimitId}`,
        source: emailAuthId,
        target: rateLimitId,
        animated: true
      })
      nodeId++
    }
  }
  
  // Social login if present
  if (config.socialProviders && config.socialProviders.length > 0) {
    const socialLoginId = nodeId.toString()
    nodes.push({
      id: socialLoginId,
      type: "socialLogin",
      position: { x: 400, y: 200 },
      data: { label: "Social Login Providers" }
    })
    edges.push({
      id: `e${authStarterId}-${socialLoginId}`,
      source: authStarterId,
      target: socialLoginId,
      animated: true
    })
    nodeId++
    
    // Add individual social providers
    config.socialProviders.forEach((provider, index) => {
      const providerId = nodeId.toString()
      nodes.push({
        id: providerId,
        type: `oauth${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
        position: { x: 600 + (index * 200), y: 300 },
        data: { label: `${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth` }
      })
      edges.push({
        id: `e${socialLoginId}-${providerId}`,
        source: socialLoginId,
        target: providerId,
        animated: true
      })
      nodeId++
    })
    
    // Add account linking if present
    if (config.hasAccountLinking) {
      const accountId = nodeId.toString()
      nodes.push({
        id: accountId,
        type: "account",
        position: { x: 600, y: 450 },
        data: {
          label: "Account Linking",
          ...config.accountLinkingConfig
        }
      })
      edges.push({
        id: `e${socialLoginId}-${accountId}`,
        source: socialLoginId,
        target: accountId,
        animated: true
      })
      nodeId++
      
      // Add advanced options if present
      if (config.hasAdvanced) {
        const advancedId = nodeId.toString()
        nodes.push({
          id: advancedId,
          type: "advanced",
          position: { x: 600, y: 600 },
          data: {
            label: "Advanced Options",
            ...config.advancedConfig
          }
        })
        edges.push({
          id: `e${accountId}-${advancedId}`,
          source: accountId,
          target: advancedId,
          animated: true
        })
        nodeId++
      }
    }
  }
  
  return { nodes, edges }
}

// Helper functions for studio management
async function checkStudioInstalled() {
  return new Promise((resolve) => {
    const check = spawn('npx', ['better-auth-pulse-studio', '--version'], {
      stdio: 'pipe'
    })
    
    check.on('close', (code) => {
      resolve(code === 0)
    })
    
    check.on('error', () => {
      resolve(false)
    })
  })
}

async function installStudio() {
  return new Promise((resolve, reject) => {
    const install = spawn('npm', ['install', '-g', 'better-auth-pulse-studio'], {
      stdio: 'pipe'
    })
    
    install.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error('Failed to install studio'))
      }
    })
    
    install.on('error', reject)
  })
}

// Note: generateEdges is now integrated into generateNodes function
// This function is kept for backward compatibility but is no longer used
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
  return new Promise(async (resolve, reject) => {
    // Check if studio is installed globally
    const studioInstalled = await checkStudioInstalled()
    
    if (!studioInstalled) {
      log.info('📦 Installing Better Auth Pulse Studio...')
      await installStudio()
    }
    
    const env = {
      ...process.env,
      BETTER_AUTH_PULSE_CONFIG: configPath,
      PORT: port.toString(),
      NODE_ENV: 'development'
    }
    
    // Launch studio using npx
    const server = spawn('npx', ['better-auth-pulse-studio'], {
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
      
      const fileContent = fs.readFileSync(fullPath, 'utf-8')
      
      let authContent, config
      
      // Check if it's a JSON config file
      if (fullPath.endsWith('.json')) {
        try {
          const jsonConfig = JSON.parse(fileContent)
          authContent = jsonConfig.authContent || ''
          config = jsonConfig.parsedConfig || parseAuthConfig(authContent)
        } catch (error) {
          throw new Error('Invalid JSON config file')
        }
      } else {
        // It's an auth.ts file
        authContent = fileContent
        
        if (!authContent.includes('betterAuth') && !authContent.includes('better-auth')) {
          throw new Error('File does not appear to be a better-auth configuration')
        }
        
        config = parseAuthConfig(authContent)
      }
      s2.stop('✅ Configuration extracted successfully!')
      
      // Show detected features
      log.info('')
      log.info(pc.cyan('🎯 Detected features:'))
      
      if (config.hasDatabase) {
        log.info(`  • Database: ${config.database || 'prisma'} with ${config.databaseProvider?.toUpperCase()}`)
      }
      
      if (config.hasEmailPassword) {
        log.info(`  • Email & Password Authentication`)
        if (config.emailPasswordConfig.minLength) {
          log.info(`    - Password length: ${config.emailPasswordConfig.minLength}-${config.emailPasswordConfig.maxLength} chars`)
        }
        if (config.emailPasswordConfig.requireVerification) {
          log.info(`    - Email verification required`)
        }
      }
      
      if (config.hasEmailVerification) {
        log.info(`  • Email Verification`)
        if (config.emailVerificationConfig.sendOnSignUp) {
          log.info(`    - Verification on signup`)
        }
        if (config.emailVerificationConfig.tokenExpiresIn) {
          log.info(`    - Token expires in: ${config.emailVerificationConfig.tokenExpiresIn}s`)
        }
      }
      
      if (config.socialProviders && config.socialProviders.length > 0) {
        log.info(`  • OAuth Providers: ${config.socialProviders.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}`)
      }
      
      if (config.hasAccountLinking) {
        log.info(`  • Account Linking`)
        if (config.accountLinkingConfig.trustedProviders?.length > 0) {
          log.info(`    - Trusted providers: ${config.accountLinkingConfig.trustedProviders.join(', ')}`)
        }
      }
      
      if (config.hasRateLimit) {
        log.info(`  • Rate Limiting`)
        log.info(`    - Window: ${config.rateLimitConfig.window}s, Max: ${config.rateLimitConfig.maxRequests} requests`)
      }
      
      if (config.hasAdvanced) {
        log.info(`  • Advanced Security Options`)
        log.info(`    - Secure cookies enabled`)
      }
      
      if (config.userFields && config.userFields.length > 0) {
        log.info(`  • User Fields: ${config.userFields.join(', ')}`)
      }
      
      if (config.plugins && config.plugins.length > 0) {
        config.plugins.forEach(plugin => {
          log.info(`  • ${plugin}`)
        })
      }
      
      // Generate configuration
      const s3 = spinner()
      s3.start('🔄 Generating visual configuration...')
      
      const { nodes, edges } = generateNodes(config)
      
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
        parsedConfig: config,
        jsonConfig: convertToJsonFormat(config)
      }
      
      const configPath = path.join(process.cwd(), '.better-auth-pulse.config.json')
      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2))
      
      // Also save a standalone JSON config for easy integration
      const jsonConfigPath = path.join(process.cwd(), 'auth-config.json')
      fs.writeFileSync(jsonConfigPath, JSON.stringify(convertToJsonFormat(config), null, 2))
      
      s3.stop(`📄 Configuration saved to: ${pc.dim(configPath)}`)
      log.info(`📄 JSON config saved to: ${pc.dim(jsonConfigPath)}`)
      
      // If export flag is set, exit after generating files
      if (flags.export) {
        log.info('')
        log.success('✅ Export completed successfully!')
        log.info('')
        log.info('📁 Generated files:')
        log.info(`  • ${pc.cyan(configPath)} - Full configuration with nodes/edges`)
        log.info(`  • ${pc.cyan(jsonConfigPath)} - JSON configuration only`)
        log.info('')
        log.info('💡 You can now use these files with your Better Auth Pulse setup')
        outro(pc.green('Export completed!'))
        return
      }
      
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