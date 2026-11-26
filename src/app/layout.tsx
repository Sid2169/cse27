import type { Metadata } from "next";
import Link from "@/components/navigation-link";
import {
  BookOpen,
  Search,
  LayoutDashboard,
  LibraryBig,
  GraduationCap,
  Landmark,
} from "lucide-react";
import { Theme, ThemeToggle } from "@/components/theme";
import { catalogue } from "@/modules/content/catalogue";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/fraunces";
import "./globals.css";
import "katex/dist/katex.min.css";
export const metadata: Metadata = {
  title: { default: "CSE 2027 · Study workspace", template: "%s · CSE 2027" },
  description:
    "A focused workspace for UPSC CSE 2027. Read curricula, study chapters and search learning material.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Theme
          syncPreferences={process.env.READER_PREFERENCES_ENABLED === "true"}
        >
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <header className="topbar">
            <Link className="brand" href="/">
              <BookOpen size={22} />
              <strong>
                CSE<span>2027</span>
              </strong>
            </Link>
            <div className="top-actions">
              <Link className="search-link" href="/search">
                <Search size={17} />
                <span>Search material</span>
                <kbd>/</kbd>
              </Link>
              <Link className="search-link" href="/dashboard">
                <LayoutDashboard size={17} aria-hidden="true" /> My workspace
              </Link>
              <ThemeToggle />
            </div>
          </header>
          <div className="app">
            <aside className="sidebar">
              <p className="eyebrow">STUDY WORKSPACE</p>
              <Link className="nav-home" href="/">
                <LibraryBig size={18} aria-hidden="true" /> Overview
              </Link>
              {(["Prelims", "Mains"] as const).map((stage) => (
                <details key={stage} open>
                  <summary>
                    {stage === "Prelims" ? (
                      <Landmark size={16} aria-hidden="true" />
                    ) : (
                      <GraduationCap size={16} aria-hidden="true" />
                    )}
                    {stage}
                  </summary>
                  <nav aria-label={stage + " papers"}>
                    {catalogue.papers
                      .filter((p) => p.stage === stage)
                      .map((p) => (
                        <Link key={p.id} href={"/learn/" + p.id}>
                          {p.title.replace(stage + " ", "")}
                        </Link>
                      ))}
                  </nav>
                </details>
              ))}
              <div className="sidebar-footer">Public study library</div>
            </aside>
            <main id="main">{children}</main>
          </div>
        </Theme>
      </body>
    </html>
  );
}
