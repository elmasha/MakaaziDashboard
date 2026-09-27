<template>
  <div class="auth-root">
    <!-- Background + overlay -->
    <div class="auth-bg" :style="{ backgroundImage: `url(${registerbg})` }"></div>
    <div class="auth-overlay"></div>

    <!-- Top bar -->
    <div class="auth-topbar">
      <div class="brand" @click="goTo('/')">
        <div class="brand-avatar">
          <v-icon color="white" size="20">mdi-home-account</v-icon>
        </div>
        <div class="brand-text">
          <span class="brand-mk">Ma</span><span class="brand-kz">kaazi</span>
          <span class="brand-role">Resident</span>
        </div>
      </div>
      <button class="back-btn" @click="goTo('/')">
        <v-icon size="16" class="mr-1">mdi-arrow-left</v-icon>
        Back
      </button>
    </div>

    <!-- Main card -->
    <div class="auth-wrap">
      <div class="auth-card">
        <!-- Progress bar -->
        <div v-show="progress_bar" class="auth-progress">
          <div class="auth-progress-bar"></div>
        </div>

        <!-- Left: brand hero (desktop only) -->
        <div class="auth-hero hidden-xs-only">
          <div class="hero-badge">
            <v-icon size="18" color="white">mdi-home-heart</v-icon>
            <span>Resident Portal</span>
          </div>
          <div class="hero-title">
            Your home,<br />at your fingertips
          </div>
          <div class="hero-sub">
            Track your payments, view your household profile, and stay up to date with your estate.
          </div>
          <div class="hero-features">
            <div class="hero-feature">
              <v-icon size="16" color="#9b6cff">mdi-cash-multiple</v-icon>
              <span>View your payment history</span>
            </div>
            <div class="hero-feature">
              <v-icon size="16" color="#9b6cff">mdi-account-circle-outline</v-icon>
              <span>Manage your household</span>
            </div>
            <div class="hero-feature">
              <v-icon size="16" color="#9b6cff">mdi-bell-outline</v-icon>
              <span>Get estate notifications</span>
            </div>
            <div class="hero-feature">
              <v-icon size="16" color="#9b6cff">mdi-cellphone-wireless</v-icon>
              <span>Pay via M-Pesa in seconds</span>
            </div>
          </div>
        </div>

        <!-- Right: form side -->
        <div class="auth-form-side">
          <div class="form-logo">
            <v-icon size="30" color="white">mdi-home-account</v-icon>
          </div>

          <div class="form-title">
            {{ mode === 'login' ? 'Welcome back' : 'Create your account' }}
          </div>
          <div class="form-sub">
            {{ mode === 'login'
              ? 'Sign in to view your payments and account'
              : 'Set up your login and household details in three quick steps' }}
          </div>

          <!-- Tab toggle -->
          <div class="tab-wrap">
            <button
              class="tab-btn"
              :class="{ 'tab-btn-active': mode === 'login' }"
              @click="mode = 'login'"
            >
              <v-icon size="16">mdi-login</v-icon>
              Sign in
            </button>
            <button
              class="tab-btn"
              :class="{ 'tab-btn-active': mode === 'register' }"
              @click="mode = 'register'"
            >
              <v-icon size="16">mdi-account-plus</v-icon>
              Register
            </button>
          </div>

          <!-- ==================================================== -->
          <!-- PENDING / REJECTED BANNER                            -->
          <!-- ==================================================== -->
          <transition name="fade">
            <div
              v-if="mode === 'register' && registrationStatus && registrationStatus !== 'Approved'"
              class="status-banner"
              :class="registrationStatus === 'Pending' ? 'status-banner-pending' : 'status-banner-rejected'"
            >
              <div class="status-banner-icon">
                <v-icon size="18" color="white">
                  {{ registrationStatus === 'Pending' ? 'mdi-clock-outline' : 'mdi-close-circle-outline' }}
                </v-icon>
              </div>
              <div class="status-banner-body">
                <div class="status-banner-title">
                  {{ registrationStatus === 'Pending' ? 'Registration pending' : 'Registration rejected' }}
                </div>
                <div class="status-banner-text">
                  {{ registrationStatus === 'Pending'
                    ? 'An estate official will review your registration shortly.'
                    : 'Your registration was not approved. Contact your estate officials.' }}
                </div>
                <div v-if="rejectionReason" class="status-banner-reason">
                  <strong>Reason:</strong> {{ rejectionReason }}
                </div>
                <button class="status-banner-btn" @click="checkStatus">
                  <v-icon size="14" class="mr-1">mdi-refresh</v-icon>
                  Refresh status
                </button>
              </div>
            </div>
          </transition>

          <!-- ==================================================== -->
          <!-- LOGIN FORM                                           -->
          <!-- ==================================================== -->
          <div v-if="mode === 'login'" class="form-body">
            <v-form ref="loginForm" v-model="loginValid" lazy-validation>
              <div class="field-block">
                <label class="field-label">Email</label>
                <div class="field-input-wrap">
                  <v-icon size="16" class="field-icon">mdi-email-outline</v-icon>
                  <input
                    v-model="auth.email"
                    class="field-input"
                    type="email"
                    placeholder="your@email.com"
                    @keyup.enter="login"
                  />
                </div>
              </div>

              <div class="field-block">
                <label class="field-label">Password</label>
                <div class="field-input-wrap">
                  <v-icon size="16" class="field-icon">mdi-lock-outline</v-icon>
                  <input
                    v-model="auth.password"
                    class="field-input field-input-with-toggle"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="••••••••"
                    @keyup.enter="login"
                  />
                  <button
                    class="field-toggle"
                    type="button"
                    @click="showPassword = !showPassword"
                  >
                    <v-icon size="16">
                      {{ showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}
                    </v-icon>
                  </button>
                </div>
              </div>

              <label class="checkbox-row">
                <input
                  v-model="checkbox"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span class="checkbox-box">
                  <v-icon v-if="checkbox" size="14" color="white">mdi-check</v-icon>
                </span>
                <span class="checkbox-text">
                  I agree to the terms and conditions
                </span>
              </label>

              <button
                class="submit-btn"
                :disabled="progress_bar"
                @click.prevent="login"
              >
                <v-icon v-if="progress_bar" size="16" class="spin mr-1">mdi-loading</v-icon>
                <v-icon v-else size="16" class="mr-1">mdi-login</v-icon>
                {{ progress_bar ? 'Signing in…' : 'Sign in' }}
              </button>
            </v-form>

            <div class="divider">
              <span>Or continue with</span>
            </div>

            <button class="google-btn" :disabled="progress_bar" @click="signInGoogle">
              <v-img :src="google" height="18" contain class="google-img"></v-img>
              <span>Sign in with Google</span>
            </button>

            <div class="alt-links">
              <div class="alt-row">
                <span class="alt-label">Don't have an account?</span>
                <a class="alt-link alt-link-purple" @click="mode = 'register'">
                  Create one
                </a>
              </div>
            </div>
          </div>

          <!-- ==================================================== -->
          <!-- REGISTER FORM — 3 STEPS                              -->
          <!-- ==================================================== -->
          <div v-else class="form-body">
            <!-- Stepper -->
            <div class="stepper-wrap">
              <div class="stepper-track"></div>
              <div class="stepper-fill" :style="{ width: `${(step / (steps.length - 1)) * 100}%` }"></div>
              <button
                v-for="(s, i) in steps"
                :key="i"
                class="step-dot"
                :class="{ 'step-dot-active': step === i, 'step-dot-done': step > i }"
                @click="step = i"
              >
                <v-icon size="16">
                  {{ step > i ? 'mdi-check' : s.icon }}
                </v-icon>
              </button>
            </div>

            <div class="step-header">
              <div class="step-title">{{ steps[step].title }}</div>
              <div class="step-sub">{{ steps[step].subtitle }}</div>
            </div>

            <v-form ref="form" v-model="valid" lazy-validation>
              <!-- STEP 1 — Login credentials -->
              <div v-show="step === 0">
                <div class="field-block">
                  <label class="field-label">Email <span class="required">*</span></label>
                  <div class="field-input-wrap">
                    <v-icon size="16" class="field-icon">mdi-email-outline</v-icon>
                    <input v-model="auth.email" class="field-input" type="email" placeholder="your@email.com" />
                  </div>
                </div>

                <div class="field-block">
                  <label class="field-label">Password <span class="required">*</span></label>
                  <div class="field-input-wrap">
                    <v-icon size="16" class="field-icon">mdi-lock-outline</v-icon>
                    <input
                      v-model="auth.password"
                      class="field-input field-input-with-toggle"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="At least 6 characters"
                    />
                    <button class="field-toggle" type="button" @click="showPassword = !showPassword">
                      <v-icon size="16">{{ showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}</v-icon>
                    </button>
                  </div>
                </div>

                <div class="field-block">
                  <label class="field-label">Confirm password <span class="required">*</span></label>
                  <div class="field-input-wrap">
                    <v-icon size="16" class="field-icon">mdi-lock-check-outline</v-icon>
                    <input
                      v-model="auth.confirmPassword"
                      class="field-input"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="Repeat your password"
                    />
                  </div>
                </div>
              </div>

              <!-- STEP 2 — Estate + address -->
              <div v-show="step === 1">
                <div class="field-block">
                  <label class="field-label">Which estate are you from? <span class="required">*</span></label>
                  <v-autocomplete
                    v-model="estateName"
                    :loading="loadingEstates"
                    :items="estateNames"
                    :search-input.sync="search"
                    cache-items
                    @change="onEstateChange"
                    dense
                    outlined
                    rounded
                    hide-details
                    placeholder="Start typing your estate name"
                  ></v-autocomplete>
                </div>

                <div v-if="estate_id" class="estate-chip">
                  <v-icon size="14" color="#8051ff">mdi-office-building-outline</v-icon>
                  Estate: {{ estate_id }} · {{ estate_urn }}
                </div>

                <div v-if="showSectionField" class="field-block">
                  <label class="field-label">Section / Zone / Phase <span class="required">*</span></label>
                  <select v-model="form.section" class="field-select">
                    <option :value="null">Select a section</option>
                    <option v-for="s in dropdowns.sections" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>

                <div v-if="showCourtField" class="field-block">
                  <label class="field-label">Court <span class="required">*</span></label>
                  <select v-model="form.court" class="field-select">
                    <option :value="null">Select a court</option>
                    <option v-for="c in dropdowns.courts" :key="c" :value="c">{{ c }}</option>
                  </select>
                </div>

                <div v-if="showStreetField" class="field-block">
                  <label class="field-label">Street / Lane / Avenue <span class="required">*</span></label>
                  <select v-model="form.street" class="field-select">
                    <option :value="null">Select a street</option>
                    <option v-for="s in dropdowns.streets" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>

                <div v-if="estate_id && !showAnyAddressField" class="info-block">
                  <v-icon size="14" color="#8051ff" class="mr-2">mdi-information-outline</v-icon>
                  This estate doesn't use section / court / street breakdown.
                </div>
              </div>

              <!-- STEP 3 — Household details -->
              <div v-show="step === 2">
                <div class="field-block">
                  <label class="field-label">Household Name / Primary Owner <span class="required">*</span></label>
                  <div class="field-input-wrap">
                    <v-icon size="16" class="field-icon">mdi-account-outline</v-icon>
                    <input v-model="form.primary_owner" class="field-input" type="text" placeholder="e.g. John Kamau" />
                  </div>
                </div>

                <div class="field-block">
                  <label class="field-label">House Number</label>
                  <div class="field-input-wrap">
                    <v-icon size="16" class="field-icon">mdi-home-outline</v-icon>
                    <input v-model="form.house_number" class="field-input" type="text" placeholder="e.g. H233" />
                  </div>
                </div>

                <div class="field-block">
                  <label class="field-label">Mobile Contact <span class="required">*</span></label>
                  <div class="field-input-wrap">
                    <v-icon size="16" class="field-icon">mdi-phone-outline</v-icon>
                    <input
                      v-model="form.contact_number"
                      class="field-input"
                      type="tel"
                      placeholder="254712345678"
                    />
                  </div>
                </div>

                <div class="field-block">
                  <label class="field-label">Residence Status <span class="required">*</span></label>
                  <select
                    v-model="form.residence_status"
                    class="field-select"
                    @change="onResidenceStatusChange"
                  >
                    <option v-for="s in residenceStatuses" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>

                <div class="field-block">
                  <label class="field-label">Spouse Name</label>
                  <div class="field-input-wrap">
                    <v-icon size="16" class="field-icon">mdi-account-multiple-outline</v-icon>
                    <input v-model="form.spouse_name" class="field-input" type="text" placeholder="Optional" />
                  </div>
                </div>

                <div class="field-block">
                  <label class="field-label">Spouse Contact</label>
                  <div class="field-input-wrap">
                    <v-icon size="16" class="field-icon">mdi-phone-outline</v-icon>
                    <input v-model="form.spouse_contact" class="field-input" type="tel" placeholder="Optional" />
                  </div>
                </div>

                <template v-if="caretakerRequired">
                  <div class="info-block info-block-amber">
                    <v-icon size="14" color="#b45309" class="mr-2">mdi-alert-circle-outline</v-icon>
                    Caretaker details are required for <strong>{{ form.residence_status }}</strong>.
                  </div>
                  <div class="field-block">
                    <label class="field-label">Caretaker Name <span class="required">*</span></label>
                    <div class="field-input-wrap">
                      <v-icon size="16" class="field-icon">mdi-account-tie-outline</v-icon>
                      <input v-model="form.caretaker_name" class="field-input" type="text" placeholder="Caretaker's full name" />
                    </div>
                  </div>
                  <div class="field-block">
                    <label class="field-label">Caretaker Contact <span class="required">*</span></label>
                    <div class="field-input-wrap">
                      <v-icon size="16" class="field-icon">mdi-phone-outline</v-icon>
                      <input v-model="form.caretaker_contact" class="field-input" type="tel" placeholder="254712345678" />
                    </div>
                  </div>
                </template>

                <label class="checkbox-row">
                  <input v-model="checkbox" type="checkbox" class="checkbox-input" />
                  <span class="checkbox-box">
                    <v-icon v-if="checkbox" size="14" color="white">mdi-check</v-icon>
                  </span>
                  <span class="checkbox-text">I agree to the terms and conditions</span>
                </label>
              </div>
            </v-form>

            <!-- Step actions -->
            <div class="step-actions">
              <button
                v-if="step > 0"
                class="step-btn step-btn-ghost"
                :disabled="submitting"
                @click="step--"
              >
                <v-icon size="14" class="mr-1">mdi-chevron-left</v-icon>
                Back
              </button>

              <button
                v-if="step < steps.length - 1"
                class="step-btn step-btn-primary"
                @click="nextStep"
              >
                Next
                <v-icon size="14" class="ml-1">mdi-chevron-right</v-icon>
              </button>

              <button
                v-else
                class="step-btn step-btn-primary"
                :disabled="submitting"
                @click="submitRegistration"
              >
                <v-icon size="14" :class="['mr-1', { spin: submitting }]">
                  {{ submitting ? 'mdi-loading' : 'mdi-account-check' }}
                </v-icon>
                {{ submitting ? 'Submitting…' : 'Submit' }}
              </button>
            </div>

            <div class="alt-links">
              <div class="alt-row">
                <span class="alt-label">Already have an account?</span>
                <a class="alt-link alt-link-purple" @click="mode = 'login'">
                  Sign in
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <v-snackbar color="white--text" :timeout="4000" v-model="snackbar" center>
      {{ snackbarText }}
    </v-snackbar>
    <v-snackbar color="red" :timeout="4000" v-model="snackbar2" outlined bottom center>
      {{ snackbarText2 }}
    </v-snackbar>
  </div>
</template>

<script>
import axios from 'axios';

const API = 'https://makaaziserver22.up.railway.app/api';

export default {
  name: 'HouseholdAuth',
  data() {
    return {
      // ⚡ Sign-in is the default
      mode: 'login',

      snackbar: false,
      snackbarText: 'No error message',
      snackbar2: false,
      snackbarText2: '',

      registerbg: require('@/assets/login_bg.png'),
      google: require('@/assets/google.png'),

      progress_bar: false,
      submitting: false,
      loadingEstates: false,
      checkbox: false,
      valid: true,
      loginValid: true,
      showPassword: false,

      step: 0,
      steps: [
        { icon: 'mdi-account-lock', title: 'Account setup',    subtitle: 'Create your login credentials' },
        { icon: 'mdi-map-marker',   title: 'Estate & address', subtitle: 'Where do you live?' },
        { icon: 'mdi-home-account', title: 'Household details', subtitle: 'Tell us about your household' },
      ],

      auth: {
        email: '',
        password: '',
        confirmPassword: '',
      },

      estates: [],
      estateNames: [],
      search: null,
      estateName: null,
      estate_id: 0,
      estate_urn: null,

      dropdowns: { sections: [], courts: [], streets: [] },
      addressConfig: {
        show_section: true,
        show_court: true,
        show_street: true,
      },

      residenceStatuses: ['Resident', 'Non-resident', 'Developing'],

      form: {
        estate_id: null,
        primary_owner: '',
        contact_number: '',
        residence_status: 'Resident',
        section: null,
        court: null,
        street: null,
        house_number: null,
        spouse_name: null,
        spouse_contact: null,
        caretaker_name: null,
        caretaker_contact: null,
        take_on_balance: 0,
        uid: null,
      },

      registrationStatus: null,
      rejectionReason: null,
    };
  },
  computed: {
    caretakerRequired() {
      const s = (this.form.residence_status || '').trim().toLowerCase();
      return s === 'non-resident' || s === 'non resident' || s === 'developing';
    },
    showSectionField() {
      return this.addressConfig.show_section && this.dropdowns.sections.length > 0;
    },
    showCourtField() {
      return this.addressConfig.show_court && this.dropdowns.courts.length > 0;
    },
    showStreetField() {
      return this.addressConfig.show_street && this.dropdowns.streets.length > 0;
    },
    showAnyAddressField() {
      return this.showSectionField || this.showCourtField || this.showStreetField;
    },
    phoneRules() {
      return [
        (v) => !!v || 'Phone number is required',
        (v) =>
          /^(\+?254|0)?[17]\d{8}$/.test((v || '').replace(/\s/g, '')) ||
          'Enter a valid Kenyan phone number',
      ];
    },
    caretakerPhoneRules() {
      return [
        (v) => !!v || 'Caretaker contact is required',
        (v) =>
          /^(\+?254|0)?[17]\d{8}$/.test((v || '').replace(/\s/g, '')) ||
          'Enter a valid Kenyan phone number',
      ];
    },
    emailRules() {
      return [
        (v) => !!v || 'E-mail is required',
        (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
      ];
    },
    passwordRules() {
      return [
        (v) => !!v || 'Password is required',
        (v) => (v || '').length >= 6 || 'At least 6 characters',
      ];
    },
    confirmPasswordRules() {
      return [
        (v) => !!v || 'Please confirm your password',
        (v) => v === this.auth.password || 'Passwords do not match',
      ];
    },
  },
  watch: {
    search(val) {
      val && val !== this.estateName && this.querySelections(val);
    },
    mode(val) {
      if (val === 'login') {
        this.registrationStatus = null;
        this.rejectionReason = null;
      } else {
        this.step = 0;
      }
    },
  },
  mounted() {
    if (this.$fire?.auth?.currentUser) {
      const u = this.$fire.auth.currentUser;
      this.form.uid = u.uid;
      this.form.contact_number = this.form.contact_number || u.phoneNumber || '';
      this.auth.email = this.auth.email || u.email || '';
    }

    this.checkStatus();
    this.Fetch_PostAllEstates();
  },
  methods: {
    goTo(path) {
      if (!path) return;
      try {
        if (this.$router && typeof this.$router.push === 'function') {
          const result = this.$router.push(path);
          if (result && typeof result.catch === 'function') result.catch(() => {});
        } else {
          window.location.href = path;
        }
      } catch {
        window.location.href = path;
      }
    },

    // =====================================================
    // STEPPER NAVIGATION
    // =====================================================
    nextStep() {
      if (this.step === 0) {
        if (!this._validateCredentials()) return;
      } else if (this.step === 1) {
        if (!this.estate_id) {
          this.snackbar2 = true;
          this.snackbarText2 = 'Please select your estate';
          return;
        }
        if (this.showSectionField && !this.form.section) {
          this.snackbar2 = true;
          this.snackbarText2 = 'Please select a section';
          return;
        }
        if (this.showCourtField && !this.form.court) {
          this.snackbar2 = true;
          this.snackbarText2 = 'Please select a court';
          return;
        }
        if (this.showStreetField && !this.form.street) {
          this.snackbar2 = true;
          this.snackbarText2 = 'Please select a street';
          return;
        }
      }
      this.step++;
    },

    _validateCredentials() {
      if (!this.auth.email || !/.+@.+\..+/.test(this.auth.email)) {
        this.snackbar2 = true;
        this.snackbarText2 = 'Please enter a valid email';
        return false;
      }
      if (!this.auth.password || this.auth.password.length < 6) {
        this.snackbar2 = true;
        this.snackbarText2 = 'Password must be at least 6 characters';
        return false;
      }
      if (this.auth.password !== this.auth.confirmPassword) {
        this.snackbar2 = true;
        this.snackbarText2 = 'Passwords do not match';
        return false;
      }
      return true;
    },

    // =====================================================
    // SIGN IN
    // =====================================================
    async login() {
      const that = this;

      if (that.$refs.loginForm && !that.$refs.loginForm.validate()) {
        that.snackbar2 = true;
        that.snackbarText2 = 'Please fix the highlighted fields';
        return;
      }
      if (!that.checkbox) {
        that.snackbar2 = true;
        that.snackbarText2 = 'You must agree to the terms';
        return;
      }

      that.progress_bar = true;

      try {
        const mAuth = that.$fire.auth;
        const { user } = await mAuth.signInWithEmailAndPassword(
          that.auth.email,
          that.auth.password
        );
        that.form.uid = user.uid;
        await that.routeToDashboard(user.uid);
      } catch (error) {
        console.error('Login error:', error);
        that.progress_bar = false;
        that.snackbar2 = true;
        that.snackbarText2 = that.friendlyError(error);
      }
    },

    async signInGoogle() {
      const that = this;
      if (!that.checkbox) {
        that.snackbar2 = true;
        that.snackbarText2 = 'Check terms and conditions first';
        return;
      }
      that.progress_bar = true;
      try {
        const provider = new that.$fireModule.auth.GoogleAuthProvider();
        const { user } = await that.$fire.auth.signInWithPopup(provider);
        that.form.uid = user.uid;
        await that.routeToDashboard(user.uid);
      } catch (error) {
        console.error('Google sign-in error:', error);
        that.progress_bar = false;
        that.snackbar2 = true;
        that.snackbarText2 = error.message || 'Google sign-in failed';
      }
    },

    async routeToDashboard(uid) {
      const that = this;
      try {
        const { data, status } = await axios.get(
          `${API}/households/getHouseHoldId/${uid}`
        );

        if (status === 200 && data?.household_id) {
          if (data.status === 'Approved' || data.status === 'Pending') {
            that.snackbar = true;
            that.snackbarText = data.status === 'Approved'
              ? `Welcome back, ${data.primary_owner || 'Resident'}!`
              : 'Your registration is pending approval';
            setTimeout(() => that.goTo(`/household/dashboard/${uid}`), 600);
          } else {
            that.mode = 'register';
            that.step = 2;
            that.registrationStatus = data.status;
            that.rejectionReason = data.rejection_reason || null;
            that.progress_bar = false;
          }
        }
      } catch (err) {
        that.progress_bar = false;
        if (err.response?.status === 404) {
          that.snackbar = true;
          that.snackbarText = 'No household found. Please complete registration.';
          that.mode = 'register';
          that.step = 0;
        } else {
          console.warn('Route lookup failed:', err.response?.data || err.message);
        }
      }
    },

    friendlyError(error) {
      const code = error?.code || '';
      const messages = {
        'auth/user-not-found': 'No account found with that email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-email': 'Please enter a valid email.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/too-many-requests': 'Too many attempts. Try again later.',
        'auth/invalid-credential': 'Invalid email or password.',
      };
      return messages[code] || error?.message || 'Sign in failed';
    },

    // =====================================================
    // REGISTRATION
    // =====================================================
    onResidenceStatusChange() {
      if (!this.caretakerRequired) {
        this.form.caretaker_name = null;
        this.form.caretaker_contact = null;
      }
    },

    async Fetch_PostAllEstates() {
      const that = this;
      that.loadingEstates = true;
      that.estates = [];
      that.estateNames = [];

      axios
        .get(`${API}/estates/getall`)
        .then((response) => {
          if (response.status === 200) {
            that.estates = response.data;
            that.estateNames = that.estates.map((item) => item.estate_name);
          }
        })
        .catch((error) => {
          console.error(error);
          that.snackbarText2 = error.message || 'Failed to load estates';
          that.snackbar2 = true;
        })
        .finally(() => {
          that.loadingEstates = false;
        });
    },

    querySelections(v) {
      this.loadingEstates = true;
      setTimeout(() => {
        this.estateNames = this.estates
          .map((e) => e.estate_name)
          .filter((e) => (e || '').toLowerCase().indexOf((v || '').toLowerCase()) > -1);
        this.loadingEstates = false;
      }, 300);
    },

    async onEstateChange(val) {
      const that = this;
      if (!val) return;

      that.form.section = null;
      that.form.court = null;
      that.form.street = null;
      that.dropdowns = { sections: [], courts: [], streets: [] };
      that.addressConfig = {
        show_section: true,
        show_court: true,
        show_street: true,
      };

      try {
        const { data: estate } = await axios.get(
          `${API}/estates/estateName/${encodeURIComponent(val)}`
        );
        that.estate_id = estate.estate_id;
        that.estate_urn = estate.estate_urn;
        that.form.estate_id = estate.estate_id;

        await Promise.all([
          that.fetchAddressConfig(estate.estate_id),
          that.fetchDropdowns(estate.estate_id),
        ]);
      } catch (error) {
        console.error('onEstateChange failed:', error.response?.data || error.message);
        that.snackbarText2 = error.message || 'Could not find estate';
        that.snackbar2 = true;
      }
    },

    async fetchAddressConfig(estateId) {
      const that = this;
      try {
        const { data, status } = await axios.get(
          `${API}/households/address-config/${estateId}`
        );
        if (status === 200 && data) {
          that.addressConfig = {
            show_section: data.show_section !== undefined ? !!data.show_section : true,
            show_court:   data.show_court   !== undefined ? !!data.show_court   : true,
            show_street:  data.show_street  !== undefined ? !!data.show_street  : true,
          };
        }
      } catch (error) {
        console.warn('Address config fetch failed:', error.message);
      }
    },

    async fetchDropdowns(estateId) {
      const that = this;
      try {
        const { data, status } = await axios.get(
          `${API}/households/address-dropdowns/${estateId}`
        );
        if (status === 200) {
          that.dropdowns = {
            sections: data.sections || [],
            courts:   data.courts   || [],
            streets:  data.streets  || [],
          };
        }
      } catch (error) {
        console.warn('Dropdowns fetch failed:', error.message);
      }
    },

    async submitRegistration() {
      const that = this;

      if (!that._validateCredentials()) { that.step = 0; return; }
      if (!that.form.estate_id) {
        that.step = 1; that.snackbar2 = true;
        that.snackbarText2 = 'Please select your estate'; return;
      }
      if (that.showSectionField && !that.form.section) {
        that.step = 1; that.snackbar2 = true;
        that.snackbarText2 = 'Please select a section'; return;
      }
      if (that.showCourtField && !that.form.court) {
        that.step = 1; that.snackbar2 = true;
        that.snackbarText2 = 'Please select a court'; return;
      }
      if (that.showStreetField && !that.form.street) {
        that.step = 1; that.snackbar2 = true;
        that.snackbarText2 = 'Please select a street'; return;
      }
      if (!that.form.primary_owner || !that.form.contact_number) {
        that.step = 2; that.snackbar2 = true;
        that.snackbarText2 = 'Please fill in all required fields'; return;
      }
      if (that.caretakerRequired) {
        if (!that.form.caretaker_name || !that.form.caretaker_contact) {
          that.step = 2; that.snackbar2 = true;
          that.snackbarText2 = 'Caretaker details are required'; return;
        }
      }
      if (!that.checkbox) {
        that.snackbar2 = true;
        that.snackbarText2 = 'You must agree to the terms'; return;
      }

      that.progress_bar = true;
      that.submitting = true;

      try {
        let uid = that.$fire?.auth?.currentUser?.uid;
        if (!uid) {
          try {
            const { user } = await that.$fire.auth.createUserWithEmailAndPassword(
              that.auth.email,
              that.auth.password
            );
            uid = user.uid;
            try {
              await user.updateProfile({ displayName: that.form.primary_owner });
            } catch {}
          } catch (authErr) {
            if (authErr.code === 'auth/email-already-in-use') {
              try {
                const { user } = await that.$fire.auth.signInWithEmailAndPassword(
                  that.auth.email,
                  that.auth.password
                );
                uid = user.uid;
              } catch (signInErr) {
                throw new Error('This email is already registered. Please sign in instead.');
              }
            } else {
              throw authErr;
            }
          }
        }

        const payload = {
          estate_id: that.form.estate_id,
          primary_owner: that.form.primary_owner.trim(),
          contact_number: that.form.contact_number.trim(),
          residence_status: that.form.residence_status,
          section: that.showSectionField ? that.form.section : null,
          court:   that.showCourtField   ? that.form.court   : null,
          street:  that.showStreetField  ? that.form.street  : null,
          house_number: that.form.house_number || null,
          spouse_name: that.form.spouse_name || null,
          spouse_contact: that.form.spouse_contact || null,
          caretaker_name: that.caretakerRequired ? (that.form.caretaker_name || null) : null,
          caretaker_contact: that.caretakerRequired ? (that.form.caretaker_contact || null) : null,
          take_on_balance: Number(that.form.take_on_balance) || 0,
          uid,
        };

        const response = await axios.post(`${API}/households/register`, payload);

        if (response.status === 201) {
          that.snackbar = true;
          that.snackbarText = 'Registration submitted — awaiting approval';
          setTimeout(() => {
            that.goTo(`/household/dashboard/${uid}`);
          }, 1000);
        }
      } catch (error) {
        console.error('Register failed:', error.response?.data || error.message);

        const fbCode = error.code || '';
        const fbMsgs = {
          'auth/email-already-in-use': 'This email is already registered. Please sign in.',
          'auth/invalid-email': 'Please enter a valid email.',
          'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
          'auth/operation-not-allowed': 'Email sign-up is not enabled. Contact support.',
        };

        that.snackbar2 = true;
        that.snackbarText2 =
          fbMsgs[fbCode] ||
          error.response?.data?.error ||
          error.message ||
          'Registration failed';
      } finally {
        that.progress_bar = false;
        that.submitting = false;
      }
    },

    checkStatus() {
      const that = this;
      const uid = that.$fire?.auth?.currentUser?.uid || that.form.uid;
      if (!uid) return;

      axios
        .get(`${API}/households/registration-status/${uid}`)
        .then((response) => {
          if (response.status === 200) {
            that.registrationStatus = response.data.status;
            that.rejectionReason = response.data.rejection_reason || null;

            if (response.data.status === 'Approved') {
              that.snackbar = true;
              that.snackbarText = 'Your registration is approved!';
              setTimeout(() => that.goTo(`/household/dashboard/${uid}`), 800);
            }
          }
        })
        .catch((error) => {
          if (error.response?.status !== 404) {
            console.warn('Status check failed:', error.message);
          }
        });
    },
  },
};
</script>

<style scoped>
/* ============================================================
   ROOT + BACKGROUND
   ============================================================ */
.auth-root {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #f6f7fb;
}
.auth-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(2px);
  transform: scale(1.05);
}
.auth-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(15, 13, 36, 0.55) 0%, rgba(43, 18, 86, 0.5) 100%);
}

