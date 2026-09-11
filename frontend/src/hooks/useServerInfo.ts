import { api } from '../api/client';
import { ServerInfo } from '../api/types';
import { usePolling } from './usePolling';

export const useServerInfo = () => usePolling<ServerInfo>(api.fetchServerInfo, 10000);
