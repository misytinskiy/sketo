import { asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/staff-auth";
import { db } from "@/lib/db";
import { staffMembers } from "@/lib/db/schema";
import { CreateUserForm, DeleteUserForm } from "./UserForms";
import styles from "../access.module.css";

export const metadata = { title: "Пользователи — Sketo" };

export default async function UsersPage() {
  const actor = await requireStaff();
  if (actor.role !== "admin") redirect("/staff");
  const members = await db.select({ id: staffMembers.id, email: staffMembers.email,
    displayName: staffMembers.displayName, role: staffMembers.role, isActive: staffMembers.isActive,
  }).from(staffMembers).orderBy(asc(staffMembers.createdAt));
  return <main className={styles.usersPage}><div className={styles.usersWorkspace}>
    <header className={styles.usersHero}>
      <p className={styles.usersEyebrow}>team access / staff workspace</p>
      <div className={styles.usersTitleRow}>
        <h1>Пользователи</h1>
        <span>{String(members.length).padStart(2, "0")} аккаунтов</span>
      </div>
      <p className={styles.usersLead}>Персонал управляет каталогом. Администраторы также управляют доступом команды.</p>
    </header>

    <div className={styles.memberColumns}>
      <section className={styles.createMemberSection}>
        <div className={styles.memberSectionHeader}><span>01</span><h2>Новый доступ</h2></div>
        <CreateUserForm />
      </section>
      <section className={styles.memberDirectory} aria-label="Список пользователей">
        <div className={styles.memberSectionHeader}><span>02</span><h2>Команда</h2></div>
        <ol className={styles.memberList}>
          {members.map((member, index) => <li key={member.id} className={styles.memberRow}>
            <span className={styles.memberIndex}>{String(index + 1).padStart(2, "0")}</span>
            <div className={styles.memberIdentity}>
              <strong>{member.displayName || member.email}{member.id === actor.id ? " · Вы" : ""}</strong>
              <span>{member.email}</span>
            </div>
            <div className={styles.memberAccess}>
              <span>{member.role === "admin" ? "Администратор" : member.role === "editor" ? "Персонал" : "Без доступа"}</span>
              <small>{member.isActive ? "Активен" : "Доступ отозван"}</small>
            </div>
            <div className={styles.memberAction}>
              {member.id !== actor.id && <DeleteUserForm id={member.id} email={member.email} inactive={!member.isActive} />}
            </div>
          </li>)}
        </ol>
      </section>
    </div>
  </div></main>;
}
