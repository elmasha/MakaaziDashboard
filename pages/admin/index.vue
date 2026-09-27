<template>
  <div class="admin-dashboard">
    <!-- ============================================================
         PAGE HEADER
         ============================================================ -->
    <div class="page-header">
      <div>
        <div class="page-title-row">
          <h1 class="page-title">Dashboard</h1>
          <div class="live-pill">
            <span class="live-dot"></span>
            Live
          </div>
        </div>
        <p class="page-sub">
          Welcome back, {{ adminName || adminEmail || 'Admin' }} · {{ todayLabel }}
        </p>
      </div>
      <div class="page-actions">
        <v-btn
          text
          rounded
          class="text-capitalize refresh-btn"
          :loading="loading"
          @click="refreshAll"
        >
          <v-icon left small>mdi-refresh</v-icon>
          Refresh
        </v-btn>
        <v-btn
          color="#B6FF00"
          rounded
          depressed
          class="text-capitalize new-estate-btn"
          @click="$router.push('/admin/new')"
        >
          <v-icon left small color="#0A0A14">mdi-plus</v-icon>
          <span style="color:#0A0A14; font-weight:700;">New estate</span>
        </v-btn>
      </div>
    </div>

    <!-- ============================================================
         KPI CARDS
         ============================================================ -->
    <div class="kpi-grid">
      <!-- Estates -->
      <div class="kpi-card">
        <div class="kpi-top">
          <div class="kpi-icon kpi-icon-lime">
            <v-icon size="18" color="#0A0A14">mdi-office-building</v-icon>
          </div>
          <div class="kpi-trend kpi-trend-up">
            <v-icon size="10">mdi-arrow-up</v-icon>
            {{ stats.active_estates }} active
          </div>
        </div>
        <div class="kpi-label">Total estates</div>
        <div class="kpi-value">{{ formatNum(stats.total_estates) }}</div>
        <div class="kpi-footer">
          <span>{{ stats.total_estates - stats.active_estates }} inactive</span>
        </div>
      </div>

      <!-- Households -->
      <div class="kpi-card">
        <div class="kpi-top">
          <div class="kpi-icon kpi-icon-purple">
            <v-icon size="18" color="white">mdi-home-group</v-icon>
          </div>
          <div v-if="stats.pending_households > 0" class="kpi-trend kpi-trend-warn">
            <v-icon size="10">mdi-alert</v-icon>
            {{ stats.pending_households }} pending
          </div>
        </div>
        <div class="kpi-label">Approved households</div>
        <div class="kpi-value">{{ formatNum(stats.total_households) }}</div>
        <div class="kpi-footer">
          <span>{{ stats.pending_households }} awaiting approval</span>
        </div>
      </div>

      <!-- Revenue YTD -->
      <div class="kpi-card kpi-card-highlight">
        <div class="kpi-top">
          <div class="kpi-icon kpi-icon-lime">
            <v-icon size="18" color="#0A0A14">mdi-cash-multiple</v-icon>
          </div>
          <div class="kpi-trend kpi-trend-up">
            <v-icon size="10">mdi-arrow-up</v-icon>
            YTD
          </div>
        </div>
        <div class="kpi-label">Collected this year</div>
        <div class="kpi-value">
          <span class="kpi-currency">KES</span>
          {{ formatNum(stats.collected_this_year) }}
        </div>
        <div class="kpi-footer">
          <span>All-time: KES {{ formatNum(stats.total_collected) }}</span>
        </div>
      </div>

      <!-- Officials -->
      <div class="kpi-card">
        <div class="kpi-top">
          <div class="kpi-icon kpi-icon-purple">
            <v-icon size="18" color="white">mdi-shield-account</v-icon>
          </div>
        </div>
        <div class="kpi-label">Officials</div>
        <div class="kpi-value">{{ formatNum(stats.total_officials) }}</div>
        <div class="kpi-footer">
          <span>{{ stats.active_subscriptions }} active subscriptions</span>
        </div>
      </div>
    </div>

    <!-- ============================================================
         RECENT ESTATES
         ============================================================ -->
    <div class="section-card">
      <div class="section-head">
        <div class="section-head-left">
          <div class="section-icon">
            <v-icon size="18" color="#B6FF00">mdi-office-building-outline</v-icon>
          </div>
          <div>
            <div class="section-title">Recent estates</div>
            <div class="section-sub">Latest onboarded estates across the platform</div>
          </div>
        </div>
        <v-btn
          text
          small
          rounded
          class="text-capitalize view-all-btn"
          @click="$router.push('/admin/estates')"
        >
          View all
          <v-icon right small>mdi-arrow-right</v-icon>
        </v-btn>
      </div>

      <!-- Loading -->
      <div v-if="loading && !recentEstates.length" class="section-loading">
        <v-skeleton-loader type="list-item-avatar-two-line" />
        <v-skeleton-loader type="list-item-avatar-two-line" />
        <v-skeleton-loader type="list-item-avatar-two-line" />
      </div>

      <!-- Empty -->
      <div v-else-if="!recentEstates.length" class="section-empty">
        <v-icon size="40" color="#475569">mdi-office-building-outline</v-icon>
        <div class="section-empty-title">No estates yet</div>
        <div class="section-empty-text">
          Onboard your first estate to get started.
        </div>
        <v-btn
          rounded
          depressed
          color="#B6FF00"
          class="mt-4 text-capitalize"
          @click="$router.push('/admin/estates/new')"
        >
          <v-icon left small color="#0A0A14">mdi-plus</v-icon>
          <span style="color:#0A0A14; font-weight:700;">Create estate</span>
        </v-btn>
      </div>

      <!-- List -->
      <div v-else class="estate-list">
        <div
          v-for="(e, i) in recentEstates"
          :key="e.estate_id"
          class="estate-row"
          @click="$router.push(`/admin/estates/${e.estate_id}`)"
        >
          <div class="estate-avatar">
            <span>{{ initialsOf(e.estate_name) }}</span>
          </div>
          <div class="estate-body">
            <div class="estate-name-row">
              <span class="estate-name">{{ e.estate_name }}</span>
              <div class="estate-status" :class="`status-${e.status.toLowerCase()}`">
                {{ e.status }}
              </div>
            </div>
            <div class="estate-meta">
              <span class="estate-urn">{{ e.estate_urn }}</span>
              <span class="meta-dot">·</span>
              <span>{{ e.estate_location || 'No location' }}</span>
            </div>
          </div>
          <div class="estate-stats">
            <div class="estate-stat">
              <div class="estate-stat-value">{{ e.household_count }}</div>
              <div class="estate-stat-label">households</div>
            </div>
            <div class="estate-stat">
              <div class="estate-stat-value">{{ e.official_count }}</div>
              <div class="estate-stat-label">officials</div>
            </div>
            <div class="estate-stat">
              <div class="estate-stat-value">
                {{ formatNumShort(e.total_collected) }}
              </div>
              <div class="estate-stat-label">collected</div>
            </div>
          </div>
          <v-icon size="18" color="#475569" class="estate-chevron">mdi-chevron-right</v-icon>
        </div>
      </div>
    </div>

    <!-- ============================================================
         QUICK ACTIONS
         ============================================================ -->
    <div class="quick-grid">
      <div class="quick-card" @click="$router.push('/admin/estates/new')">
        <div class="quick-icon quick-icon-lime">
          <v-icon size="20" color="#0A0A14">mdi-plus-circle-outline</v-icon>
        </div>
        <div class="quick-title">Create estate</div>
        <div class="quick-sub">Onboard a new estate</div>
      </div>

      <div class="quick-card" @click="$router.push('/admin/estates')">
        <div class="quick-icon quick-icon-purple">
          <v-icon size="20" color="white">mdi-office-building-outline</v-icon>
        </div>
        <div class="quick-title">Manage estates</div>
        <div class="quick-sub">View, edit, archive</div>
      </div>

      <div class="quick-card" @click="$router.push('/admin/audit-logs')">
        <div class="quick-icon quick-icon-purple">
          <v-icon size="20" color="white">mdi-history</v-icon>
        </div>
        <div class="quick-title">Audit logs</div>
        <div class="quick-sub">Recent admin activity</div>
      </div>

      <div class="quick-card" @click="$router.push('/admin/admins')">
        <div class="quick-icon quick-icon-lime">
          <v-icon size="20" color="#0A0A14">mdi-shield-crown</v-icon>
        </div>
        <div class="quick-title">Admins</div>
        <div class="quick-sub">Manage staff access</div>
      </div>
    </div>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      top
      rounded="pill"
    >
      <div class="d-flex align-center">
        <v-icon color="white" small class="mr-2">
          {{ snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
        </v-icon>
        <span>{{ snackbar.text }}</span>
      </div>
    </v-snackbar>
  </div>
</template>

<script>
import axios from 'axios';
import numeral from 'numeral';

const API = 'https://makaaziserver22.up.railway.app/api';

export default {
  name: 'AdminDashboard',
  layout: 'admin',

  data() {
    return {
      loading: false,
      adminEmail: '',
      adminName: '',
      authReady: false,

      stats: {
        total_estates: 0,
        active_estates: 0,
        total_households: 0,
        pending_households: 0,
        total_officials: 0,
        total_collected: 0,
        collected_this_year: 0,
        active_subscriptions: 0,
      },

      recentEstates: [],

      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    todayLabel() {
      const d = new Date();
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
    },
  },

  mounted() {
    try {
      this.adminEmail = localStorage.getItem('admin_email') || '';
      this.adminName = localStorage.getItem('admin_name') || '';
    } catch (e) {
      console.warn(e.message);
    }

    // Wait for Firebase to expose currentUser before firing the API.
    const auth = this.$fire?.auth;
    if (!auth) {
      console.error('[AdminDashboard] Firebase auth not available on this.$fire.auth');
      this.authReady = true;
      this.refreshAll();
      return;
    }

    const unsub = auth.onAuthStateChanged(async (user) => {
      unsub(); // one-shot
      if (!user) {
        this.$router.push('/admin/login');
        return;
      }
      this.authReady = true;
      await this.refreshAll();
    });
  },

  methods: {
    formatNum(n) {
      return numeral(n || 0).format('0,0');
    },

    formatNumShort(n) {
      const v = Number(n) || 0;
      if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
      if (v >= 1_000) return (v / 1_000).toFixed(0) + 'K';
      return numeral(v).format('0,0');
    },

    initialsOf(name) {
      if (!name) return '?';
      return name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    },

    // Build a fresh Bearer token for the current Firebase user.
    async getAuthHeaders() {
      try {
        const user = this.$fire?.auth?.currentUser;
        if (!user) return {};
        const token = await user.getIdToken();
        return { Authorization: `Bearer ${token}` };
      } catch (e) {
        console.warn('[AdminDashboard] getIdToken failed:', e.message);
        return {};
      }
    },

    async refreshAll() {
      if (!this.authReady) return;
      this.loading = true;
      await Promise.allSettled([
        this.fetchStats(),
        this.fetchRecentEstates(),
      ]);
      this.loading = false;
    },

    async fetchStats() {
      try {
        const headers = await this.getAuthHeaders();
        const { data, status } = await axios.get(`${API}/admin/stats`, { headers });
        if (status === 200 && data) {
          Object.assign(this.stats, data);
        }
      } catch (err) {
        const status = err.response?.status;

        // Only redirect when Firebase confirms the user is signed out.
        // A 401 while a user IS logged in means the server rejected the token —
        // stay on the page and show a message.
        if (status === 401 || status === 403) {
          const stillLoggedIn = !!this.$fire?.auth?.currentUser;
          if (!stillLoggedIn) {
            this.showSnackbar('Session expired', 'error');
            this.$router.push('/admin/login');
          } else {
            console.warn(
              '[AdminDashboard] Server rejected auth. Status:', status,
              '| Response:', err.response?.data
            );
            this.showSnackbar(
              err.response?.data?.error || 'Access denied — check admin account',
              'error'
            );
          }
          return;
        }

        console.warn('[AdminDashboard] Stats fetch failed:', err.message);
        this.showSnackbar('Could not load stats', 'error');
      }
    },

    async fetchRecentEstates() {
      try {
        const headers = await this.getAuthHeaders();
        const { data, status } = await axios.get(`${API}/admin/estates`, { headers });
        if (status === 200 && Array.isArray(data)) {
          this.recentEstates = data.slice(0, 5);
        }
      } catch (err) {
        console.warn('[AdminDashboard] Estates fetch failed:', err.message);
        this.recentEstates = [];
      }
    },

    showSnackbar(text, color = 'success') {
      this.snackbar = { show: true, text, color };
    },
  },
};
</script>
<style scoped>
/* ============================================================
   ROOT
   ============================================================ */
.admin-dashboard {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 4px 0 8px;
}

/* ============================================================
   PAGE HEADER
   ============================================================ */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-bottom: 4px;
}

.page-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 1.65rem;
  font-weight: 800;
  color: #0F0D24;
  letter-spacing: -0.7px;
  margin: 0;
  line-height: 1.15;
}

.live-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(122, 184, 0, 0.14);
  border: 1px solid rgba(122, 184, 0, 0.28);
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 800;
  color: #3F6B00;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #7AB800;
  box-shadow: 0 0 0 3px rgba(122, 184, 0, 0.25);
  animation: pulseLive 2s infinite;
}

