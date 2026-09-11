import {
  BlockDeviceInfo,
  DiskInfo,
  DockerContainerInfo,
  LoadAverage,
  MemoryMetrics,
  NetworkPortInfo,
} from './types';

export const formatUptime = (uptimeRaw: string): string => {
  const match = uptimeRaw.match(/up\s+(.+?),\s+\d+\s+user/);
  if (match?.[1]) return match[1].trim();
  const cleaned = uptimeRaw.replace(/\s+/g, ' ').trim();
  return cleaned || 'n/d';
};

export const parseUsers = (whoRaw: string): string[] =>
  whoRaw
    .split('\n')
    .map((line) => line.trim().split(/\s+/)[0])
    .filter(Boolean);

export const parseLoadAverage = (raw: string): LoadAverage => {
  const parts = raw.trim().split(/\s+/);
  const [one, five, fifteen] = parts.map((v) => Number.parseFloat(v));
  return {
    one: Number.isFinite(one) ? Number(one.toFixed(2)) : 0,
    five: Number.isFinite(five) ? Number(five.toFixed(2)) : 0,
    fifteen: Number.isFinite(fifteen) ? Number(fifteen.toFixed(2)) : 0,
  };
};

export const parseMemory = (raw: string): MemoryMetrics => {
  const line = raw
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.toLowerCase().startsWith('mem:'));

  if (!line) return { totalMb: 0, usedMb: 0, freeMb: 0 };

  const [, total, used, free] = line.split(/\s+/);
  return {
    totalMb: Number(total) || 0,
    usedMb: Number(used) || 0,
    freeMb: Number(free) || 0,
  };
};

export const parseDisks = (raw: string): DiskInfo[] => {
  const lines = raw.split('\n').filter((l) => l && !l.toLowerCase().startsWith('filesystem'));
  return lines.map((line) => {
    const parts = line.trim().split(/\s+/);
    const [filesystem, size, used, available, usePercentRaw, ...mountRaw] = parts;
    const mountpoint = mountRaw.join(' ') || parts[5] || '';
    const usePercent = Number((usePercentRaw || '').replace('%', '')) || 0;
    return { filesystem, size, used, available, usePercent, mountpoint } as DiskInfo;
  });
};

export const parseBlockDevices = (raw: string): BlockDeviceInfo[] => {
  const lines = raw.split('\n').filter((l) => l && !l.toLowerCase().startsWith('name'));
  return lines.map((line) => {
    const [name, size, type, ...mount] = line.trim().split(/\s+/);
    return { name, size, type, mountpoint: mount.join(' ') };
  });
};

export const parseNetworkPorts = (raw: string): NetworkPortInfo[] => {
  const lines = raw.split('\n').filter((l) => l && !l.toLowerCase().startsWith('netid'));
  return lines.map((line) => {
    const parts = line.trim().split(/\s+/);
    const [proto, state, , , localAddress, peerAddress, ...rest] = parts;
    const process = rest.join(' ');
    return {
      proto: proto || 'n/d',
      state,
      localAddress,
      peerAddress,
      process,
    };
  });
};

export const parseDockerContainers = (raw: string): DockerContainerInfo[] => {
  const lines = raw.split('\n').filter(Boolean);
  const containers: DockerContainerInfo[] = [];

  for (const line of lines) {
    try {
      const json = JSON.parse(line);
      containers.push({
        id: json.ID || json.Id || '',
        name: json.Names || json.NAMES || '',
        status: json.Status || '',
        ports: json.Ports || '',
        image: json.Image || '',
      });
    } catch (err) {
      // ignore malformed lines
    }
  }

  return containers;
};
