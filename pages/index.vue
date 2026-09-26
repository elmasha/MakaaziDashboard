<template>
  <div class="landing-root">
    <!-- Top bar -->
    <v-app-bar
      app
      flat
      :color="scrolled ? 'white' : 'transparent'"
      :class="{ 'nav-scrolled': scrolled }"
      class="px-3 px-sm-6 px-md-10 modern-nav"
      height="70"
      elevate-on-scroll
    >
      <div class="d-flex align-center cursor-pointer" @click="scrollToTop">
        <v-avatar color="#8051FF" size="38" class="mr-3 elevation-2">
          <v-icon color="white" size="20">mdi-home-city</v-icon>
        </v-avatar>
        <span class="text-h6 font-weight-bold brand-text">
          <span style="color: #8051FF;">Ma</span><span style="color: #7cb300;">kaazi</span>
        </span>
      </div>

      <v-spacer />

      <div class="d-none d-md-flex align-center">
        <v-btn text class="mx-1 text-capitalize font-weight-medium" @click="scrollToSection('roles')">
          Get Started
        </v-btn>
        <v-btn text class="mx-1 text-capitalize font-weight-medium" @click="scrollToSection('features')">
          Features
        </v-btn>
        <v-btn text class="mx-1 text-capitalize font-weight-medium" @click="scrollToSection('faq')">
          FAQ
        </v-btn>
      </div>

      <!-- Auth-aware: signed in → avatar + Dashboard -->
      <div v-if="isAuthenticated" class="d-flex align-center ml-2 ml-sm-4">
        <v-btn
          text
          class="text-capitalize font-weight-medium mr-2 d-none d-sm-flex"
          :loading="resolvingDashboard"
          @click="goToMyDashboard"
        >
          Dashboard
        </v-btn>
        <v-menu offset-y transition="slide-y-transition" bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-avatar color="#8051FF" size="36">
                <span class="white--text font-weight-bold text-caption">{{ userInitials }}</span>
              </v-avatar>
            </v-btn>
          </template>
          <v-list dense class="py-2" min-width="220">
            <div class="px-4 py-2">
              <div class="text-caption grey--text">Signed in as</div>
              <div class="text-body-2 font-weight-bold">{{ userName }}</div>
              <div class="text-caption grey--text">{{ userEmail || userPhone }}</div>
            </div>
            <v-divider class="my-1"></v-divider>
            <v-list-item @click="goToMyDashboard">
              <v-list-item-icon class="mr-3">
                <v-icon small color="#8051FF">mdi-view-dashboard</v-icon>
              </v-list-item-icon>
              <v-list-item-title class="text-body-2">My Dashboard</v-list-item-title>
            </v-list-item>
            <v-list-item @click="signOut">
              <v-list-item-icon class="mr-3">
                <v-icon small color="error">mdi-logout</v-icon>
              </v-list-item-icon>
              <v-list-item-title class="text-body-2 error--text">Sign Out</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <!-- Not signed in -->
      <v-btn
        v-else
        color="#8051FF"
        dark
        depressed
        rounded
        class="ml-2 ml-sm-4 px-4 px-sm-5 font-weight-bold text-capitalize hover-lift"
        @click="scrollToSection('roles')"
      >
        Sign in
      </v-btn>

      <v-btn icon class="d-flex d-md-none ml-2" @click="mobileMenu = !mobileMenu">
        <v-icon>{{ mobileMenu ? 'mdi-close' : 'mdi-menu' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Mobile drawer -->
    <v-navigation-drawer v-model="mobileMenu" app temporary right width="280">
      <div class="pa-6">
        <div class="d-flex align-center mb-8">
          <v-avatar color="#8051FF" size="32" class="mr-3">
            <v-icon color="white" size="16">mdi-home-city</v-icon>
          </v-avatar>
          <span class="text-h6 font-weight-bold">
            <span style="color: #8051FF;">Ma</span><span style="color: #7cb300;">kaazi</span>
          </span>
        </div>
        <v-list dense>
          <v-list-item v-if="isAuthenticated" @click="goToMyDashboard(); mobileMenu = false">
            <v-list-item-icon class="mr-3">
              <v-icon small color="#8051FF">mdi-view-dashboard</v-icon>
            </v-list-item-icon>
            <v-list-item-title class="font-weight-medium">My Dashboard</v-list-item-title>
          </v-list-item>
          <v-list-item @click="scrollToSection('roles'); mobileMenu = false">
            <v-list-item-title>Get Started</v-list-item-title>
          </v-list-item>
          <v-list-item @click="scrollToSection('features'); mobileMenu = false">
            <v-list-item-title>Features</v-list-item-title>
          </v-list-item>
          <v-list-item @click="scrollToSection('faq'); mobileMenu = false">
            <v-list-item-title>FAQ</v-list-item-title>
          </v-list-item>
          <v-divider class="my-3"></v-divider>
          <v-list-item v-if="isAuthenticated" @click="signOut(); mobileMenu = false">
            <v-list-item-title class="error--text">Sign Out</v-list-item-title>
          </v-list-item>
        </v-list>
      </div>
    </v-navigation-drawer>

    <v-main class="pa-0">
      <!-- ============================== HERO ============================== -->
      <section class="hero-section" ref="hero">
        <div class="hero-bg-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>

        <v-container class="hero-content py-10 py-sm-14">
          <v-row align="center" justify="center" class="min-h-screen">
            <v-col cols="12" md="10" lg="8" class="text-center">
              <v-chip
                color="#ede9fe"
                text-color="#8051FF"
                small
                label
                class="mb-4 font-weight-bold px-4 py-1"
              >
                <v-icon left small color="#8051FF">mdi-star-circle</v-icon>
                Trusted by estates across Kenya
              </v-chip>

              <h1 class="text-h4 text-sm-h3 text-md-h2 font-weight-black mb-4 hero-title">
                Manage Your Estate
                <span class="gradient-text d-block mt-1">The Modern Way</span>
              </h1>

              <p class="text-body-1 text-sm-h6 grey--text text--darken-1 mb-8 mx-auto" style="max-width: 640px; line-height: 1.7;">
                Makaazi is the all-in-one platform for estate management — service charges, household records, payments, visitors, and reports. Sign in and choose your role below.
              </p>

              <div class="d-flex flex-column flex-sm-row align-center justify-center gap-3">
                <v-btn
                  large
                  x-large
                  color="#8051FF"
                  dark
                  depressed
                  rounded
                  class="px-8 font-weight-bold text-capitalize elevation-4 hover-lift"
                  @click="scrollToSection('roles')"
                >
                  <v-icon left>mdi-account-arrow-right</v-icon>
                  Choose your role
                </v-btn>

                <v-btn
                  large
                  x-large
                  text
                  color="grey darken-2"
                  rounded
                  class="px-6 font-weight-medium text-capitalize mt-2 mt-sm-0"
                  @click="scrollToSection('features')"
                >
                  <v-icon left color="#8051FF">mdi-play-circle</v-icon>
                  See how it works
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ============================== ROLE SELECT ============================== -->
      <section id="roles" ref="roles" class="roles-section py-14 py-sm-18">
        <v-container>
          <div class="text-center mb-10">
            <v-chip
              color="#ede9fe"
              text-color="#8051FF"
              label
              class="mb-3 px-4 font-weight-bold"
            >
              Get Started
            </v-chip>
            <h2 class="text-h5 text-sm-h4 font-weight-black grey--text text--darken-3 mb-3">
              Who are you?
            </h2>
            <p class="text-body-1 grey--text text--darken-1" style="max-width: 560px; margin: 0 auto;">
              Choose how you'll use Makaazi. Your role determines what you can see and do.
            </p>
          </div>

          <v-row justify="center" align="stretch">
            <v-col
              v-for="(role, i) in roles"
              :key="role.key"
              cols="12"
              sm="6"
              md="4"
              class="mb-4 mb-md-0"
              :style="{ transitionDelay: i * 100 + 'ms' }"
            >
              <v-hover v-slot="{ hover }">
                <v-card
                  class="role-card rounded-2xl h-100 pa-6 d-flex flex-column"
                  :class="{ 'elevation-8': hover, 'elevation-1': !hover }"
                  :style="hover ? 'transform: translateY(-6px)' : ''"
                  @click="chooseRole(role.key)"
                >
                  <div
                    class="role-icon-wrapper mb-5"
                    :style="`background: ${role.bg};`"
                  >
                    <v-icon :color="role.color" size="32">{{ role.icon }}</v-icon>
                  </div>

                  <div class="text-overline font-weight-bold tracking-wide mb-1" :style="`color: ${role.color};`">
                    {{ role.tag }}
                  </div>

                  <h3 class="text-h6 font-weight-bold grey--text text--darken-3 mb-2">
                    {{ role.title }}
                  </h3>

                  <p class="text-body-2 grey--text text--darken-1 mb-4" style="line-height: 1.65; flex-grow: 1;">
                    {{ role.description }}
                  </p>

                  <v-divider class="mb-4" />

                  <div class="mb-5">
                    <div v-for="bullet in role.bullets" :key="bullet" class="d-flex align-center mb-2">
                      <v-icon small color="#7cb300" class="mr-2">mdi-check-circle</v-icon>
                      <span class="text-body-2 grey--text text--darken-1">{{ bullet }}</span>
                    </div>
                  </div>

                  <v-btn
                    block
                    large
                    rounded
                    depressed
                    :color="role.color"
                    dark
                    class="text-capitalize font-weight-bold hover-lift"
                    :loading="checkingRole === role.key"
                    :disabled="!!checkingRole"
                    @click.stop="chooseRole(role.key)"
                  >
                    <v-icon left>{{ role.ctaIcon }}</v-icon>
                    {{ role.cta }}
                  </v-btn>
                </v-card>
              </v-hover>
            </v-col>
          </v-row>

          <div class="text-center mt-8">
            <span class="text-caption grey--text">
              Not sure? Officials can also register on behalf of a household.
              <a href="#" @click.prevent="scrollToSection('faq')" style="color: #8051FF;">Learn more</a>
            </span>
          </div>
        </v-container>
      </section>

      <!-- ============================== FEATURES ============================== -->
      <section id="features" ref="features" class="features-section py-14 py-sm-18 grey lighten-5">
        <v-container>
          <div class="text-center mb-10">
            <v-chip
              color="#ede9fe"
              text-color="#8051FF"
              label
              class="mb-3 px-4 font-weight-bold"
            >
              What you get
            </v-chip>
            <h2 class="text-h5 text-sm-h4 font-weight-black grey--text text--darken-3 mb-3">
              Everything you need to run your estate
            </h2>
          </div>

          <v-row>
            <v-col
              v-for="(feature, i) in features"
              :key="i"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card class="feature-card rounded-xl pa-6 h-100" elevation="0" outlined>
                <div class="feature-icon-wrapper mb-4" :style="`background: ${feature.bg};`">
                  <v-icon :color="feature.color" size="28">{{ feature.icon }}</v-icon>
                </div>
                <h3 class="text-subtitle-1 font-weight-bold grey--text text--darken-3 mb-2">
                  {{ feature.title }}
                </h3>
                <p class="text-body-2 grey--text text--darken-1" style="line-height: 1.65;">
                  {{ feature.desc }}
                </p>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ============================== FAQ ============================== -->
      <section id="faq" ref="faq" class="faq-section py-14 py-sm-18">
        <v-container>
          <div class="text-center mb-10">
            <h2 class="text-h5 text-sm-h4 font-weight-black grey--text text--darken-3 mb-3">
              Frequently asked questions
            </h2>
          </div>

          <v-row justify="center">
            <v-col cols="12" md="9" lg="7">
              <v-expansion-panels accordion flat>
                <v-expansion-panel
                  v-for="(faq, i) in faqs"
                  :key="i"
                  class="mb-2 rounded-xl"
                  style="border: 1px solid #e2e8f0;"
                >
                  <v-expansion-panel-header class="font-weight-bold grey--text text--darken-3">
                    {{ faq.q }}
                  </v-expansion-panel-header>
                  <v-expansion-panel-content class="text-body-2 grey--text text--darken-1">
                    {{ faq.a }}
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ============================== FOOTER ============================== -->
      <v-footer color="grey darken-4" dark class="py-8">
        <v-container>
          <v-row align="center">
            <v-col cols="12" md="6" class="text-center text-md-left mb-4 mb-md-0">
              <div class="d-flex align-center justify-center justify-md-start mb-2">
                <v-avatar color="#8051FF" size="28" class="mr-2">
                  <v-icon color="white" size="14">mdi-home-city</v-icon>
                </v-avatar>
                <span class="text-h6 font-weight-bold">Makaazi</span>
              </div>
              <span class="text-caption grey--text text--lighten-1">
                © {{ new Date().getFullYear() }} Makaazi. Built for modern Kenyan estates.
              </span>
            </v-col>
            <v-col cols="12" md="6" class="text-center text-md-right">
              <v-btn text small color="grey lighten-1" class="text-capitalize" @click="scrollToSection('features')">Features</v-btn>
              <v-btn text small color="grey lighten-1" class="text-capitalize" @click="scrollToSection('faq')">FAQ</v-btn>
              <v-btn text small color="grey lighten-1" class="text-capitalize" href="mailto:support@makaazi.co.ke">Contact</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-footer>
    </v-main>

    <!-- Role confirmation dialog (only shown for Manager) -->
    <v-dialog v-model="roleDialog" max-width="440" persistent>
      <v-card class="rounded-2xl pa-6">
        <div class="text-center mb-4">
          <v-avatar :color="selectedRole?.bg" size="64" class="mb-3">
            <v-icon :color="selectedRole?.color" size="32">{{ selectedRole?.icon }}</v-icon>
          </v-avatar>
          <div class="text-h6 font-weight-bold grey--text text--darken-3">
            Continue as {{ selectedRole?.title }}
          </div>
          <div class="text-caption grey--text mt-1">
            {{ selectedRole?.loginHint }}
          </div>
        </div>

        <v-btn
          block
          large
          rounded
          :color="selectedRole?.color"
          dark
          class="text-capitalize font-weight-bold mb-2"
          :loading="routing"
          @click="proceedAsRole"
        >
          <v-icon left>mdi-login</v-icon>
          Continue
        </v-btn>

        <v-btn block text class="text-capitalize" @click="roleDialog = false">
          Cancel
        </v-btn>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from 'axios';

const API = 'https://makaaziserver22.up.railway.app/api';

export default {
  name: 'LandingPage',

  data() {
    return {
      scrolled: false,
      mobileMenu: false,

      roleDialog: false,
      selectedRole: null,
      routing: false,

      // Tracks which role card is currently checking (spinner on button)
      checkingRole: null,
      resolvingDashboard: false,

      // Auth state (nav bar display)
      isAuthenticated: false,
      uid: null,
      userName: '',
      userEmail: '',
      userPhone: '',

      roles: [
        {
          key: 'household',
          tag: 'Resident',
          title: 'I am a Household',
          description:
            'Access your payment records, view service charges, and make M-Pesa payments for your unit.',
          icon: 'mdi-home-account',
          color: '#8051FF',
          bg: '#ede9fe',
          cta: 'Sign in / Register',
          ctaIcon: 'mdi-account-arrow-right',
          loginHint: 'You\'ll be taken to your household dashboard.',
          bullets: [
            'View your monthly payment summary',
            'Pay service charges via M-Pesa',
            'See your outstanding balance',
            'Receive payment notifications',
          ],
        },
        {
          key: 'official',
          tag: 'Estate Official',
          title: 'I am an Estate Official',
          description:
            'Chairman, Secretary, or Treasurer. Manage households, approve registrations, and set up your estate.',
          icon: 'mdi-shield-account',
          color: '#7cb300',
          bg: '#f3ffd9',
          cta: 'Sign in as Official',
          ctaIcon: 'mdi-shield-key',
          loginHint: 'You\'ll be taken to your official dashboard.',
          bullets: [
            'Approve new household registrations',
            'Set and update service charges',
            'View estate-wide payment reports',
            'Manage workers and cash routing',
          ],
        },
        {
          key: 'manager',
          tag: 'Estate Manager',
          title: 'I am an Estate Manager',
          description:
            'Run operations across multiple estates. Full control of subscriptions, users, and finances.',
          icon: 'mdi-briefcase-account',
          color: '#d32f2f',
          bg: '#ffebee',
          cta: 'Sign in as Manager',
          ctaIcon: 'mdi-crown',
          loginHint: 'You\'ll be taken to the management console.',
          bullets: [
            'Manage multiple estates',
            'Oversee subscriptions and billing',
            'Audit and financial reports',
            'Manage admins and permissions',
          ],
        },
      ],

      features: [
        {
          title: 'Household Register',
          desc: 'A single source of truth for every unit, owner, caretaker, and contact.',
          icon: 'mdi-home-group',
          color: '#8051FF',
          bg: '#ede9fe',
        },
        {
          title: 'Service Charges',
          desc: 'Set charges per estate, track payments month-by-month, and auto-calculate arrears.',
          icon: 'mdi-cash-multiple',
          color: '#7cb300',
          bg: '#f3ffd9',
        },
        {
          title: 'M-Pesa Payments',
          desc: 'Integrated STK push so residents pay in one tap. Automatic reconciliation.',
          icon: 'mdi-cellphone-wireless',
          color: '#0277bd',
          bg: '#e1f5fe',
        },
        {
          title: 'Visitor Management',
          desc: 'Log entries and exits at the gate. Approve, deny, and audit at any time.',
          icon: 'mdi-gate',
          color: '#ef6c00',
          bg: '#fff3e0',
        },
        {
          title: 'Reports & Exports',
          desc: 'Section, court, street, and cash-routing reports. Download as CSV.',
          icon: 'mdi-chart-bar',
          color: '#6a1b9a',
          bg: '#f3e5f5',
        },
        {
          title: 'Notifications',
          desc: 'Push alerts for payments, approvals, and important estate updates.',
          icon: 'mdi-bell-ring',
          color: '#c62828',
          bg: '#ffebee',
        },
      ],

      faqs: [
        {
          q: 'What is the difference between an Official and a Manager?',
          a: 'An Official (Chairman, Secretary, Treasurer) manages a single estate. A Manager runs operations across multiple estates and administers subscriptions and user permissions.',
        },
        {
          q: 'Can I be both a household and an official?',
          a: 'Yes. Officials are also households — they live in the estate. Use the Official login to access both your own records and estate-wide management tools.',
        },
        {
          q: 'I don\'t know my estate. What should I do?',
          a: 'Contact your estate office or check with your caretaker for the estate name or URN. When you sign in as a Resident, you\'ll be able to select your estate from a list.',
        },
        {
          q: 'Is my payment information secure?',
          a: 'Yes. All M-Pesa transactions go through Safaricom\'s Daraja API, and your payment history is stored against your household record with encryption in transit.',
        },
      ],
    };
  },

  computed: {
    userInitials() {
      if (!this.userName) return 'U';
      return this.userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    },
  },

  mounted() {
    window.addEventListener('scroll', this.handleScroll);
    this.checkAuth();
  },

  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
    if (this._authUnsub) this._authUnsub();
  },

  methods: {
    handleScroll() {
      this.scrolled = window.scrollY > 50;
    },

    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    scrollToSection(id) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    // =====================================================
    // AUTH — nav bar state only
    // =====================================================
    checkAuth() {
      const that = this;
      const current = that.$fire?.auth?.currentUser;
      if (current && current.uid) {
        that._setUser(current);
        return;
      }
      that._authUnsub = that.$fire.auth.onAuthStateChanged((user) => {
        if (user && user.uid) {
          that._setUser(user);
        } else {
          that.isAuthenticated = false;
          that.uid = null;
          that.userName = '';
          that.userEmail = '';
          that.userPhone = '';
        }
      });
    },

    _setUser(user) {
      this.isAuthenticated = true;
      this.uid = user.uid;
      this.userName = user.displayName || 'User';
      this.userEmail = user.email || '';
      this.userPhone = user.phoneNumber || '';
      console.log('🔵 Signed in as:', this.uid);
    },

    // =====================================================
    // ROLE CHOICE
    // =====================================================
    async chooseRole(key) {
      const role = this.roles.find((r) => r.key === key);
      if (!role) return;

      // ---- HOUSEHOLD ----
      // Always go to the combined login + register page.
      // That page handles auth + status + register.
      if (key === 'household') {
        console.log('🔵 Household card → /household/register');
        this._push('/household/register');
        return;
      }

      // ---- OFFICIAL ----
      // If signed in, check if they're actually an official.
      // If not, go to /officials/login.
      if (key === 'official') {
        if (this.isAuthenticated && this.uid) {
          this.checkingRole = 'official';
          try {
            await this._handleOfficialClick(role);
          } finally {
            this.checkingRole = null;
          }
        } else {
          console.log('🔵 Not signed in → /officials/login');
          this._push('/officials/login');
        }
        return;
      }

      // ---- MANAGER (or anything else) ----
      // Fall back to login dialog.
      this.selectedRole = role;
      this.roleDialog = true;
    },

    _handleOfficialClick(role) {
      return axios
        .get(`${API}/officials/getOfficialById/${this.uid}`)
        .then(({ data, status }) => {
          if (status === 200 && data?.official_id && data?.estate_id) {
            console.log('🔵 User IS an official → /officials/dashboard/' + data.estate_id);
            this._push(`/officials/dashboard/${data.estate_id}`);
            return;
          }
          console.log('🔵 Not an official → /officials/login');
          this._push('/officials/login');
        })
        .catch((err) => {
          if (err.response?.status === 404) {
            console.log('🔵 Not an official → /officials/login');
          } else {
            console.warn('Official check failed:', err.response?.data || err.message);
          }
          this._push('/officials/login');
        });
    },

    proceedAsRole() {
      if (!this.selectedRole) return;
      this.routing = true;

      const key = this.selectedRole.key;
      let path;

      if (key === 'household') {
        path = '/household/register';
      } else if (key === 'official') {
        path = '/officials/login';
      } else {
        path = `/login?role=${key}`;
      }

      console.log('🔵 proceedAsRole →', path);

      setTimeout(() => {
        this._push(path);
        this.routing = false;
        this.roleDialog = false;
      }, 250);
    },

    // =====================================================
    // NAV HELPERS
    // =====================================================
    async goToMyDashboard() {
      if (!this.isAuthenticated || !this.uid) {
        this.scrollToSection('roles');
        return;
      }

      this.resolvingDashboard = true;

      try {
        // 1. Try official first (higher privilege)
        const official = await axios
          .get(`${API}/officials/getOfficialById/${this.uid}`)
          .catch(() => null);

        if (official?.status === 200 && official.data?.estate_id) {
          console.log('🔵 Resolved: official');
          this._push(`/officials/dashboard/${official.data.estate_id}`);
          return;
        }

        // 2. Try household
        const household = await axios
          .get(`${API}/households/getHouseHoldId/${this.uid}`)
          .catch(() => null);

        if (household?.status === 200 && household.data?.household_id) {
          console.log('🔵 Resolved: household');
          this._push(`/household/dashboard/${this.uid}`);
          return;
        }

        // 3. Fallback — send to household register (which will handle it)
        console.warn('🔴 Could not resolve role — routing to /household/register');
        this._push('/household/register');
      } catch (err) {
        console.error('Dashboard resolve error:', err.message);
        this._push('/household/register');
      } finally {
        this.resolvingDashboard = false;
      }
    },

    _push(path) {
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

    async signOut() {
      try {
        if (this.$fire?.auth) await this.$fire.auth.signOut();
      } catch (err) {
        console.warn('Sign out error:', err.message);
      }
      this.isAuthenticated = false;
      this.uid = null;
      this.userName = '';
      this.userEmail = '';
      this.userPhone = '';
    },
  },
};
</script>

<style scoped>
.landing-root {
  background: #ffffff;
  min-height: 100vh;
}

/* Nav */
.modern-nav {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.nav-scrolled {
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.06) !important;
}
.brand-text {
  letter-spacing: -0.5px;
}

/* Hero */
.hero-section {
  position: relative;
  background: linear-gradient(135deg, #fafafa 0%, #f5f3ff 100%);
  overflow: hidden;
}
.min-h-screen {
  min-height: calc(100vh - 70px);
}
.hero-bg-shapes {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.5;
}
.shape-1 {
  width: 500px;
  height: 500px;
  background: #ede9fe;
  top: -150px;
  right: -100px;
}
.shape-2 {
  width: 400px;
  height: 400px;
  background: #f3ffd9;
  bottom: -100px;
  left: -100px;
}
.shape-3 {
  width: 350px;
  height: 350px;
  background: #fff3e0;
  top: 45%;
  right: 20%;
}
.hero-title {
  line-height: 1.12;
  letter-spacing: -0.03em;
}
.gradient-text {
  background: linear-gradient(135deg, #8051FF 0%, #5b21b6 50%, #4c1d95 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Role cards */
.role-card {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e2e8f0;
  cursor: pointer;
  background: #ffffff;
}
.role-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Features */
.feature-card {
  transition: all 0.3s ease;
  background: #ffffff;
}
.feature-card:hover {
  border-color: #cbd5e1 !important;
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06) !important;
}
.feature-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Utilities */
.gap-3 { gap: 12px; }
.rounded-2xl { border-radius: 20px !important; }
.hover-lift {
  transition: all 0.3s ease;
}
.hover-lift:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(128, 81, 255, 0.25) !important;
}
.tracking-wide {
  letter-spacing: 0.08em;
}

/* Responsive */
@media (max-width: 599px) {
  .hero-title {
    font-size: 1.9rem !important;
  }
  .role-icon-wrapper {
    width: 56px;
    height: 56px;
  }
}
</style>