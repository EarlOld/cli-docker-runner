# CLI Docker Runner

[![CI](https://github.com/EarlOld/cli-docker-runner/actions/workflows/ci.yml/badge.svg)](https://github.com/EarlOld/cli-docker-runner/actions/workflows/ci.yml)
[![Security](https://github.com/EarlOld/cli-docker-runner/actions/workflows/security.yml/badge.svg)](https://github.com/EarlOld/cli-docker-runner/actions/workflows/security.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/EarlOld/cli-docker-runner/badge.svg)](https://snyk.io/test/github/EarlOld/cli-docker-runner)
[![npm version](https://img.shields.io/npm/v/cli-docker-runner.svg)](https://www.npmjs.com/package/cli-docker-runner)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A secure CLI tool for running frontend projects in Docker containers to protect your local environment from potentially malicious packages.

## Quick Start

```bash
# Install globally
npm install -g cli-docker-runner

# Or use with npx
npx cli-docker-runner run
```

## Security & Quality

This project is continuously monitored for security vulnerabilities and maintains high code quality standards:

- 🛡️ **Snyk Security**: Automated vulnerability scanning
- 🔍 **GitHub Security**: Code scanning with SARIF reports
- ✅ **Continuous Testing**: Multi-version Node.js testing (16.x, 18.x, 20.x)
- 📊 **Code Coverage**: Tracked with Codecov integration

## Features

- 🛡️ **Security**: Isolate projects from your local environment
- 🚀 **Easy to use**: Interactive CLI interface
- 🐳 **Docker-based**: Full isolation with Docker containers
- ⚙️ **Flexible**: Choose Node.js version, manage env vars
- 📦 **Smart**: Auto-detects scripts from package.json
- ♻️ **Efficient**: Reuses existing containers on subsequent runs

## Supported Frameworks

CLI Docker Runner automatically detects and optimizes for modern web frameworks:

- ⚡ **Vite** - Hot Module Replacement (HMR) with `--host 0.0.0.0` configuration
- ⚛️ **React** - Create React App and Vite-based React projects
- 💚 **Vue** - Vue CLI and Vite-based Vue projects  
- 🚀 **Astro** - Native dev server with automatic host configuration
- 🟢 **Node.js** - Traditional Node.js applications with nodemon

**Framework Intelligence:**
- Automatically skips nodemon installation for frameworks with built-in HMR
- Configures dev servers for network accessibility in Docker containers
- Installs platform-specific Rollup packages for optimized builds

## Commands

```bash
# Run project in Docker (reuses existing container if available)
docker-runner run [options]

# Install dependencies
docker-runner install

# Update dependencies
docker-runner update

# Clean up Docker containers and images
docker-runner clean [options]
```

## Options

### Run command
- `-n, --node <version>` - Node.js version (default: 22)
- `-p, --port <port>` - Port to expose (default: 3000)
- `--no-cache` - Build without cache

### Clean command
- `-f, --force` - Force removal without confirmation

## How it works

1. **First run**: Creates a new Docker container with all dependencies (including dev)
2. **Subsequent runs**: Automatically reuses the existing container for faster startup
3. **Clean**: Remove all containers and images when you're done

## License

MIT
