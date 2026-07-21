"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./SeasonalMenu.module.css";

gsap.registerPlugin(ScrollTrigger);

const drinks = [
  {
    name: "Cherry Bloom",
    image: "/photo/seasonMenu/cherryBloom.PNG",
    description:
      "Juicy cherry, ripe apple, and a light malty finish. A drink that feels like a walk through a summer garden.",
  },
  {
    name: "Banana Tonic",
    image: "/photo/seasonMenu/bananaTonic.PNG",
    description:
      "Soft banana milk punch, citrus bitterness, and refreshing tonic. Bright and unusual, with a hint of rhubarb.",
  },
  {
    name: "White Pine",
    image: "/photo/seasonMenu/whitePine.PNG",
    description:
      "Tropical pineapple, floral white tea notes, and a light botanical character. Refreshing and elegant for hot days.",
  },
  {
    name: "Golden Osmanthus",
    image: "/photo/seasonMenu/goldenOsmanthus.PNG",
    description:
      "Osmanthus, Earl Grey, and subtle citrus tones. Soft, floral, and layered for slow summer evenings.",
  },
];

export default function SeasonalMenu() {
  const [activeDrink, setActiveDrink] = useState<string>("");
  const sectionRef = useRef<HTMLElement | null>(null);
  const logoBlockRef = useRef<HTMLDivElement | null>(null);
  const overlayLogoRef = useRef<HTMLDivElement | null>(null);
  const drinkMediaRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const previousDrinkRef = useRef<string>("");
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
    if (!isDesktop || !sectionRef.current || !logoBlockRef.current || !overlayLogoRef.current) {
      return;
    }

    const section = sectionRef.current;
    const sourceLogo = logoBlockRef.current;
    const overlayLogo = overlayLogoRef.current;

    const syncOverlayPosition = () => {
      const rect = sourceLogo.getBoundingClientRect();

      gsap.set(overlayLogo, {
        top: rect.top,
        left: rect.left,
        width: rect.width,
      });
    };

    gsap.set(overlayLogo, { autoAlpha: 0 });

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom top",
      invalidateOnRefresh: true,
      onRefresh: syncOverlayPosition,
      onEnter: () => {
        syncOverlayPosition();
        gsap.set(sourceLogo, { autoAlpha: 0 });
        gsap.set(overlayLogo, { autoAlpha: 1 });
      },
      onEnterBack: () => {
        syncOverlayPosition();
        gsap.set(sourceLogo, { autoAlpha: 0 });
        gsap.set(overlayLogo, { autoAlpha: 1 });
      },
      onLeave: () => {
        gsap.set(sourceLogo, { autoAlpha: 1 });
        gsap.set(overlayLogo, { autoAlpha: 0 });
      },
      onLeaveBack: () => {
        gsap.set(sourceLogo, { autoAlpha: 1 });
        gsap.set(overlayLogo, { autoAlpha: 0 });
      },
    });

    return () => {
      trigger.kill();
      gsap.set(sourceLogo, { autoAlpha: 1 });
      gsap.set(overlayLogo, { autoAlpha: 0 });
    };
  }, [isDesktop]);

  useEffect(() => {
    const affectedDrink = activeDrink || previousDrinkRef.current;
    const affectedMedia = affectedDrink
      ? drinkMediaRefs.current[affectedDrink]
      : null;

    const refreshScroll = () => {
      ScrollTrigger.refresh();
    };

    const frameOne = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(refreshScroll);
    });
    const fallbackTimeout = window.setTimeout(refreshScroll, 380);

    const handleTransitionEnd = (event: TransitionEvent) => {
      if (
        event.target !== affectedMedia ||
        event.propertyName !== "grid-template-rows"
      ) {
        return;
      }

      refreshScroll();
    };

    affectedMedia?.addEventListener("transitionend", handleTransitionEnd);
    previousDrinkRef.current = activeDrink;

    return () => {
      window.cancelAnimationFrame(frameOne);
      window.clearTimeout(fallbackTimeout);
      affectedMedia?.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [activeDrink]);

  const portalTarget =
    typeof document !== "undefined"
      ? document.getElementById("fixed-layer")
      : null;

  const floatingLogo = (
    <div ref={overlayLogoRef} className={styles.floatingLogoBlock} aria-hidden="true">
      <p className={styles.logo}>sketo.</p>
      <p className={styles.logoCaption}>coffee and all about</p>
    </div>
  );

  return (
    <section
      id="seasonal-menu-section"
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="seasonal-menu-title"
    >
      {isDesktop && portalTarget ? createPortal(floatingLogo, portalTarget) : null}
      <div className={styles.poster}>
        <div className={styles.posterTop}>
          <div id="seasonal-menu-logo" ref={logoBlockRef} className={styles.logoBlock}>
            <p className={styles.logo}>sketo.</p>
            <p className={styles.logoCaption}>coffee and all about</p>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.mainColumn}>
            <div className={styles.topContent}>
              <div className={styles.headingBlock}>
                <p className={styles.eyebrow}>summer / 2026</p>
                <h2 id="seasonal-menu-title" className={styles.title}>
                  Seasonal
                  <br />
                  menu
                </h2>
              </div>
              <div className={styles.leadBlock}>
                <p className={styles.lead}>
                  At sketo.coffee we built a seasonal drinks menu where every
                  item carries a mood of its own, from juicy fruit freshness to
                  delicate floral and tea notes. Light, refreshing, and full of
                  character, these drinks were made for warm meetings, long
                  conversations, and slow evenings.
                </p>
              </div>
            </div>

            <div className={styles.menuGrid}>
              {drinks.map((drink, index) => {
                const isActive = activeDrink === drink.name;

                return (
                  <button
                    key={drink.name}
                    type="button"
                    className={`${styles.drinkCard} ${
                      isActive ? styles.drinkCardActive : ""
                    }`}
                    onClick={() =>
                      setActiveDrink((current) =>
                        current === drink.name ? "" : drink.name
                      )
                    }
                    aria-expanded={isActive}
                  >
                    <div className={styles.drinkHeader}>
                      <div className={styles.drinkMetaRow}>
                        <p className={styles.drinkIndex}>
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <span className={styles.drinkExpand} aria-hidden="true" />
                      </div>
                      <div className={styles.drinkCopy}>
                        <h3 className={styles.drinkName}>{drink.name}</h3>
                        <p className={styles.drinkDescription}>
                          {drink.description}
                        </p>
                      </div>
                    </div>

                    <div
                      ref={(node) => {
                        drinkMediaRefs.current[drink.name] = node;
                      }}
                      className={`${styles.drinkMedia} ${
                        isActive ? styles.drinkMediaActive : ""
                      }`}
                    >
                      <div className={styles.drinkMediaInner}>
                        <div className={styles.drinkImageWrap}>
                          <Image
                            src={drink.image}
                            alt={drink.name}
                            width={1080}
                            height={1920}
                            sizes="(max-width: 900px) 100vw, 50vw"
                            className={styles.drinkImage}
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <p className={styles.footerNote}>
              Come by, find your favorites, and spend the season with Sketo.
            </p>
          </div>

          <div className={styles.mediaColumn}>
            <div className={styles.videoWrap}>
              <video
                className={styles.video}
                src="/video/seasonalMenu.mp4"
                autoPlay
                muted
                loop
                playsInline
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
