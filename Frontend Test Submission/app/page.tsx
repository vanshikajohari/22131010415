"use client"

import { useState, useEffect } from "react"
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material"
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Analytics as AnalyticsIcon,
} from "@mui/icons-material"
import Link from "next/link"
import { logger } from "@/lib/logger"
import { urlService } from "@/lib/url-service"
import type { UrlEntry, ShortenedUrl } from "@/types/url"

export default function URLShortenerPage() {
  const [urlInputList, setUrlInputList] = useState<UrlEntry[]>([
    { id: 1, originalUrl: "", validity: 30, customShortcode: "" },
  ])
  const [shortenedLinks, setShortenedLinks] = useState<ShortenedUrl[]>([])
  const [inputErrors, setInputErrors] = useState<Record<number, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    logger.info("URL Shortener Page loaded")
  }, [])

  const addUrlInput = () => {
    if (urlInputList.length < 5) {
      const newInput: UrlEntry = {
        id: Date.now(),
        originalUrl: "",
        validity: 30,
        customShortcode: "",
      }
      setUrlInputList([...urlInputList, newInput])
      logger.info(`Added new URL input. Total inputs: ${urlInputList.length + 1}`)
    }
  }

  const removeUrlInput = (id: number) => {
    setUrlInputList(urlInputList.filter((input) => input.id !== id))
    setInputErrors((prev) => {
      const updatedErrors = { ...prev }
      delete updatedErrors[id]
      return updatedErrors
    })
    logger.info(`Removed URL input ${id}. Remaining inputs: ${urlInputList.length - 1}`)
  }

  const updateUrlInput = (id: number, field: keyof UrlEntry, value: string | number) => {
    setUrlInputList(urlInputList.map((input) => (input.id === id ? { ...input, [field]: value } : input)))
    if (inputErrors[id]) {
      setInputErrors((prev) => {
        const updatedErrors = { ...prev }
        delete updatedErrors[id]
        return updatedErrors
      })
    }
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const validateInputs = (): boolean => {
    const updatedErrors: Record<number, string> = {}
    let allValid = true
    urlInputList.forEach((input) => {
      if (!input.originalUrl.trim()) {
        updatedErrors[input.id] = "URL is required"
        allValid = false
      } else if (!isValidUrl(input.originalUrl)) {
        updatedErrors[input.id] = "Please enter a valid URL"
        allValid = false
      } else if (input.validity <= 0) {
        updatedErrors[input.id] = "Validity must be a positive number"
        allValid = false
      } else if (input.customShortcode && !/^[a-zA-Z0-9]+$/.test(input.customShortcode)) {
        updatedErrors[input.id] = "Shortcode must be alphanumeric"
        allValid = false
      } else if (input.customShortcode && input.customShortcode.length > 20) {
        updatedErrors[input.id] = "Shortcode must be 20 characters or less"
        allValid = false
      }
    })
    setInputErrors(updatedErrors)
    return allValid
  }

  const handleShortenLinks = async () => {
    logger.info("Starting URL shortening process")
    if (!validateInputs()) {
      logger.warn("Validation failed for URL inputs")
      return
    }
    setIsSubmitting(true)
    const newShortenedLinks: ShortenedUrl[] = []
    try {
      for (const input of urlInputList) {
        try {
          const result = await urlService.shortenUrl(input.originalUrl, input.validity, input.customShortcode)
          newShortenedLinks.push(result)
          logger.info(`Successfully shortened URL: ${input.originalUrl} -> ${result.shortCode}`)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error"
          setInputErrors((prev) => ({ ...prev, [input.id]: errorMessage }))
          logger.error(`Failed to shorten URL ${input.originalUrl}: ${errorMessage}`)
        }
      }
      setShortenedLinks(newShortenedLinks)
      if (newShortenedLinks.length > 0) {
        const successfulIds = newShortenedLinks
          .map((r) => urlInputList.find((e) => e.originalUrl === r.originalUrl)?.id)
          .filter(Boolean)
        setUrlInputList(urlInputList.filter((input) => !successfulIds.includes(input.id)))
        if (urlInputList.length === newShortenedLinks.length) {
          setUrlInputList([{ id: Date.now(), originalUrl: "", validity: 30, customShortcode: "" }])
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyLinkToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    logger.info(`Copied to clipboard: ${text}`)
  }

  const formatExpiration = (date: Date): string => {
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          URL Shortener
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Shorten up to 5 URLs with custom shortcodes and validity periods
        </Typography>
        <Button component={Link} href="/statistics" variant="outlined" startIcon={<AnalyticsIcon />} sx={{ mb: 3 }}>
          View Statistics
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Create Short URLs
        </Typography>

        {urlInputList.map((input, index) => (
          <Card key={input.id} sx={{ mb: 3, border: inputErrors[input.id] ? "1px solid #f44336" : "none" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  URL #{index + 1}
                </Typography>
                {urlInputList.length > 1 && (
                  <IconButton onClick={() => removeUrlInput(input.id)} color="error" size="small">
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Original URL"
                    placeholder="https://example.com/very-long-url"
                    value={input.originalUrl}
                    onChange={(e) => updateUrlInput(input.id, "originalUrl", e.target.value)}
                    error={!!inputErrors[input.id]}
                    helperText={inputErrors[input.id]}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Validity (minutes)"
                    type="number"
                    value={input.validity}
                    onChange={(e) => updateUrlInput(input.id, "validity", Number.parseInt(e.target.value) || 30)}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Custom Shortcode (optional)"
                    placeholder="mycode123"
                    value={input.customShortcode}
                    onChange={(e) => updateUrlInput(input.id, "customShortcode", e.target.value)}
                    helperText="Alphanumeric characters only, max 20 chars"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={addUrlInput} disabled={urlInputList.length >= 5}>
            Add URL ({urlInputList.length}/5)
          </Button>
          <Button
            variant="contained"
            onClick={handleShortenLinks}
            disabled={isSubmitting || urlInputList.length === 0}
            size="large"
          >
            {isSubmitting ? "Processing..." : "Shorten URLs"}
          </Button>
        </Box>
      </Paper>

      {shortenedLinks.length > 0 && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Shortened URLs
          </Typography>

          {shortenedLinks.map((result, index) => (
            <Card key={index} sx={{ mb: 2, bgcolor: "success.light", color: "success.contrastText" }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                      Original URL:
                    </Typography>
                    <Typography variant="body1" sx={{ wordBreak: "break-all", mb: 2 }}>
                      {result.originalUrl}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                      Short URL:
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <Typography
                        variant="h6"
                        component={Link}
                        href={`/${result.shortCode}`}
                        sx={{
                          color: "inherit",
                          textDecoration: "underline",
                          "&:hover": { textDecoration: "none" },
                        }}
                      >
                        localhost:3000/{result.shortCode}
                      </Typography>
                      <Tooltip title="Copy to clipboard">
                        <IconButton
                          size="small"
                          onClick={() => copyLinkToClipboard(`http://localhost:3000/${result.shortCode}`)}
                          sx={{ color: "inherit" }}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Chip
                      label={`Expires: ${formatExpiration(result.expiryDate)}`}
                      size="small"
                      sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Paper>
      )}
    </Container>
  )
}
