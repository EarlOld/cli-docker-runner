# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.2] - 2025-11-28

### Added
- **Astro framework support** - Full integration with Astro projects including:
  - Automatic framework detection for Astro projects
  - Native dev server support with `--host 0.0.0.0` configuration
  - Skip nodemon installation (uses built-in HMR)
  - Rollup platform packages for Astro builds
  - Comprehensive test coverage for Astro scenarios

### Enhanced
- Framework detection engine now supports: Vite, React, Vue, Node.js, and Astro
- Improved dev server configuration for modern web frameworks
- Extended test suite to 103 tests with Astro integration coverage

## [2.0.1] - 2025-11-28

### Added
- **`.npmrc` support** - Now copies `.npmrc` configuration files to Docker container for private registries and npm configuration
- New test coverage for `.npmrc` functionality ensuring proper copy order before npm install

### Fixed
- Enhanced npm configuration support for projects using private registries or custom npm settings

## [2.0.0] - 2025-11-28

### BREAKING CHANGES
- **Node.js default version changed from 20 to 22** - now uses latest LTS by default
- Simplified validation logic - removed complex undefined validation, relies on sensible defaults

### Added
- **Real-time file synchronization** using Docker volumes for live development
- **Intelligent framework detection** with optimized handling for Vite, React, Vue, and Node.js projects
- **Conditional nodemon installation** - automatically installs nodemon only for Node.js projects, skips for Vite-based projects with built-in HMR
- **Automatic Vite configuration** - injects `--host 0.0.0.0 --port <port>` flags for network accessibility
- **Comprehensive Rollup platform support** - installs platform-specific packages for multiple architectures:
  - `@rollup/rollup-linux-arm64-musl`
  - `@rollup/rollup-linux-x64-musl` 
  - `@rollup/rollup-linux-arm64-gnu`
  - `@rollup/rollup-linux-x64-gnu`
  - `@rollup/rollup-darwin-arm64`
  - `@rollup/rollup-darwin-x64`
- **Enhanced Docker volume mounting** with preserved node_modules via separate volume mounting
- **Smart container reuse** with live file synchronization and node_modules preservation
- **Framework-specific optimizations** for different project types
- **Comprehensive test coverage** - 101 tests covering all new functionality

### Changed
- **Default Node.js version**: 20 → 22 (latest LTS)
- **Live reload strategy**: Framework-aware (nodemon for Node.js, native HMR for Vite/React/Vue)
- **Volume mounting**: Enhanced with real-time file sync and node_modules preservation
- **Port configuration**: Automatic injection for Vite projects
- **Build optimization**: Platform-specific Rollup packages with graceful failure handling
- **PATH configuration**: Dynamic work directory support

### Improved
- **Development experience** with instant file changes and framework-optimized live reload
- **Build reliability** for production projects with comprehensive Rollup support
- **Network accessibility** with automatic Vite host/port configuration
- **Performance** through smart framework detection and conditional tooling installation
- **Test coverage** with extensive unit tests for all new features

### Technical Enhancements
- Added public methods `getScriptCommand()` and `isViteScript()` to DockerManager for testing
- Enhanced DockerfileGenerator with dynamic PATH and conditional installations
- Improved error handling with graceful fallbacks for package installations
- Framework detection engine with support for modern development tools

## [1.0.3] - 2025-11-27

### Added
- Container reuse functionality - automatically reuses existing stopped containers
- New `clean` command to remove Docker containers and images
- `--force` flag for clean command to skip confirmation
- Helper methods: `containerExists()`, `containerIsRunning()`, `imageExists()`, `restartContainer()`

### Changed
- Dockerfile now installs all dependencies including dev dependencies (`npm ci` instead of `npm ci --omit=dev`)
- Containers are no longer automatically removed (no `--rm` flag) to enable reuse
- Updated CLI descriptions to reflect container reuse behavior

### Improved
- Faster subsequent runs by reusing existing containers
- Better resource management with explicit cleanup command
- 7 new unit tests for container reuse functionality

## [1.0.2] - 2025-11-27

### Fixed
- Fixed Docker container name sanitization - now properly converts uppercase letters to lowercase
- Fixed Docker image name validation to comply with Docker naming requirements
- Added validation to prevent `FROM node:undefined-alpine` in generated Dockerfiles
- Improved error handling for Node.js version selection

### Added
- Node.js version validation in DockerfileGenerator
- 10 new unit tests for Docker name sanitization
- 7 new unit tests for Node.js version validation
- Better test coverage (70.89% from 64.66%)

## [1.0.1] - 2025-11-27

### Changed
- Updated package metadata
- Improved documentation

## [1.0.0] - 2025-11-27

### Added
- Initial release
- CLI tool with `run`, `install`, and `update` commands
- Interactive script selection from package.json
- Environment variables management (.env file support)
- Dockerfile auto-generation
- Docker container management
- Node.js version selection
- Port configuration
- Unit tests with Jest
- Full TypeScript support
- Comprehensive documentation

### Security
- Full Docker isolation for running projects
- Protection against malicious npm packages
- Secure environment variable handling

## [Unreleased]

### Planned
- Support for multiple package managers (yarn, pnpm)
- Docker Compose support
- Volume management options
- Custom Dockerfile templates
- Configuration file support
- CI/CD integration examples
