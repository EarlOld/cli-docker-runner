# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in cli-docker-runner, please report it by:

1. **DO NOT** create a public GitHub issue
2. Email the maintainer with details
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Measures

### Docker Isolation
- Containers run with limited privileges
- No root access by default
- Isolated file system and network

### Environment Variables
- Never logged or printed to console
- Properly escaped for Docker
- Not persisted to disk

### Dependencies
- Regularly updated
- Scanned for vulnerabilities
- Minimal dependency tree

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Comprehensive test coverage

## Best Practices

When using cli-docker-runner:

1. **Keep Docker Updated**: Always use the latest Docker version
2. **Review Scripts**: Check package.json scripts before running
3. **Limit Exposure**: Only expose necessary ports
4. **Use .dockerignore**: Exclude sensitive files
5. **Regular Updates**: Keep cli-docker-runner updated

## Known Limitations

- Requires Docker to be installed and running
- Limited to Node.js projects
- Container escape is possible (inherent to Docker)

## Response Timeline

- **Critical vulnerabilities**: Patched within 24-48 hours
- **High severity**: Patched within 1 week
- **Medium/Low severity**: Addressed in next release

## Security Updates

Security updates will be announced via:
- GitHub Security Advisories
- npm security advisories
- CHANGELOG.md

Thank you for helping keep cli-docker-runner secure!
