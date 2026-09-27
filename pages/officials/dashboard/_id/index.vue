<template>
  <div class="d-flex bg-surface dashboard-root" style="min-height: 100vh;">
    <!-- ============================================================
         DESKTOP SIDEBAR
         ============================================================ -->
    <v-navigation-drawer
      v-if="!nav_bars"
      permanent
      width="260"
      class="elevation-0 sidebar-glass"
    >
      <div class="pa-6 pb-4">
        <div class="d-flex align-center cursor-pointer brand-hover" @click="goTo(dashboardRoute)">
          <v-avatar color="#8051FF" size="46" class="elevation-3 mr-3 brand-avatar">
            <v-icon color="white" size="24">mdi-shield-account</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold purple--text brand-text">Makaazi</div>
            <div class="text-caption text--secondary font-weight-medium">Official Console</div>
          </div>
        </div>
      </div>

      <v-divider class="mx-4 mb-2 opacity-30"></v-divider>

      <v-list dense nav class="px-3 py-2">
        <v-list-item
          v-for="(item, idx) in menuItems"
          :key="item.title"
          @click="goTo(item.route)"
          link
          class="mb-1 rounded-xl nav-item-premium"
          :class="{ 'nav-item-active': isActive(item.route) }"
          :style="{ 'animation-delay': idx * 50 + 'ms' }"
        >
          <v-list-item-icon class="mr-3">
            <v-icon :color="isActive(item.route) ? '#8051FF' : 'grey'" size="22">
              {{ item.icon }}
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title
              class="font-weight-semibold text-body-2"
              :class="{ 'purple--text': isActive(item.route) }"
            >
              {{ item.title }}
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action v-if="item.badge && item.badge > 0">
            <div class="nav-badge">{{ item.badge > 99 ? '99+' : item.badge }}</div>
          </v-list-item-action>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-4 pb-6">
          <div class="help-card mb-4">
            <v-icon color="#8051FF" size="22" class="mb-2">mdi-lifebuoy</v-icon>
            <div class="help-title">Questions?</div>
            <div class="help-sub">Contact your estate admin</div>
          </div>
          <v-btn
            block outlined color="#8051FF"
            class="rounded-xl text-capitalize font-weight-medium signout-btn"
            @click="logout"
          >
            <v-icon left size="18" color="#8051FF">mdi-logout</v-icon>
            Sign Out
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- ============================================================
         MOBILE BOTTOM NAV
         ============================================================ -->
    <v-bottom-navigation
      v-if="nav_bars"
      v-model="activeTab"
      color="#8051FF"
      grow
      fixed
      class="elevation-8 bottom-nav-premium"
      style="z-index: 100;"
      height="64"
    >
      <v-btn
        v-for="item in bottomMenuItems"
        :key="item.title"
        @click="goTo(item.route)"
        :value="item.route"
        class="mobile-nav-btn"
      >
        <v-icon size="22">{{ item.icon }}</v-icon>
        <span class="mobile-nav-label">{{ item.title }}</span>
        <span
          v-if="item.badge && item.badge > 0"
          class="mobile-badge"
        >{{ item.badge > 9 ? '9+' : item.badge }}</span>
      </v-btn>
    </v-bottom-navigation>

    <!-- ============================================================
         MAIN
         ============================================================ -->
    <v-main :class="nav_bars ? 'pb-16' : ''" class="main-premium">
      <!-- HEADER -->
      <div class="sticky-header-premium px-4 px-sm-6 py-4">
        <v-container fluid class="pa-0">
          <v-row align="center" no-gutters>
            <v-col cols="8" sm="6">
              <div class="d-flex align-center">
                <div class="header-text">
                  <div class="d-flex align-center flex-wrap">
                    <h1 class="text-h6 text-sm-h5 font-weight-bold text--primary page-title">
                      Hi, {{ firstName }} 👋
                    </h1>
                    <v-chip
                      x-small
                      color="purple lighten-5 purple--text"
                      class="ml-2 font-weight-bold hidden-xs-only"
                      label
                    >
                      {{ official.role || 'Official' }}
                    </v-chip>
                  </div>
                  <div class="d-flex align-center mt-1">
                    <v-icon x-small color="success" class="mr-1">mdi-circle</v-icon>
                    <span class="text-caption text--secondary">
                      {{ estate.estate_name || 'Loading estate...' }}
                    </span>
                  </div>
                </div>
              </div>
            </v-col>
            <v-col cols="4" sm="6" class="d-flex justify-end align-center">
              <button
                class="icon-btn mr-2"
                :disabled="loading"
                @click="refreshAll"
              >
                <v-icon size="16" :class="{ spin: loading }">
                  {{ loading ? 'mdi-loading' : 'mdi-refresh' }}
                </v-icon>
              </button>

              <v-avatar color="#8051FF" size="38" class="ml-1 avatar-glow">
                <span class="white--text font-weight-bold text-caption">{{ officialInitials }}</span>
              </v-avatar>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <v-container :fluid="nav_bars" class="px-4 px-sm-6 pt-3 pt-sm-5 pb-8">
        <!-- ============================================================
             ESTATE INFO STRIP
             ============================================================ -->
        <div class="estate-strip reveal-card">
          <div class="estate-logo">
            <v-img v-if="estate.logo_url" :src="estate.logo_url" />
            <v-icon v-else size="26" color="white">mdi-home-city</v-icon>
          </div>
          <div class="estate-info">
            <div class="estate-name">{{ estate.estate_name || '—' }}</div>
            <div class="estate-loc">
              <v-icon size="12" color="#94a3b8">mdi-map-marker-outline</v-icon>
              {{ estate.estate_location || '—' }}
            </div>
            <div class="estate-urn">
              <v-icon size="12" color="#8051FF">mdi-identifier</v-icon>
              {{ estate.estate_urn || '—' }}
            </div>
          </div>
          <div class="estate-status">
            <v-icon size="14">mdi-check-circle</v-icon>
            Active
          </div>
        </div>

        <!-- ============================================================
             KPI CARDS
             ============================================================ -->
        <div class="kpi-grid">
          <!-- Households -->
          <div class="kpi kpi-light reveal-card" @click="goTo('/officials/residence')">
            <div class="kpi-top">
              <div class="kpi-icon kpi-icon-purple">
                <v-icon size="20" color="white">mdi-home-group</v-icon>
              </div>
            </div>
            <div class="kpi-label">Households</div>
            <div class="kpi-value">{{ formatNum(stats.totalHouseholds) }}</div>
            <div class="kpi-foot kpi-foot-muted">
              <v-icon size="12" color="#10b981">mdi-circle</v-icon>
              {{ stats.activeHouseholds }} active
            </div>
          </div>

          <!-- Pending -->
          <div
            class="kpi reveal-card"
            :class="stats.pendingApprovals > 0 ? 'kpi-alert' : 'kpi-light'"
            style="animation-delay: 50ms"
            @click="goTo('/officials/pending')"
          >
            <div class="kpi-top">
              <div
                class="kpi-icon"
                :class="stats.pendingApprovals > 0 ? 'kpi-icon-white' : 'kpi-icon-amber'"
              >
                <v-icon
                  size="20"
                  :color="stats.pendingApprovals > 0 ? '#0A0A14' : 'white'"
                >
                  {{ stats.pendingApprovals > 0 ? 'mdi-alert-circle' : 'mdi-clock-outline' }}
                </v-icon>
              </div>
              <div v-if="stats.pendingApprovals > 0" class="kpi-pulse"></div>
            </div>
            <div class="kpi-label" :class="{ 'kpi-label-dark': stats.pendingApprovals > 0 }">
              Pending
            </div>
            <div class="kpi-value" :class="{ 'kpi-value-dark': stats.pendingApprovals > 0 }">
              {{ formatNum(stats.pendingApprovals) }}
            </div>
            <div
              class="kpi-foot"
              :class="stats.pendingApprovals > 0 ? 'kpi-foot-light' : 'kpi-foot-muted'"
            >
              {{ stats.pendingApprovals > 0 ? 'Need review' : 'All reviewed' }}
            </div>
          </div>

          <!-- Collected YTD -->
          <div class="kpi kpi-dark reveal-card" style="animation-delay: 100ms" @click="goTo('/officials/payments')">
            <div class="kpi-top">
              <div class="kpi-icon kpi-icon-white">
                <v-icon size="20" color="#0A0A14">mdi-cash-multiple</v-icon>
              </div>
            </div>
            <div class="kpi-label kpi-label-dark">Collected YTD</div>
            <div class="kpi-value kpi-value-dark">{{ formatNum(stats.collectedYTD) }}</div>
            <div class="kpi-foot kpi-foot-light">KES this year</div>
          </div>

          <!-- Arrears -->
          <div class="kpi kpi-light reveal-card" style="animation-delay: 150ms" @click="goTo('/officials/payments')">
            <div class="kpi-top">
              <div class="kpi-icon kpi-icon-amber">
                <v-icon size="20" color="white">mdi-alert-outline</v-icon>
              </div>
            </div>
            <div class="kpi-label">Arrears</div>
            <div class="kpi-value">{{ formatNum(stats.arrears) }}</div>
            <div class="kpi-foot kpi-foot-warn">KES outstanding</div>
          </div>
        </div>

        <!-- ============================================================
             QUICK ACTIONS — medium tiles
             ============================================================ -->
        <div class="panel-card mt-4 reveal-card" style="animation-delay: 200ms">
          <div class="panel-head">
            <div class="panel-icon panel-icon-purple">
              <v-icon size="20" color="white">mdi-lightning-bolt</v-icon>
            </div>
            <div class="panel-title-group">
              <div class="panel-title">Quick actions</div>
              <div class="panel-sub">Common tasks for your estate</div>
            </div>
          </div>

          <div class="actions-grid">
            <button
              v-for="action in quickActions"
              :key="action.title"
              class="action-tile"
              :class="`action-tile-${action.tone}`"
              @click="goTo(action.route)"
            >
              <div class="action-icon" :class="`action-icon-${action.tone}`">
                <v-icon size="22" color="white">{{ action.icon }}</v-icon>
              </div>
              <span class="action-title">{{ action.title }}</span>
            </button>
          </div>
        </div>

        <!-- ============================================================
             RECENT PAYMENTS
             ============================================================ -->
        <div class="panel-card mt-4 reveal-card" style="animation-delay: 250ms">
          <div class="panel-head">
            <div class="panel-icon panel-icon-lime">
              <v-icon size="20" color="#0A0A14">mdi-cash-clock</v-icon>
            </div>
            <div class="panel-title-group">
              <div class="panel-title">Recent payments</div>
              <div class="panel-sub">Latest transactions in your estate</div>
            </div>
            <button
              class="view-all-btn hidden-xs-only"
              @click="goTo('/officials/payments')"
            >
              View all
              <v-icon size="14" class="ml-1">mdi-arrow-right</v-icon>
            </button>
          </div>

          <div v-if="recentPayments.length" class="payments-list">
            <div
              v-for="p in recentPayments"
              :key="p.payment_id || p.id"
              class="payment-row"
            >
              <div class="payment-icon">
                <v-icon size="18" color="#3f6b00">mdi-cash-check</v-icon>
              </div>
              <div class="payment-body">
                <div class="payment-title">{{ p.transaction_id }}</div>
                <div class="payment-sub">
                  {{ p.payment_method }} · {{ formatDate(p.payment_date || p.created_at) }}
                </div>
              </div>
              <div class="payment-amount">
                <span class="payment-currency">KES</span>
                <span class="payment-value">{{ formatNum(p.amount_paid) }}</span>
              </div>
            </div>
          </div>

          <div v-else-if="!loading" class="empty-block">
            <div class="empty-icon">
              <v-icon size="36" color="#cbd5e1">mdi-receipt-text-outline</v-icon>
            </div>
            <div class="empty-title">No payments yet</div>
            <div class="empty-sub">Payments from your residents will appear here.</div>
          </div>

          <div v-else class="pa-6">
            <v-skeleton-loader type="list-item-two-line, list-item-two-line, list-item-two-line" />
          </div>
        </div>
      </v-container>

      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        :timeout="4000"
        bottom
        rounded="pill"
        class="mb-6 snackbar-premium"
        elevation="6"
      >
        <div class="d-flex align-center">
          <v-avatar :color="snackbar.color === 'success' ? 'success darken-2' : 'error darken-2'" size="28" class="mr-3">
            <v-icon color="white" small>{{ snackbar.color === 'success' ? 'mdi-check' : 'mdi-alert' }}</v-icon>
          </v-avatar>
          <span class="font-weight-medium">{{ snackbar.text }}</span>
        </div>
      </v-snackbar>
    </v-main>
  </div>
