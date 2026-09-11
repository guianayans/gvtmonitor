import fs from 'fs';
import path from 'path';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { env } from './env';
import { sshService } from './sshService';
import {
  formatUptime,
  parseBlockDevices,
  parseDisks,
  parseDockerContainers,
  parseLoadAverage,
  parseMemory,
  parseNetworkPorts,
  parseUsers,
} from './parsers';
import { DockerContainerInfo, ServerInfo, ServerMetrics } from './types';

const app = express();
const PORT = env.port || 3030;

app.use(cors());
app.use(express.json());

const publicDir = path.join(__dirname, '..', 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/server/info', async (_req, res, next) => {
  try {
    const [hostnameRaw, uptimeRaw, whoRaw] = await sshService.execMany([
      'hostname',
      'uptime',
      'who',
    ]);

    const payload: ServerInfo = {
      hostname: hostnameRaw.trim(),
      uptime: formatUptime(uptimeRaw),
      users: parseUsers(whoRaw),
    };

    res.json(payload);
  } catch (err) {
    next(err);
  }
});

app.get('/api/server/metrics', async (_req, res, next) => {
  try {
    // Executa os comandos leves em sequência para evitar sobrecarga no host remoto
    // (uptime, load avg, memória, discos e blocos).
    const [uptimeRaw, loadRaw, memRaw, dfRaw, lsblkRaw] = await sshService.execMany([
      'uptime',
      'cat /proc/loadavg',
      'free -m',
      'df -h',
      'lsblk -o NAME,SIZE,TYPE,MOUNTPOINT',
    ]);

    const metrics: ServerMetrics = {
      uptime: formatUptime(uptimeRaw),
      loadAverage: parseLoadAverage(loadRaw),
      memory: parseMemory(memRaw),
      disks: parseDisks(dfRaw),
      blockDevices: parseBlockDevices(lsblkRaw),
    };

    res.json(metrics);
  } catch (err) {
    next(err);
  }
});

app.get('/api/server/network', async (_req, res, next) => {
  try {
    const output = await sshService.exec('ss -tulpn | head -n 20');
    const ports = parseNetworkPorts(output);
    res.json({ ports });
  } catch (err) {
    next(err);
  }
});

app.get('/api/docker/containers', async (_req, res, next) => {
  try {
    const output = await sshService.exec("docker ps --format '{{json .}}'");
    const containers: DockerContainerInfo[] = parseDockerContainers(output);
    res.json({ containers });
  } catch (err) {
    next(err);
  }
});

app.post('/api/docker/restart', async (req, res, next) => {
  try {
    const { containerName } = req.body as { containerName?: string };
    if (!containerName) {
      return res.status(400).json({ error: 'Informe containerName no corpo da requisição.' });
    }

    await sshService.exec(`docker restart ${containerName}`);
    res.json({ message: `Container ${containerName} reiniciado.` });
  } catch (err) {
    next(err);
  }
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err);
  const message = err instanceof Error ? err.message : 'Erro inesperado';
  res.status(500).json({ error: message });
});

if (fs.existsSync(publicDir)) {
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.log(`Backend escutando em http://0.0.0.0:${PORT}`);
  });
}

export default app;
