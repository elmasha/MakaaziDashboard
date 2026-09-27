<template>
  <div class="legal-root">
    <!-- Top bar -->
    <v-app-bar app flat color="white" class="legal-nav" height="70" elevate-on-scroll>
      <v-container class="d-flex align-center pa-0">
        <div class="d-flex align-center cursor-pointer" @click="goHome">
          <v-avatar color="#8051FF" size="38" class="mr-3 elevation-2">
            <v-icon color="white" size="20">mdi-home-city</v-icon>
          </v-avatar>
          <span class="text-h6 font-weight-bold brand-text">
            <span style="color: #8051FF;">Ma</span><span style="color: #7cb300;">kaazi</span>
          </span>
        </div>

        <v-spacer />

        <v-btn text class="text-capitalize font-weight-medium d-none d-sm-flex" @click="goHome">
          <v-icon left small>mdi-arrow-left</v-icon>
          Back to home
        </v-btn>
        <v-btn icon class="d-flex d-sm-none" @click="goHome">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-container>
    </v-app-bar>

    <v-main class="pa-0">
      <!-- Hero -->
      <section class="legal-hero">
        <v-container>
          <v-chip color="#ede9fe" text-color="#8051FF" small label
            class="mb-4 font-weight-bold px-4 py-1">
            <v-icon left small color="#8051FF">mdi-shield-lock-outline</v-icon>
            Your privacy matters
          </v-chip>

          <h1 class="legal-title">Privacy Policy</h1>
          <p class="legal-sub">
            How Makaazi collects, uses, and protects your personal information.
          </p>

          <div class="legal-meta">
            <div class="meta-item">
              <v-icon size="14" color="#8051FF">mdi-calendar-check</v-icon>
              <span>Last updated: {{ lastUpdated }}</span>
            </div>
            <div class="meta-item">
              <v-icon size="14" color="#8051FF">mdi-clock-outline</v-icon>
              <span>{{ readTime }} min read</span>
            </div>
          </div>
        </v-container>
      </section>

      <!-- Content -->
      <section class="legal-content">
        <v-container>
          <v-row>
            <!-- Sidebar TOC (desktop only) -->
            <v-col cols="12" md="3" class="d-none d-md-block">
              <nav class="toc">
                <div class="toc-title">On this page</div>
                <a
                  v-for="s in sections"
                  :key="s.id"
                  :href="`#${s.id}`"
                  class="toc-link"
                  :class="{ 'toc-link-active': activeSection === s.id }"
                >
                  {{ s.title }}
                </a>
              </nav>
            </v-col>

            <!-- Main copy -->
            <v-col cols="12" md="9">
              <div class="prose">
                <section
                  v-for="s in sections"
                  :key="s.id"
                  :id="s.id"
                  class="prose-section"
                >
                  <h2 class="prose-h2">
                    <span class="prose-num">{{ s.num }}</span>
                    {{ s.title }}
                  </h2>
                  <div v-html="s.body"></div>
                </section>

                <!-- Contact card -->
                <div class="contact-card">
                  <div class="contact-icon">
                    <v-icon size="22" color="white">mdi-email-outline</v-icon>
                  </div>
                  <div class="contact-body">
                    <div class="contact-title">Questions about your privacy?</div>
                    <div class="contact-sub">
                      Reach our Data Protection Officer at
                      <a href="mailto:privacy@makaazi.co.ke">privacy@makaazi.co.ke</a>
                    </div>
                  </div>
                </div>

                <div class="legal-footer">
                  <v-btn rounded depressed color="#8051FF" dark
                    class="text-capitalize font-weight-bold mr-2"
                    @click="goHome">
                    <v-icon left small>mdi-home-outline</v-icon>
                    Back to home
                  </v-btn>
                  <v-btn rounded outlined color="#8051FF"
                    class="text-capitalize font-weight-bold"
                    @click="goTerms">
                    <v-icon left small>mdi-file-document-outline</v-icon>
                    Terms of Service
                  </v-btn>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>
    </v-main>
  </div>
</template>

