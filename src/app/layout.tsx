import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen,Search } from 'lucide-react';
import { Theme,ThemeToggle } from '@/components/theme';
import { catalogue } from '@/modules/content/catalogue';
import './globals.css';
import 'katex/dist/katex.min.css';
export const metadata:Metadata={title:{default:'CSE 2027 · Study workspace',template:'%s · CSE 2027'},description:'A focused workspace for UPSC CSE 2027. Read curricula, study chapters and search learning material.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body><Theme><a className="skip-link" href="#main">Skip to content</a><header className="topbar"><Link className="brand" href="/"><BookOpen size={22}/><strong>CSE<span>2027</span></strong></Link><div className="top-actions"><Link className="search-link" href="/search"><Search size={17}/><span>Search material</span><kbd>/</kbd></Link><ThemeToggle/></div></header><div className="app"><aside className="sidebar"><p className="eyebrow">STUDY WORKSPACE</p><Link className="nav-home" href="/">Overview</Link>{(['Prelims','Mains'] as const).map(stage=><details key={stage} open><summary>{stage}</summary><nav aria-label={stage+' papers'}>{catalogue.papers.filter(p=>p.stage===stage).map(p=><Link key={p.id} href={'/learn/'+p.id}>{p.title.replace(stage+' ','')}</Link>)}</nav></details>)}<div className="sidebar-footer">Public study library<br/><span>Private tools are being built.</span></div></aside><main id="main">{children}</main></div></Theme></body></html>;}
