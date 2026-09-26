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
            <v-icon color="white" size="24">mdi-shield-account</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold purple--text brand-text">Makaazi</div>
            <div class="text-caption text--secondary font-weight-medium">Official Console</div>
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
        v-for="item in bottomMenuItems"
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
                  <div class="d-flex align-center">
                    <h1 class="text-h6 text-sm-h5 font-weight-bold text--primary page-title">
                      Settings
                    </h1>
                  </div>
                  <div class="d-flex align-center mt-1">
                    <span class="text-caption text--secondary">
                      {{ estate.estate_name || 'Your estate' }} · Official console
                    </span>
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
                <span class="white-space font-weight-bold text-caption" style="color: white;">
                  {{ officialInitials }}
                </span>
              </v-avatar>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <v-container :fluid="nav_bars" class="px-4 px-sm-6 pt-2 pt-sm-4 pb-8">
        <!-- Loading -->
        <div v-if="loading && !estate.estate_name" class="pa-4">
          <v-skeleton-loader type="card, card, card" />
        </div>

        <template v-else>
          <!-- ============================================================ -->
          <!-- Estate profile                                                -->
          <!-- ============================================================ -->
          <v-row class="mb-4 reveal-card">
            <v-col cols="12">
              <v-card class="rounded-2xl" elevation="0" outlined>
                <v-card-title class="px-4 px-sm-6 py-4 card-header-premium d-flex align-center">
                  <v-avatar color="purple lighten-5" size="36" class="mr-3">
                    <v-icon color="#8051FF">mdi-office-building</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-h6 font-weight-bold text--primary">Estate profile</div>
                    <div class="text-caption text--secondary">
                      Basic info about {{ estate.estate_name || 'your estate' }}
                    </div>
                  </div>
                  <v-spacer></v-spacer>
                  <v-btn
                    text
                    small
                    color="#8051FF"
                    class="text-capitalize font-weight-medium"
                    @click="editEstate = true"
                  >
                    <v-icon left small>mdi-pencil</v-icon>
                    Edit
                  </v-btn>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text class="px-4 px-sm-6 py-4">
                  <v-row dense>
                    <v-col cols="12" sm="6">
                      <div class="text-caption text--secondary">Estate name</div>
                      <div class="text-body-1 font-weight-medium">
                        {{ estate.estate_name || '—' }}
                      </div>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <div class="text-caption text--secondary">Location</div>
                      <div class="text-body-1 font-weight-medium">
                        {{ estate.location || '—' }}
                      </div>
                    </v-col>
                    <v-col cols="12" sm="6" class="mt-3">
                      <div class="text-caption text--secondary">Latitude</div>
                      <div class="text-body-1 font-weight-medium">
                        {{ estate.latitude || '—' }}
                      </div>
                    </v-col>
                    <v-col cols="12" sm="6" class="mt-3">
                      <div class="text-caption text--secondary">Longitude</div>
                      <div class="text-body-1 font-weight-medium">
                        {{ estate.longitude || '—' }}
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- ============================================================ -->
          <!-- Address components                                            -->
          <!-- ============================================================ -->
          <v-row class="mb-4 reveal-card">
            <v-col cols="12">
              <v-card class="rounded-2xl" elevation="0" outlined>
                <v-card-title class="px-4 px-sm-6 py-4 card-header-premium d-flex align-center">
                  <v-avatar color="blue lighten-5" size="36" class="mr-3">
                    <v-icon color="#1976d2">mdi-map-marker-multiple</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-h6 font-weight-bold text--primary">Address components</div>
                    <div class="text-caption text--secondary">
                      Toggle which address fields residents fill in
                    </div>
                  </div>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text class="px-4 px-sm-6 py-4">
                  <v-switch
                    v-model="addressConfig.show_section"
                    label="Show Section"
                    color="#8051FF"
                    hide-details
                    dense
                    class="mt-0"
                  />
                  <v-switch
                    v-model="addressConfig.show_court"
                    label="Show Court"
                    color="#8051FF"
                    hide-details
                    dense
                  />
                  <v-switch
                    v-model="addressConfig.show_street"
                    label="Show Street"
                    color="#8051FF"
                    hide-details
                    dense
                  />
                  <v-switch
                    v-model="addressConfig.show_house_number"
                    label="Show House Number"
                    color="#8051FF"
                    hide-details
                    dense
                  />
                  <v-btn
                    rounded
                    depressed
                    color="#8051FF"
                    dark
                    class="text-capitalize font-weight-bold mt-4"
                    :loading="savingAddressConfig"
                    @click="saveAddressConfig"
                  >
                    <v-icon left small>mdi-content-save</v-icon>
                    Save address config
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- ============================================================ -->
          <!-- Service charges                                               -->
          <!-- ============================================================ -->
          <v-row class="mb-4 reveal-card">
            <v-col cols="12">
              <v-card class="rounded-2xl" elevation="0" outlined>
                <v-card-title class="px-4 px-sm-6 py-4 card-header-premium d-flex align-center">
                  <v-avatar color="green lighten-5" size="36" class="mr-3">
                    <v-icon color="#2e7d32">mdi-tag-multiple</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-h6 font-weight-bold text--primary">Service charges</div>
                    <div class="text-caption text--secondary">
                      Monthly and recurring fees for households
                    </div>
                  </div>
                  <v-spacer></v-spacer>
                  <v-btn
                    text
                    small
                    color="#8051FF"
                    class="text-capitalize font-weight-medium"
                    @click="chargeDialog = true"
                  >
                    <v-icon left small>mdi-plus</v-icon>
                    Add charge
                  </v-btn>
                </v-card-title>
                <v-divider></v-divider>

                <v-list v-if="charges.length" class="pa-0">
                  <template v-for="(c, i) in charges">
                    <v-list-item :key="c.charges_id" class="py-3 px-4 px-sm-6">
                      <v-list-item-avatar color="green lighten-5" size="40">
                        <v-icon color="#2e7d32">mdi-cash</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-content>
                        <v-list-item-title class="font-weight-bold">
                          {{ c.charge_name }}
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-caption">
                          {{ c.frequency }} · KES {{ formatNum(c.amount) }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-btn icon small @click="editCharge(c)">
                          <v-icon small color="grey">mdi-pencil</v-icon>
                        </v-btn>
                      </v-list-item-action>
                    </v-list-item>
                    <v-divider v-if="i < charges.length - 1" :key="`cd-${c.charges_id}`" inset></v-divider>
                  </template>
                </v-list>

                <div v-else class="pa-8 text-center">
                  <v-avatar color="grey lighten-4" size="56" class="mb-3">
                    <v-icon size="32" color="grey">mdi-tag-off</v-icon>
                  </v-avatar>
                  <div class="text-body-1 grey--text text--darken-2 font-weight-medium">
                    No service charges yet
                  </div>
                  <div class="text-caption grey--text mt-1">
                    Add charges so residents can pay
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- ============================================================ -->
          <!-- Team                                                          -->
          <!-- ============================================================ -->
          <v-row class="mb-4 reveal-card">
            <v-col cols="12">
              <v-card class="rounded-2xl" elevation="0" outlined>
                <v-card-title class="px-4 px-sm-6 py-4 card-header-premium d-flex align-center">
                  <v-avatar color="orange lighten-5" size="36" class="mr-3">
                    <v-icon color="#e65100">mdi-account-supervisor</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-h6 font-weight-bold text--primary">Estate team</div>
                    <div class="text-caption text--secondary">
                      Officials and workers managing the estate
                    </div>
                  </div>
                  <v-spacer></v-spacer>
                  <v-btn
                    text
                    small
                    color="#8051FF"
                    class="text-capitalize font-weight-medium"
                    @click="goTo('/officials/team')"
                  >
                    Manage
                    <v-icon right small>mdi-chevron-right</v-icon>
                  </v-btn>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text class="px-4 px-sm-6 py-4">
                  <v-row dense>
                    <v-col cols="6" sm="3">
                      <div class="text-caption text--secondary">Officials</div>
                      <div class="text-h6 font-weight-bold">{{ team.officials }}</div>
                    </v-col>
                    <v-col cols="6" sm="3">
                      <div class="text-caption text--secondary">Workers</div>
                      <div class="text-h6 font-weight-bold">{{ team.workers }}</div>
                    </v-col>
                    <v-col cols="6" sm="3" class="mt-3 mt-sm-0">
                      <div class="text-caption text--secondary">Households</div>
                      <div class="text-h6 font-weight-bold">{{ team.households }}</div>
                    </v-col>
                    <v-col cols="6" sm="3" class="mt-3 mt-sm-0">
                      <div class="text-caption text--secondary">Your role</div>
                      <div class="text-h6 font-weight-bold">{{ official.role || '—' }}</div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- ============================================================ -->
          <!-- Account                                                       -->
          <!-- ============================================================ -->
          <v-row class="mb-4 reveal-card">
            <v-col cols="12">
              <v-card class="rounded-2xl" elevation="0" outlined>
                <v-card-title class="px-4 px-sm-6 py-4 card-header-premium d-flex align-center">
                  <v-avatar color="purple lighten-5" size="36" class="mr-3">
                    <v-icon color="#8051FF">mdi-account-circle</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-h6 font-weight-bold text--primary">Your account</div>
                    <div class="text-caption text--secondary">
                      Signed in as an estate official
                    </div>
                  </div>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text class="px-4 px-sm-6 py-4">
                  <v-row dense>
                    <v-col cols="12" sm="6">
                      <div class="text-caption text--secondary">Full name</div>
                      <div class="text-body-1 font-weight-medium">
                        {{ official.full_name || '—' }}
                      </div>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <div class="text-caption text--secondary">Role</div>
                      <div class="text-body-1 font-weight-medium">
                        {{ official.role || '—' }}
                      </div>
                    </v-col>
                    <v-col cols="12" sm="6" class="mt-3">
                      <div class="text-caption text--secondary">Contact</div>
                      <div class="text-body-1 font-weight-medium">
                        {{ official.contact || '—' }}
                      </div>
                    </v-col>
                    <v-col cols="12" sm="6" class="mt-3">
                      <div class="text-caption text--secondary">UID</div>
                      <div class="text-caption font-weight-medium grey--text text--darken-2" style="word-break: break-all;">
                        {{ uid || '—' }}
                      </div>
                    </v-col>
                  </v-row>

                  <v-divider class="my-4"></v-divider>

                  <div class="d-flex flex-wrap" style="gap: 8px;">
                    <v-btn
                      rounded
                      outlined
                      color="#8051FF"
                      class="text-capitalize font-weight-medium"
                      @click="goTo('/officials/dashboard')"
                    >
                      <v-icon left small>mdi-view-dashboard</v-icon>
                      Go to dashboard
                    </v-btn>
                    <v-btn
                      rounded
                      outlined
                      color="error"
                      class="text-capitalize font-weight-medium"
                      @click="confirmLogout = true"
                    >
                      <v-icon left small>mdi-logout</v-icon>
                      Sign out
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </template>
      </v-container>

      <!-- ============================================================ -->
      <!-- Edit estate dialog                                            -->
      <!-- ============================================================ -->
      <v-dialog v-model="editEstate" max-width="480" persistent content-class="detail-dialog-content">
        <div class="detail-dialog-card">
          <div class="detail-dialog-header">
            <v-icon color="white" class="mr-2">mdi-office-building</v-icon>
            <div class="text-h6 font-weight-bold" style="color: white;">Edit estate profile</div>
            <v-spacer></v-spacer>
            <v-btn icon dark @click="editEstate = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
          <div class="detail-dialog-body">
            <v-text-field
              v-model="estateForm.estate_name"
              label="Estate name"
              outlined
              dense
              rounded
            />
            <v-text-field
              v-model="estateForm.location"
              label="Location"
              outlined
              dense
              rounded
            />
            <v-row dense>
              <v-col cols="6">
                <v-text-field
                  v-model="estateForm.latitude"
                  label="Latitude"
                  outlined
                  dense
                  rounded
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="estateForm.longitude"
                  label="Longitude"
                  outlined
                  dense
                  rounded
                />
              </v-col>
            </v-row>
          </div>
          <div class="detail-dialog-footer">
            <v-btn text rounded class="text-capitalize flex-grow-1" @click="editEstate = false">
              Cancel
            </v-btn>
            <v-btn
              rounded
              depressed
              color="#8051FF"
              dark
              class="text-capitalize font-weight-bold flex-grow-1"
              :loading="savingEstate"
              @click="saveEstate"
            >
              Save
            </v-btn>
          </div>
        </div>
      </v-dialog>

      <!-- ============================================================ -->
      <!-- Add / edit charge dialog                                      -->
      <!-- ============================================================ -->
      <v-dialog v-model="chargeDialog" max-width="480" persistent content-class="detail-dialog-content">
        <div class="detail-dialog-card">
          <div class="detail-dialog-header">
            <v-icon color="white" class="mr-2">mdi-tag-multiple</v-icon>
            <div class="text-h6 font-weight-bold" style="color: white;">
              {{ chargeForm.charges_id ? 'Edit charge' : 'Add charge' }}
            </div>
            <v-spacer></v-spacer>
            <v-btn icon dark @click="closeChargeDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
          <div class="detail-dialog-body">
            <v-text-field
              v-model="chargeForm.charge_name"
              label="Charge name"
              outlined
              dense
              rounded
              placeholder="e.g. Security"
            />
            <v-text-field
              v-model="chargeForm.amount"
              label="Amount (KES)"
              type="number"
              outlined
              dense
              rounded
            />
            <v-select
              v-model="chargeForm.frequency"
              :items="frequencies"
              label="Frequency"
              outlined
              dense
              rounded
            />
          </div>
          <div class="detail-dialog-footer">
            <v-btn text rounded class="text-capitalize flex-grow-1" @click="closeChargeDialog">
              Cancel
            </v-btn>
            <v-btn
              rounded
              depressed
              color="#8051FF"
              dark
              class="text-capitalize font-weight-bold flex-grow-1"
              :loading="savingCharge"
              @click="saveCharge"
            >
              Save
            </v-btn>
          </div>
        </div>
      </v-dialog>

      <!-- ============================================================ -->
      <!-- Confirm logout dialog                                         -->
      <!-- ============================================================ -->
      <v-dialog v-model="confirmLogout" max-width="380" content-class="detail-dialog-content">
        <div class="detail-dialog-card">
          <div style="padding: 24px; text-align: center;">
            <v-avatar color="red lighten-5" size="64" class="mb-3">
              <v-icon color="#c62828" size="32">mdi-logout</v-icon>
            </v-avatar>
            <div class="text-h6 font-weight-bold text--primary">Sign out?</div>
            <div class="text-body-2 text--secondary mt-2">
              You'll need to sign in again to manage your estate.
            </div>
            <div class="d-flex mt-4" style="gap: 8px;">
              <v-btn block text class="text-capitalize" @click="confirmLogout = false">
                Cancel
              </v-btn>
              <v-btn
                block
                rounded
                color="error"
                dark
                class="text-capitalize font-weight-bold"
                @click="logout"
              >
                Sign out
              </v-btn>
            </div>
          </div>
        </div>
      </v-dialog>

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
          <v-avatar
            :color="snackbar.color === 'success' ? 'success darken-2' : snackbar.color === 'warning' ? 'warning darken-2' : 'error darken-2'"
            size="28"
            class="mr-3"
          >
            <v-icon color="white" small>
              {{ snackbar.color === 'success' ? 'mdi-check' : snackbar.color === 'warning' ? 'mdi-alert' : 'mdi-close' }}
            </v-icon>
          </v-avatar>
          <span class="font-weight-medium">{{ snackbar.text }}</span>
        </div>
      </v-snackbar>
    </v-main>
  </div>
</template>

<script>
import axios from 'axios';
import numeral from 'numeral';

const API = 'https://makaaziserver22.up.railway.app/api';

export default {
  name: 'OfficialSettings',
  data() {
    return {
      nav_bars: false,
      activeTab: '/officials/settings',

      loading: false,
      uid: null,
      estateId: null,
      official: { full_name: '', role: '', contact: '', estate_id: null },
      estate: {
        estate_name: '',
        location: '',
        latitude: '',
        longitude: '',
      },

      addressConfig: {
        show_section: true,
        show_court: true,
        show_street: true,
        show_house_number: true,
      },
      savingAddressConfig: false,

      charges: [],
      frequencies: ['Monthly', 'Quarterly', 'Half yearly', 'Annual', 'Adhoc'],

      team: {
        officials: 0,
        workers: 0,
        households: 0,
      },

      editEstate: false,
      estateForm: {
        estate_name: '',
        location: '',
        latitude: '',
        longitude: '',
      },
      savingEstate: false,

      chargeDialog: false,
      chargeForm: {
        charges_id: null,
        charge_name: '',
        amount: '',
        frequency: 'Monthly',
      },
      savingCharge: false,

      confirmLogout: false,

      snackbar: { show: false, text: '', color: 'success' },
    };
  },
  computed: {
    dashboardRoute() {
      return this.estateId
        ? `/officials/dashboard/${this.estateId}`
        : '/officials/dashboard';
    },
    menuItems() {
      return [
        { title: 'Dashboard', icon: 'mdi-view-dashboard', route: this.dashboardRoute },
        { title: 'Pending',   icon: 'mdi-account-clock',  route: '/officials/pending' },
        { title: 'Residents', icon: 'mdi-home-group',     route: '/officials/residence' },
        { title: 'Payments',  icon: 'mdi-currency-usd',   route: '/officials/payments' },
        { title: 'Charges',   icon: 'mdi-tag-multiple',   route: '/officials/charges' },
        { title: 'Team',      icon: 'mdi-account-supervisor', route: '/officials/team' },
        { title: 'Cash',      icon: 'mdi-cash-register',  route: '/officials/cash' },
        { title: 'Settings',  icon: 'mdi-cog',            route: '/officials/settings' },
      ];
    },
    bottomMenuItems() {
      return [
        { title: 'Home',     icon: 'mdi-view-dashboard', route: this.dashboardRoute },
        { title: 'Pending',  icon: 'mdi-account-clock',  route: '/officials/pending' },
        { title: 'Payments', icon: 'mdi-currency-usd',   route: '/officials/payments' },
        { title: 'Settings', icon: 'mdi-cog',            route: '/officials/settings' },
      ];
    },
    officialInitials() {
      const name = this.official.full_name || 'O';
      return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
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
          that.showSnackbar('Please sign in as an official', 'error');
        }
      });
    },

    async refreshAll() {
      if (!this.uid) return;
      this.loading = true;
      await this.fetchOfficial();
      if (this.estateId) {
        await Promise.all([
          this.fetchEstate(),
          this.fetchAddressConfig(),
          this.fetchCharges(),
          this.fetchTeam(),
        ]);
      }
      this.loading = false;
    },

    async fetchOfficial() {
      try {
        const { data, status } = await axios.get(
          `${API}/officials/getOfficialById/${this.uid}`
        );
        if (status === 200) {
          this.official = {
            full_name: data.full_name || '',
            role: data.role || '',
            contact: data.contact || data.phone || '',
            estate_id: data.estate_id || null,
          };
          this.estateId = data.estate_id;
        }
      } catch (error) {
        console.error('🔴 Official fetch failed:', error.response?.data || error.message);
      }
    },

    async fetchEstate() {
      if (!this.estateId) return;
      try {
        const { data, status } = await axios.get(
          `${API}/estates/estate/${this.estateId}`
        );
        if (status === 200) {
          this.estate = {
            estate_name: data.estate_name || '',
            location: data.location || '',
            latitude: data.latitude || '',
            longitude: data.longitude || '',
          };
        }
      } catch (error) {
        console.warn('Estate fetch failed:', error.response?.data || error.message);
      }
    },

    async fetchAddressConfig() {
      if (!this.estateId) return;
      try {
        const { data, status } = await axios.get(
          `${API}/address-config/estate/${this.estateId}`
        );
        if (status === 200 && data) {
          this.addressConfig = {
            show_section: data.show_section === 1 || data.show_section === true,
            show_court: data.show_court === 1 || data.show_court === true,
            show_street: data.show_street === 1 || data.show_street === true,
            show_house_number: data.show_house_number === 1 || data.show_house_number === true,
          };
        }
      } catch (error) {
        console.warn('Address config fetch failed:', error.response?.data || error.message);
      }
    },

    async fetchCharges() {
      if (!this.estateId) return;
      try {
        const { data, status } = await axios.get(
          `${API}/service-charges/estate/${this.estateId}`
        );
        if (status === 200) {
          this.charges = Array.isArray(data) ? data : [];
        }
      } catch (error) {
        console.warn('Charges fetch failed:', error.response?.data || error.message);
        this.charges = [];
      }
    },

    async fetchTeam() {
      if (!this.estateId) return;
      try {
        const [officialsRes, workersRes, householdsRes] = await Promise.allSettled([
          axios.get(`${API}/officials/getOfficialByEstateId/${this.estateId}`),
          axios.get(`${API}/workers/getWorkerByEstate/${this.estateId}`),
          axios.get(`${API}/households/getBHsHldEstId/${this.estateId}`),
        ]);

        this.team = {
          officials: officialsRes.status === 'fulfilled' && Array.isArray(officialsRes.value.data)
            ? officialsRes.value.data.length : 0,
          workers: workersRes.status === 'fulfilled' && Array.isArray(workersRes.value.data)
            ? workersRes.value.data.length : 0,
          households: householdsRes.status === 'fulfilled' && Array.isArray(householdsRes.value.data)
            ? householdsRes.value.data.length : 0,
        };
      } catch (error) {
        console.warn('Team fetch failed:', error.response?.data || error.message);
      }
    },

    // ----- Estate profile -----
    openEstateEdit() {
      this.estateForm = {
        estate_name: this.estate.estate_name,
        location: this.estate.location,
        latitude: this.estate.latitude,
        longitude: this.estate.longitude,
      };
      this.editEstate = true;
    },

    async saveEstate() {
      this.savingEstate = true;
      try {
        const { status } = await axios.patch(
          `${API}/estates/update_estate/${this.estateId}`,
          this.estateForm
        );
        if (status === 200) {
          this.estate = { ...this.estate, ...this.estateForm };
          this.editEstate = false;
          this.showSnackbar('Estate profile updated', 'success');
        }
      } catch (error) {
        this.showSnackbar(
          error.response?.data?.error || 'Could not update estate profile',
          'error'
        );
      } finally {
        this.savingEstate = false;
      }
    },

    // ----- Address config -----
    async saveAddressConfig() {
      this.savingAddressConfig = true;
      try {
        const payload = {
          estate_id: this.estateId,
          show_section: this.addressConfig.show_section ? 1 : 0,
          show_court: this.addressConfig.show_court ? 1 : 0,
          show_street: this.addressConfig.show_street ? 1 : 0,
          show_house_number: this.addressConfig.show_house_number ? 1 : 0,
        };
        const { status } = await axios.post(
          `${API}/address-config/save`,
          payload
        );
        if (status === 200 || status === 201) {
          this.showSnackbar('Address configuration saved', 'success');
        }
      } catch (error) {
        this.showSnackbar(
          error.response?.data?.error || 'Could not save address config',
          'error'
        );
      } finally {
        this.savingAddressConfig = false;
      }
    },

    // ----- Charges -----
    editCharge(c) {
      this.chargeForm = {
        charges_id: c.charges_id,
        charge_name: c.charge_name,
        amount: c.amount,
        frequency: c.frequency,
      };
      this.chargeDialog = true;
    },

    closeChargeDialog() {
      this.chargeDialog = false;
      this.chargeForm = {
        charges_id: null,
        charge_name: '',
        amount: '',
        frequency: 'Monthly',
      };
    },

    async saveCharge() {
      if (!this.chargeForm.charge_name || !this.chargeForm.amount) {
        this.showSnackbar('Charge name and amount are required', 'warning');
        return;
      }
      this.savingCharge = true;
      try {
        const payload = {
          estate_id: this.estateId,
          charge_name: this.chargeForm.charge_name,
          amount: parseFloat(this.chargeForm.amount),
          frequency: this.chargeForm.frequency,
        };
        if (this.chargeForm.charges_id) {
          payload.charges_id = this.chargeForm.charges_id;
        }
        const { status } = await axios.post(
          `${API}/service-charges/addCharge`,
          payload
        );
        if (status === 200 || status === 201) {
          this.showSnackbar(
            this.chargeForm.charges_id ? 'Charge updated' : 'Charge added',
            'success'
          );
          this.closeChargeDialog();
          await this.fetchCharges();
        }
      } catch (error) {
        this.showSnackbar(
          error.response?.data?.error || 'Could not save charge',
          'error'
        );
      } finally {
        this.savingCharge = false;
      }
    },

    // ----- Misc -----
    formatNum(n) {
      return numeral(n || 0).format('0,0');
    },
    showSnackbar(text, color = 'success') {
      this.snackbar = { show: true, text, color };
    },
    logout() {
      this.confirmLogout = false;
      if (this.$fire?.auth) this.$fire.auth.signOut();
      this.$router.push('/');
    },
  },
  watch: {
    editEstate(val) {
      if (val) this.openEstateEdit();
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

/* ============================================================ */
/* Dialog — bulletproof fit + scrolling                          */
/* ============================================================ */
::v-deep .v-dialog {
  margin: 8px !important;
}

.detail-dialog-content {
  overflow: hidden !important;
  border-radius: 20px !important;
  margin: 16px auto !important;
  max-width: 560px !important;
  width: calc(100% - 32px) !important;
  max-height: calc(100vh - 32px) !important;
  display: flex !important;
  flex-direction: column !important;
}

.detail-dialog-card {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  min-height: 0;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  width: 100%;
}

.detail-dialog-header {
  background: #8051FF;
  color: white;
  padding: 14px 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.detail-dialog-body {
  padding: 20px 24px;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1 1 auto;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}

.detail-dialog-footer {
  padding: 12px 20px 16px;
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  border-top: 1px solid #e2e8f0;
  background: #ffffff;
}

@media (max-width: 599px) {
  .sticky-header-premium { padding-left: 12px; padding-right: 12px; }
  .reveal-card { animation-duration: 0.4s; }
  .detail-dialog-content {
    width: calc(100% - 16px) !important;
    margin: 8px auto !important;
    max-height: calc(100vh - 16px) !important;
  }
  .detail-dialog-body { padding: 16px 16px; }
}
</style>