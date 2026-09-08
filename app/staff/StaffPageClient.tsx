"use client";

import { useStaffFeedback } from "./StaffFeedback";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { createPortal } from "react-dom";
import {
  archiveSelectedStaffProducts,
  restoreSelectedStaffProducts,
  createStaffProduct,
  deleteSelectedStaffProducts,
} from "./actions";
import styles from "./staff.module.css";
import type {
  StaffEditorialState,
  StaffProductRecord,
  StaffProductStatus,
} from "./staff-data";

type ProductStatus = "all" | StaffProductStatus;
type EditorialFilter = "all" | StaffEditorialState;
type SortMode = "name" | "status";
type WorkspaceMode = "coffee" | "equipment";

type StaffProduct = StaffProductRecord & {
  name: string;
  meta: string;
  sourceLabel: string;
  updatedLabel: string;
};

const copy = {
  home: "Главная Sketo",
  backToSite: "На сайт",
  search: "Поиск",
  searchPlaceholder: "Название, описание или бренд",
  statusLabel: "Наличие",
  editorialLabel: "Публикация",
  sortLabel: "Сортировка",
  workspaceLabel: "Режим",
  workspaceTabs: {
    coffee: "Кофе",
    equipment: "Оборудование",
  },
  statusTabs: {
    all: "Любой статус",
    in_stock: "В наличии",
    out_of_stock: "Нет в наличии",
    preorder: "Под заказ",
  },
  editorialTabs: {
    all: "Любое состояние",
    draft: "Черновик",
    published: "Опубликовано",
    archived: "Архив / корзина",
  },
  sort: {
    name: "По названию",
    status: "По статусу",
  },
  primaryActions: {
    addCoffee: "Добавить кофе",
    addEquipment: "Добавить оборудование",
  },
  loading: {
    createCoffee: "Открываем новый лот кофе",
    createEquipment: "Открываем новую карточку оборудования",
    edit: "Открываем редактор",
  },
  quickActions: {
    archive: "Архивировать",
    delete: "Удалить",
  },
  workspaceTitle: "workspace",
  deleteModal: {
    title: "Подтверждение удаления",
    cancel: "Отмена",
    confirm: "Удалить",
    message: (count: number) => `Переместить ${count} ${getCountLabel(count)} в архив / корзину? Товары можно будет восстановить в редакторе.`,
  },
  staff: "Сотрудник",
  metrics: {
    total: "Всего позиций",
    coffee: "Кофе",
    equipment: "Оборудование",
  },
  selected: (count: number) =>
    count === 0 ? "Ничего не выбрано" : `Выбрано: ${count}`,
  empty: "Ничего не найдено. Попробуйте другой запрос или фильтр.",
  archiveSection: "Архив / корзина",
  status: {
    in_stock: "В наличии",
    out_of_stock: "Нет в наличии",
    preorder: "Под заказ",
  },
  editorial: {
    draft: "Черновик",
    published: "Опубликовано",
    archived: "Архив / корзина",
  },
  kind: {
    coffee: "Кофе",
    equipment: "Оборудование",
  },
  row: {
    publicPage: "Открыть страницу",
    publicPageUnavailable: "Не опубликовано",
    edit: "Редактировать",
    title: "Название",
    updated: "Обновлено",
    availability: "Наличие",
    publication: "Публикация",
  },
} as const;

function getCountLabel(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "товар";
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "товара";
  }

  return "товаров";
}

function sortProducts(products: StaffProduct[], sortMode: SortMode) {
  const statusOrder: Record<Exclude<ProductStatus, "all">, number> = {
    out_of_stock: 0,
    preorder: 1,
    in_stock: 2,
  };

  const collator = new Intl.Collator("ru", {
    sensitivity: "base",
    numeric: true,
  });

  return [...products].sort((left, right) => {
    if (sortMode === "status") {
      return (
        statusOrder[left.status] - statusOrder[right.status] ||
        left.sortOrder - right.sortOrder ||
        left.slug.localeCompare(right.slug, "en")
      );
    }

    return (
      collator.compare(left.name, right.name) ||
      left.sortOrder - right.sortOrder ||
      left.slug.localeCompare(right.slug, "en")
    );
  });
}

