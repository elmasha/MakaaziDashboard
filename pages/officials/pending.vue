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
          <v-list-item-action v-if="item.badge && item.badge > 0">
            <v-chip x-small color="red" text-color="white" class="font-weight-bold" style="font-size: 10px;">
              {{ item.badge }}
            </v-chip>
          </v-list-item-action>
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
        <v-badge
          v-if="item.badge && item.badge > 0"
          color="red"
          dot
          overlap
          offset-x="8"
          offset-y="4"
        ></v-badge>
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
                      Pending Approvals
                    </h1>
                    <v-chip
                      x-small
                      label
                      :color="pending.length > 0 ? 'red lighten-5' : 'green lighten-5'"
                      :text-color="pending.length > 0 ? 'red darken-2' : 'green darken-2'"
                      class="ml-2 font-weight-bold hidden-xs-only"
                    >
                      {{ pending.length }}
                    </v-chip>
                  </div>
                  <div class="d-flex align-center mt-1">
                    <span class="text-caption text--secondary">
                      Review new household registrations
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
              <v-avatar color="#8051FF" size="36">
                <span class="white--text font-weight-bold text-caption">{{ officialInitials }}</span>
              </v-avatar>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <v-container :fluid="nav_bars" class="px-4 px-sm-6 pt-2 pt-sm-4 pb-8">
        <!-- Info banner -->
        <v-row class="mb-4 reveal-card" v-if="pending.length > 0">
          <v-col cols="12">
            <v-card color="#fff3e0" class="rounded-2xl pa-4" elevation="0">
              <div class="d-flex align-center">
                <v-avatar color="#ef6c00" size="40" class="mr-3">
                  <v-icon color="white" small>mdi-account-clock</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="font-weight-bold" style="color: #e65100;">
                    {{ pending.length }} registration{{ pending.length === 1 ? '' : 's' }} awaiting review
                  </div>
                  <div class="text-caption" style="color: #bf360c;">
                    Approve to activate the household, or reject with a reason.
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Loading skeleton -->
        <div v-if="loading && !pending.length" class="pa-4">
          <v-skeleton-loader
            type="list-item-avatar-three-line, list-item-avatar-three-line, list-item-avatar-three-line"
          />
        </div>

        <!-- Empty state -->
        <v-row v-else-if="!pending.length" class="reveal-card">
          <v-col cols="12">
            <v-card class="rounded-2xl pa-12 text-center" elevation="0" outlined>
              <v-avatar color="green lighten-5" size="72" class="mb-3">
                <v-icon size="44" color="green darken-2">mdi-check-all</v-icon>
              </v-avatar>
              <div class="text-h6 grey--text text--darken-2 mt-3">
                All caught up!
              </div>
              <div class="text-body-2 grey--text mt-1">
                No pending household registrations for your estate.
              </div>
              <v-btn
                text
                small
                color="#8051FF"
                class="mt-4 text-capitalize font-weight-medium"
                @click="refreshAll"
              >
                <v-icon left small>mdi-refresh</v-icon>
                Check again
              </v-btn>
            </v-card>
          </v-col>
        </v-row>

        <!-- Pending list -->
        <v-row v-else class="reveal-card">
          <v-col cols="12">
            <v-card class="rounded-2xl" elevation="0" outlined>
              <v-card-title class="px-4 px-sm-6 py-4 card-header-premium d-flex align-center">
                <v-avatar color="purple lighten-5" size="36" class="mr-3">
                  <v-icon color="#8051FF">mdi-account-clock</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold text--primary">Awaiting your review</div>
                  <div class="text-caption text--secondary">Newest first</div>
                </div>
              </v-card-title>
              <v-divider></v-divider>

              <v-list class="pa-0">
                <template v-for="(h, i) in pending">
                  <v-list-item
                    :key="h.household_id"
                    class="py-4 px-4 px-sm-6"
                    style="align-items: flex-start;"
                  >
                    <v-list-item-avatar color="#8051FF" size="48" class="mt-1">
                      <span class="white--text font-weight-bold">
                        {{ initialsOf(h.primary_owner) }}
                      </span>
                    </v-list-item-avatar>

                    <v-list-item-content>
                      <v-list-item-title class="font-weight-bold text--primary" style="font-size: 1rem;">
                        {{ h.primary_owner }}
                      </v-list-item-title>

                      <div class="d-flex flex-wrap align-center mt-1" style="gap: 8px;">
                        <v-chip x-small label color="grey lighten-3" class="font-weight-medium">
                          <v-icon x-small left>mdi-home</v-icon>
                          {{ h.house_number || 'No #' }}
                        </v-chip>
                        <v-chip x-small label color="purple lighten-5 purple--text" class="font-weight-medium">
                          {{ h.section }}
                        </v-chip>
                        <v-chip x-small label color="blue lighten-5 blue--text" class="font-weight-medium">
                          {{ h.court }}
                        </v-chip>
                        <v-chip x-small label color="green lighten-5 green--text" class="font-weight-medium">
                          {{ h.street }}
                        </v-chip>
                      </div>

                      <div class="d-flex flex-wrap mt-2" style="gap: 12px;">
                        <div class="d-flex align-center">
                          <v-icon x-small color="grey" class="mr-1">mdi-phone</v-icon>
                          <span class="text-caption grey--text text--darken-1">
                            {{ h.contact_number }}
                          </span>
                        </div>
                        <div class="d-flex align-center" v-if="h.residence_status">
                          <v-icon x-small color="grey" class="mr-1">mdi-account-switch</v-icon>
                          <span class="text-caption grey--text text--darken-1">
                            {{ h.residence_status }}
                          </span>
                        </div>
                        <div class="d-flex align-center" v-if="h.take_on_balance > 0">
                          <v-icon x-small color="grey" class="mr-1">mdi-cash</v-icon>
                          <span class="text-caption grey--text text--darken-1">
                            B/F KES {{ formatNum(h.take_on_balance) }}
                          </span>
                        </div>
                        <div class="d-flex align-center" v-if="h.created_at">
                          <v-icon x-small color="grey" class="mr-1">mdi-clock-outline</v-icon>
                          <span class="text-caption grey--text text--darken-1">
                            {{ formatRelative(h.created_at) }}
                          </span>
                        </div>
                      </div>

                      <div v-if="h.caretaker_name" class="mt-2">
                        <span class="text-caption grey--text">
                          Caretaker: <strong>{{ h.caretaker_name }}</strong>
                          <span v-if="h.caretaker_contact"> · {{ h.caretaker_contact }}</span>
                        </span>
                      </div>

                      <div class="d-flex mt-3" style="gap: 8px;">
                        <v-btn
                          small
                          rounded
                          depressed
                          color="green darken-2"
                          dark
                          class="text-capitalize font-weight-bold"
                          :loading="approvingId === h.household_id"
                          :disabled="!!approvingId || !!rejectingId"
                          @click="approve(h)"
                        >
                          <v-icon left small>mdi-check</v-icon>
                          Approve
                        </v-btn>
                        <v-btn
                          small
                          rounded
                          outlined
                          color="red darken-2"
                          class="text-capitalize font-weight-medium"
                          :disabled="!!approvingId || !!rejectingId"
                          @click="openReject(h)"
                        >
                          <v-icon left small>mdi-close</v-icon>
                          Reject
                        </v-btn>
                      </div>
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider v-if="i < pending.length - 1" :key="`d-${h.household_id}`" inset></v-divider>
                </template>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- Reject dialog -->
      <v-dialog v-model="rejectDialog" max-width="460" persistent>
        <v-card class="rounded-2xl pa-2">
          <v-card-text class="pa-6">
            <div class="text-center mb-4">
              <v-avatar color="red lighten-5" size="64" class="mb-3">
                <v-icon color="red darken-2" size="32">mdi-close-circle-outline</v-icon>
              </v-avatar>
              <div class="text-h6 font-weight-bold grey--text text--darken-3">
                Reject this registration?
              </div>
              <div class="text-caption grey--text mt-1">
                {{ rejectTarget?.primary_owner }}
              </div>
            </div>

            <v-textarea
              v-model="rejectionReason"
              label="Reason for rejection *"
              placeholder="e.g. This unit is not registered at this estate"
              outlined
              rounded
              rows="3"
              hide-details
              class="mb-3"
              :rules="[v => !!v || 'Reason is required']"
              counter="255"
              maxlength="255"
              auto-grow
            />

            <div class="d-flex" style="gap: 8px;">
              <v-btn
                block
                text
                class="text-capitalize font-weight-medium"
                @click="closeReject"
                :disabled="!!rejectingId"
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
                :loading="!!rejectingId"
                :disabled="!rejectionReason.trim()"
                @click="confirmReject"
              >
                <v-icon left small>mdi-close</v-icon>
                Reject
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- Approve success dialog -->
      <v-dialog v-model="successDialog" max-width="420" persistent>
        <v-card class="rounded-2xl pa-2">
          <v-card-text class="text-center pa-6">
            <v-avatar color="success lighten-5" size="72" class="mb-3">
              <v-icon color="success" size="40">mdi-check-circle</v-icon>
            </v-avatar>
            <div class="text-h6 font-weight-bold text--primary">
              Household approved
            </div>
            <div class="text-body-2 text--secondary mt-2">
              {{ successMessage }}
            </div>
            <v-btn
              block
              rounded
              large
              color="#8051FF"
              dark
              elevation="0"
              class="mt-5 text-capitalize"
              @click="successDialog = false"
            >
              Done
            </v-btn>
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
          <v-avatar :color="snackbar.color === 'success' ? 'success darken-2' : snackbar.color === 'warning' ? 'warning darken-2' : 'error darken-2'" size="28" class="mr-3">
            <v-icon color="white" small>{{ snackbar.color === 'success' ? 'mdi-check' : snackbar.color === 'warning' ? 'mdi-alert' : 'mdi-close' }}</v-icon>
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
  name: 'OfficialPending',
  data() {
    return {
      nav_bars: false,
      activeTab: '/officials/pending',

      loading: false,
      uid: null,
      estateId: null,
      official: { full_name: '', role: '', estate_id: null },

      pending: [],
      approvingId: null,
      rejectingId: null,

      // Reject dialog
      rejectDialog: false,
      rejectTarget: null,
      rejectionReason: '',

      // Success dialog
      successDialog: false,
      successMessage: '',

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
        { title: 'Pending',   icon: 'mdi-account-clock',  route: '/officials/pending',   badge: this.pending.length },
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
        { title: 'Pending',   icon: 'mdi-account-clock',  route: '/officials/pending', badge: this.pending.length },
        { title: 'Payments',  icon: 'mdi-currency-usd',   route: '/officials/payments' },
        { title: 'Settings',  icon: 'mdi-cog',            route: '/officials/settings' },
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
        await this.fetchPending();
      }
      this.loading = false;
    },

    // =====================================================
    // FETCH OFFICIAL
    // =====================================================
    async fetchOfficial() {
      const that = this;
      try {
        const url = `${API}/officials/getOfficialById/${that.uid}`;
        const { data, status } = await axios.get(url);
        if (status === 200) {
          that.official = {
            full_name: data.full_name || '',
            role: data.role || '',
            estate_id: data.estate_id || null,
          };
          that.estateId = data.estate_id;
          console.log('🔵 Official loaded, estate:', that.estateId);
        }
      } catch (error) {
        console.error('🔴 Official fetch failed:', error.response?.data || error.message);
        that.showSnackbar('Could not load your official profile', 'error');
      }
    },

    // =====================================================
    // FETCH PENDING
    // =====================================================
    async fetchPending() {
      const that = this;
      if (!that.estateId) return;
      try {
        const url = `${API}/households/estate/${that.estateId}/pending`;
        console.log('🔵 GET', url);
        const { data, status } = await axios.get(url);
        if (status === 200) {
          const list = Array.isArray(data) ? data : [];
          // Sort newest first
          that.pending = list.sort(
            (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
          );
          console.log('🔵 Pending loaded:', that.pending.length);
        }
      } catch (error) {
        console.error('🔴 Pending fetch failed:', error.response?.data || error.message);
        that.pending = [];
      }
    },

    // =====================================================
    // APPROVE
    // =====================================================
    async approve(h) {
      const that = this;
      that.approvingId = h.household_id;

      try {
        const url = `${API}/households/${h.household_id}/approve`;
        console.log('🔵 POST', url);

        const { data, status } = await axios.post(url, {
          official_uid: that.uid,
        });

        if (status === 200) {
          // Remove from local list
          that.pending = that.pending.filter(
            (p) => p.household_id !== h.household_id
          );

          that.successMessage = `${h.primary_owner} has been approved and can now access their dashboard.`;
          that.successDialog = true;
          console.log('✅ Approved:', h.household_id);
        }
      } catch (error) {
        console.error('🔴 Approve failed:', error.response?.data || error.message);
        that.showSnackbar(
          error.response?.data?.error || 'Could not approve this household',
          'error'
        );
      } finally {
        that.approvingId = null;
      }
    },

    // =====================================================
    // REJECT
    // =====================================================
    openReject(h) {
      this.rejectTarget = h;
      this.rejectionReason = '';
      this.rejectDialog = true;
    },

    closeReject() {
      this.rejectDialog = false;
      this.rejectTarget = null;
      this.rejectionReason = '';
    },

    async confirmReject() {
      const that = this;
      if (!that.rejectTarget) return;
      if (!that.rejectionReason.trim()) {
        that.showSnackbar('Please provide a reason', 'warning');
        return;
      }

      const h = that.rejectTarget;
      that.rejectingId = h.household_id;

      try {
        const url = `${API}/households/${h.household_id}/reject`;
        console.log('🔵 POST', url);

        const { status } = await axios.post(url, {
          official_uid: that.uid,
          reason: that.rejectionReason.trim(),
        });

        if (status === 200) {
          that.pending = that.pending.filter(
            (p) => p.household_id !== h.household_id
          );
          that.showSnackbar(`${h.primary_owner}'s registration was rejected`, 'warning');
          that.closeReject();
        }
      } catch (error) {
        console.error('🔴 Reject failed:', error.response?.data || error.message);
        that.showSnackbar(
          error.response?.data?.error || 'Could not reject this household',
          'error'
        );
      } finally {
        that.rejectingId = null;
      }
    },

    // =====================================================
    // HELPERS
    // =====================================================
    initialsOf(name) {
      if (!name) return '?';
      return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    },
    formatNum(n) {
      return numeral(n || 0).format('0,0');
    },
    formatRelative(d) {
      if (!d) return '';
      try {
        return moment(d).fromNow();
      } catch {
        return '';
      }
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

.card-header-premium {
  background: linear-gradient(to bottom, #ffffff, #f8fafc);
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