<template>
  <v-app>
    <div class="d-flex admin-root" style="min-height: 100vh;">
      <!-- ============================================================
           DESKTOP SIDEBAR
           ============================================================ -->
      <aside v-if="!isMobile" class="admin-sidebar">
        <div class="brand-block">
          <div class="brand-mark">
            <v-icon color="white" size="22">mdi-shield-crown</v-icon>
          </div>
          <div>
            <div class="brand-name">Makaazi</div>
            <div class="brand-sub">{{ roleLabel }}</div>
          </div>
        </div>

        <div v-if="adminEmail" class="admin-chip">
          <v-avatar size="32" class="admin-chip-avatar">
            <span>{{ adminInitials }}</span>
          </v-avatar>
          <div class="admin-chip-text">
            <div class="admin-chip-name">{{ adminEmail }}</div>
            <div class="admin-chip-role">{{ roleLabel }}</div>
          </div>
        </div>

        <nav class="nav-list">
          <button
            v-for="item in menuItems"
            :key="item.view"
            class="nav-item"
            :class="{ 'nav-item-active': currentView === item.view }"
            @click="go(item.route)"
          >
            <span class="nav-icon-wrap">
              <v-icon size="18">{{ item.icon }}</v-icon>
            </span>
            <span class="nav-label">{{ item.title }}</span>
            <span
              v-if="item.badge && item.badge > 0"
              class="nav-badge"
            >
              {{ item.badge > 99 ? '99+' : item.badge }}
            </span>
          </button>
        </nav>

        <div class="sidebar-footer">
          <button class="logout-btn" @click="logout">
            <v-icon size="16" class="mr-2">mdi-logout</v-icon>
            Sign Out
          </button>
        </div>
      </aside>

      <!-- ============================================================
           MAIN
           ============================================================ -->
      <main class="admin-main" :class="{ 'admin-main-mobile': isMobile }">
        <header class="admin-topbar">
          <button v-if="isMobile" class="topbar-icon-btn" @click="drawer = true">
            <v-icon size="20">mdi-menu</v-icon>
          </button>

          <div class="topbar-title">
            <h1 class="topbar-heading">{{ currentTitle }}</h1>
            <p class="topbar-sub">
              <span class="topbar-dot"></span>
              {{ adminEmail || 'Admin' }}
            </p>
          </div>

          <v-spacer></v-spacer>

          <button
            v-if="isSuperAdmin"
            class="topbar-icon-btn topbar-bell"
            title="Approvals"
            @click="go('/admin/approvals')"
          >
            <v-icon size="20">mdi-bell-outline</v-icon>
            <span
              v-if="pendingApprovals > 0"
              class="topbar-bell-badge"
            >
              {{ pendingApprovals > 99 ? '99+' : pendingApprovals }}
            </span>
          </button>

          <button class="topbar-avatar" @click="logout">
            {{ adminInitials }}
          </button>
        </header>

        <div class="admin-content">
          <nuxt />
        </div>
      </main>

      <!-- ============================================================
           MOBILE DRAWER
           ============================================================ -->
      <v-navigation-drawer
        v-model="drawer"
        temporary
        absolute
        width="280"
        class="mobile-drawer"
      >
        <div class="mobile-drawer-inner">
          <div class="brand-block">
            <div class="brand-mark">
              <v-icon color="white" size="22">mdi-shield-crown</v-icon>
            </div>
            <div>
              <div class="brand-name">Makaazi</div>
              <div class="brand-sub">{{ roleLabel }}</div>
            </div>
          </div>

          <nav class="nav-list">
            <button
              v-for="item in menuItems"
              :key="item.view"
              class="nav-item"
              :class="{ 'nav-item-active': currentView === item.view }"
              @click="go(item.route), (drawer = false)"
            >
              <span class="nav-icon-wrap">
                <v-icon size="18">{{ item.icon }}</v-icon>
              </span>
              <span class="nav-label">{{ item.title }}</span>
              <span
                v-if="item.badge && item.badge > 0"
                class="nav-badge"
              >
                {{ item.badge > 99 ? '99+' : item.badge }}
              </span>
            </button>
          </nav>

          <div class="sidebar-footer">
            <button class="logout-btn" @click="logout">
              <v-icon size="16" class="mr-2">mdi-logout</v-icon>
              Sign Out
            </button>
          </div>
        </div>
      </v-navigation-drawer>

      <!-- Mobile bottom nav -->
      <nav v-if="isMobile" class="bottom-nav">
        <button
          v-for="item in bottomNavItems"
          :key="item.view"
          class="bottom-nav-btn"
          :class="{ 'bottom-nav-btn-active': currentView === item.view }"
          @click="go(item.route)"
        >
          <v-icon size="20">{{ item.icon }}</v-icon>
          <span class="bottom-nav-label">{{ item.shortTitle || item.title }}</span>
          <span
            v-if="item.badge && item.badge > 0"
            class="bottom-nav-badge"
          >
            {{ item.badge > 9 ? '9+' : item.badge }}
          </span>
        </button>
      </nav>
    </div>
  </v-app>