/* ============================================================
   TOP BAR
   ============================================================ */
.auth-topbar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  gap: 12px;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.brand:hover { opacity: 0.85; }
.brand-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 24px -10px rgba(128, 81, 255, 0.7);
}
.brand-text {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  color: #ffffff;
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: -0.3px;
}
.brand-mk { color: #c4b5fd; }
.brand-kz { color: #b6ff00; }
.brand-role {
  font-size: 0.68rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.65);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-left: 2px;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}
.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

/* ============================================================
   CARD
   ============================================================ */
.auth-wrap {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  padding: 24px 20px 60px;
  min-height: calc(100vh - 100px);
  align-items: flex-start;
}
.auth-card {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 440px;
  max-width: 960px;
  width: 100%;
  background: #ffffff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 30px 70px -30px rgba(15, 13, 36, 0.6);
}
@media (max-width: 899px) {
  .auth-card {
    grid-template-columns: 1fr;
    max-width: 480px;
  }
}

.auth-progress {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(128, 81, 255, 0.15);
  overflow: hidden;
  z-index: 5;
}
.auth-progress-bar {
  height: 100%;
  width: 30%;
  background: linear-gradient(90deg, #9b6cff 0%, #8051ff 100%);
  border-radius: 999px;
  animation: progressSlide 1.2s ease-in-out infinite;
}
@keyframes progressSlide {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}

/* ============================================================
   HERO (desktop)
   ============================================================ */
.auth-hero {
  background: linear-gradient(140deg, #0a0a14 0%, #221047 55%, #2b1256 100%);
  padding: 40px 36px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.auth-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(155, 108, 255, 0.25), transparent 55%);
  pointer-events: none;
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  align-self: flex-start;
  margin-bottom: 24px;
}
.hero-title {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.8px;
  line-height: 1.2;
  margin-bottom: 14px;
}
.hero-sub {
  font-size: 0.88rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 28px;
  max-width: 320px;
}
.hero-features { display: flex; flex-direction: column; gap: 12px; }
.hero-feature {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}

/* ============================================================
   FORM SIDE
   ============================================================ */
.auth-form-side {
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
}
@media (max-width: 767px) {
  .auth-form-side { padding: 32px 22px 28px; }
}

.form-logo {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
  box-shadow: 0 12px 24px -12px rgba(128, 81, 255, 0.8);
}
.form-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.5px;
}
.form-sub {
  font-size: 0.82rem;
  color: #64748b;
  margin-top: 6px;
  line-height: 1.5;
}

/* Tab toggle */
.tab-wrap {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #f6f7fb;
  border: 1px solid #eef1f6;
  border-radius: 14px;
  margin-top: 22px;
}
.tab-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.2px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}
.tab-btn:hover { color: #0f0d24; }
.tab-btn-active {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  box-shadow: 0 8px 18px -10px rgba(128, 81, 255, 0.7);
}
.tab-btn-active:hover { color: #ffffff; }

/* Form body */
.form-body {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
}

/* Fields */
.field-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}
.field-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.9px;
}
.required { color: #dc2626; font-weight: 800; }

.field-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.field-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  pointer-events: none;
}
.field-input {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border-radius: 12px;
  border: 1.5px solid #eef1f6;
  background: #f8fafc;
  font-size: 0.88rem;
  font-weight: 600;
  color: #0f0d24;
  outline: none;
  font-family: inherit;
  transition: all 0.2s ease;
}
.field-input:focus {
  border-color: #8051ff;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(128, 81, 255, 0.1);
}
.field-input::placeholder { color: #94a3b8; font-weight: 500; }
.field-input-with-toggle { padding-right: 42px; }

.field-toggle {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}
.field-toggle:hover { color: #0f0d24; }

.field-select {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px solid #eef1f6;
  background: #f8fafc;
  font-size: 0.88rem;
  font-weight: 600;
  color: #0f0d24;
  outline: none;
  font-family: inherit;
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 38px;
  transition: all 0.2s ease;
}
.field-select:focus {
  border-color: #8051ff;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(128, 81, 255, 0.1);
}

/* Checkbox */
.checkbox-row {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
  margin: 6px 0 14px;
}
.checkbox-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.checkbox-box {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1.5px solid #cbd5e1;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}
.checkbox-input:checked + .checkbox-box {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  border-color: transparent;
  box-shadow: 0 6px 14px -6px rgba(128, 81, 255, 0.6);
}
.checkbox-text { display: inline; line-height: 1.4; }

/* Submit */
.submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 18px;
  border-radius: 12px;
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  font-size: 0.86rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  box-shadow: 0 14px 28px -14px rgba(128, 81, 255, 0.85);
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px -14px rgba(128, 81, 255, 1);
}
.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0 16px;
  color: #94a3b8;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #eef1f6;
}

/* Google */
.google-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 12px;
  background: #ffffff;
  border: 1.5px solid #eef1f6;
  color: #0f0d24;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}
.google-btn:hover:not(:disabled) {
  border-color: rgba(128, 81, 255, 0.4);
  background: rgba(128, 81, 255, 0.03);
}
.google-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.google-img { width: 18px; }

/* Alt links */
.alt-links {
  margin-top: auto;
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid #f1f5f9;
}
.alt-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 0.78rem;
  justify-content: center;
}
.alt-label { color: #64748b; font-weight: 600; }
.alt-link {
  font-weight: 800;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.alt-link:hover { opacity: 0.75; text-decoration: underline; }
.alt-link-purple { color: #8051ff; }

/* Status banner */
.status-banner {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  margin-top: 16px;
  border: 1px solid transparent;
}
.status-banner-pending {
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  border-color: #fed7aa;
}
.status-banner-rejected {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #fecaca;
}
.status-banner-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.status-banner-pending .status-banner-icon {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
}
.status-banner-rejected .status-banner-icon {
  background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
}
.status-banner-body { flex: 1; min-width: 0; }
.status-banner-title {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.2px;
}
.status-banner-text {
  font-size: 0.78rem;
  color: #64748b;
  margin-top: 3px;
  line-height: 1.5;
}
.status-banner-reason {
  font-size: 0.76rem;
  color: #b91c1c;
  margin-top: 6px;
}
.status-banner-btn {
  display: inline-flex;
  align-items: center;
  margin-top: 10px;
  padding: 7px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(15, 13, 36, 0.1);
  color: #0f0d24;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}
.status-banner-btn:hover { background: #ffffff; }

/* Estate chip + info blocks */
.estate-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(128, 81, 255, 0.08);
  border: 1px solid rgba(128, 81, 255, 0.18);
  color: #8051ff;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  margin-bottom: 14px;
  align-self: flex-start;
}
.info-block {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(128, 81, 255, 0.06);
  border: 1px solid rgba(128, 81, 255, 0.12);
  font-size: 0.78rem;
  color: #475569;
  font-weight: 500;
  line-height: 1.5;
  margin-bottom: 14px;
}
.info-block-amber {
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.25);
  color: #b45309;
}

/* Stepper */
.stepper-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 8px 0;
  margin-bottom: 18px;
}
.stepper-track {
  position: absolute;
  top: 50%;
  left: 28px;
  right: 28px;
  height: 2px;
  background: #eef1f6;
  transform: translateY(-50%);
  border-radius: 2px;
  z-index: 1;
}
.stepper-fill {
  position: absolute;
  top: 50%;
  left: 28px;
  height: 2px;
  background: linear-gradient(90deg, #9b6cff 0%, #8051ff 100%);
  transform: translateY(-50%);
  border-radius: 2px;
  z-index: 2;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-width: calc(100% - 56px);
}
.step-dot {
  position: relative;
  z-index: 3;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s ease;
}
.step-dot:hover { border-color: rgba(128, 81, 255, 0.35); }
.step-dot-active {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  border-color: transparent;
  color: #ffffff;
  box-shadow: 0 10px 20px -10px rgba(128, 81, 255, 0.8);
}
.step-dot-done {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  border-color: transparent;
  color: #0a0a14;
  box-shadow: 0 10px 20px -10px rgba(182, 255, 0, 0.7);
}

.step-header {
  text-align: center;
  margin-bottom: 18px;
}
.step-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
}
.step-sub {
  font-size: 0.76rem;
  color: #94a3b8;
  margin-top: 3px;
}

/* Step actions */
.step-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}
.step-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 13px 18px;
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}
.step-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.step-btn-ghost {
  background: #f6f7fb;
  color: #475569;
  border: 1px solid #eef1f6;
}
.step-btn-ghost:hover:not(:disabled) { background: #eef1f6; }
.step-btn-primary {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  box-shadow: 0 14px 28px -14px rgba(128, 81, 255, 0.85);
}
.step-btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px -14px rgba(128, 81, 255, 1);
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Spin */
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 599px) {
  .auth-topbar { padding: 14px 16px; }
  .brand-role { display: none; }
  .brand-avatar { width: 36px; height: 36px; }
  .brand-text { font-size: 0.98rem; }
  .back-btn { padding: 7px 12px; font-size: 0.72rem; }

  .auth-wrap { padding: 12px 12px 40px; }
  .auth-card { border-radius: 20px; }
  .auth-form-side { padding: 26px 18px 22px; }
  .form-logo { width: 48px; height: 48px; margin-bottom: 14px; }
  .form-title { font-size: 1.2rem; }
  .form-sub { font-size: 0.78rem; }
  .form-body { margin-top: 16px; }
  .field-input, .field-select { font-size: 0.84rem; padding-top: 11px; padding-bottom: 11px; }
  .step-dot { width: 34px; height: 34px; }
  .stepper-track { left: 24px; right: 24px; }
  .stepper-fill { left: 24px; max-width: calc(100% - 48px); }
}
</style>