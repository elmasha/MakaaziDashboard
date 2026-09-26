<template>
  <div class="households-page">
    <!-- ============================================================
         HEADER
         ============================================================ -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Households</h1>
        <p class="page-sub">
          {{ filteredHouseholds.length }} of {{ houseHolds.length }} households
        </p>
      </div>
      <div class="header-actions">
        <button class="quick-btn" @click="refresh" :disabled="loading">
          <v-icon size="16" :class="{ spinning: loading }">mdi-refresh</v-icon>
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- ============================================================
         SEARCH & FILTERS
         ============================================================ -->
    <div class="filter-bar">
      <div class="search-wrap">
        <v-icon size="18" color="#9ca3af" class="search-icon">mdi-magnify</v-icon>
        <input
          v-model="search"
          type="text"
          placeholder="Search by name, phone, house #, or UID"
          class="search-input"
        />
        <button v-if="search" class="search-clear" @click="search = ''">
          <v-icon size="14">mdi-close</v-icon>
        </button>
      </div>

      <div class="filter-tabs">
        <button
          v-for="f in filterOptions"
          :key="f.value"
          class="filter-tab"
          :class="{ 'filter-tab-active': filter === f.value }"
          @click="filter = f.value"
        >
          {{ f.label }}
          <span v-if="f.count !== undefined" class="filter-count">{{ f.count }}</span>
        </button>
      </div>
    </div>

    <!-- ============================================================
         LOADING
         ============================================================ -->
    <div v-if="loading && !houseHolds.length" class="loading-list">
      <v-skeleton-loader type="list-item-avatar-two-line" />
      <v-skeleton-loader type="list-item-avatar-two-line" />
      <v-skeleton-loader type="list-item-avatar-two-line" />
      <v-skeleton-loader type="list-item-avatar-two-line" />
    </div>

    <!-- ============================================================
         EMPTY
         ============================================================ -->
    <div v-else-if="!filteredHouseholds.length" class="empty-state">
      <div class="empty-icon">
        <v-icon size="42" color="#cbd5e1">
          {{ search ? "mdi-magnify-close" : "mdi-home-search-outline" }}
        </v-icon>
      </div>
      <div class="empty-title">
        {{ search ? "No matches" : "No households yet" }}
      </div>
      <div class="empty-text">
        {{ search ? "Try a different search term or clear the filters." : "Households will appear here once residents register." }}
      </div>
      <button v-if="search" class="empty-btn" @click="search = ''">
        Clear search
      </button>
    </div>

    <!-- ============================================================
         LIST
         ============================================================ -->
    <div v-else class="household-list">
      <div
        v-for="h in filteredHouseholds"
        :key="h.household_id"
        class="household-card"
        :class="{ 'household-card-official': h.is_official }"
      >
        <!-- Avatar -->
        <div class="hh-avatar" :class="{ 'hh-avatar-official': h.is_official }">
          {{ initialsOf(h.primary_owner) }}
        </div>

        <!-- Info -->
        <div class="hh-info">
          <div class="hh-name-row">
            <span class="hh-name">{{ h.primary_owner }}</span>
            <v-chip
              v-if="h.is_official"
              x-small
              label
              color="#d1fae5"
              style="color: #065f46; font-weight: 700;"
            >
              <v-icon x-small left color="#065f46">mdi-shield-account</v-icon>
              {{ h.official_role || "Official" }}
            </v-chip>
            <v-chip
              v-if="!isActive(h)"
              x-small
              label
              color="#fef3c7"
              style="color: #92400e; font-weight: 700;"
            >
              Inactive
            </v-chip>
          </div>

          <div class="hh-meta">
            <span class="hh-meta-item">
              <v-icon size="12" color="#9ca3af">mdi-home-outline</v-icon>
              {{ h.house_number || "No #" }}
            </span>
            <span class="hh-meta-dot">·</span>
            <span class="hh-meta-item">
              <v-icon size="12" color="#9ca3af">mdi-phone-outline</v-icon>
              {{ h.contact_number || "—" }}
            </span>
            <span class="hh-meta-dot" v-if="h.section">·</span>
            <span class="hh-meta-item" v-if="h.section">
              <v-icon size="12" color="#9ca3af">mdi-map-marker-outline</v-icon>
              {{ h.section }}
            </span>
          </div>

          <div class="hh-tags">
            <span v-if="h.court" class="hh-tag hh-tag-court">{{ h.court }}</span>
            <span v-if="h.street" class="hh-tag hh-tag-street">{{ h.street }}</span>
            <span v-if="h.residence_status" class="hh-tag hh-tag-status">
              {{ h.residence_status }}
            </span>
            <span v-if="h.caretaker_name" class="hh-tag hh-tag-care">
              <v-icon x-small>mdi-account-supervisor</v-icon>
              {{ h.caretaker_name }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="hh-actions">
          <button
            v-if="!h.is_official"
            class="hh-btn hh-btn-promote"
            @click="openAssign(h)"
          >
            <v-icon size="14">mdi-shield-account-outline</v-icon>
            <span>Make official</span>
          </button>
          <button
            v-else
            class="hh-btn hh-btn-demote"
            @click="openRevoke(h)"
          >
            <v-icon size="14">mdi-account-remove-outline</v-icon>
            <span>Revoke</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================
         ASSIGN OFFICIAL DIALOG
         ============================================================ -->
    <v-dialog v-model="assignDialog" max-width="480" content-class="official-dialog">
      <div class="dialog-shell">
        <!-- Header -->
        <div class="dialog-header">
          <div class="dialog-header-icon">
            <v-icon color="white" size="20">mdi-shield-account</v-icon>
          </div>
          <div class="flex-grow-1" style="min-width: 0">
            <div class="dialog-title">Make official</div>
            <div class="dialog-sub">{{ selected?.primary_owner || "—" }}</div>
          </div>
          <button class="dialog-close" @click="assignDialog = false">
            <v-icon size="18" color="white">mdi-close</v-icon>
          </button>
        </div>

        <!-- Body -->
        <div class="dialog-body">
          <!-- Person preview -->
          <div class="preview-row">
            <div class="preview-avatar">
              {{ initialsOf(selected?.primary_owner) }}
            </div>
            <div class="preview-info">
              <div class="preview-name">{{ selected?.primary_owner }}</div>
              <div class="preview-meta">
                Hs {{ selected?.house_number || "—" }} ·
                {{ selected?.contact_number || "—" }}
              </div>
            </div>
          </div>

          <label class="field-label">Select role</label>
          <div class="role-grid">
            <button
              v-for="r in roles"
              :key="r.name"
              class="role-card"
              :class="{ 'role-card-active': role === r.name }"
              @click="role = r.name"
            >
              <div class="role-icon" :class="`role-icon-${r.color}`">
                <v-icon size="16" color="white">{{ r.icon }}</v-icon>
              </div>
              <div class="role-text">
                <div class="role-name">{{ r.name }}</div>
                <div class="role-sub">{{ r.description }}</div>
              </div>
              <v-icon
                v-if="role === r.name"
                size="18"
                color="#7c3aed"
                class="role-check"
              >
                mdi-check-circle
              </v-icon>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="dialog-footer">
          <v-btn text rounded class="text-capitalize flex-grow-1" @click="assignDialog = false">
            Cancel
          </v-btn>
          <v-btn
            rounded
            depressed
            color="#7c3aed"
            dark
            class="text-capitalize font-weight-bold flex-grow-1"
            :loading="saving"
            :disabled="!role"
            @click="confirmAssign"
          >
            Confirm
          </v-btn>
        </div>
      </div>
    </v-dialog>

    <!-- ============================================================
         CONFIRM REVOKE DIALOG
         ============================================================ -->
    <v-dialog v-model="revokeDialog" max-width="420" content-class="confirm-dialog">
      <div class="confirm-shell">
        <div class="confirm-icon">
          <v-icon size="34" color="#ef4444">mdi-account-remove-outline</v-icon>
        </div>
        <div class="confirm-title">Revoke official role?</div>
        <div class="confirm-text">
          <strong>{{ selected?.primary_owner }}</strong> will lose the
          <strong>{{ selected?.official_role }}</strong> role and return to being a regular resident.
        </div>
        <div class="confirm-actions">
          <v-btn
            block
            rounded
            text
            class="text-capitalize flex-grow-1"
            @click="revokeDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            block
            rounded
            depressed
            color="#ef4444"
            dark
            class="text-capitalize font-weight-bold flex-grow-1"
            :loading="saving"
            @click="confirmRevoke"
          >
            Revoke
          </v-btn>
        </div>
      </div>
    </v-dialog>

    <!-- Snackbars -->
    <v-snackbar v-model="snackbar" color="success" :timeout="2500" top rounded="pill">
      <div class="d-flex align-center">
        <v-icon color="white" small class="mr-2">mdi-check-circle</v-icon>
        <span>{{ snackbarText }}</span>
      </div>
    </v-snackbar>
    <v-snackbar v-model="snackbar2" color="error" :timeout="3000" top rounded="pill">
      <div class="d-flex align-center">
        <v-icon color="white" small class="mr-2">mdi-alert-circle</v-icon>
        <span>{{ snackbarText2 }}</span>
      </div>
    </v-snackbar>
  </div>
</template>

<script>
import axios from "axios";

const API = "https://makaaziserver22.up.railway.app/api";

export default {
  name: "EstateHouseholds",
  props: {
    estateId: { type: Number, required: true },
  },
  data() {
    return {
      loading: false,
      saving: false,
      houseHolds: [],

      // Filters
      search: "",
      filter: "all", // all | official | resident | inactive

      // Assign dialog
      assignDialog: false,
      selected: null,
      role: null,

      // Revoke dialog
      revokeDialog: false,

      // Roles
      roles: [
        {
          name: "Chairman",
          description: "Estate leadership",
          icon: "mdi-crown-outline",
          color: "purple",
        },
        {
          name: "Secretary",
          description: "Records & documents",
          icon: "mdi-file-document-outline",
          color: "blue",
        },
        {
          name: "Treasurer",
          description: "Finances & collections",
          icon: "mdi-cash-multiple",
          color: "green",
        },
      ],

      // Snackbars
      snackbar: false,
      snackbarText: "",
      snackbar2: false,
      snackbarText2: "",
    };
  },
  computed: {
    filterOptions() {
      const list = this.houseHolds;
      return [
        { value: "all", label: "All", count: list.length },
        {
          value: "official",
          label: "Officials",
          count: list.filter((h) => h.is_official).length,
        },
        {
          value: "resident",
          label: "Residents",
          count: list.filter((h) => !h.is_official).length,
        },
        {
          value: "inactive",
          label: "Inactive",
          count: list.filter((h) => !this.isActive(h)).length,
        },
      ];
    },

    filteredHouseholds() {
      const q = (this.search || "").trim().toLowerCase();
      return this.houseHolds.filter((h) => {
        // Filter by tab
        if (this.filter === "official" && !h.is_official) return false;
        if (this.filter === "resident" && h.is_official) return false;
        if (this.filter === "inactive" && this.isActive(h)) return false;

        // Search
        if (!q) return true;
        return (
          (h.primary_owner || "").toLowerCase().includes(q) ||
          (h.contact_number || "").toLowerCase().includes(q) ||
          (h.house_number || "").toLowerCase().includes(q) ||
          (h.uid || "").toLowerCase().includes(q)
        );
      });
    },
  },
  mounted() {
    this.fetchHouseholds();
  },
  methods: {
    // =========================================================
    // DATA
    // =========================================================
    async fetchHouseholds() {
      if (!this.estateId) return;
      this.loading = true;
      try {
        const { data } = await axios.get(
          `${API}/households/getBHsHldEstId/${this.estateId}`
        );
        this.houseHolds = Array.isArray(data) ? data : [];
      } catch (err) {
        console.warn("Households fetch failed:", err.message);
        this.houseHolds = [];
      } finally {
        this.loading = false;
      }
    },

    refresh() {
      return this.fetchHouseholds();
    },

    // =========================================================
    // ASSIGN
    // =========================================================
    openAssign(h) {
      this.selected = h;
      this.role = null;
      this.assignDialog = true;
    },

    async confirmAssign() {
      if (!this.role || !this.selected) return;
      this.saving = true;
      try {
        // 1. Update household
        await axios.patch(
          `${API}/households/update_household/${this.selected.household_id}`,
          { is_official: 1, official_role: this.role }
        );

        // 2. Add to officials table
        await axios.post(`${API}/officials/addOfficial`, {
          full_name: this.selected.primary_owner,
          estate_id: this.estateId,
          role: this.role,
          contact_number: this.selected.contact_number,
          estate_urn: this.selected.estate_urn || null,
          uid: this.selected.uid,
        });

        this.showSuccess(
          `${this.selected.primary_owner} is now ${this.role}`
        );
        this.assignDialog = false;
        this.selected = null;
        this.role = null;
        await this.fetchHouseholds();
      } catch (err) {
        console.error(err);
        this.showError(
          err.response?.data?.error || "Could not assign official"
        );
      } finally {
        this.saving = false;
      }
    },

    // =========================================================
    // REVOKE
    // =========================================================
    openRevoke(h) {
      this.selected = h;
      this.revokeDialog = true;
    },

    async confirmRevoke() {
      if (!this.selected) return;
      this.saving = true;
      try {
        // 1. Demote the household
        await axios.patch(
          `${API}/households/update_household/${this.selected.household_id}`,
          { is_official: 0, official_role: "none" }
        );

        // 2. Delete from officials table (by contact_number)
        await axios
          .put(`${API}/officials/delete_official/${this.selected.contact_number}`)
          .catch(() => null); // ignore if route differs

        this.showSuccess(`${this.selected.primary_owner} demoted`);
        this.revokeDialog = false;
        this.selected = null;
        await this.fetchHouseholds();
      } catch (err) {
        console.error(err);
        this.showError(
          err.response?.data?.error || "Could not revoke official"
        );
      } finally {
        this.saving = false;
      }
    },

    // =========================================================
    // HELPERS
    // =========================================================
    initialsOf(name) {
      if (!name) return "?";
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
    },

    isActive(h) {
      const v = h?.active;
      return v === 1 || v === "1" || v === true;
    },

    showSuccess(msg) {
      this.snackbar = true;
      this.snackbarText = msg;
    },
    showError(msg) {
      this.snackbar2 = true;
      this.snackbarText2 = msg;
    },
  },
};
</script>

<style scoped>
.households-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1200px;
}