<script>
export default {
  name: 'PrivacyPage',
  head() {
    return {
      title: 'Privacy Policy · Makaazi',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content:
            'How Makaazi collects, uses, and protects your personal information.',
        },
      ],
    };
  },
  data() {
    return {
      lastUpdated: 'September 27, 2026',
      readTime: 8,
      activeSection: 'intro',
      _observer: null,
      sections: [
        {
          id: 'intro',
          num: '01',
          title: 'Introduction',
          body: `
            <p>Makaazi ("we", "our", "us") is a property and estate management platform built for Kenyan estates. This Privacy Policy explains what personal information we collect when you use our website, mobile app, or any of our services (collectively, the "Services"), how we use it, and the choices you have.</p>
            <p>By using Makaazi, you agree to the practices described in this policy. If you do not agree, please do not use the Services.</p>
          `,
        },
        {
          id: 'collect',
          num: '02',
          title: 'Information we collect',
          body: `
            <p>We collect information you provide directly to us, information that is generated when you use the Services, and information from third-party sources such as Firebase Authentication.</p>
            <h3>Information you give us</h3>
            <ul>
              <li><strong>Account details</strong> — name, email address, phone number, and (for officials) your role and estate association.</li>
              <li><strong>Estate and household data</strong> — household owner, spouse, caretaker, contact number, house number, section, court, and street.</li>
              <li><strong>Payment details</strong> — M-Pesa phone number, transaction IDs, and payment amounts. We do <em>not</em> store your M-Pesa PIN or full card numbers.</li>
              <li><strong>Communications</strong> — messages you send to support, feedback, and survey responses.</li>
            </ul>
            <h3>Information generated automatically</h3>
            <ul>
              <li>Device information (type, OS version, browser).</li>
              <li>Log data (IP address, access times, pages viewed).</li>
              <li>Cookies and similar tracking technologies.</li>
            </ul>
          `,
        },
        {
          id: 'use',
          num: '03',
          title: 'How we use your information',
          body: `
            <p>We use your information to:</p>
            <ul>
              <li>Provide, operate, and improve the Services.</li>
              <li>Process M-Pesa payments and reconcile them to the correct household.</li>
              <li>Send transactional SMS — receipts, approvals, and payment reminders.</li>
              <li>Respond to your inquiries and provide customer support.</li>
              <li>Detect, prevent, and address fraud or security incidents.</li>
              <li>Comply with legal obligations in Kenya, including the Data Protection Act, 2019.</li>
            </ul>
            <p>We do not sell your personal information. We do not use your data to train third-party AI models.</p>
          `,
        },
        {
          id: 'share',
          num: '04',
          title: 'When we share information',
          body: `
            <p>We share information only in the following cases:</p>
            <ul>
              <li><strong>With your estate officials</strong> — Chairmen, Secretaries, and Treasurers can see household records and payment status for their estate.</li>
              <li><strong>With service providers</strong> — Safaricom (for M-Pesa), Firebase (for authentication and hosting), and our SMS gateway. These providers only process data on our instruction.</li>
              <li><strong>For legal reasons</strong> — when required by law, court order, or to protect the rights and safety of users.</li>
              <li><strong>With your consent</strong> — for any other purpose you have explicitly agreed to.</li>
            </ul>
          `,
        },
        {
          id: 'security',
          num: '05',
          title: 'How we protect your data',
          body: `
            <p>We use industry-standard safeguards to protect your information:</p>
            <ul>
              <li>All traffic between your device and our servers is encrypted with HTTPS/TLS.</li>
              <li>Passwords are never stored — authentication is handled by Firebase with your choice of Google, email, or phone sign-in.</li>
              <li>M-Pesa transactions flow directly through Safaricom's Daraja API; we never see or store your PIN.</li>
              <li>Access to production databases is restricted to a small number of authorised engineers and logged in our audit trail.</li>
              <li>We run regular backups and can restore from a point-in-time snapshot within 24 hours.</li>
            </ul>
            <p>No system is 100% secure. If you suspect a breach on your account, email us immediately at <a href="mailto:security@makaazi.co.ke">security@makaazi.co.ke</a>.</p>
          `,
        },
        {
          id: 'retention',
          num: '06',
          title: 'How long we keep your data',
          body: `
            <p>We keep your data for as long as your account is active. When you delete your account:</p>
            <ul>
              <li><strong>Personal data</strong> — deleted within 30 days.</li>
              <li><strong>Payment and audit records</strong> — retained for 7 years, as required by Kenyan tax law.</li>
              <li><strong>Aggregated, de-identified statistics</strong> — may be retained indefinitely.</li>
            </ul>
          `,
        },
        {
          id: 'rights',
          num: '07',
          title: 'Your rights',
          body: `
            <p>Under the Kenya Data Protection Act, 2019, you have the right to:</p>
            <ul>
              <li><strong>Access</strong> — request a copy of the data we hold about you.</li>
              <li><strong>Correct</strong> — update inaccurate information.</li>
              <li><strong>Delete</strong> — ask us to erase your personal data.</li>
              <li><strong>Object</strong> — to certain processing, including marketing.</li>
              <li><strong>Port</strong> — receive your data in a machine-readable format.</li>
              <li><strong>Complain</strong> — to the Office of the Data Protection Commissioner (ODPC).</li>
            </ul>
            <p>To exercise any of these rights, email <a href="mailto:privacy@makaazi.co.ke">privacy@makaazi.co.ke</a>. We respond within 30 days.</p>
          `,
        },
        {
          id: 'cookies',
          num: '08',
          title: 'Cookies and tracking',
          body: `
            <p>We use a small number of cookies and local-storage keys to:</p>
            <ul>
              <li>Keep you signed in between visits.</li>
              <li>Remember your last-viewed estate.</li>
              <li>Measure aggregate usage so we can improve the product.</li>
            </ul>
            <p>We do not use advertising cookies. You can clear cookies from your browser at any time.</p>
          `,
        },
        {
          id: 'children',
          num: '09',
          title: 'Children',
          body: `
            <p>Makaazi is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us so we can delete it.</p>
          `,
        },
        {
          id: 'changes',
          num: '10',
          title: 'Changes to this policy',
          body: `
            <p>We may update this Privacy Policy from time to time. When we do, we will change the "Last updated" date at the top and, for material changes, notify you by email or in-app banner at least 14 days before the change takes effect.</p>
          `,
        },
        {
          id: 'contact',
          num: '11',
          title: 'Contact us',
          body: `
            <p>Makaazi Technologies Ltd.</p>
            <p>Nairobi, Kenya</p>
            <p>Email: <a href="mailto:privacy@makaazi.co.ke">privacy@makaazi.co.ke</a></p>
          `,
        },
      ],
    };
  },
  mounted() {
    this.setupActiveSectionObserver();
  },
  beforeDestroy() {
    if (this._observer) this._observer.disconnect();
  },
  methods: {
    goHome() {
      this._push('/');
    },
    goTerms() {
      this._push('/terms');
    },
    _push(path) {
      if (!path) return;
      try {
        if (this.$router) this.$router.push(path);
        else window.location.href = path;
      } catch (err) {
        window.location.href = path;
      }
    },
    setupActiveSectionObserver() {
      const headings = this.sections
        .map((s) => document.getElementById(s.id))
        .filter(Boolean);

      this._observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) this.activeSection = entry.target.id;
          });
        },
        { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
      );
      headings.forEach((el) => this._observer.observe(el));
    },
  },
};
</script>

