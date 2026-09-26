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
            <v-icon color="white" size="24">mdi-home-city</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold purple--text brand-text">Makaazi</div>
            <div class="text-caption text--secondary font-weight-medium">Resident Console</div>
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
          <v-list-item-action v-if="item.isAlerts && unreadCount > 0">
            <v-chip x-small color="red" text-color="white" class="font-weight-bold" style="font-size: 10px;">
              {{ unreadCount }}
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
        v-for="item in menuItems"
        :key="item.title"
        @click="goTo(item.route)"
        :value="item.route"
        class="mobile-nav-btn"
      >
        <v-icon size="22">{{ item.icon }}</v-icon>
        <span class="mobile-nav-label">{{ item.title }}</span>
        <v-badge
          v-if="item.isAlerts && unreadCount > 0"
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
                  <h1 class="text-h6 text-sm-h5 font-weight-bold text--primary page-title">
                    Alerts
                  </h1>
                  <div class="d-flex align-center mt-1">
                    <span class="text-caption text--secondary">
                      {{ notifications.length }} total · {{ unreadCount }} unread
                    </span>
                  </div>
                </div>
              </div>
            </v-col>
            <v-col cols="4" sm="6" class="d-flex justify-end align-center">
              <v-btn
                v-if="unreadCount > 0"
                text
                small
                color="#8051FF"
                class="text-capitalize mr-1 font-weight-medium hidden-xs-only"
                :loading="markingAll"
                @click="markAllRead"
              >
                <v-icon left small>mdi-check-all</v-icon>
                Mark all read
              </v-btn>
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
                <v-img :src="avatarUrl" />
              </v-avatar>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <v-container :fluid="nav_bars" class="px-4 px-sm-6 pt-2 pt-sm-4 pb-8">
        <!-- Loading skeleton -->
        <div v-if="loading && !notifications.length" class="pa-4">
          <v-skeleton-loader type="list-item-two-line, list-item-two-line, list-item-two-line" />
        </div>

        <!-- Empty state -->
        <v-row v-else-if="!notifications.length" class="reveal-card">
          <v-col cols="12">
            <v-card class="rounded-2xl pa-12 text-center" elevation="0" outlined>
              <v-icon size="72" color="grey lighten-2">mdi-bell-outline</v-icon>
              <div class="text-h6 grey--text text--darken-1 mt-3">No alerts yet</div>
              <div class="text-body-2 grey--text mt-1">
                Payment updates and account notifications will appear here.
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Notifications list -->
        <v-row v-else class="reveal-card">
          <v-col cols="12">
            <v-card class="rounded-2xl" elevation="0" outlined>
              <v-card-title class="px-4 px-sm-6 py-4 card-header-premium d-flex align-center">
                <v-avatar color="purple lighten-5" size="36" class="mr-3">
                  <v-icon color="#8051FF">mdi-bell-ring</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold text--primary">Your notifications</div>
                  <div class="text-caption text--secondary">Most recent first</div>
                </div>
                <v-spacer></v-spacer>
                <v-btn
                  v-if="unreadCount > 0"
                  text
                  small
                  color="#8051FF"
                  class="text-capitalize font-weight-medium hidden-sm-and-up"
                  :loading="markingAll"
                  @click="markAllRead"
                >
                  <v-icon left small>mdi-check-all</v-icon>
                  All
                </v-btn>
              </v-card-title>
              <v-divider></v-divider>

              <v-list class="pa-0">
                <template v-for="(n, i) in notifications">
                  <v-list-item
                    :key="n.id"
                    class="py-3 px-4 px-sm-6 hover-row"
                    :class="{ 'notification-unread': !isRead(n) }"
                    @click="openNotification(n)"
                  >
                    <v-list-item-avatar :color="avatarColor(n)" size="44">
                      <v-icon :color="avatarIconColor(n)" small>
                        {{ avatarIcon(n) }}
                      </v-icon>
                    </v-list-item-avatar>

                    <v-list-item-content>
                      <v-list-item-title class="font-weight-semibold text--primary">
                        {{ n.title || 'Notification' }}
                      </v-list-item-title>
                      <v-list-item-subtitle
                        class="text-caption text--secondary"
                        style="white-space: normal;"
                      >
                        {{ n.message }}
                      </v-list-item-subtitle>
                      <div class="d-flex align-center mt-1 flex-wrap">
                        <v-icon x-small color="grey" class="mr-1">mdi-clock-outline</v-icon>
                        <span class="text-caption grey--text">
                          {{ formatRelative(n.created_at) }}
                        </span>
                        <v-chip
                          v-if="n.type"
                          x-small
                          label
                          class="ml-2 font-weight-bold"
                          :color="typeChipColor(n.type)"
                          :text-color="typeChipTextColor(n.type)"
                        >
                          {{ n.type }}
                        </v-chip>
                      </div>
                    </v-list-item-content>

                    <v-list-item-action>
                      <div class="d-flex flex-column align-center">
                        <v-icon
                          v-if="!isRead(n)"
                          small
                          color="#8051FF"
                          title="Unread"
                        >
                          mdi-circle
                        </v-icon>
                        <v-btn
                          icon
                          x-small
                          color="grey"
                          title="Delete"
                          class="mt-1"
                          :loading="deletingId === n.id"
                          @click.stop="deleteNotification(n)"
                        >
                          <v-icon x-small>mdi-close</v-icon>
                        </v-btn>
                      </div>
                    </v-list-item-action>
                  </v-list-item>
                  <v-divider
                    v-if="i < notifications.length - 1"
                    :key="`d-${n.id}`"
                    inset
                  ></v-divider>
                </template>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
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
            :color="snackbar.color === 'success' ? 'success darken-2' : snackbar.color === 'info' ? 'info darken-2' : 'error darken-2'"
            size="28"
            class="mr-3"
          >
            <v-icon color="white" small>
              {{ snackbar.color === 'success' ? 'mdi-check' : snackbar.color === 'info' ? 'mdi-information' : 'mdi-alert' }}
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
import moment from 'moment';

