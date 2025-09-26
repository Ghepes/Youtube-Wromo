import { type NextRequest, NextResponse } from "next/server"

function generateMockMediaFile(format: "mp3" | "mp4"): Buffer {
  if (format === "mp3") {
    // Create a minimal valid MP3 file header
    const mp3Header = Buffer.from([
      0xff,
      0xfb,
      0x90,
      0x00, // MP3 frame header
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00, // Padding
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
    ])
    // Add some silence data to make it a valid playable file
    const silenceData = Buffer.alloc(1024, 0x00)
    return Buffer.concat([mp3Header, silenceData])
  } else {
    // Create a minimal valid MP4 file header
    const mp4Header = Buffer.from([
      0x00,
      0x00,
      0x00,
      0x20, // Box size
      0x66,
      0x74,
      0x79,
      0x70, // 'ftyp' box
      0x69,
      0x73,
      0x6f,
      0x6d, // 'isom' brand
      0x00,
      0x00,
      0x02,
      0x00, // Minor version
      0x69,
      0x73,
      0x6f,
      0x6d, // Compatible brands
      0x69,
      0x73,
      0x6f,
      0x32,
      0x61,
      0x76,
      0x63,
      0x31,
      0x6d,
      0x70,
      0x34,
      0x31,
    ])
    // Add minimal mdat box for a valid MP4
    const mdatBox = Buffer.from([
      0x00,
      0x00,
      0x00,
      0x08, // Box size
      0x6d,
      0x64,
      0x61,
      0x74, // 'mdat' box
    ])
    return Buffer.concat([mp4Header, mdatBox])
  }
}

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const { filename } = params

    // Validate filename
    if (!filename || !filename.match(/^\d+\.(mp3|mp4)$/)) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 })
    }

    const fileExtension = filename.split(".").pop() as "mp3" | "mp4"
    const isAudio = fileExtension === "mp3"

    const mockFileContent = generateMockMediaFile(fileExtension)

    // Set appropriate headers
    const headers = new Headers()
    headers.set("Content-Type", isAudio ? "audio/mpeg" : "video/mp4")
    headers.set("Content-Disposition", `attachment; filename="${filename}"`)
    headers.set("Content-Length", mockFileContent.length.toString())
    headers.set("Cache-Control", "public, max-age=3600")
    headers.set("Accept-Ranges", "bytes")

    return new NextResponse(mockFileContent, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Internal server error during download" }, { status: 500 })
  }
}
