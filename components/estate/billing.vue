<template>
  <div class="billing-page">
    <!-- ============================================================
         STATUS BANNER
         ============================================================ -->
    <div class="status-banner" :class="active ? 'status-active' : 'status-inactive'">
      <div class="status-left">
        <div class="status-pulse" :class="active ? 'pulse-active' : 'pulse-inactive'"></div>
        <div>
          <div class="status-title">
            {{ active ? "Subscription active" : "Subscription inactive" }}
          </div>
          <div class="status-sub">
            {{ active ? "Your estate is covered" : "Renew to keep services running" }}
          </div>
        </div>
      </div>
      <v-chip
        small
        label
        color="white"
        class="status-chip"
        :style="active ? 'color:#065f46;' : 'color:#991b1b;'"
      >
        {{ active ? "Active" : "Inactive" }}
      </v-chip>
    </div>

    <!-- ============================================================
         INVOICES FROM MAKAAZI
         ============================================================ -->
    <div class="panel-card">
      <div class="panel-head">
        <div class="panel-title">
          Invoices from Makaazi
          <span class="panel-count">{{ invoices.length }}</span>
        </div>
        <button class="panel-action" @click="fetchInvoices" :disabled="invoicesLoading">
          <v-icon size="14" :class="{ spin: invoicesLoading }">mdi-refresh</v-icon>
          Refresh
        </button>
      </div>
      
      <div class="panel-body no-pad">
        <div v-if="invoicesLoading" class="panel-loading">
          <v-skeleton-loader type="list-item" />
          <v-skeleton-loader type="list-item" />
        </div>
        
        <div v-else-if="!invoices.length" class="panel-empty">
          <v-icon size="40" color="#cbd5e1" class="mb-2">mdi-receipt-text-outline</v-icon>
          <div style="font-weight: 700; color: #4b5563;">No invoices yet</div>
          <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 4px;">
            You will see invoices here when Makaazi admin issues one for your estate.
          </div>
        </div>

        <div v-else class="invoice-table-wrap">
          <table class="invoice-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Description</th>
                <th class="ta-right">Amount</th>
                <th>Due date</th>
                <th>Status</th>
                <th class="ta-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="inv in invoices" :key="inv.invoice_id">
                <td class="mono">{{ inv.invoice_number }}</td>
                <td>
                  <div class="inv-title">{{ inv.title }}</div>
                  <div v-if="inv.description" class="inv-desc">{{ inv.description }}</div>
                </td>
                <td class="ta-right mono">KES {{ numeral(inv.amount).format('0,0') }}</td>
                <td>{{ fmtDate(inv.due_date) }}</td>
                <td>
                  <span class="status-pill" :class="invoiceStatusClass(inv.status)">
                    {{ inv.status }}
                  </span>
                </td>
                <td class="ta-right">
                  <!-- Block Pay if already active -->
                  <button
                    v-if="['Sent', 'Overdue'].includes(inv.status) && !active"
                    class="pay-btn-small"
                    @click="payInvoice(inv)"
                  >
                    Pay
                  </button>
                  <span v-else-if="inv.status === 'Paid'" class="paid-text">
                    Paid
                  </span>
                  <!-- Show a badge if they can't pay right now -->
                  <span v-else-if="active && ['Sent', 'Overdue'].includes(inv.status)" class="status-pill" style="background: #f1f5f9; color: #64748b;">
                    Sub Active
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ============================================================
         HEADER
         ============================================================ -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Billing & subscription</h1>
        <p class="page-sub">
          {{ houseHoldCount }} {{ houseHoldCount === 1 ? "household" : "households" }} · billed monthly
        </p>
      </div>
      <div class="current-plan-pill">
        <v-icon size="14" color="#7c3aed">mdi-check-decagram</v-icon>
        <span>{{ plan_name || "No plan" }}</span>
      </div>
    </div>

    <!-- ============================================================
         INFO CARD
         ============================================================ -->
    <div v-if="message" class="info-card">
      <v-icon size="16" color="#7c3aed">mdi-information-outline</v-icon>
      <span>{{ message }}</span>
    </div>

    <!-- ============================================================
         PLAN GRID
         ============================================================ -->
    <div v-if="loadingPlans" class="plans-grid">
      <v-skeleton-loader
        v-for="n in 4"
        :key="n"
        type="image, article, button"
        class="plan-skeleton"
      />
    </div>

    <div v-else-if="plans.length" class="plans-grid">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="plan-card"
        :class="{
          'plan-card-current': plan.id === currentBand,
          'plan-card-recommended': plan.recommended && plan.id !== currentBand,
        }"
      >
        <div v-if="plan.id === currentBand" class="plan-badge plan-badge-current">
          Current
        </div>
        <div
          v-else-if="plan.recommended"
          class="plan-badge plan-badge-recommended"
        >
          Recommended
        </div>

        <div class="plan-icon" :class="`plan-icon-${plan.color}`">
          <v-icon size="22" color="white">{{ plan.icon }}</v-icon>
        </div>

        <div class="plan-name">{{ plan.name }}</div>
        <div class="plan-range">{{ plan.range }}</div>

        <div class="plan-price">
          <span class="plan-currency">KSh</span>
          <span class="plan-amount">{{ numeral(plan.amount).format("0,0") }}</span>
          <span class="plan-period">/month</span>
        </div>

        <ul class="plan-features">
          <li v-for="(f, i) in plan.features" :key="i">
            <v-icon size="14" color="#10b981">mdi-check-circle</v-icon>
            <span>{{ f }}</span>
          </li>
        </ul>

        <button
          class="plan-cta"
          :class="{ 'plan-cta-primary': plan.id === currentBand }"
          :disabled="plan.id === currentBand && active"
          @click="selectPlan(plan)"
        >
          {{ plan.id === currentBand && active ? "Active plan" : "Choose plan" }}
          <v-icon size="16" class="ml-1">mdi-arrow-right</v-icon>
        </button>
      </div>
    </div>

    <!-- Empty state (no plans returned from backend) -->
    <div v-else class="empty-plans">
      <div class="empty-icon">
        <v-icon size="42" color="#7c3aed">mdi-credit-card-off-outline</v-icon>
      </div>
      <div class="empty-title">No plans available</div>
      <div class="empty-text">
        Subscription plans haven't been configured yet. Please contact your estate manager.
      </div>
    </div>

    <!-- ============================================================
         PAYMENT DIALOG
         ============================================================ -->
    <v-dialog v-model="paymentForm" max-width="480" content-class="payment-dialog">
      <div class="payment-shell">
        <div class="payment-header">
          <div class="payment-header-icon">
            <v-icon color="white" size="22">mdi-cellphone-nfc</v-icon>
          </div>
          <div class="flex-grow-1" style="min-width: 0">
            <div class="payment-title">M-Pesa payment</div>
            <div class="payment-sub">
              {{ payingInvoice ? `Invoice ${payingInvoice.invoice_number}` : `${duration} plan · ${plan_name}` }}
            </div>
          </div>
          <button class="payment-close" @click="resetPayment">
            <v-icon size="18" color="white">mdi-close</v-icon>
          </button>
        </div>

        <div class="payment-body">
          <div class="amount-display">
            <div class="amount-label">Amount to pay</div>
            <div class="amount-value">
              <span class="amount-currency">KSh</span>
              <span class="amount-number">{{ numeral(amount).format("0,0") }}</span>
            </div>
          </div>

          <label class="field-label">M-Pesa phone number</label>
          <v-text-field
            v-model="phone"
            dense
            outlined
            rounded
            hide-details
            type="tel"
            placeholder="07XX XXX XXX"
            prepend-inner-icon="mdi-phone-outline"
            class="mb-2"
            :disabled="timerEnabled"
          ></v-text-field>
          <div class="field-hint">
            An STK push will be sent to this number. Enter your M-Pesa PIN to complete.
          </div>

          <transition name="fade-slide">
            <div v-if="timerEnabled" class="timer-block">
              <div class="timer-icon">
                <v-icon size="16" color="#7c3aed">mdi-clock-outline</v-icon>
              </div>
              <div class="timer-text">
                Waiting for confirmation…
                <span class="timer-count">Checking again in {{ timerCount }}s</span>
              </div>
              <v-progress-circular
                :value="((25 - timerCount) / 25) * 100"
                size="26"
                width="3"
                color="#7c3aed"
              />
            </div>
          </transition>

          <button
            class="pay-btn"
            :disabled="!phone || progress_bar || timerEnabled"
            @click="StkPush"
          >
            <v-progress-circular
              v-if="progress_bar"
              indeterminate
              size="18"
              width="2"
              color="white"
            />
            <template v-else>
              <v-icon size="18" class="mr-2">mdi-lock-outline</v-icon>
              Pay {{ numeral(amount).format("0,0") }} KSh
            </template>
          </button>

          <div class="payment-footer-note">
            <v-icon size="12" color="#9ca3af">mdi-shield-check</v-icon>
            Secured by Safaricom M-Pesa
          </div>
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
    <v-snackbar v-model="snackbarError" color="error" :timeout="3500" top rounded="pill">
      <div class="d-flex align-center">
        <v-icon color="white" small class="mr-2">mdi-alert-circle</v-icon>
        <span>{{ snackbarTextError }}</span>
      </div>
    </v-snackbar>
  </div>
