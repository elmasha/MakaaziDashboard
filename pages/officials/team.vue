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
                  <h1 class="text-h6 text-sm-h5 font-weight-bold text--primary page-title">
                    Team
                  </h1>
                  <div class="d-flex align-center mt-1">
                    <span class="text-caption text--secondary">
                      Workers and officials of {{ estate.estate_name || 'your estate' }}
                    </span>
                  </div>
                </div>
              </div>
            </v-col>
            <v-col cols="4" sm="6" class="d-flex justify-end align-center">
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
                color="#8051FF"
                dark
                depressed
                rounded
                small
                class="text-capitalize font-weight-bold mr-2 hidden-xs-only"
                @click="openAddDialog"
              >
                <v-icon left small>mdi-plus</v-icon>
                Add {{ activeTab === 'workers' ? 'worker' : 'official' }}
              </v-btn>
              <v-avatar color="#8051FF" size="36">
                <span style="color: white;" class="font-weight-bold text-caption">{{ officialInitials }}</span>
              </v-avatar>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <v-container :fluid="nav_bars" class="px-4 px-sm-6 pt-2 pt-sm-4 pb-8">
        <!-- Tabs -->
        <v-row class="mb-4 reveal-card">
          <v-col cols="12">
            <v-tabs
              v-model="activeTab"
              background-color="transparent"
              color="#8051FF"
              class="team-tabs"
              grow
            >
              <v-tab value="workers">
                <v-icon left small>mdi-hammer-wrench</v-icon>
                Workers
                <v-chip
                  x-small
                  label
                  color="purple lighten-5 purple--text"
                  class="ml-2 font-weight-bold"
                >
                  {{ workers.length }}
                </v-chip>
              </v-tab>
              <v-tab value="officials">
                <v-icon left small>mdi-shield-account</v-icon>
                Officials
                <v-chip
                  x-small
                  label
                  color="#f3ffd9"
                  class="ml-2 font-weight-bold"
                  style="color: #4d7c0f;"
                >
                  {{ officials.length }}
                </v-chip>
              </v-tab>
            </v-tabs>
          </v-col>
        </v-row>

        <!-- Loading -->
        <div v-if="loading && !currentList.length" class="pa-4">
          <v-skeleton-loader type="list-item-avatar-two-line, list-item-avatar-two-line, list-item-avatar-two-line" />
        </div>

        <!-- Empty state -->
        <v-row v-else-if="!currentList.length" class="reveal-card">
          <v-col cols="12">
            <v-card class="rounded-2xl pa-12 text-center" elevation="0" outlined>
              <v-avatar color="purple lighten-5" size="72" class="mb-3">
                <v-icon size="44" color="#8051FF">
                  {{ activeTab === 'workers' ? 'mdi-hammer-wrench' : 'mdi-shield-account' }}
                </v-icon>
              </v-avatar>
              <div class="text-h6 grey--text text--darken-2 mt-3">
                No {{ activeTab }} yet
              </div>
              <div class="text-body-2 grey--text mt-1">
                Add the first {{ activeTab === 'workers' ? 'worker (e.g. security, cleaner, gardener)' : 'official (Chairman, Secretary, Treasurer)' }} to this estate.
              </div>
              <v-btn
                rounded
                depressed
                color="#8051FF"
                dark
                class="mt-4 text-capitalize font-weight-bold"
                @click="openAddDialog"
              >
                <v-icon left>mdi-plus</v-icon>
                Add {{ activeTab === 'workers' ? 'worker' : 'official' }}
              </v-btn>
            </v-card>
          </v-col>
        </v-row>

        <!-- Workers list -->
        <v-row v-else-if="activeTab === 'workers'" class="reveal-card">
          <v-col cols="12">
            <v-card class="rounded-2xl" elevation="0" outlined>
              <v-card-title class="px-4 px-sm-6 py-4 card-header-premium d-flex align-center">
                <v-avatar color="purple lighten-5" size="36" class="mr-3">
                  <v-icon color="#8051FF">mdi-hammer-wrench</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold text--primary">
                    {{ workers.length }} worker{{ workers.length === 1 ? '' : 's' }}
                  </div>
                  <div class="text-caption text--secondary">Estate staff and their roles</div>
                </div>
              </v-card-title>
              <v-divider></v-divider>

              <v-list class="pa-0">
                <template v-for="(w, i) in workers">
                  <v-list-item :key="w.worker_id" class="py-3 px-4 px-sm-6">
                    <v-list-item-avatar color="blue lighten-5" size="48">
                      <span class="blue--text text--darken-2 font-weight-bold">
                        {{ initialsOf(w.full_name) }}
                      </span>
                    </v-list-item-avatar>

                    <v-list-item-content>
                      <v-list-item-title class="font-weight-bold text--primary">
                        {{ w.full_name }}
                      </v-list-item-title>
                      <div class="d-flex flex-wrap mt-1" style="gap: 8px;">
                        <v-chip x-small label color="blue lighten-5 blue--text" class="font-weight-medium">
                          <v-icon x-small left>mdi-badge-account-horizontal</v-icon>
                          {{ w.role }}
                        </v-chip>
                        <v-chip x-small label color="grey lighten-3" class="font-weight-medium">
                          <v-icon x-small left>mdi-phone</v-icon>
                          {{ w.contact_number }}
                        </v-chip>
                      </div>
                    </v-list-item-content>

                    <v-list-item-action class="ml-2">
                      <div class="d-flex flex-column" style="gap: 4px;">
                        <v-btn
                          icon
                          small
                          class="action-btn-hover"
                          title="Edit"
                          @click.stop="openEditWorkerDialog(w)"
                        >
                          <v-icon small color="#8051FF">mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn
                          icon
                          small
                          class="action-btn-hover"
                          title="Delete"
                          @click.stop="openDeleteDialog('worker', w)"
                        >
                          <v-icon small color="red">mdi-delete-outline</v-icon>
                        </v-btn>
                      </div>
                    </v-list-item-action>
                  </v-list-item>
                  <v-divider v-if="i < workers.length - 1" :key="`d-${w.worker_id}`" inset></v-divider>
                </template>
              </v-list>
            </v-card>
          </v-col>
        </v-row>

        <!-- Officials list -->
        <v-row v-else class="reveal-card">
          <v-col cols="12">
            <v-card class="rounded-2xl" elevation="0" outlined>
              <v-card-title class="px-4 px-sm-6 py-4 card-header-premium d-flex align-center">
                <v-avatar color="#f3ffd9" size="36" class="mr-3">
                  <v-icon style="color: #4d7c0f;">mdi-shield-account</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold text--primary">
                    {{ officials.length }} official{{ officials.length === 1 ? '' : 's' }}
                  </div>
                  <div class="text-caption text--secondary">
                    Chairman, Secretary, Treasurer
                  </div>
                </div>
              </v-card-title>
              <v-divider></v-divider>

              <v-list class="pa-0">
                <template v-for="(o, i) in officials">
                  <v-list-item :key="o.official_id" class="py-3 px-4 px-sm-6">
                    <v-list-item-avatar color="#f3ffd9" size="48">
                      <span style="color: #4d7c0f; font-weight: 700;">
                        {{ initialsOf(o.full_name) }}
                      </span>
                    </v-list-item-avatar>

                    <v-list-item-content>
                      <div class="d-flex align-center flex-wrap" style="gap: 8px;">
                        <v-list-item-title class="font-weight-bold text--primary">
                          {{ o.full_name }}
                        </v-list-item-title>
                        <v-chip
                          x-small
                          label
                          color="#f3ffd9"
                          class="font-weight-bold"
                          style="color: #4d7c0f;"
                        >
                          <v-icon x-small left style="color: #4d7c0f;">mdi-crown</v-icon>
                          {{ o.role }}
                        </v-chip>
                      </div>
                      <div class="d-flex flex-wrap mt-1" style="gap: 8px;">
                        <v-chip x-small label color="grey lighten-3" class="font-weight-medium">
                          <v-icon x-small left>mdi-phone</v-icon>
                          {{ o.contact_number }}
                        </v-chip>
                        <v-chip x-small label color="grey lighten-3" class="font-weight-medium">
                          <v-icon x-small left>mdi-identifier</v-icon>
                          {{ o.uid }}
                        </v-chip>
                      </div>
                    </v-list-item-content>

                    <v-list-item-action class="ml-2">
                      <div class="d-flex flex-column" style="gap: 4px;">
                        <v-btn
                          icon
                          small
                          class="action-btn-hover"
                          title="Edit"
                          @click.stop="openEditOfficialDialog(o)"
                        >
                          <v-icon small color="#8051FF">mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn
                          icon
                          small
                          class="action-btn-hover"
                          title="Delete"
                          @click.stop="openDeleteDialog('official', o)"
                        >
                          <v-icon small color="red">mdi-delete-outline</v-icon>
                        </v-btn>
                      </div>
                    </v-list-item-action>
                  </v-list-item>
                  <v-divider v-if="i < officials.length - 1" :key="`d-${o.official_id}`" inset></v-divider>
                </template>
              </v-list>
            </v-card>
          </v-col>
        </v-row>

        <!-- Mobile FAB -->
        <v-btn
          v-if="nav_bars"
          fab
          fixed
          bottom
          right
          color="#8051FF"
          dark
          class="elevation-6"
          style="bottom: 84px; right: 20px; z-index: 200;"
          @click="openAddDialog"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-container>

      <!-- ============================================================ -->
      <!-- Add/Edit dialog — SCROLLABLE, appealing                      -->
      <!-- ============================================================ -->
      <v-dialog v-model="formDialog" max-width="520" persistent scrollable>
        <v-card class="dialog-card">
          <!-- Sticky header -->
          <v-card-title class="dialog-header">
            <div class="d-flex align-center" style="width: 100%;">
              <v-btn icon dark @click="closeFormDialog">
                <v-icon>mdi-close</v-icon>
              </v-btn>
              <div class="flex-grow-1 text-center">
                <div class="text-h6 font-weight-bold" style="color: white;">
                  {{ formTitle }}
                </div>
              </div>
              <div style="width: 40px;"></div>
            </div>
          </v-card-title>

          <!-- Scrollable body -->
          <v-card-text class="dialog-body">
            <v-form ref="form" v-model="valid">
              <label class="field-label">Full name</label>
              <v-text-field
                v-model="form.full_name"
                placeholder="e.g. John Kamau"
                outlined
                rounded
                dense
                hide-details="auto"
                class="mb-4"
                :rules="[(v) => !!v || 'Full name is required']"
                required
              />

              <template v-if="formMode === 'worker'">
                <label class="field-label">Role</label>
                <v-select
                  v-model="form.role"
                  :items="workerRoles"
                  placeholder="Select a role"
                  outlined
                  rounded
                  dense
                  hide-details="auto"
                  class="mb-4"
                  :rules="[(v) => !!v || 'Role is required']"
                  required
                />
              </template>

              <template v-else>
                <label class="field-label">Position</label>
                <v-select
                  v-model="form.role"
                  :items="officialRoles"
                  placeholder="Select a position"
                  outlined
                  rounded
                  dense
                  hide-details="auto"
                  class="mb-4"
                  :rules="[(v) => !!v || 'Position is required']"
                  required
                />
              </template>

              <label class="field-label">Contact number</label>
              <v-text-field
                v-model="form.contact_number"
                type="tel"
                placeholder="254712345678"
                outlined
                rounded
                dense
                hide-details="auto"
                class="mb-4"
                :rules="phoneRules"
                required
              />

              <template v-if="formMode === 'official'">
                <label class="field-label">Firebase UID</label>
                <v-text-field
                  v-model="form.uid"
                  placeholder="Firebase account UID (for login)"
                  outlined
                  rounded
                  dense
                  hide-details="auto"
                  class="mb-4"
                  :rules="[(v) => !!v || 'UID is required']"
                  hint="Get this from the resident's Firebase account"
                  persistent-hint
                  required
                />
              </template>
            </v-form>
          </v-card-text>

          <!-- Sticky footer -->
          <v-card-actions class="dialog-footer">
            <v-btn
              text
              rounded
              class="text-capitalize font-weight-medium flex-grow-1"
              @click="closeFormDialog"
              :disabled="submitting"
            >
              Cancel
            </v-btn>
            <v-btn
              rounded
              depressed
              color="#8051FF"
              dark
              class="text-capitalize font-weight-bold flex-grow-1"
              :loading="submitting"
              :disabled="!valid"
              @click="submitForm"
            >
              <v-icon left>mdi-check</v-icon>
              {{ isEditing ? 'Save changes' : 'Add' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ============================================================ -->
      <!-- Delete confirmation                                          -->
      <!-- ============================================================ -->
      <v-dialog v-model="deleteDialog" max-width="440" persistent>
        <v-card class="rounded-2xl pa-2">
          <v-card-text class="text-center pa-6">
            <v-avatar color="red lighten-5" size="64" class="mb-3">
              <v-icon color="red darken-2" size="32">mdi-delete-outline</v-icon>
            </v-avatar>
            <div class="text-h6 font-weight-bold text--primary">
              Remove this {{ deleteType }}?
            </div>
            <div class="text-body-2 text--secondary mt-2">
              <strong>{{ deleteTarget?.full_name }}</strong> — {{ deleteTarget?.role }}
            </div>
            <div class="d-flex mt-5" style="gap: 8px;">
              <v-btn
                block text
                class="text-capitalize font-weight-medium"
                @click="closeDeleteDialog"
                :disabled="submitting"
              >
                Cancel
              </v-btn>
              <v-btn
                block
                rounded
                depressed
                color="red darken-2"
                dark
                class="text-capitalize font-weight-bold"
                :loading="submitting"
                @click="confirmDelete"
              >
                <v-icon left>mdi-delete</v-icon>
                Remove
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
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

      // Form dialog
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

      // Delete dialog
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
    phoneRules() {
      return [
        (v) => !!v || 'Contact number is required',
        (v) => /^(\+?254|0)?[17]\d{8}$/.test((v || '').replace(/\s/g, '')) || 'Enter a valid Kenyan number',
      ];
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
        await Promise.all([
          this.fetchEstate(),
          this.fetchWorkers(),
          this.fetchOfficials(),
        ]);
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
        if (status === 200) that.estate = { estate_name: data.estate_name || '' };
      } catch (error) {
        console.warn('Estate fetch failed:', error.response?.data || error.message);
      }
    },

    async fetchWorkers() {
      const that = this;
      if (!that.estateId) return;
      try {
        const url = `${API}/workers/getWorkerByEstate/${that.estateId}`;
        const { data, status } = await axios.get(url);
        if (status === 200) {
          that.workers = Array.isArray(data) ? data : [];
        }
      } catch (error) {
        try {
          const { data } = await axios.get(`${API}/workers/getAll`);
          const list = Array.isArray(data) ? data : [];
          that.workers = list.filter((w) => Number(w.estate_id) === Number(that.estateId));
        } catch (e) {
          console.warn('Workers fetch failed:', error.response?.data || error.message);
          that.workers = [];
        }
      }
    },

    async fetchOfficials() {
      const that = this;
      if (!that.estateId) return;
      try {
        const url = `${API}/officials/getOfficialByEstateId/${that.estateId}`;
        const { data, status } = await axios.get(url);
        if (status === 200) {
          that.officials = Array.isArray(data) ? data : [];
        }
      } catch (error) {
        console.warn('Officials fetch failed:', error.response?.data || error.message);
        that.officials = [];
      }
    },

    openAddDialog() {
      const mode = this.activeTab === 'workers' ? 'worker' : 'official';
      this.formMode = mode;
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
      const that = this;
      if (!that.$refs.form.validate()) return;
      that.submitting = true;

      try {
        if (that.formMode === 'worker') {
          await that.saveWorker();
        } else {
          await that.saveOfficial();
        }
      } catch (error) {
        console.error('🔴 Save failed:', error.response?.data || error.message);
        that.showSnackbar(error.response?.data?.error || 'Could not save', 'error');
      } finally {
        that.submitting = false;
      }
    },

    async saveWorker() {
      const that = this;
      if (that.isEditing) {
        const url = `${API}/workers/updateWorker/${that.form.id}`;
        const { status } = await axios.put(url, {
          full_name: that.form.full_name,
          role: that.form.role,
          contact_number: that.form.contact_number,
        });
        if (status === 200) {
          that.showSnackbar('Worker updated', 'success');
          that.formDialog = false;
          await that.fetchWorkers();
        }
      } else {
        const url = `${API}/workers/addWorker`;
        const { status } = await axios.post(url, {
          estate_id: that.estateId,
          full_name: that.form.full_name,
          role: that.form.role,
          contact_number: that.form.contact_number,
          uid: that.form.uid || null,
        });
        if (status === 200) {
          that.showSnackbar('Worker added', 'success');
          that.formDialog = false;
          await that.fetchWorkers();
        }
      }
    },

    async saveOfficial() {
      const that = this;
      if (that.isEditing) {
        const url = `${API}/officials/update_official/${that.form.id}`;
        const { status } = await axios.patch(url, {
          full_name: that.form.full_name,
          role: that.form.role,
          contact_number: that.form.contact_number,
        });
        if (status === 200) {
          that.showSnackbar('Official updated', 'success');
          that.formDialog = false;
          await that.fetchOfficials();
        }
      } else {
        const url = `${API}/officials/addOfficial`;
        const { status } = await axios.post(url, {
          estate_id: that.estateId,
          full_name: that.form.full_name,
          role: that.form.role,
          contact_number: that.form.contact_number,
          uid: that.form.uid,
          estate_urn: that.estate.urn || null,
        });
        if (status === 200) {
          that.showSnackbar('Official added', 'success');
          that.formDialog = false;
          await that.fetchOfficials();
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
      const that = this;
      if (!that.deleteTarget) return;
      that.submitting = true;

      try {
        if (that.deleteType === 'worker') {
          const url = `${API}/workers/deleteWorker/${that.deleteTarget.contact_number}`;
          const { status } = await axios.delete(url);
          if (status === 200) {
            that.showSnackbar('Worker removed', 'success');
            that.closeDeleteDialog();
            await that.fetchWorkers();
          }
        } else {
          const url = `${API}/officials/delete_official/${that.deleteTarget.contact_number}`;
          const { status } = await axios.put(url);
          if (status === 200) {
            that.showSnackbar('Official removed', 'success');
            that.closeDeleteDialog();
            await that.fetchOfficials();
          }
        }
      } catch (error) {
        console.error('🔴 Delete failed:', error.response?.data || error.message);
        that.showSnackbar(error.response?.data?.error || 'Could not delete', 'error');
      } finally {
        that.submitting = false;
      }
    },

    initialsOf(name) {
      if (!name) return '?';
      return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
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

.card-header-premium {
  background: linear-gradient(to bottom, #ffffff, #f8fafc);
}

.action-btn-hover { transition: all 0.2s ease; }
.action-btn-hover:hover { background: rgba(128, 81, 255, 0.1); }

.team-tabs {
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
}
.team-tabs ::v-deep .v-tab {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0;
}
.team-tabs ::v-deep .v-tabs-slider {
  border-radius: 2px;
}

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