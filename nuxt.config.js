import colors from 'vuetify/es5/util/colors'

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s ',
    title: 'Makaazi Dashboard',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.svg' }
    ]
  },



  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ["@/plugins/mapGoogle.client.js","@/plugins/directionsRenderer.js"],

  router: {
    middleware: ["auth"]
  },

  env: {
    MAPS_API_KEY: process.env.MAPS_API_KEY || 'AIzaSyBohXT2fagF68PWxk4fnTSnH3tNf5Zo21o',
  },
  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  googleFonts: {
    download: true,
    families: {
      Lato: true,
    },
    display: "Lato",
  },

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
    "@nuxtjs/google-fonts",
    '@nuxtjs/moment',
    '@nuxtjs/dayjs',

  ],
  moment: {
    timezone: false
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [

    [
      "@nuxtjs/firebase",
      {
        config: {
          apiKey: "AIzaSyAF1CYyGUcM2d_Ut1jvkCFiT9n2bS-JIwc",
          authDomain: "mock-26efe.firebaseapp.com",
          projectId: "mock-26efe",
          storageBucket: "mock-26efe.appspot.com",
          messagingSenderId: "860033241212",
          appId: "1:860033241212:web:b9e62b50103ad2170d39f9",
          measurementId: "G-C1KR12P7KT"
        },
        services: {
          auth: {
            persistence: "local", // default
            initialize: {
              nAuthStateChangedMutation: "ON_AUTH_STATE_CHANGED_MUTATION",
              subscribeManually: false,
            },
            ssr: false,
          },
          storage: true,
          firestore: true,

        },
      },
    ],
  ],

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: false,
      themes: {
        dark: {
          green: "#66CC33",
          primary: "#B6FF00",
          accent: "#8051FF",
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}
