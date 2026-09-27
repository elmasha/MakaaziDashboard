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
      v-model="bottomNav"
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
                      Team
                    </h1>
                  </div>
                  <div class="d-flex align-center mt-1">
                    <v-icon x-small color="success" class="mr-1">mdi-circle</v-icon>
                    <span class="text-caption text--secondary">
                      Workers and officials of {{ estate.estate_name || 'your estate' }}
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
                Add {{ activeTab === 'workers' ? 'worker' : 'official' }}
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
             TABS
             ============================================================ -->
        <div class="tabs-wrap reveal-card">
          <button
            class="tab-btn"
            :class="{ 'tab-btn-active': activeTab === 'workers' }"
            @click="activeTab = 'workers'"
          >
            <v-icon size="18">mdi-hammer-wrench</v-icon>
            <span>Workers</span>
            <span class="tab-count">{{ workers.length }}</span>
          </button>
          <button
            class="tab-btn"
            :class="{ 'tab-btn-active': activeTab === 'officials' }"
            @click="activeTab = 'officials'"
          >
            <v-icon size="18">mdi-shield-account</v-icon>
            <span>Officials</span>
            <span class="tab-count">{{ officials.length }}</span>
          </button>
        </div>

        <!-- ============================================================
             LOADING
             ============================================================ -->
        <div v-if="loading && !currentList.length" class="panel-card reveal-card">
          <div class="pa-6">
            <v-skeleton-loader
              type="list-item-avatar-two-line, list-item-avatar-two-line, list-item-avatar-two-line"
            />
          </div>
        </div>

        <!-- ============================================================
             EMPTY
             ============================================================ -->
        <div v-else-if="!currentList.length" class="panel-card reveal-card">
          <div class="empty-block">
            <div class="empty-icon">
              <v-icon size="40" color="#cbd5e1">
                {{ activeTab === 'workers' ? 'mdi-hammer-wrench' : 'mdi-shield-account' }}
              </v-icon>
            </div>
            <div class="empty-title">No {{ activeTab }} yet</div>
            <div class="empty-sub">
              Add the first {{ activeTab === 'workers' ? 'worker (e.g. security, cleaner, gardener)' : 'official (Chairman, Secretary, Treasurer)' }} to this estate.
            </div>
            <button class="empty-add-btn" @click="openAddDialog">
              <v-icon size="14" class="mr-1">mdi-plus</v-icon>
              Add {{ activeTab === 'workers' ? 'worker' : 'official' }}
            </button>
          </div>
        </div>

        <!-- ============================================================
             WORKERS LIST
             ============================================================ -->
        <div v-else-if="activeTab === 'workers'" class="reveal-card">
          <div class="list-head">
            <div class="panel-icon panel-icon-blue panel-icon-sm">
              <v-icon size="18" color="white">mdi-hammer-wrench</v-icon>
            </div>
            <div class="panel-title-group">
              <div class="panel-title">
                {{ workers.length }} worker{{ workers.length === 1 ? '' : 's' }}
              </div>
              <div class="panel-sub">Estate staff and their roles</div>
            </div>
            <div class="count-pill count-pill-blue">{{ workers.length }}</div>
          </div>

          <div class="team-list">
            <div
              v-for="w in workers"
              :key="w.worker_id"
              class="team-card"
            >
              <div class="team-avatar team-avatar-worker">
                {{ initialsOf(w.full_name) }}
              </div>

              <div class="team-body">
                <div class="team-name">{{ w.full_name }}</div>
                <div class="team-tags">
                  <span class="team-tag team-tag-blue">
                    <v-icon size="11">mdi-badge-account-horizontal</v-icon>
                    {{ w.role }}
                  </span>
                  <span class="team-tag team-tag-slate">
                    <v-icon size="11">mdi-phone-outline</v-icon>
                    {{ w.contact_number }}
                  </span>
                </div>
              </div>

              <div class="team-actions">
                <button
                  class="team-action"
                  title="Edit"
                  @click.stop="openEditWorkerDialog(w)"
                >
                  <v-icon size="16">mdi-pencil-outline</v-icon>
                </button>
                <button
                  class="team-action team-action-danger"
                  title="Remove"
                  @click.stop="openDeleteDialog('worker', w)"
                >
                  <v-icon size="16">mdi-trash-can-outline</v-icon>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================================
             OFFICIALS LIST
             ============================================================ -->
        <div v-else class="reveal-card">
          <div class="list-head">
            <div class="panel-icon panel-icon-lime panel-icon-sm">
              <v-icon size="18" color="#0A0A14">mdi-shield-account</v-icon>
            </div>
            <div class="panel-title-group">
              <div class="panel-title">
                {{ officials.length }} official{{ officials.length === 1 ? '' : 's' }}
              </div>
              <div class="panel-sub">Chairman, Secretary, Treasurer</div>
            </div>
            <div class="count-pill count-pill-lime">{{ officials.length }}</div>
          </div>

          <div class="team-list">
            <div
              v-for="o in officials"
              :key="o.official_id"
              class="team-card"
            >
              <div class="team-avatar team-avatar-official">
                {{ initialsOf(o.full_name) }}
              </div>

              <div class="team-body">
                <div class="team-title-row">
                  <span class="team-name">{{ o.full_name }}</span>
                  <span class="team-role-badge">
                    <v-icon size="11">mdi-crown</v-icon>
                    {{ o.role }}
                  </span>
                </div>
                <div class="team-tags">
                  <span class="team-tag team-tag-slate">
                    <v-icon size="11">mdi-phone-outline</v-icon>
                    {{ o.contact_number }}
                  </span>
                  <span v-if="o.uid" class="team-tag team-tag-mono">
                    <v-icon size="11">mdi-identifier</v-icon>
                    {{ shortUid(o.uid) }}
                  </span>
                </div>
              </div>

              <div class="team-actions">
                <button
                  class="team-action"
                  title="Edit"
                  @click.stop="openEditOfficialDialog(o)"
                >
                  <v-icon size="16">mdi-pencil-outline</v-icon>
                </button>
                <button
                  class="team-action team-action-danger"
                  title="Remove"
                  @click.stop="openDeleteDialog('official', o)"
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
                {{ formMode === 'worker' ? 'mdi-hammer-wrench' : 'mdi-shield-account' }}
              </v-icon>
            </div>
            <div class="dialog-header-text">
              <div class="dialog-title">{{ formTitle }}</div>
              <div class="dialog-sub">
                {{ isEditing ? 'Update the details' : 'Add a new member to your estate team' }}
              </div>
            </div>
            <button class="dialog-close" @click="closeFormDialog">
              <v-icon size="18" color="white">mdi-close</v-icon>
            </button>
          </div>

          <div class="dialog-body">
            <v-form ref="form" v-model="valid">
              <div class="field-block">
                <label class="field-label">Full name <span class="required">*</span></label>
                <input
                  v-model="form.full_name"
                  class="field-input"
                  type="text"
                  placeholder="e.g. John Kamau"
                />
              </div>

              <div class="field-block">
                <label class="field-label">
                  {{ formMode === 'worker' ? 'Role' : 'Position' }}
                  <span class="required">*</span>
                </label>
                <select v-model="form.role" class="field-select">
                  <option value="">Select {{ formMode === 'worker' ? 'a role' : 'a position' }}</option>
                  <option
                    v-for="r in (formMode === 'worker' ? workerRoles : officialRoles)"
                    :key="r"
                    :value="r"
                  >
                    {{ r }}
                  </option>
                </select>
              </div>

              <div class="field-block">
                <label class="field-label">Contact number <span class="required">*</span></label>
                <input
                  v-model="form.contact_number"
                  class="field-input"
                  type="tel"
                  placeholder="254712345678"
                />
                <div v-if="form.contact_number && !isPhoneValid(form.contact_number)" class="field-hint-warn">
                  Enter a valid Kenyan number (e.g. 0712345678 or 254712345678)
                </div>
              </div>

              <div v-if="formMode === 'official'" class="field-block">
                <label class="field-label">Firebase UID <span class="required">*</span></label>
                <input
                  v-model="form.uid"
                  class="field-input field-input-mono"
                  type="text"
                  placeholder="Firebase account UID"
                />
                <div class="field-hint">Get this from the resident's Firebase account</div>
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
              {{ submitting ? 'Saving…' : (isEditing ? 'Save changes' : 'Add') }}
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
          <div class="confirm-title">Remove this {{ deleteType }}?</div>
          <div class="confirm-text">
            <strong>{{ deleteTarget?.full_name }}</strong> — {{ deleteTarget?.role }}
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
              {{ submitting ? 'Removing…' : 'Remove' }}
            </button>
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

