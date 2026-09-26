<template>
  <div class="auth-root">
    <!-- ============================================================
         LEFT PANEL (illustrated) — hidden on mobile
         ============================================================ -->
    <div class="auth-left d-none d-md-flex">
      <div class="left-content">
        <!-- Brand -->
        <div class="brand">
          <div class="brand-mark">
            <v-icon color="white" size="22">mdi-shield-account</v-icon>
          </div>
          <span class="brand-name">Makaazi</span>
        </div>

        <!-- Hero copy -->
        <h1 class="left-title">
          Estate living,<br />
          <span class="left-accent">reimagined.</span>
        </h1>
        <p class="left-subtitle">
          One platform for residents, officials, and estate managers.
          Pay in seconds. Track every shilling.
        </p>

        <!-- Floating preview cards -->
        <div class="preview-stack">
          <div class="preview-card preview-1">
            <div class="preview-icon green">
              <v-icon color="white" size="16">mdi-check</v-icon>
            </div>
            <div class="preview-body">
              <div class="preview-title">Payment received</div>
              <div class="preview-sub">KES 4,000 · Security</div>
            </div>
            <div class="preview-time">now</div>
          </div>

          <div class="preview-card preview-2">
            <div class="preview-icon purple">
              <v-icon color="white" size="16">mdi-chart-line</v-icon>
            </div>
            <div class="preview-body">
              <div class="preview-title">Monthly collections</div>
              <div class="preview-sub">Up 12% this month</div>
            </div>
            <div class="preview-bar">
              <span style="height: 40%"></span>
              <span style="height: 65%"></span>
              <span style="height: 45%"></span>
              <span style="height: 80%"></span>
              <span style="height: 60%"></span>
              <span style="height: 95%"></span>
            </div>
          </div>

          <div class="preview-card preview-3">
            <div class="preview-icon amber">
              <v-icon color="white" size="16">mdi-home-city</v-icon>
            </div>
            <div class="preview-body">
              <div class="preview-title">12 estates onboard</div>
              <div class="preview-sub">500+ households</div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="left-footer">
          <div class="footer-dots">
            <span class="dot dot-active"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
          <span class="footer-text">Trusted by estate managers across Kenya</span>
        </div>
      </div>

      <!-- Decorative blobs -->
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <!-- ============================================================
         RIGHT PANEL (form)
         ============================================================ -->
    <div class="auth-right">
      <div class="form-wrap">
        <!-- Mobile brand -->
        <div class="mobile-brand d-flex d-md-none">
          <div class="brand-mark-sm">
            <v-icon color="white" size="16">mdi-shield-account</v-icon>
          </div>
          <span class="brand-name-sm">Makaazi</span>
        </div>

        <!-- Heading -->
        <div class="form-head">
          <h2 class="form-title">Welcome back</h2>
          <p class="form-sub">Sign in to continue to your estate dashboard.</p>
        </div>

        <!-- Step indicator -->
        <div class="steps">
          <div class="step" :class="{ 'step-done': estate_id, 'step-active': !estate_id }">
            <span class="step-num">
              <v-icon v-if="estate_id" size="12" color="white">mdi-check</v-icon>
              <template v-else>1</template>
            </span>
            <span class="step-label">Estate</span>
          </div>
          <div class="step-line" :class="{ 'step-line-done': estate_id }"></div>
          <div class="step" :class="{ 'step-active': estate_id }">
            <span class="step-num">2</span>
            <span class="step-label">Credentials</span>
          </div>
        </div>

        <!-- Load error -->
        <div v-if="estateLoadError" class="inline-error">
          <v-icon size="14" color="#c62828">mdi-alert-circle-outline</v-icon>
          <span>{{ estateLoadError }}</span>
          <a class="retry-link" @click="Fetch_PostAllEstates">Retry</a>
        </div>

        <!-- Form -->
        <v-form ref="form" v-model="valid" lazy-validation class="form-body">
          <!-- Estate -->
          <div class="field-block">
            <label class="field-label">Your estate</label>
            <v-autocomplete
              v-model="select"
              :loading="loading"
              :items="items"
              :search-input.sync="search"
              dense
              outlined
              rounded
              hide-details
              placeholder="Search for your estate"
              prepend-inner-icon="mdi-home-city-outline"
              :no-data-text="estateLoadError ? 'Unavailable' : 'No matches'"
              @change="onEstateSelected"
            ></v-autocomplete>
          </div>

          <!-- Estate confirmation strip -->
          <transition name="slide-fade">
            <div v-if="estate_id" class="estate-confirm">
              <div class="estate-pill">
                <v-icon size="14" color="#4caf50">mdi-check-circle</v-icon>
                <span>{{ estate_name }}</span>
              </div>
              <span class="estate-loc" v-if="estate_location">{{ estate_location }}</span>
            </div>
          </transition>

          <!-- Email -->
          <div class="field-block">
            <label class="field-label">Email</label>
            <v-text-field
              v-model="auth.email"
              :rules="emailRules"
              placeholder="you@example.com"
              dense
              outlined
              rounded
              hide-details="auto"
              prepend-inner-icon="mdi-email-outline"
              required
            ></v-text-field>
          </div>

          <!-- Password -->
          <div class="field-block">
            <div class="field-label-row">
              <label class="field-label">Password</label>
              <a class="forgot-link">Forgot?</a>
            </div>
            <v-text-field
              v-model="auth.password"
              :rules="passwordRules"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              dense
              outlined
              rounded
              hide-details="auto"
              prepend-inner-icon="mdi-lock-outline"
              :append-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              @click:append="showPassword = !showPassword"
            ></v-text-field>
          </div>

          <!-- Terms -->
          <v-checkbox
            v-model="checkbox"
            :rules="[(v) => !!v || 'You must accept the terms.']"
            dense
            hide-details
            class="terms-box"
          >
            <template v-slot:label>
              <span class="terms-text">
                I agree to the <a class="terms-link">Terms</a> &amp;
                <a class="terms-link">Privacy Policy</a>
              </span>
            </template>
          </v-checkbox>

          <!-- Submit -->
          <v-btn
            block
            rounded
            large
            depressed
            color="#7c3aed"
            dark
            class="submit-btn text-capitalize"
            :loading="progress_bar"
            @click="login"
          >
            Sign in
            <v-icon right small>mdi-arrow-right</v-icon>
          </v-btn>
        </v-form>

        <!-- Divider -->
        <div class="divider">
          <span class="divider-line"></span>
          <span class="divider-text">or</span>
          <span class="divider-line"></span>
        </div>

        <!-- Google -->
        <v-btn block outlined rounded large class="google-btn" @click="signUpGoogle">
          <v-img contain :src="google" height="18" width="18" max-width="18" class="mr-2" />
          <span class="google-text">Continue with Google</span>
        </v-btn>

        <!-- Footer -->
        <div class="form-footer">
          <span>Don't have an account?</span>
          <a class="create-link">Create one</a>
        </div>
      </div>
    </div>

    <!-- Snackbars -->
    <v-snackbar v-model="snackbar" color="success" :timeout="4000" top rounded="pill" elevation="6">
      <div class="d-flex align-center">
        <v-icon color="white" small class="mr-2">mdi-check-circle</v-icon>
        <span class="font-weight-medium">{{ snackbarText }}</span>
      </div>
    </v-snackbar>

    <v-snackbar v-model="snackbar2" color="error" :timeout="4000" top rounded="pill" elevation="6">
      <div class="d-flex align-center">
        <v-icon color="white" small class="mr-2">mdi-alert-circle</v-icon>
        <span class="font-weight-medium">{{ snackbarText2 }}</span>
      </div>
    </v-snackbar>
  </div>
