<template>
  <div class="officials-page">
    <!-- ============================================================
         HEADER
         ============================================================ -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Estate officials</h1>
        <p class="page-sub">
          {{ officials.length }} {{ officials.length === 1 ? "official" : "officials" }} managing this estate
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
         OFFICIALS GRID
         ============================================================ -->
    <div v-if="loading && !officials.length" class="loading-grid">
      <v-skeleton-loader type="card" />
      <v-skeleton-loader type="card" />
      <v-skeleton-loader type="card" />
    </div>

    <div v-else-if="!officials.length" class="empty-state">
      <div class="empty-icon">
        <v-icon size="42" color="#cbd5e1">mdi-shield-account-outline</v-icon>
      </div>
      <div class="empty-title">No officials yet</div>
      <div class="empty-text">
        Assign a household to a role from the residents page to create an official.
      </div>
    </div>

    <div v-else class="officials-grid">
      <div
        v-for="official in officials"
        :key="official.official_id"
        class="official-card"
      >
        <!-- Role badge -->
        <div class="official-badge" :class="badgeClass(official.role)">
          {{ official.role }}
        </div>

        <!-- Avatar -->
        <div class="official-avatar">
          {{ initialsOf(official.full_name) }}
        </div>

        <!-- Info -->
        <div class="official-name">{{ official.full_name }}</div>
        <div class="official-contact">
          <v-icon size="12" color="#9ca3af">mdi-phone-outline</v-icon>
          {{ official.contact_number || "—" }}
        </div>

        <!-- URN -->
        <div v-if="official.estate_urn" class="official-urn">
          {{ official.estate_urn }}
        </div>

        <!-- Actions -->
        <div class="official-actions">
          <button class="official-btn official-btn-call" @click="callOfficial(official)">
            <v-icon size="14">mdi-phone</v-icon>
            <span>Call</span>
          </button>
          <button
            class="official-btn official-btn-remove"
            @click="askRemove(official)"
          >
            <v-icon size="14">mdi-account-remove-outline</v-icon>
            <span>Remove</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================
         INFO CARD
         ============================================================ -->
    <div class="info-card">
      <v-icon size="16" color="#7c3aed">mdi-information-outline</v-icon>
      <span>
        Officials are households with elevated privileges — Chairman, Secretary,
        and Treasurer. Removing an official demotes them back to a regular resident.
      </span>
    </div>

    <!-- ============================================================
         CONFIRM REMOVE DIALOG
         ============================================================ -->
    <v-dialog v-model="confirmDialog" max-width="440" content-class="confirm-dialog">
      <div class="confirm-shell">
        <div class="confirm-icon">
          <v-icon size="34" color="#ef4444">mdi-account-remove-outline</v-icon>
        </div>
        <div class="confirm-title">Remove this official?</div>
        <div class="confirm-text">
          <strong>{{ selectedOfficial?.full_name }}</strong> will lose the
          <strong>{{ selectedOfficial?.role }}</strong> role and return to being a regular resident.
        </div>
        <div class="confirm-actions">
          <v-btn
            block
            rounded
            text
            class="text-capitalize flex-grow-1"
            @click="confirmDialog = false"
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
            :loading="removing"
            @click="confirmRemove"
          >
            Remove
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
  name: "EstateOfficials",
  props: {
    estateId: { type: Number, required: true },
  },
  data() {
    return {
      loading: false,
      removing: false,
      officials: [],

      // Confirm dialog
      confirmDialog: false,
      selectedOfficial: null,

      // Snackbars
      snackbar: false,
      snackbarText: "",
      snackbar2: false,
      snackbarText2: "",
    };
  },
  mounted() {
    this.fetchOfficials();
  },
  methods: {
    // =========================================================
    // DATA
    // =========================================================
    async fetchOfficials() {
      if (!this.estateId) return;
      this.loading = true;
      try {
        const { data } = await axios.get(
          `${API}/officials/getOfficialByEstateId/${this.estateId}`
        );
        this.officials = Array.isArray(data) ? data : [];
      } catch (err) {
        console.warn("Officials fetch failed:", err.message);
        this.officials = [];
      } finally {
        this.loading = false;
      }
    },

    refresh() {
      return this.fetchOfficials();
    },

    // =========================================================
    // REMOVE FLOW
    // =========================================================
    askRemove(official) {
      this.selectedOfficial = official;
      this.confirmDialog = true;
    },

    async confirmRemove() {
      const o = this.selectedOfficial;
      if (!o) return;

      this.removing = true;
      try {
        // 1. Demote the household (is_official = 0)
        await axios.patch(
          `${API}/households/update_household/${o.official_id}`,
          { is_official: 0, official_role: "none" }
        ).catch(() => null); // ignore if route not present

        // 2. Delete the official record
        await axios.put(
          `${API}/officials/delete_official/${o.contact_number}`
        );

        this.showSuccess(`${o.full_name} removed`);
        this.confirmDialog = false;
        this.selectedOfficial = null;
        await this.fetchOfficials();
      } catch (err) {
        console.error(err);
        this.showError(
          err.response?.data?.error || "Could not remove official"
        );
      } finally {
        this.removing = false;
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

    badgeClass(role) {
      const r = (role || "").toLowerCase();
      if (r.includes("chair")) return "badge-purple";
      if (r.includes("secret")) return "badge-blue";
      if (r.includes("treasur")) return "badge-green";
      return "badge-grey";
    },

    callOfficial(official) {
      if (!official.contact_number) return;
      window.location.href = `tel:${official.contact_number}`;
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
.officials-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1100px;
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
   GRID
   ============================================================ */
.officials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

/* ============================================================
   CARD
   ============================================================ */
.official-card {
  position: relative;
  background: white;
  border: 1px solid #e9e7f2;
  border-radius: 18px;
  padding: 24px 20px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.official-card:hover {
  transform: translateY(-2px);
  border-color: #c7b8ff;
  box-shadow: 0 16px 36px -16px rgba(124, 58, 237, 0.25);
}

/* Role badge */
.official-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 999px;
}

.badge-purple {
  background: #f3eeff;
  color: #7c3aed;
}
.badge-blue {
  background: #dbeafe;
  color: #1d4ed8;
}
.badge-green {
  background: #d1fae5;
  color: #065f46;
}
.badge-grey {
  background: #f3f4f6;
  color: #4b5563;
}

/* Avatar */
.official-avatar {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  box-shadow: 0 8px 20px -8px rgba(124, 58, 237, 0.5);
}

.official-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: #1e1b4b;
  margin-bottom: 4px;
  letter-spacing: -0.2px;
  line-height: 1.2;
}

.official-contact {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  color: #6b7280;
  margin-bottom: 6px;
}

.official-urn {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.66rem;
  color: #9ca3af;
  background: #fafaff;
  border: 1px solid #e9e7f2;
  padding: 2px 8px;
  border-radius: 6px;
  margin-bottom: 14px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Actions */
.official-actions {
  display: flex;
  gap: 8px;
  width: 100%;
  margin-top: auto;
}

.official-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 9px 8px;
  background: #fafaff;
  border: 1px solid #e9e7f2;
  border-radius: 10px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.official-btn-call {
  color: #7c3aed;
}

.official-btn-call:hover {
  background: #f3eeff;
  border-color: #c7b8ff;
}

.official-btn-remove {
  color: #ef4444;
}

.official-btn-remove:hover {
  background: #fef2f2;
  border-color: #fecaca;
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

/* ============================================================
   INFO CARD
   ============================================================ */
.info-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  background: #faf8ff;
  border: 1px solid #e9e0ff;
  border-radius: 12px;
  font-size: 0.83rem;
  color: #4b5563;
  line-height: 1.5;
}

/* ============================================================
   CONFIRM DIALOG
   ============================================================ */
::v-deep .confirm-dialog {
  border-radius: 22px !important;
  overflow: hidden !important;
  margin: 16px auto !important;
  max-width: 440px !important;
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
@media (max-width: 599px) {
  .officials-grid,
  .loading-grid {
    grid-template-columns: 1fr;
  }
  .official-card {
    padding: 20px 16px 14px;
  }
}
</style>