/* ============================================================
   HEADER
   ============================================================ */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -0.4px;
  margin: 0;
}

.page-sub {
  font-size: 0.82rem;
  color: #7c7a95;
  margin: 4px 0 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.quick-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  background: white;
  border: 1px solid #e9e7f2;
  border-radius: 10px;
  color: #4b5563;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.quick-btn:hover:not(:disabled) {
  border-color: #7c3aed;
  color: #7c3aed;
  transform: translateY(-1px);
}

.quick-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ============================================================
   FILTER BAR
   ============================================================ */
.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: white;
  border: 1px solid #e9e7f2;
  border-radius: 16px;
  padding: 14px 16px;
}

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  pointer-events: none;
}

.search-input {
  flex: 1;
  width: 100%;
  padding: 11px 40px 11px 42px;
  border: 1px solid #e9e7f2;
  border-radius: 12px;
  font-size: 0.85rem;
  font-family: inherit;
  color: #1e1b4b;
  background: #fafaff;
  transition: all 0.2s ease;
  outline: none;
}

.search-input:focus {
  border-color: #7c3aed;
  background: white;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.08);
}

.search-input::placeholder {
  color: #b9b7c9;
}

.search-clear {
  position: absolute;
  right: 12px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e9e7f2;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: background 0.2s ease;
}

