import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type ToastType = 'success' | 'error';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4000;

const typeConfig: Record<ToastType, { label: string; accent: string; badge: string; icon: string }> = {
  success: {
    label: 'Éxito',
    accent: 'border-l-status-active',
    badge: 'bg-status-active',
    icon: '✓',
  },
  error: {
    label: 'Error',
    accent: 'border-l-status-cancelled',
    badge: 'bg-status-cancelled',
    icon: '✕',
  },
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de <ToastProvider>');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextIdRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  // Limpia los timers pendientes al desmontar (no deja toasts huérfanos).
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = nextIdRef.current++;
      setToasts((current) => [...current, { id, type, message }]);
      const timer = window.setTimeout(() => removeToast(id), TOAST_DURATION_MS);
      timersRef.current.push(timer);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed right-4 top-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
        role="region"
        aria-label="Notificaciones"
      >
        {toasts.map((toast) => {
          const config = typeConfig[toast.type];
          return (
            <div
              key={toast.id}
              className={`toast-in flex items-start gap-3 rounded-md border border-line border-l-4 bg-card p-4 shadow-lg ${config.accent}`}
              role={toast.type === 'error' ? 'alert' : 'status'}
            >
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${config.badge}`}
              >
                {config.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{config.label}</p>
                <p className="break-words text-sm text-ink-soft">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="rounded p-1 text-ink-soft hover:text-ink"
                aria-label="Cerrar notificación"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
