## GVT Monitor — painel glassy para servidores Linux (SSH)

Aplicação full‑stack (Node 20 + TypeScript no backend, React/Vite + Tailwind no frontend) que se conecta via **SSH** a um servidor Linux para coletar métricas e gerenciar containers Docker. A API roda em `0.0.0.0:3030` e serve o build do frontend a partir de `backend/public`.

### Estrutura
- `backend/`: API Express (TS) + serviço SSH.
- `frontend/`: Vite + React + Tailwind (TS), build copiado para `backend/public` no container.
- `docker-compose.yml` e `Dockerfile`: execução unificada (Coolify: modo *Docker Compose (Empty)* na porta 3030).

### Variáveis de ambiente (consulte `.env.example`)
- `SERVER_HOST`, `SERVER_PORT` (padrão 22)
- `SERVER_USER`
- `SERVER_PASSWORD` **ou** `SERVER_KEY_PATH` (caminho da chave privada dentro do container)
- `PORT` (padrão 3030)
- `ALLOWED_SERVICES` (usado por algumas operações do host)

### Rotas da API
- `GET /api/health` — status básico da API.
- `GET /api/server/info` — `hostname`, uptime formatado, usuários logados (`who`).
- `GET /api/server/metrics` — uptime, load average (`/proc/loadavg`), memória (`free -m`), discos (`df -h` + `lsblk`).
- `GET /api/server/network` — principais portas em uso (`ss -tulpn | head -n 20`).
- `GET /api/docker/containers` — lista de containers (`docker ps --format '{{json .}}'`).
- `POST /api/docker/restart` — body `{ "containerName": "id_ou_nome" }`, roda `docker restart <container>` via SSH.

Erros de SSH ou de comando retornam JSON `{ error: "mensagem" }` com status adequado.

### Rodando localmente (dev)
1) Backend
```bash
cd backend
npm install
npm run dev   # porta 3030
```
2) Frontend
```bash
cd frontend
npm install
npm run dev   # porta 5173
# se rodar API em outro host/porta, defina VITE_API_URL
```

### Via Docker / Compose
```bash
docker compose up --build
```
Isso expõe `http://localhost:3030` com API + frontend. Para usar chave SSH, monte o arquivo no caminho indicado por `SERVER_KEY_PATH` ou forneça `SERVER_PASSWORD`.
