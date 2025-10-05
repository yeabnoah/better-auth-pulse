// Utility functions for accessing user's project files
// This handles different scenarios: local development, deployed app, etc.

export interface FileAccessResult {
  success: boolean;
  content?: string;
  error?: string;
}

export async function readAuthFile(path: string): Promise<FileAccessResult> {
  try {
    // In a real deployment, this would need to be handled differently
    // For now, we'll try different approaches based on the environment
    
    if (typeof window !== 'undefined') {
      // Client-side: try to fetch from public directory or API
      const response = await fetch(`/api/read-file?path=${encodeURIComponent(path)}`);
      
      if (!response.ok) {
        return {
          success: false,
          error: `Could not read file at ${path}. Make sure the file exists and is accessible.`
        };
      }
      
      const content = await response.text();
      return {
        success: true,
        content
      };
    } else {
      // Server-side: use Node.js fs module
      const fs = await import('fs/promises');
      const pathModule = await import('path');
      
      try {
        const fullPath = pathModule.resolve(process.cwd(), path);
        const content = await fs.readFile(fullPath, 'utf-8');
        
        return {
          success: true,
          content
        };
      } catch (error) {
        return {
          success: false,
          error: `Could not read file at ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to access file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export async function listProjectFiles(directory: string = ''): Promise<string[]> {
  try {
    const response = await fetch(`/api/list-files?dir=${encodeURIComponent(directory)}`);
    
    if (!response.ok) {
      throw new Error('Failed to list files');
    }
    
    const files = await response.json();
    return files.filter((file: string) => file.endsWith('.ts') || file.endsWith('.js'));
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
}

// Common auth file patterns to search for
export const AUTH_FILE_PATTERNS = [
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
  'src/server/auth.ts'
];

export async function findAuthFiles(): Promise<string[]> {
  const foundFiles: string[] = [];
  
  for (const pattern of AUTH_FILE_PATTERNS) {
    try {
      const result = await readAuthFile(pattern);
      if (result.success && result.content?.includes('betterAuth')) {
        foundFiles.push(pattern);
      }
    } catch {
      // File doesn't exist, continue searching
    }
  }
  
  return foundFiles;
}