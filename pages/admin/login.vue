<template>
  <div class="admin-login-root">
    <!-- ============================================================
         ANIMATED BACKGROUND
         ============================================================ -->
    <div class="bg-layer bg-grid"></div>
    <div class="bg-layer bg-gradient"></div>
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>

    <!-- ============================================================
         TOP BAR
         ============================================================ -->
    <div class="top-bar">
      <div class="brand">
        <div class="brand-mark">
          <v-icon color="#0A0A14" size="18">mdi-shield-crown</v-icon>
        </div>
        <div class="brand-text">
          <div class="brand-name">Makaazi</div>
          <div class="brand-sub">INTEC Admin</div>
        </div>
      </div>

      <div class="top-meta">
        <div class="live-dot"></div>
        <span>All systems operational</span>
      </div>
    </div>

    <!-- ============================================================
         MAIN LAYOUT
         ============================================================ -->
    <div class="login-shell">
      <!-- LEFT — Hero + stats -->
      <div class="hero-panel">
        <div class="hero-content">
          <div class="hero-badge">
            <v-icon size="12" color="#B6FF00">mdi-lock-outline</v-icon>
            <span>Restricted access</span>
          </div>

          <h1 class="hero-title">
            The command center<br />
            for <span class="hero-accent">every estate</span>.
          </h1>

          <p class="hero-subtitle">
            Onboard estates, track subscriptions, monitor revenue, and support
            the entire Makaazi network — from one secure console.
          </p>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Estates</div>
              <div class="stat-value">{{ formatNum(stats.total_estates) }}</div>
              <div class="stat-trend stat-trend-up">
                <v-icon size="10">mdi-arrow-up</v-icon>
                {{ stats.active_estates }} active
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-label">Households</div>
              <div class="stat-value">{{ formatNum(stats.total_households) }}</div>
              <div class="stat-trend">
                {{ stats.pending_households }} pending
              </div>
            </div>

            <div class="stat-card stat-card-highlight">
              <div class="stat-label">Collected YTD</div>
              <div class="stat-value">
                <span class="currency">KES</span>
                {{ formatNum(stats.collected_this_year) }}
              </div>
              <div class="stat-trend stat-trend-up">
                <v-icon size="10">mdi-arrow-up</v-icon>
                Live
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-label">Officials</div>
              <div class="stat-value">{{ formatNum(stats.total_officials) }}</div>
              <div class="stat-trend">
                Across all estates
              </div>
            </div>
          </div>

          <div class="trust-row">
            <div class="trust-badge">
              <v-icon size="14" color="#B6FF00">mdi-shield-check</v-icon>
              <span>End-to-end encrypted</span>
            </div>
            <div class="trust-badge">
              <v-icon size="14" color="#B6FF00">mdi-history</v-icon>
              <span>Full audit trail</span>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT — Login card -->
      <div class="form-panel">
        <div class="form-card">
          <div class="card-header">
            <div class="card-icon">
              <v-icon size="22" color="#B6FF00">mdi-shield-crown</v-icon>
            </div>
            <div class="card-header-text">
              <div class="card-title">Admin sign in</div>
              <div class="card-sub">Authorized personnel only</div>
            </div>
          </div>

          <transition name="slide-down">
            <div v-if="errorMessage" class="error-box">
              <v-icon size="16" color="#FF6B6B">mdi-alert-circle-outline</v-icon>
              <span>{{ errorMessage }}</span>
            </div>
          </transition>

          <v-form ref="form" v-model="valid" @submit.prevent="submit">
            <!-- Email -->
            <div class="field-group">
              <div class="field-header">
                <span class="step-number">01</span>
                <label class="field-label">Admin email</label>
              </div>
              <v-text-field
                v-model="email"
                :rules="emailRules"
                placeholder="admin@intec.co.ke"
                dense
                outlined
                rounded
                hide-details="auto"
                prepend-inner-icon="mdi-email-outline"
                autocomplete="username"
                class="admin-field"
              ></v-text-field>
            </div>

            <!-- Password -->
            <div class="field-group">
              <div class="field-header">
                <span class="step-number">02</span>
                <label class="field-label">Password</label>
              </div>
              <v-text-field
                v-model="password"
                :rules="passwordRules"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                dense
                outlined
                rounded
                hide-details="auto"
                prepend-inner-icon="mdi-lock-outline"
                :append-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                autocomplete="current-password"
                class="admin-field"
                @click:append="showPassword = !showPassword"
              ></v-text-field>
              <div class="field-hint">
                <v-icon size="12" color="#94a3b8">mdi-information-outline</v-icon>
                Use your INTEC admin credentials
              </div>
            </div>

            <v-btn
              type="submit"
              block
              rounded
              large
              depressed
              class="submit-btn"
              :loading="loading"
              :disabled="loading"
            >
              <template v-if="!loading">
                <v-icon left size="18" color="#0A0A14">mdi-login-variant</v-icon>
                <span class="submit-text">Access Admin Console</span>
                <v-icon right size="16" color="#0A0A14">mdi-arrow-right</v-icon>
              </template>
            </v-btn>
          </v-form>

          <div class="card-footer">
            <div class="footer-left">
              <span>Not an admin?</span>
              <a class="link" @click="$router.push('/login')">
                Resident login
                <v-icon size="12">mdi-arrow-right</v-icon>
              </a>
            </div>
          </div>
        </div>

        <div class="security-note">
          <v-icon size="12" color="#64748b">mdi-shield-lock-outline</v-icon>
          <span>This session is logged. All actions are audited.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import numeral from 'numeral';

