#!/usr/bin/env node

/**
 * Test script for Better Auth Pulse CLI
 * Tests the CLI functionality without starting the full server
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🧪 Testing Better Auth Pulse CLI...\n');

async function testCLI() {
  const tests = [
    {
      name: 'CLI Help',
      args: ['--help'],
      expectOutput: ['USAGE:', 'OPTIONS:', 'EXAMPLES:']
    },
    {
      name: 'CLI Version',
      args: ['--version'],
      expectOutput: ['Better Auth Pulse CLI', 'Dependencies:']
    },
    {
      name: 'File Detection',
      args: ['--file=utils/auth.ts', '--scan'],
      expectOutput: ['Using specified file:', 'Reading auth configuration']
    }
  ];

  for (const test of tests) {
    console.log(`🔍 Testing: ${test.name}`);
    
    try {
      const result = await runCLITest(test.args, test.expectOutput);
      if (result.success) {
        console.log(`✅ ${test.name} - PASSED`);
      } else {
        console.log(`❌ ${test.name} - FAILED: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name} - ERROR: ${error.message}`);
    }
    
    console.log('');
  }
}

function runCLITest(args, expectOutput) {
  return new Promise((resolve) => {
    const cliPath = path.join(__dirname, '../bin/better-auth-pulse.js');
    const child = spawn('node', [cliPath, ...args], {
      stdio: 'pipe',
      timeout: 10000
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      // Check if expected output is present
      const hasExpectedOutput = expectOutput.every(expected => 
        output.includes(expected) || errorOutput.includes(expected)
      );

      if (hasExpectedOutput) {
        resolve({ success: true });
      } else {
        resolve({ 
          success: false, 
          error: `Expected output not found. Got: ${output}${errorOutput}` 
        });
      }
    });

    child.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    // Kill process after timeout to prevent hanging
    setTimeout(() => {
      child.kill('SIGTERM');
      resolve({ success: false, error: 'Test timeout' });
    }, 8000);
  });
}

// Test CLI installation
function testInstallation() {
  console.log('📦 Testing CLI installation...');
  
  const packageJson = path.join(__dirname, '../package.json');
  const binFile = path.join(__dirname, '../bin/better-auth-pulse.js');
  const cliUtils = path.join(__dirname, '../lib/cli-utils.js');
  
  const checks = [
    { file: packageJson, name: 'package.json' },
    { file: binFile, name: 'CLI binary' },
    { file: cliUtils, name: 'CLI utilities' }
  ];
  
  let allGood = true;
  
  checks.forEach(({ file, name }) => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${name} exists`);
    } else {
      console.log(`❌ ${name} missing`);
      allGood = false;
    }
  });
  
  // Check if binary is executable
  try {
    const stats = fs.statSync(binFile);
    if (stats.mode & parseInt('111', 8)) {
      console.log('✅ CLI binary is executable');
    } else {
      console.log('⚠️  CLI binary may not be executable');
    }
  } catch (error) {
    console.log('❌ Cannot check CLI binary permissions');
    allGood = false;
  }
  
  console.log('');
  return allGood;
}

// Run tests
async function main() {
  const installationOK = testInstallation();
  
  if (!installationOK) {
    console.log('❌ Installation test failed. Please check the files above.');
    process.exit(1);
  }
  
  await testCLI();
  
  console.log('🎉 CLI testing complete!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('  1. Test in a real project: cd /path/to/your/project && better-auth-pulse');
  console.log('  2. Try different flags: better-auth-pulse --help');
  console.log('  3. Test with existing auth.ts: better-auth-pulse --file=path/to/auth.ts');
}

main().catch(console.error);