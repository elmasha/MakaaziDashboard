<template>
  <div class="d-flex bg-surface dashboard-root" style="min-height: 100vh;">
    <!-- Desktop sidebar -->
    <v-navigation-drawer
      v-if="!nav_bars"
      permanent
      width="260"
      class="elevation-1 sidebar-glass"
    >
      <div class="pa-6 pb-4">
        <div class="d-flex align-center cursor-pointer brand-hover" @click="goTo(dashboardRoute)">
          <v-avatar color="#8051FF" size="46" class="elevation-2 mr-3">
            <v-icon color="white" size="24">mdi-home-city</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold purple--text brand-text">Makaazi</div>
            <div class="text-caption text--secondary font-weight-medium">Resident Console</div>
          </div>
        </div>
      </div>

      <v-divider class="mx-4 mb-2 opacity-30"></v-divider>

      <v-list dense nav class="px-3 py-2">
        <v-list-item
          v-for="(item, idx) in menuItems"
          :key="item.title"
          @click="goTo(item.route)"
          link
          class="mb-1 rounded-xl nav-item-premium"
          :class="{ 'purple lighten-5 purple--text': isActive(item.route) }"
          :style="{ 'animation-delay': idx * 50 + 'ms' }"
        >
          <v-list-item-icon class="mr-3">
            <v-icon :color="isActive(item.route) ? '#8051FF' : 'grey'" size="22">
              {{ item.icon }}
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="font-weight-semibold text-body-2">
              {{ item.title }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-4 pb-6">
          <v-btn
            block
            outlined
            color="#8051FF"
            class="rounded-xl text-capitalize mt-3 font-weight-medium"
            @click="logout"
          >
            <v-icon left size="18" color="#8051FF">mdi-logout</v-icon>
            Sign Out
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Mobile bottom nav -->
    <v-bottom-navigation
      v-if="nav_bars"
      v-model="activeTab"
      color="#8051FF"
      grow
      fixed
      class="elevation-8 bottom-nav-premium"
      style="z-index: 100;"
      height="64"
    >
      <v-btn
        v-for="item in menuItems"
        :key="item.title"
        @click="goTo(item.route)"
        :value="item.route"
        class="mobile-nav-btn"
      >
        <v-icon size="22">{{ item.icon }}</v-icon>
        <span class="mobile-nav-label">{{ item.title }}</span>
      </v-btn>
    </v-bottom-navigation>

    <!-- Main -->
    <v-main :class="nav_bars ? 'pb-16' : ''" class="main-premium">
      <!-- Header -->
      <div class="sticky-header-premium px-4 px-sm-6 py-3">
        <v-container fluid class="pa-0">
          <v-row align="center" no-gutters>
            <v-col cols="8" sm="6">
              <div class="d-flex align-center">
                <v-btn icon small class="mr-2" @click="goTo(dashboardRoute)">
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <div>
                  <h1 class="text-h6 text-sm-h5 font-weight-bold text--primary page-title">
                    Profile
                  </h1>
                  <div class="d-flex align-center mt-1">
                    <span class="text-caption text--secondary">Your household details</span>
                  </div>
                </div>
              </div>
            </v-col>
            <v-col cols="4" sm="6" class="d-flex justify-end align-center">
              <v-btn
                icon
                outlined
                small
                color="grey darken-1"
                class="mr-2 refresh-btn"
                :loading="loading"
                @click="refreshAll"
              >
                <v-icon small>mdi-refresh</v-icon>
              </v-btn>
              <v-avatar color="#8051FF" size="36">
                <v-img :src="avatarUrl" />
              </v-avatar>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <v-container :fluid="nav_bars" class="px-4 px-sm-6 pt-2 pt-sm-4 pb-8">
        <!-- Profile header card -->
        <v-row class="reveal-card">
          <v-col cols="12">
            <v-card class="rounded-2xl" elevation="0" outlined>
              <div class="pa-4 pa-sm-6">
                <div class="d-flex align-center flex-wrap">
                  <v-avatar color="#8051FF" size="64" class="mr-4 elevation-3">
                    <span class="white--text font-weight-bold" style="font-size: 1.4rem;">
                      {{ ownerInitials }}
                    </span>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <div class="text-h6 font-weight-bold text--primary">
                      {{ household.primary_owner || 'Resident' }}
                    </div>
                    <div class="text-caption text--secondary">
                      {{ household.section }} | {{ household.court }} | {{ household.street }}
                    </div>
                    <div class="mt-2 d-flex flex-wrap" style="gap: 8px;">
                      <v-chip small label color="purple lighten-5 purple--text" class="font-weight-bold">
                        {{ household.uid }}
                      </v-chip>
                      <v-chip
                        small
                        label
                        :color="statusChipColor"
                        :text-color="statusChipTextColor"
                        class="font-weight-bold"
                      >
                        <v-icon x-small left>{{ statusIcon }}</v-icon>
                        {{ household.status || 'Approved' }}
                      </v-chip>
                    </div>
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Details -->
        <v-row class="mt-4 reveal-card" style="animation-delay: 100ms">
          <v-col cols="12">
            <v-card class="rounded-2xl" elevation="0" outlined>
              <v-card-title class="px-4 px-sm-6 py-4 card-header-premium d-flex align-center">
                <v-avatar color="purple lighten-5" size="36" class="mr-3">
                  <v-icon color="#8051FF">mdi-account-details</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold text--primary">Details</div>
                  <div class="text-caption text--secondary">Contact & residence info</div>
                </div>
              </v-card-title>
              <v-divider></v-divider>

              <v-list dense class="pa-0">
                <v-list-item class="py-3 px-4 px-sm-6">
                  <v-list-item-icon class="mr-3">
                    <v-icon color="#8051FF" small>mdi-phone</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-subtitle class="text-caption text--secondary">Mobile Contact</v-list-item-subtitle>
                    <v-list-item-title class="font-weight-medium">{{ household.contact_number || '—' }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-divider inset></v-divider>

                <v-list-item class="py-3 px-4 px-sm-6">
                  <v-list-item-icon class="mr-3">
                    <v-icon color="#8051FF" small>mdi-home-outline</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-subtitle class="text-caption text--secondary">House Number</v-list-item-subtitle>
                    <v-list-item-title class="font-weight-medium">{{ household.house_number || '—' }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-divider inset></v-divider>

                <v-list-item class="py-3 px-4 px-sm-6">
                  <v-list-item-icon class="mr-3">
                    <v-icon color="#8051FF" small>mdi-map-marker</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-subtitle class="text-caption text--secondary">Address</v-list-item-subtitle>
                    <v-list-item-title class="font-weight-medium">
                      {{ household.section }} · {{ household.court }} · {{ household.street }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-divider inset></v-divider>

                <v-list-item class="py-3 px-4 px-sm-6">
                  <v-list-item-icon class="mr-3">
                    <v-icon color="#8051FF" small>mdi-account-switch</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-subtitle class="text-caption text--secondary">Residence Status</v-list-item-subtitle>
                    <v-list-item-title class="font-weight-medium">{{ household.residence_status || '—' }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <template v-if="household.caretaker_name">
                  <v-divider inset></v-divider>
                  <v-list-item class="py-3 px-4 px-sm-6">
                    <v-list-item-icon class="mr-3">
                      <v-icon color="#8051FF" small>mdi-account-supervisor</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption text--secondary">Caretaker</v-list-item-subtitle>
                      <v-list-item-title class="font-weight-medium">{{ household.caretaker_name }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        :timeout="4000"
        bottom
        rounded="pill"
        class="mb-6 snackbar-premium"
        elevation="6"
      >
        <div class="d-flex align-center">
          <v-avatar :color="snackbar.color === 'success' ? 'success darken-2' : 'error darken-2'" size="28" class="mr-3">
            <v-icon color="white" small>{{ snackbar.color === 'success' ? 'mdi-check' : 'mdi-alert' }}</v-icon>
          </v-avatar>
          <span class="font-weight-medium">{{ snackbar.text }}</span>
        </div>
      </v-snackbar>
    </v-main>
  </div>
</template>

<script>
import axios from 'axios';

const API = 'https://makaaziserver22.up.railway.app/api';

export default {
  name: 'HouseholdProfile',
  data() {
    return {
      nav_bars: false,
      activeTab: '/household/profile',

      loading: false,
      uid: null,
      household: {
        primary_owner: '',
        section: '',
        court: '',
        street: '',
        contact_number: '',
        house_number: '',
        residence_status: '',
        caretaker_name: '',
        uid: '',
        status: 'Approved',
      },
      snackbar: { show: false, text: '', color: 'success' },
    };
  },
  computed: {
    /**
     * ⚡ Dashboard URL matches /household/dashboard/:uid route
     * (folder has _id.vue, so the URL needs the uid).
     */
    dashboardRoute() {
      return this.uid
        ? `/household/dashboard/${this.uid}`
        : '/household/dashboard';
    },
    menuItems() {
      return [
        { title: 'Dashboard', icon: 'mdi-view-dashboard', route: this.dashboardRoute },
        { title: 'Payments',  icon: 'mdi-currency-usd',   route: '/household/payment_summary' },
        { title: 'Profile',   icon: 'mdi-account',        route: '/household/profile' },
        { title: 'Alerts',    icon: 'mdi-bell',           route: '/household/notifications' },
      ];
    },
    avatarUrl() {
      const name = this.household.primary_owner || 'Resident';
      return `https://ui-avatars.com/api/?background=8051FF&color=fff&name=${encodeURIComponent(name)}`;
    },
    ownerInitials() {
      const name = this.household.primary_owner || 'R';
      return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    },
    statusChipColor() {
      const s = this.household.status;
      if (s === 'Pending') return 'orange lighten-5';
      if (s === 'Rejected') return 'red lighten-5';
      return 'green lighten-5';
    },
    statusChipTextColor() {
      const s = this.household.status;
      if (s === 'Pending') return 'orange darken-2';
      if (s === 'Rejected') return 'red darken-2';
      return 'green darken-2';
    },
    statusIcon() {
      const s = this.household.status;
      if (s === 'Pending') return 'mdi-clock-outline';
      if (s === 'Rejected') return 'mdi-close-circle-outline';
      return 'mdi-check-circle-outline';
    },
  },
  mounted() {
    this.onResize();
    window.addEventListener('resize', this.onResize);
    this.waitForAuthAndLoad();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
    if (this._authUnsub) this._authUnsub();
  },
  methods: {
    onResize() {
      this.nav_bars = window.innerWidth < 768;
    },
    isActive(route) {
      return this.$route && this.$route.path === route;
    },
    goTo(path) {
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

    // =====================================================
    // AUTH — reads UID from Firebase
    // =====================================================
    waitForAuthAndLoad() {
      const that = this;
      const current = that.$fire?.auth?.currentUser;
      if (current && current.uid) {
        that.uid = current.uid;
        that.refreshAll();
        return;
      }
      that._authUnsub = that.$fire.auth.onAuthStateChanged((user) => {
        if (user && user.uid) {
          that.uid = user.uid;
          that.refreshAll();
          if (that._authUnsub) {
            that._authUnsub();
            that._authUnsub = null;
          }
        } else {
          that.showSnackbar('Please sign in to view your profile', 'error');
        }
      });
    },

    async refreshAll() {
      if (!this.uid) return;
      this.loading = true;
      await this.fetchHousehold();
      this.loading = false;
    },

    async fetchHousehold() {
      const that = this;
      const url = `${API}/households/getHouseHoldId/${that.uid}`;
      console.log('🔵 GET', url);
      try {
        const { data, status } = await axios.get(url);
        if (status === 200) {
          that.household = {
            primary_owner: data.primary_owner || '',
            section: data.section || '',
            court: data.court || '',
            street: data.street || '',
            contact_number: data.contact_number || '',
            house_number: data.house_number || '',
            residence_status: data.residence_status || '',
            caretaker_name: data.caretaker_name || '',
            uid: data.uid || '',
            status: data.status || 'Approved',
          };
          console.log('🔵 Household loaded:', that.household);
        }
      } catch (error) {
        console.error('🔴 fetchHousehold error:', error.response?.data || error.message);
        that.showSnackbar(error.response?.data?.error || 'Could not load profile', 'error');
      }
    },

    showSnackbar(text, color = 'success') {
      this.snackbar = { show: true, text, color };
    },
    logout() {
      if (this.$fire?.auth) this.$fire.auth.signOut();
      this.$router.push('/login');
    },
  },
};
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
.bg-surface { background-color: #f8fafc !important; }
.rounded-2xl { border-radius: 20px !important; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.reveal-card { animation: fadeInUp 0.6s ease-out both; }

.sidebar-glass {
  background: rgba(255, 255, 255, 0.95) !important;
  border-right: 1px solid #e2e8f0 !important;
}
.brand-text { letter-spacing: -0.5px; }
.brand-hover { transition: opacity 0.2s; }
.brand-hover:hover { opacity: 0.8; }

.nav-item-premium {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 4px;
  border-radius: 12px !important;
}
.nav-item-premium:hover {
  background-color: rgba(128, 81, 255, 0.06);
  transform: translateX(4px);
}

.main-premium { scroll-behavior: smooth; }
.sticky-header-premium {
  position: sticky;
  top: 0;
  z-index: 5;
  background: rgba(248, 250, 252, 0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid transparent;
}
.page-title { letter-spacing: -0.5px; }
.refresh-btn { transition: all 0.2s ease; }
.refresh-btn:hover { border-color: #8051FF; color: #8051FF !important; }

.card-header-premium {
  background: linear-gradient(to bottom, #ffffff, #f8fafc);
}

.snackbar-premium ::v-deep .v-snackbar__content { padding: 12px 20px; }

.bottom-nav-premium {
  border-top: 1px solid #e2e8f0 !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(12px);
}
.mobile-nav-btn { min-width: 0 !important; }
.mobile-nav-label { font-size: 10px; margin-top: 2px; }

@media (max-width: 599px) {
  .sticky-header-premium { padding-left: 12px; padding-right: 12px; }
  .reveal-card { animation-duration: 0.4s; }
}
</style>