</template>

<script>
import axios from "axios";

const API = "https://makaaziserver22.up.railway.app/api";

export default {
  name: "EstateLogin",
  data() {
    return {
      checkbox: false,
      valid: true,
      showPassword: false,
      auth: { email: "", password: "" },
      emailRules: [
        (v) => !!v || "Email is required",
        (v) => /.+@.+\..+/.test(v) || "Email must be valid",
      ],
      passwordRules: [
        (v) => !!v || "Password is required",
        (v) => (v && v.length >= 6) || "Min 6 characters",
      ],

      estates: [],
      items: [],
      search: null,
      select: null,
      loading: false,
      estateLoadError: "",

      estate_id: null,
      estate_name: "",
      estate_urn: "",
      estate_location: "",
      estate_image: "",
      logo_url: "",

      progress_bar: false,
      snackbar: false,
      snackbarText: "",
      snackbar2: false,
      snackbarText2: "",

      google: null,
    };
  },
  mounted() {
    this.google = require("@/assets/google.png");
    this.Fetch_PostAllEstates();
  },
  watch: {
    search(val) {
      if (val && val !== this.select) this.querySelections(val);
    },
  },
  methods: {
    // =========================================================
    // ESTATE LOOKUP — uses the working /getall endpoint
    // =========================================================
    async Fetch_PostAllEstates() {
      this.estateLoadError = "";
      try {
        // THIS IS THE WORKING URL (verified in browser)
        const { data, status } = await axios.get(`${API}/estates/getall`);
        console.log("🔍 Estates response:", status);

        // Your backend returns an array directly
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.estates)
          ? data.estates
          : [];

        if (!list.length) {
          this.estateLoadError = "No estates are available yet.";
          this.items = [];
          return;
        }

        this.estates = list;
        this.items = list.map((e) => e.estate_name).filter(Boolean);
        console.log("✅ Estates loaded:", this.items.length, this.items);
      } catch (error) {
        const status = error.response?.status;
        console.error(
          "❌ Estates fetch:",
          status,
          error.response?.data || error.message
        );
        this.estateLoadError =
          status === 404
            ? "Estate service not found."
            : status === 500
            ? "Server error. Please try again."
            : "Could not load estates.";
      }
    },

    querySelections(v) {
      this.loading = true;
      setTimeout(() => {
        this.items = this.estates
          .map((e) => e.estate_name)
          .filter((e) =>
            (e || "").toLowerCase().includes((v || "").toLowerCase())
          );
        this.loading = false;
      }, 250);
    },

    async onEstateSelected(val) {
      if (!val) return;
      this.estate_id = null;
      this.estate_urn = "";
      this.estate_location = "";
      this.estate_image = "";
      this.logo_url = "";

      try {
        let res;
        try {
          res = await axios.get(
            `${API}/estates/estateName/${encodeURIComponent(val)}`
          );
        } catch {
          res = await axios.get(
            `${API}/estates/name/${encodeURIComponent(val)}`
          );
        }
        const d = res.data;
        if (d) {
          this.estate_id = d.estate_id;
          this.estate_name = d.estate_name;
          this.estate_urn = d.estate_urn;
          this.estate_location = d.estate_location;
          this.estate_image = d.estate_image;
          this.logo_url = d.logo_url;
        }
      } catch (error) {
        console.error("❌ Estate lookup:", error.response?.status, error.message);
        this.showError("Could not find that estate.");
      }
    },

    // =========================================================
    // AUTH
    // =========================================================
    async login() {
      if (this.$refs.form && !this.$refs.form.validate()) return;
      if (!this.estate_id) return this.showError("Please select your estate.");

      this.progress_bar = true;
      try {
        await this.$fire.auth.signInWithEmailAndPassword(
          this.auth.email,
          this.auth.password
        );
        this.$router.push(`/estate/${this.estate_id}`);
      } catch (error) {
        console.error("❌ Login failed:", error.code || error.message);
        this.showError(this.humanizeAuthError(error));
      } finally {
        this.progress_bar = false;
      }
    },

    async signUpGoogle() {
      if (!this.estate_id) return this.showError("Please select your estate first.");
      if (!this.checkbox) return this.showError("You must agree to the terms.");

      this.progress_bar = true;
      try {
        const provider = new this.$fireModule.auth.GoogleAuthProvider();
        await this.$fire.auth.signInWithPopup(provider);
        this.snackbar = true;
        this.snackbarText = "Signed in successfully.";
        this.$router.push(`/estate/${this.estate_id}`);
      } catch (error) {
        console.error("❌ Google sign-in:", error.code || error.message);
        this.showError(this.humanizeAuthError(error));
      } finally {
        this.progress_bar = false;
      }
    },

    showError(msg) {
      this.snackbar2 = true;
      this.snackbarText2 = msg;
    },

    humanizeAuthError(error) {
      const code = error?.code || "";
      switch (code) {
        case "auth/user-not-found":
          return "No account with that email.";
        case "auth/wrong-password":
          return "Incorrect password.";
        case "auth/invalid-email":
          return "Invalid email address.";
        case "auth/too-many-requests":
          return "Too many attempts. Try again later.";
        case "auth/popup-closed-by-user":
          return "Sign-in popup was closed.";
        case "auth/network-request-failed":
          return "Network error.";
        default:
          return error?.message || "Sign in failed.";
      }
    },
  },
};
</script>

