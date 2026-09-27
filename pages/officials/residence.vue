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
                      Residence
                    </h1>
                    <v-chip
                      x-small
                      label
                      color="purple lighten-5 purple--text"
                      class="ml-2 font-weight-bold hidden-xs-only"
                    >
                      {{ filteredHouseholds.length }}
                    </v-chip>
                  </div>
                  <div class="d-flex align-center mt-1">
                    <v-icon x-small color="success" class="mr-1">mdi-circle</v-icon>
                    <span class="text-caption text--secondary">
                      All approved households in {{ estate.estate_name || 'your estate' }}
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
              <button
                class="add-btn mr-2 hidden-xs-only"
                @click="openNewDialog"
              >
                <v-icon size="16" class="mr-1">mdi-plus</v-icon>
                Add household
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
             FILTER TOOLBAR
             ============================================================ -->
        <div class="panel-card filters-card reveal-card">
          <div class="filters-grid">
            <div class="search-wrap">
              <v-icon size="18" class="search-icon">mdi-magnify</v-icon>
              <input
                v-model="search"
                class="search-input"
                type="text"
                placeholder="Search by name, phone, or house number"
              />
              <button
                v-if="search"
                class="search-clear"
                @click="search = ''"
              >
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
        <div v-if="loading && !households.length" class="panel-card reveal-card">
          <div class="pa-6">
            <v-skeleton-loader
              type="list-item-avatar-three-line, list-item-avatar-three-line, list-item-avatar-three-line, list-item-avatar-three-line"
            />
          </div>
        </div>

        <!-- ============================================================
             EMPTY
             ============================================================ -->
        <div v-else-if="!filteredHouseholds.length" class="panel-card reveal-card">
          <div class="empty-block">
            <div class="empty-icon">
              <v-icon size="40" color="#cbd5e1">
                {{ hasActiveFilters ? 'mdi-filter-off' : 'mdi-home-group' }}
              </v-icon>
            </div>
            <div class="empty-title">
              {{ hasActiveFilters ? 'No matching households' : 'No households yet' }}
            </div>
            <div class="empty-sub">
              {{ hasActiveFilters
                ? 'Try clearing the filters or searching for something else.'
                : 'Approved households will appear here.' }}
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
             HOUSEHOLD LIST
             ============================================================ -->
        <div v-else class="reveal-card">
          <div class="list-head">
            <div class="panel-icon panel-icon-purple panel-icon-sm">
              <v-icon size="18" color="white">mdi-home-group</v-icon>
            </div>
            <div class="panel-title-group">
              <div class="panel-title">
                {{ filteredHouseholds.length }} household{{ filteredHouseholds.length === 1 ? '' : 's' }}
              </div>
              <div class="panel-sub">Ordered by address</div>
            </div>
            <button
              v-if="!nav_bars"
              class="view-summary-btn"
              @click="goTo('/officials/payments')"
            >
              <v-icon size="14" class="mr-1">mdi-chart-bar</v-icon>
              Payment summary
            </button>
          </div>

          <div class="household-list">
            <div
              v-for="h in filteredHouseholds"
              :key="h.household_id"
              class="household-card"
              @click="openHousehold(h)"
            >
              <div
                class="household-avatar"
                :class="isOfficial(h) ? 'household-avatar-official' : 'household-avatar-default'"
              >
                {{ initialsOf(h.primary_owner) }}
              </div>

              <div class="household-body">
                <div class="household-title-row">
                  <span class="household-name">{{ h.primary_owner }}</span>
                  <span v-if="isOfficial(h)" class="tag tag-official">
                    <v-icon size="10">mdi-shield-account</v-icon>
                    {{ h.official_role || 'Official' }}
                  </span>
                  <span v-if="!isActive(h)" class="tag tag-inactive">
                    Inactive
                  </span>
                </div>

                <div class="household-addr">
                  <span class="addr-chip addr-chip-house">
                    <v-icon size="11">mdi-home</v-icon>
                    {{ h.house_number || 'No #' }}
                  </span>
                  <span v-if="h.section" class="addr-chip addr-chip-purple">{{ h.section }}</span>
                  <span v-if="h.court" class="addr-chip addr-chip-blue">{{ h.court }}</span>
                  <span v-if="h.street" class="addr-chip addr-chip-green">{{ h.street }}</span>
                </div>

                <div class="household-meta">
                  <div class="meta-item">
                    <v-icon size="13" color="#94a3b8">mdi-phone-outline</v-icon>
                    <span>{{ h.contact_number }}</span>
                  </div>
                  <div v-if="h.residence_status" class="meta-item">
                    <v-icon size="13" color="#94a3b8">mdi-account-switch-outline</v-icon>
                    <span>{{ h.residence_status }}</span>
                  </div>
                  <div v-if="h.caretaker_name" class="meta-item">
                    <v-icon size="13" color="#94a3b8">mdi-account-tie-outline</v-icon>
                    <span>{{ h.caretaker_name }}</span>
                  </div>
                </div>
              </div>

              <v-icon size="18" class="household-chevron">mdi-chevron-right</v-icon>
            </div>
          </div>
        </div>

        <!-- Mobile FAB -->
        <button
          v-if="nav_bars"
          class="mobile-fab"
          @click="openNewDialog"
        >
          <v-icon size="24" color="white">mdi-plus</v-icon>
        </button>
      </v-container>

      <!-- ============================================================
           HOUSEHOLD DETAIL DIALOG
           ============================================================ -->
      <v-dialog
        v-model="detailDialog"
        max-width="560"
        persistent
        content-class="detail-dialog-content"
      >
        <div v-if="selectedHousehold" class="detail-dialog-card">
          <!-- Header -->
          <div class="detail-dialog-header">
            <div class="detail-header-avatar">
              {{ initialsOf(selectedHousehold.primary_owner) }}
            </div>
            <div class="detail-header-info">
              <div class="detail-header-name">{{ selectedHousehold.primary_owner }}</div>
              <div class="detail-header-uid">{{ selectedHousehold.uid }}</div>
            </div>
            <button class="detail-header-close" @click="detailDialog = false">
              <v-icon size="18" color="white">mdi-close</v-icon>
            </button>
          </div>

          <!-- Body -->
          <div class="detail-dialog-body">
            <!-- Stats -->
            <div class="detail-stats-grid">
              <div class="detail-stat detail-stat-neutral">
                <div class="detail-stat-label">Total Paid</div>
                <div class="detail-stat-value">KES {{ formatNum(detailStats.total_paid) }}</div>
              </div>
              <div
                class="detail-stat"
                :class="detailStats.overdue > 0 ? 'detail-stat-red' : 'detail-stat-green'"
              >
                <div class="detail-stat-label">
                  {{ detailStats.overdue > 0 ? 'Overdue' : 'Prepaid' }}
                </div>
                <div class="detail-stat-value">
                  KES {{ formatNum(detailStats.overdue > 0 ? detailStats.overdue : detailStats.prepaid) }}
                </div>
              </div>
            </div>

            <!-- Detail rows -->
            <div class="detail-rows">
              <div class="detail-row">
                <div class="detail-row-icon">
                  <v-icon size="16" color="#8051FF">mdi-home-outline</v-icon>
                </div>
                <div class="detail-row-body">
                  <div class="detail-row-label">House Number</div>
                  <div class="detail-row-value">{{ selectedHousehold.house_number || '—' }}</div>
                </div>
              </div>

              <div class="detail-row">
                <div class="detail-row-icon">
                  <v-icon size="16" color="#8051FF">mdi-map-marker-outline</v-icon>
                </div>
                <div class="detail-row-body">
                  <div class="detail-row-label">Address</div>
                  <div class="detail-row-value">
                    {{ [selectedHousehold.section, selectedHousehold.court, selectedHousehold.street].filter(Boolean).join(' · ') || '—' }}
                  </div>
                </div>
              </div>

              <div class="detail-row">
                <div class="detail-row-icon">
                  <v-icon size="16" color="#8051FF">mdi-phone-outline</v-icon>
                </div>
                <div class="detail-row-body">
                  <div class="detail-row-label">Contact</div>
                  <div class="detail-row-value">{{ selectedHousehold.contact_number }}</div>
                </div>
              </div>

              <div class="detail-row">
                <div class="detail-row-icon">
                  <v-icon size="16" color="#8051FF">mdi-account-switch-outline</v-icon>
                </div>
                <div class="detail-row-body">
                  <div class="detail-row-label">Residence Status</div>
                  <div class="detail-row-value">{{ selectedHousehold.residence_status || '—' }}</div>
                </div>
              </div>

              <div v-if="selectedHousehold.caretaker_name" class="detail-row">
                <div class="detail-row-icon">
                  <v-icon size="16" color="#8051FF">mdi-account-tie-outline</v-icon>
                </div>
                <div class="detail-row-body">
                  <div class="detail-row-label">Caretaker</div>
                  <div class="detail-row-value">
                    {{ selectedHousehold.caretaker_name }}
                    <span v-if="selectedHousehold.caretaker_contact" class="detail-row-sub">
                      · {{ selectedHousehold.caretaker_contact }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="detail-dialog-footer">
            <button class="detail-footer-btn detail-footer-btn-ghost" @click="detailDialog = false">
              Close
            </button>
            <button
              class="detail-footer-btn detail-footer-btn-primary"
              @click="goToHouseholdDashboard(selectedHousehold)"
            >
              <v-icon size="16" class="mr-1">mdi-view-dashboard</v-icon>
              View dashboard
            </button>
          </div>
        </div>
      </v-dialog>

      <!-- ============================================================
           ADD HOUSEHOLD DIALOG
           ============================================================ -->
      <v-dialog
        v-model="newDialog"
        max-width="440"
        content-class="detail-dialog-content"
      >
        <div class="dialog-card">
          <div class="add-dialog-body">
            <div class="add-dialog-icon">
              <v-icon size="32" color="#8051FF">mdi-account-plus</v-icon>
            </div>
            <div class="add-dialog-title">Add a household</div>
            <div class="add-dialog-sub">
              Register a new household on behalf of a resident. They'll be approved immediately.
            </div>

            <div class="add-dialog-actions">
              <button
                class="add-dialog-btn add-dialog-btn-ghost"
                @click="newDialog = false"
              >
                Cancel
              </button>
              <button
                class="add-dialog-btn add-dialog-btn-primary"
                @click="goToRegister"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </v-dialog>

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
  name: 'OfficialResidence',
  data() {
    return {
      nav_bars: false,
      activeTab: '/officials/residence',

      loading: false,
      uid: null,
      estateId: null,
      official: { full_name: '', role: '', estate_id: null },
      estate: { estate_name: '' },

      households: [],

      search: '',
      filterSection: null,
      filterCourt: null,
      filterStreet: null,

      detailDialog: false,
      selectedHousehold: null,
      detailStats: {
        total_paid: 0,
        overdue: 0,
        prepaid: 0,
      },

      newDialog: false,

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
    hasActiveFilters() {
      return !!(this.search || this.filterSection || this.filterCourt || this.filterStreet);
    },
    sectionOptions() {
      return [...new Set(this.households.map((h) => h.section).filter(Boolean))].sort();
    },
    courtOptions() {
      return [...new Set(this.households.map((h) => h.court).filter(Boolean))].sort();
    },
    streetOptions() {
      return [...new Set(this.households.map((h) => h.street).filter(Boolean))].sort();
    },
    filteredHouseholds() {
      const q = (this.search || '').trim().toLowerCase();
      return this.households.filter((h) => {
        if (this.filterSection && h.section !== this.filterSection) return false;
        if (this.filterCourt && h.court !== this.filterCourt) return false;
        if (this.filterStreet && h.street !== this.filterStreet) return false;
        if (!q) return true;
        return (
          (h.primary_owner || '').toLowerCase().includes(q) ||
          (h.contact_number || '').toLowerCase().includes(q) ||
          (h.house_number || '').toLowerCase().includes(q) ||
          (h.uid || '').toLowerCase().includes(q)
        );
      });
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
        await Promise.allSettled([this.fetchEstate(), this.fetchHouseholds()]);
      }
      this.loading = false;
    },

    async fetchOfficial() {
      try {
        const { data, status } = await axios.get(
          `${API}/officials/getOfficialById/${this.uid}`
        );
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
        const { data, status } = await axios.get(
          `${API}/estates/estate/${this.estateId}`
        );
        if (status === 200) {
          this.estate = { estate_name: data.estate_name || '' };
        }
      } catch (error) {
        console.warn('Estate fetch failed:', error.response?.data || error.message);
      }
    },

    async fetchHouseholds() {
      if (!this.estateId) return;
      try {
        const url = `${API}/households/getBHsHldEstId/${this.estateId}`;
        const { data, status } = await axios.get(url);
        if (status === 200) {
          const list = Array.isArray(data) ? data : [];
          this.households = list.slice().sort((a, b) => {
            const sA = `${a.section || ''}|${a.court || ''}|${a.street || ''}|${a.house_number || ''}`;
            const sB = `${b.section || ''}|${b.court || ''}|${b.street || ''}|${b.house_number || ''}`;
            return sA.localeCompare(sB);
          });
        }
      } catch (error) {
        console.error('Households fetch failed:', error.response?.data || error.message);
        this.households = [];
      }
    },

    clearFilters() {
      this.search = '';
      this.filterSection = null;
      this.filterCourt = null;
      this.filterStreet = null;
    },

    async openHousehold(h) {
      this.selectedHousehold = h;
      this.detailDialog = true;
      this.detailStats = { total_paid: 0, overdue: 0, prepaid: 0 };
      await this.fetchDetailStats(h);
    },

    async fetchDetailStats(h) {
      try {
        const url = `${API}/households/dashboard/pk/${h.household_id}?year=${new Date().getFullYear()}`;
        const { data, status } = await axios.get(url);
        if (status === 200) {
          this.detailStats = {
            total_paid: Number(data.total_paid) || 0,
            overdue: Number(data.overdue) || 0,
            prepaid: Number(data.prepaid) || 0,
          };
        }
      } catch (error) {
        console.warn('Detail stats failed:', error.response?.data || error.message);
      }
    },

    goToHouseholdDashboard(h) {
      this.detailDialog = false;
      this.goTo(`/officials/residence/${h.household_id}`);
    },

    openNewDialog() {
      this.newDialog = true;
    },
    goToRegister() {
      this.newDialog = false;
      this.goTo('/household/register');
    },

    initialsOf(name) {
      if (!name) return '?';
      return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    },
    isOfficial(h) {
      const v = h?.is_official;
      return v === 1 || v === '1' || v === true;
    },
    isActive(h) {
      const v = h?.active;
      return v === 1 || v === '1' || v === true;
    },
    formatNum(n) {
      return numeral(n || 0).format('0,0');
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

.add-btn {
  display: inline-flex;
  align-items: center;
  padding: 9px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  box-shadow: 0 10px 24px -12px rgba(128, 81, 255, 0.7);
}
.add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px -12px rgba(128, 81, 255, 0.85);
}

.avatar-glow { box-shadow: 0 8px 18px -8px rgba(128, 81, 255, 0.6); }

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
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 10px;
  align-items: center;
}
@media (max-width: 900px) {
  .filters-grid {
    grid-template-columns: 1fr 1fr;
  }
  .search-wrap { grid-column: 1 / -1; }
  .clear-filters-btn { grid-column: 1 / -1; justify-content: center; }
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
  font-size: 0.82rem;
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
   LIST HEAD
   ============================================================ */
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
.view-summary-btn {
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
.view-summary-btn:hover {
  background: rgba(128, 81, 255, 0.14);
  border-color: rgba(128, 81, 255, 0.35);
}

/* ============================================================
   HOUSEHOLD LIST
   ============================================================ */
.household-list {
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 8px;
}
.household-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: #ffffff;
  border: 1px solid #eef1f6;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.household-card:hover {
  border-color: rgba(128, 81, 255, 0.35);
  box-shadow: 0 12px 26px -16px rgba(128, 81, 255, 0.35);
  transform: translateY(-1px);
}

.household-avatar {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}
.household-avatar-default {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.65);
}
.household-avatar-official {
  background: linear-gradient(135deg, #b6ff00 0%, #8fbc00 100%);
  color: #0a0a14;
  box-shadow: 0 10px 22px -10px rgba(182, 255, 0, 0.65);
}

.household-body { flex: 1; min-width: 0; }
.household-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.household-name {
  font-size: 0.92rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}
.tag-official {
  background: rgba(122, 184, 0, 0.14);
  color: #3f6b00;
}
.tag-inactive {
  background: #f1f5f9;
  color: #475569;
}

.household-addr {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
}
.addr-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}
.addr-chip-house  { background: #f1f5f9; color: #475569; }
.addr-chip-purple { background: rgba(128, 81, 255, 0.12); color: #6d28d9; }
.addr-chip-blue   { background: rgba(59, 130, 246, 0.12); color: #1d4ed8; }
.addr-chip-green  { background: rgba(122, 184, 0, 0.14); color: #3f6b00; }

.household-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: #64748b;
  font-weight: 600;
}

.household-chevron {
  flex-shrink: 0;
  color: #cbd5e1;
  opacity: 0.7;
  transition: opacity 0.2s ease, transform 0.2s ease, color 0.2s ease;
}
.household-card:hover .household-chevron {
  opacity: 1;
  transform: translateX(2px);
  color: #8051ff;
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
   MOBILE FAB
   ============================================================ */
.mobile-fab {
  position: fixed;
  bottom: 84px;
  right: 20px;
  width: 54px;
  height: 54px;
  border-radius: 18px;
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16px 32px -12px rgba(128, 81, 255, 0.75);
  z-index: 200;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.mobile-fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 38px -12px rgba(128, 81, 255, 0.9);
}

/* ============================================================
   DIALOG
   ============================================================ */
::v-deep .v-dialog {
  margin: 8px !important;
}

.detail-dialog-content {
  overflow: hidden !important;
  border-radius: 22px !important;
  margin: 16px auto !important;
  max-width: 560px !important;
  width: calc(100% - 32px) !important;
  max-height: calc(100vh - 32px) !important;
  display: flex !important;
  flex-direction: column !important;
  box-shadow: 0 24px 60px -20px rgba(15, 13, 36, 0.4) !important;
}

.detail-dialog-card {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  min-height: 0;
  background: #ffffff;
  border-radius: 22px;
  overflow: hidden;
  width: 100%;
}
.dialog-card {
  background: #ffffff;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 24px 60px -20px rgba(15, 13, 36, 0.4);
}

/* Header */
.detail-dialog-header {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  padding: 16px 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  overflow: hidden;
}
.detail-dialog-header::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.18), transparent 50%);
  pointer-events: none;
}
.detail-header-avatar {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  letter-spacing: 0.5px;
  font-size: 0.85rem;
  flex-shrink: 0;
}
.detail-header-info { flex: 1; min-width: 0; }
.detail-header-name {
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.detail-header-uid {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 3px;
  font-family: ui-monospace, SFMono-Regular, monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.detail-header-close {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s ease;
}
.detail-header-close:hover {
  background: rgba(255, 255, 255, 0.28);
}

/* Body */
.detail-dialog-body {
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1 1 auto;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}

/* Stats grid */
.detail-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 18px;
}
.detail-stat {
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid #eef1f6;
}
.detail-stat-neutral {
  background: #ffffff;
}
.detail-stat-green {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: rgba(34, 197, 94, 0.25);
}
.detail-stat-red {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: rgba(239, 68, 68, 0.25);
}
.detail-stat-label {
  font-size: 0.62rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 4px;
}
.detail-stat-red .detail-stat-label { color: #b91c1c; }
.detail-stat-green .detail-stat-label { color: #3f6b00; }
.detail-stat-value {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.4px;
  font-variant-numeric: tabular-nums;
}
.detail-stat-red .detail-stat-value { color: #991b1b; }
.detail-stat-green .detail-stat-value { color: #166534; }

/* Detail rows */
.detail-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.detail-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #fafbff;
  border: 1px solid #f0f2f7;
}
.detail-row-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(128, 81, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.detail-row-body { flex: 1; min-width: 0; }
.detail-row-label {
  font-size: 0.6rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 3px;
}
.detail-row-value {
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f0d24;
  word-break: break-word;
}
.detail-row-sub {
  font-weight: 500;
  color: #94a3b8;
}

/* Footer */
.detail-dialog-footer {
  padding: 14px 20px 18px;
  display: flex;
  gap: 10px;
  flex-shrink: 0;
  border-top: 1px solid #f1f5f9;
  background: #ffffff;
}
.detail-footer-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 18px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}
.detail-footer-btn-ghost {
  background: #f6f7fb;
  color: #475569;
  border: 1px solid #eef1f6;
}
.detail-footer-btn-ghost:hover { background: #eef1f6; }
.detail-footer-btn-primary {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  box-shadow: 0 10px 24px -12px rgba(128, 81, 255, 0.7);
}
.detail-footer-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px -12px rgba(128, 81, 255, 0.85);
}

/* Add household dialog */
.add-dialog-body {
  padding: 28px 24px;
  text-align: center;
}
.add-dialog-icon {
  width: 68px;
  height: 68px;
  border-radius: 20px;
  background: rgba(128, 81, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}
.add-dialog-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
}
.add-dialog-sub {
  font-size: 0.82rem;
  color: #64748b;
  margin-top: 8px;
  line-height: 1.55;
}
.add-dialog-actions {
  display: flex;
  gap: 10px;
  margin-top: 22px;
}
.add-dialog-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 18px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}
.add-dialog-btn-ghost {
  background: #f6f7fb;
  color: #475569;
  border: 1px solid #eef1f6;
}
.add-dialog-btn-ghost:hover { background: #eef1f6; }
.add-dialog-btn-primary {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  box-shadow: 0 10px 24px -12px rgba(128, 81, 255, 0.7);
}
.add-dialog-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px -12px rgba(128, 81, 255, 0.85);
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
  .household-card { padding: 12px 14px; gap: 12px; }
  .household-avatar { width: 42px; height: 42px; }
  .household-name { font-size: 0.88rem; }
  .detail-stats-grid { grid-template-columns: 1fr 1fr; }
  .detail-dialog-body { padding: 16px; }
}

@media (max-width: 599px) {
  .sticky-header-premium { padding-left: 12px; padding-right: 12px; }
  .reveal-card { animation-duration: 0.4s; }
  .detail-dialog-content {
    width: calc(100% - 16px) !important;
    margin: 8px auto !important;
    max-height: calc(100vh - 16px) !important;
  }
}
</style>