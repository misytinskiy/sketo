"use client";

import { useEffect, useRef } from "react";
import type { Language } from "./LanguageSwitch";
import MatchaCtaButton from "./MatchaCtaButton";
import styles from "./MatchaFeature.module.css";

type MatchaFeatureProps = {
  language: Exclude<Language, "kz">;
};

export default function MatchaFeature({ language }: MatchaFeatureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const tryPlay = () => {
      video.defaultMuted = true;
      video.muted = true;

      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    };

    tryPlay();

    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    document.addEventListener("visibilitychange", tryPlay);

    return () => {
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
      document.removeEventListener("visibilitychange", tryPlay);
    };
  }, []);

  return (
    <section className={styles.section} aria-labelledby="matcha-feature-title">
      <video
        ref={videoRef}
        className={styles.video}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/photo/matchaMain.jpg"
        disablePictureInPicture
      >
        <source src="/photo/matchaMain.mp4" type="video/mp4" />
        <source src="/photo/matchaMain.webm" type="video/webm" />
        {language === "en"
          ? "Your browser does not support background video."
          : "Ваш браузер не поддерживает фоновое видео."}
      </video>

      <div className={styles.overlay} />

      <div className={styles.content}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>matcha ritual / slow green</p>
          <h2 id="matcha-feature-title" className={styles.title}>
            {language === "en" ? (
              <>
                Focus
                <br />
                and a beautiful pause
              </>
            ) : (
              <>
                Фокус
                <br />
                и красивая пауза
              </>
            )}
          </h2>
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.body}>
            <div className={styles.column}>
              <p className={styles.text}>
                {language === "en"
                  ? "Matcha at Sketo begins not with a drink, but with a state of mind. It is a brief pause inside the day, where gesture, tempo, and attention to process matter."
                  : "Матча в Sketo начинается не с напитка, а с состояния. Это короткая пауза внутри дня, где важны жест, темп и внимание к процессу."}
              </p>
            </div>

            <div className={styles.column}>
              <p className={styles.text}>
                {language === "en"
                  ? "Whisking, dense texture, soft bitterness, and a clean finish come together in a calm ritual you want to return to again and again."
                  : "Взбивание, плотная текстура, мягкая горечь и чистое послевкусие складываются в спокойный ритуал, к которому хочется возвращаться снова."}
              </p>
            </div>

            <div className={styles.column}>
              <p className={styles.text}>
                {language === "en"
                  ? "Ceremonial-grade matcha at Sketo is about clarity of taste, velvety texture, and a slower rhythm of serving."
                  : "Церемониальная матча в Sketo — это про чистоту вкуса, плотную текстуру и медленный ритм подачи."}
              </p>
            </div>
          </div>

          <div className={styles.ctaWrap}>
            <MatchaCtaButton language={language} />
          </div>
        </div>
      </div>
    </section>
  );
}
