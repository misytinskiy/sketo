"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "../login/actions";
import styles from "./access.module.css";

type StaffNavigationProps = {
  name: string;
  email: string;
  role: "admin" | "staff";
};

export default function StaffNavigation({ name, email, role }: StaffNavigationProps) {
  const pathname = usePathname();
  const links = [
    { href: "/staff", label: "Каталог", active: pathname === "/staff" || pathname.startsWith("/staff/edit/") },
    ...(role === "admin"
      ? [{ href: "/staff/users", label: "Пользователи", active: pathname.startsWith("/staff/users") }]
      : []),
    { href: "/staff/security", label: "Пароль", active: pathname === "/staff/security" },
  ];

  return <header className={styles.staffHeader}>
    <Link href="/staff" className={styles.staffBrand} aria-label="Кабинет Sketo">
      <span>sketo.</span><small>staff</small>
    </Link>
    <nav aria-label="Кабинет сотрудника" className={styles.staffNav}>
      {links.map((link, index) => <Link key={link.href} href={link.href}
        className={`${styles.staffNavLink} ${link.active ? styles.staffNavLinkActive : ""}`}
        aria-current={link.active ? "page" : undefined}>
        <span>{String(index + 1).padStart(2, "0")}</span>{link.label}
      </Link>)}
    </nav>
    <div className={styles.staffAccount}>
      <div className={styles.staffIdentity}>
        <span>{name || email}</span>
        <small>{role === "admin" ? "Администратор" : "Персонал"}</small>
      </div>
      <form action={logout}>
        <button className={styles.staffLogout}><span>Выйти</span><span aria-hidden="true">↗</span></button>
      </form>
    </div>
  </header>;
}