const API = 'https://makaaziserver22.up.railway.app/api';

export default {
  name: 'HouseholdNotifications',
  data() {
    return {
      nav_bars: false,
      activeTab: '/household/notifications',

      loading: false,
      markingAll: false,
      deletingId: null,

      uid: null,
      household: { primary_owner: '' },
      notifications: [],

      snackbar: { show: false, text: '', color: 'success' },
    };
  },
  computed: {
    /**
     * ⚡ Dashboard URL matches /household/dashboard/:uid route
     * (folder has _id.vue, so the URL needs the uid).
     */
    dashboardRoute() {
      return this.uid
        ? `/household/dashboard/${this.uid}`
        : '/household/dashboard';
    },
    menuItems() {
      return [
        { title: 'Dashboard', icon: 'mdi-view-dashboard', route: this.dashboardRoute },
        { title: 'Payments',  icon: 'mdi-currency-usd',   route: '/household/payment_summary' },
        { title: 'Profile',   icon: 'mdi-account',        route: '/household/profile' },
        { title: 'Alerts',    icon: 'mdi-bell',           route: '/household/notifications', isAlerts: true },
      ];
    },
    avatarUrl() {
      const name = this.household.primary_owner || 'Resident';
      return `https://ui-avatars.com/api/?background=8051FF&color=fff&name=${encodeURIComponent(name)}`;
    },
    unreadCount() {
      return this.notifications.filter((n) => !this.isRead(n)).length;
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
    // AUTH
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
          that.showSnackbar('Please sign in to view notifications', 'error');
        }
      });
    },

    async refreshAll() {
      if (!this.uid) return;
      this.loading = true;
      await Promise.all([
        this.fetchHousehold(),
        this.fetchNotifications(),
      ]);
      this.loading = false;
    },

    async fetchHousehold() {
      const that = this;
      try {
        const { data, status } = await axios.get(
          `${API}/households/getHouseHoldId/${that.uid}`
        );
        if (status === 200) {
          that.household = { primary_owner: data.primary_owner || '' };
        }
      } catch (error) {
        console.warn('Household fetch failed:', error.response?.data || error.message);
      }
    },

    // =====================================================
    // FETCH — /api/notifications/:uid
    // =====================================================
    async fetchNotifications() {
      const that = this;
      try {
        const url = `${API}/notifications/${that.uid}`;
        console.log('🔵 GET', url);
        const { data, status } = await axios.get(url);
        if (status === 200) {
          that.notifications = Array.isArray(data) ? data : [];
          console.log('🔵 Notifications loaded:', that.notifications.length);
        }
      } catch (error) {
        console.warn('Notifications fetch failed:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        that.notifications = [];
      }
    },

    // =====================================================
    // HELPERS — is_read can be 0/1 or true/false depending on driver
    // =====================================================
    isRead(n) {
      if (!n) return true;
      const v = n.is_read;
      return v === 1 || v === '1' || v === true;
    },

    // =====================================================
    // ACTIONS
    // =====================================================
    async openNotification(n) {
      // Only mark unread ones
      if (this.isRead(n)) return;

      // Optimistic update
      const idx = this.notifications.findIndex((x) => x.id === n.id);
      if (idx !== -1) {
        this.$set(this.notifications, idx, { ...this.notifications[idx], is_read: 1 });
      }

      try {
        await axios.patch(`${API}/notifications/${n.id}/read`);
      } catch (err) {
        console.warn('Mark-read failed:', err.response?.data || err.message);
        // revert on failure
        if (idx !== -1) {
          this.$set(this.notifications, idx, { ...this.notifications[idx], is_read: 0 });
        }
      }
    },

    async markAllRead() {
      const that = this;
      if (that.unreadCount === 0) return;

      that.markingAll = true;

      // Backup for rollback
      const backup = that.notifications.map((n) => ({ ...n }));

      // Optimistic
      that.notifications = that.notifications.map((n) => ({ ...n, is_read: 1 }));

      try {
        // Preferred: single bulk call
        await axios.patch(`${API}/notifications/${that.uid}/read-all`);
        that.showSnackbar('All marked as read', 'success');
      } catch (err) {
        console.warn('Bulk read-all failed, trying per-item:', err.response?.status);

        // Fallback: per-item
        try {
          const unread = backup.filter((n) => !that.isRead(n));
          await Promise.all(
            unread.map((n) => axios.patch(`${API}/notifications/${n.id}/read`))
          );
          that.showSnackbar('All marked as read', 'success');
        } catch (innerErr) {
          console.error('markAllRead failed:', innerErr.response?.data || innerErr.message);
          that.notifications = backup;
          that.showSnackbar('Could not mark all as read', 'error');
        }
      } finally {
        that.markingAll = false;
      }
    },

    async deleteNotification(n) {
      const that = this;
      if (!confirm(`Delete "${n.title || 'this notification'}"?`)) return;

      that.deletingId = n.id;

      // Backup
      const backup = [...that.notifications];

      // Optimistic
      that.notifications = that.notifications.filter((x) => x.id !== n.id);

      try {
        await axios.delete(`${API}/notifications/${n.id}`);
        that.showSnackbar('Deleted', 'success');
      } catch (err) {
        console.error('Delete failed:', err.response?.data || err.message);
        that.notifications = backup;
        that.showSnackbar('Could not delete notification', 'error');
      } finally {
        that.deletingId = null;
      }
    },

    // =====================================================
    // FORMATTERS
    // =====================================================
    formatRelative(d) {
      if (!d) return '';
      try {
        return moment(d).fromNow();
      } catch {
        return '';
      }
    },
    avatarColor(n) {
      const t = n.type || 'SYSTEM';
      if (t === 'PAYMENT') return 'green lighten-5';
      if (t === 'ACCOUNT') return 'blue lighten-5';
      if (t === 'ESTATE') return 'purple lighten-5';
      return 'grey lighten-4';
    },
    avatarIconColor(n) {
      const t = n.type || 'SYSTEM';
      if (t === 'PAYMENT') return 'green darken-2';
      if (t === 'ACCOUNT') return 'blue darken-2';
      if (t === 'ESTATE') return '#8051FF';
      return 'grey darken-2';
    },
    avatarIcon(n) {
      const t = n.type || 'SYSTEM';
      if (t === 'PAYMENT') return 'mdi-cash-check';
      if (t === 'ACCOUNT') return 'mdi-account-check';
      if (t === 'ESTATE') return 'mdi-home-city';
      return 'mdi-bell-outline';
    },
    typeChipColor(t) {
      if (t === 'PAYMENT') return 'green lighten-5';
      if (t === 'ACCOUNT') return 'blue lighten-5';
      if (t === 'ESTATE') return 'purple lighten-5';
      return 'grey lighten-4';
    },
    typeChipTextColor(t) {
      if (t === 'PAYMENT') return 'green darken-2';
      if (t === 'ACCOUNT') return 'blue darken-2';
      if (t === 'ESTATE') return 'purple darken-2';
      return 'grey darken-2';
    },

    showSnackbar(text, color = 'success') {
      this.snackbar = { show: true, text, color };
    },
    logout() {
      if (this.$fire?.auth) this.$fire.auth.signOut();
      this.$router.push('/login');
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

.hover-row { transition: background-color 0.2s ease; }
.hover-row:hover { background-color: #f8fafc !important; }

.notification-unread {
  border-left: 3px solid #8051FF;
  background: rgba(128, 81, 255, 0.02);
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