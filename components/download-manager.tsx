"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Download, Trash2, Play, Pause, RotateCcw, FileAudio, FileVideo } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DownloadItem {
  id: string
  title: string
  format: "mp3" | "mp4"
  quality: string
  fileSize: string
  status: "downloading" | "completed" | "failed" | "paused"
  progress: number
  downloadUrl?: string
  thumbnail: string
  duration: string
  createdAt: Date
}

export function DownloadManager() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [activeDownloads, setActiveDownloads] = useState(0)

  // Load downloads from localStorage on mount
  useEffect(() => {
    const savedDownloads = localStorage.getItem("yt-converter-downloads")
    if (savedDownloads) {
      setDownloads(JSON.parse(savedDownloads))
    }
  }, [])

  // Save downloads to localStorage whenever downloads change
  useEffect(() => {
    localStorage.setItem("yt-converter-downloads", JSON.stringify(downloads))
    setActiveDownloads(downloads.filter((d) => d.status === "downloading").length)
  }, [downloads])

  const addDownload = (item: Omit<DownloadItem, "id" | "createdAt">) => {
    const newDownload: DownloadItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setDownloads((prev) => [newDownload, ...prev])
    return newDownload.id
  }

  const updateDownload = (id: string, updates: Partial<DownloadItem>) => {
    setDownloads((prev) => prev.map((download) => (download.id === id ? { ...download, ...updates } : download)))
  }

  const removeDownload = (id: string) => {
    setDownloads((prev) => prev.filter((download) => download.id !== id))
  }

  const pauseDownload = (id: string) => {
    updateDownload(id, { status: "paused" })
  }

  const resumeDownload = (id: string) => {
    updateDownload(id, { status: "downloading" })
    // Simulate download progress
    simulateDownload(id)
  }

  const retryDownload = (id: string) => {
    updateDownload(id, { status: "downloading", progress: 0 })
    simulateDownload(id)
  }

  const simulateDownload = (id: string) => {
    const interval = setInterval(() => {
      setDownloads((prev) => {
        const download = prev.find((d) => d.id === id)
        if (!download || download.status !== "downloading") {
          clearInterval(interval)
          return prev
        }

        const newProgress = Math.min(download.progress + Math.random() * 10, 100)

        if (newProgress >= 100) {
          clearInterval(interval)
          return prev.map((d) => (d.id === id ? { ...d, progress: 100, status: "completed", downloadUrl: "#" } : d))
        }

        return prev.map((d) => (d.id === id ? { ...d, progress: newProgress } : d))
      })
    }, 500)
  }

  const clearCompleted = () => {
    setDownloads((prev) => prev.filter((download) => download.status !== "completed"))
  }

  const formatFileSize = (size: string) => size
  const formatDuration = (duration: string) => duration

  if (downloads.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Download className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">No downloads yet</h3>
              <p className="text-muted-foreground">
                Your converted files will appear here. Start by converting a YouTube video above.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Downloads ({downloads.length})
        </CardTitle>
        <div className="flex items-center gap-2">
          {activeDownloads > 0 && <Badge variant="secondary">{activeDownloads} active</Badge>}
          <Button
            variant="outline"
            size="sm"
            onClick={clearCompleted}
            disabled={!downloads.some((d) => d.status === "completed")}
          >
            Clear Completed
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {downloads.map((download) => (
          <div key={download.id} className="flex items-center gap-4 p-4 border rounded-lg bg-card/50">
            {/* Thumbnail */}
            <div className="relative">
              <img
                src={download.thumbnail || "/placeholder.svg"}
                alt="Video thumbnail"
                className="w-16 h-12 object-cover rounded"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                {download.format === "mp3" ? (
                  <FileAudio className="h-6 w-6 text-white drop-shadow-lg" />
                ) : (
                  <FileVideo className="h-6 w-6 text-white drop-shadow-lg" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium text-sm line-clamp-1">{download.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {download.format.toUpperCase()}
                    </Badge>
                    <span>{download.quality}</span>
                    <span>{formatFileSize(download.fileSize)}</span>
                    <span>{formatDuration(download.duration)}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <Badge
                  variant={
                    download.status === "completed"
                      ? "default"
                      : download.status === "failed"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {download.status}
                </Badge>
              </div>

              {/* Progress Bar */}
              {(download.status === "downloading" || download.status === "paused") && (
                <div className="space-y-1">
                  <Progress value={download.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{download.status === "paused" ? "Paused" : "Downloading..."}</span>
                    <span>{Math.round(download.progress)}%</span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {download.status === "failed" && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-xs">Download failed. Please try again.</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {download.status === "completed" && download.downloadUrl && (
                <Button size="sm" asChild>
                  <a href={download.downloadUrl} download>
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              )}

              {download.status === "downloading" && (
                <Button size="sm" variant="outline" onClick={() => pauseDownload(download.id)}>
                  <Pause className="h-4 w-4" />
                </Button>
              )}

              {download.status === "paused" && (
                <Button size="sm" variant="outline" onClick={() => resumeDownload(download.id)}>
                  <Play className="h-4 w-4" />
                </Button>
              )}

              {download.status === "failed" && (
                <Button size="sm" variant="outline" onClick={() => retryDownload(download.id)}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}

              <Button size="sm" variant="ghost" onClick={() => removeDownload(download.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Export the hook for other components to use
export function useDownloadManager() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([])

  const addDownload = (item: Omit<DownloadItem, "id" | "createdAt">) => {
    const newDownload: DownloadItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setDownloads((prev) => [newDownload, ...prev])
    return newDownload.id
  }

  return { downloads, addDownload }
}
