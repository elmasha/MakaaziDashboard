<template>
  <div class="vehicles-page">
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
            <h1 class="page-title">Vehicles</h1>
            <div class="count-pill">{{ filteredVehicles.length }}</div>
          </div>
          <p class="page-sub">
            Every registered vehicle across all estates
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
        <v-btn
          color="#B6FF00"
          rounded
          depressed
          class="text-capitalize new-vehicle-btn"
          @click="openAdd"
        >
          <v-icon left small color="#0A0A14">mdi-plus</v-icon>
          <span style="color:#0A0A14; font-weight:700;">Add vehicle</span>
        </v-btn>
      </div>
    </div>

    <!-- ============================================================
         STATS ROW
         ============================================================ -->
    <div class="stats-row">
      <div class="stat-tile">
        <div class="stat-tile-label">Active</div>
        <div class="stat-tile-value">{{ formatNum(stats.active_vehicles) }}</div>
      </div>
      <div class="stat-tile" :class="{ 'stat-tile-alert': stats.pending_vehicles > 0 }">
        <div class="stat-tile-label">Pending</div>
        <div class="stat-tile-value">{{ formatNum(stats.pending_vehicles) }}</div>
      </div>
      <div class="stat-tile">
        <div class="stat-tile-label">Total</div>
        <div class="stat-tile-value">{{ formatNum(stats.total_vehicles) }}</div>
      </div>
      <div class="stat-tile">
        <div class="stat-tile-label">Entries today</div>
        <div class="stat-tile-value">{{ formatNum(stats.today_entries) }}</div>
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
          placeholder="Search by plate, make, owner, or estate"
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
    <div v-if="loading && !vehicles.length" class="loading-block">
      <v-skeleton-loader
        type="list-item-avatar-three-line, list-item-avatar-three-line, list-item-avatar-three-line"
      />
    </div>

    <!-- ============================================================
         EMPTY
         ============================================================ -->
    <div v-else-if="!filteredVehicles.length" class="empty-card">
      <div class="empty-icon">
        <v-icon size="44" color="#8051FF">mdi-car-off</v-icon>
      </div>
      <div class="empty-title">
        {{ hasActiveFilters ? 'No matching vehicles' : 'No vehicles yet' }}
      </div>
      <div class="empty-text">
        {{ hasActiveFilters
          ? 'Try clearing the filters or searching for something else.'
          : 'Add the first vehicle to get started.' }}
      </div>
      <button
        v-if="hasActiveFilters"
        class="empty-clear-btn"
        @click="clearFilters"
      >
        <v-icon size="16" class="mr-1">mdi-close</v-icon>
        Clear filters
      </button>
      <button v-else class="empty-create-btn" @click="openAdd">
        <v-icon size="16" class="mr-1" color="#0A0A14">mdi-plus</v-icon>
        Add vehicle
      </button>
    </div>

    <!-- ============================================================
         LIST
         ============================================================ -->
    <div v-else class="vehicles-card">
      <div
        v-for="v in filteredVehicles"
        :key="v.vehicle_id"
        class="vehicle-row"
      >
        <div class="vehicle-avatar">
          <v-icon size="20" color="white">{{ iconFor(v.vehicle_type) }}</v-icon>
        </div>

        <div class="vehicle-body">
          <div class="vehicle-name-row">
            <span class="vehicle-plate">{{ v.plate_number }}</span>
            <span class="vehicle-status" :class="statusClass(v.status)">
              {{ v.status }}
            </span>
          </div>
          <div class="vehicle-meta">
            <span class="meta-make">
              {{ [v.make, v.model].filter(Boolean).join(' ') || 'No make/model' }}
            </span>
            <template v-if="v.color || v.year">
              <span class="meta-dot">·</span>
              <span>
                <template v-if="v.color">{{ v.color }}</template>
                <template v-if="v.color && v.year">, </template>
                <template v-if="v.year">{{ v.year }}</template>
              </span>
            </template>
            <span class="meta-dot">·</span>
            <span class="meta-estate">
              <v-icon size="12">mdi-office-building-outline</v-icon>
              {{ v.estate_name || '—' }}
            </span>
          </div>
        </div>

        <div class="vehicle-owner">
          <div class="owner-name">{{ v.household_owner || 'Unassigned' }}</div>
          <div class="owner-house" v-if="v.house_number">
            House #{{ v.house_number }}
          </div>
          <div class="owner-phone" v-else-if="v.household_phone">
            {{ v.household_phone }}
          </div>
        </div>

        <div class="vehicle-actions">
          <button class="icon-btn" @click.stop="toggleMenu(v.vehicle_id)">
            <v-icon size="18">mdi-dots-vertical</v-icon>
          </button>
          <transition name="menu-fade">
            <div v-if="openMenuId === v.vehicle_id" class="row-menu" @click.stop>
              <button
                v-if="v.status === 'Pending'"
                class="row-menu-item"
                @click="approve(v)"
              >
                <v-icon size="16" class="mr-2" color="#3f6b00">mdi-check</v-icon>
                Approve
              </button>
              <button
                v-if="v.status === 'Active'"
                class="row-menu-item"
                @click="suspend(v)"
              >
                <v-icon size="16" class="mr-2" color="#b45309">mdi-pause</v-icon>
                Suspend
              </button>
              <button
                v-if="v.status === 'Suspended'"
                class="row-menu-item"
                @click="approve(v)"
              >
                <v-icon size="16" class="mr-2" color="#3f6b00">mdi-play</v-icon>
                Reactivate
              </button>
              <div class="row-menu-divider"></div>
              <button
                class="row-menu-item row-menu-item-danger"
                @click="remove(v)"
              >
                <v-icon size="16" class="mr-2">mdi-delete-outline</v-icon>
                Delete vehicle
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- ============================================================
         ADD DIALOG
         ============================================================ -->
    <v-dialog v-model="dialog" max-width="520" persistent>
      <div class="dialog-shell">
        <div class="dialog-header">
          <div class="dialog-header-icon">
            <v-icon color="white" size="20">mdi-car-plus</v-icon>
          </div>
          <div class="flex-grow-1">
            <div class="dialog-title">Add vehicle</div>
            <div class="dialog-sub">Create a vehicle on behalf of a household</div>
          </div>
          <button class="dialog-close" @click="dialog = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>

        <div class="dialog-body">
          <div class="field">
            <label class="field-label">Estate *</label>
            <select v-model="form.estate_id" class="field-input" @change="loadHouseholds">
              <option :value="null">— Select estate —</option>
              <option v-for="e in estates" :key="e.estate_id" :value="e.estate_id">
                {{ e.estate_name }}
              </option>
            </select>
          </div>

          <div class="field">
            <label class="field-label">Household</label>
            <select v-model="form.household_id" class="field-input">
              <option :value="null">— No specific household —</option>
              <option v-for="h in households" :key="h.household_id" :value="h.household_id">
                {{ h.primary_owner }}<template v-if="h.house_number"> — #{{ h.house_number }}</template>
              </option>
            </select>
          </div>

          <div class="field">
            <label class="field-label">Plate number *</label>
            <input v-model="form.plate_number" class="field-input" placeholder="KDA 123X" />
          </div>

          <div class="field-row">
            <div class="field">
              <label class="field-label">Make</label>
              <input v-model="form.make" class="field-input" placeholder="Toyota" />
            </div>
            <div class="field">
              <label class="field-label">Model</label>
              <input v-model="form.model" class="field-input" placeholder="Corolla" />
            </div>
          </div>

          <div class="field-row">
            <div class="field">
              <label class="field-label">Color</label>
              <input v-model="form.color" class="field-input" placeholder="White" />
            </div>
            <div class="field">
              <label class="field-label">Year</label>
              <input v-model.number="form.year" type="number" class="field-input" placeholder="2018" />
            </div>
          </div>

          <div class="field">
            <label class="field-label">Type</label>
            <select v-model="form.vehicle_type" class="field-input">
              <option value="car">Car</option>
              <option value="motorbike">Motorbike</option>
              <option value="truck">Truck</option>
              <option value="van">Van</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div v-if="submitError" class="form-error">{{ submitError }}</div>
        </div>

        <div class="dialog-footer">
          <button class="btn-ghost" @click="dialog = false" :disabled="saving">Cancel</button>
          <button class="btn-lime" @click="submit" :disabled="saving">
            <v-icon v-if="saving" size="14" class="spin mr-1">mdi-loading</v-icon>
            {{ saving ? 'Saving…' : 'Save vehicle' }}
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
import numeral from 'numeral';

