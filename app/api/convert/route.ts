import { type NextRequest, NextResponse } from "next/server"
import { youtubeDownloader } from "@/lib/youtube-downloader"

interface ConvertRequest {
  url: string
  format: "mp3" | "mp4"
  quality: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ConvertRequest = await request.json()
    const { url, format, quality } = body

    console.log("[v0] Starting real conversion request:", { url, format, quality })

    // Validate input
    if (!url || !format || !quality) {
      return NextResponse.json({ error: "Missing required fields: url, format, quality" }, { status: 400 })
    }

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    if (!youtubeRegex.test(url)) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 })
    }

    // Validate format
    if (!["mp3", "mp4"].includes(format)) {
      return NextResponse.json({ error: "Invalid format. Must be 'mp3' or 'mp4'" }, { status: 400 })
    }

    const videoInfo = await youtubeDownloader.getVideoInfo(url)
    console.log("[v0] Got video info:", videoInfo.title)

    const blob = await youtubeDownloader.downloadVideo(url, format, quality)
    console.log("[v0] Downloaded blob size:", blob.size, "bytes")

    // Convert blob to base64 for transmission
    const arrayBuffer = await blob.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")

    // Calculate actual file size
    const fileSizeMB = (blob.size / (1024 * 1024)).toFixed(1)

    // Generate unique file ID
    const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    console.log("[v0] Conversion completed successfully")

    return NextResponse.json({
      success: true,
      data: {
        title: videoInfo.title,
        duration: videoInfo.duration,
        thumbnail: videoInfo.thumbnail,
        downloadUrl: `/api/download/${fileId}`,
        fileSize: `${fileSizeMB} MB`,
        format,
        quality,
        blobData: base64,
        filename: `${videoInfo.title.replace(/[^a-zA-Z0-9\s-]/g, "").trim()}.${format}`,
      },
    })
  } catch (error) {
    console.error("[v0] Conversion error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error during conversion",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "YouTube Converter API",
    endpoints: {
      convert: "POST /api/convert - Convert YouTube video",
      download: "GET /api/download/[filename] - Download converted file",
    },
  })
}
