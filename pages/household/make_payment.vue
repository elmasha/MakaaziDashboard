<template>
  <div class="d-flex bg-surface dashboard-root" style="min-height: 100vh;">
    <!-- Desktop sidebar -->
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
            <div class="help-title">Payment issue?</div>
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

    <!-- Mobile bottom nav -->
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

    <!-- Main -->
    <v-main :class="nav_bars ? 'pb-16' : ''" class="main-premium">
      <!-- Header -->
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
                <div>
                  <h1 class="text-h6 text-sm-h5 font-weight-bold text--primary page-title">
                    Make Payment
                  </h1>
                  <div class="d-flex align-center mt-1">
                    <v-icon x-small color="success" class="mr-1">mdi-circle</v-icon>
                    <span class="text-caption text--secondary">{{ todayLabel }}</span>
                  </div>
                </div>
              </div>
            </v-col>
            <v-col cols="4" sm="6" class="d-flex justify-end align-center">
              <v-avatar color="#8051FF" size="38" class="avatar-glow">
                <v-img :src="avatarUrl" />
              </v-avatar>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <v-container :fluid="nav_bars" class="px-4 px-sm-6 pt-3 pt-sm-5 pb-8">
        <!-- STEP 1 — Select service charge -->
        <v-row class="reveal-card">
          <v-col cols="12">
            <div class="panel-card">
              <div class="panel-head">
                <div class="panel-icon panel-icon-purple">
                  <v-icon size="20" color="white">mdi-tag-outline</v-icon>
                </div>
                <div>
                  <div class="panel-title">Select service charge</div>
                  <div class="panel-sub">Current services your estate is charging</div>
                </div>
              </div>

              <div v-if="loadingCharges" class="loading-block">
                <v-progress-circular indeterminate size="28" color="#8051ff" />
                <span>Loading charges…</span>
              </div>

              <div v-else-if="charges.length" class="charges-grid">
                <button
                  v-for="c in charges"
                  :key="c.charges_id"
                  class="charge-card"
                  :class="{ 'charge-card-selected': isSelected(c) }"
                  @click="selectCharge(c)"
                >
                  <div class="charge-top">
                    <div class="charge-icon" :class="chargeIconClass(c)">
                      <v-icon size="18" color="white">
                        {{ chargeIcon(c) }}
                      </v-icon>
                    </div>
                    <div v-if="isSelected(c)" class="charge-check">
                      <v-icon size="22" color="#22c55e">mdi-check-circle</v-icon>
                    </div>
                  </div>

                  <div class="charge-body">
                    <div class="charge-amount">
                      <span class="charge-currency">KES</span>
                      <span class="charge-value">{{ formatNum(c.amount) }}</span>
                    </div>
                    <div class="charge-name">{{ c.charge_type }}</div>
                    <div class="charge-freq">{{ c.frequency }}</div>
                  </div>

                  <div class="charge-foot" :class="{ 'charge-foot-selected': isSelected(c) }">
                    {{ isSelected(c) ? 'Selected' : 'Tap to select' }}
                    <v-icon size="14" class="ml-1">
                      {{ isSelected(c) ? 'mdi-check' : 'mdi-chevron-right' }}
                    </v-icon>
                  </div>
                </button>
              </div>

              <div v-else class="empty-block">
                <div class="empty-icon">
                  <v-icon size="36" color="#cbd5e1">mdi-tag-off-outline</v-icon>
                </div>
                <div class="empty-title">No service charges yet</div>
                <div class="empty-sub">
                  Your estate hasn't configured any charges. Contact your estate officials.
                </div>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- STEP 2 — Payment method + proceed -->
        <v-row class="mt-4 reveal-card" style="animation-delay: 100ms">
          <v-col cols="12">
            <div class="panel-card">
              <div class="panel-head">
                <div class="panel-icon panel-icon-lime">
                  <v-icon size="20" color="#0A0A14">mdi-credit-card-outline</v-icon>
                </div>
                <div>
                  <div class="panel-title">Payment method</div>
                  <div class="panel-sub">Choose how you want to pay</div>
                </div>
              </div>

              <div class="method-chips">
                <button
                  v-for="m in paymentMethods"
                  :key="m.value"
                  class="method-chip"
                  :class="{ 'method-chip-active': paymentMethod === m.value }"
                  @click="paymentMethod = m.value"
                >
                  <v-icon size="16">{{ m.icon }}</v-icon>
                  <span>{{ m.label }}</span>
                </button>
              </div>

              <div class="proceed-row">
                <button
                  class="proceed-btn proceed-btn-ghost"
                  :disabled="!selectedCharge"
                  @click="goToMakePayment"
                >
                  <v-icon size="18">mdi-cellphone-wireless</v-icon>
                  <span>Pay with M-Pesa</span>
                </button>
                <button
                  class="proceed-btn proceed-btn-primary"
                  :disabled="!selectedCharge"
                  @click="goToVerify"
                >
                  <v-icon size="18">mdi-card-search-outline</v-icon>
                  <span>Verify payment</span>
                </button>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- STEP 3 — Payment entry -->
        <v-row v-if="mode" class="mt-4 reveal-card" style="animation-delay: 150ms">
          <v-col cols="12">
            <div class="panel-card">
              <!-- STK mode -->
              <div v-if="mode === 'stk'">
                <div class="panel-head">
                  <div class="panel-icon panel-icon-amber">
                    <v-icon size="20" color="white">mdi-cellphone-wireless</v-icon>
                  </div>
                  <div>
                    <div class="panel-title">Provide M-Pesa number</div>
                    <div class="panel-sub">Format: 254712345678</div>
                  </div>
                </div>

                <div class="form-block">
                  <label class="field-label">M-Pesa number</label>
                  <input
                    v-model="mpesaNumber"
                    class="field-input"
                    type="tel"
                    placeholder="254712345678"
                    :disabled="waitingForMpesa"
                  />
                </div>

                <div class="stk-summary">
                  <div>
                    <div class="stk-summary-label">Amount to pay</div>
                    <div class="stk-summary-value">
                      KES {{ formatNum(paymentAmount) }}
                    </div>
                  </div>
                  <button
                    class="stk-submit"
                    :disabled="!canSubmitStk || waitingForMpesa || submitting"
                    @click="submitStkPush"
                  >
                    <v-icon v-if="submitting" size="16" class="spin mr-1">mdi-loading</v-icon>
                    <v-icon v-else size="16" class="mr-1">mdi-send</v-icon>
                    {{ submitting ? 'Sending…' : 'Send STK push' }}
                  </button>
                </div>

                <!-- Waiting -->
                <div v-if="waitingForMpesa" class="waiting-card">
                  <div class="timer-ring">{{ timerCount }}</div>
                  <div class="waiting-body">
                    <div class="waiting-title">Waiting for M-Pesa confirmation</div>
                    <div class="waiting-sub">
                      Check your phone and enter your PIN to complete the payment.
                    </div>
                  </div>
                </div>
              </div>

              <!-- Verify mode -->
              <div v-else-if="mode === 'verify'">
                <div class="panel-head">
                  <div class="panel-icon panel-icon-blue">
                    <v-icon size="20" color="white">mdi-receipt</v-icon>
                  </div>
                  <div>
                    <div class="panel-title">Verify M-Pesa receipt</div>
                    <div class="panel-sub">Enter the code from your M-Pesa SMS</div>
                  </div>
                </div>

                <div class="form-block">
                  <label class="field-label">M-Pesa receipt</label>
                  <input
                    v-model="mpesaReceipt"
                    class="field-input mono-input"
                    type="text"
                    placeholder="e.g. TR45FTY"
                    maxlength="12"
                    @input="mpesaReceipt = mpesaReceipt.toUpperCase()"
                  />
                </div>

                <button
                  class="verify-btn"
                  :disabled="!mpesaReceipt || mpesaReceipt.length < 6 || verifying"
                  @click="submitVerify"
                >
                  <v-icon v-if="verifying" size="16" class="spin mr-1">mdi-loading</v-icon>
                  <v-icon v-else size="16" class="mr-1">mdi-shield-check-outline</v-icon>
                  {{ verifying ? 'Verifying…' : 'Verify payment' }}
                </button>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Selected summary -->
        <v-row v-if="selectedCharge" class="mt-4 reveal-card" style="animation-delay: 200ms">
          <v-col cols="12">
            <div class="summary-banner">
              <div class="summary-icon">
                <v-icon size="20" color="white">mdi-information-outline</v-icon>
              </div>
              <div class="summary-body">
                <div class="summary-label">You are paying for</div>
                <div class="summary-value">
                  {{ selectedCharge.charge_type }}
                  <span class="summary-amount">
                    · KES {{ formatNum(selectedCharge.amount) }}
                  </span>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>

      <!-- Success dialog -->
      <v-dialog v-model="successDialog" max-width="440" persistent>
        <div class="success-card">
          <div class="success-icon-wrap">
            <v-icon size="40" color="#22c55e">mdi-check-circle</v-icon>
          </div>
          <div class="success-title">{{ successTitle }}</div>
          <div class="success-msg">{{ successMessage }}</div>
          <button class="success-btn" @click="afterSuccess">
            Done
          </button>
        </div>
      </v-dialog>

      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        :timeout="5000"
        bottom
        rounded="pill"
        class="mb-6 snackbar-premium"
        elevation="6"
      >
        <div class="d-flex align-center">
          <v-avatar
            :color="snackbar.color === 'success' ? 'success darken-2' : snackbar.color === 'warning' ? 'warning darken-2' : snackbar.color === 'info' ? 'info darken-2' : 'error darken-2'"
            size="28"
            class="mr-3"
          >
            <v-icon color="white" small>
              {{ snackbar.color === 'success' ? 'mdi-check' : snackbar.color === 'info' ? 'mdi-information' : 'mdi-alert' }}
            </v-icon>
          </v-avatar>
          <span class="font-weight-medium">{{ snackbar.text }}</span>
        </div>
      </v-snackbar>
    </v-main>
  </div>
