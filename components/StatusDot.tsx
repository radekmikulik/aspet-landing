// components/StatusDot.tsx
"use client";

import { ClientStatus } from "@/lib/clients.storage";

interface StatusDotProps {
  status: ClientStatus;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusDot({ status, size = 'sm' }: StatusDotProps) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3', 
    lg: 'h-4 w-4'
  };
  
  const colorClass = status === 'active' 
    ? 'bg-emerald-500' 
    : 'bg-neutral-900';
  
  const ariaLabel = status === 'active' ? 'Aktivní' : 'Neaktivní';
  
  return (
    <span
      className={`inline-block rounded-full ${colorClass} ${sizeClasses[size]}`}
      aria-label={ariaLabel}
      title={ariaLabel}
    />
  );
}