<template>
  <div class="d-flex bg-surface dashboard-root" style="min-height: 100vh;">
    <!-- Desktop sidebar -->
    <v-navigation-drawer
      v-if="!nav_bars"
      permanent
      width="260"
      class="elevation-0 sidebar-glass"
    >
      <div class="pa-6 pb-4">
        <div class="d-flex align-center cursor-pointer brand-hover" @click="goTo(dashboardRoute)">
          <v-avatar color="#8051FF" size="46" class="elevation-3 mr-3 brand-avatar">
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
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-4 pb-6">
          <div class="help-card mb-4">
            <v-icon color="#8051FF" size="22" class="mb-2">mdi-lifebuoy</v-icon>
            <div class="help-title">Need help?</div>
            <div class="help-sub">Contact your estate office</div>
          </div>
          <v-btn
            block
            outlined
            color="#8051FF"
            class="rounded-xl text-capitalize font-weight-medium signout-btn"
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
      <div class="sticky-header-premium px-4 px-sm-6 py-4">
        <v-container fluid class="pa-0">
          <v-row align="center" no-gutters>
            <v-col cols="8" sm="6">
              <div class="d-flex align-center">
                <div class="greeting-block">
                  <div class="d-flex align-center">
                    <h1 class="text-h6 text-sm-h5 font-weight-bold text--primary page-title">
                      Hi, {{ firstName }} 👋
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
                    <v-icon x-small :color="statusColor" class="mr-1">mdi-circle</v-icon>
                    <span class="text-caption text--secondary">{{ statusLabel }}</span>
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

              <v-avatar color="#8051FF" size="38" class="ml-1 avatar-glow">
                <v-img :src="avatarUrl" />
              </v-avatar>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <v-container :fluid="nav_bars" class="px-4 px-sm-6 pt-3 pt-sm-5 pb-8">
        <!-- Account info strip -->
        <v-row dense class="mb-5 reveal-card" style="animation-delay: 40ms">
          <v-col cols="12">
            <div class="account-strip">
              <div class="strip-item">
                <div class="strip-icon strip-icon-purple">
                  <v-icon size="16" color="white">mdi-identifier</v-icon>
                </div>
                <div>
                  <div class="strip-label">Account No.</div>
                  <div class="strip-value mono">{{ shortUid }}</div>
                </div>
              </div>

              <div class="strip-divider"></div>

              <div class="strip-item">
                <div class="strip-icon strip-icon-lime">
                  <v-icon size="16" color="#0A0A14">mdi-office-building-outline</v-icon>
                </div>
                <div>
                  <div class="strip-label">Estate</div>
                  <div class="strip-value">{{ household.estate_name || '—' }}</div>
                </div>
              </div>

              <div class="strip-divider"></div>

              <div class="strip-item strip-item-grow">
                <div class="strip-icon strip-icon-amber">
                  <v-icon size="16" color="white">mdi-map-marker-outline</v-icon>
                </div>
                <div>
                  <div class="strip-label">Address</div>
                  <div class="strip-value">{{ addressLine }}</div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- KPI cards -->
        <v-row dense class="mb-4 mb-sm-5">
          <v-col cols="6" md="6" class="reveal-card">
            <div class="kpi-card kpi-card-light">
              <div class="kpi-head">
                <div class="kpi-icon kpi-icon-purple">
                  <v-icon size="20" color="white">mdi-calendar-check-outline</v-icon>
                </div>
                <div class="kpi-badge" :class="numbers.overdue > 0 ? 'kpi-badge-warn' : 'kpi-badge-ok'">
                  <v-icon size="12" color="white">
                    {{ numbers.overdue > 0 ? 'mdi-alert' : 'mdi-check' }}
                  </v-icon>
                </div>
              </div>
              <div class="kpi-label">Month Equivalent</div>
              <div class="kpi-value">{{ formatNum(numbers.months_equivalent) }}</div>
              <div class="kpi-foot" :class="numbers.overdue > 0 ? 'kpi-foot-warn' : 'kpi-foot-ok'">
                {{ numbers.overdue > 0 ? 'Overdue' : 'Prepaid' }}
                <span class="kpi-foot-value">
                  {{ formatSigned(numbers.overdue > 0 ? -numbers.overdue : numbers.prepaid) }}
                </span>
              </div>
            </div>
          </v-col>

          <v-col cols="6" md="6" class="reveal-card" style="animation-delay: 100ms">
            <div class="kpi-card kpi-card-dark">
              <div class="kpi-head">
                <div class="kpi-icon kpi-icon-white">
                  <v-icon size="20" color="#0A0A14">mdi-cash-multiple</v-icon>
                </div>
              </div>
              <div class="kpi-dark-pair">
                <div>
                  <div class="kpi-label-dark">Total Paid</div>
                  <div class="kpi-value-dark">{{ formatNum(numbers.total_paid) }}</div>
                </div>
                <div class="kpi-dark-right">
                  <div class="kpi-label-dark">Due YTD</div>
                  <div class="kpi-value-dark">{{ formatNum(numbers.due_to_date) }}</div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Outstanding balance alert -->
        <v-row v-if="numbers.overdue > 0" class="mb-4 reveal-card" style="animation-delay: 130ms">
          <v-col cols="12">
            <div class="overdue-banner">
              <div class="overdue-icon">
                <v-icon size="22" color="white">mdi-alert-outline</v-icon>
              </div>
              <div class="overdue-body">
                <div class="overdue-title">Outstanding balance</div>
                <div class="overdue-sub">
                  You owe <strong>KES {{ formatNum(numbers.overdue) }}</strong> for this period.
                </div>
              </div>
              <button class="overdue-btn" @click="goTo('/household/make_payment')">
                Settle now
                <v-icon size="16" class="ml-1">mdi-arrow-right</v-icon>
              </button>
            </div>
          </v-col>
        </v-row>

        <!-- Make payment CTA -->
        <v-row class="mb-5 reveal-card" style="animation-delay: 150ms">
          <v-col cols="12">
            <button class="pay-cta" @click="goTo('/household/make_payment')">
              <div class="pay-cta-icon">
                <v-icon size="24" color="#8051FF">mdi-wallet</v-icon>
              </div>
              <div class="pay-cta-body">
                <div class="pay-cta-title">Make a payment</div>
                <div class="pay-cta-sub">Pay via M-Pesa in seconds</div>
              </div>
              <v-icon size="22" color="#8051FF" class="pay-cta-chevron">mdi-chevron-right</v-icon>
            </button>
          </v-col>
        </v-row>

        <!-- ============================================================
             VEHICLES (NEW)
             ============================================================ -->
        <v-row class="mb-5 reveal-card" style="animation-delay: 175ms">
          <v-col cols="12">
            <div class="vehicles-card">
              <div class="vehicles-head">
                <div class="vehicles-head-left">
                  <div class="vehicles-icon">
                    <v-icon size="20" color="#8051FF">mdi-car</v-icon>
                  </div>
                  <div>
                    <div class="vehicles-title">My vehicles</div>
                    <div class="vehicles-sub">
                      {{ vehicles.length ? `${vehicles.length} registered` : 'None yet' }}
                    </div>
                  </div>
                </div>
                <button class="vehicles-action" @click="goTo('/household/vehicles')">
                  Manage
                  <v-icon size="14" class="ml-1">mdi-arrow-right</v-icon>
                </button>
              </div>

              <div v-if="vehicles.length" class="vehicles-mini-list">
                <div
                  v-for="v in vehicles.slice(0, 3)"
                  :key="v.vehicle_id"
                  class="vehicle-mini"
                >
                  <div class="vehicle-mini-icon">
                    <v-icon size="16" color="white">{{ iconFor(v.vehicle_type) }}</v-icon>
                  </div>
                  <div class="vehicle-mini-body">
                    <div class="vehicle-mini-plate">{{ v.plate_number }}</div>
                    <div class="vehicle-mini-sub">
                      {{ [v.make, v.model].filter(Boolean).join(' ') || '—' }}
                    </div>
                  </div>
                  <v-chip
                    x-small label class="status-chip"
                    :color="statusColorFor(v.status)"
                    :style="statusStyleFor(v.status)"
                  >{{ v.status }}</v-chip>
                </div>

                <div v-if="vehicles.length > 3" class="vehicles-more">
                  + {{ vehicles.length - 3 }} more
                </div>
              </div>

              <div v-else class="vehicles-empty">
                <v-icon size="32" color="#cbd5e1">mdi-car-off</v-icon>
                <div class="vehicles-empty-title">No vehicles registered</div>
                <div class="vehicles-empty-sub">
                  Add your cars, bikes, or vans so the gate recognises them.
                </div>
                <button class="vehicles-empty-btn" @click="goTo('/household/vehicles')">
                  Add a vehicle
                </button>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- ============================================================
             VISITORS / VISITOR PASSES (NEW)
             ============================================================ -->
        <v-row class="mb-5 reveal-card" style="animation-delay: 185ms">
          <v-col cols="12">
            <button class="visitors-cta" @click="goTo('/household/visitor_passes')">
              <div class="visitors-icon">
                <v-icon size="22" color="#8051FF">mdi-ticket-confirmation-outline</v-icon>
              </div>
              <div class="visitors-body">
                <div class="visitors-title">Visitor passes</div>
                <div class="visitors-sub">
                  {{ activePassCount > 0
                     ? `${activePassCount} active pass${activePassCount > 1 ? 'es' : ''}`
                     : 'Invite a visitor and share a code' }}
                </div>
              </div>
              <v-icon size="22" color="#8051FF" class="visitors-chevron">mdi-chevron-right</v-icon>
            </button>
          </v-col>
        </v-row>

        <!-- Recent payments -->
        <v-row class="reveal-card" style="animation-delay: 200ms">
          <v-col cols="12">
            <div class="payments-card">
              <div class="payments-head">
                <div class="payments-head-left">
                  <div class="payments-icon">
                    <v-icon size="20" color="#8051FF">mdi-history</v-icon>
                  </div>
                  <div>
                    <div class="payments-title">Recent payments</div>
                    <div class="payments-sub">Your latest transactions</div>
                  </div>
                </div>
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
              </div>

              <div v-if="filteredPayments.length" class="payments-list">
                <div
                  v-for="p in filteredPayments"
                  :key="p.payment_id || p.id"
                  class="payment-row"
                >
                  <div class="payment-row-icon">
                    <v-icon size="18" color="#3f6b00">mdi-cash-check</v-icon>
                  </div>
                  <div class="payment-row-body">
                    <div class="payment-row-title">{{ p.transaction_id }}</div>
                    <div class="payment-row-sub">
                      {{ p.payment_method }} · {{ formatDate(p.payment_date || p.created_at) }}
                    </div>
                  </div>
                  <div class="payment-row-amount">
                    <span class="payment-currency">KES</span>
                    <span class="payment-value">{{ formatNum(p.amount_paid) }}</span>
                  </div>
                </div>
              </div>

              <div v-else-if="!loading" class="payments-empty">
                <div class="payments-empty-icon">
                  <v-icon size="40" color="#cbd5e1">mdi-receipt-text-outline</v-icon>
                </div>
                <div class="payments-empty-title">No payments yet</div>
                <div class="payments-empty-sub">Your payment history will appear here.</div>
              </div>

              <div v-else class="pa-6">
                <v-skeleton-loader type="list-item-two-line, list-item-two-line, list-item-two-line" />
              </div>
            </div>
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
      household: {
        primary_owner: '',
        section: '',
        court: '',
        street: '',
        estate_name: '',
        status: '',
      },
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
      vehicles: [],
      activePassCount: 0,
      search: '',
      snackbar: { show: false, text: '', color: 'success' },
    };
  },
  computed: {
    dashboardRoute() {
      return this.uid
        ? `/household/dashboard/${this.uid}`
        : '/household/dashboard';
    },
    menuItems() {
      return [
        { title: 'Dashboard', icon: 'mdi-view-dashboard', route: this.dashboardRoute },
        { title: 'Vehicles',  icon: 'mdi-car',            route: '/household/vehicles' },
        { title: 'Visitors',  icon: 'mdi-ticket-confirmation-outline', route: '/household/visitor_passes' },
        { title: 'Payments',  icon: 'mdi-currency-usd',   route: '/household/payment_summary' },
        { title: 'Profile',   icon: 'mdi-account',        route: '/household/profile' },
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
    firstName() {
      const n = (this.household.primary_owner || '').trim();
      if (!n) return 'Resident';
      return n.split(/\s+/)[0];
    },
    statusLabel() {
      if (this.numbers.overdue > 0) {
        return `Outstanding · KES ${this.formatNum(this.numbers.overdue)}`;
      }
      return 'Welcome back · All caught up';
    },
    statusColor() {
      return this.numbers.overdue > 0 ? 'amber darken-2' : 'success';
    },
    shortUid() {
      if (!this.uid) return '—';
      return this.uid.length > 12 ? `${this.uid.slice(0, 6)}…${this.uid.slice(-4)}` : this.uid;
    },
    addressLine() {
      const parts = [this.household.section, this.household.court, this.household.street].filter(Boolean);
      return parts.length ? parts.join(' · ') : '—';
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
          that.showSnackbar('Please sign in to view your dashboard', 'error');
        }
      });
    },

    async refreshAll() {
      if (!this.uid) return;
      this.loading = true;
      await Promise.allSettled([
        this.Fetch_Dashboard(),
        this.Fetch_RecentPayments(),
        this.Fetch_Vehicles(),
        this.Fetch_VisitorPasses(),
      ]);
      this.loading = false;
    },

    async Fetch_Dashboard() {
      const that = this;
      try {
        const { data, status } = await axios.get(`${API}/households/dashboard/${that.uid}`);
        if (status === 200) {
          that.household = {
            primary_owner: data.primary_owner || '',
            section: data.section || '',
            court: data.court || '',
            street: data.street || '',
            estate_name: data.estate_name || '',
            status: data.status || '',
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
        if (error.response?.status === 404) {
          that.showSnackbar('No household found for your account', 'error');
        } else {
          that.showSnackbar(error.response?.data?.error || 'Failed to load dashboard', 'error');
        }
      }
    },

    async Fetch_RecentPayments() {
      const that = this;
      try {
        const hh = await axios.get(`${API}/households/getHouseHoldId/${that.uid}`);
        const householdId = hh.data?.household_id;
        that.householdId = householdId;
        if (!householdId) return;

        const { data, status } = await axios.get(`${API}/households/${householdId}/payments`);
        if (status === 200) {
          that.payments = Array.isArray(data) ? data.slice(0, 10) : [];
        }
      } catch (error) {
        that.payments = [];
      }
    },

    async Fetch_Vehicles() {
      try {
        const { data } = await axios.get(`${API}/vehicles/mine`);
        this.vehicles = Array.isArray(data) ? data : [];
      } catch (error) {
        // Silent fail — vehicle card is additive to the dashboard
        this.vehicles = [];
      }
    },

    async Fetch_VisitorPasses() {
      try {
        const { data } = await axios.get(`${API}/visitor-passes/mine`);
        const list = Array.isArray(data) ? data : [];
        const now = Date.now();
        this.activePassCount = list.filter(
          (p) => p.status === 'Active' && new Date(p.valid_until).getTime() > now
        ).length;
      } catch (error) {
        this.activePassCount = 0;
      }
    },

    iconFor(type) {
      return {
        car:       'mdi-car',
        motorbike: 'mdi-motorbike',
        truck:     'mdi-truck',
        van:       'mdi-van-utility',
      }[type] || 'mdi-car-estate';
    },
    statusColorFor(status) {
      return {
        Active:    '#d1fae5',
        Pending:   '#fef3c7',
        Suspended: '#fee2e2',
        Removed:   '#e5e7eb',
      }[status] || '#e5e7eb';
    },
    statusStyleFor(status) {
      return {
        Active:    'color:#065f46;',
        Pending:   'color:#92400e;',
        Suspended: 'color:#991b1b;',
        Removed:   'color:#374151;',
      }[status] || 'color:#374151;';
    },

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
        return new Date(d).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric',
        });
      } catch { return ''; }
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
/* ============================================================
   BASE
   ============================================================ */
