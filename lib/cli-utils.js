/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs').promises;
const path = require('path');

// Common auth file patterns to search for
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

async function findAuthFiles(projectRoot) {
  const foundFiles = [];
  
  for (const pattern of AUTH_FILE_PATTERNS) {
    try {
      const fullPath = path.join(projectRoot, pattern);
      const content = await fs.readFile(fullPath, 'utf-8');
      
      // Check if it's a better-auth file
      if (content.includes('betterAuth') || content.includes('better-auth')) {
        foundFiles.push(pattern);
      }
    } catch {
      // File doesn't exist, continue searching
    }
  }
  
  return foundFiles;
}

async function extractAuthConfig(filePath) {
  try {
    // Resolve relative path from current working directory
    const fullPath = path.resolve(process.cwd(), filePath);
    
    // Check if file exists
    await fs.access(fullPath);
    
    // Read file content
    const content = await fs.readFile(fullPath, 'utf-8');
    
    // Validate it's a better-auth file
    if (!content.includes('betterAuth') && !content.includes('better-auth')) {
      return {
        success: false,
        error: 'File does not appear to be a better-auth configuration'
      };
    }
    
    return {
      success: true,
      content: content,
      path: fullPath
    };
    
  } catch {
    return {
      success: false,
      error: `Could not read file: ${error.message}`
    };
  }
}

async function scanDirectory(dirPath, extensions = ['.ts', '.js']) {
  const files = [];
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and other common directories
        if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(entry.name)) {
          const subFiles = await scanDirectory(fullPath, extensions);
          files.push(...subFiles);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch {
    // Directory not accessible, skip
  }
  
  return files;
}

async function findAllAuthFiles(projectRoot) {
  console.log('🔍 Deep scanning project for auth files...');
  
  const allFiles = await scanDirectory(projectRoot, ['.ts', '.js']);
  const authFiles = [];
  
  for (const file of allFiles) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      
      if (content.includes('betterAuth') || content.includes('better-auth')) {
        const relativePath = path.relative(projectRoot, file);
        authFiles.push(relativePath);
      }
    } catch {
      // Skip files that can't be read
    }
  }
  
  return authFiles;
}

module.exports = {
  findAuthFiles,
  extractAuthConfig,
  scanDirectory,
  findAllAuthFiles,
  AUTH_FILE_PATTERNS
};