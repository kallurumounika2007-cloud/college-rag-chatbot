# 🚀 Deployment Guide — Apex College AI RAG Chatbot

This project consists of a **FastAPI backend** (with ChromaDB persistent vector storage) and a **React (Vite) frontend**. Below are the easiest ways to deploy it for production.

---

## Table of Contents
1. [Option 1: Single-Command Docker Deployment (Recommended)](#option-1-single-command-docker-deployment-recommended)
2. [Option 2: Cloud Deployment (Render / Railway)](#option-2-cloud-deployment-render--railway)
3. [Option 3: VPS / Ubuntu Server Deployment (Nginx + Systemd)](#option-3-vps--ubuntu-server-deployment-nginx--systemd)
4. [Environment Variables Reference](#environment-variables-reference)

---

## Option 1: Single-Command Docker Deployment (Recommended)

### Prerequisites:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on Windows, Mac, or Linux.

### Steps:
1. Clone / open your project folder:
   ```bash
   cd Automation_AI
   ```

2. (Optional) Create a `.env` file in the root with your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_key_here
   OPENAI_API_KEY=your_openai_key_here
   SECRET_KEY=your_production_secret_key
   ```

3. Build and launch all containers:
   ```bash
   docker-compose up --build -d
   ```

4. Access the application:
   - **Frontend Web UI:** [http://localhost](http://localhost)
   - **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

5. Stop containers:
   ```bash
   docker-compose down
   ```

---

## Option 2: Cloud Deployment (Render / Railway)

### Deploying the Backend (FastAPI + ChromaDB) on Render:
1. Sign up on [Render.com](https://render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Set the following settings:
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python run.py`
   - **Environment Variables:**
     - `GEMINI_API_KEY` = your API key
     - `SECRET_KEY` = a long random string
5. Click **Create Web Service**. Note the assigned URL (e.g. `https://college-bot-api.onrender.com`).

### Deploying the Frontend (React + Vite) on Vercel / Netlify:
1. Sign up on [Vercel](https://vercel.com).
2. Import your GitHub repository.
3. Set **Root Directory** to `frontend`.
4. Add Environment Variable:
   - `VITE_API_URL` = `https://college-bot-api.onrender.com/api` (your backend URL)
5. Click **Deploy**.

---

## Option 3: VPS / Ubuntu Server Deployment (Nginx + Systemd)

### 1. Backend Service Setup
Create a systemd service `/etc/systemd/system/college-bot.service`:
```ini
[Unit]
Description=Apex College Chatbot Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/Automation_AI/backend
ExecStart=/home/ubuntu/Automation_AI/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable college-bot
sudo systemctl start college-bot
```

### 2. Frontend Production Build
```bash
cd /home/ubuntu/Automation_AI/frontend
npm ci
npm run build
```

### 3. Nginx Reverse Proxy (`/etc/nginx/sites-available/college-bot`)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend static files
    location / {
        root /home/ubuntu/Automation_AI/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/college-bot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Environment Variables Reference

| Variable | Description | Default |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API Key from Google AI Studio | Optional (uses local grounding if blank) |
| `GEMINI_MODEL` | Gemini model version | `gemini-1.5-flash` |
| `OPENAI_API_KEY` | OpenAI API Key | Optional |
| `OPENAI_MODEL` | OpenAI Model | `gpt-4o-mini` |
| `SECRET_KEY` | JWT token signature secret key | Auto-generated |
| `SIMILARITY_THRESHOLD` | RAG vector matching sensitivity | `0.15` |
| `TOP_K_CHUNKS` | Number of context chunks per query | `5` |
