import type { ShortenedUrl, ClickData } from "@/types/url"
import { logger } from "./logger"

class UrlService {
  private readonly STORAGE_KEY = "shortened-urls"
  private urls: ShortenedUrl[] = []

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage()
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const parsedUrls = JSON.parse(stored)
        this.urls = parsedUrls.map((url: any) => ({
          ...url,
          createdAt: new Date(url.createdAt),
          expiryDate: new Date(url.expiryDate),
          clicks:
            url.clicks?.map((click: any) => ({
              ...click,
              timestamp: new Date(click.timestamp),
            })) || [],
        }))
        logger.info(`Loaded ${this.urls.length} URLs from storage`)
      }
    } catch (error) {
      logger.error("Failed to load URLs from storage:", error)
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.urls))
      logger.info("URLs saved to storage")
    } catch (error) {
      logger.error("Failed to save URLs to storage:", error)
    }
  }

  private generateShortCode(): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  private isShortCodeUnique(shortCode: string): boolean {
    return !this.urls.some((url) => url.shortCode === shortCode)
  }

  private getMockLocation(): string {
    const locations = [
      "New York, US",
      "London, UK",
      "Tokyo, JP",
      "Sydney, AU",
      "Toronto, CA",
      "Berlin, DE",
      "Mumbai, IN",
      "São Paulo, BR",
    ]
    return locations[Math.floor(Math.random() * locations.length)]
  }

  private getMockSource(): string {
    const sources = ["Direct", "Google Search", "Social Media", "Email", "Referral", "Advertisement"]
    return sources[Math.floor(Math.random() * sources.length)]
  }

  async shortenUrl(originalUrl: string, validityMinutes = 30, customShortcode?: string): Promise<ShortenedUrl> {
    logger.info(`Shortening URL: ${originalUrl}`)

    let shortCode: string

    if (customShortcode) {
      if (!this.isShortCodeUnique(customShortcode)) {
        throw new Error("Custom shortcode already exists. Please choose a different one.")
      }
      shortCode = customShortcode
      logger.info(`Using custom shortcode: ${shortCode}`)
    } else {
      // Generate unique shortcode
      do {
        shortCode = this.generateShortCode()
      } while (!this.isShortCodeUnique(shortCode))
      logger.info(`Generated shortcode: ${shortCode}`)
    }

    const now = new Date()
    const expiryDate = new Date(now.getTime() + validityMinutes * 60 * 1000)

    const shortenedUrl: ShortenedUrl = {
      shortCode,
      originalUrl,
      createdAt: now,
      expiryDate,
      validityMinutes,
      clickCount: 0,
      clicks: [],
    }

    this.urls.push(shortenedUrl)
    this.saveToStorage()

    logger.info(`URL shortened successfully: ${shortCode} -> ${originalUrl}`)
    return shortenedUrl
  }

  redirectToOriginal(shortCode: string): string | null {
    logger.info(`Redirect request for shortcode: ${shortCode}`)

    const url = this.urls.find((u) => u.shortCode === shortCode)

    if (!url) {
      logger.warn(`Shortcode not found: ${shortCode}`)
      return null
    }

    if (new Date() > url.expiryDate) {
      logger.warn(`Shortcode expired: ${shortCode}`)
      return null
    }

    // Record the click
    const clickData: ClickData = {
      timestamp: new Date(),
      source: this.getMockSource(),
      location: this.getMockLocation(),
      userAgent: navigator.userAgent,
    }

    url.clicks.push(clickData)
    url.clickCount++
    this.saveToStorage()

    logger.info(`Click recorded for ${shortCode}. Total clicks: ${url.clickCount}`)
    return url.originalUrl
  }

  getAllUrls(): ShortenedUrl[] {
    // Clean up expired URLs older than 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const initialCount = this.urls.length

    this.urls = this.urls.filter((url) => {
      if (new Date() > url.expiryDate && url.expiryDate < oneDayAgo) {
        return false
      }
      return true
    })

    if (this.urls.length !== initialCount) {
      this.saveToStorage()
      logger.info(`Cleaned up ${initialCount - this.urls.length} old expired URLs`)
    }

    return [...this.urls].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  getUrlByShortCode(shortCode: string): ShortenedUrl | null {
    return this.urls.find((url) => url.shortCode === shortCode) || null
  }
}

export const urlService = new UrlService()
