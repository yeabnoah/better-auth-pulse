# 🚀 Better Auth Pulse

> **Visual Studio for Better Auth Configuration** - Drag, drop, and generate production-ready authentication code

[![npm version](https://badge.fury.io/js/better-auth-pulse.svg)](https://badge.fury.io/js/better-auth-pulse)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A powerful visual interface for configuring Better Auth with drag-and-drop simplicity. Generate complete TypeScript authentication code without writing a single line.

## ✨ Features

### 🎨 **Visual Configuration**
- **Drag & Drop Interface** - Build auth flows visually
- **Real-time Preview** - See your configuration as you build
- **Auto Layout** - Automatic node positioning and organization
- **Rich Node Types** - 13+ specialized auth components

### 🔧 **Comprehensive Auth Support**
- **Database Adapters** - Prisma, Drizzle with SQLite/PostgreSQL/MySQL
- **Authentication Methods** - Email/password, social login, magic links
- **Security Features** - Rate limiting, CSRF protection, secure cookies
- **Advanced Options** - Account linking, session management, plugins

### 🚀 **Developer Experience**
- **CLI Tool** - Run anywhere with `npx better-auth-pulse`
- **Auto Detection** - Finds your existing auth configurations
- **Code Generation** - Production-ready TypeScript output
- **Environment Templates** - Auto-generated `.env` files

## 🎯 Quick Start

### Installation

```bash
# Install globally
npm install -g better-auth-pulse

# Or use with npx (recommended)
npx better-auth-pulse
```

### Basic Usage

```bash
# Auto-detect auth file and start studio
npx better-auth-pulse

# Specify custom auth file
npx better-auth-pulse --file=lib/auth.ts

# Deep scan entire project
npx better-auth-pulse --scan

# Export configuration only
npx better-auth-pulse --export
```

### CLI Options

| Option | Description | Example |
|--------|-------------|---------|
| `-f, --file=<path>` | Specify auth.ts file path | `--file=lib/auth.ts` |
| `-p, --port=<number>` | Set studio port (default: 3001) | `--port=4000` |
| `-s, --scan` | Deep scan entire project | `--scan` |
| `-a, --auto` | Auto-select if only one file found | `--auto` |
| `-e, --export` | Export JSON config only | `--export` |
| `-h, --help` | Show help information | `--help` |
| `-v, --version` | Show version | `--version` |

## 🎨 Studio Interface

### Supported Node Types

#### **Database & Adapters**
- `database` - Database configuration
- `prisma` - Prisma adapter
- `drizzle` - Drizzle adapter  
- `provider` - Database provider
- `sqlite` / `postgresql` / `mysql` - Database types

#### **Authentication**
- `emailAuth` - Email and password authentication
- `emailVerification` - Email verification flow
- `emailResend` - Resend email service
- `socialLogin` - Social authentication hub
- `oauthGoogle` / `oauthGithub` - OAuth providers

#### **Advanced Features**
- `account` - Account linking and management
- `rateLimit` - Rate limiting configuration
- `advanced` - Security and cookie options
- `eventHandler` - Custom event handling

### Visual Workflow

1. **Start** - Begin with the `authStarter` node
2. **Connect** - Drag and connect authentication components
3. **Configure** - Set parameters for each component
4. **Generate** - Create production-ready TypeScript code
5. **Export** - Save configuration and generated files

## 📁 Generated Files

When you use Better Auth Pulse, it creates:

- **`.better-auth-pulse.config.json`** - Full visual configuration
- **`auth-config.json`** - JSON configuration for integration
- **Updated `auth.ts`** - Your Better Auth configuration
- **Environment template** - Required environment variables

## 🔧 Configuration Examples

### Email & Password Authentication
```typescript
// Generated auth.ts
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: true,
    autoSignIn: true,
  },
  // ... more configuration
});
```

### Social Login with Google
```typescript
export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  // ... more configuration
});
```

### Advanced Security Setup
```typescript
export const auth = betterAuth({
  rateLimit: {
    window: 60,
    max: 100,
    customRules: {
      "/api/auth/sign-in": { window: 60, max: 5 }
    }
  },
  advanced: {
    useSecureCookies: true,
    cookiePrefix: "better-auth",
  },
  // ... more configuration
});
```

## 🛠 Development

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- TypeScript

### Setup
```bash
# Clone the repository
git clone https://github.com/your-username/better-auth-pulse.git
cd better-auth-pulse

# Install dependencies
npm install

# Start development server
npm run dev
```

### Project Structure
```
better-auth-pulse/
├── cli/                 # CLI tool
├── app/                 # Next.js application
├── component/           # React components
├── lib/                 # Utilities and services
├── utils/               # Helper functions
└── public/              # Static assets
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Better Auth](https://better-auth.com) - The amazing authentication library
- [React Flow](https://reactflow.dev) - The visual flow editor
- [Next.js](https://nextjs.org) - The React framework
- [Tailwind CSS](https://tailwindcss.com) - The CSS framework

## 📞 Support

- 📖 [Documentation](https://github.com/your-username/better-auth-pulse#readme)
- 🐛 [Report Issues](https://github.com/your-username/better-auth-pulse/issues)
- 💬 [Discussions](https://github.com/your-username/better-auth-pulse/discussions)

---

<div align="center">
  <strong>Built with ❤️ for the Better Auth community</strong>
</div>