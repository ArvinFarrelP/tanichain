import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from './card';
import { Button } from './button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary/40 text-muted-foreground">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="font-medium text-foreground">{title}</p>
          {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
        </div>
        {action && (
          <Button size="sm" onClick={action.onClick} className="mt-2">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
