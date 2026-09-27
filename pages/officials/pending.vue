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
          <v-list-item-action v-if="item.badge && item.badge > 0">
            <div class="nav-badge">{{ item.badge > 99 ? '99+' : item.badge }}</div>
          </v-list-item-action>
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
        <span
          v-if="item.badge && item.badge > 0"
          class="mobile-badge"
        >{{ item.badge > 9 ? '9+' : item.badge }}</span>
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
                    <v-icon
                      x-small
                      :color="pending.length > 0 ? 'amber darken-2' : 'success'"
                      class="mr-1"
                    >mdi-circle</v-icon>
                    <span class="text-caption text--secondary">
                      {{ pending.length > 0 ? 'Registrations awaiting review' : 'All caught up' }}
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
        <!-- ============================================================
             INFO BANNER
             ============================================================ -->
        <transition name="hint-fade">
          <div v-if="pending.length > 0" class="info-banner reveal-card">
            <div class="info-icon">
              <v-icon size="20" color="white">mdi-account-clock</v-icon>
            </div>
            <div class="info-body">
              <div class="info-title">
                {{ pending.length }} registration{{ pending.length === 1 ? '' : 's' }} awaiting review
              </div>
              <div class="info-sub">
                Approve to activate the household, or reject with a reason.
              </div>
            </div>
          </div>
        </transition>

        <!-- ============================================================
             LOADING
             ============================================================ -->
        <div v-if="loading && !pending.length" class="panel-card reveal-card">
          <div class="pa-6">
            <v-skeleton-loader
              type="list-item-avatar-three-line, list-item-avatar-three-line, list-item-avatar-three-line"
            />
          </div>
        </div>

        <!-- ============================================================
             EMPTY STATE
             ============================================================ -->
        <div v-else-if="!pending.length" class="panel-card reveal-card">
          <div class="empty-block">
            <div class="empty-icon empty-icon-green">
              <v-icon size="40" color="#10b981">mdi-check-all</v-icon>
            </div>
            <div class="empty-title">All caught up!</div>
            <div class="empty-sub">
              No pending household registrations for your estate.
            </div>
            <button class="empty-refresh-btn" @click="refreshAll">
              <v-icon size="14" class="mr-1">mdi-refresh</v-icon>
              Check again
            </button>
          </div>
        </div>

        <!-- ============================================================
             PENDING LIST
             ============================================================ -->
        <div v-else class="reveal-card">
          <div class="list-head">
            <div class="panel-icon panel-icon-purple panel-icon-sm">
              <v-icon size="18" color="white">mdi-account-clock</v-icon>
            </div>
            <div class="panel-title-group">
              <div class="panel-title">Awaiting your review</div>
              <div class="panel-sub">Newest first</div>
            </div>
            <div class="count-pill">{{ pending.length }}</div>
          </div>

          <div class="pending-list">
            <div
              v-for="h in pending"
              :key="h.household_id"
              class="pending-card"
            >
              <!-- Header -->
              <div class="pending-head">
                <div class="pending-avatar">
                  {{ initialsOf(h.primary_owner) }}
                </div>
                <div class="pending-info">
                  <div class="pending-name">{{ h.primary_owner }}</div>
                  <div class="pending-addr">
                    <span class="addr-chip addr-chip-house">
                      <v-icon size="11">mdi-home</v-icon>
                      {{ h.house_number || 'No #' }}
                    </span>
                    <span v-if="h.section" class="addr-chip addr-chip-purple">{{ h.section }}</span>
                    <span v-if="h.court" class="addr-chip addr-chip-blue">{{ h.court }}</span>
                    <span v-if="h.street" class="addr-chip addr-chip-green">{{ h.street }}</span>
                  </div>
                </div>
                <div class="pending-age">
                  <v-icon size="12" color="#94a3b8">mdi-clock-outline</v-icon>
                  {{ formatRelative(h.created_at) }}
                </div>
              </div>

              <!-- Meta row -->
              <div class="pending-meta">
                <div class="meta-item">
                  <v-icon size="14" color="#94a3b8">mdi-phone-outline</v-icon>
                  <span>{{ h.contact_number || '—' }}</span>
                </div>
                <div v-if="h.residence_status" class="meta-item">
                  <v-icon size="14" color="#94a3b8">mdi-account-switch-outline</v-icon>
                  <span>{{ h.residence_status }}</span>
                </div>
                <div v-if="h.take_on_balance > 0" class="meta-item meta-item-amber">
                  <v-icon size="14" color="#b45309">mdi-cash</v-icon>
                  <span>B/F KES {{ formatNum(h.take_on_balance) }}</span>
                </div>
                <div v-if="h.caretaker_name" class="meta-item">
                  <v-icon size="14" color="#94a3b8">mdi-account-tie-outline</v-icon>
                  <span>
                    Caretaker: <strong>{{ h.caretaker_name }}</strong>
                    <span v-if="h.caretaker_contact"> · {{ h.caretaker_contact }}</span>
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="pending-actions">
                <button
                  class="pending-action pending-action-approve"
                  :disabled="!!approvingId || !!rejectingId"
                  @click="approve(h)"
                >
                  <v-icon
                    size="16"
                    :class="{ spin: approvingId === h.household_id }"
                  >
                    {{ approvingId === h.household_id ? 'mdi-loading' : 'mdi-check' }}
                  </v-icon>
                  {{ approvingId === h.household_id ? 'Approving…' : 'Approve' }}
                </button>
                <button
                  class="pending-action pending-action-reject"
                  :disabled="!!approvingId || !!rejectingId"
                  @click="openReject(h)"
                >
                  <v-icon size="16">mdi-close</v-icon>
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </v-container>

      <!-- ============================================================
           REJECT DIALOG
           ============================================================ -->
      <v-dialog v-model="rejectDialog" max-width="480" persistent>
        <div class="dialog-card">
          <div class="dialog-header dialog-header-reject">
            <div class="dialog-header-icon">
              <v-icon color="white" size="20">mdi-close-circle-outline</v-icon>
            </div>
            <div class="flex-grow-1">
              <div class="dialog-title">Reject this registration?</div>
              <div class="dialog-sub">{{ rejectTarget?.primary_owner }}</div>
            </div>
            <button class="dialog-close" @click="closeReject">
              <v-icon size="18" color="white">mdi-close</v-icon>
            </button>
          </div>

          <div class="dialog-body">
            <label class="field-label">
              Reason for rejection
              <span class="required">*</span>
            </label>
            <textarea
              v-model="rejectionReason"
              class="field-textarea"
              rows="3"
              placeholder="e.g. This unit is not registered at this estate"
              maxlength="255"
            ></textarea>
            <div class="field-hint">
              {{ rejectionReason.length }}/255 · Required
            </div>
          </div>

          <div class="dialog-actions">
            <button
              class="dialog-cancel"
              :disabled="!!rejectingId"
              @click="closeReject"
            >
              Cancel
            </button>
            <button
              class="dialog-proceed dialog-proceed-danger"
              :disabled="!rejectionReason.trim() || !!rejectingId"
              @click="confirmReject"
            >
              <v-icon
                size="14"
                :class="['mr-1', { spin: !!rejectingId }]"
              >
                {{ rejectingId ? 'mdi-loading' : 'mdi-close' }}
              </v-icon>
              {{ rejectingId ? 'Rejecting…' : 'Reject' }}
            </button>
          </div>
        </div>
      </v-dialog>

      <!-- ============================================================
           SUCCESS DIALOG
           ============================================================ -->
      <v-dialog v-model="successDialog" max-width="420" persistent>
        <div class="dialog-card dialog-card-success">
          <div class="success-icon-wrap">
            <v-icon size="40" color="#22c55e">mdi-check-circle</v-icon>
          </div>
          <div class="success-title">Household approved</div>
          <div class="success-msg">{{ successMessage }}</div>
          <button class="success-btn" @click="successDialog = false">
            Done
          </button>
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

    async fetchOfficial() {
      try {
        const url = `${API}/officials/getOfficialById/${this.uid}`;
        const { data, status } = await axios.get(url);
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
        this.showSnackbar('Could not load your official profile', 'error');
      }
    },

    async fetchPending() {
      if (!this.estateId) return;
      try {
        const url = `${API}/households/estate/${this.estateId}/pending`;
        const { data, status } = await axios.get(url);
        if (status === 200) {
          const list = Array.isArray(data) ? data : [];
          this.pending = list.sort(
            (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
          );
        }
      } catch (error) {
        console.error('Pending fetch failed:', error.response?.data || error.message);
        this.pending = [];
      }
    },

    // =====================================================
    // APPROVE
    // =====================================================
    async approve(h) {
      this.approvingId = h.household_id;

      try {
        const url = `${API}/households/${h.household_id}/approve`;
        const { status } = await axios.post(url, {
          official_uid: this.uid,
        });

        if (status === 200) {
          this.pending = this.pending.filter(
            (p) => p.household_id !== h.household_id
          );
          this.successMessage = `${h.primary_owner} has been approved and can now access their dashboard.`;
          this.successDialog = true;
        }
      } catch (error) {
        console.error('Approve failed:', error.response?.data || error.message);
        this.showSnackbar(
          error.response?.data?.error || 'Could not approve this household',
          'error'
        );
      } finally {
        this.approvingId = null;
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
      if (!this.rejectTarget) return;
      if (!this.rejectionReason.trim()) {
        this.showSnackbar('Please provide a reason', 'warning');
        return;
      }

      const h = this.rejectTarget;
      this.rejectingId = h.household_id;

      try {
        const url = `${API}/households/${h.household_id}/reject`;
        const { status } = await axios.post(url, {
          official_uid: this.uid,
          reason: this.rejectionReason.trim(),
        });

        if (status === 200) {
          this.pending = this.pending.filter(
            (p) => p.household_id !== h.household_id
          );
          this.showSnackbar(`${h.primary_owner}'s registration was rejected`, 'warning');
          this.closeReject();
        }
      } catch (error) {
        console.error('Reject failed:', error.response?.data || error.message);
        this.showSnackbar(
          error.response?.data?.error || 'Could not reject this household',
          'error'
        );
      } finally {
        this.rejectingId = null;
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

.nav-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
  color: #ffffff;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  box-shadow: 0 4px 10px -4px rgba(220, 38, 38, 0.6);
}

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
   INFO BANNER
   ============================================================ */
.info-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 18px;
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  border: 1px solid #fed7aa;
  margin-bottom: 16px;
}
.info-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 10px 22px -10px rgba(245, 158, 11, 0.7);
}
.info-body { flex: 1; min-width: 0; }
.info-title {
  font-size: 0.88rem;
  font-weight: 800;
  color: #7c2d12;
  letter-spacing: -0.2px;
}
.info-sub {
  font-size: 0.76rem;
  color: #92400e;
  margin-top: 3px;
  font-weight: 500;
  line-height: 1.5;
}

.hint-fade-enter-active,
.hint-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.hint-fade-enter,
.hint-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ============================================================
   PANEL / LIST HEAD
   ============================================================ */
.panel-card {
  background: #ffffff;
  border: 1px solid #eef1f6;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.03);
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
.count-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(128, 81, 255, 0.1);
  color: #8051ff;
  font-size: 0.72rem;
  font-weight: 800;
}

.list-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid #f1f5f9;
}