</template>

<script>
import axios from 'axios';
import numeral from 'numeral';

const API = 'https://makaaziserver22.up.railway.app/api';
const PAYMENT_API = 'https://makaaziserver22.up.railway.app/payment';

export default {
  name: 'HouseholdMakePayment',
  data() {
    return {
      nav_bars: false,
      activeTab: '/household/make_payment',

      loadingCharges: false,
      submitting: false,
      verifying: false,

      uid: null,
      householdId: null,
      household: {},

      charges: [],
      selectedCharge: null,

      paymentMethod: 'mpesa',
      paymentMethods: [
        { label: 'M-Pesa', value: 'mpesa', icon: 'mdi-cellphone-wireless' },
        { label: 'Cash',   value: 'cash',  icon: 'mdi-cash' },
      ],

      mode: null,
      mpesaNumber: '',
      mpesaReceipt: '',

      successDialog: false,
      successTitle: '',
      successMessage: '',

      snackbar: { show: false, text: '', color: 'success' },

      CheckoutRequestID: null,
      waitingForMpesa: false,
      timerEnabled: false,
      timerCount: 25,
    };
  },
  computed: {
    dashboardRoute() {
      return this.uid
        ? `/household/dashboard/${this.uid}`
        : '/household/dashboard';
    },
    menuItems() {
      return [
        { title: 'Dashboard', icon: 'mdi-view-dashboard', route: this.dashboardRoute },
        { title: 'Payments',  icon: 'mdi-currency-usd',   route: '/household/payment_summary' },
        { title: 'Profile',   icon: 'mdi-account',        route: '/household/profile' },
        { title: 'Alerts',    icon: 'mdi-bell',           route: '/household/notifications' },
      ];
    },
    avatarUrl() {
      const name = this.household.primary_owner || 'Resident';
      return `https://ui-avatars.com/api/?background=8051FF&color=fff&name=${encodeURIComponent(name)}`;
    },
    todayLabel() {
      const d = new Date();
      return d.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      });
    },
    paymentAmount() {
      return this.selectedCharge ? Number(this.selectedCharge.amount) : 0;
    },
    canSubmitStk() {
      return (
        !!this.selectedCharge &&
        !!this.mpesaNumber &&
        this.mpesaNumber.replace(/\D/g, '').length >= 9
      );
    },
  },
  watch: {
    timerEnabled(value) {
      if (value) {
        setTimeout(() => {
          if (this.timerCount > 0) this.timerCount--;
        }, 1000);
      }
    },
    timerCount: {
      handler(value) {
        if (value > 0 && this.timerEnabled) {
          setTimeout(() => {
            if (this.timerCount > 0) this.timerCount--;
          }, 1000);
        } else if (value === 0 && this.timerEnabled) {
          this.stkQuery();
        }
      },
      immediate: true,
    },
  },
  mounted() {
    this.onResize();
    window.addEventListener('resize', this.onResize);
    this.waitForAuthAndLoad();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
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
        if (this.$router && typeof this.$router.push === 'function') {
          const result = this.$router.push(path);
          if (result && typeof result.catch === 'function') {
            result.catch((err) => {
              if (err && err.name !== 'NavigationDuplicated') {
                console.error('Nav error:', err);
              }
            });
          }
        } else {
          window.location.href = path;
        }
      } catch (err) {
        console.error('goTo failed:', err);
        window.location.href = path;
      }
    },

    // =====================================================
    // AUTH
    // =====================================================
    waitForAuthAndLoad() {
      const that = this;
      const current = that.$fire?.auth?.currentUser;
      if (current && current.uid) {
        that.uid = current.uid;
        that.prefillPhoneNumber(current);
        that.refreshAll();
        return;
      }
      that._authUnsub = that.$fire.auth.onAuthStateChanged((user) => {
        if (user && user.uid) {
          that.uid = user.uid;
          that.prefillPhoneNumber(user);
          that.refreshAll();
          if (that._authUnsub) {
            that._authUnsub();
            that._authUnsub = null;
          }
        } else {
          that.showSnackbar('Please sign in to make a payment', 'error');
        }
      });
    },

    prefillPhoneNumber(user) {
      const raw = user.phoneNumber || '';
      if (raw) {
        this.mpesaNumber = raw.replace(/\D/g, '');
      }
    },

    async refreshAll() {
      await this.fetchHousehold();
      await this.fetchCharges();
    },

    async fetchHousehold() {
      const that = this;
      try {
        const { data, status } = await axios.get(
          `${API}/households/getHouseHoldId/${that.uid}`
        );
        if (status === 200) {
          that.householdId = data.household_id;
          that.household = data;
        }
      } catch (error) {
        console.error('🔴 Household fetch error:', error.response?.data || error.message);
        that.showSnackbar('Could not load your household details', 'error');
      }
    },

    async fetchCharges() {
      const that = this;
      that.loadingCharges = true;
      try {
        if (!that.household.estate_id && that.uid) {
          const hh = await axios.get(`${API}/households/getHouseHoldId/${that.uid}`);
          that.household = hh.data;
          that.householdId = hh.data.household_id;
        }

        const estateId = that.household.estate_id;
        if (!estateId) {
          that.charges = [];
          return;
        }

        const candidates = [
          `${API}/services/getEstateServiceCharges/${estateId}`,
          `${API}/services/getAll`,
        ];

        let rawCharges = null;
        let usedUrl = null;

        for (const url of candidates) {
          try {
            const { data, status } = await axios.get(url);
            if (status === 200 && Array.isArray(data)) {
              rawCharges = data;
              usedUrl = url;
              break;
            }
          } catch (err) {
            console.log('❌ Failed:', url, '→', err.response?.status || err.message);
          }
        }

        if (!rawCharges) {
          that.charges = [];
          return;
        }

        const filtered = rawCharges.filter(
          (c) => Number(c.estate_id) === Number(estateId)
        );

        if (filtered.length === 0 && !usedUrl.endsWith('/getAll')) {
          that.charges = rawCharges;
        } else {
          that.charges = filtered;
        }
      } catch (error) {
        console.error('🔴 fetchCharges fatal:', error.response?.data || error.message);
        that.charges = [];
      } finally {
        that.loadingCharges = false;
      }
    },

    // =====================================================
    // SELECTION
    // =====================================================
    isSelected(c) {
      return this.selectedCharge && this.selectedCharge.charges_id === c.charges_id;
    },

    selectCharge(c) {
      this.selectedCharge = c;
      this.mode = null;
      this.mpesaReceipt = '';
      this.resetPolling();
    },

    goToVerify() {
      if (!this.selectedCharge) {
        this.showSnackbar('Select a service charge first', 'warning');
        return;
      }
      this.resetPolling();
      this.mode = 'verify';
    },

    goToMakePayment() {
      if (!this.selectedCharge) {
        this.showSnackbar('Select a service charge first', 'warning');
        return;
      }
      this.resetPolling();
      this.mode = 'stk';
    },

    resetPolling() {
      this.waitingForMpesa = false;
      this.timerEnabled = false;
      this.timerCount = 25;
      this.CheckoutRequestID = null;
    },

    chargeIcon(c) {
      const t = (c.charge_type || '').toLowerCase();
      if (t.includes('security')) return 'mdi-shield-home-outline';
      if (t.includes('garbage')) return 'mdi-trash-can-outline';
      if (t.includes('water'))   return 'mdi-water-outline';
      if (t.includes('welfare')) return 'mdi-heart-outline';
      return 'mdi-tag-outline';
    },

    chargeIconClass(c) {
      const t = (c.charge_type || '').toLowerCase();
      if (t.includes('security')) return 'charge-icon-red';
      if (t.includes('garbage')) return 'charge-icon-amber';
      if (t.includes('water'))   return 'charge-icon-blue';
      if (t.includes('welfare')) return 'charge-icon-purple';
      return 'charge-icon-purple';
    },

    // =====================================================
    // SUBMIT — STK PUSH
    // =====================================================
    async submitStkPush() {
      const that = this;

      let phone = (that.mpesaNumber || '').replace(/\D/g, '');
      if (phone.startsWith('0')) phone = '254' + phone.slice(1);
      if (!phone.startsWith('254')) phone = '254' + phone;
      if (phone.length !== 12) {
        that.showSnackbar('Enter a valid M-Pesa number (2547XXXXXXXX)', 'warning');
        return;
      }

      that.submitting = true;

      try {
        const payload = {
          phone,
          amount: that.paymentAmount,
          uid: that.uid,
          user_id: that.householdId,
          household_id: that.householdId,
          estate_id: that.household.estate_id,
          estate_name: that.household.estate_name || '',
          charge_id: that.selectedCharge.charges_id,
          transaction_type: that.selectedCharge.charge_type,
          payment_amount: that.paymentAmount,
          user_name: that.household.primary_owner,
          subscription: 'household',
          month: new Date().toLocaleString('en-US', { month: 'long' }),
          year: new Date().getFullYear(),
        };

        const { data, status } = await axios.post(
          `${PAYMENT_API}/mpesa_stk_push`,
          payload
        );

        console.log('🔵 STK response:', status, data);

        if (status === 200 && data) {
          const code = String(data.ResponseCode || '');
          const crid = data.CheckoutRequestID;

          if (code === '0' && crid) {
            that.CheckoutRequestID = crid;
            that.waitingForMpesa = true;
            that.timerCount = 25;
            that.timerEnabled = true;
            that.showSnackbar('STK push sent. Check your phone.', 'info');
          } else {
            that.showSnackbar(
              data.errorMessage || data.ResponseDescription || 'Payment request failed',
              'error'
            );
          }
        }
      } catch (error) {
        console.error('🔴 STK error:', error.response?.data || error.message);
        that.showSnackbar(
          error.response?.data?.error ||
          error.response?.data?.detail ||
          error.response?.data?.errorMessage ||
          'Could not initiate payment',
          'error'
        );
      } finally {
        that.submitting = false;
      }
    },

    // =====================================================
    // POLLING — stkQuery
    // =====================================================
    async stkQuery() {
      if (!this.CheckoutRequestID) return;

      this.timerCount = 25;
      this.timerEnabled = false;
      this.showSnackbar('Checking payment status...', 'info');

      try {
        const { data } = await axios.post(
          `${PAYMENT_API}/stk_query`,
          { checkout_request_id: this.CheckoutRequestID }
        );

        const resultCode = String(data.result_code ?? '');
        const resultDesc = data.result_desc || '';
        const mpesaStatus = data.mpesa_status;

        console.log('🔵 STK query:', data);

        if (resultCode === '0' || mpesaStatus === 'success') {
          this.waitingForMpesa = false;
          this.successTitle = 'Payment received!';
          this.successMessage = `Your payment of KES ${this.formatNum(this.paymentAmount)} has been recorded.`;
          this.successDialog = true;
          return;
        }

        if (resultCode === '1032') {
          this.waitingForMpesa = false;
          this.showSnackbar('You cancelled the payment on your phone.', 'warning');
          return;
        }

        if (resultCode === '2001') {
          this.waitingForMpesa = false;
          this.showSnackbar('Wrong M-Pesa PIN. Please try again.', 'warning');
          return;
        }

        if (resultCode === '1') {
          this.waitingForMpesa = false;
          this.showSnackbar('Insufficient M-Pesa balance.', 'warning');
          return;
        }

        if (resultCode === '1001') {
          this.waitingForMpesa = false;
          this.showSnackbar('Invalid phone number.', 'warning');
          return;
        }

        if (resultCode === '1002') {
          this.waitingForMpesa = false;
          this.showSnackbar('M-Pesa request timed out. Try again.', 'warning');
          return;
        }

        if (mpesaStatus === 'failed') {
          this.waitingForMpesa = false;
          this.showSnackbar(resultDesc || 'Payment failed.', 'warning');
          return;
        }

        if (mpesaStatus === 'pending' || resultCode === '' || resultCode === '1037') {
          this.showSnackbar('Still waiting for M-Pesa confirmation...', 'info');
          this.timerCount = 25;
          this.timerEnabled = true;
          return;
        }

        this.waitingForMpesa = false;
        this.showSnackbar('Could not confirm payment. Please try again.', 'warning');
      } catch (error) {
        console.error('🔴 STK query error:', error.response?.data || error.message);
        this.waitingForMpesa = false;
        this.showSnackbar('Could not verify payment status. Try again.', 'error');
      }
    },

    // =====================================================
    // SUBMIT — VERIFY RECEIPT
    // =====================================================
    async submitVerify() {
      const that = this;

      if (!that.mpesaReceipt || that.mpesaReceipt.length < 6) {
        that.showSnackbar('Enter a valid M-Pesa receipt', 'warning');
        return;
      }

      that.verifying = true;

      try {
        const payload = {
          mpesaID: that.mpesaReceipt.trim().toUpperCase(),
          uid: that.uid,
        };

        const { data, status } = await axios.post(
          `${PAYMENT_API}/trans_status`,
          payload
        );

        console.log('🔵 Verify response:', status, data);

        if (status === 200) {
          that.successTitle = 'Verification submitted';
          that.successMessage =
            'Your M-Pesa receipt has been submitted. The payment will be recorded if valid.';
          that.successDialog = true;
        }
      } catch (error) {
        console.error('🔴 Verify error:', error.response?.data || error.message);
        that.showSnackbar(
          error.response?.data?.error || 'Could not verify receipt',
          'error'
        );
      } finally {
        that.verifying = false;
      }
    },

    afterSuccess() {
      this.successDialog = false;
      this.resetPolling();
      setTimeout(() => {
        this.goTo(this.dashboardRoute);
      }, 400);
    },

    formatNum(n) {
      return numeral(n || 0).format('0,0');
    },
    showSnackbar(text, color = 'success') {
      this.snackbar = { show: true, text, color };
    },
    logout() {
      if (this.$fire?.auth) this.$fire.auth.signOut();
      this.$router.push('/login');
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
.mono-input { font-family: ui-monospace, SFMono-Regular, monospace; letter-spacing: 2px; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
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

.signout-btn { transition: all 0.2s ease; }
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

.back-btn {
  background: #ffffff;
  border: 1px solid #eef1f6;
  transition: all 0.2s ease;
}
.back-btn:hover {
  background: rgba(128, 81, 255, 0.06);
  border-color: rgba(128, 81, 255, 0.3);
}

.avatar-glow { box-shadow: 0 8px 18px -8px rgba(128, 81, 255, 0.6); }

/* ============================================================
   PANEL CARD (generic container)
   ============================================================ */
.panel-card {
  background: #ffffff;
  border: 1px solid #eef1f6;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.03);
}
.panel-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}
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
.panel-icon-lime {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  box-shadow: 0 10px 22px -10px rgba(182, 255, 0, 0.6);
}
.panel-icon-amber {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 10px 22px -10px rgba(245, 158, 11, 0.6);
}
.panel-icon-blue {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  box-shadow: 0 10px 22px -10px rgba(59, 130, 246, 0.6);
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

/* ============================================================
   CHARGES GRID
   ============================================================ */
.charges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.charge-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #ffffff;
  border: 1.5px solid #eef1f6;
  border-radius: 16px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.charge-card:hover {
  border-color: rgba(128, 81, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 14px 28px -14px rgba(128, 81, 255, 0.3);
}
.charge-card-selected {
  border-color: #22c55e;
  background: linear-gradient(140deg, #f0fdf4 0%, #dcfce7 100%);
  box-shadow: 0 14px 28px -14px rgba(34, 197, 94, 0.4);
}

.charge-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.charge-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.charge-icon-purple {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
}
.charge-icon-red {
  background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
}
.charge-icon-amber {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
}
.charge-icon-blue {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
}
.charge-check { flex-shrink: 0; }

.charge-body { flex: 1; }
.charge-amount {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-bottom: 4px;
}
.charge-currency {
  font-size: 0.62rem;
  font-weight: 800;
  color: #8051ff;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.charge-value {
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.6px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.charge-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f0d24;
  letter-spacing: -0.2px;
}
.charge-freq {
  font-size: 0.68rem;
  color: #94a3b8;
  margin-top: 3px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.charge-foot {
  display: flex;
  align-items: center;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
  font-size: 0.68rem;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.charge-foot-selected {
  color: #22c55e;
  border-top-color: rgba(34, 197, 94, 0.2);
}

/* ============================================================
   LOADING / EMPTY
   ============================================================ */
.loading-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 20px;
  color: #94a3b8;
  font-size: 0.82rem;
}
.empty-block {
  padding: 40px 20px;
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
   METHOD CHIPS + PROCEED
   ============================================================ */
.method-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}
.method-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 999px;
  background: #f6f7fb;
  border: 1.5px solid transparent;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.2px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}
.method-chip:hover { background: #eef1f6; color: #0f0d24; }
.method-chip-active {
  background: rgba(128, 81, 255, 0.1);
  border-color: #8051ff;
  color: #8051ff;
}

.proceed-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.proceed-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 14px;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.2px;
  cursor: pointer;
  font-family: inherit;
  border: none;
  transition: all 0.2s ease;
}
.proceed-btn-ghost {
  background: #f6f7fb;
  color: #0f0d24;
  border: 1px solid #eef1f6;
}
.proceed-btn-ghost:hover:not(:disabled) {
  background: #eef1f6;
  border-color: rgba(128, 81, 255, 0.35);
  color: #8051ff;
}
.proceed-btn-primary {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  box-shadow: 0 12px 24px -12px rgba(128, 81, 255, 0.7);
}
.proceed-btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px -12px rgba(128, 81, 255, 0.85);
}
.proceed-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* ============================================================
   PAYMENT ENTRY FORM
   ============================================================ */
.form-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}
.field-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.9px;
}
.field-input {
  padding: 13px 16px;
  border-radius: 12px;
  border: 1.5px solid #eef1f6;
  background: #f8fafc;
  font-size: 0.9rem;
  font-weight: 600;
  color: #0f0d24;
  outline: none;
  font-family: inherit;
  transition: all 0.2s ease;
  width: 100%;
}
.field-input:focus {
  border-color: #8051ff;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(128, 81, 255, 0.1);
}
.field-input:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}

