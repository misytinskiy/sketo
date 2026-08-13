"use client";

import {
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroNavigation from "./HeroNavigation";
import LanguageSwitch from "./LanguageSwitch";
import { getContentLanguage, type Language } from "./language";
import styles from "../page.module.css";

gsap.registerPlugin(ScrollTrigger);

type HomeHeroProps = {
  language: Language;
  onLanguageChange: (language: Language) => void;
};

export default function HomeHero({
  language,
  onLanguageChange,
}: HomeHeroProps) {
  const contentLanguage = getContentLanguage(language);
  const heroRef = useRef<HTMLElement | null>(null);
  const logoWrapRef = useRef<HTMLDivElement | null>(null);
  const topBarRef = useRef<HTMLElement | null>(null);
  const isDesktop = useSyncExternalStore(
    (onStoreChange) => {
      const media = window.matchMedia("(min-width: 641px)");
      const listener = () => onStoreChange();

      media.addEventListener("change", listener);

      return () => {
        media.removeEventListener("change", listener);
      };
    },
    () => window.matchMedia("(min-width: 641px)").matches,
    () => false,
  );

  useLayoutEffect(() => {
    if (!isDesktop || !heroRef.current || !logoWrapRef.current || !topBarRef.current) {
      return;
    }

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const hero = heroRef.current;
      const logoWrap = logoWrapRef.current;
      const topBar = topBarRef.current;
      const quoteSection = document.getElementById("quote-section");
      if (!hero || !logoWrap || !topBar) {
        return;
      }

      gsap.set(topBar, { xPercent: -50 });

      const getLogoTargetMetrics = () => {
        const rect = logoWrap.getBoundingClientRect();
        const inset = window.innerWidth < 900 ? 16 : 20;
        const targetWidth = gsap.utils.clamp(96, 142, window.innerWidth * 0.082);
        const scale = targetWidth / rect.width;

        return {
          rect,
          inset,
          scale,
          targetHeight: rect.height * scale,
        };
      };

      const logoTweenValues = () => {
        const { rect, inset, scale } = getLogoTargetMetrics();

        return {
          x: inset - rect.left,
          y: inset - rect.top,
          scale,
          force3D: true,
        };
      };

      const topBarTweenValues = () => {
        const rect = topBar.getBoundingClientRect();
        const rightInset = 20;
        const { inset, targetHeight } = getLogoTargetMetrics();
        const targetTop = inset + targetHeight / 2 - rect.height / 2;

        return {
          x: window.innerWidth - rightInset - rect.right - rect.width / 2,
          y: targetTop - rect.top,
          xPercent: 0,
          force3D: true,
        };
      };

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "+=50%",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .to(
          logoWrap,
          {
            ...logoTweenValues(),
            ease: "none",
          },
          0,
        )
        .to(
          topBar,
          {
            ...topBarTweenValues(),
            ease: "none",
          },
          0,
        );

      if (quoteSection) {
        ScrollTrigger.create({
          trigger: quoteSection,
          start: "top top+=72",
          end: "bottom top+=72",
          toggleClass: {
            targets: topBar,
            className: styles.floatingTopBarLight,
          },
        });
      }
    });

    return () => {
      mm.revert();
    };
  }, [isDesktop]);

  const overlay = (
    <>
      <header ref={topBarRef} className={styles.floatingTopBar}>
        <LanguageSwitch value={language} onChange={onLanguageChange} />
      </header>

      <div ref={logoWrapRef} className={styles.floatingLogoWrap}>
        <span className={styles.logo}>sketo.</span>
      </div>
    </>
  );

  const portalTarget =
    typeof document !== "undefined"
      ? document.getElementById("fixed-layer")
      : null;

  return (
    <section ref={heroRef} className={styles.hero}>
      {!isDesktop ? (
        <>
          <header className={styles.topBar}>
            <LanguageSwitch value={language} onChange={onLanguageChange} />
          </header>

          <div className={styles.logoWrap}>
            <span className={styles.logo}>sketo.</span>
          </div>
        </>
      ) : null}

      {isDesktop && portalTarget ? createPortal(overlay, portalTarget) : null}

      <div className={styles.header}>
        <HeroNavigation language={contentLanguage} />
      </div>

      {!isDesktop ? (
        <p className={styles.heroTagline}>coffee and all about.</p>
      ) : null}
    </section>
  );
}
