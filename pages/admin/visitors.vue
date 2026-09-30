<template>
  <div class="visitors-page">
    <!-- ============================================================
         PAGE HEADER
         ============================================================ -->
    <div class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="$router.push('/admin')">
          <v-icon size="18">mdi-arrow-left</v-icon>
        </button>
        <div>
          <div class="page-title-row">
            <h1 class="page-title">Visitors</h1>
            <div class="count-pill">{{ filteredPasses.length }}</div>
          </div>
          <p class="page-sub">
            All visitor passes across every estate
          </p>
        </div>
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
         STATS ROW
         ============================================================ -->
    <div class="stats-row">
      <div class="stat-tile">
        <div class="stat-tile-label">Total</div>
        <div class="stat-tile-value">{{ formatNum(passes.length) }}</div>
      </div>
      <div class="stat-tile">
        <div class="stat-tile-label">Active</div>
        <div class="stat-tile-value">{{ formatNum(activeCount) }}</div>
      </div>
      <div class="stat-tile">
        <div class="stat-tile-label">Used</div>
        <div class="stat-tile-value">{{ formatNum(usedCount) }}</div>
      </div>
      <div class="stat-tile">
        <div class="stat-tile-label">Expired</div>
        <div class="stat-tile-value">{{ formatNum(expiredCount) }}</div>
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
          placeholder="Search by visitor, host, plate, or code"
        />
        <button v-if="search" class="search-clear" @click="search = ''">
          <v-icon size="16">mdi-close-circle</v-icon>
        </button>
      </div>
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
         LOADING
         ============================================================ -->
    <div v-if="loading && !passes.length" class="loading-block">
      <v-skeleton-loader
        type="list-item-avatar-three-line, list-item-avatar-three-line, list-item-avatar-three-line"
      />
    </div>

    <!-- ============================================================
         EMPTY
         ============================================================ -->
    <div v-else-if="!filteredPasses.length" class="empty-card">
      <div class="empty-icon">
        <v-icon size="44" color="#8051FF">mdi-ticket-confirmation-outline</v-icon>
      </div>
      <div class="empty-title">
        {{ hasActiveFilters ? 'No matching passes' : 'No passes yet' }}
      </div>
      <div class="empty-text">
        {{ hasActiveFilters
          ? 'Try clearing the filters or searching for something else.'
          : 'Visitor passes created by residents or officials will appear here.' }}
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

    <!-- ============================================================
         LIST
         ============================================================ -->
    <div v-else class="passes-card">
      <div
        v-for="p in filteredPasses"
        :key="p.pass_id"
        class="pass-row"
      >
        <div class="pass-avatar">
          <span>{{ initialsOf(p.visitor_name) }}</span>
        </div>

        <div class="pass-body">
          <div class="pass-name-row">
            <span class="pass-name">{{ p.visitor_name }}</span>
            <span class="pass-status" :class="statusClass(p.status)">
              {{ p.status }}
            </span>
          </div>
          <div class="pass-meta">
            <span class="pass-code-chip">{{ p.pass_code }}</span>
            <template v-if="p.visitor_phone">
              <span class="meta-dot">·</span>
              <span class="meta-item">
                <v-icon size="12">mdi-phone-outline</v-icon>
                {{ p.visitor_phone }}
              </span>
            </template>
            <template v-if="p.visitor_plate">
              <span class="meta-dot">·</span>
              <span class="meta-item">
                <v-icon size="12">mdi-car-outline</v-icon>
                {{ p.visitor_plate }}
              </span>
            </template>
          </div>
        </div>

        <div class="pass-host">
          <div class="host-name">{{ p.host_name || 'Estate office' }}</div>
          <div class="host-estate">
            <v-icon size="12">mdi-office-building-outline</v-icon>
            {{ p.estate_name || '—' }}
          </div>
        </div>

        <div class="pass-window">
          <div class="window-value">{{ fmtWindow(p.valid_from, p.valid_until) }}</div>
          <div class="window-sub" v-if="p.used_at">
            <v-icon size="11">mdi-check-circle-outline</v-icon>
            Checked in {{ fmtWhen(p.used_at) }}
          </div>
        </div>

        <div class="pass-actions">
          <button class="icon-btn" @click.stop="toggleMenu(p.pass_id)">
            <v-icon size="18">mdi-dots-vertical</v-icon>
          </button>
          <transition name="menu-fade">
            <div v-if="openMenuId === p.pass_id" class="row-menu" @click.stop>
              <button
                v-if="p.status === 'Active'"
                class="row-menu-item row-menu-item-danger"
                @click="cancelPass(p)"
              >
                <v-icon size="16" class="mr-2">mdi-close-circle-outline</v-icon>
                Cancel pass
              </button>
              <button
                v-else
                class="row-menu-item"
                disabled
                style="opacity:0.5; cursor:not-allowed;"
              >
                <v-icon size="16" class="mr-2">mdi-lock-outline</v-icon>
                No actions available
              </button>
            </div>
          </transition>
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
import numeral from 'numeral';

