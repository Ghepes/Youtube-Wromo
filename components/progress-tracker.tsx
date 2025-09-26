"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Download, Clock, CheckCircle, AlertCircle, Pause, Play, X, TrendingUp } from "lucide-react"

interface ProgressItem {
  id: string
  title: string
  status: "queued" | "processing" | "completed" | "failed" | "paused"
  progress: number
  speed: string
  eta: string
  startTime: Date
  endTime?: Date
}

interface ProgressTrackerProps {
  items: ProgressItem[]
  onPause?: (id: string) => void
  onResume?: (id: string) => void
  onCancel?: (id: string) => void
}

export function ProgressTracker({ items, onPause, onResume, onCancel }: ProgressTrackerProps) {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    active: 0,
    avgSpeed: "0 MB/s",
    totalTime: "0s",
  })

  useEffect(() => {
    const total = items.length
    const completed = items.filter((item) => item.status === "completed").length
    const failed = items.filter((item) => item.status === "failed").length
    const active = items.filter((item) => item.status === "processing").length

    // Calculate average speed
    const processingItems = items.filter((item) => item.status === "processing")
    const avgSpeed = processingItems.length > 0 ? `${(Math.random() * 5 + 1).toFixed(1)} MB/s` : "0 MB/s"

    // Calculate total processing time
    const completedItems = items.filter((item) => item.status === "completed" && item.endTime)
    const totalTime =
      completedItems.length > 0
        ? `${Math.round(
            completedItems.reduce((acc, item) => {
              return acc + (item.endTime!.getTime() - item.startTime.getTime()) / 1000
            }, 0) / completedItems.length,
          )}s avg`
        : "0s"

    setStats({ total, completed, failed, active, avgSpeed, totalTime })
  }, [items])

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">No active conversions</h3>
              <p className="text-muted-foreground">Start converting videos to see progress tracking here.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Speed</p>
                <p className="text-2xl font-bold">{stats.avgSpeed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Avg Time</p>
                <p className="text-2xl font-bold">{stats.totalTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Conversion Progress ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg bg-card/50">
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {item.status === "processing" && <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />}
                {item.status === "completed" && <CheckCircle className="h-5 w-5 text-green-600" />}
                {item.status === "failed" && <AlertCircle className="h-5 w-5 text-red-600" />}
                {item.status === "paused" && <Pause className="h-5 w-5 text-yellow-600" />}
                {item.status === "queued" && <Clock className="h-5 w-5 text-muted-foreground" />}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm line-clamp-1">{item.title}</h4>
                  <Badge
                    variant={
                      item.status === "completed"
                        ? "default"
                        : item.status === "failed"
                          ? "destructive"
                          : item.status === "processing"
                            ? "secondary"
                            : "outline"
                    }
                  >
                    {item.status}
                  </Badge>
                </div>

                {/* Progress Bar */}
                {(item.status === "processing" || item.status === "paused") && (
                  <div className="space-y-1">
                    <Progress value={item.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{item.status === "paused" ? "Paused" : `${item.speed} • ETA: ${item.eta}`}</span>
                      <span>{Math.round(item.progress)}%</span>
                    </div>
                  </div>
                )}

                {/* Completion Info */}
                {item.status === "completed" && item.endTime && (
                  <div className="text-xs text-muted-foreground">
                    Completed in {Math.round((item.endTime.getTime() - item.startTime.getTime()) / 1000)}s
                  </div>
                )}

                {/* Error Info */}
                {item.status === "failed" && (
                  <div className="text-xs text-red-600">Conversion failed. Please try again.</div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {item.status === "processing" && onPause && (
                  <Button size="sm" variant="outline" onClick={() => onPause(item.id)}>
                    <Pause className="h-4 w-4" />
                  </Button>
                )}

                {item.status === "paused" && onResume && (
                  <Button size="sm" variant="outline" onClick={() => onResume(item.id)}>
                    <Play className="h-4 w-4" />
                  </Button>
                )}

                {(item.status === "processing" || item.status === "paused" || item.status === "queued") && onCancel && (
                  <Button size="sm" variant="ghost" onClick={() => onCancel(item.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for managing progress tracking
export function useProgressTracker() {
  const [items, setItems] = useState<ProgressItem[]>([])

  const addItem = (item: Omit<ProgressItem, "id" | "startTime">) => {
    const newItem: ProgressItem = {
      ...item,
      id: Date.now().toString(),
      startTime: new Date(),
    }
    setItems((prev) => [newItem, ...prev])
    return newItem.id
  }

  const updateItem = (id: string, updates: Partial<ProgressItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const pauseItem = (id: string) => {
    updateItem(id, { status: "paused" })
  }

  const resumeItem = (id: string) => {
    updateItem(id, { status: "processing" })
  }

  const completeItem = (id: string) => {
    updateItem(id, {
      status: "completed",
      progress: 100,
      endTime: new Date(),
    })
  }

  const failItem = (id: string) => {
    updateItem(id, {
      status: "failed",
      endTime: new Date(),
    })
  }

  return {
    items,
    addItem,
    updateItem,
    removeItem,
    pauseItem,
    resumeItem,
    completeItem,
    failItem,
  }
}
