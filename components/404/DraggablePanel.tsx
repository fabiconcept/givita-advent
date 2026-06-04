'use client';

import { useRef, type ReactNode } from 'react';
import { GripHorizontal } from 'lucide-react';

export function DraggablePanel({ children }: { children: ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null);

  function handleMouseDown(e: React.MouseEvent) {
    const panel = panelRef.current;
    if (!panel) return;

    const rect = panel.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const origLeft = rect.left;
    const origTop = rect.top;

    function onMove(ev: MouseEvent) {
      let left = origLeft + (ev.clientX - startX);
      let top = origTop + (ev.clientY - startY);
      const w = panel.offsetWidth;
      const h = panel.offsetHeight;
      left = Math.max(0, Math.min(window.innerWidth - w, left));
      top = Math.max(0, Math.min(window.innerHeight - h, top));
      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    }

    function onUp() {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  return (
    <div
      ref={panelRef}
      className="fixed bottom-4 right-4 z-20"
    >
      <div className="overflow-hidden rounded-xl border border-border/40 bg-white/20 backdrop-blur-md dark:bg-black/20 shadow-lg">
        <div
          onMouseDown={handleMouseDown}
          className="flex cursor-grab active:cursor-grabbing items-center justify-center gap-1.5 border-b border-border/20 px-3 py-1.5"
        >
          <GripHorizontal className="h-3 w-3 text-muted-foreground/50" />
          <span className="text-[10px] font-medium tracking-wider text-muted-foreground/40 uppercase">Drag</span>
        </div>
        {children}
      </div>
    </div>
  );
}