const API = 'https://makaaziserver22.up.railway.app/api';

export default {
  name: 'AdminVisitors',
  layout: 'admin',

  data() {
    return {
      loading: false,
      search: '',
      statusFilter: '',
      passes: [],
      openMenuId: null,
      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    statusOptions() {
      return [
        { label: 'All', value: '' },
        { label: 'Active', value: 'Active' },
        { label: 'Used', value: 'Used' },
        { label: 'Expired', value: 'Expired' },
        { label: 'Cancelled', value: 'Cancelled' },
      ];
    },
    activeCount() {
      const now = Date.now();
      return this.passes.filter(
        (p) => p.status === 'Active' && new Date(p.valid_until).getTime() > now
      ).length;
    },
    usedCount() {
      return this.passes.filter((p) => p.status === 'Used').length;
    },
    expiredCount() {
      return this.passes.filter((p) => p.status === 'Expired').length;
    },
    hasActiveFilters() {
      return !!(this.search || this.statusFilter);
    },
    filteredPasses() {
      const q = this.search.trim().toLowerCase();
      return this.passes.filter((p) => {
        if (this.statusFilter && p.status !== this.statusFilter) return false;
        if (!q) return true;
        return (
          (p.visitor_name || '').toLowerCase().includes(q) ||
          (p.visitor_phone || '').toLowerCase().includes(q) ||
          (p.visitor_plate || '').toLowerCase().includes(q) ||
          (p.pass_code || '').toLowerCase().includes(q) ||
          (p.host_name || '').toLowerCase().includes(q) ||
          (p.estate_name || '').toLowerCase().includes(q)
        );
      });
    },
  },

  mounted() {
    this.load();
    document.addEventListener('click', this.closeMenu);
  },

  beforeDestroy() {
    document.removeEventListener('click', this.closeMenu);
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
        const { data } = await axios.get(`${API}/admin/visitor-passes`, { headers });
        this.passes = Array.isArray(data) ? data : [];
      } catch (err) {
        const s = err.response?.status;
        if (s === 401 || s === 403) {
          this.showSnackbar('Access denied — check admin account', 'error');
        } else {
          this.showSnackbar('Could not load passes', 'error');
        }
        this.passes = [];
      } finally {
        this.loading = false;
      }
    },

    async cancelPass(p) {
      this.openMenuId = null;
      if (!window.confirm(`Cancel pass ${p.pass_code} for ${p.visitor_name}?`)) return;
      try {
        const headers = await this.getAuthHeaders();
        await axios.post(
          `${API}/admin/visitor-passes/${p.pass_id}/cancel`,
          {},
          { headers }
        );
        this.showSnackbar('Pass cancelled');
        this.load();
      } catch (err) {
        this.showSnackbar(err.response?.data?.error || 'Failed to cancel', 'error');
      }
    },

    clearFilters() {
      this.search = '';
      this.statusFilter = '';
    },

    toggleMenu(id) {
      this.openMenuId = this.openMenuId === id ? null : id;
    },

    closeMenu() {
      this.openMenuId = null;
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

    statusClass(s) {
      return {
        Active: 'status-active',
        Used: 'status-used',
        Expired: 'status-inactive',
        Cancelled: 'status-suspended',
      }[s] || 'status-inactive';
    },

    fmtWindow(from, until) {
      if (!from || !until) return '—';
      const f = new Date(from);
      const u = new Date(until);
      const sameDay = f.toDateString() === u.toDateString();
      const d = (x) => x.toLocaleString('en-GB', { day: '2-digit', month: 'short' });
      const t = (x) => x.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      return sameDay ? `${d(f)} · ${t(f)} – ${t(u)}` : `${d(f)} ${t(f)} → ${d(u)} ${t(u)}`;
    },

    fmtWhen(d) {
      if (!d) return '';
      try {
        return new Date(d).toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        return '';
      }
    },

    formatNum(n) {
      return numeral(n || 0).format('0,0');
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
.visitors-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
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
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #475569;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 2px;
}

.back-btn:hover {
  border-color: #8051ff;
  color: #8051ff;
  transform: translateX(-2px);
}

.page-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 1.65rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.7px;
  margin: 0;
  line-height: 1.15;
}

.count-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(128, 81, 255, 0.12);
  color: #8051ff;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.3px;
}

.page-sub {
  font-size: 0.85rem;
  color: #64748b;
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
}

.refresh-btn:hover {
  color: #0f0d24 !important;
  background: rgba(15, 13, 36, 0.05) !important;
}

/* ============================================================
   STATS ROW
   ============================================================ */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-tile {
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 14px;
  padding: 16px 18px;
}

.stat-tile-label {
  font-size: 0.62rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  margin-bottom: 6px;
}

