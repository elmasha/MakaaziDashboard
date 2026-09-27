<template>
  <div class="estate-shell">
    <!-- ============================================================
         SIDEBAR — desktop
         ============================================================ -->
    <aside v-if="!isMobile" class="estate-sidebar">
      <div class="brand-block">
        <div class="brand-mark">
          <v-icon color="white" size="20">mdi-shield-account</v-icon>
        </div>
        <div>
          <div class="brand-name">Makaazi</div>
          <div class="brand-sub">Estate Console</div>
        </div>
      </div>

      <div v-if="estate_name" class="estate-chip">
        <v-avatar size="32" class="estate-chip-avatar">
          <span>{{ estateInitials }}</span>
        </v-avatar>
        <div class="estate-chip-text">
          <div class="estate-chip-name">{{ estate_name }}</div>
          <div class="estate-chip-urn">{{ estate_urn || "—" }}</div>
        </div>
      </div>

      <nav class="nav-list">
        <button
          v-for="item in items_dashboard"
          :key="item.view"
          class="nav-item"
          :class="{ 'nav-item-active': currentView === item.view }"
          @click="MoveNavigation(item.view)"
        >
          <span class="nav-icon-wrap">
            <v-icon size="18">{{ item.icon }}</v-icon>
          </span>
          <span class="nav-label">{{ item.title }}</span>
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" @click="logout">
          <v-icon size="16" class="mr-2">mdi-logout</v-icon>
          Sign out
        </button>
      </div>
    </aside>

    <!-- ============================================================
         MAIN
         ============================================================ -->
    <main class="estate-main" :class="{ 'estate-main-mobile': isMobile }">
      <header class="estate-topbar">
        <button v-if="isMobile" class="topbar-icon-btn" @click="drawer = true">
          <v-icon size="20">mdi-menu</v-icon>
        </button>

        <div class="topbar-title">
          <h1 class="topbar-heading">{{ currentTitle }}</h1>
          <p class="topbar-sub">
            <span class="topbar-dot" :class="{ 'topbar-dot-active': estate_active }"></span>
            {{ estate_name || 'Loading estate…' }}
          </p>
        </div>

        <v-spacer></v-spacer>

        <button class="topbar-icon-btn" @click="openAddOfficial" title="Add official">
          <v-icon size="20">mdi-account-plus-outline</v-icon>
        </button>
        <button class="topbar-icon-btn" @click="notify" title="Notifications">
          <v-icon size="20">mdi-bell-outline</v-icon>
          <span v-if="unreadCount" class="notif-dot"></span>
        </button>
        <button class="topbar-avatar" @click="MoveNavigation('account')">
          {{ initials }}
        </button>
      </header>

      <div class="estate-content">
        <transition name="view-fade" mode="out-in">
          <div :key="currentView" class="estate-view">
            <dashboard v-if="currentView === 'dashboard'" :estateId="estateId" />
            <account v-else-if="currentView === 'account'" :estateId="estateId" />
            <billing v-else-if="currentView === 'billing'" :estateId="estateId" />
            <estateOfficials v-else-if="currentView === 'officials'" :estateId="estateId" />
            <households v-else-if="currentView === 'residents'" :estateId="estateId" />
            <estateConfig v-else-if="currentView === 'config'" :estateId="estateId" />
          </div>
        </transition>

        <!-- Extra bottom spacer so nothing ends flush against siblings -->
        <div class="estate-content-tail"></div>
      </div>
    </main>

    <!-- ============================================================
         MOBILE DRAWER
         ============================================================ -->
    <v-navigation-drawer
      v-model="drawer"
      temporary
      absolute
      width="280"
      class="mobile-drawer"
    >
      <div class="mobile-drawer-inner">
        <div class="brand-block">
          <div class="brand-mark">
            <v-icon color="white" size="20">mdi-shield-account</v-icon>
          </div>
          <div>
            <div class="brand-name">Makaazi</div>
            <div class="brand-sub">Estate Console</div>
          </div>
        </div>

        <div v-if="estate_name" class="estate-chip">
          <v-avatar size="32" class="estate-chip-avatar">
            <span>{{ estateInitials }}</span>
          </v-avatar>
          <div class="estate-chip-text">
            <div class="estate-chip-name">{{ estate_name }}</div>
            <div class="estate-chip-urn">{{ estate_urn || "—" }}</div>
          </div>
        </div>

        <nav class="nav-list">
          <button
            v-for="item in items_dashboard"
            :key="item.view"
            class="nav-item"
            :class="{ 'nav-item-active': currentView === item.view }"
            @click="MoveNavigation(item.view), (drawer = false)"
          >
            <span class="nav-icon-wrap">
              <v-icon size="18">{{ item.icon }}</v-icon>
            </span>
            <span class="nav-label">{{ item.title }}</span>
          </button>
        </nav>

        <div class="sidebar-footer">
          <button class="logout-btn" @click="logout">
            <v-icon size="16" class="mr-2">mdi-logout</v-icon>
            Sign out
          </button>
        </div>
      </div>
    </v-navigation-drawer>

    <!-- ============================================================
         MOBILE BOTTOM NAV
         ============================================================ -->
    <nav v-if="isMobile" class="bottom-nav">
      <button
        v-for="item in bottomNavItems"
        :key="item.view"
        class="bottom-nav-btn"
        :class="{ 'bottom-nav-btn-active': currentView === item.view }"
        @click="MoveNavigation(item.view)"
      >
        <v-icon size="20">{{ item.icon }}</v-icon>
        <span class="bottom-nav-label">{{ item.shortTitle || item.title }}</span>
      </button>
    </nav>

    <!-- ============================================================
         ADD OFFICIAL DIALOG
         ============================================================ -->
    <v-dialog v-model="dialog" max-width="600" content-class="official-dialog">
      <div class="dialog-shell">
        <div class="dialog-header">
          <div class="dialog-header-icon">
            <v-icon color="white" size="20">mdi-account-plus</v-icon>
          </div>
          <div class="flex-grow-1" style="min-width: 0">
            <div class="dialog-title">Add estate official</div>
            <div class="dialog-sub">
              {{ estate_name || "—" }} · {{ estate_urn || "—" }}
            </div>
          </div>
          <button class="dialog-close" @click="dialog = false">
            <v-icon size="18" color="white">mdi-close</v-icon>
          </button>
        </div>

        <div class="dialog-body">
          <label class="field-label">Official role</label>
          <v-select
            v-model="role"
            :items="roles"
            dense
            outlined
            rounded
            hide-details
            placeholder="Select role"
            class="mb-5"
          >
            <template v-slot:prepend-inner>
              <v-icon size="18" color="#9ca3af">mdi-shield-account-outline</v-icon>
            </template>
          </v-select>

          <label class="field-label">Assign to household</label>
          <v-text-field
            v-model="household_search"
            dense
            outlined
            rounded
            hide-details
            placeholder="Search by name, phone, or house number"
            prepend-inner-icon="mdi-magnify"
            class="mb-5"
            @input="onSearchInput"
          ></v-text-field>

          <div v-if="loadingHouseholds" class="list-loader">
            <v-skeleton-loader type="list-item-avatar-two-line" />
            <v-skeleton-loader type="list-item-avatar-two-line" />
            <v-skeleton-loader type="list-item-avatar-two-line" />
          </div>

          <div v-else-if="estate_houseHolds.length === 0" class="empty-state">
            <div class="empty-icon">
              <v-icon size="34" color="#cbd5e1">mdi-home-search-outline</v-icon>
            </div>
            <div class="empty-title">No households found</div>
            <div class="empty-text">
              {{ household_search ? "Try a different search term." : "No households registered yet." }}
            </div>
          </div>

          <div v-else class="household-list">
            <div
              v-for="hs in estate_houseHolds"
              :key="hs.household_id"
              class="household-item"
              :class="{ 'household-item-official': hs.is_official }"
            >
              <div class="household-avatar" :class="roleColor(hs)">
                {{ (hs.primary_owner || '?').substring(0, 2).toUpperCase() }}
              </div>
              <div class="household-info">
                <div class="household-name">
                  {{ hs.primary_owner }}
                  <v-icon v-if="hs.is_official" size="14" color="#10b981" class="ml-1">
                    mdi-check-decagram
                  </v-icon>
                </div>
                <div class="household-meta">
                  <span v-if="hs.house_number">Hs {{ hs.house_number }}</span>
                  <span v-if="hs.house_number && hs.contact_number" class="dot-sep">·</span>
                  <span v-if="hs.contact_number">{{ hs.contact_number }}</span>
                  <span v-if="hs.is_official && hs.official_role" class="official-role">
                    {{ hs.official_role }}
                  </span>
                </div>
              </div>
              <div class="household-action">
                <v-btn
                  v-if="!hs.is_official"
                  small
                  rounded
                  depressed
                  color="#7c3aed"
                  dark
                  class="text-capitalize action-btn"
                  @click="assignOfficial(hs)"
                >
                  Assign
                </v-btn>
                <v-btn
                  v-else
                  small
                  rounded
                  text
                  class="text-capitalize action-btn action-btn-revoke"
                  @click="revokeOfficial(hs)"
                >
                  Revoke
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-dialog>

    <v-snackbar v-model="snackbar_s" color="#7c3aed" :timeout="3000" top rounded="pill">
      {{ snackbarText_s }}
    </v-snackbar>
    <v-snackbar v-model="snackbar" color="success" :timeout="2500" top rounded="pill">
      <div class="d-flex align-center">
        <v-icon color="white" small class="mr-2">mdi-check-circle</v-icon>
        <span>{{ snackbarText }}</span>
      </div>
    </v-snackbar>
    <v-snackbar v-model="snackbar2" color="error" :timeout="3500" top rounded="pill">
      <div class="d-flex align-center">
        <v-icon color="white" small class="mr-2">mdi-alert-circle</v-icon>
        <span>{{ snackbarText2 }}</span>
      </div>
    </v-snackbar>
  </div>
