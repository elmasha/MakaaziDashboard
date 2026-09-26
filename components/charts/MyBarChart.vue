<template>
  <div class="chart-card">
    <!-- ============================================================
         HEADER
         ============================================================ -->
    <div class="chart-head">
      <div>
        <div class="chart-title">Payments by month</div>
        <div class="chart-sub">
          {{ selectedYear }} · {{ totalFormatted }} collected
        </div>
      </div>
      <div class="chart-controls">
        <select v-model="selectedYear" class="year-select" @change="refresh">
          <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
        </select>
        <button class="chart-btn" @click="refresh" :disabled="loading">
          <v-icon size="14" :class="{ spinning: loading }">mdi-refresh</v-icon>
        </button>
      </div>
    </div>

    <!-- ============================================================
         CHART
         ============================================================ -->
    <div class="chart-body">
      <!-- Loading -->
      <div v-if="loading && !hasData" class="chart-loader">
        <v-progress-circular indeterminate color="#7c3aed" size="32" width="3" />
      </div>

      <!-- Chart -->
      <BarChart
        v-show="hasData"
        class="chart-container"
        :chart-data="chartData"
        :options="chartOptions"
        ref="barChart"
      />

      <!-- Empty -->
      <div v-if="!loading && !hasData" class="chart-empty">
        <v-icon size="32" color="#cbd5e1">mdi-chart-bar</v-icon>
        <div class="chart-empty-text">No payment data for {{ selectedYear }}</div>
      </div>
    </div>

    <!-- ============================================================
         STATS FOOTER
         ============================================================ -->
    <div v-if="hasData" class="chart-stats">
      <div class="chart-stat">
        <div class="chart-stat-label">Peak month</div>
        <div class="chart-stat-value">{{ peakMonth.label }}</div>
      </div>
      <div class="chart-stat">
        <div class="chart-stat-label">Peak amount</div>
        <div class="chart-stat-value">KSh {{ peakMonth.valueFormatted }}</div>
      </div>
      <div class="chart-stat">
        <div class="chart-stat-label">Monthly average</div>
        <div class="chart-stat-value">KSh {{ averageFormatted }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { Bar } from "vue-chartjs";
import axios from "axios";
import numeral from "numeral";

const API = "https://makaaziserver22.up.railway.app/api";

export default {
  name: "PaymentsByMonthChart",
  props: {
    estateId: { type: Number, required: true },
  },
  components: {
    BarChart: {
      extends: Bar,
      props: ["chartData", "options"],
      mounted() {
        this.renderChart(this.chartData, this.options);
      },
      watch: {
        chartData: {
          deep: true,
          handler() {
            if (this.$data._chart) {
              this.$data._chart.destroy();
            }
            this.renderChart(this.chartData, this.options);
          },
        },
      },
    },
  },
  data() {
    return {
      loading: false,
      selectedYear: new Date().getFullYear(),
      yearOptions: [],

      months: [
        { key: "january", label: "Jan" },
        { key: "february", label: "Feb" },
        { key: "march", label: "Mar" },
        { key: "april", label: "Apr" },
        { key: "may", label: "May" },
        { key: "june", label: "Jun" },
        { key: "july", label: "Jul" },
        { key: "august", label: "Aug" },
        { key: "september", label: "Sep" },
        { key: "october", label: "Oct" },
        { key: "november", label: "Nov" },
        { key: "december", label: "Dec" },
      ],

      monthlyTotals: new Array(12).fill(0),
    };
  },
  computed: {
    totalAmount() {
      return this.monthlyTotals.reduce((a, b) => a + b, 0);
    },
    totalFormatted() {
      return "KSh " + numeral(this.totalAmount).format("0,0");
    },
    hasData() {
      return this.totalAmount > 0;
    },
    peakMonth() {
      let maxVal = 0;
      let maxIdx = 0;
      this.monthlyTotals.forEach((v, i) => {
        if (v > maxVal) {
          maxVal = v;
          maxIdx = i;
        }
      });
      return {
        label: this.months[maxIdx].label,
        value: maxVal,
        valueFormatted: numeral(maxVal).format("0,0"),
      };
    },
    averageFormatted() {
      const avg = this.totalAmount / 12;
      return numeral(avg).format("0,0");
    },
    chartData() {
      return {
        labels: this.months.map((m) => m.label),
        datasets: [
          {
            label: "Collected",
            backgroundColor: this.monthlyTotals.map((v) =>
              v > 0 ? "rgba(124, 58, 237, 0.85)" : "rgba(124, 58, 237, 0.15)"
            ),
            hoverBackgroundColor: this.monthlyTotals.map((v) =>
              v > 0 ? "rgba(124, 58, 237, 1)" : "rgba(124, 58, 237, 0.25)"
            ),
            borderColor: "#7c3aed",
            borderWidth: 0,
            borderRadius: 8,
            borderSkipped: false,
            data: this.monthlyTotals,
            barPercentage: 0.65,
            categoryPercentage: 0.85,
          },
        ],
      };
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        legend: { display: false },
        tooltips: {
          backgroundColor: "#1e1b4b",
          titleFontColor: "#fff",
          bodyFontColor: "#fff",
          cornerRadius: 8,
          xPadding: 12,
          yPadding: 10,
          displayColors: false,
          callbacks: {
            label: (item, data) => {
              const amount = data.datasets[0].data[item.index] || 0;
              return "KSh " + numeral(amount).format("0,0");
            },
          },
        },
        scales: {
          xAxes: [
            {
              gridLines: { display: false, drawBorder: false },
              ticks: {
                fontColor: "#9ca3af",
                fontSize: 11,
                fontStyle: "600",
                padding: 6,
              },
            },
          ],
          yAxes: [
            {
              gridLines: {
                color: "#f3f4f6",
                drawBorder: false,
                zeroLineColor: "#f3f4f6",
              },
              ticks: {
                fontColor: "#9ca3af",
                fontSize: 11,
                padding: 8,
                beginAtZero: true,
                callback: (value) => {
                  if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
                  if (value >= 1000) return (value / 1000).toFixed(0) + "k";
                  return value;
                },
              },
            },
          ],
        },
      };
    },
  },
  mounted() {
    const currentYear = new Date().getFullYear();
    this.yearOptions = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
    this.refresh();
  },
  methods: {
    async refresh() {
      if (!this.estateId) return;
      this.loading = true;
      try {
        const { data } = await axios.get(
          `${API}/household-payments/year-by-estate/${this.estateId}`
        );
        const list = Array.isArray(data) ? data : [];
        this.monthlyTotals = this.months.map((m) =>
          list.reduce((sum, row) => sum + Number(row[m.key] || 0), 0)
        );
      } catch (err) {
        console.warn("Payments chart fetch failed:", err.message);
        this.monthlyTotals = new Array(12).fill(0);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
/* ============================================================
   CARD
   ============================================================ */
.chart-card {
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid #e9e7f2;
  border-radius: 18px;
  padding: 20px;
  gap: 16px;
}

/* ============================================================
   HEADER
   ============================================================ */
.chart-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.chart-title {
  font-size: 0.98rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -0.2px;
}

.chart-sub {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 3px;
  font-weight: 500;
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.year-select {
  padding: 8px 12px;
  border: 1px solid #e9e7f2;
  border-radius: 10px;
  background: #fafaff;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  color: #4b5563;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
}

.year-select:hover,
.year-select:focus {
  border-color: #7c3aed;
  color: #7c3aed;
  background: white;
}

.chart-btn {
  width: 34px;
  height: 34px;
  border: 1px solid #e9e7f2;
  border-radius: 10px;
  background: #fafaff;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.chart-btn:hover:not(:disabled) {
  border-color: #7c3aed;
  color: #7c3aed;
  background: white;
}

.chart-btn:disabled {
  opacity: 0.5;
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
   CHART BODY
   ============================================================ */
.chart-body {
  position: relative;
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container {
  position: relative;
  height: 100%;
  width: 100%;
}

.chart-loader {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #9ca3af;
}

.chart-empty-text {
  font-size: 0.82rem;
  font-weight: 500;
}

/* ============================================================
   STATS FOOTER
   ============================================================ */
.chart-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid #f3f4f6;
}

.chart-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chart-stat-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.chart-stat-value {
  font-size: 0.88rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -0.2px;
  font-family: ui-monospace, SFMono-Regular, monospace;
}

/* ============================================================
   Responsive
   ============================================================ */
@media (max-width: 599px) {
  .chart-stats {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .chart-stat {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>