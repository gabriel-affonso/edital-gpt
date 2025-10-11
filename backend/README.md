# EditAI Backend - Self-Hosted with Ollama

This is the self-hosted backend for EditAI that uses Ollama to run DeepSeek locally.

## Prerequisites

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **Ollama** - [Download here](https://ollama.ai/)
3. **DeepSeek Model** - Install via Ollama

## Setup Instructions

### 1. Install Ollama and DeepSeek

```bash
# Install Ollama (if not already installed)
# Visit https://ollama.ai/ for installation instructions

# Pull the DeepSeek model
ollama pull deepseek-r1:latest

# Verify the model is installed
ollama list
```

### 2. Configure the Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
# Make sure OLLAMA_BASE_URL points to your Ollama instance
# Update ALLOWED_ORIGINS to include your frontend URL
```

### 3. Start Ollama (if not running)

```bash
# Start Ollama server
ollama serve
```

### 4. Start the Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The backend will start on `http://localhost:3001` by default.

## Configuration

Edit the `.env` file to configure:

- `PORT` - Backend server port (default: 3001)
- `OLLAMA_BASE_URL` - Ollama API URL (default: http://localhost:11434)
- `OLLAMA_MODEL` - Model to use (default: deepseek-r1:latest)
- `ALLOWED_ORIGINS` - Frontend URLs allowed to access the API

## API Endpoints

### Health Check
```
GET /health
```

### Suggest Project
```
POST /api/suggest-project
Body: { "editalUrl": "https://..." }
```

### Process Edital
```
POST /api/process-edital
Body: {
  "editalUrl": "https://...",
  "projectInfo": {
    "name": "...",
    "description": "...",
    "goals": "...",
    "budget": "..."
  }
}
```

### Generate PDF
```
POST /api/generate-proposal-pdf
Body: {
  "projectData": {
    "nomeProjeto": "...",
    "resumo": "...",
    "justificativa": "...",
    "metodologia": "...",
    "criteriosElegibilidade": "...",
    "orcamento": "..."
  }
}
```

## Deployment

### Option 1: VPS/Dedicated Server

1. Upload the backend folder to your server
2. Install Node.js and Ollama on the server
3. Pull the DeepSeek model
4. Configure `.env` with production settings
5. Use PM2 or systemd to run the server:

```bash
# Using PM2
npm install -g pm2
pm2 start server.js --name editai-backend
pm2 save
pm2 startup
```

### Option 2: Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

EXPOSE 3001
CMD ["node", "server.js"]
```

Note: You'll need to run Ollama separately or use Docker Compose.

## Troubleshooting

### Ollama Connection Issues

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not, start Ollama
ollama serve
```

### Model Not Found

```bash
# List installed models
ollama list

# Pull DeepSeek if missing
ollama pull deepseek-r1:latest
```

### CORS Errors

Make sure your frontend URL is added to `ALLOWED_ORIGINS` in `.env`

### Port Already in Use

Change the `PORT` in `.env` to an available port

## Performance Tips

1. **Use a GPU** - Ollama performs much better with GPU support
2. **Adjust model size** - Use smaller models (e.g., `deepseek-r1:8b`) for faster responses
3. **Increase timeout** - For large documents, increase the timeout in `server.js`
4. **Use SSD storage** - Model loading is faster from SSD

## Alternative Models

You can use other Ollama models by changing `OLLAMA_MODEL` in `.env`:

```bash
# Other DeepSeek variants
deepseek-r1:8b    # Smaller, faster
deepseek-r1:32b   # Larger, more capable
deepseek-r1:70b   # Largest, best quality

# Other models
llama3:latest
mixtral:latest
codellama:latest
```

## Support

For issues with:
- **Ollama**: https://github.com/ollama/ollama/issues
- **EditAI Backend**: Check server logs and console output
