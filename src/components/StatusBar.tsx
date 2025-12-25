import { cn } from '@/lib/utils';
import { Loader2, CheckCircle, XCircle, Info } from 'lucide-react';

type StatusType = 'idle' | 'loading' | 'success' | 'error';

interface StatusBarProps {
  status: StatusType;
  message: string;
}

export function StatusBar({ status, message }: StatusBarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-3 rounded-lg border transition-all duration-300",
        {
          "bg-muted/50 border-border text-muted-foreground": status === 'idle',
          "bg-primary/10 border-primary/30 text-primary": status === 'loading',
          "bg-success/10 border-success/30 text-success glow-success": status === 'success',
          "bg-destructive/10 border-destructive/30 text-destructive glow-destructive": status === 'error',
        }
      )}
    >
      {status === 'idle' && <Info className="w-4 h-4" />}
      {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
      {status === 'success' && <CheckCircle className="w-4 h-4" />}
      {status === 'error' && <XCircle className="w-4 h-4" />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