</template>

<script>
import axios from 'axios';

const API = 'https://makaaziserver22.up.railway.app/api';

export default {
  name: 'AdminLayout',
  data() {
    return {
      isMobile: false,
      drawer: false,
      adminEmail: null,
      adminRole: null,
      pendingApprovals: 0,
      _approvalPoll: null,
    };
  },
  computed: {
    isSuperAdmin() {
      return this.adminRole === 'super';
    },
    roleLabel() {
      if (!this.adminRole) return 'INTEC Staff';
      if (this.adminRole === 'super') return 'Super Admin';
      if (this.adminRole === 'support') return 'Support';
      if (this.adminRole === 'readonly') return 'Read-Only';
      return 'INTEC Staff';
    },
    /**
     * Menu items with role-based visibility.
     * Items without a `roles` array are visible to everyone.
     */
    allMenuItems() {
      const items = [
        {
          title: 'Dashboard', view: 'dashboard',
          icon: 'mdi-view-dashboard-outline', route: '/admin',
        },
        {
          title: 'Approvals', view: 'approvals',
          icon: 'mdi-shield-check-outline', route: '/admin/approvals',
          roles: ['super'], badge: this.pendingApprovals,
        },
        {
          title: 'Estates', view: 'estates',
          icon: 'mdi-office-building-outline', route: '/admin/estates',
        },
        {
          title: 'Subscriptions', view: 'subscriptions',
          icon: 'mdi-credit-card-outline', route: '/admin/subscriptions',
          shortTitle: 'Subs',
        },
        {
          title: 'Officials', view: 'officials',
          icon: 'mdi-shield-account-outline', route: '/admin/officials',
        },
        {
          title: 'Residents', view: 'residents',
          icon: 'mdi-home-group', route: '/admin/residents',
        },
        {
          title: 'Vehicles', view: 'vehicles',
          icon: 'mdi-car-multiple', route: '/admin/vehicles',
        },
        {
          title: 'Visitors', view: 'visitors',
          icon: 'mdi-account-multiple-plus', route: '/admin/visitors',
        },
        {
          title: 'Reports', view: 'reports',
          icon: 'mdi-chart-line', route: '/admin/reports',
        },
        {
          title: 'SMS Logs', view: 'sms',
          icon: 'mdi-message-text-outline', route: '/admin/sms',
          shortTitle: 'SMS',
        },
        {
          title: 'Audit Logs', view: 'audit',
          icon: 'mdi-history', route: '/admin/audit',
        },
        {
          title: 'Admins', view: 'admins',
          icon: 'mdi-shield-crown-outline', route: '/admin/admins',
          roles: ['super'],
        },
        {
          title: 'Settings', view: 'settings',
          icon: 'mdi-cog-outline', route: '/admin/settings',
          roles: ['super'],
        },
      ];
      return items;
    },
    menuItems() {
      // If role hasn't been resolved yet, show the safe defaults (no sensitive items)
      const role = this.adminRole;
      return this.allMenuItems.filter((item) => {
        if (!item.roles) return true;      // visible to all
        if (!role) return false;           // role unknown → hide sensitive
        return item.roles.includes(role);
      });
    },
    bottomNavItems() {
      return this.menuItems.slice(0, 5);
    },
    currentView() {
      const p = this.$route.path;
      if (p === '/admin' || p === '/admin/') return 'dashboard';
      if (p.startsWith('/admin/approvals')) return 'approvals';
      if (p.startsWith('/admin/estates')) return 'estates';
      if (p.startsWith('/admin/subscriptions')) return 'subscriptions';
      if (p.startsWith('/admin/officials')) return 'officials';
      if (p.startsWith('/admin/residents')) return 'residents';
      if (p.startsWith('/admin/vehicles')) return 'vehicles';
      if (p.startsWith('/admin/visitors')) return 'visitors';
      if (p.startsWith('/admin/reports')) return 'reports';
      if (p.startsWith('/admin/sms')) return 'sms';
      if (p.startsWith('/admin/audit')) return 'audit';
      if (p.startsWith('/admin/admins')) return 'admins';
      if (p.startsWith('/admin/settings')) return 'settings';
      return 'dashboard';
    },
    currentTitle() {
      const found = this.menuItems.find((i) => i.view === this.currentView);
      return found ? found.title : 'Admin';
    },
    adminInitials() {
      if (!this.adminEmail) return 'AD';
      return this.adminEmail
        .split('@')[0]
        .split('.')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    },
  },
  watch: {
    '$route.path'() {
      this.fetchPendingApprovals();
    },
  },
  mounted() {
    this.onResize();
    window.addEventListener('resize', this.onResize);

    if (this.$nuxt && this.$nuxt.$on) {
      this.$nuxt.$on('approvals-changed', this.fetchPendingApprovals);
    }

    this.loadAdminSession();
    this._approvalPoll = setInterval(this.fetchPendingApprovals, 60_000);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
    if (this._approvalPoll) clearInterval(this._approvalPoll);
    if (this.$nuxt && this.$nuxt.$off) {
      this.$nuxt.$off('approvals-changed', this.fetchPendingApprovals);
    }
  },
  methods: {
    onResize() {
      this.isMobile = window.innerWidth < 960;
    },

    async getAuthHeaders() {
      try {
        const user = this.$fire?.auth?.currentUser;
        if (!user) return {};
        const token = await user.getIdToken();
        return { Authorization: `Bearer ${token}` };
      } catch (e) {
        console.warn('[AdminLayout] getIdToken failed:', e.message);
        return {};
      }
    },

    async loadAdminSession() {
      try {
        this.adminEmail = localStorage.getItem('admin_email');
        this.adminRole  = localStorage.getItem('admin_role');

        if (!this.adminRole) {
          const headers = await this.getAuthHeaders();
          if (Object.keys(headers).length) {
            try {
              const { data } = await axios.get(`${API}/admin/me`, { headers });
              const role = data?.admin?.role;
              if (role) {
                this.adminRole = role;
                localStorage.setItem('admin_role', role);
              }
            } catch (e) {
              console.warn('Could not resolve admin role:', e.message);
            }
          }
        }

        this.fetchPendingApprovals();
      } catch (e) {
        console.warn('loadAdminSession failed:', e.message);
      }
    },

    async fetchPendingApprovals() {
      if (!this.isSuperAdmin) {
        this.pendingApprovals = 0;
        return;
      }
      try {
        const headers = await this.getAuthHeaders();
        if (!Object.keys(headers).length) return;
        const { data } = await axios.get(`${API}/admin/approvals/count`, { headers });
        this.pendingApprovals = Number(data?.pending || 0);
      } catch (e) {}
    },

    go(path) {
      if (!path) return;
      if (this.$route.path === path) return;

      const result = this.$router.push(path);
      if (result && typeof result.catch === 'function') {
        result.catch((err) => {
          if (err && err.name !== 'NavigationDuplicated') {
            console.error('Nav error:', err);
          }
        });
      }
    },

    logout() {
      try {
        localStorage.removeItem('admin_email');
        localStorage.removeItem('admin_role');
      } catch (e) {
        console.warn(e.message);
      }
      this.adminEmail = null;
      this.adminRole = null;
      this.pendingApprovals = 0;
      this.$router.push('/admin/login');
    },
  },
};
</script>

