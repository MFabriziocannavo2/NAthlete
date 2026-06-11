/** Returns true if the given string is an http or https URL. */
export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

/**
 * Returns a safe href for user-supplied URLs: the URL itself if it is
 * http(s), or "#" otherwise (blocks javascript:, data:, etc.).
 */
export function toSafeHref(value?: string | null): string {
  if (!value) return "#"
  return isHttpUrl(value) ? value : "#"
}
