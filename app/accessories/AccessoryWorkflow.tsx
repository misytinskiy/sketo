"use client";

import { useId, useState } from "react";
import Link from "next/link";
import Image from "../components/CatalogImage";
import type { Language } from "../components/language";
import { accessoryContent, catalogPrice, label, type Stage } from "./model";
import type { Recommendations } from "./recommendations";
import local from "./accessories.module.css";

// Coordinates follow the original 1501 × 1047 illustration.
// Each group shares its contour between the image mask and pointer target.
const artContours: Record<Stage, string> = {
  prep: 'M455 505 Q448 490 470 475 L670 350 Q685 342 704 352 L916 444 Q927 450 925 470 L925 503 Q925 515 911 525 L712 668 Q690 682 668 673 L464 579 Q450 570 450 551 Z M150 520 C143 465 291 462 291 523 L253 644 Q250 652 270 656 Q305 666 305 700 L305 714 Q294 755 220 755 Q145 752 139 713 L139 688 Q140 660 184 649 Z M388 680 L500 730 L798 880 Q819 893 805 911 Q794 925 774 915 L473 784 L364 744 Z',
  brew: 'M290 240 L298 163 C300 112 461 111 468 163 L493 350 Q525 343 535 310 Q560 185 610 140 L640 144 Q590 185 567 310 Q557 365 495 384 L504 427 Q506 480 387 481 Q322 480 286 454 L238 462 Q191 465 192 419 L220 286 Q224 267 245 260 Z M806 194 C806 105 1108 105 1108 194 Q1098 228 1069 255 L1036 310 Q1070 330 1060 351 C1040 399 888 406 848 355 Q837 339 857 324 L826 248 Z M1132 742 Q1206 676 1300 698 Q1395 720 1426 782 L1428 825 L1309 925 L1126 809 Z',
  serve: 'M1120 363 C1113 301 1347 299 1356 359 L1356 389 L1410 405 Q1429 411 1433 443 L1453 539 Q1455 565 1426 577 L1380 596 Q1353 650 1233 649 Q1083 648 1084 588 Z M824 641 C824 569 1064 567 1065 641 L1067 808 Q1060 878 949 884 Q833 880 825 813 Z',
};

export default function AccessoryWorkflow({ recommendations, language }: { recommendations: Recommendations; language: Language }) {
  const artId = useId().replace(/:/g, '');
  const stages: { key: Stage; title: string }[] = [
    { key: "prep", title: label(language, "Подготовка", "Prep", "Дайындау") },
    { key: "brew", title: label(language, "Приготовление", "Brew", "Демдеу") },
    { key: "serve", title: label(language, "Подача", "Serve", "Ұсыну") },
  ];
  const [selected, setSelected] = useState<Stage>(() => stages.find(stage => recommendations[stage.key].length)?.key ?? "prep");
  if (!stages.some(stage => recommendations[stage.key].length)) return null;
  return <section className={local.workflow} aria-labelledby="workflow-title">
    <div className={`${local.artPlaceholder} ${local.workflowArt}`}>
      <svg className={local.interactiveArt} viewBox="0 0 1501 1047" role="group" aria-label={label(language, 'Выберите этап на иллюстрации', 'Choose a stage in the illustration', 'Суреттен кезеңді таңдаңыз')}>
        <defs>{stages.map(stage => <clipPath key={stage.key} id={`${artId}-${stage.key}`}><path d={artContours[stage.key]} /></clipPath>)}</defs>
        {stages.map(stage => <g key={stage.key} className={local.artGroup} data-active={selected === stage.key}
          role="button" tabIndex={0} aria-label={stage.title} aria-pressed={selected === stage.key} aria-controls={`workflow-${stage.key}`}
          onClick={() => setSelected(stage.key)} onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(stage.key); }
          }}>
          <title>{stage.title}</title>
          <image href="/photo/catalog/accArt.png" width="1501" height="1047" clipPath={`url(#${artId}-${stage.key})`} className={local.artLayer} />
          <path d={artContours[stage.key]} className={local.artTarget} />
        </g>)}
      </svg>
      <p className={local.artHint}>{label(language, 'Нажмите на предмет — выберите этап', 'Select an object to explore a stage', 'Кезеңді таңдау үшін затты басыңыз')}</p>
    </div>
    <div className={local.workflowContent}>
      <p className={local.eyebrow}>COFFEE, STEP BY STEP</p>
      <h2 id="workflow-title" className={local.workflowTitle}>{label(language, "Собери свой ритуал", "Build your workflow", "Өз рәсіміңді жаса")}</h2>
      <p className={local.workflowLead}>{label(language, "Что ещё может пригодиться: инструменты для подготовки, приготовления и подачи кофе.", "Useful additions for preparing, brewing and serving coffee.", "Кофені дайындауға, демдеуге және ұсынуға арналған қосымша құралдар.")}</p>
      <div className={local.workflowChoices} aria-label={label(language, "Этапы", "Stages", "Кезеңдер")}>
        {stages.map(stage => <button type="button" key={stage.key} aria-pressed={stage.key === selected} aria-controls={`workflow-${stage.key}`} onClick={() => setSelected(stage.key)}>{stage.title}</button>)}
      </div>
      <div id="workflow-results" className={local.workflowResults}>
        {stages.map(stage => <div key={stage.key} id={`workflow-${stage.key}`} className={local.workflowPanel}
          data-active={stage.key === selected} inert={stage.key !== selected} aria-hidden={stage.key !== selected}
          aria-live={stage.key === selected ? "polite" : "off"} aria-atomic="true">
        {recommendations[stage.key].map(recommendation => {
          const isCoffee = recommendation.kind === "coffee";
          const name = isCoffee ? recommendation.coffee.translations[language].name : accessoryContent(recommendation.item, language).name;
          const slug = isCoffee ? recommendation.coffee.slug : recommendation.item.slug;
          const image = isCoffee ? recommendation.coffee.image : recommendation.item.images[0]?.url;
          const price = isCoffee ? recommendation.coffee.price : catalogPrice(recommendation.item, language);
          return <Link key={`${recommendation.kind}:${slug}`} href={`/${isCoffee ? "catalog" : "accessories"}/${encodeURIComponent(slug)}`} className={local.workflowProduct}>
            <div className={local.workflowImage}><Image src={image || "/image-unavailable.svg"} alt="" fill sizes="96px" unoptimized /></div>
            <div><h3>{name}</h3><p>{label(language, ...recommendation.reason)}</p><span className={local.workflowPrice}>{price}</span></div>
            <span className={local.workflowArrow} aria-hidden="true">↗</span>
          </Link>;
        })}
        {!recommendations[stage.key].length && <p className={local.workflowEmpty}>{label(language, "Пока нет подходящих дополнений для этого этапа. Посмотрите соседние этапы.", "No suitable additions for this stage yet. Explore the other stages.", "Бұл кезеңге лайықты қосымша тауарлар әзірге жоқ. Басқа кезеңдерді қараңыз.")}</p>}
        </div>)}
      </div>
    </div>
  </section>;
}
