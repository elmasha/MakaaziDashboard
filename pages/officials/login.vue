<template>
  <div class="login-root">
    <!-- Background image + overlay -->
    <div class="login-bg" :style="{ backgroundImage: `url(${loginbg})` }"></div>
    <div class="login-overlay"></div>

    <!-- Top bar -->
    <div class="login-topbar">
      <div class="brand" @click="goTo('/')">
        <div class="brand-avatar">
          <v-icon color="white" size="20">mdi-shield-account</v-icon>
        </div>
        <div class="brand-text">
          <span class="brand-mk">Ma</span><span class="brand-kz">kaazi</span>
          <span class="brand-role">Official</span>
        </div>
      </div>
      <button class="back-btn" @click="goTo('/')">
        <v-icon size="16" class="mr-1">mdi-arrow-left</v-icon>
        Back
      </button>
    </div>

    <!-- Main card -->
    <div class="login-wrap">
      <div class="login-card">
        <!-- Progress bar at the top of the card -->
        <div v-show="progress_bar" class="login-progress">
          <div class="login-progress-bar"></div>
        </div>

        <!-- Left: brand hero (desktop only) -->
        <div class="login-hero hidden-xs-only">
          <div class="hero-badge">
            <v-icon size="18" color="white">mdi-shield-crown-outline</v-icon>
            <span>Official Console</span>
          </div>
          <div class="hero-title">
            Manage your estate<br />with confidence
          </div>
          <div class="hero-sub">
            Approve residents, track payments, log cash, and keep your estate running smoothly.
          </div>
          <div class="hero-features">
            <div class="hero-feature">
              <v-icon size="16" color="#9b6cff">mdi-account-check-outline</v-icon>
              <span>Approve registrations</span>
            </div>
            <div class="hero-feature">
              <v-icon size="16" color="#9b6cff">mdi-cash-multiple</v-icon>
              <span>Track collections</span>
            </div>
            <div class="hero-feature">
              <v-icon size="16" color="#9b6cff">mdi-chart-line</v-icon>
              <span>Monitor monthly trends</span>
            </div>
            <div class="hero-feature">
              <v-icon size="16" color="#9b6cff">mdi-account-supervisor-outline</v-icon>
              <span>Coordinate the team</span>
            </div>
          </div>
        </div>

        <!-- Right: form -->
        <div class="login-form-side">
          <div class="form-logo">
            <v-icon size="30" color="white">mdi-shield-account</v-icon>
          </div>

          <div class="form-title">Official Sign In</div>
          <div class="form-sub">
            Chairman, Secretary, and Treasurer accounts only.
          </div>

          <v-form ref="form" v-model="valid" lazy-validation class="form-body">
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
                I agree to the
                <a class="checkbox-link" @click.prevent="goTo('/terms')">terms and conditions</a>
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
            <v-img :src="google" height="20" contain class="google-img"></v-img>
            <span>Sign in with Google</span>
          </button>

          <div class="alt-links">
            <div class="alt-row">
              <span class="alt-label">Not an official?</span>
              <a class="alt-link alt-link-purple" @click="goTo('/login')">
                Resident sign in
              </a>
            </div>
            <div class="alt-row">
              <span class="alt-label">Need to register your estate?</span>
              <a class="alt-link alt-link-lime" @click="goTo('/estate/register')">
                Get started
              </a>
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
  name: 'OfficialLogin',
  data() {
    return {
      snackbar: false,
      snackbarText: 'No error message',
      snackbar2: false,
      snackbarText2: '',

      loginbg: require('@/assets/login_bg.png'),
      google: require('@/assets/google.png'),
      showPassword: false,
      checkbox: false,
      valid: true,
      progress_bar: false,

      auth: {
        email: '',
        password: '',
      },
    };
  },
  computed: {
    emailRules() {
      return [
        (v) => !!v || 'E-mail is required',
        (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
      ];
    },
    passwordRules() {
      return [
        (v) => !!v || 'Password is required',
        (v) => (v || '').length >= 6 || 'Password must be at least 6 characters',
      ];
    },
  },
  mounted() {
    const current = this.$fire?.auth?.currentUser;
    if (current && current.uid) {
      this.routeBasedOnRole(current.uid);
    }
  },
  methods: {
    // =====================================================
    // EMAIL + PASSWORD LOGIN
    // =====================================================
    async login() {
      const that = this;

      // Inline validation via Vuetify form ref
      if (!that.$refs.form.validate()) {
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
        await that.routeBasedOnRole(user.uid);
      } catch (error) {
        console.error('Login error:', error);
        that.progress_bar = false;
        that.snackbar2 = true;
        that.snackbarText2 = that.friendlyError(error);
      }
    },

    // =====================================================
    // GOOGLE LOGIN
    // =====================================================
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
        console.log('🔵 Signed in with Google:', user.uid);
        await that.routeBasedOnRole(user.uid);
      } catch (error) {
        console.error('Google sign-in error:', error);
        that.progress_bar = false;
        that.snackbar2 = true;
        that.snackbarText2 = error.message || 'Google sign-in failed';
      }
    },

    // =====================================================
    // ROLE RESOLUTION
    // =====================================================
    async routeBasedOnRole(uid) {
      const that = this;
      try {
        console.log('🔵 Resolving official for uid:', uid);

        const { data, status } = await axios.get(
          `${API}/officials/getOfficialById/${uid}`
        );

        if (status === 200 && data?.official_id) {
          const estateId = data.estate_id;
          console.log('🔵 Official found. Estate:', estateId);

          that.snackbar = true;
          that.snackbarText = `Welcome back, ${data.full_name || 'Official'}`;

          setTimeout(() => {
            that.goTo(`/officials/dashboard/${estateId}`);
          }, 600);
          return;
        }
      } catch (err) {
        console.warn('Official lookup failed:', err.response?.data || err.message);
      }

      // Not an official — sign out and show the error
      try {
        await that.$fire.auth.signOut();
      } catch (e) {
        /* ignore */
      }
      that.progress_bar = false;
      that.snackbar2 = true;
      that.snackbarText2 =
        'This account is not registered as an estate official. Please use the resident sign in.';
    },

    // =====================================================
    // HELPERS
    // =====================================================
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
    goTo(path) {
      if (!path) return;
      if (this.$router) {
        this.$router.push(path).catch(() => {});
      } else {
        window.location.href = path;
      }
    },
  },
};
</script>

