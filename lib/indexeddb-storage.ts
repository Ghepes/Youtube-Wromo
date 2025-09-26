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

export async function storeRealVideoFile(
  id: string,
  filename: string,
  blob: Blob,
  metadata: {
    title: string
    format: string
    quality: string
    fileSize: string
    thumbnail: string
    duration: string
  },
): Promise<void> {
  console.log("[v0] Storing real video file in IndexedDB:", filename, blob.size, "bytes")

  const file: StoredFile = {
    id,
    filename,
    blob,
    metadata: {
      ...metadata,
      createdAt: Date.now(),
    },
  }

  await videoStorage.storeFile(file)
  console.log("[v0] Successfully stored file in IndexedDB")
}

export async function getRealVideoFile(id: string): Promise<Blob | null> {
  console.log("[v0] Retrieving real video file from IndexedDB:", id)

  const file = await videoStorage.getFile(id)
  if (!file) {
    console.log("[v0] File not found in IndexedDB")
    return null
  }

  console.log("[v0] Retrieved file:", file.filename, file.blob.size, "bytes")
  return file.blob
}
