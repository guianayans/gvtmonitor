import { api } from '../api/client';
import { ServerMetrics } from '../api/types';
import { usePolling } from './usePolling';

export const useServerMetrics = () => usePolling<ServerMetrics>(api.fetchServerMetrics, 6000);
