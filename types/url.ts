export interface UrlEntry {
  id: number
  originalUrl: string
  validity: number
  customShortcode: string
}

export interface ClickData {
  timestamp: Date
  source: string
  location: string
  userAgent: string
}

export interface ShortenedUrl {
  shortCode: string
  originalUrl: string
  createdAt: Date
  expiryDate: Date
  validityMinutes: number
  clickCount: number
  clicks: ClickData[]
}
