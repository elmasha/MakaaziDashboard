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
         TOGGLE STRIP
         ============================================================ -->
    <div class="toggle-strip">
      <div class="toggle-row" v-for="t in toggles" :key="t.key">
        <div class="toggle-left">
          <div class="toggle-icon" :class="`toggle-icon-${t.color}`">
            <v-icon size="18" color="white">{{ t.icon }}</v-icon>
          </div>
          <div>
            <div class="toggle-title">{{ t.label }}</div>
            <div class="toggle-sub">{{ t.description }}</div>
          </div>
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
    </div>

    <!-- ============================================================
         THREE-COLUMN ADDRESS CARDS
         ============================================================ -->
    <div class="addr-grid">
      <!-- Sections -->
      <div v-if="config.show_section" class="addr-card">
        <div class="addr-head">
          <div class="addr-icon addr-icon-purple">
            <v-icon size="18" color="white">mdi-map-marker-multiple</v-icon>
          </div>
          <div class="flex-grow-1">
            <div class="addr-title">Sections</div>
            <div class="addr-sub">{{ sections.length }} configured</div>
          </div>
        </div>

        <div class="addr-add">
          <v-text-field
            v-model="newSection"
            dense
            outlined
            rounded
            hide-details
            placeholder="Add a section"
            @keyup.enter="addSection"
          ></v-text-field>
          <button
            class="addr-add-btn"
            :disabled="!newSection || addingSection"
            @click="addSection"
          >
            <v-icon size="16" color="white">mdi-plus</v-icon>
          </button>
        </div>

        <div class="addr-list">
          <div v-if="!sections.length" class="addr-empty">
            <v-icon size="28" color="#cbd5e1">mdi-tag-off-outline</v-icon>
            <span>No sections yet</span>
          </div>
          <div
            v-for="s in sections"
            :key="s.id"
            class="addr-chip-row"
          >
            <span class="addr-chip-text">{{ s.section_name }}</span>
            <v-icon size="14" color="#cbd5e1">mdi-drag-vertical</v-icon>
          </div>
        </div>
      </div>

      <!-- Courts -->
      <div v-if="config.show_court" class="addr-card">
        <div class="addr-head">
          <div class="addr-icon addr-icon-blue">
            <v-icon size="18" color="white">mdi-home-city-outline</v-icon>
          </div>
          <div class="flex-grow-1">
            <div class="addr-title">Courts</div>
            <div class="addr-sub">{{ courts.length }} configured</div>
          </div>
        </div>

        <div class="addr-add">
          <v-text-field
            v-model="newCourt"
            dense
            outlined
            rounded
            hide-details
            placeholder="Add a court"
            @keyup.enter="addCourt"
          ></v-text-field>
          <button
            class="addr-add-btn"
            :disabled="!newCourt || addingCourt"
            @click="addCourt"
          >
            <v-icon size="16" color="white">mdi-plus</v-icon>
          </button>
        </div>

        <div class="addr-list">
          <div v-if="!courts.length" class="addr-empty">
            <v-icon size="28" color="#cbd5e1">mdi-tag-off-outline</v-icon>
            <span>No courts yet</span>
          </div>
          <div
            v-for="c in courts"
            :key="c.id"
            class="addr-chip-row"
          >
            <span class="addr-chip-text">{{ c.court_name }}</span>
            <v-icon size="14" color="#cbd5e1">mdi-drag-vertical</v-icon>
          </div>
        </div>
      </div>

      <!-- Streets -->
      <div v-if="config.show_street" class="addr-card">
        <div class="addr-head">
          <div class="addr-icon addr-icon-green">
            <v-icon size="18" color="white">mdi-road-variant</v-icon>
          </div>
          <div class="flex-grow-1">
            <div class="addr-title">Streets</div>
            <div class="addr-sub">{{ streets.length }} configured</div>
          </div>
        </div>

        <div class="addr-add">
          <v-text-field
            v-model="newStreet"
            dense
            outlined
            rounded
            hide-details
            placeholder="Add a street"
            @keyup.enter="addStreet"
          ></v-text-field>
          <button
            class="addr-add-btn"
            :disabled="!newStreet || addingStreet"
            @click="addStreet"
          >
            <v-icon size="16" color="white">mdi-plus</v-icon>
          </button>
        </div>

        <div class="addr-list">
          <div v-if="!streets.length" class="addr-empty">
            <v-icon size="28" color="#cbd5e1">mdi-tag-off-outline</v-icon>
            <span>No streets yet</span>
          </div>
          <div
            v-for="s in streets"
            :key="s.id"
            class="addr-chip-row"
          >
            <span class="addr-chip-text">{{ s.street_name }}</span>
            <v-icon size="14" color="#cbd5e1">mdi-drag-vertical</v-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================
         INFO
         ============================================================ -->
    <div class="info-card">
      <v-icon size="16" color="#7c3aed">mdi-information-outline</v-icon>
      <span>
        Turning a component off hides it from resident registration forms.
        Existing households keep their address data.
      </span>
    </div>

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

      // Config flags
      config: {
        show_section: true,
        show_court: true,
        show_street: true,
      },

      // Lists
      sections: [],
      courts: [],
      streets: [],

      // New item inputs
      newSection: "",
      newCourt: "",
      newStreet: "",

      // Action loading
      addingSection: false,
      addingCourt: false,
      addingStreet: false,

      // Snackbars
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
          this.config.show_section = data.show_section === 1 || data.show_section === true;
          this.config.show_court = data.show_court === 1 || data.show_court === true;
          this.config.show_street = data.show_street === 1 || data.show_street === true;
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
        // Fallback: read from address summary
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
      }
    },

    // =========================================================
    // ADD ITEMS
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
    // HELPERS
    // =========================================================
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
   TOGGLE STRIP
   ============================================================ */