.search-clear:hover {
  background: #c7b8ff;
  color: white;
}

.filter-tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.filter-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  border: 1px solid #e9e7f2;
  border-radius: 10px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #7c7a95;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.filter-tab:hover {
  color: #7c3aed;
  border-color: #c7b8ff;
}

.filter-tab-active {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  border-color: transparent;
  color: white;
  box-shadow: 0 6px 16px -6px rgba(124, 58, 237, 0.6);
}

.filter-count {
  background: rgba(255, 255, 255, 0.25);
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 0.68rem;
  font-weight: 800;
}

.filter-tab:not(.filter-tab-active) .filter-count {
  background: #f3f4f6;
  color: #6b7280;
}

/* ============================================================
   LIST
   ============================================================ */
.household-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.loading-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
}

.household-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: white;
  border: 1px solid #e9e7f2;
  border-radius: 14px;
  transition: all 0.2s ease;
}

.household-card:hover {
  border-color: #c7b8ff;
  box-shadow: 0 8px 20px -10px rgba(124, 58, 237, 0.15);
  transform: translateY(-1px);
}

.household-card-official {
  background: linear-gradient(135deg, #f9fdf9, #f0fdf4);
  border-color: #bbf7d0;
}

.hh-avatar {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  font-size: 0.82rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.5px;
  box-shadow: 0 6px 14px -6px rgba(124, 58, 237, 0.5);
}

.hh-avatar-official {
  background: linear-gradient(135deg, #059669, #10b981);
  box-shadow: 0 6px 14px -6px rgba(16, 185, 129, 0.5);
}

.hh-info {
  flex: 1;
  min-width: 0;
}

.hh-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.hh-name {
  font-size: 0.92rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hh-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 0.76rem;
  color: #6b7280;
  margin-bottom: 8px;
}

.hh-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.hh-meta-dot {
  color: #cbd5e1;
}

.hh-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.hh-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.2px;
}

.hh-tag-court {
  background: #dbeafe;
  color: #1d4ed8;
}

.hh-tag-street {
  background: #d1fae5;
  color: #065f46;
}

.hh-tag-status {
  background: #f3f4f6;
  color: #4b5563;
}

.hh-tag-care {
  background: #fef3c7;
  color: #92400e;
}

.hh-actions {
  flex-shrink: 0;
}

.hh-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  white-space: nowrap;
}

