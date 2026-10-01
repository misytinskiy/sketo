"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function AnimatedDetails({ title, children, className, open = false }: {
  title: ReactNode; children: ReactNode; className?: string; open?: boolean;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const animation = useRef<Animation | null>(null);
  const targetOpen = useRef(open);
  useEffect(() => () => { animation.current?.cancel(); }, []);

  function toggle() {
    const element = ref.current;
    const summary = element?.querySelector("summary");
    if (!element || !summary) return;
    const expanding = animation.current ? !targetOpen.current : !element.open;
    targetOpen.current = expanding;
    const start = element.getBoundingClientRect().height;
    animation.current?.cancel();
    animation.current = null;
    element.style.height = "";
    element.style.overflow = "";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.open = expanding;
      return;
    }
    element.open = false;
    const closedHeight = element.getBoundingClientRect().height;
    element.open = true;
    const end = expanding ? element.getBoundingClientRect().height : closedHeight;
    element.style.overflow = "hidden";
    const current = element.animate({ height: [`${start}px`, `${end}px`] }, {
      duration: 240, easing: "cubic-bezier(0.2, 0, 0, 1)",
    });
    animation.current = current;
    current.onfinish = () => {
      element.open = expanding;
      element.style.overflow = "";
      animation.current = null;
    };
  }

  return <details ref={ref} open={open} className={className}>
    <summary onClick={(event) => { event.preventDefault(); toggle(); }}>{title}</summary>
    {children}
  </details>;
}