<style scoped>
/* ============================================================
   ROOT
   ============================================================ */
.legal-root {
  background: #ffffff;
  min-height: 100vh;
}

/* ============================================================
   TOP BAR
   ============================================================ */
.legal-nav {
  border-bottom: 1px solid #f1f5f9 !important;
}
.brand-text {
  letter-spacing: -0.5px;
}

/* ============================================================
   HERO
   ============================================================ */
.legal-hero {
  background: linear-gradient(135deg, #fafafa 0%, #f5f3ff 100%);
  padding: 56px 0 48px;
  position: relative;
  overflow: hidden;
}
.legal-hero::before {
  content: "";
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(128, 81, 255, 0.15), transparent 70%);
  top: -150px;
  right: -100px;
  pointer-events: none;
}
.legal-title {
  font-size: 2.4rem;
  font-weight: 900;
  color: #0f0d24;
  letter-spacing: -0.8px;
  line-height: 1.15;
  margin: 0 0 12px;
}
.legal-sub {
  font-size: 1rem;
  color: #64748b;
  max-width: 620px;
  line-height: 1.65;
  margin: 0 0 22px;
}
.legal-meta {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: #94a3b8;
  font-weight: 600;
}

/* ============================================================
   CONTENT WRAPPER
   ============================================================ */
