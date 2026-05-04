import type { ReactNode } from 'react';

interface SvgIconProps {
  children: ReactNode;
  viewBox?: string;
}

export function SvgIcon({ children, viewBox = '0 0 24 24' }: SvgIconProps) {
  return (
    <svg
      height="16"
      viewBox={viewBox}
      width="16"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flex: '0 0 auto', lineHeight: 1 }}
    >
      {children}
    </svg>
  );
}