<style scoped>
/* ...same styles as before, no changes... */
.admin-root {
  background: #0f0d24;
  font-family: inherit;
  display: flex;
  align-items: stretch;
  min-height: 100vh;
  width: 100%;
}

.admin-sidebar {
  width: 268px;
  flex-shrink: 0;
  background: linear-gradient(180deg, #0a0820 0%, #120f33 100%);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  align-self: flex-start;
  padding: 22px 0;
  overflow: hidden;
}
.admin-sidebar::before {
  content: "";
  position: absolute;
  width: 260px; height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(239, 68, 68, 0.18), transparent 70%);
  top: -80px; right: -80px;
  pointer-events: none;
}
.admin-sidebar::after {
  content: "";
  position: absolute;
  width: 200px; height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15), transparent 70%);
  bottom: -60px; left: -60px;
  pointer-events: none;
}
.brand-block {
  position: relative; z-index: 1;
  display: flex; align-items: center; gap: 12px;
  padding: 0 20px 22px; flex-shrink: 0;
}
.brand-mark {
  width: 42px; height: 42px; border-radius: 12px;
  background: linear-gradient(135deg, #dc2626, #ef4444);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 20px -6px rgba(239, 68, 68, 0.7);
  flex-shrink: 0; position: relative;
}
.brand-mark::after {
  content: ""; position: absolute; inset: 0; border-radius: inherit;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.25), transparent 60%);
}
.brand-name {
  font-size: 1.05rem; font-weight: 800; color: white;
  letter-spacing: -0.4px; line-height: 1.1;
}
.brand-sub {
  font-size: 0.68rem; color: rgba(255, 255, 255, 0.5);
  font-weight: 600; letter-spacing: 0.6px; margin-top: 2px;
  text-transform: uppercase;
}
.admin-chip {
  position: relative; z-index: 1;
  display: flex; align-items: center; gap: 10px;
  margin: 0 16px 22px; padding: 11px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px; backdrop-filter: blur(10px);
  flex-shrink: 0;
}
.admin-chip-avatar {
  background: linear-gradient(135deg, #dc2626, #ef4444) !important;
  color: white !important;
  font-size: 0.68rem !important; font-weight: 800;
  flex-shrink: 0;
}
.admin-chip-text { min-width: 0; flex: 1; }
.admin-chip-name {
  font-size: 0.75rem; font-weight: 700; color: white;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  line-height: 1.2;
}
.admin-chip-role {
  font-size: 0.62rem; color: rgba(255, 255, 255, 0.45);
  margin-top: 2px; text-transform: uppercase;
  letter-spacing: 0.5px; font-weight: 600;
}
.nav-list {
  position: relative; z-index: 1; flex: 1; overflow-y: auto;
  padding: 0 12px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}
.nav-list::-webkit-scrollbar { width: 4px; }
.nav-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1); border-radius: 2px;
}
.nav-item {
  width: 100%;
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px;
  background: transparent; border: none; border-radius: 10px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.85rem; font-weight: 500;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit; text-align: left;
  margin-bottom: 2px;
}
.nav-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: white; transform: translateX(2px);
}
.nav-item-active {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  color: white !important;
  box-shadow: 0 8px 22px -8px rgba(239, 68, 68, 0.75);
}
.nav-item-active .nav-icon-wrap {
  background: rgba(255, 255, 255, 0.15);
}
.nav-icon-wrap {
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
  transition: background 0.2s ease;
}
.nav-item:hover .nav-icon-wrap { background: rgba(255, 255, 255, 0.1); }
.nav-label { flex: 1; }

