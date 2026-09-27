<template>
  <div class="d-flex bg-surface dashboard-root" style="min-height: 100vh;">
    <!-- ============================================================
         DESKTOP SIDEBAR
         ============================================================ -->
    <v-navigation-drawer
      v-if="!nav_bars"
      permanent
      width="260"
      class="elevation-0 sidebar-glass"
    >
      <div class="pa-6 pb-4">
        <div class="d-flex align-center cursor-pointer brand-hover" @click="goTo(dashboardRoute)">
          <v-avatar color="#8051FF" size="46" class="elevation-3 mr-3 brand-avatar">
            <v-icon color="white" size="24">mdi-home-city</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold purple--text brand-text">Makaazi</div>
            <div class="text-caption text--secondary font-weight-medium">Resident Console</div>
          </div>
        </div>
      </div>

      <v-divider class="mx-4 mb-2 opacity-30"></v-divider>

      <v-list dense nav class="px-3 py-2">
        <v-list-item
          v-for="(item, idx) in menuItems"
          :key="item.title"
          @click="goTo(item.route)"
          link
          class="mb-1 rounded-xl nav-item-premium"
          :class="{ 'nav-item-active': isActive(item.route) }"
          :style="{ 'animation-delay': idx * 50 + 'ms' }"
        >
          <v-list-item-icon class="mr-3">
            <v-icon :color="isActive(item.route) ? '#8051FF' : 'grey'" size="22">
              {{ item.icon }}
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title
              class="font-weight-semibold text-body-2"
              :class="{ 'purple--text': isActive(item.route) }"
            >
              {{ item.title }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-4 pb-6">
          <div class="help-card mb-4">
            <v-icon color="#8051FF" size="22" class="mb-2">mdi-lifebuoy</v-icon>
            <div class="help-title">Need help?</div>
            <div class="help-sub">Contact your estate office</div>
          </div>
          <v-btn
            block outlined color="#8051FF"
            class="rounded-xl text-capitalize font-weight-medium signout-btn"
            @click="logout"
          >
            <v-icon left size="18" color="#8051FF">mdi-logout</v-icon>
            Sign Out
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Mobile bottom nav -->
    <v-bottom-navigation
      v-if="nav_bars"
      v-model="activeTab"
      color="#8051FF"
      grow
      fixed
      class="elevation-8 bottom-nav-premium"
      style="z-index: 100;"
      height="64"
    >
      <v-btn
        v-for="item in menuItems"
        :key="item.title"
        @click="goTo(item.route)"
        :value="item.route"
        class="mobile-nav-btn"
      >
        <v-icon size="22">{{ item.icon }}</v-icon>
        <span class="mobile-nav-label">{{ item.title }}</span>
      </v-btn>
    </v-bottom-navigation>

    <!-- Main -->
    <v-main :class="nav_bars ? 'pb-16' : ''" class="main-premium">
      <!-- Header -->
      <div class="sticky-header-premium px-4 px-sm-6 py-4">
        <v-container fluid class="pa-0">
          <v-row align="center" no-gutters>
            <v-col cols="8" sm="6">
              <div class="d-flex align-center">
                <v-btn icon small class="mr-2 back-btn" @click="goTo(dashboardRoute)">
                  <v-icon size="20">mdi-arrow-left</v-icon>
                </v-btn>
                <div class="header-text">
                  <div class="d-flex align-center flex-wrap">
                    <h1 class="text-h6 text-sm-h5 font-weight-bold text--primary page-title">
                      My Profile
                    </h1>
                    <v-chip
                      x-small
                      color="purple lighten-5 purple--text"
                      class="ml-2 font-weight-bold hidden-xs-only"
                      label
                    >
                      Resident
                    </v-chip>
                  </div>
                  <div class="d-flex align-center mt-1">
                    <v-icon x-small color="success" class="mr-1">mdi-circle</v-icon>
                    <span class="text-caption text--secondary">
                      Manage your account details
                    </span>
                  </div>
                </div>
              </div>
            </v-col>
            <v-col cols="4" sm="6" class="d-flex justify-end align-center">
              <button
                v-if="!editing"
                class="edit-btn"
                @click="startEditing"
              >
                <v-icon size="16" class="mr-1">mdi-pencil-outline</v-icon>
                <span class="hidden-xs-only">Edit profile</span>
              </button>
              <v-avatar color="#8051FF" size="38" class="ml-2 avatar-glow">
                <v-img :src="avatarUrl" />
              </v-avatar>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <v-container :fluid="nav_bars" class="px-4 px-sm-6 pt-3 pt-sm-5 pb-8">
        <!-- ============================================================
             IDENTITY HERO
             ============================================================ -->
        <div class="hero-card reveal-card">
          <div class="hero-head">
            <div class="hero-avatar">{{ ownerInitials }}</div>
            <div class="hero-info">
              <div class="hero-name">{{ form.primary_owner || 'Resident' }}</div>
              <div class="hero-address">
                {{ [form.section, form.court, form.street].filter(Boolean).join(' · ') || '—' }}
              </div>
            </div>
            <div class="hero-status" :class="statusChipClass">
              <v-icon size="14">{{ statusIcon }}</v-icon>
              <span>{{ household.status || 'Approved' }}</span>
            </div>
          </div>

          <div class="hero-grid">
            <div class="hero-metric">
              <div class="metric-label">Account no.</div>
              <div class="metric-value mono">{{ shortUid }}</div>
            </div>
            <div class="hero-metric">
              <div class="metric-label">House</div>
              <div class="metric-value">{{ form.house_number || '—' }}</div>
            </div>
            <div class="hero-metric">
              <div class="metric-label">Estate</div>
              <div class="metric-value">{{ household.estate_name || '—' }}</div>
            </div>
            <div class="hero-metric">
              <div class="metric-label">Contact</div>
              <div class="metric-value">{{ form.contact_number || '—' }}</div>
            </div>
          </div>
        </div>

        <!-- ============================================================
             PERSONAL DETAILS
             ============================================================ -->
        <div class="panel-card mt-4 reveal-card" style="animation-delay: 80ms">
          <div class="panel-head">
            <div class="panel-icon panel-icon-purple">
              <v-icon size="20" color="white">mdi-account-outline</v-icon>
            </div>
            <div class="panel-title-group">
              <div class="panel-title">Personal details</div>
              <div class="panel-sub">Your name and household composition</div>
            </div>
            <div v-if="editing" class="edit-pill edit-pill-active">
              <v-icon size="12">mdi-pencil</v-icon>
              Editing
            </div>
          </div>

          <div class="panel-body">
            <div class="field-grid">
              <div class="field">
                <label class="field-label">Primary owner <span class="required">*</span></label>
                <input
                  v-model="form.primary_owner"
                  class="field-input"
                  :class="{ 'field-input-readonly': !editing }"
                  type="text"
                  :disabled="!editing"
                  placeholder="e.g. Jane Wanjiku"
                />
              </div>

              <div class="field">
                <label class="field-label">Spouse / co-owner</label>
                <input
                  v-model="form.spouse_name"
                  class="field-input"
                  :class="{ 'field-input-readonly': !editing }"
                  type="text"
                  :disabled="!editing"
                  placeholder="e.g. John Mwangi"
                />
              </div>

              <div class="field">
                <label class="field-label">Caretaker</label>
                <input
                  v-model="form.caretaker_name"
                  class="field-input"
                  :class="{ 'field-input-readonly': !editing }"
                  type="text"
                  :disabled="!editing"
                  placeholder="Optional"
                />
              </div>

              <div class="field">
                <label class="field-label">Residence status</label>
                <select
                  v-model="form.residence_status"
                  class="field-input"
                  :class="{ 'field-input-readonly': !editing }"
                  :disabled="!editing"
                >
                  <option value="Resident">Resident</option>
                  <option value="Landlord">Landlord</option>
                  <option value="Tenant">Tenant</option>
                  <option value="Caretaker">Caretaker</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================================
             CONTACT
             ============================================================ -->
        <div class="panel-card mt-4 reveal-card" style="animation-delay: 120ms">
          <div class="panel-head">
            <div class="panel-icon panel-icon-lime">
              <v-icon size="20" color="#0A0A14">mdi-phone-outline</v-icon>
            </div>
            <div class="panel-title-group">
              <div class="panel-title">Contact</div>
              <div class="panel-sub">How the estate reaches you</div>
            </div>
          </div>

          <div class="panel-body">
            <div class="field-grid">
              <div class="field">
                <label class="field-label">
                  Phone number
                  <span class="required">*</span>
                  <span class="field-hint">Used for M-Pesa and SMS notifications</span>
                </label>
                <input
                  v-model="form.contact_number"
                  class="field-input"
                  :class="{ 'field-input-readonly': !editing }"
                  type="tel"
                  :disabled="!editing"
                  placeholder="2547XXXXXXXX"
                />
              </div>
            </div>

            <div class="info-strip">
              <v-icon size="16" color="#8051FF" class="mr-2">mdi-information-outline</v-icon>
              Changing your phone number may affect M-Pesa STK push payments. Make sure the new number is registered on M-Pesa.
            </div>
          </div>
        </div>

        <!-- ============================================================
             ADDRESS  — dropdowns from estate config
             ============================================================ -->
        <div class="panel-card mt-4 reveal-card" style="animation-delay: 160ms">
          <div class="panel-head">
            <div class="panel-icon panel-icon-amber">
              <v-icon size="20" color="white">mdi-map-marker-outline</v-icon>
            </div>
            <div class="panel-title-group">
              <div class="panel-title">Address</div>
              <div class="panel-sub">
                {{ addressConfigLoaded ? 'Pick from your estate\'s options' : 'Loading address options…' }}
              </div>
            </div>
            <div v-if="addressConfigLoaded" class="edit-pill">
              {{ addressOptionsCount }} option{{ addressOptionsCount === 1 ? '' : 's' }}
            </div>
          </div>

          <div class="panel-body">
            <div v-if="loadingAddressConfig" class="address-loading">
              <v-progress-circular indeterminate size="22" color="#8051ff" />
              <span>Loading address options…</span>
            </div>

            <div v-else class="field-grid">
              <!-- House number — free text (not in estate config) -->
              <div class="field">
                <label class="field-label">House number</label>
                <input
                  v-model="form.house_number"
                  class="field-input"
                  :class="{ 'field-input-readonly': !editing }"
                  type="text"
                  :disabled="!editing"
                  placeholder="e.g. H233"
                />
              </div>

              <!-- Section -->
              <div v-if="addressConfig.show_section" class="field">
                <label class="field-label">Section</label>
                <select
                  v-model="form.section"
                  class="field-input"
                  :class="{ 'field-input-readonly': !editing }"
                  :disabled="!editing"
                >
                  <option value="">— Select section —</option>
                  <option
                    v-for="s in addressOptions.sections"
                    :key="'sec-' + s"
                    :value="s"
                  >
                    {{ s }}
                  </option>
                </select>
                <div v-if="editing && !addressOptions.sections.length" class="field-hint field-hint-warn">
                  No sections configured for this estate.
                </div>
              </div>

              <!-- Court -->
              <div v-if="addressConfig.show_court" class="field">
                <label class="field-label">Court</label>
                <select
                  v-model="form.court"
                  class="field-input"
                  :class="{ 'field-input-readonly': !editing }"
                  :disabled="!editing"
                >
                  <option value="">— Select court —</option>
                  <option
                    v-for="c in addressOptions.courts"
                    :key="'crt-' + c"
                    :value="c"
                  >
                    {{ c }}
                  </option>
                </select>
                <div v-if="editing && !addressOptions.courts.length" class="field-hint field-hint-warn">
                  No courts configured for this estate.
                </div>
              </div>

              <!-- Street -->
              <div v-if="addressConfig.show_street" class="field">
                <label class="field-label">Street</label>
                <select
                  v-model="form.street"
                  class="field-input"
                  :class="{ 'field-input-readonly': !editing }"
                  :disabled="!editing"
                >
                  <option value="">— Select street —</option>
                  <option
                    v-for="st in addressOptions.streets"
                    :key="'str-' + st"
                    :value="st"
                  >
                    {{ st }}
                  </option>
                </select>
                <div v-if="editing && !addressOptions.streets.length" class="field-hint field-hint-warn">
                  No streets configured for this estate.
                </div>
              </div>
            </div>

            <div class="info-strip">
              <v-icon size="16" color="#8051FF" class="mr-2">mdi-information-outline</v-icon>
              Address options come from your estate's configuration. If your correct section, court, or street is missing, contact your estate office.
            </div>
          </div>
        </div>

        <!-- ============================================================
             OFFICIAL STATUS (read-only)
             ============================================================ -->
        <div v-if="household.is_official" class="panel-card mt-4 reveal-card" style="animation-delay: 200ms">
          <div class="panel-head">
            <div class="panel-icon panel-icon-purple">
              <v-icon size="20" color="white">mdi-shield-account-outline</v-icon>
            </div>
            <div class="panel-title-group">
              <div class="panel-title">Estate official</div>
              <div class="panel-sub">You have an official role in this estate</div>
            </div>
          </div>

          <div class="panel-body">
            <div class="official-chip">
              <v-icon size="18" color="#8051FF">mdi-shield-check-outline</v-icon>
              <div>
                <div class="official-role">{{ household.official_role || 'Official' }}</div>
                <div class="official-hint">
                  Role changes are managed by the estate office.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================================
             SAVE BAR
             ============================================================ -->
        <transition name="save-bar">
          <div v-if="editing" class="save-bar">
            <div class="save-bar-inner">
              <div class="save-bar-text">
                <v-icon size="18" :color="canSave ? 'amber' : 'grey'" class="mr-2">
                  {{ canSave ? 'mdi-alert-circle-outline' : 'mdi-check-circle-outline' }}
                </v-icon>
                <span>{{ canSave ? 'You have unsaved changes' : 'No changes to save' }}</span>
              </div>
              <div class="save-bar-actions">
                <button class="save-bar-btn save-bar-cancel" @click="cancelEditing">
                  Cancel
                </button>
                <button
                  class="save-bar-btn save-bar-save"
                  :disabled="!canSave || saving"
                  @click="saveProfile"
                >
                  <v-icon v-if="saving" size="14" class="spin mr-1">mdi-loading</v-icon>
                  <v-icon v-else size="14" class="mr-1">mdi-content-save-outline</v-icon>
                  {{ saving ? 'Saving…' : 'Save changes' }}
                </button>
              </div>
            </div>
          </div>
        </transition>
      </v-container>

      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        :timeout="4000"
        bottom
        rounded="pill"
        class="mb-6 snackbar-premium"
        elevation="6"
      >
        <div class="d-flex align-center">
          <v-avatar
            :color="snackbar.color === 'success' ? 'success darken-2' : 'error darken-2'"
            size="28"
            class="mr-3"
          >
            <v-icon color="white" small>
              {{ snackbar.color === 'success' ? 'mdi-check' : 'mdi-alert' }}
            </v-icon>
          </v-avatar>
          <span class="font-weight-medium">{{ snackbar.text }}</span>
        </div>
      </v-snackbar>
    </v-main>
  </div>
</template>

<script>
import axios from "axios";

const API = "https://makaaziserver22.up.railway.app/api";

const EMPTY_FORM = () => ({
  primary_owner: "",
  spouse_name: "",
  caretaker_name: "",
  residence_status: "Resident",
  contact_number: "",
  house_number: "",
  section: "",
  court: "",
  street: "",
});

const DEFAULT_ADDRESS_CONFIG = () => ({
  show_section: true,
  show_court: true,
  show_street: true,
  show_house_number: true,
});

const EMPTY_ADDRESS_OPTIONS = () => ({
  sections: [],
  courts: [],
  streets: [],
});

export default {
  name: "HouseholdProfile",
  data() {
    return {
      nav_bars: false,
      activeTab: "/household/profile",

      loading: false,
      saving: false,
      editing: false,

      uid: null,
      householdId: null,
      estateId: null,

      household: {
        status: "",
        is_official: 0,
        official_role: null,
        estate_name: "",
      },

      form: EMPTY_FORM(),
      original: EMPTY_FORM(),

      // Address config + options from the estate
      addressConfig: DEFAULT_ADDRESS_CONFIG(),
      addressOptions: EMPTY_ADDRESS_OPTIONS(),
      loadingAddressConfig: false,
      addressConfigLoaded: false,

      snackbar: { show: false, text: "", color: "success" },
    };
  },

  computed: {
    dashboardRoute() {
      return this.uid
        ? `/household/dashboard/${this.uid}`
        : "/household/dashboard";
    },

    menuItems() {
      return [
        { title: "Dashboard", icon: "mdi-view-dashboard", route: this.dashboardRoute },
        { title: "Payments", icon: "mdi-currency-usd", route: "/household/payment_summary" },
        { title: "Profile", icon: "mdi-account", route: "/household/profile" },
        { title: "Alerts", icon: "mdi-bell", route: "/household/notifications" },
      ];
    },

    avatarUrl() {
      const name = this.form.primary_owner || "Resident";
      return `https://ui-avatars.com/api/?background=8051FF&color=fff&name=${encodeURIComponent(name)}`;
    },

    ownerInitials() {
      const name = this.form.primary_owner || "R";
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    },

    shortUid() {
      if (!this.uid) return "—";
      return this.uid.length > 12
        ? `${this.uid.slice(0, 6)}…${this.uid.slice(-4)}`
        : this.uid;
    },

    statusChipClass() {
      const s = (this.household.status || "").toLowerCase();
      if (s === "pending") return "hero-status-amber";
      if (s === "rejected") return "hero-status-red";
      return "hero-status-green";
    },

    statusIcon() {
      const s = (this.household.status || "").toLowerCase();
      if (s === "pending") return "mdi-clock-outline";
      if (s === "rejected") return "mdi-close-circle-outline";
      return "mdi-check-circle-outline";
    },

    addressOptionsCount() {
      return (
        this.addressOptions.sections.length +
        this.addressOptions.courts.length +
        this.addressOptions.streets.length
      );
    },

    dirty() {
      return JSON.stringify(this.form) !== JSON.stringify(this.original);
    },

    canSave() {
      return (
        this.dirty &&
        !!String(this.form.primary_owner || "").trim() &&
        !!String(this.form.contact_number || "").trim()
      );
    },
  },

  mounted() {
    this.onResize();
    window.addEventListener("resize", this.onResize);
    this.waitForAuthAndLoad();
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
    if (this._authUnsub) this._authUnsub();
  },

  methods: {
    onResize() {
      this.nav_bars = window.innerWidth < 768;
    },

    isActive(route) {
      return this.$route && this.$route.path === route;
    },

    goTo(path) {
      if (!path) return;
      if (this.$route && this.$route.path === path) return;
      try {
        if (this.$router && typeof this.$router.push === "function") {
          const result = this.$router.push(path);
          if (result && typeof result.catch === "function") {
            result.catch((err) => {
              if (err && err.name !== "NavigationDuplicated") {
                console.error("Nav error:", err);
              }
            });
          }
        } else {
          window.location.href = path;
        }
      } catch (err) {
        console.error("goTo failed:", err);
        window.location.href = path;
      }
    },

    // =====================================================
    // AUTH
    // =====================================================
    waitForAuthAndLoad() {
      const that = this;
      const current = that.$fire?.auth?.currentUser;
      if (current && current.uid) {
        that.uid = current.uid;
        that.loadProfile();
        return;
      }
      that._authUnsub = that.$fire.auth.onAuthStateChanged((user) => {
        if (user && user.uid) {
          that.uid = user.uid;
          that.loadProfile();
          if (that._authUnsub) {
            that._authUnsub();
            that._authUnsub = null;
          }
        } else {
          that.showSnackbar("Please sign in to view your profile", "error");
        }
      });
    },

    async getAuthHeaders() {
      try {
        const user = this.$fire?.auth?.currentUser;
        if (!user) return {};
        const token = await user.getIdToken();
        return { Authorization: `Bearer ${token}` };
      } catch (e) {
        console.warn("getIdToken failed:", e.message);
        return {};
      }
    },

    // =====================================================
    // LOAD
    // =====================================================
    async loadProfile() {
      if (!this.uid) return;
      this.loading = true;

      try {
        const { data, status } = await axios.get(
          `${API}/households/getHouseHoldId/${this.uid}`
        );

        if (status === 200 && data) {
          this.householdId = data.household_id || null;
          this.estateId = data.estate_id || null;

          this.household = {
            status: data.status || "",
            is_official: data.is_official ? 1 : 0,
            official_role: data.official_role || null,
            estate_name: data.estate_name || "",
          };

          const loaded = {
            primary_owner: data.primary_owner || "",
            spouse_name: data.spouse_name || "",
            caretaker_name: data.caretaker_name || "",
            residence_status: data.residence_status || "Resident",
            contact_number: data.contact_number || "",
            house_number: data.house_number || "",
            section: data.section || "",
            court: data.court || "",
            street: data.street || "",
          };

          this.form = { ...loaded };
          this.original = { ...loaded };

          // Now load the address config + options for this estate
          if (this.estateId) {
            await this.loadAddressOptions();
          }
        }
      } catch (err) {
        console.error("loadProfile failed:", err.response?.data || err.message);
        this.showSnackbar("Could not load your profile", "error");
      } finally {
        this.loading = false;
      }
    },

    async loadAddressOptions() {
      if (!this.estateId) return;
      this.loadingAddressConfig = true;

      try {
        const { data, status } = await axios.get(
          `${API}/households/address-dropdowns/${this.estateId}`
        );

        if (status === 200 && data) {
          // Expected shape: { sections: [], courts: [], streets: [], config: {...} }
          // Fallback to top-level arrays if `config` is missing.
          this.addressOptions = {
            sections: this.pickArray(data, ["sections", "section"]),
            courts: this.pickArray(data, ["courts", "court"]),
            streets: this.pickArray(data, ["streets", "street"]),
          };

          const cfg = data.config || data.address_config || data;
          this.addressConfig = {
            show_section: this.pickBool(cfg, ["show_section"], true),
            show_court: this.pickBool(cfg, ["show_court"], true),
            show_street: this.pickBool(cfg, ["show_street"], true),
            show_house_number: this.pickBool(cfg, ["show_house_number"], true),
          };

          this.addressConfigLoaded = true;
        }
      } catch (err) {
        console.warn("loadAddressOptions failed:", err.response?.status || err.message);
        // Don't block the profile — just fall back to free-text (all fields shown)
        this.addressConfig = DEFAULT_ADDRESS_CONFIG();
      } finally {
        this.loadingAddressConfig = false;
      }
    },

    // Accept both `["A", "B"]` and `[{name: "A"}, {section_name: "B"}]`
    pickArray(data, keys) {
      for (const key of keys) {
        const v = data?.[key];
        if (Array.isArray(v)) {
          return v
            .map((item) => {
              if (typeof item === "string") return item;
              return (
                item.name ||
                item.section_name ||
                item.court_name ||
                item.street_name ||
                ""
              );
            })
            .filter(Boolean);
        }
      }
      return [];
    },

    pickBool(obj, keys, fallback) {
      for (const key of keys) {
        const v = obj?.[key];
        if (v === 0 || v === 1 || v === "0" || v === "1" || typeof v === "boolean") {
          return !!(Number(v) || v === true);
        }
      }
      return fallback;
    },

    // =====================================================
    // EDITING
    // =====================================================
    startEditing() {
      if (!this.householdId) {
        this.showSnackbar("Profile is still loading. Please wait a moment.", "warning");
        return;
      }
      this.editing = true;
    },

    cancelEditing() {
      this.form = { ...this.original };
      this.editing = false;
    },

    async saveProfile() {
      if (!this.canSave || this.saving) return;

      if (!this.householdId) {
        this.showSnackbar("Household ID not loaded. Please refresh.", "error");
        return;
      }

      // Normalize phone to 254XXXXXXXXX where possible
      const rawPhone = String(this.form.contact_number || "").replace(/\D/g, "");
      let normalizedPhone = rawPhone;
      if (normalizedPhone.startsWith("0")) {
        normalizedPhone = "254" + normalizedPhone.slice(1);
      } else if (
        !normalizedPhone.startsWith("254") &&
        normalizedPhone.length === 9
      ) {
        normalizedPhone = "254" + normalizedPhone;
      }

      const payload = {
        primary_owner: String(this.form.primary_owner || "").trim(),
        spouse_name: String(this.form.spouse_name || "").trim(),
        caretaker_name: String(this.form.caretaker_name || "").trim(),
        residence_status: this.form.residence_status || "Resident",
        contact_number: normalizedPhone,
        house_number: String(this.form.house_number || "").trim(),
        section: String(this.form.section || "").trim(),
        court: String(this.form.court || "").trim(),
        street: String(this.form.street || "").trim(),
      };

      this.saving = true;

      try {
        const headers = await this.getAuthHeaders();

        // Uses EXISTING route: PATCH /households/update_household/:id
        await axios.patch(
          `${API}/households/update_household/${this.householdId}`,
          payload,
          { headers }
        );

        this.form = { ...payload };
        this.original = { ...payload };
        this.editing = false;
        this.showSnackbar("Profile updated", "success");
      } catch (err) {
        console.error("saveProfile failed:", err.response?.data || err.message);
        const msg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Could not save your profile";
        this.showSnackbar(msg, "error");
      } finally {
        this.saving = false;
      }
    },

    showSnackbar(text, color = "success") {
      this.snackbar = { show: true, text, color };
    },

    logout() {
      if (this.$fire?.auth) this.$fire.auth.signOut();
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
/* ============================================================
   BASE
   ============================================================ */
.cursor-pointer { cursor: pointer; }
.bg-surface { background-color: #f6f7fb !important; }
.mono { font-family: ui-monospace, SFMono-Regular, monospace; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
.reveal-card { animation: fadeInUp 0.5s ease-out both; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 1s linear infinite; }

/* ============================================================
   SIDEBAR
   ============================================================ */
.sidebar-glass {
  background: #ffffff !important;
  border-right: 1px solid #eef1f6 !important;
}
.brand-text { letter-spacing: -0.5px; }
.brand-hover { transition: opacity 0.2s; }
.brand-hover:hover { opacity: 0.85; }
.brand-avatar {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%) !important;
  box-shadow: 0 12px 24px -12px rgba(128, 81, 255, 0.7);
}
.nav-item-premium {
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 4px;
  border-radius: 12px !important;
}
.nav-item-premium:hover {
  background-color: rgba(128, 81, 255, 0.06);
  transform: translateX(3px);
}
.nav-item-active { background: rgba(128, 81, 255, 0.09) !important; }
.help-card {
  padding: 14px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(128, 81, 255, 0.08) 0%, rgba(155, 108, 255, 0.04) 100%);
  border: 1px solid rgba(128, 81, 255, 0.12);
}
.help-title { font-size: 0.82rem; font-weight: 800; color: #0f0d24; }
.help-sub { font-size: 0.7rem; color: #64748b; margin-top: 2px; }
.signout-btn:hover { background: rgba(128, 81, 255, 0.06); }

/* ============================================================
   HEADER
   ============================================================ */
.main-premium { scroll-behavior: smooth; }
.sticky-header-premium {
  position: sticky;
  top: 0;
  z-index: 5;
  background: rgba(246, 247, 251, 0.85);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}
.page-title { letter-spacing: -0.6px; }
.header-text { min-width: 0; }

.back-btn {
  background: #ffffff;
  border: 1px solid #eef1f6;
  transition: all 0.2s ease;
}
.back-btn:hover {
  background: rgba(128, 81, 255, 0.06);
  border-color: rgba(128, 81, 255, 0.3);
}

.edit-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid #eef1f6;
  color: #0f0d24;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.03);
}
.edit-btn:hover {
  border-color: rgba(128, 81, 255, 0.4);
  color: #8051ff;
  background: rgba(128, 81, 255, 0.05);
}

.avatar-glow { box-shadow: 0 8px 18px -8px rgba(128, 81, 255, 0.6); }

/* ============================================================
   HERO
   ============================================================ */
.hero-card {
  background: #ffffff;
  border: 1px solid #eef1f6;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.03);
}
.hero-head {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.hero-avatar {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.05rem;
  flex-shrink: 0;
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.7);
}
.hero-info { flex: 1; min-width: 0; }
.hero-name {
  font-size: 1.02rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hero-address {
  font-size: 0.76rem;
  color: #94a3b8;
  margin-top: 3px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hero-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.hero-status-green { background: rgba(122, 184, 0, 0.14); color: #3f6b00; }
.hero-status-amber { background: rgba(245, 158, 11, 0.14); color: #b45309; }
.hero-status-red   { background: rgba(239, 68, 68, 0.12); color: #b91c1c; }

.hero-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px 20px;
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid #f1f5f9;
}
@media (min-width: 600px) {
  .hero-grid { grid-template-columns: repeat(4, 1fr); }
}
.hero-metric { min-width: 0; }
.metric-label {
  font-size: 0.62rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  margin-bottom: 4px;
}
.metric-value {
  font-size: 0.92rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
  font-variant-numeric: tabular-nums;
}

/* ============================================================
   PANEL
   ============================================================ */
.panel-card {
  background: #ffffff;
  border: 1px solid #eef1f6;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.03);
}
.panel-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
  background: linear-gradient(to bottom, #ffffff, #f8fafc);
}
.panel-title-group { flex: 1; min-width: 0; }
.panel-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.panel-icon-purple {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.7);
}
.panel-icon-lime {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  box-shadow: 0 10px 22px -10px rgba(182, 255, 0, 0.6);
}
.panel-icon-amber {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 10px 22px -10px rgba(245, 158, 11, 0.6);
}
.panel-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
}
.panel-sub {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 2px;
  font-weight: 500;
}
.panel-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.edit-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background: #f1f5f9;
  color: #475569;
}
.edit-pill-active {
  background: rgba(245, 158, 11, 0.14);
  color: #b45309;
}

/* ============================================================
   FIELDS
   ============================================================ */
.field-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 600px) {
  .field-grid { grid-template-columns: 1fr 1fr; }
}
.field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.field-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}
.required { color: #dc2626; font-weight: 800; }
.field-hint {
  font-size: 0.62rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: none;
  letter-spacing: 0;
}
.field-hint-warn {
  color: #b45309;
  font-weight: 700;
  margin-top: 2px;
}
.field-input {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px solid #eef1f6;
  background: #f8fafc;
  font-size: 0.88rem;
  font-weight: 600;
  color: #0f0d24;
  outline: none;
  font-family: inherit;
  width: 100%;
  transition: all 0.2s ease;
}
.field-input:focus {
  border-color: #8051ff;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(128, 81, 255, 0.1);
}
.field-input::placeholder { color: #94a3b8; font-weight: 500; }

.field-input-readonly {
  background: #f6f7fb;
  border-color: transparent;
  color: #475569;
  cursor: default;
}
.field-input-readonly:focus {
  border-color: transparent;
  background: #f6f7fb;
  box-shadow: none;
}

select.field-input {
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 38px;
  cursor: pointer;
}
select.field-input:disabled {
  cursor: default;
}

.address-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 24px;
  justify-content: center;
  color: #94a3b8;
  font-size: 0.8rem;
  font-weight: 600;
}

.info-strip {
  display: flex;
  align-items: flex-start;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(128, 81, 255, 0.06);
  border: 1px solid rgba(128, 81, 255, 0.12);
  font-size: 0.76rem;
  color: #475569;
  font-weight: 500;
  line-height: 1.55;
}

.official-chip {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(128, 81, 255, 0.09) 0%, rgba(155, 108, 255, 0.04) 100%);
  border: 1px solid rgba(128, 81, 255, 0.15);
}
.official-role {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.2px;
}
.official-hint {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 2px;
  font-weight: 500;
}

/* ============================================================
   SAVE BAR
   ============================================================ */
.save-bar {
  position: sticky;
  bottom: 80px;
  z-index: 6;
  margin-top: 20px;
}
@media (min-width: 768px) {
  .save-bar { bottom: 20px; }
}
.save-bar-inner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: #0f0d24;
  border-radius: 18px;
  box-shadow: 0 20px 40px -20px rgba(15, 13, 36, 0.6);
  flex-wrap: wrap;
}
.save-bar-text {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  font-size: 0.78rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.2px;
}
.save-bar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.save-bar-btn {
  display: inline-flex;
  align-items: center;
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}
.save-bar-cancel {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}
.save-bar-cancel:hover { background: rgba(255, 255, 255, 0.14); }

.save-bar-save {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.8);
}
.save-bar-save:hover:not(:disabled) { transform: translateY(-1px); }
.save-bar-save:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}

.save-bar-enter-active,
.save-bar-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.save-bar-enter,
.save-bar-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* ============================================================
   SNACKBAR + MOBILE NAV
   ============================================================ */
.snackbar-premium ::v-deep .v-snackbar__content { padding: 12px 20px; }

.bottom-nav-premium {
  border-top: 1px solid #eef1f6 !important;
  background: rgba(255, 255, 255, 0.96) !important;
  backdrop-filter: blur(14px);
}
.mobile-nav-btn { min-width: 0 !important; }
.mobile-nav-label {
  font-size: 10px;
  margin-top: 2px;
  font-weight: 700;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 599px) {
  .sticky-header-premium { padding-left: 12px; padding-right: 12px; }
  .reveal-card { animation-duration: 0.4s; }
  .hero-card { padding: 16px; }
  .hero-avatar { width: 46px; height: 46px; font-size: 0.95rem; }
  .hero-name { font-size: 0.95rem; }
  .metric-value { font-size: 0.85rem; }
  .panel-head { padding: 14px 16px; }
  .panel-body { padding: 16px; }
  .save-bar-inner { padding: 12px 14px; flex-direction: column; align-items: stretch; }
  .save-bar-text { justify-content: center; }
  .save-bar-actions { justify-content: stretch; }
  .save-bar-btn { flex: 1; justify-content: center; }
}
</style>