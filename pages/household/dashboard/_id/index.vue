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
            <v-icon color="white" size="24">mdi-home-city</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold purple--text brand-text">Makaazi</div>
            <div class="text-caption text--secondary font-weight-medium">Resident Console</div>
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
        v-for="item in menuItems"
        :key="item.title"
        @click="goTo(item.route)"
        :value="item.route"
        class="mobile-nav-btn"
      >
        <v-icon size="22">{{ item.icon }}</v-icon>
        <span class="mobile-nav-label">{{ item.title }}</span>
      </v-btn>
    </v-bottom-navigation>

    <!-- Main -->
    <v-main :class="nav_bars ? 'pb-16' : ''" class="main-premium">
      <div class="sticky-header-premium px-4 px-sm-6 py-3">
        <v-container fluid class="pa-0">
          <v-row align="center" no-gutters>
            <v-col cols="8" sm="6">
              <div class="d-flex align-center">
                <div>
                  <div class="d-flex align-center">
                    <h1 class="text-h6 text-sm-h5 font-weight-bold text--primary page-title">
                      Hi! {{ household.primary_owner || 'Resident' }}
                    </h1>
                    <v-chip
                      x-small
                      color="purple lighten-5 purple--text"
                      class="ml-2 font-weight-bold hidden-xs-only"
                      label
                    >
                      Resident
                    </v-chip>
                  </div>
                  <div class="d-flex align-center mt-1">
                    <v-icon x-small color="success" class="mr-1">mdi-circle</v-icon>
                    <span class="text-caption text--secondary">Welcome back</span>
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
                <v-img :src="avatarUrl" />
              </v-avatar>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <v-container :fluid="nav_bars" class="px-4 px-sm-6 pt-2 pt-sm-4 pb-8">
        <!-- KPI cards -->
        <v-row dense class="mb-4 mb-sm-6">
          <v-col cols="6" md="6" class="reveal-card">
            <v-card outlined elevation="0" class="pa-4 pa-sm-5 rounded-2xl h-100 kpi-card-premium">
              <div class="d-flex align-start justify-space-between mb-2">
                <div class="text-caption font-weight-bold text-uppercase mb-1 tracking-wide text--secondary">
                  Month Eqv
                </div>
                <v-icon small :color="numbers.overdue > 0 ? 'red darken-2' : 'green darken-2'">
                  {{ numbers.overdue > 0 ? 'mdi-alert-circle-outline' : 'mdi-check-circle-outline' }}
                </v-icon>
              </div>
              <div class="text-h4 font-weight-bold text--primary">
                {{ formatNum(numbers.months_equivalent) }}
              </div>
              <div
                class="text-caption mt-1 font-weight-medium"
                :class="numbers.overdue > 0 ? 'red--text' : 'green--text'"
              >
                {{ numbers.overdue > 0 ? 'Overdue' : 'Prepaid' }}
                {{ formatSigned(numbers.overdue > 0 ? -numbers.overdue : numbers.prepaid) }}
              </div>
            </v-card>
          </v-col>

          <v-col cols="6" md="6" class="reveal-card" style="animation-delay: 100ms">
            <v-card color="#8051FF" dark elevation="0" class="pa-4 pa-sm-5 rounded-2xl h-100">
              <div class="d-flex justify-space-between align-start">
                <div>
                  <div class="text-caption font-weight-bold text-uppercase mb-1 tracking-wide" style="opacity: 0.85;">
                    Total Paid
                  </div>
                  <div class="text-h5 font-weight-bold">
                    {{ formatNum(numbers.total_paid) }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-caption font-weight-bold text-uppercase mb-1 tracking-wide" style="opacity: 0.85;">
                    Due YTD
                  </div>
                  <div class="text-h5 font-weight-bold">
                    {{ formatNum(numbers.due_to_date) }}
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Make payment -->
        <v-row class="mb-4 reveal-card" style="animation-delay: 150ms">
          <v-col cols="12" class="d-flex justify-center">
            <v-btn
              rounded
              large
              elevation="0"
              color="#eeeeee"
              class="pay-btn text-capitalize"
              @click="goTo('/household/make_payment')"
            >
              <v-icon left color="#8051FF">mdi-wallet</v-icon>
              <span style="color: black; text-transform: none; font-weight: 600;">Make payment</span>
            </v-btn>
          </v-col>
        </v-row>

        <!-- Recent payments -->
        <v-row class="reveal-card" style="animation-delay: 200ms">
          <v-col cols="12">
            <v-card class="rounded-2xl" elevation="0" outlined>
              <v-card-title class="px-4 px-sm-6 py-4 card-header-premium d-flex align-center">
                <v-avatar color="purple lighten-5" size="36" class="mr-3">
                  <v-icon color="#8051FF">mdi-history</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold text--primary">Recent payments</div>
                  <div class="text-caption text--secondary">Your latest transactions</div>
                </div>
                <v-spacer></v-spacer>
                <v-text-field
                  v-model="search"
                  placeholder="Search"
                  dense
                  outlined
                  rounded
                  hide-details
                  prepend-inner-icon="mdi-magnify"
                  class="search-field-premium hidden-xs-only"
                  style="max-width: 220px"
                  clearable
                />
              </v-card-title>
              <v-divider></v-divider>

              <v-list class="pa-0" v-if="filteredPayments.length">
                <v-list-item
                  v-for="p in filteredPayments"
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
                      {{ formatNum(p.amount_paid) }}
                    </span>
                  </v-list-item-action>
                </v-list-item>
              </v-list>

              <div v-else-if="!loading" class="pa-12 text-center">
                <v-icon size="56" color="grey lighten-2">mdi-receipt-text-outline</v-icon>
                <div class="text-h6 grey--text text--darken-1 mt-3">No payments yet</div>
                <div class="text-body-2 grey--text">Your payment history will appear here.</div>
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
  name: 'HouseholdDashboard',
  data() {
    return {
      nav_bars: false,
      activeTab: '/household/dashboard',

      loading: false,
      uid: null,
      householdId: null,
      household: { primary_owner: '', section: '', court: '', street: '' },
      numbers: {
        months_equivalent: 0,
        total_paid: 0,
        due_to_date: 0,
        overdue: 0,
        prepaid: 0,
        monthly_rate: 0,
        annual_due: 0,
        status: 'Paid',
      },
      payments: [],
      search: '',
      snackbar: { show: false, text: '', color: 'success' },
    };
  },
  computed: {
    /**
     * ⚡ Dashboard URL matches /household/dashboard/:uid route
     * (folder has _id.vue, so the URL needs the uid).
     */
    dashboardRoute() {
      return this.uid
        ? `/household/dashboard/${this.uid}`
        : '/household/dashboard';
    },
    menuItems() {
      return [
        { title: 'Dashboard', icon: 'mdi-view-dashboard', route: this.dashboardRoute },
        { title: 'Payments',  icon: 'mdi-currency-usd',   route: '/household/payment_summary' },
        { title: 'Profile',   icon: 'mdi-account',        route: '/household/profile' },
        { title: 'Alerts',    icon: 'mdi-bell',           route: '/household/notifications' },
      ];
    },
    avatarUrl() {
      const name = this.household.primary_owner || 'Resident';
      return `https://ui-avatars.com/api/?background=8051FF&color=fff&name=${encodeURIComponent(name)}`;
    },
    filteredPayments() {
      if (!this.search) return this.payments;
      const q = this.search.toLowerCase();
      return this.payments.filter(
        (p) =>
          (p.transaction_id || '').toLowerCase().includes(q) ||
          (p.payment_method || '').toLowerCase().includes(q)
      );
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
    // AUTH — reads UID from Firebase
    // =====================================================
    waitForAuthAndLoad() {
      const that = this;

      const current = that.$fire?.auth?.currentUser;
      if (current && current.uid) {
        that.uid = current.uid;
        console.log('🔵 Dashboard UID (immediate):', that.uid);
        that.refreshAll();
        return;
      }

      console.log('🔵 Waiting for Firebase Auth...');
      that._authUnsub = that.$fire.auth.onAuthStateChanged((user) => {
        if (user && user.uid) {
          that.uid = user.uid;
          console.log('🔵 Dashboard UID (from listener):', that.uid);
          that.refreshAll();

          if (that._authUnsub) {
            that._authUnsub();
            that._authUnsub = null;
          }
        } else {
          console.warn('🔴 No Firebase user signed in');
          that.showSnackbar('Please sign in to view your dashboard', 'error');
        }
      });
    },

    async refreshAll() {
      if (!this.uid) {
        console.warn('🔴 refreshAll called with no UID');
        return;
      }
      this.loading = true;
      await Promise.all([
        this.Fetch_Dashboard(),
        this.Fetch_RecentPayments(),
      ]);
      this.loading = false;
    },

    // =====================================================
    // FETCH DASHBOARD
    // =====================================================
    async Fetch_Dashboard() {
      const that = this;
      const url = `${API}/households/dashboard/${that.uid}`;
      console.log('🔵 GET', url);

      try {
        const { data, status } = await axios.get(url);
        console.log('🔵 Dashboard response:', status, data);

        if (status === 200) {
          that.household = {
            primary_owner: data.primary_owner || '',
            section: data.section || '',
            court: data.court || '',
            street: data.street || '',
          };
          that.numbers = {
            months_equivalent: Number(data.months_equivalent) || 0,
            total_paid: Number(data.total_paid) || 0,
            due_to_date: Number(data.due_to_date) || 0,
            overdue: Number(data.overdue) || 0,
            prepaid: Number(data.prepaid) || 0,
            monthly_rate: Number(data.monthly_rate) || 0,
            annual_due: Number(data.annual_due) || 0,
            status: data.status || 'Paid',
          };
        }
      } catch (error) {
        console.error('🔴 Dashboard fetch error:', {
          url,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });

        if (error.response?.status === 404) {
          that.showSnackbar('No household found for your account', 'error');
        } else {
          that.showSnackbar(error.response?.data?.error || 'Failed to load dashboard', 'error');
        }
      }
    },

    // =====================================================
    // RECENT PAYMENTS — uses /households/:id/payments
    // =====================================================
    async Fetch_RecentPayments() {
      const that = this;
      try {
        // Resolve household_id from UID
        const hh = await axios.get(`${API}/households/getHouseHoldId/${that.uid}`);
        const householdId = hh.data?.household_id;
        that.householdId = householdId;
        console.log('🔵 Household ID resolved:', householdId);
        if (!householdId) return;

        const url = `${API}/households/${householdId}/payments`;
        console.log('🔵 GET', url);
        const { data, status } = await axios.get(url);

        if (status === 200) {
          that.payments = Array.isArray(data) ? data.slice(0, 10) : [];
          console.log('🔵 Payments loaded:', that.payments.length);
        }
      } catch (error) {
        console.warn('Recent payments failed:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        that.payments = [];
      }
    },

    // =====================================================
    // FORMATTERS
    // =====================================================
    formatNum(n) {
      return numeral(n || 0).format('0,0');
    },
    formatSigned(n) {
      const v = numeral(Math.abs(n || 0)).format('0,0');
      return n < 0 ? `-(${v})` : v;
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
      this.$router.push('/login');
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
  transition: all 0.3s ease;
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

.pay-btn { max-width: 260px; }

.card-header-premium {
  background: linear-gradient(to bottom, #ffffff, #f8fafc);
}

.hover-row { transition: background-color 0.2s ease; }
.hover-row:hover { background-color: #f8fafc !important; }

.search-field-premium ::v-deep .v-input__slot { transition: all 0.25s ease; }
.search-field-premium ::v-deep .v-input__slot:hover,
.search-field-premium.v-input--is-focused ::v-deep .v-input__slot {
  box-shadow: 0 2px 8px rgba(128, 81, 255, 0.1);
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