/* ============================================================
   PENDING CARDS
   ============================================================ */
.pending-list {
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 10px;
}
.pending-card {
  background: #ffffff;
  border: 1px solid #eef1f6;
  border-radius: 18px;
  padding: 16px 18px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.pending-card:hover {
  border-color: rgba(128, 81, 255, 0.3);
  box-shadow: 0 12px 26px -16px rgba(128, 81, 255, 0.35);
}

.pending-head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 12px;
}
.pending-avatar {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.65);
}
.pending-info { flex: 1; min-width: 0; }
.pending-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pending-addr {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}
.addr-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}
.addr-chip-house  { background: #f1f5f9; color: #475569; }
.addr-chip-purple { background: rgba(128, 81, 255, 0.12); color: #6d28d9; }
.addr-chip-blue   { background: rgba(59, 130, 246, 0.12); color: #1d4ed8; }
.addr-chip-green  { background: rgba(122, 184, 0, 0.14); color: #3f6b00; }

.pending-age {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  color: #94a3b8;
  font-weight: 700;
  letter-spacing: 0.2px;
  flex-shrink: 0;
}

.pending-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
}
.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.74rem;
  color: #64748b;
  font-weight: 600;
}
.meta-item-amber { color: #b45309; }

.pending-actions {
  display: flex;
  gap: 8px;
}
.pending-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.2px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}
.pending-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pending-action-approve {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: #ffffff;
  box-shadow: 0 10px 22px -12px rgba(34, 197, 94, 0.7);
}
.pending-action-approve:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px -12px rgba(34, 197, 94, 0.85);
}

.pending-action-reject {
  background: #ffffff;
  color: #dc2626;
  border: 1px solid #fecaca;
}
.pending-action-reject:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.08);
  border-color: #ef4444;
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
.empty-icon-green { background: rgba(34, 197, 94, 0.1); }
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
.empty-refresh-btn {
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
.empty-refresh-btn:hover {
  background: rgba(128, 81, 255, 0.14);
  border-color: rgba(128, 81, 255, 0.35);
}

/* ============================================================
   DIALOG
   ============================================================ */
.dialog-card {
  background: #ffffff;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 24px 60px -20px rgba(15, 13, 36, 0.4);
}
.dialog-card-success {
  padding: 28px 24px;
  text-align: center;
}
.dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  color: #ffffff;
  position: relative;
  overflow: hidden;
}
.dialog-header-reject {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
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
.dialog-title {
  font-size: 0.95rem;
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
  padding: 20px 22px 6px;
}
.field-label {
  display: inline-flex;
  gap: 6px;
  font-size: 0.68rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  margin-bottom: 8px;
}
.required { color: #dc2626; font-weight: 800; }
.field-textarea {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px solid #eef1f6;
  background: #f8fafc;
  font-size: 0.85rem;
  font-weight: 500;
  color: #0f0d24;
  outline: none;
  font-family: inherit;
  resize: vertical;
  min-height: 88px;
  transition: all 0.2s ease;
}
.field-textarea:focus {
  border-color: #dc2626;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}
.field-textarea::placeholder { color: #94a3b8; }
.field-hint {
  font-size: 0.68rem;
  color: #94a3b8;
  margin-top: 6px;
  font-weight: 600;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 22px 20px;
  border-top: 1px solid #f1f5f9;
  margin-top: 14px;
}
.dialog-cancel {
  padding: 10px 20px;
  border-radius: 999px;
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  cursor: pointer;
  font-family: inherit;
  text-transform: uppercase;
}
.dialog-cancel:hover:not(:disabled) { background: #f8fafc; }
.dialog-cancel:disabled { opacity: 0.5; cursor: not-allowed; }

.dialog-proceed {
  padding: 10px 20px;
  border-radius: 999px;
  border: none;
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  cursor: pointer;
  font-family: inherit;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s ease;
}
.dialog-proceed-danger {
  background: #dc2626;
  box-shadow: 0 10px 24px -12px rgba(220, 38, 38, 0.7);
}
.dialog-proceed-danger:hover:not(:disabled) { background: #b91c1c; }
.dialog-proceed:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
}

/* Success dialog */
.success-icon-wrap {
  width: 76px;
  height: 76px;
  border-radius: 22px;
  background: rgba(34, 197, 94, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18px;
}
.success-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.4px;
}
.success-msg {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 8px;
  line-height: 1.55;
}
.success-btn {
  width: 100%;
  margin-top: 22px;
  padding: 14px 20px;
  border-radius: 14px;
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  box-shadow: 0 12px 24px -12px rgba(128, 81, 255, 0.7);
}
.success-btn:hover { transform: translateY(-1px); }

/* ============================================================
   SNACKBAR + MOBILE NAV
   ============================================================ */
.snackbar-premium ::v-deep .v-snackbar__content { padding: 12px 20px; }

.bottom-nav-premium {
  border-top: 1px solid #eef1f6 !important;
  background: rgba(255, 255, 255, 0.96) !important;
  backdrop-filter: blur(14px);
}
.mobile-nav-btn { min-width: 0 !important; position: relative; }
.mobile-nav-label { font-size: 10px; margin-top: 2px; font-weight: 700; }
.mobile-badge {
  position: absolute;
  top: 6px;
  right: calc(50% - 22px);
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: #dc2626;
  color: #ffffff;
  font-size: 0.55rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 767px) {
  .pending-head {
    flex-wrap: wrap;
  }
  .pending-age {
    flex: 1 0 100%;
    margin-top: 4px;
  }
  .pending-card { padding: 14px; }
  .pending-avatar { width: 42px; height: 42px; }
  .pending-actions { flex-wrap: wrap; }
  .pending-action { flex: 1; justify-content: center; }
  .info-banner { padding: 12px 14px; gap: 12px; }
  .info-icon { width: 38px; height: 38px; }
  .info-title { font-size: 0.82rem; }
  .info-sub { font-size: 0.72rem; }
  .dialog-body { padding: 16px 18px 4px; }
  .dialog-actions { padding: 14px 18px 16px; }
}

@media (max-width: 599px) {
  .sticky-header-premium { padding-left: 12px; padding-right: 12px; }
  .reveal-card { animation-duration: 0.4s; }
}
</style>