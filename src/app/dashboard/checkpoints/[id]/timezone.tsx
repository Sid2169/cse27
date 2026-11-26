"use client";
export function CheckpointTimezone() {
  return (
    <input
      type="hidden"
      name="timezone"
      defaultValue="UTC"
      ref={(input) => {
        if (input)
          input.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
      }}
    />
  );
}
