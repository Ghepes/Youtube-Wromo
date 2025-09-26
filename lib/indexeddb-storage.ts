// IndexedDB storage for temporary video files
interface StoredFile {
  id: string
  filename: string
  blob: Blob
  metadata: {
    title: string
    format: string
    quality: string
    fileSize: string
    thumbnail: string
    duration: string
    createdAt: number
  }
}

class VideoStorage {
  private dbName = "youtube-converter-storage"
  private version = 1
  private storeName = "video-files"
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: "id" })
          store.createIndex("filename", "filename", { unique: false })
          store.createIndex("createdAt", "metadata.createdAt", { unique: false })
        }
      }
    })
  }

  async storeFile(file: StoredFile): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)
      const request = store.put(file)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getFile(id: string): Promise<StoredFile | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly")
      const store = transaction.objectStore(this.storeName)
      const request = store.get(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async deleteFile(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async cleanupOldFiles(): Promise<void> {
    if (!this.db) await this.init()

    const oneHourAgo = Date.now() - 60 * 60 * 1000 // 1 hour

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)
      const index = store.index("createdAt")
      const request = index.openCursor(IDBKeyRange.upperBound(oneHourAgo))

      request.onerror = () => reject(request.error)
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
    })
  }
}

export const videoStorage = new VideoStorage()

export function createMockMP3(title: string, duration: string): Blob {
  // Create a minimal MP3 file with proper headers
  const mp3Header = new Uint8Array([
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
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
  ])

  // Add some silence data to make it a valid audio file
  const silenceData = new Uint8Array(1024).fill(0)
  const combinedData = new Uint8Array(mp3Header.length + silenceData.length)
  combinedData.set(mp3Header)
  combinedData.set(silenceData, mp3Header.length)

  return new Blob([combinedData], { type: "audio/mpeg" })
}

export function createMockMP4(title: string, duration: string): Blob {
  // Create a minimal MP4 file with proper headers
  const mp4Header = new Uint8Array([
    0x00,
    0x00,
    0x00,
    0x20,
    0x66,
    0x74,
    0x79,
    0x70, // ftyp box
    0x69,
    0x73,
    0x6f,
    0x6d,
    0x00,
    0x00,
    0x02,
    0x00,
    0x69,
    0x73,
    0x6f,
    0x6d,
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

  // Add minimal video data
  const videoData = new Uint8Array(2048).fill(0)
  const combinedData = new Uint8Array(mp4Header.length + videoData.length)
  combinedData.set(mp4Header)
  combinedData.set(videoData, mp4Header.length)

  return new Blob([combinedData], { type: "video/mp4" })
}
