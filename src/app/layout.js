import './globals.css'

export const metadata = {
  title: 'awa app',
  description: 'design.animate',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* <link rel="favicon" href="../lib/awa_logo_min.png" /> */}
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
