import { useEffect, useRef, useState } from 'react';

interface Props {
  visible: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function PageBreakLines({ visible, containerRef }: Props) {
  const [breaks, setBreaks] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [pageHeightPx, setPageHeightPx] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const recalc = () => {
      const container = containerRef.current;
      if (!container) return;
      const doc = container.querySelector('.resume-document') as HTMLElement;
      if (!doc) return;
      const widthPx = doc.offsetWidth;
      const heightPx = doc.scrollHeight;
      const mmToPx = widthPx / 210;
      const ph = mmToPx * 297;
      setPageHeightPx(ph);
      const numPages = Math.ceil(heightPx / ph);
      setTotalPages(numPages);
      const positions: number[] = [];
      for (let i = 1; i < numPages; i++) {
        positions.push(i * ph);
      }
      setBreaks(positions);
    };

    recalc();
    const observer = new ResizeObserver(recalc);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef]);

  if (totalPages === 0) return null;

  return (
    <>
      {/* Page count badge */}
      <div style={{
        position: 'absolute',
        top: '4px',
        right: '8px',
        zIndex: 20,
        background: 'rgba(0,0,0,0.65)',
        color: '#fff',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '11px',
        pointerEvents: 'none',
      }}>
        共 {totalPages} 页
      </div>

      {/* Page break lines */}
      {visible && breaks.map((y, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${y}px`,
            left: 0,
            right: 0,
            borderTop: '2px dashed rgba(255, 80, 80, 0.5)',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <span style={{
            position: 'absolute',
            right: '4px',
            top: '-14px',
            fontSize: '11px',
            color: 'rgba(255, 80, 80, 0.6)',
            background: '#fff',
            padding: '0 4px',
          }}>
            第 {i + 1} 页结束
          </span>
        </div>
      ))}
    </>
  );
}