.legal-content {
  padding: 48px 0 80px;
}

/* ============================================================
   TABLE OF CONTENTS
   ============================================================ */
.toc {
  position: sticky;
  top: 100px;
  padding: 20px;
  background: #fafaff;
  border: 1px solid #e9e7f2;
  border-radius: 16px;
}
.toc-title {
  font-size: 0.68rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 14px;
}
.toc-link {
  display: block;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #64748b;
  text-decoration: none;
  transition: all 0.15s ease;
  margin-bottom: 2px;
}
.toc-link:hover {
  background: #f3eeff;
  color: #8051FF;
}
.toc-link-active {
  background: #f3eeff;
  color: #8051FF;
  font-weight: 800;
}

/* ============================================================
   PROSE (main copy)
   ============================================================ */
.prose {
  max-width: 720px;
  font-size: 0.95rem;
  line-height: 1.75;
  color: #334155;
}
.prose-section {
  margin-bottom: 44px;
  scroll-margin-top: 90px;
}
.prose-h2 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.4px;
  line-height: 1.3;
  margin: 0 0 18px;
}
.prose-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #8051FF, #a855f7);
  color: white;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  box-shadow: 0 8px 18px -8px rgba(128, 81, 255, 0.6);
  flex-shrink: 0;
}

/* v-html content is not scoped — use :deep() */
.prose :deep(p) {
  margin: 0 0 14px;
}
.prose :deep(h3) {
  font-size: 0.98rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -0.2px;
  margin: 22px 0 10px;
}
.prose :deep(ul) {
  margin: 0 0 16px;
  padding-left: 0;
  list-style: none;
}
.prose :deep(ul li) {
  position: relative;
  padding-left: 26px;
  margin-bottom: 8px;
}
.prose :deep(ul li)::before {
  content: "";
  position: absolute;
  left: 8px;
  top: 11px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #8051FF;
}
.prose :deep(strong) {
  color: #0f0d24;
  font-weight: 800;
}
.prose :deep(em) {
  color: #4b5563;
}
.prose :deep(a) {
  color: #8051FF;
  font-weight: 600;
  text-decoration: none;
  border-bottom: 1px solid rgba(128, 81, 255, 0.3);
  transition: border-color 0.15s ease;
}
.prose :deep(a:hover) {
  border-bottom-color: #8051FF;
}

/* ============================================================
   CONTACT CARD
   ============================================================ */
.contact-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #fafaff 0%, #f3eeff 100%);
  border: 1px solid #e9e0ff;
  border-radius: 18px;
  margin-bottom: 32px;
}
.contact-icon {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  background: linear-gradient(135deg, #8051FF, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.6);
}
.contact-body {
  min-width: 0;
}
.contact-title {
  font-size: 0.92rem;
  font-weight: 800;
  color: #0f0d24;
  margin-bottom: 4px;
}
.contact-sub {
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.5;
}
.contact-sub a {
  color: #8051FF;
  font-weight: 700;
  text-decoration: none;
}

/* ============================================================
   FOOTER ACTIONS
   ============================================================ */
.legal-footer {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 960px) {
  .legal-title {
    font-size: 1.8rem;
  }
  .prose {
    font-size: 0.9rem;
  }
  .prose-h2 {
    font-size: 1.15rem;
  }
}

@media (max-width: 599px) {
  .legal-hero {
    padding: 40px 0 32px;
  }
  .legal-title {
    font-size: 1.6rem;
  }
  .prose-num {
    width: 28px;
    height: 28px;
    font-size: 0.66rem;
  }
  .contact-card {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
}
</style>