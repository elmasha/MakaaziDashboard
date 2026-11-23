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
          <!-- NEW: Privacy Policy link -->
          <v-list-item to="/privacy-policy" @click="mobileMenu = false">
            <v-list-item-icon class="mr-3">
              <v-icon small color="grey darken-1">mdi-shield-lock</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Privacy Policy</v-list-item-title>
          </v-list-item>
          <v-divider class="my-3"></v-divider>
          <v-list-item v-if="isAuthenticated" @click="signOut(); mobileMenu = false">
            <v-list-item-title class="error--text">Sign Out</v-list-item-title>
          </v-list-item>
        </v-list>
      </div>
    </v-navigation-drawer>

    <v-main class="pa-0">
      <!-- ============================== HERO (BRIGHT) ============================== -->
      <section class="hero-section" ref="hero">
        <!-- Decorative background layers -->
        <div class="hero-bg-grid"></div>
        <div class="hero-blob hero-blob-1"></div>
        <div class="hero-blob hero-blob-2"></div>
        <div class="hero-blob hero-blob-3"></div>
        <div class="hero-bottom-fade"></div>

        <v-container class="hero-container">
          <v-row align="center" class="hero-row">
            <!-- LEFT: copy -->
            <v-col cols="12" md="6" lg="6" class="hero-left">
              <div class="hero-badge">
                <span class="hero-badge-dot"></span>
                Trusted by estates across Kenya
              </div>

              <h1 class="hero-title">
                Manage Your Estate
                <span class="hero-title-gradient">The Modern Way</span>
              </h1>

              <p class="hero-lede">
                Makaazi is the all-in-one platform for estate management — service charges,
                household records, payments, visitors, and reports. All in one place.
              </p>

              <div class="hero-cta-row">
                <button class="hero-cta hero-cta-primary" @click="scrollToSection('roles')">
                  <v-icon size="18" color="white">mdi-account-arrow-right</v-icon>
                  <span>Choose your role</span>
                </button>
                <button class="hero-cta hero-cta-ghost" @click="scrollToSection('features')">
                  <v-icon size="18" color="#8051FF">mdi-play-circle-outline</v-icon>
                  <span>See how it works</span>
                </button>
              </div>
            </v-col>

            <!-- RIGHT: product mockup -->
            <v-col cols="12" md="6" lg="6" class="hero-right">
              <div class="mockup-wrap">
                <!-- Floating stat pill 1 -->
                <div class="mockup-float mockup-float-1">
                  <div class="mockup-float-icon mockup-float-icon-lime">
                    <v-icon size="16" color="#0A0A14">mdi-check</v-icon>
                  </div>
                  <div class="mockup-float-body">
                    <div class="mockup-float-label">Payment received</div>
                    <div class="mockup-float-value">KES 5,000</div>
                  </div>
                </div>

                <!-- Floating stat pill 2 -->
                <div class="mockup-float mockup-float-2">
                  <div class="mockup-float-icon mockup-float-icon-purple">
                    <v-icon size="16" color="white">mdi-home-group</v-icon>
                  </div>
                  <div class="mockup-float-body">
                    <div class="mockup-float-label">Households</div>
                    <div class="mockup-float-value">128 approved</div>
                  </div>
                </div>

                <!-- Main mockup card -->
                <div class="mockup-card">
                  <div class="mockup-header">
                    <div class="mockup-header-left">
                      <div class="mockup-avatar">GE</div>
                      <div>
                        <div class="mockup-name">Greenfield Estate</div>
                        <div class="mockup-urn">URN · GRN-001</div>
                      </div>
                    </div>
                    <div class="mockup-badge">
                      <span class="mockup-badge-dot"></span>
                      Active
                    </div>
                  </div>

                  <div class="mockup-stats">
                    <div class="mockup-stat">
                      <div class="mockup-stat-label">Collected</div>
                      <div class="mockup-stat-value">
                        <span class="mockup-currency">KES</span> 84,500
                      </div>
                    </div>
                    <div class="mockup-stat">
                      <div class="mockup-stat-label">Outstanding</div>
                      <div class="mockup-stat-value mockup-stat-warn">
                        <span class="mockup-currency">KES</span> 12,300
                      </div>
                    </div>
                  </div>

                  <div class="mockup-chart">
                    <div class="mockup-chart-label">Last 6 months</div>
                    <div class="mockup-chart-bars">
                      <div class="mockup-bar" style="height: 40%"></div>
                      <div class="mockup-bar" style="height: 65%"></div>
                      <div class="mockup-bar" style="height: 50%"></div>
                      <div class="mockup-bar" style="height: 80%"></div>
                      <div class="mockup-bar" style="height: 70%"></div>
                      <div class="mockup-bar mockup-bar-active" style="height: 95%"></div>
                    </div>
                  </div>

                  <div class="mockup-list">
                    <div class="mockup-list-row">
                      <div class="mockup-list-dot mockup-list-dot-green"></div>
                      <div class="mockup-list-text">Unit A-12 · Paid Nov</div>
                      <div class="mockup-list-amount">+5,000</div>
                    </div>
                    <div class="mockup-list-row">
                      <div class="mockup-list-dot mockup-list-dot-green"></div>
                      <div class="mockup-list-text">Unit B-04 · Paid Nov</div>
                      <div class="mockup-list-amount">+5,000</div>
                    </div>
                    <div class="mockup-list-row">
                      <div class="mockup-list-dot mockup-list-dot-amber"></div>
                      <div class="mockup-list-text">Unit C-07 · Pending</div>
                      <div class="mockup-list-amount mockup-list-amount-warn">3,000</div>
                    </div>
                  </div>
                </div>
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
              <!-- NEW: Privacy Policy link -->
              <v-btn text small color="grey lighten-1" class="text-capitalize" to="/privacy-policy">
                Privacy Policy
              </v-btn>
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
          <v-avatar
            :color="selectedRole ? selectedRole.bg : ''"
            size="64"
            class="mb-3"
          >
            <v-icon :color="selectedRole ? selectedRole.color : ''" size="32">
              {{ selectedRole ? selectedRole.icon : '' }}
            </v-icon>
          </v-avatar>
          <div class="text-h6 font-weight-bold grey--text text--darken-3">
            Continue as {{ selectedRole ? selectedRole.title : '' }}
          </div>
          <div class="text-caption grey--text mt-1">
            {{ selectedRole ? selectedRole.loginHint : '' }}
          </div>
        </div>

        <v-btn
          block
          large
          rounded
          :color="selectedRole ? selectedRole.color : '#8051FF'"
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
  data() {
    return {
      scrolled: false,
      mobileMenu: false,

      roleDialog: false,
      selectedRole: null,
      routing: false,

      checkingRole: null,
      resolvingDashboard: false,

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
          loginHint: 'You will be taken to your household dashboard.',
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
          loginHint: 'You will be taken to your official dashboard.',
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
          loginHint: 'You will be taken to the management console.',
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
          q: 'I do not know my estate. What should I do?',
          a: 'Contact your estate office or check with your caretaker for the estate name or URN. When you sign in as a Resident, you will be able to select your estate from a list.',
        },
        {
          q: 'Is my payment information secure?',
          a: 'Yes. All M-Pesa transactions go through Safaricom Daraja API, and your payment history is stored against your household record with encryption in transit.',
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
    // AUTH
    // =====================================================
    checkAuth() {
      const that = this;
      if (that.$fire && that.$fire.auth && that.$fire.auth.currentUser) {
        that._setUser(that.$fire.auth.currentUser);
        return;
      }
      if (that.$fire && that.$fire.auth) {
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
      }
    },

    _setUser(user) {
      this.isAuthenticated = true;
      this.uid = user.uid;
      this.userName = user.displayName || 'User';
      this.userEmail = user.email || '';
      this.userPhone = user.phoneNumber || '';
      console.log('Signed in as:', this.uid);
    },

    // =====================================================
    // ROLE CHOICE
    // =====================================================
    async chooseRole(key) {
      const role = this.roles.find((r) => r.key === key);
      if (!role) return;

      if (key === 'household') {
        this._push('/household/register');
        return;
      }

      if (key === 'official') {
        if (this.isAuthenticated && this.uid) {
          this.checkingRole = 'official';
          try {
            await this._handleOfficialClick(role);
          } finally {
            this.checkingRole = null;
          }
        } else {
          this._push('/officials/login');
        }
        return;
      }

      this.selectedRole = role;
      this.roleDialog = true;
    },

    _handleOfficialClick(role) {
      return axios
        .get(`${API}/officials/getOfficialById/${this.uid}`)
        .then((res) => {
          const data = res && res.data ? res.data : {};
          const status = res ? res.status : null;

          if (status === 200 && data.official_id && data.estate_id) {
            this._push('/officials/dashboard/' + data.estate_id);
            return;
          }
          this._push('/officials/login');
        })
        .catch((err) => {
          const status = err && err.response ? err.response.status : null;
          if (status === 404) {
            console.log('Not an official -> /officials/login');
          } else {
            const data = err && err.response ? err.response.data : null;
            console.warn('Official check failed:', data || err.message);
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
        path = '/login?role=' + key;
      }

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
        const official = await axios
          .get(`${API}/officials/getOfficialById/${this.uid}`)
          .catch(() => null);

        if (
          official &&
          official.status === 200 &&
          official.data &&
          official.data.estate_id
        ) {
          this._push('/officials/dashboard/' + official.data.estate_id);
          return;
        }

        const household = await axios
          .get(`${API}/households/getHouseHoldId/${this.uid}`)
          .catch(() => null);

        if (
          household &&
          household.status === 200 &&
          household.data &&
          household.data.household_id
        ) {
          this._push('/household/dashboard/' + this.uid);
          return;
        }

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
        if (this.$fire && this.$fire.auth) {
          await this.$fire.auth.signOut();
        }
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

/* ============================================================
   HERO — bright, light, no stats strip
   ============================================================ */
.hero-section {
  position: relative;
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, #faf5ff 0%, transparent 60%),
    linear-gradient(180deg, #ffffff 0%, #fbfaff 45%, #f6f3ff 100%);
  overflow: hidden;
  isolation: isolate;
  padding: 110px 0 100px; /* Adjusted padding to balance without the bottom stat strip */
}

/* Soft grid */
.hero-bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(128, 81, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(128, 81, 255, 0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
  z-index: 0;
  mask-image: radial-gradient(ellipse 70% 55% at 50% 35%, black, transparent);
  -webkit-mask-image: radial-gradient(ellipse 70% 55% at 50% 35%, black, transparent);
}

/* Pastel blobs */
.hero-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
  z-index: 0;
}
.hero-blob-1 {
  width: 480px;
  height: 480px;
  background: #d8c9ff;
  opacity: 0.55;
  top: -140px;
  right: -100px;
}
.hero-blob-2 {
  width: 420px;
  height: 420px;
  background: #e4f7b8;
  opacity: 0.55;
  bottom: -120px;
  left: -120px;
}
.hero-blob-3 {
  width: 320px;
  height: 320px;
  background: #ffe0b8;
  opacity: 0.35;
  top: 40%;
  right: 22%;
}

.hero-bottom-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(to top, rgba(246, 243, 255, 0.9), transparent);
  pointer-events: none;
  z-index: 0;
}

.hero-container {
  position: relative;
  z-index: 2;
}

.hero-row {
  min-height: 480px;
}

/* LEFT */
.hero-left {
  text-align: left;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 100px;
  background: rgba(128, 81, 255, 0.08);
  border: 1px solid rgba(128, 81, 255, 0.18);
  color: #5b21b6;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  margin-bottom: 26px;
}

.hero-badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #7cb300;
  box-shadow: 0 0 0 3px rgba(124, 179, 0, 0.18);
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.2); }
}

.hero-title {
  font-size: clamp(2.2rem, 5vw, 3.6rem);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: #0f0a1f;
  margin: 0 0 22px 0;
}

.hero-title-gradient {
  display: block;
  background: linear-gradient(135deg, #8051FF 0%, #5b21b6 55%, #7cb300 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-lede {
  font-size: 1.05rem;
  line-height: 1.7;
  color: #4b5563;
  max-width: 520px;
  margin: 0 0 34px 0;
}

/* CTA row */
.hero-cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 100px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}

.hero-cta-primary {
  background: #8051FF;
  color: #ffffff;
  box-shadow: 0 6px 24px rgba(128, 81, 255, 0.35);
}
.hero-cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 34px rgba(128, 81, 255, 0.45);
  background: #7040e8;
}

.hero-cta-ghost {
  background: #ffffff;
  color: #1f2937;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.hero-cta-ghost:hover {
  border-color: #c4b5fd;
  background: #faf7ff;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(128, 81, 255, 0.12);
}

/* RIGHT — mockup */
.hero-right {
  display: flex;
  justify-content: center;
}

.mockup-wrap {
  position: relative;
  width: 100%;
  max-width: 440px;
  animation: float-up 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes float-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Floating pills */
.mockup-float {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 10px 32px rgba(31, 41, 55, 0.14), 0 2px 8px rgba(31, 41, 55, 0.06);
  z-index: 3;
  white-space: nowrap;
  animation: float-bob 4s ease-in-out infinite;
}

.mockup-float-1 {
  top: -18px;
  right: -24px;
}

.mockup-float-2 {
  bottom: 36px;
  left: -32px;
  animation-delay: 1.5s;
}

@keyframes float-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.mockup-float-icon {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mockup-float-icon-lime {
  background: #C6FF4A;
}
.mockup-float-icon-purple {
  background: #8051FF;
}

.mockup-float-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.mockup-float-value {
  font-size: 0.8rem;
  font-weight: 800;
  color: #0A0A14;
  letter-spacing: -0.01em;
}

/* Main mockup card */
.mockup-card {
  position: relative;
  background: #ffffff;
  border-radius: 22px;
  padding: 26px;
  box-shadow:
    0 24px 60px rgba(91, 33, 182, 0.16),
    0 8px 20px rgba(91, 33, 182, 0.08),
    0 0 0 1px rgba(128, 81, 255, 0.08);
  z-index: 1;
}

.mockup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}

.mockup-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mockup-avatar {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #8051FF, #5b21b6);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  flex-shrink: 0;
}

.mockup-name {
  font-size: 0.85rem;
  font-weight: 800;
  color: #0A0A14;
  letter-spacing: -0.01em;
}

.mockup-urn {
  font-size: 0.65rem;
  color: #9ca3af;
  font-weight: 500;
  margin-top: 1px;
}

.mockup-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 100px;
  background: #f3ffd9;
  color: #5a8a00;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.mockup-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #7cb300;
  box-shadow: 0 0 8px rgba(124, 179, 0, 0.6);
}

/* Stats */
.mockup-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.mockup-stat {
  background: #f8f7fd;
  border-radius: 12px;
  padding: 12px 14px;
}

.mockup-stat-label {
  font-size: 0.62rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.mockup-stat-value {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0A0A14;
  letter-spacing: -0.02em;
}

.mockup-stat-warn {
  color: #d97706;
}

.mockup-currency {
  font-size: 0.6rem;
  font-weight: 700;
  color: #9ca3af;
  margin-right: 2px;
}

/* Chart */
.mockup-chart {
  margin-bottom: 18px;
}

.mockup-chart-label {
  font-size: 0.62rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
}

.mockup-chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 56px;
}

.mockup-bar {
  flex: 1;
  background: #ede9fe;
  border-radius: 4px 4px 2px 2px;
  transition: all 0.3s ease;
}

.mockup-bar-active {
  background: linear-gradient(to top, #8051FF, #a78bfa);
  box-shadow: 0 4px 14px rgba(128, 81, 255, 0.35);
}

/* List */
.mockup-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-top: 1px solid #f1f3f9;
  padding-top: 14px;
}

.mockup-list-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
}

