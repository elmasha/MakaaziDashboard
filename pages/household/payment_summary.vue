<template>
  <div class="d-flex bg-surface dashboard-root" style="min-height: 100vh;">
    <!-- ============================================================
         DESKTOP SIDEBAR
         ============================================================ -->
    <v-navigation-drawer
      v-if="!nav_bars"
      permanent
      width="260"
      class="elevation-1 sidebar-glass"
    >
      <div class="pa-6 pb-4">
        <div class="d-flex align-center cursor-pointer brand-hover" @click="goTo(dashboardRoute)">
          <v-avatar color="#8051FF" size="46" class="elevation-2 mr-3">
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
          :class="{ 'purple lighten-5 purple--text': isActive(item.route) }"
          :style="{ 'animation-delay': idx * 50 + 'ms' }"
        >
          <v-list-item-icon class="mr-3">
            <v-icon :color="isActive(item.route) ? '#8051FF' : 'grey'" size="22">
              {{ item.icon }}
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="font-weight-semibold text-body-2">
              {{ item.title }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-4 pb-6">
          <v-btn
            block
            outlined
            color="#8051FF"
            class="rounded-xl text-capitalize mt-3 font-weight-medium"
            @click="logout"
          >
            <v-icon left size="18" color="#8051FF">mdi-logout</v-icon>
            Sign Out
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- ============================================================
         MOBILE BOTTOM NAV
         ============================================================ -->
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

    <!-- ============================================================
         MAIN
         ============================================================ -->
    <v-main :class="nav_bars ? 'pb-16' : ''" class="main-premium">
      <!-- HEADER -->
      <div class="sticky-header-premium px-4 px-sm-6 py-3">
        <v-container fluid class="pa-0">
          <v-row align="center" no-gutters>
            <v-col cols="8" sm="6">
              <div class="d-flex align-center">
                <v-btn icon small class="mr-2" @click="goTo(dashboardRoute)">
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <div>
                  <div class="d-flex align-center">
                    <h1 class="text-h6 text-sm-h5 font-weight-bold text--primary page-title">
                      Payment Summary
                    </h1>
                    <v-chip
                      x-small
                      color="purple lighten-5 purple--text"
                      class="ml-2 font-weight-bold hidden-xs-only"
                      label
                    >
                      {{ year }}
                    </v-chip>
                  </div>
                  <div class="d-flex align-center mt-1">
                    <v-icon x-small color="success" class="mr-1">mdi-circle</v-icon>
                    <span class="text-caption text--secondary">
                      {{ rows.length }} household{{ rows.length === 1 ? '' : 's' }} in your estate
                    </span>
                  </div>
                </div>
              </div>
            </v-col>
            <v-col cols="4" sm="6" class="d-flex justify-end align-center">
              <v-select
                v-model="year"
                :items="availableYears"
                dense
                outlined
                rounded
                hide-details
                class="mr-2 year-select hidden-xs-only"
                style="max-width: 90px;"
                @change="refreshAll"
              />

              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    outlined
                    small
                    color="grey darken-1"
                    class="mr-2 refresh-btn"
                    :loading="loading"
                    @click="refreshAll"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon small>mdi-refresh</v-icon>
                  </v-btn>
                </template>
                <span>Refresh</span>
              </v-tooltip>

              <v-avatar color="#8051FF" size="36" class="ml-1">
                <v-img :src="avatarUrl" />
              </v-avatar>
            </v-col>
          </v-row>

          <!-- Mobile: compact year picker on its own row -->
          <div v-if="nav_bars" class="mt-3 mobile-year-row">
            <span class="mobile-year-label">Year</span>
            <v-select
              v-model="year"
              :items="availableYears"
              dense
              outlined
              rounded
              hide-details
              class="year-select-mobile"
              @change="refreshAll"
            />
          </div>
        </v-container>
      </div>

      <v-container :fluid="nav_bars" class="px-4 px-sm-6 pt-2 pt-sm-4 pb-8">
        <!-- ============================================================
             HERO / SUMMARY CARD
             ============================================================ -->
        <v-row class="reveal-card">
          <v-col cols="12">
            <v-card class="rounded-2xl" elevation="0" outlined>
              <div class="pa-4 pa-sm-6">
                <div class="d-flex align-center flex-wrap">
                  <v-avatar color="#8051FF" size="52" class="mr-3">
                    <span class="white--text font-weight-bold" style="font-size: 1.05rem;">
                      {{ ownerInitials }}
                    </span>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <div class="purple--text font-weight-bold" style="font-size: 1.05rem;">
                      {{ household.primary_owner || 'Resident' }}
                    </div>
                    <div class="text-caption text--secondary">
                      {{ [household.section, household.court, household.street].filter(Boolean).join(' · ') || '—' }}
                    </div>
                  </div>
                  <v-chip
                    small
                    label
                    class="font-weight-bold"
                    :color="statusChipColor"
                    :text-color="statusChipTextColor"
                  >
                    <v-icon x-small left>{{ statusIcon }}</v-icon>
                    {{ numbers.status }}
                  </v-chip>
                </div>

                <v-divider class="my-4" />

                <v-row dense>
                  <v-col cols="6" sm="3">
                    <div class="text-caption text--secondary">Balance B/F</div>
                    <div class="font-weight-bold text--primary" style="font-size: 1.05rem;">
                      KES {{ formatNum(numbers.balance_brought_forward) }}
                    </div>
                  </v-col>
                  <v-col cols="6" sm="3">
                    <div class="text-caption text--secondary">Total paid</div>
                    <div class="font-weight-bold text--primary" style="font-size: 1.05rem;">
                      KES {{ formatNum(numbers.total_paid) }}
                    </div>
                  </v-col>
                  <v-col cols="6" sm="3" class="mt-3 mt-sm-0">
                    <div class="text-caption text--secondary">Due YTD</div>
                    <div class="font-weight-bold text--primary" style="font-size: 1.05rem;">
                      KES {{ formatNum(numbers.due_to_date) }}
                    </div>
                  </v-col>
                  <v-col cols="6" sm="3" class="mt-3 mt-sm-0">
                    <div class="text-caption text--secondary">
                      {{ numbers.overdue > 0 ? 'Overdue' : 'Prepaid' }}
                    </div>
                    <div
                      class="font-weight-bold"
                      :class="numbers.overdue > 0 ? 'red--text' : 'green--text'"
                      style="font-size: 1.05rem;"
                    >
                      KES {{ formatNum(numbers.overdue > 0 ? numbers.overdue : numbers.prepaid) }}
                    </div>
                  </v-col>
                </v-row>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- ============================================================
             ALL HOUSEHOLDS TABLE — horizontal 12 months
             ============================================================ -->
        <v-row class="mt-4 reveal-card" style="animation-delay: 100ms">
          <v-col cols="12">
            <v-card class="rounded-2xl" elevation="0" outlined>
              <v-card-title class="px-4 px-sm-6 py-4 card-header-premium d-flex align-center flex-wrap">
                <v-avatar color="purple lighten-5" size="36" class="mr-3">
                  <v-icon color="#8051FF">mdi-calendar-month</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-h6 font-weight-bold text--primary">
                    Payment history — {{ year }}
                  </div>
                  <div class="text-caption text--secondary">
                    Every household in your estate · month-by-month record
                  </div>
                </div>

                <!-- LOUD SCROLL HINT (auto-hides after scroll) -->
                <transition name="hint-fade">
                  <div v-if="!tableScrolled" class="scroll-hint">
                    <div class="scroll-hint-icon-wrap">
                      <v-icon size="18" class="scroll-hint-icon">mdi-gesture-swipe-left</v-icon>
                    </div>
                    <div class="scroll-hint-body">
                      <div class="scroll-hint-title">SCROLL SIDEWAYS</div>
                      <div class="scroll-hint-sub">See Jan – Dec · more months →</div>
                    </div>
                  </div>
                </transition>
              </v-card-title>
              <v-divider></v-divider>

              <div v-if="loading && !rows.length" class="pa-6">
                <v-skeleton-loader type="table-heading, table-thead, table-tbody" />
              </div>

              <div v-else-if="!rows.length" class="pa-12 text-center">
                <v-icon size="56" color="grey lighten-2">mdi-table-off</v-icon>
                <div class="text-h6 grey--text text--darken-1 mt-3">No payment data</div>
                <div class="text-body-2 grey--text">
                  No households have payment records for {{ year }}.
                </div>
              </div>

              <div v-else class="table-scroll" @scroll="onTableScroll">
                <table class="payment-table">
                  <thead>
                    <tr>
                      <th class="th-sticky th-num th-index">#</th>
                      <th class="th-sticky-2 th-name">Resident</th>
                      <th class="th-num th-bf">BAL B/F</th>
                      <th
                        v-for="m in monthCols"
                        :key="m.key"
                        class="th-num th-month"
                        :class="{ 'th-past': m.month <= currentMonth }"
                      >
                        {{ m.short }}
                      </th>
                      <th class="th-num th-total">TOTAL PAID</th>
                      <th class="th-num">DUE YTD</th>
                      <th class="th-num">OVER/ PRE</th>
                      <th class="th-num th-eq">MO. EQ.</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr
                      v-for="(row, i) in rows"
                      :key="row.household_id || row.uid || i"
                      :class="{ 'tr-self': isMe(row) }"
                    >
                      <td class="td-sticky td-num td-index">{{ i + 1 }}</td>
                      <td class="td-sticky-2 td-name">
                        <div class="name-cell">
                          <div class="name-avatar">{{ initialsOf(row.name) }}</div>
                          <div class="name-text">
                            <div class="name-line">
                              {{ row.name }}
                              <v-chip
                                v-if="isMe(row)"
                                x-small
                                label
                                color="purple lighten-5 purple--text"
                                class="ml-1 font-weight-bold"
                              >
                                You
                              </v-chip>
                            </div>
                            <div class="name-meta">
                              <span v-if="row.house_number">Hs {{ row.house_number }}</span>
                              <span v-if="row.house_number && row.section" class="dot">·</span>
                              <span v-if="row.section">{{ row.section }}</span>
                              <span v-if="row.court" class="dot">·</span>
                              <span v-if="row.court">{{ row.court }}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        class="td-num td-bf"
                        :class="Number(row.balance_bf) < 0 ? 'red--text' : ''"
                      >
                        {{
                          Number(row.balance_bf) < 0
                            ? `(${formatNum(Math.abs(row.balance_bf))})`
                            : formatNum(row.balance_bf)
                        }}
                      </td>
                      <td
                        v-for="m in monthCols"
                        :key="m.key"
                        class="td-num td-month"
                        :class="{
                          'td-past': m.month <= currentMonth,
                          'td-paid': Number(row[m.key]) > 0,
                          'td-empty': !Number(row[m.key]),
                        }"
                      >
                        <span v-if="Number(row[m.key]) > 0" class="month-amount">
                          {{ formatNum(row[m.key]) }}
                        </span>
                        <span v-else class="dash">—</span>
                      </td>
                      <td class="td-num td-total">
                        <span class="amount-strong">{{ formatNum(row.total_paid) }}</span>
                      </td>
                      <td class="td-num">{{ formatNum(row.due_year_to_date) }}</td>
                      <td
                        class="td-num"
                        :class="Number(row.overdue) > 0 ? 'red--text' : 'green--text'"
                      >
                        <span class="amount-strong">
                          {{
                            Number(row.overdue) > 0
                              ? `(${formatNum(row.overdue)})`
                              : formatNum(Math.abs(row.overdue || 0))
                          }}
                        </span>
                      </td>
                      <td class="td-num">
                        <span class="mo-eq">{{ Number(row.months_equivalent || 0).toFixed(1) }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- ============================================================
             DETAILED RECORDS (my own only)
             ============================================================ -->
        <v-row class="mt-4 reveal-card" style="animation-delay: 150ms">
          <v-col cols="12">
            <v-card class="rounded-2xl" elevation="0" outlined>
              <v-card-title class="px-4 px-sm-6 py-4 card-header-premium d-flex align-center">
                <v-avatar color="purple lighten-5" size="36" class="mr-3">
                  <v-icon color="#8051FF">mdi-history</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-h6 font-weight-bold text--primary">My detailed records</div>
                  <div class="text-caption text--secondary">
                    {{ filteredPayments.length }} transaction{{ filteredPayments.length === 1 ? '' : 's' }} in {{ year }}
                  </div>
                </div>
                <v-text-field
                  v-model="search"
                  placeholder="Search"
                  dense
                  outlined
                  rounded
                  hide-details
                  prepend-inner-icon="mdi-magnify"
                  class="search-field-premium hidden-xs-only"
                  style="max-width: 220px"
                  clearable
                />
              </v-card-title>
              <v-divider></v-divider>

              <div v-if="loading && !payments.length" class="pa-6">
                <v-skeleton-loader type="list-item-two-line, list-item-two-line, list-item-two-line" />
              </div>

              <div v-else-if="!filteredPayments.length" class="pa-12 text-center">
                <v-icon size="56" color="grey lighten-2">mdi-receipt-text-outline</v-icon>
                <div class="text-h6 grey--text text--darken-1 mt-3">No transactions</div>
                <div class="text-body-2 grey--text">
                  {{ search ? 'No matches for that search.' : `You haven't made any payments for ${year}.` }}
                </div>
              </div>

              <v-list v-else class="pa-0">
                <template v-for="(p, i) in filteredPayments">
                  <v-list-item :key="p.payment_id || p.id" class="py-3 px-4 px-sm-6 hover-row">
                    <v-list-item-avatar color="green lighten-5" size="40">
                      <v-icon color="green darken-2" small>mdi-cash-check</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title class="font-weight-semibold text--primary">
                        {{ p.transaction_id }}
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-caption text--secondary">
                        {{ p.payment_method }} · {{ formatDate(p.payment_date || p.created_at) }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <span class="font-weight-bold text--primary">
                        {{ formatNum(p.amount_paid) }}
                      </span>
                    </v-list-item-action>
                  </v-list-item>
                  <v-divider
                    v-if="i < filteredPayments.length - 1"
                    :key="`d-${p.payment_id || p.id}`"
                    inset
                  />
                </template>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
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
import numeral from "numeral";

const API = "https://makaaziserver22.up.railway.app/api";

export default {
  name: "HouseholdPaymentSummary",
  data() {
    return {
      nav_bars: false,
      activeTab: "/household/payment_summary",

      loading: false,
      uid: null,
      estateId: null,
      myHouseholdId: null,
      year: new Date().getFullYear(),

      household: {
        primary_owner: "",
        section: "",
        court: "",
        street: "",
        house_number: "",
        contact_number: "",
      },

      myHouseholdRecord: null,
      rows: [],

      numbers: {
        balance_brought_forward: 0,
        total_paid: 0,
        due_to_date: 0,
        overdue: 0,
        prepaid: 0,
        months_equivalent: 0,
        monthly_rate: 0,
        annual_due: 0,
        status: "Paid",
      },

      months: [],
      payments: [],
      search: "",

      // UI only — becomes true once user scrolls the table
      tableScrolled: false,

      monthCols: [
        { key: "january", short: "JAN", month: 1 },
        { key: "february", short: "FEB", month: 2 },
        { key: "march", short: "MAR", month: 3 },
        { key: "april", short: "APR", month: 4 },
        { key: "may", short: "MAY", month: 5 },
        { key: "june", short: "JUN", month: 6 },
        { key: "july", short: "JUL", month: 7 },
        { key: "august", short: "AUG", month: 8 },
        { key: "september", short: "SEP", month: 9 },
        { key: "october", short: "OCT", month: 10 },
        { key: "november", short: "NOV", month: 11 },
        { key: "december", short: "DEC", month: 12 },
      ],

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
        { title: "Payments", icon: "mdi-currency-usd", route: "/household/payment_summary" },
        { title: "Profile", icon: "mdi-account", route: "/household/profile" },
        { title: "Alerts", icon: "mdi-bell", route: "/household/notifications" },
      ];
    },

    availableYears() {
      const now = new Date().getFullYear();
      return [now, now - 1, now - 2, now - 3];
    },

    currentMonth() {
      return new Date().getMonth() + 1;
    },

    avatarUrl() {
      const name = this.household.primary_owner || "Resident";
      return `https://ui-avatars.com/api/?background=8051FF&color=fff&name=${encodeURIComponent(name)}`;
    },

    ownerInitials() {
      const name = this.household.primary_owner || "R";
      return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    },

    statusChipColor() {
      const s = this.numbers.status;
      if (s === "Overdue") return "red lighten-5";
      if (s === "Prepaid") return "green lighten-5";
      return "purple lighten-5";
    },

    statusChipTextColor() {
      const s = this.numbers.status;
      if (s === "Overdue") return "red darken-2";
      if (s === "Prepaid") return "green darken-2";
      return "purple darken-2";
    },

    statusIcon() {
      const s = this.numbers.status;
      if (s === "Overdue") return "mdi-alert-circle-outline";
      if (s === "Prepaid") return "mdi-check-circle-outline";
      return "mdi-information-outline";
    },

    filteredPayments() {
      if (!this.search) return this.payments;
      const q = this.search.toLowerCase();
      return this.payments.filter(
        (p) =>
          (p.transaction_id || "").toLowerCase().includes(q) ||
          (p.payment_method || "").toLowerCase().includes(q)
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

    /** Called on horizontal scroll of the payment table */
    onTableScroll(e) {
      if (!this.tableScrolled && e.target.scrollLeft > 10) {
        this.tableScrolled = true;
      }
    },

    isMe(row) {
      if (!row) return false;
      if (this.uid && row.uid && row.uid === this.uid) return true;
      if (
        this.myHouseholdId != null &&
        row.household_id != null &&
        Number(row.household_id) === Number(this.myHouseholdId)
      ) {
        return true;
      }
      return false;
    },

    waitForAuthAndLoad() {
      const that = this;
      const current = that.$fire?.auth?.currentUser;
      if (current && current.uid) {
        that.uid = current.uid;
        that.refreshAll();
        return;
      }
      that._authUnsub = that.$fire.auth.onAuthStateChanged((user) => {
        if (user && user.uid) {
          that.uid = user.uid;
          that.refreshAll();
          if (that._authUnsub) {
            that._authUnsub();
            that._authUnsub = null;
          }
        } else {
          that.showSnackbar("Please sign in to view your summary", "error");
        }
      });
    },

    async refreshAll() {
      if (!this.uid) return;
      this.loading = true;

      await this.resolveHousehold();

      await Promise.allSettled([
        this.fetchSummary(),
        this.fetchEstateRows(),
        this.fetchMyPayments(),
      ]);

      this.ensureSelfInRows();

      // Reset hint on refresh so user sees it again after year change
      this.tableScrolled = false;

      this.loading = false;
    },

    async resolveHousehold() {
      try {
        const { data } = await axios.get(
          `${API}/households/getHouseHoldId/${this.uid}`
        );
        if (data) {
          this.myHouseholdRecord = data;
          this.household = {
            primary_owner: data.primary_owner || "",
            section: data.section || "",
            court: data.court || "",
            street: data.street || "",
            house_number: data.house_number || "",
            contact_number: data.contact_number || "",
          };
          this.estateId = data.estate_id || null;
          this.myHouseholdId = data.household_id || null;
        }
      } catch (err) {
        console.warn("Could not resolve household:", err.message);
      }
    },

    async fetchSummary() {
      const url = `${API}/households/payment-summary/${this.uid}?year=${this.year}`;
      try {
        const { data, status } = await axios.get(url);
        if (status === 200) {
          this.household = {
            primary_owner: data.household?.primary_owner || this.household.primary_owner,
            section: data.household?.section || this.household.section,
            court: data.household?.court || this.household.court,
            street: data.household?.street || this.household.street,
            house_number: this.household.house_number,
            contact_number: this.household.contact_number,
          };
          this.numbers = {
            balance_brought_forward: Number(data.balance_brought_forward) || 0,
            total_paid: Number(data.total_paid) || 0,
            due_to_date: Number(data.due_to_date) || 0,
            overdue: Number(data.overdue) || 0,
            prepaid: Number(data.prepaid) || 0,
            months_equivalent: Number(data.months_equivalent) || 0,
            monthly_rate: Number(data.monthly_rate) || 0,
            annual_due: Number(data.annual_due) || 0,
            status: data.status || "Paid",
          };
          this.months =
            Array.isArray(data.months) && data.months.length === 12
              ? data.months
              : this.emptyMonths();
        }
      } catch (error) {
        console.warn("Payment summary error:", error.response?.status);
        this.months = this.emptyMonths();
      }
    },

    async fetchEstateRows() {
      if (!this.estateId) {
        this.rows = [];
        return;
      }
      try {
        const url = `${API}/household-payments/year-by-estate/${this.estateId}?year=${this.year}`;
        const { data, status } = await axios.get(url);
        if (status === 200) {
          const list = Array.isArray(data) ? data : [];
          this.rows = list.map((r) => ({
            household_id: r.household_id,
            uid: r.uid || null,
            name: r.name || r.full_name || r.primary_owner || "—",
            house_number: r.house_number || "",
            contact_number: r.contact_number || "",
            section: r.section || "",
            court: r.court || "",
            street: r.street || "",
            balance_bf: Number(r.balance_bf || r.balance_brought_forward || 0),
            total_paid: Number(r.total_paid || 0),
            due_year_to_date: Number(r.due_year_to_date || 0),
            overdue: Number(r.overdue || 0),
            months_equivalent: Number(r.months_equivalent || 0),
            january: Number(r.january || 0),
            february: Number(r.february || 0),
            march: Number(r.march || 0),
            april: Number(r.april || 0),
            may: Number(r.may || 0),
            june: Number(r.june || 0),
            july: Number(r.july || 0),
            august: Number(r.august || 0),
            september: Number(r.september || 0),
            october: Number(r.october || 0),
            november: Number(r.november || 0),
            december: Number(r.december || 0),
          }));
        }
      } catch (error) {
        console.warn("Estate rows fetch failed:", error.response?.status);
        this.rows = [];
      }
    },

    ensureSelfInRows() {
      if (!this.uid && this.myHouseholdId == null) return;

      const existingIdx = this.rows.findIndex((r) => this.isMe(r));

      if (existingIdx >= 0) {
        const [mine] = this.rows.splice(existingIdx, 1);
        this.rows.unshift(mine);
        return;
      }

      const monthMap = {};
      for (const m of this.months) {
        const num = m.month_number || this.monthNumberFromName(m.month);
        const key = this.monthKey(num);
        if (key) monthMap[key] = Number(m.amount || 0);
      }

      const selfRow = {
        household_id: this.myHouseholdId,
        uid: this.uid,
        name: this.household.primary_owner || "Resident",
        house_number: this.household.house_number || "",
        contact_number: this.household.contact_number || "",
        section: this.household.section || "",
        court: this.household.court || "",
        street: this.household.street || "",
        balance_bf: Number(this.numbers.balance_brought_forward || 0),
        total_paid: Number(this.numbers.total_paid || 0),
        due_year_to_date: Number(this.numbers.due_to_date || 0),
        overdue:
          Number(this.numbers.overdue || 0) > 0
            ? Number(this.numbers.overdue || 0)
            : -Number(this.numbers.prepaid || 0),
        months_equivalent: Number(this.numbers.months_equivalent || 0),
        january: monthMap.january || 0,
        february: monthMap.february || 0,
        march: monthMap.march || 0,
        april: monthMap.april || 0,
        may: monthMap.may || 0,
        june: monthMap.june || 0,
        july: monthMap.july || 0,
        august: monthMap.august || 0,
        september: monthMap.september || 0,
        october: monthMap.october || 0,
        november: monthMap.november || 0,
        december: monthMap.december || 0,
      };

      this.rows.unshift(selfRow);
    },

    async fetchMyPayments() {
      try {
        const hh = await axios.get(`${API}/households/getHouseHoldId/${this.uid}`);
        const householdId = hh.data?.household_id;
        if (!householdId) return;

        const { data, status } = await axios.get(
          `${API}/payments/getById/${householdId}`
        );
        if (status === 200) {
          const list = Array.isArray(data) ? data : [];
          this.payments = list.filter((p) => {
            const d = p.payment_date || p.created_at;
            if (!d) return false;
            return new Date(d).getFullYear() === Number(this.year);
          });
        }
      } catch (error) {
        console.warn("My payments failed:", error.message);
        this.payments = [];
      }
    },

    monthKey(monthNumber) {
      const keys = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december",
      ];
      return keys[monthNumber - 1] || null;
    },

    monthNumberFromName(name) {
      if (!name) return 0;
      const names = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december",
      ];
      const i = names.findIndex((n) =>
        n.startsWith((name || "").toLowerCase().slice(0, 3))
      );
      return i >= 0 ? i + 1 : 0;
    },

    initialsOf(name) {
      if (!name) return "?";
      return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    },

    emptyMonths() {
      const names = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];
      return names.map((m, i) => ({
        month: m,
        month_short: m.slice(0, 3),
        month_number: i + 1,
        amount: 0,
        amount_formatted: "0",
        count: 0,
        display: "—",
      }));
    },

    formatNum(n) {
      return numeral(n || 0).format("0,0");
    },

    formatDate(d) {
      if (!d) return "—";
      try {
        return new Date(d).toLocaleDateString("en-KE", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      } catch {
        return "—";
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
.cursor-pointer { cursor: pointer; }
.bg-surface { background-color: #f8fafc !important; }
.rounded-2xl { border-radius: 20px !important; }
.h-100 { height: 100%; }
.tracking-wide { letter-spacing: 0.08em; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.reveal-card { animation: fadeInUp 0.6s ease-out both; }

.sidebar-glass {
  background: rgba(255, 255, 255, 0.95) !important;
  border-right: 1px solid #e2e8f0 !important;
}
.brand-text { letter-spacing: -0.5px; }
.brand-hover { transition: opacity 0.2s; }
.brand-hover:hover { opacity: 0.8; }

.nav-item-premium {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 4px;
  border-radius: 12px !important;
}
.nav-item-premium:hover {
  background-color: rgba(128, 81, 255, 0.06);
  transform: translateX(4px);
}

.main-premium { scroll-behavior: smooth; }
.sticky-header-premium {
  position: sticky;
  top: 0;
  z-index: 5;
  background: rgba(248, 250, 252, 0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid transparent;
  transition: all 0.3s ease;
}
.page-title { letter-spacing: -0.5px; }
.refresh-btn { transition: all 0.2s ease; }
.refresh-btn:hover { border-color: #8051FF; color: #8051FF !important; }

/* ============================================================
   YEAR PICKER — compact
   ============================================================ */
.year-select ::v-deep .v-input__slot {
  background: #ffffff !important;
  min-height: 36px !important;
  padding: 0 10px !important;
}
.year-select ::v-deep .v-select__selection {
  font-size: 0.8rem;
  font-weight: 800;
  color: #0f0d24;
}
.year-select ::v-deep .v-input__append-inner {
  margin-top: 6px !important;
  padding-left: 2px !important;
}

/* Mobile row + inline label */
.mobile-year-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 2px;
}
.mobile-year-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  flex-shrink: 0;
}

/* Compact pill, does NOT stretch full width */
.year-select-mobile {
  max-width: 120px;
  flex: 0 0 auto;
}
.year-select-mobile ::v-deep .v-input__slot {
  background: #ffffff !important;
  min-height: 36px !important;
  padding: 0 10px !important;
  border-radius: 12px !important;
}
.year-select-mobile ::v-deep .v-select__selection {
  font-size: 0.8rem;
  font-weight: 800;
  color: #0f0d24;
}
.year-select-mobile ::v-deep .v-input__append-inner {
  margin-top: 6px !important;
  padding-left: 2px !important;
}
.year-select-mobile ::v-deep .v-input__control {
  width: auto !important;
}

/* ============================================================
   SCROLL HINT — loud, directive, unmissable
   ============================================================ */
.scroll-hint {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 14px;
  background: linear-gradient(135deg, #8051ff 0%, #9b6cff 100%);
  box-shadow: 0 12px 26px -12px rgba(128, 81, 255, 0.7);
  color: #ffffff;
  flex-shrink: 0;
  animation: scrollHintBounce 2s ease-in-out infinite;
  position: relative;
  overflow: hidden;
}
.scroll-hint::after {
  content: "";
  position: absolute;
  top: 0;
  left: -30%;
  width: 30%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
  animation: scrollHintShine 2.6s ease-in-out infinite;
}
.scroll-hint-icon-wrap {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.scroll-hint-icon {
  color: #ffffff !important;
  animation: scrollHintSlide 1.8s ease-in-out infinite;
}
.scroll-hint-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.scroll-hint-title {
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  line-height: 1.1;
}
.scroll-hint-sub {
  font-size: 0.66rem;
  font-weight: 600;
  opacity: 0.85;
  line-height: 1.2;
  white-space: nowrap;
}

@keyframes scrollHintBounce {
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(-3px); }
}
@keyframes scrollHintSlide {
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(-4px); }
}
@keyframes scrollHintShine {
  0%   { left: -30%; }
  60%  { left: 130%; }
  100% { left: 130%; }
}

/* Hint fade transition (auto-hide after scroll) */
.hint-fade-enter-active,
.hint-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.hint-fade-enter,
.hint-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Mobile — full width, taller */
@media (max-width: 599px) {
  .scroll-hint {
    display: flex;
    width: 100%;
    justify-content: flex-start;
    margin-top: 12px;
    padding: 12px 14px;
    gap: 12px;
  }
  .scroll-hint-title {
    font-size: 0.78rem;
    letter-spacing: 1px;
  }
  .scroll-hint-sub {
    font-size: 0.68rem;
    white-space: normal;
  }
  .scroll-hint-icon-wrap {
    width: 38px;
    height: 38px;
  }
}

.card-header-premium {
  background: linear-gradient(to bottom, #ffffff, #f8fafc);
}

.hover-row { transition: background-color 0.2s ease; }
.hover-row:hover { background-color: #f8fafc !important; }

.search-field-premium ::v-deep .v-input__slot { transition: all 0.25s ease; }
.search-field-premium ::v-deep .v-input__slot:hover,
.search-field-premium.v-input--is-focused ::v-deep .v-input__slot {
  box-shadow: 0 2px 8px rgba(128, 81, 255, 0.1);
}

.snackbar-premium ::v-deep .v-snackbar__content { padding: 12px 20px; }

.bottom-nav-premium {
  border-top: 1px solid #e2e8f0 !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(12px);
}
.mobile-nav-btn { min-width: 0 !important; }
.mobile-nav-label { font-size: 10px; margin-top: 2px; }

/* ============================================================
   TABLE — with TWO sticky columns (unchanged)
   ============================================================ */
.table-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 100%;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}
.table-scroll::-webkit-scrollbar { height: 10px; }
.table-scroll::-webkit-scrollbar-track { background: #f8fafc; }
.table-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 5px;
}
.table-scroll::-webkit-scrollbar-thumb:hover {
  background: #c7b8ff;
}

.payment-table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  min-width: 1500px;
  font-size: 0.82rem;
}

.payment-table thead th {
  position: sticky;
  top: 0;
  background: #f8fafc;
  color: #64748b;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 14px 12px;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
  z-index: 2;
}

.th-num { text-align: right; }
.th-index { min-width: 44px; }
.th-name { text-align: left; min-width: 220px; }
.th-bf { min-width: 100px; }
.th-month { min-width: 76px; }
.th-total { color: #8051FF; min-width: 110px; }
.th-eq { min-width: 80px; }
.th-past { color: #1e293b; }

.th-sticky {
  position: sticky;
  left: 0;
  background: #f8fafc;
  z-index: 5;
  width: 44px;
  min-width: 44px;
}

.th-sticky-2 {
  position: sticky;
  left: 44px;
  background: #f8fafc;
  z-index: 4;
  box-shadow: 1px 0 0 #e2e8f0;
}

.payment-table tbody td {
  padding: 14px 12px;
  border-bottom: 1px solid #f1f5f9;
  color: #475569;
  white-space: nowrap;
}

.payment-table tbody tr:hover td {
  background: #fafbff;
}

.td-sticky {
  position: sticky;
  left: 0;
  background: white;
  z-index: 3;
  text-align: right;
  width: 44px;
  min-width: 44px;
  color: #94a3b8;
  font-weight: 600;
  font-family: inherit;
}

.td-sticky-2 {
  position: sticky;
  left: 44px;
  background: white;
  z-index: 2;
  box-shadow: 1px 0 0 #e2e8f0;
  text-align: left;
  font-family: inherit;
}

.payment-table tbody tr:hover .td-sticky,
.payment-table tbody tr:hover .td-sticky-2 {
  background: #fafbff;
}

.tr-self .td-sticky,
.tr-self .td-sticky-2,
.tr-self td {
  background: #f5f3ff !important;
}
.tr-self td.td-total {
  background: #ede9fe !important;
}

.td-num {
  text-align: right;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.82rem;
}

.td-name { text-align: left; font-family: inherit; }

.name-cell { display: flex; align-items: center; gap: 10px; }

.name-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #8051FF, #a855f7);
  color: white;
  font-size: 0.68rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.5px;
}

.name-text { min-width: 0; }

.name-line {
  font-size: 0.84rem;
  font-weight: 800;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 4px;
}

.name-meta {
  font-size: 0.68rem;
  color: #94a3b8;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.name-meta .dot { color: #cbd5e1; }

.td-bf { color: #64748b; }

.td-month { font-weight: 600; }
.td-past { background: rgba(128, 81, 255, 0.04); }
.td-paid { color: #1e293b; font-weight: 700; }
.td-empty { color: #cbd5e1; }

.month-amount {
  font-family: ui-monospace, SFMono-Regular, monospace;
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
}

.dash { opacity: 0.35; }

.td-total {
  background: #faf5ff;
  border-left: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
}

.amount-strong { font-weight: 800; color: #1e293b; }

.mo-eq {
  display: inline-block;
  padding: 3px 9px;
  background: #f3e8ff;
  color: #8051FF;
  font-size: 0.72rem;
  font-weight: 800;
  border-radius: 6px;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 599px) {
  .sticky-header-premium { padding-left: 12px; padding-right: 12px; }
  .reveal-card { animation-duration: 0.4s; }
  .payment-table { min-width: 1300px; }
  .name-meta { max-width: 140px; }
  .page-title { font-size: 1.1rem; }
  .year-select-mobile { max-width: 110px; }
}
</style>