<template>
  <div class="dashboard-page">
    <!-- ============================================================
         QUICK ACTIONS
         ============================================================ -->
    <div class="quick-bar">
      <div class="quick-left">
        <h1 class="page-title">Dashboard</h1>
        <p class="page-sub">
          {{ estate_name || "Your estate" }} · overview
        </p>
      </div>
      <div class="quick-right">
        <button class="quick-btn" @click="refreshAll" :disabled="refreshing">
          <v-icon size="16" :class="{ spinning: refreshing }">mdi-refresh</v-icon>
          <span>Refresh</span>
        </button>
        <button class="quick-btn quick-btn-primary" @click="dialogAddress = true">
          <v-icon size="16">mdi-plus</v-icon>
          <span>Add address</span>
        </button>
      </div>
    </div>

    <!-- ============================================================
         STAT CARDS
         ============================================================ -->
    <div class="stats-grid">
      <!-- Total collected -->
      <div class="stat-card stat-card-dark">
        <div class="stat-top">
          <div class="stat-icon stat-icon-green">
            <v-icon size="20" color="white">mdi-cash-multiple</v-icon>
          </div>
          <button class="stat-refresh" @click="Fetch_AllPayments" title="Refresh">
            <v-icon size="14">mdi-refresh</v-icon>
          </button>
        </div>
        <div class="stat-label">Total collected</div>
        <div class="stat-value">
          <span class="stat-currency">KSh</span>
          {{ numeral(totalPayment).format("0,0") }}
        </div>
        <div class="stat-footer">
          <v-icon size="12">mdi-arrow-up</v-icon>
          <span>Across all households</span>
        </div>
      </div>

      <!-- Pending -->
      <div class="stat-card stat-card-purple">
        <div class="stat-top">
          <div class="stat-icon stat-icon-purple-light">
            <v-icon size="20" color="white">mdi-progress-clock</v-icon>
          </div>
        </div>
        <div class="stat-label">Pending payments</div>
        <div class="stat-value">
          <span class="stat-currency">KSh</span>
          {{ numeral(totalPendingPayment).format("0,0") }}
        </div>
        <div class="stat-footer">
          <v-icon size="12">mdi-alert-circle-outline</v-icon>
          <span>Overdue balances</span>
        </div>
      </div>

      <!-- Households -->
      <div class="stat-card">
        <div class="stat-top">
          <div class="stat-icon stat-icon-blue">
            <v-icon size="20" color="white">mdi-home-city</v-icon>
          </div>
        </div>
        <div class="stat-label">Total households</div>
        <div class="stat-value stat-value-plain">
          {{ numeral(totalResidence).format("0,0") }}
        </div>
        <div class="stat-footer stat-footer-muted">
          <span>{{ totalActiveResidence || 0 }} active</span>
        </div>
      </div>

      <!-- Officials -->
      <div class="stat-card">
        <div class="stat-top">
          <div class="stat-icon stat-icon-amber">
            <v-icon size="20" color="white">mdi-shield-account</v-icon>
          </div>
        </div>
        <div class="stat-label">Estate officials</div>
        <div class="stat-value stat-value-plain">
          {{ numeral(officials.length).format("0,0") }}
        </div>
        <div class="stat-footer stat-footer-muted">
          <span>Chairman, Secretary, Treasurer</span>
        </div>
      </div>
    </div>

    <!-- ============================================================
         CHART + RECENT PAYMENTS
         ============================================================ -->
    <div class="two-col-grid">
      <!-- Chart -->
      <div class="card">
        <div class="card-head">
          <div>
            <div class="card-title">Payments by month</div>
            <div class="card-sub">Monthly collection trend for this year</div>
          </div>
        </div>
        <div class="chart-wrap">
          <MyBarChart :estateId="estateId" />
        </div>
      </div>

      <!-- Recent payments -->
      <div class="card">
        <div class="card-head">
          <div>
            <div class="card-title">Recent payments</div>
            <div class="card-sub">Latest transactions on this estate</div>
          </div>
          <v-chip small label color="#f3eeff" class="chip-purple">
            {{ paymentsReceipt.length }}
          </v-chip>
        </div>
        <div class="table-wrap">
          <v-data-table
            :headers="headers_recent"
            :items="paymentsReceipt"
            :items-per-page="5"
            class="elevation-0 custom-table"
            no-data-text="No payments yet"
          >
            <template #item.amount_paid="{ item }">
              <span class="amount-cell">
                KSh {{ numeral(item.amount_paid || 0).format("0,0") }}
              </span>
            </template>
            <template #item.payment_status="{ item }">
              <v-chip
                x-small
                label
                :color="item.payment_status === 'Completed' ? '#d1fae5' : '#fef3c7'"
                :style="item.payment_status === 'Completed' ? 'color:#065f46;' : 'color:#92400e;'"
                class="font-weight-bold"
              >
                {{ item.payment_status || "Pending" }}
              </v-chip>
            </template>
          </v-data-table>
        </div>
      </div>
    </div>

    <!-- ============================================================
         HOUSEHOLDS + ADDRESSES
         ============================================================ -->
    <div class="two-col-grid">
      <!-- Households -->
      <div class="card">
        <div class="card-head">
          <div>
            <div class="card-title">Households</div>
            <div class="card-sub">{{ houseHolds.length }} registered</div>
          </div>
          <v-chip small label color="#f3eeff" class="chip-purple">
            {{ houseHolds.length }}
          </v-chip>
        </div>
        <div class="table-wrap">
          <v-data-table
            :headers="headers"
            :items="houseHolds"
            :items-per-page="5"
            class="elevation-0 custom-table"
            no-data-text="No households yet"
          >
            <template #item.primary_owner="{ item }">
              <div class="user-cell">
                <div class="user-avatar">
                  {{ (item.primary_owner || "?").substring(0, 2).toUpperCase() }}
                </div>
                <div>
                  <div class="user-name">{{ item.primary_owner }}</div>
                  <div class="user-meta">{{ item.contact_number }}</div>
                </div>
              </div>
            </template>
            <template #item.house_number="{ item }">
              <v-chip x-small label color="#f3f4f6">
                {{ item.house_number || "—" }}
              </v-chip>
            </template>
          </v-data-table>
        </div>
      </div>

      <!-- Addresses -->
      <div class="card">
        <div class="card-head">
          <div>
            <div class="card-title">Address summary</div>
            <div class="card-sub">Breakdown by {{ label.toLowerCase() }}</div>
          </div>
          <button class="card-action" @click="Fetch_EstateAddress">
            <v-icon size="14">mdi-refresh</v-icon>
          </button>
        </div>

        <!-- Chips -->
        <div class="address-tabs">
          <button
            v-if="show_section"
            class="address-tab"
            :class="{ 'address-tab-active': label === 'Section' }"
            @click="label = 'Section'; Fetch_EstateAddress()"
          >
            Section
          </button>
          <button
            v-if="show_street"
            class="address-tab"
            :class="{ 'address-tab-active': label === 'Street' }"
            @click="label = 'Street'; Fetch_EstateAddress()"
          >
            Street
          </button>
          <button
            v-if="show_court"
            class="address-tab"
            :class="{ 'address-tab-active': label === 'Court' }"
            @click="label = 'Court'; Fetch_EstateAddress()"
          >
            Court
          </button>
        </div>

        <div class="table-wrap">
          <v-data-table
            :headers="headers_config"
            :items="addressEstate"
            :items-per-page="5"
            class="elevation-0 custom-table"
            no-data-text="No addresses yet"
          >
            <template #item.total_paid="{ item }">
              <span class="amount-cell">
                KSh {{ numeral(item.total_paid || 0).format("0,0") }}
              </span>
            </template>
            <template #item.arrears="{ item }">
              <span
                :class="Number(item.arrears) > 0 ? 'text-red' : 'text-green'"
                class="amount-cell"
              >
                KSh {{ numeral(Math.abs(item.arrears || 0)).format("0,0") }}
              </span>
            </template>
          </v-data-table>
        </div>
      </div>
    </div>

    <!-- ============================================================
         OFFICIALS + MAP
         ============================================================ -->
    <div class="two-col-grid">
      <!-- Officials -->
      <div class="card">
        <div class="card-head">
          <div>
            <div class="card-title">Estate officials</div>
            <div class="card-sub">People managing this estate</div>
          </div>
          <v-chip small label color="#f3eeff" class="chip-purple">
            {{ officials.length }}
          </v-chip>
        </div>
        <div class="table-wrap">
          <v-data-table
            :headers="headers_of"
            :items="officials"
            :items-per-page="5"
            class="elevation-0 custom-table"
            no-data-text="No officials yet"
          >
            <template #item.full_name="{ item }">
              <div class="user-cell">
                <div class="user-avatar user-avatar-green">
                  {{ (item.full_name || "?").substring(0, 2).toUpperCase() }}
                </div>
                <div>
                  <div class="user-name">{{ item.full_name }}</div>
                  <div class="user-meta">{{ item.role }}</div>
                </div>
              </div>
            </template>
            <template #item.role="{ item }">
              <v-chip x-small label color="#d1fae5" style="color:#065f46;">
                {{ item.role }}
              </v-chip>
            </template>
          </v-data-table>
        </div>
      </div>

      <!-- Map -->
      <div class="card">
        <div class="card-head">
          <div>
            <div class="card-title">Estate location</div>
            <div class="card-sub">Map preview</div>
          </div>
        </div>
        <div class="map-wrap">
          <Map />
        </div>
      </div>
    </div>

    <!-- ============================================================
         PAYMENT SUMMARY
         ============================================================ -->
    <div class="card">
      <div class="card-head">
        <div>
          <div class="card-title">Full payment summary</div>
          <div class="card-sub">Month-by-month breakdown per household</div>
        </div>
      </div>
      <paymentSummary :estateId="estateId" />
    </div>

    <!-- ============================================================
         ADD ADDRESS DIALOG
         ============================================================ -->
    <v-dialog v-model="dialogAddress" max-width="560" content-class="app-dialog">
      <div class="dialog-shell">
        <div class="dialog-header">
          <div class="dialog-header-icon">
            <v-icon color="white" size="20">mdi-map-marker-plus</v-icon>
          </div>
          <div class="flex-grow-1">
            <div class="dialog-title">Add address</div>
            <div class="dialog-sub">Extend your estate's address structure</div>
          </div>
          <button class="dialog-close" @click="dialogAddress = false">
            <v-icon size="18" color="white">mdi-close</v-icon>
          </button>
        </div>

        <div class="dialog-body">
          <div v-show="show_section" class="add-row">
            <v-text-field
              v-model="estateSections_input"
              label="Section name"
              dense
              outlined
              rounded
              hide-details
              placeholder="e.g. West Wing"
            ></v-text-field>
            <v-btn
              rounded
              depressed
              color="#7c3aed"
              dark
              class="add-btn"
              :loading="addingSection"
              @click="UploadEstatSection"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </div>

          <div v-show="show_street" class="add-row">
            <v-text-field
              v-model="estateStreet_input"
              label="Street name"
              dense
              outlined
              rounded
              hide-details
              placeholder="e.g. Acacia Road"
            ></v-text-field>
            <v-btn
              rounded
              depressed
              color="#7c3aed"
              dark
              class="add-btn"
              :loading="addingStreet"
              @click="UploadEstateStreet"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </div>

          <div v-show="show_court" class="add-row">
            <v-text-field
              v-model="estateCourts_input"
              label="Court name"
              dense
              outlined
              rounded
              hide-details
              placeholder="e.g. Lake Court"
            ></v-text-field>
            <v-btn
              rounded
              depressed
              color="#7c3aed"
              dark
              class="add-btn"
              :loading="addingCourt"
              @click="UploadEstateCourt"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </div>
        </div>

        <div class="dialog-footer">
          <v-btn
            block
            rounded
            text
            class="text-capitalize"
            @click="dialogAddress = false"
          >
            Close
          </v-btn>
        </div>
      </div>
    </v-dialog>

    <!-- Snackbars -->
    <v-snackbar v-model="snackbar_s" color="#7c3aed" :timeout="3000" top rounded="pill">
      {{ snackbarText_s }}
    </v-snackbar>
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
import MyBarChart from "@/components/charts/barChartPayment";
import axios from "axios";
import numeral from "numeral";
import Map from "@/components/map.vue";
import paymentSummary from "@/components/paymentSummary.vue";