.hh-btn-promote {
  background: #f3eeff;
  color: #7c3aed;
  border-color: #e9e0ff;
}

.hh-btn-promote:hover {
  background: #7c3aed;
  color: white;
  box-shadow: 0 6px 14px -6px rgba(124, 58, 237, 0.6);
}

.hh-btn-demote {
  background: #fef2f2;
  color: #ef4444;
  border-color: #fecaca;
}

.hh-btn-demote:hover {
  background: #ef4444;
  color: white;
  box-shadow: 0 6px 14px -6px rgba(239, 68, 68, 0.6);
}

/* ============================================================
   EMPTY STATE
   ============================================================ */
.empty-state {
  padding: 60px 24px;
  text-align: center;
  background: white;
  border: 1px solid #e9e7f2;
  border-radius: 18px;
}

.empty-icon {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: #fafaff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.empty-title {
  font-size: 1rem;
  font-weight: 800;
  color: #1e1b4b;
}

.empty-text {
  font-size: 0.82rem;
  color: #9ca3af;
  margin-top: 6px;
  max-width: 360px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
}

.empty-btn {
  margin-top: 16px;
  padding: 9px 18px;
  background: #f3eeff;
  border: 1px solid #e9e0ff;
  border-radius: 10px;
  color: #7c3aed;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.empty-btn:hover {
  background: #7c3aed;
  color: white;
}

