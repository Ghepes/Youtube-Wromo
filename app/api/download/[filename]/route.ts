import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const { filename } = params

    // Validate filename
    if (!filename || !filename.match(/^\d+\.(mp3|mp4)$/)) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 })
    }

    // In a real implementation, you would:
    // 1. Check if the file exists in your storage
    // 2. Stream the file to the client
    // 3. Set appropriate headers for download

    // For demo purposes, we'll return a mock response
    const fileExtension = filename.split(".").pop()
    const isAudio = fileExtension === "mp3"

    // Create a mock file buffer (in real implementation, read from storage)
    const mockFileContent = Buffer.from(`Mock ${isAudio ? "audio" : "video"} file content`)

    // Set appropriate headers
    const headers = new Headers()
    headers.set("Content-Type", isAudio ? "audio/mpeg" : "video/mp4")
    headers.set("Content-Disposition", `attachment; filename="${filename}"`)
    headers.set("Content-Length", mockFileContent.length.toString())

    return new NextResponse(mockFileContent, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Internal server error during download" }, { status: 500 })
  }
}