</template>

<script>
import axios from "axios";
import dashboard from "@/components/estate/dashboard.vue";
import billing from "@/components/estate/billing.vue";
import households from "@/components/estate/households.vue";
import estateConfig from "@/components/estate/estateConfig.vue";
import estateOfficials from "@/components/estate/estateOfficials.vue";
import account from "@/components/estate/account.vue";

const API = "https://makaaziserver22.up.railway.app/api";

export default {
  name: "EstateConsole",

  components: {
    dashboard,
    billing,
    households,
    estateConfig,
    estateOfficials,
    account,
  },

  data() {
    return {
      isMobile: false,
      drawer: false,
      currentView: "dashboard",

      estateId: null,
      estate_name: "",
      estate_urn: "",
      estate_active: true,

      dialog: false,
      roles: ["Chairman", "Secretary", "Treasurer"],
      role: null,
      household_search: "",
      estate_houseHolds: [],
      loadingHouseholds: false,

      unreadCount: 0,
      snackbar_s: false,
      snackbarText_s: "",
      snackbar: false,
      snackbarText: "",
      snackbar2: false,
      snackbarText2: "",
    };
  },

  computed: {
    items_dashboard() {
      return [
        { title: "Dashboard", view: "dashboard", icon: "mdi-view-dashboard-outline" },
        { title: "Account", view: "account", icon: "mdi-account-box-outline" },
        { title: "Billing", view: "billing", icon: "mdi-credit-card-outline" },
        { title: "Officials", view: "officials", icon: "mdi-shield-account-outline", shortTitle: "Officials" },
        { title: "Residents", view: "residents", icon: "mdi-home-group" },
        { title: "Config", view: "config", icon: "mdi-store-cog-outline", shortTitle: "Config" },
      ];
    },

    bottomNavItems() {
      return this.items_dashboard.slice(0, 5);
    },

    currentTitle() {
      const found = this.items_dashboard.find((i) => i.view === this.currentView);
      return found ? found.title : "Dashboard";
    },

    initials() {
      if (!this.estate_name) return "MK";
      return this.estate_name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase();
    },

    estateInitials() {
      if (!this.estate_name) return "?";
      return this.estate_name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase();
    },
  },

  mounted() {
    this.onResize();
    window.addEventListener("resize", this.onResize);

    const id = parseInt(this.$route.params.id);
    if (!isNaN(id)) {
      this.estateId = id;
      this.fetchEstate();
      this.checkBilling();
    } else {
      this.showError("Invalid estate ID in URL");
    }
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  },

  methods: {
    onResize() {
      this.isMobile = window.innerWidth < 960;
    },

    MoveNavigation(view) {
      this.currentView = view;
      if (view === "officials" || view === "residents") {
        this.fetchEstateHouseholds();
      }
    },

    async fetchEstate() {
      if (!this.estateId) return;
      try {
        const { data } = await axios.get(`${API}/estates/estate/${this.estateId}`);
        if (data && data.estate_id) {
          this.estate_name = data.estate_name || "";
          this.estate_urn = data.estate_urn || "";
        } else {
          const { data: list } = await axios.get(`${API}/estates/getall`);
          const found = Array.isArray(list) ? list.find((e) => e.estate_id === this.estateId) : null;
          if (found) {
            this.estate_name = found.estate_name || "";
            this.estate_urn = found.estate_urn || "";
          }
        }
      } catch (err) {
        console.warn("Estate fetch failed:", err.message);
      }
    },

    async checkBilling() {
      if (!this.estateId) return;
      try {
        const { data } = await axios.get(`${API}/estates/subscriptions/${this.estateId}/disable-if-due`);
        const sub = data?.subscription || data;
        this.estate_active = sub?.is_active === 1 || sub?.is_active === true;
      } catch (err) {
        console.warn("Billing check failed:", err.message);
      }
    },

    async fetchEstateHouseholds() {
      if (!this.estateId) return;
      this.loadingHouseholds = true;
      try {
        const { data } = await axios.get(`${API}/households/getBHsHldEstId/${this.estateId}`);
        this.estate_houseHolds = Array.isArray(data) ? data : [];
      } catch (err) {
        console.warn("Households fetch failed:", err.message);
        this.estate_houseHolds = [];
      } finally {
        this.loadingHouseholds = false;
      }
    },

    onSearchInput: (function () {
      let t;
      return function (val) {
        clearTimeout(t);
        t = setTimeout(() => this.searchHouseholdsEstate(val), 300);
      };
    })(),

    async searchHouseholdsEstate(val) {
      if (!this.estateId) return;
      if (!val) return this.fetchEstateHouseholds();

      this.loadingHouseholds = true;
      try {
        const { data } = await axios.get(
          `${API}/households/search/${this.estateId}?query=${encodeURIComponent(val)}`
        );
        this.estate_houseHolds = Array.isArray(data) ? data : [];
      } catch (err) {
        console.warn("Search failed:", err.message);
      } finally {
        this.loadingHouseholds = false;
      }
    },

    openAddOfficial() {
      this.dialog = true;
      this.role = null;
      this.household_search = "";
      this.fetchEstateHouseholds();
    },

    async assignOfficial(hs) {
      if (!this.role) return this.showError("Select a role first");

      try {
        await axios.patch(`${API}/households/update_household/${hs.household_id}`, {
          is_official: 1,
          official_role: this.role,
        });

        await axios.post(`${API}/officials/addOfficial`, {
          full_name: hs.primary_owner,
          estate_id: this.estateId,
          role: this.role,
          contact_number: hs.contact_number,
          estate_urn: this.estate_urn,
          uid: hs.uid,
        });

        this.showSuccess(`${hs.primary_owner} is now ${this.role}`);
        this.fetchEstateHouseholds();
      } catch (err) {
        console.error(err);
        this.showError(err.response?.data?.error || "Could not assign official");
      }
    },

    async revokeOfficial(hs) {
      try {
        await axios.patch(`${API}/households/update_household/${hs.household_id}`, {
          is_official: 0,
          official_role: "none",
        });
        await axios.put(`${API}/officials/delete_official/${hs.contact_number}`);
        this.showSuccess("Official role removed");
        this.fetchEstateHouseholds();
      } catch (err) {
        this.showError(err.response?.data?.error || "Could not revoke");
      }
    },

    roleColor(hs) {
      if (!hs.is_official) return "";
      return "household-avatar-official";
    },

    notify() {
      this.unreadCount = 0;
      this.showSuccess("Notifications cleared");
    },

    logout() {
      if (this.$fire?.auth) this.$fire.auth.signOut();
      this.$router.push("/");
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
/* ============================================================
   SHELL — fills the viewport, no page scroll
   ============================================================ */
.estate-shell {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #f7f7fb;
  font-family: inherit;
}

/* ============================================================
   SIDEBAR — full height, never scrolls with the page
   ============================================================ */
.estate-sidebar {
  width: 268px;
  flex-shrink: 0;
  height: 100vh;
  background: linear-gradient(180deg, #16123a 0%, #1e1b4b 55%, #312e81 100%);
  display: flex;
  flex-direction: column;
  padding: 22px 0;
  overflow: hidden;
  position: relative;
}

.estate-sidebar::before {
  content: "";
  position: absolute;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.35), transparent 70%);
  top: -80px;
  right: -80px;
  pointer-events: none;
}

.estate-sidebar::after {
  content: "";
  position: absolute;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(96, 165, 250, 0.2), transparent 70%);
  bottom: -60px;
  left: -60px;
  pointer-events: none;
}

.brand-block {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px 22px;
  flex-shrink: 0;
}

.brand-mark {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px -6px rgba(124, 58, 237, 0.7);
  flex-shrink: 0;
  position: relative;
}

.brand-mark::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(255,255,255,0.2), transparent 60%);
}

