import { useRef } from 'react';
import type { Module, Template } from '../../types/resume';
import ResumeRenderer from '../Preview/ResumeRenderer';
import PageBreakLines from '../Preview/PageBreakLines';

interface Props {
  modules: Module[];
  template: Template | null;
  fontScale?: number;
  primaryColor?: string;
  accentColor?: string;
  showPageBreaks?: boolean;
}

export default function ResumePreview({ modules, template, fontScale, primaryColor, accentColor, showPageBreaks }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const visibleModules = modules
    .filter((m) => m.visible)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <main className="resume-preview-panel" id="resume-preview">
      <div
        className={`resume-preview template-${template?.id || 'classic'}`}
        ref={containerRef}
        style={{ position: 'relative' }}
      >
        <PageBreakLines visible={!!showPageBreaks} containerRef={containerRef} />
        <ResumeRenderer modules={visibleModules} template={template} fontScale={fontScale} primaryColor={primaryColor} accentColor={accentColor} />
      </div>
    </main>
  );
}
