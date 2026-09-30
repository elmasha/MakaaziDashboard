// plugins/axios-auth.js
import axios from 'axios'

export default function ({ app }) {
  axios.interceptors.request.use(async (config) => {
    try {
      const user = app.$fire?.auth?.currentUser
      if (user) {
        const token = await user.getIdToken()
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      } else {
        console.warn('[axios-auth] No current user — request will be unauthenticated:', config.url)
      }
    } catch (e) {
      console.warn('[axios-auth] getIdToken failed:', e.message)
    }
    return config
  })
}