const API = "https://makaaziserver22.up.railway.app/api";

export default {
  name: "EstateDashboard",
  props: {
    estateId: { type: Number, required: true },
  },
  components: {
    Map,
    paymentSummary,
    MyBarChart,
  },

  data() {
    return {
      numeral,

      // Summary
      estate_name: "",
      totalPayment: 0,
      totalPendingPayment: 0,
      totalResidence: 0,
      totalActiveResidence: 0,

      // Data
      payments: [],
      paymentsReceipt: [],
      houseHolds: [],
      officials: [],
      addressEstate: [],

      // Address
      label: "Section",
      show_section: false,
      show_street: false,
      show_court: false,
      config: null,
      dialogAddress: false,
      estateSections_input: null,
      estateStreet_input: null,
      estateCourts_input: null,

      // Action loading
      refreshing: false,
      addingSection: false,
      addingStreet: false,
      addingCourt: false,

      // Headers
      headers: [
        { text: "Owner", value: "primary_owner", width: "auto" },
        { text: "House #", value: "house_number", align: "right" },
        { text: "Court", value: "court", align: "right" },
        { text: "Section", value: "section", align: "right" },
      ],
      headers_config: [
        { text: "Name", value: "name" },
        { text: "Households", value: "households", align: "right" },
        { text: "Total paid", value: "total_paid", align: "right" },
        { text: "Arrears", value: "arrears", align: "right" },
      ],
      headers_of: [
        { text: "Official", value: "full_name" },
        { text: "Role", value: "role", align: "right" },
        { text: "Phone", value: "contact_number", align: "right" },
      ],
      headers_recent: [
        { text: "Method", value: "payment_method" },
        { text: "Receipt", value: "transaction_id" },
        { text: "Status", value: "payment_status", align: "right" },
        { text: "Amount", value: "amount_paid", align: "right" },
      ],

      // Snackbars
      snackbar_s: false,
      snackbarText_s: "",
      snackbar: false,
      snackbarText: "",
      snackbar2: false,
      snackbarText2: "",
    };
  },

  mounted() {
    this.refreshAll();
  },

  methods: {
    async refreshAll() {
      this.refreshing = true;
      await Promise.allSettled([
        this.fetchEstate(),
        this.fetchHouseholds(),
        this.fetchPayments(),
        this.fetchPaymentsReceipt(),
        this.fetchOfficials(),
        this.fetchEstateConfig(),
        this.fetchEstateAddress(),
        this.fetchActiveHouseholds(),
      ]);
      this.refreshing = false;
    },

    // =========================================================
    async fetchEstate() {
      try {
        const { data } = await axios.get(`${API}/estates/estate/${this.estateId}`);
        if (data) this.estate_name = data.estate_name || "";
      } catch (err) {
        console.warn("Estate fetch failed:", err.message);
      }
    },

    async fetchHouseholds() {
      try {
        const { data } = await axios.get(
          `${API}/households/getBHsHldEstId/${this.estateId}`
        );
        this.houseHolds = Array.isArray(data) ? data : [];
        this.totalResidence = this.houseHolds.length;
      } catch (err) {
        console.warn("Households fetch failed:", err.message);
      }
    },

    async fetchActiveHouseholds() {
      try {
        const { data } = await axios.get(
          `${API}/households/getActiveHouseHolds/0/${this.estateId}`
        );
        this.totalActiveResidence = Array.isArray(data) ? data.length : 0;
      } catch (err) {
        console.warn("Active households fetch failed:", err.message);
      }
    },

    async fetchPayments() {
      try {
        const { data } = await axios.get(
          `${API}/household-payments/year-by-estate/${this.estateId}`
        );
        this.payments = Array.isArray(data) ? data : [];
        this.totalPendingPayment = this.payments.reduce(
          (sum, row) => sum + Number(row.overdue || 0),
          0
        );
      } catch (err) {
        console.warn("Payments fetch failed:", err.message);
      }
    },

    async fetchPaymentsReceipt() {
      try {
        const { data } = await axios.get(
          `${API}/payments/getByEstateId/${this.estateId}`
        );
        this.paymentsReceipt = Array.isArray(data) ? data : [];
        this.totalPayment = this.paymentsReceipt.reduce(
          (sum, row) => sum + Number(row.amount_paid || 0),
          0
        );
      } catch (err) {
        console.warn("Payments receipts fetch failed:", err.message);
      }
    },

    async fetchOfficials() {
      try {
        const { data } = await axios.get(
          `${API}/officials/getOfficialByEstateId/${this.estateId}`
        );
        this.officials = Array.isArray(data) ? data : [];
      } catch (err) {
        console.warn("Officials fetch failed:", err.message);
      }
    },

    async fetchEstateConfig() {
      try {
        const { data } = await axios.get(
          `${API}/estates-config/config/${this.estateId}`
        );
        if (data) {
          this.config = data;
          this.show_section = data.show_section === 1 || data.show_section === true;
          this.show_street = data.show_street === 1 || data.show_street === true;
          this.show_court = data.show_court === 1 || data.show_court === true;
        }
      } catch (err) {
        console.warn("Estate config fetch failed:", err.message);
      }
    },

    async fetchEstateAddress() {
      try {
        const { data } = await axios.get(
          `${API}/officials/address-summary?estate_id=${this.estateId}&type=${this.label.toLowerCase()}`
        );
        this.addressEstate = Array.isArray(data) ? data : [];
      } catch (err) {
        console.warn("Address summary fetch failed:", err.message);
        this.addressEstate = [];
      }
    },

    // =========================================================
    // Add address
    // =========================================================
    async UploadEstatSection() {
      if (!this.estateSections_input) return;
      this.addingSection = true;
      try {
        await axios.post(`${API}/estates-config/add-section`, {
          estate_id: this.estateId,
          section_name: this.estateSections_input,
        });
        this.showSuccess("Section added");
        this.estateSections_input = null;
        this.fetchEstateAddress();
      } catch (err) {
        this.showError(err.response?.data?.error || "Could not add section");
      } finally {
        this.addingSection = false;
      }
    },

    async UploadEstateStreet() {
      if (!this.estateStreet_input) return;
      this.addingStreet = true;
      try {
        await axios.post(`${API}/estates-config/add-street`, {
          estate_id: this.estateId,
          street_name: this.estateStreet_input,
        });
        this.showSuccess("Street added");
        this.estateStreet_input = null;
        this.fetchEstateAddress();
      } catch (err) {
        this.showError(err.response?.data?.error || "Could not add street");
      } finally {
        this.addingStreet = false;
      }
    },

    async UploadEstateCourt() {
      if (!this.estateCourts_input) return;
      this.addingCourt = true;
      try {
        await axios.post(`${API}/estates-config/add-court`, {
          estate_id: this.estateId,
          court_name: this.estateCourts_input,
        });
        this.showSuccess("Court added");
        this.estateCourts_input = null;
        this.fetchEstateAddress();
      } catch (err) {
        this.showError(err.response?.data?.error || "Could not add court");
      } finally {
        this.addingCourt = false;
      }
    },

    // =========================================================
    // Legacy aliases (kept so nothing else breaks)
    // =========================================================
    Fetch_AllPayments() { return this.fetchPayments(); },
    Fetch_AllOfficials() { return this.fetchHouseholds(); },
    Fetch_PostAllEstates() { return this.fetchEstate(); },
    Fetch_EstateReceipt() { return this.fetchPaymentsReceipt(); },
    Fetch_AllOfficials2() { return this.fetchOfficials(); },
    Fetch_EstateConfig() { return this.fetchEstateConfig(); },
    Fetch_EstateAddress() { return this.fetchEstateAddress(); },
    Fetch_ActiveHouseholds() { return this.fetchActiveHouseholds(); },

    // =========================================================
    // Helpers
    // =========================================================
    showSuccess(msg) {
      this.snackbar = true;
      this.snackbarText = msg;
    },
    showError(msg) {
      this.snackbar2 = true;
      this.snackbarText2 = msg;
    },
    formatCurrency(val) {
      return Number(val || 0).toLocaleString(undefined, {
        minimumFractionDigits: 0,
      });
    },
  },
};
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1400px;
}

