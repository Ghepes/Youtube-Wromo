import { type NextRequest, NextResponse } from "next/server"

interface ConvertRequest {
  url: string
  format: "mp3" | "mp4"
  quality: string
}

interface VideoInfo {
  title: string
  duration: string
  thumbnail: string
  fileSize: string
}

function extractVideoId(url: string): string | null {
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

async function getVideoInfo(url: string): Promise<VideoInfo> {
  const videoId = extractVideoId(url)
  if (!videoId) {
    throw new Error("Invalid YouTube URL")
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Generate consistent mock data based on video ID
  const mockVideos = [
    {
      title: "How to Build Amazing Web Applications",
      duration: "12:34",
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    },
    {
      title: "Complete JavaScript Tutorial for Beginners",
      duration: "45:12",
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    },
    {
      title: "React vs Vue: Which Framework to Choose?",
      duration: "18:45",
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    },
    {
      title: "10 CSS Tricks Every Developer Should Know",
      duration: "8:23",
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    },
  ]

  const index = videoId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % mockVideos.length
  const selectedVideo = mockVideos[index]

  return {
    title: selectedVideo.title,
    duration: selectedVideo.duration,
    thumbnail: selectedVideo.thumbnail,
    fileSize: "25.8 MB",
  }
}

// Mock function to simulate video conversion
async function convertVideo(url: string, format: "mp3" | "mp4", quality: string): Promise<string> {
  // In a real implementation, you would use ffmpeg or similar tools
  // For demo purposes, we'll simulate the conversion process
  await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate conversion time

  // Return a mock download URL
  return `/api/download/${Date.now()}.${format}`
}

export async function POST(request: NextRequest) {
  try {
    const body: ConvertRequest = await request.json()
    const { url, format, quality } = body

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

    const videoInfo = await getVideoInfo(url)

    // Start conversion process
    const downloadUrl = await convertVideo(url, format, quality)

    // Calculate estimated file size based on format and quality
    let estimatedSize = "5.2 MB"
    if (format === "mp4") {
      switch (quality) {
        case "360":
          estimatedSize = "15.3 MB"
          break
        case "720":
          estimatedSize = "45.7 MB"
          break
        case "1080":
          estimatedSize = "89.2 MB"
          break
        case "4k":
          estimatedSize = "256.8 MB"
          break
        default:
          estimatedSize = "25.8 MB"
      }
    } else {
      switch (quality) {
        case "128":
          estimatedSize = "3.1 MB"
          break
        case "192":
          estimatedSize = "4.6 MB"
          break
        case "320":
          estimatedSize = "7.8 MB"
          break
        default:
          estimatedSize = "5.2 MB"
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        title: videoInfo.title,
        duration: videoInfo.duration,
        thumbnail: videoInfo.thumbnail,
        downloadUrl,
        fileSize: estimatedSize,
        format,
        quality,
      },
    })
  } catch (error) {
    console.error("Conversion error:", error)
    return NextResponse.json({ error: "Internal server error during conversion" }, { status: 500 })
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
