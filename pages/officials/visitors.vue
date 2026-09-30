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
            <v-icon color="white" size="24">mdi-shield-account</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold purple--text brand-text">Makaazi</div>
            <div class="text-caption text--secondary font-weight-medium">Official Console</div>
          </div>
        </div>
      </div>

      <v-divider class="mx-4 mb-2 opacity-30"></v-divider>

      <v-list dense nav class="px-3 py-2">
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          @click="goTo(item.route)"
          link
          class="mb-1 rounded-xl nav-item-premium"
          :class="{ 'nav-item-active': isActive(item.route) }"
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
            <div class="help-title">Questions?</div>
            <div class="help-sub">Contact your estate admin</div>
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
        v-for="item in bottomMenuItems"
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
            <v-col cols="7" sm="6">
              <div class="header-text">
                <div class="d-flex align-center flex-wrap">
                  <h1 class="text-h6 text-sm-h5 font-weight-bold text--primary page-title">
                    Visitors
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
                    {{ estate.estate_name || 'Loading estate…' }}
                  </span>
                </div>
              </div>
            </v-col>
            <v-col cols="5" sm="6" class="d-flex justify-end align-center">
              <button
                class="icon-btn mr-2"
                :disabled="loading"
                @click="refreshAll"
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
                <span class="hidden-xs-only">New pass</span>
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <v-container :fluid="nav_bars" class="px-4 px-sm-6 pt-3 pt-sm-5 pb-8">
        <!-- STATS -->
        <div class="kpi-grid">
          <div class="kpi kpi-light reveal-card">
            <div class="kpi-top">
              <div class="kpi-icon kpi-icon-purple">
                <v-icon size="20" color="white">mdi-ticket-confirmation</v-icon>
              </div>
            </div>
            <div class="kpi-label">Total</div>
            <div class="kpi-value">{{ formatNum(passes.length) }}</div>
            <div class="kpi-foot kpi-foot-muted">All time</div>
          </div>

          <div class="kpi kpi-light reveal-card" style="animation-delay: 50ms">
            <div class="kpi-top">
              <div class="kpi-icon kpi-icon-purple">
                <v-icon size="20" color="white">mdi-check-circle-outline</v-icon>
              </div>
            </div>
            <div class="kpi-label">Active</div>
            <div class="kpi-value">{{ formatNum(activeCount) }}</div>
            <div class="kpi-foot kpi-foot-muted">Currently valid</div>
          </div>

          <div class="kpi kpi-dark reveal-card" style="animation-delay: 100ms">
            <div class="kpi-top">
              <div class="kpi-icon kpi-icon-white">
                <v-icon size="20" color="#0A0A14">mdi-check-all</v-icon>
              </div>
            </div>
            <div class="kpi-label kpi-label-dark">Checked in</div>
            <div class="kpi-value kpi-value-dark">{{ formatNum(usedCount) }}</div>
            <div class="kpi-foot kpi-foot-light">Visitors arrived</div>
          </div>

          <div class="kpi kpi-light reveal-card" style="animation-delay: 150ms">
            <div class="kpi-top">
              <div class="kpi-icon kpi-icon-amber">
                <v-icon size="20" color="white">mdi-clock-outline</v-icon>
              </div>
            </div>
            <div class="kpi-label">Expired</div>
            <div class="kpi-value">{{ formatNum(expiredCount) }}</div>
            <div class="kpi-foot kpi-foot-warn">Past their window</div>
          </div>
        </div>

        <!-- FILTERS -->
        <div class="filter-row reveal-card" style="animation-delay: 180ms">
          <v-text-field
            v-model="search"
            placeholder="Search visitor, host, or code"
            dense
            outlined
            rounded
            hide-details
            prepend-inner-icon="mdi-magnify"
            class="search-field-premium"
            clearable
            @input="debouncedFetch"
          />
          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            item-text="text"
            item-value="value"
            dense
            outlined
            rounded
            hide-details
            class="status-filter"
            @change="fetch"
          />
        </div>

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
          <div class="empty-title">No passes yet</div>
          <div class="empty-sub">
            Create a pass for a visitor, contractor, or delivery. They'll get a
            check-in link and you'll be notified when they arrive.
          </div>
          <v-btn
            rounded depressed color="#8051FF" dark class="mt-4"
            @click="openAdd"
          >
            <v-icon left small>mdi-plus</v-icon>
            Create the first pass
          </v-btn>
        </div>

        <!-- PASS LIST -->
        <div v-else class="panel-card mt-4 reveal-card" style="animation-delay: 80ms">
          <div class="panel-head">
            <div class="panel-icon panel-icon-purple">
              <v-icon size="20" color="white">mdi-ticket-confirmation-outline</v-icon>
            </div>
            <div class="panel-title-group">
              <div class="panel-title">Estate visitor passes</div>
              <div class="panel-sub">
                {{ visiblePasses.length }} pass{{ visiblePasses.length === 1 ? '' : 'es' }}
              </div>
            </div>
            <div class="edit-pill">
              {{ statusFilter || 'All' }}
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
                <div class="p-host">
                  <v-icon x-small color="#8051FF">mdi-home-account</v-icon>
                  {{ hostLine(p) }}
                </div>
                <div class="p-window">
                  <v-icon x-small>mdi-clock-outline</v-icon>
                  {{ formatWindow(p.valid_from, p.valid_until) }}
                </div>
                <div v-if="p.purpose" class="p-purpose">
                  <v-icon x-small>mdi-comment-text-outline</v-icon>
                  {{ p.purpose }}
                </div>
              </div>

              <div class="p-status" :class="chipClassFor(p.status)">
                <v-icon size="12">{{ chipIconFor(p.status) }}</v-icon>
                <span>{{ p.status }}</span>
              </div>

              <div class="p-actions">
                <button
                  class="p-action"
                  title="Copy link"
                  @click="copyLink(p.pass_code)"
                >
                  <v-icon size="16">mdi-link-variant</v-icon>
                </button>
                <button
                  v-if="p.status === 'Active'"
                  class="p-action p-action-danger"
                  title="Cancel pass"
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
          Passes you create work the same way as resident passes — the visitor gets a check-in
          link by SMS and can tap <strong>"I'm here"</strong> at the gate.
        </div>
      </v-container>

      <!-- ============================================================
           CREATE PASS DIALOG
           ============================================================ -->
      <v-dialog v-model="dialog" max-width="560" persistent>
        <div class="confirm-card add-card">
          <div class="confirm-icon confirm-icon-purple">
            <v-icon size="26" color="#8051FF">mdi-ticket-confirmation</v-icon>
          </div>
          <div class="confirm-title">New visitor pass</div>
          <div class="confirm-text">
            Attach it to a household or leave it open for an estate-level visit.
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

            <div class="field-row">
              <div class="field">
                <label class="field-label">Phone</label>
                <input
                  v-model="form.visitor_phone"
                  class="field-input"
                  type="tel"
                  placeholder="2547XXXXXXXX"
                />
              </div>
              <div class="field">
                <label class="field-label">Vehicle plate</label>
                <input
                  v-model="form.visitor_plate"
                  class="field-input"
                  type="text"
                  placeholder="KDA 123X"
                />
              </div>
            </div>

            <div class="field">
              <label class="field-label">
                Visiting
                <span class="field-hint">Leave empty for an estate-level visit</span>
              </label>
              <select v-model="form.household_id" class="field-input">
                <option :value="null">— Estate office / no specific household —</option>
                <option
                  v-for="h in households"
                  :key="h.household_id"
                  :value="h.household_id"
                >
                  {{ h.primary_owner }}
                  <template v-if="h.house_number"> — House {{ h.house_number }}</template>
                </option>
              </select>
            </div>

            <div class="field">
              <label class="field-label">Purpose (optional)</label>
              <input
                v-model="form.purpose"
                class="field-input"
                type="text"
                placeholder="e.g. contractor, delivery, meeting"
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

      <!-- SUCCESS DIALOG -->
      <v-dialog v-model="showCode" max-width="460" persistent>
        <div class="code-card">
          <div class="code-label">PASS CREATED</div>
          <div class="code-big">{{ createdCode }}</div>

          <div class="link-box">
            <div class="link-text">{{ createdLink }}</div>
          </div>

          <div class="code-hint">
            <span v-if="createdSmsSent">
              We sent the check-in link to {{ createdVisitor }} by SMS.
            </span>
            <span v-else>
              No phone on file — copy the link and send it to the visitor yourself.
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

      <!-- CANCEL CONFIRM -->
      <v-dialog v-model="confirmCancel" max-width="420" persistent>
        <div class="confirm-card">
          <div class="confirm-icon confirm-icon-red">
            <v-icon size="26" color="#dc2626">mdi-close-circle-outline</v-icon>
          </div>
          <div class="confirm-title">Cancel pass?</div>
          <div class="confirm-text">
            {{ pendingCancel ? `Cancel the pass for ${pendingCancel.visitor_name}?` : '' }}
            The visitor won't be able to check in with this link anymore.
          </div>
          <div class="confirm-actions">
            <button class="confirm-cancel" @click="confirmCancel = false">Keep it</button>
            <button class="confirm-proceed" @click="doCancel">Cancel pass</button>
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
          <v-avatar :color="snackbar.color === 'success' ? 'success darken-2' : 'error darken-2'" size="28" class="mr-3">
            <v-icon color="white" small>{{ snackbar.color === 'success' ? 'mdi-check' : 'mdi-alert' }}</v-icon>
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

