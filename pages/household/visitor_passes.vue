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
              <div class="d-flex align-center">
                <v-btn icon small class="mr-2 back-btn" @click="goTo(dashboardRoute)">
                  <v-icon size="20">mdi-arrow-left</v-icon>
                </v-btn>
                <div class="header-text">
                  <div class="d-flex align-center flex-wrap">
                    <h1 class="text-h6 text-sm-h5 font-weight-bold text--primary page-title">
                      Visitor passes
                    </h1>
                    <v-chip
                      x-small
                      color="purple lighten-5 purple--text"
                      class="ml-2 font-weight-bold hidden-xs-only"
                      label
                    >
                      {{ activeCount }} active
                    </v-chip>
                  </div>
                  <div class="d-flex align-center mt-1">
                    <v-icon x-small color="success" class="mr-1">mdi-circle</v-icon>
                    <span class="text-caption text--secondary">
                      Invite visitors — they check in when they arrive
                    </span>
                  </div>
                </div>
              </div>
            </v-col>
            <v-col cols="4" sm="6" class="d-flex justify-end align-center">
              <button
                class="icon-btn mr-2 hidden-sm-and-up"
                title="Sign out"
                @click="confirmLogout = true"
              >
                <v-icon size="16">mdi-logout</v-icon>
              </button>

              <button
                class="edit-btn mr-2 hidden-xs-only"
                @click="fetch"
                :disabled="loading"
              >
                <v-icon size="16" :class="{ spin: loading }">
                  {{ loading ? 'mdi-loading' : 'mdi-refresh' }}
                </v-icon>
                <span class="ml-1">Refresh</span>
              </button>

              <v-btn
                rounded depressed color="#8051FF" dark small
                class="add-btn"
                @click="openAdd"
              >
                <v-icon left small>mdi-plus</v-icon>
                <span class="hidden-xs-only">New pass</span>
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <v-container :fluid="nav_bars" class="px-4 px-sm-6 pt-3 pt-sm-5 pb-8">
        <!-- HERO -->
        <div class="hero-card reveal-card">
          <div class="hero-head">
            <div class="hero-avatar">
              <v-icon size="26" color="white">mdi-ticket-confirmation</v-icon>
            </div>
            <div class="hero-info">
              <div class="hero-name">Visitor passes</div>
              <div class="hero-address">
                {{ passes.length ? `${activeCount} active · ${historyCount} in history` : 'No passes created yet' }}
              </div>
            </div>
            <div class="hero-status" :class="heroStatusClass">
              <v-icon size="14">{{ heroStatusIcon }}</v-icon>
              <span>{{ heroStatusLabel }}</span>
            </div>
          </div>

          <div class="hero-grid">
            <div class="hero-metric">
              <div class="metric-label">Total</div>
              <div class="metric-value mono">{{ passes.length }}</div>
            </div>
            <div class="hero-metric">
              <div class="metric-label">Active</div>
              <div class="metric-value">{{ activeCount }}</div>
            </div>
            <div class="hero-metric">
              <div class="metric-label">Used</div>
              <div class="metric-value">{{ usedCount }}</div>
            </div>
            <div class="hero-metric">
              <div class="metric-label">Expired</div>
              <div class="metric-value">{{ expiredCount }}</div>
            </div>
          </div>
        </div>

        <!-- TABS -->
        <v-tabs
          v-model="tab"
          background-color="transparent"
          color="#8051FF"
          class="tabs-premium mt-4"
          grow
        >
          <v-tab>Active</v-tab>
          <v-tab>History</v-tab>
        </v-tabs>

        <!-- LOADING -->
        <v-skeleton-loader
          v-if="loading && !passes.length"
          type="list-item-three-line, list-item-three-line"
          class="mt-4 reveal-card"
        />

        <!-- EMPTY -->
        <div
          v-else-if="!visiblePasses.length"
          class="empty-card mt-4 reveal-card"
          style="animation-delay: 60ms"
        >
          <div class="empty-icon">
            <v-icon size="48" color="#cbd5e1">mdi-ticket-confirmation-outline</v-icon>
          </div>
          <div class="empty-title">
            {{ tab === 0 ? 'No active passes' : 'No past passes' }}
          </div>
          <div class="empty-sub">
            {{ tab === 0
              ? 'Create a pass when you expect a visitor. They will get a link to check in when they arrive.'
              : 'Used and expired passes will appear here.' }}
          </div>
          <v-btn
            v-if="tab === 0"
            rounded depressed color="#8051FF" dark class="mt-4"
            @click="openAdd"
          >
            <v-icon left small>mdi-plus</v-icon>
            Create your first pass
          </v-btn>
        </div>

        <!-- PASS LIST -->
        <div v-else class="panel-card mt-4 reveal-card" style="animation-delay: 80ms">
          <div class="panel-head">
            <div class="panel-icon panel-icon-purple">
              <v-icon size="20" color="white">mdi-ticket-confirmation-outline</v-icon>
            </div>
            <div class="panel-title-group">
              <div class="panel-title">
                {{ tab === 0 ? 'Active passes' : 'Pass history' }}
              </div>
              <div class="panel-sub">
                {{ tab === 0
                  ? 'Share the link with your visitor — they tap "I\'m here" on arrival'
                  : 'Previously used and expired passes' }}
              </div>
            </div>
            <div class="edit-pill">
              {{ visiblePasses.length }} total
            </div>
          </div>

          <div class="pass-list">
            <div
              v-for="(p, i) in visiblePasses"
              :key="p.pass_id"
              class="pass-row"
              :style="{ animationDelay: i * 40 + 'ms' }"
            >
              <div class="pass-code-box">
                <div class="pass-code">{{ p.pass_code }}</div>
              </div>

              <div class="p-body">
                <div class="p-name">{{ p.visitor_name }}</div>
                <div class="p-sub">
                  <span v-if="p.visitor_phone">
                    <v-icon x-small>mdi-phone</v-icon> {{ p.visitor_phone }}
                  </span>
                  <span v-if="p.visitor_plate">
                    <v-icon x-small>mdi-car</v-icon> {{ p.visitor_plate }}
                  </span>
                </div>
                <div class="p-window">
                  <v-icon x-small>mdi-clock-outline</v-icon>
                  {{ formatWindow(p.valid_from, p.valid_until) }}
                </div>
                <div v-if="p.purpose" class="p-purpose">
                  <v-icon x-small>mdi-comment-text-outline</v-icon>
                  {{ p.purpose }}
                </div>
                <div v-if="p.visitor_phone" class="p-link-hint">
                  <v-icon x-small>mdi-message-text-outline</v-icon>
                  Link SMS'd to visitor
                </div>
                <div v-else class="p-link-hint p-link-hint-warn">
                  <v-icon x-small>mdi-alert</v-icon>
                  No phone — share the link manually
                </div>
              </div>

              <div class="p-status" :class="chipClassFor(p.status)">
                <v-icon size="12">{{ chipIconFor(p.status) }}</v-icon>
                <span>{{ p.status }}</span>
              </div>

              <div class="p-actions">
                <button
                  v-if="p.status === 'Active'"
                  class="p-action"
                  title="Extend"
                  @click="extendPass(p)"
                >
                  <v-icon size="16">mdi-clock-plus-outline</v-icon>
                </button>
                <button
                  class="p-action"
                  title="Copy link"
                  @click="copyLink(p.pass_code)"
                >
                  <v-icon size="16">mdi-link-variant</v-icon>
                </button>
                <button
                  class="p-action"
                  title="Copy code"
                  @click="copyCode(p.pass_code)"
                >
                  <v-icon size="16">mdi-content-copy</v-icon>
                </button>
                <button
                  v-if="['Active', 'Used'].includes(p.status)"
                  class="p-action p-action-danger"
                  title="Cancel"
                  @click="promptCancel(p)"
                >
                  <v-icon size="16">mdi-close-circle-outline</v-icon>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- INFO STRIP -->
        <div class="info-strip mt-4 reveal-card" style="animation-delay: 120ms">
          <v-icon size="16" color="#8051FF" class="mr-2">mdi-information-outline</v-icon>
          If you enter your visitor's phone number, we send them a link by SMS automatically.
          They tap <strong>"I'm here"</strong> at the gate and you get an SMS confirming the arrival.
        </div>
      </v-container>

      <!-- ============================================================
           ADD PASS DIALOG
           ============================================================ -->
      <v-dialog v-model="dialog" max-width="540" persistent>
        <div class="confirm-card add-card">
          <div class="confirm-icon confirm-icon-purple">
            <v-icon size="26" color="#8051FF">mdi-ticket-confirmation</v-icon>
          </div>
          <div class="confirm-title">New visitor pass</div>
          <div class="confirm-text">
            We'll generate a link and code your visitor can use at the gate.
          </div>

          <div class="add-form">
            <div class="field">
              <label class="field-label">Visitor name <span class="required">*</span></label>
              <input
                v-model="form.visitor_name"
                class="field-input"
                :class="{ 'field-input-error': errors.visitor_name }"
                type="text"
                placeholder="e.g. John Mwangi"
                @input="errors.visitor_name = ''"
              />
              <div v-if="errors.visitor_name" class="field-error">{{ errors.visitor_name }}</div>
            </div>

            <div class="field">
              <label class="field-label">
                Visitor phone
                <span class="field-hint">We'll send them the check-in link by SMS</span>
              </label>
              <input
                v-model="form.visitor_phone"
                class="field-input"
                type="tel"
                placeholder="2547XXXXXXXX"
              />
            </div>

            <div class="field">
              <label class="field-label">Vehicle plate (optional)</label>
              <input
                v-model="form.visitor_plate"
                class="field-input"
                type="text"
                placeholder="KDA 123X"
              />
            </div>

            <div class="field">
              <label class="field-label">Purpose (optional)</label>
              <input
                v-model="form.purpose"
                class="field-input"
                type="text"
                placeholder="e.g. family visit, delivery"
              />
            </div>

            <div class="field-row">
              <div class="field">
                <label class="field-label">Valid from</label>
                <input
                  v-model="form.valid_from"
                  class="field-input"
                  type="datetime-local"
                />
              </div>
              <div class="field">
                <label class="field-label">Valid until</label>
                <input
                  v-model="form.valid_until"
                  class="field-input"
                  type="datetime-local"
                />
              </div>
            </div>

            <div class="quick-chips">
              <button
                v-for="q in quickDurations"
                :key="q.label"
                class="quick-chip"
                type="button"
                @click="applyQuick(q.hours)"
              >{{ q.label }}</button>
            </div>

            <div v-if="submitError" class="field-error mt-2">{{ submitError }}</div>
          </div>

          <div class="confirm-actions">
            <button
              class="confirm-cancel"
              @click="dialog = false"
              :disabled="saving"
            >
              Cancel
            </button>
            <button
              class="confirm-proceed confirm-proceed-purple"
              @click="submit"
              :disabled="saving"
            >
              <v-icon v-if="saving" size="14" class="spin mr-1">mdi-loading</v-icon>
              <v-icon v-else size="14" class="mr-1">mdi-content-save-outline</v-icon>
              {{ saving ? 'Creating…' : 'Create pass' }}
            </button>
          </div>
        </div>
      </v-dialog>

      <!-- ============================================================
           CREATED — big code + link
           ============================================================ -->
      <v-dialog v-model="showCode" max-width="460" persistent>
        <div class="code-card">
          <div class="code-label">SHARE THIS WITH YOUR VISITOR</div>

          <div class="code-big">{{ createdCode }}</div>

          <div class="link-box">
            <div class="link-text">{{ createdLink }}</div>
          </div>

          <div class="code-hint">
            <span v-if="createdSmsSent">
              We also sent the link to your visitor by SMS.
            </span>
            <span v-else>
              Copy the link and send it to your visitor so they can check in at the gate.
            </span>
          </div>

          <button class="code-copy-btn" @click="copyLink(createdCode)">
            <v-icon size="16" class="mr-1">mdi-link-variant</v-icon>
            Copy link
          </button>
          <button class="code-copy-code-btn" @click="copyCode(createdCode)">
            <v-icon size="16" class="mr-1">mdi-content-copy</v-icon>
            Copy code only
          </button>
          <button class="code-done-btn" @click="showCode = false">Done</button>
        </div>
      </v-dialog>

      <!-- ============================================================
           CANCEL CONFIRM
           ============================================================ -->
      <v-dialog v-model="confirmCancel" max-width="420" persistent>
        <div class="confirm-card">
          <div class="confirm-icon confirm-icon-red">
            <v-icon size="26" color="#dc2626">mdi-close-circle-outline</v-icon>
          </div>
          <div class="confirm-title">Cancel pass?</div>
          <div class="confirm-text">
            {{ pendingCancel ? `Cancel the pass for ${pendingCancel.visitor_name}?` : '' }}
            They won't be able to check in with this link anymore.
          </div>
          <div class="confirm-actions">
            <button class="confirm-cancel" @click="confirmCancel = false">Keep it</button>
            <button class="confirm-proceed" @click="doCancel">Cancel pass</button>
          </div>
        </div>
      </v-dialog>

      <!-- ============================================================
           LOGOUT CONFIRM
           ============================================================ -->
      <v-dialog v-model="confirmLogout" max-width="420" persistent>
        <div class="confirm-card">
          <div class="confirm-icon confirm-icon-red">
            <v-icon size="26" color="#dc2626">mdi-logout</v-icon>
          </div>
          <div class="confirm-title">Sign out?</div>
          <div class="confirm-text">
            You'll need to sign in again to view your visitor passes.
          </div>
          <div class="confirm-actions">
            <button class="confirm-cancel" @click="confirmLogout = false">Cancel</button>
            <button class="confirm-proceed" @click="logout">Sign out</button>
          </div>
        </div>
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
const APP_URL = "https://makaazi.app";

