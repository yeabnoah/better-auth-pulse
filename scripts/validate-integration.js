#!/usr/bin/env node

/**
 * Validation script for Better Auth Pulse CLI Integration
 * Checks that all components are properly integrated and working
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Better Auth Pulse CLI Integration...\n');

const requiredFiles = [
  'component/starter.tsx',
  'component/AuthExtractor.tsx', 
  'component/CLIInterface.tsx',
  'utils/fileSystemAccess.ts',
  'utils/parseAuthToNodes.ts',
  'utils/convertPulseConfigToFlowNodes.ts',
  'app/api/read-file/route.ts',
  'app/api/list-files/route.ts'
];

const requiredFunctions = [
  { file: 'utils/fileSystemAccess.ts', functions: ['readAuthFile', 'findAuthFiles', 'AUTH_FILE_PATTERNS'] },
  { file: 'utils/parseAuthToNodes.ts', functions: ['generateNodesFromAuthFile'] },
  { file: 'utils/convertPulseConfigToFlowNodes.ts', functions: ['convertPulseConfigToFlowNodes', 'convertFlowNodesToPulseConfig'] }
];

const requiredComponents = [
  { file: 'component/starter.tsx', components: ['AuthExtractor', 'CLIInterface'] },
  { file: 'component/AuthExtractor.tsx', components: ['AuthExtractor'] },
  { file: 'component/CLIInterface.tsx', components: ['CLIInterface'] }
];

let allValid = true;

// Check required files exist
console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allValid = false;
  }
});

// Check required functions are exported
console.log('\n🔧 Checking required functions...');
requiredFunctions.forEach(({ file, functions }) => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    functions.forEach(func => {
      if (content.includes(`export`) && content.includes(func)) {
        console.log(`  ✅ ${file} exports ${func}`);
      } else {
        console.log(`  ❌ ${file} missing export: ${func}`);
        allValid = false;
      }
    });
  }
});

// Check component imports
console.log('\n📦 Checking component imports...');
requiredComponents.forEach(({ file, components }) => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    components.forEach(component => {
      if (content.includes(`import`) && content.includes(component)) {
        console.log(`  ✅ ${file} imports ${component}`);
      } else if (content.includes(`export default function ${component}`) || content.includes(`function ${component}`)) {
        console.log(`  ✅ ${file} defines ${component}`);
      } else {
        console.log(`  ❌ ${file} missing component: ${component}`);
        allValid = false;
      }
    });
  }
});

// Check API routes
console.log('\n🌐 Checking API routes...');
const apiRoutes = ['app/api/read-file/route.ts', 'app/api/list-files/route.ts'];
apiRoutes.forEach(route => {
  if (fs.existsSync(route)) {
    const content = fs.readFileSync(route, 'utf8');
    if (content.includes('export async function GET')) {
      console.log(`  ✅ ${route} has GET handler`);
    } else {
      console.log(`  ❌ ${route} missing GET handler`);
      allValid = false;
    }
  }
});

// Check integration points in starter.tsx
console.log('\n🔗 Checking integration points...');
if (fs.existsSync('component/starter.tsx')) {
  const starterContent = fs.readFileSync('component/starter.tsx', 'utf8');
  
  const integrationChecks = [
    { check: 'showAuthExtractor', description: 'Auth Extractor state' },
    { check: 'showCLI', description: 'CLI Interface state' },
    { check: 'handleAuthExtracted', description: 'Auth extraction handler' },
    { check: 'onImportAuth', description: 'Import auth prop' },
    { check: 'onOpenCLI', description: 'Open CLI prop' }
  ];
  
  integrationChecks.forEach(({ check, description }) => {
    if (starterContent.includes(check)) {
      console.log(`  ✅ ${description} integrated`);
    } else {
      console.log(`  ❌ ${description} missing`);
      allValid = false;
    }
  });
}

// Final result
console.log('\n' + '='.repeat(50));
if (allValid) {
  console.log('🎉 All validations passed! CLI integration is ready to use.');
  console.log('\n📖 Next steps:');
  console.log('  1. Start your Next.js development server');
  console.log('  2. Open the Better Auth Pulse Studio');
  console.log('  3. Click "Import Auth Config" or "CLI Mode"');
  console.log('  4. Follow the prompts to import your auth configuration');
  console.log('\n📚 Documentation:');
  console.log('  - Quick Start: QUICK-START.md');
  console.log('  - Full Documentation: README-CLI-Integration.md');
} else {
  console.log('❌ Some validations failed. Please check the missing components above.');
  process.exit(1);
}

console.log('\n🚀 Better Auth Pulse CLI Integration validation complete!');