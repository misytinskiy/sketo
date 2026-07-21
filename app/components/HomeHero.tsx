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
import styles from "../page.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function HomeHero() {
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
      const aboutSection = document.getElementById("about-sketo-section");

      if (!hero || !logoWrap || !topBar) {
        return;
      }

      gsap.set(topBar, { xPercent: -50 });

      const logoTweenValues = () => {
        const rect = logoWrap.getBoundingClientRect();
        const inset = window.innerWidth < 900 ? 16 : 24;
        const targetWidth = gsap.utils.clamp(96, 142, window.innerWidth * 0.082);

        return {
          x: inset - rect.left,
          y: inset - rect.top,
          scale: targetWidth / rect.width,
          force3D: true,
        };
      };

      const topBarTweenValues = () => {
        const rect = topBar.getBoundingClientRect();
        const inset = window.innerWidth < 900 ? 32 : 52;

        return {
          x: window.innerWidth - inset - rect.right,
          y: inset - rect.top,
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

      if (aboutSection) {
        let baseTopBarY = 0;
        let baseLogoX = 0;
        let baseLogoY = 0;
        let baseLogoScale = 1;
        let releaseLogoTop = 0;
        let releaseLogoLeft = 0;
        let logoReleased = false;

        const captureBasePositions = () => {
          baseLogoX = Number(gsap.getProperty(logoWrap, "x")) || 0;
          baseLogoY = Number(gsap.getProperty(logoWrap, "y")) || 0;
          baseLogoScale = Number(gsap.getProperty(logoWrap, "scale")) || 1;
          baseTopBarY = Number(gsap.getProperty(topBar, "y")) || 0;
        };

        const releaseLogoToViewport = () => {
          if (logoReleased) {
            return;
          }

          const rect = logoWrap.getBoundingClientRect();
          releaseLogoTop = rect.top;
          releaseLogoLeft = rect.left;
          logoReleased = true;

          gsap.set(logoWrap, {
            position: "fixed",
            top: releaseLogoTop,
            left: releaseLogoLeft,
            right: "auto",
            bottom: "auto",
            x: 0,
            y: 0,
            scale: baseLogoScale,
          });
        };

        const restoreLogoToFloating = () => {
          logoReleased = false;
          gsap.set(logoWrap, {
            position: "fixed",
            top: "auto",
            left: "auto",
            right: "-2vw",
            bottom: "-1.2vw",
            x: baseLogoX,
            y: baseLogoY,
            scale: baseLogoScale,
          });
        };

        const aboutPaddingBottom = () =>
          parseFloat(window.getComputedStyle(aboutSection).paddingBottom) || 0;

        const releaseStart = () => {
          const paddingBottom = aboutPaddingBottom();

          return `bottom bottom-=${paddingBottom}`;
        };

        captureBasePositions();

        ScrollTrigger.create({
          trigger: aboutSection,
          start: releaseStart,
          end: "max",
          invalidateOnRefresh: true,
          onRefresh: () => {
            captureBasePositions();
            if (!logoReleased) {
              restoreLogoToFloating();
            }
          },
          onUpdate: (self) => {
            const delta = Math.max(0, self.scroll() - self.start);

            if (delta > 0 && !logoReleased) {
              captureBasePositions();
              releaseLogoToViewport();
            }

            if (logoReleased) {
              gsap.set(logoWrap, {
                top: releaseLogoTop - delta,
                left: releaseLogoLeft,
                autoAlpha: 1,
              });
            }

            gsap.set(topBar, {
              y: baseTopBarY - delta,
              autoAlpha: 1,
            });
          },
          onLeaveBack: () => {
            restoreLogoToFloating();
            gsap.set(topBar, {
              y: baseTopBarY,
              autoAlpha: 1,
            });
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
        <LanguageSwitch />
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
            <LanguageSwitch />
          </header>

          <div className={styles.logoWrap}>
            <span className={styles.logo}>sketo.</span>
          </div>
        </>
      ) : null}

      {isDesktop && portalTarget ? createPortal(overlay, portalTarget) : null}

      <div className={styles.header}>
        <HeroNavigation />
      </div>
    </section>
  );
}
