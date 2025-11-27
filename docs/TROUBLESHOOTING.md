# Common Issues and Solutions

## Docker not found

**Error**: `Docker is not installed or not running`

**Solution**:
1. Install Docker from https://www.docker.com/
2. Start Docker Desktop
3. Verify: `docker --version`

## package.json not found

**Error**: `package.json not found in current directory`

**Solution**:
- Make sure you're in the correct directory
- Check package.json exists: `ls -la package.json`

## No scripts available

**Error**: `No scripts found in package.json`

**Solution**:
Add scripts to package.json:
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

## Port already in use

**Error**: `Port already in use`

**Solution**:
```bash
# Use a different port
docker-runner run --port 8080

# Or kill the other process
lsof -ti:3000 | xargs kill -9
```

## Image build error

**Error**: `Failed to build Docker image`

**Solution**:
```bash
# Build without cache
docker-runner run --no-cache

# Check Docker daemon
docker ps
```

## Environment variables not loading

**Solution**:
1. Check .env file format
2. Make sure file is not in .gitignore
3. Try entering variables manually

## Slow build

**Solution**:
- Add .dockerignore file
- Exclude node_modules and other large folders

## Container won't stop

**Solution**:
```bash
# Find container
docker ps

# Stop manually
docker stop <container-name>
```

## Need help?

Create an issue with detailed description:
https://github.com/EarlOld/cli-docker-runner/issues
