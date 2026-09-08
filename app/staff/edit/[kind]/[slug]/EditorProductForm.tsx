"use client";

import { useStaffFeedback } from "../../../StaffFeedback";
import Link from "next/link";
import { suggestProductSlug, validateProductFields } from "@/lib/product-form";
import { unstable_rethrow, useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { EquipmentBrand, EquipmentType } from "@/lib/db/schema";
import { useEditorVersion } from "./EditorVersionContext";
import { submitEditorForm } from "./actions";
import { initialEditorActionState, type EditorActionState } from "./action-state";
import styles from "./page.module.css";

async function submitWithFeedback(previous: EditorActionState, data: FormData): Promise<EditorActionState> {
  try { return await submitEditorForm(previous, data); }
  catch (error) { unstable_rethrow(error); return { status: "error", message: "Нет соединения с сервером. Введённые данные сохранены в форме — повторите действие." }; }
}

type ProductStatus = "in_stock" | "out_of_stock" | "preorder";
type Locale = "ru" | "en";
type LabelValueRow = { label: string; value: string };
type FeatureRow = { title: string; description: string };

type CoffeeTranslationFormData = {
  title: string;
  size: string;
  notes: string;
  description: string;
  details: LabelValueRow[];
};

type EquipmentTranslationFormData = {
  title: string;
  category: string;
  description: string;
  details: LabelValueRow[];
  features: FeatureRow[];
  specifications: LabelValueRow[];
};

type BaseEditorProduct = {
  kind: "coffee" | "equipment";
  slug: string;
  title: string;
  imageUrl: string;
  status: ProductStatus;
  version: string;
  hasTranslation: boolean;
  isPublished: boolean;
  isArchived: boolean;
  previewHref: string;
};

type CoffeeEditorProduct = BaseEditorProduct & {
  kind: "coffee";
  price: string;
  translations: Record<Locale, CoffeeTranslationFormData>;
};

type EquipmentEditorProduct = BaseEditorProduct & {
  kind: "equipment";
  brand: EquipmentBrand;
  equipmentType: EquipmentType;
  translations: Record<Locale, EquipmentTranslationFormData>;
  images: string[];
};

export type EditorProductFormData = CoffeeEditorProduct | EquipmentEditorProduct;

const copy = {
  saveDraft: "Сохранить черновик",
  preview: "Открыть предпросмотр",
  publish: "Опубликовать",
  archive: "В архив",
  remove: "Удалить",
  status: "Статус наличия",
  image: "Основное изображение",
  price: "Цена",
  notes: "Ноты",
  size: "Вес / размер",
  description: "Описание",
  details: "Детали",
  detailsHint: "Каждое поле можно добавить, удалить и перевести отдельно.",
  category: "Категория",
  brand: "Бренд",
  equipmentType: "Тип оборудования",
  features: "Ключевые блоки",
  featuresHint: "Для каждого блока задайте заголовок и описание.",
  specifications: "Технические характеристики",
  specificationsHint: "Для каждой характеристики задайте параметр и значение.",
  images: "Галерея изображений",
  imagesHint: "Один URL на строку. Первая строка станет главной картинкой.",
  addDetail: "Добавить поле",
  removeDetail: "Удалить поле",
  detailItem: "Поле",
  addFeature: "Добавить блок",
  removeFeature: "Удалить блок",
  featureItem: "Блок",
  addSpecification: "Добавить характеристику",
  removeSpecification: "Удалить характеристику",
  specificationItem: "Позиция",
  sectionLabel: "Основное",
  localeSection: {
    ru: "Версия на русском",
    en: "Версия на английском",
  },
  name: "Название",
  statusOptions: {
    in_stock: "В наличии",
    out_of_stock: "Нет в наличии",
    preorder: "Под заказ",
  },
  equipmentTypes: {
    grinder: "Кофемолка",
    "espresso-machine": "Кофемашина",
  },
  translationReady: "RU / EN",
  translationMissing: "Один язык",
} as const;

function getDetailFields(items: LabelValueRow[]) {
  return items.length > 0 ? items : [{ label: "", value: "" }];
}

function getFeatureFields(items: FeatureRow[]) {
  return items.length > 0 ? items : [{ title: "", description: "" }];
}

function useDynamicRows<T>(initialRows: T[], createEmpty: () => T) {
  const [rows, setRows] = useState<T[]>(initialRows);
  const [enteredRowIndex, setEnteredRowIndex] = useState<number | null>(null);

  useEffect(() => {
    if (enteredRowIndex === null) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setEnteredRowIndex(null);
    }, 420);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [enteredRowIndex]);

  function addRow() {
    setRows((current) => {
      const nextIndex = current.length;
      setEnteredRowIndex(nextIndex);
      return [...current, createEmpty()];
    });
  }

  function removeRow(indexToRemove: number) {
    setRows((current) => {
      if (current.length <= 1) {
        return current;
      }

      return current.filter((_, index) => index !== indexToRemove);
    });
  }

  function updateRow<K extends keyof T>(indexToUpdate: number, key: K, value: T[K]) {
    setRows((current) =>
      current.map((row, index) =>
        index === indexToUpdate ? { ...row, [key]: value } : row,
      ),
    );
  }

  return { rows, enteredRowIndex, addRow, removeRow, updateRow };
}

