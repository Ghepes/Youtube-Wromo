import { Card, CardContent } from "@/components/ui/card"
import { Copy, Download, Settings } from "lucide-react"

const steps = [
  {
    icon: Copy,
    step: "01",
    title: "Paste YouTube URL",
    description: "Copy the YouTube video link and paste it into our converter input field.",
  },
  {
    icon: Settings,
    step: "02",
    title: "Choose Format",
    description: "Select your preferred format (MP3 for audio or MP4 for video) and quality settings.",
  },
  {
    icon: Download,
    step: "03",
    title: "Download File",
    description: "Click convert and download your file instantly. It's that simple and fast!",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-muted/30">
      <div className="container max-w-screen-xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">How It Works</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Convert your favorite YouTube videos in just three simple steps. No technical knowledge required.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur">
                <CardContent className="p-8 text-center">
                  <div className="space-y-6">
                    <div className="relative">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors mx-auto">
                        <step.icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {step.step}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                      <p className="text-muted-foreground text-pretty">{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-8 h-0.5 bg-border z-10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
