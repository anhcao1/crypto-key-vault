import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SectionCardProps {
  title: string;
  icon?: ReactNode;
  step?: number;
  children: ReactNode;
}

export function SectionCard({ title, icon, step, children }: SectionCardProps) {
  return (
    <Card className="relative overflow-hidden">
      {step && (
        <div className="absolute top-0 left-0 w-8 h-8 bg-primary/20 flex items-center justify-center text-primary font-bold text-sm rounded-br-xl">
          {step}
        </div>
      )}
      <CardHeader className={step ? "pl-12" : ""}>
        <CardTitle className="text-foreground">
          {icon && <span className="text-primary">{icon}</span>}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
