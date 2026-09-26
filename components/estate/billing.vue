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
        :color="active ? 'white' : 'white'"
        class="status-chip"
        :style="active ? 'color:#065f46;' : 'color:#991b1b;'"
      >
        {{ active ? "Active" : "Inactive" }}
      </v-chip>
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
    <div class="plans-grid">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="plan-card"
        :class="{
          'plan-card-current': plan.id === currentBand,
          'plan-card-recommended': plan.recommended && plan.id !== currentBand,
        }"
      >
        <!-- Badge -->
        <div v-if="plan.id === currentBand" class="plan-badge plan-badge-current">
          Current
        </div>
        <div
          v-else-if="plan.recommended"
          class="plan-badge plan-badge-recommended"
        >
          Recommended
        </div>

        <!-- Icon -->
        <div class="plan-icon" :class="`plan-icon-${plan.color}`">
          <v-icon size="22" color="white">{{ plan.icon }}</v-icon>
        </div>

        <!-- Name -->
        <div class="plan-name">{{ plan.name }}</div>
        <div class="plan-range">{{ plan.range }}</div>

        <!-- Price -->
        <div class="plan-price">
          <span class="plan-currency">KSh</span>
          <span class="plan-amount">{{ numeral(plan.amount).format("0,0") }}</span>
          <span class="plan-period">/month</span>
        </div>

        <!-- Features -->
        <ul class="plan-features">
          <li v-for="(f, i) in plan.features" :key="i">
            <v-icon size="14" color="#10b981">mdi-check-circle</v-icon>
            <span>{{ f }}</span>
          </li>
        </ul>

        <!-- CTA -->
        <button
          class="plan-cta"
          :class="{ 'plan-cta-primary': plan.id === currentBand }"
          :disabled="!active && plan.id !== currentBand ? false : plan.id === currentBand && active"
          @click="selectPlan(plan)"
        >
          {{ plan.id === currentBand && active ? "Active plan" : "Choose plan" }}
          <v-icon size="16" class="ml-1">mdi-arrow-right</v-icon>
        </button>
      </div>
    </div>

    <!-- ============================================================
         PAYMENT DIALOG
         ============================================================ -->
    <v-dialog v-model="paymentForm" max-width="480" content-class="payment-dialog">
      <div class="payment-shell">
        <!-- Header -->
        <div class="payment-header">
          <div class="payment-header-icon">
            <v-icon color="white" size="22">mdi-cellphone-nfc</v-icon>
          </div>
          <div class="flex-grow-1" style="min-width: 0">
            <div class="payment-title">M-Pesa payment</div>
            <div class="payment-sub">{{ duration }} plan · {{ plan_name }}</div>
          </div>
          <button class="payment-close" @click="paymentForm = false">
            <v-icon size="18" color="white">mdi-close</v-icon>
          </button>
        </div>

        <!-- Body -->
        <div class="payment-body">
          <!-- Amount display -->
          <div class="amount-display">
            <div class="amount-label">Amount to pay</div>
            <div class="amount-value">
              <span class="amount-currency">KSh</span>
              <span class="amount-number">{{ numeral(amount).format("0,0") }}</span>
            </div>
          </div>

          <!-- Phone -->
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
          ></v-text-field>
          <div class="field-hint">
            An STK push will be sent to this number. Enter your M-Pesa PIN to complete.
          </div>

          <!-- Timer -->
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

          <!-- Actions -->
          <button
            class="pay-btn"
            :disabled="!phone || progress_bar"
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

