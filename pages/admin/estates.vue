<template>
  <div class="estates-page">
    <!-- ============================================================
         PAGE HEADER
         ============================================================ -->
    <div class="page-header">
      <div>
        <div class="page-title-row">
          <h1 class="page-title">Estates</h1>
          <div class="count-pill">{{ filteredEstates.length }}</div>
        </div>
        <p class="page-sub">
          Manage every estate on the platform · {{ subscribedCount }} subscribed
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
         SUPPORT-ADMIN NOTICE (only when not super)
         ============================================================ -->
    <div v-if="isSupportAdmin" class="support-notice">
      <div class="support-notice-icon">
        <v-icon size="16" color="#8051FF">mdi-shield-alert-outline</v-icon>
      </div>
      <div class="support-notice-text">
        Some actions (edit, remove) will be sent to a super admin for approval before they take effect.
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
          placeholder="Search by name, URN, or location"
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
          <span v-if="s.value === ''" class="chip-count">{{ estates.length }}</span>
        </button>
      </div>
    </div>

    <!-- ============================================================
         LOADING
         ============================================================ -->
    <div v-if="loading && !estates.length" class="loading-block">
      <v-skeleton-loader
        type="list-item-avatar-three-line, list-item-avatar-three-line, list-item-avatar-three-line"
      />
    </div>

    <!-- ============================================================
         EMPTY
         ============================================================ -->
    <div v-else-if="!filteredEstates.length" class="empty-card">
      <div class="empty-icon">
        <v-icon size="44" color="#8051FF">
          {{ hasActiveFilters ? 'mdi-filter-off' : 'mdi-office-building-outline' }}
        </v-icon>
      </div>
      <div class="empty-title">
        {{ hasActiveFilters ? 'No matching estates' : 'No estates yet' }}
      </div>
      <div class="empty-text">
        {{ hasActiveFilters
          ? 'Try clearing the filters or searching for something else.'
          : 'Onboard your first estate to get started.' }}
      </div>
      <button
        v-if="hasActiveFilters"
        class="empty-clear-btn"
        @click="clearFilters"
      >
        <v-icon size="16" class="mr-1">mdi-close</v-icon>
        Clear filters
      </button>
      <button
        v-else
        class="empty-create-btn"
        @click="$router.push('/admin/new')"
      >
        <v-icon size="16" class="mr-1" color="#0A0A14">mdi-plus</v-icon>
        Create estate
      </button>
    </div>

    <!-- ============================================================
         LIST
         ============================================================ -->
    <div v-else class="estates-card">
      <div
        v-for="e in filteredEstates"
        :key="e.estate_id"
        class="estate-row"
        @click="openEstate(e)"
      >
        <div class="estate-avatar">
          <span>{{ initialsOf(e.estate_name) }}</span>
        </div>

        <div class="estate-body">
          <div class="estate-name-row">
            <span class="estate-name">{{ e.estate_name }}</span>
            <span v-if="e.sub_active" class="estate-status status-active">
              Subscribed
            </span>
            <span v-else class="estate-status status-inactive">
              Not subscribed
            </span>
          </div>
          <div class="estate-meta">
            <span class="estate-urn">{{ e.estate_urn }}</span>
            <span class="meta-dot">·</span>
            <span class="meta-loc">
              <v-icon size="12">mdi-map-marker-outline</v-icon>
              {{ e.estate_location || 'No location' }}
            </span>
          </div>
        </div>

        <div class="estate-stats">
          <div class="estate-stat">
            <div class="estate-stat-value">{{ e.household_count || 0 }}</div>
            <div class="estate-stat-label">Households</div>
          </div>
          <div class="estate-stat">
            <div class="estate-stat-value">{{ e.official_count || 0 }}</div>
            <div class="estate-stat-label">Officials</div>
          </div>
          <div class="estate-stat">
            <div class="estate-stat-value">
              <span class="stat-currency">KES</span>
              {{ formatNumShort(e.total_collected) }}
            </div>
            <div class="estate-stat-label">Collected</div>
          </div>
        </div>

        <div class="estate-actions" @click.stop>
          <button class="icon-btn" @click="toggleMenu(e.estate_id)">
            <v-icon size="18">mdi-dots-vertical</v-icon>
          </button>
          <transition name="menu-fade">
            <div v-if="openMenuId === e.estate_id" class="row-menu">
              <button class="row-menu-item" @click="viewEstate(e)">
                <v-icon size="16" class="mr-2">mdi-eye-outline</v-icon>
                View
              </button>
              <button class="row-menu-item" @click="editEstate(e)">
                <v-icon size="16" class="mr-2">mdi-pencil-outline</v-icon>
                Edit
                <span v-if="isSupportAdmin" class="menu-tag">Approval</span>
              </button>
              <button class="row-menu-item" @click="viewSubscription(e)">
                <v-icon size="16" class="mr-2">mdi-credit-card-outline</v-icon>
                Subscription
              </button>
              <div class="row-menu-divider"></div>
              <button
                class="row-menu-item row-menu-item-danger"
                @click="removeEstate(e)"
              >
                <v-icon size="16" class="mr-2">mdi-delete-outline</v-icon>
                Remove estate
                <span v-if="isSupportAdmin" class="menu-tag menu-tag-danger">Approval</span>
              </button>
            </div>
          </transition>
        </div>

        <v-icon size="18" class="estate-chevron">mdi-chevron-right</v-icon>
      </div>
    </div>

    <!-- ============================================================
         REMOVE CONFIRM DIALOG
         ============================================================ -->
    <v-dialog v-model="confirmDialog" max-width="440" persistent>
      <div class="confirm-card">
        <div class="confirm-icon confirm-icon-danger">
          <v-icon size="24" color="white">mdi-delete-alert</v-icon>
        </div>

        <div class="confirm-title">
          {{ isSupportAdmin ? 'Request estate removal?' : 'Remove this estate?' }}
        </div>

        <div class="confirm-text">
          <span v-if="isSupportAdmin">
            <strong>{{ estateToRemove?.estate_name }}</strong> cannot be deleted directly.
            This will send a request to a super admin for approval.
          </span>
          <span v-else>
            This will permanently delete <strong>{{ estateToRemove?.estate_name }}</strong>
            and all households, officials, payments, and subscriptions attached to it.
            This action cannot be undone.
          </span>
        </div>

        <div v-if="estateToRemove" class="confirm-estate-preview">
          <div class="confirm-estate-avatar">
            {{ initialsOf(estateToRemove.estate_name) }}
          </div>
          <div class="confirm-estate-info">
            <div class="confirm-estate-name">{{ estateToRemove.estate_name }}</div>
            <div class="confirm-estate-urn">{{ estateToRemove.estate_urn }}</div>
          </div>
        </div>

        <div class="confirm-actions">
          <button
            class="action-btn action-btn-ghost"
            :disabled="removing"
            @click="confirmDialog = false"
          >
            Cancel
          </button>
          <button
            class="action-btn action-btn-danger"
            :disabled="removing"
            @click="confirmRemove"
          >
            <v-icon size="14" class="mr-1">
              {{ removing ? 'mdi-loading' : (isSupportAdmin ? 'mdi-send' : 'mdi-delete') }}
            </v-icon>
            {{ removing
              ? 'Working…'
              : (isSupportAdmin ? 'Send for approval' : 'Remove permanently')
            }}
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3500"
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
  name: 'AdminEstates',
  layout: 'admin',

  data() {
    return {
      loading: false,
      estates: [],
      search: '',
      statusFilter: '',
      openMenuId: null,

      adminRole: null,

      // Remove confirmation
      confirmDialog: false,
      estateToRemove: null,
      removing: false,

      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    isSupportAdmin() {
      return this.adminRole === 'support';
    },
    isSuperAdmin() {
      return this.adminRole === 'super';
    },
    statusOptions() {
      return [
        { label: 'All', value: '' },
        { label: 'Subscribed', value: 'Subscribed' },
        { label: 'Not subscribed', value: 'NotSubscribed' },
      ];
    },
    subscribedCount() {
      return this.estates.filter((e) => e.sub_active).length;
    },
    hasActiveFilters() {
      return !!(this.search || this.statusFilter);
    },
    filteredEstates() {
      const q = this.search.trim().toLowerCase();
      return this.estates.filter((e) => {
        if (this.statusFilter === 'Subscribed' && !e.sub_active) return false;
        if (this.statusFilter === 'NotSubscribed' && e.sub_active) return false;
        if (!q) return true;
        return (
          (e.estate_name || '').toLowerCase().includes(q) ||
          (e.estate_urn || '').toLowerCase().includes(q) ||
          (e.estate_location || '').toLowerCase().includes(q)
        );
      });
    },
  },

  mounted() {
    try {
      this.adminRole = localStorage.getItem('admin_role') || null;
    } catch (e) {
      console.warn(e.message);
    }

    this.load();
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
        const { data, status } = await axios.get(`${API}/admin/estates`, { headers });
        if (status === 200 && Array.isArray(data)) {
          this.estates = data;
        }
      } catch (err) {
        const s = err.response?.status;
        if (s === 401 || s === 403) {
          this.showSnackbar('Access denied — check admin account', 'error');
        } else {
          console.warn('Estates load failed:', err.message);
          this.showSnackbar('Could not load estates', 'error');
        }
        this.estates = [];
      } finally {
        this.loading = false;
      }
    },

    clearFilters() {
      this.search = '';
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

    formatNumShort(n) {
      const v = Number(n) || 0;
      if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
      if (v >= 1_000) return (v / 1_000).toFixed(0) + 'K';
      return numeral(v).format('0,0');
    },

    openEstate(e) {
      this.$router.push(`/admin/view-estate/${e.estate_id}`);
    },

    viewEstate(e) {
      this.openMenuId = null;
      this.$router.push(`/admin/view-estate/${e.estate_id}`);
    },

    editEstate(e) {
      this.openMenuId = null;
      this.$router.push(`/admin/estates/${e.estate_id}/edit`);
    },

    viewSubscription(e) {
      this.openMenuId = null;
      this.$router.push('/admin/subscriptions');
    },

    toggleMenu(id) {
      this.openMenuId = this.openMenuId === id ? null : id;
    },

    closeMenuOnClickOutside() {
      this.openMenuId = null;
    },

    /* ============================================================
       REMOVE — uses confirmation dialog + handles dual response
       ============================================================ */
    removeEstate(e) {
      this.openMenuId = null;
      this.estateToRemove = e;
      this.confirmDialog = true;
    },

    async confirmRemove() {
      if (!this.estateToRemove) return;
      const e = this.estateToRemove;
      this.removing = true;

      try {
        const headers = await this.getAuthHeaders();
        const { data, status } = await axios.delete(
          `${API}/admin/estates/${e.estate_id}`,
          { headers }
        );

        // ─── Super admin: real deletion ───
        if (data?.direct === true) {
          this.estates = this.estates.filter((x) => x.estate_id !== e.estate_id);
          this.showSnackbar(`"${e.estate_name}" removed`, 'success');
        }
        // ─── Support admin: queued for approval (202) ───
        else if (data?.queued === true) {
          this.showSnackbar(
            `Request #${data.request_id} sent to super admins`,
            'success'
          );
        }
        // ─── Fallback (endpoint returned 200 with no `direct` flag) ───
        else if (status >= 200 && status < 300) {
          this.estates = this.estates.filter((x) => x.estate_id !== e.estate_id);
          this.showSnackbar(`"${e.estate_name}" removed`, 'success');
        }
      } catch (err) {
        console.error('removeEstate failed:', err);
        const s = err.response?.status;
        if (s === 401 || s === 403) {
          this.showSnackbar(
            err.response?.data?.error || 'Not authorized for this action',
            'error'
          );
        } else {
          this.showSnackbar(
            err.response?.data?.error || 'Could not remove estate',
            'error'
          );
        }
      } finally {
        this.removing = false;
        this.confirmDialog = false;
        this.estateToRemove = null;
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
.estates-page {
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
   SUPPORT NOTICE
   ============================================================ */
.support-notice {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(155, 108, 255, 0.08) 0%, rgba(128, 81, 255, 0.04) 100%);
  border: 1px solid rgba(128, 81, 255, 0.18);
  border-radius: 14px;
}

.support-notice-icon {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: rgba(128, 81, 255, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.support-notice-text {
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
  line-height: 1.5;
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
  border-radius: 6px;
}

.search-clear:hover { color: #0f0d24; }

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

.filter-chip:hover { background: #e2e8f0; color: #0f0d24; }
.filter-chip-active { background: #0f0d24; color: #ffffff; border-color: #0f0d24; }
.filter-chip-active:hover { background: #0f0d24; color: #ffffff; }

.chip-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  font-size: 0.62rem;
  font-weight: 800;
}

.filter-chip:not(.filter-chip-active) .chip-count {
  background: rgba(15, 13, 36, 0.08);
  color: #475569;
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
  max-width: 320px;
  line-height: 1.5;
}

.empty-create-btn,
.empty-clear-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 22px;
  padding: 11px 22px;
  border-radius: 999px;
  border: none;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  cursor: pointer;
  font-family: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.empty-create-btn {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  color: #0a0a14;
  box-shadow: 0 8px 20px -8px rgba(182, 255, 0, 0.6);
}

.empty-create-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 26px -10px rgba(182, 255, 0, 0.75);
}

.empty-clear-btn {
  background: transparent;
  color: #8051ff;
  border: 1px solid #e2e8f0;
  padding: 10px 20px;
}

.empty-clear-btn:hover {
  background: rgba(128, 81, 255, 0.06);
  border-color: #8051ff;
}

/* ============================================================
   LIST
   ============================================================ */
.estates-card {
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}

.estate-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 16px 22px;
  cursor: pointer;
  transition: background 0.15s ease;
  border-bottom: 1px solid #f1f5f9;
}

.estate-row:last-child { border-bottom: none; }
.estate-row:hover { background: #fafbff; }

.estate-avatar {
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

.estate-body { flex: 1; min-width: 0; }

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
  color: #0f0d24;
  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
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
  color: #3f6b00;
}

.status-inactive {
  background: rgba(148, 163, 184, 0.16);
  color: #475569;
}

.estate-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.72rem;
  color: #94a3b8;
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

.meta-dot { color: #cbd5e1; }

.meta-loc {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

/* Stats */
.estate-stats {
  display: flex;
  align-items: center;
  gap: 28px;
  flex-shrink: 0;
}

.estate-stat {
  text-align: right;
  min-width: 68px;
}

.estate-stat-value {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f0d24;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.4px;
}

.stat-currency {
  font-size: 0.68rem;
  font-weight: 700;
  color: #94a3b8;
  margin-right: 2px;
}

.estate-stat-label {
  font-size: 0.62rem;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  margin-top: 3px;
}

/* Actions */
.estate-actions {
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

.icon-btn:hover { background: #f1f5f9; color: #0f0d24; }

.row-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 6px;
  min-width: 220px;
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

.row-menu-item-danger:hover {
  background: rgba(239, 68, 68, 0.08);
  color: #b91c1c;
}

.menu-tag {
  margin-left: auto;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background: rgba(128, 81, 255, 0.12);
  color: #6d28d9;
}

.menu-tag-danger {
  background: rgba(220, 38, 38, 0.12);
  color: #b91c1c;
}

.row-menu-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 4px 6px;
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

.estate-chevron {
  flex-shrink: 0;
  color: #cbd5e1;
  opacity: 0.6;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.estate-row:hover .estate-chevron {
  opacity: 1;
  transform: translateX(2px);
  color: #8051ff;
}

/* ============================================================
   CONFIRM DIALOG
   ============================================================ */
.confirm-card {
  padding: 28px 26px 22px;
  background: #ffffff;
  border-radius: 22px;
  display: flex;
  flex-direction: column;
}

.confirm-icon {
  width: 52px;
  height: 52px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.confirm-icon-danger {
  background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
  box-shadow: 0 12px 26px -12px rgba(220, 38, 38, 0.7);
}

.confirm-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
  margin-bottom: 8px;
}

.confirm-text {
  font-size: 0.85rem;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 18px;
}

.confirm-estate-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #fafaff;
  border: 1px solid #f0eef8;
  border-radius: 12px;
  margin-bottom: 22px;
}

.confirm-estate-avatar {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.confirm-estate-info { min-width: 0; }

.confirm-estate-name {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f0d24;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.confirm-estate-urn {
  font-size: 0.68rem;
  color: #94a3b8;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-weight: 700;
  margin-top: 2px;
}

.confirm-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 14px;
  border-radius: 12px;
  border: none;
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn-ghost {
  background: #f6f7fb;
  color: #475569;
  border: 1px solid #eef1f6;
}

.action-btn-ghost:hover:not(:disabled) {
  background: #eef1f6;
}

.action-btn-danger {
  background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
  color: #ffffff;
  box-shadow: 0 12px 26px -14px rgba(220, 38, 38, 0.8);
}

.action-btn-danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px -14px rgba(220, 38, 38, 1);
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 900px) {
  .estate-stats { gap: 16px; }
  .estate-stat { min-width: 54px; }
  .estate-stat-value { font-size: 0.85rem; }
}

@media (max-width: 767px) {
  .estates-page { gap: 18px; }
  .page-title { font-size: 1.35rem; }
  .page-actions { width: 100%; }
  .refresh-btn, .new-estate-btn { flex: 1; }

  .support-notice {
    padding: 10px 12px;
    gap: 10px;
  }
  .support-notice-text { font-size: 0.76rem; }

  .filters-card {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .search-wrap { min-width: 0; }
  .estate-stats { display: none; }
  .estate-name { max-width: 160px; }
  .estate-row { padding: 14px 16px; gap: 14px; }
  .estate-avatar { width: 42px; height: 42px; }

  .confirm-card { padding: 22px 20px 18px; }
}
</style>