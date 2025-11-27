# Quick Start

## Installation

```bash
npm install -g cli-docker-runner
```

## First Run

1. Navigate to your project directory:
```bash
cd your-project
```

2. Run the command:
```bash
docker-runner run
```

3. Select a script from package.json
4. Configure environment variables

## Command Examples

### Run with Node.js 18
```bash
docker-runner run --node 18
```

### Specify port
```bash
docker-runner run --port 8080
```

### Install dependencies
```bash
docker-runner install --node 20
```

### Update dependencies
```bash
docker-runner update
```

## Your Project Structure

Make sure you have:
- `package.json` with scripts
- `.env` file (optional)
- Docker installed and running

## Support

If you encounter issues, create an issue on GitHub:
https://github.com/EarlOld/cli-docker-runner/issues
