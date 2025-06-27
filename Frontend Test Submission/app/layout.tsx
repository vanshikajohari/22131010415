"use client"

import type React from "react"

import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { AppBar, Toolbar, Typography } from "@mui/material"
import { Link as LinkIcon } from "@mui/icons-material"

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    h3: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppBar position="static" elevation={1}>
            <Toolbar>
              <LinkIcon sx={{ mr: 2 }} />
              <Typography variant="h6" component="div">
                URL Shortener Pro
              </Typography>
            </Toolbar>
          </AppBar>
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
