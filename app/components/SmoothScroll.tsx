"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export default function SmoothScroll({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const existingSmoother = ScrollSmoother.get();
    existingSmoother?.kill();

    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 0.9,
      smoothTouch: 0.1,
      effects: false,
      normalizeScroll: true,
    });

    return () => {
      smoother.kill();
    };
  }, []);

  useEffect(() => {
    const smoother = ScrollSmoother.get();

    if (!smoother) {
      return;
    }

    smoother.scrollTo(0, false);
    ScrollTrigger.refresh();
  }, [pathname]);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  );
}
