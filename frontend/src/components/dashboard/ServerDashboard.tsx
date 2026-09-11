import { useMemo } from 'react';
import { useDockerContainers } from '../../hooks/useDockerContainers';
import { useNetworkPorts } from '../../hooks/useNetworkPorts';
import { useServerInfo } from '../../hooks/useServerInfo';
import { useServerMetrics } from '../../hooks/useServerMetrics';
import { DockerContainerInfo } from '../../api/types';
import { DataState } from './DataState';
import { GlassCard } from './GlassCard';
import { ProgressBar } from './ProgressBar';

const formatMemory = (mb: number | undefined) => {
  if (!mb || Number.isNaN(mb)) return '0 MB';
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb.toFixed(0)} MB`;
};

const StatusDot = ({ online }: { online: boolean }) => (
  <span
    className={`inline-flex h-3 w-3 rounded-full ${online ? 'bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.35)]' : 'bg-rose-400'}`}
  />
);

const ContainerRow = ({ container, onRestart, busy }: { container: DockerContainerInfo; onRestart: () => void; busy: boolean }) => (
  <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2">
    <div>
      <p className="text-sm font-semibold text-slate-100">{container.name || container.id}</p>
      <p className="text-xs text-slate-400">{container.image}</p>
      <p className="text-[11px] text-slate-500">{container.ports || 'Sem portas expostas'}</p>
    </div>
    <div className="flex items-center gap-3">
      <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">
        {container.status || 'desconhecido'}
      </span>
      <button
        onClick={onRestart}
        disabled={busy}
        className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-100 transition hover:bg-white/20 disabled:opacity-60"
      >
        {busy ? 'Reiniciando...' : 'Reiniciar'}
      </button>
    </div>
  </div>
);

export function ServerDashboard() {
  const { data: info, loading: loadingInfo, error: infoError } = useServerInfo();
  const { data: metrics, loading: loadingMetrics, error: metricsError } = useServerMetrics();
  const { data: ports, loading: loadingPorts, error: portsError } = useNetworkPorts();
  const { containers, loading: loadingContainers, error: containersError, restart, actioning } = useDockerContainers();

  const memoryUsage = useMemo(() => {
    if (!metrics?.memory?.totalMb) return 0;
    return Math.round((metrics.memory.usedMb / metrics.memory.totalMb) * 100);
  }, [metrics]);

  const loadBadges = metrics
    ? [
        { label: '1m', value: metrics.loadAverage.one },
        { label: '5m', value: metrics.loadAverage.five },
        { label: '15m', value: metrics.loadAverage.fifteen },
      ]
    : [];

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-fuchsia-500/5 to-emerald-500/5" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-6 py-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">gvt monitor</p>
            <h1 className="text-3xl font-semibold text-slate-50">Painel do servidor Linux</h1>
            <p className="text-sm text-slate-400">Monitoramento rápido via SSH remoto, atualização a cada poucos segundos.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
            <StatusDot online={Boolean(metrics)} />
            <span>{metrics ? 'Conectado' : 'Aguardando conexão SSH'}</span>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-4 md:grid-cols-2">
          <GlassCard title="Servidor" subtitle="Hostname, uptime e usuários" accent="#7dd3fc">
            <DataState loading={loadingInfo} error={infoError}>
              <p className="text-xl font-semibold text-slate-50">{info?.hostname || '--'}</p>
              <p className="text-sm text-slate-300">Uptime: {info?.uptime || 'n/d'}</p>
              <p className="text-sm text-slate-300">Usuários logados: {info?.users.length ?? 0}</p>
              {info?.users?.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {info.users.map((user) => (
                    <span key={user} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                      {user}
                    </span>
                  ))}
                </div>
              ) : null}
            </DataState>
          </GlassCard>

          <GlassCard title="Carga (load avg)" subtitle="CPU nos últimos minutos" accent="#c084fc">
            <DataState loading={loadingMetrics} error={metricsError}>
              <div className="flex gap-2">
                {loadBadges.map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">{item.label}</p>
                    <p className="text-lg font-semibold text-slate-50">{item.value.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-400">Valores acima de 1.00 indicam filas de CPU em hosts single-core.</p>
            </DataState>
          </GlassCard>

          <GlassCard title="Memória" subtitle="Uso em tempo quase real" accent="#67e8f9">
            <DataState loading={loadingMetrics} error={metricsError}>
              <div className="mb-2 flex items-end justify-between">
                <p className="text-2xl font-semibold text-slate-50">{memoryUsage}%</p>
                <p className="text-sm text-slate-300">
                  {formatMemory(metrics?.memory.usedMb)} / {formatMemory(metrics?.memory.totalMb)}
                </p>
              </div>
              <ProgressBar value={memoryUsage} accent="#67e8f9" />
              <p className="mt-2 text-xs text-slate-400">Livre: {formatMemory(metrics?.memory.freeMb)}</p>
            </DataState>
          </GlassCard>

          <GlassCard title="Uptime" subtitle="a partir do comando uptime" accent="#fcd34d">
            <DataState loading={loadingMetrics} error={metricsError}>
              <p className="text-2xl font-semibold text-slate-50">{metrics?.uptime || info?.uptime || '--'}</p>
              <p className="text-xs text-slate-400">Atualiza a cada ~6s</p>
            </DataState>
          </GlassCard>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <GlassCard title="Discos" subtitle="df -h" accent="#34d399" >
            <DataState loading={loadingMetrics} error={metricsError}>
              <div className="space-y-3">
                {metrics?.disks?.length ? (
                  metrics.disks.map((disk) => (
                    <div key={`${disk.filesystem}-${disk.mountpoint}`} className="rounded-xl border border-white/5 bg-white/5 p-3">
                      <div className="flex items-center justify-between text-sm text-slate-200">
                        <div>
                          <p className="font-semibold">{disk.filesystem}</p>
                          <p className="text-xs text-slate-400">{disk.mountpoint || '-'}</p>
                        </div>
                        <p className="text-sm text-slate-200">{disk.used} / {disk.size}</p>
                      </div>
                      <div className="mt-2">
                        <ProgressBar value={disk.usePercent} accent="#34d399" />
                        <p className="mt-1 text-xs text-slate-400">Livre: {disk.available} ({disk.usePercent}% usado)</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">Sem dados de disco.</p>
                )}
              </div>
            </DataState>
          </GlassCard>

          <GlassCard title="Rede" subtitle="ss -tulpn" accent="#60a5fa">
            <DataState loading={loadingPorts} error={portsError}>
              <div className="space-y-2 max-h-80 overflow-auto pr-1">
                {ports?.length ? (
                  ports.slice(0, 12).map((port, idx) => (
                    <div key={`${port.localAddress}-${port.process}-${idx}`} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-200">
                      <div>
                        <p className="font-semibold">{port.localAddress}</p>
                        <p className="text-xs text-slate-400">{port.peerAddress}</p>
                      </div>
                      <div className="text-right text-xs text-slate-300">
                        <p>
                          {port.proto} {port.state}
                        </p>
                        <p className="text-[11px] text-slate-400">{port.process || 'processo n/d'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">Nenhuma porta listada.</p>
                )}
              </div>
            </DataState>
          </GlassCard>

          <GlassCard title="Containers Docker" subtitle="docker ps" accent="#f472b6" actions={
            <span className="text-xs text-slate-400">Atualiza a cada 8s</span>
          }>
            <DataState loading={loadingContainers} error={containersError}>
              <div className="space-y-3 max-h-80 overflow-auto pr-1">
                {containers.map((container) => (
                  <ContainerRow
                    key={container.id}
                    container={container}
                    busy={actioning === container.name || actioning === container.id}
                    onRestart={() => restart(container.name || container.id)}
                  />
                ))}
                {containers.length === 0 && <p className="text-sm text-slate-400">Nenhum container em execução.</p>}
              </div>
            </DataState>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