type PairEditorProps = {
  rows: LabelValueRow[];
  enteredRowIndex: number | null;
  itemLabel: string;
  hint: string;
  addLabel: string;
  removeLabel: string;
  labelName: string;
  valueName: string;
  labelPlaceholder: string;
  valuePlaceholder: string;
  tone: "detail" | "spec";
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, key: "label" | "value", value: string) => void;
};

function PairCollectionEditor({
  rows,
  enteredRowIndex,
  itemLabel,
  hint,
  addLabel,
  removeLabel,
  labelName,
  valueName,
  labelPlaceholder,
  valuePlaceholder,
  tone,
  onAdd,
  onRemove,
  onUpdate,
}: PairEditorProps) {
  const isSpec = tone === "spec";
  const editorClass = isSpec ? styles.specEditor : styles.detailEditor;
  const toolbarClass = isSpec ? styles.specToolbar : styles.detailToolbar;
  const addButtonClass = isSpec ? styles.specAddButton : styles.detailAddButton;
  const listClass = isSpec ? styles.specList : styles.detailList;
  const cardClass = isSpec ? styles.specCard : styles.detailCard;
  const headerClass = isSpec ? styles.specCardHeader : styles.detailCardHeader;
  const indexClass = isSpec ? styles.specIndex : styles.detailIndex;
  const removeButtonClass = isSpec
    ? styles.specRemoveButton
    : styles.detailRemoveButton;
  const fieldsClass = isSpec ? styles.specFields : styles.detailFields;

  return (
    <div className={editorClass}>
      <div className={toolbarClass}>
        <span className={styles.fieldHint}>{hint}</span>
      </div>

      <div className={listClass}>
        {rows.map((row, index) => (
          <div
            key={`${labelName}-${index}`}
            className={`${cardClass} ${
              enteredRowIndex === index ? styles.enteredRow : ""
            }`}
          >
            <div className={headerClass}>
              <span className={indexClass}>
                {itemLabel} {index + 1}
              </span>
              <button
                type="button"
                className={removeButtonClass}
                onClick={() => onRemove(index)}
                disabled={rows.length <= 1}
                aria-label={removeLabel}
                title={removeLabel}
              >
                {isSpec ? "×" : <span className={styles.detailRemoveIcon} aria-hidden="true" />}
              </button>
            </div>

            <div className={fieldsClass}>
              <input
                name={labelName}
                value={row.label}
                onChange={(event) => onUpdate(index, "label", event.target.value)}
                className={styles.textInput}
                placeholder={labelPlaceholder}
              />
              <input
                name={valueName}
                value={row.value}
                onChange={(event) => onUpdate(index, "value", event.target.value)}
                className={styles.textInput}
                placeholder={valuePlaceholder}
              />
            </div>
          </div>
        ))}
      </div>

      <button type="button" className={addButtonClass} onClick={onAdd}>
        {addLabel}
      </button>
    </div>
  );
}

type FeatureEditorProps = {
  rows: FeatureRow[];
  enteredRowIndex: number | null;
  hint: string;
  addLabel: string;
  removeLabel: string;
  itemLabel: string;
  titleName: string;
  descriptionName: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, key: "title" | "description", value: string) => void;
};

