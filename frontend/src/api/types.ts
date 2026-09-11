export interface ServerInfo {
  hostname: string;
  uptime: string;
  users: string[];
}

export interface LoadAverage {
  one: number;
  five: number;
  fifteen: number;
}

export interface MemoryMetrics {
  totalMb: number;
  usedMb: number;
  freeMb: number;
}

export interface DiskInfo {
  filesystem: string;
  size: string;
  used: string;
  available: string;
  usePercent: number;
  mountpoint: string;
}

export interface BlockDeviceInfo {
  name: string;
  size: string;
  type: string;
  mountpoint: string;
}

export interface ServerMetrics {
  uptime: string;
  loadAverage: LoadAverage;
  memory: MemoryMetrics;
  disks: DiskInfo[];
  blockDevices?: BlockDeviceInfo[];
}

export interface NetworkPortInfo {
  proto: string;
  localAddress: string;
  peerAddress: string;
  state?: string;
  process?: string;
}

export interface DockerContainerInfo {
  id: string;
  name: string;
  status: string;
  ports: string;
  image: string;
}
