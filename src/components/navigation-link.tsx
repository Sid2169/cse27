"use client";

import Link, { useLinkStatus } from "next/link";
import type { ComponentProps } from "react";

function NavigationStatus() {
  const { pending } = useLinkStatus();
  return pending ? (
    <span className="navigation-feedback" role="status">
      <span className="navigation-track" aria-hidden="true" />
      <span className="navigation-toast">Opening page…</span>
    </span>
  ) : null;
}

export default function NavigationLink({
  children,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link {...props}>
      {children}
      <NavigationStatus />
    </Link>
  );
}
