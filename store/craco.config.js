const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const BrotliPlugin = require('brotli-webpack-plugin');
const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Optimizaciones para producción
      if (env === 'production') {
        // Optimización de bundles
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                priority: 10,
              },
              common: {
                name: 'common',
                minChunks: 2,
                chunks: 'all',
                priority: 5,
                reuseExistingChunk: true,
              },
              styles: {
                name: 'styles',
                test: /\.css$/,
                chunks: 'all',
                enforce: true,
              },
            },
          },
          runtimeChunk: 'single',
        };

        // Optimización de Terser
        webpackConfig.optimization.minimizer = [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug'],
              },
              mangle: true,
              output: {
                comments: false,
              },
            },
            extractComments: false,
          }),
        ];

        // Compresión Gzip
        webpackConfig.plugins.push(
          new CompressionPlugin({
            filename: '[path][base].gz',
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            threshold: 10240,
            minRatio: 0.8,
          })
        );

        // Compresión Brotli
        webpackConfig.plugins.push(
          new BrotliPlugin({
            asset: '[path].br[query]',
            test: /\.(js|css|html|svg)$/,
            threshold: 10240,
            minRatio: 0.8,
          })
        );

        // Análisis de bundles (opcional)
        if (process.env.ANALYZE === 'true') {
          webpackConfig.plugins.push(
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              openAnalyzer: false,
              reportFilename: 'bundle-report.html',
            })
          );
        }
      }

      // Optimizaciones generales
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@context': path.resolve(__dirname, 'src/context'),
        '@locales': path.resolve(__dirname, 'src/locales'),
      };

      return webpackConfig;
    },
  },

  babel: {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            browsers: ['>0.2%', 'not dead', 'not op_mini all'],
          },
          useBuiltIns: 'usage',
          corejs: 3,
        },
      ],
    ],
    plugins: [
      ['@babel/plugin-transform-runtime', { regenerator: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-proposal-private-methods', { loose: true }],
    ],
  },

  devServer: {
    hot: true,
    port: 3000,
    open: true,
    historyApiFallback: true,
    compress: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    static: {
      directory: path.join(__dirname, 'public'),
    },
  },
};