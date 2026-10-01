import type { ReactNode } from "react";
import StaffFeedback from "./StaffFeedback";
import { requireStaff } from "@/lib/staff-auth";
import styles from "./access.module.css";
import StaffNavigation from "./StaffNavigation";

export const metadata = { robots: { index: false, follow: false } };

export default async function StaffLayout({ children }: { children: ReactNode }) {
  const member = await requireStaff();
  return <StaffFeedback>
    <div className={styles.staffFrame}>
      <StaffNavigation name={member.displayName || ""} email={member.email} role={member.role} />
      <div className={styles.staffContent}>{children}</div>
    </div>
  </StaffFeedback>;
}
