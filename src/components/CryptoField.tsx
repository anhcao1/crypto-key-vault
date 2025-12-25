import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CryptoFieldProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

export function CryptoField({ label, value, onChange, readOnly = false, placeholder }: CryptoFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        className={readOnly ? "bg-muted/30 cursor-default" : ""}
      />
    </div>
  );
}
