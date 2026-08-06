"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const revealStates: Record<string, gsap.TweenVars> = {
  eyebrow: {
    yPercent: 115,
    rotate: 0.001,
    skewY: 7,
    filter: "blur(6px)",
  },
  headline: {
    yPercent: 125,
    rotate: -1.8,
    skewY: 8,
    filter: "blur(10px)",
  },
  line: {
    yPercent: 108,
    xPercent: -6,
    skewY: 5,
    filter: "blur(4px)",
  },
  copy: {
    yPercent: 115,
    xPercent: -4,
    skewY: 4,
    filter: "blur(5px)",
  },
};

function prepareTextReveal(item: HTMLElement) {
  if (item.querySelector(":scope > [data-reveal-inner]")) {
    return item.querySelector(":scope > [data-reveal-inner]") as HTMLElement;
  }

  const inner = document.createElement("span");
  inner.setAttribute("data-reveal-inner", "true");
  inner.style.display = "block";
  inner.style.willChange = "transform, filter, opacity";

  while (item.firstChild) {
    inner.appendChild(item.firstChild);
  }

  item.appendChild(inner);

  const computedDisplay = window.getComputedStyle(item).display;
  if (computedDisplay === "inline") {
    item.style.display = "inline-block";
  }

  item.style.overflow = "hidden";
  item.style.verticalAlign = "top";

  return inner;
}

export default function AcademyReveal() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      const groups = gsap.utils.toArray<HTMLElement>("[data-reveal-group]");

      groups.forEach((group) => {
        const items = gsap.utils.toArray<HTMLElement>("[data-reveal]", group);

        items.forEach((item) => {
          const kind = item.dataset.reveal || "copy";
          const fromState = revealStates[kind] || revealStates.copy;
          const inner = prepareTextReveal(item);

          gsap.set(item, { autoAlpha: 1 });
          gsap.set(inner, {
            ...fromState,
            autoAlpha: 0,
            transformOrigin: "0% 100%",
          });
        });

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: group,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });

        items.forEach((item, index) => {
          const kind = item.dataset.reveal || "copy";
          const inner = item.querySelector(":scope > [data-reveal-inner]") as HTMLElement | null;
          if (!inner) return;

          timeline.to(
            inner,
            {
              autoAlpha: 1,
              xPercent: 0,
              yPercent: 0,
              rotate: 0,
              skewY: 0,
              filter: "blur(0px)",
              ease: kind === "headline" ? "power4.out" : "power3.out",
              duration: kind === "headline" ? 0.4 : 0.3,
              overwrite: "auto",
            },
            index === 0 ? 0 : "<+=0.08",
          );
        });
      });
    });

    return () => {
      ctx.revert();
    };
  }, []);

  return null;
}
