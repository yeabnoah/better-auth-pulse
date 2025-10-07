# Better Auth Pulse Studio

Visual studio for Better Auth configuration with drag-and-drop interface.

## Installation

```bash
npm install -g better-auth-pulse-studio
```

## Usage

```bash
# Launch studio (requires BETTER_AUTH_PULSE_CONFIG env var)
better-auth-pulse-studio

# Or use the CLI to launch automatically
better-auth-pulse
```

## Features

- 🎨 **Visual Editor** - Drag-and-drop interface for auth configuration
- 🔧 **Real-time Preview** - See your auth setup as you build it
- 📝 **Code Generation** - Generate Better Auth configuration code
- 🎯 **Smart Suggestions** - Get recommendations for best practices
- 🌙 **Dark Mode** - Beautiful dark and light themes
- 📱 **Responsive Design** - Works on desktop and mobile

## Environment Variables

- `BETTER_AUTH_PULSE_CONFIG` - Path to the configuration file (required)
- `PORT` - Port to run the studio on (default: 3001)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Related

- [Better Auth Pulse CLI](../better-auth-pulse-cli) - CLI tool for parsing and launching
