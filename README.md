# CLI Docker Runner

[![CI](https://github.com/EarlOld/cli-docker-runner/actions/workflows/ci.yml/badge.svg)](https://github.com/EarlOld/cli-docker-runner/actions/workflows/ci.yml)
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

## Features

- 🛡️ **Security**: Isolate projects from your local environment
- 🚀 **Easy to use**: Interactive CLI interface
- 🐳 **Docker-based**: Full isolation with Docker containers
- ⚙️ **Flexible**: Choose Node.js version, manage env vars
- 📦 **Smart**: Auto-detects scripts from package.json
- ♻️ **Efficient**: Reuses existing containers on subsequent runs

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
- `-n, --node <version>` - Node.js version (default: 20)
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
