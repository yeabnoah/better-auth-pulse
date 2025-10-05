# Better Auth Pulse - CLI Integration

This document explains how the Better Auth Pulse CLI functionality has been integrated directly into the Next.js Studio app.

## Overview

The CLI functionality allows users to:
1. **Auto-detect** better-auth configuration files in their project
2. **Extract** authentication configuration from existing auth.ts files
3. **Parse** the configuration into visual nodes and edges
4. **Generate** a visual flow representation of their auth setup

## Integration Architecture

```
User Project (auth.ts) 
    ↓
File System Access (API Routes)
    ↓
Configuration Parser (parseAuthToNodes.ts)
    ↓
Flow Data Converter (convertPulseConfigToFlowNodes.ts)
    ↓
Visual Studio (starter.tsx)
```

## Components

### 1. AuthExtractor Component (`component/AuthExtractor.tsx`)
- **Purpose**: GUI-based auth file extraction with step-by-step wizard
- **Features**:
  - Auto-scans project for auth files
  - Shows common file locations
  - Previews extracted configuration
  - Generates visual nodes

### 2. CLIInterface Component (`component/CLIInterface.tsx`)
- **Purpose**: Terminal-like interface for CLI experience
- **Features**:
  - Command-line style interaction
  - Real-time file scanning
  - Step-by-step configuration extraction
  - Animated terminal output

### 3. File System Access (`utils/fileSystemAccess.ts`)
- **Purpose**: Secure file reading utilities
- **Features**:
  - Cross-platform file access
  - Security restrictions
  - Auto-discovery of auth files
  - Error handling

### 4. API Routes
- **`/api/read-file`**: Securely reads auth files from user's project
- **`/api/list-files`**: Lists TypeScript/JavaScript files in allowed directories

## Usage Scenarios

### Scenario 1: New Project Setup
1. User opens Better Auth Pulse Studio
2. Clicks "Import Auth Config" or "CLI Mode"
3. System scans for existing auth files
4. If none found, provides common locations to try
5. User can paste auth.ts content or specify file path

### Scenario 2: Existing Project Integration
1. User has existing better-auth setup
2. System auto-detects auth.ts file location
3. Extracts configuration automatically
4. Generates visual flow from existing setup
5. User can modify visually and export back to code

### Scenario 3: Multi-Project Workflow
1. Developer works on multiple projects
2. Each project may have different auth.ts locations
3. System remembers common patterns
4. Quick import from any project structure

## Security Considerations

### File Access Restrictions
- Only allows reading `.ts` and `.js` files
- Restricts access to specific directories (`lib`, `src`, `utils`, etc.)
- Prevents directory traversal attacks
- Validates file content contains better-auth configuration

### Allowed Directories
```typescript
const allowedDirectories = [
  'lib', 'src', 'utils', 'config', 'server',
  'src/lib', 'src/utils', 'src/config', 'src/server'
];
```

### File Validation
- Checks for `betterAuth` or `better-auth` imports
- Validates file extension
- Ensures resolved paths stay within project root

## Configuration Parsing

### Supported Features Detection
The parser can detect and extract:

- **Database Configuration**
  - Prisma adapter
  - Database provider (SQLite, PostgreSQL, MySQL)
  
- **Authentication Methods**
  - Email & Password
  - Email verification settings
  - Social providers (Google, GitHub, Discord, Facebook, etc.)
  
- **Security Features**
  - Account linking
  - Rate limiting
  - Advanced cookie settings
  - CORS configuration

### Example Extraction
```typescript
// Input: auth.ts file content
const authContent = `
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: { clientId: "...", clientSecret: "..." }
  }
});
`;

// Output: Visual nodes
const result = {
  nodes: [
    { id: "1", type: "authStarter", position: { x: 0, y: 0 } },
    { id: "2", type: "database", position: { x: 0, y: 150 } },
    { id: "3", type: "emailAuth", position: { x: 400, y: 0 } },
    { id: "4", type: "oauthGoogle", position: { x: 600, y: 300 } }
  ],
  edges: [
    { id: "e1-2", source: "1", target: "2" },
    { id: "e1-3", source: "1", target: "3" }
  ]
};
```

## Integration with Existing Workflow

### Before CLI Integration
1. User manually creates nodes
2. Connects nodes manually
3. Generates auth.ts from visual flow

### After CLI Integration
1. **Import existing auth.ts** → Visual flow
2. **Modify visually** → Updated configuration
3. **Export back to auth.ts** → Updated code

### Bidirectional Workflow
```
auth.ts ←→ Visual Flow ←→ auth.ts
```

## Error Handling

### Common Errors and Solutions

1. **File Not Found**
   - Shows available locations
   - Allows manual path entry
   - Provides file browser interface

2. **Invalid Configuration**
   - Validates better-auth syntax
   - Shows parsing errors
   - Suggests corrections

3. **Permission Denied**
   - Explains security restrictions
   - Suggests alternative approaches
   - Provides manual paste option

## Development Setup

### Required Dependencies
```json
{
  "dependencies": {
    "@xyflow/react": "^12.0.0",
    "dagre": "^0.8.5"
  },
  "devDependencies": {
    "@types/dagre": "^0.7.52"
  }
}
```

### Environment Configuration
No additional environment variables required. The system works with standard Next.js API routes.

## Deployment Considerations

### Local Development
- Full file system access
- Real-time file scanning
- Direct auth.ts reading

### Production Deployment
- API-based file access
- Security restrictions enforced
- Cached file discovery

### Docker/Container Deployment
- Mount project directory
- Configure file access permissions
- Set appropriate security policies

## Future Enhancements

### Planned Features
1. **Git Integration**: Read auth files from Git repositories
2. **Multiple File Support**: Handle split auth configurations
3. **Real-time Sync**: Watch for auth.ts changes
4. **Team Collaboration**: Share configurations across team
5. **Version Control**: Track auth configuration changes

### Advanced Parsing
1. **AST-based Parsing**: More accurate code analysis
2. **TypeScript Support**: Full type checking
3. **Plugin Detection**: Identify custom better-auth plugins
4. **Dependency Analysis**: Map auth-related dependencies

## Troubleshooting

### Common Issues

1. **"No auth files found"**
   - Check file naming conventions
   - Verify better-auth imports
   - Try manual path entry

2. **"Permission denied"**
   - Check file permissions
   - Verify directory structure
   - Use manual paste option

3. **"Invalid configuration"**
   - Validate better-auth syntax
   - Check for missing imports
   - Review configuration structure

### Debug Mode
Enable debug logging by setting:
```typescript
const DEBUG = process.env.NODE_ENV === 'development';
```

This provides detailed logging of:
- File scanning process
- Configuration parsing steps
- Node generation logic
- Error details

## API Reference

### File System Access
```typescript
// Read auth file
const result = await readAuthFile(path: string): Promise<FileAccessResult>

// Find auth files
const files = await findAuthFiles(): Promise<string[]>

// List project files
const files = await listProjectFiles(directory?: string): Promise<string[]>
```

### Configuration Parsing
```typescript
// Generate nodes from auth file
const { nodes, edges } = generateNodesFromAuthFile(content?: string)

// Parse auth configuration
const config = parseAuthFileContent(content: string): ParsedAuthConfig
```

### Flow Data Conversion
```typescript
// Convert config to flow nodes
const flowData = convertPulseConfigToFlowNodes(config: PulseConfig): FlowData

// Convert flow nodes to config
const config = convertFlowNodesToPulseConfig(nodes: Node[], edges: Edge[]): PulseConfig
```