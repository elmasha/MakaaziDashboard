<template>
  <div class="audit-page">
    <!-- ============================================================
         PAGE HEADER
         ============================================================ -->
    <div class="page-header">
      <div>
        <div class="page-title-row">
          <h1 class="page-title">Audit Logs</h1>
          <div class="count-pill">{{ filteredLogs.length }}</div>
        </div>
        <p class="page-sub">
          {{ logs.length }} total · {{ todayCount }} today ·
          {{ uniqueActors }} admins active
        </p>
      </div>
      <div class="page-actions">
        <v-btn
          text
          rounded
          class="text-capitalize refresh-btn"
          :loading="loading"
          @click="load"
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
      <div class="summary-card">
        <div class="summary-icon summary-icon-purple">
          <v-icon size="18" color="white">mdi-clipboard-text-clock-outline</v-icon>
        </div>
        <div class="summary-body">
          <div class="summary-label">Total events</div>
          <div class="summary-value">{{ logs.length }}</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon summary-icon-lime">
          <v-icon size="18" color="#0A0A14">mdi-calendar-today</v-icon>
        </div>
        <div class="summary-body">
          <div class="summary-label">Today</div>
          <div class="summary-value">{{ todayCount }}</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon summary-icon-amber">
          <v-icon size="18" color="white">mdi-account-multiple-outline</v-icon>
        </div>
        <div class="summary-body">
          <div class="summary-label">Active admins</div>
          <div class="summary-value">{{ uniqueActors }}</div>
        </div>
      </div>

      <div class="summary-card summary-card-highlight">
        <div class="summary-icon summary-icon-white">
          <v-icon size="18" color="#0A0A14">mdi-shield-alert-outline</v-icon>
        </div>
        <div class="summary-body">
          <div class="summary-label">Destructive actions</div>
          <div class="summary-value">{{ destructiveCount }}</div>
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
          placeholder="Search by actor, action, target, or IP"
        />
        <button v-if="search" class="search-clear" @click="search = ''">
          <v-icon size="16">mdi-close-circle</v-icon>
        </button>
      </div>

      <select v-model="actorFilter" class="filter-select">
        <option value="">All admins</option>
        <option v-for="a in uniqueActorList" :key="a" :value="a">
          {{ a }}
        </option>
      </select>

      <div class="filter-chips">
        <button
          v-for="s in actionOptions"
          :key="s.value"
          class="filter-chip"
          :class="{ 'filter-chip-active': actionFilter === s.value }"
          @click="actionFilter = s.value"
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
          {{ hasActiveFilters ? 'mdi-filter-off' : 'mdi-clipboard-text-clock-outline' }}
        </v-icon>
      </div>
      <div class="empty-title">
        {{ hasActiveFilters ? 'No matching audit events' : 'No audit events yet' }}
      </div>
      <div class="empty-text">
        {{ hasActiveFilters
          ? 'Try clearing the filters or searching for something else.'
          : 'Admin actions will be recorded here as they happen.' }}
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

    <div v-else class="audit-card">
      <div
        v-for="log in filteredLogs"
        :key="log.audit_id"
        class="audit-row"
        @click="openLog(log)"
      >
        <!-- Action icon -->
        <div class="audit-icon" :class="actionIconClass(log.action)">
          <v-icon size="18">{{ actionIcon(log.action) }}</v-icon>
        </div>

        <!-- Body -->
        <div class="audit-body">
          <div class="audit-title-row">
            <span class="audit-actor">{{ log.actor_name || log.actor_email || 'System' }}</span>
            <span class="action-pill" :class="actionPillClass(log.action)">
              {{ log.action }}
            </span>
            <span v-if="log.target_type" class="target-tag">
              {{ log.target_type }}
              <span v-if="log.target_id" class="target-id">#{{ log.target_id }}</span>
            </span>
          </div>
          <div class="audit-summary">{{ log.summary || log.description || '—' }}</div>
          <div class="audit-meta">
            <span class="meta-item">
              <v-icon size="12">mdi-account-outline</v-icon>
              {{ log.actor_role || 'admin' }}
            </span>
            <span v-if="log.estate_name" class="meta-dot">·</span>
            <span v-if="log.estate_name" class="meta-item">
              <v-icon size="12">mdi-office-building-outline</v-icon>
              {{ log.estate_name }}
            </span>
            <span v-if="log.ip_address" class="meta-dot">·</span>
            <span v-if="log.ip_address" class="meta-item">
              <v-icon size="12">mdi-web</v-icon>
              {{ log.ip_address }}
            </span>
          </div>
        </div>

        <!-- Right -->
        <div class="audit-right">
          <div class="audit-stat">
            <div class="stat-value-sm">{{ fmtDateTime(log.created_at) }}</div>
            <div class="stat-label">When</div>
          </div>
          <v-icon size="18" class="audit-chevron">mdi-chevron-right</v-icon>
        </div>
      </div>
    </div>

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
  name: 'AdminAuditLogs',
  layout: 'admin',

  data() {
    return {
      loading: false,
      logs: [],
      search: '',
      actorFilter: '',
      actionFilter: '',
      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    actionOptions() {
      return [
        { label: 'All', value: '' },
        { label: 'Create', value: 'CREATE' },
        { label: 'Update', value: 'UPDATE' },
        { label: 'Delete', value: 'DELETE' },
        { label: 'Login', value: 'LOGIN' },
        { label: 'Approve', value: 'APPROVE' },
      ];
    },
    todayCount() {
      const today = new Date().toDateString();
      return this.logs.filter(
        (l) => new Date(l.created_at).toDateString() === today
      ).length;
    },
    uniqueActorList() {
      const set = new Set();
      this.logs.forEach((l) => {
        const name = l.actor_name || l.actor_email;
        if (name) set.add(name);
      });
      return Array.from(set).sort();
    },
    uniqueActors() {
      return this.uniqueActorList.length;
    },
    destructiveCount() {
      return this.logs.filter(
        (l) => (l.action || '').toUpperCase() === 'DELETE'
      ).length;
    },
    hasActiveFilters() {
      return !!(this.search || this.actorFilter || this.actionFilter);
    },
    filteredLogs() {
      const q = this.search.trim().toLowerCase();
      return this.logs.filter((l) => {
        if (this.actorFilter) {
          const name = l.actor_name || l.actor_email;
          if (name !== this.actorFilter) return false;
        }
        if (this.actionFilter && (l.action || '').toUpperCase() !== this.actionFilter) {
          return false;
        }
        if (!q) return true;
        return (
          (l.actor_name || '').toLowerCase().includes(q) ||
          (l.actor_email || '').toLowerCase().includes(q) ||
          (l.action || '').toLowerCase().includes(q) ||
          (l.target_type || '').toLowerCase().includes(q) ||
          (l.summary || l.description || '').toLowerCase().includes(q) ||
          (l.ip_address || '').toLowerCase().includes(q)
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
      await this.load();
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

    async load() {
      this.loading = true;
      try {
        const headers = await this.getAuthHeaders();
        const { data, status } = await axios.get(`${API}/admin/audit-logs`, { headers });
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
          console.warn('Audit logs load failed:', err.message);
          this.showSnackbar('Could not load audit logs', 'error');
          this.logs = [];
        }
      } finally {
        this.loading = false;
      }
    },

    clearFilters() {
      this.search = '';
      this.actorFilter = '';
      this.actionFilter = '';
    },

    fmtDateTime(d) {
      if (!d) return '—';
      try {
        return new Date(d).toLocaleString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        });
      } catch { return '—'; }
    },

    actionPillClass(action) {
      const a = (action || '').toUpperCase();
      if (a === 'CREATE') return 'action-create';
      if (a === 'UPDATE') return 'action-update';
      if (a === 'DELETE') return 'action-delete';
      if (a === 'LOGIN') return 'action-login';
      if (a === 'APPROVE') return 'action-approve';
      return 'action-default';
    },

    actionIcon(action) {
      const a = (action || '').toUpperCase();
      if (a === 'CREATE') return 'mdi-plus-circle-outline';
      if (a === 'UPDATE') return 'mdi-pencil-outline';
      if (a === 'DELETE') return 'mdi-trash-can-outline';
      if (a === 'LOGIN') return 'mdi-login-variant';
      if (a === 'APPROVE') return 'mdi-check-decagram-outline';
      return 'mdi-information-outline';
    },

    actionIconClass(action) {
      const a = (action || '').toUpperCase();
      if (a === 'CREATE') return 'icon-green';
      if (a === 'UPDATE') return 'icon-blue';
      if (a === 'DELETE') return 'icon-red';
      if (a === 'LOGIN') return 'icon-purple';
      if (a === 'APPROVE') return 'icon-lime';
      return 'icon-slate';
    },

    openLog(log) {
      this.$router.push(`/admin/audit-log-view/${log.audit_id}`);
    },

    showSnackbar(text, color = 'success') {
      this.snackbar = { show: true, text, color };
    },
  },
};
</script>

<style scoped>
/* ============================================================
   ROOT — same tokens as AdminResidents.vue
   ============================================================ */
.audit-page { display: flex; flex-direction: column; gap: 22px; }

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

/* Summary */
.summary-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
.audit-card {
  background: #ffffff; border: 1px solid #e9edf3; border-radius: 18px;
  overflow: hidden; box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}
.audit-row {
  position: relative; display: flex; align-items: center; gap: 16px;
  padding: 16px 22px; cursor: pointer; border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s ease;
}
.audit-row:last-child { border-bottom: none; }
.audit-row:hover { background: #fafbff; }

.audit-icon {
  width: 42px; height: 42px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #ffffff; flex-shrink: 0;
}
.icon-green  { background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%); color: #0a0a14; box-shadow: 0 10px 22px -10px rgba(182, 255, 0, 0.7); }
.icon-lime   { background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%); color: #0a0a14; box-shadow: 0 10px 22px -10px rgba(182, 255, 0, 0.7); }
.icon-red    { background: linear-gradient(135deg, #f87171 0%, #dc2626 100%); box-shadow: 0 10px 22px -10px rgba(220, 38, 38, 0.55); }
.icon-amber  { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); box-shadow: 0 10px 22px -10px rgba(245, 158, 11, 0.6); }
.icon-purple { background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%); box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.65); }
.icon-blue   { background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%); box-shadow: 0 10px 22px -10px rgba(59, 130, 246, 0.6); }
.icon-slate  { background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%); box-shadow: 0 10px 22px -10px rgba(100, 116, 139, 0.5); }

