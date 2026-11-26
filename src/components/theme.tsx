"use client";
import { ThemeProvider, useTheme } from "next-themes";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Moon, Sun } from "lucide-react";
function SyncReaderPreferences() {
  const { setTheme } = useTheme();
  const pathname = usePathname();
  const status = useSearchParams().get("status");
  const applySettings = pathname === "/settings" && status === "saved";
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/reader/preferences", {
      redirect: "manual",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return;
        const settings = await response.json();
        if (!settings || controller.signal.aborted) return;
        setTheme(settings.theme);
        document.documentElement.style.setProperty(
          "--reader-size",
          settings.text_size + "px",
        );
        window.dispatchEvent(
          new CustomEvent("reader-text-size", { detail: settings.text_size }),
        );
      })
      .catch(() => {});
    return () => controller.abort();
  }, [applySettings, setTheme]);
  return null;
}
export function Theme({
  children,
  syncPreferences,
}: {
  children: React.ReactNode;
  syncPreferences: boolean;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {syncPreferences && (
        <Suspense>
          <SyncReaderPreferences />
        </Suspense>
      )}
      {children}
    </ThemeProvider>
  );
}
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      className="icon-button"
      aria-label="Toggle light and dark theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun size={18} className="sun" />
      <Moon size={18} className="moon" />
    </button>
  );
}