const API = 'https://makaaziserver22.up.railway.app/api';

export default {
  name: 'AdminVehicles',
  layout: 'admin',

  data() {
    return {
      loading: false,
      saving: false,
      search: '',
      statusFilter: '',
      vehicles: [],
      estates: [],
      households: [],
      stats: {
        active_vehicles: 0,
        pending_vehicles: 0,
        total_vehicles: 0,
        active_passes: 0,
        today_entries: 0,
      },
      openMenuId: null,
      dialog: false,
      submitError: '',
      form: this.blankForm(),
      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    statusOptions() {
      return [
        { label: 'All', value: '' },
        { label: 'Active', value: 'Active' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Suspended', value: 'Suspended' },
      ];
    },
    hasActiveFilters() {
      return !!(this.search || this.statusFilter);
    },
    filteredVehicles() {
      const q = this.search.trim().toLowerCase();
      return this.vehicles.filter((v) => {
        if (this.statusFilter && v.status !== this.statusFilter) return false;
        if (!q) return true;
        return (
          (v.plate_number || '').toLowerCase().includes(q) ||
          (v.make || '').toLowerCase().includes(q) ||
          (v.model || '').toLowerCase().includes(q) ||
          (v.household_owner || '').toLowerCase().includes(q) ||
          (v.estate_name || '').toLowerCase().includes(q)
        );
      });
    },
  },

  mounted() {
    this.load();
    this.fetchEstates();
    document.addEventListener('click', this.closeMenu);
  },

  beforeDestroy() {
    document.removeEventListener('click', this.closeMenu);
  },

  methods: {
    blankForm() {
      return {
        estate_id: null,
        household_id: null,
        plate_number: '',
        make: '',
        model: '',
        color: '',
        year: null,
        vehicle_type: 'car',
        status: 'Active',
      };
    },

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
        const { data } = await axios.get(`${API}/admin/vehicles`, { headers });
        this.vehicles = Array.isArray(data) ? data : [];
      } catch (err) {
        const s = err.response?.status;
        if (s === 401 || s === 403) {
          this.showSnackbar('Access denied — check admin account', 'error');
        } else {
          this.showSnackbar('Could not load vehicles', 'error');
        }
        this.vehicles = [];
      } finally {
        this.loading = false;
      }
      this.loadStats();
    },

    async loadStats() {
      try {
        const headers = await this.getAuthHeaders();
        const { data } = await axios.get(`${API}/admin/vehicle-stats`, { headers });
        this.stats = { ...this.stats, ...(data || {}) };
      } catch (_) {}
    },

    async fetchEstates() {
      try {
        const headers = await this.getAuthHeaders();
        const { data } = await axios.get(`${API}/admin/estates`, { headers });
        this.estates = Array.isArray(data) ? data : [];
      } catch (_) {}
    },

    async loadHouseholds() {
      this.households = [];
      this.form.household_id = null;
      if (!this.form.estate_id) return;
      try {
        const headers = await this.getAuthHeaders();
        const { data } = await axios.get(
          `${API}/households/getBHsHldEstId/${this.form.estate_id}`,
          { headers }
        );
        this.households = Array.isArray(data) ? data : [];
      } catch (_) {}
    },

    openAdd() {
      this.form = this.blankForm();
      this.households = [];
      this.submitError = '';
      this.dialog = true;
    },

    async submit() {
      this.submitError = '';
      if (!this.form.estate_id || !this.form.plate_number.trim()) {
        this.submitError = 'Estate and plate number are required';
        return;
      }
      this.saving = true;
      try {
        const headers = await this.getAuthHeaders();
        await axios.post(
          `${API}/admin/vehicles`,
          {
            ...this.form,
            plate_number: this.form.plate_number.toUpperCase().trim(),
          },
          { headers }
        );
        this.dialog = false;
        this.showSnackbar('Vehicle created');
        this.load();
      } catch (err) {
        this.submitError = err.response?.data?.error || 'Failed to create';
      } finally {
        this.saving = false;
      }
    },

    async approve(v) {
      this.openMenuId = null;
      try {
        const headers = await this.getAuthHeaders();
        await axios.post(`${API}/admin/vehicles/${v.vehicle_id}/approve`, {}, { headers });
        this.showSnackbar('Vehicle approved');
        this.load();
      } catch (err) {
        this.showSnackbar(err.response?.data?.error || 'Failed', 'error');
      }
    },

    async suspend(v) {
      this.openMenuId = null;
      try {
        const headers = await this.getAuthHeaders();
        await axios.post(`${API}/admin/vehicles/${v.vehicle_id}/suspend`, {}, { headers });
        this.showSnackbar('Vehicle suspended');
        this.load();
      } catch (err) {
        this.showSnackbar(err.response?.data?.error || 'Failed', 'error');
      }
    },

    async remove(v) {
      this.openMenuId = null;
      if (!window.confirm(`Delete vehicle ${v.plate_number}? This cannot be undone.`)) return;
      try {
        const headers = await this.getAuthHeaders();
        await axios.delete(`${API}/admin/vehicles/${v.vehicle_id}`, { headers });
        this.vehicles = this.vehicles.filter((x) => x.vehicle_id !== v.vehicle_id);
        this.showSnackbar('Vehicle removed');
      } catch (err) {
        this.showSnackbar(err.response?.data?.error || 'Failed', 'error');
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

    iconFor(type) {
      return {
        car: 'mdi-car',
        motorbike: 'mdi-motorbike',
        truck: 'mdi-truck',
        van: 'mdi-van-utility',
      }[type] || 'mdi-car-estate';
    },

    statusClass(s) {
      return {
        Active: 'status-active',
        Pending: 'status-pending',
        Suspended: 'status-suspended',
        Removed: 'status-inactive',
      }[s] || 'status-inactive';
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
.vehicles-page {
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

.new-vehicle-btn {
  font-weight: 800 !important;
  font-size: 0.78rem !important;
  letter-spacing: 0.6px !important;
  text-transform: uppercase !important;
  box-shadow: 0 8px 20px -8px rgba(182, 255, 0, 0.65);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 18px !important;
}

.new-vehicle-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px -8px rgba(182, 255, 0, 0.8);
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
  transition: all 0.2s ease;
}

.stat-tile-alert {
  background: linear-gradient(135deg, #fff8e6 0%, #ffefc2 100%);
  border-color: #fcd34d;
}

.stat-tile-label {
  font-size: 0.62rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  margin-bottom: 6px;
}

.stat-tile-alert .stat-tile-label {
  color: #b45309;
}

.stat-tile-value {
  font-size: 1.55rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.6px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.stat-tile-alert .stat-tile-value {
  color: #b45309;
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
  transition: all 0.2s ease;
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
}

.empty-clear-btn:hover {
  background: rgba(128, 81, 255, 0.06);
  border-color: #8051ff;
}

/* ============================================================
   LIST
   ============================================================ */
.vehicles-card {
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 18px;
  /* NOTE: no overflow:hidden — it would clip the row dropdown menus */
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}

/* Restore the card's rounded look by rounding the first/last row corners */
.vehicle-row:first-child {
  border-top-left-radius: 17px;
  border-top-right-radius: 17px;
}

.vehicle-row:last-child {
  border-bottom-left-radius: 17px;
  border-bottom-right-radius: 17px;
}

.vehicle-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 16px 22px;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s ease;
}

.vehicle-row:last-child {
  border-bottom: none;
}

.vehicle-row:hover {
  background: #fafbff;
}

.vehicle-avatar {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.65);
}

.vehicle-body {
  flex: 1;
  min-width: 0;
}

.vehicle-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.vehicle-plate {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.92rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: 0.6px;
}

.vehicle-status {
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

.status-pending {
  background: rgba(245, 158, 11, 0.16);
  color: #92400e;
}

.status-suspended {
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
}

.status-inactive {
  background: rgba(148, 163, 184, 0.16);
  color: #475569;
}

.vehicle-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 500;
  flex-wrap: wrap;
}

.meta-dot {
  color: #cbd5e1;
}

.meta-estate {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: #8051ff;
  font-weight: 700;
}

.vehicle-owner {
  text-align: right;
  flex-shrink: 0;
  min-width: 140px;
}

.owner-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f0d24;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.owner-house,
.owner-phone {
  font-size: 0.7rem;
  color: #94a3b8;
  font-weight: 600;
  margin-top: 2px;
}

.vehicle-actions {
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
  top: calc(100% + 2px);
  right: 0;
  min-width: 200px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 20px 40px -16px rgba(15, 13, 36, 0.2);
  padding: 6px;
  z-index: 1000;
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

/* ============================================================
   DIALOG
   ============================================================ */
.dialog-shell {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 24px 60px -20px rgba(15, 13, 36, 0.5);
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 22px;
  border-bottom: 1px solid #f1f5f9;
}

.dialog-header-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 16px -8px rgba(128, 81, 255, 0.65);
}

.dialog-title {
  font-weight: 800;
  color: #0f0d24;
  font-size: 0.95rem;
}

.dialog-sub {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 2px;
  font-weight: 500;
}

.dialog-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.dialog-close:hover {
  background: #f1f5f9;
  color: #0f0d24;
}

.dialog-body {
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 60vh;
  overflow-y: auto;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field-label {
  font-size: 0.7rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.field-input {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.88rem;
  background: #f8fafc;
  outline: none;
  font-family: inherit;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}

.field-input:focus {
  border-color: #8051ff;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(128, 81, 255, 0.1);
}

select.field-input {
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'><polyline points='6 9 12 15 18 9'/></svg>");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
  cursor: pointer;
}

.form-error {
  color: #dc2626;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 8px 12px;
  background: #fef2f2;
  border-radius: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 22px;
  border-top: 1px solid #f1f5f9;
  background: #fafbfc;
}

.btn-ghost {
  padding: 11px 20px;
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  background: #f1f5f9;
}

.btn-lime {
  padding: 11px 22px;
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  border: none;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 800;
  color: #0a0a14;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 8px 18px -8px rgba(182, 255, 0, 0.6);
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
}

.btn-lime:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-lime:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spin {
  animation: spin 1s linear infinite;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 900px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .vehicle-owner {
    display: none;
  }
}

@media (max-width: 767px) {
  .vehicles-page {
    gap: 18px;
  }
  .page-title {
    font-size: 1.35rem;
  }
  .page-actions {
    width: 100%;
  }
  .refresh-btn,
  .new-vehicle-btn {
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
  .vehicle-row {
    padding: 14px 16px;
    gap: 14px;
  }
  .vehicle-avatar {
    width: 42px;
    height: 42px;
  }
  .field-row {
    grid-template-columns: 1fr;
  }
}
</style>