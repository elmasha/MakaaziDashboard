<template>
  <div class="residents-page">
    <!-- ============================================================
         PAGE HEADER
         ============================================================ -->
    <div class="page-header">
      <div>
        <div class="page-title-row">
          <h1 class="page-title">Residents</h1>
          <div class="count-pill">{{ filteredResidents.length }}</div>
        </div>
        <p class="page-sub">
          {{ residents.length }} households · {{ approvedCount }} approved ·
          {{ pendingCount }} pending
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
          <v-icon size="18" color="white">mdi-home-group</v-icon>
        </div>
        <div class="summary-body">
          <div class="summary-label">Total households</div>
          <div class="summary-value">{{ residents.length }}</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon summary-icon-lime">
          <v-icon size="18" color="#0A0A14">mdi-check-circle-outline</v-icon>
        </div>
        <div class="summary-body">
          <div class="summary-label">Approved</div>
          <div class="summary-value">{{ approvedCount }}</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon summary-icon-amber">
          <v-icon size="18" color="white">mdi-account-clock-outline</v-icon>
        </div>
        <div class="summary-body">
          <div class="summary-label">Pending approval</div>
          <div class="summary-value">{{ pendingCount }}</div>
        </div>
      </div>

      <div class="summary-card summary-card-highlight">
        <div class="summary-icon summary-icon-white">
          <v-icon size="18" color="#0A0A14">mdi-shield-account-outline</v-icon>
        </div>
        <div class="summary-body">
          <div class="summary-label">Officials in residence</div>
          <div class="summary-value">{{ officialsCount }}</div>
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
          placeholder="Search by owner, phone, house number, or estate"
        />
        <button v-if="search" class="search-clear" @click="search = ''">
          <v-icon size="16">mdi-close-circle</v-icon>
        </button>
      </div>

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
         LOADING
         ============================================================ -->
    <div v-if="loading && !residents.length" class="loading-block">
      <v-skeleton-loader
        type="list-item-avatar-three-line, list-item-avatar-three-line, list-item-avatar-three-line"
      />
    </div>

    <!-- ============================================================
         EMPTY
         ============================================================ -->
    <div v-else-if="!filteredResidents.length" class="empty-card">
      <div class="empty-icon">
        <v-icon size="44" color="#8051FF">
          {{ hasActiveFilters ? 'mdi-filter-off' : 'mdi-home-group' }}
        </v-icon>
      </div>
      <div class="empty-title">
        {{ hasActiveFilters ? 'No matching households' : 'No residents yet' }}
      </div>
      <div class="empty-text">
        {{ hasActiveFilters
          ? 'Try clearing the filters or searching for something else.'
          : 'Households will appear here once residents register.' }}
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
    <div v-else class="residents-card">
      <div
        v-for="r in filteredResidents"
        :key="r.household_id"
        class="resident-row"
        @click="openResident(r)"
      >
        <!-- Avatar -->
        <div class="resident-avatar" :class="avatarClass(r)">
          <span>{{ initialsOf(r.primary_owner) }}</span>
        </div>

        <!-- Body -->
        <div class="resident-body">
          <div class="resident-name-row">
            <span class="resident-name">{{ r.primary_owner }}</span>
            <span class="status-pill" :class="statusClass(r.status)">
              <span class="status-dot"></span>
              {{ r.status }}
            </span>
            <span v-if="r.is_official" class="official-tag">
              <v-icon size="11">mdi-shield-account</v-icon>
              {{ r.official_role || 'Official' }}
            </span>
          </div>
          <div class="resident-meta">
            <span class="meta-item">
              <v-icon size="12">mdi-phone-outline</v-icon>
              {{ r.contact_number }}
            </span>
            <span class="meta-dot">·</span>
            <span class="meta-item">
              <v-icon size="12">mdi-home-outline</v-icon>
              {{ r.house_number || '—' }}
            </span>
            <span class="meta-dot">·</span>
            <span class="meta-item">
              <v-icon size="12">mdi-map-marker-outline</v-icon>
              {{ [r.section, r.court, r.street].filter(Boolean).join(' · ') || '—' }}
            </span>
          </div>
          <div class="resident-estate">
            <v-icon size="12">mdi-office-building-outline</v-icon>
            {{ r.estate_name || 'Unknown estate' }}
          </div>
        </div>

        <!-- Right side -->
        <div class="resident-right">
          <div class="resident-stat">
            <div class="stat-value-sm">{{ fmtDate(r.created_at) }}</div>
            <div class="stat-label">Joined</div>
          </div>
          <button class="icon-btn" @click.stop="toggleMenu(r.household_id)">
            <v-icon size="18">mdi-dots-vertical</v-icon>
          </button>
          <transition name="menu-fade">
            <div v-if="openMenuId === r.household_id" class="row-menu">
              <button class="row-menu-item" @click="viewResident(r)">
                <v-icon size="16" class="mr-2">mdi-eye-outline</v-icon>
                View
              </button>
              <button class="row-menu-item" @click="callResident(r)">
                <v-icon size="16" class="mr-2">mdi-phone-outline</v-icon>
                Call
              </button>
              <button class="row-menu-item" @click="openEstate(r)">
                <v-icon size="16" class="mr-2">mdi-office-building-outline</v-icon>
                View estate
              </button>
            </div>
          </transition>
        </div>

        <v-icon size="18" class="resident-chevron">mdi-chevron-right</v-icon>
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
  name: 'AdminResidents',
  layout: 'admin',

  data() {
    return {
      loading: false,
      residents: [],
      estates: [],
      search: '',
      estateFilter: '',
      statusFilter: '',
      openMenuId: null,
      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    statusOptions() {
      return [
        { label: 'All', value: '' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Rejected', value: 'Rejected' },
      ];
    },
    approvedCount() {
      return this.residents.filter((r) => r.status === 'Approved').length;
    },
    pendingCount() {
      return this.residents.filter((r) => r.status === 'Pending').length;
    },
    officialsCount() {
      return this.residents.filter((r) => r.is_official).length;
    },
    hasActiveFilters() {
      return !!(this.search || this.estateFilter || this.statusFilter);
    },
    filteredResidents() {
      const q = this.search.trim().toLowerCase();
      return this.residents.filter((r) => {
        if (this.estateFilter && r.estate_id !== this.estateFilter) return false;
        if (this.statusFilter && r.status !== this.statusFilter) return false;
        if (!q) return true;
        return (
          (r.primary_owner || '').toLowerCase().includes(q) ||
          (r.contact_number || '').toLowerCase().includes(q) ||
          (r.house_number || '').toLowerCase().includes(q) ||
          (r.estate_name || '').toLowerCase().includes(q)
        );
      });
    },
  },

  mounted() {
    this.load();
    this.loadEstates();
    document.addEventListener('click', this.closeMenuOnClickOutside);
  },

  beforeDestroy() {
    document.removeEventListener('click', this.closeMenuOnClickOutside);
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
        const { data, status } = await axios.get(`${API}/admin/residents`, { headers });
        if (status === 200 && Array.isArray(data)) {
          this.residents = data;
        }
      } catch (err) {
        const s = err.response?.status;
        if (s === 401 || s === 403) {
          this.showSnackbar('Access denied — check admin account', 'error');
        } else if (s === 404) {
          this.residents = [];
        } else {
          console.warn('Residents load failed:', err.message);
          this.showSnackbar('Could not load residents', 'error');
          this.residents = [];
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

    clearFilters() {
      this.search = '';
      this.estateFilter = '';
      this.statusFilter = '';
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

    fmtDate(d) {
      if (!d) return '—';
      try {
        return new Date(d).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      } catch {
        return '—';
      }
    },

    avatarClass(r) {
      if (r.is_official) return 'avatar-official';
      if (r.status === 'Pending') return 'avatar-pending';
      if (r.status === 'Rejected') return 'avatar-rejected';
      if (!r.active) return 'avatar-inactive';
      return 'avatar-active';
    },

    statusClass(status) {
      return `status-${(status || '').toLowerCase()}`;
    },

    /* ============================================================
       NAVIGATION — routes to /admin/resident-view/:id
       ============================================================ */
    openResident(r) {
      this.$router.push(`/admin/resident-view/${r.household_id}`);
    },
    viewResident(r) {
      this.openMenuId = null;
      this.$router.push(`/admin/resident-view/${r.household_id}`);
    },
    openEstate(r) {
      this.openMenuId = null;
      this.$router.push(`/admin/view-estate/${r.estate_id}`);
    },
    callResident(r) {
      this.openMenuId = null;
      if (r.contact_number) {
        window.location.href = `tel:${r.contact_number.replace(/\s+/g, '')}`;
      }
    },
    toggleMenu(id) {
      this.openMenuId = this.openMenuId === id ? null : id;
    },
    closeMenuOnClickOutside() {
      this.openMenuId = null;
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
.residents-page {
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
   SUMMARY GRID
   ============================================================ */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
  transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.22s ease;
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

.summary-card-highlight .summary-label {
  color: rgba(255, 255, 255, 0.55);
}

.summary-card-highlight .summary-value {
  color: #ffffff;
}

.summary-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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
  background: #ffffff;
  box-shadow: 0 8px 20px -10px rgba(255, 255, 255, 0.5);
}

.summary-body { min-width: 0; }

.summary-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  margin-bottom: 5px;
}

.summary-value {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.8px;
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
  gap: 12px;
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

.search-input::placeholder { color: #94a3b8; }
.search-input:focus { border-color: #8051ff; background: #ffffff; }

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
}

.search-clear:hover { color: #0f0d24; }

.filter-select {
  padding: 11px 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 0.82rem;
  font-weight: 600;
  color: #0f0d24;
  outline: none;
  font-family: inherit;
  cursor: pointer;
  min-width: 160px;
}

.filter-select:focus {
  border-color: #8051ff;
  background: #ffffff;
}

.filter-chips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-chip {
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

.filter-chip:hover { background: #e2e8f0; color: #0f0d24; }
.filter-chip-active { background: #0f0d24; color: #ffffff; border-color: #0f0d24; }

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
  padding: 11px 22px;
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
.residents-card {
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}

.resident-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 16px 22px;
  cursor: pointer;
  transition: background 0.15s ease;
  border-bottom: 1px solid #f1f5f9;
}

.resident-row:last-child { border-bottom: none; }
.resident-row:hover { background: #fafbff; }

.resident-avatar {
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
}

.avatar-active {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.65);
}

.avatar-official {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  color: #0a0a14;
  box-shadow: 0 10px 22px -10px rgba(182, 255, 0, 0.7);
}

.avatar-pending {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 10px 22px -10px rgba(245, 158, 11, 0.6);
}

.avatar-rejected {
  background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
  box-shadow: 0 10px 22px -10px rgba(220, 38, 38, 0.55);
}

.avatar-inactive {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  box-shadow: 0 10px 22px -10px rgba(100, 116, 139, 0.5);
}

.resident-body {
  flex: 1;
  min-width: 0;
}

.resident-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.resident-name {
  font-size: 0.92rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.status-approved {
  background: rgba(122, 184, 0, 0.14);
  color: #3f6b00;
}

.status-pending {
  background: rgba(245, 158, 11, 0.14);
  color: #b45309;
}

.status-rejected {
  background: rgba(239, 68, 68, 0.1);
  color: #b91c1c;
}

.official-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(128, 81, 255, 0.12);
  color: #5b21b6;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.resident-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.72rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  margin-bottom: 3px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.meta-dot { color: #cbd5e1; }

.resident-estate {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.resident-right {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.resident-stat {
  text-align: right;
  min-width: 90px;
}

.stat-value-sm {
  font-size: 0.82rem;
  font-weight: 700;
  color: #334155;
}

.stat-label {
  font-size: 0.62rem;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  margin-top: 2px;
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

.icon-btn:hover { background: #f1f5f9; color: #0f0d24; }

.row-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 6px;
  min-width: 180px;
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
  transition: background 0.15s ease, color 0.15s ease;
}

.row-menu-item:hover { background: #f1f5f9; color: #0f0d24; }

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.menu-fade-enter,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.resident-chevron {
  flex-shrink: 0;
  color: #cbd5e1;
  opacity: 0.6;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.resident-row:hover .resident-chevron {
  opacity: 1;
  transform: translateX(2px);
  color: #8051ff;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 900px) {
  .resident-stat { display: none; }
}

@media (max-width: 767px) {
  .residents-page { gap: 18px; }
  .page-title { font-size: 1.35rem; }
  .page-actions { width: 100%; }
  .refresh-btn { flex: 1; }

  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .summary-card { padding: 14px 16px; gap: 10px; }
  .summary-icon { width: 36px; height: 36px; }
  .summary-value { font-size: 1.15rem; }

  .filters-card {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .search-wrap { min-width: 0; }
  .filter-select { min-width: 0; }

  .resident-row { padding: 14px 16px; gap: 14px; }
  .resident-name { max-width: 160px; }
  .resident-avatar { width: 42px; height: 42px; }
}
</style>