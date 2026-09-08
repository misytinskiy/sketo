const transliteration: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};
export function suggestProductSlug(title: string) {
  return [...title.toLowerCase()].map((letter) => transliteration[letter] ?? letter).join("")
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80).replace(/-$/, "");
}
export function validateProductFields(data: FormData, kind: "coffee" | "equipment", published: boolean) {
  const errors: Record<string, string> = {};
  const value = (key: string) => String(data.get(key) ?? "").trim();
  const slug = data.has("newSlug") ? value("newSlug") : value("slug");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80 || (kind === "coffee" && slug === "equipment")) errors.newSlug = "Укажите свободный адрес: латинские строчные буквы, цифры и дефисы, до 80 символов.";
  if (published) {
    if (!value("titleRu")) errors.titleRu = "Введите название на русском.";
    if (!value("descriptionRu")) errors.descriptionRu = "Добавьте описание на русском.";
  }
  if (!["in_stock", "out_of_stock", "preorder"].includes(value("status"))) errors.status = "Выберите наличие товара.";
  if (kind === "equipment") {
    if (!["la-marzocco", "mahlkonig", "anfim", "mazzer", "balenare", "allround", "victoria-arduino"].includes(value("brand"))) errors.brand = "Укажите поддерживаемый бренд оборудования.";
    if (!["grinder", "espresso-machine"].includes(value("equipmentType"))) errors.equipmentType = "Выберите тип оборудования.";
  }
  return errors;
}
