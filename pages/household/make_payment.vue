<template>
  <div class="d-flex bg-surface dashboard-root" style="min-height: 100vh;">
    <!-- Desktop sidebar -->
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
      <div class="sticky-header-premium px-4 px-sm-6 py-3">
        <v-container fluid class="pa-0">
          <v-row align="center" no-gutters>
            <v-col cols="8" sm="6">
              <div class="d-flex align-center">
                <v-btn icon small class="mr-2" @click="goTo(dashboardRoute)">
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <div>
                  <h1 class="text-h6 text-sm-h5 font-weight-bold text--primary page-title">
                    Estate Service Payment
                  </h1>
                  <div class="d-flex align-center mt-1">
                    <span class="text-caption text--secondary">{{ todayLabel }}</span>
                  </div>
                </div>
              </div>
            </v-col>
            <v-col cols="4" sm="6" class="d-flex justify-end align-center">
              <v-avatar color="#8051FF" size="36">
                <v-img :src="avatarUrl" />
              </v-avatar>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <v-container :fluid="nav_bars" class="px-4 px-sm-6 pt-2 pt-sm-4 pb-8">
        <!-- STEP 1: Select service charge -->
        <v-row class="reveal-card">
          <v-col cols="12">
            <v-card class="rounded-2xl pa-4 pa-sm-5" elevation="0" outlined>
              <div class="d-flex align-center mb-3">
                <v-avatar color="purple lighten-5" size="36" class="mr-3">
                  <v-icon color="#8051FF">mdi-tag-outline</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold purple--text">Select service charge</div>
                  <div class="text-caption text--secondary">
                    Below are the current services your estate is charging
                  </div>
                </div>
              </div>

              <div v-if="loadingCharges" class="text-center py-6">
                <v-progress-circular indeterminate color="#8051FF" />
              </div>

              <div v-else-if="charges.length">
                <v-row dense>
                  <v-col v-for="c in charges" :key="c.charges_id" cols="12" sm="6">
                    <v-card
                      :color="selectedCharge && selectedCharge.charges_id === c.charges_id ? '#1e1e1e' : '#111111'"
                      dark
                      elevation="0"
                      class="pa-4 charge-card"
                      :class="{ 'charge-selected': selectedCharge && selectedCharge.charges_id === c.charges_id }"
                      @click="selectCharge(c)"
                      style="cursor: pointer; border-radius: 16px; position: relative;"
                    >
                      <div class="d-flex align-center justify-space-between">
                        <div>
                          <div class="purple--text font-weight-bold" style="font-size: 1.1rem; color: #a78bfa !important;">
                            Ksh/ {{ formatNum(c.amount) }}
                          </div>
                          <div class="white--text font-weight-medium mt-1" style="font-size: 1.05rem;">
                            {{ c.charge_type }}
                          </div>
                          <div class="caption grey--text mt-2" style="opacity: 0.7;">
                            {{ c.frequency }}
                          </div>
                        </div>
                        <div class="text-center">
                          <v-icon color="#a78bfa" size="26">mdi-gesture-tap</v-icon>
                          <div class="caption mt-1" style="color: #a78bfa; font-size: 0.7rem;">
                            {{ selectedCharge && selectedCharge.charges_id === c.charges_id ? 'Selected' : 'Click to pay' }}
                          </div>
                        </div>
                      </div>

                      <v-icon
                        v-if="selectedCharge && selectedCharge.charges_id === c.charges_id"
                        color="#22c55e"
                        class="check-badge"
                      >
                        mdi-check-circle
                      </v-icon>
                    </v-card>
                  </v-col>
                </v-row>
              </div>

              <div v-else class="text-center py-6">
                <v-icon size="48" color="grey lighten-2">mdi-tag-off-outline</v-icon>
                <div class="text-caption grey--text mt-2">
                  No service charges configured for your estate yet.
                </div>
                <div class="text-caption grey--text">
                  Please contact your estate officials.
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- STEP 2: Payment method + action buttons -->
        <v-row class="mt-4 reveal-card" style="animation-delay: 100ms">
          <v-col cols="12">
            <v-card class="rounded-2xl pa-4 pa-sm-5" elevation="0" outlined>
              <div class="text-caption font-weight-bold text-uppercase mb-2 tracking-wide text--secondary">
                Select payment method
              </div>
              <v-select
                v-model="paymentMethod"
                :items="paymentMethods"
                item-text="label"
                item-value="value"
                dense
                outlined
                rounded
                hide-details
                class="mb-4"
                style="background: #f5f5f5; max-width: 260px;"
              />

              <div class="text-caption font-weight-bold text-uppercase mb-2 tracking-wide text--secondary">
                Select below to proceed
              </div>

              <v-row dense>
                <v-col cols="6">
                  <v-btn
                    block rounded large elevation="0" color="#8051FF" dark
                    class="action-btn" @click="goToVerify"
                  >
                    <v-icon left>mdi-card-search-outline</v-icon>
                    <span class="text-capitalize" style="font-size: 0.85rem;">Verify payment</span>
                  </v-btn>
                </v-col>
                <v-col cols="6">
                  <v-btn
                    block rounded large elevation="0" color="#8051FF" dark
                    class="action-btn" @click="goToMakePayment"
                  >
                    <v-icon left>mdi-cellphone-wireless</v-icon>
                    <span class="text-capitalize" style="font-size: 0.85rem;">make payment</span>
                  </v-btn>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <!-- STEP 3: Payment entry -->
        <v-row class="mt-4 reveal-card" style="animation-delay: 150ms">
          <v-col cols="12">
            <v-card class="rounded-2xl pa-4 pa-sm-5" elevation="0" outlined>
              <!-- STK mode -->
              <div v-if="mode === 'stk'">
                <div class="text-h6 font-weight-bold text--primary mb-1">
                  Provide M-Pesa number
                </div>
                <div class="text-caption text--secondary mb-4">
                  Provide M-Pesa number in the correct format (e.g. 254712345678)
                </div>

                <v-text-field
                  v-model="mpesaNumber"
                  placeholder="254712345678"
                  outlined rounded dense hide-details
                  prepend-inner-icon="mdi-phone"
                  class="mb-4"
                  :rules="[v => !!v || 'M-Pesa number is required']"
                  :disabled="waitingForMpesa"
                />

                <div class="d-flex justify-space-between align-center">
                  <div>
                    <div class="text-caption text--secondary">Amount to pay</div>
                    <div class="text-h6 font-weight-bold text--primary">
                      KES {{ formatNum(paymentAmount) }}
                    </div>
                  </div>
                  <v-btn
                    large rounded dark elevation="0" color="#1e1e1e"
                    class="text-capitalize"
                    :loading="submitting"
                    :disabled="!canSubmitStk || waitingForMpesa"
                    @click="submitStkPush"
                  >
                    Make payment
                  </v-btn>
                </div>

                <!-- ⚡ Polling indicator -->
                <v-card
                  v-if="waitingForMpesa"
                  color="#fff8e1"
                  class="rounded-2xl mt-4 pa-4"
                  elevation="0"
                >
                  <div class="d-flex align-center">
                    <div class="timer-ring mr-4">{{ timerCount }}</div>
                    <div class="flex-grow-1">
                      <div class="font-weight-bold" style="color: #f57c00;">
                        Waiting for M-Pesa confirmation
                      </div>
                      <div class="text-caption grey--text text--darken-1 mt-1">
                        Check your phone and enter your PIN.
                      </div>
                    </div>
                  </div>
                </v-card>
              </div>

              <!-- Verify mode -->
              <div v-else-if="mode === 'verify'">
                <div class="text-h6 font-weight-bold text--primary mb-1">
                  Provide M-Pesa Receipt
                </div>
                <div class="text-caption text--secondary mb-4">
                  Provide M-Pesa Receipt to verify your payment
                </div>

                <v-text-field
                  v-model="mpesaReceipt"
                  placeholder="TR45FTY"
                  outlined rounded dense hide-details
                  prepend-inner-icon="mdi-receipt"
                  class="mb-4"
                  :rules="[v => !!v || 'M-Pesa receipt is required']"
                />

                <v-btn
                  block large rounded elevation="0" color="#8051FF" dark
                  class="text-capitalize"
                  :loading="verifying"
                  :disabled="!mpesaReceipt"
                  @click="submitVerify"
                >
                  Verify payment
                </v-btn>
              </div>

              <!-- Idle -->
              <div v-else class="text-center py-4">
                <v-icon size="48" color="grey lighten-2">mdi-cellphone-arrow-down</v-icon>
                <div class="text-body-2 grey--text mt-2">
                  Pick a service charge and a method to continue.
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Selected summary -->
        <v-row v-if="selectedCharge" class="mt-4 reveal-card" style="animation-delay: 200ms">
          <v-col cols="12">
            <v-card color="#ede9fe" class="rounded-2xl pa-4" elevation="0">
              <div class="d-flex align-center">
                <v-avatar color="#8051FF" size="36" class="mr-3">
                  <v-icon color="white" small>mdi-information-outline</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-caption text--secondary">You are paying for</div>
                  <div class="font-weight-bold purple--text">
                    {{ selectedCharge.charge_type }} — KES {{ formatNum(selectedCharge.amount) }}
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- Success dialog -->
      <v-dialog v-model="successDialog" max-width="420" persistent>
        <v-card class="rounded-2xl pa-2">
          <v-card-text class="text-center pa-6">
            <v-avatar color="success lighten-5" size="72" class="mb-3">
              <v-icon color="success" size="40">mdi-check-circle</v-icon>
            </v-avatar>
            <div class="text-h6 font-weight-bold text--primary">
              {{ successTitle }}
            </div>
            <div class="text-body-2 text--secondary mt-2">
              {{ successMessage }}
            </div>
            <v-btn
              block rounded large color="#8051FF" dark elevation="0"
              class="mt-5 text-capitalize"
              @click="afterSuccess"
            >
              Done
            </v-btn>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        :timeout="5000"
        bottom rounded="pill"
        class="mb-6 snackbar-premium"
        elevation="6"
      >
        <div class="d-flex align-center">
          <v-avatar
            :color="snackbar.color === 'success' ? 'success darken-2' : snackbar.color === 'warning' ? 'warning darken-2' : snackbar.color === 'info' ? 'info darken-2' : 'error darken-2'"
            size="28" class="mr-3"
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
        { label: 'M-Pesa', value: 'mpesa' },
        { label: 'Cash',   value: 'cash' },
      ],

      mode: null,
      mpesaNumber: '',
      mpesaReceipt: '',

      successDialog: false,
      successTitle: '',
      successMessage: '',

      snackbar: { show: false, text: '', color: 'success' },

      // ⚡ Polling
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
        weekday: 'long',
        month: 'long',
        day: 'numeric',
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
    // ⚡ Timer tick — fires every second while enabled
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

        // SUCCESS
        if (resultCode === '0' || mpesaStatus === 'success') {
          this.waitingForMpesa = false;
          this.successTitle = 'Payment received!';
          this.successMessage = `Your payment of KES ${this.formatNum(this.paymentAmount)} has been recorded.`;
          this.successDialog = true;
          return;
        }

        // CANCELLED
        if (resultCode === '1032') {
          this.waitingForMpesa = false;
          this.showSnackbar('You cancelled the payment on your phone.', 'warning');
          return;
        }

        // WRONG PIN
        if (resultCode === '2001') {
          this.waitingForMpesa = false;
          this.showSnackbar('Wrong M-Pesa PIN. Please try again.', 'warning');
          return;
        }

        // INSUFFICIENT BALANCE
        if (resultCode === '1') {
          this.waitingForMpesa = false;
          this.showSnackbar('Insufficient M-Pesa balance.', 'warning');
          return;
        }

        // INVALID NUMBER
        if (resultCode === '1001') {
          this.waitingForMpesa = false;
          this.showSnackbar('Invalid phone number.', 'warning');
          return;
        }

        // TIMEOUT
        if (resultCode === '1002') {
          this.waitingForMpesa = false;
          this.showSnackbar('M-Pesa request timed out. Try again.', 'warning');
          return;
        }

        // GENERIC FAIL
        if (mpesaStatus === 'failed') {
          this.waitingForMpesa = false;
          this.showSnackbar(resultDesc || 'Payment failed.', 'warning');
          return;
        }

        // STILL PENDING
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

    // =====================================================
    // AFTER SUCCESS
    // =====================================================
    afterSuccess() {
      this.successDialog = false;
      this.resetPolling();
      setTimeout(() => {
        this.goTo(this.dashboardRoute);
      }, 400);
    },

    // =====================================================
    // HELPERS
    // =====================================================
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
.cursor-pointer { cursor: pointer; }
.bg-surface { background-color: #f8fafc !important; }
.rounded-2xl { border-radius: 20px !important; }
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
}
.page-title { letter-spacing: -0.5px; }

.charge-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  overflow: hidden;
}
.charge-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2) !important;
}
.charge-selected {
  outline: 2px solid #22c55e;
  outline-offset: 2px;
}
.check-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 22px;
}

.action-btn {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(128, 81, 255, 0.35) !important;
}

/* Timer ring — matches your subscription page */
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
  box-shadow: 0 0 20px rgba(245, 124, 0, 0.2);
  flex-shrink: 0;
}

.snackbar-premium ::v-deep .v-snackbar__content { padding: 12px 20px; }

.bottom-nav-premium {
  border-top: 1px solid #e2e8f0 !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(12px);
}
.mobile-nav-btn { min-width: 0 !important; }
.mobile-nav-label { font-size: 10px; margin-top: 2px; }

@media (max-width: 599px) {
  .sticky-header-premium { padding-left: 12px; padding-right: 12px; }
  .reveal-card { animation-duration: 0.4s; }
}
</style>