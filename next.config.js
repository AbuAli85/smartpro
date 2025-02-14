/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  webpack: (config, { dev, isServer }) => {
    // Disable CSS preloading
    if (!dev && !isServer) {
      config.plugins.forEach((plugin) => {
        if (plugin.constructor.name === "NextJsHtmlWebpackPlugin") {
          plugin.getHooks().beforeHtmlGeneration.tap("DisableCSSPreload", (htmlPluginData) => {
            htmlPluginData.assets.preloadFiles = htmlPluginData.assets.preloadFiles.filter(
              (file) => !file.name.endsWith(".css"),
            )
          })
        }
      })
    }
    return config
  },
}

module.exports = nextConfig