.stk-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #eef1f6;
  gap: 12px;
  flex-wrap: wrap;
}
.stk-summary-label {
  font-size: 0.62rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  margin-bottom: 3px;
}
.stk-summary-value {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
}
.stk-submit {
  display: inline-flex;
  align-items: center;
  padding: 12px 22px;
  border-radius: 12px;
  background: #0f0d24;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  box-shadow: 0 10px 22px -10px rgba(15, 13, 36, 0.5);
}
.stk-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #1e1e3a;
}
.stk-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.verify-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 20px;
  border-radius: 14px;
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  box-shadow: 0 12px 24px -12px rgba(128, 81, 255, 0.7);
}
.verify-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px -12px rgba(128, 81, 255, 0.85);
}
.verify-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* Waiting card */
.waiting-card {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  padding: 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  border: 1px solid #fed7aa;
}
.waiting-body { flex: 1; min-width: 0; }
.waiting-title {
  font-size: 0.88rem;
  font-weight: 800;
  color: #7c2d12;
  letter-spacing: -0.2px;
}
.waiting-sub {
  font-size: 0.76rem;
  color: #92400e;
  margin-top: 3px;
  font-weight: 500;
  line-height: 1.5;
}
.timer-ring {
  width: 56px;
  height: 56px;
  border: 3px solid #f57c00;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f57c00;
  font-weight: 900;
  font-size: 1.15rem;
  flex-shrink: 0;
  background: #ffffff;
  box-shadow: 0 6px 14px -6px rgba(245, 124, 0, 0.4);
}

