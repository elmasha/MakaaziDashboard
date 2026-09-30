<template>
  <div class="landing-root">
    <!-- ============================================================
         TOP BAR
         ============================================================ -->
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
        <v-btn text class="mx-1 text-capitalize font-weight-medium" @click="scrollToSection('how')">How it works</v-btn>
        <v-btn text class="mx-1 text-capitalize font-weight-medium" @click="scrollToSection('features')">Features</v-btn>
        <v-btn text class="mx-1 text-capitalize font-weight-medium" @click="scrollToSection('pricing')">Pricing</v-btn>
        <v-btn text class="mx-1 text-capitalize font-weight-medium" @click="scrollToSection('faq')">FAQ</v-btn>
      </div>

      <!-- Auth-aware -->
      <div v-if="isAuthenticated" class="d-flex align-center ml-2 ml-sm-4">
        <v-btn text class="text-capitalize font-weight-medium mr-2 d-none d-sm-flex"
          :loading="resolvingDashboard" @click="goToMyDashboard">
          Dashboard
        </v-btn>

        <v-menu
          v-model="userMenu"
          offset-y
          transition="slide-y-transition"
          bottom
          :close-on-content-click="false"
        >
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
            <v-list-item @click="onMenuDashboard">
              <v-list-item-icon class="mr-3">
                <v-icon small color="#8051FF">mdi-view-dashboard</v-icon>
              </v-list-item-icon>
              <v-list-item-title class="text-body-2">My Dashboard</v-list-item-title>
            </v-list-item>
            <v-list-item @click="onMenuSignOut">
              <v-list-item-icon class="mr-3">
                <v-icon small color="error">mdi-logout</v-icon>
              </v-list-item-icon>
              <v-list-item-title class="text-body-2 error--text">Sign Out</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <v-btn v-else color="#8051FF" dark depressed rounded
        class="ml-2 ml-sm-4 px-4 px-sm-5 font-weight-bold text-capitalize hover-lift"
        @click="scrollToSection('roles')">
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
          <v-list-item v-if="isAuthenticated" @click="onMobileDashboard">
            <v-list-item-icon class="mr-3">
              <v-icon small color="#8051FF">mdi-view-dashboard</v-icon>
            </v-list-item-icon>
            <v-list-item-title class="font-weight-medium">My Dashboard</v-list-item-title>
          </v-list-item>
          <v-list-item @click="scrollToSection('how'); mobileMenu = false">
            <v-list-item-title>How it works</v-list-item-title>
          </v-list-item>
          <v-list-item @click="scrollToSection('features'); mobileMenu = false">
            <v-list-item-title>Features</v-list-item-title>
          </v-list-item>
          <v-list-item @click="scrollToSection('pricing'); mobileMenu = false">
            <v-list-item-title>Pricing</v-list-item-title>
          </v-list-item>
          <v-list-item @click="scrollToSection('faq'); mobileMenu = false">
            <v-list-item-title>FAQ</v-list-item-title>
          </v-list-item>
          <v-divider class="my-3"></v-divider>
          <v-list-item v-if="isAuthenticated" @click="onMobileSignOut">
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
          <div class="shape shape-4"></div>
        </div>

        <v-container class="hero-content py-8 py-sm-12 py-md-14">
          <v-row align="center" class="hero-grid">
            <v-col cols="12" md="6" lg="6" class="hero-copy-col">
              <v-chip color="#ede9fe" text-color="#8051FF" small label
                class="mb-4 font-weight-bold px-4 py-1">
                <span class="live-dot"></span>
                200+ estates across Kenya
              </v-chip>

              <h1 class="text-h4 text-sm-h3 text-md-h2 font-weight-black mb-4 hero-title">
                Manage your estate
                <span class="gradient-text d-block mt-1">the modern way</span>
              </h1>

              <p class="text-body-1 text-sm-h6 grey--text text--darken-1 mb-8 hero-sub">
                Service charges, records, M-Pesa payments, visitors, and reports — all in one console.
              </p>

              <div class="hero-cta-row">
                <v-btn large x-large color="#8051FF" dark depressed rounded
                  class="px-8 font-weight-bold text-capitalize elevation-4 hover-lift"
                  @click="scrollToSection('roles')">
                  <v-icon left>mdi-account-arrow-right</v-icon>
                  Choose your role
                </v-btn>

                <v-btn large x-large text color="grey darken-2" rounded
                  class="px-6 font-weight-medium text-capitalize"
                  @click="scrollToSection('how')">
                  <v-icon left color="#8051FF">mdi-play-circle</v-icon>
                  See how
                </v-btn>
              </div>

              <div class="trust-strip">
                <div class="trust-item">
                  <div class="trust-value">{{ fmtCount(displayStats.estates) }}+</div>
                  <div class="trust-label">Estates</div>
                </div>
                <div class="trust-divider"></div>
                <div class="trust-item">
                  <div class="trust-value">{{ fmtCount(displayStats.households) }}+</div>
                  <div class="trust-label">Households</div>
                </div>
                <div class="trust-divider"></div>
                <div class="trust-item">
                  <div class="trust-value">KES {{ fmtCount(displayStats.collected) }}</div>
                  <div class="trust-label">Processed</div>
                </div>
                <div class="trust-divider"></div>
                <div class="trust-item">
                  <div class="trust-value">99.9%</div>
                  <div class="trust-label">Uptime</div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6" lg="6" class="hero-preview-col">
              <div class="hero-preview">
                <div class="floating-badge floating-badge-1">
                  <v-icon size="16" color="#10b981">mdi-check-circle</v-icon>
                  <span>Payment · KES 3,500</span>
                </div>

                <div class="floating-badge floating-badge-2">
                  <v-icon size="16" color="#8051FF">mdi-account-check</v-icon>
                  <span>Household approved</span>
                </div>

                <div class="floating-badge floating-badge-3">
                  <v-icon size="16" color="#f59e0b">mdi-bell-ring</v-icon>
                  <span>12 new sign-ups</span>
                </div>

                <div class="preview-card">
                  <div class="preview-head">
                    <div class="preview-brand">
                      <div class="preview-avatar">
                        <v-icon size="16" color="white">mdi-home-city</v-icon>
                      </div>
                      <div>
                        <div class="preview-brand-name">Galilie Estate</div>
                        <div class="preview-brand-sub">Nairobi · GALIL-1770</div>
                      </div>
                    </div>
                    <div class="preview-status">
                      <span class="preview-status-dot"></span>
                      Active
                    </div>
                  </div>

                  <div class="preview-stats">
                    <div class="preview-stat">
                      <div class="preview-stat-icon" style="background:#ede9fe;">
                        <v-icon size="16" color="#8051FF">mdi-cash-multiple</v-icon>
                      </div>
                      <div class="preview-stat-label">Collected</div>
                      <div class="preview-stat-value">KES 284k</div>
                    </div>
                    <div class="preview-stat">
                      <div class="preview-stat-icon" style="background:#f3ffd9;">
                        <v-icon size="16" color="#7cb300">mdi-home-group</v-icon>
                      </div>
                      <div class="preview-stat-label">Households</div>
                      <div class="preview-stat-value">142</div>
                    </div>
                    <div class="preview-stat">
                      <div class="preview-stat-icon" style="background:#e1f5fe;">
                        <v-icon size="16" color="#0277bd">mdi-clock-check</v-icon>
                      </div>
                      <div class="preview-stat-label">Pending</div>
                      <div class="preview-stat-value">8</div>
                    </div>
                  </div>

                  <div class="preview-chart">
                    <div class="preview-chart-head">
                      <div class="preview-chart-title">Monthly collections</div>
                      <div class="preview-chart-range">2026</div>
                    </div>
                    <div class="preview-chart-bars">
                      <div class="bar" style="height: 40%;"></div>
                      <div class="bar" style="height: 65%;"></div>
                      <div class="bar" style="height: 55%;"></div>
                      <div class="bar" style="height: 80%;"></div>
                      <div class="bar" style="height: 72%;"></div>
                      <div class="bar" style="height: 92%;"></div>
                      <div class="bar" style="height: 68%;"></div>
                      <div class="bar" style="height: 88%;"></div>
                    </div>
                  </div>

                  <div class="preview-foot">
                    <div class="preview-foot-left">
                      <div class="preview-foot-avatar">MK</div>
                      <div>
                        <div class="preview-foot-name">Mercy Kamau</div>
                        <div class="preview-foot-sub">Chairman</div>
                      </div>
                    </div>
                    <div class="preview-foot-right">
                      <v-icon size="16" color="#94a3b8">mdi-dots-horizontal</v-icon>
                    </div>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ============================== LOGO STRIP ============================== -->
      <section class="logo-strip">
        <v-container>
          <div class="logo-strip-label">Trusted by estates across Kenya</div>
          <div class="logo-strip-row">
            <div v-for="n in 6" :key="n" class="logo-pill">
              <v-icon size="18" color="#94a3b8">mdi-home-city</v-icon>
              <span>Estate {{ n }}</span>
            </div>
          </div>
        </v-container>
      </section>

      <!-- ============================== HOW IT WORKS ============================== -->
      <section id="how" ref="how" class="how-section py-14 py-sm-18">
        <v-container>
          <div class="text-center mb-12">
            <v-chip color="#ede9fe" text-color="#8051FF" label class="mb-3 px-4 font-weight-bold">
              Simple setup
            </v-chip>
            <h2 class="text-h5 text-sm-h4 font-weight-black grey--text text--darken-3 mb-3">
              Get running in 3 steps
            </h2>
          </div>

          <div class="how-grid">
            <div
              v-for="(step, i) in steps"
              :key="step.title"
              class="how-card reveal-card"
              :style="{ animationDelay: i * 100 + 'ms' }"
            >
              <div class="how-num">{{ String(i + 1).padStart(2, '0') }}</div>
              <div class="how-icon" :style="`background: ${step.bg};`">
                <v-icon :color="step.color" size="26">{{ step.icon }}</v-icon>
              </div>
              <h3 class="how-title">{{ step.title }}</h3>
              <p class="how-desc">{{ step.desc }}</p>
            </div>
          </div>
        </v-container>
      </section>

      <!-- ============================== STATS BAND ============================== -->
      <section class="stats-band">
        <v-container>
          <div class="stats-band-grid">
            <div v-for="s in bigStats" :key="s.label" class="stats-band-item">
              <div class="stats-band-value">
                {{ s.prefix }}{{ fmtCount(displayBigStats[s.key]) }}{{ s.suffix }}
              </div>
              <div class="stats-band-label">{{ s.label }}</div>
            </div>
          </div>
        </v-container>
      </section>

      <!-- ============================== ROLE SELECT ============================== -->
      <section id="roles" ref="roles" class="roles-section py-14 py-sm-18">
        <v-container>
          <div class="text-center mb-10">
            <v-chip color="#ede9fe" text-color="#8051FF" label class="mb-3 px-4 font-weight-bold">
              Get Started
            </v-chip>
            <h2 class="text-h5 text-sm-h4 font-weight-black grey--text text--darken-3 mb-3">
              Who are you?
            </h2>
            <p class="text-body-1 grey--text text--darken-1" style="max-width: 560px; margin: 0 auto;">
              Your role determines what you can see and do.
            </p>
          </div>

          <v-row justify="center" align="stretch">
            <v-col v-for="(role, i) in roles" :key="role.key" cols="12" sm="6" md="4"
              class="mb-4 mb-md-0" :style="{ transitionDelay: i * 100 + 'ms' }">
              <v-hover v-slot="{ hover }">
                <v-card
                  class="role-card rounded-2xl h-100 pa-6 d-flex flex-column"
                  :class="{ 'elevation-8': hover, 'elevation-1': !hover }"
                  :style="hover ? 'transform: translateY(-6px)' : ''"
                  @click="chooseRole(role.key)">
                  <div class="role-icon-wrapper mb-5" :style="`background: ${role.bg};`">
                    <v-icon :color="role.color" size="32">{{ role.icon }}</v-icon>
                  </div>

                  <div class="text-overline font-weight-bold tracking-wide mb-1"
                    :style="`color: ${role.color};`">
                    {{ role.tag }}
                  </div>

                  <h3 class="text-h6 font-weight-bold grey--text text--darken-3 mb-2">
                    {{ role.title }}
                  </h3>

                  <p class="text-body-2 grey--text text--darken-1 mb-4"
                    style="line-height: 1.65; flex-grow: 1;">
                    {{ role.description }}
                  </p>

                  <v-divider class="mb-4" />

                  <div class="mb-5">
                    <div v-for="bullet in role.bullets" :key="bullet" class="d-flex align-center mb-2">
                      <v-icon small color="#7cb300" class="mr-2">mdi-check-circle</v-icon>
                      <span class="text-body-2 grey--text text--darken-1">{{ bullet }}</span>
                    </div>
                  </div>

                  <v-btn block large rounded depressed :color="role.color" dark
                    class="text-capitalize font-weight-bold hover-lift"
                    :loading="checkingRole === role.key"
                    :disabled="!!checkingRole"
                    @click.stop="chooseRole(role.key)">
                    <v-icon left>{{ role.ctaIcon }}</v-icon>
                    {{ role.cta }}
                  </v-btn>
                </v-card>
              </v-hover>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ============================== FEATURES ============================== -->
      <section id="features" ref="features" class="features-section py-14 py-sm-18 grey lighten-5">
        <v-container>
          <div class="text-center mb-10">
            <v-chip color="#ede9fe" text-color="#8051FF" label class="mb-3 px-4 font-weight-bold">
              What you get
            </v-chip>
            <h2 class="text-h5 text-sm-h4 font-weight-black grey--text text--darken-3 mb-3">
              Everything you need
            </h2>
          </div>

          <v-row>
            <v-col v-for="(feature, i) in features" :key="i" cols="12" sm="6" md="4">
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

      <!-- ============================== TESTIMONIALS ============================== -->
      <section class="testimonials-section py-14 py-sm-18">
        <v-container>
          <div class="text-center mb-12">
            <v-chip color="#ede9fe" text-color="#8051FF" label class="mb-3 px-4 font-weight-bold">
              Loved by officials
            </v-chip>
            <h2 class="text-h5 text-sm-h4 font-weight-black grey--text text--darken-3 mb-3">
              What officials are saying
            </h2>
          </div>

          <v-row>
            <v-col v-for="(t, i) in testimonials" :key="i" cols="12" md="4">
              <div class="testimonial-card reveal-card" :style="{ animationDelay: i * 100 + 'ms' }">
                <div class="testimonial-quote-icon">
                  <v-icon size="28" color="#8051FF">mdi-format-quote-open</v-icon>
                </div>
                <p class="testimonial-text">"{{ t.quote }}"</p>
                <div class="testimonial-author">
                  <div class="testimonial-avatar" :style="`background: ${t.color};`">
                    {{ t.initials }}
                  </div>
                  <div>
                    <div class="testimonial-name">{{ t.name }}</div>
                    <div class="testimonial-role">{{ t.role }}</div>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ============================== PRICING ============================== -->
      <section id="pricing" ref="pricing" class="pricing-section py-14 py-sm-18 grey lighten-5">
        <v-container>
          <div class="text-center mb-12">
            <v-chip color="#ede9fe" text-color="#8051FF" label class="mb-3 px-4 font-weight-bold">
              Simple pricing
            </v-chip>
            <h2 class="text-h5 text-sm-h4 font-weight-black grey--text text--darken-3 mb-3">
              Pay for the size you need
            </h2>
            <p class="text-body-1 grey--text text--darken-1" style="max-width: 560px; margin: 0 auto;">
              Billed monthly. Cancel anytime.
            </p>
          </div>

          <div v-if="plansLoading" class="pricing-grid">
            <div v-for="n in 4" :key="n" class="pricing-card pricing-card-skeleton">
              <v-skeleton-loader type="article, button" />
            </div>
          </div>

          <v-row v-else-if="pricing.length" justify="center">
            <v-col v-for="(p, i) in pricing" :key="p.name" cols="12" sm="6" md="3">
              <div class="pricing-card"
                :class="{ 'pricing-card-featured': p.featured }">
                <div v-if="p.featured" class="pricing-badge">Most popular</div>
                <div class="pricing-name">{{ p.name }}</div>
                <div class="pricing-range">{{ p.range }}</div>
                <div class="pricing-price">
                  <span class="pricing-currency">KES</span>
                  <span class="pricing-amount">{{ p.amount }}</span>
                  <span class="pricing-period">/mo</span>
                </div>
                <ul class="pricing-features">
                  <li v-for="f in p.features" :key="f">
                    <v-icon size="14" color="#10b981">mdi-check-circle</v-icon>
                    <span>{{ f }}</span>
                  </li>
                </ul>
              </div>
            </v-col>
          </v-row>

          <div v-else class="pricing-empty">
            <v-icon size="42" color="#8051FF">mdi-credit-card-off-outline</v-icon>
            <div class="pricing-empty-title">No plans available</div>
            <div class="pricing-empty-text">
              Plans haven't been configured yet.
            </div>
          </div>

          <div class="text-center mt-8">
            <v-btn text color="#8051FF" class="text-capitalize font-weight-bold"
              @click="scrollToSection('roles')">
              Get started
              <v-icon right small>mdi-arrow-right</v-icon>
            </v-btn>
          </div>
        </v-container>
      </section>

      <!-- ============================== FAQ ============================== -->
      <section id="faq" ref="faq" class="faq-section py-14 py-sm-18">
        <v-container>
          <div class="text-center mb-10">
            <h2 class="text-h5 text-sm-h4 font-weight-black grey--text text--darken-3 mb-3">
              FAQ
            </h2>
          </div>

          <v-row justify="center">
            <v-col cols="12" md="9" lg="7">
              <v-expansion-panels accordion flat>
                <v-expansion-panel v-for="(faq, i) in faqs" :key="i"
                  class="mb-2 rounded-xl" style="border: 1px solid #e2e8f0;">
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

      <!-- ============================== CTA BAND ============================== -->
      <section class="cta-band">
        <v-container>
          <div class="cta-band-inner">
            <div class="cta-band-content">
              <h2 class="cta-band-title">Ready to modernize your estate?</h2>
              <p class="cta-band-sub">
                Set up takes less than 5 minutes.
              </p>
              <div class="cta-band-actions">
                <v-btn large rounded depressed color="white" 
                  class="text-capitalize font-weight-bold" style="color: #0f0d24 !important;"
                  @click="scrollToSection('roles')">
                  <v-icon left color="#0f0d24">mdi-rocket-launch</v-icon>
                  Get started
                </v-btn>
                <v-btn large rounded text color="white" class="text-capitalize font-weight-medium"
                  href="mailto:support@makaazi.co.ke">
                  <v-icon left>mdi-email-outline</v-icon>
                  Talk to sales
                </v-btn>
              </div>
            </div>
            <div class="cta-band-shapes">
              <div class="cta-shape cta-shape-1"></div>
              <div class="cta-shape cta-shape-2"></div>
            </div>
          </div>
        </v-container>
      </section>

      <!-- ============================== FOOTER ============================== -->
      <v-footer color="transparent" class="py-0 site-footer">
        <v-container class="pa-0">
          <div class="footer-main">
            <v-container>
              <v-row class="py-10">
                <v-col cols="12" md="5" class="mb-8 mb-md-0">
                  <div class="d-flex align-center mb-4">
                    <v-avatar color="#8051FF" size="40" class="mr-3 footer-brand-avatar">
                      <v-icon color="white" size="20">mdi-home-city</v-icon>
                    </v-avatar>
                    <span class="text-h5 font-weight-black footer-brand-text">
                      <span style="color: #a78bfa;">Ma</span><span style="color: #a3e635;">kaazi</span>
                    </span>
                  </div>
                  <p class="footer-brand-desc">
                    The all-in-one platform for modern Kenyan estate management.
                  </p>

                  <div class="footer-social">
                    <button class="footer-social-btn" aria-label="Twitter">
                      <v-icon size="16">mdi-twitter</v-icon>
                    </button>
                    <button class="footer-social-btn" aria-label="LinkedIn">
                      <v-icon size="16">mdi-linkedin</v-icon>
                    </button>
                    <button class="footer-social-btn" aria-label="WhatsApp">
                      <v-icon size="16">mdi-whatsapp</v-icon>
                    </button>
                  </div>
                </v-col>

                <v-col cols="12" md="1" class="d-none d-md-block"></v-col>

                <v-col cols="6" md="2" class="mb-6 mb-md-0">
                  <div class="footer-head">Product</div>
                  <a class="footer-link" @click="scrollToSection('how')">
                    <span class="footer-link-arrow">→</span> How it works
                  </a>
                  <a class="footer-link" @click="scrollToSection('features')">
                    <span class="footer-link-arrow">→</span> Features
                  </a>
                  <a class="footer-link" @click="scrollToSection('pricing')">
                    <span class="footer-link-arrow">→</span> Pricing
                  </a>
                </v-col>

                <v-col cols="6" md="2" class="mb-6 mb-md-0">
                  <div class="footer-head">Support</div>
                  <a class="footer-link" @click="scrollToSection('faq')">
                    <span class="footer-link-arrow">→</span> FAQ
                  </a>
                  <a class="footer-link" href="mailto:support@makaazi.co.ke">
                    <span class="footer-link-arrow">→</span> Contact us
                  </a>
                </v-col>

                <v-col cols="12" md="2" class="mt-6 mt-md-0">
                  <div class="footer-head">Legal</div>
                  <a class="footer-link" @click="_push('/privacy')">
                    <span class="footer-link-arrow">→</span> Privacy Policy
                  </a>
                  <a class="footer-link" @click="_push('/terms')">
                    <span class="footer-link-arrow">→</span> Terms of Service
                  </a>
                </v-col>
              </v-row>
            </v-container>
          </div>

          <div class="footer-bottom-strip">
            <v-container>
              <div class="footer-bottom">
                <div class="footer-bottom-left">
                  <span class="footer-copy">
                    © {{ new Date().getFullYear() }} Makaazi Technologies Ltd.
                  </span>
                  <span class="footer-sep">·</span>
                  <span class="footer-copy footer-copy-muted">All rights reserved</span>
                </div>
                <div class="footer-bottom-right">
                  <span class="footer-made-with">
                    Made with <span class="footer-heart">♥</span> in Nairobi
                  </span>
                </div>
              </div>
            </v-container>
          </div>
        </v-container>
      </v-footer>
    </v-main>

    <!-- Role dialog -->
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

        <v-btn block large rounded :color="selectedRole?.color" dark
          class="text-capitalize font-weight-bold mb-2"
          :loading="routing" @click="proceedAsRole">
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
      userMenu: false,

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

      displayStats: { estates: 0, households: 0, collected: 0 },
      targetStats: { estates: 200, households: 12000, collected: 40000000 },
      displayBigStats: { estates: 0, households: 0, collected: 0, uptime: 0 },
      targetBigStats: { estates: 200, households: 12000, collected: 40, uptime: 99.9 },
      statsAnimated: false,
      _statsObserver: null,
      _revealObserver: null,

      bigStats: [
        { key: 'estates', label: 'Estates onboarded', prefix: '', suffix: '+' },
        { key: 'households', label: 'Households managed', prefix: '', suffix: '+' },
        { key: 'collected', label: 'KES collected (M)', prefix: 'KES ', suffix: 'M+' },
        { key: 'uptime', label: 'Platform uptime', prefix: '', suffix: '%' },
      ],

      steps: [
        {
          title: 'Create your account',
          desc: 'Sign in and verify your estate in under a minute.',
          icon: 'mdi-account-plus',
          color: '#8051FF',
          bg: '#ede9fe',
        },
        {
          title: 'Invite households & officials',
          desc: 'Share your URN. Residents register, you approve.',
          icon: 'mdi-account-multiple-plus',
          color: '#7cb300',
          bg: '#f3ffd9',
        },
        {
          title: 'Collect and track payments',
          desc: 'Set charges, send M-Pesa STK pushes, watch it live.',
          icon: 'mdi-chart-timeline-variant',
          color: '#0277bd',
          bg: '#e1f5fe',
        },
      ],

      testimonials: [
        {
          quote: 'We went from WhatsApp chaos to a real system in a weekend. Collections are up 40%.',
          name: 'Mercy Kamau',
          role: 'Chairman · Galilie Estate',
          initials: 'MK',
          color: 'linear-gradient(135deg, #8051FF, #a855f7)',
        },
        {
          quote: 'M-Pesa integration is flawless. Residents pay from home and receipts land automatically.',
          name: 'Sam Maina',
          role: 'Treasurer · Vaal Estate',
          initials: 'SM',
          color: 'linear-gradient(135deg, #7cb300, #a3e635)',
        },
        {
          quote: 'Approving new households used to take days. Now it\'s a 30-second review.',
          name: 'Magret Karimi',
          role: 'Secretary · Ngong Hills',
          initials: 'MG',
          color: 'linear-gradient(135deg, #0277bd, #38bdf8)',
        },
      ],

      pricing: [],
      plansLoading: false,

      roles: [
        {
          key: 'household',
          tag: 'Resident',
          title: 'I am a Household',
          description: 'Access payment records, view charges, and pay via M-Pesa.',
          icon: 'mdi-home-account',
          color: '#8051FF',
          bg: '#ede9fe',
          cta: 'Sign in / Register',
          ctaIcon: 'mdi-account-arrow-right',
          loginHint: 'You\'ll be taken to your household dashboard.',
          bullets: [
            'View payment summary',
            'Pay via M-Pesa',
            'See outstanding balance',
            'Payment notifications',
          ],
        },
        {
          key: 'official',
          tag: 'Estate Official',
          title: 'I am an Estate Official',
          description: 'Chairman, Secretary, or Treasurer. Manage households and set up your estate.',
          icon: 'mdi-shield-account',
          color: '#7cb300',
          bg: '#f3ffd9',
          cta: 'Sign in as Official',
          ctaIcon: 'mdi-shield-key',
          loginHint: 'You\'ll be taken to your official dashboard.',
          bullets: [
            'Approve registrations',
            'Update charges',
            'View payment reports',
            'Manage workers & cash',
          ],
        },
        {
          key: 'manager',
          tag: 'Estate Manager',
          title: 'I am an Estate Manager',
          description: 'Run operations across multiple estates.',
          icon: 'mdi-briefcase-account',
          color: '#d32f2f',
          bg: '#ffebee',
          cta: 'Sign in as Manager',
          ctaIcon: 'mdi-crown',
          loginHint: 'You\'ll be taken to the management console.',
          bullets: [
            'Manage multiple estates',
            'Subscriptions & billing',
            'Audit reports',
            'Manage admins',
          ],
        },
      ],

      features: [
        { title: 'Household Register', desc: 'One source of truth for every unit, owner, and contact.', icon: 'mdi-home-group', color: '#8051FF', bg: '#ede9fe' },
        { title: 'Service Charges', desc: 'Set charges, track payments, auto-calculate arrears.', icon: 'mdi-cash-multiple', color: '#7cb300', bg: '#f3ffd9' },
        { title: 'M-Pesa Payments', desc: 'STK push payments with automatic reconciliation.', icon: 'mdi-cellphone-wireless', color: '#0277bd', bg: '#e1f5fe' },
        { title: 'Visitor Management', desc: 'Log entries and exits. Approve, deny, audit.', icon: 'mdi-gate', color: '#ef6c00', bg: '#fff3e0' },
        { title: 'Reports & Exports', desc: 'Section, court, and cash-routing reports. Download as CSV.', icon: 'mdi-chart-bar', color: '#6a1b9a', bg: '#f3e5f5' },
        { title: 'Notifications', desc: 'Push alerts for payments and approvals.', icon: 'mdi-bell-ring', color: '#c62828', bg: '#ffebee' },
      ],

      faqs: [
        { q: 'Official vs. Manager — what\'s the difference?', a: 'An Official manages a single estate. A Manager runs multiple estates and administers billing and permissions.' },
        { q: 'Can I be both a household and an official?', a: 'Yes. Officials are also residents. Use the Official login for both your records and estate management.' },
        { q: 'I don\'t know my estate.', a: 'Contact your estate office or caretaker for the name or URN.' },
        { q: 'Is my payment info secure?', a: 'Yes. All M-Pesa transactions run through Safaricom\'s Daraja API with encryption in transit.' },
      ],
    };
  },

  computed: {
    userInitials() {
      if (!this.userName) return 'U';
      return this.userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    },
  },

  mounted() {
    window.addEventListener('scroll', this.handleScroll);
    this.checkAuth();
    this.fetchPricing();
    this.$nextTick(() => {
      this.setupStatsObserver();
      this.setupRevealObserver();
    });
  },

  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
    if (this._authUnsub) this._authUnsub();
    if (this._statsObserver) this._statsObserver.disconnect();
    if (this._revealObserver) this._revealObserver.disconnect();
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

    fmtCount(n) {
      return (Number(n) || 0).toLocaleString('en-US');
    },

    async fetchPricing() {
      this.plansLoading = true;
      try {
        const { data } = await axios.get(`${API}/estates/subscription-plans`);
        console.log('[pricing] raw response:', data);

        if (!Array.isArray(data) || !data.length) {
          this.pricing = [];
          return;
        }

        const featuresByTier = [
          ['Full estate console', 'M-Pesa payments', 'Email support', 'Monthly reports'],
          ['Everything in Band 1', 'Priority support', 'Advanced reports', 'Custom charges'],
          ['Everything in Band 2', 'Dedicated manager', 'API access', 'Bulk imports'],
          ['Everything in Band 3', 'On-site training', 'SLA guarantee', 'White-label'],
        ];

        const featuredIndex = data.length > 1 ? 1 : 0;

        this.pricing = data.map((p, i) => ({
          name: p.plan_name,
          range:
            p.max_households == null
              ? `${p.min_households}+ households`
              : `${p.min_households} – ${p.max_households} households`,
          amount: String(Number(p.monthly_rate).toFixed(0)),
          featured: i === featuredIndex,
          features: featuresByTier[i % featuresByTier.length],
        }));

        console.log('[pricing] mapped:', this.pricing);
      } catch (err) {
        console.error('[pricing] fetch failed:', err.response?.data || err.message);
        this.pricing = [];
      } finally {
        this.plansLoading = false;
      }
    },

    setupStatsObserver() {
      const trigger = this.$refs.roles || this.$refs.features;
      if (!trigger) return;
      this._statsObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !this.statsAnimated) {
              this.statsAnimated = true;
              this.animateStats();
            }
          });
        },
        { threshold: 0.15 }
      );
      this._statsObserver.observe(trigger);
    },

    animateStats() {
      const duration = 1400;
      const start = performance.now();
      const fromSmall = { ...this.displayStats };
      const fromBig = { ...this.displayBigStats };
      const toSmall = { ...this.targetStats };
      const toBig = { ...this.targetBigStats };

      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const ease = 1 - Math.pow(1 - t, 3);
        this.displayStats = {
          estates: Math.round(fromSmall.estates + (toSmall.estates - fromSmall.estates) * ease),
          households: Math.round(fromSmall.households + (toSmall.households - fromSmall.households) * ease),
          collected: Math.round(fromSmall.collected + (toSmall.collected - fromSmall.collected) * ease),
        };
        this.displayBigStats = {
          estates: Math.round(fromBig.estates + (toBig.estates - fromBig.estates) * ease),
          households: Math.round(fromBig.households + (toBig.households - fromBig.households) * ease),
          collected: Math.round(fromBig.collected + (toBig.collected - fromBig.collected) * ease),
          uptime: +(fromBig.uptime + (toBig.uptime - fromBig.uptime) * ease).toFixed(1),
        };
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },

    setupRevealObserver() {
      this._revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('reveal-visible');
              this._revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      this.$nextTick(() => {
        document.querySelectorAll('.reveal-card').forEach((el) => {
          this._revealObserver.observe(el);
        });
      });
    },

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
          that.$nextTick(() => that._unlockScroll());
        }
      });
    },

    _setUser(user) {
      this.isAuthenticated = true;
      this.uid = user.uid;
      this.userName = user.displayName || 'User';
      this.userEmail = user.email || '';
      this.userPhone = user.phoneNumber || '';
    },

    _forceCloseMenus() {
      document.querySelectorAll('.v-menu__content').forEach((el) => {
        el.style.display = 'none';
      });
      document.querySelectorAll('.v-overlay--active').forEach((el) => {
        el.classList.remove('v-overlay--active');
        el.style.display = 'none';
      });
    },

    _unlockScroll() {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.overflow = '';
      document.body.classList.remove('overflow-hidden');
      document.documentElement.classList.remove('overflow-hidden');
      document.body.classList.remove('v-overlay-container');
      setTimeout(() => {
        if (document.body.style.overflow === 'hidden') {
          document.body.style.overflow = '';
          document.documentElement.style.overflow = '';
        }
      }, 300);
    },

    onMenuDashboard() {
      this.userMenu = false;
      this.$nextTick(() => {
        setTimeout(() => this.goToMyDashboard(), 50);
      });
    },

    onMenuSignOut() {
      this.userMenu = false;
      this.$nextTick(() => {
        setTimeout(() => this.signOut(), 50);
      });
    },

    onMobileDashboard() {
      this.mobileMenu = false;
      this.$nextTick(() => {
        setTimeout(() => this.goToMyDashboard(), 50);
      });
    },

    onMobileSignOut() {
      this.mobileMenu = false;
      this.$nextTick(() => {
        setTimeout(() => this.signOut(), 50);
      });
    },

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
        .then(({ data, status }) => {
          if (status === 200 && data?.official_id && data?.estate_id) {
            this._push(`/officials/dashboard/${data.estate_id}`);
            return;
          }
          this._push('/officials/login');
        })
        .catch(() => {
          this._push('/officials/login');
        });
    },

    proceedAsRole() {
      if (!this.selectedRole) return;
      this.routing = true;

      const key = this.selectedRole.key;
      let path;
      if (key === 'household') path = '/household/register';
      else if (key === 'official') path = '/officials/login';
      else path = `/login?role=${key}`;

      setTimeout(() => {
        this._push(path);
        this.routing = false;
        this.roleDialog = false;
      }, 250);
    },

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
        if (official?.status === 200 && official.data?.estate_id) {
          this._push(`/officials/dashboard/${official.data.estate_id}`);
          return;
        }
        const household = await axios
          .get(`${API}/households/getHouseHoldId/${this.uid}`)
          .catch(() => null);
        if (household?.status === 200 && household.data?.household_id) {
          this._push(`/household/dashboard/${this.uid}`);
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
        window.location.href = path;
      }
    },

    async signOut() {
      this.userMenu = false;
      this.mobileMenu = false;
      this._forceCloseMenus();
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
      this.$nextTick(() => {
        this._unlockScroll();
      });
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
.modern-nav { transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.nav-scrolled {
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.06) !important;
}
.brand-text { letter-spacing: -0.5px; }

/* ============================================================
   HERO
   ============================================================ */
.hero-section {
  position: relative;
  background: linear-gradient(135deg, #fafafa 0%, #f5f3ff 100%);
  overflow: hidden;
}
.hero-bg-shapes {
  position: absolute; inset: 0; overflow: hidden; pointer-events: none;
}
.shape {
  position: absolute; border-radius: 50%;
  filter: blur(100px); opacity: 0.55;
}
.shape-1 { width: 500px; height: 500px; background: #ede9fe; top: -150px; right: -100px; }
.shape-2 { width: 400px; height: 400px; background: #f3ffd9; bottom: -100px; left: -100px; }
.shape-3 { width: 350px; height: 350px; background: #fff3e0; top: 45%; right: 25%; }
.shape-4 { width: 300px; height: 300px; background: #e1f5fe; bottom: 10%; right: -80px; }

.hero-content { position: relative; z-index: 2; }
.hero-grid { min-height: calc(100vh - 130px); align-items: center; }
.hero-copy-col { padding-top: 24px; padding-bottom: 24px; }

.hero-title { line-height: 1.1; letter-spacing: -0.03em; color: #0f0d24; }
.gradient-text {
  background: linear-gradient(135deg, #8051FF 0%, #5b21b6 50%, #4c1d95 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-sub { max-width: 520px; line-height: 1.65; }

.hero-cta-row {
  display: flex; flex-wrap: wrap; gap: 12px;
  align-items: center; margin-bottom: 36px;
}

.live-dot {
  display: inline-block; width: 7px; height: 7px; border-radius: 50%;
  background: #10b981; margin-right: 6px;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6);
  animation: livePulse 2s infinite; vertical-align: middle;
}
@keyframes livePulse {
  0%   { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
  70%  { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.trust-strip {
  display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid #e9e7f2; border-radius: 18px;
  max-width: 620px;
  box-shadow: 0 10px 30px -18px rgba(15, 13, 36, 0.15);
}
.trust-item { min-width: 0; }
.trust-value {
  font-size: 1.05rem; font-weight: 800; color: #0f0d24;
  letter-spacing: -0.4px; line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.trust-label {
  font-size: 0.66rem; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.6px; margin-top: 3px;
}
.trust-divider { width: 1px; height: 30px; background: #e9e7f2; }

.hero-preview-col { padding-top: 24px; padding-bottom: 24px; }
.hero-preview { position: relative; max-width: 480px; margin: 0 auto; }

.preview-card {
  position: relative; background: #ffffff;
  border: 1px solid #e9e7f2; border-radius: 22px; padding: 20px;
  box-shadow: 0 40px 80px -30px rgba(15, 13, 36, 0.28), 0 20px 40px -20px rgba(128, 81, 255, 0.15);
  transform: perspective(1000px) rotateY(-4deg) rotateX(2deg);
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.hero-preview:hover .preview-card { transform: perspective(1000px) rotateY(0) rotateX(0); }

.preview-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.preview-brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
.preview-avatar {
  width: 38px; height: 38px; border-radius: 11px;
  background: linear-gradient(135deg, #8051FF, #a855f7);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 6px 14px -6px rgba(128, 81, 255, 0.6); flex-shrink: 0;
}
.preview-brand-name { font-size: 0.85rem; font-weight: 800; color: #0f0d24; letter-spacing: -0.2px; }
.preview-brand-sub { font-size: 0.68rem; color: #94a3b8; margin-top: 1px; font-family: ui-monospace, monospace; }

.preview-status {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 999px;
  background: #d1fae5; color: #065f46;
  font-size: 0.62rem; font-weight: 800; letter-spacing: 0.4px; text-transform: uppercase;
  flex-shrink: 0;
}
.preview-status-dot { width: 5px; height: 5px; border-radius: 50%; background: #10b981; }

.preview-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; }
.preview-stat { background: #fafaff; border: 1px solid #f0eef8; border-radius: 12px; padding: 10px; display: flex; flex-direction: column; gap: 2px; }
.preview-stat-icon { width: 26px; height: 26px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 6px; }
.preview-stat-label { font-size: 0.55rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
.preview-stat-value { font-size: 0.82rem; font-weight: 800; color: #0f0d24; letter-spacing: -0.3px; font-variant-numeric: tabular-nums; }

.preview-chart { background: #fafaff; border: 1px solid #f0eef8; border-radius: 14px; padding: 14px; margin-bottom: 14px; }
.preview-chart-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.preview-chart-title { font-size: 0.72rem; font-weight: 800; color: #0f0d24; }
.preview-chart-range { font-size: 0.62rem; font-weight: 800; color: #8051FF; padding: 2px 8px; border-radius: 999px; background: #ede9fe; }
.preview-chart-bars { display: flex; align-items: flex-end; gap: 6px; height: 70px; }
.bar {
  flex: 1;
  background: linear-gradient(180deg, #a855f7 0%, #8051FF 100%);
  border-radius: 5px 5px 2px 2px;
  opacity: 0.85;
  animation: barGrow 1s cubic-bezier(0.4, 0, 0.2, 1) both;
  transform-origin: bottom;
}
@keyframes barGrow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
.bar:nth-child(1) { animation-delay: 0.05s; }
.bar:nth-child(2) { animation-delay: 0.1s; }
.bar:nth-child(3) { animation-delay: 0.15s; }
.bar:nth-child(4) { animation-delay: 0.2s; }
.bar:nth-child(5) { animation-delay: 0.25s; }
.bar:nth-child(6) { animation-delay: 0.3s; }
.bar:nth-child(7) { animation-delay: 0.35s; }
.bar:nth-child(8) { animation-delay: 0.4s; }

.preview-foot { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid #f0eef8; }
.preview-foot-left { display: flex; align-items: center; gap: 10px; }
.preview-foot-avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: linear-gradient(135deg, #8051FF, #a855f7);
  color: white; display: flex; align-items: center; justify-content: center;
  font-size: 0.62rem; font-weight: 800; letter-spacing: 0.3px;
}
.preview-foot-name { font-size: 0.76rem; font-weight: 800; color: #0f0d24; }
.preview-foot-sub { font-size: 0.64rem; color: #94a3b8; font-weight: 600; }

.floating-badge {
  position: absolute; display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; background: #ffffff;
  border: 1px solid #e9e7f2; border-radius: 999px;
  font-size: 0.72rem; font-weight: 800; color: #0f0d24;
  box-shadow: 0 12px 24px -12px rgba(15, 13, 36, 0.25);
  z-index: 3; white-space: nowrap;
}
.floating-badge-1 { top: -14px; left: -14px; animation: floatY 3s ease-in-out infinite; }
.floating-badge-2 { bottom: 30px; right: -18px; animation: floatY 3s ease-in-out infinite 0.6s; }
.floating-badge-3 { top: 40%; right: -30px; animation: floatY 3s ease-in-out infinite 1.2s; }

@keyframes floatY {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}

/* ============================================================
   LOGO STRIP
   ============================================================ */
.logo-strip {
  background: #ffffff;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  padding: 28px 0;
}
.logo-strip-label {
  text-align: center; font-size: 0.7rem; font-weight: 800;
  color: #94a3b8; text-transform: uppercase; letter-spacing: 1.2px;
  margin-bottom: 16px;
}
.logo-strip-row {
  display: flex; align-items: center; justify-content: center;
  gap: 12px; flex-wrap: wrap;
}
.logo-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; background: #f8fafc;
  border: 1px solid #e2e8f0; border-radius: 999px;
  font-size: 0.78rem; font-weight: 700; color: #94a3b8;
}

/* ============================================================
   HOW IT WORKS
   ============================================================ */
.how-section { background: #ffffff; }
.how-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}
.how-card {
  position: relative;
  background: #fafaff;
  border: 1px solid #e9e7f2;
  border-radius: 20px;
  padding: 28px 24px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.how-card:hover {
  transform: translateY(-4px);
  border-color: #c7b8ff;
  box-shadow: 0 20px 40px -20px rgba(128, 81, 255, 0.3);
}
.how-num {
  position: absolute; top: 20px; right: 24px;
  font-size: 2.2rem; font-weight: 900;
  color: #ede9fe; letter-spacing: -1px; line-height: 1;
}
.how-icon {
  width: 56px; height: 56px; border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 18px;
}
.how-title {
  font-size: 1rem; font-weight: 800; color: #0f0d24;
  letter-spacing: -0.2px; margin-bottom: 8px;
}
.how-desc {
  font-size: 0.85rem; color: #64748b;
  line-height: 1.65; margin: 0;
}

/* ============================================================
   STATS BAND
   ============================================================ */
.stats-band {
  background: linear-gradient(135deg, #0a0a14 0%, #221047 55%, #2b1256 100%);
  padding: 56px 0;
  position: relative; overflow: hidden;
}
.stats-band::before {
  content: ""; position: absolute; inset: 0;
  background: radial-gradient(circle at 20% 30%, rgba(128, 81, 255, 0.25), transparent 50%);
  pointer-events: none;
}
.stats-band-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 32px;
  position: relative; z-index: 2;
}
.stats-band-item { text-align: center; }
.stats-band-value {
  font-size: 2.2rem; font-weight: 900;
  color: #ffffff; letter-spacing: -1px;
  line-height: 1; margin-bottom: 8px;
  font-variant-numeric: tabular-nums;
}
.stats-band-label {
  font-size: 0.72rem; font-weight: 700;
  color: rgba(255, 255, 255, 0.55);
  text-transform: uppercase; letter-spacing: 1px;
}

/* ============================================================
   ROLE CARDS
   ============================================================ */
.roles-section { background: #ffffff; }
.role-card {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e2e8f0;
  cursor: pointer; background: #ffffff;
}
.role-icon-wrapper {
  width: 64px; height: 64px; border-radius: 18px;
  display: flex; align-items: center; justify-content: center;
}

/* ============================================================
   FEATURES
   ============================================================ */
.feature-card { transition: all 0.3s ease; background: #ffffff; }
.feature-card:hover {
  border-color: #cbd5e1 !important;
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06) !important;
}
.feature-icon-wrapper {
  width: 56px; height: 56px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
}

/* ============================================================
   TESTIMONIALS
   ============================================================ */
.testimonials-section { background: #ffffff; }
.testimonial-card {
  background: #ffffff;
  border: 1px solid #e9e7f2;
  border-radius: 20px;
  padding: 28px 24px;
  height: 100%;
  display: flex; flex-direction: column;
  transition: all 0.25s ease;
}
.testimonial-card:hover {
  transform: translateY(-4px);
  border-color: #c7b8ff;
  box-shadow: 0 20px 40px -20px rgba(128, 81, 255, 0.25);
}
.testimonial-quote-icon { margin-bottom: 14px; }
.testimonial-text {
  font-size: 0.92rem; color: #334155;
  line-height: 1.7; flex-grow: 1; margin-bottom: 20px;
  font-style: italic;
}
.testimonial-author { display: flex; align-items: center; gap: 12px; }
.testimonial-avatar {
  width: 42px; height: 42px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 0.78rem; font-weight: 800;
  letter-spacing: 0.3px; flex-shrink: 0;
}
.testimonial-name { font-size: 0.85rem; font-weight: 800; color: #0f0d24; }
.testimonial-role { font-size: 0.72rem; color: #94a3b8; font-weight: 600; margin-top: 2px; }

/* ============================================================
   PRICING
   ============================================================ */
.pricing-card {
  position: relative;
  background: #ffffff;
  border: 2px solid #e9e7f2;
  border-radius: 20px;
  padding: 28px 24px;
  height: 100%;
  transition: all 0.25s ease;
  animation: pricingFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
}
@keyframes pricingFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.pricing-card:hover {
  transform: translateY(-4px);
  border-color: #c7b8ff;
  box-shadow: 0 20px 40px -20px rgba(128, 81, 255, 0.25);
}
.pricing-card-featured {
  border-color: #8051FF;
  background: linear-gradient(180deg, #faf8ff 0%, #ffffff 40%);
  box-shadow: 0 20px 40px -20px rgba(128, 81, 255, 0.35);
}
.pricing-badge {
  position: absolute; top: -12px; left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #8051FF, #a855f7);
  color: white;
  padding: 4px 14px; border-radius: 999px;
  font-size: 0.62rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.5px;
  white-space: nowrap;
}
.pricing-name { font-size: 0.9rem; font-weight: 800; color: #0f0d24; }
.pricing-range { font-size: 0.72rem; color: #94a3b8; margin-top: 3px; font-weight: 600; }
.pricing-price {
  display: flex; align-items: baseline; gap: 4px;
  margin: 18px 0;
}
.pricing-currency { font-size: 0.82rem; font-weight: 800; color: #8051FF; }
.pricing-amount {
  font-size: 2rem; font-weight: 900; color: #0f0d24;
  letter-spacing: -1px; line-height: 1;
}
.pricing-period { font-size: 0.78rem; color: #94a3b8; font-weight: 600; }
.pricing-features {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 9px;
}
.pricing-features li {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.8rem; color: #4b5563;
}

.pricing-card-skeleton {
  min-height: 300px;
  animation: none;
}
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  justify-content: center;
}
.pricing-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  text-align: center;
}
.pricing-empty-title {
  font-size: 1rem;
  font-weight: 800;
  color: #0f0d24;
  margin-top: 12px;
}
.pricing-empty-text {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-top: 6px;
  max-width: 320px;
  line-height: 1.5;
}

/* ============================================================
   CTA BAND
   ============================================================ */
.cta-band {
  background: linear-gradient(135deg, #0a0a14 0%, #221047 55%, #2b1256 100%);
  padding: 64px 0;
  position: relative; overflow: hidden;
}
.cta-band-inner {
  position: relative;
  display: flex; align-items: center; justify-content: space-between;
  gap: 24px; flex-wrap: wrap;
}
.cta-band-content { position: relative; z-index: 2; }
.cta-band-title {
  font-size: 1.6rem; font-weight: 900; color: white;
  letter-spacing: -0.6px; line-height: 1.15; margin-bottom: 10px;
}
.cta-band-sub {
  font-size: 0.95rem; color: rgba(255, 255, 255, 0.7);
  max-width: 520px; line-height: 1.6; margin-bottom: 22px;
}
.cta-band-actions { display: flex; gap: 10px; flex-wrap: wrap; }

.cta-band-shapes { position: absolute; inset: 0; pointer-events: none; }
.cta-shape {
  position: absolute; border-radius: 50%;
  filter: blur(80px); opacity: 0.4;
}
.cta-shape-1 { width: 300px; height: 300px; background: #8051FF; top: -100px; right: 10%; }
.cta-shape-2 { width: 250px; height: 250px; background: #7cb300; bottom: -80px; right: 30%; }

/* ============================================================
   FOOTER
   ============================================================ */
.site-footer {
  background: linear-gradient(180deg, #0a0a14 0%, #14102b 60%, #1a1533 100%) !important;
  position: relative;
  overflow: hidden;
}
.site-footer::before {
  content: "";
  position: absolute;
  top: -120px;
  right: -100px;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(128, 81, 255, 0.15), transparent 70%);
  pointer-events: none;
}
.site-footer::after {
  content: "";
  position: absolute;
  bottom: -150px;
  left: -80px;
  width: 350px;
  height: 350px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(163, 230, 53, 0.08), transparent 70%);
  pointer-events: none;
}

.footer-main {
  position: relative;
  z-index: 2;
}

.footer-brand-avatar {
  background: linear-gradient(135deg, #8051FF, #a855f7) !important;
  box-shadow: 0 8px 18px -8px rgba(128, 81, 255, 0.8);
}

.footer-brand-text {
  letter-spacing: -0.6px;
}

.footer-brand-desc {
  font-size: 0.85rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.55);
  max-width: 380px;
  margin: 0 0 20px;
}

.footer-social {
  display: flex;
  gap: 8px;
}
.footer-social-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.65);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.footer-social-btn:hover {
  background: linear-gradient(135deg, #8051FF, #a855f7);
  border-color: transparent;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -10px rgba(128, 81, 255, 0.7);
}

.footer-head {
  font-size: 0.7rem;
  font-weight: 800;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin-bottom: 16px;
  position: relative;
  padding-bottom: 10px;
}
.footer-head::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 24px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, #8051FF, #a855f7);
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 10px;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s ease, transform 0.2s ease;
  width: fit-content;
}
.footer-link-arrow {
  display: inline-block;
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  color: #a78bfa;
  font-weight: 700;
}
.footer-link:hover {
  color: #ffffff;
  transform: translateX(2px);
}
.footer-link:hover .footer-link-arrow {
  opacity: 1;
  transform: translateX(0);
}

.footer-bottom-strip {
  position: relative;
  z-index: 2;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.15);
}
.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 20px 0;
}
.footer-bottom-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.footer-copy {
  font-size: 0.76rem;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 600;
}
.footer-copy-muted {
  color: rgba(255, 255, 255, 0.35);
}
.footer-sep {
  color: rgba(255, 255, 255, 0.2);
}
.footer-bottom-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.footer-made-with {
  font-size: 0.76rem;
  color: rgba(255, 255, 255, 0.45);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.footer-heart {
  color: #ef4444;
  display: inline-block;
  animation: heartBeat 1.6s ease-in-out infinite;
}
@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  15%      { transform: scale(1.15); }
  30%      { transform: scale(1); }
  45%      { transform: scale(1.1); }
  60%      { transform: scale(1); }
}

/* ============================================================
   REVEAL ANIMATION
   ============================================================ */
.reveal-card {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}
.reveal-card.reveal-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ============================================================
   Utilities
   ============================================================ */
.rounded-2xl { border-radius: 20px !important; }
.hover-lift { transition: all 0.3s ease; }
.hover-lift:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(128, 81, 255, 0.25) !important;
}
.tracking-wide { letter-spacing: 0.08em; }
.gap-2 { gap: 8px; }

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 960px) {
  .hero-grid { min-height: auto; }
  .hero-copy-col { text-align: center; }
  .hero-sub { margin-left: auto; margin-right: auto; }
  .hero-cta-row { justify-content: center; }
  .trust-strip { margin-left: auto; margin-right: auto; justify-content: center; }
  .hero-preview-col { margin-top: 40px; }
  .preview-card { transform: none; }
  .hero-preview:hover .preview-card { transform: none; }
  .floating-badge-1 { left: 8px; }
  .floating-badge-2 { right: 8px; }
  .floating-badge-3 { right: 8px; }

  .cta-band-inner { justify-content: center; text-align: center; }
  .cta-band-actions { justify-content: center; }

  .footer-brand-desc { max-width: 100%; }
  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 599px) {
  .hero-title { font-size: 1.9rem !important; }
  .hero-sub { font-size: 0.95rem !important; }
  .trust-strip { gap: 12px; padding: 12px 14px; }
  .trust-value { font-size: 0.92rem; }
  .trust-label { font-size: 0.58rem; }
  .trust-divider { height: 24px; }
  .floating-badge { font-size: 0.64rem; padding: 6px 10px; }
  .floating-badge-1 { top: -10px; left: 6px; }
  .floating-badge-2 { bottom: 20px; right: 6px; }
  .floating-badge-3 { display: none; }
  .preview-stat-value { font-size: 0.72rem; }
  .preview-stat-label { font-size: 0.5rem; }
  .stats-band-value { font-size: 1.6rem; }
  .cta-band-title { font-size: 1.35rem; }
  .pricing-card { padding: 22px 18px; }

  .footer-brand-text { font-size: 1.15rem !important; }
  .footer-social-btn { width: 34px; height: 34px; }
  .footer-head {
    font-size: 0.66rem;
    letter-spacing: 1px;
    margin-bottom: 12px;
  }
  .footer-link {
    font-size: 0.8rem;
    margin-bottom: 8px;
  }
}

@media (max-width: 400px) {
  .trust-divider { display: none; }
  .trust-strip {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
}
</style>