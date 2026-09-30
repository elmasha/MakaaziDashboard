import colors from 'vuetify/es5/util/colors'

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,
   server: {
    host: '127.0.0.1',
    port: 4000
  },

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
  plugins: ["@/plugins/mapGoogle.client.js","@/plugins/directionsRenderer.js",'@/plugins/chart.js','@/plugins/axios-auth.js'],

  router: {
    // middleware: ["auth" ]
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
'@nuxtjs/dayjs',
    [
      "@nuxtjs/firebase",
      {
        config: {
          apiKey: "AIzaSyAQk97EiEFViRl2DND60UR-SowAsdEAJxs",
          authDomain: "makaazi-5d6aa.firebaseapp.com",
          projectId: "makaazi-5d6aa",
          storageBucket: "makaazi-5d6aa.firebasestorage.app",
          messagingSenderId: "455915424946",
          appId: "1:455915424946:web:b4ee4fba8475c2b46a8dab",
          measurementId: "G-FN1YLGL5WN"
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
      light: {
        primary:   '#8051FF',
        accent:    '#9B6CFF',
        secondary: '#0F0D24',
        info:      '#3B82F6',
        warning:   '#F59E0B',
        error:     '#DC2626',
        success:   '#10B981',
      },
      dark: {
        primary:   '#B6FF00',
        accent:    '#8051FF',
        secondary: '#0F0D24',
        info:      '#3B82F6',
        warning:   '#F59E0B',
        error:     '#DC2626',
        success:   '#10B981',
      },
    },
  },
},

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}
