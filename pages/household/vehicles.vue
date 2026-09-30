<template>
  <div class="d-flex bg-surface dashboard-root" style="min-height: 100vh;">
    <!-- DESKTOP SIDEBAR -->
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
            @click="confirmLogout = true"
          >
            <v-icon left size="18" color="#8051FF">mdi-logout</v-icon>
            Sign Out
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- MOBILE BOTTOM NAV -->
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

    <!-- MAIN -->
    <v-main :class="nav_bars ? 'pb-16' : ''" class="main-premium">
      <!-- HEADER -->
      <div class="sticky-header-premium px-4 px-sm-6 py-4">
        <v-container fluid class="pa-0">
          <v-row align="center" no-gutters>
            <v-col cols="8" sm="6">
              <div class="header-text">
                <h1 class="text-h6 text-sm-h5 font-weight-bold text--primary page-title">
                  My vehicles
                </h1>
                <div class="d-flex align-center mt-1">
                  <v-icon x-small color="success" class="mr-1">mdi-circle</v-icon>
                  <span class="text-caption text--secondary">
                    {{ vehicles.length }} registered
                  </span>
                </div>
              </div>
            </v-col>
            <v-col cols="4" sm="6" class="d-flex justify-end align-center">
              <button
                class="icon-btn mr-2"
                :disabled="loading"
                @click="fetch"
              >
                <v-icon size="16" :class="{ spin: loading }">
                  {{ loading ? 'mdi-loading' : 'mdi-refresh' }}
                </v-icon>
              </button>

              <v-btn
                rounded depressed color="#8051FF" dark small
                class="add-btn"
                @click="openAdd"
              >
                <v-icon left small>mdi-plus</v-icon>
                <span class="hidden-xs-only">Add</span>
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <v-container :fluid="nav_bars" class="px-4 px-sm-6 pt-3 pt-sm-5 pb-8">
        <!-- VEHICLES PANEL -->
        <div class="panel-card reveal-card">
          <div class="panel-head-inline">
            <div class="panel-icon panel-icon-purple">
              <v-icon size="20" color="white">mdi-car</v-icon>
            </div>
            <div class="panel-title-group">
              <div class="panel-title">Registered vehicles</div>
              <div class="panel-sub">
                {{ vehicles.length }} total · {{ activeCount }} active · {{ pendingCount }} pending
              </div>
            </div>
          </div>

          <div class="tab-body">
            <v-skeleton-loader
              v-if="loading && !vehicles.length"
              type="list-item-three-line, list-item-three-line"
            />

            <div v-else-if="!vehicles.length" class="empty-block">
              <div class="empty-icon">
                <v-icon size="36" color="#cbd5e1">mdi-car-off</v-icon>
              </div>
              <div class="empty-title">No vehicles yet</div>
              <div class="empty-sub">
                Register your car, bike, or van so the gate recognises you.
                Your estate official will approve it once.
              </div>
              <v-btn
                rounded depressed color="#8051FF" dark
                class="mt-4"
                @click="openAdd"
              >
                <v-icon left small>mdi-plus</v-icon>
                Add your first vehicle
              </v-btn>
            </div>

            <div v-else class="row-list">
              <div
                v-for="v in vehicles"
                :key="v.vehicle_id"
                class="row-card"
              >
                <div class="row-icon row-icon-purple">
                  <v-icon size="20" color="white">{{ iconFor(v.vehicle_type) }}</v-icon>
                </div>

                <div class="row-body">
                  <div class="row-title">{{ v.plate_number }}</div>
                  <div class="row-sub">
                    {{ [v.make, v.model].filter(Boolean).join(' ') || '—' }}
                    <span v-if="v.color"> · {{ v.color }}</span>
                    <span v-if="v.year"> · {{ v.year }}</span>
                  </div>
                  <div v-if="v.sticker_number || v.parking_slot" class="row-meta">
                    <span v-if="v.sticker_number">
                      <v-icon x-small>mdi-sticker-text-outline</v-icon> {{ v.sticker_number }}
                    </span>
                    <span v-if="v.parking_slot">
                      <v-icon x-small>mdi-parking</v-icon> {{ v.parking_slot }}
                    </span>
                  </div>
                </div>

                <v-chip
                  x-small
                  label
                  class="status-chip"
                  :color="statusColor(v.status)"
                  :style="statusStyle(v.status)"
                >
                  {{ v.status }}
                </v-chip>

                <div class="row-actions">
                  <v-btn
                    icon small
                    title="Remove"
                    @click="promptRemove(v)"
                  >
                    <v-icon small>mdi-delete-outline</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- INFO STRIP -->
        <div class="info-strip mt-4 reveal-card" style="animation-delay: 60ms">
          <v-icon size="16" color="#8051FF" class="mr-2">mdi-information-outline</v-icon>
          New vehicles start as <strong>Pending</strong> until your estate official approves them.
          Approved vehicles can enter the gate without a visitor pass.
        </div>
      </v-container>

      <!-- ADD DIALOG -->
      <v-dialog v-model="dialog" max-width="480" persistent>
        <v-card rounded="xl">
          <v-card-title class="dialog-title">
            <v-icon color="#8051FF" class="mr-2">mdi-car-plus</v-icon>
            Add a vehicle
          </v-card-title>

          <v-card-text>
            <v-text-field
              v-model="form.plate_number"
              label="Plate number"
              placeholder="KDA 123X"
              outlined dense
              :error-messages="errors.plate_number"
              @input="errors.plate_number = ''"
            />
            <v-row dense>
              <v-col cols="6">
                <v-text-field v-model="form.make" label="Make" outlined dense />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="form.model" label="Model" outlined dense />
              </v-col>
            </v-row>
            <v-row dense>
              <v-col cols="6">
                <v-text-field v-model="form.color" label="Color" outlined dense />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="form.year"
                  label="Year"
                  type="number"
                  outlined dense
                />
              </v-col>
            </v-row>
            <v-select
              v-model="form.vehicle_type"
              :items="vehicleTypes"
              label="Type"
              outlined dense
            />
            <v-textarea
              v-model="form.notes"
              label="Notes (optional)"
              rows="2"
              outlined dense
            />

            <div v-if="submitError" class="error-text">{{ submitError }}</div>
            <div v-else class="hint-text">
              Your estate official will review and approve the vehicle.
            </div>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn text @click="dialog = false" :disabled="saving">Cancel</v-btn>
            <v-btn
              color="#8051FF" dark rounded depressed
              :loading="saving" @click="submit"
            >
              Save vehicle
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- REMOVE CONFIRM -->
      <v-dialog v-model="confirmRemove" max-width="420" persistent>
        <v-card rounded="xl" class="confirm-card">
          <div class="confirm-icon confirm-icon-red">
            <v-icon size="26" color="#dc2626">mdi-delete-outline</v-icon>
          </div>
          <div class="confirm-title">Remove vehicle?</div>
          <div class="confirm-text">
            {{ pendingRemove ? `Remove ${pendingRemove.plate_number} from your household?` : '' }}
            This cannot be undone.
          </div>
          <div class="confirm-actions">
            <button class="confirm-cancel" @click="confirmRemove = false">Cancel</button>
            <button class="confirm-proceed" @click="doRemove">Remove</button>
          </div>
        </v-card>
      </v-dialog>

      <!-- LOGOUT CONFIRM -->
      <v-dialog v-model="confirmLogout" max-width="420" persistent>
        <v-card rounded="xl" class="confirm-card">
          <div class="confirm-icon confirm-icon-red">
            <v-icon size="26" color="#dc2626">mdi-logout</v-icon>
          </div>
          <div class="confirm-title">Sign out?</div>
          <div class="confirm-text">
            You'll need to sign in again to view your vehicles.
          </div>
          <div class="confirm-actions">
            <button class="confirm-cancel" @click="confirmLogout = false">Cancel</button>
            <button class="confirm-proceed" @click="logout">Sign out</button>
          </div>
        </v-card>
      </v-dialog>

      <!-- SNACKBAR -->
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