// "2026-09-30T14:30" → local time for <input type="datetime-local">
function toLocalInput(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes())
  );
}

export default {
  name: "HouseholdVisitorPasses",

  data() {
    return {
      nav_bars: false,
      activeTab: "/household/visitor_passes",

      loading: false,
      saving: false,

      uid: null,
      estateId: null,

      tab: 0,
      passes: [],

      dialog: false,
      showCode: false,
      createdCode: "",
      createdLink: "",
      createdSmsSent: false,
      submitError: "",
      errors: { visitor_name: "" },
      form: this.blankForm(),

      quickDurations: [
        { label: "2 hours", hours: 2 },
        { label: "4 hours", hours: 4 },
        { label: "8 hours", hours: 8 },
        { label: "24 hours", hours: 24 },
      ],

      confirmCancel: false,
      pendingCancel: null,
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
      const now = Date.now();
      return this.passes.filter(
        (p) => p.status === "Active" && new Date(p.valid_until).getTime() > now
      ).length;
    },
    usedCount() {
      return this.passes.filter((p) => p.status === "Used").length;
    },
    expiredCount() {
      return this.passes.filter((p) => p.status === "Expired").length;
    },
    historyCount() {
      return this.passes.length - this.activeCount;
    },

    visiblePasses() {
      const now = Date.now();
      if (this.tab === 0) {
        return this.passes.filter(
          (p) => p.status === "Active" && new Date(p.valid_until).getTime() > now
        );
      }
      return this.passes.filter(
        (p) => p.status !== "Active" || new Date(p.valid_until).getTime() <= now
      );
    },

    heroStatusClass() {
      if (this.activeCount > 0) return "hero-status-green";
      if (this.passes.length === 0) return "hero-status-red";
      return "hero-status-amber";
    },
    heroStatusIcon() {
      if (this.activeCount > 0) return "mdi-check-circle-outline";
      if (this.passes.length === 0) return "mdi-close-circle-outline";
      return "mdi-clock-outline";
    },
    heroStatusLabel() {
      if (this.passes.length === 0) return "None";
      if (this.activeCount > 0) return "Active";
      return "Expired";
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
      const now = new Date();
      const until = new Date(now.getTime() + 4 * 60 * 60 * 1000);
      return {
        visitor_name: "",
        visitor_phone: "",
        visitor_plate: "",
        purpose: "",
        valid_from: toLocalInput(now),
        valid_until: toLocalInput(until),
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
          that.showSnackbar("Please sign in to view your passes", "error");
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
        const { data } = await axios.get(`${API}/visitor-passes/mine`);
        this.passes = Array.isArray(data) ? data : [];
      } catch (err) {
        this.showSnackbar(
          err.response?.data?.error || "Failed to load passes",
          "error"
        );
      } finally {
        this.loading = false;
      }
    },

    openAdd() {
      this.form = this.blankForm();
      this.submitError = "";
      this.errors = { visitor_name: "" };
      this.dialog = true;
    },

    applyQuick(hours) {
      const from = this.form.valid_from
        ? new Date(this.form.valid_from)
        : new Date();
      const until = new Date(from.getTime() + hours * 60 * 60 * 1000);
      this.form.valid_until = toLocalInput(until);
    },

    async submit() {
      this.errors = { visitor_name: "" };
      this.submitError = "";

      if (!this.form.visitor_name.trim()) {
        this.errors.visitor_name = "Visitor name is required";
        return;
      }
      if (!this.estateId) {
        this.submitError = "Could not determine your estate. Contact your admin.";
        return;
      }

      this.saving = true;
      try {
        const hadPhone = !!String(this.form.visitor_phone || "").trim();
        const payload = {
          estate_id: this.estateId,
          visitor_name: this.form.visitor_name.trim(),
          visitor_phone: this.form.visitor_phone || null,
          visitor_plate: this.form.visitor_plate || null,
          purpose: this.form.purpose || null,
          valid_from: new Date(this.form.valid_from).toISOString(),
          valid_until: new Date(this.form.valid_until).toISOString(),
        };

        const { data } = await axios.post(`${API}/visitor-passes`, payload);

        this.dialog = false;
        this.createdCode = data.pass_code || "";
        this.createdLink = data.checkin_url || `${APP_URL}/checkin/${data.pass_code}`;
        this.createdSmsSent = hadPhone;
        this.showCode = true;
        await this.fetch();
      } catch (err) {
        this.submitError =
          err.response?.data?.error || "Failed to create pass";
      } finally {
        this.saving = false;
      }
    },

    async extendPass(p) {
      const hours = Number(prompt("Extend by how many hours?", "4"));
      if (!hours || hours < 1) return;
      try {
        await axios.post(`${API}/visitor-passes/${p.pass_id}/extend`, { hours });
        this.showSnackbar(`Extended by ${hours}h`, "success");
        this.fetch();
      } catch (err) {
        this.showSnackbar(
          err.response?.data?.error || "Failed to extend",
          "error"
        );
      }
    },

    promptCancel(p) {
      this.pendingCancel = p;
      this.confirmCancel = true;
    },

    async doCancel() {
      const p = this.pendingCancel;
      this.confirmCancel = false;
      this.pendingCancel = null;
      if (!p) return;

      try {
        await axios.post(`${API}/visitor-passes/${p.pass_id}/cancel`);
        this.showSnackbar("Pass cancelled", "success");
        this.fetch();
      } catch (err) {
        this.showSnackbar(
          err.response?.data?.error || "Failed to cancel",
          "error"
        );
      }
    },

    checkinUrl(code) {
      return `${APP_URL}/checkin/${code}`;
    },

    async copyCode(code) {
      try {
        await navigator.clipboard.writeText(code);
        this.showSnackbar("Code copied", "success");
      } catch (_) {
        this.showSnackbar(`Copy failed — code: ${code}`, "error");
      }
    },

    async copyLink(code) {
      try {
        await navigator.clipboard.writeText(this.checkinUrl(code));
        this.showSnackbar("Link copied", "success");
      } catch (_) {
        this.showSnackbar(`Copy failed — link: ${this.checkinUrl(code)}`, "error");
      }
    },

    formatWindow(from, until) {
      if (!from || !until) return "";
      const f = new Date(from);
      const u = new Date(until);
      const sameDay = f.toDateString() === u.toDateString();
      const fmtDate = (d) =>
        d.toLocaleString("en-GB", { day: "2-digit", month: "short" });
      const fmtTime = (d) =>
        d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      if (sameDay) return `${fmtDate(f)} · ${fmtTime(f)} – ${fmtTime(u)}`;
      return `${fmtDate(f)} ${fmtTime(f)} → ${fmtDate(u)} ${fmtTime(u)}`;
    },

    chipClassFor(status) {
      const s = String(status || "").toLowerCase();
      if (s === "active")    return "p-status-green";
      if (s === "used")      return "p-status-blue";
      if (s === "expired")   return "p-status-grey";
      if (s === "cancelled") return "p-status-red";
      return "p-status-grey";
    },
    chipIconFor(status) {
      const s = String(status || "").toLowerCase();
      if (s === "active")    return "mdi-check-circle-outline";
      if (s === "used")      return "mdi-check-all";
      if (s === "expired")   return "mdi-clock-outline";
      if (s === "cancelled") return "mdi-close-circle-outline";
      return "mdi-circle-outline";
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

.icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #eef1f6;
  color: #dc2626;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.icon-btn:hover {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.3);
  color: #b91c1c;
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
.edit-btn:hover:not(:disabled) {
  border-color: rgba(128, 81, 255, 0.4);
  color: #8051ff;
  background: rgba(128, 81, 255, 0.05);
}
.edit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.add-btn {
  text-transform: none !important;
  letter-spacing: 0;
  font-weight: 700;
  transition: all 0.2s ease;
}
.add-btn:hover { transform: translateY(-1px); }

/* ============================================================
   HERO CARD
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
   TABS
   ============================================================ */
.tabs-premium {
  border-bottom: 1px solid #eef1f6;
}
.tabs-premium ::v-deep .v-tab {
  font-weight: 700;
  text-transform: none;
  letter-spacing: 0;
  font-size: 0.85rem;
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

/* ============================================================
   PASS ROWS
   ============================================================ */
.pass-list { display: flex; flex-direction: column; }
.pass-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s ease;
}
.pass-row:last-child { border-bottom: none; }
.pass-row:hover { background: #fafbff; }

.pass-code-box {
  min-width: 90px;
  flex-shrink: 0;
}
.pass-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.95rem;
  font-weight: 800;
  color: #8051ff;
  letter-spacing: 1.5px;
  background: #f3eeff;
  padding: 8px 10px;
  border-radius: 10px;
  text-align: center;
}

.p-body { flex: 1; min-width: 0; }
.p-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.p-sub {
  display: flex;
  gap: 12px;
  font-size: 0.72rem;
  color: #64748b;
  margin-top: 3px;
  font-weight: 500;
}
.p-sub span { display: inline-flex; align-items: center; gap: 3px; }
.p-window {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: #475569;
  margin-top: 4px;
  font-weight: 600;
}
.p-purpose {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 3px;
  font-weight: 500;
}
.p-link-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  color: #8051ff;
  font-weight: 700;
  margin-top: 4px;
  letter-spacing: 0.2px;
}
.p-link-hint-warn { color: #b45309; }

.p-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  flex-shrink: 0;
}
.p-status-green { background: rgba(122, 184, 0, 0.14); color: #3f6b00; }
.p-status-blue  { background: rgba(59, 130, 246, 0.12); color: #1e40af; }
.p-status-amber { background: rgba(245, 158, 11, 0.14); color: #b45309; }
.p-status-grey  { background: #f1f5f9; color: #475569; }
.p-status-red   { background: rgba(239, 68, 68, 0.12); color: #b91c1c; }

.p-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
.p-action {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid #eef1f6;
  background: #ffffff;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.p-action:hover {
  border-color: rgba(128, 81, 255, 0.35);
  background: rgba(128, 81, 255, 0.06);
  color: #8051ff;
}
.p-action-danger:hover {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.06);
  color: #dc2626;
}

/* ============================================================
   EMPTY
   ============================================================ */
.empty-card {
  text-align: center;
  padding: 60px 24px;
  background: #ffffff;
  border: 1px dashed #e2e8f0;
  border-radius: 20px;
}
.empty-icon {
  width: 84px;
  height: 84px;
  border-radius: 24px;
  background: #f6f7fb;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}
.empty-title {
  font-weight: 800;
  color: #0f0d24;
  font-size: 1rem;
}
.empty-sub {
  color: #94a3b8;
  font-size: 0.85rem;
  margin-top: 6px;
  max-width: 340px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.55;
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
   CONFIRM / ADD DIALOGS
   ============================================================ */
.confirm-card {
  background: #ffffff;
  border-radius: 22px;
  padding: 26px 24px;
  box-shadow: 0 24px 60px -20px rgba(15, 13, 36, 0.4);
  text-align: center;
}
.add-card { text-align: left; padding: 28px 26px; }
.confirm-icon {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  background: rgba(128, 81, 255, 0.1);
}
.confirm-icon-purple { background: rgba(128, 81, 255, 0.1); }
.confirm-icon-red    { background: rgba(239, 68, 68, 0.1); }
.confirm-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
  text-align: center;
}
.add-card .confirm-title { text-align: left; }
.confirm-text {
  font-size: 0.82rem;
  color: #64748b;
  margin-top: 8px;
  line-height: 1.55;
  text-align: center;
}
.add-card .confirm-text { text-align: left; }

.add-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 18px;
}
.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.field-label {
  font-size: 0.66rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
}
.field-hint {
  font-size: 0.62rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: none;
  letter-spacing: 0;
}
.required { color: #dc2626; font-weight: 800; }
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
  box-sizing: border-box;
}
.field-input:focus {
  border-color: #8051ff;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(128, 81, 255, 0.1);
}
.field-input::placeholder { color: #94a3b8; font-weight: 500; }
.field-input-error {
  border-color: #dc2626;
  background: rgba(239, 68, 68, 0.04);
}
.field-error {
  color: #dc2626;
  font-size: 0.74rem;
  font-weight: 700;
  margin-top: -2px;
}

.quick-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
}
.quick-chip {
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(128, 81, 255, 0.2);
  background: rgba(128, 81, 255, 0.06);
  color: #8051ff;
  font-size: 0.72rem;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}
.quick-chip:hover {
  background: rgba(128, 81, 255, 0.12);
  border-color: rgba(128, 81, 255, 0.35);
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
.confirm-cancel:hover:not(:disabled) { background: #eef1f6; }
.confirm-cancel:disabled { opacity: 0.6; cursor: not-allowed; }
.confirm-proceed {
  background: #dc2626;
  color: #ffffff;
  box-shadow: 0 10px 24px -12px rgba(220, 38, 38, 0.7);
}
.confirm-proceed:hover:not(:disabled) { background: #b91c1c; }
.confirm-proceed:disabled { opacity: 0.6; cursor: not-allowed; }
.confirm-proceed-purple {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 10px 24px -12px rgba(128, 81, 255, 0.7);
}
.confirm-proceed-purple:hover:not(:disabled) {
  background: linear-gradient(135deg, #8a5cff 0%, #7040ee 100%);
}

/* ============================================================
   CODE CARD (success modal)
   ============================================================ */
.code-card {
  background: linear-gradient(140deg, #0a0a14 0%, #221047 55%, #2b1256 100%);
  border-radius: 22px;
  padding: 32px 26px;
  text-align: center;
  box-shadow: 0 24px 60px -20px rgba(15, 13, 36, 0.5);
  color: #ffffff;
}
.code-label {
  font-size: 0.68rem;
  letter-spacing: 2px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 14px;
}
.code-big {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: 6px;
  color: #ffffff;
  margin-bottom: 14px;
}

.link-box {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 16px;
}
.link-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.78rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  word-break: break-all;
  line-height: 1.4;
}

.code-hint {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 320px;
  margin: 0 auto 20px;
  line-height: 1.55;
}
.code-copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px 18px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 10px 24px -12px rgba(128, 81, 255, 0.7);
  transition: all 0.2s ease;
}
.code-copy-btn:hover {
  background: linear-gradient(135deg, #8a5cff 0%, #7040ee 100%);
  transform: translateY(-1px);
}
.code-copy-code-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px 18px;
  margin-top: 8px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}
.code-copy-code-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
.code-done-btn {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.2s ease;
}
.code-done-btn:hover { color: #ffffff; }

/* ============================================================
   SNACKBAR
   ============================================================ */
.snackbar-premium ::v-deep .v-snackbar__content { padding: 12px 20px; }

/* ============================================================
   MOBILE NAV
   ============================================================ */
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
@media (max-width: 767px) {
  .hero-card { padding: 16px; }
  .hero-avatar { width: 46px; height: 46px; }
  .hero-name { font-size: 0.95rem; }
  .metric-value { font-size: 0.85rem; }
  .panel-head { padding: 14px 16px; }
  .pass-row { padding: 14px 16px; gap: 12px; flex-wrap: wrap; }
  .pass-code-box { min-width: 80px; }
  .pass-code { font-size: 0.85rem; letter-spacing: 1px; padding: 6px 8px; }
  .p-status { display: none; }
  .p-actions { margin-left: auto; }
}
@media (max-width: 599px) {
  .sticky-header-premium { padding-left: 12px; padding-right: 12px; }
  .reveal-card { animation-duration: 0.4s; }
  .field-row { grid-template-columns: 1fr; }
  .add-card { padding: 22px 20px; }
  .code-big { font-size: 1.8rem; letter-spacing: 5px; }
}
</style>