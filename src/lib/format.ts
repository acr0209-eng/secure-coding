export function formatPrice(price: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function coerceText(value: FormDataEntryValue | null, maxLength: number) {
  return String(value ?? "")
    .trim()
    .slice(0, maxLength);
}

export function coercePrice(value: FormDataEntryValue | null) {
  const price = Number(String(value ?? "").replace(/[^\d]/g, ""));

  if (!Number.isSafeInteger(price) || price < 0 || price > 100_000_000) {
    return null;
  }

  return price;
}