</template>

<script>
import axios from "axios";
import numeral from "numeral";

const API = "https://makaaziserver-production.up.railway.app";
const POLL_DURATION = 25; // seconds

const TIER_META = [
  {
    icon: "mdi-home-outline",
    color: "purple",
    features: [
      "Full estate console",
      "Unlimited households",
      "M-Pesa payments",
      "Email support",
    ],
  },
  {
    icon: "mdi-home-group",
    color: "blue",
    features: [
      "Everything in Band 1",
      "Priority support",
      "Advanced reports",
      "Custom charges",
    ],
  },
  {
    icon: "mdi-city-variant-outline",
    color: "green",
    features: [
      "Everything in Band 2",
      "Dedicated account manager",
      "API access",
      "Custom integrations",
    ],
  },
  {
    icon: "mdi-domain",
    color: "amber",
    features: [
      "Everything in Band 3",
      "On-site training",
      "SLA guarantee",
      "White-label option",
    ],
  },
];

export default {
  name: "EstateBilling",
  props: {
    estateId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      numeral,

      // Status
      active: false,
      plan_name: "",
      message: "",
      houseHoldCount: 0,
      currentBand: null,

      // Payment
      paymentForm: false,
      duration: "Monthly",
      amount: 0,
      phone: null,
      progress_bar: false,
      CheckoutRequestID: null,
      payingInvoice: null, // Stores invoice object if paying an invoice

      // Timer
      timerEnabled: false,
      timerCount: POLL_DURATION,
      timerHandle: null,

      // Snackbars
      snackbar_s: false,
      snackbarText_s: "",
      snackbar: false,
      snackbarText: "",
      snackbarError: false,
      snackbarTextError: "",

      // Plans (fetched from backend)
      plans: [],
      loadingPlans: false,

      // Invoices
      invoices: [],
      invoicesLoading: false,
    };
  },

  watch: {
    // Fetch invoices when component mounts or estateId changes
    estateId: {
      immediate: true,
      handler(newId) {
        if (newId) this.fetchInvoices();
      }
    }
  },

  mounted() {
    this.refreshAll();
  },

  beforeDestroy() {
    this.stopTimer();
  },

  methods: {
    // =========================================================
    // INVOICES
    // =========================================================
    async fetchInvoices() {
      if (!this.estateId) return;
      this.invoicesLoading = true;
      try {
        const { data } = await axios.get(
          `${API}/api/estates/estates/${this.estateId}/invoices`
        );
        this.invoices = Array.isArray(data) ? data : [];
      } catch (err) {
        console.warn("Invoices fetch failed:", err.message);
        this.invoices = [];
      } finally {
        this.invoicesLoading = false;
      }
    },

    invoiceStatusClass(s) {
      return {
        'status-draft': s === 'Draft',
        'status-sent': s === 'Sent',
        'status-overdue': s === 'Overdue',
        'status-paid': s === 'Paid',
        'status-cancelled': s === 'Cancelled',
      };
    },

    fmtDate(d) {
      if (!d) return '—';
      try {
        return new Date(d).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      } catch {
        return '—';
      }
    },

    payInvoice(inv) {
      // Block Payment if Subscription is Active
      if (this.active) {
        return this.showError("Your subscription is already active. You cannot pay this invoice right now.");
      }

      this.payingInvoice = inv;
      this.amount = inv.amount;
      this.CheckoutRequestID = null;
      this.stopTimer();
      this.paymentForm = true;
    },

    // =========================================================
    // TIMER CONTROL
    // =========================================================
    startTimer() {
      this.stopTimer();
      this.timerEnabled = true;
      this.timerCount = POLL_DURATION;

      this.timerHandle = setInterval(() => {
        if (!this.timerEnabled) {
          this.stopTimer();
          return;
        }
        this.timerCount -= 1;
        if (this.timerCount <= 0) {
          this.stopTimer();
          this.StkQuery(); // single final check
        }
      }, 1000);
    },

    stopTimer() {
      if (this.timerHandle) {
        clearInterval(this.timerHandle);
        this.timerHandle = null;
      }
      this.timerEnabled = false;
    },

    // =========================================================
    // REFRESH
    // =========================================================
    async refreshAll() {
      await Promise.allSettled([
        this.fetchHouseholds(),
        this.fetchActiveSub(),
        this.fetchMessage(),
        this.computeBand(),
        this.fetchPlans(),
        this.fetchInvoices(),
      ]);
    },

    async fetchHouseholds() {
      try {
        const { data } = await axios.get(
          `${API}/api/households/getBHsHldEstId/${this.estateId}`
        );
        this.houseHoldCount = Array.isArray(data) ? data.length : 0;
      } catch (err) {
        console.warn("Households fetch failed:", err.message);
      }
    },

    async fetchActiveSub() {
      try {
        const { data } = await axios.get(
          `${API}/api/estates/subscription/${this.estateId}`
        );
        if (data) {
          this.active = data.is_active === 1 || data.is_active === true;
        }
      } catch (err) {
        console.warn("Active sub fetch failed:", err.message);
      }
    },

    async fetchMessage() {
      try {
        const { data } = await axios.get(
          `${API}/api/estates/subscriptions/${this.estateId}/billing-message`
        );
        if (data) {
          this.message = data.message || "";
          if (data.plan) {
            this.plan_name = data.plan.plan_name || "";
            this.amount = Number(data.plan.monthly_rate) || 0;
          }
        }
      } catch (err) {
        console.warn("Message fetch failed:", err.message);
      }
    },

    async computeBand() {
      try {
        const { data } = await axios.post(`${API}/api/estates/subscription`, {
          estate_id: this.estateId,
        });
        if (data && data.plan) {
          this.currentBand = data.plan.plan_id;
          this.plan_name = data.plan.plan_name;
          this.amount = Number(data.plan.monthly_rate) || 0;
        }
      } catch (err) {
        console.warn("Band compute failed:", err.message);
      }
    },

    // =========================================================
    // FETCH PLANS (from backend)
    // =========================================================
    async fetchPlans() {
      this.loadingPlans = true;
      try {
        const { data } = await axios.get(
          `${API}/api/estates/subscription-plans`
        );

        if (!Array.isArray(data) || !data.length) {
          this.plans = [];
          return;
        }

        this.plans = data.map((p, index) => {
          const meta = TIER_META[index % TIER_META.length];
          return {
            id: p.plan_id,
            name: p.plan_name,
            range:
              p.max_households == null
                ? `${p.min_households}+ households`
                : `${p.min_households} – ${p.max_households} households`,
            amount: Number(p.monthly_rate) || 0,
            icon: meta.icon,
            color: meta.color,
            features: meta.features,
          };
        });
      } catch (err) {
        console.warn("Plans fetch failed:", err.message);
        this.plans = [];
      } finally {
        this.loadingPlans = false;
      }
    },

    // =========================================================
    // PAYMENT
    // =========================================================
    selectPlan(plan) {
      this.amount = plan.amount;
      this.plan_name = plan.name;
      this.duration = "Monthly";
      this.CheckoutRequestID = null;
      this.payingInvoice = null; // Clear invoice
      this.stopTimer();
      this.paymentForm = true;
    },

    resetPayment() {
      this.stopTimer();
      this.paymentForm = false;
      this.CheckoutRequestID = null;
      this.payingInvoice = null;
      this.progress_bar = false;
    },

    async StkPush() {
      if (!this.phone) {
        return this.showError("Enter your M-Pesa number");
      }

      let clean = String(this.phone).replace(/\D/g, "");
      if (clean.startsWith("0")) clean = "254" + clean.slice(1);
      if (!clean.startsWith("254")) clean = "254" + clean;
      if (clean.length !== 12) {
        return this.showError("Enter a valid phone number (2547XXXXXXXX)");
      }

      this.progress_bar = true;
      try {
        let payload = {
          phone_number: clean,
          estate_id: this.estateId,
        };

        // ========================================================
        // THE FIX: STRICT PAYLOAD SEPARATION
        // ========================================================
        if (this.payingInvoice) {
          // 1. If paying an invoice, strictly use the invoice data
          payload.invoice_id = this.payingInvoice.invoice_id;
          payload.amount = this.payingInvoice.amount; 
        } else {
          // 2. If paying a plan, strictly use the plan data
          payload.invoice_id = null;
          payload.amount = this.amount; 
        }

        console.log("🔵 Payload being sent:", payload);

        const { data } = await axios.post(
          `${API}/payment/stk_push_subscription`,
          payload
        );

        console.log("🔵 STK response:", data);

        const code = String(data.ResponseCode || "");
        const crid = data.CheckoutRequestID;

        if (code === "0" && crid) {
          this.CheckoutRequestID = crid;
          this.startTimer();
          this.showInfo("STK push sent. Check your phone.");
        } else {
          this.showError(
            data.errorMessage ||
            data.ResponseDescription ||
            data.error ||
            "Could not initiate payment"
          );
        }
      } catch (err) {
        console.error("🔴 STK error:", err.response?.data || err.message);
        this.showError(
          err.response?.data?.error ||
          err.response?.data?.detail ||
          "Payment initiation failed"
        );
      } finally {
        this.progress_bar = false;
      }
    },

    async StkQuery() {
      if (!this.CheckoutRequestID) {
        this.resetPayment();
        return;
      }

      this.stopTimer();
      this.showInfo("Checking payment status…");

      let outcome = "unknown";
      let message = "Could not confirm payment. Please try again.";

      try {
        const { data } = await axios.post(
          `${API}/payment/stk_push_subscription/query`,
          { checkoutRequestId: this.CheckoutRequestID }
        );

        console.log("🔵 STK query:", data);

        const rawCode = data.ResultCode ?? data.result_code ?? data.errorCode ?? "";
        const resultCode = String(rawCode);
        const resultDesc =
          data.ResultDesc || data.result_desc || data.errorMessage || "";
        const mpesaStatus = data.mpesa_status;

        if (resultCode === "0" || mpesaStatus === "success") {
          outcome = "success";
          message = this.payingInvoice ? "Invoice paid successfully!" : "Payment received. Subscription renewed.";
        }
        else if (resultCode === "1032") {
          outcome = "error";
          message = "You cancelled the payment on your phone.";
        }
        else if (resultCode === "2001") {
          outcome = "error";
          message = "Wrong M-Pesa PIN. Please try again.";
        }
        else if (resultCode === "1") {
          outcome = "error";
          message = "Insufficient M-Pesa balance.";
        }
        else if (resultCode === "1001") {
          outcome = "error";
          message = "Invalid phone number.";
        }
        else if (resultCode === "1002") {
          outcome = "error";
          message = "M-Pesa request timed out. Please try again.";
        }
        else if (mpesaStatus === "failed") {
          outcome = "error";
          message = resultDesc || "Payment failed.";
        }
        else {
          outcome = "pending";
          message =
            "Payment not confirmed yet. If you entered your PIN, it may take a few minutes to reflect. Check your payment history.";
        }
      } catch (err) {
        console.error("🔴 STK query failed:", err.response?.data || err.message);
        outcome = "error";
        message = "Could not verify payment status. Please try again.";
      }

      this.paymentForm = false;
      this.CheckoutRequestID = null;
      this.progress_bar = false;
      this.stopTimer();

      if (outcome === "success") {
        this.showSuccess(message);
        if (this.payingInvoice) {
          this.fetchInvoices(); // Refresh invoices to show 'Paid' status
        }
        this.refreshAll();
      } else if (outcome === "pending") {
        this.showInfo(message);
      } else {
        this.showError(message);
      }
      this.payingInvoice = null;
    },

    // =========================================================
    // HELPERS
    // =========================================================
    showSuccess(msg) {
      this.snackbar = true;
      this.snackbarText = msg;
    },

    showError(msg) {
      this.snackbarError = true;
      this.snackbarTextError = msg;
    },

    showInfo(msg) {
      this.snackbar_s = true;
      this.snackbarText_s = msg;
    },
  },
};
</script>