/* ============================================================
   DIALOG — Assign
   ============================================================ */
::v-deep .official-dialog {
  overflow: hidden !important;
  border-radius: 22px !important;
  margin: 16px auto !important;
  max-width: 480px !important;
  width: calc(100% - 32px) !important;
  max-height: calc(100vh - 32px) !important;
  display: flex !important;
  flex-direction: column !important;
  box-shadow: 0 30px 60px -20px rgba(30, 27, 75, 0.35) !important;
}

.dialog-shell {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  min-height: 0;
  background: white;
  border-radius: 22px;
  overflow: hidden;
  width: 100%;
}

.dialog-header {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  padding: 16px 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
}

.dialog-header::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255,255,255,0.18), transparent 50%);
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
  font-size: 0.98rem;
  font-weight: 800;
  line-height: 1.2;
}

.dialog-sub {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  padding: 22px 24px;
  overflow-y: auto;
  min-height: 0;
  flex: 1 1 auto;
}

.preview-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #fafaff;
  border: 1px solid #e9e7f2;
  border-radius: 12px;
  margin-bottom: 20px;
}

.preview-avatar {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  font-size: 0.78rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.preview-info {
  min-width: 0;
}

.preview-name {
  font-size: 0.88rem;
  font-weight: 800;
  color: #1e1b4b;
}

.preview-meta {
  font-size: 0.74rem;
  color: #9ca3af;
  margin-top: 2px;
}

.field-label {
  display: block;
  font-size: 0.74rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 8px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.role-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.role-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: white;
  border: 1px solid #e9e7f2;
  border-radius: 12px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.2s ease;
  width: 100%;
}

.role-card:hover {
  border-color: #c7b8ff;
  background: #fafaff;
}

.role-card-active {
  border-color: #7c3aed;
  background: #faf8ff;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.08);
}

.role-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.role-icon-purple {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
}
.role-icon-blue {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
}
.role-icon-green {
  background: linear-gradient(135deg, #059669, #10b981);
}

.role-text {
  flex: 1;
  min-width: 0;
}

.role-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: #1e1b4b;
}

.role-sub {
  font-size: 0.72rem;
  color: #9ca3af;
  margin-top: 2px;
}

.role-check {
  flex-shrink: 0;
}

.dialog-footer {
  padding: 14px 20px 16px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  gap: 8px;
  background: white;
  flex-shrink: 0;
}

/* ============================================================
   DIALOG — Confirm revoke
   ============================================================ */
::v-deep .confirm-dialog {
  border-radius: 22px !important;
  overflow: hidden !important;
  margin: 16px auto !important;
  max-width: 420px !important;
  width: calc(100% - 32px) !important;
  box-shadow: 0 30px 60px -20px rgba(30, 27, 75, 0.35) !important;
}

.confirm-shell {
  background: white;
  padding: 28px 24px 20px;
  text-align: center;
}

.confirm-icon {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: #fef2f2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.confirm-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -0.3px;
  margin-bottom: 8px;
}

.confirm-text {
  font-size: 0.85rem;
  color: #6b7280;
  line-height: 1.55;
  margin-bottom: 22px;
}

.confirm-text strong {
  color: #1e1b4b;
  font-weight: 700;
}

.confirm-actions {
  display: flex;
  gap: 8px;
}

/* ============================================================
   Responsive
   ============================================================ */
@media (max-width: 700px) {
  .household-card {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .hh-avatar {
    align-self: flex-start;
  }

  .hh-actions {
    width: 100%;
  }

  .hh-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>