import { ReactNode } from 'react';

interface GlassCardProps {
  title: string;
  subtitle?: string;
  accent?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function GlassCard({ title, subtitle, accent = '#67e8f9', children, actions }: GlassCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
      <div
        className="pointer-events-none absolute inset-x-6 top-0 h-1 rounded-full"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
      />
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-200">{title}</p>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}
