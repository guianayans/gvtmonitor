import { useCallback, useState } from 'react';
import { api } from '../api/client';
import { DockerContainerInfo } from '../api/types';
import { usePolling } from './usePolling';

export const useDockerContainers = () => {
  const { data, loading, error, refetch } = usePolling<DockerContainerInfo[]>(api.fetchDockerContainers, 8000);
  const [actioning, setActioning] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const restart = useCallback(
    async (containerName: string) => {
      try {
        setActioning(containerName);
        setActionError(null);
        await api.restartContainer(containerName);
        await refetch();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Falha ao reiniciar container';
        setActionError(message);
      } finally {
        setActioning(null);
      }
    },
    [refetch]
  );

  return {
    containers: data || [],
    loading,
    error: error || actionError,
    restart,
    actioning,
  };
};