<style scoped>
/* ============================================================
   ROOT + BACKGROUND
   ============================================================ */
.login-root {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #f6f7fb;
}
.login-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(2px);
  transform: scale(1.05);
}
.login-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(15, 13, 36, 0.55) 0%, rgba(43, 18, 86, 0.5) 100%);
}

/* ============================================================
   TOP BAR
   ============================================================ */
.login-topbar {
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
.login-wrap {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  padding: 24px 20px 60px;
  min-height: calc(100vh - 100px);
  align-items: flex-start;
}
.login-card {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 400px;
  max-width: 900px;
  width: 100%;
  background: #ffffff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 30px 70px -30px rgba(15, 13, 36, 0.6);
}
@media (max-width: 767px) {
  .login-card {
    grid-template-columns: 1fr;
    max-width: 440px;
  }
}

.login-progress {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(128, 81, 255, 0.15);
  overflow: hidden;
  z-index: 5;
}
.login-progress-bar {
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
.login-hero {
  background: linear-gradient(140deg, #0a0a14 0%, #221047 55%, #2b1256 100%);
  padding: 40px 36px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.login-hero::before {
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
.hero-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
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
.login-form-side {
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
}
@media (max-width: 767px) {
  .login-form-side { padding: 32px 22px 28px; }
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
.form-body {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Fields */
.field-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.9px;
}
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
.checkbox-text {
  display: inline;
  line-height: 1.4;
}
.checkbox-link {
  color: #8051ff;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  margin-left: 2px;
}
.checkbox-link:hover { text-decoration: underline; }

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
  margin-top: 4px;
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
.google-img { width: 20px; }

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
}
.alt-label { color: #64748b; font-weight: 600; }
.alt-link {
  font-weight: 800;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.alt-link:hover { opacity: 0.75; text-decoration: underline; }
.alt-link-purple { color: #8051ff; }
.alt-link-lime { color: #7cb300; }

/* ============================================================
   SPIN
   ============================================================ */
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 599px) {
  .login-topbar { padding: 14px 16px; }
  .brand-role { display: none; }
  .brand-avatar { width: 36px; height: 36px; }
  .brand-text { font-size: 0.98rem; }
  .back-btn { padding: 7px 12px; font-size: 0.72rem; }

  .login-wrap { padding: 12px 12px 40px; }
  .login-card { border-radius: 20px; }
  .login-form-side { padding: 26px 18px 22px; }
  .form-logo { width: 48px; height: 48px; margin-bottom: 14px; }
  .form-title { font-size: 1.2rem; }
  .form-sub { font-size: 0.78rem; }
  .form-body { margin-top: 20px; gap: 14px; }
}
</style>