.toggle-strip {
  background: white;
  border: 1px solid #e9e7f2;
  border-radius: 18px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  transition: background 0.2s ease;
}

.toggle-row:hover {
  background: #fafaff;
}

.toggle-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.toggle-icon {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toggle-icon-purple {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
}
.toggle-icon-blue {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
}
.toggle-icon-green {
  background: linear-gradient(135deg, #059669, #10b981);
}

.toggle-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e1b4b;
}

.toggle-sub {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 2px;
}

.toggle-switch {
  flex-shrink: 0;
}

/* ============================================================
   ADDRESS GRID
   ============================================================ */
.addr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.addr-card {
  background: white;
  border: 1px solid #e9e7f2;
  border-radius: 18px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s ease;
}

.addr-card:hover {
  box-shadow: 0 10px 28px -16px rgba(30, 27, 75, 0.15);
}

.addr-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.addr-icon {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.addr-icon-purple {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
}
.addr-icon-blue {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
}
.addr-icon-green {
  background: linear-gradient(135deg, #059669, #10b981);
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

.addr-add-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px -6px rgba(124, 58, 237, 0.75);
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
  gap: 4px;
  max-height: 260px;
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

.addr-chip-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fafaff;
  border: 1px solid #f3f4f6;
  font-size: 0.82rem;
  font-weight: 600;
  color: #1e1b4b;
  transition: all 0.15s ease;
  cursor: grab;
}

.addr-chip-row:hover {
  background: #f3eeff;
  border-color: #e9e0ff;
}

.addr-chip-row:active {
  cursor: grabbing;
}

.addr-chip-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.addr-empty {
  padding: 32px 12px;
  text-align: center;
  color: #9ca3af;
  font-size: 0.78rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
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
   Responsive
   ============================================================ */
@media (max-width: 599px) {
  .toggle-row {
    padding: 12px;
  }
  .toggle-sub {
    display: none;
  }
  .addr-grid {
    grid-template-columns: 1fr;
  }
}
</style>