import { Download } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container max-w-screen-xl py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Download className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">YT Converter</span>
            </div>
            <p className="text-sm text-muted-foreground text-pretty">
              The fastest and most reliable YouTube to MP3 & MP4 converter. Free, secure, and easy to use.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  YouTube to MP3
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  YouTube to MP4
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  High Quality
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Fast Conversion
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Report Issue
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  DMCA
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Disclaimer
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 YT Converter. All rights reserved. Built with ❤️ for YouTube enthusiasts.</p>
        </div>
      </div>
    </footer>
  )
}