.stat-tile-value {
  font-size: 1.55rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.6px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

/* ============================================================
   FILTERS
   ============================================================ */
.filters-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 16px;
  flex-wrap: wrap;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}

.search-wrap {
  position: relative;
  flex: 1;
  min-width: 220px;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 11px 36px 11px 38px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 0.85rem;
  font-weight: 500;
  color: #0f0d24;
  outline: none;
  transition: border-color 0.2s ease, background 0.2s ease;
  font-family: inherit;
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-input:focus {
  border-color: #8051ff;
  background: #ffffff;
}

.search-clear {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 6px;
}

.search-clear:hover {
  color: #0f0d24;
}

.filter-chips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 999px;
  background: #f1f5f9;
  border: 1px solid transparent;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.filter-chip:hover {
  background: #e2e8f0;
  color: #0f0d24;
}

.filter-chip-active {
  background: #0f0d24;
  color: #ffffff;
  border-color: #0f0d24;
}

.filter-chip-active:hover {
  background: #0f0d24;
  color: #ffffff;
}

/* ============================================================
   LOADING / EMPTY
   ============================================================ */
.loading-block {
  padding: 8px;
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 18px;
}

.empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 24px;
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 18px;
  text-align: center;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}

.empty-icon {
  width: 84px;
  height: 84px;
  border-radius: 24px;
  background: rgba(128, 81, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.empty-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
}

.empty-text {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-top: 6px;
  max-width: 340px;
  line-height: 1.5;
}

.empty-clear-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 22px;
  padding: 10px 20px;
  border-radius: 999px;
  background: transparent;
  color: #8051ff;
  border: 1px solid #e2e8f0;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.empty-clear-btn:hover {
  background: rgba(128, 81, 255, 0.06);
  border-color: #8051ff;
}

/* ============================================================
   LIST
   ============================================================ */
.passes-card {
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}

.pass-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 16px 22px;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s ease;
}

.pass-row:last-child {
  border-bottom: none;
}

.pass-row:hover {
  background: #fafbff;
}

.pass-avatar {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.6px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.65);
}

.pass-body {
  flex: 1;
  min-width: 0;
}

.pass-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.pass-name {
  font-size: 0.92rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pass-status {
  font-size: 0.6rem;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 999px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.status-active {
  background: rgba(122, 184, 0, 0.14);
  color: #3f6b00;
}

.status-used {
  background: rgba(59, 130, 246, 0.12);
  color: #1e40af;
}

.status-inactive {
  background: rgba(148, 163, 184, 0.16);
  color: #475569;
}

.status-suspended {
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
}

.pass-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 500;
  flex-wrap: wrap;
}

.pass-code-chip {
  display: inline-block;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.7rem;
  font-weight: 800;
  color: #8051ff;
  letter-spacing: 0.9px;
  background: rgba(128, 81, 255, 0.1);
  padding: 3px 8px;
  border-radius: 6px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.meta-dot {
  color: #cbd5e1;
}

.pass-host {
  text-align: right;
  flex-shrink: 0;
  min-width: 140px;
}

.host-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f0d24;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.host-estate {
  font-size: 0.7rem;
  color: #8051ff;
  font-weight: 700;
  margin-top: 3px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.pass-window {
  text-align: right;
  flex-shrink: 0;
  min-width: 170px;
}

.window-value {
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
}

.window-sub {
  font-size: 0.68rem;
  color: #3f6b00;
  font-weight: 700;
  margin-top: 2px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.pass-actions {
  position: relative;
  flex-shrink: 0;
}

.icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: #f1f5f9;
  color: #0f0d24;
}

.row-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 6px;
  min-width: 200px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 20px 40px -16px rgba(15, 13, 36, 0.2);
  padding: 6px;
  z-index: 100;
}

.row-menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 9px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.15s ease;
}

.row-menu-item:hover {
  background: #f1f5f9;
  color: #0f0d24;
}

.row-menu-item-danger:hover {
  background: rgba(239, 68, 68, 0.08);
  color: #b91c1c;
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.menu-fade-enter,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 1024px) {
  .pass-window {
    display: none;
  }
}

@media (max-width: 900px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .pass-host {
    display: none;
  }
}

@media (max-width: 767px) {
  .visitors-page {
    gap: 18px;
  }
  .page-title {
    font-size: 1.35rem;
  }
  .page-actions {
    width: 100%;
  }
  .refresh-btn {
    flex: 1;
  }

  .header-left {
    gap: 10px;
  }
  .back-btn {
    width: 36px;
    height: 36px;
  }

  .filters-card {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .search-wrap {
    min-width: 0;
  }
  .pass-row {
    padding: 14px 16px;
    gap: 12px;
    flex-wrap: wrap;
  }
  .pass-avatar {
    width: 42px;
    height: 42px;
  }
}
</style>