.cursor-pointer { cursor: pointer; }
.bg-surface { background-color: #f6f7fb !important; }
.mono { font-family: ui-monospace, SFMono-Regular, monospace; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
.reveal-card { animation: fadeInUp 0.5s ease-out both; }

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
.nav-item-active {
  background: rgba(128, 81, 255, 0.09) !important;
}

.help-card {
  padding: 14px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(128, 81, 255, 0.08) 0%, rgba(155, 108, 255, 0.04) 100%);
  border: 1px solid rgba(128, 81, 255, 0.12);
}
.help-title { font-size: 0.82rem; font-weight: 800; color: #0f0d24; }
.help-sub { font-size: 0.7rem; color: #64748b; margin-top: 2px; }

.signout-btn { transition: all 0.2s ease; }
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
.greeting-block { min-width: 0; }

.refresh-btn {
  transition: all 0.2s ease;
  background: #ffffff !important;
}
.refresh-btn:hover {
  border-color: #8051FF;
  color: #8051FF !important;
}

.avatar-glow {
  box-shadow: 0 8px 18px -8px rgba(128, 81, 255, 0.6);
}

/* ============================================================
   ACCOUNT STRIP
   ============================================================ */
.account-strip {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 16px 20px;
  background: #ffffff;
  border: 1px solid #eef1f6;
  border-radius: 18px;
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.03);
  flex-wrap: wrap;
}
.strip-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.strip-item-grow { flex: 1; min-width: 0; }

.strip-divider {
  width: 1px;
  height: 36px;
  background: #eef1f6;
}
.strip-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.strip-icon-purple {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 8px 16px -8px rgba(128, 81, 255, 0.6);
}
.strip-icon-lime {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  box-shadow: 0 8px 16px -8px rgba(182, 255, 0, 0.6);
}
.strip-icon-amber {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 8px 16px -8px rgba(245, 158, 11, 0.55);
}
.strip-label {
  font-size: 0.6rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  margin-bottom: 2px;
}
.strip-value {
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f0d24;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
}

/* ============================================================
   KPI CARDS
   ============================================================ */
.kpi-card {
  border-radius: 20px;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.28s ease;
}
.kpi-card:hover { transform: translateY(-3px); }
.kpi-card-light {
  background: #ffffff;
  border: 1px solid #eef1f6;
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.03);
}
.kpi-card-light:hover { box-shadow: 0 22px 40px -20px rgba(15, 13, 36, 0.15); }
.kpi-card-dark {
  background: linear-gradient(140deg, #0a0a14 0%, #221047 55%, #2b1256 100%);
  border: none;
  box-shadow: 0 22px 44px -22px rgba(34, 16, 71, 0.55);
}
.kpi-card-dark:hover { box-shadow: 0 26px 50px -22px rgba(34, 16, 71, 0.7); }

.kpi-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.kpi-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.kpi-icon-purple {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.7);
}
.kpi-icon-white {
  background: #ffffff;
  box-shadow: 0 10px 22px -10px rgba(255, 255, 255, 0.5);
}
.kpi-badge {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.kpi-badge-ok   { background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%); color: #0a0a14; }
.kpi-badge-warn { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); }

.kpi-label {
  font-size: 0.64rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  margin-bottom: 4px;
}
.kpi-value {
  font-size: 1.9rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -1px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.kpi-foot {
  margin-top: 10px;
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}
.kpi-foot-ok   { color: #3f6b00; }
.kpi-foot-warn { color: #b45309; }
.kpi-foot-value {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(15, 13, 36, 0.05);
  font-weight: 800;
}
.kpi-foot-warn .kpi-foot-value {
  background: rgba(245, 158, 11, 0.14);
  color: #b45309;
}
.kpi-foot-ok .kpi-foot-value {
  background: rgba(122, 184, 0, 0.14);
  color: #3f6b00;
}

.kpi-dark-pair {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}
.kpi-dark-right { text-align: right; }
.kpi-label-dark {
  font-size: 0.64rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.55);
  text-transform: uppercase;
  letter-spacing: 0.9px;
  margin-bottom: 4px;
}
.kpi-value-dark {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.8px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

/* ============================================================
   OVERDUE BANNER
   ============================================================ */
.overdue-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 18px;
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  border: 1px solid #fed7aa;
  flex-wrap: wrap;
}
.overdue-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 10px 22px -10px rgba(245, 158, 11, 0.7);
}
.overdue-body { flex: 1; min-width: 0; }
.overdue-title {
  font-size: 0.9rem;
  font-weight: 800;
  color: #7c2d12;
  letter-spacing: -0.2px;
}
.overdue-sub {
  font-size: 0.78rem;
  color: #92400e;
  margin-top: 2px;
  font-weight: 500;
}
.overdue-btn {
  display: inline-flex;
  align-items: center;
  padding: 10px 18px;
  border-radius: 999px;
  background: #b45309;
  color: #ffffff;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  box-shadow: 0 10px 22px -10px rgba(180, 83, 9, 0.6);
}
.overdue-btn:hover {
  background: #92400e;
  transform: translateY(-1px);
}

/* ============================================================
   PAY CTA
   ============================================================ */
.pay-cta {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid #eef1f6;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.03);
}
.pay-cta:hover {
  transform: translateY(-2px);
  border-color: rgba(128, 81, 255, 0.4);
  box-shadow: 0 20px 40px -20px rgba(128, 81, 255, 0.35);
}
.pay-cta-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(128, 81, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.pay-cta-body { flex: 1; min-width: 0; }
.pay-cta-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
}
.pay-cta-sub {
  font-size: 0.76rem;
  color: #64748b;
  margin-top: 2px;
  font-weight: 500;
}
.pay-cta-chevron {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}
.pay-cta:hover .pay-cta-chevron {
  transform: translateX(4px);
}

/* ============================================================
   VEHICLES CARD (new)
   ============================================================ */
.vehicles-card {
  background: #ffffff;
  border: 1px solid #eef1f6;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.03);
}
.vehicles-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 22px;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
}
.vehicles-head-left { display: flex; align-items: center; gap: 12px; }
.vehicles-icon {
  width: 40px; height: 40px; border-radius: 12px;
  background: rgba(128, 81, 255, 0.1);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.vehicles-title {
  font-size: 0.95rem; font-weight: 800; color: #0f0d24; letter-spacing: -0.3px;
}
.vehicles-sub {
  font-size: 0.72rem; color: #94a3b8; margin-top: 1px; font-weight: 500;
}
.vehicles-action {
  display: inline-flex; align-items: center;
  padding: 8px 14px; border-radius: 999px;
  background: rgba(128, 81, 255, 0.08);
  border: 1px solid rgba(128, 81, 255, 0.18);
  color: #8051ff; font-size: 0.72rem; font-weight: 800;
  letter-spacing: 0.3px; cursor: pointer; font-family: inherit;
  transition: all 0.2s ease;
}
.vehicles-action:hover {
  background: rgba(128, 81, 255, 0.14);
  border-color: rgba(128, 81, 255, 0.35);
}

.vehicles-mini-list { padding: 6px 0; }
.vehicle-mini {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 22px;
  transition: background 0.15s ease;
}
.vehicle-mini:hover { background: #fafbff; }
.vehicle-mini-icon {
  width: 34px; height: 34px; border-radius: 10px;
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.vehicle-mini-body { flex: 1; min-width: 0; }
.vehicle-mini-plate {
  font-size: 0.85rem; font-weight: 800; color: #0f0d24;
  letter-spacing: 0.4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.vehicle-mini-sub {
  font-size: 0.7rem; color: #94a3b8; margin-top: 2px; font-weight: 500;
}
.status-chip { font-weight: 700; }

.vehicles-more {
  text-align: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: #8051ff;
  padding: 6px 22px 10px;
}

.vehicles-empty {
  padding: 36px 24px; text-align: center;
}
.vehicles-empty-title {
  font-size: 0.85rem; font-weight: 700; color: #475569;
  margin-top: 8px;
}
.vehicles-empty-sub {
  font-size: 0.75rem; color: #94a3b8;
  margin-top: 4px; max-width: 300px;
  margin-left: auto; margin-right: auto; line-height: 1.5;
}
.vehicles-empty-btn {
  margin-top: 14px;
  padding: 8px 18px; border-radius: 999px;
  background: #8051FF; color: #fff; border: none;
  font-size: 0.76rem; font-weight: 800;
  cursor: pointer; font-family: inherit;
  transition: transform 0.15s ease;
}
.vehicles-empty-btn:hover { transform: translateY(-1px); }

/* ============================================================
   VISITORS CTA (new)
   ============================================================ */
.visitors-cta {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid #eef1f6;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.03);
}
.visitors-cta:hover {
  transform: translateY(-2px);
  border-color: rgba(128, 81, 255, 0.4);
  box-shadow: 0 20px 40px -20px rgba(128, 81, 255, 0.35);
}
.visitors-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(128, 81, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.visitors-body { flex: 1; min-width: 0; }
.visitors-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
}
.visitors-sub {
  font-size: 0.76rem;
  color: #64748b;
  margin-top: 2px;
  font-weight: 500;
}
.visitors-chevron {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}
.visitors-cta:hover .visitors-chevron {
  transform: translateX(4px);
}

/* ============================================================
   PAYMENTS CARD
   ============================================================ */
.payments-card {
  background: #ffffff;
  border: 1px solid #eef1f6;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.03);
}
.payments-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 22px;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
}
.payments-head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.payments-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(128, 81, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.payments-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
}
.payments-sub {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 1px;
  font-weight: 500;
}

.payments-list { padding: 6px 0; }
.payment-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 22px;
  transition: background 0.15s ease;
}
.payment-row:hover { background: #fafbff; }
.payment-row-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: rgba(122, 184, 0, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.payment-row-body { flex: 1; min-width: 0; }
.payment-row-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.payment-row-sub {
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 2px;
  font-weight: 500;
}
.payment-row-amount {
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

.payments-empty {
  padding: 56px 24px;
  text-align: center;
}
.payments-empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: #f6f7fb;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}
.payments-empty-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f0d24;
}
.payments-empty-sub {
  font-size: 0.78rem;
  color: #94a3b8;
  margin-top: 4px;
}

/* ============================================================
   SEARCH + SNACKBAR
   ============================================================ */
.search-field-premium ::v-deep .v-input__slot {
  background: #f6f7fb !important;
  transition: all 0.25s ease;
}
.search-field-premium.v-input--is-focused ::v-deep .v-input__slot {
  background: #ffffff !important;
  box-shadow: 0 2px 10px rgba(128, 81, 255, 0.12);
}

.snackbar-premium ::v-deep .v-snackbar__content { padding: 12px 20px; }

/* ============================================================
   MOBILE NAV
   ============================================================ */
.bottom-nav-premium {
  border-top: 1px solid #eef1f6 !important;
  background: rgba(255, 255, 255, 0.96) !important;
  backdrop-filter: blur(14px);
}
.mobile-nav-btn { min-width: 0 !important; }
.mobile-nav-label {
  font-size: 10px;
  margin-top: 2px;
  font-weight: 700;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 767px) {
  .kpi-value { font-size: 1.5rem; }
  .kpi-value-dark { font-size: 1.25rem; }
  .kpi-card { padding: 16px; }
  .strip-item-grow { flex: 0 0 100%; }
  .strip-divider { display: none; }
  .account-strip { gap: 14px; padding: 14px 16px; }
  .strip-value { max-width: 160px; }
  .overdue-btn { width: 100%; justify-content: center; }
  .payment-row { padding: 12px 16px; }
  .payments-head { padding: 16px; }
  .vehicles-head { padding: 16px; }
  .vehicle-mini { padding: 12px 16px; }
  .vehicles-more { padding: 6px 16px 10px; }
}
</style>