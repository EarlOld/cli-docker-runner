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

## Commands

```bash
# Run project in Docker
docker-runner run [options]

# Install dependencies
docker-runner install

# Update dependencies
docker-runner update
```

## Options

- `-n, --node <version>` - Node.js version (default: 20)
- `-p, --port <port>` - Port to expose (default: 3000)
- `--no-cache` - Build without cache

## License

MIT
