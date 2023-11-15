import { defineConfig } from 'vitepress';
import UnoCSS from 'unocss/vite';

export default defineConfig({
  base: '/mechanus/',
  title: 'Mechanus',
  description: 'Documentation',
  lang: 'en',
  lastUpdated: true,

  vite: {
    plugins: [UnoCSS()]
  },

  // head: [['link', { rel: 'icon', href: '/mechanus/favicon.ico' }]],

  themeConfig: {
    // logo: '/favicon.ico',
    nav: [
      {
        text: 'API',
        link: 'https://tb.dev.br/mechanus/api/index.html'
      }
    ],

    editLink: {
      pattern: 'https://github.com/ferreira-tb/mechanus/edit/main/docs/:path'
    },

    search: {
      provider: 'local'
    },

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/ferreira-tb/mechanus'
      }
    ],

    footer: {
      copyright:
        'Copyright © 2023 <a href="https://github.com/ferreira-tb">Andrew Ferreira</a>'
    }
  }
});