</template>

<script>
import axios from 'axios';
import numeral from 'numeral';

const API = 'https://makaaziserver22.up.railway.app/api';

export default {
  name: 'OfficialDashboard',
  data() {
    return {
      nav_bars: false,
      activeTab: '/officials/dashboard',

      loading: false,
      uid: null,
      estateId: null,

      official: {
        full_name: '',
        role: '',
        estate_id: null,
      },
      estate: {
        estate_name: '',
        estate_location: '',
        estate_urn: '',
        logo_url: '',
      },
      stats: {
        totalHouseholds: 0,
        activeHouseholds: 0,
        pendingApprovals: 0,
        collectedYTD: 0,
        arrears: 0,
      },
      recentPayments: [],

      snackbar: { show: false, text: '', color: 'success' },
    };
  },
  computed: {
    dashboardRoute() {
      return this.estateId
        ? `/officials/dashboard/${this.estateId}`
        : '/officials/dashboard';
    },
    menuItems() {
      return [
        { title: 'Dashboard', icon: 'mdi-view-dashboard', route: this.dashboardRoute },
        { title: 'Pending',   icon: 'mdi-account-clock',  route: '/officials/pending',   badge: this.stats.pendingApprovals },
        { title: 'Residents', icon: 'mdi-home-group',     route: '/officials/residence' },
        { title: 'Payments',  icon: 'mdi-currency-usd',   route: '/officials/payments' },
        { title: 'Charges',   icon: 'mdi-tag-multiple',   route: '/officials/charges' },
        { title: 'Team',      icon: 'mdi-account-supervisor', route: '/officials/team' },
        { title: 'Cash',      icon: 'mdi-cash-register',  route: '/officials/cash' },
      ];
    },
    bottomMenuItems() {
      return [
        { title: 'Home',      icon: 'mdi-view-dashboard', route: this.dashboardRoute },
        { title: 'Pending',   icon: 'mdi-account-clock',  route: '/officials/pending', badge: this.stats.pendingApprovals },
        { title: 'Payments',  icon: 'mdi-currency-usd',   route: '/officials/payments' },
        { title: 'Settings',  icon: 'mdi-cog',            route: '/officials/settings' },
      ];
    },
    officialInitials() {
      const name = this.official.full_name || 'O';
      return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    },
    firstName() {
      const n = (this.official.full_name || '').trim();
      if (!n) return 'Official';
      return n.split(/\s+/)[0];
    },
    quickActions() {
      return [
        {
          title: 'Approve',
          icon: 'mdi-account-check',
          route: '/officials/pending',
          tone: 'primary',
        },
        {
          title: 'Add charge',
          icon: 'mdi-tag-plus',
          route: '/officials/charges',
          tone: 'lime',
        },
        {
          title: 'Residents',
          icon: 'mdi-home-group',
          route: '/officials/residence',
          tone: 'slate',
        },
        {
          title: 'Reports',
          icon: 'mdi-chart-bar',
          route: '/officials/payments',
          tone: 'slate',
        },
      ];
    },
  },
  mounted() {
    this.onResize();
    window.addEventListener('resize', this.onResize);
    this.waitForAuthAndLoad();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
    if (this._authUnsub) this._authUnsub();
  },
  methods: {
    onResize() {
      this.nav_bars = window.innerWidth < 768;
    },
    isActive(route) {
      return this.$route && this.$route.path === route;
    },
    goTo(path) {
      if (!path) return;
      if (this.$route && this.$route.path === path) return;
      try {
        if (this.$router && typeof this.$router.push === 'function') {
          const result = this.$router.push(path);
          if (result && typeof result.catch === 'function') {
            result.catch((err) => {
              if (err && err.name !== 'NavigationDuplicated') {
                console.error('Nav error:', err);
              }
            });
          }
        } else {
          window.location.href = path;
        }
      } catch (err) {
        console.error('goTo failed:', err);
        window.location.href = path;
      }
    },

    // =====================================================
    // AUTH
    // =====================================================
    waitForAuthAndLoad() {
      const that = this;
      const current = that.$fire?.auth?.currentUser;
      if (current && current.uid) {
        that.uid = current.uid;
        that.refreshAll();
        return;
      }
      that._authUnsub = that.$fire.auth.onAuthStateChanged((user) => {
        if (user && user.uid) {
          that.uid = user.uid;
          that.refreshAll();
          if (that._authUnsub) {
            that._authUnsub();
            that._authUnsub = null;
          }
        } else {
          that.showSnackbar('Please sign in as an official', 'error');
        }
      });
    },

    async refreshAll() {
      if (!this.uid) return;
      this.loading = true;
      await this.fetchOfficial();
      const routeId = this.$route?.params?.id;
      this.estateId = routeId ? Number(routeId) : this.official.estate_id;

      if (this.estateId) {
        await Promise.allSettled([
          this.fetchEstate(),
          this.fetchStats(),
          this.fetchRecentPayments(),
        ]);
      }
      this.loading = false;
    },

    async fetchOfficial() {
      try {
        const url = `${API}/officials/getOfficialById/${this.uid}`;
        const { data, status } = await axios.get(url);
        if (status === 200) {
          this.official = {
            full_name: data.full_name || '',
            role: data.role || '',
            estate_id: data.estate_id || null,
          };
        }
      } catch (error) {
        console.error('Official fetch failed:', error.response?.data || error.message);
        this.showSnackbar('Could not load your official profile', 'error');
      }
    },

    async fetchEstate() {
      if (!this.estateId) return;
      try {
        const { data, status } = await axios.get(`${API}/estates/estate/${this.estateId}`);
        if (status === 200) {
          this.estate = {
            estate_name: data.estate_name || '',
            estate_location: data.estate_location || '',
            estate_urn: data.estate_urn || '',
            logo_url: data.logo_url || '',
          };
        }
      } catch (error) {
        console.error('Estate fetch failed:', error.response?.data || error.message);
      }
    },

    async fetchStats() {
      if (!this.estateId) return;

      // Households
      try {
        const { data } = await axios.get(`${API}/households/getBHsHldEstId/${this.estateId}`);
        const list = Array.isArray(data) ? data : [];
        this.stats.totalHouseholds = list.length;
        this.stats.activeHouseholds = list.filter((h) => h.active === 1 || h.active === true).length;
      } catch (err) {
        console.warn('Households stats failed:', err.response?.data || err.message);
      }

      // Pending approvals
      try {
        const { data } = await axios.get(`${API}/households/estate/${this.estateId}/pending`);
        const list = Array.isArray(data) ? data : [];
        this.stats.pendingApprovals = list.length;
      } catch (err) {
        console.warn('Pending approvals failed:', err.response?.data || err.message);
        this.stats.pendingApprovals = 0;
      }

      // Payments YTD
      try {
        const { data } = await axios.get(`${API}/payments/getByEstateId/${this.estateId}`);
        const list = Array.isArray(data) ? data : [];
        const year = new Date().getFullYear();
        const ytd = list.filter((p) => {
          const d = p.payment_date || p.created_at;
          if (!d) return false;
          return new Date(d).getFullYear() === year;
        });
        this.stats.collectedYTD = ytd.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
      } catch (err) {
        console.warn('Payments stats failed:', err.response?.data || err.message);
      }

      // Arrears — placeholder until summary endpoint exists
      this.stats.arrears = 0;
    },

    async fetchRecentPayments() {
      if (!this.estateId) return;
      try {
        const { data } = await axios.get(`${API}/payments/getByEstateId/${this.estateId}`);
        const list = Array.isArray(data) ? data : [];
        this.recentPayments = list
          .slice()
          .sort((a, b) => new Date(b.payment_date || b.created_at) - new Date(a.payment_date || a.created_at))
          .slice(0, 10);
      } catch (err) {
        console.warn('Recent payments failed:', err.response?.data || err.message);
        this.recentPayments = [];
      }
    },

    formatNum(n) {
      return numeral(n || 0).format('0,0');
    },
    formatDate(d) {
      if (!d) return '';
      try {
        return new Date(d).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      } catch {
        return '';
      }
    },
    showSnackbar(text, color = 'success') {
      this.snackbar = { show: true, text, color };
    },
    logout() {
      if (this.$fire?.auth) this.$fire.auth.signOut();
      this.$router.push('/');
    },
  },
};
</script>

