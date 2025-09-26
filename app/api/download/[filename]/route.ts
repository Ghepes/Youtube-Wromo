import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const { filename } = params

    // Validate filename format (now expecting fileId instead of filename)
    if (!filename || !filename.match(/^\d+-[a-z0-9]+$/)) {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 })
    }

    // Return instructions for client-side download from IndexedDB
    return NextResponse.json({
      success: true,
      message: "File ready for download",
      fileId: filename,
      instructions: "Use client-side IndexedDB to retrieve and download the file",
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Internal server error during download" }, { status: 500 })
  }
}
