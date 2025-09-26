"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Music, Video, Download, Loader2, AlertCircle, CheckCircle, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { convertVideo, getVideoInfo, isValidYouTubeUrl } from "@/lib/api"
import { videoStorage } from "@/lib/indexeddb-storage"

type ConversionStatus = "idle" | "fetching-info" | "processing" | "completed" | "error"
type FormatType = "mp3" | "mp4"

interface ConversionResult {
  title: string
  thumbnail: string
  duration: string
  downloadUrl: string
  fileSize: string
}

interface ConverterFormProps {
  onDownloadStart?: (download: {
    title: string
    format: FormatType
    quality: string
    fileSize: string
    thumbnail: string
    duration: string
    status: "downloading"
    progress: number
  }) => void
}

export function ConverterForm({ onDownloadStart }: ConverterFormProps) {
  const [url, setUrl] = useState("")
  const [format, setFormat] = useState<FormatType>("mp3")
  const [quality, setQuality] = useState("320")
  const [status, setStatus] = useState<ConversionStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [error, setError] = useState("")
  const [videoInfo, setVideoInfo] = useState<any>(null)

  const handleConvert = async () => {
    if (!url.trim()) {
      setError("Please enter a valid YouTube URL")
      return
    }

    if (!isValidYouTubeUrl(url)) {
      setError("Please enter a valid YouTube URL")
      return
    }

    setStatus("fetching-info")
    setError("")
    setProgress(0)

    try {
      // First, get video information
      const videoInfoResponse = await getVideoInfo(url)
      if (!videoInfoResponse.success || !videoInfoResponse.data) {
        throw new Error(videoInfoResponse.error || "Failed to fetch video info")
      }

      setVideoInfo(videoInfoResponse.data)
      setStatus("processing")

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + Math.random() * 15
        })
      }, 200)

      // Convert video
      const convertResponse = await convertVideo({ url, format, quality })
      clearInterval(progressInterval)
      setProgress(100)

      if (!convertResponse.success || !convertResponse.data) {
        throw new Error(convertResponse.error || "Conversion failed")
      }

      console.log("[v0] Storing file in IndexedDB...")

      // Convert base64 back to blob
      const binaryString = atob(convertResponse.data.blobData)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const blob = new Blob([bytes], {
        type: format === "mp3" ? "audio/mpeg" : "video/mp4",
      })

      // Extract file ID from download URL
      const fileId = convertResponse.data.downloadUrl.split("/").pop()
      if (fileId) {
        await videoStorage.storeFile({
          id: fileId,
          filename: convertResponse.data.filename,
          blob,
          metadata: {
            title: convertResponse.data.title,
            format,
            quality,
            fileSize: convertResponse.data.fileSize,
            thumbnail: convertResponse.data.thumbnail,
            duration: convertResponse.data.duration,
            createdAt: Date.now(),
          },
        })
        console.log("[v0] File stored successfully in IndexedDB:", fileId)
      }

      const conversionResult = {
        title: convertResponse.data.title,
        thumbnail: convertResponse.data.thumbnail,
        duration: convertResponse.data.duration,
        downloadUrl: convertResponse.data.downloadUrl,
        fileSize: convertResponse.data.fileSize,
      }

      setResult(conversionResult)
      setStatus("completed")

      if (onDownloadStart) {
        onDownloadStart({
          title: conversionResult.title,
          format,
          quality,
          fileSize: conversionResult.fileSize,
          thumbnail: conversionResult.thumbnail,
          duration: conversionResult.duration,
          status: "downloading",
          progress: 0,
        })
      }
    } catch (err) {
      console.error("[v0] Conversion error:", err)
      setStatus("error")
      setError(err instanceof Error ? err.message : "Failed to convert video. Please try again.")
    }
  }

  const resetForm = () => {
    setStatus("idle")
    setProgress(0)
    setResult(null)
    setError("")
    setVideoInfo(null)
    setUrl("")
  }

  const handleDownload = async () => {
    if (!result) return

    try {
      // Extract file ID from download URL
      const fileId = result.downloadUrl.split("/").pop()
      if (!fileId) {
        throw new Error("Invalid download URL")
      }

      console.log("[v0] Starting download from IndexedDB for file:", fileId)

      // Get file from IndexedDB
      const storedFile = await videoStorage.getFile(fileId)
      if (!storedFile) {
        throw new Error("File not found in storage")
      }

      console.log("[v0] File retrieved from IndexedDB:", storedFile.filename)

      // Create download link with blob URL
      const blobUrl = URL.createObjectURL(storedFile.blob)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = storedFile.filename
      link.style.display = "none"

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up blob URL after a short delay
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl)
        console.log("[v0] Blob URL cleaned up")
      }, 1000)

      console.log("[v0] Download initiated successfully")
    } catch (error) {
      console.error("[v0] Download error:", error)
      setError("Failed to start download. Please try again.")
    }
  }

  return (
    <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur border-border/50">
      <CardContent className="p-0 space-y-4 sm:space-y-6">
        {/* URL Input */}
        <div className="space-y-2">
          <Input
            placeholder="Paste YouTube URL here... (e.g., https://youtube.com/watch?v=...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="text-sm sm:text-base h-11 sm:h-12"
            disabled={status === "processing" || status === "fetching-info"}
          />
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {videoInfo && status !== "completed" && (
          <div className="p-3 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Info className="h-4 w-4" />
              <span>Video detected</span>
            </div>
            <div className="flex gap-3">
              <img
                src={videoInfo.thumbnail || "/placeholder.svg?height=60&width=80&query=youtube video thumbnail"}
                alt="Video thumbnail"
                className="w-16 sm:w-20 h-12 sm:h-15 object-cover rounded flex-shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/youtube-thumbnail.png"
                }}
              />
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="font-medium text-sm line-clamp-2 break-words">{videoInfo.title}</h4>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                  <span className="truncate max-w-24 sm:max-w-none">{videoInfo.channel}</span>
                  <span>{videoInfo.duration}</span>
                  <span className="hidden sm:inline">{videoInfo.views} views</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Format</label>
            <Select
              value={format}
              onValueChange={(value: FormatType) => setFormat(value)}
              disabled={status === "processing" || status === "fetching-info"}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mp3">
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    <span>MP3 Audio</span>
                  </div>
                </SelectItem>
                <SelectItem value="mp4">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    <span>MP4 Video</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quality</label>
            <Select
              value={quality}
              onValueChange={setQuality}
              disabled={status === "processing" || status === "fetching-info"}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {format === "mp3" ? (
                  <>
                    <SelectItem value="128">128 kbps</SelectItem>
                    <SelectItem value="192">192 kbps</SelectItem>
                    <SelectItem value="320">320 kbps (Best)</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="360">360p</SelectItem>
                    <SelectItem value="720">720p HD</SelectItem>
                    <SelectItem value="1080">1080p Full HD</SelectItem>
                    <SelectItem value="4k">4K Ultra HD</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Convert Button */}
        <Button
          onClick={handleConvert}
          disabled={status === "processing" || status === "fetching-info" || !url.trim()}
          className="w-full h-12 text-sm sm:text-base font-medium"
          size="lg"
        >
          {status === "fetching-info" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting video info...
            </>
          ) : status === "processing" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Converting... {Math.round(progress)}%
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Convert to {format.toUpperCase()}
            </>
          )}
        </Button>

        {/* Progress Bar */}
        {status === "processing" && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Converting your video...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {status === "completed" && result && (
          <div className="space-y-4 p-3 sm:p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium text-sm sm:text-base">Conversion completed!</span>
            </div>

            <div className="flex gap-3 sm:gap-4">
              <img
                src={result.thumbnail || "/placeholder.svg?height=75&width=100&query=youtube video thumbnail"}
                alt="Video thumbnail"
                className="w-20 sm:w-24 h-15 sm:h-18 object-cover rounded flex-shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/youtube-thumbnail.png"
                }}
              />
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="font-medium text-sm line-clamp-2 break-words">{result.title}</h4>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                  <span>Duration: {result.duration}</span>
                  <span>Size: {result.fileSize}</span>
                  <Badge variant="secondary" className="text-xs">
                    {format.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleDownload} className="flex-1 h-11">
                <Download className="mr-2 h-4 w-4" />
                Download File
              </Button>
              <Button variant="outline" onClick={resetForm} className="h-11 bg-transparent">
                Convert Another
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground pt-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <Music className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>MP3 Audio</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Video className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>MP4 Video</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Fast & Free</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
