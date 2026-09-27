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
      <div class="sticky-header-premium px-4 px-sm-6 py-4">
        <v-container fluid class="pa-0">
          <v-row align="center" no-gutters>
            <v-col cols="8" sm="6">
              <div class="d-flex align-center">
                <v-btn
                  icon
                  small
                  class="mr-2 back-btn"
                  @click="goTo(dashboardRoute)"
                >
                  <v-icon size="20">mdi-arrow-left</v-icon>
                </v-btn>
                <div class="header-text">
                  <div class="d-flex align-center flex-wrap">
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
                    <v-icon x-small :color="headerStatusColor" class="mr-1">mdi-circle</v-icon>
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
                class="mr-2 year-select"
                style="max-width: 110px;"
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

              <v-avatar color="#8051FF" size="38" class="ml-1 avatar-glow">
                <v-img :src="avatarUrl" />
              </v-avatar>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <v-container :fluid="nav_bars" class="px-4 px-sm-6 pt-3 pt-sm-5 pb-8">
        <!-- ============================================================
             HERO / SUMMARY CARD — upgraded
             ============================================================ -->
        <div class="hero-card reveal-card">
          <div class="hero-head">
            <div class="hero-avatar">{{ ownerInitials }}</div>
            <div class="hero-info">
              <div class="hero-name">{{ household.primary_owner || 'Resident' }}</div>
              <div class="hero-address">
                {{ [household.section, household.court, household.street].filter(Boolean).join(' · ') || '—' }}
              </div>
            </div>
            <div class="hero-status" :class="statusChipClass">
              <v-icon size="14">{{ statusIcon }}</v-icon>
              <span>{{ numbers.status }}</span>
            </div>
          </div>

          <div class="hero-grid">
            <div class="hero-metric">
              <div class="metric-label">Balance B/F</div>
              <div class="metric-value">KES {{ formatNum(numbers.balance_brought_forward) }}</div>
            </div>
            <div class="hero-metric">
              <div class="metric-label">Total paid</div>
              <div class="metric-value">KES {{ formatNum(numbers.total_paid) }}</div>
            </div>
            <div class="hero-metric">
              <div class="metric-label">Due YTD</div>
              <div class="metric-value">KES {{ formatNum(numbers.due_to_date) }}</div>
            </div>
            <div class="hero-metric">
              <div class="metric-label">{{ numbers.overdue > 0 ? 'Overdue' : 'Prepaid' }}</div>
              <div class="metric-value" :class="numbers.overdue > 0 ? 'text-red' : 'text-green'">
                KES {{ formatNum(numbers.overdue > 0 ? numbers.overdue : numbers.prepaid) }}
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================================
             ALL HOUSEHOLDS TABLE — UNCHANGED
             ============================================================ -->
        <v-row class="mt-4 reveal-card" style="animation-delay: 100ms">
          <v-col cols="12">
            <v-card class="rounded-2xl" elevation="0" outlined>
              <v-card-title class="px-4 px-sm-6 py-4 card-header-premium d-flex align-center">
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
                <div class="scroll-hint hidden-xs-only">
                  <v-icon size="14" color="grey">mdi-gesture-swipe-horizontal</v-icon>
                  <span class="text-caption text--secondary">Scroll sideways</span>
                </div>
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

              <div v-else class="table-scroll">
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
             DETAILED RECORDS — upgraded
             ============================================================ -->
        <div class="panel-card mt-4 reveal-card" style="animation-delay: 150ms">
          <div class="panel-head">
            <div class="panel-icon panel-icon-lime">
              <v-icon size="20" color="#0A0A14">mdi-history</v-icon>
            </div>
            <div class="panel-title-group">
              <div class="panel-title">My detailed records</div>
              <div class="panel-sub">
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
          </div>

          <div v-if="loading && !payments.length" class="pa-6">
            <v-skeleton-loader type="list-item-two-line, list-item-two-line, list-item-two-line" />
          </div>

          <div v-else-if="!filteredPayments.length" class="empty-block">
            <div class="empty-icon">
              <v-icon size="36" color="#cbd5e1">mdi-receipt-text-outline</v-icon>
            </div>
            <div class="empty-title">No transactions</div>
            <div class="empty-sub">
              {{ search ? 'No matches for that search.' : `You haven't made any payments for ${year}.` }}
            </div>
          </div>

          <div v-else class="payments-list">
            <div
              v-for="(p, i) in filteredPayments"
              :key="p.payment_id || p.id || i"
              class="payment-row"
            >
              <div class="payment-icon">
                <v-icon size="18" color="#3f6b00">mdi-cash-check</v-icon>
              </div>
              <div class="payment-body">
                <div class="payment-title">{{ p.transaction_id }}</div>
                <div class="payment-sub">
                  {{ p.payment_method }} · {{ formatDate(p.payment_date || p.created_at) }}
                </div>
              </div>
              <div class="payment-amount">
                <span class="payment-currency">KES</span>
                <span class="payment-value">{{ formatNum(p.amount_paid) }}</span>
              </div>
            </div>
          </div>
        </div>
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

    headerStatusColor() {
      if (this.numbers.overdue > 0) return 'amber darken-2';
      return 'success';
    },

    statusChipClass() {
      const s = this.numbers.status;
      if (s === "Overdue") return "hero-status-red";
      if (s === "Prepaid") return "hero-status-green";
      return "hero-status-purple";
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
/* ============================================================
   BASE
   ============================================================ */
.cursor-pointer { cursor: pointer; }
.bg-surface { background-color: #f6f7fb !important; }
.rounded-2xl { border-radius: 20px !important; }
.h-100 { height: 100%; }
.tracking-wide { letter-spacing: 0.08em; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
.reveal-card { animation: fadeInUp 0.5s ease-out both; }

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

.refresh-btn {
  background: #ffffff !important;
  transition: all 0.2s ease;
}
.refresh-btn:hover {
  border-color: #8051FF;
  color: #8051FF !important;
}

.avatar-glow { box-shadow: 0 8px 18px -8px rgba(128, 81, 255, 0.6); }
.year-select ::v-deep .v-input__slot { background: #ffffff !important; }

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
.hero-status-purple { background: rgba(128, 81, 255, 0.12); color: #8051ff; }
.hero-status-green  { background: rgba(122, 184, 0, 0.14); color: #3f6b00; }
.hero-status-red    { background: rgba(239, 68, 68, 0.12); color: #b91c1c; }

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
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
  font-variant-numeric: tabular-nums;
}
.text-red { color: #dc2626; }
.text-green { color: #3f6b00; }

/* ============================================================
   PANEL (Detailed records)
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
.panel-icon-lime {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  box-shadow: 0 10px 22px -10px rgba(182, 255, 0, 0.6);
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

/* Payments list */
.payments-list { padding: 6px 0; }
.payment-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 20px;
  transition: background 0.15s ease;
}
.payment-row:hover { background: #fafbff; }
.payment-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: rgba(122, 184, 0, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.payment-body { flex: 1; min-width: 0; }
.payment-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.payment-sub {
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 2px;
  font-weight: 500;
}
.payment-amount {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.payment-currency {
  font-size: 0.62rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.payment-value {
  font-size: 0.92rem;
  font-weight: 800;
  color: #0f0d24;
  font-variant-numeric: tabular-nums;
}

/* Empty state */
.empty-block {
  padding: 48px 20px;
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
   SEARCH + SNACKBAR + MOBILE NAV
   ============================================================ */
.search-field-premium ::v-deep .v-input__slot {
  background: #f6f7fb !important;
  transition: all 0.25s ease;
}
.search-field-premium.v-input--is-focused ::v-deep .v-input__slot {
  background: #ffffff !important;
  box-shadow: 0 2px 10px rgba(128, 81, 255, 0.12);
}
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
   TABLE — UNTOUCHED (same as original)
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
.table-scroll::-webkit-scrollbar-thumb:hover { background: #c7b8ff; }

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
.payment-table tbody tr:hover td { background: #fafbff; }
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
.payment-table tbody tr:hover .td-sticky-2 { background: #fafbff; }
.tr-self .td-sticky,
.tr-self .td-sticky-2,
.tr-self td { background: #f5f3ff !important; }
.tr-self td.td-total { background: #ede9fe !important; }
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
  .hero-card { padding: 16px; }
  .hero-avatar { width: 46px; height: 46px; font-size: 0.95rem; }
  .hero-name { font-size: 0.95rem; }
  .metric-value { font-size: 0.88rem; }
  .panel-head { padding: 14px 16px; }
  .payment-row { padding: 12px 16px; }
}
</style>