const API = "https://makaaziserver22.up.railway.app";

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

      // Timer for STK query
      timerEnabled: false,
      timerCount: 25,

      // Snackbars
      snackbar_s: false,
      snackbarText_s: "",
      snackbar: false,
      snackbarText: "",
      snackbarError: false,
      snackbarTextError: "",

      // Plan definitions (matches subscription_plans table)
      plans: [
        {
          id: 1,
          name: "Band 1",
          range: "1 – 100 households",
          amount: 100,
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
          id: 2,
          name: "Band 2",
          range: "101 – 500 households",
          amount: 200,
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
          id: 3,
          name: "Band 3",
          range: "501 – 1000 households",
          amount: 300,
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
          id: 4,
          name: "Band 4",
          range: "1000+ households",
          amount: 400,
          icon: "mdi-domain",
          color: "amber",
          features: [
            "Everything in Band 3",
            "On-site training",
            "SLA guarantee",
            "White-label option",
          ],
        },
      ],
    };
  },
  mounted() {
    this.refreshAll();
  },
  watch: {
    timerCount: {
      handler(value) {
        if (value > 0 && this.timerEnabled) {
          setTimeout(() => {
            this.timerCount--;
          }, 1000);
        } else if (value === 0 && this.timerEnabled) {
          this.StkQuery();
          this.timerCount = 25;
        }
      },
      immediate: false,
    },
  },
  methods: {
    // =========================================================
    // REFRESH
    // =========================================================
    async refreshAll() {
      await Promise.allSettled([
        this.fetchHouseholds(),
        this.fetchActiveSub(),
        this.fetchMessage(),
        this.computeBand(),
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
    // PAYMENT
    // =========================================================
    selectPlan(plan) {
      this.amount = plan.amount;
      this.plan_name = plan.name;
      this.duration = "Monthly";
      this.paymentForm = true;
    },

    async StkPush() {
      if (!this.phone) {
        return this.showError("Enter your M-Pesa number");
      }

      const clean = String(this.phone).replace(/\D/g, "");
      if (clean.length < 9) {
        return this.showError("Enter a valid phone number");
      }

      this.progress_bar = true;
      try {
        const { data } = await axios.post(
          `${API}/payment/stk_push_subscription`,
          {
            phone_number: this.phone,
            estate_id: this.estateId,
          }
        );

        if (data && data.CheckoutRequestID) {
          this.CheckoutRequestID = data.CheckoutRequestID;
          this.timerEnabled = true;
          this.timerCount = 25;
          this.snackbar_s = true;
          this.snackbarText_s = "STK push sent. Check your phone.";
        } else {
          this.showError(data?.error || "Could not initiate payment");
        }
      } catch (err) {
        console.error(err);
        this.showError(
          err.response?.data?.error || "Payment initiation failed"
        );
      } finally {
        this.progress_bar = false;
      }
    },

    async StkQuery() {
      if (!this.CheckoutRequestID) return;
      try {
        const { data } = await axios.post(
          `${API}/payment/stk_push_subscription/query`,
          { checkoutRequestId: this.CheckoutRequestID }
        );

        // If payment done
        if (data && (data.ResultCode === "0" || data.ResultCode === 0)) {
          this.timerEnabled = false;
          this.paymentForm = false;
          this.showSuccess("Payment received");
          this.refreshAll();
        } else if (
          data &&
          (data.ResultCode === "1032" || data.ResultCode === "2001")
        ) {
          this.timerEnabled = false;
          this.showError(
            data.ResultDesc || "Payment was cancelled or failed"
          );
        } else {
          // Still pending — restart timer
          this.timerEnabled = true;
          this.timerCount = 25;
        }
      } catch (err) {
        console.warn("STK query failed:", err.message);
        this.timerEnabled = false;
      }
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

.pulse-active {
  animation: pulseG 2s infinite;
}

.pulse-inactive {
  animation: pulseR 1.5s infinite;
}

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

.plan-card-recommended {
  border-color: #a855f7;
}

/* Badge */
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

.plan-badge-current {
  background: #7c3aed;
  color: white;
}

.plan-badge-recommended {
  background: linear-gradient(135deg, #a855f7, #ec4899);
  color: white;
}

/* Icon */
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

/* Price */
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

/* Features */
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

/* CTA */
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

.payment-close:hover {
  background: rgba(255, 255, 255, 0.28);
}

.payment-body {
  padding: 22px 24px 24px;
}

/* Amount display */
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

/* Field */
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

/* Timer */
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

/* Pay button */
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

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Responsive */
@media (max-width: 599px) {
  .status-banner {
    padding: 16px 18px;
  }
  .status-title {
    font-size: 0.9rem;
  }
  .plans-grid {
    grid-template-columns: 1fr;
  }
  .payment-body {
    padding: 18px;
  }
}
</style>