const API = 'https://makaaziserver22.up.railway.app/api';

export default {
  name: 'OfficialTeam',
  data() {
    return {
      nav_bars: false,
      activeTab: 'workers',
      bottomNav: '/officials/team',

      loading: false,
      submitting: false,
      uid: null,
      estateId: null,
      official: { full_name: '', role: '', estate_id: null },
      estate: { estate_name: '' },

      workers: [],
      officials: [],

      workerRoles: ['Security', 'Cleaner', 'Gardener', 'Plumber', 'Electrician', 'Caretaker', 'Other'],
      officialRoles: ['Chairman', 'Secretary', 'Treasurer'],

      formDialog: false,
      formMode: 'worker',
      isEditing: false,
      valid: true,
      form: {
        id: null,
        full_name: '',
        role: '',
        contact_number: '',
        uid: '',
      },

      deleteDialog: false,
      deleteType: 'worker',
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
    currentList() {
      return this.activeTab === 'workers' ? this.workers : this.officials;
    },
    formTitle() {
      const noun = this.formMode === 'worker' ? 'worker' : 'official';
      return this.isEditing ? `Edit ${noun}` : `Add ${noun}`;
    },
    canSubmit() {
      return (
        !!String(this.form.full_name || '').trim() &&
        !!this.form.role &&
        this.isPhoneValid(this.form.contact_number) &&
        (this.formMode === 'worker' || !!String(this.form.uid || '').trim())
      );
    },
  },
  watch: {
    activeTab() {
      if (this.formDialog) this.closeFormDialog();
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
          this.fetchWorkers(),
          this.fetchOfficials(),
        ]);
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

    async fetchWorkers() {
      if (!this.estateId) return;
      try {
        const url = `${API}/workers/getWorkerByEstate/${this.estateId}`;
        const { data, status } = await axios.get(url);
        if (status === 200) {
          this.workers = Array.isArray(data) ? data : [];
        }
      } catch (error) {
        try {
          const { data } = await axios.get(`${API}/workers/getAll`);
          const list = Array.isArray(data) ? data : [];
          this.workers = list.filter((w) => Number(w.estate_id) === Number(this.estateId));
        } catch (e) {
          console.warn('Workers fetch failed:', error.response?.data || error.message);
          this.workers = [];
        }
      }
    },

    async fetchOfficials() {
      if (!this.estateId) return;
      try {
        const url = `${API}/officials/getOfficialByEstateId/${this.estateId}`;
        const { data, status } = await axios.get(url);
        if (status === 200) {
          this.officials = Array.isArray(data) ? data : [];
        }
      } catch (error) {
        console.warn('Officials fetch failed:', error.response?.data || error.message);
        this.officials = [];
      }
    },

    openAddDialog() {
      this.formMode = this.activeTab === 'workers' ? 'worker' : 'official';
      this.isEditing = false;
      this.form = {
        id: null,
        full_name: '',
        role: '',
        contact_number: '',
        uid: '',
      };
      this.formDialog = true;
    },

    openEditWorkerDialog(w) {
      this.formMode = 'worker';
      this.isEditing = true;
      this.form = {
        id: w.worker_id,
        full_name: w.full_name,
        role: w.role,
        contact_number: w.contact_number,
        uid: w.uid || '',
      };
      this.formDialog = true;
    },

    openEditOfficialDialog(o) {
      this.formMode = 'official';
      this.isEditing = true;
      this.form = {
        id: o.official_id,
        full_name: o.full_name,
        role: o.role,
        contact_number: o.contact_number,
        uid: o.uid || '',
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

      try {
        if (this.formMode === 'worker') {
          await this.saveWorker();
        } else {
          await this.saveOfficial();
        }
      } catch (error) {
        console.error('Save failed:', error.response?.data || error.message);
        this.showSnackbar(error.response?.data?.error || 'Could not save', 'error');
      } finally {
        this.submitting = false;
      }
    },

    async saveWorker() {
      if (this.isEditing) {
        const url = `${API}/workers/updateWorker/${this.form.id}`;
        const { status } = await axios.put(url, {
          full_name: this.form.full_name,
          role: this.form.role,
          contact_number: this.form.contact_number,
        });
        if (status === 200) {
          this.showSnackbar('Worker updated', 'success');
          this.formDialog = false;
          await this.fetchWorkers();
        }
      } else {
        const url = `${API}/workers/addWorker`;
        const { status } = await axios.post(url, {
          estate_id: this.estateId,
          full_name: this.form.full_name,
          role: this.form.role,
          contact_number: this.form.contact_number,
          uid: this.form.uid || null,
        });
        if (status === 200) {
          this.showSnackbar('Worker added', 'success');
          this.formDialog = false;
          await this.fetchWorkers();
        }
      }
    },

    async saveOfficial() {
      if (this.isEditing) {
        const url = `${API}/officials/update_official/${this.form.id}`;
        const { status } = await axios.patch(url, {
          full_name: this.form.full_name,
          role: this.form.role,
          contact_number: this.form.contact_number,
        });
        if (status === 200) {
          this.showSnackbar('Official updated', 'success');
          this.formDialog = false;
          await this.fetchOfficials();
        }
      } else {
        const url = `${API}/officials/addOfficial`;
        const { status } = await axios.post(url, {
          estate_id: this.estateId,
          full_name: this.form.full_name,
          role: this.form.role,
          contact_number: this.form.contact_number,
          uid: this.form.uid,
          estate_urn: this.estate.urn || null,
        });
        if (status === 200) {
          this.showSnackbar('Official added', 'success');
          this.formDialog = false;
          await this.fetchOfficials();
        }
      }
    },

    openDeleteDialog(type, target) {
      this.deleteType = type;
      this.deleteTarget = target;
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
        if (this.deleteType === 'worker') {
          const url = `${API}/workers/deleteWorker/${this.deleteTarget.contact_number}`;
          const { status } = await axios.delete(url);
          if (status === 200) {
            this.showSnackbar('Worker removed', 'success');
            this.closeDeleteDialog();
            await this.fetchWorkers();
          }
        } else {
          const url = `${API}/officials/delete_official/${this.deleteTarget.contact_number}`;
          const { status } = await axios.put(url);
          if (status === 200) {
            this.showSnackbar('Official removed', 'success');
            this.closeDeleteDialog();
            await this.fetchOfficials();
          }
        }
      } catch (error) {
        console.error('Delete failed:', error.response?.data || error.message);
        this.showSnackbar(error.response?.data?.error || 'Could not delete', 'error');
      } finally {
        this.submitting = false;
      }
    },

    isPhoneValid(v) {
      const clean = String(v || '').replace(/\s/g, '');
      return /^(\+?254|0)?[17]\d{8}$/.test(clean);
    },

    initialsOf(name) {
      if (!name) return '?';
      return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    },

    shortUid(uid) {
      if (!uid) return '';
      return uid.length > 12 ? `${uid.slice(0, 6)}…${uid.slice(-4)}` : uid;
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
   TABS
   ============================================================ */
.tabs-wrap {
  display: flex;
  gap: 6px;
  padding: 6px;
  background: #ffffff;
  border: 1px solid #eef1f6;
  border-radius: 18px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.03);
}
.tab-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 14px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.2px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}
.tab-btn:hover { color: #0f0d24; background: #f6f7fb; }
.tab-btn-active {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  box-shadow: 0 10px 22px -12px rgba(128, 81, 255, 0.7);
}
.tab-btn-active:hover { color: #ffffff; }

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 7px;
  border-radius: 999px;
  background: rgba(15, 13, 36, 0.08);
  color: #475569;
  font-size: 0.66rem;
  font-weight: 800;
}
.tab-btn-active .tab-count {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

/* ============================================================
   LIST HEAD
   ============================================================ */
.reveal-card > .list-head,
.reveal-card {
  /* wrapper for list sections */
}
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
.panel-icon-purple {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.7);
}
.panel-icon-blue {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  box-shadow: 0 10px 22px -10px rgba(59, 130, 246, 0.6);
}
.panel-icon-lime {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  box-shadow: 0 10px 22px -10px rgba(182, 255, 0, 0.6);
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
  font-size: 0.72rem;
  font-weight: 800;
}
.count-pill-blue {
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
}
.count-pill-lime {
  background: rgba(122, 184, 0, 0.16);
  color: #3f6b00;
}

/* ============================================================
   TEAM LIST
   ============================================================ */
.team-list {
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
.team-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: #fafbff;
  border: 1px solid #f0f2f7;
  border-radius: 16px;
  transition: all 0.2s ease;
}
.team-card:hover {
  background: #ffffff;
  border-color: rgba(128, 81, 255, 0.25);
  box-shadow: 0 12px 26px -16px rgba(128, 81, 255, 0.3);
  transform: translateY(-1px);
}

.team-avatar {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}
.team-avatar-worker {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  color: #ffffff;
  box-shadow: 0 10px 22px -10px rgba(59, 130, 246, 0.65);
}
.team-avatar-official {
  background: linear-gradient(135deg, #d4ff4a 0%, #8fbc00 100%);
  color: #0a0a14;
  box-shadow: 0 10px 22px -10px rgba(122, 184, 0, 0.7);
}

.team-body { flex: 1; min-width: 0; }
.team-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.team-name {
  font-size: 0.92rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.team-role-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 9px;
  border-radius: 999px;
  background: rgba(122, 184, 0, 0.16);
  color: #3f6b00;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.team-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.team-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.3px;
}
.team-tag-blue {
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
}
.team-tag-slate {
  background: #f1f5f9;
  color: #475569;
}
.team-tag-mono {
  background: #f1f5f9;
  color: #475569;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.6rem;
}

.team-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}
.team-action {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: none;
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-family: inherit;
  border: 1px solid #eef1f6;
}
.team-action:hover {
  background: rgba(128, 81, 255, 0.1);
  color: #8051ff;
  border-color: rgba(128, 81, 255, 0.2);
}
.team-action-danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border-color: rgba(239, 68, 68, 0.2);
}

/* ============================================================
   EMPTY
   ============================================================ */
.panel-card {
  background: #ffffff;
  border: 1px solid #eef1f6;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.03);
}
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
  max-width: 340px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.55;
}
.empty-add-btn {
  display: inline-flex;
  align-items: center;
  margin-top: 20px;
  padding: 11px 22px;
  border-radius: 999px;
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  box-shadow: 0 12px 24px -12px rgba(128, 81, 255, 0.7);
}
.empty-add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 28px -12px rgba(128, 81, 255, 0.85);
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
   FORM DIALOG
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

.field-input-mono {
  font-family: ui-monospace, SFMono-Regular, monospace;
  letter-spacing: 0.5px;
  font-size: 0.82rem;
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
}
.field-hint-warn {
  font-size: 0.68rem;
  color: #b45309;
  margin-top: 4px;
  font-weight: 700;
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
  .tabs-wrap { padding: 5px; gap: 4px; }
  .tab-btn { padding: 10px 10px; font-size: 0.76rem; gap: 6px; }
  .tab-btn .v-icon { font-size: 16px !important; }
  .team-card { padding: 12px 14px; gap: 12px; }
  .team-avatar { width: 42px; height: 42px; }
  .team-name { font-size: 0.88rem; }
  .list-head { padding: 14px 16px; }
  .dialog-body { padding: 18px 20px; }
  .dialog-footer { padding: 14px 20px; }
}

@media (max-width: 599px) {
  .sticky-header-premium { padding-left: 12px; padding-right: 12px; }
  .reveal-card { animation-duration: 0.4s; }
  .tab-btn .tab-count { display: none; }
}
</style>