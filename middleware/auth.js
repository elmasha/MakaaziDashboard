// middleware/auth.js
import axios from 'axios'

const API = 'https://makaaziserver22.up.railway.app/api'

// uid -> { role, role_id, permissions, profile }
const roleCache = new Map()

// Login / public pages — matched by prefix
const PUBLIC_PATHS = [
  '/',
  '/admin/login',
  '/officials/login',
  '/estate/login',
  '/household/register',
  // any other truly public page:
  // '/', '/about', '/terms', '/privacy',
]

// Where to send a user of a given role
const HOME_FOR_ROLE = {
  super:    '/admin',
  support:  '/admin',
  readonly: '/admin',
  official: '/officials/dashboard',
  resident: '/household/dashboard',
}

// Which login page to send an unauthenticated visitor to,
// depending on which section of the app they tried to open
function loginForPath(path) {
  if (path.startsWith('/admin'))     return '/admin/login'
  if (path.startsWith('/officials')) return '/officials/login'
  if (path.startsWith('/estate'))    return '/estate/login'
  if (path.startsWith('/household')) return '/household/register'
  return '/admin/login'   // fallback
}

async function resolveRole(uid) {
  if (roleCache.has(uid)) return roleCache.get(uid)

  let result = null
  try {
    const { data, status } = await axios.get(`${API}/roles/for-user/${uid}`)
    if (status === 200 && data?.role) {
      result = {
        role: data.role,
        role_id: data.role_id || null,
        permissions: Array.isArray(data.permissions) ? data.permissions : [],
        profile: data.profile || null,
      }
    }
  } catch (err) {
    if (err.response?.status !== 404) {
      console.warn('role resolve failed:', err.response?.status, err.message)
    }
  }

  roleCache.set(uid, result)
  return result
}

export default async function ({ app, store, route, redirect }) {
  const path = route.path

  // 1. Public paths — let through untouched
  if (PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + '/'))) {
    return
  }

  // 2. Wait for Firebase to hydrate (fixes hard-refresh flash-redirect)
  const user = await new Promise((resolve) => {
    const unsub = app.$fire.auth.onAuthStateChanged((u) => {
      unsub()
      resolve(u)
    })
  })

  // 3. Not signed in → send to the right login page
  if (!user) {
    return redirect(loginForPath(path), { redirect: route.fullPath })
  }

  // 4. Signed in → resolve role via backend
  const session = await resolveRole(user.uid)
  if (!session) {
    // Firebase user exists but has no row in intec_admins / officials / households
    return redirect(loginForPath(path) + '?error=no-role')
  }

  // 5. Stash on app + store
  app.$authRole        = session.role
  app.$authRoleId      = session.role_id
  app.$authPermissions = session.permissions
  app.$authProfile     = session.profile
  app.$authUid         = user.uid

  if (store) {
    store.commit('auth/SET_ROLE', session.role)
    store.commit('auth/SET_ROLE_ID', session.role_id)
    store.commit('auth/SET_PERMISSIONS', session.permissions)
    store.commit('auth/SET_PROFILE', session.profile)
    store.commit('auth/SET_UID', user.uid)
  }
}

export function clearRoleCache() {
  roleCache.clear()
}