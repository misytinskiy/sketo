export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_UPLOAD_FILES = 10;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export function validateImageFile(file: { size: number; type: string }) {
  if (!IMAGE_TYPES.includes(file.type)) return "Допустимы только JPEG, PNG и WebP.";
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) return "Размер изображения должен быть от 1 байта до 5 МБ.";
  return null;
}
export function matchesImageSignature(bytes: Uint8Array, type: string) {
  if (bytes.length < 12) return false;
  if (type === "image/jpeg") return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (type === "image/png") return [137, 80, 78, 71, 13, 10, 26, 10].every((byte, i) => bytes[i] === byte);
  if (type === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return false;
}