function toLocalInput(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    "-" + pad(d.getMonth() + 1) +
    "-" + pad(d.getDate()) +
    "T" + pad(d.getHours()) +
    ":" + pad(d.getMinutes())
  );
}

export default {
  name: "OfficialVisitors",

  data() {
    return {
      nav_bars: false,
      activeTab: "/officials/visitors",

      loading: false,
      saving: false,

      uid: null,
      estateId: null,
      estate: { estate_name: "" },
      households: [],

      passes: [],
      search: "",
      statusFilter: "",
      statusOptions: [
        { text: "All statuses", value: "" },
        { text: "Active",    value: "Active" },
        { text: "Used",      value: "Used" },
        { text: "Expired",   value: "Expired" },
        { text: "Cancelled", value: "Cancelled" },
      ],

      dialog: false,
      showCode: false,
      createdCode: "",
      createdLink: "",
      createdVisitor: "",
      createdSmsSent: false,
      submitError: "",
      errors: { visitor_name: "" },
      form: this.blankForm(),

      quickDurations: [
        { label: "2 hours",  hours: 2 },
        { label: "4 hours",  hours: 4 },
        { label: "8 hours",  hours: 8 },
        { label: "24 hours", hours: 24 },
      ],

      confirmCancel: false,
      pendingCancel: null,

      snackbar: { show: false, text: "", color: "success" },
      _debounce: null,
    };
  },

  computed: {
    dashboardRoute() {
      return this.estateId
        ? `/officials/dashboard/${this.estateId}`
        : "/officials/dashboard";
    },
    menuItems() {
      return [
        { title: "Dashboard", icon: "mdi-view-dashboard", route: this.dashboardRoute },
        { title: "Pending",   icon: "mdi-account-clock",  route: "/officials/pending" },
        { title: "Residents", icon: "mdi-home-group",     route: "/officials/residence" },
        { title: "Visitors",  icon: "mdi-ticket-confirmation-outline", route: "/officials/visitors" },
        { title: "Payments",  icon: "mdi-currency-usd",   route: "/officials/payments" },
        { title: "Vehicles",  icon: "mdi-car",            route: "/officials/vehicles" },
        { title: "Charges",   icon: "mdi-tag-multiple",   route: "/officials/charges" },
        { title: "Team",      icon: "mdi-account-supervisor", route: "/officials/team" },
        { title: "Cash",      icon: "mdi-cash-register",  route: "/officials/cash" },
      ];
    },
    bottomMenuItems() {
      return [
        { title: "Home",     icon: "mdi-view-dashboard", route: this.dashboardRoute },
        { title: "Pending",  icon: "mdi-account-clock",  route: "/officials/pending" },
        { title: "Visitors", icon: "mdi-ticket-confirmation-outline", route: "/officials/visitors" },
        { title: "Vehicles", icon: "mdi-car",            route: "/officials/vehicles" },
        { title: "Settings", icon: "mdi-cog",            route: "/officials/settings" },
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

    visiblePasses() {
      return this.passes;
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
        const r = this.$router.push(path);
        if (r && typeof r.catch === "function") {
          r.catch((err) => {
            if (err && err.name !== "NavigationDuplicated") console.error("Nav error:", err);
          });
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
        household_id: null,
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
        that.loadProfileAndFetch();
        return;
      }
      that._authUnsub = that.$fire.auth.onAuthStateChanged((user) => {
        if (user && user.uid) {
          that.uid = user.uid;
          that.loadProfileAndFetch();
          if (that._authUnsub) {
            that._authUnsub();
            that._authUnsub = null;
          }
        } else {
          that.showSnackbar("Please sign in as an official", "error");
        }
      });
    },

    async loadProfileAndFetch() {
      try {
        const { data } = await axios.get(`${API}/officials/getOfficialById/${this.uid}`);
        if (data) this.estateId = data.estate_id || null;
      } catch (err) {
        console.warn("Could not resolve official estate:", err.message);
      }

      const routeId = this.$route?.params?.id;
      if (routeId) this.estateId = Number(routeId);

      if (this.estateId) {
        try {
          const { data } = await axios.get(`${API}/estates/estate/${this.estateId}`);
          this.estate = { estate_name: data?.estate_name || "" };
        } catch (_) {}
        this.loadHouseholds();
      }

      this.refreshAll();
    },

    async loadHouseholds() {
      if (!this.estateId) return;
      try {
        const { data } = await axios.get(`${API}/households/getBHsHldEstId/${this.estateId}`);
        this.households = Array.isArray(data) ? data : [];
      } catch (err) {
        console.warn("Could not load households:", err.message);
        this.households = [];
      }
    },

    async refreshAll() {
      if (!this.estateId) return;
      this.loading = true;
      await this.fetch();
      this.loading = false;
    },

    async fetch() {
      if (!this.estateId) return;
      this.loading = true;
      try {
        const { data } = await axios.get(`${API}/visitor-passes/estate/${this.estateId}`, {
          params: { search: this.search, status: this.statusFilter },
        });
        this.passes = Array.isArray(data) ? data : [];
      } catch (err) {
        this.showSnackbar(err.response?.data?.error || "Failed to load passes", "error");
      } finally {
        this.loading = false;
      }
    },

    debouncedFetch() {
      clearTimeout(this._debounce);
      this._debounce = setTimeout(() => this.fetch(), 350);
    },

    openAdd() {
      this.form = this.blankForm();
      this.submitError = "";
      this.errors = { visitor_name: "" };
      this.dialog = true;
    },

    applyQuick(hours) {
      const from = this.form.valid_from ? new Date(this.form.valid_from) : new Date();
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
        this.submitError = "Could not determine your estate.";
        return;
      }

      this.saving = true;
      try {
        const hadPhone = !!String(this.form.visitor_phone || "").trim();
        const payload = {
          estate_id: this.estateId,
          household_id: this.form.household_id || null,
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
        this.createdVisitor = this.form.visitor_name;
        this.createdSmsSent = hadPhone;
        this.showCode = true;
        await this.fetch();
      } catch (err) {
        this.submitError = err.response?.data?.error || "Failed to create pass";
      } finally {
        this.saving = false;
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
        this.showSnackbar(err.response?.data?.error || "Failed to cancel", "error");
      }
    },

    checkinUrl(code) {
      return `${APP_URL}/checkin/${code}`;
    },

    async copyLink(code) {
      try {
        await navigator.clipboard.writeText(this.checkinUrl(code));
        this.showSnackbar("Link copied");
      } catch (_) {
        this.showSnackbar(`Copy failed — link: ${this.checkinUrl(code)}`, "error");
      }
    },

    async copyCode(code) {
      try {
        await navigator.clipboard.writeText(code);
        this.showSnackbar("Code copied");
      } catch (_) {
        this.showSnackbar(`Copy failed — code: ${code}`, "error");
      }
    },

    hostLine(p) {
      if (p.host_name) {
        return p.house_number ? `${p.host_name} · #${p.house_number}` : p.host_name;
      }
      return "Estate office";
    },

    formatWindow(from, until) {
      if (!from || !until) return "";
      const f = new Date(from);
      const u = new Date(until);
      const sameDay = f.toDateString() === u.toDateString();
      const fmtDate = (d) => d.toLocaleString("en-GB", { day: "2-digit", month: "short" });
      const fmtTime = (d) => d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
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

    formatNum(n) {
      return Number(n || 0).toLocaleString();
    },

    showSnackbar(text, color = "success") {
      this.snackbar = { show: true, text, color };
    },

    logout() {
      if (this.$fire?.auth) this.$fire.auth.signOut();
      this.$router.push("/");
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
.icon-btn:hover:not(:disabled) { border-color: #8051ff; color: #8051ff; }
.icon-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.add-btn {
  text-transform: none !important;
  letter-spacing: 0;
  font-weight: 700;
  transition: all 0.2s ease;
}
.add-btn:hover { transform: translateY(-1px); }

/* ============================================================
   KPI GRID
   ============================================================ */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.kpi {
  position: relative;
  padding: 18px 20px;
  border-radius: 20px;
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.28s ease;
  overflow: hidden;
}
.kpi-light {
  background: #ffffff;
  border: 1px solid #eef1f6;
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.03);
}
.kpi-dark {
  background: linear-gradient(140deg, #0a0a14 0%, #221047 55%, #2b1256 100%);
  border: none;
  box-shadow: 0 22px 44px -22px rgba(34, 16, 71, 0.55);
}
.kpi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.kpi-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.kpi-icon-purple {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.7);
}
.kpi-icon-amber {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 10px 22px -10px rgba(245, 158, 11, 0.6);
}
.kpi-icon-white {
  background: #ffffff;
  box-shadow: 0 10px 22px -10px rgba(255, 255, 255, 0.5);
}
.kpi-label {
  font-size: 0.64rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  margin-bottom: 4px;
}
.kpi-label-dark { color: rgba(255, 255, 255, 0.65); }
.kpi-value {
  font-size: 1.9rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -1px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.kpi-value-dark { color: #ffffff; }
.kpi-foot {
  margin-top: 10px;
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 5px;
}
.kpi-foot-muted { color: #94a3b8; }
.kpi-foot-warn  { color: #b45309; }
.kpi-foot-light { color: rgba(255, 255, 255, 0.85); }

@media (max-width: 900px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
}
@media (max-width: 599px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .kpi { padding: 14px; border-radius: 16px; }
  .kpi-value { font-size: 1.35rem; }
  .kpi-icon { width: 34px; height: 34px; border-radius: 10px; }
  .kpi-icon .v-icon { font-size: 18px !important; }
}

/* ============================================================
   FILTER ROW
   ============================================================ */
.filter-row {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 12px;
  margin-top: 16px;
  padding: 0 4px;
}
.search-field-premium ::v-deep .v-input__slot {
  background: #ffffff !important;
}
.search-field-premium.v-input--is-focused ::v-deep .v-input__slot {
  box-shadow: 0 2px 10px rgba(128, 81, 255, 0.12);
}
.status-filter ::v-deep .v-input__slot {
  background: #ffffff !important;
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

.pass-code-box { min-width: 90px; flex-shrink: 0; }
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
.p-host {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: #8051ff;
  margin-top: 4px;
  font-weight: 700;
}
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
.p-status-grey  { background: #f1f5f9; color: #475569; }
.p-status-red   { background: rgba(239, 68, 68, 0.12); color: #b91c1c; }

.p-actions { display: flex; gap: 4px; flex-shrink: 0; }
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
.empty-title { font-weight: 800; color: #0f0d24; font-size: 1rem; }
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
   DIALOGS
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
select.field-input {
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 38px;
  cursor: pointer;
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

/* CODE CARD */
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
.code-copy-btn,
.code-copy-code-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px 18px;
  border-radius: 12px;
  border: none;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}
.code-copy-btn {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 10px 24px -12px rgba(128, 81, 255, 0.7);
}
.code-copy-btn:hover {
  background: linear-gradient(135deg, #8a5cff 0%, #7040ee 100%);
  transform: translateY(-1px);
}
.code-copy-code-btn {
  margin-top: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.8rem;
  font-weight: 700;
}
.code-copy-code-btn:hover { background: rgba(255, 255, 255, 0.1); }
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
  .filter-row { grid-template-columns: 1fr; padding: 0; }
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