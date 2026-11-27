"use client";

import { useFormStatus } from "react-dom";

export function TestActionButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button className="button primary" disabled={pending} type="submit">
      {pending ? pendingLabel : label}
    </button>
  );
}
