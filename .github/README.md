# GitHub Actions CI/CD

This project uses GitHub Actions for continuous integration and deployment.

## Workflows

### CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and pull request to `main` branch.

**What it does:**
- Tests on Node.js 16, 18, and 20
- Runs linting
- Runs all tests
- Generates coverage reports
- Builds the project
- Uploads coverage to Codecov

### Publish Workflow (`.github/workflows/publish.yml`)

Runs when you push a version tag (e.g., `v1.0.0`).

**What it does:**
- Runs all tests
- Runs linting
- Builds the project
- Publishes to npm
- Creates a GitHub release

## How to Publish

1. Update version in `package.json`:
```bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

2. Update `CHANGELOG.md` with changes

3. Commit and push:
```bash
git add .
git commit -m "chore: bump version to 1.0.1"
git push
```

4. Create and push tag:
```bash
git tag v1.0.1
git push origin v1.0.1
```

5. GitHub Actions will automatically:
   - Run tests
   - Build the project
   - Publish to npm
   - Create GitHub release

## Required Secrets

You need to add these secrets in GitHub repository settings:

### NPM_TOKEN
1. Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Create a new "Automation" token
3. Add it to GitHub: Settings → Secrets → Actions → New repository secret
4. Name: `NPM_TOKEN`
5. Value: your npm token

### GITHUB_TOKEN
This is automatically provided by GitHub Actions, no setup needed.

## Manual Publish (without CI)

If you prefer to publish manually:

```bash
npm login
npm run build
npm test
npm publish
```

## Troubleshooting

### Workflow not running
- Check that workflows are enabled in repository settings
- Verify the tag matches the pattern `v*`

### NPM publish fails
- Check NPM_TOKEN is correctly set
- Verify you have permissions to publish the package
- Make sure the version doesn't already exist

### Tests fail
- Run tests locally: `npm test`
- Check for platform-specific issues
- Review the GitHub Actions logs

## Status Badges

Add these to your README.md:

```markdown
[![CI](https://github.com/EarlOld/cli-docker-runner/actions/workflows/ci.yml/badge.svg)](https://github.com/EarlOld/cli-docker-runner/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/cli-docker-runner.svg)](https://www.npmjs.com/package/cli-docker-runner)
```