function FeatureCollectionEditor({
  rows,
  enteredRowIndex,
  hint,
  addLabel,
  removeLabel,
  itemLabel,
  titleName,
  descriptionName,
  onAdd,
  onRemove,
  onUpdate,
}: FeatureEditorProps) {
  return (
    <div className={styles.featureEditor}>
      <div className={styles.featureToolbar}>
        <span className={styles.fieldHint}>{hint}</span>
      </div>

      <div className={styles.featureList}>
        {rows.map((feature, index) => (
          <div
            key={`${titleName}-${index}`}
            className={`${styles.featureCard} ${
              enteredRowIndex === index ? styles.enteredRow : ""
            }`}
          >
            <div className={styles.featureCardHeader}>
              <span className={styles.featureIndex}>
                {itemLabel} {index + 1}
              </span>
              <button
                type="button"
                className={styles.featureRemoveButton}
                onClick={() => onRemove(index)}
                disabled={rows.length <= 1}
                aria-label={removeLabel}
                title={removeLabel}
              >
                ×
              </button>
            </div>

            <div className={styles.featureFields}>
              <input
                name={titleName}
                value={feature.title}
                onChange={(event) => onUpdate(index, "title", event.target.value)}
                className={styles.textInput}
                placeholder="Заголовок"
              />
              <textarea
                name={descriptionName}
                value={feature.description}
                onChange={(event) =>
                  onUpdate(index, "description", event.target.value)
                }
                className={styles.textArea}
                rows={4}
                placeholder="Описание"
              />
            </div>
          </div>
        ))}
      </div>

      <button type="button" className={styles.featureAddButton} onClick={onAdd}>
        {addLabel}
      </button>
    </div>
  );
}

type LocaleCardProps = {
  locale: Locale;
  children: ReactNode;
};

function LocaleCard({ locale, children }: LocaleCardProps) {
  return (
    <section
      id={`locale-panel-${locale}`}
      role="tabpanel"
      aria-labelledby={`locale-tab-${locale}`}
      className={`${styles.sectionBlock} ${styles.localeSection}`}
    >
      <div className={styles.sectionTopline}>
        <span className={styles.sectionLabel}>{copy.localeSection[locale]}</span>
      </div>
      <div className={styles.formGrid}>{children}</div>
    </section>
  );
}

type DropdownOption<T extends string> = {
  value: T;
  label: string;
};

type CustomSelectProps<T extends string> = {
  name: string;
  value: T;
  options: DropdownOption<T>[];
  ariaLabel: string;
  onChange: (value: T) => void;
};

