<template>
  <div class="privacy-page">
    <!-- Header -->
    <v-app-bar app flat color="white" height="70" class="privacy-nav">
      <div class="d-flex align-center">
        <v-avatar color="#8051FF" size="40" class="mr-3">
          <v-icon color="white">mdi-home-city</v-icon>
        </v-avatar>

        <span class="text-h6 font-weight-bold">
          <span style="color: #8051FF">Ma</span><span style="color: #7cb300">kaazi</span>
        </span>
      </div>

      <v-spacer />

      <v-btn text color="#8051FF" to="/">
        <v-icon left>mdi-arrow-left</v-icon>
        Back to Home
      </v-btn>
    </v-app-bar>

    <!-- Main content -->
    <v-main>
      <section class="privacy-hero">
        <v-container>
          <div class="text-center">
            <v-avatar color="#ede9fe" size="64" class="mb-4">
              <v-icon color="#8051FF" size="34">
                mdi-shield-lock
              </v-icon>
            </v-avatar>

            <h1 class="text-h4 text-sm-h3 font-weight-black mb-3">
              Privacy Policy
            </h1>

            <p class="subtitle-1 mb-2">
              Your privacy matters to us.
            </p>

            <div class="text-caption grey--text">
              Effective date: 23 November 2026
            </div>
          </div>
        </v-container>
      </section>

      <v-container class="py-10">
        <v-row justify="center">
          <v-col cols="12" md="10" lg="9">
            <v-card outlined rounded="xl" class="pa-5 pa-sm-8">

              <div class="intro-box pa-5 mb-8">
                <h2 class="text-h6 font-weight-bold mb-2">
                  About this policy
                </h2>

                <p class="body-2 mb-0">
                  Makaazi ("we", "our", or "us") respects your privacy
                  and is committed to protecting your personal information.
                  This policy explains how information is collected, used,
                  stored and shared when you use the Makaazi application,
                  website and related services.
                </p>
              </div>

              <section class="policy-section">
                <h2>1. Information We Collect</h2>

                <p>
                  Depending on how you use Makaazi, we may collect the
                  following categories of information:
                </p>

                <h3>A. Personal and account information</h3>
                <ul>
                  <li>Full name</li>
                  <li>Email address and phone number</li>
                  <li>Account login and authentication information</li>
                  <li>User role, such as household member, estate official
                    or estate manager</li>
                </ul>

                <h3>B. Household and estate information</h3>
                <ul>
                  <li>Estate name and identification details</li>
                  <li>Household or unit identification</li>
                  <li>Household registration and membership information</li>
                  <li>Relevant household contact details</li>
                  <li>Estate administration records</li>
                </ul>

                <h3>C. Payment and transaction information</h3>
                <ul>
                  <li>Service charge records</li>
                  <li>Payment amounts and transaction references</li>
                  <li>Payment dates and payment status</li>
                  <li>Outstanding balances and payment history</li>
                </ul>

                <h3>D. Visitor information</h3>
                <p>
                  Where visitor management features are used, information
                  may include visitor names, visit details, entry and exit
                  records, and approval information.
                </p>

                <h3>E. Technical and usage information</h3>
                <ul>
                  <li>Device and application information</li>
                  <li>IP address and diagnostic information</li>
                  <li>Login activity and usage records</li>
                  <li>Error reports and performance information</li>
                  <li>Notification preferences and delivery information</li>
                </ul>
              </section>

              <v-divider class="my-6" />

              <section class="policy-section">
                <h2>2. How We Use Your Information</h2>
                <p>We may use collected information to:</p>
                <ul>
                  <li>Create and manage user accounts.</li>
                  <li>Register households and residential units.</li>
                  <li>Provide estate management services.</li>
                  <li>Manage service charges, invoices and payment records.</li>
                  <li>Process and reconcile payments through supported
                    payment providers.</li>
                  <li>Manage visitor entry and approval records.</li>
                  <li>Send payment alerts and estate announcements.</li>
                  <li>Provide authorised estate officials with management
                    tools and relevant records.</li>
                  <li>Maintain platform security and prevent misuse.</li>
                  <li>Improve our services and respond to support requests.</li>
                  <li>Comply with applicable legal obligations.</li>
                </ul>
              </section>

              <v-divider class="my-6" />

              <section class="policy-section">
                <h2>3. How We Share Information</h2>

                <p>
                  We do not sell your personal information. We may share
                  relevant information in the following circumstances:
                </p>

                <h3>Estate administrators and authorised officials</h3>
                <p>
                  Relevant household, payment and estate records may be
                  accessible to authorised officials for legitimate estate
                  management purposes.
                </p>

                <h3>Payment service providers</h3>
                <p>
                  Relevant transaction information may be shared with
                  payment providers to process and verify payments.
                </p>

                <h3>Technology and hosting providers</h3>
                <p>
                  Service providers may support hosting, authentication,
                  database services, notifications and technical operations.
                </p>

                <h3>Legal requirements</h3>
                <p>
                  We may disclose information where required by law,
                  court order or a lawful request from an authorised
                  authority.
                </p>
              </section>

              <v-divider class="my-6" />

              <section class="policy-section">
                <h2>4. Payment Security</h2>
                <p>
                  Makaazi supports payment-related features, including
                  M-Pesa payment workflows. Payment processing and
                  transaction verification may involve third-party
                  payment services.
                </p>
                <p>
                  We do not ask users to share their M-Pesa PIN with us.
                  Never share your M-Pesa PIN, password or confidential
                  authentication details with another person.
                </p>
              </section>

              <v-divider class="my-6" />

              <section class="policy-section">
                <h2>5. Data Storage and Security</h2>
                <p>
                  We take reasonable technical and organisational measures
                  to protect personal information against unauthorised
                  access, loss, misuse, alteration or disclosure.
                </p>
                <p>
                  These measures may include access controls,
                  authentication, secure communication and restricted
                  access to administrative functions.
                </p>
                <p>
                  However, no electronic storage or internet transmission
                  method can be guaranteed to be completely secure.
                </p>
              </section>

              <v-divider class="my-6" />

              <section class="policy-section">
                <h2>6. Data Retention</h2>
                <p>
                  We retain personal information for as long as reasonably
                  necessary to provide Makaazi services, maintain account
                  and estate records, resolve disputes, meet legal
                  obligations and protect the platform.
                </p>
                <p>
                  When information is no longer required, we will take
                  reasonable steps to delete it, anonymise it or securely
                  dispose of it, subject to applicable legal requirements.
                </p>
              </section>

              <v-divider class="my-6" />

              <section class="policy-section">
                <h2>7. Your Privacy Rights</h2>
                <p>
                  Subject to applicable law, you may have the right to:
                </p>
                <ul>
                  <li>Request access to your personal information.</li>
                  <li>Request correction of inaccurate information.</li>
                  <li>Request deletion where legally applicable.</li>
                  <li>Object to or request restriction of certain processing.</li>
                  <li>Raise concerns about how your information is handled.</li>
                  <li>Withdraw consent where processing is based on consent.</li>
                </ul>
                <p>
                  To exercise these rights, contact us using the details
                  provided below.
                </p>
              </section>

              <v-divider class="my-6" />

              <section class="policy-section">
                <h2>8. Account Deletion</h2>
                <p>
                  If you wish to delete your Makaazi account, contact us
                  using the email address below or use an available account
                  deletion option within the application.
                </p>
                <p>
                  We will review eligible deletion requests in accordance
                  with applicable law. Certain financial, transaction or
                  estate records may need to be retained where legally
                  required or necessary for legitimate record-keeping.
                </p>
              </section>

              <v-divider class="my-6" />

              <section class="policy-section">
                <h2>9. Children's Privacy</h2>
                <p>
                  Makaazi is designed for estate and household management
                  and is not intended to collect personal information
                  directly from children without appropriate authorisation.
                </p>
                <p>
                  If you believe a child has provided personal information
                  inappropriately, please contact us.
                </p>
              </section>

              <v-divider class="my-6" />

              <section class="policy-section">
                <h2>10. Third-Party Services</h2>
                <p>
                  Makaazi may rely on third-party services for hosting,
                  authentication, payment processing, notifications and
                  other technical functions. These providers may process
                  information as necessary to provide their services and
                  are subject to their own privacy policies and applicable
                  obligations.
                </p>
              </section>

              <v-divider class="my-6" />

              <section class="policy-section">
                <h2>11. Changes to This Privacy Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time to
                  reflect changes in our services, technology, legal
                  requirements or privacy practices.
                </p>
                <p>
                  When changes are made, we will update the effective date
                  at the top of this page. Significant changes may also be
                  communicated through the application or website.
                </p>
              </section>

              <v-divider class="my-6" />

              <section class="policy-section">
                <h2>12. Contact Us</h2>
                <p>
                  If you have questions, requests or concerns about this
                  Privacy Policy or the handling of your personal
                  information, contact us:
                </p>

                <v-card flat color="#f5f1ff" class="pa-4 rounded-lg">
                  <div class="font-weight-bold text-h6">
                    Makaazi Support
                  </div>

                  <div class="mt-3">
                    <v-icon small color="#8051FF" class="mr-2">
                      mdi-email-outline
                    </v-icon>
                    <a href="mailto:support@makaazi.co.ke">
                      support@makaazi.co.ke
                    </a>
                  </div>

                  <div class="mt-2">
                    <v-icon small color="#8051FF" class="mr-2">
                      mdi-web
                    </v-icon>
                    Makaazi – Live Better. Manage Smarter.
                  </div>
                </v-card>
              </section>

              <div class="text-center mt-10">
                <v-chip color="#ede9fe" text-color="#8051FF">
                  Makaazi – Live Better. Manage Smarter.
                </v-chip>
              </div>

            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Footer -->
    <v-footer color="grey darken-4" dark class="py-5">
      <v-container class="text-center">
        <div class="text-caption grey--text text--lighten-1">
          © {{ new Date().getFullYear() }} Makaazi.
          All rights reserved.
        </div>
      </v-container>
    </v-footer>
  </div>
</template>

<script>
export default {
  name: 'PrivacyPolicy',

  metaInfo: {
    title: 'Privacy Policy | Makaazi',
    meta: [
      {
        name: 'description',
        content:
          'Read the Makaazi Privacy Policy to understand how personal information is collected, used and protected.'
      }
    ]
  }
};
</script>

<style scoped>
.privacy-page {
  min-height: 100vh;
  background: #faf9ff;
  color: #263238;
}

.privacy-nav {
  border-bottom: 1px solid #eeeaf7;
}

.privacy-hero {
  padding: 65px 0 45px;
  background: linear-gradient(
    135deg,
    #f5f0ff 0%,
    #ffffff 55%,
    #f3ffe5 100%
  );
}

.privacy-section {
  margin-bottom: 8px;
}

.policy-section h2 {
  color: #5b21b6;
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 16px;
}

.policy-section h3 {
  color: #303047;
  font-size: 1rem;
  font-weight: 700;
  margin-top: 20px;
  margin-bottom: 8px;
}

.policy-section p,
.policy-section li {
  color: #596273;
  font-size: 0.95rem;
  line-height: 1.8;
}

.policy-section ul {
  padding-left: 24px;
  margin-bottom: 16px;
}

.policy-section li {
  margin-bottom: 5px;
}

.intro-box {
  background: #f5f1ff;
  border-left: 4px solid #8051FF;
  border-radius: 8px;
}

.intro-box p {
  color: #596273;
  line-height: 1.8;
}

a {
  color: #8051FF !important;
  text-decoration: none;
  font-weight: 600;
}

a:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .privacy-hero {
    padding: 45px 0 30px;
  }

  .policy-section h2 {
    font-size: 1.08rem;
  }

  .policy-section p,
  .policy-section li {
    font-size: 0.9rem;
  }
}
</style>
