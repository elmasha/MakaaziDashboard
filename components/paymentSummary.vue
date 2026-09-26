<template>
  <div class="summary-page">
    <!-- ============================================================
         HEADER
         ============================================================ -->
    <div class="summary-header">
      <div>
        <h2 class="summary-title">Payment summary</h2>
        <p class="summary-sub">
          {{ paymentData.length }} {{ paymentData.length === 1 ? "household" : "households" }}
          · {{ currentYear }}
        </p>
      </div>
      <div class="header-actions">
        <button class="quick-btn" @click="refresh" :disabled="loading">
          <v-icon size="16" :class="{ spinning: loading }">mdi-refresh</v-icon>
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- ============================================================
         TOTALS STRIP
         ============================================================ -->
    <div v-if="paymentData.length" class="totals-strip">
      <div class="total-card">
        <div class="total-icon total-icon-green">
          <v-icon size="16" color="white">mdi-cash-check</v-icon>
        </div>
        <div>
          <div class="total-label">Total collected</div>
          <div class="total-value">
            KSh {{ numeral(totals.total_paid).format("0,0") }}
          </div>
        </div>
      </div>

      <div class="total-card">
        <div class="total-icon total-icon-purple">
          <v-icon size="16" color="white">mdi-target</v-icon>
        </div>
        <div>
          <div class="total-label">Due YTD</div>
          <div class="total-value">
            KSh {{ numeral(totals.due_year_to_date).format("0,0") }}
          </div>
        </div>
      </div>

      <div class="total-card">
        <div
          class="total-icon"
          :class="totals.overdue > 0 ? 'total-icon-red' : 'total-icon-green'"
        >
          <v-icon size="16" color="white">
            {{ totals.overdue > 0 ? "mdi-alert-circle" : "mdi-check-circle" }}
          </v-icon>
        </div>
        <div>
          <div class="total-label">
            {{ totals.overdue > 0 ? "Total arrears" : "Total prepaid" }}
          </div>
          <div
            class="total-value"
            :class="totals.overdue > 0 ? 'text-red' : 'text-green'"
          >
            KSh {{ numeral(Math.abs(totals.overdue)).format("0,0") }}
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================
         LOADING
         ============================================================ -->
    <div v-if="loading && !paymentData.length" class="loading-state">
      <v-skeleton-loader type="table-heading, table-thead, table-tbody" />
    </div>

    <!-- ============================================================
         EMPTY
         ============================================================ -->
    <div v-else-if="!paymentData.length" class="empty-state">
      <div class="empty-icon">
        <v-icon size="42" color="#cbd5e1">mdi-table-off</v-icon>
      </div>
      <div class="empty-title">No payment data yet</div>
      <div class="empty-text">
        Once households start paying service charges, their month-by-month record will appear here.
      </div>
    </div>

    <!-- ============================================================
         TABLE
         ============================================================ -->
    <div v-else class="table-wrap">
      <div class="table-scroll">
        <table class="summary-table">
          <thead>
            <tr>
              <th class="th-sticky th-sticky-left th-num">#</th>
              <th class="th-sticky th-sticky-left-2 th-name">Household</th>
              <th class="th-num">B/F</th>
              <th
                v-for="m in months"
                :key="m.key"
                class="th-num"
                :class="{ 'th-past': isPastMonth(m.month) }"
              >
                {{ m.label }}
              </th>
              <th class="th-num th-total">Total paid</th>
              <th class="th-num">Due YTD</th>
              <th class="th-num">Over/Pre</th>
              <th class="th-num">Mo. Eq.</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in paymentData" :key="row.id || i">
              <!-- # -->
              <td class="td-sticky td-sticky-left td-num">{{ i + 1 }}</td>

              <!-- Name -->
              <td class="td-sticky td-sticky-left-2 td-name">
                <div class="name-cell">
                  <div class="name-avatar">
                    {{ initialsOf(row.name) }}
                  </div>
                  <div class="name-text">
                    <div class="name-line">{{ row.name || "—" }}</div>
                    <div
                      class="status-line"
                      :class="statusClass(row.overdue)"
                    >
                      {{ statusText(row) }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- B/F -->
              <td
                class="td-num td-bf"
                :class="Number(row.balance_bf) < 0 ? 'text-red' : ''"
              >
                {{ formatCell(row.balance_bf) }}
              </td>

              <!-- Months -->
              <td
                v-for="m in months"
                :key="m.key"
                class="td-num td-month"
                :class="{
                  'td-past': isPastMonth(m.month),
                  'td-paid': Number(row[m.key]) > 0,
                  'td-empty': !Number(row[m.key]),
                }"
              >
                <span v-if="Number(row[m.key])" class="month-amount">
                  {{ formatCell(row[m.key]) }}
                </span>
                <span v-else class="month-dash">—</span>
              </td>

              <!-- Total paid -->
              <td class="td-num td-total">
                <span class="amount-strong">
                  {{ formatCell(row.total_paid) }}
                </span>
              </td>

              <!-- Due YTD -->
              <td class="td-num">
                {{ formatCell(row.due_year_to_date) }}
              </td>

              <!-- Overdue / prepaid -->
              <td
                class="td-num"
                :class="Number(row.overdue) > 0 ? 'text-red' : 'text-green'"
              >
                <span class="amount-strong">
                  {{
                    Number(row.overdue) > 0
                      ? `(${formatCell(row.overdue)})`
                      : formatCell(Math.abs(row.overdue || 0))
                  }}
                </span>
              </td>

              <!-- Months equivalent -->
              <td class="td-num">
                <span class="mo-eq">
                  {{ Number(row.months_equivalent || 0).toFixed(1) }}
                </span>
              </td>
            </tr>
          </tbody>

          <!-- Footer totals row -->
          <tfoot>
            <tr class="tfoot-row">
              <td class="td-sticky td-sticky-left td-num"></td>
              <td class="td-sticky td-sticky-left-2 td-name">
                <span class="tfoot-label">TOTALS</span>
              </td>
              <td class="td-num tfoot-cell">
                {{ formatCell(totals.balance_bf) }}
              </td>
              <td
                v-for="m in months"
                :key="`t-${m.key}`"
                class="td-num tfoot-cell"
              >
                {{ formatCell(totals[m.key]) }}
              </td>
              <td class="td-num tfoot-cell tfoot-strong">
                {{ formatCell(totals.total_paid) }}
              </td>
              <td class="td-num tfoot-cell">
                {{ formatCell(totals.due_year_to_date) }}
              </td>
              <td
                class="td-num tfoot-cell tfoot-strong"
                :class="totals.overdue > 0 ? 'text-red' : 'text-green'"
              >
                {{
                  totals.overdue > 0
                    ? `(${formatCell(totals.overdue)})`
                    : formatCell(Math.abs(totals.overdue))
                }}
              </td>
              <td class="td-num tfoot-cell">
                {{ totals.months_equivalent.toFixed(1) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import numeral from "numeral";

const API = "https://makaaziserver22.up.railway.app/api";

export default {
  name: "PaymentSummary",
  props: {
    estateId: { type: Number, required: true },
  },
  data() {
    return {
      numeral,
      loading: false,
      paymentData: [],

      months: [
        { key: "january", label: "Jan", month: 1 },
        { key: "february", label: "Feb", month: 2 },
        { key: "march", label: "Mar", month: 3 },
        { key: "april", label: "Apr", month: 4 },
        { key: "may", label: "May", month: 5 },
        { key: "june", label: "Jun", month: 6 },
        { key: "july", label: "Jul", month: 7 },
        { key: "august", label: "Aug", month: 8 },
        { key: "september", label: "Sep", month: 9 },
        { key: "october", label: "Oct", month: 10 },
        { key: "november", label: "Nov", month: 11 },
        { key: "december", label: "Dec", month: 12 },
      ],
    };
  },
  computed: {
    currentYear() {
      return new Date().getFullYear();
    },
    currentMonth() {
      return new Date().getMonth() + 1;
    },

    totals() {
      const t = {
        balance_bf: 0,
        total_paid: 0,
        due_year_to_date: 0,
        overdue: 0,
        months_equivalent: 0,
      };
      this.months.forEach((m) => (t[m.key] = 0));

      for (const row of this.paymentData) {
        t.balance_bf += Number(row.balance_bf || 0);
        t.total_paid += Number(row.total_paid || 0);
        t.due_year_to_date += Number(row.due_year_to_date || 0);
        t.overdue += Number(row.overdue || 0);
        t.months_equivalent += Number(row.months_equivalent || 0);
        this.months.forEach((m) => {
          t[m.key] += Number(row[m.key] || 0);
        });
      }
      return t;
    },
  },
  mounted() {
    this.refresh();
  },
  methods: {
    async refresh() {
      if (!this.estateId) return;
      this.loading = true;
      try {
        const { data, status } = await axios.get(
          `${API}/household-payments/year-by-estate/${this.estateId}`
        );
        if (status === 200) {
          this.paymentData = Array.isArray(data) ? data : [];
        }
      } catch (err) {
        console.error("Payment summary fetch failed:", err.message);
        this.paymentData = [];
      } finally {
        this.loading = false;
      }
    },

    // =========================================================
    // FORMATTING
    // =========================================================
    formatCell(val) {
      const n = Number(val || 0);
      if (!n) return "—";
      return numeral(n).format("0,0");
    },

    initialsOf(name) {
      if (!name) return "?";
      return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
    },

    isPastMonth(monthNumber) {
      return monthNumber <= this.currentMonth;
    },

    statusText(row) {
      const overdue = Number(row.overdue || 0);
      if (overdue > 0) return "Overdue";
      if (overdue < 0) return "Prepaid";
      return "On track";
    },

    statusClass(overdue) {
      const n = Number(overdue || 0);
      if (n > 0) return "status-red";
      if (n < 0) return "status-green";
      return "status-grey";
    },
  },
};
</script>

<style scoped>
/* ============================================================
   ROOT
   ============================================================ */
.summary-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ============================================================
   HEADER
   ============================================================ */
.summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.summary-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -0.3px;
  margin: 0;
}

.summary-sub {
  font-size: 0.78rem;
  color: #7c7a95;
  margin: 4px 0 0;
}

.header-actions {
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

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ============================================================
   TOTALS STRIP
   ============================================================ */
.totals-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.total-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: white;
  border: 1px solid #e9e7f2;
  border-radius: 14px;
}

.total-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.total-icon-green {
  background: linear-gradient(135deg, #059669, #10b981);
}

.total-icon-purple {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
}

.total-icon-red {
  background: linear-gradient(135deg, #dc2626, #ef4444);
}

.total-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #7c7a95;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.total-value {
  font-size: 1rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -0.3px;
  margin-top: 2px;
}

.text-red {
  color: #ef4444 !important;
}

.text-green {
  color: #10b981 !important;
}

/* ============================================================
   TABLE
   ============================================================ */
.table-wrap {
  background: white;
  border: 1px solid #e9e7f2;
  border-radius: 16px;
  overflow: hidden;
}

.table-scroll {
  overflow-x: auto;
  overflow-y: visible;
  max-width: 100%;
  scrollbar-width: thin;
  scrollbar-color: #e5e3f0 transparent;
}

.table-scroll::-webkit-scrollbar {
  height: 8px;
}

.table-scroll::-webkit-scrollbar-track {
  background: #fafaff;
}

.table-scroll::-webkit-scrollbar-thumb {
  background: #e5e3f0;
  border-radius: 4px;
}

.table-scroll::-webkit-scrollbar-thumb:hover {
  background: #c7b8ff;
}

.summary-table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  font-size: 0.82rem;
  min-width: 1400px;
}

/* ============================================================
   HEADER
   ============================================================ */
.summary-table thead th {
  position: sticky;
  top: 0;
  background: #fafaff;
  color: #7c7a95;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 10px;
  border-bottom: 1px solid #e9e7f2;
  white-space: nowrap;
  z-index: 2;
}

.th-num {
  text-align: right;
}

.th-name {
  text-align: left;
  min-width: 200px;
}

.th-total {
  color: #7c3aed;
}

.th-past {
  color: #1e1b4b;
}

/* Sticky left columns */
.th-sticky,
.td-sticky {
  position: sticky;
  background: white;
  z-index: 3;
}

.th-sticky {
  background: #fafaff;
  z-index: 4;
}

.th-sticky-left,
.td-sticky-left {
  left: 0;
  width: 44px;
  min-width: 44px;
}

.th-sticky-left-2,
.td-sticky-left-2 {
  left: 44px;
  box-shadow: 1px 0 0 #e9e7f2;
}

/* ============================================================
   BODY
   ============================================================ */
.summary-table tbody td {
  padding: 12px 10px;
  border-bottom: 1px solid #f3f4f6;
  color: #4b5563;
  white-space: nowrap;
}

.summary-table tbody tr:hover td {
  background: #fafaff;
}

.summary-table tbody tr:hover .td-sticky {
  background: #fafaff;
}

.td-num {
  text-align: right;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.8rem;
}

.td-name {
  text-align: left;
  font-family: inherit;
}

/* Sticky cells in body */
.td-sticky {
  background: white;
}

.td-sticky-left {
  color: #9ca3af;
  font-weight: 600;
  font-family: inherit;
}

/* Name cell */
.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.name-avatar {
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

.name-text {
  min-width: 0;
}

.name-line {
  font-size: 0.82rem;
  font-weight: 700;
  color: #1e1b4b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.status-line {
  font-size: 0.68rem;
  font-weight: 700;
  margin-top: 2px;
}

.status-red {
  color: #ef4444;
}

.status-green {
  color: #10b981;
}

.status-grey {
  color: #9ca3af;
}

/* B/F column */
.td-bf {
  color: #7c7a95;
}

/* Month cells */
.td-month {
  font-weight: 600;
}

.td-past {
  background: rgba(250, 248, 255, 0.5);
}

.td-paid {
  color: #1e1b4b;
  font-weight: 700;
}

.td-empty {
  color: #cbd5e1;
}

.month-dash {
  opacity: 0.4;
}

.month-amount {
  font-family: ui-monospace, SFMono-Regular, monospace;
}

/* Total paid */
.td-total {
  background: #faf8ff;
  border-left: 1px solid #e9e7f2;
}

.amount-strong {
  font-weight: 800;
  color: #1e1b4b;
}

/* Months equivalent */
.mo-eq {
  display: inline-block;
  padding: 3px 8px;
  background: #f3eeff;
  color: #7c3aed;
  font-size: 0.72rem;
  font-weight: 800;
  border-radius: 6px;
}

/* ============================================================
   FOOTER
   ============================================================ */
.summary-table tfoot td {
  padding: 14px 10px;
  background: #1e1b4b;
  color: white;
  font-weight: 700;
  border-top: 2px solid #7c3aed;
  position: sticky;
  bottom: 0;
  z-index: 2;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.78rem;
  white-space: nowrap;
}

.summary-table tfoot .td-sticky {
  background: #1e1b4b;
  color: white;
}

.tfoot-label {
  font-family: inherit;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #c4b5fd;
}

.tfoot-strong {
  color: #c4b5fd;
}

.tfoot-cell {
  color: rgba(255, 255, 255, 0.85);
}

.summary-table tfoot .text-red {
  color: #fca5a5 !important;
}

.summary-table tfoot .text-green {
  color: #6ee7b7 !important;
}

/* ============================================================
   EMPTY / LOADING
   ============================================================ */
.loading-state {
  background: white;
  border: 1px solid #e9e7f2;
  border-radius: 16px;
  padding: 12px;
}

.empty-state {
  padding: 60px 24px;
  text-align: center;
  background: white;
  border: 1px solid #e9e7f2;
  border-radius: 18px;
}

.empty-icon {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: #fafaff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.empty-title {
  font-size: 1rem;
  font-weight: 800;
  color: #1e1b4b;
}

.empty-text {
  font-size: 0.82rem;
  color: #9ca3af;
  margin-top: 6px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
}

/* ============================================================
   Responsive
   ============================================================ */
@media (max-width: 599px) {
  .totals-strip {
    grid-template-columns: 1fr;
  }
  .name-line {
    max-width: 120px;
  }
}
</style>