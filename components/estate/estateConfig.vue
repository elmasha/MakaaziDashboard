<template>
  <div class="config-page">
    <!-- ============================================================
         HEADER
         ============================================================ -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Address configuration</h1>
        <p class="page-sub">
          Manage which address components residents use — sections, courts, and streets
        </p>
      </div>
      <button class="quick-btn" @click="refreshAll" :disabled="loading">
        <v-icon size="16" :class="{ spinning: loading }">mdi-refresh</v-icon>
        <span>Refresh</span>
      </button>
    </div>

    <!-- ============================================================
         SUMMARY STRIP
         ============================================================ -->
    <div class="summary-strip">
      <div class="summary-card">
        <div class="summary-icon summary-icon-purple">
          <v-icon size="16" color="white">mdi-map-marker-multiple</v-icon>
        </div>
        <div class="summary-body">
          <div class="summary-label">Sections</div>
          <div class="summary-value">{{ sections.length }}</div>
        </div>
        <div class="summary-status" :class="config.show_section ? 'status-on' : 'status-off'">
          {{ config.show_section ? "On" : "Off" }}
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon summary-icon-blue">
          <v-icon size="16" color="white">mdi-home-city-outline</v-icon>
        </div>
        <div class="summary-body">
          <div class="summary-label">Courts</div>
          <div class="summary-value">{{ courts.length }}</div>
        </div>
        <div class="summary-status" :class="config.show_court ? 'status-on' : 'status-off'">
          {{ config.show_court ? "On" : "Off" }}
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon summary-icon-green">
          <v-icon size="16" color="white">mdi-road-variant</v-icon>
        </div>
        <div class="summary-body">
          <div class="summary-label">Streets</div>
          <div class="summary-value">{{ streets.length }}</div>
        </div>
        <div class="summary-status" :class="config.show_street ? 'status-on' : 'status-off'">
          {{ config.show_street ? "On" : "Off" }}
        </div>
      </div>
    </div>

    <!-- ============================================================
         TOGGLE CARDS
         ============================================================ -->
    <div class="toggles-grid">
      <div
        v-for="t in toggles"
        :key="t.key"
        class="toggle-card"
        :class="[
          `toggle-card-${t.color}`,
          { 'toggle-card-active': config[t.key] },
        ]"
      >
        <div class="toggle-card-head">
          <div class="toggle-icon" :class="`toggle-icon-${t.color}`">
            <v-icon size="20" color="white">{{ t.icon }}</v-icon>
          </div>
          <v-switch
            v-model="config[t.key]"
            color="#7c3aed"
            hide-details
            dense
            class="toggle-switch"
            @change="saveConfig"
          ></v-switch>
        </div>

        <div class="toggle-body">
          <div class="toggle-title">{{ t.label }}</div>
          <div class="toggle-sub">{{ t.description }}</div>
        </div>

        <div class="toggle-foot">
          <span class="toggle-state">
            <span class="state-dot" :class="config[t.key] ? 'dot-on' : 'dot-off'"></span>
            {{ config[t.key] ? "Enabled" : "Disabled" }}
          </span>
          <span class="toggle-count">
            {{ countFor(t.key) }} item{{ countFor(t.key) === 1 ? "" : "s" }}
          </span>
        </div>
      </div>
    </div>

    <!-- ============================================================
         ADDRESS CARDS
         ============================================================ -->
    <div class="addr-grid">
      <!-- ============ SECTIONS ============ -->
      <div v-if="config.show_section" class="addr-card addr-card-purple">
        <div class="addr-head">
          <div class="addr-icon addr-icon-purple">
            <v-icon size="18" color="white">mdi-map-marker-multiple</v-icon>
          </div>
          <div class="addr-head-text">
            <div class="addr-title">Sections</div>
            <div class="addr-sub">
              {{ sections.length }} configured
            </div>
          </div>
          <v-chip small label color="#f3eeff" class="addr-count-chip">
            {{ sections.length }}
          </v-chip>
        </div>

        <div class="addr-add">
          <v-text-field
            v-model="newSection"
            dense
            outlined
            rounded
            hide-details
            placeholder="e.g. West Wing"
            @keyup.enter="addSection"
          ></v-text-field>
          <button
            class="addr-add-btn"
            :disabled="!newSection || addingSection"
            @click="addSection"
          >
            <v-progress-circular
              v-if="addingSection"
              indeterminate
              size="16"
              width="2"
              color="white"
            />
            <v-icon v-else size="16" color="white">mdi-plus</v-icon>
          </button>
        </div>

        <div class="addr-list">
          <div v-if="loading && !sections.length" class="addr-loading">
            <v-skeleton-loader type="list-item" />
            <v-skeleton-loader type="list-item" />
          </div>

          <div v-else-if="!sections.length" class="addr-empty">
            <div class="addr-empty-icon">
              <v-icon size="28" color="#7c3aed">mdi-map-marker-plus-outline</v-icon>
            </div>
            <div class="addr-empty-title">No sections yet</div>
            <div class="addr-empty-sub">Add your first section to get started</div>
          </div>

          <div
            v-for="s in sections"
            :key="s.id"
            class="addr-row"
          >
            <div class="addr-row-dot"></div>
            <span class="addr-row-text">{{ s.section_name }}</span>
            <button class="addr-row-del" @click="askDelete('section', s)" title="Delete">
              <v-icon size="14">mdi-close</v-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- ============ COURTS ============ -->
      <div v-if="config.show_court" class="addr-card addr-card-blue">
        <div class="addr-head">
          <div class="addr-icon addr-icon-blue">
            <v-icon size="18" color="white">mdi-home-city-outline</v-icon>
          </div>
          <div class="addr-head-text">
            <div class="addr-title">Courts</div>
            <div class="addr-sub">
              {{ courts.length }} configured
            </div>
          </div>
          <v-chip small label color="#dbeafe" class="addr-count-chip addr-count-chip-blue">
            {{ courts.length }}
          </v-chip>
        </div>

        <div class="addr-add">
          <v-text-field
            v-model="newCourt"
            dense
            outlined
            rounded
            hide-details
            placeholder="e.g. Lake Court"
            @keyup.enter="addCourt"
          ></v-text-field>
          <button
            class="addr-add-btn addr-add-btn-blue"
            :disabled="!newCourt || addingCourt"
            @click="addCourt"
          >
            <v-progress-circular
              v-if="addingCourt"
              indeterminate
              size="16"
              width="2"
              color="white"
            />
            <v-icon v-else size="16" color="white">mdi-plus</v-icon>
          </button>
        </div>

        <div class="addr-list">
          <div v-if="loading && !courts.length" class="addr-loading">
            <v-skeleton-loader type="list-item" />
            <v-skeleton-loader type="list-item" />
          </div>

          <div v-else-if="!courts.length" class="addr-empty">
            <div class="addr-empty-icon addr-empty-icon-blue">
              <v-icon size="28" color="#3b82f6">mdi-home-plus-outline</v-icon>
            </div>
            <div class="addr-empty-title">No courts yet</div>
            <div class="addr-empty-sub">Add your first court to get started</div>
          </div>

          <div
            v-for="c in courts"
            :key="c.id"
            class="addr-row"
          >
            <div class="addr-row-dot addr-row-dot-blue"></div>
            <span class="addr-row-text">{{ c.court_name }}</span>
            <button class="addr-row-del" @click="askDelete('court', c)" title="Delete">
              <v-icon size="14">mdi-close</v-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- ============ STREETS ============ -->
      <div v-if="config.show_street" class="addr-card addr-card-green">
        <div class="addr-head">
          <div class="addr-icon addr-icon-green">
            <v-icon size="18" color="white">mdi-road-variant</v-icon>
          </div>
          <div class="addr-head-text">
            <div class="addr-title">Streets</div>
            <div class="addr-sub">
              {{ streets.length }} configured
            </div>
          </div>
          <v-chip small label color="#d1fae5" class="addr-count-chip addr-count-chip-green">
            {{ streets.length }}
          </v-chip>
        </div>

        <div class="addr-add">
          <v-text-field
            v-model="newStreet"
            dense
            outlined
            rounded
            hide-details
            placeholder="e.g. Acacia Road"
            @keyup.enter="addStreet"
          ></v-text-field>
          <button
            class="addr-add-btn addr-add-btn-green"
            :disabled="!newStreet || addingStreet"
            @click="addStreet"
          >
            <v-progress-circular
              v-if="addingStreet"
              indeterminate
              size="16"
              width="2"
              color="white"
            />
            <v-icon v-else size="16" color="white">mdi-plus</v-icon>
          </button>
        </div>

        <div class="addr-list">
          <div v-if="loading && !streets.length" class="addr-loading">
            <v-skeleton-loader type="list-item" />
            <v-skeleton-loader type="list-item" />
          </div>

          <div v-else-if="!streets.length" class="addr-empty">
            <div class="addr-empty-icon addr-empty-icon-green">
              <v-icon size="28" color="#10b981">mdi-road-variant</v-icon>
            </div>
            <div class="addr-empty-title">No streets yet</div>
            <div class="addr-empty-sub">Add your first street to get started</div>
          </div>

          <div
            v-for="s in streets"
            :key="s.id"
            class="addr-row"
          >
            <div class="addr-row-dot addr-row-dot-green"></div>
            <span class="addr-row-text">{{ s.street_name }}</span>
            <button class="addr-row-del" @click="askDelete('street', s)" title="Delete">
              <v-icon size="14">mdi-close</v-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- ============ ALL DISABLED ============ -->
      <div v-if="!anyEnabled" class="disabled-card">
        <div class="disabled-icon">
          <v-icon size="36" color="#7c3aed">mdi-tune-off</v-icon>
        </div>
        <div class="disabled-title">All address components are off</div>
        <div class="disabled-sub">
          Turn on at least one above to configure it
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
        <div class="info-title">How this works</div>
        <div class="info-text">
          Turning a component off hides it from resident registration forms.
          Existing households keep their address data.
        </div>
      </div>
    </div>

    <!-- ============================================================
         CONFIRM DELETE DIALOG
         ============================================================ -->
    <v-dialog v-model="confirmDialog" max-width="420" content-class="confirm-dialog">
      <div class="confirm-shell">
        <div class="confirm-icon">
          <v-icon size="30" color="#ef4444">mdi-delete-outline</v-icon>
        </div>
        <div class="confirm-title">Delete "{{ deleteTarget?.name }}"?</div>
        <div class="confirm-text">
          This will remove the {{ deleteTarget?.type }} permanently.
          Households already assigned to it will keep their data, but it will no longer
          appear in new registration forms.
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
            :loading="deleting"
            @click="confirmDelete"
          >
            Delete
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
  name: "EstateAddressConfig",
  props: {
    estateId: { type: Number, required: true },
  },
  data() {
    return {
      loading: false,

      config: {
        show_section: true,
        show_court: true,
        show_street: true,
      },

      sections: [],
      courts: [],
      streets: [],

      newSection: "",
      newCourt: "",
      newStreet: "",

      addingSection: false,
      addingCourt: false,
      addingStreet: false,

      // Delete flow
      confirmDialog: false,
      deleteTarget: null,
      deleting: false,

      snackbar: false,
      snackbarText: "",
      snackbar2: false,
      snackbarText2: "",
    };
  },
  computed: {
    toggles() {
      return [
        {
          key: "show_section",
          label: "Sections",
          description: "Divides the estate into zones or phases",
          icon: "mdi-map-marker-multiple",
          color: "purple",
        },
        {
          key: "show_court",
          label: "Courts",
          description: "Numbered or named clusters of homes",
          icon: "mdi-home-city-outline",
          color: "blue",
        },
        {
          key: "show_street",
          label: "Streets",
          description: "Named roads or lanes",
          icon: "mdi-road-variant",
          color: "green",
        },
      ];
    },
    anyEnabled() {
      return (
        this.config.show_section ||
        this.config.show_court ||
        this.config.show_street
      );
    },
  },
  mounted() {
    this.refreshAll();
  },
  methods: {
    // =========================================================
    // LOAD
    // =========================================================
    async refreshAll() {
      this.loading = true;
      await Promise.allSettled([
        this.fetchConfig(),
        this.fetchSections(),
        this.fetchCourts(),
        this.fetchStreets(),
      ]);
      this.loading = false;
    },

    async fetchConfig() {
      try {
        const { data } = await axios.get(
          `${API}/address-config/estate/${this.estateId}`
        );
        if (data) {
          this.config.show_section =
            data.show_section === 1 || data.show_section === true;
          this.config.show_court =
            data.show_court === 1 || data.show_court === true;
          this.config.show_street =
            data.show_street === 1 || data.show_street === true;
        }
      } catch (err) {
        console.warn("Config fetch failed:", err.message);
      }
    },

    async fetchSections() {
      try {
        const { data } = await axios.get(
          `${API}/estates-config/sections/${this.estateId}`
        );
        this.sections = Array.isArray(data) ? data : [];
      } catch (err) {
        console.warn("Sections fetch failed:", err.message);
        try {
          const { data } = await axios.get(
            `${API}/officials/address-summary?estate_id=${this.estateId}&type=section`
          );
          this.sections = Array.isArray(data)
            ? data.map((s, i) => ({ id: i, section_name: s.name }))
            : [];
        } catch (e) {
          this.sections = [];
        }
      }
    },

    async fetchCourts() {
      try {
        const { data } = await axios.get(
          `${API}/estates-config/courts/${this.estateId}`
        );
        this.courts = Array.isArray(data) ? data : [];
      } catch (err) {
        console.warn("Courts fetch failed:", err.message);
        try {
          const { data } = await axios.get(
            `${API}/officials/address-summary?estate_id=${this.estateId}&type=court`
          );
          this.courts = Array.isArray(data)
            ? data.map((c, i) => ({ id: i, court_name: c.name }))
            : [];
        } catch (e) {
          this.courts = [];
        }
      }
    },

    async fetchStreets() {
      try {
        const { data } = await axios.get(
          `${API}/estates-config/streets/${this.estateId}`
        );
        this.streets = Array.isArray(data) ? data : [];
      } catch (err) {
        console.warn("Streets fetch failed:", err.message);
        try {
          const { data } = await axios.get(
            `${API}/officials/address-summary?estate_id=${this.estateId}&type=street`
          );
          this.streets = Array.isArray(data)
            ? data.map((s, i) => ({ id: i, street_name: s.name }))
            : [];
        } catch (e) {
          this.streets = [];
        }
      }
    },

    // =========================================================
    // SAVE CONFIG
    // =========================================================
    async saveConfig() {
      try {
        await axios.post(`${API}/address-config/save`, {
          estate_id: this.estateId,
          show_section: this.config.show_section ? 1 : 0,
          show_court: this.config.show_court ? 1 : 0,
          show_street: this.config.show_street ? 1 : 0,
        });
        this.showSuccess("Configuration updated");
      } catch (err) {
        this.showError("Could not save configuration");
        // Revert on failure
        await this.fetchConfig();
      }
    },

    // =========================================================
    // ADD
    // =========================================================
    async addSection() {
      const name = (this.newSection || "").trim();
      if (!name) return;
      this.addingSection = true;
      try {
        await axios.post(`${API}/address-config/section/add`, {
          estate_id: this.estateId,
          section_name: name,
        });
        this.showSuccess(`Section "${name}" added`);
        this.newSection = "";
        await this.fetchSections();
      } catch (err) {
        this.showError(err.response?.data?.error || "Could not add section");
      } finally {
        this.addingSection = false;
      }
    },

    async addCourt() {
      const name = (this.newCourt || "").trim();
      if (!name) return;
      this.addingCourt = true;
      try {
        await axios.post(`${API}/address-config/court/add`, {
          estate_id: this.estateId,
          court_name: name,
        });
        this.showSuccess(`Court "${name}" added`);
        this.newCourt = "";
        await this.fetchCourts();
      } catch (err) {
        this.showError(err.response?.data?.error || "Could not add court");
      } finally {
        this.addingCourt = false;
      }
    },

    async addStreet() {
      const name = (this.newStreet || "").trim();
      if (!name) return;
      this.addingStreet = true;
      try {
        await axios.post(`${API}/address-config/street/add`, {
          estate_id: this.estateId,
          street_name: name,
        });
        this.showSuccess(`Street "${name}" added`);
        this.newStreet = "";
        await this.fetchStreets();
      } catch (err) {
        this.showError(err.response?.data?.error || "Could not add street");
      } finally {
        this.addingStreet = false;
      }
    },

    // =========================================================
    // DELETE
    // =========================================================
    askDelete(type, item) {
      const name =
        type === "section"
          ? item.section_name
          : type === "court"
          ? item.court_name
          : item.street_name;
      this.deleteTarget = { type, item, name };
      this.confirmDialog = true;
    },

    async confirmDelete() {
      if (!this.deleteTarget) return;
      const { type, item } = this.deleteTarget;
      this.deleting = true;
      try {
        const route =
          type === "section"
            ? "section/delete"
            : type === "court"
            ? "court/delete"
            : "street/delete";

        await axios.post(`${API}/address-config/${route}`, {
          estate_id: this.estateId,
          id: item.id,
          name:
            type === "section"
              ? item.section_name
              : type === "court"
              ? item.court_name
              : item.street_name,
        });

        this.showSuccess("Deleted");
        this.confirmDialog = false;
        this.deleteTarget = null;

        if (type === "section") await this.fetchSections();
        if (type === "court") await this.fetchCourts();
        if (type === "street") await this.fetchStreets();
      } catch (err) {
        console.error(err);
        this.showError(
          err.response?.data?.error || "Could not delete — backend route missing"
        );
      } finally {
        this.deleting = false;
      }
    },

    // =========================================================
    // HELPERS
    // =========================================================
    countFor(key) {
      if (key === "show_section") return this.sections.length;
      if (key === "show_court") return this.courts.length;
      if (key === "show_street") return this.streets.length;
      return 0;
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
.config-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1200px;
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
  margin: 6px 0 0;
  max-width: 560px;
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: white;
  border: 1px solid #e9e7f2;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(30, 27, 75, 0.03);
}

.summary-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.summary-icon-purple { background: linear-gradient(135deg, #7c3aed, #a855f7); }
.summary-icon-blue   { background: linear-gradient(135deg, #3b82f6, #60a5fa); }
.summary-icon-green  { background: linear-gradient(135deg, #059669, #10b981); }

.summary-body {
  flex: 1;
  min-width: 0;
}

.summary-label {
  font-size: 0.64rem;
  font-weight: 800;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.summary-value {
  font-size: 1.35rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -0.6px;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.summary-status {
  font-size: 0.6rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  flex-shrink: 0;
}

.status-on  { background: #d1fae5; color: #065f46; }
.status-off { background: #f3f4f6; color: #6b7280; }

/* ============================================================
   TOGGLES GRID
   ============================================================ */
.toggles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
}

.toggle-card {
  position: relative;
  padding: 16px;
  background: #fafaff;
  border: 1.5px solid #e9e7f2;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-card:hover {
  transform: translateY(-2px);
  border-color: #c7b8ff;
}

.toggle-card-active {
  background: white;
  border-color: #7c3aed;
  box-shadow: 0 12px 28px -18px rgba(124, 58, 237, 0.4);
}

.toggle-card-blue.toggle-card-active {
  border-color: #3b82f6;
  box-shadow: 0 12px 28px -18px rgba(59, 130, 246, 0.4);
}

.toggle-card-green.toggle-card-active {
  border-color: #10b981;
  box-shadow: 0 12px 28px -18px rgba(16, 185, 129, 0.4);
}

.toggle-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toggle-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 18px -8px rgba(124, 58, 237, 0.5);
}

.toggle-icon-purple { background: linear-gradient(135deg, #7c3aed, #a855f7); }
.toggle-icon-blue   { background: linear-gradient(135deg, #3b82f6, #60a5fa); box-shadow: 0 8px 18px -8px rgba(59, 130, 246, 0.5); }
.toggle-icon-green  { background: linear-gradient(135deg, #059669, #10b981); box-shadow: 0 8px 18px -8px rgba(16, 185, 129, 0.5); }

.toggle-switch {
  margin: 0 !important;
  padding: 0 !important;
  flex-shrink: 0;
}

.toggle-body { flex: 1; }

.toggle-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -0.2px;
}

.toggle-sub {
  font-size: 0.74rem;
  color: #7c7a95;
  margin-top: 3px;
  line-height: 1.4;
}

.toggle-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #f0eef8;
}

.toggle-state {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: #7c7a95;
}

.state-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.dot-on  { background: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15); }
.dot-off { background: #cbd5e1; }

.toggle-count {
  font-size: 0.68rem;
  color: #9ca3af;
  font-weight: 700;
}

/* ============================================================
   ADDRESS GRID
   ============================================================ */
.addr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.addr-card {
  background: white;
  border: 1px solid #e9e7f2;
  border-radius: 18px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: all 0.22s ease;
  position: relative;
  overflow: hidden;
}

.addr-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  transition: opacity 0.2s ease;
}

.addr-card-purple::before {
  background: linear-gradient(90deg, #7c3aed, #a855f7);
}
.addr-card-blue::before {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}
.addr-card-green::before {
  background: linear-gradient(90deg, #059669, #10b981);
}

.addr-card:hover {
  box-shadow: 0 16px 36px -20px rgba(30, 27, 75, 0.18);
  border-color: #c7b8ff;
}

.addr-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.addr-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.addr-icon-purple {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  box-shadow: 0 8px 18px -8px rgba(124, 58, 237, 0.55);
}
.addr-icon-blue {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  box-shadow: 0 8px 18px -8px rgba(59, 130, 246, 0.55);
}
.addr-icon-green {
  background: linear-gradient(135deg, #059669, #10b981);
  box-shadow: 0 8px 18px -8px rgba(16, 185, 129, 0.55);
}

.addr-head-text {
  flex: 1;
  min-width: 0;
}

.addr-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -0.2px;
}

.addr-sub {
  font-size: 0.72rem;
  color: #9ca3af;
  margin-top: 2px;
}

.addr-count-chip {
  font-weight: 800 !important;
  color: #7c3aed !important;
  flex-shrink: 0;
}

.addr-count-chip-blue { color: #1d4ed8 !important; }
.addr-count-chip-green { color: #065f46 !important; }

/* Add row */
.addr-add {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 14px;
}

.addr-add > :first-child {
  flex: 1;
}

.addr-add-btn {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 6px 14px -6px rgba(124, 58, 237, 0.55);
  flex-shrink: 0;
}

.addr-add-btn-blue {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  box-shadow: 0 6px 14px -6px rgba(59, 130, 246, 0.55);
}

.addr-add-btn-green {
  background: linear-gradient(135deg, #059669, #10b981);
  box-shadow: 0 6px 14px -6px rgba(16, 185, 129, 0.55);
}

.addr-add-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.addr-add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

/* List */
.addr-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 280px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #e5e3f0 transparent;
  padding-right: 4px;
}

.addr-list::-webkit-scrollbar {
  width: 4px;
}

.addr-list::-webkit-scrollbar-thumb {
  background: #e5e3f0;
  border-radius: 2px;
}

.addr-loading {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.addr-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 11px;
  background: #fafaff;
  border: 1px solid #f0eef8;
  transition: all 0.15s ease;
}

.addr-row:hover {
  background: #f3eeff;
  border-color: #e0d4ff;
}

.addr-row-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #7c3aed;
  flex-shrink: 0;
}

.addr-row-dot-blue { background: #3b82f6; }
.addr-row-dot-green { background: #10b981; }

.addr-row-text {
  flex: 1;
  font-size: 0.82rem;
  font-weight: 700;
  color: #1e1b4b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.addr-row-del {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid transparent;
  color: #cbd5e1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease;
  opacity: 0;
}

.addr-row:hover .addr-row-del {
  opacity: 1;
}

.addr-row-del:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #ef4444;
}

.addr-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
  text-align: center;
  gap: 4px;
}

.addr-empty-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(124, 58, 237, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.addr-empty-icon-blue { background: rgba(59, 130, 246, 0.08); }
.addr-empty-icon-green { background: rgba(16, 185, 129, 0.08); }

.addr-empty-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: #1e1b4b;
}

.addr-empty-sub {
  font-size: 0.72rem;
  color: #9ca3af;
}

/* ============================================================
   DISABLED STATE
   ============================================================ */
.disabled-card {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  background: white;
  border: 1px dashed #d8d4e8;
  border-radius: 18px;
  text-align: center;
}

.disabled-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: rgba(124, 58, 237, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.disabled-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #1e1b4b;
}

.disabled-sub {
  font-size: 0.78rem;
  color: #9ca3af;
  margin-top: 4px;
}

/* ============================================================
   FORM FIELDS
   ============================================================ */
::v-deep .theme--light.v-text-field--outlined fieldset {
  border-radius: 12px !important;
  border-color: #e9e7f2 !important;
}

::v-deep .theme--light.v-text-field--outlined:not(.v-input--is-focused):hover fieldset {
  border-color: #c7b8ff !important;
}

::v-deep .theme--light.v-text-field--outlined.v-input--is-focused fieldset {
  border-color: #7c3aed !important;
  border-width: 2px !important;
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

.info-body {
  min-width: 0;
}

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
  max-width: 420px !important;
  width: calc(100% - 32px) !important;
  box-shadow: 0 30px 60px -20px rgba(30, 27, 75, 0.4) !important;
}

.confirm-shell {
  background: white;
  padding: 28px 24px 20px;
  text-align: center;
}

.confirm-icon {
  width: 64px;
  height: 64px;
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

.confirm-actions {
  display: flex;
  gap: 8px;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 900px) {
  .summary-strip,
  .toggles-grid,
  .addr-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 599px) {
  .summary-strip {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .summary-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 12px;
    gap: 8px;
  }

  .summary-icon {
    width: 32px;
    height: 32px;
    border-radius: 9px;
  }

  .summary-icon .v-icon {
    font-size: 14px !important;
  }

  .summary-value {
    font-size: 1.1rem;
  }

  .summary-status {
    font-size: 0.55rem;
    padding: 2px 6px;
  }

  .toggles-grid,
  .addr-grid {
    grid-template-columns: 1fr;
  }

  .toggle-card {
    padding: 14px;
  }

  .toggle-sub {
    font-size: 0.7rem;
  }

  .addr-card {
    padding: 16px;
  }

  .addr-row-del {
    opacity: 1;
  }

  .page-title {
    font-size: 1.2rem;
  }
}

@media (max-width: 380px) {
  .summary-card {
    padding: 10px;
  }

  .summary-value {
    font-size: 1rem;
  }
}
</style>