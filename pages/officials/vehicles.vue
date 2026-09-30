<template>
  <div class="d-flex bg-surface dashboard-root" style="min-height: 100vh;">
    <!-- DESKTOP SIDEBAR -->
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
          v-for="item in menuItems"
          :key="item.title"
          @click="goTo(item.route)"
          link
          class="mb-1 rounded-xl nav-item-premium"
          :class="{ 'nav-item-active': isActive(item.route) }"
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

    <!-- MOBILE BOTTOM NAV -->
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

    <!-- MAIN -->
    <v-main :class="nav_bars ? 'pb-16' : ''" class="main-premium">
      <!-- HEADER -->
      <div class="sticky-header-premium px-4 px-sm-6 py-4">
        <v-container fluid class="pa-0">
          <v-row align="center" no-gutters>
            <v-col cols="8" sm="6">
              <div class="header-text">
                <h1 class="text-h6 text-sm-h5 font-weight-bold text--primary page-title">
                  Vehicles &amp; gate
                </h1>
                <div class="d-flex align-center mt-1">
                  <v-icon x-small color="success" class="mr-1">mdi-circle</v-icon>
                  <span class="text-caption text--secondary">
                    {{ estate.estate_name || 'Loading estate…' }}
                  </span>
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
            </v-col>
          </v-row>
        </v-container>
      </div>

      <v-container :fluid="nav_bars" class="px-4 px-sm-6 pt-3 pt-sm-5 pb-8">
        <!-- STATS -->
        <div class="kpi-grid">
          <div class="kpi kpi-light reveal-card">
            <div class="kpi-top">
              <div class="kpi-icon kpi-icon-purple">
                <v-icon size="20" color="white">mdi-car</v-icon>
              </div>
            </div>
            <div class="kpi-label">Active vehicles</div>
            <div class="kpi-value">{{ formatNum(stats.active_vehicles) }}</div>
            <div class="kpi-foot kpi-foot-muted">Registered and allowed</div>
          </div>

          <div
            class="kpi reveal-card"
            :class="stats.pending_vehicles > 0 ? 'kpi-alert' : 'kpi-light'"
            style="animation-delay: 50ms"
          >
            <div class="kpi-top">
              <div
                class="kpi-icon"
                :class="stats.pending_vehicles > 0 ? 'kpi-icon-white' : 'kpi-icon-amber'"
              >
                <v-icon
                  size="20"
                  :color="stats.pending_vehicles > 0 ? '#0A0A14' : 'white'"
                >
                  {{ stats.pending_vehicles > 0 ? 'mdi-alert-circle' : 'mdi-clock-outline' }}
                </v-icon>
              </div>
              <div v-if="stats.pending_vehicles > 0" class="kpi-pulse"></div>
            </div>
            <div class="kpi-label" :class="{ 'kpi-label-dark': stats.pending_vehicles > 0 }">
              Pending
            </div>
            <div class="kpi-value" :class="{ 'kpi-value-dark': stats.pending_vehicles > 0 }">
              {{ formatNum(stats.pending_vehicles) }}
            </div>
            <div
              class="kpi-foot"
              :class="stats.pending_vehicles > 0 ? 'kpi-foot-light' : 'kpi-foot-muted'"
            >
              {{ stats.pending_vehicles > 0 ? 'Awaiting approval' : 'All approved' }}
            </div>
          </div>

          <div class="kpi kpi-dark reveal-card" style="animation-delay: 100ms">
            <div class="kpi-top">
              <div class="kpi-icon kpi-icon-white">
                <v-icon size="20" color="#0A0A14">mdi-ticket-confirmation</v-icon>
              </div>
            </div>
            <div class="kpi-label kpi-label-dark">Active passes</div>
            <div class="kpi-value kpi-value-dark">{{ formatNum(stats.active_passes) }}</div>
            <div class="kpi-foot kpi-foot-light">Visitors currently valid</div>
          </div>

          <div class="kpi kpi-light reveal-card" style="animation-delay: 150ms">
            <div class="kpi-top">
              <div class="kpi-icon kpi-icon-amber">
                <v-icon size="20" color="white">mdi-gate</v-icon>
              </div>
            </div>
            <div class="kpi-label">Entries today</div>
            <div class="kpi-value">{{ formatNum(stats.today_entries) }}</div>
            <div class="kpi-foot kpi-foot-warn">Gate activity</div>
          </div>
        </div>

        <!-- PRIMARY ACTIONS -->
        <div class="actions-row reveal-card" style="animation-delay: 180ms">
          <button class="primary-action" @click="openVerify">
            <div class="pa-icon pa-icon-purple">
              <v-icon size="20" color="white">mdi-ticket-confirmation</v-icon>
            </div>
            <div class="pa-body">
              <div class="pa-title">Verify pass</div>
              <div class="pa-sub">Check a visitor code at the gate</div>
            </div>
            <v-icon size="18" color="#8051FF">mdi-chevron-right</v-icon>
          </button>

          <button class="primary-action" @click="openLog">
            <div class="pa-icon pa-icon-lime">
              <v-icon size="20" color="#0A0A14">mdi-login-variant</v-icon>
            </div>
            <div class="pa-body">
              <div class="pa-title">Log gate entry</div>
              <div class="pa-sub">Record IN / OUT for a vehicle</div>
            </div>
            <v-icon size="18" color="#8051FF">mdi-chevron-right</v-icon>
          </button>
        </div>

        <!-- TABS + LIST -->
        <div class="panel-card mt-4 reveal-card" style="animation-delay: 200ms">
          <v-tabs
            v-model="tab"
            background-color="transparent"
            color="#8051FF"
            class="tabs-premium"
            grow
          >
            <v-tab>Vehicles</v-tab>
            <v-tab>Passes</v-tab>
            <v-tab>Gate log</v-tab>
          </v-tabs>

          <!-- Filter row -->
          <div class="filter-row">
            <v-text-field
              v-model="search"
              :placeholder="tab === 2 ? 'Search plate' : 'Search plate, owner, house #'"
              dense
              outlined
              rounded
              hide-details
              prepend-inner-icon="mdi-magnify"
              class="search-field-premium"
              clearable
              @input="debouncedFetch"
            />

            <v-select
              v-if="tab === 0"
              v-model="statusFilter"
              :items="vehicleStatusOptions"
              item-text="text"
              item-value="value"
              dense
              outlined
              rounded
              hide-details
              class="status-filter"
              @change="fetch"
            />

            <v-select
              v-else-if="tab === 1"
              v-model="statusFilter"
              :items="passStatusOptions"
              item-text="text"
              item-value="value"
              dense
              outlined
              rounded
              hide-details
              class="status-filter"
              @change="fetch"
            />
          </div>

          <!-- VEHICLES TAB -->
          <div v-if="tab === 0" class="tab-body">
            <v-skeleton-loader
              v-if="loading"
              type="list-item-three-line, list-item-three-line"
            />

            <div v-else-if="!vehicles.length" class="empty-block">
              <div class="empty-icon">
                <v-icon size="36" color="#cbd5e1">mdi-car-off</v-icon>
              </div>
              <div class="empty-title">No vehicles match</div>
              <div class="empty-sub">Try a different filter or search term.</div>
            </div>

            <div v-else class="row-list">
              <div
                v-for="v in vehicles"
                :key="v.vehicle_id"
                class="row-card"
              >
                <div class="row-icon row-icon-purple">
                  <v-icon size="20" color="white">{{ iconFor(v.vehicle_type) }}</v-icon>
                </div>

                <div class="row-body">
                  <div class="row-title">{{ v.plate_number }}</div>
                  <div class="row-sub">
                    {{ [v.make, v.model].filter(Boolean).join(' ') || '—' }}
                    <span v-if="v.color"> · {{ v.color }}</span>
                    <span v-if="v.year"> · {{ v.year }}</span>
                  </div>
                  <div class="row-meta">
                    <v-icon x-small color="#8051FF">mdi-home-account</v-icon>
                    {{ v.household_owner || '—' }}
                    <span v-if="v.house_number"> · #{{ v.house_number }}</span>
                    <span v-if="v.household_phone"> · {{ v.household_phone }}</span>
                  </div>
                </div>

                <v-chip
                  x-small label class="status-chip"
                  :color="statusColor(v.status)"
                  :style="statusStyle(v.status)"
                >{{ v.status }}</v-chip>

                <div class="row-actions">
                  <v-btn
                    v-if="v.status === 'Pending'"
                    icon small color="#10b981" title="Approve"
                    @click="approveVehicle(v)"
                  ><v-icon small>mdi-check</v-icon></v-btn>

                  <v-btn
                    v-if="v.status === 'Active'"
                    icon small color="#f59e0b" title="Suspend"
                    @click="suspendVehicle(v)"
                  ><v-icon small>mdi-pause</v-icon></v-btn>

                  <v-btn
                    v-if="v.status === 'Suspended'"
                    icon small color="#10b981" title="Reactivate"
                    @click="approveVehicle(v)"
                  ><v-icon small>mdi-play</v-icon></v-btn>

                  <v-btn icon small title="Delete" @click="confirmDeleteVehicle(v)">
                    <v-icon small>mdi-delete-outline</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>
          </div>

          <!-- PASSES TAB -->
          <div v-if="tab === 1" class="tab-body">
            <v-skeleton-loader
              v-if="loading"
              type="list-item-three-line, list-item-three-line"
            />

            <div v-else-if="!passes.length" class="empty-block">
              <div class="empty-icon">
                <v-icon size="36" color="#cbd5e1">mdi-ticket-confirmation-outline</v-icon>
              </div>
              <div class="empty-title">No passes</div>
              <div class="empty-sub">Passes created by residents will appear here.</div>
            </div>

            <div v-else class="row-list">
              <div
                v-for="p in passes"
                :key="p.pass_id"
                class="row-card"
              >
                <div class="pass-code">{{ p.pass_code }}</div>

                <div class="row-body">
                  <div class="row-title">{{ p.visitor_name }}</div>
                  <div class="row-sub">
                    <span v-if="p.visitor_phone">{{ p.visitor_phone }}</span>
                    <span v-if="p.visitor_plate"> · {{ p.visitor_plate }}</span>
                  </div>
                  <div class="row-meta">
                    <v-icon x-small color="#8051FF">mdi-home-account</v-icon>
                    {{ p.host_name || '—' }}
                    <span v-if="p.house_number"> · #{{ p.house_number }}</span>
                  </div>
                  <div class="row-window">
                    <v-icon x-small>mdi-clock-outline</v-icon>
                    {{ formatWindow(p.valid_from, p.valid_until) }}
                  </div>
                </div>

                <v-chip
                  x-small label class="status-chip"
                  :color="statusColor(p.status)"
                  :style="statusStyle(p.status)"
                >{{ p.status }}</v-chip>

                <div class="row-actions">
                  <v-btn
                    v-if="p.status === 'Active'"
                    icon small color="#ef4444" title="Cancel"
                    @click="cancelPass(p)"
                  ><v-icon small>mdi-close-circle-outline</v-icon></v-btn>
                </div>
              </div>
            </div>
          </div>

          <!-- GATE LOG TAB -->
          <div v-if="tab === 2" class="tab-body">
            <v-skeleton-loader
              v-if="loading"
              type="list-item-three-line, list-item-three-line"
            />

            <div v-else-if="!logs.length" class="empty-block">
              <div class="empty-icon">
                <v-icon size="36" color="#cbd5e1">mdi-history</v-icon>
              </div>
              <div class="empty-title">No gate activity</div>
              <div class="empty-sub">Entries and exits logged at the gate show up here.</div>
            </div>

            <div v-else class="row-list">
              <div
                v-for="l in logs"
                :key="l.log_id"
                class="row-card"
              >
                <v-chip
                  x-small label class="dir-chip"
                  :color="l.direction === 'IN' ? '#d1fae5' : '#fef3c7'"
                  :style="l.direction === 'IN' ? 'color:#065f46;' : 'color:#92400e;'"
                >{{ l.direction }}</v-chip>

                <div class="row-body">
                  <div class="row-title">
                    {{ l.plate_number || l.visitor_name || '—' }}
                  </div>
                  <div class="row-sub">
                    {{ [l.make, l.model].filter(Boolean).join(' ') || l.visitor_name || '' }}
                  </div>
                  <div class="row-meta">
                    <v-icon x-small>mdi-gate</v-icon>
                    {{ l.gate_name || 'Gate' }}
                    <span> · {{ formatDateTime(l.created_at) }}</span>
                    <span v-if="l.notes === 'self-check-in'"> · self check-in</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-container>

      <!-- ============================================================
           LOG ENTRY DIALOG
           ============================================================ -->
      <v-dialog v-model="logDialog" max-width="480" persistent>
        <v-card rounded="xl">
          <v-card-title class="dialog-title">
            <v-icon color="#8051FF" class="mr-2">mdi-login-variant</v-icon>
            Log gate entry
          </v-card-title>

          <v-card-text>
            <v-text-field
              v-model="logForm.plate_number"
              label="Plate number"
              placeholder="KDA 123X"
              outlined dense
              @keyup.enter="lookupPlate"
            >
              <template #append>
                <v-btn icon small @click="lookupPlate" :loading="looking">
                  <v-icon small>mdi-magnify</v-icon>
                </v-btn>
              </template>
            </v-text-field>

            <div v-if="lookupResult" class="lookup-box" :class="{ warn: !lookupResult.known || lookupResult.warning }">
              <div v-if="!lookupResult.known" class="lookup-warn">
                <v-icon small color="#b45309">mdi-alert</v-icon>
                Not registered in this estate.
              </div>
              <div v-else>
                <div class="lookup-name">{{ lookupResult.vehicle.plate_number }}</div>
                <div class="lookup-sub">
                  {{ lookupResult.vehicle.make }} {{ lookupResult.vehicle.model }}
                  · {{ lookupResult.vehicle.household_owner }}
                  <span v-if="lookupResult.vehicle.house_number"> · #{{ lookupResult.vehicle.house_number }}</span>
                </div>
                <div v-if="lookupResult.warning" class="lookup-warn">
                  <v-icon small color="#b45309">mdi-alert</v-icon>
                  {{ lookupResult.warning }}
                </div>
              </div>
            </div>

            <v-radio-group v-model="logForm.direction" row class="mt-3">
              <v-radio label="IN" value="IN" color="#10b981" />
              <v-radio label="OUT" value="OUT" color="#f59e0b" />
            </v-radio-group>

            <v-text-field
              v-model="logForm.gate_name"
              label="Gate (optional)"
              placeholder="Main gate, West gate"
              outlined dense
            />
            <v-text-field
              v-model="logForm.notes"
              label="Notes (optional)"
              outlined dense
            />

            <div v-if="logError" class="error-text">{{ logError }}</div>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn text @click="logDialog = false" :disabled="saving">Cancel</v-btn>
            <v-btn
              color="#8051FF" dark rounded depressed
              :loading="saving"
              :disabled="!logForm.plate_number"
              @click="submitLog"
            >Save log</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ============================================================
           VERIFY PASS DIALOG
           ============================================================ -->
      <v-dialog v-model="verifyDialog" max-width="460" persistent>
        <v-card rounded="xl">
          <v-card-title class="dialog-title">
            <v-icon color="#8051FF" class="mr-2">mdi-ticket-confirmation</v-icon>
            Verify visitor pass
          </v-card-title>

          <v-card-text>
            <v-text-field
              v-model="verifyForm.pass_code"
              label="Pass code"
              placeholder="ABCD2345"
              outlined dense
              @keyup.enter="doVerify"
            />

            <v-radio-group v-model="verifyForm.direction" row>
              <v-radio label="IN" value="IN" color="#10b981" />
              <v-radio label="OUT" value="OUT" color="#f59e0b" />
            </v-radio-group>

            <div v-if="verifyResult" class="lookup-box" :class="{ warn: !verifyResult.ok }">
              <div v-if="!verifyResult.ok" class="lookup-warn">
                <v-icon small color="#b45309">mdi-alert</v-icon>
                {{ verifyResult.error }}
              </div>
              <div v-else>
                <div class="lookup-name">{{ verifyResult.visitor_name }}</div>
                <div class="lookup-sub">
                  Host: {{ verifyResult.host_name || '—' }}
                  <span v-if="verifyResult.visitor_plate"> · {{ verifyResult.visitor_plate }}</span>
                </div>
              </div>
            </div>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn text @click="verifyDialog = false">Close</v-btn>
            <v-btn
              color="#8051FF" dark rounded depressed
              :loading="saving"
              :disabled="!verifyForm.pass_code"
              @click="doVerify"
            >Verify &amp; log</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- SNACKBAR -->
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
  name: 'OfficialVehicles',
  data() {
    return {
      nav_bars: false,
      activeTab: '/officials/vehicles',

      loading: false,
      saving: false,
      looking: false,

      uid: null,
      estateId: null,
      estate: { estate_name: '' },

      tab: 0,
      search: '',
      statusFilter: '',

      vehicles: [],
      passes: [],
      logs: [],

      stats: {
        active_vehicles: 0,
        pending_vehicles: 0,
        active_passes: 0,
        today_entries: 0,
      },

      vehicleStatusOptions: [
        { text: 'All statuses', value: '' },
        { text: 'Active',    value: 'Active' },
        { text: 'Pending',   value: 'Pending' },
        { text: 'Suspended', value: 'Suspended' },
      ],
      passStatusOptions: [
        { text: 'All statuses', value: '' },
        { text: 'Active',    value: 'Active' },
        { text: 'Used',      value: 'Used' },
        { text: 'Expired',   value: 'Expired' },
        { text: 'Cancelled', value: 'Cancelled' },
      ],

      logDialog: false,
      logForm: { plate_number: '', direction: 'IN', gate_name: '', notes: '' },
      logError: '',
      lookupResult: null,

      verifyDialog: false,
      verifyForm: { pass_code: '', direction: 'IN' },
      verifyResult: null,

      snackbar: { show: false, text: '', color: 'success' },
      _debounce: null,
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
        { title: 'Vehicles',  icon: 'mdi-car',            route: '/officials/vehicles' },
        { title: 'Charges',   icon: 'mdi-tag-multiple',   route: '/officials/charges' },
        { title: 'Team',      icon: 'mdi-account-supervisor', route: '/officials/team' },
        { title: 'Cash',      icon: 'mdi-cash-register',  route: '/officials/cash' },
      ];
    },
    bottomMenuItems() {
      return [
        { title: 'Home',     icon: 'mdi-view-dashboard', route: this.dashboardRoute },
        { title: 'Pending',  icon: 'mdi-account-clock',  route: '/officials/pending' },
        { title: 'Vehicles', icon: 'mdi-car',            route: '/officials/vehicles' },
        { title: 'Settings', icon: 'mdi-cog',            route: '/officials/settings' },
      ];
    },
  },
  watch: {
    tab() {
      this.search = '';
      this.statusFilter = '';
      this.fetch();
    },
  },
  mounted() {
    this.onResize();
    window.addEventListener('resize', this.onResize);

    const t = this.$route.query.tab;
    if (t === 'passes')      this.tab = 1;
    else if (t === 'gate')   this.tab = 2;

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
        const r = this.$router.push(path);
        if (r && typeof r.catch === 'function') {
          r.catch((err) => {
            if (err && err.name !== 'NavigationDuplicated') console.error('Nav error:', err);
          });
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
        that.loadProfileAndFetch();
        return;
      }
      that._authUnsub = that.$fire.auth.onAuthStateChanged((user) => {
        if (user && user.uid) {
          that.uid = user.uid;
          that.loadProfileAndFetch();
          if (that._authUnsub) {
            that._authUnsub();
            that._authUnsub = null;
          }
        } else {
          that.showSnackbar('Please sign in as an official', 'error');
        }
      });
    },

    async loadProfileAndFetch() {
      try {
        const { data } = await axios.get(`${API}/officials/getOfficialById/${this.uid}`);
        if (data) this.estateId = data.estate_id || null;
      } catch (err) {
        console.warn('Could not resolve official estate:', err.message);
      }

      const routeId = this.$route?.params?.id;
      if (routeId) this.estateId = Number(routeId);

      if (this.estateId) {
        try {
          const { data } = await axios.get(`${API}/estates/estate/${this.estateId}`);
          this.estate = { estate_name: data?.estate_name || '' };
        } catch (_) {}
      }

      this.refreshAll();
    },

    async refreshAll() {
      if (!this.estateId) return;
      this.loading = true;
      await Promise.allSettled([
        this.fetch(),
        this.fetchStats(),
      ]);
      this.loading = false;
    },

    async fetchStats() {
      if (!this.estateId) return;
      try {
        const { data } = await axios.get(`${API}/vehicles/estate/${this.estateId}/stats`);
        if (data) {
          this.stats = {
            active_vehicles:  Number(data.active_vehicles)  || 0,
            pending_vehicles: Number(data.pending_vehicles) || 0,
            active_passes:    Number(data.active_passes)    || 0,
            today_entries:    Number(data.today_entries)    || 0,
          };
        }
      } catch (err) {
        console.warn('Vehicle stats failed:', err.response?.data || err.message);
      }
    },

    async fetch() {
      if (!this.estateId) return;
      this.loading = true;
      try {
        if (this.tab === 0) {
          const { data } = await axios.get(`${API}/vehicles/estate/${this.estateId}`, {
            params: { search: this.search, status: this.statusFilter },
          });
          this.vehicles = Array.isArray(data) ? data : [];
        } else if (this.tab === 1) {
          const { data } = await axios.get(`${API}/visitor-passes/estate/${this.estateId}`, {
            params: { search: this.search, status: this.statusFilter },
          });
          this.passes = Array.isArray(data) ? data : [];
        } else {
          const { data } = await axios.get(`${API}/vehicles/logs/estate/${this.estateId}`, {
            params: { plate: this.search },
          });
          this.logs = Array.isArray(data) ? data : [];
        }
      } catch (err) {
        this.showSnackbar(err.response?.data?.error || 'Failed to load', 'error');
      } finally {
        this.loading = false;
      }
    },

    debouncedFetch() {
      clearTimeout(this._debounce);
      this._debounce = setTimeout(() => this.fetch(), 350);
    },

    // -------- Vehicles --------
    async approveVehicle(v) {
      try {
        await axios.post(`${API}/vehicles/${v.vehicle_id}/approve`);
        this.showSnackbar('Vehicle approved');
        this.fetch(); this.fetchStats();
      } catch (err) {
        this.showSnackbar(err.response?.data?.error || 'Failed to approve', 'error');
      }
    },
    async suspendVehicle(v) {
      try {
        await axios.post(`${API}/vehicles/${v.vehicle_id}/suspend`);
        this.showSnackbar('Vehicle suspended');
        this.fetch(); this.fetchStats();
      } catch (err) {
        this.showSnackbar(err.response?.data?.error || 'Failed to suspend', 'error');
      }
    },
    async confirmDeleteVehicle(v) {
      if (!confirm(`Delete vehicle ${v.plate_number}?`)) return;
      try {
        await axios.delete(`${API}/vehicles/${v.vehicle_id}`);
        this.showSnackbar('Vehicle deleted');
        this.fetch(); this.fetchStats();
      } catch (err) {
        this.showSnackbar(err.response?.data?.error || 'Failed to delete', 'error');
      }
    },

    // -------- Passes --------
    async cancelPass(p) {
      if (!confirm(`Cancel pass ${p.pass_code}?`)) return;
      try {
        await axios.post(`${API}/visitor-passes/${p.pass_id}/cancel`);
        this.showSnackbar('Pass cancelled');
        this.fetch(); this.fetchStats();
      } catch (err) {
        this.showSnackbar(err.response?.data?.error || 'Failed to cancel', 'error');
      }
    },

    // -------- Log entry --------
    openLog() {
      this.logForm = { plate_number: '', direction: 'IN', gate_name: '', notes: '' };
      this.lookupResult = null;
      this.logError = '';
      this.logDialog = true;
    },
    async lookupPlate() {
      const plate = this.logForm.plate_number.trim();
      if (!plate || !this.estateId) return;
      this.looking = true;
      this.lookupResult = null;
      try {
        const { data } = await axios.post(`${API}/vehicles/lookup-plate`, {
          estate_id: this.estateId,
          plate_number: plate,
        });
        this.lookupResult = { known: true, ...data };
      } catch (err) {
        if (err.response?.status === 404) {
          this.lookupResult = { known: false };
        } else {
          this.showSnackbar(err.response?.data?.error || 'Lookup failed', 'error');
        }
      } finally {
        this.looking = false;
      }
    },
    async submitLog() {
      this.logError = '';
      this.saving = true;
      try {
        await axios.post(`${API}/vehicles/logs`, {
          estate_id: this.estateId,
          vehicle_id: this.lookupResult?.vehicle?.vehicle_id || null,
          plate_number: this.logForm.plate_number.trim(),
          direction: this.logForm.direction,
          gate_name: this.logForm.gate_name || null,
          notes: this.logForm.notes || null,
        });
        this.showSnackbar('Gate entry logged');
        this.logDialog = false;
        this.fetchStats();
        if (this.tab === 2) this.fetch();
      } catch (err) {
        this.logError = err.response?.data?.error || 'Failed to log';
      } finally {
        this.saving = false;
      }
    },

    // -------- Verify pass --------
    openVerify() {
      this.verifyForm = { pass_code: '', direction: 'IN' };
      this.verifyResult = null;
      this.verifyDialog = true;
    },
    async doVerify() {
      const code = this.verifyForm.pass_code.trim().toUpperCase();
      if (!code) return;
      this.saving = true;
      this.verifyResult = null;
      try {
        const { data } = await axios.post(`${API}/visitor-passes/verify`, {
          pass_code: code,
          direction: this.verifyForm.direction,
          gate_name: 'Main gate',
        });
        this.verifyResult = { ok: true, ...(data.pass || {}) };
        this.showSnackbar(`Visitor ${this.verifyForm.direction}`);
        this.fetchStats();
        if (this.tab === 1) this.fetch();
      } catch (err) {
        this.verifyResult = {
          ok: false,
          error: err.response?.data?.error || 'Verification failed',
        };
      } finally {
        this.saving = false;
      }
    },

    // -------- Helpers --------
    iconFor(type) {
      return {
        car: 'mdi-car',
        motorbike: 'mdi-motorbike',
        truck: 'mdi-truck',
        van: 'mdi-van-utility',
      }[type] || 'mdi-car-estate';
    },
    statusColor(s) {
      return {
        Active: '#d1fae5',
        Pending: '#fef3c7',
        Suspended: '#fee2e2',
        Removed: '#e5e7eb',
        Used: '#dbeafe',
        Expired: '#e5e7eb',
        Cancelled: '#fee2e2',
      }[s] || '#e5e7eb';
    },
    statusStyle(s) {
      return {
        Active: 'color:#065f46;',
        Pending: 'color:#92400e;',
        Suspended: 'color:#991b1b;',
        Removed: 'color:#374151;',
        Used: 'color:#1e40af;',
        Expired: 'color:#374151;',
        Cancelled: 'color:#991b1b;',
      }[s] || 'color:#374151;';
    },
    formatNum(n) {
      return numeral(n || 0).format('0,0');
    },
    formatDateTime(d) {
      if (!d) return '';
      try {
        return new Date(d).toLocaleString('en-GB', {
          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
        });
      } catch { return ''; }
    },
    formatWindow(from, until) {
      if (!from || !until) return '';
      const f = new Date(from);
      const u = new Date(until);
      const fmt = (d) => d.toLocaleString('en-GB', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
      });
      return `${fmt(f)} → ${fmt(u)}`;
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

