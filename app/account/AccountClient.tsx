"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { DemoProduct } from "./demo-products";
import Footer from "../components/Footer";
import ShopHeaderActions from "../components/ShopHeaderActions";
import usePersistentLanguage from "../components/usePersistentLanguage";
import styles from "./account.module.css";

const copy = {
  ru: { back: "На сайт", label: "Личный кабинет", name: "Виктор", orders: "Заказы", profile: "Мои данные", bonuses: "Бонусы", exit: "Выйти", latest: "Последний заказ", received: "Получен", cup: "Дегустационная чашка", coffeeSize: "250 г · 1 шт.", cupSize: "180 мл · 1 шт.", total: "Итого", repeat: "Повторить заказ", all: "Все заказы", help: "Нужна помощь с заказом?", contact: "Написать нам", demo: "Демонстрационный кабинет · пример данных", repeatNote: "Это пример заказа. Повтор заказа станет доступен после подключения корзины.", saved: "Демо-данные обновлены до перезагрузки страницы.", firstName: "Имя", phone: "Телефон", email: "Email", save: "Сохранить изменения", profileNote: "Демонстрационная форма. Не вводите настоящие персональные данные.", balance: "Бонусный баланс", points: "бонусов", history: "История начислений", earned: "За заказ", bonusNote: "Пример бонусного счёта. Правила начисления и списания появятся после запуска программы лояльности.", details: "Подробнее", close: "К последнему заказу" },
  en: { back: "Back to site", label: "My account", name: "Viktor", orders: "Orders", profile: "My details", bonuses: "Rewards", exit: "Exit", latest: "Latest order", received: "Received", cup: "Tasting cup", coffeeSize: "250 g · 1 pc.", cupSize: "180 ml · 1 pc.", total: "Total", repeat: "Order again", all: "All orders", help: "Need help with your order?", contact: "Contact us", demo: "Demo account · sample data", repeatNote: "This is a sample order. Reordering will be available once the cart is connected.", saved: "Demo details updated until the page is reloaded.", firstName: "Name", phone: "Phone", email: "Email", save: "Save changes", profileNote: "Demo form. Please do not enter real personal information.", balance: "Reward balance", points: "points", history: "Reward history", earned: "Order", bonusNote: "Sample reward balance. Earning and spending rules will be available when the loyalty programme launches.", details: "View order", close: "Back to latest order" },
  kz: { back: "Сайтқа оралу", label: "Жеке кабинет", name: "Виктор", orders: "Тапсырыстар", profile: "Менің деректерім", bonuses: "Бонустар", exit: "Шығу", latest: "Соңғы тапсырыс", received: "Алынды", cup: "Дегустациялық кесе", coffeeSize: "250 г · 1 дана", cupSize: "180 мл · 1 дана", total: "Барлығы", repeat: "Қайта тапсырыс беру", all: "Барлық тапсырыстар", help: "Тапсырыс бойынша көмек керек пе?", contact: "Бізге жазыңыз", demo: "Демо кабинет · үлгі деректер", repeatNote: "Бұл — үлгі тапсырыс. Себет қосылғаннан кейін қайта тапсырыс беруге болады.", saved: "Демо деректер бет жаңартылғанға дейін сақталды.", firstName: "Аты", phone: "Телефон", email: "Email", save: "Өзгерістерді сақтау", profileNote: "Демо нысан. Нақты жеке деректерді енгізбеңіз.", balance: "Бонус балансы", points: "бонус", history: "Бонус тарихы", earned: "Тапсырыс үшін", bonusNote: "Бонус шотының үлгісі. Есептеу және жұмсау ережелері адалдық бағдарламасы іске қосылғаннан кейін пайда болады.", details: "Толығырақ", close: "Соңғы тапсырысқа оралу" },
};
type Section = "orders" | "profile" | "bonuses";
export default function AccountClient({ products }: { products: DemoProduct[] }) {
  const orders = [
    { id: 1048, date: "2026-10-18", products, total: products.reduce((sum, product) => sum + product.price, 0) },
    { id: 1021, date: "2026-10-02", products: products.slice(0, 1), total: products[0]?.price ?? 0 },
  ];
  const [language] = usePersistentLanguage();
  const t = copy[language];
  const [section, setSection] = useState<Section>("orders");
  const [history, setHistory] = useState(false);
  const [orderIndex, setOrderIndex] = useState(0);
  const [notice, setNotice] = useState<"saved" | "repeatNote" | null>(null);
  const [profile, setProfile] = useState({ name: "", phone: "", email: "" });
  const [savedName, setSavedName] = useState("");
  const order = orders[orderIndex];
  const locale = language === "kz" ? "kk-KZ" : language === "ru" ? "ru-RU" : "en-GB";
  const price = (value: number) => `${new Intl.NumberFormat(locale).format(value)} ₸`;
  const date = (value: string) => new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));

  return <div className={styles.page}>
    <div className={styles.viewport}>
      <header className={styles.header}>
      <Link href="/" className={styles.logo} aria-label="Sketo">sketo.</Link>
      <ShopHeaderActions />
      </header>
      <main className={styles.layout}>
      <aside className={styles.sidebar}>
        <p className={styles.eyebrow}>{t.label}</p>
        <p className={styles.name}>{savedName || t.name}</p>
        <nav className={styles.nav} aria-label={t.label}>
          {(["orders", "profile", "bonuses"] as const).map(key => <button key={key} type="button" aria-current={section === key ? "page" : undefined} onClick={() => { setSection(key); setHistory(false); setOrderIndex(0); setNotice(null); }}>
            <span>{t[key]}</span>{key === "bonuses" && <span className={styles.balance}>2 400</span>}
          </button>)}
        </nav>
        <Link href="/" className={styles.exit}>{t.exit}</Link>
      </aside>
      <div className={styles.content}>
        {section === "orders" && <section aria-labelledby="account-heading">
          <h1 id="account-heading">{history ? t.all : orderIndex ? `#${order.id}` : t.latest}</h1>
          {history ? <div className={styles.history}>{orders.map((item, index) => <button key={item.id} className={styles.historyRow} onClick={() => { setOrderIndex(index); setHistory(false); setNotice(null); }}>
            <span>#{item.id}<small>{date(item.date)}</small></span><span className={styles.status}>{t.received}</span><strong>{price(item.total)}</strong><span>{t.details} ↗</span>
          </button>)}</div> : <>
            <div className={styles.orderMeta}><span>#{order.id} · {date(order.date)}</span><span className={styles.status}>{t.received}</span></div>
            <div className={styles.products}>
              {order.products.map(product => <Link href={product.href} key={product.href} className={styles.product}>
                <Image className={styles.productArt} src={product.image || "/image-unavailable.svg"} width={160} height={130} alt="" unoptimized />
                <div><h2>{product.content[language].name}</h2><p>{[product.content[language].detail, language === "en" ? "1 pc." : language === "kz" ? "1 дана" : "1 шт."].filter(Boolean).join(" · ")}</p></div>
                <strong>{price(product.price)}</strong>
              </Link>)}
            </div>
            <div className={styles.total}><span>{t.total}</span><strong>{price(order.total)}</strong></div>
            <div className={styles.actions}><button className={styles.primary} onClick={() => setNotice("repeatNote")}>{t.repeat}</button><button className={styles.textLink} onClick={() => { setHistory(true); setNotice(null); }}>{t.all} ↗</button></div>
          </>}
        </section>}
        {section === "profile" && <section aria-labelledby="account-heading">
          <h1 id="account-heading">{t.profile}</h1><p className={styles.intro}>{t.profileNote}</p>
          <form className={styles.form} onSubmit={event => { event.preventDefault(); setSavedName(profile.name.trim()); setNotice("saved"); }}>
            <label>{t.firstName}<input name="demo-name" value={profile.name} placeholder={t.name} autoComplete="off" maxLength={80} onChange={e => { setProfile({ ...profile, name: e.target.value }); setNotice(null); }} /></label>
            <label>{t.phone}<input type="tel" name="demo-phone" value={profile.phone} placeholder="+7 (___) ___-__-__" autoComplete="off" maxLength={30} onChange={e => { setProfile({ ...profile, phone: e.target.value }); setNotice(null); }} /></label>
            <label>{t.email}<input type="email" name="demo-email" value={profile.email} placeholder="name@example.com" autoComplete="off" maxLength={254} onChange={e => { setProfile({ ...profile, email: e.target.value }); setNotice(null); }} /></label>
            <button className={styles.primary} type="submit">{t.save}</button>
          </form>
        </section>}
        {section === "bonuses" && <section aria-labelledby="account-heading">
          <h1 id="account-heading">{t.bonuses}</h1><div className={styles.bonusSummary}><p className={styles.eyebrow}>{t.balance}</p><p><strong>2 400</strong> {t.points}</p></div><p className={styles.intro}>{t.bonusNote}</p>
          <h2 className={styles.subheading}>{t.history}</h2>
          {[{ id: 1048, amount: 1200, date: "2026-10-18" }, { id: 1021, amount: 1200, date: "2026-10-02" }].map(entry => <div className={styles.ledgerRow} key={entry.id}><span>{t.earned} #{entry.id}<small>{date(entry.date)}</small></span><strong>+{entry.amount.toLocaleString(locale)}</strong></div>)}
        </section>}
        <p className={styles.notice} role="status">{notice ? t[notice] : ""}</p>
      </div>
      </main>
      <span className={styles.watermark} aria-hidden="true">S</span>
      <div className={styles.footer}>
        <div className={styles.help}><span>{t.help}</span><Link className={styles.textLink} href="/contacts">{t.contact} ↗</Link></div>
        <span>{t.demo}</span>
      </div>
    </div>
    <Footer language={language} />
  </div>;
}