export default {
  name: "HouseholdVehicles",

  data() {
    return {
      nav_bars: false,
      activeTab: "/household/vehicles",

      loading: false,
      saving: false,

      uid: null,
      estateId: null,

      vehicles: [],

      dialog: false,
      submitError: "",
      errors: { plate_number: "" },
      form: this.blankForm(),

      vehicleTypes: [
        { text: "Car",       value: "car" },
        { text: "Motorbike", value: "motorbike" },
        { text: "Truck",     value: "truck" },
        { text: "Van",       value: "van" },
        { text: "Other",     value: "other" },
      ],

      confirmRemove: false,
      pendingRemove: null,
      confirmLogout: false,

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
        { title: "Vehicles",  icon: "mdi-car",            route: "/household/vehicles" },
        { title: "Visitors",  icon: "mdi-ticket-confirmation-outline", route: "/household/visitor_passes" },
        { title: "Payments",  icon: "mdi-currency-usd",   route: "/household/payment_summary" },
        { title: "Profile",   icon: "mdi-account",        route: "/household/profile" },
      ];
    },

    activeCount() {
      return this.vehicles.filter((v) => v.status === "Active").length;
    },
    pendingCount() {
      return this.vehicles.filter((v) => v.status === "Pending").length;
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

    blankForm() {
      return {
        plate_number: "",
        make: "",
        model: "",
        color: "",
        year: null,
        vehicle_type: "car",
        notes: "",
      };
    },

    waitForAuthAndLoad() {
      const that = this;
      const current = that.$fire?.auth?.currentUser;
      if (current && current.uid) {
        that.uid = current.uid;
        that.loadEstateAndFetch();
        return;
      }
      that._authUnsub = that.$fire.auth.onAuthStateChanged((user) => {
        if (user && user.uid) {
          that.uid = user.uid;
          that.loadEstateAndFetch();
          if (that._authUnsub) {
            that._authUnsub();
            that._authUnsub = null;
          }
        } else {
          that.showSnackbar("Please sign in to view your vehicles", "error");
        }
      });
    },

    async loadEstateAndFetch() {
      try {
        const { data, status } = await axios.get(
          `${API}/households/getHouseHoldId/${this.uid}`
        );
        if (status === 200 && data) {
          this.estateId = data.estate_id || null;
        }
      } catch (err) {
        console.warn("Could not derive estate_id:", err.message);
      }

      if (!this.estateId) {
        try {
          const { data } = await axios.get(`${API}/households/dashboard/${this.uid}`);
          this.estateId = data?.estate_id || null;
        } catch (_) {
          this.estateId = null;
        }
      }

      this.fetch();
    },

    async fetch() {
      this.loading = true;
      try {
        const { data } = await axios.get(`${API}/vehicles/mine`);
        this.vehicles = Array.isArray(data) ? data : [];
      } catch (err) {
        this.showSnackbar(
          err.response?.data?.error || "Failed to load vehicles",
          "error"
        );
      } finally {
        this.loading = false;
      }
    },

    openAdd() {
      this.form = this.blankForm();
      this.submitError = "";
      this.errors = { plate_number: "" };
      this.dialog = true;
    },

    async submit() {
      this.errors = { plate_number: "" };
      this.submitError = "";

      if (!this.form.plate_number.trim()) {
        this.errors.plate_number = "Plate number is required";
        return;
      }
      if (!this.estateId) {
        this.submitError = "Could not determine your estate. Contact your admin.";
        return;
      }

      this.saving = true;
      try {
        const { data } = await axios.post(`${API}/vehicles`, {
          estate_id: this.estateId,
          plate_number: String(this.form.plate_number).toUpperCase().trim(),
          make: this.form.make || null,
          model: this.form.model || null,
          color: this.form.color || null,
          year: this.form.year || null,
          vehicle_type: this.form.vehicle_type || "car",
          notes: this.form.notes || null,
        });

        this.dialog = false;
        this.showSnackbar(data.message || "Vehicle submitted", "success");
        await this.fetch();
      } catch (err) {
        this.submitError =
          err.response?.data?.error || "Failed to add vehicle";
      } finally {
        this.saving = false;
      }
    },

    promptRemove(v) {
      this.pendingRemove = v;
      this.confirmRemove = true;
    },

    async doRemove() {
      const v = this.pendingRemove;
      this.confirmRemove = false;
      this.pendingRemove = null;
      if (!v) return;

      try {
        await axios.delete(`${API}/vehicles/${v.vehicle_id}`);
        this.vehicles = this.vehicles.filter((x) => x.vehicle_id !== v.vehicle_id);
        this.showSnackbar("Vehicle removed", "success");
      } catch (err) {
        this.showSnackbar(
          err.response?.data?.error || "Failed to remove vehicle",
          "error"
        );
      }
    },

    iconFor(t) {
      return {
        car: "mdi-car",
        motorbike: "mdi-motorbike",
        truck: "mdi-truck",
        van: "mdi-van-utility",
      }[t] || "mdi-car-estate";
    },

    statusColor(s) {
      return {
        Active:    "#d1fae5",
        Pending:   "#fef3c7",
        Suspended: "#fee2e2",
        Removed:   "#e5e7eb",
      }[s] || "#e5e7eb";
    },
    statusStyle(s) {
      return {
        Active:    "color:#065f46;",
        Pending:   "color:#92400e;",
        Suspended: "color:#991b1b;",
        Removed:   "color:#374151;",
      }[s] || "color:#374151;";
    },

    showSnackbar(text, color = "success") {
      this.snackbar = { show: true, text, color };
    },

    logout() {
      this.confirmLogout = false;
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

.icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #eef1f6;
  color: #475569;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.icon-btn:hover:not(:disabled) {
  border-color: #8051ff;
  color: #8051ff;
}
.icon-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.add-btn {
  text-transform: none !important;
  letter-spacing: 0;
  font-weight: 700;
  transition: all 0.2s ease;
}
.add-btn:hover { transform: translateY(-1px); }

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
.panel-head-inline {
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

.tab-body { padding: 8px 0; }

/* ============================================================
   ROW LIST
   ============================================================ */
.row-list { display: flex; flex-direction: column; }
.row-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s ease;
}
.row-card:last-child { border-bottom: none; }
.row-card:hover { background: #fafbff; }

.row-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.row-icon-purple {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 8px 16px -8px rgba(128, 81, 255, 0.7);
}

.row-body { flex: 1; min-width: 0; }
.row-title {
  font-size: 0.92rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.row-sub {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 2px;
  font-weight: 500;
}
.row-meta {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: 0.7rem;
  color: #8051ff;
  font-weight: 700;
  margin-top: 3px;
}
.row-meta span { display: inline-flex; align-items: center; gap: 3px; }

.status-chip { font-weight: 700; flex-shrink: 0; }

.row-actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

/* ============================================================
   EMPTY
   ============================================================ */
.empty-block {
  padding: 56px 24px;
  text-align: center;
}
.empty-icon {
  width: 76px;
  height: 76px;
  border-radius: 22px;
  background: #f6f7fb;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
}
.empty-title {
  font-size: 0.9rem;
  font-weight: 800;
  color: #0f0d24;
}
.empty-sub {
  font-size: 0.76rem;
  color: #94a3b8;
  margin-top: 4px;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
}

/* ============================================================
   INFO STRIP
   ============================================================ */
.info-strip {
  display: flex;
  align-items: flex-start;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(128, 81, 255, 0.06);
  border: 1px solid rgba(128, 81, 255, 0.12);
  font-size: 0.78rem;
  color: #475569;
  font-weight: 500;
  line-height: 1.55;
}
.info-strip strong { color: #0f0d24; font-weight: 800; }

/* ============================================================
   DIALOGS
   ============================================================ */
.dialog-title {
  font-weight: 800;
  color: #0f0d24;
  padding-bottom: 0;
}
.error-text {
  color: #dc2626;
  font-size: 0.82rem;
  margin-top: 6px;
}
.hint-text {
  color: #94a3b8;
  font-size: 0.76rem;
  margin-top: 6px;
}

.confirm-card {
  padding: 26px 24px;
  text-align: center;
}
.confirm-icon {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}
.confirm-icon-red { background: rgba(239, 68, 68, 0.1); }
.confirm-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
}
.confirm-text {
  font-size: 0.82rem;
  color: #64748b;
  margin-top: 8px;
  line-height: 1.55;
}
.confirm-actions {
  display: flex;
  gap: 10px;
  margin-top: 22px;
}
.confirm-cancel,
.confirm-proceed {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 18px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}
.confirm-cancel {
  background: #f6f7fb;
  color: #475569;
  border: 1px solid #eef1f6;
}
.confirm-cancel:hover { background: #eef1f6; }
.confirm-proceed {
  background: #dc2626;
  color: #ffffff;
  box-shadow: 0 10px 24px -12px rgba(220, 38, 38, 0.7);
}
.confirm-proceed:hover { background: #b91c1c; }

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
.mobile-nav-label { font-size: 10px; margin-top: 2px; font-weight: 700; }

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 767px) {
  .row-card { padding: 12px 16px; gap: 10px; }
  .row-icon { width: 38px; height: 38px; border-radius: 10px; }
}
</style>