import type { ReactNode } from "react";
import StaffFeedback from "./StaffFeedback";

export default function StaffLayout({ children }: { children: ReactNode }) {
  return <StaffFeedback>{children}</StaffFeedback>;
}