.nav-badge {
  min-width: 22px; height: 22px; padding: 0 7px;
  border-radius: 999px;
  background: #ef4444; color: #ffffff;
  font-size: 0.68rem; font-weight: 800;
  display: inline-flex; align-items: center; justify-content: center;
  letter-spacing: 0.2px;
  box-shadow: 0 4px 10px -2px rgba(239, 68, 68, 0.6);
  flex-shrink: 0;
}
.nav-item-active .nav-badge {
  background: rgba(255, 255, 255, 0.9);
  color: #dc2626; box-shadow: none;
}
.sidebar-footer {
  position: relative; z-index: 1;
  padding: 14px 16px 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  margin-top: 12px; flex-shrink: 0;
}
.logout-btn {
  width: 100%;
  display: flex; align-items: center; justify-content: center;
  padding: 11px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.22);
  border-radius: 10px;
  color: #fca5a5;
  font-size: 0.82rem; font-weight: 600;
  cursor: pointer;
  transition: all 0.22s ease;
  font-family: inherit;
}
.logout-btn:hover {
  background: rgba(239, 68, 68, 0.22);
  color: white;
  border-color: rgba(239, 68, 68, 0.4);
}

.admin-main {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column;
  background: #f8fafc;
  min-height: 100vh;
}
.admin-topbar {
  position: sticky; top: 0; z-index: 20;
  display: flex; align-items: center; gap: 12px;
  padding: 16px 28px;
  background: rgba(248, 250, 252, 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}
.topbar-title { min-width: 0; }
.topbar-heading {
  font-size: 1.25rem; font-weight: 800;
  color: #0f0d24; letter-spacing: -0.4px;
  margin: 0; line-height: 1.2;
}
.topbar-sub {
  font-size: 0.78rem; color: #64748b; margin: 3px 0 0;
  display: flex; align-items: center; gap: 6px;
}
.topbar-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}
.topbar-avatar {
  width: 40px; height: 40px; border-radius: 11px;
  background: linear-gradient(135deg, #dc2626, #ef4444);
  color: white; font-weight: 800; font-size: 0.78rem;
  display: flex; align-items: center; justify-content: center;
  letter-spacing: 0.5px;
  cursor: pointer; border: none;
  box-shadow: 0 6px 16px -6px rgba(239, 68, 68, 0.55);
  transition: all 0.2s ease; font-family: inherit;
}
.topbar-avatar:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px -6px rgba(239, 68, 68, 0.7);
}
.topbar-icon-btn {
  width: 40px; height: 40px; border-radius: 11px;
  background: white;
  border: 1px solid #e2e8f0;
  color: #475569;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0; position: relative;
}
.topbar-icon-btn:hover {
  border-color: #dc2626;
  color: #dc2626;
}
.topbar-bell-badge {
  position: absolute; top: -6px; right: -6px;
  min-width: 20px; height: 20px; padding: 0 6px;
  border-radius: 999px;
  background: #ef4444; color: white;
  font-size: 0.62rem; font-weight: 800;
  display: inline-flex; align-items: center; justify-content: center;
  border: 2px solid #f8fafc;
  letter-spacing: 0.2px;
}
.admin-content {
  flex: 1;
  padding: 24px 28px 40px;
  min-width: 0;
}
.admin-main-mobile .admin-content {
  padding: 16px 16px 96px;
}

