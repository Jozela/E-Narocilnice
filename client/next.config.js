// next.config.js
const nextConfig = {
    webpack(config, { isServer }) {
      if (!isServer) {
        config.resolve.fallback = {
          fs: false,
          stream: require.resolve('stream-browserify'),
          zlib: require.resolve('browserify-zlib'),
        };
      }
      return config;
    },
  };
  
  module.exports = nextConfig;
  