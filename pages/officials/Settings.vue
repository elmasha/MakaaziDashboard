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
            @click="confirmLogout = true"
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
                      Settings
                    </h1>
                  </div>
                  <div class="d-flex align-center mt-1">
                    <v-icon x-small color="success" class="mr-1">mdi-circle</v-icon>
                    <span class="text-caption text--secondary">
                      {{ estate.estate_name || 'Your estate' }} · Official console
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
              <v-avatar color="#8051FF" size="38" class="ml-1 avatar-glow">
                <span class="white--text font-weight-bold text-caption">{{ officialInitials }}</span>
              </v-avatar>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <v-container :fluid="nav_bars" class="px-4 px-sm-6 pt-3 pt-sm-5 pb-8">
        <!-- LOADING -->
        <div v-if="loading && !estate.estate_name" class="panel-card reveal-card">
          <div class="pa-6">
            <v-skeleton-loader type="card, card, card" />
          </div>
        </div>

        <template v-else>
          <!-- ============================================================
               ESTATE PROFILE
               ============================================================ -->
          <div class="panel-card reveal-card">
            <div class="panel-head">
              <div class="panel-icon panel-icon-purple">
                <v-icon size="20" color="white">mdi-office-building-outline</v-icon>
              </div>
              <div class="panel-title-group">
                <div class="panel-title">Estate profile</div>
                <div class="panel-sub">Basic info about {{ estate.estate_name || 'your estate' }}</div>
              </div>
              <button class="edit-pill-btn" @click="openEstateEdit">
                <v-icon size="14" class="mr-1">mdi-pencil-outline</v-icon>
                Edit
              </button>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Estate name</div>
                <div class="info-value">{{ estate.estate_name || '—' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Location</div>
                <div class="info-value">{{ estate.location || '—' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Latitude</div>
                <div class="info-value mono">{{ estate.latitude || '—' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Longitude</div>
                <div class="info-value mono">{{ estate.longitude || '—' }}</div>
              </div>
            </div>
          </div>

          <!-- ============================================================
               ADDRESS COMPONENTS
               ============================================================ -->
          <div class="panel-card mt-4 reveal-card" style="animation-delay: 50ms">
            <div class="panel-head">
              <div class="panel-icon panel-icon-blue">
                <v-icon size="20" color="white">mdi-map-marker-multiple-outline</v-icon>
              </div>
              <div class="panel-title-group">
                <div class="panel-title">Address components</div>
                <div class="panel-sub">Toggle which address fields residents fill in</div>
              </div>
            </div>

            <div class="toggle-list">
              <div class="toggle-row">
                <div>
                  <div class="toggle-title">Section</div>
                  <div class="toggle-sub">e.g. Lower, Upper, Phase 2</div>
                </div>
                <button
                  class="toggle-switch"
                  :class="{ 'toggle-on': addressConfig.show_section }"
                  @click="addressConfig.show_section = !addressConfig.show_section"
                >
                  <span class="toggle-knob"></span>
                </button>
              </div>

              <div class="toggle-row">
                <div>
                  <div class="toggle-title">Court</div>
                  <div class="toggle-sub">e.g. Court 23, Dam Court</div>
                </div>
                <button
                  class="toggle-switch"
                  :class="{ 'toggle-on': addressConfig.show_court }"
                  @click="addressConfig.show_court = !addressConfig.show_court"
                >
                  <span class="toggle-knob"></span>
                </button>
              </div>

              <div class="toggle-row">
                <div>
                  <div class="toggle-title">Street</div>
                  <div class="toggle-sub">e.g. G1, Ngina, 122</div>
                </div>
                <button
                  class="toggle-switch"
                  :class="{ 'toggle-on': addressConfig.show_street }"
                  @click="addressConfig.show_street = !addressConfig.show_street"
                >
                  <span class="toggle-knob"></span>
                </button>
              </div>

              <div class="toggle-row">
                <div>
                  <div class="toggle-title">House number</div>
                  <div class="toggle-sub">e.g. H233</div>
                </div>
                <button
                  class="toggle-switch"
                  :class="{ 'toggle-on': addressConfig.show_house_number }"
                  @click="addressConfig.show_house_number = !addressConfig.show_house_number"
                >
                  <span class="toggle-knob"></span>
                </button>
              </div>
            </div>

            <div class="panel-actions">
              <button
                class="panel-action-btn panel-action-primary"
                :disabled="savingAddressConfig"
                @click="saveAddressConfig"
              >
                <v-icon size="14" :class="['mr-1', { spin: savingAddressConfig }]">
                  {{ savingAddressConfig ? 'mdi-loading' : 'mdi-content-save-outline' }}
                </v-icon>
                {{ savingAddressConfig ? 'Saving…' : 'Save address config' }}
              </button>
            </div>
          </div>

          <!-- ============================================================
               SERVICE CHARGES
               ============================================================ -->
          <div class="panel-card mt-4 reveal-card" style="animation-delay: 100ms">
            <div class="panel-head">
              <div class="panel-icon panel-icon-green">
                <v-icon size="20" color="white">mdi-tag-multiple-outline</v-icon>
              </div>
              <div class="panel-title-group">
                <div class="panel-title">Service charges</div>
                <div class="panel-sub">Monthly and recurring fees for households</div>
              </div>
              <button class="add-pill-btn" @click="chargeDialog = true">
                <v-icon size="14" class="mr-1">mdi-plus</v-icon>
                Add charge
              </button>
            </div>

            <div v-if="charges.length" class="charges-list">
              <div
                v-for="c in charges"
                :key="c.charges_id"
                class="charge-row"
              >
                <div class="charge-icon">
                  <v-icon size="18" color="white">mdi-cash</v-icon>
                </div>
                <div class="charge-body">
                  <div class="charge-name">{{ c.charge_name }}</div>
                  <div class="charge-meta">
                    <span class="charge-freq">{{ c.frequency }}</span>
                    <span class="charge-sep">·</span>
                    <span class="charge-amount">KES {{ formatNum(c.amount) }}</span>
                  </div>
                </div>
                <button class="row-action" title="Edit" @click="editCharge(c)">
                  <v-icon size="16">mdi-pencil-outline</v-icon>
                </button>
              </div>
            </div>

            <div v-else class="empty-mini">
              <div class="empty-mini-icon">
                <v-icon size="32" color="#cbd5e1">mdi-tag-off-outline</v-icon>
              </div>
              <div class="empty-mini-title">No service charges yet</div>
              <div class="empty-mini-sub">Add charges so residents can pay</div>
            </div>
          </div>

          <!-- ============================================================
               TEAM
               ============================================================ -->
          <div class="panel-card mt-4 reveal-card" style="animation-delay: 150ms">
            <div class="panel-head">
              <div class="panel-icon panel-icon-amber">
                <v-icon size="20" color="white">mdi-account-supervisor-outline</v-icon>
              </div>
              <div class="panel-title-group">
                <div class="panel-title">Estate team</div>
                <div class="panel-sub">Officials and workers managing the estate</div>
              </div>
              <button class="edit-pill-btn" @click="goTo('/officials/team')">
                Manage
                <v-icon size="14" class="ml-1">mdi-chevron-right</v-icon>
              </button>
            </div>

            <div class="team-stats">
              <div class="team-stat">
                <div class="team-stat-label">Officials</div>
                <div class="team-stat-value">{{ team.officials }}</div>
              </div>
              <div class="team-stat">
                <div class="team-stat-label">Workers</div>
                <div class="team-stat-value">{{ team.workers }}</div>
              </div>
              <div class="team-stat">
                <div class="team-stat-label">Households</div>
                <div class="team-stat-value">{{ team.households }}</div>
              </div>
              <div class="team-stat">
                <div class="team-stat-label">Your role</div>
                <div class="team-stat-value">{{ official.role || '—' }}</div>
              </div>
            </div>
          </div>

          <!-- ============================================================
               YOUR ACCOUNT
               ============================================================ -->
          <div class="panel-card mt-4 reveal-card" style="animation-delay: 200ms">
            <div class="panel-head">
              <div class="panel-icon panel-icon-purple">
                <v-icon size="20" color="white">mdi-account-circle-outline</v-icon>
              </div>
              <div class="panel-title-group">
                <div class="panel-title">Your account</div>
                <div class="panel-sub">Signed in as an estate official</div>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Full name</div>
                <div class="info-value">{{ official.full_name || '—' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Role</div>
                <div class="info-value">
                  <span v-if="official.role" class="role-badge">{{ official.role }}</span>
                  <span v-else>—</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">Contact</div>
                <div class="info-value">{{ official.contact || '—' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">UID</div>
                <div class="info-value mono small">{{ uid || '—' }}</div>
              </div>
            </div>

            <div class="panel-actions">
              <button class="panel-action-btn panel-action-ghost" @click="goTo('/officials/dashboard')">
                <v-icon size="14" class="mr-1">mdi-view-dashboard</v-icon>
                Go to dashboard
              </button>
              <button class="panel-action-btn panel-action-danger" @click="confirmLogout = true">
                <v-icon size="14" class="mr-1">mdi-logout</v-icon>
                Sign out
              </button>
            </div>
          </div>
        </template>
      </v-container>

      <!-- ============================================================
           EDIT ESTATE DIALOG
           ============================================================ -->
      <v-dialog v-model="editEstate" max-width="520" persistent scrollable>
        <div class="dialog-card">
          <div class="dialog-header">
            <div class="dialog-header-icon">
              <v-icon size="20" color="white">mdi-office-building-outline</v-icon>
            </div>
            <div class="dialog-header-text">
              <div class="dialog-title">Edit estate profile</div>
              <div class="dialog-sub">Update your estate's basic info</div>
            </div>
            <button class="dialog-close" @click="editEstate = false">
              <v-icon size="18" color="white">mdi-close</v-icon>
            </button>
          </div>

          <div class="dialog-body">
            <div class="field-block">
              <label class="field-label">Estate name</label>
              <input v-model="estateForm.estate_name" class="field-input" type="text" placeholder="e.g. Galilie Estate" />
            </div>
            <div class="field-block">
              <label class="field-label">Location</label>
              <input v-model="estateForm.location" class="field-input" type="text" placeholder="e.g. Nairobi, Westlands" />
            </div>
            <div class="field-grid">
              <div class="field-block">
                <label class="field-label">Latitude</label>
                <input v-model="estateForm.latitude" class="field-input mono-input" type="text" placeholder="e.g. -1.2921" />
              </div>
              <div class="field-block">
                <label class="field-label">Longitude</label>
                <input v-model="estateForm.longitude" class="field-input mono-input" type="text" placeholder="e.g. 36.8219" />
              </div>
            </div>
          </div>

          <div class="dialog-footer">
            <button class="dialog-btn dialog-btn-ghost" :disabled="savingEstate" @click="editEstate = false">
              Cancel
            </button>
            <button class="dialog-btn dialog-btn-primary" :disabled="savingEstate" @click="saveEstate">
              <v-icon size="14" :class="['mr-1', { spin: savingEstate }]">
                {{ savingEstate ? 'mdi-loading' : 'mdi-check' }}
              </v-icon>
              {{ savingEstate ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </div>
      </v-dialog>

      <!-- ============================================================
           ADD/EDIT CHARGE DIALOG
           ============================================================ -->
      <v-dialog v-model="chargeDialog" max-width="520" persistent scrollable>
        <div class="dialog-card">
          <div class="dialog-header">
            <div class="dialog-header-icon">
              <v-icon size="20" color="white">
                {{ chargeForm.charges_id ? 'mdi-pencil-outline' : 'mdi-tag-plus-outline' }}
              </v-icon>
            </div>
            <div class="dialog-header-text">
              <div class="dialog-title">
                {{ chargeForm.charges_id ? 'Edit charge' : 'Add charge' }}
              </div>
              <div class="dialog-sub">
                {{ chargeForm.charges_id ? 'Update the charge details' : 'Add a new service charge' }}
              </div>
            </div>
            <button class="dialog-close" @click="closeChargeDialog">
              <v-icon size="18" color="white">mdi-close</v-icon>
            </button>
          </div>

          <div class="dialog-body">
            <div class="field-block">
              <label class="field-label">Charge name</label>
              <input v-model="chargeForm.charge_name" class="field-input" type="text" placeholder="e.g. Security" />
            </div>
            <div class="field-block">
              <label class="field-label">Amount (KES)</label>
              <div class="field-input-wrap">
                <span class="field-prefix">KES</span>
                <input v-model.number="chargeForm.amount" class="field-input field-input-with-prefix" type="number" placeholder="0" />
              </div>
            </div>
            <div class="field-block">
              <label class="field-label">Frequency</label>
              <select v-model="chargeForm.frequency" class="field-select">
                <option v-for="f in frequencies" :key="f" :value="f">{{ f }}</option>
              </select>
            </div>
          </div>

          <div class="dialog-footer">
            <button class="dialog-btn dialog-btn-ghost" :disabled="savingCharge" @click="closeChargeDialog">
              Cancel
            </button>
            <button class="dialog-btn dialog-btn-primary" :disabled="savingCharge" @click="saveCharge">
              <v-icon size="14" :class="['spin', { spin: savingCharge }]">
                {{ savingCharge ? 'mdi-loading' : 'mdi-check' }}
              </v-icon>
              {{ savingCharge ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </div>
      </v-dialog>

      <!-- ============================================================
           CONFIRM LOGOUT
           ============================================================ -->
      <v-dialog v-model="confirmLogout" max-width="420" persistent>
        <div class="confirm-card">
          <div class="confirm-icon confirm-icon-red">
            <v-icon size="26" color="#dc2626">mdi-logout</v-icon>
          </div>
          <div class="confirm-title">Sign out?</div>
          <div class="confirm-text">
            You'll need to sign in again to manage your estate.
          </div>
          <div class="confirm-actions">
            <button class="confirm-cancel" @click="confirmLogout = false">Cancel</button>
            <button class="confirm-proceed" @click="logout">Sign out</button>
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
            size="28"
            class="mr-3"
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
  name: 'OfficialSettings',
  data() {
    return {
      nav_bars: false,
      activeTab: '/officials/settings',

      loading: false,
      uid: null,
      estateId: null,
      official: { full_name: '', role: '', contact: '', estate_id: null },
      estate: {
        estate_name: '',
        location: '',
        latitude: '',
        longitude: '',
      },

      addressConfig: {
        show_section: true,
        show_court: true,
        show_street: true,
        show_house_number: true,
      },
      savingAddressConfig: false,

      charges: [],
      frequencies: ['Monthly', 'Quarterly', 'Half yearly', 'Annual', 'Adhoc'],

      team: {
        officials: 0,
        workers: 0,
        households: 0,
      },

      editEstate: false,
      estateForm: {
        estate_name: '',
        location: '',
        latitude: '',
        longitude: '',
      },
      savingEstate: false,

      chargeDialog: false,
      chargeForm: {
        charges_id: null,
        charge_name: '',
        amount: '',
        frequency: 'Monthly',
      },
      savingCharge: false,

      confirmLogout: false,

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
        { title: 'Settings',  icon: 'mdi-cog',            route: '/officials/settings' },
      ];
    },
    bottomMenuItems() {
      return [
        { title: 'Home',     icon: 'mdi-view-dashboard', route: this.dashboardRoute },
        { title: 'Pending',  icon: 'mdi-account-clock',  route: '/officials/pending' },
        { title: 'Payments', icon: 'mdi-currency-usd',   route: '/officials/payments' },
        { title: 'Settings', icon: 'mdi-cog',            route: '/officials/settings' },
      ];
    },
    officialInitials() {
      const name = this.official.full_name || 'O';
      return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
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
        await Promise.allSettled([
          this.fetchEstate(),
          this.fetchAddressConfig(),
          this.fetchCharges(),
          this.fetchTeam(),
        ]);
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
            contact: data.contact || data.phone || '',
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
          this.estate = {
            estate_name: data.estate_name || '',
            location: data.location || '',
            latitude: data.latitude || '',
            longitude: data.longitude || '',
          };
        }
      } catch (error) {
        console.warn('Estate fetch failed:', error.response?.data || error.message);
      }
    },

    async fetchAddressConfig() {
      if (!this.estateId) return;
      try {
        const { data, status } = await axios.get(
          `${API}/address-config/estate/${this.estateId}`
        );
        if (status === 200 && data) {
          this.addressConfig = {
            show_section: data.show_section === 1 || data.show_section === true,
            show_court: data.show_court === 1 || data.show_court === true,
            show_street: data.show_street === 1 || data.show_street === true,
            show_house_number: data.show_house_number === 1 || data.show_house_number === true,
          };
        }
      } catch (error) {
        console.warn('Address config fetch failed:', error.response?.data || error.message);
      }
    },

    async fetchCharges() {
      if (!this.estateId) return;
      try {
        const { data, status } = await axios.get(
          `${API}/service-charges/estate/${this.estateId}`
        );
        if (status === 200) {
          this.charges = Array.isArray(data) ? data : [];
        }
      } catch (error) {
        console.warn('Charges fetch failed:', error.response?.data || error.message);
        this.charges = [];
      }
    },

    async fetchTeam() {
      if (!this.estateId) return;
      try {
        const [officialsRes, workersRes, householdsRes] = await Promise.allSettled([
          axios.get(`${API}/officials/getOfficialByEstateId/${this.estateId}`),
          axios.get(`${API}/workers/getWorkerByEstate/${this.estateId}`),
          axios.get(`${API}/households/getBHsHldEstId/${this.estateId}`),
        ]);

        this.team = {
          officials: officialsRes.status === 'fulfilled' && Array.isArray(officialsRes.value.data)
            ? officialsRes.value.data.length : 0,
          workers: workersRes.status === 'fulfilled' && Array.isArray(workersRes.value.data)
            ? workersRes.value.data.length : 0,
          households: householdsRes.status === 'fulfilled' && Array.isArray(householdsRes.value.data)
            ? householdsRes.value.data.length : 0,
        };
      } catch (error) {
        console.warn('Team fetch failed:', error.response?.data || error.message);
      }
    },

    openEstateEdit() {
      this.estateForm = {
        estate_name: this.estate.estate_name,
        location: this.estate.location,
        latitude: this.estate.latitude,
        longitude: this.estate.longitude,
      };
      this.editEstate = true;
    },

    async saveEstate() {
      this.savingEstate = true;
      try {
        const { status } = await axios.patch(
          `${API}/estates/update_estate/${this.estateId}`,
          this.estateForm
        );
        if (status === 200) {
          this.estate = { ...this.estate, ...this.estateForm };
          this.editEstate = false;
          this.showSnackbar('Estate profile updated', 'success');
        }
      } catch (error) {
        this.showSnackbar(
          error.response?.data?.error || 'Could not update estate profile',
          'error'
        );
      } finally {
        this.savingEstate = false;
      }
    },

    async saveAddressConfig() {
      this.savingAddressConfig = true;
      try {
        const payload = {
          estate_id: this.estateId,
          show_section: this.addressConfig.show_section ? 1 : 0,
          show_court: this.addressConfig.show_court ? 1 : 0,
          show_street: this.addressConfig.show_street ? 1 : 0,
          show_house_number: this.addressConfig.show_house_number ? 1 : 0,
        };
        const { status } = await axios.post(
          `${API}/address-config/save`,
          payload
        );
        if (status === 200 || status === 201) {
          this.showSnackbar('Address configuration saved', 'success');
        }
      } catch (error) {
        this.showSnackbar(
          error.response?.data?.error || 'Could not save address config',
          'error'
        );
      } finally {
        this.savingAddressConfig = false;
      }
    },

    editCharge(c) {
      this.chargeForm = {
        charges_id: c.charges_id,
        charge_name: c.charge_name,
        amount: c.amount,
        frequency: c.frequency,
      };
      this.chargeDialog = true;
    },

    closeChargeDialog() {
      this.chargeDialog = false;
      this.chargeForm = {
        charges_id: null,
        charge_name: '',
        amount: '',
        frequency: 'Monthly',
      };
    },

    async saveCharge() {
      if (!this.chargeForm.charge_name || !this.chargeForm.amount) {
        this.showSnackbar('Charge name and amount are required', 'warning');
        return;
      }
      this.savingCharge = true;
      try {
        const payload = {
          estate_id: this.estateId,
          charge_name: this.chargeForm.charge_name,
          amount: parseFloat(this.chargeForm.amount),
          frequency: this.chargeForm.frequency,
        };
        if (this.chargeForm.charges_id) {
          payload.charges_id = this.chargeForm.charges_id;
        }
        const { status } = await axios.post(
          `${API}/service-charges/addCharge`,
          payload
        );
        if (status === 200 || status === 201) {
          this.showSnackbar(
            this.chargeForm.charges_id ? 'Charge updated' : 'Charge added',
            'success'
          );
          this.closeChargeDialog();
          await this.fetchCharges();
        }
      } catch (error) {
        this.showSnackbar(
          error.response?.data?.error || 'Could not save charge',
          'error'
        );
      } finally {
        this.savingCharge = false;
      }
    },

    formatNum(n) {
      return numeral(n || 0).format('0,0');
    },
    showSnackbar(text, color = 'success') {
      this.snackbar = { show: true, text, color };
    },
    logout() {
      this.confirmLogout = false;
      if (this.$fire?.auth) this.$fire.auth.signOut();
      this.$router.push('/');
    },
  },
  watch: {
    editEstate(val) {
      if (val) this.openEstateEdit();
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

.avatar-glow { box-shadow: 0 8px 18px -8px rgba(128, 81, 255, 0.6); }

/* ============================================================
   PANEL CARD
   ============================================================ */
.panel-card {
  background: #ffffff;
  border: 1px solid #eef1f6;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.03);
}
.panel-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(to bottom, #ffffff, #f8fafc);
  flex-wrap: wrap;
}
.panel-title-group { flex: 1; min-width: 0; }
.panel-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.panel-icon-purple {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.7);
}
.panel-icon-blue {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  box-shadow: 0 10px 22px -10px rgba(59, 130, 246, 0.6);
}
.panel-icon-green {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  box-shadow: 0 10px 22px -10px rgba(34, 197, 94, 0.6);
}
.panel-icon-amber {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 10px 22px -10px rgba(245, 158, 11, 0.6);
}
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

.edit-pill-btn {
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
.edit-pill-btn:hover {
  background: rgba(128, 81, 255, 0.14);
  border-color: rgba(128, 81, 255, 0.35);
}

.add-pill-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  box-shadow: 0 10px 22px -12px rgba(128, 81, 255, 0.7);
}
.add-pill-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px -12px rgba(128, 81, 255, 0.85);
}

/* ============================================================
   INFO GRID
   ============================================================ */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 24px;
  padding: 20px;
}
.info-item { min-width: 0; }
.info-label {
  font-size: 0.62rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  margin-bottom: 4px;
}
.info-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f0d24;
  letter-spacing: -0.2px;
  word-break: break-word;
}
.info-value.mono { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.82rem; }
.info-value.small { font-size: 0.76rem; }

.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(128, 81, 255, 0.12);
  color: #6d28d9;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

/* ============================================================
   TOGGLE LIST
   ============================================================ */
.toggle-list {
  display: flex;
  flex-direction: column;
  padding: 8px 20px;
}
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
}
.toggle-row:last-child { border-bottom: none; }
.toggle-title {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.2px;
}
.toggle-sub {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 2px;
  font-weight: 500;
}
.toggle-switch {
  position: relative;
  width: 46px;
  height: 26px;
  background: #cbd5e1;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;
}
.toggle-switch.toggle-on {
  background: linear-gradient(135deg, #9b6cff, #8051ff);
  box-shadow: 0 6px 14px -6px rgba(128, 81, 255, 0.65);
}
.toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 22px;
  height: 22px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(15, 13, 36, 0.2);
  transition: transform 0.2s ease;
}
.toggle-switch.toggle-on .toggle-knob { transform: translateX(20px); }

/* ============================================================
   CHARGES LIST
   ============================================================ */
.charges-list {
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  gap: 8px;
}
.charge-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #fafbff;
  border: 1px solid #f0f2f7;
  border-radius: 14px;
  transition: all 0.2s ease;
}
.charge-row:hover {
  background: #ffffff;
  border-color: rgba(34, 197, 94, 0.25);
}
.charge-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 16px -8px rgba(34, 197, 94, 0.6);
}
.charge-body { flex: 1; min-width: 0; }
.charge-name {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.2px;
}
.charge-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 3px;
  font-size: 0.7rem;
  font-weight: 600;
}
.charge-freq {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(128, 81, 255, 0.12);
  color: #6d28d9;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}
.charge-sep { color: #cbd5e1; }
.charge-amount {
  color: #166534;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.row-action {
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
  flex-shrink: 0;
}
.row-action:hover {
  background: rgba(128, 81, 255, 0.1);
  color: #8051ff;
  border-color: rgba(128, 81, 255, 0.2);
}

/* ============================================================
   EMPTY MINI
   ============================================================ */
.empty-mini {
  padding: 40px 20px;
  text-align: center;
}
.empty-mini-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: #f6f7fb;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
}
.empty-mini-title {
  font-size: 0.9rem;
  font-weight: 800;
  color: #0f0d24;
}
.empty-mini-sub {
  font-size: 0.76rem;
  color: #94a3b8;
  margin-top: 4px;
}

/* ============================================================
   TEAM STATS
   ============================================================ */
.team-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 20px;
}
.team-stat { min-width: 0; }
.team-stat-label {
  font-size: 0.62rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  margin-bottom: 4px;
}
.team-stat-value {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
}

/* ============================================================
   PANEL ACTIONS
   ============================================================ */
.panel-actions {
  display: flex;
  gap: 10px;
  padding: 16px 20px 20px;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap;
}
.panel-action-btn {
  display: inline-flex;
  align-items: center;
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}
.panel-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.panel-action-primary {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  box-shadow: 0 10px 24px -12px rgba(128, 81, 255, 0.7);
}
.panel-action-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px -12px rgba(128, 81, 255, 0.85);
}
.panel-action-ghost {
  background: #ffffff;
  color: #475569;
  border: 1px solid #eef1f6;
}
.panel-action-ghost:hover {
  border-color: rgba(128, 81, 255, 0.35);
  color: #8051ff;
}
.panel-action-danger {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}
.panel-action-danger:hover {
  background: rgba(239, 68, 68, 0.14);
  border-color: rgba(239, 68, 68, 0.35);
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
.dialog-close:hover { background: rgba(255, 255, 255, 0.28); }

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
.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
@media (max-width: 599px) {
  .field-grid { grid-template-columns: 1fr; }
}
.field-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.9px;
}
.field-input,
.field-select {
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
.field-select:focus {
  border-color: #8051ff;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(128, 81, 255, 0.1);
}
.field-input::placeholder { color: #94a3b8; font-weight: 500; }
.mono-input { font-family: ui-monospace, SFMono-Regular, monospace; }

.field-input-wrap { position: relative; display: flex; align-items: center; }
.field-prefix {
  position: absolute;
  left: 14px;
  font-size: 0.78rem;
  font-weight: 800;
  color: #8051ff;
  letter-spacing: 0.4px;
  pointer-events: none;
}
.field-input-with-prefix { padding-left: 52px; }

.field-select {
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 38px;
  cursor: pointer;
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
   CONFIRM DIALOG
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
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  background: rgba(128, 81, 255, 0.1);
}
.confirm-icon-red { background: rgba(239, 68, 68, 0.1); }
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
.confirm-cancel:hover { background: #eef1f6; }
.confirm-proceed {
  background: #dc2626;
  color: #ffffff;
  box-shadow: 0 10px 24px -12px rgba(220, 38, 38, 0.7);
}
.confirm-proceed:hover { background: #b91c1c; }

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
  .info-grid { grid-template-columns: 1fr; gap: 14px; }
  .team-stats { grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .team-stat-value { font-size: 1.2rem; }
  .panel-head { padding: 14px 16px; }
  .toggle-list { padding: 8px 16px; }
  .toggle-row { padding: 14px 0; }
  .charges-list { padding: 8px; }
  .panel-actions { padding: 14px 16px 18px; }
  .panel-action-btn { flex: 1; justify-content: center; }
}

@media (max-width: 599px) {
  .sticky-header-premium { padding-left: 12px; padding-right: 12px; }
  .reveal-card { animation-duration: 0.4s; }
  .team-stats { grid-template-columns: 1fr 1fr; }
}
</style>