"use client"

import { useState, useEffect } from "react"
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
} from "@mui/material"
import { ArrowBack as ArrowBackIcon, Launch as LaunchIcon } from "@mui/icons-material"
import Link from "next/link"
import { logger } from "@/lib/logger"
import { urlService } from "@/lib/url-service"
import type { ShortenedUrl } from "@/types/url"

export default function StatisticsPage() {
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    logger.info("Statistics Page loaded")
    loadStatistics()
  }, [])

  const loadStatistics = () => {
    try {
      const urls = urlService.getAllUrls()
      setShortenedUrls(urls)
      logger.info(`Loaded ${urls.length} shortened URLs for statistics`)
    } catch (error) {
      logger.error("Failed to load statistics:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isExpired = (expiryDate: Date): boolean => {
    return new Date() > expiryDate
  }

  const getStatusChip = (url: ShortenedUrl) => {
    if (isExpired(url.expiryDate)) {
      return <Chip label="Expired" color="error" size="small" />
    }
    return <Chip label="Active" color="success" size="small" />
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading statistics...</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button component={Link} href="/" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
          Back to URL Shortener
        </Button>

        <Typography variant="h3" component="h1" gutterBottom color="primary">
          URL Statistics
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Analytics and insights for your shortened URLs
        </Typography>
      </Box>

      {shortenedUrls.length === 0 ? (
        <Alert severity="info" sx={{ mb: 4 }}>
          No shortened URLs found. Create some URLs first to see statistics here.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {shortenedUrls.map((url, index) => (
            <Grid item xs={12} key={index}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Short URL:
                        <Typography
                          component={Link}
                          href={`/${url.shortCode}`}
                          sx={{
                            ml: 1,
                            color: "primary.main",
                            textDecoration: "none",
                            "&:hover": { textDecoration: "underline" },
                          }}
                        >
                          localhost:3000/{url.shortCode}
                          <LaunchIcon sx={{ ml: 0.5, fontSize: 16 }} />
                        </Typography>
                      </Typography>
                      {getStatusChip(url)}
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, wordBreak: "break-all" }}>
                      <strong>Original URL:</strong> {url.originalUrl}
                    </Typography>

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2">
                          <strong>Created:</strong> {formatDate(url.createdAt)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2">
                          <strong>Expires:</strong> {formatDate(url.expiryDate)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2">
                          <strong>Total Clicks:</strong> {url.clickCount}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2">
                          <strong>Validity:</strong> {url.validityMinutes} minutes
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  {url.clicks && url.clicks.length > 0 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Click Details
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>
                                <strong>Timestamp</strong>
                              </TableCell>
                              <TableCell>
                                <strong>Source</strong>
                              </TableCell>
                              <TableCell>
                                <strong>Location</strong>
                              </TableCell>
                              <TableCell>
                                <strong>User Agent</strong>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {url.clicks.map((click, clickIndex) => (
                              <TableRow key={clickIndex}>
                                <TableCell>{formatDate(click.timestamp)}</TableCell>
                                <TableCell>{click.source}</TableCell>
                                <TableCell>{click.location}</TableCell>
                                <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {click.userAgent}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}

                  {(!url.clicks || url.clicks.length === 0) && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      No clicks recorded yet for this URL.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}
