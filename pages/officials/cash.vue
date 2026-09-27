<template>
  <div class="d-flex bg-surface dashboard-root" style="min-height: 100vh;">
    <!-- ============================================================
         DESKTOP SIDEBAR
         ============================================================ -->
    <v-navigation-drawer v-if="!nav_bars" permanent width="260" class="elevation-0 sidebar-glass">
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
          <v-btn block outlined color="#8051FF" class="rounded-xl text-capitalize font-weight-medium signout-btn" @click="logout">
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
                      Cash Routing
                    </h1>
                    <v-chip
                      x-small
                      label
                      color="purple lighten-5 purple--text"
                      class="ml-2 font-weight-bold hidden-xs-only"
                    >
                      {{ records.length }}
                    </v-chip>
                  </div>
                  <div class="d-flex align-center mt-1">
                    <v-icon x-small color="success" class="mr-1">mdi-circle</v-icon>
                    <span class="text-caption text--secondary">
                      Cash collected per official · {{ estate.estate_name || '' }}
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
                @click="openAddDialog"
              >
                <v-icon size="16" class="mr-1">mdi-plus</v-icon>
                Record cash
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
          <!-- Total Collected -->
          <div class="kpi kpi-light reveal-card">
            <div class="kpi-top">
              <div class="kpi-icon kpi-icon-green">
                <v-icon size="20" color="white">mdi-cash-multiple</v-icon>
              </div>
            </div>
            <div class="kpi-label">Total Collected</div>
            <div class="kpi-value">{{ formatNum(kpis.total) }}</div>
            <div class="kpi-foot kpi-foot-muted">KES all time</div>
          </div>

          <!-- This Month -->
          <div class="kpi kpi-dark reveal-card" style="animation-delay: 50ms">
            <div class="kpi-top">
              <div class="kpi-icon kpi-icon-white">
                <v-icon size="20" color="#0A0A14">mdi-calendar-month</v-icon>
              </div>
            </div>
            <div class="kpi-label kpi-label-dark">This Month</div>
            <div class="kpi-value kpi-value-dark">{{ formatNum(kpis.thisMonth) }}</div>
            <div class="kpi-foot kpi-foot-light">KES collected</div>
          </div>

          <!-- Officials Logging -->
          <div class="kpi kpi-light reveal-card" style="animation-delay: 100ms">
            <div class="kpi-top">
              <div class="kpi-icon kpi-icon-blue">
                <v-icon size="20" color="white">mdi-account-group-outline</v-icon>
              </div>
            </div>
            <div class="kpi-label">Officials Logging</div>
            <div class="kpi-value">{{ kpis.officialCount }}</div>
            <div class="kpi-foot kpi-foot-muted">Distinct officials</div>
          </div>
        </div>

        <!-- ============================================================
             FILTERS
             ============================================================ -->
        <div class="panel-card filters-card reveal-card" style="animation-delay: 150ms">
          <div class="filters-grid">
            <div class="search-wrap">
              <v-icon size="18" class="search-icon">mdi-magnify</v-icon>
              <input
                v-model="search"
                class="search-input"
                type="text"
                placeholder="Search by official name or remarks"
              />
              <button v-if="search" class="search-clear" @click="search = ''">
                <v-icon size="16">mdi-close-circle</v-icon>
              </button>
            </div>

            <select v-model="filterOfficial" class="filter-select">
              <option :value="null">All officials</option>
              <option v-for="o in officialOptions" :key="o" :value="o">{{ o }}</option>
            </select>

            <select v-model="filterMonth" class="filter-select">
              <option :value="null">Any month</option>
              <option v-for="m in monthOptions" :key="m" :value="m">{{ prettyMonth(m) }}</option>
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
        <div v-if="loading && !records.length" class="panel-card reveal-card">
          <div class="pa-6">
            <v-skeleton-loader type="list-item-two-line, list-item-two-line, list-item-two-line" />
          </div>
        </div>

        <!-- ============================================================
             EMPTY
             ============================================================ -->
        <div v-else-if="!filteredRecords.length" class="panel-card reveal-card">
          <div class="empty-block">
            <div class="empty-icon">
              <v-icon size="40" color="#cbd5e1">mdi-cash-register</v-icon>
            </div>
            <div class="empty-title">
              {{ hasActiveFilters ? 'No matching records' : 'No cash records yet' }}
            </div>
            <div class="empty-sub">
              {{ hasActiveFilters ? 'Try clearing the filters.' : 'Record your first cash collection below.' }}
            </div>
            <button v-if="!hasActiveFilters" class="empty-add-btn" @click="openAddDialog">
              <v-icon size="14" class="mr-1">mdi-plus</v-icon>
              Record cash
            </button>
            <button v-else class="empty-clear-btn" @click="clearFilters">
              <v-icon size="14" class="mr-1">mdi-close</v-icon>
              Clear filters
            </button>
          </div>
        </div>

        <!-- ============================================================
             RECORDS LIST
             ============================================================ -->
        <div v-else class="reveal-card" style="animation-delay: 200ms">
          <div class="list-head">
            <div class="panel-icon panel-icon-green panel-icon-sm">
              <v-icon size="18" color="white">mdi-cash-register</v-icon>
            </div>
            <div class="panel-title-group">
              <div class="panel-title">Cash collections</div>
              <div class="panel-sub">Newest first</div>
            </div>
            <div class="count-pill">{{ filteredRecords.length }}</div>
            <button
              v-if="!nav_bars"
              class="view-csv-btn"
              @click="exportCSV"
            >
              <v-icon size="14" class="mr-1">mdi-download</v-icon>
              CSV
            </button>
          </div>

          <div class="cash-list">
            <div
              v-for="r in filteredRecords"
              :key="r.routing_id"
              class="cash-card"
            >
              <!-- Icon -->
              <div class="cash-icon">
                <v-icon size="20" color="white">mdi-cash-multiple</v-icon>
              </div>

              <!-- Body -->
              <div class="cash-body">
                <div class="cash-title-row">
                  <span class="cash-name">
                    {{ r.official_name || `Official #${r.official_id}` }}
                  </span>
                  <span class="cash-amount">
                    <span class="cash-currency">KES</span>
                    {{ formatNum(r.total_collected) }}
                  </span>
                </div>

                <div class="cash-meta">
                  <div v-if="r.date_range" class="meta-item">
                    <v-icon size="12" color="#94a3b8">mdi-calendar-range</v-icon>
                    <span>{{ r.date_range }}</span>
                  </div>
                  <div v-if="r.created_at" class="meta-item">
                    <v-icon size="12" color="#94a3b8">mdi-clock-outline</v-icon>
                    <span>{{ formatRelative(r.created_at) }}</span>
                  </div>
                </div>

                <div v-if="r.remarks" class="cash-remarks">
                  "{{ r.remarks }}"
                </div>
              </div>

              <!-- Actions -->
              <div class="cash-actions">
                <button
                  class="cash-action"
                  title="Edit"
                  @click.stop="openEditDialog(r)"
                >
                  <v-icon size="16">mdi-pencil-outline</v-icon>
                </button>
                <button
                  class="cash-action cash-action-danger"
                  title="Delete"
                  @click.stop="openDeleteDialog(r)"
                >
                  <v-icon size="16">mdi-trash-can-outline</v-icon>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile FAB -->
        <button
          v-if="nav_bars"
          class="mobile-fab"
          @click="openAddDialog"
        >
          <v-icon size="24" color="white">mdi-plus</v-icon>
        </button>
      </v-container>

      <!-- ============================================================
           ADD/EDIT DIALOG
           ============================================================ -->
      <v-dialog v-model="formDialog" max-width="520" persistent scrollable>
        <div class="dialog-card">
          <div class="dialog-header">
            <div class="dialog-header-icon">
              <v-icon size="20" color="white">
                {{ editing ? 'mdi-pencil-outline' : 'mdi-cash-plus' }}
              </v-icon>
            </div>
            <div class="dialog-header-text">
              <div class="dialog-title">
                {{ editing ? 'Edit cash record' : 'Record cash collection' }}
              </div>
              <div class="dialog-sub">
                {{ editing ? 'Update this record' : 'Log a new cash collection' }}
              </div>
            </div>
            <button class="dialog-close" @click="closeFormDialog">
              <v-icon size="18" color="white">mdi-close</v-icon>
            </button>
          </div>

          <div class="dialog-body">
            <v-form ref="form" v-model="valid">
              <div class="field-block">
                <label class="field-label">Official <span class="required">*</span></label>
                <select v-model="form.official_id" class="field-select">
                  <option :value="null">Select an official</option>
                  <option
                    v-for="o in officialItems"
                    :key="o.official_id"
                    :value="o.official_id"
                  >
                    {{ o.full_name }}{{ o.role ? ` — ${o.role}` : '' }}
                  </option>
                </select>
              </div>

              <div class="field-block">
                <label class="field-label">Amount collected (KES) <span class="required">*</span></label>
                <div class="field-input-wrap">
                  <span class="field-prefix">KES</span>
                  <input
                    v-model.number="form.total_collected"
                    class="field-input field-input-with-prefix"
                    type="number"
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              <div class="field-block">
                <label class="field-label">Date range <span class="required">*</span></label>
                <input
                  v-model="form.date_range"
                  class="field-input"
                  type="text"
                  placeholder="e.g. 1–15 Sep 2026"
                />
              </div>

              <div class="field-block">
                <label class="field-label">Remarks (optional)</label>
                <textarea
                  v-model="form.remarks"
                  class="field-textarea"
                  rows="3"
                  maxlength="255"
                  placeholder="Add any notes about this collection"
                ></textarea>
                <div class="field-hint">{{ (form.remarks || '').length }}/255</div>
              </div>
            </v-form>
          </div>

          <div class="dialog-footer">
            <button
              class="dialog-btn dialog-btn-ghost"
              :disabled="submitting"
              @click="closeFormDialog"
            >
              Cancel
            </button>
            <button
              class="dialog-btn dialog-btn-primary"
              :disabled="!canSubmit || submitting"
              @click="submitForm"
            >
              <v-icon size="14" :class="['mr-1', { spin: submitting }]">
                {{ submitting ? 'mdi-loading' : 'mdi-check' }}
              </v-icon>
              {{ submitting ? 'Saving…' : (editing ? 'Save changes' : 'Record') }}
            </button>
          </div>
        </div>
      </v-dialog>

      <!-- ============================================================
           DELETE CONFIRM
           ============================================================ -->
      <v-dialog v-model="deleteDialog" max-width="440" persistent>
        <div class="confirm-card">
          <div class="confirm-icon">
            <v-icon size="24" color="#dc2626">mdi-trash-can-outline</v-icon>
          </div>
          <div class="confirm-title">Delete this record?</div>
          <div class="confirm-text">
            <strong>{{ deleteTarget?.official_name || `Official #${deleteTarget?.official_id}` }}</strong>
            — KES {{ formatNum(deleteTarget?.total_collected) }}.
            This action can't be undone.
          </div>
          <div class="confirm-actions">
            <button
              class="confirm-cancel"
              :disabled="submitting"
              @click="closeDeleteDialog"
            >
              Cancel
            </button>
            <button
              class="confirm-proceed"
              :disabled="submitting"
              @click="confirmDelete"
            >
              <v-icon size="14" :class="['mr-1', { spin: submitting }]">
                {{ submitting ? 'mdi-loading' : 'mdi-delete' }}
              </v-icon>
              {{ submitting ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
        </div>
      </v-dialog>

      <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="4000" bottom rounded="pill" class="mb-6 snackbar-premium" elevation="6">
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
import moment from 'moment';

const API = 'https://makaaziserver22.up.railway.app/api';

export default {
  name: 'OfficialCashRouting',
  data() {
    return {
      nav_bars: false,
      activeTab: '/officials/cash',

      loading: false,
      submitting: false,
      uid: null,
      estateId: null,
      official: { full_name: '', role: '', estate_id: null },
      estate: { estate_name: '' },

      records: [],
      officials: [],
      allOfficials: [],

      search: '',
      filterOfficial: null,
      filterMonth: null,

      formDialog: false,
      editing: false,
      valid: true,
      form: {
        routing_id: null,
        official_id: null,
        total_collected: '',
        date_range: '',
        remarks: '',
      },

      deleteDialog: false,
      deleteTarget: null,

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
    officialItems() {
      return this.officials.length ? this.officials : this.allOfficials;
    },
    officialOptions() {
      return this.officialItems.map((o) => o.full_name);
    },
    hydratedRecords() {
      const nameMap = {};
      for (const o of this.officialItems) {
        nameMap[o.official_id] = o.full_name;
      }
      return this.records.map((r) => ({
        ...r,
        official_name: r.official_name || nameMap[r.official_id] || null,
      }));
    },
    hasActiveFilters() {
      return !!(this.search || this.filterOfficial || this.filterMonth);
    },
    monthOptions() {
      const set = new Set();
      for (const r of this.hydratedRecords) {
        if (r.created_at) set.add(moment(r.created_at).format('YYYY-MM'));
      }
      return [...set].sort((a, b) => b.localeCompare(a));
    },
    filteredRecords() {
      const q = (this.search || '').trim().toLowerCase();
      return this.hydratedRecords.filter((r) => {
        if (this.filterOfficial && (r.official_name || '') !== this.filterOfficial) return false;
        if (this.filterMonth && r.created_at) {
          if (moment(r.created_at).format('YYYY-MM') !== this.filterMonth) return false;
        }
        if (!q) return true;
        return (
          (r.official_name || '').toLowerCase().includes(q) ||
          (r.date_range || '').toLowerCase().includes(q) ||
          (r.remarks || '').toLowerCase().includes(q)
        );
      });
    },
    kpis() {
      const list = this.filteredRecords;
      const total = list.reduce((s, r) => s + Number(r.total_collected || 0), 0);
      const month = moment().format('YYYY-MM');
      const thisMonth = list
        .filter((r) => r.created_at && moment(r.created_at).format('YYYY-MM') === month)
        .reduce((s, r) => s + Number(r.total_collected || 0), 0);
      const officials = new Set(list.map((r) => r.official_id)).size;
      return { total, thisMonth, officialCount: officials };
    },
    canSubmit() {
      return (
        this.form.official_id != null &&
        this.form.total_collected !== '' &&
        Number(this.form.total_collected) >= 0 &&
        !!String(this.form.date_range || '').trim()
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
    onResize() { this.nav_bars = window.innerWidth < 768; },
    isActive(route) { return this.$route && this.$route.path === route; },
    goTo(path) {
      if (!path) return;
      if (this.$route && this.$route.path === path) return;
      try {
        if (this.$router && typeof this.$router.push === 'function') {
          const result = this.$router.push(path);
          if (result && typeof result.catch === 'function') {
            result.catch((err) => {
              if (err && err.name !== 'NavigationDuplicated') console.error('Nav error:', err);
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
          if (that._authUnsub) { that._authUnsub(); that._authUnsub = null; }
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
        await Promise.allSettled([this.fetchEstate(), this.fetchOfficials(), this.fetchRecords()]);
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
        if (status === 200) this.estate = { estate_name: data.estate_name || '' };
      } catch (error) {
        console.warn('Estate fetch failed:', error.response?.data || error.message);
      }
    },

    async fetchOfficials() {
      if (!this.estateId) return;
      try {
        const { data, status } = await axios.get(`${API}/officials/getOfficialByEstateId/${this.estateId}`);
        if (status === 200) this.officials = Array.isArray(data) ? data : [];
      } catch (error) {
        console.warn('Officials by estate failed:', error.response?.data || error.message);
        try {
          const { data } = await axios.get(`${API}/officials/getAll`);
          const list = Array.isArray(data) ? data : [];
          this.allOfficials = list.filter((o) => Number(o.estate_id) === Number(this.estateId));
        } catch (e) {
          this.officials = [];
        }
      }
    },

    async fetchRecords() {
      if (!this.estateId) return;
      try {
        const url = `${API}/cash-routing/getByEstate/${this.estateId}`;
        const { data, status } = await axios.get(url);
        if (status === 200) {
          this.records = Array.isArray(data) ? data : [];
          return;
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          console.warn('Cash getByEstate failed:', error.response?.data || error.message);
        }
      }
      try {
        const { data } = await axios.get(`${API}/cash-routing/getAll`);
        const list = Array.isArray(data) ? data : [];
        const officialIds = new Set(this.officialItems.map((o) => o.official_id));
        this.records = list.filter((r) => officialIds.has(r.official_id));
      } catch (err) {
        console.warn('Cash getAll failed:', err.response?.data || err.message);
        this.records = [];
      }
    },

    clearFilters() {
      this.search = '';
      this.filterOfficial = null;
      this.filterMonth = null;
    },

    openAddDialog() {
      this.editing = false;
      this.form = { routing_id: null, official_id: null, total_collected: '', date_range: '', remarks: '' };
      this.formDialog = true;
    },

    openEditDialog(r) {
      this.editing = true;
      this.form = {
        routing_id: r.routing_id,
        official_id: r.official_id,
        total_collected: Number(r.total_collected || 0),
        date_range: r.date_range || '',
        remarks: r.remarks || '',
      };
      this.formDialog = true;
    },

    closeFormDialog() {
      this.formDialog = false;
      if (this.$refs.form) this.$refs.form.resetValidation();
    },

    async submitForm() {
      if (!this.canSubmit || this.submitting) return;
      this.submitting = true;

      const payload = {
        official_id: this.form.official_id,
        total_collected: Number(this.form.total_collected) || 0,
        date_range: this.form.date_range.trim(),
        remarks: (this.form.remarks || '').trim() || null,
      };

      try {
        if (this.editing) {
          const { status } = await axios.put(`${API}/cash-routing/update/${this.form.routing_id}`, payload);
          if (status === 200) {
            this.showSnackbar('Cash record updated', 'success');
            this.formDialog = false;
            await this.fetchRecords();
          }
        } else {
          const { status } = await axios.post(`${API}/cash-routing/add`, payload);
          if (status === 200 || status === 201) {
            this.showSnackbar('Cash record added', 'success');
            this.formDialog = false;
            await this.fetchRecords();
          }
        }
      } catch (error) {
        console.error('Save failed:', error.response?.data || error.message);
        this.showSnackbar(error.response?.data?.error || 'Could not save', 'error');
      } finally {
        this.submitting = false;
      }
    },

    openDeleteDialog(r) {
      this.deleteTarget = r;
      this.deleteDialog = true;
    },

    closeDeleteDialog() {
      this.deleteDialog = false;
      this.deleteTarget = null;
    },

    async confirmDelete() {
      if (!this.deleteTarget) return;
      this.submitting = true;
      try {
        const { status } = await axios.delete(`${API}/cash-routing/delete/${this.deleteTarget.routing_id}`);
        if (status === 200) {
          this.showSnackbar('Cash record deleted', 'success');
          this.closeDeleteDialog();
          await this.fetchRecords();
        }
      } catch (error) {
        console.error('Delete failed:', error.response?.data || error.message);
        this.showSnackbar(error.response?.data?.error || 'Could not delete', 'error');
      } finally {
        this.submitting = false;
      }
    },

    exportCSV() {
      const header = ['Official', 'Amount', 'Date range', 'Remarks', 'Recorded on'];
      const lines = [header.join(',')];
      for (const r of this.filteredRecords) {
        const row = [
          `"${r.official_name || ''}"`,
          Number(r.total_collected || 0),
          `"${r.date_range || ''}"`,
          `"${(r.remarks || '').replace(/"/g, '""')}"`,
          r.created_at ? new Date(r.created_at).toISOString() : '',
        ];
        lines.push(row.join(','));
      }
      const csv = lines.join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cash-routing-${this.estate.estate_name || 'estate'}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    },

    prettyMonth(m) {
      if (!m) return '';
      try { return moment(m + '-01').format('MMMM YYYY'); } catch { return m; }
    },

    formatNum(n) { return numeral(n || 0).format('0,0'); },
    formatRelative(d) {
      if (!d) return '';
      try { return moment(d).fromNow(); } catch { return ''; }
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
.kpi-icon-green {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  box-shadow: 0 10px 22px -10px rgba(34, 197, 94, 0.6);
}
.kpi-icon-blue {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  box-shadow: 0 10px 22px -10px rgba(59, 130, 246, 0.6);
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
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 10px;
  align-items: center;
}
@media (max-width: 767px) {
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
   LIST HEAD
   ============================================================ */
.list-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  background: #ffffff;
  border: 1px solid #eef1f6;
  border-bottom: none;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
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
.panel-icon-green {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  box-shadow: 0 10px 22px -10px rgba(34, 197, 94, 0.6);
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
.count-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.14);
  color: #166534;
  font-size: 0.72rem;
  font-weight: 800;
}
.view-csv-btn {
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
.view-csv-btn:hover {
  background: rgba(128, 81, 255, 0.14);
  border-color: rgba(128, 81, 255, 0.35);
}

/* ============================================================
   CASH LIST
   ============================================================ */
.cash-list {
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 10px;
  background: #ffffff;
  border: 1px solid #eef1f6;
  border-top: none;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}
.cash-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 16px;
  background: #fafbff;
  border: 1px solid #f0f2f7;
  border-radius: 16px;
  transition: all 0.2s ease;
}
.cash-card:hover {
  background: #ffffff;
  border-color: rgba(34, 197, 94, 0.3);
  box-shadow: 0 12px 26px -16px rgba(34, 197, 94, 0.3);
  transform: translateY(-1px);
}

.cash-icon {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 10px 22px -10px rgba(34, 197, 94, 0.65);
}

.cash-body { flex: 1; min-width: 0; }
.cash-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.cash-name {
  font-size: 0.92rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cash-amount {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.14);
  color: #166534;
  font-size: 0.8rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.cash-currency {
  font-size: 0.6rem;
  font-weight: 800;
  color: #16a34a;
  letter-spacing: 0.5px;
}

.cash-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 4px;
}
.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: #64748b;
  font-weight: 600;
}

.cash-remarks {
  font-size: 0.76rem;
  color: #94a3b8;
  font-style: italic;
  margin-top: 4px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cash-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}
.cash-action {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid #eef1f6;
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-family: inherit;
}
.cash-action:hover {
  background: rgba(128, 81, 255, 0.1);
  color: #8051ff;
  border-color: rgba(128, 81, 255, 0.2);
}
.cash-action-danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border-color: rgba(239, 68, 68, 0.2);
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
.empty-add-btn,
.empty-clear-btn {
  display: inline-flex;
  align-items: center;
  margin-top: 20px;
  padding: 11px 22px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}
.empty-add-btn {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  box-shadow: 0 12px 24px -12px rgba(128, 81, 255, 0.7);
}
.empty-add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 28px -12px rgba(128, 81, 255, 0.85);
}
.empty-clear-btn {
  background: rgba(128, 81, 255, 0.08);
  border: 1px solid rgba(128, 81, 255, 0.18);
  color: #8051ff;
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
.dialog-card {
  background: #ffffff;
  border-radius: 22px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  box-shadow: 0 24px 60px -20px rgba(15, 13, 36, 0.4);
}
.dialog-header {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  padding: 16px 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
}
.dialog-header::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.18), transparent 50%);
  pointer-events: none;
}
.dialog-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.dialog-header-text { flex: 1; min-width: 0; }
.dialog-title {
  font-size: 0.98rem;
  font-weight: 800;
  letter-spacing: -0.2px;
  line-height: 1.2;
}
.dialog-sub {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 2px;
  font-weight: 500;
}
.dialog-close {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 9px;
  width: 34px;
  height: 34px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  flex-shrink: 0;
}
.dialog-close:hover {
  background: rgba(255, 255, 255, 0.28);
}

.dialog-body {
  padding: 22px 24px;
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}
.field-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.9px;
}
.required { color: #dc2626; font-weight: 800; }

.field-input,
.field-select,
.field-textarea {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px solid #eef1f6;
  background: #f8fafc;
  font-size: 0.88rem;
  font-weight: 600;
  color: #0f0d24;
  outline: none;
  font-family: inherit;
  width: 100%;
  transition: all 0.2s ease;
}
.field-input:focus,
.field-select:focus,
.field-textarea:focus {
  border-color: #8051ff;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(128, 81, 255, 0.1);
}
.field-input::placeholder,
.field-textarea::placeholder { color: #94a3b8; font-weight: 500; }

.field-textarea {
  resize: vertical;
  min-height: 84px;
  line-height: 1.5;
}

.field-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.field-prefix {
  position: absolute;
  left: 14px;
  font-size: 0.78rem;
  font-weight: 800;
  color: #8051ff;
  letter-spacing: 0.4px;
  pointer-events: none;
}
.field-input-with-prefix {
  padding-left: 52px;
}

.field-select {
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 38px;
  cursor: pointer;
}

.field-hint {
  font-size: 0.68rem;
  color: #94a3b8;
  margin-top: 4px;
  font-weight: 600;
  text-align: right;
}

.dialog-footer {
  padding: 16px 24px;
  display: flex;
  gap: 10px;
  flex-shrink: 0;
  border-top: 1px solid #f1f5f9;
  background: #ffffff;
}
.dialog-btn {
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
.dialog-btn-ghost {
  background: #f6f7fb;
  color: #475569;
  border: 1px solid #eef1f6;
}
.dialog-btn-ghost:hover:not(:disabled) { background: #eef1f6; }
.dialog-btn-primary {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  box-shadow: 0 10px 24px -12px rgba(128, 81, 255, 0.7);
}
.dialog-btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px -12px rgba(128, 81, 255, 0.85);
}
.dialog-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* ============================================================
   DELETE CONFIRM
   ============================================================ */
.confirm-card {
  background: #ffffff;
  border-radius: 22px;
  padding: 26px 24px;
  box-shadow: 0 24px 60px -20px rgba(15, 13, 36, 0.4);
  text-align: center;
}
.confirm-icon {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: rgba(239, 68, 68, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}
.confirm-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
}
.confirm-text {
  font-size: 0.82rem;
  color: #64748b;
  margin-top: 8px;
  line-height: 1.55;
}
.confirm-actions {
  display: flex;
  gap: 10px;
  margin-top: 22px;
}
.confirm-cancel,
.confirm-proceed {
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
.confirm-cancel {
  background: #f6f7fb;
  color: #475569;
  border: 1px solid #eef1f6;
}
.confirm-cancel:hover:not(:disabled) { background: #eef1f6; }
.confirm-proceed {
  background: #dc2626;
  color: #ffffff;
  box-shadow: 0 10px 24px -12px rgba(220, 38, 38, 0.7);
}
.confirm-proceed:hover:not(:disabled) { background: #b91c1c; }
.confirm-cancel:disabled,
.confirm-proceed:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  .cash-card { padding: 12px 14px; gap: 12px; }
  .cash-icon { width: 42px; height: 42px; }
  .cash-name { font-size: 0.88rem; }
  .list-head { padding: 14px 16px; }
  .dialog-body { padding: 18px 20px; }
  .dialog-footer { padding: 14px 20px; }
}

@media (max-width: 599px) {
  .sticky-header-premium { padding-left: 12px; padding-right: 12px; }
  .reveal-card { animation-duration: 0.4s; }
}
</style>