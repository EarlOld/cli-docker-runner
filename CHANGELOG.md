# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