/* ============================================================
   QUICK BAR
   ============================================================ */
.quick-bar {
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
}

.quick-right {
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

.quick-btn-primary {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  border-color: transparent;
  color: white;
  box-shadow: 0 6px 16px -6px rgba(124, 58, 237, 0.6);
}

.quick-btn-primary:hover:not(:disabled) {
  color: white;
  box-shadow: 0 10px 22px -6px rgba(124, 58, 237, 0.8);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ============================================================
   STAT CARDS
   ============================================================ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 16px;
}

.stat-card {
  position: relative;
  padding: 20px;
  background: white;
  border: 1px solid #e9e7f2;
  border-radius: 18px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 36px -16px rgba(30, 27, 75, 0.15);
}

.stat-card-dark {
  background: linear-gradient(135deg, #1e1b4b, #2d2a5e);
  border-color: transparent;
  color: white;
}

.stat-card-dark .stat-label,
.stat-card-dark .stat-footer {
  color: rgba(255, 255, 255, 0.7);
}

.stat-card-dark .stat-value {
  color: white;
}

.stat-card-dark .stat-currency {
  color: #c4b5fd;
}

.stat-card-purple {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  border-color: transparent;
  color: white;
}

.stat-card-purple .stat-label,
.stat-card-purple .stat-footer {
  color: rgba(255, 255, 255, 0.75);
}

.stat-card-purple .stat-value {
  color: white;
}

.stat-card-purple .stat-currency {
  color: rgba(255, 255, 255, 0.75);
}

.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-green {
  background: linear-gradient(135deg, #059669, #10b981);
}

.stat-icon-purple-light {
  background: rgba(255, 255, 255, 0.2);
}

.stat-icon-blue {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
}

.stat-icon-amber {
  background: linear-gradient(135deg, #d97706, #f59e0b);
}

.stat-refresh {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.stat-refresh:hover {
  background: rgba(255, 255, 255, 0.2);
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #7c7a95;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -1px;
  margin-top: 6px;
  line-height: 1.1;
}

.stat-value-plain {
  font-size: 2rem;
}

.stat-currency {
  font-size: 0.95rem;
  font-weight: 700;
  color: #7c3aed;
  margin-right: 4px;
}

.stat-footer {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  color: #10b981;
  margin-top: 10px;
  font-weight: 600;
}

.stat-footer-muted {
  color: #9ca3af;
}

/* ============================================================
   GRIDS
   ============================================================ */
.two-col-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 1023px) {
  .two-col-grid {
    grid-template-columns: 1fr;
  }
}

/* ============================================================
   CARD
   ============================================================ */
.card {
  background: white;
  border-radius: 18px;
  border: 1px solid #e9e7f2;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 2px rgba(30, 27, 75, 0.03);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-title {
  font-size: 0.98rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -0.2px;
}

.card-sub {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 2px;
}

.chip-purple {
  color: #7c3aed !important;
  font-weight: 800 !important;
}

.card-action {
  width: 32px;
  height: 32px;
  background: #f9f6ff;
  border: 1px solid #e9e0ff;
  border-radius: 9px;
  color: #7c3aed;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.card-action:hover {
  background: #f3eeff;
}

/* ============================================================
   CHART
   ============================================================ */
.chart-wrap {
  min-height: 260px;
}

/* ============================================================
   TABLE
   ============================================================ */
.table-wrap {
  flex: 1;
  overflow: hidden;
  border-radius: 12px;
}

.custom-table ::v-deep .v-data-table__wrapper {
  overflow-x: auto;
}

.custom-table ::v-deep thead th {
  font-size: 0.72rem !important;
  font-weight: 700 !important;
  color: #7c7a95 !important;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: #fafaff !important;
  border-bottom: 1px solid #e9e7f2 !important;
}

.custom-table ::v-deep tbody tr:hover {
  background: #fafaff !important;
}

.custom-table ::v-deep td {
  font-size: 0.82rem !important;
  color: #4b5563;
  border-bottom: 1px solid #f3f4f6 !important;
  padding: 12px 16px !important;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  font-size: 0.68rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.5px;
}

.user-avatar-green {
  background: linear-gradient(135deg, #059669, #10b981);
}

.user-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #1e1b4b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-meta {
  font-size: 0.7rem;
  color: #9ca3af;
  margin-top: 1px;
}

.amount-cell {
  font-weight: 700;
  color: #1e1b4b;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.8rem;
}

.text-red {
  color: #ef4444 !important;
}

.text-green {
  color: #10b981 !important;
}

/* ============================================================
   ADDRESS TABS
   ============================================================ */
.address-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  padding: 4px;
  background: #fafaff;
  border: 1px solid #e9e7f2;
  border-radius: 11px;
}

.address-tab {
  flex: 1;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #7c7a95;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.address-tab:hover {
  color: #7c3aed;
}

.address-tab-active {
  background: white;
  color: #7c3aed;
  box-shadow: 0 2px 6px -2px rgba(124, 58, 237, 0.2);
}

/* ============================================================
   MAP
   ============================================================ */
.map-wrap {
  min-height: 280px;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f4f6;
}

/* ============================================================
   DIALOG
   ============================================================ */
::v-deep .app-dialog {
  overflow: hidden !important;
  border-radius: 22px !important;
  margin: 16px auto !important;
  max-width: 560px !important;
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
  background: radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.18), transparent 50%);
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

.dialog-close:hover {
  background: rgba(255, 255, 255, 0.28);
}

.dialog-body {
  padding: 22px 24px;
  overflow-y: auto;
  min-height: 0;
  flex: 1 1 auto;
}

.dialog-footer {
  padding: 12px 20px 16px;
  border-top: 1px solid #f3f4f6;
  background: white;
  flex-shrink: 0;
}

.add-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 14px;
}

.add-row > :first-child {
  flex: 1;
}

.add-btn {
  min-width: 46px !important;
  height: 40px !important;
}

::v-deep .theme--light.v-text-field--outlined fieldset {
  border-radius: 12px !important;
  border-color: #e9e7f2 !important;
}

::v-deep .theme--light.v-text-field--outlined.v-input--is-focused fieldset {
  border-color: #7c3aed !important;
  border-width: 2px !important;
}

/* ============================================================
   Responsive
   ============================================================ */
@media (max-width: 599px) {
  .stat-value {
    font-size: 1.4rem;
  }
  .stat-value-plain {
    font-size: 1.6rem;
  }
  .quick-bar {
    gap: 12px;
  }
  .quick-right {
    width: 100%;
  }
  .quick-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>