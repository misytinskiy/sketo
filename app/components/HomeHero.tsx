"use client";
import LocalizedText from "@/app/components/LocalizedText";


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

      const getDesktopInset = () => {
        if (window.innerWidth >= 1900) {
          const rootFontSize = Number.parseFloat(
            window.getComputedStyle(document.documentElement).fontSize,
          );

          return Number.isFinite(rootFontSize) ? rootFontSize * 7.25 : 116;
        }

        return window.innerWidth < 900 ? 16 : 20;
      };

      const getDesktopTopInset = () => {
        if (window.innerWidth >= 1900) {
          const rootFontSize = Number.parseFloat(
            window.getComputedStyle(document.documentElement).fontSize,
          );

          return Number.isFinite(rootFontSize) ? rootFontSize * 3.1 : 50;
        }

        return getDesktopInset();
      };

      // Layout metrics exclude GSAP transforms, so refreshing mid-animation
      // never uses an already translated or scaled rectangle as its starting point.
      const getLogoScale = () =>
        gsap.utils.clamp(96, 142, document.documentElement.clientWidth * 0.082) /
        Math.max(1, logoWrap.offsetWidth);

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
        .fromTo(
          logoWrap,
          { x: 0, y: 0, scale: 1 },
          {
            x: () => getDesktopInset() - logoWrap.offsetLeft,
            y: () => getDesktopTopInset() - logoWrap.offsetTop,
            scale: getLogoScale,
            force3D: true,
            ease: "none",
          },
          0,
        )
        .fromTo(
          topBar,
          { x: 0, y: 0, xPercent: -50 },
          {
            x: () => document.documentElement.clientWidth - getDesktopInset() -
              topBar.offsetLeft - topBar.offsetWidth / 2,
            y: () => getDesktopTopInset() +
              logoWrap.offsetHeight * getLogoScale() / 2 -
              topBar.offsetHeight / 2 - topBar.offsetTop,
            xPercent: -50,
            force3D: true,
            ease: "none",
          },
          0,
        );

      // Refresh during resizing, including changes caused by loaded fonts.
      let frame = 0;
      let disposed = false;
      const refresh = () => {
        if (disposed || frame) return;
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          ScrollTrigger.refresh();
          // Do not let scrub smoothing keep stale coordinates outside the viewport.
          timeline.progress(timeline.scrollTrigger?.progress ?? 0);
        });
      };
      const observer = new ResizeObserver(refresh);
      observer.observe(logoWrap);
      observer.observe(topBar);
      window.addEventListener("resize", refresh);
      void document.fonts.ready.then(refresh);

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
      return () => {
        disposed = true;
        window.cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener("resize", refresh);
      };

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
        <p className={styles.heroTagline}><LocalizedText text="coffee and all about." /></p>
      ) : null}
    </section>
  );
}
