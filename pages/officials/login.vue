<template>
  <v-img :src="loginbg" style="min-height: 100vh;">
    <v-app-bar color="#ffffff00" light elevation="0">
      <div class="d-flex align-center cursor-pointer" @click="goTo('/')">
        <v-avatar color="#8051FF" size="38" class="mr-3 elevation-2">
          <v-icon color="white" size="20">mdi-shield-account</v-icon>
        </v-avatar>
        <v-toolbar-title style="color: black;">
          <span style="color: #8051FF; font-weight: 700;">Ma</span><span style="color: #7cb300; font-weight: 700;">kaazi</span>
          <span class="text-caption grey--text ml-2">Official</span>
        </v-toolbar-title>
      </div>
      <v-spacer />
      <v-btn text small class="text-capitalize" @click="goTo('/')">
        <v-icon left small>mdi-arrow-left</v-icon>
        Back
      </v-btn>
    </v-app-bar>

    <div class="container" style="padding-bottom: 40px;">
      <v-card class="mx-auto" max-width="420" elevation="0" style="border-radius: 20px;">
        <v-progress-linear
          v-show="progress_bar"
          indeterminate
          color="#8051FF"
        ></v-progress-linear>

        <div class="text-center pt-6">
          <v-avatar color="#8051FF" size="64" class="elevation-3">
            <v-icon color="white" size="32">mdi-shield-account</v-icon>
          </v-avatar>
        </div>

        <v-card-title style="color: black; font-size: 1.3rem; justify-content: center;">
          Official Sign In
        </v-card-title>
        <v-card-subtitle class="text-center">
          Sign in to manage your estate. Chairman, Secretary, and Treasurer accounts only.
        </v-card-subtitle>

        <div class="container" style="padding: 12px;">
          <v-form ref="form" v-model="valid" lazy-validation>
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
              width="100%"
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
          </v-form>

          <div class="text-center my-5">
            <span class="text-caption grey--text">Or</span>
          </div>

          <div class="d-flex justify-center">
            <a style="padding: 10px; flex: 1;" @click="signInGoogle">
              <v-card outlined class="text-center" elevation="0">
                <div class="container py-2">
                  <v-img contain :src="google" height="22"></v-img>
                </div>
              </v-card>
            </a>
          </div>

          <div class="text-center mt-6">
            <span class="text-caption grey--text">
              Not an official?
            </span>
            <a
              class="text-caption font-weight-bold ml-1"
              style="color: #8051FF;"
              @click="goTo('/login')"
            >
              Resident sign in
            </a>
          </div>

          <div class="text-center mt-3">
            <span class="text-caption grey--text">
              Need to register your estate?
            </span>
            <a
              class="text-caption font-weight-bold ml-1"
              style="color: #7cb300;"
              @click="goTo('/estate/register')"
            >
              Get started
            </a>
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
  name: 'OfficialLogin',
  data() {
    return {
      // Snackbars
      snackbar: false,
      snackbarText: 'No error message',
      snackbar2: false,
      snackbarText2: '',

      // UI
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
    // If already signed in, check if they're an official and route accordingly
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

        // Route based on official status
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
          // User is an official — go to their estate's dashboard
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

      // Not an official → sign them out and show the error
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
.container {
  padding-bottom: 40px;
}
</style>