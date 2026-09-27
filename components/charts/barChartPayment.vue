<template>
  <div class="chart-shell">
    <!-- HEADER -->
    <div class="chart-header">
      <div class="chart-stats">
        <div class="chart-stat">
          <span class="chart-stat-label">Year total</span>
          <span class="chart-stat-value">
            KSh {{ numeral(totalYear).format("0,0") }}
          </span>
        </div>
        <div class="chart-stat">
          <span class="chart-stat-label">Peak month</span>
          <span class="chart-stat-value">{{ peakMonth || "—" }}</span>
        </div>
        <div class="chart-stat">
          <span class="chart-stat-label">Monthly avg</span>
          <span class="chart-stat-value">
            KSh {{ numeral(monthlyAvg).format("0,0") }}
          </span>
        </div>
      </div>

      <button
        class="chart-refresh"
        :disabled="loading"
        :class="{ spinning: loading }"
        @click="load"
        title="Refresh"
      >
        <v-icon size="15">mdi-refresh</v-icon>
      </button>
    </div>

    <!-- CHART BODY -->
    <div class="chart-body">
      <div v-if="loading" class="chart-loading">
        <div class="chart-loading-shimmer"></div>
      </div>

      <div v-else-if="error" class="chart-error">
        <v-icon size="30" color="#cbd5e1">mdi-chart-line-variant</v-icon>
        <div class="chart-error-title">Couldn't load chart</div>
        <div class="chart-error-sub">{{ error }}</div>
        <button class="chart-retry" @click="load">
          <v-icon size="14">mdi-refresh</v-icon>
          Retry
        </button>
      </div>

      <canvas v-show="!loading && !error" ref="canvas" class="chart-canvas"></canvas>
    </div>
  </div>
</template>

<script>
import Chart from "chart.js";
import axios from "axios";
import numeral from "numeral";

const API = "https://makaaziserver22.up.railway.app/api";

const MONTH_LABELS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

const MONTH_KEYS = [
  "january","february","march","april","may","june",
  "july","august","september","october","november","december",
];