.mobile-drawer {
  background: linear-gradient(180deg, #0a0820 0%, #120f33 100%) !important;
}
.mobile-drawer-inner {
  display: flex; flex-direction: column; height: 100%;
  padding: 22px 0;
}

.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0;
  z-index: 50;
  display: flex;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(14px);
  border-top: 1px solid #e2e8f0;
  padding: 6px 0;
  padding-bottom: max(6px, env(safe-area-inset-bottom));
  box-shadow: 0 -4px 20px -8px rgba(15, 13, 36, 0.08);
}
.bottom-nav-btn {
  flex: 1;
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  padding: 6px 4px;
  background: transparent; border: none;
  color: #94a3b8;
  font-size: 0.65rem; font-weight: 600;
  cursor: pointer; font-family: inherit;
  transition: all 0.2s ease;
  position: relative;
}
.bottom-nav-btn-active { color: #dc2626; }
.bottom-nav-btn-active::before {
  content: "";
  position: absolute; top: 0; left: 50%;
  transform: translateX(-50%);
  width: 24px; height: 3px;
  border-radius: 0 0 3px 3px;
  background: linear-gradient(135deg, #dc2626, #ef4444);
}
.bottom-nav-label { line-height: 1; }
.bottom-nav-badge {
  position: absolute; top: 2px; right: 50%;
  transform: translateX(20px);
  min-width: 16px; height: 16px; padding: 0 4px;
  border-radius: 999px;
  background: #ef4444; color: white;
  font-size: 0.55rem; font-weight: 800;
  display: inline-flex; align-items: center; justify-content: center;
  letter-spacing: 0.1px;
}
</style>