const API = 'https://makaaziserver22.up.railway.app/api';

export default {
  name: 'AdminLogin',
  layout: 'admin-blank',

  data() {
    return {
      valid: true,
      loading: false,
      errorMessage: '',

      email: '',
      password: '',
      showPassword: false,

      stats: {
        total_estates: 0,
        active_estates: 0,
        total_households: 0,
        pending_households: 0,
        total_officials: 0,
        collected_this_year: 0,
      },

      emailRules: [
        (v) => !!v || 'Email is required',
        (v) => /.+@.+\..+/.test(v) || 'Enter a valid email',
      ],
      passwordRules: [
        (v) => !!v || 'Password is required',
        (v) => (v && v.length >= 6) || 'Minimum 6 characters',
      ],
    };
  },

  mounted() {
    this.checkExistingSession();
    this.fetchPublicStats();
  },

  methods: {
    formatNum(n) {
      return numeral(n || 0).format('0,0');
    },

    async checkExistingSession() {
      try {
        // 1. Firebase user?
        const user = this.$fire?.auth?.currentUser;
        if (!user) return;

        // 2. Both admin markers present?
        const email = localStorage.getItem('admin_email');
        const token = localStorage.getItem('admin_token');
        if (!email || !token) {
          // Firebase signed in, but not marked as admin — stay on login page
          return;
        }

        // 3. Both markers present — safe to go to dashboard
        console.log('✅ Existing admin session detected — redirecting');
        this.$router.replace('/admin');
      } catch (e) {
        console.warn('Session check failed:', e.message);
      }
    },

    async fetchPublicStats() {
      try {
        const { data, status } = await axios.get(`${API}/admin/public-stats`);
        if (status === 200 && data) {
          Object.assign(this.stats, data);
        }
      } catch (err) {
        if (err.response?.status !== 403 && err.response?.status !== 404) {
          console.warn('Public stats unavailable:', err.message);
        }
      }
    },

    async submit() {
      this.errorMessage = '';
      if (this.$refs.form && !this.$refs.form.validate()) return;

      this.loading = true;
      try {
        // 1. Sign in with Firebase Auth
        const cred = await this.$fire.auth.signInWithEmailAndPassword(
          this.email.trim().toLowerCase(),
          this.password
        );
        console.log('✅ Firebase login OK:', cred.user.email);

        // 2. Get the ID token
        const idToken = await cred.user.getIdToken(true);

        // 3. Send to backend for admin verification
        const { data } = await axios.post(`${API}/admin/login`, {
          id_token: idToken,
        });
        console.log('✅ Backend verified admin:', data.admin);

        // 4. Store ALL session markers
        try {
          localStorage.setItem('admin_email', data.admin?.email || this.email);
          localStorage.setItem('admin_role', data.admin?.role || 'support');
          localStorage.setItem('admin_name', data.admin?.full_name || '');
          localStorage.setItem('admin_uid', data.admin?.uid || '');
          localStorage.setItem('admin_token', 'session-active');
          console.log('✅ Markers stored:', {
            email: localStorage.getItem('admin_email'),
            token: localStorage.getItem('admin_token'),
          });
        } catch (e) {
          console.warn('Storage failed:', e.message);
        }

        // 5. Small delay so localStorage writes settle
        await new Promise((r) => setTimeout(r, 50));

        // 6. Navigate to dashboard
        console.log('🚀 Navigating to /admin');
        this.$router.replace('/admin');
      } catch (err) {
        console.log('❌ Submit error:', err.code, err.message);

        const code = err.code || '';
        const status = err.response?.status;
        let msg = err.response?.data?.error;

        if (code === 'auth/wrong-password') msg = 'Incorrect password';
        else if (code === 'auth/user-not-found') msg = 'No account with that email';
        else if (code === 'auth/invalid-email') msg = 'Invalid email format';
        else if (code === 'auth/too-many-requests') msg = 'Too many attempts. Try again later.';
        else if (code === 'auth/network-request-failed') msg = 'Network error. Check your connection.';
        else if (status === 403) msg = err.response?.data?.error || 'This account is not an admin';
        else if (status === 401) msg = 'Session expired. Please try again.';

        this.errorMessage = msg || 'Login failed. Please try again.';
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
/* ============================================================
   ROOT
   ============================================================ */
.admin-login-root {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  background: #06060e;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
}

/* ============================================================
   BACKGROUND
   ============================================================ */
.bg-layer { position: absolute; inset: 0; pointer-events: none; }

.bg-grid {
  background-image:
    linear-gradient(rgba(182, 255, 0, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(128, 81, 255, 0.05) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
  opacity: 0.7;
  z-index: 1;
}

.bg-gradient {
  background:
    radial-gradient(ellipse 900px 600px at 20% 30%, rgba(182, 255, 0, 0.10), transparent 60%),
    radial-gradient(ellipse 800px 500px at 80% 70%, rgba(128, 81, 255, 0.14), transparent 60%),
    linear-gradient(180deg, #06060e 0%, #0d0a1f 100%);
  z-index: 0;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 2;
  animation: drift 20s ease-in-out infinite;
}

.orb-1 { width: 420px; height: 420px; background: rgba(182, 255, 0, 0.18); top: -120px; left: -80px; }
.orb-2 { width: 340px; height: 340px; background: rgba(128, 81, 255, 0.35); bottom: -80px; right: -60px; animation-delay: -7s; }
.orb-3 { width: 260px; height: 260px; background: rgba(182, 255, 0, 0.12); top: 40%; left: 45%; animation-delay: -14s; }

@keyframes drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

/* ============================================================
   TOP BAR
   ============================================================ */
.top-bar {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.brand { display: flex; align-items: center; gap: 12px; }

.brand-mark {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #B6FF00, #8BC34A);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 22px -4px rgba(182, 255, 0, 0.55);
  position: relative;
}

.brand-mark::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(255,255,255,0.35), transparent 60%);
}

.brand-name { font-size: 0.95rem; font-weight: 800; color: white; letter-spacing: -0.3px; line-height: 1.1; }
.brand-sub { font-size: 0.6rem; color: rgba(255, 255, 255, 0.45); font-weight: 700; letter-spacing: 0.9px; margin-top: 2px; text-transform: uppercase; }

.top-meta { display: flex; align-items: center; gap: 8px; font-size: 0.72rem; color: rgba(255, 255, 255, 0.5); font-weight: 600; }

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #B6FF00;
  box-shadow: 0 0 0 3px rgba(182, 255, 0, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(182, 255, 0, 0.2); }
  50% { box-shadow: 0 0 0 6px rgba(182, 255, 0, 0); }
}

/* ============================================================
   LOGIN SHELL
   ============================================================ */
.login-shell {
  position: relative;
  z-index: 5;
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  min-height: calc(100vh - 78px);
}

/* ============================================================
   HERO PANEL
   ============================================================ */
.hero-panel { display: flex; align-items: center; justify-content: center; padding: 60px 64px; }
.hero-content { max-width: 580px; width: 100%; }

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(182, 255, 0, 0.08);
  border: 1px solid rgba(182, 255, 0, 0.25);
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #B6FF00;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-bottom: 28px;
}

.hero-title {
  font-size: 3.2rem;
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -2px;
  color: white;
  margin: 0 0 24px;
}

.hero-accent {
  background: linear-gradient(135deg, #B6FF00 0%, #8051FF 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 1.02rem;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 44px;
  max-width: 500px;
}

/* STATS */
.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 40px; }

.stat-card {
  position: relative;
  padding: 18px 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: all 0.3s ease;
}

.stat-card:hover { border-color: rgba(182, 255, 0, 0.4); transform: translateY(-2px); }
.stat-card-highlight {
  background: linear-gradient(135deg, rgba(182, 255, 0, 0.10), rgba(128, 81, 255, 0.10));
  border-color: rgba(182, 255, 0, 0.25);
}

.stat-label { font-size: 0.68rem; font-weight: 700; color: rgba(255, 255, 255, 0.45); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
.stat-value { font-size: 1.65rem; font-weight: 800; color: white; letter-spacing: -1px; line-height: 1.1; font-variant-numeric: tabular-nums; }
.currency { font-size: 0.85rem; font-weight: 700; color: #B6FF00; margin-right: 4px; letter-spacing: 0; }

.stat-trend { display: inline-flex; align-items: center; gap: 3px; margin-top: 8px; font-size: 0.7rem; color: rgba(255, 255, 255, 0.45); font-weight: 600; }
.stat-trend-up { color: #B6FF00; }

.trust-row { display: flex; flex-wrap: wrap; gap: 20px; }
.trust-badge { display: inline-flex; align-items: center; gap: 8px; font-size: 0.78rem; color: rgba(255, 255, 255, 0.5); font-weight: 600; }

/* ============================================================
   FORM PANEL
   ============================================================ */
.form-panel { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 48px; }

.form-card {
  width: 100%;
  max-width: 440px;
  background: rgba(15, 13, 36, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 36px 32px 28px;
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.3),
    0 30px 60px -20px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.03) inset;
  position: relative;
  overflow: hidden;
}

.form-card::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(182, 255, 0, 0.6), rgba(128, 81, 255, 0.6), transparent);
}

.card-header { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }

.card-icon {
  width: 48px; height: 48px; border-radius: 14px;
  background: rgba(182, 255, 0, 0.08);
  border: 1px solid rgba(182, 255, 0, 0.25);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 14px -6px rgba(182, 255, 0, 0.4);
}

.card-title { font-size: 1.15rem; font-weight: 800; color: white; letter-spacing: -0.4px; line-height: 1.2; }
.card-sub { font-size: 0.75rem; color: rgba(255, 255, 255, 0.45); margin-top: 3px; font-weight: 500; }

.error-box {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px;
  background: rgba(255, 107, 107, 0.08);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 12px;
  font-size: 0.82rem;
  color: #FF6B6B;
  font-weight: 600;
  margin-bottom: 20px;
}

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.25s ease; }
.slide-down-enter, .slide-down-leave-to { opacity: 0; transform: translateY(-6px); }

.field-group { margin-bottom: 20px; }
.field-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }

.step-number { font-size: 0.65rem; font-weight: 800; color: #B6FF00; letter-spacing: 0.5px; opacity: 0.9; }

.field-label { font-size: 0.72rem; font-weight: 700; color: rgba(255, 255, 255, 0.75); letter-spacing: 0.5px; text-transform: uppercase; }

.field-hint { display: flex; align-items: center; gap: 6px; margin-top: 8px; font-size: 0.72rem; color: rgba(255, 255, 255, 0.35); font-weight: 500; }

/* ============================================================
   TEXT FIELDS — dark theme
   ============================================================ */
.admin-field ::v-deep .v-input__slot,
.admin-field ::v-deep .v-text-field__slot { color: white !important; }

.admin-field ::v-deep input {
  color: white !important;
  caret-color: #B6FF00 !important;
  font-weight: 500;
}

.admin-field ::v-deep input::placeholder { color: rgba(255, 255, 255, 0.3) !important; }

.admin-field ::v-deep .v-input__icon .v-icon { color: rgba(255, 255, 255, 0.4) !important; }

.admin-field ::v-deep .theme--light.v-text-field--outlined fieldset {
  border-color: rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
}

.admin-field ::v-deep .v-text-field--outlined:not(.v-input--is-focused):hover fieldset {
  border-color: rgba(182, 255, 0, 0.5) !important;
}

.admin-field ::v-deep .v-text-field--outlined.v-input--is-focused fieldset {
  border-color: #B6FF00 !important;
  border-width: 2px !important;
}

/* ============================================================
   ERROR STATE — bright red on dark background
   ============================================================ */
.admin-field ::v-deep .v-messages__message {
  color: #FF6B6B !important;
  font-weight: 600;
  font-size: 0.75rem;
  letter-spacing: 0.2px;
  margin-top: 4px;
}

.admin-field ::v-deep .v-input__icon--append .v-icon.error--text,
.admin-field ::v-deep .v-icon.error--text {
  color: #FF6B6B !important;
}

.admin-field ::v-deep .theme--light.v-text-field--outlined.error--text fieldset {
  border-color: #FF6B6B !important;
  border-width: 2px !important;
}

.admin-field ::v-deep .v-label.error--text {
  color: #FF6B6B !important;
}

.admin-field ::v-deep .v-input.error--text input {
  color: #FF6B6B !important;
  caret-color: #FF6B6B !important;
}

.admin-field ::v-deep .theme--light.v-text-field--outlined.v-input--is-focused.error--text fieldset {
  border-color: #FF6B6B !important;
}

/* ============================================================
   SUBMIT
   ============================================================ */
.submit-btn {
  height: 50px !important;
  font-size: 0.92rem !important;
  font-weight: 800 !important;
  letter-spacing: 0.2px;
  margin-top: 8px;
  background: linear-gradient(135deg, #B6FF00, #8BC34A) !important;
  color: #0A0A14 !important;
  box-shadow: 0 10px 30px -8px rgba(182, 255, 0, 0.55) !important;
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1) !important;
  text-transform: none !important;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow:
    0 14px 40px -8px rgba(182, 255, 0, 0.75),
    0 0 0 1px rgba(182, 255, 0, 0.3) !important;
}

.submit-btn :deep(.v-btn__content) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 6px;
}

.submit-btn :deep(.v-btn__loading) { color: #0A0A14 !important; }

.submit-text { font-weight: 800; color: #0A0A14; }

/* ============================================================
   FOOTER
   ============================================================ */
.card-footer { margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.06); }

.footer-left { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: rgba(255, 255, 255, 0.45); justify-content: center; }

.link {
  color: #B6FF00;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s ease;
}

.link:hover { color: #8051FF; text-decoration: underline; }

.security-note {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 500;
  max-width: 440px;
  text-align: center;
  line-height: 1.5;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 1023px) {
  .login-shell { grid-template-columns: 1fr; }
  .hero-panel { padding: 40px 32px; display: none; }
  .form-panel { padding: 40px 24px; }
  .top-bar { padding: 16px 20px; }
  .top-meta { display: none; }
}

@media (max-width: 599px) {
  .hero-title { font-size: 2rem; letter-spacing: -1px; }
  .form-card { padding: 28px 22px 22px; border-radius: 20px; }
  .card-title { font-size: 1.05rem; }
  .hero-panel { padding: 32px 20px; }
  .stats-grid { grid-template-columns: 1fr; gap: 10px; }
  .stat-value { font-size: 1.4rem; }
}
</style>