.brand-name {
  font-size: 1.05rem;
  font-weight: 800;
  color: white;
  letter-spacing: -0.4px;
  line-height: 1.1;
}

.brand-sub {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
  letter-spacing: 0.4px;
  margin-top: 2px;
}

.estate-chip {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 16px 22px;
  padding: 11px 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.estate-chip-avatar {
  background: linear-gradient(135deg, #7c3aed, #a855f7) !important;
  color: white !important;
  font-size: 0.7rem !important;
  font-weight: 800;
  flex-shrink: 0;
}

.estate-chip-text {
  min-width: 0;
  flex: 1;
}

.estate-chip-name {
  font-size: 0.78rem;
  font-weight: 700;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.estate-chip-urn {
  font-size: 0.66rem;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
  font-family: ui-monospace, SFMono-Regular, monospace;
}

.nav-list {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

.nav-list::-webkit-scrollbar { width: 4px; }
.nav-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  text-align: left;
  margin-bottom: 2px;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: white;
  transform: translateX(2px);
}

.nav-item-active {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white !important;
  box-shadow: 0 8px 22px -8px rgba(124, 58, 237, 0.75);
}

.nav-item-active .nav-icon-wrap {
  background: rgba(255, 255, 255, 0.15);
}

.nav-icon-wrap {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
  transition: background 0.2s ease;
}

.nav-item:hover .nav-icon-wrap {
  background: rgba(255, 255, 255, 0.1);
}

.nav-label { flex: 1; }

.nav-badge {
  background: #ef4444;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 8px;
}

.sidebar-footer {
  position: relative;
  z-index: 1;
  padding: 14px 16px 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  margin-top: 12px;
  flex-shrink: 0;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 11px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.22);
  border-radius: 10px;
  color: #fca5a5;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.22s ease;
  font-family: inherit;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.22);
  color: white;
}

/* ============================================================
   MAIN — flex column, fills remaining width and full height
   ============================================================ */
.estate-main {
  flex: 1;
  min-width: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ============================================================
   TOPBAR — fixed inside main, no sticky needed
   ============================================================ */
.estate-topbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 28px;
  background: #f7f7fb;
  border-bottom: 1px solid #e9e7f2;
  z-index: 5;
}

.topbar-title { min-width: 0; }

.topbar-heading {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -0.4px;
  margin: 0;
  line-height: 1.2;
}

.topbar-sub {
  font-size: 0.78rem;
  color: #7c7a95;
  margin: 3px 0 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.topbar-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #cbd5e1;
  transition: background 0.3s ease;
}

.topbar-dot-active {
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.topbar-icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: white;
  border: 1px solid #e9e7f2;
  color: #4b5563;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  position: relative;
}

.topbar-icon-btn:hover {
  border-color: #7c3aed;
  color: #7c3aed;
  box-shadow: 0 6px 16px -8px rgba(124, 58, 237, 0.5);
  transform: translateY(-1px);
}

.notif-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.15); }
}

