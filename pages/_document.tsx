

import { Html, Head, Main, NextScript } from 'next/document'
 

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        
        <link rel="favicon" href="../assets/awa_logo_min.png" />
        <link href='https://fonts.googleapis.com/css?family=Montserrat' rel='stylesheet' />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" />
      
      </Head>

      <body className='App'>
        <Main  />
        <NextScript />
      </body>
    </Html>
  )
}