<style scoped>
/* ============================================================
   BASE
   ============================================================ */
.cursor-pointer { cursor: pointer; }
.bg-surface { background-color: #f6f7fb !important; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
.reveal-card { animation: fadeInUp 0.5s ease-out both; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 1s linear infinite; }

/* ============================================================
   SIDEBAR
   ============================================================ */
.sidebar-glass {
  background: #ffffff !important;
  border-right: 1px solid #eef1f6 !important;
}
.brand-text { letter-spacing: -0.5px; }
.brand-hover { transition: opacity 0.2s; }
.brand-hover:hover { opacity: 0.85; }
.brand-avatar {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%) !important;
  box-shadow: 0 12px 24px -12px rgba(128, 81, 255, 0.7);
}
.nav-item-premium {
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 4px;
  border-radius: 12px !important;
}
.nav-item-premium:hover {
  background-color: rgba(128, 81, 255, 0.06);
  transform: translateX(3px);
}
.nav-item-active { background: rgba(128, 81, 255, 0.09) !important; }

.nav-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
  color: #ffffff;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  box-shadow: 0 4px 10px -4px rgba(220, 38, 38, 0.6);
}

.help-card {
  padding: 14px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(128, 81, 255, 0.08) 0%, rgba(155, 108, 255, 0.04) 100%);
  border: 1px solid rgba(128, 81, 255, 0.12);
}
.help-title { font-size: 0.82rem; font-weight: 800; color: #0f0d24; }
.help-sub { font-size: 0.7rem; color: #64748b; margin-top: 2px; }
.signout-btn:hover { background: rgba(128, 81, 255, 0.06); }

/* ============================================================
   HEADER
   ============================================================ */
.main-premium { scroll-behavior: smooth; }
.sticky-header-premium {
  position: sticky;
  top: 0;
  z-index: 5;
  background: rgba(246, 247, 251, 0.85);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}
.page-title { letter-spacing: -0.6px; }
.header-text { min-width: 0; }

.icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #eef1f6;
  color: #475569;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.icon-btn:hover:not(:disabled) {
  border-color: #8051ff;
  color: #8051ff;
}
.icon-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.avatar-glow { box-shadow: 0 8px 18px -8px rgba(128, 81, 255, 0.6); }

/* ============================================================
   ESTATE STRIP
   ============================================================ */
.estate-strip {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  background: #ffffff;
  border: 1px solid #eef1f6;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.03);
  flex-wrap: wrap;
}
.estate-logo {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 12px 24px -12px rgba(128, 81, 255, 0.7);
}
.estate-info { flex: 1; min-width: 0; }
.estate-name {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.estate-loc {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.76rem;
  color: #64748b;
  margin-top: 3px;
  font-weight: 500;
}
.estate-urn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: #8051ff;
  margin-top: 3px;
  font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, monospace;
}
.estate-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(122, 184, 0, 0.14);
  color: #3f6b00;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  flex-shrink: 0;
}

