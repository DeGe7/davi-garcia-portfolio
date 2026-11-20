import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

type LiquidGlassHeaderProps = ComponentPropsWithoutRef<'header'>;

export function LiquidGlassHeader({
  children,
  className,
  ...props
}: LiquidGlassHeaderProps) {
  return (
    <header className={cn('liquid-glass-header', className)} {...props}>
      <span className="liquid-glass-header-wash" aria-hidden="true" />
      <div className="liquid-glass-header-content">{children}</div>
    </header>
  );
}
