import { useCallback, useEffect, useState } from 'react';

interface PollingState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Hook genérico para polling (mantém dados quase em tempo real no dashboard).
export function usePolling<T>(fetcher: () => Promise<T>, intervalMs = 6000): PollingState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    try {
      const response = await fetcher();
      setData(response);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    run();
    const id = setInterval(run, intervalMs);
    return () => clearInterval(id);
  }, [run, intervalMs]);

  return { data, loading, error, refetch: run };
}
