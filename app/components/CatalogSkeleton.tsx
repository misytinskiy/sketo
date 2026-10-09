import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import styles from "./catalog-skeleton.module.css";

type CatalogSkeletonProps = {
  filterCounts: number[];
};

export default function CatalogSkeleton({ filterCounts }: CatalogSkeletonProps) {
  const isEquipment = filterCounts.length > 1;

  return (
    <main className={`${styles.page} ${isEquipment ? styles.equipment : ""}`} aria-busy="true" aria-label="Загрузка каталога">
      <SkeletonTheme baseColor="#dedbd4" highlightColor="#f7f5f0" duration={1.8} borderRadius={2}>
        <div className={styles.contentShell}>
          <div className={styles.topBar}>
            <span className={styles.logo}>sketo.</span>
            <div className={styles.language} aria-hidden="true">
              <Skeleton width={18} height={7} />
              <Skeleton width={18} height={7} />
              <Skeleton width={18} height={7} />
            </div>
          </div>

          <div
            className={`${styles.controls} ${isEquipment ? styles.equipmentControls : ""}`}
            aria-hidden="true"
          >
            <div className={styles.controlBlock}>
              <Skeleton width={52} height={7} />
              <div className={styles.search}>
                <Skeleton width="38%" height={8} />
              </div>
            </div>
            {filterCounts.map((filterCount, filterIndex) => (
              <div className={styles.controlBlock} key={filterIndex}>
                <Skeleton width={44 + filterIndex * 12} height={7} />
                <div className={styles.chips}>
                  {Array.from({ length: filterCount }, (_, index) => (
                    <Skeleton
                      key={index}
                      width={index === 0 ? 58 : index % 2 === 0 ? 92 : 76}
                      height={30}
                      borderRadius={0}
                    />
                  ))}
                </div>
              </div>
            ))}
            <Skeleton width={66} height={8} />
          </div>

          <section className={styles.grid} aria-hidden="true">
            {Array.from({ length: 8 }, (_, index) => (
              <article className={styles.card} key={index}>
                <div className={styles.image}>
                  <Skeleton containerClassName={styles.imageSkeleton} height="100%" borderRadius={0} />
                </div>
                <div className={styles.meta}>
                  {Array.from({ length: 4 }, (__, metaIndex) => (
                    <div className={styles.metaBlock} key={metaIndex}>
                      <Skeleton width={metaIndex === 2 ? "42%" : "55%"} height={6} />
                      <Skeleton width={metaIndex === 3 ? "70%" : "88%"} height={9} />
                      {metaIndex === 0 ? <Skeleton width="52%" height={9} /> : null}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>
        </div>
      </SkeletonTheme>
    </main>
  );
}
