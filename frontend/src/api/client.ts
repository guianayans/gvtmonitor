import {
  DockerContainerInfo,
  NetworkPortInfo,
  ServerInfo,
  ServerMetrics,
} from './types';

const API_BASE =
  import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3030');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const payload = await res.json();
      message = payload?.error || payload?.message || message;
    } catch (err) {
      // ignore parse errors
    }
    throw new Error(message || `Erro ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  fetchServerInfo: () => request<ServerInfo>('/api/server/info'),
  fetchServerMetrics: () => request<ServerMetrics>('/api/server/metrics'),
  fetchNetworkPorts: () => request<{ ports: NetworkPortInfo[] }>('/api/server/network').then((r) => r.ports),
  fetchDockerContainers: () =>
    request<{ containers: DockerContainerInfo[] }>('/api/docker/containers').then((r) => r.containers),
  restartContainer: (containerName: string) =>
    request<{ message: string }>('/api/docker/restart', {
      method: 'POST',
      body: JSON.stringify({ containerName }),
    }),
};
