// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  ssr: true,
  modules: ['nuxt-directus', '@nuxt/image', '@nuxt/icon', 'dayjs-nuxt'],
  components: [{path:'~/components/pages', pathPrefix: false},{path: '~/components/common', pathPrefix: false}],
  runtimeConfig: {
    public: {
      directus: {
        url: process.env.DIRECTUS_URL
      }
    }
  },
  directus: {
    url: process.env.DIRECTUS_URL
  },
  css:['~/assets/scss/main.scss'],
  nitro: {
    devProxy: {
      '/api': {
        target: process.env.DIRECTUS_URL,
        changeOrigin: true,
        prependPath: true
      }
    }
  }
})