# Contributing to CLI Docker Runner

Thank you for your interest in contributing! Here are some guidelines:

## Development Setup

1. Fork and clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/cli-docker-runner.git
cd cli-docker-runner
```

2. Install dependencies
```bash
npm install
```

3. Run in development mode
```bash
npm run dev
```

4. Run tests
```bash
npm test
npm run test:coverage
```

## Guidelines

- Write tests for new features
- Follow TypeScript best practices
- Update documentation when needed
- Run linter before committing: `npm run lint`
- Ensure all tests pass: `npm test`

## Pull Request Process

1. Update README.md with details of changes if needed
2. Update CHANGELOG.md following the existing format
3. Ensure all tests pass
4. Get approval from maintainers

## Code Style

- Use TypeScript
- Follow existing code patterns
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

## Testing

- Write unit tests for new utilities
- Mock external dependencies (Docker, file system)
- Aim for >70% code coverage
- Test both success and error cases

## Commit Messages

Use clear and descriptive commit messages:
- `feat: add new feature`
- `fix: resolve bug`
- `docs: update documentation`
- `test: add tests`
- `refactor: improve code`

Thank you for contributing! 🎉
