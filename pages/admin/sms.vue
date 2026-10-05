<template>
  <div class="sms-page">
    <!-- ============================================================
         PAGE HEADER
         ============================================================ -->
    <div class="page-header">
      <div>
        <div class="page-title-row">
          <h1 class="page-title">SMS Logs</h1>
          <div class="count-pill">{{ filteredLogs.length }}</div>
        </div>
        <p class="page-sub">
          {{ logs.length }} total · {{ sentCount }} sent ·
          {{ failedCount }} failed · {{ todayCount }} today
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
      </div>
    </div>

    <!-- ============================================================
         SUMMARY CARDS
         ============================================================ -->
    <div class="summary-grid">
      <div class="summary-card summary-card-highlight">
        <div class="summary-icon summary-icon-white">
          <v-icon size="18" color="#0A0A14">mdi-wallet-outline</v-icon>
        </div>
        <div class="summary-body">
          <div class="summary-label">SMS Balance</div>
          <div class="summary-value" v-if="balance.loading">
            <span class="value-skeleton"></span>
          </div>
          <div class="summary-value" v-else-if="balance.ok">
            {{ fmtBalance(balance.value) }}
            <span class="value-unit">{{ balance.currency }}</span>
          </div>
          <div class="summary-value summary-value-error" v-else>
            <v-icon size="14">mdi-alert-circle-outline</v-icon>
            Unavailable
          </div>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon summary-icon-purple">
          <v-icon size="18" color="white">mdi-send-outline</v-icon>
        </div>
        <div class="summary-body">
          <div class="summary-label">Total attempts</div>
          <div class="summary-value">{{ logs.length }}</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon summary-icon-lime">
          <v-icon size="18" color="#0A0A14">mdi-check-circle-outline</v-icon>
        </div>
        <div class="summary-body">
          <div class="summary-label">Delivered</div>
          <div class="summary-value">{{ deliveredCount }}</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon summary-icon-amber">
          <v-icon size="18" color="white">mdi-calendar-today</v-icon>
        </div>
        <div class="summary-body">
          <div class="summary-label">Today</div>
          <div class="summary-value">{{ todayCount }}</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon summary-icon-red">
          <v-icon size="18" color="white">mdi-alert-circle-outline</v-icon>
        </div>
        <div class="summary-body">
          <div class="summary-label">Failed</div>
          <div class="summary-value">{{ failedCount }}</div>
        </div>
      </div>
    </div>

    <!-- ============================================================
         FILTERS
         ============================================================ -->
    <div class="filters-card">
      <div class="search-wrap">
        <v-icon size="18" class="search-icon">mdi-magnify</v-icon>
        <input
          v-model="search"
          class="search-input"
          type="text"
          placeholder="Search by phone, message, estate, or reference"
        />
        <button v-if="search" class="search-clear" @click="search = ''">
          <v-icon size="16">mdi-close-circle</v-icon>
        </button>
      </div>

      <select v-model="kindFilter" class="filter-select">
        <option value="">All categories</option>
        <option value="__approval__">Approval requests</option>
        <option v-for="k in kindOptions" :key="k.value" :value="k.value">
          {{ k.label }}
        </option>
      </select>

      <select v-model="estateFilter" class="filter-select">
        <option value="">All estates</option>
        <option v-for="e in estates" :key="e.estate_id" :value="e.estate_id">
          {{ e.estate_name }}
        </option>
      </select>

      <div class="filter-chips">
        <button
          v-for="s in statusOptions"
          :key="s.value"
          class="filter-chip"
          :class="{ 'filter-chip-active': statusFilter === s.value }"
          @click="statusFilter = s.value"
        >
          {{ s.label }}
        </button>
      </div>
    </div>

    <!-- ============================================================
         LOADING / EMPTY / LIST
         ============================================================ -->
    <div v-if="loading && !logs.length" class="loading-block">
      <v-skeleton-loader
        type="list-item-avatar-three-line, list-item-avatar-three-line, list-item-avatar-three-line"
      />
    </div>

    <div v-else-if="!filteredLogs.length" class="empty-card">
      <div class="empty-icon">
        <v-icon size="44" color="#8051FF">
          {{ hasActiveFilters ? 'mdi-filter-off' : 'mdi-message-text-outline' }}
        </v-icon>
      </div>
      <div class="empty-title">
        {{ hasActiveFilters ? 'No matching SMS logs' : 'No SMS logs yet' }}
      </div>
      <div class="empty-text">
        {{ hasActiveFilters
          ? 'Try clearing the filters or searching for something else.'
          : 'Sent SMS messages will appear here once notifications go out.' }}
      </div>
      <button
        v-if="hasActiveFilters"
        class="empty-clear-btn"
        @click="clearFilters"
      >
        <v-icon size="16" class="mr-1">mdi-close</v-icon>
        Clear filters
      </button>
    </div>

    <div v-else class="sms-card">
      <div
        v-for="log in filteredLogs"
        :key="log.sms_id"
        class="sms-row"
      >
        <!-- Status icon -->
        <div class="sms-icon" :class="statusIconClass(log.status)">
          <v-icon size="20">{{ statusIcon(log.status) }}</v-icon>
        </div>

        <!-- Body -->
        <div class="sms-body">
          <div class="sms-title-row">
            <span class="sms-recipient">{{ log.phone_number }}</span>
            <span class="status-pill" :class="statusClass(log.status)">
              <span class="status-dot"></span>
              {{ log.status }}
            </span>
            <span
              v-if="log.kind && log.kind !== 'generic'"
              class="category-tag"
              :class="kindTagClass(log.kind)"
            >
              <v-icon size="10" class="mr-1">{{ kindIcon(log.kind) }}</v-icon>
              {{ prettyKind(log.kind) }}
            </span>
          </div>
          <div class="sms-message">{{ truncate(log.message, 140) }}</div>
          <div class="sms-meta">
            <span class="meta-item">
              <v-icon size="12">mdi-office-building-outline</v-icon>
              {{ log.estate_name || '—' }}
            </span>
            <template v-if="log.provider_ref">
              <span class="meta-dot">·</span>
              <span class="meta-item">
                <v-icon size="12">mdi-identifier</v-icon>
                {{ log.provider_ref }}
              </span>
            </template>
          </div>
          <div v-if="log.status === 'Failed' && log.error" class="sms-error">
            <v-icon size="12">mdi-alert-circle-outline</v-icon>
            {{ log.error }}
          </div>
        </div>

        <!-- Right -->
        <div class="sms-right">
          <div class="sms-stat">
            <div class="stat-value-sm">{{ relativeTime(log.created_at) }}</div>
            <div class="stat-label">{{ fmtDateTime(log.created_at) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================
         DETAIL DIALOG
         ============================================================ -->
    <v-dialog v-model="detailDialog" max-width="560" content-class="sms-dialog-content">
      <div class="detail-shell" v-if="selected">
        <div class="detail-head">
          <div class="detail-head-left">
            <div class="sms-icon" :class="statusIconClass(selected.status)">
              <v-icon size="20">{{ statusIcon(selected.status) }}</v-icon>
            </div>
            <div>
              <div class="detail-title">{{ selected.phone_number }}</div>
              <div class="detail-sub">{{ prettyKind(selected.kind) || 'Generic' }}</div>
            </div>
          </div>
          <button class="detail-close" @click="detailDialog = false">
            <v-icon size="20">mdi-close</v-icon>
          </button>
        </div>

        <div class="detail-body">
          <div class="detail-row">
            <div class="detail-key">Status</div>
            <div class="detail-val">
              <span class="status-pill" :class="statusClass(selected.status)">
                <span class="status-dot"></span>
                {{ selected.status }}
              </span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-key">Estate</div>
            <div class="detail-val">{{ selected.estate_name || '—' }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-key">Category</div>
            <div class="detail-val mono">{{ selected.kind || 'generic' }}</div>
          </div>
          <div v-if="selected.provider_ref" class="detail-row">
            <div class="detail-key">Provider ref</div>
            <div class="detail-val mono">{{ selected.provider_ref }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-key">Sent at</div>
            <div class="detail-val">{{ fmtDateTimeFull(selected.created_at) }}</div>
          </div>

          <div class="detail-message-block">
            <div class="detail-key">Message</div>
            <div class="detail-message">{{ selected.message }}</div>
          </div>

          <div v-if="selected.status === 'Failed' && selected.error" class="detail-error-block">
            <div class="detail-key">Error</div>
            <div class="detail-error">{{ selected.error }}</div>
          </div>
        </div>

        <div class="detail-foot">
          <button class="detail-btn detail-btn-ghost" @click="copyMessage">
            <v-icon size="14" class="mr-1">mdi-content-copy</v-icon>
            Copy message
          </button>
          <button class="detail-btn detail-btn-primary" @click="detailDialog = false">
            Close
          </button>
        </div>
      </div>
    </v-dialog>

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

const API = 'https://makaaziserver22.up.railway.app/api';

export default {
  name: 'AdminSmsLogs',
  layout: 'admin',

  data() {
    return {
      loading: false,
      logs: [],
      estates: [],
      search: '',
      estateFilter: '',
      statusFilter: '',
      kindFilter: '',
      selected: null,
      detailDialog: false,
      balance: {
        loading: false,
        ok: false,
        value: 0,
        currency: 'KES',
        error: null,
      },
      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    statusOptions() {
      return [
        { label: 'All', value: '' },
        { label: 'Sent', value: 'Sent' },
        { label: 'Failed', value: 'Failed' },
      ];
    },

    // Every known SMS kind in the platform
    kindOptions() {
      return [
        { label: 'Payment receipts',      value: 'payment_successful' },
        { label: 'Registration received', value: 'registration_successful' },
        { label: 'Household approved',    value: 'household_approved' },
        { label: 'Official assigned',     value: 'official_assigned' },
        { label: 'Official promoted',     value: 'official_promoted' },
        { label: 'Visitor pass created',  value: 'visitor_pass_created' },
        { label: 'Visitor arrived',       value: 'visitor_arrived' },
        { label: 'Generic',               value: 'generic' },
      ];
    },

    /* ---- Summary counts ---- */
    sentCount() {
      return this.logs.filter((l) => l.status === 'Sent').length;
    },
    deliveredCount() {
      return this.logs.filter((l) => l.status === 'Sent').length;
    },
    failedCount() {
      return this.logs.filter((l) => l.status === 'Failed').length;
    },
    todayCount() {
      const today = new Date().toDateString();
      return this.logs.filter(
        (l) => new Date(l.created_at).toDateString() === today
      ).length;
    },

    /* ---- Filters ---- */
    hasActiveFilters() {
      return !!(this.search || this.estateFilter || this.statusFilter || this.kindFilter);
    },
    filteredLogs() {
      const q = this.search.trim().toLowerCase();
      return this.logs.filter((l) => {
        if (this.estateFilter && l.estate_id !== this.estateFilter) return false;
        if (this.statusFilter && l.status !== this.statusFilter) return false;

        // kind filter supports a magic value "__approval__" matching all admin_approval_*
        if (this.kindFilter === '__approval__') {
          if (!(l.kind || '').startsWith('admin_approval')) return false;
        } else if (this.kindFilter && l.kind !== this.kindFilter) {
          return false;
        }

        if (!q) return true;
        return (
          (l.phone_number || '').toLowerCase().includes(q) ||
          (l.message || '').toLowerCase().includes(q) ||
          (l.estate_name || '').toLowerCase().includes(q) ||
          (l.provider_ref || '').toLowerCase().includes(q)
        );
      });
    },
  },

  mounted() {
    const auth = this.$fire?.auth;
    if (!auth) {
      console.error('Firebase auth not available');
      return;
    }

    const unsub = auth.onAuthStateChanged(async (user) => {
      unsub();
      if (!user) {
        this.$router.push('/admin/login');
        return;
      }
      await this.refreshAll();
    });
  },

  methods: {
    async getAuthHeaders() {
      try {
        const user = this.$fire?.auth?.currentUser;
        if (!user) return {};
        const token = await user.getIdToken();
        return { Authorization: `Bearer ${token}` };
      } catch (e) {
        console.warn('getIdToken failed:', e.message);
        return {};
      }
    },

    async refreshAll() {
      await Promise.allSettled([
        this.load(),
        this.loadEstates(),
        this.loadBalance(),
      ]);
    },

    async load() {
      this.loading = true;
      try {
        const headers = await this.getAuthHeaders();
        const { data, status } = await axios.get(`${API}/admin/sms-logs`, { headers });
        if (status === 200 && Array.isArray(data)) {
          this.logs = data;
        }
      } catch (err) {
        const s = err.response?.status;
        if (s === 401 || s === 403) {
          this.showSnackbar('Access denied — check admin account', 'error');
        } else if (s === 404) {
          this.logs = [];
        } else {
          console.warn('SMS logs load failed:', err.message);
          this.showSnackbar('Could not load SMS logs', 'error');
          this.logs = [];
        }
      } finally {
        this.loading = false;
      }
    },

    async loadEstates() {
      try {
        const headers = await this.getAuthHeaders();
        const { data } = await axios.get(`${API}/admin/estates`, { headers });
        if (Array.isArray(data)) this.estates = data;
      } catch (e) {
        console.warn('Estates preload failed:', e.message);
      }
    },

    async loadBalance() {
      this.balance.loading = true;
      try {
        const headers = await this.getAuthHeaders();
        const { data } = await axios.get(`${API}/admin/sms-balance`, { headers });
        if (data && data.ok) {
          this.balance.ok = true;
          this.balance.value = Number(data.balance) || 0;
          this.balance.currency = data.currency || 'KES';
          this.balance.error = null;
        } else {
          this.balance.ok = false;
          this.balance.error = data?.error || 'Could not fetch balance';
        }
      } catch (err) {
        this.balance.ok = false;
        this.balance.error = err.response?.data?.error || err.message;
        console.warn('SMS balance load failed:', err.message);
      } finally {
        this.balance.loading = false;
      }
    },

    clearFilters() {
      this.search = '';
      this.estateFilter = '';
      this.statusFilter = '';
      this.kindFilter = '';
    },

    fmtBalance(n) {
      const v = Number(n) || 0;
      return v >= 1000
        ? v.toLocaleString('en-KE', { maximumFractionDigits: 0 })
        : v.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    },

    truncate(text, len) {
      if (!text) return '—';
      return text.length > len ? text.slice(0, len) + '…' : text;
    },

    fmtDateTime(d) {
      if (!d) return '—';
      try {
        return new Date(d).toLocaleString('en-GB', {
          day: '2-digit', month: 'short',
          hour: '2-digit', minute: '2-digit',
        });
      } catch { return '—'; }
    },

    fmtDateTimeFull(d) {
      if (!d) return '—';
      try {
        return new Date(d).toLocaleString('en-GB', {
          weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
      } catch { return '—'; }
    },

    relativeTime(d) {
      if (!d) return '—';
      const diff = Math.max(0, Date.now() - new Date(d).getTime());
      const sec = Math.floor(diff / 1000);
      if (sec < 60) return 'just now';
      const min = Math.floor(sec / 60);
      if (min < 60) return `${min}m ago`;
      const hr = Math.floor(min / 60);
      if (hr < 24) return `${hr}h ago`;
      const day = Math.floor(hr / 24);
      if (day < 7) return `${day}d ago`;
      return `${Math.floor(day / 7)}w ago`;
    },

    prettyKind(kind) {
      if (!kind) return '';
      return kind.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    },

    kindIcon(kind) {
      const k = (kind || '').toLowerCase();
      if (k.startsWith('admin_approval')) return 'mdi-shield-check-outline';
      if (k === 'payment_successful')    return 'mdi-cash-multiple';
      if (k === 'household_approved')    return 'mdi-account-check-outline';
      if (k === 'registration_successful') return 'mdi-account-plus-outline';
      if (k.startsWith('official_'))     return 'mdi-badge-account-outline';
      if (k.startsWith('visitor_'))      return 'mdi-gate';
      return 'mdi-message-text-outline';
    },

    kindTagClass(kind) {
      const k = (kind || '').toLowerCase();
      if (k.startsWith('admin_approval')) return 'cat-approval';
      if (k === 'payment_successful')     return 'cat-payment';
      if (k.startsWith('official_'))      return 'cat-official';
      if (k.startsWith('visitor_'))       return 'cat-visitor';
      if (k.startsWith('household_') || k.startsWith('registration_')) return 'cat-household';
      return 'cat-default';
    },

    statusClass(status) {
      return `status-${(status || '').toLowerCase()}`;
    },

    statusIcon(status) {
      const s = (status || '').toLowerCase();
      if (s === 'sent' || s === 'delivered') return 'mdi-check-circle-outline';
      if (s === 'failed') return 'mdi-close-circle-outline';
      return 'mdi-message-text-outline';
    },

    statusIconClass(status) {
      const s = (status || '').toLowerCase();
      if (s === 'sent' || s === 'delivered') return 'icon-green';
      if (s === 'failed') return 'icon-red';
      return 'icon-purple';
    },

    openLog(log) {
      this.selected = log;
      this.detailDialog = true;
    },

    async copyMessage() {
      if (!this.selected) return;
      try {
        await navigator.clipboard.writeText(this.selected.message || '');
        this.showSnackbar('Message copied', 'success');
      } catch {
        this.showSnackbar('Could not copy', 'error');
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
.sms-page { display: flex; flex-direction: column; gap: 22px; }

/* Header */
.page-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; flex-wrap: wrap;
}
.page-title-row { display: flex; align-items: center; gap: 12px; }
.page-title {
  font-size: 1.65rem; font-weight: 800; color: #0f0d24;
  letter-spacing: -0.7px; margin: 0; line-height: 1.15;
}
.count-pill {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 28px; height: 24px; padding: 0 10px; border-radius: 999px;
  background: rgba(128, 81, 255, 0.12); color: #8051ff;
  font-size: 0.72rem; font-weight: 800;
}
.page-sub {
  font-size: 0.85rem; color: #64748b; margin: 6px 0 0; font-weight: 500;
}
.page-actions { display: flex; align-items: center; gap: 10px; }
.refresh-btn {
  color: #475569 !important; font-weight: 700 !important;
  font-size: 0.72rem !important; letter-spacing: 0.8px !important;
  text-transform: uppercase !important;
}
.refresh-btn:hover {
  color: #0f0d24 !important; background: rgba(15, 13, 36, 0.05) !important;
}

/* Summary grid */
.summary-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 14px;
}
.summary-card {
  display: flex; align-items: center; gap: 14px;
  padding: 18px 20px; background: #ffffff; border: 1px solid #e9edf3;
  border-radius: 16px; box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
  transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.22s ease;
}
.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px -14px rgba(15, 13, 36, 0.14);
}
.summary-card-highlight {
  background: linear-gradient(140deg, #0a0a14 0%, #221047 55%, #2b1256 100%);
  border-color: transparent;
  box-shadow: 0 20px 40px -22px rgba(34, 16, 71, 0.55);
}
.summary-card-highlight .summary-label { color: rgba(255, 255, 255, 0.55); }
.summary-card-highlight .summary-value { color: #ffffff; }
.summary-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.summary-icon-purple {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 8px 20px -10px rgba(128, 81, 255, 0.65);
}
.summary-icon-lime {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  box-shadow: 0 8px 20px -10px rgba(182, 255, 0, 0.7);
}
.summary-icon-amber {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 8px 20px -10px rgba(245, 158, 11, 0.6);
}
.summary-icon-red {
  background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
  box-shadow: 0 8px 20px -10px rgba(220, 38, 38, 0.55);
}
.summary-icon-white {
  background: #ffffff; box-shadow: 0 8px 20px -10px rgba(255, 255, 255, 0.5);
}
.summary-body { min-width: 0; }
.summary-label {
  font-size: 0.68rem; font-weight: 800; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.9px; margin-bottom: 5px;
}
.summary-value {
  font-size: 1.4rem; font-weight: 800; color: #0f0d24;
  letter-spacing: -0.8px; line-height: 1; font-variant-numeric: tabular-nums;
}
.value-unit {
  font-size: 0.72rem;
  font-weight: 700;
  margin-left: 4px;
  opacity: 0.6;
  letter-spacing: 0;
}
.value-skeleton {
  display: inline-block;
  width: 60px;
  height: 20px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.15);
  animation: pulse 1.2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 0.8; }
}
.summary-value-error {
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.7);
}

/* Filters */
.filters-card {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 14px 18px; background: #ffffff;
  border: 1px solid #e9edf3; border-radius: 16px; flex-wrap: wrap;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}
.search-wrap {
  position: relative; flex: 1; min-width: 220px; display: flex; align-items: center;
}
.search-icon { position: absolute; left: 12px; color: #94a3b8; pointer-events: none; }
.search-input {
  width: 100%; padding: 11px 36px 11px 38px; border-radius: 12px;
  border: 1px solid #e2e8f0; background: #f8fafc; font-size: 0.85rem;
  font-weight: 500; color: #0f0d24; outline: none; font-family: inherit;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.search-input::placeholder { color: #94a3b8; }
.search-input:focus { border-color: #8051ff; background: #ffffff; }
.search-clear {
  position: absolute; right: 10px; background: none; border: none;
  cursor: pointer; color: #94a3b8; display: flex; align-items: center;
  justify-content: center; padding: 4px;
}
.search-clear:hover { color: #0f0d24; }
.filter-select {
  padding: 11px 14px; border-radius: 12px; border: 1px solid #e2e8f0;
  background: #f8fafc; font-size: 0.82rem; font-weight: 600;
  color: #0f0d24; outline: none; font-family: inherit; cursor: pointer;
  min-width: 160px;
}
.filter-select:focus { border-color: #8051ff; background: #ffffff; }
.filter-chips { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.filter-chip {
  padding: 7px 14px; border-radius: 999px; background: #f1f5f9;
  border: 1px solid transparent; color: #475569; font-size: 0.78rem;
  font-weight: 700; cursor: pointer; font-family: inherit;
  transition: all 0.2s ease;
}
.filter-chip:hover { background: #e2e8f0; color: #0f0d24; }
.filter-chip-active { background: #0f0d24; color: #ffffff; border-color: #0f0d24; }

/* Loading / Empty */
.loading-block {
  padding: 8px; background: #ffffff; border: 1px solid #e9edf3; border-radius: 18px;
}
.empty-card {
  display: flex; flex-direction: column; align-items: center;
  padding: 64px 24px; background: #ffffff; border: 1px solid #e9edf3;
  border-radius: 18px; text-align: center;
}
.empty-icon {
  width: 84px; height: 84px; border-radius: 24px;
  background: rgba(128, 81, 255, 0.08);
  display: flex; align-items: center; justify-content: center; margin-bottom: 18px;
}
.empty-title {
  font-size: 1.05rem; font-weight: 800; color: #0f0d24; letter-spacing: -0.3px;
}
.empty-text {
  font-size: 0.85rem; color: #94a3b8; margin-top: 6px;
  max-width: 340px; line-height: 1.5;
}
.empty-clear-btn {
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 22px; padding: 11px 22px; border-radius: 999px;
  background: transparent; color: #8051ff; border: 1px solid #e2e8f0;
  font-size: 0.78rem; font-weight: 800; letter-spacing: 0.5px;
  cursor: pointer; font-family: inherit; transition: all 0.2s ease;
}
.empty-clear-btn:hover {
  background: rgba(128, 81, 255, 0.06); border-color: #8051ff;
}

/* List */
.sms-card {
  background: #ffffff; border: 1px solid #e9edf3; border-radius: 18px;
  overflow: hidden; box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}
.sms-row {
  position: relative; display: flex; align-items: center; gap: 16px;
  padding: 16px 22px; border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s ease; cursor: pointer;
}
.sms-row:last-child { border-bottom: none; }
.sms-row:hover { background: #fafbff; }

.sms-icon {
  width: 42px; height: 42px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #ffffff; flex-shrink: 0;
}
.icon-green  { background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%); color: #0a0a14; box-shadow: 0 10px 22px -10px rgba(182, 255, 0, 0.7); }
.icon-red    { background: linear-gradient(135deg, #f87171 0%, #dc2626 100%); box-shadow: 0 10px 22px -10px rgba(220, 38, 38, 0.55); }
.icon-amber  { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); box-shadow: 0 10px 22px -10px rgba(245, 158, 11, 0.6); }
.icon-purple { background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%); box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.65); }

.sms-body { flex: 1; min-width: 0; }
.sms-title-row {
  display: flex; align-items: center; gap: 10px;
  flex-wrap: wrap; margin-bottom: 4px;
}
.sms-recipient {
  font-size: 0.92rem; font-weight: 800; color: #0f0d24;
  letter-spacing: -0.3px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 260px;
}
.status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 9px; border-radius: 999px;
  font-size: 0.6rem; font-weight: 800;
  letter-spacing: 0.5px; text-transform: uppercase;
}
.status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
.status-sent      { background: rgba(122, 184, 0, 0.14); color: #3f6b00; }
.status-delivered { background: rgba(122, 184, 0, 0.14); color: #3f6b00; }
.status-failed    { background: rgba(239, 68, 68, 0.1); color: #b91c1c; }

.category-tag {
  display: inline-flex; align-items: center;
  padding: 3px 8px; border-radius: 999px;
  font-size: 0.6rem; font-weight: 800;
  letter-spacing: 0.4px; text-transform: uppercase;
}
.cat-approval  { background: rgba(245, 158, 11, 0.16); color: #b45309; }
.cat-payment   { background: rgba(122, 184, 0, 0.14); color: #3f6b00; }
.cat-official  { background: rgba(128, 81, 255, 0.12); color: #5b21b6; }
.cat-visitor   { background: rgba(59, 130, 246, 0.12); color: #1d4ed8; }
.cat-household { background: rgba(20, 184, 166, 0.12); color: #0f766e; }
.cat-default   { background: #f1f5f9; color: #475569; }

.sms-message {
  font-size: 0.78rem; color: #64748b; line-height: 1.45;
  margin-bottom: 5px;
  display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical;
  overflow: hidden;
}
.sms-meta {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.7rem; color: #94a3b8;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  font-weight: 500;
}
.meta-item { display: inline-flex; align-items: center; gap: 3px; }
.meta-dot { color: #cbd5e1; }

.sms-error {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 0.68rem;
  color: #b91c1c;
  font-weight: 600;
}

.sms-right {
  display: flex; align-items: center; gap: 16px; flex-shrink: 0;
}
.sms-stat { text-align: right; min-width: 110px; }
.stat-value-sm { font-size: 0.78rem; font-weight: 700; color: #334155; }
.stat-label {
  font-size: 0.62rem; color: #94a3b8; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.7px; margin-top: 2px;
}

/* ============================================================
   DETAIL DIALOG
   ============================================================ */
::v-deep .sms-dialog-content {
  border-radius: 20px !important;
  overflow: visible !important;
  margin: 16px auto !important;
  width: calc(100% - 32px) !important;
  max-height: calc(100vh - 32px) !important;
  display: flex !important;
  flex-direction: column !important;
}

.detail-shell {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  max-height: 100%;
  min-height: 0;
}

.detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 22px;
  background: linear-gradient(135deg, #0f0d24 0%, #2b1256 100%);
  color: #fff;
  flex-shrink: 0;
}
.detail-head-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.detail-title {
  font-size: 1rem; font-weight: 800; letter-spacing: -0.3px;
}
.detail-sub {
  font-size: 0.72rem; color: rgba(255, 255, 255, 0.65);
  margin-top: 2px;
}
.detail-close {
  width: 32px; height: 32px; border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: none; cursor: pointer; color: #fff;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s ease;
  flex-shrink: 0;
}
.detail-close:hover { background: rgba(255, 255, 255, 0.2); }

.detail-body {
  padding: 20px 22px;
  display: flex; flex-direction: column; gap: 12px;
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;
}

.detail-row {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 14px; padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}
.detail-row:last-child { border-bottom: none; padding-bottom: 0; }

.detail-key {
  font-size: 0.68rem; font-weight: 800; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.8px;
  flex-shrink: 0;
  min-width: 90px;
}

.detail-val {
  font-size: 0.85rem; font-weight: 700; color: #0f0d24;
  text-align: right;
  word-break: break-all;
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  justify-content: flex-end;
}
.detail-val.mono { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.78rem; }

.detail-message-block,
.detail-error-block {
  display: flex; flex-direction: column; gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}
.detail-message {
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.85rem;
  color: #0f0d24;
  line-height: 1.6;
  font-weight: 500;
  white-space: pre-wrap;
  word-break: break-word;
}
.detail-error {
  padding: 14px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #b91c1c;
  font-weight: 600;
  font-family: ui-monospace, SFMono-Regular, monospace;
  line-height: 1.5;
  word-break: break-word;
}

.detail-foot {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 14px 22px 18px;
  border-top: 1px solid #f1f5f9;
  background: #ffffff;
  flex-shrink: 0;
}

.detail-btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 10px 18px; border-radius: 11px;
  border: none; font-family: inherit;
  font-size: 0.8rem; font-weight: 800;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.detail-btn-ghost {
  background: transparent; color: #64748b; border: 1px solid #eef1f6;
}
.detail-btn-ghost:hover { background: #f1f5f9; color: #0f0d24; }
.detail-btn-primary {
  background: linear-gradient(135deg, #8051ff 0%, #9b6cff 100%);
  color: #ffffff;
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.7);
}
.detail-btn-primary:hover { transform: translateY(-1px); }

/* Responsive */
@media (max-width: 900px) { .sms-stat { display: none; } }
@media (max-width: 767px) {
  .sms-page { gap: 18px; }
  .page-title { font-size: 1.35rem; }
  .page-actions { width: 100%; }
  .refresh-btn { flex: 1; }
  .summary-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .summary-card { padding: 14px 16px; gap: 10px; }
  .summary-icon { width: 36px; height: 36px; }
  .summary-value { font-size: 1.15rem; }
  .filters-card { flex-direction: column; align-items: stretch; gap: 12px; }
  .search-wrap { min-width: 0; }
  .filter-select { min-width: 0; }
  .sms-row { padding: 14px 16px; gap: 14px; }
  .sms-recipient { max-width: 180px; }
  .detail-row { flex-direction: column; gap: 6px; }
  .detail-val { justify-content: flex-start; text-align: left; }
}
</style>