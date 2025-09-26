import { Card, CardContent } from "@/components/ui/card"
import { Shield, Zap, Music, Video, Download, Globe } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Convert YouTube videos to MP3 or MP4 in seconds with our optimized processing engine.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your downloads are processed securely. We don't store your files or personal information.",
  },
  {
    icon: Music,
    title: "High Quality Audio",
    description: "Extract crystal clear MP3 audio files up to 320kbps from any YouTube video.",
  },
  {
    icon: Video,
    title: "Multiple Formats",
    description: "Download videos in various MP4 qualities from 360p to 4K resolution.",
  },
  {
    icon: Download,
    title: "No Registration",
    description: "Start converting immediately. No sign-ups, no accounts, no hassle required.",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description: "Compatible with all devices and browsers. Convert on desktop, mobile, or tablet.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container max-w-screen-xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">Why Choose Our Converter?</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Experience the fastest and most reliable YouTube to MP3 & MP4 converter with advanced features designed for
            your convenience.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground text-pretty">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
