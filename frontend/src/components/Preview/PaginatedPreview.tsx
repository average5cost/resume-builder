import { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';
import type { Module } from '../../types/resume';
import type { Template } from '../../types/resume';
import ResumeRenderer from './ResumeRenderer';

/* ─── Constants ─────────────────────────────────────────── */
const PAGE_H = 1123;
const PAD_Y = 57;  // 15 mm
const PAD_X = 76;  // 20 mm
const SAFE = PAGE_H - PAD_Y * 2; // 1009 px
const ORPHAN = 70;

/* ─── Flat queue ─────────────────────────────────────────── */
type QKind = 'personal' | 'section-hdr' | 'entry-hdr' | 'desc' | 'link' | 'skills' | 'summary';

interface QI {
  kind: QKind;
  mi: number;        // module index
  ei: number;        // entry index, -1
  li: number;        // line index, -1
  title?: string;
  subtitle?: string;
  text?: string;
}

function split(s: string) { return s.split('\n').map((l) => l.trim()).filter(Boolean); }

function safeParse<T extends object>(data: string, fallback: T): T {
  try { const p = JSON.parse(data); return typeof p === 'object' && p !== null ? { ...fallback, ...p } : fallback; }
  catch { return fallback; }
}

const TITLES: Record<string, string> = {
  education: '教育经历', project: '项目经历', research: '研究经历',
  internship: '实习经历', skills_certs: '技能证书', personal_summary: '个人总结',
  club_org: '社团经历', honors_awards: '荣誉奖项',
};

function flatten(mods: Module[]): QI[] {
  const q: QI[] = [];
  mods.forEach((m, mi) => {
    const t = m.type;
    if (t === 'personal_info') { q.push({ kind: 'personal', mi, ei: -1, li: -1 }); return; }
    if (t === 'personal_summary') {
      q.push({ kind: 'section-hdr', mi, ei: -1, li: -1, title: TITLES[t] });
      split(safeParse<{ content: string }>(m.data, { content: '' }).content).forEach((text, li) => q.push({ kind: 'summary', mi, ei: -1, li, text }));
      return;
    }
    if (t === 'skills_certs') {
      q.push({ kind: 'section-hdr', mi, ei: -1, li: -1, title: TITLES[t] });
      const d = safeParse<{ skills: string[]; certificates: any[]; languages: any[] }>(m.data, { skills: [], certificates: [], languages: [] });
      if (d.skills.length) q.push({ kind: 'skills', mi, ei: -1, li: 0 });
      if (d.certificates.length) q.push({ kind: 'skills', mi, ei: -1, li: 1 });
      if (d.languages.length) q.push({ kind: 'skills', mi, ei: -1, li: 2 });
      return;
    }
    // entry-based
    const data = safeParse<{ entries: any[] }>(m.data, { entries: [] });
    q.push({ kind: 'section-hdr', mi, ei: -1, li: -1, title: TITLES[t] || '' });
    data.entries.forEach((e: any, ei: number) => {
      let sub = e.role || e.position || e.degree || e.issuer || '';
      if (e.major) sub = sub ? `${sub} · ${e.major}` : e.major;
      if (e.gpa) sub = sub ? `${sub} · GPA ${e.gpa}` : `GPA ${e.gpa}`;
      q.push({ kind: 'entry-hdr', mi, ei, li: -1, title: e.name || e.school || e.title || e.company || '', subtitle: sub || '' });
      split(e.description || '').forEach((text, li) => q.push({ kind: 'desc', mi, ei, li, text }));
      if (e.link) q.push({ kind: 'link', mi, ei, li: -1, text: e.link });
    });
  });
  return q;
}

/* ─── Measure: walk queue ↔ DOM produced by ResumeRenderer ───
   Heights include CSS margin-bottom (getComputedStyle) so the
   accumulated total exactly reproduces the gaps between elements
   caused by .section, .entry, and li margins. Without this,
   ~200 px of vertical margins are missing per A4 page and
   content overflows past the SAFE boundary. */
function measure(container: HTMLElement, queue: QI[]): number[] {
  const h: number[] = new Array(queue.length).fill(0);
  const sections = container.querySelectorAll<HTMLElement>('[data-section]');
  let qi = 0;

  const mb = (el: HTMLElement) => parseFloat(getComputedStyle(el).marginBottom) || 0;

  for (let si = 0; si < sections.length && qi < queue.length; si++) {
    const sec = sections[si];
    const item = queue[qi];
    const secMb = mb(sec);

    // personal block — measure whole section + its margin-bottom
    if (item.kind === 'personal') { h[qi++] = sec.getBoundingClientRect().height + secMb; continue; }

    // Track first qi in this section to add section margin later
    const secFirstQi = qi;

    // section header (h2 margin-bottom is inside the [data-section-header] div's
    // border-box, so getBoundingClientRect().height already captures it)
    if (item.kind === 'section-hdr') {
      const el = sec.querySelector<HTMLElement>('[data-section-header]');
      h[qi++] = el ? el.getBoundingClientRect().height + mb(el) : 0;
    }

    // Entries
    const entryEls = sec.querySelectorAll<HTMLElement>('[data-entry]');
    for (let ei = 0; ei < entryEls.length && qi < queue.length; ei++) {
      const entry = entryEls[ei];
      const cur = queue[qi];
      if (cur.kind !== 'entry-hdr' || cur.mi !== item.mi) break;

      const entryFirstQi = qi;
      const entryMb = mb(entry);

      // entry header = title + subtitle combined height (includes margin between them)
      const titleEl = entry.querySelector<HTMLElement>('[data-entry-title]');
      const subEl = entry.querySelector<HTMLElement>('[data-entry-subtitle]');
      if (titleEl && subEl) {
        const t = titleEl.getBoundingClientRect();
        const s = subEl.getBoundingClientRect();
        h[qi++] = Math.max(s.bottom, t.bottom) - Math.min(t.top, s.top) + mb(subEl);
      } else if (titleEl) {
        h[qi++] = titleEl.getBoundingClientRect().height + mb(titleEl);
      } else {
        h[qi++] = 0;
      }

      // desc items & link within this entry — each includes its own margin-bottom
      while (qi < queue.length) {
        const nxt = queue[qi];
        if (nxt.mi !== cur.mi || nxt.ei !== cur.ei) break;
        if (nxt.kind === 'desc') {
          const lis = entry.querySelectorAll<HTMLElement>('[data-desc-item]');
          const li = lis[nxt.li] as HTMLElement | undefined;
          h[qi++] = li ? li.getBoundingClientRect().height + mb(li) : 20;
        } else if (nxt.kind === 'link') {
          const link = entry.querySelector<HTMLElement>('.entry-link') as HTMLElement | undefined;
          h[qi++] = link ? link.getBoundingClientRect().height + mb(link) : 20;
        } else { break; }
      }

      // Fold entry's own margin-bottom into the last item within this entry
      if (qi > entryFirstQi) h[qi - 1] += entryMb;
    }

    // skills rows / summary
    if (item.kind === 'section-hdr') {
      while (qi < queue.length) {
        const nxt = queue[qi];
        if (nxt.mi !== item.mi) break;
        if (nxt.kind === 'skills') {
          const rows = sec.querySelectorAll<HTMLElement>('[data-skills-row]');
          const row = rows[nxt.li] as HTMLElement | undefined;
          h[qi++] = row ? row.getBoundingClientRect().height + mb(row) : 20;
        } else if (nxt.kind === 'summary') {
          const lis = sec.querySelectorAll<HTMLElement>('[data-desc-item]');
          const li = lis[nxt.li] as HTMLElement | undefined;
          h[qi++] = li ? li.getBoundingClientRect().height + mb(li) : 20;
        } else { break; }
      }
    }

    // Fold section's margin-bottom into the last item within this section
    if (qi > secFirstQi) h[qi - 1] += secMb;
  }

  return h;
}

/* ─── Paginate ───────────────────────────────────────────── */
function paginate(heights: number[], queue: QI[]): number[][] {
  const pages: number[][] = [[]];
  let used = 0;

  for (let i = 0; i < heights.length; i++) {
    const h = heights[i];
    const rem = SAFE - used;

    // Atomic: node fits → place it; else → new page
    if (h <= rem) {
      // Orphan: section header must have follower room
      if (queue[i].kind === 'section-hdr') {
        const nextH = i + 1 < heights.length ? heights[i + 1] : 0;
        if (rem < h + Math.min(nextH, 50)) { pages.push([i]); used = h; continue; }
      }
      pages[pages.length - 1].push(i);
      used += h;
    } else {
      pages.push([i]);
      used = h;
    }
  }
  if (pages[pages.length - 1].length === 0) pages.pop();
  return pages;
}

/* ─── Rebuild module data from queue items ───────────────── */
function buildPage(
  qiList: number[],
  queue: QI[],
  allMods: Module[],
  prevSeen: Set<number>,
): Module[] {
  const items = qiList.map((i) => queue[i]);
  const byMod = new Map<number, QI[]>();
  for (const it of items) { if (!byMod.has(it.mi)) byMod.set(it.mi, []); byMod.get(it.mi)!.push(it); }

  const result: Module[] = [];

  for (const [mi, qis] of byMod) {
    const orig = allMods[mi];
    const hasHdr = qis.some((it) => it.kind === 'section-hdr');
    const continuation = prevSeen.has(mi) && !hasHdr;

    // Don't include module if it has no actual content
    const contentKinds = qis.map((it) => it.kind);
    const hasContent = contentKinds.some((k) => k === 'entry-hdr' || k === 'desc' || k === 'link' || k === 'skills' || k === 'summary' || k === 'personal');

    if (!hasContent) continue; // ← fixes empty placeholder bug

    const mod: Module = { ...orig, _continuation: continuation };

    if (orig.type === 'personal_info') { result.push(mod); continue; }

    if (orig.type === 'personal_summary') {
      const lines = qis.filter((it) => it.kind === 'summary').map((it) => it.text || '');
      const p = safeParse<{ content: string }>(orig.data, { content: '' });
      mod.data = JSON.stringify({ ...p, content: lines.join('\n') });
      result.push(mod);
      continue;
    }

    if (orig.type === 'skills_certs') {
      const p = safeParse<{ skills: string[]; certificates: any[]; languages: any[] }>(orig.data, { skills: [], certificates: [], languages: [] });
      const rows = qis.filter((it) => it.kind === 'skills').map((it) => it.li);
      const out: Record<string, any> = {};
      if (rows.includes(0) && p.skills.length) out.skills = p.skills;
      if (rows.includes(1) && p.certificates.length) out.certificates = p.certificates;
      if (rows.includes(2) && p.languages.length) out.languages = p.languages;
      if (Object.keys(out).length) { mod.data = JSON.stringify({ ...p, ...out }); result.push(mod); }
      continue;
    }

    // Entry-based: include entries with ANY items on this page (hdr, desc, or link)
    const origEntries: any[] = safeParse<{ entries: any[] }>(orig.data, { entries: [] }).entries;
    const entryIdxs = [...new Set(qis.filter((it) => it.ei >= 0 && (it.kind === 'entry-hdr' || it.kind === 'desc' || it.kind === 'link')).map((it) => it.ei))].sort((a, b) => a - b);

    const built: any[] = [];
    for (const ei of entryIdxs) {
      const oe = origEntries[ei] || {};
      const hasHeaderOnThisPage = qis.some((it) => it.kind === 'entry-hdr' && it.ei === ei);
      const descLines = qis.filter((it) => it.kind === 'desc' && it.ei === ei).sort((a, b) => a.li - b.li).map((it) => it.text || '');
      const links = qis.filter((it) => it.kind === 'link' && it.ei === ei).map((it) => it.text || '');
      const entry = { ...oe, description: descLines.join('\n'), link: links[0] || oe.link || '' };
      if (!hasHeaderOnThisPage) entry._continuation = true;
      built.push(entry);
    }
    if (built.length === 0) continue; // no entries → don't render module

    const p = safeParse<{ entries: any[] }>(orig.data, { entries: [] });
    mod.data = JSON.stringify({ ...p, entries: built });
    result.push(mod);
  }

  return result;
}

/* ─── Component ──────────────────────────────────────────── */
interface Props {
  modules: Module[];
  template: Template | null;
  fontScale?: number;
  primaryColor?: string;
  accentColor?: string;
}

export default function PaginatedPreview({ modules, template, fontScale, primaryColor, accentColor }: Props) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<Module[][]>([modules]);
  const [key, setKey] = useState(0);

  const splitPages = useCallback(() => {
    const c = measureRef.current;
    if (!c) return;

    const idToIdx = new Map<number, number>();
    modules.forEach((m, i) => idToIdx.set(m.id, i));

    const queue = flatten(modules);
    const heights = measure(c, queue);
    if (heights.length === 0) { setPages([modules]); return; }

    const qiPages = paginate(heights, queue);

    const built: Module[][] = [];
    const seen = new Set<number>();

    for (const qiList of qiPages) {
      const pageMods = buildPage(qiList, queue, modules, seen);
      for (const pm of pageMods) {
        const idx = idToIdx.get(pm.id);
        if (idx !== undefined) seen.add(idx);
      }
      built.push(pageMods);
    }

    const same = built.length === pages.length && built.every((p, i) => p.length === pages[i].length);
    if (!same && built.length > 0) setPages(built);
  }, [modules, pages]);

  useLayoutEffect(() => { const r = requestAnimationFrame(() => splitPages()); return () => cancelAnimationFrame(r); }, []);
  useEffect(() => { const r = requestAnimationFrame(() => splitPages()); return () => cancelAnimationFrame(r); }, [fontScale, template?.id, key]);
  useEffect(() => {
    const c = measureRef.current; if (!c) return;
    const o = new MutationObserver(() => setKey((k) => k + 1));
    o.observe(c, { childList: true, subtree: true, characterData: true });
    return () => o.disconnect();
  }, [template?.id]);

  const tcls = `template-${template?.id || 'classic'}`;

  return (
    <>
      {/* Off-screen measurement — full ResumeRenderer = same DOM as visible */}
      <div ref={measureRef} className={tcls} style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none', width: 794, top: 0, left: 0, zIndex: -1 }}>
        <div style={{ padding: `${PAD_Y}px ${PAD_X}px` }}>
          <ResumeRenderer modules={modules} template={template} fontScale={fontScale} primaryColor={primaryColor} accentColor={accentColor} />
        </div>
      </div>

      {/* Visible A4 pages */}
      <div className="a4-pages-container">
        {pages.map((pageMods, i) => (
          <div key={i} className={`a4-page ${tcls}`}>
            <div className="a4-page-inner">
              <ResumeRenderer modules={pageMods} template={template} fontScale={fontScale} primaryColor={primaryColor} accentColor={accentColor} />
            </div>
            <span className="a4-page-number">{i + 1}</span>
          </div>
        ))}
      </div>
    </>
  );
}
