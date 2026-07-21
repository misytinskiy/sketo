import WhyHomeLogo from "./WhyHomeLogo";
import WhyFinalCtaButton from "./WhyFinalCtaButton";
import WhyScene from "./WhyScene";
import styles from "./why.module.css";

const whyPoints = [
  "Direct sourcing",
  "Roasting precision",
  "Seasonal lots",
  "Education",
  "Consistent quality",
  "Community",
];

export default function WhyPage() {
  return (
    <main className={styles.page}>
      <WhyHomeLogo />

      <div className={styles.contentShell}>
        <section className={styles.heroSection}>
          <div className={styles.stageWrap}>
            <WhyScene />

            <div className={styles.pointGrid} aria-hidden="true">
              {whyPoints.map((point, index) => (
                <span key={point} className={styles.point} data-index={index + 1}>
                  {point}
                </span>
              ))}
            </div>

            <div className={styles.stageTitleWrap}>
              <p className={styles.eyebrow}>Sketo coffee company</p>
              <h1 className={styles.title}>Why Sketo</h1>
              <p className={styles.lead}>
                We build coffee around clarity, character and a quiet confidence
                in every detail.
              </p>
            </div>

            <div className={styles.cupCard} aria-hidden="true">
              <span className={styles.cupCardSideLabel} data-side="left">
                origin first
              </span>
              <span className={styles.cupCardSideLabel} data-side="right">
                direct sourcing
              </span>
              <div className={styles.cupCardBottom}>
                <div className={styles.cupCardBarcode} />
                <div className={styles.cupCardStats}>
                  <span>Traceability</span>
                  <span>96%</span>
                  <span>Roast precision</span>
                  <span>91%</span>
                  <span>Seasonal clarity</span>
                  <span>88%</span>
                </div>
                <div className={styles.cupCardNote}>
                  <span className={styles.cupCardPill}>Sketo select</span>
                  <p>
                    Origin, process and roast profile aligned for a cleaner
                    reading in the cup.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.reasonScreen} data-screen="01">
              <div
                className={`${styles.reasonScreenBackground} ${styles.reasonScreenBackgroundPrimary}`}
                aria-hidden="true"
              />
              <div className={styles.reasonCard}>
                <div className={styles.reasonCardGrid} aria-hidden="true" />
                <p className={styles.reasonNumber}>#01</p>
                <p className={styles.reasonLabel}>Direct sourcing</p>
              </div>

              <div className={styles.reasonDetail}>
                <div className={styles.reasonDetailBody}>
                  <p className={styles.reasonDetailMark}>01</p>
                  <h2 className={styles.reasonHeadline}>
                    Sketo works with direct sourcing, clear origin and coffees
                    chosen for character over noise.
                  </h2>
                  <p className={styles.reasonParagraph}>
                    We select coffees where the producer, process and regional
                    identity remain readable in the cup. That gives us a cleaner
                    foundation for roasting, storytelling and long-term quality.
                  </p>
                  <p className={styles.reasonParagraph}>
                    This approach keeps the coffee honest: fewer distractions,
                    more clarity, and a profile that feels intentional from
                    first aroma to finish.
                  </p>
                </div>
                <div className={styles.reasonStamp}>
                  <span
                    className={`${styles.reasonStampIcon} ${styles.reasonStampIconSource}`}
                    aria-hidden="true"
                  />
                  <span>Source with care</span>
                </div>
              </div>
            </div>

            <div className={styles.reasonScreen} data-screen="02">
              <div
                className={`${styles.reasonScreenBackground} ${styles.reasonScreenBackgroundSecondary}`}
                aria-hidden="true"
              />
              <div className={styles.reasonCard}>
                <div className={styles.reasonCardGrid} aria-hidden="true" />
                <p className={styles.reasonNumber}>#02</p>
                <p className={styles.reasonLabel}>Roasting precision</p>
              </div>

              <div className={styles.reasonDetail}>
                <div className={styles.reasonDetailBody}>
                  <p className={styles.reasonDetailMark}>02</p>
                  <h2 className={styles.reasonHeadline}>
                    Every roast is tuned to keep the cup transparent, balanced
                    and exact from batch to batch.
                  </h2>
                  <p className={styles.reasonParagraph}>
                    We roast for structure instead of noise, shaping sweetness,
                    acidity and body so the coffee lands with a cleaner rhythm
                    and stronger repeatability.
                  </p>
                  <p className={styles.reasonParagraph}>
                    That control lets Sketo stay consistent without flattening
                    the coffee, preserving detail while making each lot easier
                    to understand and serve.
                  </p>
                </div>
                <div className={styles.reasonStamp}>
                  <span
                    className={`${styles.reasonStampIcon} ${styles.reasonStampIconRoast}`}
                    aria-hidden="true"
                  />
                  <span>Roast with intent</span>
                </div>
              </div>
            </div>

            <div className={styles.reasonScreen} data-screen="03">
              <div
                className={`${styles.reasonScreenBackground} ${styles.reasonScreenBackgroundTertiary}`}
                aria-hidden="true"
              />
              <div className={styles.reasonCard}>
                <div className={styles.reasonCardGrid} aria-hidden="true" />
                <p className={styles.reasonNumber}>#03</p>
                <p className={styles.reasonLabel}>Seasonal lots</p>
              </div>

              <div className={styles.reasonDetail}>
                <div className={styles.reasonDetailBody}>
                  <p className={styles.reasonDetailMark}>03</p>
                  <h2 className={styles.reasonHeadline}>
                    The menu stays seasonal, so every lot arrives with a clear
                    moment, a purpose and a shorter distance from harvest to
                    cup.
                  </h2>
                  <p className={styles.reasonParagraph}>
                    We build the offering around fresh arrivals and real crop
                    rhythm instead of forcing the same story all year. That
                    keeps the coffees alive, relevant and easier to rotate.
                  </p>
                  <p className={styles.reasonParagraph}>
                    Seasonal curation also gives Sketo sharper contrast across
                    the range: brighter filters, denser espresso profiles and a
                    catalogue that never feels static.
                  </p>
                </div>
                <div className={styles.reasonStamp}>
                  <span
                    className={`${styles.reasonStampIcon} ${styles.reasonStampIconSeason}`}
                    aria-hidden="true"
                  />
                  <span>Season in motion</span>
                </div>
              </div>
            </div>

            <div className={styles.reasonScreen} data-screen="04">
              <div
                className={`${styles.reasonScreenBackground} ${styles.reasonScreenBackgroundQuaternary}`}
                aria-hidden="true"
              />
              <div className={styles.reasonCard}>
                <div className={styles.reasonCardGrid} aria-hidden="true" />
                <p className={styles.reasonNumber}>#04</p>
                <p className={styles.reasonLabel}>Consistent quality</p>
              </div>

              <div className={styles.reasonDetail}>
                <div className={styles.reasonDetailBody}>
                  <p className={styles.reasonDetailMark}>04</p>
                  <h2 className={styles.reasonHeadline}>
                    Consistency is treated as part of the product, from roast
                    calibration to service standards and repeatable brew
                    results.
                  </h2>
                  <p className={styles.reasonParagraph}>
                    We work so the coffee reads clearly not once, but every
                    time: stable roast curves, cleaner workflows and a service
                    culture built around control rather than approximation.
                  </p>
                  <p className={styles.reasonParagraph}>
                    That discipline is what lets Sketo scale taste without
                    losing character, giving partners and guests the same level
                    of confidence in every cup.
                  </p>
                </div>
                <div className={styles.reasonStamp}>
                  <span
                    className={`${styles.reasonStampIcon} ${styles.reasonStampIconQuality}`}
                    aria-hidden="true"
                  />
                  <span>Repeat with confidence</span>
                </div>
              </div>
            </div>

            <div className={styles.finalCta}>
              <p className={styles.finalEyebrow}>Sketo coffee company</p>
              <h2 className={styles.finalTitle}>Ready for the next cup?</h2>
              <p className={styles.finalLead}>
                Explore the current lots and find the coffees shaping this season.
              </p>
              <WhyFinalCtaButton />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
