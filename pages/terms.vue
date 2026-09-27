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
            <v-icon left small color="#8051FF">mdi-file-document-check-outline</v-icon>
            Legal agreement
          </v-chip>

          <h1 class="legal-title">Terms of Service</h1>
          <p class="legal-sub">
            The rules that govern your use of Makaazi and its services.
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
                    <v-icon size="22" color="white">mdi-gavel</v-icon>
                  </div>
                  <div class="contact-body">
                    <div class="contact-title">Questions about these terms?</div>
                    <div class="contact-sub">
                      Contact our legal team at
                      <a href="mailto:legal@makaazi.co.ke">legal@makaazi.co.ke</a>
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
                    @click="goPrivacy">
                    <v-icon left small>mdi-shield-lock-outline</v-icon>
                    Privacy Policy
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
  name: 'TermsPage',
  head() {
    return {
      title: 'Terms of Service · Makaazi',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content:
            'The rules that govern your use of Makaazi and its services.',
        },
      ],
    };
  },
  data() {
    return {
      lastUpdated: 'September 27, 2026',
      readTime: 7,
      activeSection: 'acceptance',
      _observer: null,
      sections: [
        {
          id: 'acceptance',
          num: '01',
          title: 'Acceptance of terms',
          body: `
            <p>These Terms of Service ("Terms") form a legally binding agreement between you ("you", "your") and Makaazi Technologies Ltd. ("Makaazi", "we", "us"). By accessing or using the Makaazi website, mobile app, or any related services (collectively, the "Services"), you agree to be bound by these Terms.</p>
            <p>If you are using the Services on behalf of an estate, company, or other legal entity, you represent that you have the authority to bind that entity to these Terms.</p>
          `,
        },
        {
          id: 'eligibility',
          num: '02',
          title: 'Eligibility',
          body: `
            <p>To use Makaazi, you must:</p>
            <ul>
              <li>Be at least 18 years old.</li>
              <li>Provide accurate registration information.</li>
              <li>Have the legal capacity to enter into a binding contract.</li>
              <li>Not be barred from using the Services under the laws of Kenya or any other applicable jurisdiction.</li>
            </ul>
          `,
        },
        {
          id: 'account',
          num: '03',
          title: 'Your account',
          body: `
            <p>You are responsible for:</p>
            <ul>
              <li>Maintaining the confidentiality of your login credentials.</li>
              <li>All activity that occurs under your account.</li>
              <li>Notifying us immediately of any unauthorised use.</li>
            </ul>
            <p>We may suspend or terminate your account if we detect misuse, fraud, or a violation of these Terms.</p>
          `,
        },
        {
          id: 'use',
          num: '04',
          title: 'Acceptable use',
          body: `
            <p>You agree <strong>not</strong> to:</p>
            <ul>
              <li>Use the Services for any unlawful purpose or in violation of any Kenyan law.</li>
              <li>Impersonate any person or entity, or misrepresent your affiliation.</li>
              <li>Upload viruses, malware, or any code designed to disrupt the Services.</li>
              <li>Attempt to gain unauthorised access to any part of the Services or other users' accounts.</li>
              <li>Harvest or scrape data from the Services without our written permission.</li>
              <li>Use the Services to send unsolicited commercial messages (spam).</li>
              <li>Reverse engineer, decompile, or attempt to derive the source code.</li>
            </ul>
            <p>We reserve the right to remove any content and suspend any account that violates these rules.</p>
          `,
        },
        {
          id: 'payments',
          num: '05',
          title: 'Payments and subscriptions',
          body: `
            <h3>Service charges</h3>
            <p>Estates set their own service charges. Makaazi facilitates M-Pesa collection but does not set, hold, or refund those amounts. All refunds for service charges are the estate's responsibility.</p>
            <h3>Platform subscription</h3>
            <p>Makaazi charges estates a monthly subscription based on household count. Subscriptions are billed in advance and are non-refundable except where required by law. Failed payments may result in suspension of your estate's account.</p>
            <h3>Third-party fees</h3>
            <p>M-Pesa transaction fees charged by Safaricom are your responsibility and are set independently by Safaricom.</p>
          `,
        },
        {
          id: 'content',
          num: '06',
          title: 'Your content',
          body: `
            <p>You retain ownership of any content you upload to the Services — household data, images, notes, and reports. By uploading content, you grant Makaazi a worldwide, non-exclusive licence to host, store, and display that content solely to operate the Services for you.</p>
            <p>You are responsible for ensuring you have the right to share any content you upload, including personal data about household members and caretakers.</p>
          `,
        },
        {
          id: 'ip',
          num: '07',
          title: 'Our intellectual property',
          body: `
            <p>The Services — including the Makaazi name, logo, code, design system, documentation, and all related intellectual property — are owned by Makaazi Technologies Ltd. and protected by Kenyan and international copyright laws.</p>
            <p>You may not copy, modify, distribute, sell, or lease any part of the Services without our written permission.</p>
          `,
        },
        {
          id: 'availability',
          num: '08',
          title: 'Availability and support',
          body: `
            <p>We aim for 99.9% uptime but do not guarantee uninterrupted access. The Services are provided "as is" and "as available". We may modify, suspend, or discontinue any part of the Services at any time with reasonable notice.</p>
            <p>Support is provided via email at <a href="mailto:support@makaazi.co.ke">support@makaazi.co.ke</a>. Response times vary by plan tier.</p>
          `,
        },
        {
          id: 'liability',
          num: '09',
          title: 'Limitation of liability',
          body: `
            <p>To the maximum extent permitted by Kenyan law, Makaazi shall not be liable for:</p>
            <ul>
              <li>Indirect, incidental, special, or consequential damages.</li>
              <li>Loss of profits, revenue, data, or business opportunity.</li>
              <li>Any amount exceeding the subscription fees you paid in the 12 months preceding the claim.</li>
            </ul>
            <p>Nothing in these Terms limits our liability for fraud, death, or personal injury caused by our negligence, or any liability that cannot be limited under Kenyan law.</p>
          `,
        },
        {
          id: 'termination',
          num: '10',
          title: 'Termination',
          body: `
            <p>You may stop using the Services at any time. You can request deletion of your account by emailing <a href="mailto:support@makaazi.co.ke">support@makaazi.co.ke</a>.</p>
            <p>We may terminate or suspend your access immediately if you breach these Terms, if required by law, or if we discontinue the Services. On termination, the sections on intellectual property, liability, and governing law will survive.</p>
          `,
        },
        {
          id: 'law',
          num: '11',
          title: 'Governing law and disputes',
          body: `
            <p>These Terms are governed by the laws of Kenya. Any dispute arising from these Terms shall be resolved in the courts of Nairobi, Kenya.</p>
            <p>Before filing a formal claim, you agree to contact us at <a href="mailto:legal@makaazi.co.ke">legal@makaazi.co.ke</a> and attempt to resolve the matter informally for at least 30 days.</p>
          `,
        },
        {
          id: 'changes',
          num: '12',
          title: 'Changes to these terms',
          body: `
            <p>We may update these Terms from time to time. For material changes, we will notify you by email or in-app banner at least 14 days before the new Terms take effect. Continued use of the Services after the effective date means you accept the revised Terms.</p>
          `,
        },
        {
          id: 'contact',
          num: '13',
          title: 'Contact us',
          body: `
            <p>Makaazi Technologies Ltd.</p>
            <p>Nairobi, Kenya</p>
            <p>Email: <a href="mailto:legal@makaazi.co.ke">legal@makaazi.co.ke</a></p>
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
    goPrivacy() {
      this._push('/privacy');
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