.audit-body { flex: 1; min-width: 0; }
.audit-title-row {
  display: flex; align-items: center; gap: 10px;
  flex-wrap: wrap; margin-bottom: 4px;
}
.audit-actor {
  font-size: 0.92rem; font-weight: 800; color: #0f0d24;
  letter-spacing: -0.3px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 240px;
}
.action-pill {
  display: inline-flex; align-items: center;
  padding: 3px 9px; border-radius: 999px;
  font-size: 0.6rem; font-weight: 800;
  letter-spacing: 0.5px; text-transform: uppercase;
}
.action-create  { background: rgba(122, 184, 0, 0.14); color: #3f6b00; }
.action-update  { background: rgba(59, 130, 246, 0.14); color: #1d4ed8; }
.action-delete  { background: rgba(239, 68, 68, 0.1); color: #b91c1c; }
.action-login   { background: rgba(128, 81, 255, 0.12); color: #5b21b6; }
.action-approve { background: rgba(182, 255, 0, 0.18); color: #3f6b00; }
.action-default { background: #f1f5f9; color: #475569; }

.target-tag {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 8px; border-radius: 999px;
  background: #f1f5f9; color: #475569;
  font-size: 0.6rem; font-weight: 800;
  letter-spacing: 0.4px; text-transform: uppercase;
}
.target-id { color: #8051ff; font-weight: 800; }

.audit-summary {
  font-size: 0.78rem; color: #64748b; line-height: 1.45;
  margin-bottom: 5px;
  display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical;
  overflow: hidden;
}
.audit-meta {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.7rem; color: #94a3b8;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  font-weight: 500;
}
.meta-item { display: inline-flex; align-items: center; gap: 3px; }
.meta-dot { color: #cbd5e1; }

.audit-right {
  display: flex; align-items: center; gap: 16px; flex-shrink: 0;
}
.audit-stat { text-align: right; min-width: 130px; }
.stat-value-sm { font-size: 0.78rem; font-weight: 700; color: #334155; }
.stat-label {
  font-size: 0.62rem; color: #94a3b8; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.7px; margin-top: 2px;
}
.audit-chevron {
  flex-shrink: 0; color: #cbd5e1; opacity: 0.6;
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.audit-row:hover .audit-chevron {
  opacity: 1; transform: translateX(2px); color: #8051ff;
}

/* Responsive */
@media (max-width: 900px) { .audit-stat { display: none; } }
@media (max-width: 767px) {
  .audit-page { gap: 18px; }
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
  .audit-row { padding: 14px 16px; gap: 14px; }
  .audit-actor { max-width: 180px; }
}
</style>