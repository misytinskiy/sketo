const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
type ProductType = "coffee" | "equipment";

function isRemoteUrl(path: string) {
  return /^https?:\/\//i.test(path);
}

function isDataUrl(path: string) {
  return /^data:/i.test(path);
}

function encodeStoragePath(path: string) {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function buildPublicStorageUrl(bucket: string, path: string) {
  if (!supabaseUrl) {
    return path;
  }

  const base = supabaseUrl.replace(/\/+$/, "");
  return `${base}/storage/v1/object/public/${bucket}/${encodeStoragePath(path)}`;
}

function stripLeadingSlash(path: string) {
  return path.replace(/^\/+/, "");
}

export function getStorageBucketName(type: ProductType) {
  return type === "coffee" ? "catalog" : "equipment";
}

export function normalizeStorageObjectPath(type: ProductType, path: string) {
  const normalized = stripLeadingSlash(path);

  if (type === "coffee") {
    return normalized.replace(/^photo\/catalog\//i, "");
  }

  return normalized.replace(/^photo\/techCatalog\//i, "");
}

export function resolveCoffeeStorageUrl(path: string) {
  if (!path || isRemoteUrl(path) || isDataUrl(path)) {
    return path;
  }

  const normalized = normalizeStorageObjectPath("coffee", path);

  return normalized ? buildPublicStorageUrl("catalog", normalized) : path;
}

export function resolveEquipmentStorageUrl(path: string) {
  if (!path || isRemoteUrl(path) || isDataUrl(path)) {
    return path;
  }

  const normalized = normalizeStorageObjectPath("equipment", path);

  return normalized ? buildPublicStorageUrl("equipment", normalized) : path;
}
