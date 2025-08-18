const ModuleFederationPlugin = require('@module-federation/webpack');
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  
  optimization: {
    runtimeChunk: false,
    splitChunks: {
      chunks: 'all',
    },
  },

  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared-lib/src/public-api.ts'),
    },
  },

  plugins: [
    new ModuleFederationPlugin({
      name: 'adminPanel',
      filename: 'remoteEntry.js',
      
      exposes: {
        './AdminModule': './src/app/app.component.ts',
        './AdminRoutes': './src/app/app.routes.ts',
        './AdminServices': './src/app/core/services/index.ts',
      },

      shared: {
        '@angular/core': {
          singleton: true,
          strictVersion: true,
          requiredVersion: 'auto',
        },
        '@angular/common': {
          singleton: true,
          strictVersion: true,
          requiredVersion: 'auto',
        },
        '@angular/common/http': {
          singleton: true,
          strictVersion: true,
          requiredVersion: 'auto',
        },
        '@angular/router': {
          singleton: true,
          strictVersion: true,
          requiredVersion: 'auto',
        },
        '@angular/forms': {
          singleton: true,
          strictVersion: true,
          requiredVersion: 'auto',
        },
        'rxjs': {
          singleton: true,
          strictVersion: true,
          requiredVersion: 'auto',
        },
        'zone.js': {
          singleton: true,
          strictVersion: true,
          requiredVersion: 'auto',
        },
      },
    }),
  ],

  devServer: {
    port: 4202,
    historyApiFallback: true,
    hot: true,
    liveReload: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },
};