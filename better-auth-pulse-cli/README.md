# Better Auth Pulse CLI

Lightweight CLI tool for Better Auth configuration parsing and generation.

## Installation

```bash
npm install -g better-auth-pulse-cli
```

## Usage

```bash
# Parse and launch visual studio
better-auth-pulse

# Parse specific auth file
better-auth-pulse --file=lib/auth.ts

# Export configuration only
better-auth-pulse --export --file=lib/auth.ts

# Deep scan for auth files
better-auth-pulse --scan

# Auto-select if only one file found
better-auth-pulse --scan --auto
```

## Options

- `-f, --file=<path>` - Specify auth.ts file path
- `-p, --port=<number>` - Set server port (default: 3001)
- `-s, --scan` - Deep scan entire project
- `-a, --auto` - Auto-select if only one file found
- `-e, --export` - Export JSON config only (no studio)
- `-h, --help` - Show help
- `-v, --version` - Show version

## Features

- 🔍 **Smart Detection** - Automatically finds Better Auth configuration files
- 📊 **Configuration Parsing** - Extracts database, auth methods, and social providers
- 🎨 **Visual Studio Integration** - Launches the visual studio for configuration editing
- 📄 **Export Support** - Generate JSON configuration files
- 🚀 **Zero Dependencies** - Lightweight and fast

## Generated Files

- **`.better-auth-pulse.config.json`** - Full visual configuration with nodes/edges
- **`auth-config.json`** - JSON configuration only

## Related

- [Better Auth Pulse Studio](../better-auth-pulse-studio) - Visual configuration editor
