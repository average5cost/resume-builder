import type { Module, Template } from '../../types/resume';
import PaginatedPreview from '../Preview/PaginatedPreview';

interface Props {
  modules: Module[];
  template: Template | null;
  fontScale?: number;
  primaryColor?: string;
  accentColor?: string;
  showPageBreaks?: boolean;
}

export default function ResumePreview({ modules, template, fontScale, primaryColor, accentColor }: Props) {
  const visibleModules = modules
    .filter((m) => m.visible)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <main className="resume-preview-panel" id="resume-preview">
      <PaginatedPreview
        modules={visibleModules}
        template={template}
        fontScale={fontScale}
        primaryColor={primaryColor}
        accentColor={accentColor}
      />
    </main>
  );
}