function CustomSelect<T extends string>({
  name,
  value,
  options,
  ariaLabel,
  onChange,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const activeOption =
    options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className={styles.customSelect} ref={rootRef}>
      <input type="hidden" name={name} value={activeOption.value} />
      <button
        type="button"
        className={styles.customSelectTrigger}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{activeOption.label}</span>
        <span
          className={`${styles.customSelectChevron} ${
            isOpen ? styles.customSelectChevronOpen : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div className={styles.customSelectMenu} role="listbox" aria-label={ariaLabel}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === activeOption.value}
              className={`${styles.customSelectOption} ${
                option.value === activeOption.value
                  ? styles.customSelectOptionActive
                  : ""
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function EditorProductForm({
  product,
}: {
  product: EditorProductFormData;
}) {
  const { version, setVersion } = useEditorVersion();
  const router = useRouter();
  const { notify, runTask } = useStaffFeedback();
  const [dirty, setDirty] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [slugValue, setSlugValue] = useState(product.slug);
  const [autoSlug, setAutoSlug] = useState(!product.isPublished && /^new-(coffee|equipment)(-\d+)?$/.test(product.slug));
  useEffect(() => {
    const name = Array.from(formRef.current?.elements ?? []).map((element) => element.getAttribute("name")).find((name) => name && fieldErrors[name]);
    if (!name) return;
    const input = formRef.current?.elements.namedItem(name);
    if (!(input instanceof HTMLElement)) return;
    let ancestor = input.parentElement;
    while (ancestor) { if (ancestor instanceof HTMLDetailsElement) ancestor.open = true; ancestor = ancestor.parentElement; }
    const target = input instanceof HTMLInputElement && input.type === "hidden" ? input.parentElement?.querySelector("button") : input;
    target?.focus();
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [fieldErrors]);
  function fieldError(name: string) {
    return fieldErrors[name] ? <span className={styles.fieldError} id={`error-${name}`} role="alert">{fieldErrors[name]}</span> : null;
  }
  useEffect(() => {
    if (!dirty) return;
    function beforeUnload(event: BeforeUnloadEvent) { event.preventDefault(); event.returnValue = ""; }
    function beforeLink(event: MouseEvent) {
      const link = event.target instanceof Element ? event.target.closest("a") : null;
      if (!link || link.target === "_blank" || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0 || link.href === window.location.href) return;
      if (!window.confirm("Есть несохранённые изменения. Уйти со страницы?")) { event.preventDefault(); event.stopPropagation(); }
    }
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", beforeLink, true);
    return () => { window.removeEventListener("beforeunload", beforeUnload); document.removeEventListener("click", beforeLink, true); };
  }, [dirty]);
  const [activeLocale, setActiveLocale] = useState<Locale>("ru");
  const [statusValue, setStatusValue] = useState<ProductStatus>(product.status);
  const [equipmentTypeValue, setEquipmentTypeValue] = useState<EquipmentType>(
    product.kind === "equipment" ? product.equipmentType : "grinder",
  );
  const coffeeRuDetails = useDynamicRows<LabelValueRow>(
    product.kind === "coffee"
      ? getDetailFields(product.translations.ru.details)
      : [],
    () => ({ label: "", value: "" }),
  );
  const coffeeEnDetails = useDynamicRows<LabelValueRow>(
    product.kind === "coffee"
      ? getDetailFields(product.translations.en.details)
      : [],
    () => ({ label: "", value: "" }),
  );
  const equipmentRuDetails = useDynamicRows<LabelValueRow>(
    product.kind === "equipment"
      ? getDetailFields(product.translations.ru.details)
      : [],
    () => ({ label: "", value: "" }),
  );
  const equipmentEnDetails = useDynamicRows<LabelValueRow>(
    product.kind === "equipment"
      ? getDetailFields(product.translations.en.details)
      : [],
    () => ({ label: "", value: "" }),
  );
  const equipmentRuFeatures = useDynamicRows<FeatureRow>(
    product.kind === "equipment"
      ? getFeatureFields(product.translations.ru.features)
      : [],
    () => ({ title: "", description: "" }),
  );
  const equipmentEnFeatures = useDynamicRows<FeatureRow>(
    product.kind === "equipment"
      ? getFeatureFields(product.translations.en.features)
      : [],
    () => ({ title: "", description: "" }),
  );
  const equipmentRuSpecifications = useDynamicRows<LabelValueRow>(
    product.kind === "equipment"
      ? getDetailFields(product.translations.ru.specifications)
      : [],
    () => ({ label: "", value: "" }),
  );
  const equipmentEnSpecifications = useDynamicRows<LabelValueRow>(
    product.kind === "equipment"
      ? getDetailFields(product.translations.en.specifications)
      : [],
    () => ({ label: "", value: "" }),
  );
  const [, formAction, isPending] = useActionState(
    async (previous: EditorActionState, data: FormData) => runTask(
      ({ publish: "Публикуем товар…", archive: "Добавляем в архив…", delete: "Перемещаем в корзину…", restore: "Восстанавливаем товар…", unpublish: "Снимаем с публикации…" } as Record<string, string>)[String(data.get("intent"))] ?? "Сохраняем изменения…",
      async () => {
        const result = await submitWithFeedback(previous, data);
        setFieldErrors(result.fieldErrors ?? {});
        if (result.fieldErrors) setActiveLocale("ru");
        else notify(result);
        if (result.status === "success") {
          setDirty(false);
          setAutoSlug(false);
          if (result.version) setVersion(result.version);
          if (result.href) router.replace(result.href);
        }
        return result;
      },
    ),
    initialEditorActionState,
  );

  return (
    <form ref={formRef} noValidate className={styles.editorForm} onChange={(event) => {
      setDirty(true);
      const input = event.target;
      if (input instanceof HTMLInputElement && input.name === "titleRu" && autoSlug) setSlugValue(suggestProductSlug(input.value) || product.slug);
    }}
      onSubmit={(event) => {
        event.preventDefault();
        if (isPending) return;
        const button = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        if (button?.value === "delete" && !window.confirm(`Переместить «${product.title}» в архив / корзину? Его можно будет восстановить.`)) return;
        if (dirty && ["archive", "unpublish", "restore"].includes(button?.value ?? "") && !window.confirm("Это действие не сохраняет изменения полей. Продолжить?")) return;
        const payload = new FormData(event.currentTarget);
        payload.set("intent", button?.value || "save_draft");
        if (["save_draft", "publish"].includes(String(payload.get("intent")))) {
          const errors = validateProductFields(payload, product.kind, product.isPublished || payload.get("intent") === "publish");
          setFieldErrors(errors);
          if (Object.keys(errors).length) { setActiveLocale("ru"); return; }
        }
        // Dispatch manually so React does not reset uncontrolled fields on a handled error.
        startTransition(() => formAction(payload));
      }}
    >
      <fieldset disabled={isPending} style={{ border: 0, padding: 0, margin: 0, minWidth: 0, display: "contents" }}>
      <input type="hidden" name="kind" value={product.kind} />
      <input type="hidden" name="slug" value={product.slug} />
      <input type="hidden" name="version" value={version} />

      <div className={styles.actionBar} data-editor-actions aria-busy={isPending}>
        <span className={styles.actionBarMeta}>{isPending ? "Выполняем действие…" : dirty ? "Есть изменения" : "Изменений нет"}</span>
        <div className={styles.actionBarButtons}>
          <button type="submit" name="intent" value={product.isArchived ? "restore" : "save_draft"} className={styles.primaryAction} disabled={isPending}>
            {product.isArchived ? "Восстановить" : "Сохранить"}
          </button>
          <Link href={product.previewHref} target="_blank" rel="noopener noreferrer" prefetch={false} className={styles.secondaryActionLink}>Предпросмотр</Link>
          <details className={styles.moreMenu} onKeyDown={(event) => { if (event.key === "Escape") { event.currentTarget.open = false; event.currentTarget.querySelector("summary")?.focus(); } }}>
            <summary>Ещё</summary>
            <div className={styles.moreMenuItems}>
              {!product.isArchived && !product.isPublished && <button type="submit" name="intent" value="publish" className={styles.secondaryAction} disabled={isPending}>Опубликовать</button>}
              {product.isPublished && <button type="submit" name="intent" value="unpublish" className={styles.secondaryAction} disabled={isPending}>Снять с публикации</button>}
              {!product.isArchived && <button type="submit" name="intent" value="archive" className={styles.secondaryAction} disabled={isPending}>В архив</button>}
              <button type="submit" name="intent" value="delete" className={styles.secondaryActionDanger} disabled={isPending}>Удалить</button>
            </div>
          </details>
        </div>
      </div>

      {dirty && <p>Есть несохранённые изменения. Предпросмотр показывает последнюю сохранённую версию.</p>}
      <label className={styles.fieldCard}>
        <span className={styles.fieldLabel}>Адрес товара (slug)</span>
        <input className={styles.textInput} name="newSlug" value={slugValue} onChange={(event) => { setAutoSlug(false); setSlugValue(event.target.value); }} aria-invalid={Boolean(fieldErrors.newSlug)} aria-describedby="error-newSlug" required maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" />
        {fieldError("newSlug")}
        <span>Строчные латинские буквы, цифры и дефисы. Изменение адреса отключит прежнюю ссылку.</span>
      </label>
      <section className={styles.sectionBlock}>
        <div className={styles.sectionTopline}>
          <span className={styles.sectionLabel}>{copy.sectionLabel}</span>
        </div>

        <div className={styles.formGrid}>
          <label className={styles.fieldCard}>
            <span className={styles.fieldLabel}>{copy.status}</span>
            <CustomSelect
              name="status"
              value={statusValue}
              ariaLabel={copy.status}
              options={[
                { value: "in_stock", label: copy.statusOptions.in_stock },
                { value: "out_of_stock", label: copy.statusOptions.out_of_stock },
                { value: "preorder", label: copy.statusOptions.preorder },
              ]}
              onChange={(value) => { setStatusValue(value); setDirty(true); }}
            />
                {fieldError("status")}
          </label>

          {product.kind === "coffee" ? (
            <label className={styles.fieldCard}>
              <span className={styles.fieldLabel}>{copy.price}</span>
              <input
                name="price"
                defaultValue={product.price}
                className={styles.textInput}
              />
            </label>
          ) : (
            <>
              <label className={styles.fieldCard}>
                <span className={styles.fieldLabel}>{copy.brand}</span>
                <input
                  name="brand" aria-invalid={Boolean(fieldErrors.brand)} aria-describedby="error-brand"
                  defaultValue={product.brand}
                  className={styles.textInput}
                  required
                />
                {fieldError("brand")}
              </label>

              <label className={styles.fieldCard}>
                <span className={styles.fieldLabel}>{copy.equipmentType}</span>
                <CustomSelect
                  name="equipmentType"
                  value={equipmentTypeValue}
                  ariaLabel={copy.equipmentType}
                  options={[
                    { value: "grinder", label: copy.equipmentTypes.grinder },
                    {
                      value: "espresso-machine",
                      label: copy.equipmentTypes["espresso-machine"],
                    },
                  ]}
                  onChange={(value) => { setEquipmentTypeValue(value); setDirty(true); }}
                />
                {fieldError("equipmentType")}
              </label>
            </>
          )}
        </div>
      </section>

      <section className={styles.sectionBlock}>
        <div className={styles.sectionTopline}>
          <span className={styles.sectionLabel}>Описание RU / EN</span>
        </div>

        <div className={styles.localeTabs} role="tablist" aria-label="Выбор языка">
          {(["ru", "en"] as const).map((locale) => {
            const isActive = activeLocale === locale;

            return (
              <button
                key={locale}
                id={`locale-tab-${locale}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`locale-panel-${locale}`}
                className={`${styles.localeTab} ${
                  isActive ? styles.localeTabActive : ""
                }`}
                onClick={() => setActiveLocale(locale)}
              >
                <span className={styles.localeTabLabel}>{copy.localeSection[locale]}</span>
              </button>
            );
          })}
        </div>
      </section>

      {product.kind === "coffee" ? (
        <>
          <div className={activeLocale === "ru" ? "" : styles.localePanelHidden}>
            <LocaleCard locale="ru">
              <label className={styles.fieldCard}>
                <span className={styles.fieldLabel}>{copy.name}</span>
                <input
                  name="titleRu" aria-invalid={Boolean(fieldErrors.titleRu)} aria-describedby="error-titleRu"
                  defaultValue={product.translations.ru.title}
                  className={styles.textInput}
                  required
                />
                {fieldError("titleRu")}
              </label>

              <label className={styles.fieldCard}>
                <span className={styles.fieldLabel}>{copy.size}</span>
                <input
                  name="sizeRu"
                  defaultValue={product.translations.ru.size}
                  className={styles.textInput}
                />
              </label>

              <label className={styles.fieldCard}>
                <span className={styles.fieldLabel}>{copy.notes}</span>
                <input
                  name="notesRu"
                  defaultValue={product.translations.ru.notes}
                  className={styles.textInput}
                />
              </label>

              <label className={`${styles.fieldCard} ${styles.fieldCardWide}`}>
                <span className={styles.fieldLabel}>{copy.description}</span>
                <textarea
                  name="descriptionRu" aria-invalid={Boolean(fieldErrors.descriptionRu)} aria-describedby="error-descriptionRu"
                  defaultValue={product.translations.ru.description}
                  className={styles.textArea}
                  rows={5}
                  required
                />
                {fieldError("descriptionRu")}
              </label>

              <details className={`${styles.fieldCard} ${styles.fieldCardWide} ${styles.collapsible}`}><summary>{copy.details}</summary>
                <PairCollectionEditor
                  rows={coffeeRuDetails.rows}
                  enteredRowIndex={coffeeRuDetails.enteredRowIndex}
                  itemLabel={copy.detailItem}
                  hint={copy.detailsHint}
                  addLabel={copy.addDetail}
                  removeLabel={copy.removeDetail}
                  labelName="coffeeDetailRuLabel"
                  valueName="coffeeDetailRuValue"
                  labelPlaceholder="Название поля"
                  valuePlaceholder="Значение"
                  tone="detail"
                  onAdd={() => { setDirty(true); coffeeRuDetails.addRow(); }}
                  onRemove={(index) => { setDirty(true); coffeeRuDetails.removeRow(index); }}
                  onUpdate={coffeeRuDetails.updateRow}
                />
              </details>
            </LocaleCard>
          </div>

          <div className={activeLocale === "en" ? "" : styles.localePanelHidden}>
            <LocaleCard locale="en">
              <label className={styles.fieldCard}>
                <span className={styles.fieldLabel}>{copy.name}</span>
                <input
                  name="titleEn"
                  defaultValue={product.translations.en.title}
                  className={styles.textInput}
                />
              </label>

              <label className={styles.fieldCard}>
                <span className={styles.fieldLabel}>{copy.size}</span>
                <input
                  name="sizeEn"
                  defaultValue={product.translations.en.size}
                  className={styles.textInput}
                />
              </label>

              <label className={styles.fieldCard}>
                <span className={styles.fieldLabel}>{copy.notes}</span>
                <input
                  name="notesEn"
                  defaultValue={product.translations.en.notes}
                  className={styles.textInput}
                />
              </label>

              <label className={`${styles.fieldCard} ${styles.fieldCardWide}`}>
                <span className={styles.fieldLabel}>{copy.description}</span>
                <textarea
                  name="descriptionEn"
                  defaultValue={product.translations.en.description}
                  className={styles.textArea}
                  rows={5}
                />
              </label>

              <details className={`${styles.fieldCard} ${styles.fieldCardWide} ${styles.collapsible}`}><summary>{copy.details}</summary>
                <PairCollectionEditor
                  rows={coffeeEnDetails.rows}
                  enteredRowIndex={coffeeEnDetails.enteredRowIndex}
                  itemLabel={copy.detailItem}
                  hint={copy.detailsHint}
                  addLabel={copy.addDetail}
                  removeLabel={copy.removeDetail}
                  labelName="coffeeDetailEnLabel"
                  valueName="coffeeDetailEnValue"
                  labelPlaceholder="Field name"
                  valuePlaceholder="Value"
                  tone="detail"
                  onAdd={() => { setDirty(true); coffeeEnDetails.addRow(); }}
                  onRemove={(index) => { setDirty(true); coffeeEnDetails.removeRow(index); }}
                  onUpdate={coffeeEnDetails.updateRow}
                />
              </details>
            </LocaleCard>
          </div>
        </>
      ) : (
        <>
          <div className={activeLocale === "ru" ? "" : styles.localePanelHidden}>
            <LocaleCard locale="ru">
              <label className={styles.fieldCard}>
                <span className={styles.fieldLabel}>{copy.name}</span>
                <input
                  name="titleRu" aria-invalid={Boolean(fieldErrors.titleRu)} aria-describedby="error-titleRu"
                  defaultValue={product.translations.ru.title}
                  className={styles.textInput}
                  required
                />
                {fieldError("titleRu")}
              </label>

              <label className={styles.fieldCard}>
                <span className={styles.fieldLabel}>{copy.category}</span>
                <input
                  name="categoryRu"
                  defaultValue={product.translations.ru.category}
                  className={styles.textInput}
                />
              </label>

              <label className={`${styles.fieldCard} ${styles.fieldCardWide}`}>
                <span className={styles.fieldLabel}>{copy.description}</span>
                <textarea
                  name="descriptionRu" aria-invalid={Boolean(fieldErrors.descriptionRu)} aria-describedby="error-descriptionRu"
                  defaultValue={product.translations.ru.description}
                  className={styles.textArea}
                  rows={5}
                  required
                />
                {fieldError("descriptionRu")}
              </label>

              <details className={`${styles.fieldCard} ${styles.fieldCardWide} ${styles.collapsible}`}><summary>{copy.details}</summary>
                <PairCollectionEditor
                  rows={equipmentRuDetails.rows}
                  enteredRowIndex={equipmentRuDetails.enteredRowIndex}
                  itemLabel={copy.detailItem}
                  hint={copy.detailsHint}
                  addLabel={copy.addDetail}
                  removeLabel={copy.removeDetail}
                  labelName="equipmentDetailRuLabel"
                  valueName="equipmentDetailRuValue"
                  labelPlaceholder="Название поля"
                  valuePlaceholder="Значение"
                  tone="detail"
                  onAdd={() => { setDirty(true); equipmentRuDetails.addRow(); }}
                  onRemove={(index) => { setDirty(true); equipmentRuDetails.removeRow(index); }}
                  onUpdate={equipmentRuDetails.updateRow}
                />
              </details>

              <details className={`${styles.fieldCard} ${styles.fieldCardWide} ${styles.collapsible}`}><summary>{copy.features}</summary>
                <FeatureCollectionEditor
                  rows={equipmentRuFeatures.rows}
                  enteredRowIndex={equipmentRuFeatures.enteredRowIndex}
                  hint={copy.featuresHint}
                  addLabel={copy.addFeature}
                  removeLabel={copy.removeFeature}
                  itemLabel={copy.featureItem}
                  titleName="equipmentFeatureRuTitle"
                  descriptionName="equipmentFeatureRuDescription"
                  onAdd={() => { setDirty(true); equipmentRuFeatures.addRow(); }}
                  onRemove={(index) => { setDirty(true); equipmentRuFeatures.removeRow(index); }}
                  onUpdate={equipmentRuFeatures.updateRow}
                />
              </details>

              <details className={`${styles.fieldCard} ${styles.fieldCardWide} ${styles.collapsible}`}><summary>{copy.specifications}</summary>
                <PairCollectionEditor
                  rows={equipmentRuSpecifications.rows}
                  enteredRowIndex={equipmentRuSpecifications.enteredRowIndex}
                  itemLabel={copy.specificationItem}
                  hint={copy.specificationsHint}
                  addLabel={copy.addSpecification}
                  removeLabel={copy.removeSpecification}
                  labelName="equipmentSpecificationRuLabel"
                  valueName="equipmentSpecificationRuValue"
                  labelPlaceholder="Параметр"
                  valuePlaceholder="Значение"
                  tone="spec"
                  onAdd={() => { setDirty(true); equipmentRuSpecifications.addRow(); }}
                  onRemove={(index) => { setDirty(true); equipmentRuSpecifications.removeRow(index); }}
                  onUpdate={equipmentRuSpecifications.updateRow}
                />
              </details>
            </LocaleCard>
          </div>

          <div className={activeLocale === "en" ? "" : styles.localePanelHidden}>
            <LocaleCard locale="en">
              <label className={styles.fieldCard}>
                <span className={styles.fieldLabel}>{copy.name}</span>
                <input
                  name="titleEn"
                  defaultValue={product.translations.en.title}
                  className={styles.textInput}
                />
              </label>

              <label className={styles.fieldCard}>
                <span className={styles.fieldLabel}>{copy.category}</span>
                <input
                  name="categoryEn"
                  defaultValue={product.translations.en.category}
                  className={styles.textInput}
                />
              </label>

              <label className={`${styles.fieldCard} ${styles.fieldCardWide}`}>
                <span className={styles.fieldLabel}>{copy.description}</span>
                <textarea
                  name="descriptionEn"
                  defaultValue={product.translations.en.description}
                  className={styles.textArea}
                  rows={5}
                />
              </label>

              <details className={`${styles.fieldCard} ${styles.fieldCardWide} ${styles.collapsible}`}><summary>{copy.details}</summary>
                <PairCollectionEditor
                  rows={equipmentEnDetails.rows}
                  enteredRowIndex={equipmentEnDetails.enteredRowIndex}
                  itemLabel={copy.detailItem}
                  hint={copy.detailsHint}
                  addLabel={copy.addDetail}
                  removeLabel={copy.removeDetail}
                  labelName="equipmentDetailEnLabel"
                  valueName="equipmentDetailEnValue"
                  labelPlaceholder="Field name"
                  valuePlaceholder="Value"
                  tone="detail"
                  onAdd={() => { setDirty(true); equipmentEnDetails.addRow(); }}
                  onRemove={(index) => { setDirty(true); equipmentEnDetails.removeRow(index); }}
                  onUpdate={equipmentEnDetails.updateRow}
                />
              </details>

              <details className={`${styles.fieldCard} ${styles.fieldCardWide} ${styles.collapsible}`}><summary>{copy.features}</summary>
                <FeatureCollectionEditor
                  rows={equipmentEnFeatures.rows}
                  enteredRowIndex={equipmentEnFeatures.enteredRowIndex}
                  hint={copy.featuresHint}
                  addLabel={copy.addFeature}
                  removeLabel={copy.removeFeature}
                  itemLabel={copy.featureItem}
                  titleName="equipmentFeatureEnTitle"
                  descriptionName="equipmentFeatureEnDescription"
                  onAdd={() => { setDirty(true); equipmentEnFeatures.addRow(); }}
                  onRemove={(index) => { setDirty(true); equipmentEnFeatures.removeRow(index); }}
                  onUpdate={equipmentEnFeatures.updateRow}
                />
              </details>

              <details className={`${styles.fieldCard} ${styles.fieldCardWide} ${styles.collapsible}`}><summary>{copy.specifications}</summary>
                <PairCollectionEditor
                  rows={equipmentEnSpecifications.rows}
                  enteredRowIndex={equipmentEnSpecifications.enteredRowIndex}
                  itemLabel={copy.specificationItem}
                  hint={copy.specificationsHint}
                  addLabel={copy.addSpecification}
                  removeLabel={copy.removeSpecification}
                  labelName="equipmentSpecificationEnLabel"
                  valueName="equipmentSpecificationEnValue"
                  labelPlaceholder="Specification"
                  valuePlaceholder="Value"
                  tone="spec"
                  onAdd={() => { setDirty(true); equipmentEnSpecifications.addRow(); }}
                  onRemove={(index) => { setDirty(true); equipmentEnSpecifications.removeRow(index); }}
                  onUpdate={equipmentEnSpecifications.updateRow}
                />
              </details>
            </LocaleCard>
          </div>

        </>
      )}
      </fieldset>
    </form>
  );
}
