"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import Footer from "../components/Footer";
import LanguageSwitch from "../components/LanguageSwitch";
import usePersistentLanguage from "../components/usePersistentLanguage";
import type { Language } from "../components/language";
import { documents, documentCopy } from "./documents";
import styles from "./documents.module.css";

const orderedDocuments = ["delivery", "returns", "seller", "offer", "privacy"].map(
  (slug) => documents.find((item) => item.slug === slug)!,
);
// Keep the last selection across document route remounts.
let previousDocumentSlug: string | undefined;
const copy = {
  ru: { title: "Покупателям", lines: ["Покупа-", "телям"], intro: "Условия покупок и документы Sketo.", contact: "Есть вопросы? Напишите нам", back: "назад" },
  kz: { title: "Сатып алушыларға", lines: ["Сатып", "алушыларға"], intro: "Sketo сатып алу шарттары мен құжаттары.", contact: "Сұрақтарыңыз бар ма? Бізге жазыңыз", back: "артқа" },
  en: { title: "Customer care", lines: ["Customer", "care"], intro: "Shopping information and documents from Sketo.", contact: "Any questions? Get in touch", back: "back" },
};
const placeholderDocumentCopy = {
  intro: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  contact: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
};

function Arrow({ className }: { className?: string }) {
  return <svg className={className} width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true"><path d="M1 7h17M13 1.5 18.5 7 13 12.5" stroke="currentColor" strokeWidth="1.25" /></svg>;
}

export default function DocumentPageClient({ slug, initialLanguage }: { slug?: string; initialLanguage: Language }) {
  const [language, setLanguage] = usePersistentLanguage(initialLanguage);
  const document = orderedDocuments.find((item) => item.slug === slug);
  const text = copy[language];
  const navRef = useRef<HTMLElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  const markerTransition = useRef({ from: previousDocumentSlug, to: slug });

  useLayoutEffect(() => {
    if (!slug) {
      previousDocumentSlug = undefined;
      return;
    }
    const nav = navRef.current;
    const marker = markerRef.current;
    if (!nav || !marker) return;
    const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>("a[data-document]"));
    const active = links.find((link) => link.dataset.document === slug);
    if (markerTransition.current.to !== slug) {
      markerTransition.current = { from: previousDocumentSlug, to: slug };
    }
    const previous = links.find((link) => link.dataset.document === markerTransition.current.from);
    previousDocumentSlug = slug;
    if (!active) return;

    const position = (link: HTMLAnchorElement) => {
      const horizontal = window.matchMedia("(max-width: 720px)").matches;
      return horizontal
        ? { transform: `translate(${link.offsetLeft}px, ${link.offsetTop + link.offsetHeight - 2}px)`, width: `${link.offsetWidth}px`, height: "2px" }
        : { transform: `translate(0px, ${link.offsetTop + 14}px)`, width: "2px", height: `${link.offsetHeight - 28}px` };
    };
    const update = () => Object.assign(marker.style, position(active));
    update();
    let animation: Animation | undefined;
    if (previous && previous !== active && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      animation = marker.animate([position(previous), position(active)], {
        duration: 320,
        easing: "cubic-bezier(.22, 1, .36, 1)",
      });
    }
    const observer = new ResizeObserver(update);
    observer.observe(nav);
    links.forEach((link) => observer.observe(link));
    return () => {
      animation?.cancel();
      observer.disconnect();
    };
  }, [slug, language]);

  return (
    <div className={styles.shell}>
      <main className={styles.page}>
        <header className={styles.topline}>
          <Link
            href={document ? "/info" : "/"}
            className={styles.backLink}
            aria-label={document ? documentCopy.label[language] : documentCopy.home[language]}
          >
            {text.back}
          </Link>
          <LanguageSwitch value={language} onChange={setLanguage} />
        </header>

        {!document ? (
          <div className={styles.hub}>
            <div className={styles.hubCopy}>
              <div>
                <h1 className={`${styles.hubTitle} ${styles[language]}`} aria-label={text.title}>
                  {text.lines.map((line) => <span key={line} aria-hidden="true">{line}</span>)}
                </h1>
                <p className={styles.intro}>{text.intro}</p>
              </div>
              <a href="https://wa.me/77473835398" target="_blank" rel="noreferrer" className={styles.writeLink}>
                {text.contact}<span aria-hidden="true">↗</span>
              </a>
            </div>
            <nav className={styles.index} aria-label={documentCopy.label[language]}>
              {orderedDocuments.map((item, i) => (
                <Link href={`/info/${item.slug}`} key={item.slug} className={styles.indexLink}>
                  <span className={styles.indexNumber} aria-hidden="true">0{i + 1}</span>
                  <span className={styles.indexTitle}>{item.title[language]}</span>
                  <Arrow className={styles.arrow} />
                </Link>
              ))}
            </nav>
          </div>
        ) : (
          <>
            <header key={`hero-${document.slug}`} className={styles.documentHero}>
              <h1>{document.title[language]}</h1>
              <p className={styles.documentIntro}>{placeholderDocumentCopy.intro}</p>
            </header>
            <div className={styles.layout}>
              <nav ref={navRef} className={styles.nav} aria-label={documentCopy.label[language]}>
                <span ref={markerRef} className={styles.navMarker} aria-hidden="true" />
                {orderedDocuments.map((item, i) => (
                  <Link href={`/info/${item.slug}`} key={item.slug} data-document={item.slug} aria-current={item.slug === slug ? "page" : undefined} className={styles.navLink}>
                    <span className={styles.navIndex}>0{i + 1}</span><span>{item.title[language]}</span>
                  </Link>
                ))}
              </nav>
              <article key={document.slug} className={styles.article}>
                {document.sections.map((section, i) => (
                  <section key={i} className={styles.section}>
                    <span className={styles.sectionIndex} aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h2>{section.title[language]}</h2>
                      <p>{placeholderDocumentCopy.body}</p>
                    </div>
                  </section>
                ))}
                <section className={styles.contact}>
                  <h2>{documentCopy.contact[language]}</h2>
                  <p>{placeholderDocumentCopy.contact}</p>
                  <div className={styles.contactLinks}>
                    <a href="https://wa.me/77473835398" target="_blank" rel="noreferrer">{documentCopy.whatsapp[language]}</a>
                    <a href="tel:+77473835398">+7 747 383 53 98</a>
                  </div>
                </section>
              </article>
            </div>
          </>
        )}
      </main>
      <div className={styles.footer}><Footer language={language} /></div>
    </div>
  );
}
