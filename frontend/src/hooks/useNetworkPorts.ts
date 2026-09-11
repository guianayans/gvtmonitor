import { api } from '../api/client';
import { NetworkPortInfo } from '../api/types';
import { usePolling } from './usePolling';

export const useNetworkPorts = () => usePolling<NetworkPortInfo[]>(api.fetchNetworkPorts, 10000);
