#!/usr/bin/env node

console.log('🚀 Better Auth Pulse CLI - Debug Version');
console.log('Args:', process.argv);

const args = process.argv.slice(2);
console.log('Parsed args:', args);

if (args.includes('--help') || args.includes('-h')) {
  console.log('Help requested');
  console.log('USAGE: better-auth-pulse [options]');
  console.log('OPTIONS:');
  console.log('  --file, -f <path>     Specify auth.ts file path');
  console.log('  --help, -h           Show this help message');
  process.exit(0);
}

console.log('CLI is working!');