export default {
  name: "EstateMonthlyPaymentsChart",
  props: {
    estateId: { type: Number, required: true },
  },
  data() {
    return {
      numeral,
      loading: false,
      error: "",
      totalYear: 0,
      peakMonth: "",
      monthlyAvg: 0,
      chart: null,
    };
  },

  mounted() {
    this.load();
  },

  beforeDestroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  },

  methods: {
    async load() {
      if (!this.estateId) {
        this.error = "Missing estateId";
        return;
      }

      this.loading = true;
      this.error = "";

      let values = MONTH_LABELS.map(() => 0);

      try {
        const year = new Date().getFullYear();
        const url = `${API}/charts/monthly-estate-summary/?estate_id=${this.estateId}&year=${year}`;
        console.log("[chart] GET", url);

        const { data } = await axios.get(url);
        console.log("[chart] response", data);

        if (Array.isArray(data) && data.length) {
          const row = data[0];
          values = MONTH_KEYS.map((k) => Number(row[k] || 0));
        } else {
          console.warn("[chart] empty response — using zeros");
        }
      } catch (err) {
        console.error("[chart] fetch failed", err);
        this.error =
          err.response?.data?.error || err.message || "Network error";
      } finally {
        this.loading = false;
      }

      // Summary stats
      this.totalYear = values.reduce((s, v) => s + v, 0);
      this.monthlyAvg = this.totalYear / 12;
      const max = Math.max(...values);
      this.peakMonth = max > 0 ? MONTH_LABELS[values.indexOf(max)] : "";

      // Wait for DOM to reflect loading=false
      this.$nextTick(() => this.renderChart(values));
    },

    renderChart(values) {
      const canvas = this.$refs.canvas;
      if (!canvas) {
        console.warn("[chart] canvas ref not found");
        return;
      }

      // Destroy previous instance
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }

      const ctx = canvas.getContext("2d");

      // Soft gradient under the line
      const gradient = ctx.createLinearGradient(0, 0, 0, 280);
      gradient.addColorStop(0, "rgba(124, 58, 237, 0.30)");
      gradient.addColorStop(0.55, "rgba(124, 58, 237, 0.08)");
      gradient.addColorStop(1, "rgba(124, 58, 237, 0)");

      this.chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: MONTH_LABELS.slice(),
          datasets: [
            {
              label: "Monthly collections",
              data: values.slice(),
              borderColor: "#7c3aed",
              backgroundColor: gradient,
              borderWidth: 2.5,
              fill: true,
              // v2 line settings
              lineTension: 0.4,
              pointBackgroundColor: "#ffffff",
              pointBorderColor: "#7c3aed",
              pointBorderWidth: 2.5,
              pointRadius: 4,
              pointHoverRadius: 7,
              pointHoverBackgroundColor: "#7c3aed",
              pointHoverBorderColor: "#ffffff",
              pointHoverBorderWidth: 3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: { display: false },
          hover: { intersect: false, mode: "index" },
          tooltips: {
            backgroundColor: "#1e1b4b",
            titleFontColor: "#ffffff",
            bodyFontColor: "#ffffff",
            titleFontStyle: "700",
            bodyFontStyle: "600",
            titleFontSize: 12,
            bodyFontSize: 12,
            padding: 10,
            cornerRadius: 10,
            displayColors: false,
            callbacks: {
              label: (item, data) => {
                const val = data.datasets[item.datasetIndex].data[item.index];
                return "KSh " + numeral(val || 0).format("0,0");
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
                },
              },
            ],
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                  fontColor: "#9ca3af",
                  fontSize: 11,
                  fontStyle: "600",
                  maxTicksLimit: 5,
                  callback: (val) => {
                    const n = Number(val) || 0;
                    if (n >= 1_000_000)
                      return "KSh " + (n / 1_000_000).toFixed(1) + "M";
                    if (n >= 1_000)
                      return "KSh " + (n / 1_000).toFixed(0) + "k";
                    return "KSh " + n;
                  },
                },
                gridLines: {
                  color: "#f0eef8",
                  drawBorder: false,
                  zeroLineColor: "#f0eef8",
                },
              },
            ],
          },
        },
      });
    },
  },
};
</script>

<style scoped>
.chart-shell {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* HEADER */
.chart-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.chart-stats {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  min-width: 0;
}

.chart-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.chart-stat-label {
  font-size: 0.6rem;
  font-weight: 800;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.chart-stat-value {
  font-size: 0.88rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -0.3px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.chart-refresh {
  width: 32px;
  height: 32px;
  background: #f9f6ff;
  border: 1px solid #e9e0ff;
  border-radius: 9px;
  color: #7c3aed;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.chart-refresh:hover:not(:disabled) {
  background: #f3eeff;
  border-color: #d8c7ff;
}

.chart-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.chart-refresh.spinning .v-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* CHART BODY — fixed height so canvas always renders */
.chart-body {
  position: relative;
  width: 100%;
  height: 280px;
}

.chart-canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

/* Loading */
.chart-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-radius: 12px;
}

.chart-loading-shimmer {
  width: 80%;
  height: 40%;
  border-radius: 14px;
  background: linear-gradient(90deg, #f3f0fb 0%, #ece7fb 50%, #f3f0fb 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Error */
.chart-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #fafaff;
  border: 1px dashed #e9e7f2;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}

.chart-error-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: #1e1b4b;
  margin-top: 6px;
}

.chart-error-sub {
  font-size: 0.72rem;
  color: #9ca3af;
  max-width: 260px;
  line-height: 1.4;
}

.chart-retry {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 12px;
  padding: 7px 14px;
  border-radius: 999px;
  background: #f3eeff;
  border: 1px solid #e0d4ff;
  color: #7c3aed;
  font-size: 0.72rem;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
}

.chart-retry:hover { background: #ebe3ff; }

@media (max-width: 599px) {
  .chart-body { height: 220px; }
  .chart-stats { gap: 12px; width: 100%; }
  .chart-stat { flex: 1; min-width: 0; }
  .chart-stat-value { font-size: 0.76rem; }
  .chart-stat-label { font-size: 0.54rem; }
  .chart-refresh { width: 28px; height: 28px; }
}
</style>