/* ============================================================
   SUMMARY BANNER
   ============================================================ */
.summary-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(128, 81, 255, 0.09) 0%, rgba(155, 108, 255, 0.05) 100%);
  border: 1px solid rgba(128, 81, 255, 0.15);
}
.summary-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.7);
}
.summary-body { flex: 1; min-width: 0; }
.summary-label {
  font-size: 0.62rem;
  font-weight: 800;
  color: #8051ff;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  margin-bottom: 3px;
}
.summary-value {
  font-size: 0.9rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
}
.summary-amount { color: #8051ff; }

/* ============================================================
   SUCCESS DIALOG
   ============================================================ */
.success-card {
  background: #ffffff;
  border-radius: 22px;
  padding: 28px 24px;
  text-align: center;
  box-shadow: 0 24px 60px -20px rgba(15, 13, 36, 0.4);
}
.success-icon-wrap {
  width: 76px;
  height: 76px;
  border-radius: 22px;
  background: rgba(34, 197, 94, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18px;
}
.success-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.4px;
}
.success-msg {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 8px;
  line-height: 1.55;
}
.success-btn {
  width: 100%;
  margin-top: 22px;
  padding: 14px 20px;
  border-radius: 14px;
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  box-shadow: 0 12px 24px -12px rgba(128, 81, 255, 0.7);
}
.success-btn:hover { transform: translateY(-1px); }

/* ============================================================
   SNACKBAR
   ============================================================ */
.snackbar-premium ::v-deep .v-snackbar__content { padding: 12px 20px; }

/* ============================================================
   MOBILE
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

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 767px) {
  .charges-grid { grid-template-columns: 1fr; }
  .proceed-row { grid-template-columns: 1fr; }
  .panel-card { padding: 16px; border-radius: 18px; }
  .stk-summary { flex-direction: column; align-items: stretch; }
  .stk-submit { width: 100%; justify-content: center; }
  .waiting-card { flex-direction: row; }
}
</style>