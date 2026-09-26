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
      <!-- Header -->
      <div class="sticky-header-premium px-4 px-sm-6 py-3">
        <v-container fluid class="pa-0">
          <v-row align="center" no-gutters>
            <v-col cols="8" sm="6">
              <div class="d-flex align-center">
                <div>
                  <div class="d-flex align-center">
                    <h1 class="text-h6 text-sm-h5 font-weight-bold text--primary page-title">
                      Payment Summary
                    </h1>
                    <v-chip
                      x-small
                      color="purple lighten-5 purple--text"
                      class="ml-2 font-weight-bold hidden-xs-only"
                      label
                    >
                      {{ year }}
                    </v-chip>
                  </div>
                  <div class="d-flex align-center mt-1">
                    <v-icon x-small color="success" class="mr-1">mdi-circle</v-icon>
                    <span class="text-caption text--secondary">{{ todayLabel }}</span>
                  </div>
                </div>
              </div>
            </v-col>
            <v-col cols="4" sm="6" class="d-flex justify-end align-center">
              <!-- Year selector -->
              <v-select
                v-model="year"
                :items="availableYears"
                dense
                outlined
                rounded
                hide-details
                class="mr-2 year-select"
                style="max-width: 110px;"
                @change="fetchSummary"
              />

              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    outlined
                    small
                    color="grey darken-1"
                    class="mr-2 refresh-btn"
                    :loading="loading"
                    @click="fetchSummary"
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
        <v-row class="reveal-card">
          <v-col cols="12">
            <v-card class="rounded-2xl" elevation="0" outlined>
              <!-- Summary header -->
              <div class="pa-4 pa-sm-6">
                <div class="d-flex align-center flex-wrap">
                  <v-avatar color="#8051FF" size="46" class="mr-3">
                    <span class="white--text font-weight-bold" style="font-size: 1rem;">
                      {{ ownerInitials }}
                    </span>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <div class="purple--text font-weight-bold" style="font-size: 1.05rem;">
                      {{ household.primary_owner || 'Resident' }}
                    </div>
                    <div class="text-caption text--secondary">
                      {{ household.section }} | {{ household.court }} | {{ household.street }}
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-caption text--secondary">Overdue</div>
                    <div
                      class="font-weight-bold"
                      :class="numbers.overdue > 0 ? 'red--text' : 'green--text'"
                      style="font-size: 1.1rem;"
                    >
                      KES {{ formatNum(numbers.overdue) }}
                    </div>
                  </div>
                </div>

                <v-divider class="my-4" />

                <!-- Balance B/F + Total Paid -->
                <v-row dense>
                  <v-col cols="6" sm="6">
                    <div class="text-caption text--secondary">Balance Brought fwd</div>
                    <div class="text-h6 font-weight-bold text--primary">
                      KES {{ formatNum(numbers.balance_brought_forward) }}
                    </div>
                  </v-col>
                  <v-col cols="6" sm="6" class="text-right">
                    <div class="text-caption text--secondary">Total Paid</div>
                    <div class="text-h6 font-weight-bold text--primary">
                      KES {{ formatNum(numbers.total_paid) }}
                    </div>
                  </v-col>
                </v-row>
              </div>

              <!-- 12-month grid -->
              <v-sheet color="#ede9fe" class="pa-3 pa-sm-4">
                <div class="text-caption font-weight-bold text-uppercase mb-2 tracking-wide" style="color: #8051FF;">
                  Monthly breakdown — {{ year }}
                </div>
                <v-row no-gutters dense>
                  <v-col
                    v-for="m in months"
                    :key="m.month_number"
                    cols="3"
                    class="text-center py-3"
                  >
                    <div style="font-size: 0.85rem; color: black; font-weight: 500;">
                      {{ m.month }}
                    </div>
                    <div
                      class="mt-1 font-weight-medium"
                      :style="{
                        fontSize: '0.85rem',
                        color: m.amount > 0 ? '#2e7d32' : '#94a3b8',
                      }"
                    >
                      {{ m.display }}
                    </div>
                  </v-col>
                </v-row>
              </v-sheet>

              <!-- Footer -->
              <div class="pa-4 pa-sm-6">
                <v-row dense>
                  <v-col cols="6" sm="4">
                    <div class="text-caption text--secondary">Due YTD</div>
                    <div class="font-weight-bold text--primary" style="font-size: 1.05rem;">
                      KES {{ formatNum(numbers.due_to_date) }}
                    </div>
                  </v-col>
                  <v-col cols="6" sm="4">
                    <div class="text-caption text--secondary">Months Equivalent</div>
                    <div class="font-weight-bold text--primary" style="font-size: 1.05rem;">
                      {{ numbers.months_equivalent }}
                    </div>
                  </v-col>
                  <v-col cols="12" sm="4" class="text-sm-right mt-3 mt-sm-0">
                    <v-chip
                      small
                      label
                      class="font-weight-bold"
                      :color="statusChipColor"
                      :text-color="statusChipTextColor"
                    >
                      <v-icon x-small left>{{ statusIcon }}</v-icon>
                      {{ numbers.status }}
                    </v-chip>
                  </v-col>
                </v-row>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Details table (recent transactions) -->
        <v-row class="mt-4 reveal-card" style="animation-delay: 150ms">
          <v-col cols="12">
            <v-card class="rounded-2xl" elevation="0" outlined>
              <v-card-title class="px-4 px-sm-6 py-4 card-header-premium d-flex align-center">
                <v-avatar color="purple lighten-5" size="36" class="mr-3">
                  <v-icon color="#8051FF">mdi-format-list-bulleted</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold text--primary">Detailed records</div>
                  <div class="text-caption text--secondary">All transactions for {{ year }}</div>
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

              <v-simple-table v-if="filteredPayments.length" class="entries-table-premium">
                <thead>
                  <tr>
                    <th class="text-left">Date</th>
                    <th class="text-left">Receipt</th>
                    <th class="text-left hidden-xs-only">Method</th>
                    <th class="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in filteredPayments" :key="p.payment_id || p.id">
                    <td>{{ formatDate(p.payment_date || p.created_at) }}</td>
                    <td class="font-weight-medium">{{ p.transaction_id }}</td>
                    <td class="hidden-xs-only">{{ p.payment_method }}</td>
                    <td class="text-right font-weight-bold">
                      {{ formatNum(p.amount_paid) }}
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>

              <div v-else-if="!loading" class="pa-12 text-center">
                <v-icon size="56" color="grey lighten-2">mdi-receipt-text-outline</v-icon>
                <div class="text-h6 grey--text text--darken-1 mt-3">No transactions</div>
                <div class="text-body-2 grey--text">You haven't made any payments for {{ year }}.</div>
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
  name: 'HouseholdPaymentSummary',
  data() {
    return {
      nav_bars: false,
      activeTab: '/household/payment_summary',

      loading: false,
      uid: null,
      year: new Date().getFullYear(),
      household: { primary_owner: '', section: '', court: '', street: '' },
      numbers: {
        balance_brought_forward: 0,
        total_paid: 0,
        due_to_date: 0,
        overdue: 0,
        prepaid: 0,
        months_equivalent: 0,
        monthly_rate: 0,
        annual_due: 0,
        status: 'Paid',
      },
      months: [],
      payments: [],
      search: '',
      snackbar: { show: false, text: '', color: 'success' },
    };
  },
  computed: {
    /**
     * ⚡ THE FIX — the dashboard route is resolved dynamically.
     * If the dashboard folder has only _id.vue, we must include the uid.
     * If it has index.vue, /household/dashboard works directly.
     *
     * We try /household/dashboard first; if that 404s on your app,
     * change the route below to `/household/dashboard/${this.uid}`.
     */
    dashboardRoute() {
      // OPTION 1 (recommended): index.vue exists
      return '/household/dashboard/' + this.uid;

      // OPTION 2 (only _id.vue exists): include the uid
      // return this.uid ? `/household/dashboard/${this.uid}` : '/household/dashboard';
    },
    menuItems() {
      return [
        { title: 'Dashboard', icon: 'mdi-view-dashboard', route: this.dashboardRoute },
        { title: 'Payments',  icon: 'mdi-currency-usd',   route: '/household/payment_summary' },
        { title: 'Profile',   icon: 'mdi-account',        route: '/household/profile' },
        { title: 'Alerts',    icon: 'mdi-bell',           route: '/household/notifications' },
      ];
    },
    availableYears() {
      const now = new Date().getFullYear();
      return [now, now - 1, now - 2, now - 3];
    },
    avatarUrl() {
      const name = this.household.primary_owner || 'Resident';
      return `https://ui-avatars.com/api/?background=8051FF&color=fff&name=${encodeURIComponent(name)}`;
    },
    ownerInitials() {
      const name = this.household.primary_owner || 'R';
      return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    },
    todayLabel() {
      const d = new Date();
      return 'Today, ' + d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    },
    statusChipColor() {
      const s = this.numbers.status;
      if (s === 'Overdue') return 'red lighten-5';
      if (s === 'Prepaid') return 'green lighten-5';
      return 'purple lighten-5';
    },
    statusChipTextColor() {
      const s = this.numbers.status;
      if (s === 'Overdue') return 'red darken-2';
      if (s === 'Prepaid') return 'green darken-2';
      return 'purple darken-2';
    },
    statusIcon() {
      const s = this.numbers.status;
      if (s === 'Overdue') return 'mdi-alert-circle-outline';
      if (s === 'Prepaid') return 'mdi-check-circle-outline';
      return 'mdi-information-outline';
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
    /**
     * ⚡ Navigation fix:
     * - Guards against null $router
     * - Swallows NavigationDuplicated errors
     * - Falls back to location.href if $router is missing
     */
    goTo(path) {
      if (!path) return;
      if (this.$route && this.$route.path === path) return; // already there
      if (this.$router) {
        this.$router
          .push(path)
          .catch((err) => {
            // Only log unexpected errors, ignore redundant navigation
            if (err && err.name !== 'NavigationDuplicated') {
              console.error('Nav error:', err);
            }
          });
      } else {
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
        console.log('🔵 Payment summary UID:', that.uid);
        that.refreshAll();
        return;
      }
      that._authUnsub = that.$fire.auth.onAuthStateChanged((user) => {
        if (user && user.uid) {
          that.uid = user.uid;
          console.log('🔵 Payment summary UID (listener):', that.uid);
          that.refreshAll();
          if (that._authUnsub) {
            that._authUnsub();
            that._authUnsub = null;
          }
        } else {
          that.showSnackbar('Please sign in to view your summary', 'error');
        }
      });
    },

    async refreshAll() {
      if (!this.uid) return;
      this.loading = true;
      await this.fetchSummary();
      await this.fetchPayments();
      this.loading = false;
    },

    // =====================================================
    // FETCH SUMMARY
    // =====================================================
    async fetchSummary() {
      const that = this;
      const url = `${API}/households/payment-summary/${that.uid}?year=${that.year}`;
      console.log('🔵 GET', url);

      try {
        const { data, status } = await axios.get(url);
        console.log('🔵 Payment summary response:', status, data);

        if (status === 200) {
          that.household = {
            primary_owner: data.household?.primary_owner || '',
            section: data.household?.section || '',
            court: data.household?.court || '',
            street: data.household?.street || '',
          };
          that.numbers = {
            balance_brought_forward: Number(data.balance_brought_forward) || 0,
            total_paid: Number(data.total_paid) || 0,
            due_to_date: Number(data.due_to_date) || 0,
            overdue: Number(data.overdue) || 0,
            prepaid: Number(data.prepaid) || 0,
            months_equivalent: Number(data.months_equivalent) || 0,
            monthly_rate: Number(data.monthly_rate) || 0,
            annual_due: Number(data.annual_due) || 0,
            status: data.status || 'Paid',
          };
          that.months =
            Array.isArray(data.months) && data.months.length === 12
              ? data.months
              : that.emptyMonths();
        }
      } catch (error) {
        console.error('🔴 Payment summary error:', {
          url,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        that.months = that.emptyMonths();
        that.showSnackbar(error.response?.data?.error || 'Failed to load summary', 'error');
      }
    },

    // =====================================================
    // FETCH DETAILED PAYMENTS
    // =====================================================
    async fetchPayments() {
      const that = this;
      try {
        const hh = await axios.get(`${API}/households/getHouseHoldId/${that.uid}`);
        const householdId = hh.data?.household_id;
        if (!householdId) return;

        const { data, status } = await axios.get(
          `${API}/payments/getById/${householdId}`
        );
        if (status === 200) {
          const list = Array.isArray(data) ? data : [];
          that.payments = list.filter((p) => {
            const d = p.payment_date || p.created_at;
            if (!d) return false;
            return new Date(d).getFullYear() === Number(that.year);
          });
          console.log('🔵 Detailed payments:', that.payments.length);
        }
      } catch (error) {
        console.warn('Detailed payments failed:', {
          status: error.response?.status,
          message: error.message,
        });
        that.payments = [];
      }
    },

    // =====================================================
    // HELPERS
    // =====================================================
    emptyMonths() {
      const names = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      return names.map((m, i) => ({
        month: m,
        month_short: m.slice(0, 3),
        month_number: i + 1,
        amount: 0,
        amount_formatted: '0',
        count: 0,
        display: '0',
      }));
    },
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
      this.$router.push('/login');
    },
  },
};
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
.bg-surface { background-color: #f8fafc !important; }
.rounded-2xl { border-radius: 20px !important; }
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

.year-select ::v-deep .v-input__slot { background: white !important; }

.card-header-premium {
  background: linear-gradient(to bottom, #ffffff, #f8fafc);
}

.entries-table-premium ::v-deep tbody tr:hover {
  background-color: #f8fafc !important;
}
.entries-table-premium ::v-deep th {
  font-weight: 600 !important;
  text-transform: uppercase;
  font-size: 11px !important;
  letter-spacing: 0.05em;
  color: #64748b !important;
  background: #f8fafc !important;
}

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
}
</style>