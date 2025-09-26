// API client functions for the frontend

export interface ConvertRequest {
  url: string
  format: "mp3" | "mp4"
  quality: string
}

export interface ConvertResponse {
  success: boolean
  data?: {
    title: string
    duration: string
    thumbnail: string
    downloadUrl: string
    fileSize: string
    format: string
    quality: string
  }
  error?: string
}

export interface VideoInfoResponse {
  success: boolean
  data?: {
    id: string
    title: string
    description: string
    duration: string
    thumbnail: string
    channel: string
    views: string
    uploadDate: string
    availableFormats: {
      audio: string[]
      video: string[]
    }
  }
  error?: string
}

export async function convertVideo(request: ConvertRequest): Promise<ConvertResponse> {
  try {
    const response = await fetch("/api/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Convert API error:", error)
    return {
      success: false,
      error: "Failed to convert video. Please try again.",
    }
  }
}

export async function getVideoInfo(url: string): Promise<VideoInfoResponse> {
  try {
    const response = await fetch("/api/video-info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Video info API error:", error)
    return {
      success: false,
      error: "Failed to fetch video information. Please try again.",
    }
  }
}

export function downloadFile(url: string, filename: string) {
  try {
    const link = document.createElement("a")
    link.href = url
    link.download = filename.replace(/[^a-zA-Z0-9\s.-]/g, "") // Sanitize filename
    link.setAttribute("target", "_blank")
    link.setAttribute("rel", "noopener noreferrer")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    console.log("[v0] File download initiated:", filename)
  } catch (error) {
    console.error("[v0] Download failed:", error)
    throw new Error("Download failed. Please try again.")
  }
}

export function isValidYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
  return youtubeRegex.test(url)
}

export function extractVideoId(url: string): string | null {
  try {
    if (url.includes("youtube.com/watch")) {
      const urlParams = new URLSearchParams(url.split("?")[1])
      return urlParams.get("v")
    } else if (url.includes("youtu.be/")) {
      return url.split("youtu.be/")[1]?.split("?")[0] || null
    }
    return null
  } catch {
    return null
  }
}
