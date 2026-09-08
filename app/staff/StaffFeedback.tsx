"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./feedback.module.css";

type Feedback = { status: "idle" | "success" | "error"; message: string };
type Notice = Feedback & { id: number };
type Task = { id: number; label: string };
type FeedbackContext = {
  notify: (feedback: Feedback) => void;
  runTask: <T>(label: string, work: (progress: (label: string) => void) => Promise<T>) => Promise<T>;
};
const Context = createContext<FeedbackContext | null>(null);

function Toast({ notice, dismiss }: { notice: Notice; dismiss: (id: number) => void }) {
  useEffect(() => {
    if (notice.status === "error") return;
    const timer = window.setTimeout(() => dismiss(notice.id), 5000);
    return () => window.clearTimeout(timer);
  }, [notice.id, notice.status, dismiss]);
  return (
    <div className={`${styles.notice} ${notice.status === "error" ? styles.error : styles.success}`} role={notice.status === "error" ? "alert" : "status"}>
      <span className={styles.symbol} aria-hidden="true">{notice.status === "error" ? "!" : "✓"}</span>
      <p className={styles.message}>{notice.message}</p>
      <button type="button" className={styles.close} onClick={() => dismiss(notice.id)} aria-label="Закрыть уведомление">×</button>
    </div>
  );
}

export default function StaffFeedback({ children }: { children: ReactNode }) {
  const sequence = useRef(0);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const dismiss = useCallback((id: number) => setNotices((current) => current.filter((notice) => notice.id !== id)), []);
  const notify = useCallback((feedback: Feedback) => {
    if (feedback.status === "idle" || !feedback.message) return;
    const id = ++sequence.current;
    setNotices((current) => [...current.slice(-3), { ...feedback, id }]);
  }, []);
  const runTask = useCallback(async <T,>(label: string, work: (progress: (label: string) => void) => Promise<T>) => {
    const id = ++sequence.current;
    setTasks((current) => [...current, { id, label }]);
    try {
      return await work((nextLabel) => setTasks((current) => current.map((task) => task.id === id ? { ...task, label: nextLabel } : task)));
    } finally {
      setTasks((current) => current.filter((task) => task.id !== id));
    }
  }, []);
  return (
    <Context.Provider value={{ notify, runTask }}>
      {children}
      <div className={styles.viewport} aria-label="Уведомления">
        {tasks.map((task) => (
          <div key={task.id} className={`${styles.notice} ${styles.pending}`} role="status">
            <span className={styles.spinner} aria-hidden="true" />
            <p className={styles.message}>{task.label}</p>
          </div>
        ))}
        {notices.map((notice) => <Toast key={notice.id} notice={notice} dismiss={dismiss} />)}
      </div>
    </Context.Provider>
  );
}

export function useStaffFeedback() {
  const context = useContext(Context);
  if (!context) throw new Error("Staff feedback provider is missing");
  return context;
}