<style scoped>
.billing-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1100px;
}

/* ============================================================
   INVOICE STYLES
   ============================================================ */
.panel-card {
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
  gap: 12px;
}
.panel-title {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f0d24;
  display: flex;
  align-items: center;
  gap: 8px;
}
.panel-count {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(128, 81, 255, 0.12);
  color: #8051ff;
  font-size: 0.62rem;
  font-weight: 800;
}
.panel-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: #8051ff;
  font-size: 0.72rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
}
.panel-action:hover { background: rgba(128, 81, 255, 0.08); }
.panel-action:disabled { opacity: 0.5; cursor: not-allowed; }

.panel-body {
  padding: 18px 20px;
}
.panel-body.no-pad {
  padding: 0;
}
.panel-empty {
  padding: 40px 20px;
  text-align: center;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.panel-loading {
  padding: 16px 20px;
}

.invoice-table-wrap {
  overflow-x: auto;
}
.invoice-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}
.invoice-table th {
  text-align: left;
  font-size: 0.7rem;
  text-transform: uppercase;
  padding: 12px 20px;
  border-bottom: 1px solid #f1f5f9;
  color: #64748b;
  font-weight: 800;
  background: #fafbff;
  white-space: nowrap;
}
.invoice-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}
.invoice-table tr:hover {
  background: #fafbff;
}
.ta-right { text-align: right !important; }
.mono {
  font-family: ui-monospace, SFMono-Regular, monospace;
  color: #334155;
  font-size: 0.8rem;
}
.inv-title {
  font-weight: 700;
  color: #0f0d24;
}
.inv-desc {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 2px;
}
.status-pill {
  padding: 3px 9px;
  border-radius: 99px;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  display: inline-block;
}
.status-draft { background: #f1f5f9; color: #475569; }
.status-sent { background: #dbeafe; color: #1d4ed8; }
.status-overdue { background: #fee2e2; color: #b91c1c; }
.status-paid { background: #d1fae5; color: #065f46; }
.status-cancelled { background: #fef3c7; color: #b45309; }

.pay-btn-small {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}
.pay-btn-small:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -4px rgba(124, 58, 237, 0.6);
}
.paid-text {
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 700;
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 767px) {
  .invoice-table thead th:nth-child(3),
  .invoice-table tbody td:nth-child(3),
  .invoice-table thead th:nth-child(4),
  .invoice-table tbody td:nth-child(4),
  .invoice-table thead th:nth-child(6),
  .invoice-table tbody td:nth-child(6) {
    display: none; /* Hide Amount, Due date and Action on mobile */
  }
}

/* ============================================================
   STATUS BANNER
   ============================================================ */
.status-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  border-radius: 16px;
  color: white;
  position: relative;
  overflow: hidden;
}

.status-active {
  background: linear-gradient(135deg, #059669, #10b981);
}

.status-inactive {
  background: linear-gradient(135deg, #b91c1c, #ef4444);
}

.status-banner::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15), transparent 60%);
  pointer-events: none;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
}

.status-pulse {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  flex-shrink: 0;
}

.pulse-active { animation: pulseG 2s infinite; }
.pulse-inactive { animation: pulseR 1.5s infinite; }

@keyframes pulseG {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.6); }
  50% { box-shadow: 0 0 0 8px rgba(255, 255, 255, 0); }
}

