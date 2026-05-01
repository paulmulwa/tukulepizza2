'use client';

import Link from 'next/link';

interface BackButtonProps {
  href: string;
}

export default function BackButton({ href }: BackButtonProps) {
  return (
    <Link href={href} className="back-btn" aria-label="Go back" id="back-btn">
      ←
    </Link>
  );
}
