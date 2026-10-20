import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import styles from "./product-detail-skeleton.module.css";

export default function ProductDetailSkeleton() {
  return <main className={styles.page} aria-busy="true" aria-label="Загрузка товара">
    <SkeletonTheme baseColor="#dedbd4" highlightColor="#f7f5f0" duration={1.8} borderRadius={2}>
      <div className={styles.contentShell}>
        <div className={styles.topBar}>
          <span className={styles.logo}>sketo.</span>
          <div className={styles.language} aria-hidden="true"><Skeleton width={18} height={7} /><Skeleton width={18} height={7} /><Skeleton width={18} height={7} /></div>
        </div>
        <section className={styles.layout} aria-hidden="true">
          <div className={styles.back}><Skeleton width={130} height={8} /></div>
          <div className={styles.meta}><Skeleton width={62} height={8} /><Skeleton width={82} height={8} /></div>
          <div className={styles.media}><Skeleton containerClassName={styles.fill} height="100%" borderRadius={0} /></div>
          <div className={styles.info}>
            <div className={styles.title}><Skeleton width="82%" height={46} borderRadius={0} /></div>
            <div className={styles.card}><Skeleton width={68} height={8} /><Skeleton count={3} height={8} /></div>
            <div className={styles.card}><Skeleton width={94} height={8} /><div className={styles.options}><Skeleton width={44} height={30} borderRadius={0} /><Skeleton width={44} height={30} borderRadius={0} /><Skeleton width={44} height={30} borderRadius={0} /></div></div>
            <div className={styles.card}><Skeleton width={116} height={8} /><div className={styles.priceLine}><Skeleton width={90} height={11} /><Skeleton width={70} height={8} /></div><Skeleton height={48} borderRadius={999} /></div>
          </div>
        </section>
      </div>
    </SkeletonTheme>
  </main>;
}
