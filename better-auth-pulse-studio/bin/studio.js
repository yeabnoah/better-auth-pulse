#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require('path')

// Get config path from environment
const configPath = process.env.BETTER_AUTH_PULSE_CONFIG
const port = process.env.PORT || '3001'

if (!configPath) {
  console.error('❌ BETTER_AUTH_PULSE_CONFIG environment variable is required')
  process.exit(1)
}

// Launch Next.js dev server
const server = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  env: {
    ...process.env,
    PORT: port,
    BETTER_AUTH_PULSE_CONFIG: configPath
  },
  stdio: 'inherit'
})

server.on('close', (code) => {
  process.exit(code)
})

server.on('error', (error) => {
  console.error('Failed to start studio:', error.message)
  process.exit(1)
})

// Handle Ctrl+C
process.on('SIGINT', () => {
  server.kill('SIGTERM')
  setTimeout(() => server.kill('SIGKILL'), 5000)
})