function formatUpdatedLabel(updatedAt: string | null) {
  if (!updatedAt) {
    return "Без даты";
  }

  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return "Некорректная дата";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

type StaffPageClientProps = {
  products: StaffProductRecord[];
};

function subscribeToClientReady() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export default function StaffPageClient({
  products: sourceProducts,
}: StaffPageClientProps) {
  const [listView, setListView] = useState<"active" | "archive">("active");
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("coffee");
  const [activeStatus, setActiveStatus] = useState<ProductStatus>("all");
  const [activeEditorial, setActiveEditorial] = useState<EditorialFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("status");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isArchiving, startArchiveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isCreating, startCreateTransition] = useTransition();
  const [pendingNavigationLabel, setPendingNavigationLabel] = useState<string | null>(
    null,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const isClient = useSyncExternalStore(
    subscribeToClientReady,
    getClientSnapshot,
    getServerSnapshot,
  );
  const sortMenuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { notify, runTask } = useStaffFeedback();
  const createRequests = useRef<Partial<Record<WorkspaceMode, string>>>({});
  const deferredSearch = useDeferredValue(searchValue);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!sortMenuRef.current?.contains(event.target as Node)) {
        setSortMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSortMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!pendingNavigationLabel) {
      return;
    }

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [pendingNavigationLabel]);

  const products = useMemo<StaffProduct[]>(() => {
    return sourceProducts.map((product) => ({
      ...product,
      name: product.translations.ru.name,
      meta: product.translations.ru.meta,
      sourceLabel: product.translations.ru.sourceLabel,
      updatedLabel: formatUpdatedLabel(product.updatedAt),
    }));
  }, [sourceProducts]);

  const metrics = useMemo(
    () => ({
      total: products.length,
      coffee: products.filter((product) => product.kind === "coffee").length,
      equipment: products.filter((product) => product.kind === "equipment").length,
    }),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    const nextProducts = products.filter((product) => {
      const matchesTab = product.kind === workspaceMode && (listView === "archive" ? product.editorialState === "archived" : product.editorialState !== "archived");
      const matchesStatus =
        activeStatus === "all" || product.status === activeStatus;
      const matchesEditorial =
        listView === "archive" || activeEditorial === "all" || product.editorialState === activeEditorial;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        `${product.name} ${product.meta} ${product.price ?? ""} ${product.sourceLabel}`
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesTab && matchesStatus && matchesEditorial && matchesSearch;
    });

    return sortProducts(nextProducts, sortMode);
  }, [activeEditorial, activeStatus, deferredSearch, products, sortMode, workspaceMode, listView]);

  const selectedProducts = filteredProducts.filter((product) =>
    selectedIds.includes(`${product.kind}:${product.slug}`),
  );
  const visibleSelectedIds = selectedProducts.map((product) => `${product.kind}:${product.slug}`);
  const selectedCount = visibleSelectedIds.length;
  const activeProducts = filteredProducts.filter(
    (product) => product.editorialState !== "archived",
  );
  const archivedProducts = filteredProducts.filter(
    (product) => product.editorialState === "archived",
  );

  function toggleSelection(productId: string) {
    setSelectedIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }

  function toggleAllVisible() {
    const visibleIds = filteredProducts.map(
      (product) => `${product.kind}:${product.slug}`,
    );

    const allVisibleSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedIds.includes(id));

    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : [...new Set([...current, ...visibleIds])],
    );
  }

  const allVisibleSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((product) =>
      selectedIds.includes(`${product.kind}:${product.slug}`),
    );

  function archiveSelected() {
    if (
      selectedCount === 0 ||
      isArchiving ||
      isDeleting ||
      isCreating ||
      pendingNavigationLabel
    ) {
      return;
    }

    startArchiveTransition(() => runTask(listView === "archive" ? "Восстанавливаем товары…" : "Добавляем товары в архив…", async () => {
      try {
        const result = await (listView === "archive" ? restoreSelectedStaffProducts : archiveSelectedStaffProducts)(visibleSelectedIds, Object.fromEntries(selectedProducts.map((product) => [`${product.kind}:${product.slug}`, product.updatedAt])));
        notify(result);

        if (result.status === "success") {
          setSelectedIds([]);
        }
      } catch {
        notify({ status: "error", message: "Нет соединения с сервером. Выбор сохранён — повторите действие." });
      }
    }));
  }

  function openDeleteModal() {
    if (
      selectedCount === 0 ||
      isArchiving ||
      isDeleting ||
      isCreating ||
      pendingNavigationLabel
    ) {
      return;
    }

    setIsDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    if (isDeleting) {
      return;
    }

    setIsDeleteModalOpen(false);
  }

  function confirmDeleteSelected() {
    if (selectedCount === 0 || isDeleting) {
      return;
    }

    startDeleteTransition(() => runTask("Перемещаем товары в корзину…", async () => {
      try {
        const result = await deleteSelectedStaffProducts(visibleSelectedIds, Object.fromEntries(selectedProducts.map((product) => [`${product.kind}:${product.slug}`, product.updatedAt])));
        notify(result);

        if (result.status === "success") {
          setSelectedIds([]);
          setIsDeleteModalOpen(false);
        }
      } catch {
        notify({ status: "error", message: "Нет соединения с сервером. Выбор сохранён — повторите действие." });
      }
    }));
  }

  function startLoadingNavigation(label: string, href?: string) {
    if (pendingNavigationLabel) {
      return;
    }

    setPendingNavigationLabel(label);

    if (href) {
      router.push(href, { scroll: false });
    }
  }

  function submitCreateProduct(kind: WorkspaceMode) {
    if (pendingNavigationLabel || isCreating) {
      return;
    }

    const label =
      kind === "coffee" ? copy.loading.createCoffee : copy.loading.createEquipment;



    startCreateTransition(() => runTask(label, async () => {
      try {
        const formData = new FormData();
        formData.set("kind", kind);
        createRequests.current[kind] ??= crypto.randomUUID();
        formData.set("requestId", createRequests.current[kind]!);
        const result = await createStaffProduct(formData);
        notify({ status: "success", message: "Товар создан. Можно заполнить карточку." });
        router.push(result.href, { scroll: false });
      } catch {
        notify({ status: "error", message: "Не удалось создать товар. Повторите попытку — повторный запрос не создаст дубликат." });
        setPendingNavigationLabel(null);
      }
    }));
  }

  function renderProductRow(product: StaffProduct) {
    const productId = `${product.kind}:${product.slug}`;
    const selected = selectedIds.includes(productId);
    const canOpenPublicPage = product.editorialState === "published";

    return (
      <li key={productId}>
        <article
          className={`${styles.row} ${
            product.editorialState === "archived"
              ? styles.rowArchived
              : product.editorialState === "draft"
                ? styles.rowDraft
                : ""
          }`}
        >
          <label className={styles.checkboxWrap}>
            <input
              type="checkbox"
              checked={selected}
              onChange={() => toggleSelection(productId)}
              className={styles.checkbox}
            />
            <span className={styles.checkboxIndicator} />
          </label>

          <div className={styles.thumb}>
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="96px"
              className={styles.thumbImage}
            />
          </div>

          <div className={styles.rowBody}>
            <div className={styles.tableHead}>
              <div className={styles.tableColMain}>
                <span className={styles.rowFieldLabel}>{copy.row.title}</span>
              </div>
              <div className={styles.tableCol}>
                <span className={styles.rowFieldLabel}>{copy.row.updated}</span>
              </div>
              <div className={styles.tableCol}>
                <span className={styles.rowFieldLabel}>{copy.row.availability}</span>
              </div>
              <div className={styles.tableCol}>
                <span className={styles.rowFieldLabel}>{copy.row.publication}</span>
              </div>
            </div>

            <div className={styles.tableRow}>
              <div className={styles.tableColMain}>
                <div className={styles.rowTitleBlock}>
                  <h2 className={styles.rowTitle}>{product.name}</h2>
                </div>
              </div>

              <div className={styles.tableCol}>
                <span className={styles.rowFieldValue}>{product.updatedLabel}</span>
              </div>

              <div className={styles.tableCol}>
                <span
                  className={`${styles.status} ${styles[`status_${product.status}`]}`}
                >
                  {copy.status[product.status]}
                </span>
              </div>

              <div className={styles.tableCol}>
                <span
                  className={`${styles.editorialBadge} ${
                    styles[`editorial_${product.editorialState}`]
                  }`}
                >
                  {copy.editorial[product.editorialState]}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.rowActions}>
            {product.editorialState === "archived" && <button type="button" className={styles.primaryButton} disabled={isArchiving || isDeleting} onClick={() => startArchiveTransition(() => runTask("Восстанавливаем товар…", async () => {
              try { notify(await restoreSelectedStaffProducts([productId], { [productId]: product.updatedAt })); }
              catch { notify({ status: "error", message: "Не удалось восстановить товар. Повторите попытку." }); }
            }))}>Восстановить</button>}
            {canOpenPublicPage ? (
              <Link href={product.href} className={styles.textAction}>
                {copy.row.publicPage}
              </Link>
            ) : (
              <span className={styles.textActionDisabled}>
                {copy.row.publicPageUnavailable}
              </span>
            )}
            <Link
              href={`/staff/edit/${product.kind}/${product.slug}`}
              className={styles.secondaryButton}
              onClick={(event) => {
                if (pendingNavigationLabel || isCreating) {
                  event.preventDefault();
                  return;
                }

                event.preventDefault();
                startLoadingNavigation(
                  copy.loading.edit,
                  `/staff/edit/${product.kind}/${product.slug}`,
                );
              }}
              aria-disabled={Boolean(pendingNavigationLabel)}
            >
              {copy.row.edit}
            </Link>
          </div>
        </article>
      </li>
    );
  }

  return (
    <main className={styles.page}>
      {isClient && pendingNavigationLabel
        ? createPortal(
            <div className={styles.loadingOverlay} role="status" aria-live="polite">
              <div className={styles.loadingOverlayInner}>
                <span className={styles.loadingSpinner} aria-hidden="true" />
                <span className={styles.loadingLabel}>{pendingNavigationLabel}</span>
              </div>
            </div>,
            document.body,
          )
        : null}

      {isClient && isDeleteModalOpen
        ? createPortal(
            <div className={styles.modalOverlay} role="presentation">
              <div
                className={styles.confirmModal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="staff-delete-modal-title"
              >
                <div className={styles.confirmModalBody}>
                  <h2 id="staff-delete-modal-title" className={styles.confirmModalTitle}>
                    {copy.deleteModal.title}
                  </h2>
                  <p className={styles.confirmModalText}>
                    {copy.deleteModal.message(selectedCount)}
                    <br />
                    {selectedProducts.map((product) => product.name).join(", ")}
                  </p>
                </div>
                <div className={styles.confirmModalActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={closeDeleteModal}
                    disabled={isDeleting}
                  >
                    {copy.deleteModal.cancel}
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryButtonDanger}
                    onClick={confirmDeleteSelected}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Удаляем..." : copy.deleteModal.confirm}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerMain}>
            <Link href="/" className={styles.homeLogo} aria-label={copy.home}>
              <span>sketo.</span>
              <span className={styles.homeLogoWorkspace}>{copy.workspaceTitle}</span>
            </Link>

            <div className={styles.headerActions}>
              <Link href="/" className={styles.backLink}>
                {copy.backToSite}
              </Link>
              <div className={styles.staffBadge}>{copy.staff}</div>
            </div>
          </div>

          <div className={styles.overviewGrid}>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>{copy.metrics.total}</p>
              <p className={styles.metricValue}>{metrics.total}</p>
            </article>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>{copy.metrics.coffee}</p>
              <p className={styles.metricValue}>{metrics.coffee}</p>
            </article>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>{copy.metrics.equipment}</p>
              <p className={styles.metricValue}>{metrics.equipment}</p>
            </article>
          </div>

          <div className={styles.primaryActions}>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                submitCreateProduct("coffee");
              }}
            >
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={Boolean(pendingNavigationLabel) || isCreating}
              >
                {copy.primaryActions.addCoffee}
              </button>
            </form>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                submitCreateProduct("equipment");
              }}
            >
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={Boolean(pendingNavigationLabel) || isCreating}
              >
                {copy.primaryActions.addEquipment}
              </button>
            </form>
          </div>
        </header>

        <nav className={styles.archiveTabs} aria-label="Состояние товаров">
          {(["active", "archive"] as const).map((view) => <button key={view} type="button" className={listView === view ? styles.primaryButton : styles.secondaryButton} aria-pressed={listView === view} onClick={() => { setListView(view); setSelectedIds([]); setActiveEditorial("all"); }}>{view === "active" ? "Товары" : "Архив"}</button>)}
        </nav>
        <section className={styles.controls} aria-label="Фильтры каталога">
          <aside className={styles.sidebar}>
            <p className={styles.controlLabel}>{copy.workspaceLabel}</p>
            <div className={styles.workspaceNav}>
              {(Object.keys(copy.workspaceTabs) as WorkspaceMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`${styles.workspaceButton} ${
                    workspaceMode === mode ? styles.workspaceButtonActive : ""
                  }`}
                  onClick={() => { setSelectedIds([]); setWorkspaceMode(mode); }}
                >
                  {copy.workspaceTabs[mode]}
                </button>
              ))}
            </div>
          </aside>

          <div className={styles.controlsMain}>
            <div className={styles.searchBlock}>
              <label htmlFor="staff-search" className={styles.controlLabel}>
                {copy.search}
              </label>
              <input
                id="staff-search"
                type="search"
                value={searchValue}
                onChange={(event) => { setSelectedIds([]); setSearchValue(event.target.value); }}
                className={styles.searchInput}
                placeholder={copy.searchPlaceholder}
              />
            </div>

            <div className={styles.filtersGrid}>
              <div className={styles.filtersBlock}>
                <p className={styles.controlLabel}>{copy.statusLabel}</p>
                <div className={styles.filterRow}>
                  {(Object.keys(copy.statusTabs) as ProductStatus[]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`${styles.filterChip} ${
                        activeStatus === status ? styles.filterChipActive : ""
                      }`}
                      onClick={() => { setSelectedIds([]); setActiveStatus(status); }}
                    >
                      {copy.statusTabs[status]}
                    </button>
                  ))}
                </div>
              </div>

              {listView !== "archive" && <div className={styles.filtersBlock}>
                <p className={styles.controlLabel}>{copy.editorialLabel}</p>
                <div className={styles.filterRow}>
                  {(Object.keys(copy.editorialTabs) as EditorialFilter[]).filter((state) => state !== "archived").map((state) => (
                    <button
                      key={state}
                      type="button"
                      className={`${styles.filterChip} ${
                        activeEditorial === state ? styles.filterChipActive : ""
                      }`}
                      onClick={() => { setSelectedIds([]); setActiveEditorial(state); }}
                    >
                      {copy.editorialTabs[state]}
                    </button>
                  ))}
                </div>
              </div>}
            </div>
          </div>

          <div className={styles.sortBlock}>
            <span className={styles.controlLabel}>
              {copy.sortLabel}
            </span>
            <div className={styles.sortMenu} ref={sortMenuRef}>
              <button
                type="button"
                className={styles.sortMenuButton}
                aria-haspopup="listbox"
                aria-expanded={sortMenuOpen}
                onClick={() => setSortMenuOpen((current) => !current)}
              >
                <span>{copy.sort[sortMode]}</span>
                <span
                  className={`${styles.sortMenuChevron} ${
                    sortMenuOpen ? styles.sortMenuChevronOpen : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {sortMenuOpen ? (
                <div className={styles.sortMenuList} role="listbox" aria-label={copy.sortLabel}>
                  {(Object.keys(copy.sort) as SortMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      role="option"
                      aria-selected={sortMode === mode}
                      className={`${styles.sortMenuOption} ${
                        sortMode === mode ? styles.sortMenuOptionActive : ""
                      }`}
                      onClick={() => {
                        setSortMode(mode);
                        setSortMenuOpen(false);
                      }}
                    >
                      {copy.sort[mode]}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className={styles.listSection} aria-label="Кабинет">
          <div className={styles.listToolbar}>
            <button
              type="button"
              className={styles.selectAllButton}
              onClick={toggleAllVisible}
            >
              {allVisibleSelected ? "Снять видимые" : "Выбрать видимые"}
            </button>

            <p className={styles.resultsCount}>
              {filteredProducts.length} {getCountLabel(filteredProducts.length)}
            </p>

            <div className={styles.bulkActions}>
              <span className={styles.selectedCount}>{copy.selected(selectedCount)}</span>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={archiveSelected}
                disabled={
                  selectedCount === 0 ||
                  isArchiving ||
                  isDeleting ||
                  Boolean(pendingNavigationLabel)
                }
              >
                {isArchiving ? "Выполняем…" : listView === "archive" ? "Восстановить" : copy.quickActions.archive}
              </button>
              {listView !== "archive" && <button
                type="button"
                className={styles.secondaryButtonDanger}
                onClick={openDeleteModal}
                disabled={
                  selectedCount === 0 ||
                  isArchiving ||
                  isDeleting ||
                  Boolean(pendingNavigationLabel)
                }
              >
                {copy.quickActions.delete}
              </button>}
            </div>
          </div>


          {filteredProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>{copy.empty}</p>
            </div>
          ) : (
            <div className={styles.listGroups}>
              {activeProducts.length > 0 ? (
                <ul className={styles.list}>{activeProducts.map(renderProductRow)}</ul>
              ) : null}

              {archivedProducts.length > 0 ? (
                <section className={styles.archiveSection} aria-label={copy.archiveSection}>
                  <div className={styles.archiveHeader}>
                    <span className={styles.archiveLabel}>{copy.archiveSection}</span>
                    <span className={styles.archiveCount}>
                      {archivedProducts.length} {getCountLabel(archivedProducts.length)}
                    </span>
                  </div>
                  <ul className={styles.list}>{archivedProducts.map(renderProductRow)}</ul>
                </section>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
