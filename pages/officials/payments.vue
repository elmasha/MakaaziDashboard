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
                <v-btn icon small class="mr-2 back-btn" @click="goTo(dashboardRoute)">
                  <v-icon size="20">mdi-arrow-left</v-icon>
                </v-btn>
                <div class="header-text">
                  <div class="d-flex align-center flex-wrap">
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
                    <v-icon x-small color="success" class="mr-1">mdi-circle</v-icon>
                    <span class="text-caption text--secondary">
                      All households · {{ estate.estate_name || '' }}
                    </span>
                  </div>
                </div>
              </div>
            </v-col>
            <v-col cols="4" sm="6" class="d-flex justify-end align-center">
              <select v-model.number="year" class="year-picker" @change="fetchSummary">
                <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
              </select>

              <button
                class="icon-btn mr-2"
                :disabled="loading"
                @click="refreshAll"
              >
                <v-icon size="16" :class="{ spin: loading }">
                  {{ loading ? 'mdi-loading' : 'mdi-refresh' }}
                </v-icon>
              </button>

              <button
                class="icon-btn mr-2 hidden-xs-only"
                title="Export CSV"
                @click="exportCSV"
              >
                <v-icon size="16">mdi-download</v-icon>
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
             KPI CARDS
             ============================================================ -->
        <div class="kpi-grid">
          <!-- Households -->
          <div class="kpi kpi-light reveal-card">
            <div class="kpi-top">
              <div class="kpi-icon kpi-icon-purple">
                <v-icon size="20" color="white">mdi-home-group</v-icon>
              </div>
            </div>
            <div class="kpi-label">Households</div>
            <div class="kpi-value">{{ formatNum(kpis.households) }}</div>
            <div class="kpi-foot kpi-foot-muted">In this view</div>
          </div>

          <!-- Total Paid -->
          <div class="kpi kpi-dark reveal-card" style="animation-delay: 50ms">
            <div class="kpi-top">
              <div class="kpi-icon kpi-icon-white">
                <v-icon size="20" color="#0A0A14">mdi-cash-multiple</v-icon>
              </div>
            </div>
            <div class="kpi-label kpi-label-dark">Total Paid</div>
            <div class="kpi-value kpi-value-dark">{{ formatNum(kpis.totalPaid) }}</div>
            <div class="kpi-foot kpi-foot-light">KES collected</div>
          </div>

          <!-- Expected YTD -->
          <div class="kpi kpi-light reveal-card" style="animation-delay: 100ms">
            <div class="kpi-top">
              <div class="kpi-icon kpi-icon-blue">
                <v-icon size="20" color="white">mdi-chart-timeline-variant</v-icon>
              </div>
            </div>
            <div class="kpi-label">Expected YTD</div>
            <div class="kpi-value">{{ formatNum(kpis.expectedYTD) }}</div>
            <div class="kpi-foot kpi-foot-muted">KES billed</div>
          </div>

          <!-- Arrears -->
          <div
            class="kpi reveal-card"
            :class="kpis.arrears > 0 ? 'kpi-alert' : 'kpi-light'"
            style="animation-delay: 150ms"
          >
            <div class="kpi-top">
              <div
                class="kpi-icon"
                :class="kpis.arrears > 0 ? 'kpi-icon-white' : 'kpi-icon-lime'"
              >
                <v-icon
                  size="20"
                  :color="kpis.arrears > 0 ? '#0A0A14' : '#0A0A14'"
                >
                  {{ kpis.arrears > 0 ? 'mdi-alert-outline' : 'mdi-check-circle-outline' }}
                </v-icon>
              </div>
            </div>
            <div class="kpi-label" :class="{ 'kpi-label-dark': kpis.arrears > 0 }">Arrears</div>
            <div class="kpi-value" :class="{ 'kpi-value-dark': kpis.arrears > 0 }">
              {{ formatNum(kpis.arrears) }}
            </div>
            <div
              class="kpi-foot"
              :class="kpis.arrears > 0 ? 'kpi-foot-light' : 'kpi-foot-muted'"
            >
              {{ kpis.arrears > 0 ? 'KES outstanding' : 'All caught up' }}
            </div>
          </div>
        </div>

        <!-- ============================================================
             FILTERS
             ============================================================ -->
        <div class="panel-card filters-card reveal-card" style="animation-delay: 200ms">
          <div class="filters-grid">
            <div class="search-wrap">
              <v-icon size="18" class="search-icon">mdi-magnify</v-icon>
              <input
                v-model="search"
                class="search-input"
                type="text"
                placeholder="Search by name, phone, or house no."
              />
              <button v-if="search" class="search-clear" @click="search = ''">
                <v-icon size="16">mdi-close-circle</v-icon>
              </button>
            </div>

            <select v-model="filterSection" class="filter-select">
              <option :value="null">All sections</option>
              <option v-for="s in sectionOptions" :key="s" :value="s">{{ s }}</option>
            </select>

            <select v-model="filterCourt" class="filter-select">
              <option :value="null">All courts</option>
              <option v-for="c in courtOptions" :key="c" :value="c">{{ c }}</option>
            </select>

            <select v-model="filterStreet" class="filter-select">
              <option :value="null">All streets</option>
              <option v-for="s in streetOptions" :key="s" :value="s">{{ s }}</option>
            </select>

            <select v-model="filterStatus" class="filter-select">
              <option :value="null">Any status</option>
              <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
            </select>

            <button
              v-if="hasActiveFilters"
              class="clear-filters-btn"
              @click="clearFilters"
            >
              <v-icon size="14" class="mr-1">mdi-close</v-icon>
              Clear
            </button>
          </div>
        </div>

        <!-- ============================================================
             LOADING
             ============================================================ -->
        <div v-if="loading && !rows.length" class="panel-card reveal-card">
          <div class="pa-6">
            <v-skeleton-loader type="list-item-two-line, list-item-two-line, list-item-two-line" />
          </div>
        </div>

        <!-- ============================================================
             EMPTY
             ============================================================ -->
        <div v-else-if="!filteredRows.length" class="panel-card reveal-card">
          <div class="empty-block">
            <div class="empty-icon">
              <v-icon size="40" color="#cbd5e1">mdi-table-off</v-icon>
            </div>
            <div class="empty-title">No data to display</div>
            <div class="empty-sub">
              {{ hasActiveFilters ? 'Try clearing filters.' : 'No households in this estate yet.' }}
            </div>
            <button
              v-if="hasActiveFilters"
              class="empty-clear-btn"
              @click="clearFilters"
            >
              <v-icon size="14" class="mr-1">mdi-close</v-icon>
              Clear filters
            </button>
          </div>
        </div>

        <!-- ============================================================
             DESKTOP TABLE — horizontal scroll
             ============================================================ -->
        <div v-else class="reveal-card" style="animation-delay: 250ms">
          <div class="table-panel">
            <div class="list-head">
              <div class="panel-icon panel-icon-purple panel-icon-sm">
                <v-icon size="18" color="white">mdi-table-large</v-icon>
              </div>
              <div class="panel-title-group">
                <div class="panel-title">Monthly breakdown</div>
                <div class="panel-sub">
                  {{ filteredRows.length }} household{{ filteredRows.length === 1 ? '' : 's' }} · {{ year }}
                </div>
              </div>
              <div class="scroll-hint">
                <v-icon size="14" class="scroll-hint-icon">mdi-gesture-swipe-left</v-icon>
                <span>Scroll to see all months</span>
              </div>
            </div>

            <!-- Wide table (horizontal scroll preserved) -->
            <div class="table-wrap hidden-xs-only">
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
                      <div class="household-cell">
                        <div class="household-cell-avatar">
                          {{ initialsOf(r.primary_owner) }}
                        </div>
                        <div class="household-cell-info">
                          <div class="household-cell-name">{{ r.primary_owner }}</div>
                          <div class="household-cell-addr">
                            {{ [r.section, r.court, r.street].filter(Boolean).join(' · ') }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="num-col">{{ formatNum(r.balance_bf) }}</td>
                    <td v-for="m in months" :key="m.key" class="num-col">
                      <span :class="Number(r[m.key]) > 0 ? 'paid-cell' : 'zero-cell'">
                        {{ Number(r[m.key]) > 0 ? formatNum(r[m.key]) : '—' }}
                      </span>
                    </td>
                    <td class="num-col strong-col">{{ formatNum(r.total_paid) }}</td>
                    <td class="num-col">{{ formatNum(r.due_to_date) }}</td>
                    <td class="num-col status-col">
                      <span class="status-chip" :class="statusClass(r.status)">
                        {{ r.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile card list -->
            <div class="mobile-list">
              <div
                v-for="r in filteredRows"
                :key="`mob-${r.household_id}`"
                class="mobile-row"
                @click="openHousehold(r)"
              >
                <div class="mobile-row-head">
                  <div class="household-cell-avatar">
                    {{ initialsOf(r.primary_owner) }}
                  </div>
                  <div class="mobile-row-info">
                    <div class="mobile-row-name">{{ r.primary_owner }}</div>
                    <div class="mobile-row-addr">
                      {{ [r.section, r.court, r.street].filter(Boolean).join(' · ') }}
                    </div>
                  </div>
                  <span class="status-chip" :class="statusClass(r.status)">
                    {{ r.status }}
                  </span>
                </div>

                <div class="mobile-row-stats">
                  <div class="m-stat">
                    <div class="m-stat-label">Total Paid</div>
                    <div class="m-stat-value">{{ formatNum(r.total_paid) }}</div>
                  </div>
                  <div class="m-stat">
                    <div class="m-stat-label">Due YTD</div>
                    <div class="m-stat-value">{{ formatNum(r.due_to_date) }}</div>
                  </div>
                  <div class="m-stat">
                    <div class="m-stat-label">{{ Number(r.overdue) > 0 ? 'Overdue' : 'Prepaid' }}</div>
                    <div
                      class="m-stat-value"
                      :class="Number(r.overdue) > 0 ? 'm-red' : 'm-green'"
                    >
                      {{ formatNum(Math.abs(Number(r.overdue || 0))) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
      rows: [],

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
        await Promise.allSettled([this.fetchEstate(), this.fetchSummary()]);
      }
      this.loading = false;
    },

    async fetchOfficial() {
      try {
        const { data, status } = await axios.get(`${API}/officials/getOfficialById/${this.uid}`);
        if (status === 200) {
          this.official = {
            full_name: data.full_name || '',
            role: data.role || '',
            estate_id: data.estate_id || null,
          };
          this.estateId = data.estate_id;
        }
      } catch (error) {
        console.error('Official fetch failed:', error.response?.data || error.message);
      }
    },

    async fetchEstate() {
      if (!this.estateId) return;
      try {
        const { data, status } = await axios.get(`${API}/estates/estate/${this.estateId}`);
        if (status === 200) {
          this.estate = {
            estate_name: data.estate_name || '',
            urn: data.estate_urn || '',
          };
        }
      } catch (error) {
        console.warn('Estate fetch failed:', error.response?.data || error.message);
      }
    },

    async fetchSummary() {
      if (!this.estateId) return;

      const url = `${API}/households/estate/${this.estateId}/households/list?year=${this.year}`;

      try {
        const { data, status } = await axios.get(url);
        if (status === 200 && Array.isArray(data)) {
          this.rows = data.map((r) => ({
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
        } else {
          this.rows = [];
        }
      } catch (error) {
        console.error('Summary fetch failed:', error.response?.status || error.message);
        this.rows = [];
        if (error.response?.status === 404) {
          this.showSnackbar('Payment summary endpoint not available yet', 'warning');
        }
      }
    },

    clearFilters() {
      this.search = '';
      this.filterSection = null;
      this.filterCourt = null;
      this.filterStreet = null;
      this.filterStatus = null;
    },

    exportCSV() {
      const header = ['Household', 'Phone', 'Address', 'B/F',
        ...this.months.map((m) => m.short),
        'Total Paid', 'Due YTD', 'Overdue', 'Status'];

      const lines = [header.join(',')];

      for (const r of this.filteredRows) {
        const row = [
          r.primary_owner,
          r.contact_number,
          `"${r.section} ${r.court} ${r.street}"`,
          r.balance_bf,
          ...this.months.map((m) => r[m.key]),
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
      a.download = `payments-${this.estate.estate_name || 'estate'}-${this.year}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    },

    openHousehold(r) {
      this.goTo(`/officials/residence/${r.household_id}`);
    },

    initialsOf(name) {
      if (!name) return '?';
      return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    },
    formatNum(n) {
      return numeral(n || 0).format('0,0');
    },
    statusClass(status) {
      if (status === 'Overdue') return 'status-red';
      if (status === 'Prepaid') return 'status-green';
      return 'status-purple';
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

@keyframes scrollHintSlide {
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(-4px); }
}

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

.back-btn {
  background: #ffffff;
  border: 1px solid #eef1f6;
  transition: all 0.2s ease;
}
.back-btn:hover {
  background: rgba(128, 81, 255, 0.06);
  border-color: rgba(128, 81, 255, 0.3);
}

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

.year-picker {
  padding: 9px 30px 9px 14px;
  border-radius: 12px;
  border: 1px solid #eef1f6;
  background: #ffffff;
  color: #0f0d24;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  cursor: pointer;
  font-family: inherit;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: all 0.2s ease;
}
.year-picker:hover { border-color: rgba(128, 81, 255, 0.35); }
.year-picker:focus { border-color: #8051ff; }

.avatar-glow { box-shadow: 0 8px 18px -8px rgba(128, 81, 255, 0.6); }

/* ============================================================
   KPI CARDS
   ============================================================ */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}
.kpi {
  position: relative;
  padding: 18px 20px;
  border-radius: 20px;
  overflow: hidden;
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.28s ease;
}
.kpi:hover { transform: translateY(-3px); }

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
.kpi-icon-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  box-shadow: 0 10px 22px -10px rgba(59, 130, 246, 0.6);
}
.kpi-icon-lime {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  box-shadow: 0 10px 22px -10px rgba(182, 255, 0, 0.6);
}
.kpi-icon-white {
  background: #ffffff;
  box-shadow: 0 10px 22px -10px rgba(255, 255, 255, 0.5);
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
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.9px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.kpi-value-dark { color: #ffffff; }
.kpi-foot {
  margin-top: 10px;
  font-size: 0.72rem;
  font-weight: 700;
}
.kpi-foot-muted { color: #94a3b8; }
.kpi-foot-light { color: rgba(255, 255, 255, 0.85); }

/* ============================================================
   FILTERS
   ============================================================ */
.panel-card {
  background: #ffffff;
  border: 1px solid #eef1f6;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.03);
}
.filters-card { padding: 14px 16px; margin-bottom: 16px; }
.filters-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto;
  gap: 10px;
  align-items: center;
}
@media (max-width: 1023px) {
  .filters-grid { grid-template-columns: 1fr 1fr 1fr; }
  .search-wrap { grid-column: 1 / -1; }
  .clear-filters-btn { grid-column: 1 / -1; justify-content: center; }
}
@media (max-width: 599px) {
  .filters-grid { grid-template-columns: 1fr 1fr; }
}

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 10px 36px 10px 38px;
  border-radius: 12px;
  border: 1.5px solid #eef1f6;
  background: #f8fafc;
  font-size: 0.82rem;
  font-weight: 600;
  color: #0f0d24;
  outline: none;
  font-family: inherit;
  transition: all 0.2s ease;
}
.search-input:focus {
  border-color: #8051ff;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(128, 81, 255, 0.08);
}
.search-input::placeholder { color: #94a3b8; font-weight: 500; }
.search-clear {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}
.search-clear:hover { color: #0f0d24; }

.filter-select {
  padding: 10px 14px;
  border-radius: 12px;
  border: 1.5px solid #eef1f6;
  background: #f8fafc;
  font-size: 0.8rem;
  font-weight: 700;
  color: #0f0d24;
  outline: none;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 34px;
}
.filter-select:focus {
  border-color: #8051ff;
  background-color: #ffffff;
}

.clear-filters-btn {
  display: inline-flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.08);
  color: #b91c1c;
  border: 1px solid rgba(239, 68, 68, 0.2);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}
.clear-filters-btn:hover {
  background: rgba(239, 68, 68, 0.14);
  border-color: rgba(239, 68, 68, 0.35);
}

/* ============================================================
   TABLE PANEL
   ============================================================ */
.table-panel {
  background: #ffffff;
  border: 1px solid #eef1f6;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.03);
}
.list-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  background: linear-gradient(to bottom, #ffffff, #f8fafc);
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
}
.panel-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.panel-icon-sm {
  width: 40px;
  height: 40px;
  border-radius: 11px;
}
.panel-icon-purple {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.7);
}
.panel-title-group { flex: 1; min-width: 0; }
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
.scroll-hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(128, 81, 255, 0.08);
  border: 1px solid rgba(128, 81, 255, 0.15);
  color: #8051ff;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.3px;
}
.scroll-hint-icon {
  color: #8051ff !important;
  animation: scrollHintSlide 2s ease-in-out infinite;
}

/* ============================================================
   DESKTOP TABLE (horizontal scroll preserved)
   ============================================================ */
.table-wrap {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}
.table-wrap::-webkit-scrollbar { height: 10px; }
.table-wrap::-webkit-scrollbar-track { background: #f8fafc; }
.table-wrap::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 5px;
}
.table-wrap::-webkit-scrollbar-thumb:hover { background: #c7b8ff; }

.payments-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 1100px;
  font-size: 0.82rem;
}
.payments-table th,
.payments-table td {
  padding: 12px 14px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
  white-space: nowrap;
}
.payments-table thead th {
  background: #f8fafc;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 0.66rem;
  letter-spacing: 0.6px;
  color: #64748b;
  position: sticky;
  top: 0;
  z-index: 1;
  border-bottom: 1px solid #e2e8f0;
}
.payments-table .sticky-col {
  position: sticky;
  left: 0;
  background: #ffffff;
  z-index: 2;
  box-shadow: 2px 0 6px rgba(15, 13, 36, 0.04);
  min-width: 240px;
}
.payments-table thead .sticky-col {
  background: #f8fafc;
  z-index: 3;
}
.num-col {
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, SFMono-Regular, monospace;
}
.status-col {
  text-align: center;
}
.strong-col {
  font-weight: 800;
  color: #0f0d24;
  background: #faf5ff;
}
.data-row {
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.data-row:hover { background-color: #fafbff; }
.data-row:hover .sticky-col { background-color: #fafbff; }

.paid-cell {
  color: #166534;
  font-weight: 700;
}
.zero-cell {
  color: #cbd5e1;
}

/* Household cell */
.household-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.household-cell-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.household-cell-info { min-width: 0; }
.household-cell-name {
  font-size: 0.84rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.household-cell-addr {
  font-size: 0.68rem;
  color: #94a3b8;
  margin-top: 2px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Status chips */
.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.status-red    { background: rgba(239, 68, 68, 0.12); color: #b91c1c; }
.status-green  { background: rgba(122, 184, 0, 0.16); color: #3f6b00; }
.status-purple { background: rgba(128, 81, 255, 0.12); color: #5b21b6; }

/* ============================================================
   MOBILE CARD LIST
   ============================================================ */
.mobile-list {
  display: none;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
}
.mobile-row {
  background: #ffffff;
  border: 1px solid #eef1f6;
  border-radius: 16px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.mobile-row:hover {
  border-color: rgba(128, 81, 255, 0.35);
  box-shadow: 0 12px 26px -16px rgba(128, 81, 255, 0.35);
}

.mobile-row-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.mobile-row-info { flex: 1; min-width: 0; }
.mobile-row-name {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mobile-row-addr {
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 2px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-row-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}
.m-stat { min-width: 0; }
.m-stat-label {
  font-size: 0.58rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  margin-bottom: 3px;
}
.m-stat-value {
  font-size: 0.82rem;
  font-weight: 800;
  color: #0f0d24;
  font-variant-numeric: tabular-nums;
}
.m-red { color: #dc2626; }
.m-green { color: #3f6b00; }

/* Show mobile list, hide table on small screens */
@media (max-width: 599px) {
  .table-wrap.hidden-xs-only { display: none; }
  .mobile-list { display: flex; }
}

/* ============================================================
   EMPTY
   ============================================================ */
.empty-block {
  padding: 64px 24px;
  text-align: center;
}
.empty-icon {
  width: 84px;
  height: 84px;
  border-radius: 24px;
  background: #f6f7fb;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18px;
}
.empty-title {
  font-size: 1rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
}
.empty-sub {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 6px;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.55;
}
.empty-clear-btn {
  display: inline-flex;
  align-items: center;
  margin-top: 20px;
  padding: 9px 18px;
  border-radius: 999px;
  background: rgba(128, 81, 255, 0.08);
  border: 1px solid rgba(128, 81, 255, 0.18);
  color: #8051ff;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}
.empty-clear-btn:hover {
  background: rgba(128, 81, 255, 0.14);
  border-color: rgba(128, 81, 255, 0.35);
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
.mobile-nav-btn { min-width: 0 !important; }
.mobile-nav-label { font-size: 10px; margin-top: 2px; font-weight: 700; }

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 767px) {
  .kpi-value { font-size: 1.5rem; }
  .kpi { padding: 16px; }
  .list-head { padding: 14px 16px; }
  .scroll-hint { display: none; }
}

@media (max-width: 599px) {
  .sticky-header-premium { padding-left: 12px; padding-right: 12px; }
  .reveal-card { animation-duration: 0.4s; }
  .year-picker { padding: 8px 26px 8px 12px; font-size: 0.74rem; }
}
</style>