/* ============================================================
   KPI CARDS
   ============================================================ */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  margin-top: 16px;
}
.kpi {
  position: relative;
  padding: 18px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.28s ease;
  overflow: hidden;
}
.kpi:hover {
  transform: translateY(-3px);
}

.kpi-light {
  background: #ffffff;
  border: 1px solid #eef1f6;
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.03);
}
.kpi-light:hover { box-shadow: 0 22px 40px -20px rgba(15, 13, 36, 0.15); }

.kpi-dark {
  background: linear-gradient(140deg, #0a0a14 0%, #221047 55%, #2b1256 100%);
  border: none;
  box-shadow: 0 22px 44px -22px rgba(34, 16, 71, 0.55);
}
.kpi-dark:hover { box-shadow: 0 26px 50px -22px rgba(34, 16, 71, 0.7); }

.kpi-alert {
  background: linear-gradient(140deg, #dc2626 0%, #b91c1c 100%);
  border: none;
  color: #ffffff;
  box-shadow: 0 22px 44px -22px rgba(220, 38, 38, 0.6);
}
.kpi-alert:hover { box-shadow: 0 26px 50px -22px rgba(220, 38, 38, 0.75); }

.kpi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.kpi-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.kpi-icon-purple {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.7);
}
.kpi-icon-amber {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 10px 22px -10px rgba(245, 158, 11, 0.6);
}
.kpi-icon-white {
  background: #ffffff;
  box-shadow: 0 10px 22px -10px rgba(255, 255, 255, 0.5);
}
.kpi-pulse {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  animation: kpiPulse 1.8s infinite;
}
@keyframes kpiPulse {
  0%   { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
  70%  { box-shadow: 0 0 0 12px rgba(255, 255, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
}

.kpi-label {
  font-size: 0.64rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  margin-bottom: 4px;
}
.kpi-label-dark { color: rgba(255, 255, 255, 0.65); }

.kpi-value {
  font-size: 1.9rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -1px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.kpi-value-dark { color: #ffffff; }

.kpi-foot {
  margin-top: 10px;
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 5px;
}
.kpi-foot-muted { color: #94a3b8; }
.kpi-foot-warn  { color: #b45309; }
.kpi-foot-light { color: rgba(255, 255, 255, 0.85); }

/* ============================================================
   PANEL (quick actions, payments)
   ============================================================ */
.panel-card {
  background: #ffffff;
  border: 1px solid #eef1f6;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.03);
}
.panel-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
}
.panel-title-group { flex: 1; min-width: 0; }
.panel-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.panel-icon-purple {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.7);
}
.panel-icon-lime {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  box-shadow: 0 10px 22px -10px rgba(182, 255, 0, 0.6);
}
.panel-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
}
.panel-sub {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 2px;
  font-weight: 500;
}
.view-all-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(128, 81, 255, 0.08);
  border: 1px solid rgba(128, 81, 255, 0.18);
  color: #8051ff;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}
.view-all-btn:hover {
  background: rgba(128, 81, 255, 0.14);
  border-color: rgba(128, 81, 255, 0.35);
}

/* ============================================================
   QUICK ACTIONS — medium tiles
   ============================================================ */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 16px 20px 20px;
}

.action-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 8px;
  border-radius: 14px;
  border: 1px solid #eef1f6;
  background: #ffffff;
  cursor: pointer;
  font-family: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.action-tile:hover {
  transform: translateY(-2px);
  border-color: rgba(128, 81, 255, 0.35);
  box-shadow: 0 14px 26px -16px rgba(128, 81, 255, 0.5);
}

.action-tile-primary {
  background: linear-gradient(135deg, #0a0a14 0%, #221047 55%, #2b1256 100%);
  border-color: transparent;
  box-shadow: 0 12px 24px -16px rgba(34, 16, 71, 0.6);
}
.action-tile-primary:hover {
  box-shadow: 0 16px 30px -16px rgba(34, 16, 71, 0.75);
}
.action-tile-primary .action-title { color: #ffffff; }

.action-tile-lime {
  background: linear-gradient(135deg, #f7ffe0 0%, #eaffb8 100%);
  border-color: rgba(122, 184, 0, 0.25);
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.action-icon-primary {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 8px 16px -8px rgba(128, 81, 255, 0.8);
}
.action-icon-lime {
  background: linear-gradient(135deg, #a8e000 0%, #8fbc00 100%);
  box-shadow: 0 8px 16px -8px rgba(122, 184, 0, 0.7);
}
.action-icon-slate {
  background: linear-gradient(135deg, #475569 0%, #334155 100%);
  box-shadow: 0 8px 16px -8px rgba(71, 85, 105, 0.6);
}

.action-title {
  font-size: 0.76rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.2px;
  text-align: center;
  line-height: 1.2;
}

/* ============================================================
   RECENT PAYMENTS
   ============================================================ */
.payments-list { padding: 6px 0; }
.payment-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 20px;
  transition: background 0.15s ease;
}
.payment-row:hover { background: #fafbff; }
.payment-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: rgba(122, 184, 0, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.payment-body { flex: 1; min-width: 0; }
.payment-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.payment-sub {
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 2px;
  font-weight: 500;
}
.payment-amount {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.payment-currency {
  font-size: 0.62rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.payment-value {
  font-size: 0.92rem;
  font-weight: 800;
  color: #0f0d24;
  font-variant-numeric: tabular-nums;
}

/* Empty */
.empty-block {
  padding: 56px 24px;
  text-align: center;
}
.empty-icon {
  width: 76px;
  height: 76px;
  border-radius: 22px;
  background: #f6f7fb;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
}
.empty-title {
  font-size: 0.9rem;
  font-weight: 800;
  color: #0f0d24;
}
.empty-sub {
  font-size: 0.76rem;
  color: #94a3b8;
  margin-top: 4px;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
}

/* ============================================================
   SNACKBAR + MOBILE NAV
   ============================================================ */
.snackbar-premium ::v-deep .v-snackbar__content { padding: 12px 20px; }

.bottom-nav-premium {
  border-top: 1px solid #eef1f6 !important;
  background: rgba(255, 255, 255, 0.96) !important;
  backdrop-filter: blur(14px);
}
.mobile-nav-btn { min-width: 0 !important; position: relative; }
.mobile-nav-label { font-size: 10px; margin-top: 2px; font-weight: 700; }
.mobile-badge {
  position: absolute;
  top: 6px;
  right: calc(50% - 22px);
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: #dc2626;
  color: #ffffff;
  font-size: 0.55rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 767px) {
  .kpi-value { font-size: 1.5rem; }
  .kpi { padding: 16px; }
  .estate-strip { padding: 16px; gap: 14px; }
  .estate-logo { width: 52px; height: 52px; }
  .estate-name { font-size: 0.95rem; }
  .panel-head { padding: 14px 16px; }
  .payment-row { padding: 12px 16px; }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 14px 16px 18px;
  }
}

@media (max-width: 599px) {
  .sticky-header-premium { padding-left: 12px; padding-right: 12px; }
  .reveal-card { animation-duration: 0.4s; }
}
</style>