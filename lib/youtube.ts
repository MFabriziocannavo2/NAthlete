/**
 * Extracts the YouTube video ID from any recognizable YouTube URL format.
 * Returns null if the URL is not a recognizable YouTube link.
 */
export function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)

    if (parsed.pathname.startsWith("/embed/")) {
      return parsed.pathname.split("/embed/")[1] || null
    }

    const isYouTubeHost =
      parsed.hostname === "www.youtube.com" || parsed.hostname === "youtube.com"

    if (isYouTubeHost && parsed.pathname === "/watch") {
      return parsed.searchParams.get("v")
    }

    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1).split("?")[0] || null
    }

    if (isYouTubeHost && parsed.pathname.startsWith("/shorts/")) {
      return parsed.pathname.split("/shorts/")[1] || null
    }

    return null
  } catch {
    return null
  }
}

/**
 * Returns a thumbnail image URL for a YouTube video link.
 * Returns null if the URL is not a recognizable YouTube link.
 */
export function getYouTubeThumbnail(url: string): string | null {
  const videoId = getYouTubeVideoId(url)
  if (!videoId) return null
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

/**
 * Converts any YouTube URL format to an embed URL.
 * Returns null if the URL is not a recognizable YouTube link.
 *
 * Handles:
 *   youtube.com/watch?v=ID
 *   youtu.be/ID
 *   youtube.com/shorts/ID
 *   youtube.com/embed/ID  (already embed, returned as-is)
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)

    // Already an embed URL
    if (parsed.pathname.startsWith("/embed/")) return url

    let videoId: string | null = null

    const isYouTubeHost =
      parsed.hostname === "www.youtube.com" || parsed.hostname === "youtube.com"

    if (isYouTubeHost && parsed.pathname === "/watch") {
      videoId = parsed.searchParams.get("v")
    } else if (parsed.hostname === "youtu.be") {
      videoId = parsed.pathname.slice(1).split("?")[0]
    } else if (isYouTubeHost && parsed.pathname.startsWith("/shorts/")) {
      videoId = parsed.pathname.split("/shorts/")[1]
    }

    if (!videoId) return null

    const embed = new URL(`https://www.youtube.com/embed/${videoId}`)

    // Preserve start time (t=30s → start=30)
    const t = parsed.searchParams.get("t")
    if (t) embed.searchParams.set("start", t.replace("s", ""))

    return embed.toString()
  } catch {
    return null
  }
}
