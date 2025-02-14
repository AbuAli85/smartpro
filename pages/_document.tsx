import Document, { Html, Head, Main, NextScript } from "next/document"

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>{/* Remove any CSS preloading */}</Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument

