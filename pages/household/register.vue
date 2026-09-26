<template>
  <v-img :src="registerbg" style="min-height: 100vh;">
    <v-app-bar color="#ffffff00" light elevation="0">
      <div class="d-flex align-center cursor-pointer" @click="goTo('/')">
        <v-avatar color="#8051FF" size="38" class="mr-3 elevation-2">
          <v-icon color="white" size="20">mdi-home-account</v-icon>
        </v-avatar>
        <v-toolbar-title style="color: black;">
          <span style="color: #8051FF; font-weight: 700;">Ma</span><span style="color: #7cb300; font-weight: 700;">kaazi</span>
          <span class="text-caption grey--text ml-2">Resident</span>
        </v-toolbar-title>
      </div>
      <v-spacer />
      <v-btn text small class="text-capitalize" @click="goTo('/')">
        <v-icon left small>mdi-arrow-left</v-icon>
        Back
      </v-btn>
    </v-app-bar>

    <div class="container" style="padding-bottom: 40px;">
      <v-card class="mx-auto" max-width="480" elevation="0" style="border-radius: 20px;">
        <v-progress-linear
          v-show="progress_bar"
          indeterminate
          color="#8051FF"
        ></v-progress-linear>

        <!-- Header -->
        <div class="text-center pt-6">
          <v-avatar color="#8051FF" size="64" class="elevation-3">
            <v-icon color="white" size="32">mdi-home-account</v-icon>
          </v-avatar>
        </div>

        <v-card-title style="color: black; font-size: 1.3rem; justify-content: center;">
          {{ mode === 'login' ? 'Welcome back' : 'Create your account' }}
        </v-card-title>
        <v-card-subtitle class="text-center">
          {{ mode === 'login'
            ? 'Sign in to view your payments and account'
            : 'Set up your login and household details in three quick steps' }}
        </v-card-subtitle>

        <!-- Tab toggle -->
        <div class="px-4 pt-2">
          <v-btn-toggle v-model="mode" mandatory rounded class="tab-toggle">
            <v-btn value="login" class="flex-grow-1 text-capitalize font-weight-bold">
              <v-icon left small>mdi-login</v-icon>
              Sign in
            </v-btn>
            <v-btn value="register" class="flex-grow-1 text-capitalize font-weight-bold">
              <v-icon left small>mdi-account-plus</v-icon>
              Register
            </v-btn>
          </v-btn-toggle>
        </div>

        <div class="pa-4">
          <!-- ==================================================== -->
          <!-- PENDING / REJECTED BANNER                            -->
          <!-- ==================================================== -->
          <v-card
            v-if="mode === 'register' && registrationStatus && registrationStatus !== 'Approved'"
            elevation="0"
            class="pa-4 mb-4"
            color="#ede9fe"
            rounded="lg"
          >
            <div class="d-flex align-center mb-2">
              <v-avatar color="#8051FF" size="32" class="mr-3">
                <v-icon color="white" small>
                  {{ registrationStatus === 'Pending' ? 'mdi-clock-outline' : 'mdi-close-circle-outline' }}
                </v-icon>
              </v-avatar>
              <div style="font-weight: 600; color: #8051FF;">
                {{ registrationStatus === 'Pending' ? 'Registration pending' : 'Registration rejected' }}
              </div>
            </div>
            <div style="font-size: 0.85rem;">
              {{ registrationStatus === 'Pending'
                ? 'An estate official will review your registration shortly.'
                : 'Your registration was not approved. Contact your estate officials.' }}
            </div>
            <div v-if="rejectionReason" class="mt-2" style="font-size: 0.85rem;">
              <strong>Reason:</strong> {{ rejectionReason }}
            </div>
            <v-btn text small color="#8051FF" class="mt-2" @click="checkStatus">
              <v-icon left small>mdi-refresh</v-icon> Refresh status
            </v-btn>
          </v-card>

          <!-- ==================================================== -->
          <!-- LOGIN FORM                                           -->
          <!-- ==================================================== -->
          <v-form v-if="mode === 'login'" ref="loginForm" v-model="loginValid" lazy-validation>
            <v-text-field
              v-model="auth.email"
              label="Email"
              type="email"
              rounded
              outlined
              prepend-inner-icon="mdi-email-outline"
              :rules="emailRules"
              required
            />

            <v-text-field
              v-model="auth.password"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              rounded
              outlined
              prepend-inner-icon="mdi-lock-outline"
              :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append="showPassword = !showPassword"
              :rules="passwordRules"
              required
              @keyup.enter="login"
            />

            <v-checkbox
              v-model="checkbox"
              :rules="[v => !!v || 'You must agree to continue!']"
              label="I agree to terms and conditions."
              class="mt-0"
              required
            />

            <v-btn
              rounded
              block
              color="#8051FF"
              dark
              large
              class="mt-2 text-capitalize font-weight-bold"
              :loading="progress_bar"
              :disabled="progress_bar"
              @click="login"
            >
              <v-icon left>mdi-login</v-icon>
              Sign in
            </v-btn>

            <div class="text-center my-4">
              <span class="text-caption grey--text">Or continue with</span>
            </div>

            <div class="d-flex" style="gap: 8px;">
              <v-btn
                outlined
                rounded
                block
                class="text-capitalize"
                @click="signInGoogle"
              >
                <v-img contain :src="google" height="18" class="mr-2" style="max-width: 18px;" />
                Google
              </v-btn>
            </div>

            <div class="text-center mt-5">
              <span class="text-caption grey--text">Don't have an account?</span>
              <a class="text-caption font-weight-bold ml-1" style="color: #8051FF;" @click="mode = 'register'">
                Create one
              </a>
            </div>
          </v-form>

          <!-- ==================================================== -->
          <!-- REGISTER FORM — 3 STEPS                              -->
          <!-- ==================================================== -->
          <div v-else>
            <!-- Stepper header -->
            <div class="stepper-dots mb-4">
              <div
                v-for="(s, i) in steps"
                :key="i"
                class="step-dot"
                :class="{ active: step === i, done: step > i }"
                @click="step = i"
              >
                <v-icon small :color="step > i ? 'white' : step === i ? 'white' : '#94a3b8'">
                  {{ step > i ? 'mdi-check' : s.icon }}
                </v-icon>
              </div>
              <div class="step-line" :style="`width: calc(${step} * 50%);`"></div>
            </div>

            <div class="text-center mb-4">
              <div class="text-subtitle-1 font-weight-bold grey--text text--darken-3">
                {{ steps[step].title }}
              </div>
              <div class="text-caption grey--text">
                {{ steps[step].subtitle }}
              </div>
            </div>

            <v-form ref="form" v-model="valid" lazy-validation>
              <!-- STEP 1 — Login credentials -->
              <div v-show="step === 0">
                <v-text-field
                  v-model="auth.email"
                  label="Email *"
                  type="email"
                  rounded
                  outlined
                  prepend-inner-icon="mdi-email-outline"
                  :rules="emailRules"
                  required
                />
                <v-text-field
                  v-model="auth.password"
                  label="Password *"
                  :type="showPassword ? 'text' : 'password'"
                  rounded
                  outlined
                  prepend-inner-icon="mdi-lock-outline"
                  :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append="showPassword = !showPassword"
                  :rules="passwordRules"
                  hint="At least 6 characters"
                  persistent-hint
                  required
                />
                <v-text-field
                  v-model="auth.confirmPassword"
                  label="Confirm password *"
                  :type="showPassword ? 'text' : 'password'"
                  rounded
                  outlined
                  prepend-inner-icon="mdi-lock-check-outline"
                  :rules="confirmPasswordRules"
                  required
                />
              </div>

              <!-- STEP 2 — Estate + address -->
              <div v-show="step === 1">
                <v-autocomplete
                  v-model="estateName"
                  :loading="loadingEstates"
                  :items="estateNames"
                  :search-input.sync="search"
                  cache-items
                  @change="onEstateChange"
                  flat
                  hide-no-data
                  hide-details
                  label="Which estate are you from? *"
                  solo
                ></v-autocomplete>

                <v-card-subtitle v-if="estate_id" class="px-0">
                  <v-chip small label color="purple lighten-5 purple--text" class="font-weight-medium">
                    Estate: {{ estate_id }} · {{ estate_urn }}
                  </v-chip>
                </v-card-subtitle>

                <!-- ⚡ Address fields shown only if estate uses them -->
                <v-select
                  v-if="showSectionField"
                  v-model="form.section"
                  :items="dropdowns.sections"
                  label="Section / Zone / Phase *"
                  rounded
                  outlined
                  :rules="showSectionField ? [v => !!v || 'Section is required'] : []"
                  required
                />
                <v-select
                  v-if="showCourtField"
                  v-model="form.court"
                  :items="dropdowns.courts"
                  label="Court *"
                  rounded
                  outlined
                  :rules="showCourtField ? [v => !!v || 'Court is required'] : []"
                  required
                />
                <v-select
                  v-if="showStreetField"
                  v-model="form.street"
                  :items="dropdowns.streets"
                  label="Street / Lane / Avenue *"
                  rounded
                  outlined
                  :rules="showStreetField ? [v => !!v || 'Street is required'] : []"
                  required
                />

                <!-- Friendly fallback when estate has no breakdown -->
                <div
                  v-if="estate_id && !showAnyAddressField"
                  class="pa-3 mb-2 d-flex align-center"
                  style="background: #f1f5f9; border-radius: 12px;"
                >
                  <v-icon small color="#8051FF" class="mr-2">mdi-information-outline</v-icon>
                  <span class="text-caption grey--text text--darken-1">
                    This estate doesn't use section / court / street breakdown.
                  </span>
                </div>
              </div>

              <!-- STEP 3 — Household details -->
              <div v-show="step === 2">
                <v-text-field
                  v-model="form.primary_owner"
                  label="Household Name / Primary Owner *"
                  rounded outlined
                  :rules="[v => !!v || 'Name is required']"
                  required
                />
                <v-text-field
                  v-model="form.house_number"
                  label="House Number"
                  rounded outlined
                />
                <v-text-field
                  v-model="form.contact_number"
                  label="Mobile Contact *"
                  type="tel"
                  rounded outlined
                  :rules="phoneRules"
                  required
                />

                <v-select
                  v-model="form.residence_status"
                  :items="residenceStatuses"
                  label="Residence Status *"
                  rounded outlined
                  :rules="[v => !!v || 'Residence status is required']"
                  required
                  @change="onResidenceStatusChange"
                />

                <v-text-field v-model="form.spouse_name" label="Spouse Name" rounded outlined />
                <v-text-field v-model="form.spouse_contact" label="Spouse Contact" type="tel" rounded outlined />

                <template v-if="caretakerRequired">
                  <v-alert dense text type="info" style="border-radius: 12px;" class="mb-3">
                    Caretaker details are required for <strong>{{ form.residence_status }}</strong>.
                  </v-alert>
                  <v-text-field
                    v-model="form.caretaker_name"
                    label="Caretaker Name *"
                    rounded outlined
                    :rules="[v => !!v || 'Caretaker name is required']"
                    required
                  />
                  <v-text-field
                    v-model="form.caretaker_contact"
                    label="Caretaker Contact *"
                    type="tel"
                    rounded outlined
                    :rules="caretakerPhoneRules"
                    required
                  />
                </template>

                <v-checkbox
                  v-model="checkbox"
                  :rules="[v => !!v || 'You must agree to continue!']"
                  label="I agree to terms and conditions."
                  required
                />
              </div>
            </v-form>

            <!-- Actions -->
            <div class="d-flex mt-4" style="gap: 8px;">
              <v-btn
                v-if="step > 0"
                text
                rounded
                class="text-capitalize font-weight-medium flex-grow-1"
                @click="step--"
                :disabled="submitting"
              >
                <v-icon left>mdi-chevron-left</v-icon>
                Back
              </v-btn>

              <v-btn
                v-if="step < steps.length - 1"
                rounded
                depressed
                color="#8051FF"
                dark
                class="text-capitalize font-weight-bold flex-grow-1"
                @click="nextStep"
              >
                Next
                <v-icon right>mdi-chevron-right</v-icon>
              </v-btn>

              <v-btn
                v-else
                rounded
                depressed
                color="#8051FF"
                dark
                class="text-capitalize font-weight-bold flex-grow-1"
                :loading="submitting"
                :disabled="submitting"
                @click="submitRegistration"
              >
                <v-icon left>mdi-account-check</v-icon>
                Submit
              </v-btn>
            </div>

            <div class="text-center mt-4">
              <span class="text-caption grey--text">Already have an account?</span>
              <a class="text-caption font-weight-bold ml-1" style="color: #8051FF;" @click="mode = 'login'">
                Sign in
              </a>
            </div>
          </div>
        </div>
      </v-card>
    </div>

    <v-snackbar color="white--text" :timeout="4000" v-model="snackbar" center>
      {{ snackbarText }}
    </v-snackbar>
    <v-snackbar color="red" :timeout="4000" v-model="snackbar2" outlined bottom center>
      {{ snackbarText2 }}
    </v-snackbar>
  </v-img>
</template>

<script>
import axios from 'axios';

const API = 'https://makaaziserver22.up.railway.app/api';

export default {
  name: 'HouseholdAuth',
  data() {
    return {
      mode: 'register',

      // Snackbars
      snackbar: false,
      snackbarText: 'No error message',
      snackbar2: false,
      snackbarText2: '',

      // Assets
      registerbg: require('@/assets/login_bg.png'),
      google: require('@/assets/google.png'),

      // Progress
      progress_bar: false,
      submitting: false,
      loadingEstates: false,
      checkbox: false,
      valid: true,
      loginValid: true,
      showPassword: false,

      // Stepper
      step: 0,
      steps: [
        { icon: 'mdi-account-lock', title: 'Account setup',    subtitle: 'Create your login credentials' },
        { icon: 'mdi-map-marker',   title: 'Estate & address', subtitle: 'Where do you live?' },
        { icon: 'mdi-home-account', title: 'Household details', subtitle: 'Tell us about your household' },
      ],

      // Auth
      auth: {
        email: '',
        password: '',
        confirmPassword: '',
      },

      // Estates
      estates: [],
      estateNames: [],
      search: null,
      estateName: null,
      estate_id: 0,
      estate_urn: null,

      // Dropdowns (actual values from DB)
      dropdowns: { sections: [], courts: [], streets: [] },

      // ⚡ Address visibility config from estate_address_config
      addressConfig: {
        show_section: true,
        show_court: true,
        show_street: true,
      },

      // Residence statuses
      residenceStatuses: ['Resident', 'Non-resident', 'Developing'],

      // Registration form
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

      // Status banner
      registrationStatus: null,
      rejectionReason: null,
    };
  },
  computed: {
    caretakerRequired() {
      const s = (this.form.residence_status || '').trim().toLowerCase();
      return s === 'non-resident' || s === 'non resident' || s === 'developing';
    },

    /**
     * ⚡ Address field visibility.
     * A field shows only when BOTH:
     *   - the estate's config enables it (show_* flag)
     *   - the estate has actual dropdown values for it (non-empty array)
     */
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

      if (!that.$refs.loginForm.validate()) {
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

        console.log('🔵 Signed in:', user.uid);
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

    /**
     * After sign in, look up the household.
     * - Approved  → /household/dashboard/:uid
     * - Pending   → show banner (stay here)
     * - Rejected  → show banner + reason
     * - Not found → switch to register form
     */
    async routeToDashboard(uid) {
      const that = this;
      try {
        const { data, status } = await axios.get(
          `${API}/households/getHouseHoldId/${uid}`
        );

        if (status === 200 && data?.household_id) {
          console.log('🔵 Household status:', data.status);

          if (data.status === 'Approved' || data.status === 'Pending') {
            // ⚡ Both Approved AND Pending go to the dashboard.
            // The dashboard itself handles the Pending state (shows a
            // "Registration pending" card + auto-polls for approval).
            that.snackbar = true;
            that.snackbarText = data.status === 'Approved'
              ? `Welcome back, ${data.primary_owner || 'Resident'}!`
              : 'Your registration is pending approval';
            setTimeout(() => that.goTo(`/household/dashboard/${uid}`), 600);
          } else {
            // Rejected — show the banner and stay on this page
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
          // Not registered yet — guide them to the register tab
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

      // Reset all address-related state
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
        // 1. Resolve estate id + urn
        const { data: estate } = await axios.get(
          `${API}/estates/estateName/${encodeURIComponent(val)}`
        );
        that.estate_id = estate.estate_id;
        that.estate_urn = estate.estate_urn;
        that.form.estate_id = estate.estate_id;

        // 2. Fetch config AND dropdowns in parallel
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
          console.log('🔷 Address config loaded:', that.addressConfig);
        }
      } catch (error) {
        // Non-fatal — defaults apply
        console.warn('Address config fetch failed:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
        });
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
          console.log('🔷 Dropdowns loaded:', {
            sections: that.dropdowns.sections.length,
            courts:   that.dropdowns.courts.length,
            streets:  that.dropdowns.streets.length,
          });
        }
      } catch (error) {
        console.warn('Dropdowns fetch failed:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
        });
      }
    },

    async submitRegistration() {
      const that = this;

      // Step-level guards
      if (!that._validateCredentials()) {
        that.step = 0;
        return;
      }
      if (!that.form.estate_id) {
        that.step = 1;
        that.snackbar2 = true;
        that.snackbarText2 = 'Please select your estate';
        return;
      }
      if (that.showSectionField && !that.form.section) {
        that.step = 1;
        that.snackbar2 = true;
        that.snackbarText2 = 'Please select a section';
        return;
      }
      if (that.showCourtField && !that.form.court) {
        that.step = 1;
        that.snackbar2 = true;
        that.snackbarText2 = 'Please select a court';
        return;
      }
      if (that.showStreetField && !that.form.street) {
        that.step = 1;
        that.snackbar2 = true;
        that.snackbarText2 = 'Please select a street';
        return;
      }
      if (!that.form.primary_owner || !that.form.contact_number) {
        that.step = 2;
        that.snackbar2 = true;
        that.snackbarText2 = 'Please fill in all required fields';
        return;
      }
      if (that.caretakerRequired) {
        if (!that.form.caretaker_name || !that.form.caretaker_contact) {
          that.step = 2;
          that.snackbar2 = true;
          that.snackbarText2 = 'Caretaker details are required';
          return;
        }
      }
      if (!that.checkbox) {
        that.snackbar2 = true;
        that.snackbarText2 = 'You must agree to the terms';
        return;
      }

      that.progress_bar = true;
      that.submitting = true;

      try {
        // 1️⃣ Create Firebase account (or sign in if it already exists)
        let uid = that.$fire?.auth?.currentUser?.uid;
        if (!uid) {
          try {
            const { user } = await that.$fire.auth.createUserWithEmailAndPassword(
              that.auth.email,
              that.auth.password
            );
            uid = user.uid;
            console.log('🆕 Firebase account created:', uid);

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
                console.log('ℹ️ Signed into existing account:', uid);
              } catch (signInErr) {
                throw new Error(
                  'This email is already registered. Please sign in instead.'
                );
              }
            } else {
              throw authErr;
            }
          }
        }

        // 2️⃣ Submit household registration
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

          // ⚡ Go straight to the resident dashboard. The dashboard
          // itself handles the "Pending" state and polls for approval.
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

    // =====================================================
    // STATUS CHECK (used by the "Refresh status" button)
    // =====================================================
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
.container {
  padding-bottom: 40px;
}

/* Tab toggle */
.tab-toggle {
  border-radius: 12px !important;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  background: #f8fafc;
  width: 100%;
}
.tab-toggle ::v-deep .v-btn {
  border-radius: 0 !important;
  letter-spacing: 0;
}
.tab-toggle ::v-deep .v-btn.v-item--active {
  background: #8051FF !important;
  color: #ffffff !important;
}
.tab-toggle ::v-deep .v-btn.v-item--active .v-icon {
  color: #ffffff !important;
}

/* Stepper */
.stepper-dots {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
}
.step-line {
  position: absolute;
  top: 50%;
  left: 24px;
  height: 2px;
  background: #8051FF;
  transform: translateY(-50%);
  transition: width 0.4s ease;
  z-index: 1;
  max-width: calc(100% - 48px);
}
.step-dot {
  position: relative;
  z-index: 2;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}
.step-dot.active,
.step-dot.done {
  background: #8051FF;
  border-color: #8051FF;
  box-shadow: 0 4px 12px rgba(128, 81, 255, 0.3);
}
</style>