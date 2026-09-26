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
                <v-btn icon small class="mr-2" @click="goTo(dashboardRoute)">
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <div>
                  <div class="d-flex align-center">
                    <h1 class="text-h6 text-sm-h5 font-weight-bold text--primary page-title">
                      Payment Summary
                    </h1>
                    <v-chip
                      x-small
                      label
                      color="purple lighten-5 purple--text"
                      class="ml-2 font-weight-bold hidden-xs-only"
                    >
                      {{ year }}
                    </v-chip>
                  </div>
                  <div class="d-flex align-center mt-1">
                    <span class="text-caption text--secondary">
                      All households · {{ estate.estate_name || '' }}
                    </span>
                  </div>
                </div>
              </div>
            </v-col>
            <v-col cols="4" sm="6" class="d-flex justify-end align-center">
              <v-select
                v-model="year"
                :items="availableYears"
                dense
                outlined
                rounded
                hide-details
                class="mr-2 year-select"
                style="max-width: 100px;"
                @change="fetchSummary"
              />
              <v-btn
                icon
                outlined
                small
                color="grey darken-1"
                class="mr-2 refresh-btn"
                :loading="loading"
                @click="refreshAll"
              >
                <v-icon small>mdi-refresh</v-icon>
              </v-btn>
              <v-btn
                icon
                outlined
                small
                color="grey darken-1"
                class="mr-2 hidden-xs-only"
                @click="exportCSV"
                title="Export CSV"
              >
                <v-icon small>mdi-download</v-icon>
              </v-btn>
              <v-avatar color="#8051FF" size="36">
                <span style="color: white;" class="font-weight-bold text-caption">{{ officialInitials }}</span>
              </v-avatar>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <v-container :fluid="nav_bars" class="px-4 px-sm-6 pt-2 pt-sm-4 pb-8">
        <!-- KPI cards -->
        <v-row dense class="mb-4 reveal-card">
          <v-col cols="6" sm="3">
            <v-card outlined elevation="0" class="pa-4 rounded-2xl kpi-card-premium h-100">
              <div class="text-caption font-weight-bold text-uppercase tracking-wide text--secondary">
                Households
              </div>
              <div class="text-h4 font-weight-bold text--primary mt-1">
                {{ formatNum(kpis.households) }}
              </div>
            </v-card>
          </v-col>

          <v-col cols="6" sm="3">
            <v-card color="#8051FF" dark elevation="0" class="pa-4 rounded-2xl h-100">
              <div class="text-caption font-weight-bold text-uppercase tracking-wide" style="opacity: 0.85;">
                Total Paid
              </div>
              <div class="text-h4 font-weight-bold mt-1">
                {{ formatNum(kpis.totalPaid) }}
              </div>
              <div class="text-caption" style="opacity: 0.8;">KES</div>
            </v-card>
          </v-col>

          <v-col cols="6" sm="3">
            <v-card outlined elevation="0" class="pa-4 rounded-2xl kpi-card-premium h-100">
              <div class="text-caption font-weight-bold text-uppercase tracking-wide text--secondary">
                Expected YTD
              </div>
              <div class="text-h4 font-weight-bold text--primary mt-1">
                {{ formatNum(kpis.expectedYTD) }}
              </div>
              <div class="text-caption text--secondary">KES</div>
            </v-card>
          </v-col>

          <v-col cols="6" sm="3">
            <v-card
              :color="kpis.arrears > 0 ? '#ffebee' : '#e8f5e9'"
              elevation="0"
              class="pa-4 rounded-2xl h-100"
            >
              <div
                class="text-caption font-weight-bold text-uppercase tracking-wide"
                :style="kpis.arrears > 0 ? 'color: #c62828;' : 'color: #2e7d32;'"
              >
                Arrears
              </div>
              <div
                class="text-h4 font-weight-bold mt-1"
                :style="kpis.arrears > 0 ? 'color: #c62828;' : 'color: #2e7d32;'"
              >
                {{ formatNum(kpis.arrears) }}
              </div>
              <div
                class="text-caption"
                :style="kpis.arrears > 0 ? 'color: #c62828; opacity: 0.8;' : 'color: #2e7d32; opacity: 0.8;'"
              >
                KES outstanding
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Filters -->
        <v-row class="mb-4 reveal-card" style="animation-delay: 50ms">
          <v-col cols="12">
            <v-card class="rounded-2xl pa-3 pa-sm-4" elevation="0" outlined>
              <v-row dense>
                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model="search"
                    placeholder="Search by name, phone, or house no."
                    dense
                    outlined
                    rounded
                    hide-details
                    prepend-inner-icon="mdi-magnify"
                    clearable
                  />
                </v-col>
                <v-col cols="6" sm="2">
                  <v-select
                    v-model="filterSection"
                    :items="sectionOptions"
                    label="Section"
                    dense
                    outlined
                    rounded
                    hide-details
                    clearable
                  />
                </v-col>
                <v-col cols="6" sm="2">
                  <v-select
                    v-model="filterCourt"
                    :items="courtOptions"
                    label="Court"
                    dense
                    outlined
                    rounded
                    hide-details
                    clearable
                  />
                </v-col>
                <v-col cols="6" sm="2">
                  <v-select
                    v-model="filterStreet"
                    :items="streetOptions"
                    label="Street"
                    dense
                    outlined
                    rounded
                    hide-details
                    clearable
                  />
                </v-col>
                <v-col cols="6" sm="2">
                  <v-select
                    v-model="filterStatus"
                    :items="statusOptions"
                    label="Status"
                    dense
                    outlined
                    rounded
                    hide-details
                    clearable
                  />
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <!-- Loading -->
        <div v-if="loading && !rows.length" class="pa-4">
          <v-skeleton-loader type="list-item-two-line, list-item-two-line, list-item-two-line" />
        </div>

        <!-- Empty -->
        <v-row v-else-if="!filteredRows.length" class="reveal-card">
          <v-col cols="12">
            <v-card class="rounded-2xl pa-12 text-center" elevation="0" outlined>
              <v-avatar color="purple lighten-5" size="72" class="mb-3">
                <v-icon size="44" color="#8051FF">mdi-table-off</v-icon>
              </v-avatar>
              <div class="text-h6 grey--text text--darken-2 mt-3">No data to display</div>
              <div class="text-body-2 grey--text mt-1">
                {{ hasActiveFilters ? 'Try clearing filters.' : 'No households in this estate yet.' }}
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Desktop table -->
        <v-row v-else class="reveal-card" style="animation-delay: 100ms">
          <v-col cols="12">
            <v-card class="rounded-2xl" elevation="0" outlined>
              <v-card-title class="px-4 px-sm-6 py-4 card-header-premium d-flex align-center">
                <v-avatar color="purple lighten-5" size="36" class="mr-3">
                  <v-icon color="#8051FF">mdi-table-large</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold text--primary">
                    Monthly breakdown
                  </div>
                  <div class="text-caption text--secondary">
                    {{ filteredRows.length }} household{{ filteredRows.length === 1 ? '' : 's' }} · {{ year }}
                  </div>
                </div>
              </v-card-title>
              <v-divider></v-divider>

              <!-- Wide table — scroll horizontally on mobile -->
              <div class="table-wrap">
                <table class="payments-table">
                  <thead>
                    <tr>
                      <th class="sticky-col">Household</th>
                      <th class="num-col">B/F</th>
                      <th v-for="m in months" :key="m.key" class="num-col">
                        {{ m.short }}
                      </th>
                      <th class="num-col strong-col">Total</th>
                      <th class="num-col">Due YTD</th>
                      <th class="num-col status-col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="r in filteredRows"
                      :key="r.household_id"
                      class="data-row"
                      @click="openHousehold(r)"
                    >
                      <td class="sticky-col">
                        <div class="d-flex align-center">
                          <v-avatar size="32" color="#8051FF" class="mr-2">
                            <span style="color: white; font-size: 0.7rem;" class="font-weight-bold">
                              {{ initialsOf(r.primary_owner) }}
                            </span>
                          </v-avatar>
                          <div>
                            <div class="font-weight-medium" style="font-size: 0.85rem;">
                              {{ r.primary_owner }}
                            </div>
                            <div class="text-caption grey--text" style="font-size: 0.7rem;">
                              {{ r.section }} · {{ r.court }} · {{ r.street }}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td class="num-col">{{ formatNum(r.balance_bf) }}</td>
                      <td v-for="m in months" :key="m.key" class="num-col">
                        <span :class="Number(r[m.key]) > 0 ? 'paid-cell' : 'zero-cell'">
                          {{ formatNum(r[m.key]) }}
                        </span>
                      </td>
                      <td class="num-col strong-col">{{ formatNum(r.total_paid) }}</td>
                      <td class="num-col">{{ formatNum(r.due_to_date) }}</td>
                      <td class="num-col status-col">
                        <v-chip
                          x-small
                          label
                          :color="statusColor(r.status)"
                          :text-color="statusTextColor(r.status)"
                          class="font-weight-bold"
                          style="font-size: 10px;"
                        >
                          {{ r.status }}
                        </v-chip>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Mobile card list -->
              <div class="d-flex d-md-none flex-column pa-3" style="gap: 12px;">
                <v-card
                  v-for="r in filteredRows"
                  :key="`mob-${r.household_id}`"
                  outlined elevation="0"
                  class="rounded-xl pa-3"
                  @click="openHousehold(r)"
                  style="cursor: pointer;"
                >
                  <div class="d-flex align-center mb-2">
                    <v-avatar size="32" color="#8051FF" class="mr-2">
                      <span style="color: white; font-size: 0.7rem;" class="font-weight-bold">
                        {{ initialsOf(r.primary_owner) }}
                      </span>
                    </v-avatar>
                    <div class="flex-grow-1">
                      <div class="font-weight-bold">{{ r.primary_owner }}</div>
                      <div class="text-caption grey--text">{{ r.section }} · {{ r.court }}</div>
                    </div>
                    <v-chip x-small label :color="statusColor(r.status)" :text-color="statusTextColor(r.status)" class="font-weight-bold">
                      {{ r.status }}
                    </v-chip>
                  </div>
                  <div class="d-flex justify-space-between text-caption mt-2">
                    <span class="grey--text">Total Paid</span>
                    <span class="font-weight-bold">{{ formatNum(r.total_paid) }}</span>
                  </div>
                  <div class="d-flex justify-space-between text-caption">
                    <span class="grey--text">Due YTD</span>
                    <span class="font-weight-bold">{{ formatNum(r.due_to_date) }}</span>
                  </div>
                </v-card>
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
          <v-avatar
            :color="snackbar.color === 'success' ? 'success darken-2' : snackbar.color === 'warning' ? 'warning darken-2' : 'error darken-2'"
            size="28" class="mr-3"
          >
            <v-icon color="white" small>
              {{ snackbar.color === 'success' ? 'mdi-check' : snackbar.color === 'warning' ? 'mdi-alert' : 'mdi-close' }}
            </v-icon>
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
  name: 'OfficialPayments',
  data() {
    return {
      nav_bars: false,
      activeTab: '/officials/payments',

      loading: false,
      uid: null,
      estateId: null,
      official: { full_name: '', role: '', estate_id: null },
      estate: { estate_name: '', urn: '' },

      year: new Date().getFullYear(),
      rows: [],   // household payment rows

      // Filters
      search: '',
      filterSection: null,
      filterCourt: null,
      filterStreet: null,
      filterStatus: null,

      snackbar: { show: false, text: '', color: 'success' },
    };
  },
  computed: {
    dashboardRoute() {
      return this.estateId ? `/officials/dashboard/${this.estateId}` : '/officials/dashboard';
    },
    menuItems() {
      return [
        { title: 'Dashboard', icon: 'mdi-view-dashboard', route: this.dashboardRoute },
        { title: 'Pending',   icon: 'mdi-account-clock',  route: '/officials/pending' },
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
        { title: 'Pending',   icon: 'mdi-account-clock',  route: '/officials/pending' },
        { title: 'Payments',  icon: 'mdi-currency-usd',   route: '/officials/payments' },
        { title: 'Settings',  icon: 'mdi-cog',            route: '/officials/settings' },
      ];
    },
    officialInitials() {
      const name = this.official.full_name || 'O';
      return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    },
    availableYears() {
      const now = new Date().getFullYear();
      return [now, now - 1, now - 2, now - 3];
    },
    months() {
      return [
        { key: 'january',   short: 'Jan' },
        { key: 'february',  short: 'Feb' },
        { key: 'march',     short: 'Mar' },
        { key: 'april',     short: 'Apr' },
        { key: 'may',       short: 'May' },
        { key: 'june',      short: 'Jun' },
        { key: 'july',      short: 'Jul' },
        { key: 'august',    short: 'Aug' },
        { key: 'september', short: 'Sep' },
        { key: 'october',   short: 'Oct' },
        { key: 'november',  short: 'Nov' },
        { key: 'december',  short: 'Dec' },
      ];
    },
    hasActiveFilters() {
      return !!(this.search || this.filterSection || this.filterCourt || this.filterStreet || this.filterStatus);
    },
    sectionOptions() {
      return [...new Set(this.rows.map((r) => r.section).filter(Boolean))].sort();
    },
    courtOptions() {
      return [...new Set(this.rows.map((r) => r.court).filter(Boolean))].sort();
    },
    streetOptions() {
      return [...new Set(this.rows.map((r) => r.street).filter(Boolean))].sort();
    },
    statusOptions() {
      return ['Paid', 'Overdue', 'Prepaid'];
    },
    filteredRows() {
      const q = (this.search || '').trim().toLowerCase();
      return this.rows.filter((r) => {
        if (this.filterSection && r.section !== this.filterSection) return false;
        if (this.filterCourt && r.court !== this.filterCourt) return false;
        if (this.filterStreet && r.street !== this.filterStreet) return false;
        if (this.filterStatus && r.status !== this.filterStatus) return false;
        if (!q) return true;
        return (
          (r.primary_owner || '').toLowerCase().includes(q) ||
          (r.contact_number || '').toLowerCase().includes(q) ||
          (r.house_number || '').toLowerCase().includes(q)
        );
      });
    },
    kpis() {
      const households = this.filteredRows.length;
      let totalPaid = 0;
      let expectedYTD = 0;
      let arrears = 0;
      for (const r of this.filteredRows) {
        totalPaid += Number(r.total_paid || 0);
        expectedYTD += Number(r.due_to_date || 0);
        arrears += Number(r.overdue || 0);
      }
      return { households, totalPaid, expectedYTD, arrears };
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
    // AUTH + LOAD
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
      if (this.estateId) {
        await Promise.all([this.fetchEstate(), this.fetchSummary()]);
      }
      this.loading = false;
    },

    async fetchOfficial() {
      const that = this;
      try {
        const { data, status } = await axios.get(`${API}/officials/getOfficialById/${that.uid}`);
        if (status === 200) {
          that.official = {
            full_name: data.full_name || '',
            role: data.role || '',
            estate_id: data.estate_id || null,
          };
          that.estateId = data.estate_id;
        }
      } catch (error) {
        console.error('🔴 Official fetch failed:', error.response?.data || error.message);
      }
    },

    async fetchEstate() {
      const that = this;
      if (!that.estateId) return;
      try {
        const { data, status } = await axios.get(`${API}/estates/estate/${that.estateId}`);
        if (status === 200) {
          that.estate = {
            estate_name: data.estate_name || '',
            urn: data.estate_urn || '',
          };
        }
      } catch (error) {
        console.warn('Estate fetch failed:', error.response?.data || error.message);
      }
    },

    // =====================================================
    // FETCH SUMMARY
    // GET /api/households/estate/:id/households/list?year=YYYY
    // Returns every approved household with monthly totals,
    // dashboard numbers, and address info.
    // =====================================================
    async fetchSummary() {
      const that = this;
      if (!that.estateId) return;

      const url = `${API}/households/estate/${that.estateId}/households/list?year=${that.year}`;
      console.log('🔵 GET', url);

      try {
        const { data, status } = await axios.get(url);
        if (status === 200 && Array.isArray(data)) {
          that.rows = data.map((r) => ({
            household_id: r.household_id,
            primary_owner: r.primary_owner || '',
            contact_number: r.contact_number || '',
            house_number: r.house_number || '',
            section: r.section || '',
            court: r.court || '',
            street: r.street || '',
            balance_bf: Number(r.balance_brought_forward || 0),
            january:   Number(r.months?.january   || 0),
            february:  Number(r.months?.february  || 0),
            march:     Number(r.months?.march     || 0),
            april:     Number(r.months?.april     || 0),
            may:       Number(r.months?.may       || 0),
            june:      Number(r.months?.june      || 0),
            july:      Number(r.months?.july      || 0),
            august:    Number(r.months?.august    || 0),
            september: Number(r.months?.september || 0),
            october:   Number(r.months?.october   || 0),
            november:  Number(r.months?.november  || 0),
            december:  Number(r.months?.december  || 0),
            total_paid: Number(r.total_paid || 0),
            due_to_date: Number(r.due_to_date || 0),
            overdue: Number(r.overdue || 0),
            prepaid: Number(r.prepaid || 0),
            status: r.status || 'Paid',
          }));
          console.log('🔵 Summary rows loaded:', that.rows.length);
        } else {
          that.rows = [];
        }
      } catch (error) {
        console.error('🔴 Summary fetch failed:', {
          url,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        that.rows = [];
        // Fallback: try the /payment-summary per-household approach if the bulk endpoint fails
        if (error.response?.status === 404) {
          that.showSnackbar('Payment summary endpoint not available yet', 'warning');
        }
      }
    },

    // =====================================================
    // EXPORT
    // =====================================================
    exportCSV() {
      const that = this;
      const header = ['Household', 'Phone', 'Address', 'B/F',
        ...that.months.map((m) => m.short),
        'Total Paid', 'Due YTD', 'Overdue', 'Status'];

      const lines = [header.join(',')];

      for (const r of that.filteredRows) {
        const row = [
          r.primary_owner,
          r.contact_number,
          `"${r.section} ${r.court} ${r.street}"`,
          r.balance_bf,
          ...that.months.map((m) => r[m.key]),
          r.total_paid,
          r.due_to_date,
          r.overdue,
          r.status,
        ];
        lines.push(row.join(','));
      }

      const csv = lines.join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments-${that.estate.estate_name || 'estate'}-${that.year}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    },

    // =====================================================
    // ROW ACTIONS
    // =====================================================
    openHousehold(r) {
      // Navigate to that household's official dashboard view
      this.goTo(`/officials/residence/${r.household_id}`);
    },

    // =====================================================
    // FORMATTERS
    // =====================================================
    initialsOf(name) {
      if (!name) return '?';
      return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    },
    formatNum(n) {
      return numeral(n || 0).format('0,0');
    },
    statusColor(status) {
      if (status === 'Overdue') return 'red lighten-5';
      if (status === 'Prepaid') return 'green lighten-5';
      return 'purple lighten-5';
    },
    statusTextColor(status) {
      if (status === 'Overdue') return 'red darken-2';
      if (status === 'Prepaid') return 'green darken-2';
      return 'purple darken-2';
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
.year-select ::v-deep .v-input__slot { background: white !important; }

.kpi-card-premium {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e2e8f0;
  background: white;
}
.kpi-card-premium:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.06) !important;
  border-color: #cbd5e1;
}

.card-header-premium {
  background: linear-gradient(to bottom, #ffffff, #f8fafc);
}

/* Horizontal scroll table */
.table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.payments-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1100px;
}
.payments-table th,
.payments-table td {
  padding: 10px 12px;
  font-size: 0.82rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}
.payments-table thead th {
  background: #f8fafc;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  color: #64748b;
  position: sticky;
  top: 0;
  z-index: 1;
}
.payments-table .sticky-col {
  position: sticky;
  left: 0;
  background: #ffffff;
  z-index: 2;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.03);
}
.payments-table thead .sticky-col {
  background: #f8fafc;
}
.num-col {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.status-col {
  text-align: center;
}
.strong-col {
  font-weight: 700;
  color: #1e293b;
}
.data-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.data-row:hover {
  background-color: #f8fafc;
}
.paid-cell {
  color: #2e7d32;
  font-weight: 600;
}
.zero-cell {
  color: #cbd5e1;
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