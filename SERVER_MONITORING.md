# Guia rápido — monitoramento via SSH

## Variáveis obrigatórias
Veja `.env.example` e crie um `.env` com:

```
PORT=3030
SERVER_HOST=seu-host-ou-ip
SERVER_PORT=22
SERVER_USER=root
# escolha um modo de autenticação
SERVER_PASSWORD=sua-senha
SERVER_KEY_PATH=/root/.ssh/id_rsa
ALLOWED_SERVICES=docker,ssh,nginx
```

> Monte o arquivo de chave no mesmo caminho dentro do container (ex.: `-v ~/.ssh/id_rsa:/root/.ssh/id_rsa:ro`). Se usar senha, deixe `SERVER_KEY_PATH` vazio.

## Subindo com Docker Compose
```bash
docker compose --env-file .env up --build -d
# acessa em http://localhost:3030
```

## Desenvolvimento
- API: `cd backend && npm install && npm run dev`
- Frontend: `cd frontend && npm install && npm run dev`
- Opcional: defina `VITE_API_URL` no frontend para apontar para outro host.

## O que o backend executa via SSH
- `hostname`, `uptime`, `who`
- `cat /proc/loadavg`, `free -m`, `df -h`, `lsblk -o NAME,SIZE,TYPE,MOUNTPOINT`
- `ss -tulpn | head -n 20`
- `docker ps --format '{{json .}}'`
- `docker restart <container>` (rota POST)

## Atualização no frontend
O dashboard usa hooks com polling: `server/info` a cada 10s, `metrics` a cada 6s, `network` a cada 10s e `docker` a cada 8s. Estados de carregamento e erros são exibidos em cada card.
