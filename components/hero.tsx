import { ConverterForm } from "./converter-form"

interface HeroProps {
  onDownloadStart?: (download: {
    title: string
    format: "mp3" | "mp4"
    quality: string
    fileSize: string
    thumbnail: string
    duration: string
    status: "downloading"
    progress: number
  }) => void
}

export function Hero({ onDownloadStart }: HeroProps) {
  return (
    <section className="relative overflow-hidden py-12 md:py-20 lg:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-purple opacity-10" />

      <div className="container relative max-w-4xl mx-auto px-4">
        <div className="text-center space-y-8">
          {/* Header content */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl lg:text-6xl">
              Convert YouTube to <span className="gradient-text">MP3 & MP4</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              Fast, free, and secure YouTube converter. Download your favorite videos as MP3 audio or MP4 video files in
              seconds.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <ConverterForm onDownloadStart={onDownloadStart} />
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-6 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary">1M+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary">100%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Free</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary">24/7</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
