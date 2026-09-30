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
          <v-list-item-action v-if="item.isAlerts && unreadCount > 0">
            <div class="nav-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</div>
          </v-list-item-action>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-4 pb-6">
          <div class="help-card mb-4">
            <v-icon color="#8051FF" size="22" class="mb-2">mdi-lifebuoy</v-icon>
            <div class="help-title">Questions?</div>
            <div class="help-sub">Contact your estate office</div>
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
        v-for="item in menuItems"
        :key="item.title"
        @click="goTo(item.route)"
        :value="item.route"
        class="mobile-nav-btn"
      >
        <v-icon size="22">{{ item.icon }}</v-icon>
        <span class="mobile-nav-label">{{ item.title }}</span>
        <span
          v-if="item.isAlerts && unreadCount > 0"
          class="mobile-badge"
        >{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
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
                      Alerts
                    </h1>
                    <v-chip
                      v-if="unreadCount > 0"
                      x-small
                      color="#8051FF"
                      text-color="white"
                      class="ml-2 font-weight-bold"
                      label
                    >
                      {{ unreadCount }} new
                    </v-chip>
                  </div>
                  <div class="d-flex align-center mt-1">
                    <v-icon
                      x-small
                      :color="unreadCount > 0 ? 'amber darken-2' : 'success'"
                      class="mr-1"
                    >mdi-circle</v-icon>
                    <span class="text-caption text--secondary">
                      {{ notifications.length }} total
                      <template v-if="unreadCount > 0"> · {{ unreadCount }} unread</template>
                    </span>
                  </div>
                </div>
              </div>
            </v-col>
            <v-col cols="4" sm="6" class="d-flex justify-end align-center">
              <button
                v-if="unreadCount > 0"
                class="mark-all-btn hidden-xs-only"
                :disabled="markingAll"
                @click="markAllRead"
              >
                <v-icon size="16" class="mr-1">
                  {{ markingAll ? 'mdi-loading spin' : 'mdi-check-all' }}
                </v-icon>
                <span>Mark all read</span>
              </button>
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
                <v-img :src="avatarUrl" />
              </v-avatar>
            </v-col>
          </v-row>

          <!-- Mobile: mark-all row -->
          <div v-if="nav_bars && unreadCount > 0" class="mt-3">
            <button
              class="mark-all-btn mark-all-btn-mobile"
              :disabled="markingAll"
              @click="markAllRead"
            >
              <v-icon size="16" class="mr-1">
                {{ markingAll ? 'mdi-loading spin' : 'mdi-check-all' }}
              </v-icon>
              <span>Mark all {{ unreadCount }} as read</span>
            </button>
          </div>
        </v-container>
      </div>

      <v-container :fluid="nav_bars" class="px-4 px-sm-6 pt-3 pt-sm-5 pb-8">
        <!-- Loading -->
        <div v-if="loading && !notifications.length" class="panel-card">
          <div class="pa-6">
            <v-skeleton-loader
              type="list-item-avatar-three-line, list-item-avatar-three-line, list-item-avatar-three-line"
            />
          </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="!notifications.length" class="panel-card empty-block reveal-card">
          <div class="empty-icon">
            <v-icon size="40" color="#cbd5e1">mdi-bell-outline</v-icon>
          </div>
          <div class="empty-title">No alerts yet</div>
          <div class="empty-sub">
            Payment updates and account notifications will appear here.
          </div>
        </div>

        <!-- Notifications list -->
        <div v-else class="reveal-card">
          <!-- Summary strip -->
          <div class="summary-strip mb-3">
            <div class="summary-item">
              <div class="summary-icon summary-icon-purple">
                <v-icon size="16" color="white">mdi-bell-ring-outline</v-icon>
              </div>
              <div>
                <div class="summary-label">Total</div>
                <div class="summary-value">{{ notifications.length }}</div>
              </div>
            </div>
            <div class="summary-item">
              <div class="summary-icon summary-icon-amber">
                <v-icon size="16" color="white">mdi-circle</v-icon>
              </div>
              <div>
                <div class="summary-label">Unread</div>
                <div class="summary-value">{{ unreadCount }}</div>
              </div>
            </div>
            <div class="summary-item">
              <div class="summary-icon summary-icon-lime">
                <v-icon size="16" color="#0A0A14">mdi-check-circle-outline</v-icon>
              </div>
              <div>
                <div class="summary-label">Read</div>
                <div class="summary-value">{{ notifications.length - unreadCount }}</div>
              </div>
            </div>
          </div>

          <!-- Section header -->
          <div class="list-head">
            <div class="panel-icon panel-icon-purple panel-icon-sm">
              <v-icon size="18" color="white">mdi-bell-ring</v-icon>
            </div>
            <div class="panel-title-group">
              <div class="panel-title">Your notifications</div>
              <div class="panel-sub">Most recent first</div>
            </div>
          </div>

          <!-- Notification cards -->
          <div class="notification-list">
            <div
              v-for="n in notifications"
              :key="n.id"
              class="n-card"
              :class="{ 'n-card-unread': !isRead(n) }"
              @click="openNotification(n)"
            >
              <!-- Unread stripe -->
              <div v-if="!isRead(n)" class="n-stripe"></div>

              <!-- Icon -->
              <div class="n-icon" :class="avatarClass(n)">
                <v-icon size="20" :color="avatarIconColor(n)">
                  {{ avatarIcon(n) }}
                </v-icon>
              </div>

              <!-- Body -->
              <div class="n-body">
                <div class="n-title-row">
                  <span class="n-title">{{ n.title || 'Notification' }}</span>
                  <span
                    v-if="n.type"
                    class="n-type"
                    :class="typeClass(n.type)"
                  >{{ prettyType(n.type) }}</span>
                </div>
                <div class="n-message">{{ n.message }}</div>
                <div class="n-meta">
                  <v-icon size="12" color="#94a3b8">mdi-clock-outline</v-icon>
                  <span>{{ formatRelative(n.created_at) }}</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="n-actions" @click.stop>
                <button
                  v-if="!isRead(n)"
                  class="n-action n-action-read"
                  title="Mark as read"
                  @click="openNotification(n)"
                >
                  <v-icon size="16">mdi-check</v-icon>
                </button>
                <button
                  class="n-action n-action-delete"
                  title="Delete"
                  :disabled="deletingId === n.id"
                  @click="deleteNotification(n)"
                >
                  <v-icon size="16" :class="{ spin: deletingId === n.id }">
                    {{ deletingId === n.id ? 'mdi-loading' : 'mdi-trash-can-outline' }}
                  </v-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </v-container>

      <!-- Delete confirm dialog -->
      <v-dialog v-model="deleteDialog.show" max-width="420" persistent>
        <div class="confirm-card">
          <div class="confirm-icon">
            <v-icon size="24" color="#dc2626">mdi-alert-outline</v-icon>
          </div>
          <div class="confirm-title">Delete this notification?</div>
          <div class="confirm-text">
            "{{ deleteDialog.title || 'This notification' }}" will be permanently removed.
          </div>
          <div class="confirm-actions">
            <button class="confirm-cancel" @click="cancelDelete">Cancel</button>
            <button class="confirm-proceed" @click="executeDelete">Delete</button>
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

      deleteDialog: {
        show: false,
        id: null,
        title: '',
      },

      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    dashboardRoute() {
      return this.uid
        ? `/household/dashboard/${this.uid}`
        : '/household/dashboard';
    },
    menuItems() {
      return [
        { title: 'Dashboard', icon: 'mdi-view-dashboard', route: this.dashboardRoute },
         { title: "Visitors",  icon: "mdi-ticket-confirmation-outline", route: "/household/visitor_passes" },
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
      await Promise.allSettled([
        this.fetchHousehold(),
        this.fetchNotifications(),
      ]);
      this.loading = false;
    },

    async fetchHousehold() {
      try {
        const { data, status } = await axios.get(
          `${API}/households/getHouseHoldId/${this.uid}`
        );
        if (status === 200) {
          this.household = { primary_owner: data.primary_owner || '' };
        }
      } catch (error) {
        console.warn('Household fetch failed:', error.response?.data || error.message);
      }
    },

    async fetchNotifications() {
      try {
        const { data, status } = await axios.get(`${API}/notifications/${this.uid}`);
        if (status === 200) {
          this.notifications = Array.isArray(data) ? data : [];
        }
      } catch (error) {
        console.warn('Notifications fetch failed:', {
          status: error.response?.status,
          message: error.message,
        });
        this.notifications = [];
      }
    },

    // =====================================================
    // HELPERS
    // =====================================================
    isRead(n) {
      if (!n) return true;
      const v = n.is_read;
      return v === 1 || v === '1' || v === true;
    },

    prettyType(t) {
      if (!t) return '';
      return String(t).replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    },

    avatarClass(n) {
      const t = n.type || 'SYSTEM';
      if (t === 'PAYMENT') return 'n-icon-green';
      if (t === 'ACCOUNT') return 'n-icon-blue';
      if (t === 'ESTATE')  return 'n-icon-purple';
      return 'n-icon-slate';
    },

    avatarIconColor() {
      return '#ffffff';
    },

    avatarIcon(n) {
      const t = n.type || 'SYSTEM';
      if (t === 'PAYMENT') return 'mdi-cash-check';
      if (t === 'ACCOUNT') return 'mdi-account-check';
      if (t === 'ESTATE')  return 'mdi-home-city';
      return 'mdi-bell-outline';
    },

    typeClass(t) {
      if (t === 'PAYMENT') return 'n-type-green';
      if (t === 'ACCOUNT') return 'n-type-blue';
      if (t === 'ESTATE')  return 'n-type-purple';
      return 'n-type-slate';
    },

    // =====================================================
    // ACTIONS
    // =====================================================
    async openNotification(n) {
      if (this.isRead(n)) return;

      const idx = this.notifications.findIndex((x) => x.id === n.id);
      if (idx !== -1) {
        this.$set(this.notifications, idx, { ...this.notifications[idx], is_read: 1 });
      }

      try {
        await axios.patch(`${API}/notifications/${n.id}/read`);
      } catch (err) {
        console.warn('Mark-read failed:', err.response?.data || err.message);
        if (idx !== -1) {
          this.$set(this.notifications, idx, { ...this.notifications[idx], is_read: 0 });
        }
      }
    },

    async markAllRead() {
      if (this.unreadCount === 0) return;

      this.markingAll = true;
      const backup = this.notifications.map((n) => ({ ...n }));
      this.notifications = this.notifications.map((n) => ({ ...n, is_read: 1 }));

      try {
        await axios.patch(`${API}/notifications/${this.uid}/read-all`);
        this.showSnackbar('All marked as read', 'success');
      } catch (err) {
        console.warn('Bulk read-all failed, trying per-item:', err.response?.status);
        try {
          const unread = backup.filter((n) => !this.isRead(n));
          await Promise.all(
            unread.map((n) => axios.patch(`${API}/notifications/${n.id}/read`))
          );
          this.showSnackbar('All marked as read', 'success');
        } catch (innerErr) {
          console.error('markAllRead failed:', innerErr.response?.data || innerErr.message);
          this.notifications = backup;
          this.showSnackbar('Could not mark all as read', 'error');
        }
      } finally {
        this.markingAll = false;
      }
    },

    deleteNotification(n) {
      this.deleteDialog = {
        show: true,
        id: n.id,
        title: n.title || '',
      };
    },

    cancelDelete() {
      this.deleteDialog.show = false;
      setTimeout(() => {
        this.deleteDialog = { show: false, id: null, title: '' };
      }, 200);
    },

    async executeDelete() {
      const id = this.deleteDialog.id;
      if (!id) return;

      this.deleteDialog.show = false;
      this.deletingId = id;

      const backup = [...this.notifications];
      this.notifications = this.notifications.filter((x) => x.id !== id);

      try {
        await axios.delete(`${API}/notifications/${id}`);
        this.showSnackbar('Deleted', 'success');
      } catch (err) {
        console.error('Delete failed:', err.response?.data || err.message);
        this.notifications = backup;
        this.showSnackbar('Could not delete notification', 'error');
      } finally {
        this.deletingId = null;
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

.mark-all-btn {
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
.mark-all-btn:hover:not(:disabled) {
  background: rgba(128, 81, 255, 0.14);
  border-color: rgba(128, 81, 255, 0.35);
}
.mark-all-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.mark-all-btn-mobile { width: 100%; justify-content: center; }

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
   SUMMARY STRIP
   ============================================================ */
.summary-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 14px;
  background: #ffffff;
  border: 1px solid #eef1f6;
  border-radius: 18px;
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.03);
}
.summary-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.summary-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.summary-icon-purple {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 8px 16px -8px rgba(128, 81, 255, 0.6);
}
.summary-icon-amber {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 8px 16px -8px rgba(245, 158, 11, 0.6);
}
.summary-icon-lime {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  box-shadow: 0 8px 16px -8px rgba(182, 255, 0, 0.6);
}
.summary-label {
  font-size: 0.58rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 2px;
}
.summary-value {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.4px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

/* ============================================================
   LIST HEADER
   ============================================================ */
.list-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 6px 14px;
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

/* ============================================================
   NOTIFICATION CARD
   ============================================================ */
.notification-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.n-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 18px;
  background: #ffffff;
  border: 1px solid #eef1f6;
  border-radius: 18px;
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.03);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  overflow: hidden;
}
.n-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px -14px rgba(15, 13, 36, 0.15);
  border-color: rgba(128, 81, 255, 0.25);
}
.n-card-unread {
  background: linear-gradient(135deg, #ffffff 0%, #faf9ff 100%);
  border-color: rgba(128, 81, 255, 0.2);
}

.n-stripe {
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(180deg, #9b6cff 0%, #8051ff 100%);
}

.n-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.n-icon-green {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  box-shadow: 0 8px 16px -8px rgba(182, 255, 0, 0.7);
}
.n-icon-green .v-icon { color: #0a0a14 !important; }

.n-icon-blue {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  box-shadow: 0 8px 16px -8px rgba(59, 130, 246, 0.6);
}
.n-icon-purple {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 8px 16px -8px rgba(128, 81, 255, 0.7);
}
.n-icon-slate {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  box-shadow: 0 8px 16px -8px rgba(100, 116, 139, 0.5);
}

.n-body { flex: 1; min-width: 0; }
.n-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}
.n-title {
  font-size: 0.9rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
}
.n-type {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.n-type-green  { background: rgba(122, 184, 0, 0.14); color: #3f6b00; }
.n-type-blue   { background: rgba(59, 130, 246, 0.14); color: #1d4ed8; }
.n-type-purple { background: rgba(128, 81, 255, 0.12); color: #5b21b6; }
.n-type-slate  { background: #f1f5f9; color: #475569; }

.n-message {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.n-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  color: #94a3b8;
  font-weight: 600;
}

.n-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}
.n-action {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  transition: all 0.2s ease;
}
.n-action-read {
  background: rgba(128, 81, 255, 0.1);
  color: #8051ff;
}
.n-action-read:hover { background: rgba(128, 81, 255, 0.18); }

.n-action-delete {
  background: #f6f7fb;
  color: #94a3b8;
}
.n-action-delete:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}
.n-action-delete:disabled { opacity: 0.5; cursor: not-allowed; }

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

/* ============================================================
   CONFIRM DIALOG
   ============================================================ */
.confirm-card {
  background: #ffffff;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 24px 48px -20px rgba(15, 13, 36, 0.4);
}
.confirm-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: #fff5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}
.confirm-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
}
.confirm-text {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 6px;
  line-height: 1.55;
  word-break: break-word;
}
.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.confirm-cancel {
  padding: 10px 20px;
  border-radius: 999px;
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  cursor: pointer;
  font-family: inherit;
  text-transform: uppercase;
}
.confirm-cancel:hover { background: #f8fafc; }
.confirm-proceed {
  padding: 10px 20px;
  border-radius: 999px;
  background: #dc2626;
  color: #ffffff;
  border: none;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  cursor: pointer;
  font-family: inherit;
  text-transform: uppercase;
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
.mobile-nav-btn { min-width: 0 !important; position: relative; }
.mobile-nav-label {
  font-size: 10px;
  margin-top: 2px;
  font-weight: 700;
}
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
@media (max-width: 599px) {
  .sticky-header-premium { padding-left: 12px; padding-right: 12px; }
  .reveal-card { animation-duration: 0.4s; }
  .summary-strip {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    padding: 12px;
  }
  .summary-icon { width: 32px; height: 32px; }
  .summary-value { font-size: 0.95rem; }
  .n-card { padding: 14px 14px; gap: 12px; }
  .n-icon { width: 40px; height: 40px; }
  .n-title { font-size: 0.85rem; }
  .n-message { font-size: 0.76rem; }
  .n-action { width: 30px; height: 30px; }
}
</style>