<style scoped>
/* ============================================================
   Root layout: split screen
   ============================================================ */
.auth-root {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background: #ffffff;
}

/* ============================================================
   LEFT PANEL
   ============================================================ */
.auth-left {
  position: relative;
  flex: 1.1;
  overflow: hidden;
  background: linear-gradient(140deg, #1e1b4b 0%, #4c1d95 50%, #6d28d9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 56px;
  color: white;
}

.left-content {
  position: relative;
  z-index: 5;
  max-width: 520px;
  width: 100%;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 56px;
}

.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.left-title {
  font-size: 2.75rem;
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -1.5px;
  margin: 0 0 20px;
}

.left-accent {
  background: linear-gradient(135deg, #c4b5fd, #f0abfc);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.left-subtitle {
  font-size: 1.05rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.72);
  margin: 0 0 48px;
  max-width: 440px;
}

/* Preview cards */
.preview-stack {
  position: relative;
  height: 260px;
  margin-bottom: 48px;
}

.preview-card {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 340px;
  animation: floatIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.preview-1 { top: 0; left: 0; animation-delay: 0.1s; }
.preview-2 { top: 88px; left: 40px; animation-delay: 0.25s; }
.preview-3 { top: 176px; left: 8px; animation-delay: 0.4s; }

@keyframes floatIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.preview-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.preview-icon.green { background: #10b981; }
.preview-icon.purple { background: #8b5cf6; }
.preview-icon.amber { background: #f59e0b; }

.preview-body { flex: 1; min-width: 0; }

.preview-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: white;
  line-height: 1.2;
}

.preview-sub {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.65);
  margin-top: 2px;
}

.preview-time {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
}

.preview-bar {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 28px;
}

.preview-bar span {
  width: 4px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 2px;
}

.left-footer {
  display: flex;
  align-items: center;
  gap: 14px;
}

.footer-dots { display: flex; gap: 6px; }

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
}
.dot-active { background: white; width: 20px; border-radius: 3px; }

.footer-text {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.35;
  pointer-events: none;
}
.blob-1 { width: 400px; height: 400px; background: #a78bfa; top: -100px; right: -100px; }
.blob-2 { width: 300px; height: 300px; background: #ec4899; bottom: -80px; right: 15%; }
.blob-3 { width: 240px; height: 240px; background: #60a5fa; bottom: 20%; left: -60px; }

/* ============================================================
   RIGHT PANEL
   ============================================================ */
.auth-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 32px;
  background: #fafafc;
}

.form-wrap { width: 100%; max-width: 420px; }

.mobile-brand {
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;
}

.brand-mark-sm {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-name-sm {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -0.4px;
}

.form-head { margin-bottom: 28px; }

.form-title {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.6px;
  color: #1e1b4b;
  margin: 0 0 6px;
}

.form-sub {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
}

/* Step indicator */
.steps {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}

.step { display: flex; align-items: center; gap: 8px; }

.step-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.step-active .step-num {
  background: #7c3aed;
  color: white;
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.15);
}

.step-done .step-num {
  background: #10b981;
  color: white;
}

.step-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  transition: color 0.25s ease;
}

.step-active .step-label,
.step-done .step-label { color: #1e1b4b; }

.step-line {
  flex: 1;
  height: 2px;
  background: #e5e7eb;
  border-radius: 1px;
  transition: background 0.3s ease;
}

.step-line-done { background: #10b981; }

/* Inline error */
.inline-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  margin-bottom: 16px;
  font-size: 0.8rem;
  color: #991b1b;
}

.retry-link {
  margin-left: auto;
  color: #7c3aed;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.78rem;
}

.retry-link:hover { text-decoration: underline; }

/* Form */
.form-body { margin-top: 4px; }

.field-block { margin-bottom: 16px; }

.field-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 6px;
  letter-spacing: 0.2px;
}

.field-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.forgot-link {
  font-size: 0.75rem;
  color: #7c3aed;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}

.forgot-link:hover { text-decoration: underline; }

::v-deep .theme--light.v-text-field--outlined fieldset,
::v-deep .theme--light.v-select.v-text-field--outlined fieldset {
  border-radius: 12px !important;
  border-color: #e5e7eb !important;
}

::v-deep .theme--light.v-text-field--outlined:not(.v-input--is-focused):hover fieldset {
  border-color: #c4b5fd !important;
}

::v-deep .theme--light.v-text-field--outlined.v-input--is-focused fieldset {
  border-color: #7c3aed !important;
  border-width: 2px !important;
}

::v-deep .v-input__slot { min-height: 46px !important; }

/* Estate confirmation strip */
.estate-confirm {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  margin: -8px 0 16px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
}

.estate-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #065f46;
}

.estate-loc {
  font-size: 0.72rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Terms */
.terms-box { margin-top: 0; margin-bottom: 8px; }
.terms-box ::v-deep .v-label { font-size: 0.8rem; }

.terms-text { color: #4b5563; font-size: 0.8rem; }

.terms-link {
  color: #7c3aed;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.terms-link:hover { text-decoration: underline; }

/* Submit */
.submit-btn {
  height: 48px !important;
  font-size: 0.95rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.2px;
  box-shadow: 0 8px 20px -6px rgba(124, 58, 237, 0.5) !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
  margin-top: 8px;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 26px -6px rgba(124, 58, 237, 0.7) !important;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px 0;
}

.divider-line { flex: 1; height: 1px; background: #e5e7eb; }

.divider-text {
  font-size: 0.72rem;
  color: #9ca3af;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

/* Google button */
.google-btn {
  height: 46px !important;
  border-color: #e5e7eb !important;
  text-transform: none !important;
  transition: all 0.2s ease;
}

.google-btn:hover {
  border-color: #7c3aed !important;
  background: #faf5ff !important;
}

.google-text {
  font-size: 0.88rem;
  font-weight: 600;
  color: #374151;
  text-transform: none;
}

/* Footer */
.form-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 0.82rem;
  color: #6b7280;
}

.create-link {
  color: #7c3aed;
  font-weight: 700;
  margin-left: 4px;
  text-decoration: none;
  cursor: pointer;
}

.create-link:hover { text-decoration: underline; }

/* Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-fade-enter,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Responsive */
@media (max-width: 959px) {
  .auth-root { flex-direction: column; }
  .auth-right {
    padding: 32px 24px;
    align-items: flex-start;
    padding-top: 48px;
    min-height: 100vh;
  }
  .form-wrap { max-width: 100%; }
}

@media (max-width: 599px) {
  .form-title { font-size: 1.5rem; }
  .auth-right { padding: 24px 20px; padding-top: 32px; }
}
</style>