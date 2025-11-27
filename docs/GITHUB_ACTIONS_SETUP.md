# Setting up GitHub Actions for npm Publishing

## Prerequisites

1. npm account (https://www.npmjs.com/)
2. GitHub repository
3. Access to repository settings

## Step 1: Create npm Access Token

1. Log in to npm: https://www.npmjs.com/
2. Click your profile picture → **Access Tokens**
3. Click **Generate New Token** → **Classic Token**
4. Select **Automation** type
5. Copy the generated token (you won't see it again!)

## Step 2: Add Token to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NPM_TOKEN`
5. Value: paste your npm token
6. Click **Add secret**

## Step 3: Verify Workflow Files

Make sure you have these files:

- `.github/workflows/ci.yml` - runs tests on every push
- `.github/workflows/publish.yml` - publishes when you push a tag

## Step 4: Test the Setup

### Test CI workflow
```bash
git add .
git commit -m "test: verify CI"
git push
```

Check: https://github.com/YOUR_USERNAME/cli-docker-runner/actions

### Test Publish workflow
```bash
npm version patch
git push
git push --tags
```

This will:
1. Run all tests
2. Build the project
3. Publish to npm
4. Create GitHub release

## Troubleshooting

### "npm ERR! 403 Forbidden"
- Check NPM_TOKEN is correctly set
- Verify token has "Automation" permissions
- Make sure package name is available on npm

### "npm ERR! You cannot publish over the previously published versions"
- Version already exists on npm
- Update version in package.json
- Run `npm version patch/minor/major`

### Workflow doesn't trigger
- Check workflows are enabled: Settings → Actions → General
- Verify tag format matches `v*` pattern
- Check branch protection rules

## Manual Publishing (Alternative)

If you prefer not to use GitHub Actions:

```bash
# Login to npm
npm login

# Test and build
npm test
npm run build

# Publish
npm publish
```

## Security Notes

- **Never commit** npm tokens to git
- Use **Automation** tokens, not **Publish** tokens
- Rotate tokens regularly
- Revoke tokens if compromised

## Package Visibility

By default, packages are public. To make private:

```json
{
  "private": true
}
```

Or publish as scoped package:
```bash
npm publish --access public
```

## Monitoring

After publishing:
- Check npm: https://www.npmjs.com/package/cli-docker-runner
- Verify installation: `npm install -g cli-docker-runner`
- Check GitHub releases

---

**Questions?** Create an issue on GitHub!
