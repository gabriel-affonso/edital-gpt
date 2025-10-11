# 🚀 Guia Completo de Self-Hosting do EditAI com DeepSeek Local

Este guia detalhado mostrará como hospedar completamente o EditAI fora do Lovable e processar tudo localmente com DeepSeek via Ollama.

---

## 📑 Índice

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Pré-requisitos](#pré-requisitos)
3. [Parte 1: Configurando Ollama e DeepSeek](#parte-1-configurando-ollama-e-deepseek)
4. [Parte 2: Configurando o Backend Node.js](#parte-2-configurando-o-backend-nodejs)
5. [Parte 3: Configurando o Frontend](#parte-3-configurando-o-frontend)
6. [Parte 4: Testando Localmente](#parte-4-testando-localmente)
7. [Parte 5: Deploy em Produção](#parte-5-deploy-em-produção)
8. [Troubleshooting](#troubleshooting)
9. [Otimizações e Performance](#otimizações-e-performance)
10. [Segurança](#segurança)

---

## 🏗️ Visão Geral da Arquitetura

### Antes (Lovable Cloud)
```
Frontend (React) → Supabase Edge Functions → Lovable AI Gateway → Gemini
```

### Depois (Self-Hosted)
```
Frontend (React) → Backend Node.js → Ollama → DeepSeek (Local)
```

**Componentes:**
- **Frontend**: Aplicação React estática (pode ser hospedada em Netlify, Vercel, servidor próprio)
- **Backend**: Servidor Node.js/Express (precisa rodar em servidor com acesso ao Ollama)
- **Ollama**: Runtime para executar LLMs localmente
- **DeepSeek**: Modelo de IA executado via Ollama

---

## 📋 Pré-requisitos

### Hardware Recomendado

Para rodar DeepSeek localmente, você precisará de:

| Componente | Mínimo | Recomendado |
|------------|--------|-------------|
| **RAM** | 16 GB | 32 GB+ |
| **GPU** | CPU only (lento) | NVIDIA GPU 8GB+ VRAM |
| **Armazenamento** | 20 GB livre | 50 GB+ SSD |
| **CPU** | 4 cores | 8+ cores |

**Modelos DeepSeek e Requisitos:**
- `deepseek-r1:1.5b` - 2 GB RAM - CPU ok
- `deepseek-r1:7b` - 8 GB RAM - Rápido
- `deepseek-r1:8b` - 8 GB RAM - Balanceado (Recomendado)
- `deepseek-r1:14b` - 16 GB RAM - Melhor qualidade
- `deepseek-r1:32b` - 32 GB RAM - Alta qualidade
- `deepseek-r1:70b` - 64 GB RAM - Máxima qualidade

### Software Necessário

1. **Sistema Operacional**
   - Linux (Ubuntu 20.04+, Debian, etc.) - Recomendado
   - macOS 12+ (Monterey ou superior)
   - Windows 10/11 com WSL2

2. **Node.js**
   - Versão 18.x ou superior
   - npm 9.x ou superior
   - [Download](https://nodejs.org/)

3. **Git**
   - Para clonar o repositório
   - [Download](https://git-scm.com/)

4. **Ollama**
   - Runtime para executar LLMs
   - [Download](https://ollama.ai/)

---

## 🔧 Parte 1: Configurando Ollama e DeepSeek

### Passo 1.1: Instalar Ollama

#### No Linux:
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

#### No macOS:
```bash
# Baixe o instalador em https://ollama.ai/download/mac
# Ou use Homebrew:
brew install ollama
```

#### No Windows:
```bash
# Baixe o instalador em https://ollama.ai/download/windows
# Ou use WSL2 e siga as instruções do Linux
```

### Passo 1.2: Verificar Instalação do Ollama

```bash
# Verifique se Ollama foi instalado corretamente
ollama --version

# Deve mostrar algo como: ollama version 0.x.x
```

### Passo 1.3: Iniciar o Servidor Ollama

```bash
# Inicie o servidor Ollama (rodará em http://localhost:11434)
ollama serve
```

**Nota:** Deixe este terminal aberto! O Ollama precisa estar rodando sempre.

**Configurar como Serviço (Opcional - Linux):**
```bash
# Criar arquivo de serviço systemd
sudo nano /etc/systemd/system/ollama.service
```

Adicione este conteúdo:
```ini
[Unit]
Description=Ollama Service
After=network.target

[Service]
Type=simple
User=seu-usuario
ExecStart=/usr/local/bin/ollama serve
Restart=always
Environment="OLLAMA_HOST=0.0.0.0:11434"

[Install]
WantedBy=multi-user.target
```

```bash
# Ative e inicie o serviço
sudo systemctl enable ollama
sudo systemctl start ollama
sudo systemctl status ollama
```

### Passo 1.4: Baixar o Modelo DeepSeek

Abra um **novo terminal** e execute:

```bash
# Modelo recomendado (8GB RAM, boa performance)
ollama pull deepseek-r1:8b

# OU outros modelos conforme seu hardware:
# ollama pull deepseek-r1:1.5b  # Mais leve (2GB)
# ollama pull deepseek-r1:14b   # Melhor qualidade (16GB)
# ollama pull deepseek-r1:32b   # Alta qualidade (32GB)
```

**Nota:** O download pode levar vários minutos dependendo da sua conexão!

### Passo 1.5: Testar o Modelo

```bash
# Teste se o modelo está funcionando
ollama run deepseek-r1:8b "Olá, você pode me ajudar com editais públicos?"

# Você deve receber uma resposta em texto
```

### Passo 1.6: Listar Modelos Instalados

```bash
# Veja todos os modelos instalados
ollama list

# Saída esperada:
# NAME                    ID              SIZE      MODIFIED
# deepseek-r1:8b          abc123...       4.7 GB    2 hours ago
```

### Passo 1.7: Verificar API do Ollama

```bash
# Teste a API REST do Ollama
curl http://localhost:11434/api/tags

# Deve retornar um JSON com os modelos instalados
```

✅ **Checkpoint 1:** Se você conseguiu ver os modelos listados, o Ollama está funcionando corretamente!

---

## 🖥️ Parte 2: Configurando o Backend Node.js

### Passo 2.1: Clonar o Repositório

```bash
# Clone o repositório do GitHub (se ainda não clonou)
git clone <URL_DO_SEU_REPOSITORIO>
cd editai
```

### Passo 2.2: Navegar até o Backend

```bash
cd backend
```

### Passo 2.3: Instalar Dependências

```bash
# Instale as dependências do Node.js
npm install

# Deve instalar:
# - express (servidor web)
# - cors (permitir chamadas do frontend)
# - axios (fazer chamadas HTTP ao Ollama)
# - dotenv (gerenciar variáveis de ambiente)
```

### Passo 2.4: Configurar Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Abra o arquivo .env para editar
nano .env  # ou use seu editor preferido (code .env, vim .env, etc.)
```

**Configure o arquivo `.env`:**

```env
# Porta do servidor backend
PORT=3001

# URL base do Ollama (geralmente localhost se estiver na mesma máquina)
OLLAMA_BASE_URL=http://localhost:11434

# Modelo DeepSeek que você baixou
OLLAMA_MODEL=deepseek-r1:8b

# Origens permitidas (adicione a URL do seu frontend)
# Para desenvolvimento local:
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:5173,http://localhost:3000

# Para produção, adicione seu domínio:
# ALLOWED_ORIGINS=https://seu-dominio.com,http://localhost:8080

# Ambiente
NODE_ENV=development
```

**Explicação das Variáveis:**

- `PORT`: Porta onde o backend rodará (padrão: 3001)
- `OLLAMA_BASE_URL`: URL do servidor Ollama
  - Se Ollama estiver na mesma máquina: `http://localhost:11434`
  - Se estiver em outra máquina: `http://IP_DA_MAQUINA:11434`
  - Se estiver em container Docker: `http://ollama:11434`
- `OLLAMA_MODEL`: Nome exato do modelo (use `ollama list` para ver os nomes)
- `ALLOWED_ORIGINS`: URLs do frontend que podem fazer requisições (separadas por vírgula)
- `NODE_ENV`: `development` para dev, `production` para produção

### Passo 2.5: Testar o Backend

```bash
# Inicie o servidor backend em modo desenvolvimento
npm run dev

# Você deve ver:
# ✅ EditAI Backend running on port 3001
# 📡 Ollama: http://localhost:11434
# 🤖 Model: deepseek-r1:8b
# 🌐 CORS enabled for: http://localhost:8080
```

### Passo 2.6: Testar Endpoints da API

Abra um **novo terminal** e teste:

```bash
# Teste o health check
curl http://localhost:3001/health

# Resposta esperada:
# {"status":"ok","ollama":"http://localhost:11434","model":"deepseek-r1:8b"}
```

```bash
# Teste o endpoint de sugestão de projeto
curl -X POST http://localhost:3001/api/suggest-project \
  -H "Content-Type: application/json" \
  -d '{"editalUrl":"https://exemplo.com/edital-teste"}'

# Deve retornar um JSON com a sugestão (pode demorar alguns segundos)
```

✅ **Checkpoint 2:** Se o health check funcionou e o backend está rodando, está tudo certo!

---

## 💻 Parte 3: Configurando o Frontend

### Passo 3.1: Voltar para a Raiz do Projeto

```bash
# Se estiver na pasta backend, volte para a raiz
cd ..
```

### Passo 3.2: Instalar Dependências do Frontend

```bash
# Instale todas as dependências
npm install
```

### Passo 3.3: Configurar Variável de Ambiente do Frontend

```bash
# Copie o arquivo de exemplo
cp .env.local.example .env.local

# Abra para editar
nano .env.local
```

**Configure o arquivo `.env.local`:**

```env
# URL do backend Node.js
# Para desenvolvimento local:
VITE_BACKEND_URL=http://localhost:3001

# Para produção (substitua pelo seu domínio):
# VITE_BACKEND_URL=https://api.seu-dominio.com
```

**⚠️ IMPORTANTE:** 
- Variáveis do Vite DEVEM começar com `VITE_`
- Após alterar `.env.local`, você precisa reiniciar o servidor de desenvolvimento

### Passo 3.4: Verificar Código do Frontend

O código já foi modificado para usar o backend local ao invés do Supabase. Verifique se está correto:

```bash
# Verifique se os componentes estão usando fetch ao invés de supabase
grep -r "VITE_BACKEND_URL" src/components/
```

Deve retornar:
- `src/components/EditalForm.tsx`
- `src/components/ProjectSuggestionForm.tsx`
- `src/components/ProjectSuggestionEditor.tsx`

---

## 🧪 Parte 4: Testando Localmente

### Passo 4.1: Iniciar Todos os Serviços

Você precisará de **3 terminais** abertos:

**Terminal 1 - Ollama:**
```bash
# Se não estiver rodando como serviço
ollama serve
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev

# Deve mostrar: ✅ EditAI Backend running on port 3001
```

**Terminal 3 - Frontend:**
```bash
# Na raiz do projeto
npm run dev

# Deve mostrar algo como:
# VITE v5.x.x  ready in xxx ms
# ➜  Local:   http://localhost:8080/
```

### Passo 4.2: Acessar a Aplicação

Abra seu navegador e acesse:
```
http://localhost:8080
```

### Passo 4.3: Testar as Funcionalidades

#### Teste 1: Sugestão de Projeto

1. Na página inicial, clique em **"Precisa de um Projeto?"**
2. Cole uma URL de teste: `https://exemplo.gov.br/edital-teste`
3. Clique em **"Gerar Sugestão de Projeto"**
4. Aguarde (pode demorar 30-60 segundos na primeira vez)
5. Você deve ver os campos preenchidos com a sugestão do DeepSeek

#### Teste 2: Edição e PDF

1. Edite qualquer campo da sugestão
2. Clique em **"Gerar PDF da Proposta"**
3. Um PDF deve ser baixado automaticamente

### Passo 4.4: Monitorar Logs

Observe os logs nos terminais:

**Backend (Terminal 2):**
```
Processing suggest-project for: https://exemplo.gov.br/edital-teste
POST /api/suggest-project 200 - 45.678 ms
```

**Ollama (Terminal 1):**
Você verá atividade quando o modelo estiver processando.

### Passo 4.5: Verificar DevTools do Navegador

1. Pressione `F12` para abrir DevTools
2. Vá na aba **Network**
3. Faça uma requisição
4. Verifique:
   - Requisição vai para `http://localhost:3001`
   - Status é `200 OK`
   - Response tem os dados esperados

✅ **Checkpoint 3:** Se conseguiu gerar uma sugestão e baixar o PDF, tudo está funcionando!

---

## 🌐 Parte 5: Deploy em Produção

### Opção A: Servidor VPS Único (Recomendado para Iniciantes)

Use um VPS (DigitalOcean, Linode, AWS EC2, etc.) que rode tudo:

#### Requisitos do Servidor:
- Ubuntu 22.04 LTS
- 16 GB RAM (mínimo) - 32 GB (recomendado)
- 4 vCPUs (mínimo) - 8 vCPUs (recomendado)
- 50 GB SSD
- GPU opcional (melhora muito a performance)

#### Passo A.1: Conectar ao Servidor

```bash
ssh usuario@seu-servidor.com
```

#### Passo A.2: Instalar Dependências

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar Git
sudo apt install -y git

# Instalar Nginx (servidor web)
sudo apt install -y nginx

# Instalar Ollama
curl -fsSL https://ollama.ai/install.sh | sh
```

#### Passo A.3: Baixar Modelo DeepSeek

```bash
ollama pull deepseek-r1:8b
```

#### Passo A.4: Clonar e Configurar o Projeto

```bash
# Criar diretório para o projeto
mkdir -p /var/www/editai
cd /var/www/editai

# Clonar repositório
git clone <URL_DO_REPOSITORIO> .

# Instalar dependências do backend
cd backend
npm install --production

# Configurar .env
cp .env.example .env
nano .env
```

**Configure `.env` para produção:**
```env
PORT=3001
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-r1:8b
ALLOWED_ORIGINS=https://seu-dominio.com
NODE_ENV=production
```

#### Passo A.5: Configurar PM2 (Process Manager)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar backend com PM2
cd /var/www/editai/backend
pm2 start server.js --name editai-backend

# Salvar configuração
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup
# Copie e execute o comando que aparecer
```

#### Passo A.6: Configurar Ollama como Serviço

```bash
# Criar arquivo de serviço
sudo nano /etc/systemd/system/ollama.service
```

Adicione:
```ini
[Unit]
Description=Ollama Service
After=network.target

[Service]
Type=simple
User=seu-usuario
ExecStart=/usr/local/bin/ollama serve
Restart=always
Environment="OLLAMA_HOST=0.0.0.0:11434"

[Install]
WantedBy=multi-user.target
```

```bash
# Ativar e iniciar
sudo systemctl enable ollama
sudo systemctl start ollama
```

#### Passo A.7: Build do Frontend

```bash
cd /var/www/editai

# Configurar .env.local para produção
nano .env.local
```

Adicione:
```env
VITE_BACKEND_URL=https://api.seu-dominio.com
```

```bash
# Build do frontend
npm install
npm run build

# Os arquivos estarão em dist/
```

#### Passo A.8: Configurar Nginx

```bash
# Criar configuração do site
sudo nano /etc/nginx/sites-available/editai
```

Adicione:
```nginx
# Frontend
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    
    root /var/www/editai/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}

# Backend API
server {
    listen 80;
    server_name api.seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeout maior para LLM
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }
}
```

```bash
# Ativar configuração
sudo ln -s /etc/nginx/sites-available/editai /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

#### Passo A.9: Configurar SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificados SSL
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com -d api.seu-dominio.com

# Renovação automática já está configurada
```

#### Passo A.10: Configurar Firewall

```bash
# Configurar UFW
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

✅ **Deploy Completo!** Acesse `https://seu-dominio.com`

---

### Opção B: Frontend e Backend Separados

#### Frontend: Netlify/Vercel (Grátis)

**Build Settings (Netlify/Vercel):**
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Environment variables:**
  - `VITE_BACKEND_URL=https://api.seu-dominio.com`

#### Backend: VPS com Ollama

Siga os passos A.2 a A.6 da Opção A, mas apenas para o backend.

---

### Opção C: Docker Compose (Avançado)

Crie `docker-compose.yml` na raiz:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
      - OLLAMA_MODEL=deepseek-r1:8b
      - PORT=3001
    depends_on:
      - ollama
    restart: unless-stopped
  
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped
  
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_BACKEND_URL=http://backend:3001
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  ollama_data:
```

```bash
# Iniciar todos os serviços
docker-compose up -d

# Baixar modelo DeepSeek
docker exec -it <ollama-container-id> ollama pull deepseek-r1:8b
```

---

## 🔍 Troubleshooting

### Problema 1: Ollama não inicia

**Sintoma:** `curl: (7) Failed to connect to localhost port 11434`

**Solução:**
```bash
# Verificar se está rodando
ps aux | grep ollama

# Verificar logs
journalctl -u ollama -f

# Reiniciar
sudo systemctl restart ollama
```

### Problema 2: Modelo não encontrado

**Sintoma:** `Error: model 'deepseek-r1:8b' not found`

**Solução:**
```bash
# Listar modelos instalados
ollama list

# Se não estiver, baixe
ollama pull deepseek-r1:8b

# Verifique o nome exato e atualize .env
```

### Problema 3: Backend não conecta ao Ollama

**Sintoma:** `Ollama communication failed: connect ECONNREFUSED`

**Solução:**
```bash
# Verificar se Ollama está acessível
curl http://localhost:11434/api/tags

# Se não funcionar, verifique firewall
sudo ufw status

# Verificar se a porta está aberta
netstat -tlnp | grep 11434
```

### Problema 4: CORS Error no Frontend

**Sintoma:** `Access to fetch at 'http://localhost:3001' from origin 'http://localhost:8080' has been blocked by CORS`

**Solução:**
```bash
# Edite backend/.env
nano backend/.env

# Adicione a origem do frontend
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:5173

# Reinicie o backend
pm2 restart editai-backend
```

### Problema 5: Resposta Muito Lenta

**Sintoma:** Requisições demoram mais de 60 segundos

**Soluções:**
1. Use um modelo menor: `deepseek-r1:1.5b`
2. Use GPU se disponível
3. Aumente RAM disponível
4. Reduza o tamanho do prompt
5. Configure context window menor

### Problema 6: Out of Memory

**Sintoma:** `FATAL ERROR: Reached heap limit Allocation failed`

**Solução:**
```bash
# Use modelo menor
ollama pull deepseek-r1:1.5b

# Ou aumente a memória do Node.js
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

### Problema 7: Frontend não encontra Backend

**Sintoma:** `Failed to fetch` ou `Network Error`

**Solução:**
```bash
# Verifique se .env.local está correto
cat .env.local

# Deve mostrar:
# VITE_BACKEND_URL=http://localhost:3001

# Reinicie o dev server após mudar .env.local
npm run dev
```

---

## ⚡ Otimizações e Performance

### 1. Usar GPU

Se você tem GPU NVIDIA:

```bash
# Instalar CUDA Toolkit
# Visite: https://developer.nvidia.com/cuda-downloads

# Instalar drivers NVIDIA
sudo ubuntu-drivers autoinstall

# Verificar
nvidia-smi

# Ollama usará GPU automaticamente
```

### 2. Configurar Context Window

No backend, edite `server.js`:

```javascript
const requestBody = {
  model: OLLAMA_MODEL,
  messages,
  stream: false,
  format: 'json',
  options: {
    num_ctx: 4096,      // Context window (menor = mais rápido)
    temperature: 0.7,    // Criatividade
    top_p: 0.9,         // Nucleus sampling
    num_predict: 2048   // Máximo de tokens na resposta
  }
};
```

### 3. Cache de Respostas

Adicione cache Redis para respostas comuns:

```bash
npm install redis
```

### 4. Load Balancing

Para produção com alto tráfego, use múltiplas instâncias Ollama:

```nginx
upstream ollama_backend {
    server localhost:11434;
    server localhost:11435;
    server localhost:11436;
}
```

### 5. Monitoramento

```bash
# Instalar ferramentas de monitoramento
npm install -g pm2
pm2 install pm2-logrotate

# Monitorar uso de recursos
pm2 monit
```

---

## 🔒 Segurança

### 1. Rate Limiting

Adicione ao `backend/server.js`:

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de requests
});

app.use('/api/', limiter);
```

### 2. Helmet (Security Headers)

```bash
cd backend
npm install helmet
```

```javascript
import helmet from 'helmet';
app.use(helmet());
```

### 3. Validação de Input

```javascript
import validator from 'validator';

app.post('/api/suggest-project', (req, res) => {
  const { editalUrl } = req.body;
  
  if (!validator.isURL(editalUrl)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  
  // ... resto do código
});
```

### 4. HTTPS Obrigatório

```nginx
# Redirecionar HTTP para HTTPS
server {
    listen 80;
    server_name seu-dominio.com;
    return 301 https://$server_name$request_uri;
}
```

### 5. Limitar Acesso ao Ollama

```bash
# Ollama não deve estar acessível publicamente
# Certifique-se que apenas localhost pode acessar
sudo ufw deny 11434
```

---

## 📊 Monitoramento de Uso

### Logs do Backend

```bash
# Ver logs em tempo real
pm2 logs editai-backend

# Ver logs do Ollama
journalctl -u ollama -f
```

### Métricas de Performance

Adicione ao `backend/server.js`:

```javascript
let requestCount = 0;
let totalResponseTime = 0;

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    requestCount++;
    totalResponseTime += duration;
    console.log(`Request ${requestCount}: ${duration}ms`);
  });
  next();
});

// Endpoint de métricas
app.get('/metrics', (req, res) => {
  res.json({
    requests: requestCount,
    avgResponseTime: totalResponseTime / requestCount
  });
});
```

---

## 🎯 Checklist Final

- [ ] Ollama instalado e rodando
- [ ] Modelo DeepSeek baixado
- [ ] Backend configurado e rodando
- [ ] Frontend configurado
- [ ] Testado localmente
- [ ] SSL configurado (produção)
- [ ] Firewall configurado
- [ ] Backup configurado
- [ ] Monitoramento ativo
- [ ] Documentação atualizada

---

## 📚 Recursos Adicionais

- [Documentação Ollama](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [DeepSeek Models](https://github.com/deepseek-ai)
- [Express.js Docs](https://expressjs.com/)
- [Nginx Docs](https://nginx.org/en/docs/)
- [PM2 Docs](https://pm2.keymetrics.io/)

---

## 💡 Dicas Finais

1. **Comece Pequeno:** Teste localmente antes de fazer deploy
2. **Monitore Recursos:** DeepSeek consome bastante RAM/GPU
3. **Use Modelo Adequado:** Escolha baseado no seu hardware
4. **Backup Regular:** Sempre faça backup das configurações
5. **Atualize Regularmente:** Mantenha Ollama e dependências atualizados

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs: `pm2 logs` e `journalctl -u ollama -f`
2. Consulte a seção [Troubleshooting](#troubleshooting)
3. Abra uma issue no GitHub
4. Contate suporte@editai.com.br

---

**Desenvolvido com ❤️ para rodar 100% local e privado**