@keyframes kpiPulse {
  0%   { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
  70%  { box-shadow: 0 0 0 12px rgba(255, 255, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
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

/* ============================================================
   KPI GRID
   ============================================================ */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.kpi {
  position: relative;
  padding: 18px 20px;
  border-radius: 20px;
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.28s ease;
  overflow: hidden;
}
.kpi-light {
  background: #ffffff;
  border: 1px solid #eef1f6;
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.03);
}
.kpi-dark {
  background: linear-gradient(140deg, #0a0a14 0%, #221047 55%, #2b1256 100%);
  border: none;
  box-shadow: 0 22px 44px -22px rgba(34, 16, 71, 0.55);
}
.kpi-alert {
  background: linear-gradient(140deg, #dc2626 0%, #b91c1c 100%);
  border: none;
  color: #ffffff;
  box-shadow: 0 22px 44px -22px rgba(220, 38, 38, 0.6);
}
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

@media (max-width: 900px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
}
@media (max-width: 599px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .kpi { padding: 14px; border-radius: 16px; }
  .kpi-value { font-size: 1.35rem; }
  .kpi-icon { width: 34px; height: 34px; border-radius: 10px; }
  .kpi-icon .v-icon { font-size: 18px !important; }
}

/* ============================================================
   PRIMARY ACTIONS
   ============================================================ */
.actions-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 16px;
}
.primary-action {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: #ffffff;
  border: 1px solid #eef1f6;
  border-radius: 16px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.03);
}
.primary-action:hover {
  transform: translateY(-2px);
  border-color: rgba(128, 81, 255, 0.35);
  box-shadow: 0 18px 32px -22px rgba(128, 81, 255, 0.5);
}
.pa-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.pa-icon-purple {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 8px 16px -8px rgba(128, 81, 255, 0.8);
}
.pa-icon-lime {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  box-shadow: 0 8px 16px -8px rgba(182, 255, 0, 0.6);
}
.pa-body { flex: 1; min-width: 0; }
.pa-title {
  font-size: 0.9rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.2px;
}
.pa-sub {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 2px;
  font-weight: 500;
}

/* ============================================================
   PANEL + TABS
   ============================================================ */
.panel-card {
  background: #ffffff;
  border: 1px solid #eef1f6;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.03);
}
.tabs-premium {
  border-bottom: 1px solid #f1f5f9;
}
.tabs-premium ::v-deep .v-tab {
  font-weight: 700;
  text-transform: none;
  letter-spacing: 0;
  font-size: 0.85rem;
}

.filter-row {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid #f1f5f9;
}
.search-field-premium ::v-deep .v-input__slot {
  background: #f6f7fb !important;
}
.search-field-premium.v-input--is-focused ::v-deep .v-input__slot {
  background: #ffffff !important;
  box-shadow: 0 2px 10px rgba(128, 81, 255, 0.12);
}
.status-filter ::v-deep .v-input__slot {
  background: #f6f7fb !important;
}

.tab-body { padding: 8px 0; }

/* ============================================================
   ROW LIST
   ============================================================ */
.row-list { display: flex; flex-direction: column; }
.row-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s ease;
}
.row-card:last-child { border-bottom: none; }
.row-card:hover { background: #fafbff; }

.row-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.row-icon-purple {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 8px 16px -8px rgba(128, 81, 255, 0.7);
}

.row-body { flex: 1; min-width: 0; }
.row-title {
  font-size: 0.92rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.row-sub {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 2px;
  font-weight: 500;
}
.row-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: #8051ff;
  font-weight: 700;
  margin-top: 3px;
  flex-wrap: wrap;
}
.row-window {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: #475569;
  font-weight: 600;
  margin-top: 3px;
}

.status-chip { font-weight: 700; flex-shrink: 0; }

.row-actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.pass-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.86rem;
  font-weight: 800;
  color: #8051ff;
  letter-spacing: 1.5px;
  background: #f3eeff;
  padding: 6px 10px;
  border-radius: 8px;
  min-width: 84px;
  text-align: center;
  flex-shrink: 0;
}

.dir-chip {
  font-weight: 800;
  min-width: 40px;
  justify-content: center;
  flex-shrink: 0;
}

/* ============================================================
   EMPTY
   ============================================================ */
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
   DIALOGS
   ============================================================ */
.dialog-title {
  font-weight: 800;
  color: #0f0d24;
  padding-bottom: 0;
}
.error-text {
  color: #dc2626;
  font-size: 0.82rem;
  margin-top: 6px;
}

.lookup-box {
  padding: 10px 12px;
  border-radius: 10px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  margin-top: 8px;
}
.lookup-box.warn {
  background: #fffbeb;
  border-color: #fde68a;
}
.lookup-name {
  font-weight: 800;
  color: #065f46;
  font-size: 0.92rem;
}
.lookup-sub {
  font-size: 0.78rem;
  color: #475569;
  margin-top: 2px;
}
.lookup-warn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #b45309;
  font-size: 0.78rem;
  font-weight: 600;
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
  .actions-row { grid-template-columns: 1fr; }
  .filter-row  { grid-template-columns: 1fr; padding: 12px 16px; }
  .row-card    { padding: 12px 16px; gap: 10px; }
  .row-icon    { width: 38px; height: 38px; border-radius: 10px; }
  .pass-code   { font-size: 0.78rem; padding: 5px 8px; min-width: 72px; letter-spacing: 1px; }
}
</style>