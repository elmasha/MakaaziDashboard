<template>
  <div class="officials-page">
    <!-- ============================================================
         HEADER
         ============================================================ -->
    <div class="page-header">
      <div>
        <div class="page-title-row">
          <h1 class="page-title">Estate officials</h1>
          <div class="count-pill">{{ officials.length }}</div>
        </div>
        <p class="page-sub">
          {{ officials.length === 1 ? "1 official" : officials.length + " officials" }}
          managing this estate
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
         SUMMARY STRIP (only when officials exist)
         ============================================================ -->
    <div v-if="officials.length" class="summary-strip">
      <div class="summary-chip">
        <div class="summary-dot" style="background:#7c3aed"></div>
        <span class="summary-label">Chairman</span>
        <span class="summary-value">{{ roleCount('chair') }}</span>
      </div>
      <div class="summary-chip">
        <div class="summary-dot" style="background:#3b82f6"></div>
        <span class="summary-label">Secretary</span>
        <span class="summary-value">{{ roleCount('secret') }}</span>
      </div>
      <div class="summary-chip">
        <div class="summary-dot" style="background:#10b981"></div>
        <span class="summary-label">Treasurer</span>
        <span class="summary-value">{{ roleCount('treasur') }}</span>
      </div>
      <div class="summary-chip">
        <div class="summary-dot" style="background:#94a3b8"></div>
        <span class="summary-label">Other</span>
        <span class="summary-value">{{ roleCount('other') }}</span>
      </div>
    </div>

    <!-- ============================================================
         LOADING
         ============================================================ -->
    <div v-if="loading && !officials.length" class="loading-grid">
      <v-skeleton-loader
        type="image, article, button"
        class="skeleton-card"
      />
      <v-skeleton-loader
        type="image, article, button"
        class="skeleton-card"
      />
      <v-skeleton-loader
        type="image, article, button"
        class="skeleton-card"
      />
    </div>

    <!-- ============================================================
         EMPTY STATE
         ============================================================ -->
    <div v-else-if="!officials.length" class="empty-state">
      <div class="empty-icon">
        <v-icon size="44" color="#7c3aed">mdi-shield-account-outline</v-icon>
      </div>
      <div class="empty-title">No officials yet</div>
      <div class="empty-text">
        Assign a household to a role from the residents page to create an official.
      </div>
    </div>

    <!-- ============================================================
         OFFICIALS GRID
         ============================================================ -->
    <div v-else class="officials-grid">
      <div
        v-for="(official, idx) in officials"
        :key="official.official_id"
        class="official-card"
        :class="[
          cardClass(official.role),
          { 'official-card-featured': isFeatured(official) && idx === 0 },
        ]"
        :style="{ 'animation-delay': idx * 60 + 'ms' }"
      >
        <!-- Role badge -->
        <div class="official-badge" :class="badgeClass(official.role)">
          <v-icon size="11" class="mr-1">{{ roleIcon(official.role) }}</v-icon>
          {{ official.role }}
        </div>

        <!-- Avatar with status dot -->
        <div class="avatar-wrap">
          <div class="official-avatar" :class="avatarClass(official.role)">
            {{ initialsOf(official.full_name) }}
          </div>
          <div class="avatar-dot" :class="dotClass(official.role)"></div>
        </div>

        <!-- Info -->
        <div class="official-name">{{ official.full_name || "—" }}</div>

        <!-- Detail rows -->
        <div class="official-details">
          <div v-if="official.contact_number" class="detail-row">
            <div class="detail-icon">
              <v-icon size="13" color="#7c3aed">mdi-phone-outline</v-icon>
            </div>
            <span>{{ official.contact_number }}</span>
          </div>
          <div v-if="official.estate_urn" class="detail-row">
            <div class="detail-icon">
              <v-icon size="13" color="#7c3aed">mdi-identifier</v-icon>
            </div>
            <span class="detail-urn">{{ official.estate_urn }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="official-actions">
          <button
            class="official-btn official-btn-call"
            :disabled="!official.contact_number"
            @click="callOfficial(official)"
          >
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
      <div class="info-icon">
        <v-icon size="18" color="white">mdi-information-outline</v-icon>
      </div>
      <div class="info-body">
        <div class="info-title">About officials</div>
        <div class="info-text">
          Officials are households with elevated privileges — Chairman, Secretary,
          and Treasurer. Removing an official demotes them back to a regular resident.
        </div>
      </div>
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

      confirmDialog: false,
      selectedOfficial: null,

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
        await axios.patch(
          `${API}/households/update_household/${o.official_id}`,
          { is_official: 0, official_role: "none" }
        ).catch(() => null);

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
    // ROLE HELPERS
    // =========================================================
    roleKey(role) {
      const r = (role || "").toLowerCase();
      if (r.includes("chair")) return "chair";
      if (r.includes("secret")) return "secret";
      if (r.includes("treasur")) return "treasur";
      return "other";
    },

    isFeatured(official) {
      return this.roleKey(official.role) === "chair";
    },

    roleIcon(role) {
      const k = this.roleKey(role);
      if (k === "chair") return "mdi-crown-outline";
      if (k === "secret") return "mdi-file-document-outline";
      if (k === "treasur") return "mdi-cash-multiple";
      return "mdi-shield-account-outline";
    },

    roleCount(match) {
      if (match === "other") {
        return this.officials.filter((o) => this.roleKey(o.role) === "other").length;
      }
      return this.officials.filter((o) => this.roleKey(o.role) === match).length;
    },

    badgeClass(role) {
      const k = this.roleKey(role);
      return `badge-${k}`;
    },

    avatarClass(role) {
      const k = this.roleKey(role);
      return `avatar-${k}`;
    },

    dotClass(role) {
      const k = this.roleKey(role);
      return `dot-${k}`;
    },

    cardClass(role) {
      const k = this.roleKey(role);
      return `card-${k}`;
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
  font-size: 1.4rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -0.4px;
  margin: 0;
}

.count-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(124, 58, 237, 0.12);
  color: #7c3aed;
  font-size: 0.72rem;
  font-weight: 800;
}

