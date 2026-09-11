import { ReactNode } from 'react';

interface DataStateProps {
  loading: boolean;
  error: string | null;
  children: ReactNode;
}

export function DataState({ loading, error, children }: DataStateProps) {
  if (loading) {
    return <p className="text-sm text-slate-400">Carregando...</p>;
  }

  if (error) {
    return <p className="text-sm text-rose-300">{error}</p>;
  }

  return <>{children}</>;
}