.topbar-avatar {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  font-weight: 800;
  font-size: 0.78rem;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.5px;
  cursor: pointer;
  border: none;
  box-shadow: 0 6px 16px -6px rgba(124, 58, 237, 0.55);
  transition: all 0.2s ease;
  font-family: inherit;
  flex-shrink: 0;
}

.topbar-avatar:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px -6px rgba(124, 58, 237, 0.7);
}

/* ============================================================
   CONTENT — the ONLY scrollable region
   ============================================================ */
.estate-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  /* Generous bottom padding so content never ends flush against siblings */
  padding: 24px 28px 80px;
  -webkit-overflow-scrolling: touch;
}

.estate-content::-webkit-scrollbar { width: 8px; }
.estate-content::-webkit-scrollbar-thumb {
  background: #e5e3f0;
  border-radius: 4px;
}
.estate-content::-webkit-scrollbar-thumb:hover {
  background: #c7b8ff;
}

/* Wrapper around the current view */
.estate-view {
  min-height: 100%;
}

/* Extra tail spacer — guarantees nothing overlaps at the bottom */
.estate-content-tail {
  height: 8px;
  width: 100%;
  flex-shrink: 0;
}

/* ============================================================
   MOBILE — reserve space for bottom nav + extra components
   ============================================================ */