@keyframes pulseR {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.6); }
  50% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
}

.status-title {
  font-size: 0.98rem;
  font-weight: 800;
  letter-spacing: -0.2px;
}

.status-sub {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 2px;
}

.status-chip {
  font-weight: 800 !important;
  letter-spacing: 0.3px;
  position: relative;
}

/* ============================================================
   HEADER
   ============================================================ */
.page-header {
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

.current-plan-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f3eeff;
  border: 1px solid #e9e0ff;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #7c3aed;
}

/* ============================================================
   INFO CARD
   ============================================================ */
.info-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #faf8ff;
  border: 1px solid #e9e0ff;
  border-radius: 12px;
  font-size: 0.83rem;
  color: #4b5563;
}

/* ============================================================
   PLAN GRID
   ============================================================ */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.plan-skeleton {
  border-radius: 18px !important;
  overflow: hidden;
}

.plan-card {
  position: relative;
  padding: 22px;
  background: white;
  border: 2px solid #e9e7f2;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.plan-card:hover {
  border-color: #c7b8ff;
  transform: translateY(-2px);
  box-shadow: 0 12px 30px -12px rgba(124, 58, 237, 0.25);
}

.plan-card-current {
  border-color: #7c3aed;
  background: linear-gradient(180deg, #faf8ff, #ffffff 40%);
  box-shadow: 0 12px 32px -14px rgba(124, 58, 237, 0.35);
}

.plan-card-recommended { border-color: #a855f7; }

.plan-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 3px 10px;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border-radius: 999px;
}

.plan-badge-current { background: #7c3aed; color: white; }

.plan-badge-recommended {
  background: linear-gradient(135deg, #a855f7, #ec4899);
  color: white;
}

.plan-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  flex-shrink: 0;
}

.plan-icon-purple { background: linear-gradient(135deg, #7c3aed, #a855f7); }
.plan-icon-blue   { background: linear-gradient(135deg, #3b82f6, #60a5fa); }
.plan-icon-green  { background: linear-gradient(135deg, #059669, #10b981); }
.plan-icon-amber  { background: linear-gradient(135deg, #d97706, #f59e0b); }

.plan-name {
  font-size: 1rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -0.2px;
}

.plan-range {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 2px;
}

.plan-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin: 16px 0;
}

.plan-currency {
  font-size: 0.9rem;
  font-weight: 700;
  color: #7c3aed;
}

.plan-amount {
  font-size: 2rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -1px;
  line-height: 1;
}

.plan-period {
  font-size: 0.78rem;
  color: #9ca3af;
  margin-left: 2px;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: #4b5563;
}

.plan-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 11px 16px;
  background: #f3f4f6;
  color: #1e1b4b;
  border: none;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.plan-cta:hover:not(:disabled) {
  background: #e9e7f2;
  transform: translateY(-1px);
}

.plan-cta-primary {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  box-shadow: 0 6px 16px -6px rgba(124, 58, 237, 0.6);
}

.plan-cta-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #6d28d9, #9333ea);
  box-shadow: 0 10px 22px -6px rgba(124, 58, 237, 0.75);
}

.plan-cta:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ============================================================
   EMPTY STATE (no plans from backend)
   ============================================================ */
.empty-plans {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56px 24px;
  background: white;
  border: 1px solid #e9e7f2;
  border-radius: 18px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 22px;
  background: rgba(124, 58, 237, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
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
  max-width: 360px;
  line-height: 1.55;
}

/* ============================================================
   PAYMENT DIALOG
   ============================================================ */
::v-deep .payment-dialog {
  overflow: hidden !important;
  border-radius: 22px !important;
  margin: 16px auto !important;
  max-width: 480px !important;
  width: calc(100% - 32px) !important;
  box-shadow: 0 30px 60px -20px rgba(30, 27, 75, 0.4) !important;
}

.payment-shell {
  background: white;
  border-radius: 22px;
  overflow: hidden;
}

.payment-header {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
}

.payment-header::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255,255,255,0.18), transparent 50%);
  pointer-events: none;
}

.payment-header-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.payment-title {
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.2;
}

.payment-sub {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 2px;
}

.payment-close {
  position: relative;
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

.payment-close:hover { background: rgba(255, 255, 255, 0.28); }

.payment-body { padding: 22px 24px 24px; }

.amount-display {
  background: #faf8ff;
  border: 1px solid #e9e0ff;
  border-radius: 14px;
  padding: 16px 18px;
  text-align: center;
  margin-bottom: 20px;
}

.amount-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #7c3aed;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 6px;
}

.amount-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
}

.amount-currency {
  font-size: 1rem;
  font-weight: 700;
  color: #7c3aed;
}

.amount-number {
  font-size: 2.2rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -1.2px;
  line-height: 1;
}

.field-label {
  display: block;
  font-size: 0.74rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 6px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.field-hint {
  font-size: 0.72rem;
  color: #9ca3af;
  margin-bottom: 16px;
  line-height: 1.5;
}

::v-deep .theme--light.v-text-field--outlined fieldset {
  border-radius: 12px !important;
  border-color: #e9e7f2 !important;
}

::v-deep .theme--light.v-text-field--outlined.v-input--is-focused fieldset {
  border-color: #7c3aed !important;
  border-width: 2px !important;
}

.timer-block {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #faf8ff;
  border: 1px solid #e9e0ff;
  border-radius: 12px;
  margin-bottom: 16px;
}

.timer-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: white;
  border: 1px solid #e9e0ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.timer-text {
  flex: 1;
  font-size: 0.82rem;
  color: #4b5563;
  line-height: 1.3;
}

.timer-count {
  display: block;
  font-size: 0.72rem;
  color: #9ca3af;
  margin-top: 2px;
}

.pay-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.25s ease;
  box-shadow: 0 8px 20px -6px rgba(124, 58, 237, 0.55);
}

.pay-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 26px -6px rgba(124, 58, 237, 0.75);
}

.pay-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.payment-footer-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 14px;
  font-size: 0.7rem;
  color: #9ca3af;
  font-weight: 600;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 599px) {
  .status-banner { padding: 16px 18px; }
  .status-title { font-size: 0.9rem; }
  .plans-grid { grid-template-columns: 1fr; }
  .payment-body { padding: 18px; }
}
</style>