@keyframes pulseLive {
  0%, 100% { box-shadow: 0 0 0 3px rgba(122, 184, 0, 0.25); }
  50% { box-shadow: 0 0 0 6px rgba(122, 184, 0, 0); }
}

.page-sub {
  font-size: 0.85rem;
  color: #64748B;
  margin: 6px 0 0;
  font-weight: 500;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.refresh-btn {
  color: #475569 !important;
  font-weight: 700 !important;
  font-size: 0.72rem !important;
  letter-spacing: 0.8px !important;
  text-transform: uppercase !important;
  min-width: 0 !important;
  padding: 0 12px !important;
}

.refresh-btn:hover {
  color: #0F0D24 !important;
  background: rgba(15, 13, 36, 0.05) !important;
}

.new-estate-btn {
  font-weight: 800 !important;
  font-size: 0.78rem !important;
  letter-spacing: 0.6px !important;
  text-transform: uppercase !important;
  box-shadow: 0 8px 20px -8px rgba(182, 255, 0, 0.65);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 18px !important;
}

.new-estate-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px -8px rgba(182, 255, 0, 0.8);
}

/* ============================================================
   KPI GRID
   ============================================================ */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.kpi-card {
  position: relative;
  padding: 22px 24px 20px;
  background: #FFFFFF;
  border: 1px solid #E9EDF3;
  border-radius: 20px;
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}