.estate-main-mobile {
  /* No extra bottom margin on the main itself — the content handles it */
  padding-bottom: 0;
}

.estate-main-mobile .estate-content {
  /* 72px bottom nav + ~20px breathing + safe area on iOS
     Bumped from 96 → 120 so nothing hides behind the nav or a FAB */
  padding: 16px 16px calc(120px + env(safe-area-inset-bottom));
}

/* Keep the extra tail spacer on mobile too */
.estate-main-mobile .estate-content-tail {
  height: 16px;
}

/* If you have a floating action button or chat widget below the
   bottom nav, bump the padding even more here: */
@media (max-width: 959px) {
  .estate-main-mobile.has-extra-bottom .estate-content {
    padding-bottom: calc(160px + env(safe-area-inset-bottom));
  }
}

/* View transition */
.view-fade-enter-active,
.view-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.view-fade-enter { opacity: 0; transform: translateY(8px); }
.view-fade-leave-to { opacity: 0; transform: translateY(-4px); }

/* ============================================================
   MOBILE DRAWER
   ============================================================ */
.mobile-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 22px 0;
}

/* ============================================================
   BOTTOM NAV
   ============================================================ */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-top: 1px solid #e9e7f2;
  padding: 6px 0;
  padding-bottom: max(6px, env(safe-area-inset-bottom));
  box-shadow: 0 -4px 20px -8px rgba(30, 27, 75, 0.08);
}

