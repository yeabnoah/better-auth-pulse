import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }
    
    // Security: Only allow reading from specific directories and file types
    const allowedExtensions = ['.ts', '.js', '.json'];
    
    const extension = filePath.substring(filePath.lastIndexOf('.'));
    if (!allowedExtensions.includes(extension)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 403 }
      );
    }
    
    // Prevent directory traversal
    if (filePath.includes('..') || filePath.includes('~')) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 403 }
      );
    }
    
    try {
      // Try to read from the project root
      const projectRoot = process.cwd();
      const fullPath = resolve(projectRoot, filePath);
      
      // Ensure the resolved path is still within the project
      if (!fullPath.startsWith(projectRoot)) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
      
      const content = await readFile(fullPath, 'utf-8');
      
      // Verify it's a better-auth file
      if (!content.includes('betterAuth') && !content.includes('better-auth')) {
        return NextResponse.json(
          { error: 'File does not appear to be a better-auth configuration' },
          { status: 400 }
        );
      }
      
      return NextResponse.json({ content });
      
    } catch (err) {
      return NextResponse.json(
        { error: `Could not read file: ${err instanceof Error ? err.message : 'Unknown error'}` },
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