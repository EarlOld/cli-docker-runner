# Publishing Guide

## Prerequisites

1. Have an npm account (https://www.npmjs.com/signup)
2. Login to npm: `npm login`
3. Verify your email address

## Before Publishing

1. Update version in package.json
2. Update CHANGELOG.md
3. Run tests: `npm test`
4. Build project: `npm run build`
5. Check package contents: `npm pack --dry-run`

## Publish to npm

### First time publish
```bash
npm publish
```

### Update existing package
```bash
# Update version
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# Publish
npm publish
```

## Verify Publication

```bash
# Check if published
npm view cli-docker-runner

# Install globally and test
npm install -g cli-docker-runner
docker-runner --version
```

## Git Tags

```bash
# Create tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tags
git push origin --tags
```

## GitHub Release

1. Go to https://github.com/EarlOld/cli-docker-runner/releases
2. Click "Create a new release"
3. Select the tag
4. Write release notes
5. Publish release

## Checklist

- [ ] Tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped
- [ ] Built successfully
- [ ] Published to npm
- [ ] Git tagged
- [ ] GitHub release created

## Unpublish (Emergency Only)

```bash
# Only within 72 hours and if no other packages depend on it
npm unpublish cli-docker-runner@1.0.0
```

**Note**: Unpublishing is discouraged. Use deprecation instead:
```bash
npm deprecate cli-docker-runner@1.0.0 "This version has critical bugs, please upgrade"
```
