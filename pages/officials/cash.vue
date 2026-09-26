<template>
  <div class="d-flex bg-surface dashboard-root" style="min-height: 100vh;">
    <!-- Desktop sidebar -->
    <v-navigation-drawer v-if="!nav_bars" permanent width="260" class="elevation-1 sidebar-glass">
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
          <v-btn block outlined color="#8051FF" class="rounded-xl text-capitalize mt-3 font-weight-medium" @click="logout">
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
                    <span class="text-caption text--secondary">
                      Cash collected per official · {{ estate.estate_name || '' }}
                    </span>
                  </div>
                </div>
              </div>
            </v-col>
            <v-col cols="4" sm="6" class="d-flex justify-end align-center">
              <v-btn icon outlined small color="grey darken-1" class="mr-2 refresh-btn" :loading="loading" @click="refreshAll">
                <v-icon small>mdi-refresh</v-icon>
              </v-btn>
              <v-btn color="#8051FF" dark depressed rounded small class="text-capitalize font-weight-bold mr-2 hidden-xs-only" @click="openAddDialog">
                <v-icon left small>mdi-plus</v-icon>
                Record cash
              </v-btn>
              <v-avatar color="#8051FF" size="36">
                <span style="color: white;" class="font-weight-bold text-caption">{{ officialInitials }}</span>
              </v-avatar>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <v-container :fluid="nav_bars" class="px-4 px-sm-6 pt-2 pt-sm-4 pb-8">
        <!-- KPIs -->
        <v-row dense class="mb-4 reveal-card">
          <v-col cols="6" sm="4">
            <v-card outlined elevation="0" class="pa-4 rounded-2xl kpi-card-premium h-100">
              <div class="text-caption font-weight-bold text-uppercase tracking-wide text--secondary">Total Collected</div>
              <div class="text-h4 font-weight-bold text--primary mt-1">{{ formatNum(kpis.total) }}</div>
              <div class="text-caption text--secondary">KES all time</div>
            </v-card>
          </v-col>
          <v-col cols="6" sm="4">
            <v-card color="#8051FF" dark elevation="0" class="pa-4 rounded-2xl h-100">
              <div class="text-caption font-weight-bold text-uppercase tracking-wide" style="opacity: 0.85;">This Month</div>
              <div class="text-h4 font-weight-bold mt-1">{{ formatNum(kpis.thisMonth) }}</div>
              <div class="text-caption" style="opacity: 0.8;">KES</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4">
            <v-card outlined elevation="0" class="pa-4 rounded-2xl kpi-card-premium h-100">
              <div class="text-caption font-weight-bold text-uppercase tracking-wide text--secondary">Officials Logging</div>
              <div class="text-h4 font-weight-bold text--primary mt-1">{{ kpis.officialCount }}</div>
              <div class="text-caption text--secondary">Distinct officials</div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Filters -->
        <v-row class="mb-4 reveal-card" style="animation-delay: 50ms">
          <v-col cols="12">
            <v-card class="rounded-2xl pa-3 pa-sm-4" elevation="0" outlined>
              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-text-field v-model="search" placeholder="Search by official name or remarks" dense outlined rounded hide-details prepend-inner-icon="mdi-magnify" clearable />
                </v-col>
                <v-col cols="6" sm="3">
                  <v-select v-model="filterOfficial" :items="officialOptions" label="Official" dense outlined rounded hide-details clearable />
                </v-col>
                <v-col cols="6" sm="3">
                  <v-select v-model="filterMonth" :items="monthOptions" label="Month" dense outlined rounded hide-details clearable />
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <!-- Loading -->
        <div v-if="loading && !records.length" class="pa-4">
          <v-skeleton-loader type="list-item-two-line, list-item-two-line, list-item-two-line" />
        </div>

        <!-- Empty -->
        <v-row v-else-if="!filteredRecords.length" class="reveal-card">
          <v-col cols="12">
            <v-card class="rounded-2xl pa-12 text-center" elevation="0" outlined>
              <v-avatar color="purple lighten-5" size="72" class="mb-3">
                <v-icon size="44" color="#8051FF">mdi-cash-register</v-icon>
              </v-avatar>
              <div class="text-h6 grey--text text--darken-2 mt-3">
                {{ hasActiveFilters ? 'No matching records' : 'No cash records yet' }}
              </div>
              <div class="text-body-2 grey--text mt-1">
                {{ hasActiveFilters ? 'Try clearing the filters.' : 'Record your first cash collection below.' }}
              </div>
              <v-btn v-if="!hasActiveFilters" rounded depressed color="#8051FF" dark class="mt-4 text-capitalize font-weight-bold" @click="openAddDialog">
                <v-icon left>mdi-plus</v-icon>
                Record cash
              </v-btn>
            </v-card>
          </v-col>
        </v-row>

        <!-- Records list -->
        <v-row v-else class="reveal-card" style="animation-delay: 100ms">
          <v-col cols="12">
            <v-card class="rounded-2xl" elevation="0" outlined>
              <v-card-title class="px-4 px-sm-6 py-4 card-header-premium d-flex align-center">
                <v-avatar color="purple lighten-5" size="36" class="mr-3">
                  <v-icon color="#8051FF">mdi-cash-register</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold text--primary">Cash collections</div>
                  <div class="text-caption text--secondary">Newest first</div>
                </div>
                <v-spacer></v-spacer>
                <v-btn v-if="!nav_bars" text small color="#8051FF" class="text-capitalize font-weight-medium" @click="exportCSV">
                  <v-icon left small>mdi-download</v-icon>
                  CSV
                </v-btn>
              </v-card-title>
              <v-divider></v-divider>

              <v-list class="pa-0">
                <template v-for="(r, i) in filteredRecords">
                  <v-list-item :key="r.routing_id" class="py-3 px-4 px-sm-6">
                    <v-list-item-avatar color="green lighten-5" size="48">
                      <v-icon color="green darken-2" small>mdi-cash-multiple</v-icon>
                    </v-list-item-avatar>

                    <v-list-item-content>
                      <div class="d-flex align-center flex-wrap" style="gap: 8px;">
                        <v-list-item-title class="font-weight-bold text--primary">
                          {{ r.official_name || `Official #${r.official_id}` }}
                        </v-list-item-title>
                        <v-chip x-small label color="green lighten-5 green--text" class="font-weight-bold">
                          KES {{ formatNum(r.total_collected) }}
                        </v-chip>
                      </div>

                      <div class="d-flex flex-wrap mt-1" style="gap: 12px;">
                        <div class="d-flex align-center" v-if="r.date_range">
                          <v-icon x-small color="grey" class="mr-1">mdi-calendar-range</v-icon>
                          <span class="text-caption grey--text text--darken-1">{{ r.date_range }}</span>
                        </div>
                        <div class="d-flex align-center" v-if="r.created_at">
                          <v-icon x-small color="grey" class="mr-1">mdi-clock-outline</v-icon>
                          <span class="text-caption grey--text text--darken-1">{{ formatRelative(r.created_at) }}</span>
                        </div>
                      </div>

                      <div v-if="r.remarks" class="mt-2 text-caption grey--text text--darken-1" style="font-style: italic;">
                        "{{ r.remarks }}"
                      </div>
                    </v-list-item-content>

                    <v-list-item-action class="ml-2">
                      <div class="d-flex flex-column" style="gap: 4px;">
                        <v-btn icon small class="action-btn-hover" title="Edit" @click.stop="openEditDialog(r)">
                          <v-icon small color="#8051FF">mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn icon small class="action-btn-hover" title="Delete" @click.stop="openDeleteDialog(r)">
                          <v-icon small color="red">mdi-delete-outline</v-icon>
                        </v-btn>
                      </div>
                    </v-list-item-action>
                  </v-list-item>
                  <v-divider v-if="i < filteredRecords.length - 1" :key="`d-${r.routing_id}`" inset></v-divider>
                </template>
              </v-list>
            </v-card>
          </v-col>
        </v-row>

        <!-- Mobile FAB -->
        <v-btn
          v-if="nav_bars"
          fab fixed bottom right
          color="#8051FF" dark
          class="elevation-6"
          style="bottom: 84px; right: 20px; z-index: 200;"
          @click="openAddDialog"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-container>

      <!-- ============================================================ -->
      <!-- Add/Edit dialog — FIXED                                      -->
      <!-- ============================================================ -->
      <v-dialog v-model="formDialog" max-width="520" persistent scrollable>
        <v-card class="rounded-2xl dialog-card">
          <!-- Sticky header -->
          <v-card-title class="dialog-header">
            <div class="d-flex align-center" style="width: 100%;">
              <v-btn icon dark @click="closeFormDialog">
                <v-icon>mdi-close</v-icon>
              </v-btn>
              <div class="flex-grow-1 text-center">
                <div class="text-h6 font-weight-bold" style="color: white;">
                  {{ editing ? 'Edit cash record' : 'Record cash collection' }}
                </div>
              </div>
              <div style="width: 40px;"></div>
            </div>
          </v-card-title>

          <!-- Scrollable body -->
          <v-card-text class="dialog-body">
            <v-form ref="form" v-model="valid">
              <label class="field-label">Official</label>
              <v-select
                v-model="form.official_id"
                :items="officialItems"
                item-text="full_name"
                item-value="official_id"
                placeholder="Select an official"
                outlined rounded dense
                hide-details="auto"
                class="mb-4"
                :rules="[(v) => !!v || 'Official is required']"
                required
              />

              <label class="field-label">Amount collected (KES)</label>
              <v-text-field
                v-model.number="form.total_collected"
                type="number"
                min="0"
                prefix="KES"
                placeholder="0"
                outlined rounded dense
                hide-details="auto"
                class="mb-4"
                :rules="[
                  (v) => v !== '' || 'Amount is required',
                  (v) => Number(v) >= 0 || 'Amount must be 0 or more',
                ]"
                required
              />

              <label class="field-label">Date range</label>
              <v-text-field
                v-model="form.date_range"
                placeholder="e.g. 1–15 Sep 2026"
                outlined rounded dense
                hide-details="auto"
                class="mb-4"
                :rules="[(v) => !!v || 'Date range is required']"
                required
              />

              <label class="field-label">Remarks (optional)</label>
              <v-textarea
                v-model="form.remarks"
                placeholder="Add any notes about this collection"
                outlined rounded dense
                hide-details="auto"
                rows="3"
                auto-grow
                counter="255"
                maxlength="255"
              />
            </v-form>
          </v-card-text>

          <!-- Sticky footer -->
          <v-card-actions class="dialog-footer">
            <v-btn
              text rounded
              class="text-capitalize font-weight-medium flex-grow-1"
              @click="closeFormDialog"
              :disabled="submitting"
            >
              Cancel
            </v-btn>
            <v-btn
              rounded depressed color="#8051FF" dark
              class="text-capitalize font-weight-bold flex-grow-1"
              :loading="submitting"
              :disabled="!valid"
              @click="submitForm"
            >
              <v-icon left>mdi-check</v-icon>
              {{ editing ? 'Save changes' : 'Record' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Delete confirmation -->
      <v-dialog v-model="deleteDialog" max-width="440" persistent>
        <v-card class="rounded-2xl pa-2">
          <v-card-text class="text-center pa-6">
            <v-avatar color="red lighten-5" size="64" class="mb-3">
              <v-icon color="red darken-2" size="32">mdi-delete-outline</v-icon>
            </v-avatar>
            <div class="text-h6 font-weight-bold text--primary">Delete this record?</div>
            <div class="text-body-2 text--secondary mt-2">
              <strong>{{ deleteTarget?.official_name || `Official #${deleteTarget?.official_id}` }}</strong>
              — KES {{ formatNum(deleteTarget?.total_collected) }}
            </div>
            <div class="d-flex mt-5" style="gap: 8px;">
              <v-btn block text class="text-capitalize font-weight-medium" @click="closeDeleteDialog" :disabled="submitting">
                Cancel
              </v-btn>
              <v-btn block rounded depressed color="red darken-2" dark class="text-capitalize font-weight-bold" :loading="submitting" @click="confirmDelete">
                <v-icon left>mdi-delete</v-icon>
                Delete
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
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
        await Promise.all([this.fetchEstate(), this.fetchOfficials(), this.fetchRecords()]);
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
        console.error('🔴 Official fetch failed:', error.response?.data || error.message);
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
      if (!this.$refs.form.validate()) return;
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
        console.error('🔴 Save failed:', error.response?.data || error.message);
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
        console.error('🔴 Delete failed:', error.response?.data || error.message);
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
  transform: translateY(-3px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.06) !important;
  border-color: #cbd5e1;
}

.card-header-premium {
  background: linear-gradient(to bottom, #ffffff, #f8fafc);
}

.action-btn-hover { transition: all 0.2s ease; }
.action-btn-hover:hover { background: rgba(128, 81, 255, 0.1); }

.snackbar-premium ::v-deep .v-snackbar__content { padding: 12px 20px; }

.bottom-nav-premium {
  border-top: 1px solid #e2e8f0 !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(12px);
}
.mobile-nav-btn { min-width: 0 !important; }
.mobile-nav-label { font-size: 10px; margin-top: 2px; }

/* ============================================================ */
/* Dialog — clean, scrollable layout                             */
/* ============================================================ */
.dialog-card {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
  border-radius: 20px !important;
}

.dialog-header {
  background: #8051FF;
  color: white;
  padding: 12px 16px;
  flex-shrink: 0;
}

.dialog-body {
  padding: 24px !important;
  overflow-y: auto;
  flex: 1 1 auto;
}

.dialog-footer {
  padding: 16px 24px;
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  border-top: 1px solid #e2e8f0;
  background: #ffffff;
}

.field-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  margin-bottom: 6px;
}

@media (max-width: 599px) {
  .sticky-header-premium { padding-left: 12px; padding-right: 12px; }
  .reveal-card { animation-duration: 0.4s; }
}
</style>