export type AttributeRow = { id: string; key: string; value: unknown; numeric?: boolean; labels?: Record<string, string> };
export function attributeRows(attributes: Record<string, unknown>): AttributeRow[] {
  return Object.entries(attributes).map(([key, stored], index) => {
    const named = stored && typeof stored === 'object' && '_type' in stored && stored._type === 'localized-attribute' && 'value' in stored && 'labels' in stored;
    const value = named ? stored.value : stored;
    return { id: String(index), key, value, numeric: typeof value === 'number', ...(named ? { labels: stored.labels as Record<string, string> } : {}) };
  });
}
export function serializeAttributeRows(rows: AttributeRow[]) {
  return Object.fromEntries(rows.map(row => [row.key.trim(), row.labels ? { _type: 'localized-attribute', labels: row.labels, value: row.value } : row.value]));
}
export function isTranslated(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).every(key => ['ru', 'en', 'kz'].includes(key))
    && Object.values(value).every(entry => typeof entry === 'string');
}
export function updateAttributeTranslation(value: unknown, locale: string, text: string) {
  return { ...(isTranslated(value) ? value : { ru: String(value ?? ''), en: '', kz: '' }), [locale]: text };
}