.mockup-list-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.mockup-list-dot-green {
  background: #7cb300;
  box-shadow: 0 0 0 3px rgba(124, 179, 0, 0.15);
}

.mockup-list-dot-amber {
  background: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
}

.mockup-list-text {
  flex: 1;
  font-size: 0.7rem;
  font-weight: 600;
  color: #4b5563;
}

.mockup-list-amount {
  font-size: 0.72rem;
  font-weight: 800;
  color: #7cb300;
  letter-spacing: -0.01em;
}

.mockup-list-amount-warn {
  color: #d97706;
}

/* ============================================================
   REST OF PAGE
   ============================================================ */
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

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 959px) {
  .hero-section {
    padding: 80px 0 64px;
  }
  .hero-row {
    min-height: auto;
  }
  .hero-left {
    text-align: center;
    margin-bottom: 48px;
  }
  .hero-lede {
    margin-left: auto;
    margin-right: auto;
  }
  .hero-cta-row {
    justify-content: center;
  }
  .mockup-float-1 {
    right: 0;
    top: -14px;
  }
  .mockup-float-2 {
    left: 0;
    bottom: 24px;
  }
}

@media (max-width: 599px) {
  .hero-section {
    padding: 60px 0 48px;
  }
  .hero-title {
    font-size: 2rem;
  }
  .hero-lede {
    font-size: 0.92rem;
  }
  .hero-cta {
    padding: 12px 22px;
    font-size: 0.88rem;
    flex: 1;
    justify-content: center;
  }
  .hero-cta-row {
    gap: 10px;
  }
  .mockup-card {
    padding: 20px;
    border-radius: 18px;
  }
  .mockup-float {
    padding: 8px 12px;
  }
  .mockup-float-1 {
    top: -12px;
    right: -8px;
  }
  .mockup-float-2 {
    bottom: 16px;
    left: -8px;
  }
  .role-icon-wrapper {
    width: 56px;
    height: 56px;
  }
}
</style>