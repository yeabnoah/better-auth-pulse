#!/usr/bin/env node

/**
 * Prepare Better Auth Pulse for NPM publishing
 * Validates package, builds, and checks everything is ready
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Preparing Better Auth Pulse for NPM publishing...\n');

const checks = [];

// Check 1: Package.json validation
function validatePackageJson() {
  console.log('🔍 Validating package.json...');
  
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const required = ['name', 'version', 'description', 'main', 'bin', 'keywords', 'author', 'license'];
    const missing = required.filter(field => !pkg[field]);
    
    if (missing.length > 0) {
      console.log(`❌ Missing required fields: ${missing.join(', ')}`);
      return false;
    }
    
    if (!pkg.bin['better-auth-pulse']) {
      console.log('❌ Missing bin entry for better-auth-pulse');
      return false;
    }
    
    console.log('✅ package.json is valid');
    return true;
  } catch (error) {
    console.log('❌ Invalid package.json:', error.message);
    return false;
  }
}

// Check 2: Required files exist
function validateFiles() {
  console.log('🔍 Validating required files...');
  
  const requiredFiles = [
    'bin/better-auth-pulse.js',
    'lib/cli-utils.js',
    'utils/parseAuthToNodes.ts',
    'utils/convertPulseConfigToFlowNodes.ts',
    'component/starter.tsx',
    'README.md',
    'package.json'
  ];
  
  const missing = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missing.length > 0) {
    console.log(`❌ Missing files: ${missing.join(', ')}`);
    return false;
  }
  
  console.log('✅ All required files present');
  return true;
}

// Check 3: CLI executable
function validateCLI() {
  console.log('🔍 Validating CLI executable...');
  
  try {
    const stats = fs.statSync('bin/better-auth-pulse.js');
    
    // Check if file has execute permissions
    if (!(stats.mode & parseInt('111', 8))) {
      console.log('⚠️  CLI binary may not be executable, fixing...');
      execSync('chmod +x bin/better-auth-pulse.js');
    }
    
    // Test CLI help
    const output = execSync('node bin/better-auth-pulse.js --help', { encoding: 'utf8' });
    
    if (!output.includes('Better Auth Pulse CLI')) {
      console.log('❌ CLI help output invalid');
      return false;
    }
    
    console.log('✅ CLI executable and working');
    return true;
  } catch (error) {
    console.log('❌ CLI validation failed:', error.message);
    return false;
  }
}

// Check 4: Dependencies
function validateDependencies() {
  console.log('🔍 Validating dependencies...');
  
  try {
    // Check if node_modules exists
    if (!fs.existsSync('node_modules')) {
      console.log('❌ node_modules not found, run npm install');
      return false;
    }
    
    // Check critical dependencies
    const critical = ['next', 'react', 'react-dom', '@xyflow/react'];
    const missing = critical.filter(dep => !fs.existsSync(`node_modules/${dep}`));
    
    if (missing.length > 0) {
      console.log(`❌ Missing critical dependencies: ${missing.join(', ')}`);
      return false;
    }
    
    console.log('✅ Dependencies validated');
    return true;
  } catch (error) {
    console.log('❌ Dependency validation failed:', error.message);
    return false;
  }
}

// Check 5: Build process
function validateBuild() {
  console.log('🔍 Testing build process...');
  
  try {
    console.log('  Building Next.js app...');
    execSync('npm run build', { stdio: 'pipe' });
    
    if (!fs.existsSync('.next')) {
      console.log('❌ Build output not found');
      return false;
    }
    
    console.log('✅ Build process successful');
    return true;
  } catch (error) {
    console.log('❌ Build failed:', error.message);
    return false;
  }
}

// Check 6: Package size
function validatePackageSize() {
  console.log('🔍 Checking package size...');
  
  try {
    // Create a test package
    execSync('npm pack --dry-run', { stdio: 'pipe' });
    
    console.log('✅ Package creation successful');
    return true;
  } catch (error) {
    console.log('❌ Package creation failed:', error.message);
    return false;
  }
}

// Run all checks
async function runChecks() {
  const results = [
    { name: 'Package.json', check: validatePackageJson },
    { name: 'Required Files', check: validateFiles },
    { name: 'CLI Executable', check: validateCLI },
    { name: 'Dependencies', check: validateDependencies },
    { name: 'Build Process', check: validateBuild },
    { name: 'Package Size', check: validatePackageSize }
  ];
  
  console.log('🧪 Running validation checks...\n');
  
  let allPassed = true;
  
  for (const { name, check } of results) {
    const passed = check();
    checks.push({ name, passed });
    
    if (!passed) {
      allPassed = false;
    }
    
    console.log('');
  }
  
  return allPassed;
}

// Generate report
function generateReport(allPassed) {
  console.log('📊 Validation Report');
  console.log('═'.repeat(50));
  
  checks.forEach(({ name, passed }) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${name}`);
  });
  
  console.log('═'.repeat(50));
  
  if (allPassed) {
    console.log('🎉 All checks passed! Ready for publishing.');
    console.log('');
    console.log('📋 Next steps:');
    console.log('  1. npm login');
    console.log('  2. npm publish');
    console.log('  3. Test installation: npm install -g better-auth-pulse');
    console.log('');
    console.log('🚀 Publishing command:');
    console.log('  npm publish --access public');
  } else {
    console.log('❌ Some checks failed. Please fix the issues above before publishing.');
    process.exit(1);
  }
}

// Main execution
runChecks().then(generateReport).catch(error => {
  console.error('💥 Validation failed:', error.message);
  process.exit(1);
});