"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Container, Typography, CircularProgress, Alert, Box } from "@mui/material"
import { logger } from "@/lib/logger"
import { urlService } from "@/lib/url-service"

export default function RedirectPage() {
  const params = useParams()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(true)

  useEffect(() => {
    const shortCode = params.shortCode as string

    if (!shortCode) {
      setError("Invalid short code")
      setIsRedirecting(false)
      return
    }

    logger.info(`Attempting to redirect for short code: ${shortCode}`)

    try {
      const originalUrl = urlService.redirectToOriginal(shortCode)

      if (originalUrl) {
        logger.info(`Redirecting ${shortCode} to ${originalUrl}`)
        // Small delay to show the redirect message
        setTimeout(() => {
          window.location.href = originalUrl
        }, 1500)
      } else {
        setError("Short URL not found or has expired")
        setIsRedirecting(false)
        logger.warn(`Short code not found or expired: ${shortCode}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setError(errorMessage)
      setIsRedirecting(false)
      logger.error(`Redirect failed for ${shortCode}:`, error)
    }
  }, [params.shortCode])

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Redirect Failed
          </Typography>
          <Typography variant="body1">{error}</Typography>
        </Alert>
        <Typography variant="body2" color="text.secondary">
          The short URL you're trying to access may have expired or doesn't exist.
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
      <Box sx={{ mb: 4 }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h5" gutterBottom>
          Redirecting...
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You will be redirected to the original URL shortly.
        </Typography>
      </Box>
    </Container>
  )
}
