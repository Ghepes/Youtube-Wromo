import { type NextRequest, NextResponse } from "next/server"

interface VideoInfoRequest {
  url: string
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

async function fetchVideoInfo(videoId: string) {
  // In a real implementation, you would use YouTube Data API v3
  // For now, we'll generate realistic mock data based on the video ID

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Generate different mock data based on video ID to simulate real videos
  const mockVideos = [
    {
      title: "How to Build Amazing Web Applications",
      channel: "WebDev Pro",
      duration: "12:34",
      views: "2,456,789",
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    },
    {
      title: "Complete JavaScript Tutorial for Beginners",
      channel: "CodeMaster",
      duration: "45:12",
      views: "5,234,567",
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    },
    {
      title: "React vs Vue: Which Framework to Choose?",
      channel: "TechReview",
      duration: "18:45",
      views: "1,876,543",
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    },
    {
      title: "10 CSS Tricks Every Developer Should Know",
      channel: "DesignGuru",
      duration: "8:23",
      views: "987,654",
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    },
  ]

  // Use video ID to consistently return the same mock data for the same video
  const index = videoId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % mockVideos.length
  const selectedVideo = mockVideos[index]

  return {
    id: videoId,
    title: selectedVideo.title,
    description: `This is an amazing video about ${selectedVideo.title.toLowerCase()}...`,
    duration: selectedVideo.duration,
    thumbnail: selectedVideo.thumbnail,
    channel: selectedVideo.channel,
    views: selectedVideo.views,
    uploadDate: "2024-01-15",
    availableFormats: {
      audio: ["128", "192", "320"],
      video: ["360", "720", "1080", "4k"],
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: VideoInfoRequest = await request.json()
    const { url } = body

    // Validate input
    if (!url) {
      return NextResponse.json({ error: "Missing required field: url" }, { status: 400 })
    }

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    if (!youtubeRegex.test(url)) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 })
    }

    const videoId = extractVideoId(url)
    if (!videoId) {
      return NextResponse.json({ error: "Could not extract video ID from URL" }, { status: 400 })
    }

    const videoInfo = await fetchVideoInfo(videoId)

    return NextResponse.json({
      success: true,
      data: videoInfo,
    })
  } catch (error) {
    console.error("Video info error:", error)
    return NextResponse.json({ error: "Internal server error while fetching video info" }, { status: 500 })
  }
}