.bottom-nav-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 4px;
  background: transparent;
  border: none;
  color: #9ca3af;
  font-size: 0.65rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  position: relative;
}

.bottom-nav-btn-active { color: #7c3aed; }

.bottom-nav-btn-active::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  border-radius: 0 0 3px 3px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
}

/* ============================================================
   DIALOG
   ============================================================ */
::v-deep .official-dialog {
  overflow: hidden !important;
  border-radius: 22px !important;
  margin: 16px auto !important;
  max-width: 600px !important;
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
  position: relative;
}

.dialog-title {
  font-size: 0.98rem;
  font-weight: 800;
  line-height: 1.2;
}

.dialog-sub {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.75);
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

.dialog-close:hover { background: rgba(255, 255, 255, 0.28); }

.dialog-body {
  padding: 22px 24px;
  overflow-y: auto;
  min-height: 0;
  flex: 1 1 auto;
}

.field-label {
  display: block;
  font-size: 0.74rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 7px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.household-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.household-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border: 1px solid #e9e7f2;
  border-radius: 12px;
  transition: all 0.2s ease;
  background: white;
}

.household-item:hover {
  border-color: #c7b8ff;
  background: #fbfaff;
  transform: translateX(2px);
}

.household-item-official {
  background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
  border-color: #a7f3d0;
}

.household-avatar {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  font-size: 0.72rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.5px;
}

.household-avatar-official {
  background: linear-gradient(135deg, #10b981, #059669);
}

.household-info { flex: 1; min-width: 0; }

.household-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1e1b4b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
}

.household-meta {
  font-size: 0.72rem;
  color: #7c7a95;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot-sep { color: #cbd5e1; }

.official-role {
  background: #d1fae5;
  color: #065f46;
  font-size: 0.66rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 6px;
  letter-spacing: 0.3px;
}

.action-btn { min-width: 82px !important; }
.action-btn-revoke { color: #ef4444 !important; }
.action-btn-revoke:hover { background: #fef2f2 !important; }

.list-loader { padding: 4px 0; }

.empty-state {
  padding: 40px 16px;
  text-align: center;
}

.empty-icon {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
}

.empty-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #4b5563;
}

.empty-text {
  font-size: 0.78rem;
  color: #9ca3af;
  margin-top: 4px;
}

::v-deep .theme--light.v-text-field--outlined fieldset,
::v-deep .theme--light.v-select.v-text-field--outlined fieldset {
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
   Responsive
   ============================================================ */
@media (max-width: 959px) {
  .estate-topbar {
    padding: 12px 16px;
    gap: 8px;
  }
  .topbar-heading { font-size: 1.05rem; }
  .topbar-sub { font-size: 0.72rem; }
  .topbar-icon-btn,
  .topbar-avatar {
    width: 38px;
    height: 38px;
  }
}
</style>

<!-- ============================================================
     Global — prevent the body itself from scrolling
     ============================================================ -->
<style>
html,
body {
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
}
#__nuxt,
#__layout {
  height: 100%;
  overflow: hidden;
}
</style>