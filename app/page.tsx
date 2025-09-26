"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"
import { DownloadManager } from "@/components/download-manager"
import { ProgressTracker, useProgressTracker } from "@/components/progress-tracker"
import { Footer } from "@/components/footer"

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

export default function HomePage() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const progressTracker = useProgressTracker()

  const handleDownloadStart = (downloadData: Omit<DownloadItem, "id" | "createdAt">) => {
    const newDownload: DownloadItem = {
      ...downloadData,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setDownloads((prev) => [newDownload, ...prev])

    const progressId = progressTracker.addItem({
      title: downloadData.title,
      status: "processing",
      progress: 0,
      speed: "2.5 MB/s",
      eta: "30s",
    })

    // Simulate download progress with progress tracking
    const interval = setInterval(() => {
      setDownloads((prev) => {
        const download = prev.find((d) => d.id === newDownload.id)
        if (!download || download.status !== "downloading") {
          clearInterval(interval)
          return prev
        }

        const newProgress = Math.min(download.progress + Math.random() * 10, 100)

        // Update progress tracker
        progressTracker.updateItem(progressId, {
          progress: newProgress,
          speed: `${(Math.random() * 3 + 1).toFixed(1)} MB/s`,
          eta: `${Math.max(1, Math.round((100 - newProgress) / 3))}s`,
        })

        if (newProgress >= 100) {
          clearInterval(interval)
          progressTracker.completeItem(progressId)
          return prev.map((d) =>
            d.id === newDownload.id ? { ...d, progress: 100, status: "completed", downloadUrl: "#" } : d,
          )
        }

        return prev.map((d) => (d.id === newDownload.id ? { ...d, progress: newProgress } : d))
      })
    }, 500)
  }

  const handleProgressPause = (id: string) => {
    progressTracker.pauseItem(id)
    // Also pause the corresponding download
    setDownloads((prev) => prev.map((d) => (d.createdAt.getTime().toString() === id ? { ...d, status: "paused" } : d)))
  }

  const handleProgressResume = (id: string) => {
    progressTracker.resumeItem(id)
    // Also resume the corresponding download
    setDownloads((prev) =>
      prev.map((d) => (d.createdAt.getTime().toString() === id ? { ...d, status: "downloading" } : d)),
    )
  }

  const handleProgressCancel = (id: string) => {
    progressTracker.removeItem(id)
    // Also remove the corresponding download
    setDownloads((prev) => prev.filter((d) => d.createdAt.getTime().toString() !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero onDownloadStart={handleDownloadStart} />

        {progressTracker.items.length > 0 && (
          <section className="py-12">
            <div className="container max-w-screen-xl">
              <ProgressTracker
                items={progressTracker.items}
                onPause={handleProgressPause}
                onResume={handleProgressResume}
                onCancel={handleProgressCancel}
              />
            </div>
          </section>
        )}

        {downloads.length > 0 && (
          <section className="py-12">
            <div className="container max-w-screen-xl">
              <DownloadManager />
            </div>
          </section>
        )}

        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}