.kpi-card:hover {
  transform: translateY(-3px);
  border-color: #D8DFE9;
  box-shadow: 0 20px 40px -20px rgba(15, 13, 36, 0.18);
}

.kpi-card-highlight {
  background: linear-gradient(140deg, #0A0A14 0%, #221047 55%, #2B1256 100%);
  border-color: transparent;
  box-shadow: 0 20px 44px -22px rgba(34, 16, 71, 0.6);
}

.kpi-card-highlight:hover {
  box-shadow: 0 28px 52px -22px rgba(34, 16, 71, 0.75);
}

.kpi-card-highlight .kpi-label {
  color: rgba(255, 255, 255, 0.55);
}

.kpi-card-highlight .kpi-footer {
  color: rgba(255, 255, 255, 0.45);
}

.kpi-card-highlight .kpi-value {
  color: #FFFFFF;
}

.kpi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  min-height: 40px;
}

.kpi-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-icon-lime {
  background: linear-gradient(135deg, #D4FF4A 0%, #B6FF00 100%);
  box-shadow: 0 8px 20px -8px rgba(182, 255, 0, 0.7);
}

.kpi-icon-purple {
  background: linear-gradient(135deg, #9B6CFF 0%, #8051FF 100%);
  box-shadow: 0 8px 20px -8px rgba(128, 81, 255, 0.65);
}

.kpi-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px;
  border-radius: 999px;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  white-space: nowrap;
}

.kpi-trend-up {
  background: rgba(122, 184, 0, 0.14);
  color: #3F6B00;
}

.kpi-trend-warn {
  background: rgba(239, 68, 68, 0.12);
  color: #B91C1C;
}

.kpi-label {
  font-size: 0.7rem;
  font-weight: 800;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.kpi-value {
  font-size: 2rem;
  font-weight: 800;
  color: #0F0D24;
  letter-spacing: -1.4px;
  line-height: 1.05;
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.kpi-currency {
  font-size: 0.9rem;
  font-weight: 800;
  color: #B6FF00;
  letter-spacing: 0.5px;
}

.kpi-footer {
  font-size: 0.72rem;
  color: #94A3B8;
  margin-top: 10px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

/* ============================================================
   SECTION CARD
   ============================================================ */
.section-card {
  background: #FFFFFF;
  border: 1px solid #E9EDF3;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid #F1F5F9;
  flex-wrap: wrap;
}

.section-head-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.section-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #0A0A14;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 20px -10px rgba(10, 10, 20, 0.5);
}

.section-title {
  font-size: 1rem;
  font-weight: 800;
  color: #0F0D24;
  letter-spacing: -0.3px;
}

.section-sub {
  font-size: 0.75rem;
  color: #94A3B8;
  margin-top: 2px;
  font-weight: 500;
}

.view-all-btn {
  color: #8051FF !important;
  font-weight: 800 !important;
  font-size: 0.72rem !important;
  letter-spacing: 0.6px !important;
  text-transform: uppercase !important;
}

.view-all-btn:hover {
  background: rgba(128, 81, 255, 0.06) !important;
}

/* Loading */
.section-loading {
  padding: 14px 24px;
}

/* Empty */
.section-empty {
  padding: 56px 24px;
  text-align: center;
}

.section-empty-title {
  font-size: 1rem;
  font-weight: 800;
  color: #0F0D24;
  margin-top: 14px;
  letter-spacing: -0.2px;
}

.section-empty-text {
  font-size: 0.82rem;
  color: #94A3B8;
  margin-top: 4px;
}

/* Estate list */
.estate-list {
  display: flex;
  flex-direction: column;
}

.estate-row {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 16px 24px;
  cursor: pointer;
  transition: background 0.15s ease;
  border-bottom: 1px solid #F1F5F9;
}

.estate-row:last-child {
  border-bottom: none;
}

.estate-row:hover {
  background: #FAFBFF;
}

.estate-avatar {
  width: 44px;
  height: 44px;
  border-radius: 13px;
  background: linear-gradient(135deg, #9B6CFF 0%, #8051FF 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.6px;
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.6);
}

.estate-body {
  flex: 1;
  min-width: 0;
}

.estate-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.estate-name {
  font-size: 0.92rem;
  font-weight: 800;
  color: #0F0D24;
  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
}

.estate-status {
  font-size: 0.6rem;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 999px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.status-active {
  background: rgba(122, 184, 0, 0.14);
  color: #3F6B00;
}

.status-inactive {
  background: rgba(148, 163, 184, 0.16);
  color: #475569;
}

.status-archived {
  background: rgba(239, 68, 68, 0.1);
  color: #B91C1C;
}

.estate-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  color: #94A3B8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.estate-urn {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.68rem;
  letter-spacing: 0.2px;
}

.meta-dot {
  color: #CBD5E1;
}

.estate-stats {
  display: flex;
  align-items: center;
  gap: 28px;
  flex-shrink: 0;
}

.estate-stat {
  text-align: right;
  min-width: 62px;
}

.estate-stat-value {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0F0D24;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.4px;
}

.estate-stat-label {
  font-size: 0.62rem;
  color: #94A3B8;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  margin-top: 2px;
}

.estate-chevron {
  flex-shrink: 0;
  opacity: 0.4;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.estate-row:hover .estate-chevron {
  opacity: 0.9;
  transform: translateX(2px);
}

/* ============================================================
   QUICK ACTIONS
   ============================================================ */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 16px;
}

.quick-card {
  position: relative;
  padding: 22px 24px;
  background: #FFFFFF;
  border: 1px solid #E9EDF3;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.quick-card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0;
  background: linear-gradient(135deg, rgba(182, 255, 0, 0.06), transparent 60%);
  transition: opacity 0.28s ease;
  pointer-events: none;
}

.quick-card:hover {
  transform: translateY(-3px);
  border-color: #C9F569;
  box-shadow: 0 20px 40px -20px rgba(182, 255, 0, 0.45);
}

.quick-card:hover::after {
  opacity: 1;
}

.quick-icon {
  width: 44px;
  height: 44px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.quick-icon-lime {
  background: linear-gradient(135deg, #D4FF4A 0%, #B6FF00 100%);
  box-shadow: 0 10px 22px -10px rgba(182, 255, 0, 0.7);
}

.quick-icon-purple {
  background: linear-gradient(135deg, #9B6CFF 0%, #8051FF 100%);
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.6);
}

.quick-title {
  font-size: 0.92rem;
  font-weight: 800;
  color: #0F0D24;
  letter-spacing: -0.3px;
}

.quick-sub {
  font-size: 0.75rem;
  color: #94A3B8;
  margin-top: 4px;
  font-weight: 500;
  line-height: 1.4;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 900px) {
  .estate-stats {
    gap: 18px;
  }
  .estate-stat {
    min-width: 52px;
  }
  .estate-stat-value {
    font-size: 0.85rem;
  }
}

@media (max-width: 767px) {
  .admin-dashboard {
    gap: 22px;
  }

  .page-title {
    font-size: 1.35rem;
  }

  .page-actions {
    width: 100%;
  }

  .refresh-btn,
  .new-estate-btn {
    flex: 1;
  }

  .kpi-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 12px;
  }

  .kpi-card {
    padding: 18px 18px 16px;
  }

  .kpi-value {
    font-size: 1.55rem;
    letter-spacing: -1px;
  }

  .kpi-icon {
    width: 36px;
    height: 36px;
  }

  .estate-stats {
    display: none;
  }

  .estate-name {
    max-width: 150px;
  }

  .estate-row {
    padding: 14px 18px;
    gap: 14px;
  }

  .section-head {
    padding: 16px 18px;
  }

  .quick-card {
    padding: 18px 20px;
  }
}
</style>