.page-sub {
  font-size: 0.82rem;
  color: #7c7a95;
  margin: 6px 0 0;
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
   SUMMARY STRIP
   ============================================================ */
.summary-strip {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.summary-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: white;
  border: 1px solid #e9e7f2;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.summary-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.summary-label {
  color: #6b7280;
}

.summary-value {
  color: #1e1b4b;
  font-weight: 800;
  padding-left: 6px;
  border-left: 1px solid #e9e7f2;
}

/* ============================================================
   GRID
   ============================================================ */
.officials-grid,
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.skeleton-card {
  border-radius: 18px !important;
  overflow: hidden;
}

/* ============================================================
   OFFICIAL CARD
   ============================================================ */
@keyframes cardIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

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
  animation: cardIn 0.4s ease-out both;
}

.official-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #e9e7f2;
  transition: background 0.25s ease;
}

/* Per-role top accent */
.card-chair::before   { background: linear-gradient(90deg, #7c3aed, #a855f7); }
.card-secret::before  { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
.card-treasur::before { background: linear-gradient(90deg, #10b981, #34d399); }
.card-other::before   { background: linear-gradient(90deg, #94a3b8, #cbd5e1); }

.official-card:hover {
  transform: translateY(-3px);
  border-color: #c7b8ff;
  box-shadow: 0 20px 40px -20px rgba(124, 58, 237, 0.3);
}

/* Featured (Chairman) card gets a dark gradient */
.official-card-featured {
  background: linear-gradient(150deg, #1e1b4b 0%, #2d2a5e 55%, #3a2c7a 100%);
  border-color: transparent;
  box-shadow: 0 20px 44px -20px rgba(30, 27, 75, 0.55);
}

.official-card-featured::before {
  background: linear-gradient(90deg, #c4b5fd, #a855f7, #7c3aed);
}

.official-card-featured .official-name {
  color: white;
}

.official-card-featured .detail-row {
  color: rgba(255, 255, 255, 0.8);
}

.official-card-featured .detail-icon {
  background: rgba(255, 255, 255, 0.12);
}

.official-card-featured .detail-icon .v-icon {
  color: #c4b5fd !important;
}

.official-card-featured .official-btn-call {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
  color: #c4b5fd;
}

.official-card-featured .official-btn-call:hover {
  background: rgba(255, 255, 255, 0.18);
}

.official-card-featured .official-btn-remove {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  color: #fca5a5;
}

.official-card-featured .official-btn-remove:hover {
  background: rgba(239, 68, 68, 0.18);
}

/* ============================================================
   BADGE
   ============================================================ */
.official-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 999px;
}

.badge-chair   { background: #f3eeff; color: #7c3aed; }
.badge-secret  { background: #dbeafe; color: #1d4ed8; }
.badge-treasur { background: #d1fae5; color: #065f46; }
.badge-other   { background: #f3f4f6; color: #4b5563; }

.official-card-featured .badge-chair {
  background: rgba(196, 181, 253, 0.2);
  color: #e9d5ff;
}

/* ============================================================
   AVATAR
   ============================================================ */
.avatar-wrap {
  position: relative;
  margin-bottom: 14px;
}

.official-avatar {
  width: 68px;
  height: 68px;
  border-radius: 20px;
  color: white;
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 22px -10px rgba(124, 58, 237, 0.5);
  transition: transform 0.25s ease;
}

.official-card:hover .official-avatar {
  transform: scale(1.05);
}

.avatar-chair   { background: linear-gradient(135deg, #7c3aed, #a855f7); }
.avatar-secret  { background: linear-gradient(135deg, #3b82f6, #60a5fa); }
.avatar-treasur { background: linear-gradient(135deg, #10b981, #34d399); }
.avatar-other   { background: linear-gradient(135deg, #94a3b8, #64748b); }

.official-card-featured .official-avatar {
  background: linear-gradient(135deg, #c4b5fd, #a855f7);
  box-shadow: 0 12px 28px -10px rgba(196, 181, 253, 0.6);
}

.avatar-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid white;
}

.dot-chair   { background: #7c3aed; }
.dot-secret  { background: #3b82f6; }
.dot-treasur { background: #10b981; }
.dot-other   { background: #94a3b8; }

.official-card-featured .avatar-dot {
  border-color: #2d2a5e;
}

/* ============================================================
   INFO
   ============================================================ */
.official-name {
  font-size: 0.98rem;
  font-weight: 800;
  color: #1e1b4b;
  margin-bottom: 12px;
  letter-spacing: -0.2px;
  line-height: 1.25;
}

.official-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: #4b5563;
  font-weight: 600;
  padding: 6px 10px;
  background: #fafaff;
  border: 1px solid #f0eef8;
  border-radius: 10px;
  justify-content: center;
}

.official-card-featured .detail-row {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}

.detail-icon {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: rgba(124, 58, 237, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.detail-urn {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.72rem;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ============================================================
   ACTIONS
   ============================================================ */
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
  padding: 10px 8px;
  background: #fafaff;
  border: 1px solid #e9e7f2;
  border-radius: 10px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.official-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.official-btn-call {
  color: #7c3aed;
}

.official-btn-call:hover:not(:disabled) {
  background: #f3eeff;
  border-color: #c7b8ff;
  transform: translateY(-1px);
}

.official-btn-remove {
  color: #ef4444;
}

.official-btn-remove:hover {
  background: #fef2f2;
  border-color: #fecaca;
  transform: translateY(-1px);
}

/* ============================================================
   EMPTY STATE
   ============================================================ */
.empty-state {
  padding: 64px 24px;
  text-align: center;
  background: white;
  border: 1px solid #e9e7f2;
  border-radius: 20px;
}

.empty-icon {
  width: 88px;
  height: 88px;
  border-radius: 24px;
  background: rgba(124, 58, 237, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18px;
}

.empty-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -0.2px;
}

.empty-text {
  font-size: 0.84rem;
  color: #9ca3af;
  margin-top: 6px;
  max-width: 380px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.55;
}

/* ============================================================
   INFO CARD
   ============================================================ */
.info-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 18px;
  background: linear-gradient(135deg, #faf8ff 0%, #f3eeff 100%);
  border: 1px solid #e9e0ff;
  border-radius: 14px;
}

.info-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 18px -8px rgba(124, 58, 237, 0.6);
}

.info-body { min-width: 0; }

.info-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: #1e1b4b;
  margin-bottom: 3px;
}

.info-text {
  font-size: 0.78rem;
  color: #4b5563;
  line-height: 1.55;
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
   RESPONSIVE
   ============================================================ */
@media (max-width: 900px) {
  .officials-grid,
  .loading-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 599px) {
  .officials-grid,
  .loading-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .official-card {
    padding: 18px 12px 12px;
    border-radius: 16px;
  }

  .official-avatar {
    width: 54px;
    height: 54px;
    border-radius: 16px;
    font-size: 0.95rem;
  }

  .avatar-dot {
    width: 14px;
    height: 14px;
  }

  .official-badge {
    font-size: 0.52rem;
    padding: 3px 7px;
    letter-spacing: 0.3px;
  }

  .official-badge .v-icon {
    font-size: 9px !important;
  }

  .official-name {
    font-size: 0.86rem;
    margin-bottom: 10px;
  }

  .detail-row {
    font-size: 0.68rem;
    padding: 5px 8px;
    gap: 6px;
  }

  .detail-icon {
    width: 18px;
    height: 18px;
  }

  .detail-icon .v-icon {
    font-size: 11px !important;
  }

  .detail-urn {
    font-size: 0.62rem;
    max-width: 100px;
  }

  .official-actions {
    gap: 6px;
  }

  .official-btn {
    padding: 8px 6px;
    font-size: 0.7rem;
    gap: 3px;
  }

  .official-btn span {
    display: none;
  }

  .summary-strip {
    gap: 6px;
  }

  .summary-chip {
    padding: 6px 10px;
    font-size: 0.68rem;
  }

  .summary-label {
    font-size: 0.65rem;
  }

  .page-title {
    font-size: 1.2rem;
  }

  .info-card {
    padding: 14px;
    gap: 10px;
  }

  .info-icon {
    width: 32px;
    height: 32px;
  }

  .info-text {
    font-size: 0.72rem;
  }
}

@media (max-width: 380px) {
  .official-avatar {
    width: 48px;
    height: 48px;
    font-size: 0.85rem;
  }

  .official-name {
    font-size: 0.8rem;
  }

  .detail-row {
    font-size: 0.64rem;
  }

  .summary-strip {
    gap: 4px;
  }

  .summary-chip {
    padding: 5px 8px;
    font-size: 0.62rem;
  }
}
</style>