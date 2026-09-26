<template>
  <div class="d-flex bg-surface dashboard-root" style="min-height: 100vh;">
    <!-- Desktop sidebar -->
    <v-navigation-drawer
      v-if="!nav_bars"
      permanent
      width="260"
      class="elevation-1 sidebar-glass"
    >
      <div class="pa-6 pb-4">
        <div class="d-flex align-center cursor-pointer brand-hover" @click="goTo(dashboardRoute)">
          <v-avatar color="#8051FF" size="46" class="elevation-2 mr-3">
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
          :class="{ 'purple lighten-5 purple--text': isActive(item.route) }"
          :style="{ 'animation-delay': idx * 50 + 'ms' }"
        >
          <v-list-item-icon class="mr-3">
            <v-icon :color="isActive(item.route) ? '#8051FF' : 'grey'" size="22">
              {{ item.icon }}
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="font-weight-semibold text-body-2">
              {{ item.title }}
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action v-if="item.badge && item.badge > 0">
            <v-chip x-small color="red" text-color="white" class="font-weight-bold" style="font-size: 10px;">
              {{ item.badge }}
            </v-chip>
          </v-list-item-action>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-4 pb-6">
          <v-btn
            block
            outlined
            color="#8051FF"
            class="rounded-xl text-capitalize mt-3 font-weight-medium"
            @click="logout"
          >
            <v-icon left size="18" color="#8051FF">mdi-logout</v-icon>
            Sign Out
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Mobile bottom nav -->
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
        <v-badge
          v-if="item.badge && item.badge > 0"
          color="red"
          dot
          overlap
          offset-x="8"
          offset-y="4"
        ></v-badge>
      </v-btn>
    </v-bottom-navigation>

    <!-- Main -->
    <v-main :class="nav_bars ? 'pb-16' : ''" class="main-premium">
      <!-- Sticky header -->
      <div class="sticky-header-premium px-4 px-sm-6 py-3">
        <v-container fluid class="pa-0">
          <v-row align="center" no-gutters>
            <v-col cols="8" sm="6">
              <div class="d-flex align-center">
                <div>
                  <div class="d-flex align-center">
                    <h1 class="text-h6 text-sm-h5 font-weight-bold text--primary page-title">
                      Hi! {{ official.full_name || 'Official' }}
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
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    outlined
                    small
                    color="grey darken-1"
                    class="mr-2 refresh-btn"
                    :loading="loading"
                    @click="refreshAll"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon small>mdi-refresh</v-icon>
                  </v-btn>
                </template>
                <span>Refresh</span>
              </v-tooltip>

              <v-avatar color="#8051FF" size="36" class="ml-1">
                <span class="white--text font-weight-bold text-caption">{{ officialInitials }}</span>
              </v-avatar>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <v-container :fluid="nav_bars" class="px-4 px-sm-6 pt-2 pt-sm-4 pb-8">
        <!-- Estate info strip -->
        <v-row class="mb-4 reveal-card">
          <v-col cols="12">
            <v-card class="rounded-2xl pa-4" elevation="0" outlined>
              <div class="d-flex align-center flex-wrap">
                <v-avatar
                  v-if="estate.logo_url"
                  size="56"
                  class="mr-4 elevation-2"
                  tile
                >
                  <v-img :src="estate.logo_url" />
                </v-avatar>
                <v-avatar v-else color="#8051FF" size="56" class="mr-4 elevation-2">
                  <v-icon color="white" size="28">mdi-home-city</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-h6 font-weight-bold text--primary">
                    {{ estate.estate_name || '—' }}
                  </div>
                  <div class="text-caption text--secondary">
                    {{ estate.estate_location || '—' }}
                  </div>
                  <div class="text-caption purple--text mt-1 font-weight-medium">
                    {{ estate.estate_urn || '—' }}
                  </div>
                </div>
                <v-chip small label color="green lighten-5 green--text" class="font-weight-bold ml-2">
                  <v-icon x-small left color="green">mdi-check-circle</v-icon>
                  Active
                </v-chip>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- KPI cards -->
        <v-row dense class="mb-4 mb-sm-6">
          <!-- Total Households -->
          <v-col cols="6" md="3" class="reveal-card">
            <v-card
              outlined elevation="0"
              class="pa-4 rounded-2xl h-100 kpi-card-premium"
              style="cursor: pointer;"
              @click="goTo('/officials/residence')"
            >
              <div class="d-flex align-start justify-space-between mb-2">
                <div class="text-caption font-weight-bold text-uppercase tracking-wide text--secondary">
                  Households
                </div>
                <v-icon small color="#8051FF">mdi-home-group</v-icon>
              </div>
              <div class="text-h4 font-weight-bold text--primary">
                {{ formatNum(stats.totalHouseholds) }}
              </div>
              <div class="text-caption mt-1 text--secondary">
                {{ stats.activeHouseholds }} active
              </div>
            </v-card>
          </v-col>

          <!-- Pending approvals -->
          <v-col cols="6" md="3" class="reveal-card" style="animation-delay: 50ms">
            <v-card
              :color="stats.pendingApprovals > 0 ? '#d32f2f' : 'white'"
              :dark="stats.pendingApprovals > 0"
              outlined
              elevation="0"
              class="pa-4 rounded-2xl h-100 kpi-card-premium"
              style="cursor: pointer;"
              @click="goTo('/officials/pending')"
            >
              <div class="d-flex align-start justify-space-between mb-2">
                <div
                  class="text-caption font-weight-bold text-uppercase tracking-wide"
                  :class="stats.pendingApprovals > 0 ? '' : 'text--secondary'"
                >
                  Pending
                </div>
                <v-icon small :color="stats.pendingApprovals > 0 ? 'white' : '#ef6c00'">
                  {{ stats.pendingApprovals > 0 ? 'mdi-alert-circle' : 'mdi-clock-outline' }}
                </v-icon>
              </div>
              <div class="text-h4 font-weight-bold">
                {{ formatNum(stats.pendingApprovals) }}
              </div>
              <div class="text-caption mt-1" :style="stats.pendingApprovals > 0 ? 'opacity: 0.9;' : ''">
                {{ stats.pendingApprovals > 0 ? 'Need review' : 'All reviewed' }}
              </div>
            </v-card>
          </v-col>

          <!-- Collected YTD -->
          <v-col cols="6" md="3" class="reveal-card" style="animation-delay: 100ms">
            <v-card
              color="#8051FF" dark
              elevation="0"
              class="pa-4 rounded-2xl h-100"
              style="cursor: pointer;"
              @click="goTo('/officials/payments')"
            >
              <div class="d-flex align-start justify-space-between mb-2">
                <div class="text-caption font-weight-bold text-uppercase tracking-wide" style="opacity: 0.9;">
                  Collected YTD
                </div>
                <v-icon small color="white">mdi-cash-multiple</v-icon>
              </div>
              <div class="text-h4 font-weight-bold">
                {{ formatNum(stats.collectedYTD) }}
              </div>
              <div class="text-caption mt-1" style="opacity: 0.8;">
                KES this year
              </div>
            </v-card>
          </v-col>

          <!-- Arrears -->
          <v-col cols="6" md="3" class="reveal-card" style="animation-delay: 150ms">
            <v-card
              outlined elevation="0"
              class="pa-4 rounded-2xl h-100 kpi-card-premium"
              style="cursor: pointer;"
              @click="goTo('/officials/payments')"
            >
              <div class="d-flex align-start justify-space-between mb-2">
                <div class="text-caption font-weight-bold text-uppercase tracking-wide text--secondary">
                  Arrears
                </div>
                <v-icon small color="#ef6c00">mdi-alert-outline</v-icon>
              </div>
              <div class="text-h4 font-weight-bold text--primary">
                {{ formatNum(stats.arrears) }}
              </div>
              <div class="text-caption mt-1 text--secondary">
                KES outstanding
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Quick actions -->
        <v-row class="mb-4 reveal-card" style="animation-delay: 200ms">
          <v-col cols="12">
            <v-card class="rounded-2xl pa-4 pa-sm-5" elevation="0" outlined>
              <div class="d-flex align-center mb-3">
                <v-avatar color="purple lighten-5" size="36" class="mr-3">
                  <v-icon color="#8051FF">mdi-lightning-bolt</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold text--primary">Quick actions</div>
                  <div class="text-caption text--secondary">Common tasks for your estate</div>
                </div>
              </div>

              <v-row dense>
                <v-col cols="6" sm="3" v-for="action in quickActions" :key="action.title">
                  <v-btn
                    block
                    rounded
                    large
                    elevation="0"
                    :color="action.color"
                    :dark="action.dark"
                    class="text-capitalize py-4 hover-lift"
                    @click="goTo(action.route)"
                  >
                    <div class="d-flex flex-column align-center">
                      <v-icon :color="action.dark ? 'white' : action.color" size="24" class="mb-1">
                        {{ action.icon }}
                      </v-icon>
                      <span
                        class="font-weight-semibold"
                        :style="{
                          fontSize: '0.78rem',
                          color: action.dark ? 'white' : '#1e293b'
                        }"
                      >
                        {{ action.title }}
                      </span>
                    </div>
                  </v-btn>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <!-- Recent payments -->
        <v-row class="reveal-card" style="animation-delay: 250ms">
          <v-col cols="12">
            <v-card class="rounded-2xl" elevation="0" outlined>
              <v-card-title class="px-4 px-sm-6 py-4 card-header-premium d-flex align-center">
                <v-avatar color="green lighten-5" size="36" class="mr-3">
                  <v-icon color="green darken-2">mdi-cash-clock</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold text--primary">Recent payments</div>
                  <div class="text-caption text--secondary">Latest transactions in your estate</div>
                </div>
                <v-spacer></v-spacer>
                <v-btn
                  text small color="#8051FF"
                  class="text-capitalize font-weight-medium hidden-xs-only"
                  @click="goTo('/officials/payments')"
                >
                  View all
                </v-btn>
              </v-card-title>
              <v-divider></v-divider>

              <v-list class="pa-0" v-if="recentPayments.length">
                <v-list-item
                  v-for="p in recentPayments"
                  :key="p.payment_id || p.id"
                  class="py-3 px-4 px-sm-6 hover-row"
                >
                  <v-list-item-avatar color="green lighten-5" size="40">
                    <v-icon color="green darken-2" small>mdi-cash-check</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title class="font-weight-semibold text--primary">
                      {{ p.transaction_id }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-caption text--secondary">
                      {{ p.payment_method }} · {{ formatDate(p.payment_date || p.created_at) }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <span class="font-weight-bold text--primary">
                      KES {{ formatNum(p.amount_paid) }}
                    </span>
                  </v-list-item-action>
                </v-list-item>
              </v-list>

              <div v-else-if="!loading" class="pa-12 text-center">
                <v-icon size="56" color="grey lighten-2">mdi-receipt-text-outline</v-icon>
                <div class="text-h6 grey--text text--darken-1 mt-3">No payments yet</div>
                <div class="text-body-2 grey--text">Payments from your residents will appear here.</div>
              </div>

              <div v-else class="pa-6">
                <v-skeleton-loader type="list-item-two-line, list-item-two-line, list-item-two-line" />
              </div>
            </v-card>
          </v-col>
        </v-row>
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
    /**
     * ⚡ Dashboard URL — official's home for their estate.
     */
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
    quickActions() {
      return [
        {
          title: 'Approve',
          icon: 'mdi-account-check',
          route: '/officials/pending',
          color: '#8051FF',
          dark: true,
        },
        {
          title: 'Add charge',
          icon: 'mdi-tag-plus',
          route: '/officials/charges',
          color: '#f3ffd9',
          dark: false,
        },
        {
          title: 'Residents',
          icon: 'mdi-home-group',
          route: '/officials/residence',
          color: '#f1f5f9',
          dark: false,
        },
        {
          title: 'Reports',
          icon: 'mdi-chart-bar',
          route: '/officials/payments',
          color: '#f1f5f9',
          dark: false,
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
    // AUTH — resolve the official + their estate
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
      // If the URL has an estate id, prefer it; otherwise use the one from official
      const routeId = this.$route?.params?.id;
      this.estateId = routeId ? Number(routeId) : this.official.estate_id;

      if (this.estateId) {
        await Promise.all([
          this.fetchEstate(),
          this.fetchStats(),
          this.fetchRecentPayments(),
        ]);
      }
      this.loading = false;
    },

    // =====================================================
    // FETCH OFFICIAL (name + role + estate_id)
    // =====================================================
    async fetchOfficial() {
      const that = this;
      try {
        const url = `${API}/officials/getOfficialById/${that.uid}`;
        console.log('🔵 GET', url);
        const { data, status } = await axios.get(url);
        if (status === 200) {
          that.official = {
            full_name: data.full_name || '',
            role: data.role || '',
            estate_id: data.estate_id || null,
          };
          console.log('🔵 Official loaded:', that.official);
        }
      } catch (error) {
        console.error('🔴 Official fetch failed:', error.response?.data || error.message);
        that.showSnackbar('Could not load your official profile', 'error');
      }
    },

    // =====================================================
    // FETCH ESTATE
    // =====================================================
    async fetchEstate() {
      const that = this;
      if (!that.estateId) return;
      try {
        const url = `${API}/estates/estate/${that.estateId}`;
        console.log('🔵 GET', url);
        const { data, status } = await axios.get(url);
        if (status === 200) {
          that.estate = {
            estate_name: data.estate_name || '',
            estate_location: data.estate_location || '',
            estate_urn: data.estate_urn || '',
            logo_url: data.logo_url || '',
          };
          console.log('🔵 Estate loaded:', that.estate);
        }
      } catch (error) {
        console.error('🔴 Estate fetch failed:', error.response?.data || error.message);
      }
    },

    // =====================================================
    // FETCH STATS
    // =====================================================
    async fetchStats() {
      const that = this;
      if (!that.estateId) return;

      // Households (count total + active)
      try {
        const { data } = await axios.get(`${API}/households/getBHsHldEstId/${that.estateId}`);
        const list = Array.isArray(data) ? data : [];
        that.stats.totalHouseholds = list.length;
        that.stats.activeHouseholds = list.filter((h) => h.active === 1 || h.active === true).length;
        console.log('🔵 Households:', that.stats.totalHouseholds, 'active:', that.stats.activeHouseholds);
      } catch (err) {
        console.warn('Households stats failed:', err.response?.data || err.message);
      }

      // Pending approvals
      try {
        const { data } = await axios.get(`${API}/households/estate/${that.estateId}/pending`);
        const list = Array.isArray(data) ? data : [];
        that.stats.pendingApprovals = list.length;
        console.log('🔵 Pending approvals:', that.stats.pendingApprovals);
      } catch (err) {
        console.warn('Pending approvals failed:', err.response?.data || err.message);
        that.stats.pendingApprovals = 0;
      }

      // Payments — compute YTD and total collected
      try {
        const { data } = await axios.get(`${API}/payments/getByEstateId/${that.estateId}`);
        const list = Array.isArray(data) ? data : [];
        const year = new Date().getFullYear();
        const ytd = list.filter((p) => {
          const d = p.payment_date || p.created_at;
          if (!d) return false;
          return new Date(d).getFullYear() === year;
        });
        that.stats.collectedYTD = ytd.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
        console.log('🔵 Collected YTD:', that.stats.collectedYTD);
      } catch (err) {
        console.warn('Payments stats failed:', err.response?.data || err.message);
      }

      // Arrears — placeholder until we have the summary endpoint
      that.stats.arrears = 0;
    },

    // =====================================================
    // RECENT PAYMENTS
    // =====================================================
    async fetchRecentPayments() {
      const that = this;
      if (!that.estateId) return;
      try {
        const { data } = await axios.get(`${API}/payments/getByEstateId/${that.estateId}`);
        const list = Array.isArray(data) ? data : [];
        // Sort newest first, take 10
        that.recentPayments = list
          .slice()
          .sort((a, b) => new Date(b.payment_date || b.created_at) - new Date(a.payment_date || a.created_at))
          .slice(0, 10);
        console.log('🔵 Recent payments:', that.recentPayments.length);
      } catch (err) {
        console.warn('Recent payments failed:', err.response?.data || err.message);
        that.recentPayments = [];
      }
    },

    // =====================================================
    // FORMATTERS
    // =====================================================
    formatNum(n) {
      return numeral(n || 0).format('0,0');
    },
    formatDate(d) {
      if (!d) return '';
      try {
        return new Date(d).toISOString().slice(0, 10);
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
.cursor-pointer { cursor: pointer; }
.bg-surface { background-color: #f8fafc !important; }
.rounded-2xl { border-radius: 20px !important; }
.h-100 { height: 100%; }
.tracking-wide { letter-spacing: 0.08em; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.reveal-card { animation: fadeInUp 0.6s ease-out both; }

.sidebar-glass {
  background: rgba(255, 255, 255, 0.95) !important;
  border-right: 1px solid #e2e8f0 !important;
}
.brand-text { letter-spacing: -0.5px; }
.brand-hover { transition: opacity 0.2s; }
.brand-hover:hover { opacity: 0.8; }

.nav-item-premium {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 4px;
  border-radius: 12px !important;
}
.nav-item-premium:hover {
  background-color: rgba(128, 81, 255, 0.06);
  transform: translateX(4px);
}

.main-premium { scroll-behavior: smooth; }
.sticky-header-premium {
  position: sticky;
  top: 0;
  z-index: 5;
  background: rgba(248, 250, 252, 0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid transparent;
}
.page-title { letter-spacing: -0.5px; }
.refresh-btn { transition: all 0.2s ease; }
.refresh-btn:hover { border-color: #8051FF; color: #8051FF !important; }

.kpi-card-premium {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e2e8f0;
  background: white;
}
.kpi-card-premium:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06) !important;
  border-color: #cbd5e1;
}

.card-header-premium {
  background: linear-gradient(to bottom, #ffffff, #f8fafc);
}

.hover-row { transition: background-color 0.2s ease; }
.hover-row:hover { background-color: #f8fafc !important; }

.hover-lift {
  transition: all 0.25s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08) !important;
}

.snackbar-premium ::v-deep .v-snackbar__content { padding: 12px 20px; }

.bottom-nav-premium {
  border-top: 1px solid #e2e8f0 !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(12px);
}
.mobile-nav-btn { min-width: 0 !important; }
.mobile-nav-label { font-size: 10px; margin-top: 2px; }

@media (max-width: 599px) {
  .sticky-header-premium { padding-left: 12px; padding-right: 12px; }
  .reveal-card { animation-duration: 0.4s; }
  .kpi-card-premium { padding: 16px !important; }
}
</style>