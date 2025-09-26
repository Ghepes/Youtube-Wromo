"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Download, Clock, Users, Music, Video, Globe, Zap } from "lucide-react"

interface AnalyticsData {
  totalConversions: number
  todayConversions: number
  avgConversionTime: number
  successRate: number
  formatBreakdown: {
    mp3: number
    mp4: number
  }
  qualityBreakdown: {
    [key: string]: number
  }
  hourlyData: Array<{
    hour: string
    conversions: number
  }>
}

const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"]

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalConversions: 1247,
    todayConversions: 89,
    avgConversionTime: 23,
    successRate: 97.8,
    formatBreakdown: {
      mp3: 65,
      mp4: 35,
    },
    qualityBreakdown: {
      "320kbps": 45,
      "720p": 25,
      "1080p": 20,
      "192kbps": 10,
    },
    hourlyData: [
      { hour: "00", conversions: 12 },
      { hour: "04", conversions: 8 },
      { hour: "08", conversions: 25 },
      { hour: "12", conversions: 45 },
      { hour: "16", conversions: 38 },
      { hour: "20", conversions: 32 },
    ],
  })

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalytics((prev) => ({
        ...prev,
        todayConversions: prev.todayConversions + Math.floor(Math.random() * 3),
        totalConversions: prev.totalConversions + Math.floor(Math.random() * 3),
      }))
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const formatData = Object.entries(analytics.formatBreakdown).map(([format, value]) => ({
    name: format.toUpperCase(),
    value,
    color: format === "mp3" ? "#8b5cf6" : "#06b6d4",
  }))

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Conversions</p>
                <p className="text-2xl font-bold">{analytics.totalConversions.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+12% from last week</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-bold">{analytics.todayConversions}</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+8% from yesterday</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Avg Time</p>
                <p className="text-2xl font-bold">{analytics.avgConversionTime}s</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Zap className="h-3 w-3" />
                  <span>-2s faster</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{analytics.successRate}%</p>
                <Progress value={analytics.successRate} className="h-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hourly Conversions Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Conversions by Hour</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="conversions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Format Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Format Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={formatData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {formatData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-primary" />
                  <span className="text-sm">MP3: {analytics.formatBreakdown.mp3}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">MP4: {analytics.formatBreakdown.mp4}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Quality Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(analytics.qualityBreakdown).map(([quality, percentage]) => (
              <div key={quality} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{quality}</span>
                  <Badge variant="secondary">{percentage}%</Badge>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
