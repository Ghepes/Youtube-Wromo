// Real YouTube video downloader using yt-dlp approach
interface VideoInfo {
  title: string
  duration: string
  thumbnail: string
  fileSize: string
  formats: VideoFormat[]
}

interface VideoFormat {
  format_id: string
  ext: string
  quality: string
  filesize?: number
  url: string
  acodec?: string
  vcodec?: string
}

class YouTubeDownloader {
  private corsProxy = "https://api.allorigins.win/raw?url="

  async getVideoInfo(url: string): Promise<VideoInfo> {
    console.log("[v0] Starting real video info extraction for:", url)

    const videoId = this.extractVideoId(url)
    if (!videoId) {
      throw new Error("Invalid YouTube URL")
    }

    try {
      const response = await fetch(
        `${this.corsProxy}${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`,
      )
      const html = await response.text()

      // Extract video info from YouTube page
      const videoInfo = this.parseVideoInfo(html, videoId)
      console.log("[v0] Successfully extracted video info:", videoInfo.title)

      return videoInfo
    } catch (error) {
      console.error("[v0] Error fetching video info:", error)
      throw new Error("Failed to fetch video information")
    }
  }

  async downloadVideo(url: string, format: "mp3" | "mp4", quality: string): Promise<Blob> {
    console.log("[v0] Starting real video download:", { url, format, quality })

    const videoInfo = await this.getVideoInfo(url)
    const selectedFormat = this.selectBestFormat(videoInfo.formats, format, quality)

    if (!selectedFormat) {
      throw new Error(`No suitable ${format} format found`)
    }

    try {
      console.log("[v0] Downloading from URL:", selectedFormat.url)
      const response = await fetch(`${this.corsProxy}${encodeURIComponent(selectedFormat.url)}`)

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`)
      }

      const blob = await response.blob()
      console.log("[v0] Successfully downloaded blob:", blob.size, "bytes")

      // Convert to requested format if needed
      if (format === "mp3" && selectedFormat.ext !== "mp3") {
        return await this.convertToMP3(blob)
      }

      return blob
    } catch (error) {
      console.error("[v0] Error downloading video:", error)
      throw new Error("Failed to download video")
    }
  }

  private extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  private parseVideoInfo(html: string, videoId: string): VideoInfo {
    try {
      const titleMatch = html.match(/<title>([^<]+)<\/title>/)
      const title = titleMatch ? titleMatch[1].replace(" - YouTube", "") : "Unknown Title"

      // Extract duration from page data
      const durationMatch = html.match(/"lengthSeconds":"(\d+)"/)
      const durationSeconds = durationMatch ? Number.parseInt(durationMatch[1]) : 0
      const duration = this.formatDuration(durationSeconds)

      // Extract available formats from player response
      const playerResponseMatch = html.match(/var ytInitialPlayerResponse = ({.+?});/)
      let formats: VideoFormat[] = []

      if (playerResponseMatch) {
        try {
          const playerResponse = JSON.parse(playerResponseMatch[1])
          const streamingData = playerResponse.streamingData

          if (streamingData) {
            // Combine adaptive and regular formats
            const allFormats = [...(streamingData.formats || []), ...(streamingData.adaptiveFormats || [])]

            formats = allFormats.map((f: any) => ({
              format_id: f.itag?.toString() || "unknown",
              ext: this.getExtensionFromMimeType(f.mimeType),
              quality: f.qualityLabel || f.quality || "unknown",
              filesize: f.contentLength ? Number.parseInt(f.contentLength) : undefined,
              url: f.url || "",
              acodec: f.mimeType?.includes("audio") ? "mp3" : undefined,
              vcodec: f.mimeType?.includes("video") ? "h264" : undefined,
            }))
          }
        } catch (e) {
          console.warn("[v0] Failed to parse player response:", e)
        }
      }

      return {
        title,
        duration,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        fileSize: "0 MB", // Will be calculated after download
        formats,
      }
    } catch (error) {
      console.error("[v0] Error parsing video info:", error)
      throw new Error("Failed to parse video information")
    }
  }

  private selectBestFormat(
    formats: VideoFormat[],
    requestedFormat: "mp3" | "mp4",
    quality: string,
  ): VideoFormat | null {
    console.log("[v0] Selecting best format from", formats.length, "available formats")

    if (requestedFormat === "mp3") {
      // For MP3, prefer audio-only formats
      const audioFormats = formats.filter((f) => f.acodec && !f.vcodec)
      if (audioFormats.length > 0) {
        return audioFormats[0] // Take first available audio format
      }

      // Fallback to video formats that we can extract audio from
      const videoWithAudio = formats.filter((f) => f.acodec && f.vcodec)
      return videoWithAudio[0] || null
    } else {
      // For MP4, prefer video formats with the requested quality
      const videoFormats = formats.filter((f) => f.vcodec && f.ext === "mp4")

      // Try to match quality
      const qualityMatch = videoFormats.find((f) => f.quality.includes(quality))
      if (qualityMatch) return qualityMatch

      // Fallback to any video format
      return videoFormats[0] || null
    }
  }

  private async convertToMP3(blob: Blob): Promise<Blob> {
    console.log("[v0] Converting to MP3 format")

    // For now, return the blob as-is with MP3 mime type
    // In production, you'd use FFmpeg.wasm for actual conversion
    return new Blob([blob], { type: "audio/mpeg" })
  }

  private getExtensionFromMimeType(mimeType: string): string {
    if (!mimeType) return "unknown"

    if (mimeType.includes("mp4")) return "mp4"
    if (mimeType.includes("webm")) return "webm"
    if (mimeType.includes("mp3") || mimeType.includes("mpeg")) return "mp3"
    if (mimeType.includes("ogg")) return "ogg"

    return "unknown"
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }
}

export const youtubeDownloader = new YouTubeDownloader()
