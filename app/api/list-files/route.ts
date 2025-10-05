import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { resolve, join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const directory = searchParams.get('dir') || '';
    
    // Security: Only allow listing specific directories
    const allowedDirectories = ['', 'lib', 'src', 'utils', 'config', 'server', 'src/lib', 'src/utils', 'src/config', 'src/server'];
    
    if (!allowedDirectories.includes(directory)) {
      return NextResponse.json(
        { error: 'Directory not allowed' },
        { status: 403 }
      );
    }
    
    // Prevent directory traversal
    if (directory.includes('..') || directory.includes('~')) {
      return NextResponse.json(
        { error: 'Invalid directory path' },
        { status: 403 }
      );
    }
    
    try {
      const projectRoot = process.cwd();
      const fullPath = directory ? resolve(projectRoot, directory) : projectRoot;
      
      // Ensure the resolved path is still within the project
      if (!fullPath.startsWith(projectRoot)) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
      
      const files = await readdir(fullPath);
      const fileList: string[] = [];
      
      for (const file of files) {
        const filePath = join(fullPath, file);
        const stats = await stat(filePath);
        
        if (stats.isFile() && (file.endsWith('.ts') || file.endsWith('.js'))) {
          const relativePath = directory ? join(directory, file) : file;
          fileList.push(relativePath);
        }
      }
      
      return NextResponse.json(fileList);
      
    } catch (err) {
      return NextResponse.json(
        { error: `Could not list directory: ${err instanceof Error ? err.message : 'Unknown error'}` },
        { status: 404 }
      );
    }
    
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}