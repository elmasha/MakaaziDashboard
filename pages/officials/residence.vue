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
          <v-list-item-action v-if="item.badge && item.badge > 0">
            <v-chip x-small color="red" text-color="white" class="font-weight-bold" style="font-size: 10px;">
              {{ item.badge }}
            </v-chip>
          </v-list-item-action>
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
        <v-badge
          v-if="item.badge && item.badge > 0"
          color="red"
          dot
          overlap
          offset-x="8"
          offset-y="4"
        ></v-badge>
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
                      Residence
                    </h1>
                    <v-chip
                      x-small
                      label
                      color="purple lighten-5 purple--text"
                      class="ml-2 font-weight-bold hidden-xs-only"
                    >
                      {{ filteredHouseholds.length }}
                    </v-chip>
                  </div>
                  <div class="d-flex align-center mt-1">
                    <span class="text-caption text--secondary">
                      All approved households in {{ estate.estate_name || 'your estate' }}
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
              <v-btn
                color="#8051FF"
                dark
                depressed
                rounded
                small
                class="text-capitalize font-weight-bold mr-2 hidden-xs-only"
                @click="openNewDialog"
              >
                <v-icon left small>mdi-plus</v-icon>
                Add household
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
        <!-- Search + filters -->
        <v-row class="mb-4 reveal-card">
          <v-col cols="12">
            <v-card class="rounded-2xl pa-3 pa-sm-4" elevation="0" outlined>
              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="search"
                    placeholder="Search by name, phone, or house number"
                    dense
                    outlined
                    rounded
                    hide-details
                    prepend-inner-icon="mdi-magnify"
                    clearable
                  />
                </v-col>
                <v-col cols="6" sm="2">
                  <v-select
                    v-model="filterSection"
                    :items="sectionOptions"
                    label="Section"
                    dense
                    outlined
                    rounded
                    hide-details
                    clearable
                  />
                </v-col>
                <v-col cols="6" sm="2">
                  <v-select
                    v-model="filterCourt"
                    :items="courtOptions"
                    label="Court"
                    dense
                    outlined
                    rounded
                    hide-details
                    clearable
                  />
                </v-col>
                <v-col cols="6" sm="2">
                  <v-select
                    v-model="filterStreet"
                    :items="streetOptions"
                    label="Street"
                    dense
                    outlined
                    rounded
                    hide-details
                    clearable
                  />
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <!-- Loading skeleton -->
        <div v-if="loading && !households.length" class="pa-4">
          <v-skeleton-loader
            type="list-item-avatar-three-line, list-item-avatar-three-line, list-item-avatar-three-line, list-item-avatar-three-line"
          />
        </div>

        <!-- Empty state -->
        <v-row v-else-if="!filteredHouseholds.length" class="reveal-card">
          <v-col cols="12">
            <v-card class="rounded-2xl pa-12 text-center" elevation="0" outlined>
              <v-avatar color="purple lighten-5" size="72" class="mb-3">
                <v-icon size="44" color="#8051FF">
                  {{ hasActiveFilters ? 'mdi-filter-off' : 'mdi-home-group' }}
                </v-icon>
              </v-avatar>
              <div class="text-h6 grey--text text--darken-2 mt-3">
                {{ hasActiveFilters ? 'No matching households' : 'No households yet' }}
              </div>
              <div class="text-body-2 grey--text mt-1">
                {{ hasActiveFilters
                  ? 'Try clearing the filters or searching for something else.'
                  : 'Approved households will appear here.' }}
              </div>
              <v-btn
                v-if="hasActiveFilters"
                text
                small
                color="#8051FF"
                class="mt-4 text-capitalize font-weight-medium"
                @click="clearFilters"
              >
                <v-icon left small>mdi-close</v-icon>
                Clear filters
              </v-btn>
            </v-card>
          </v-col>
        </v-row>

        <!-- Household list -->
        <v-row v-else class="reveal-card">
          <v-col cols="12">
            <v-card class="rounded-2xl" elevation="0" outlined>
              <v-card-title class="px-4 px-sm-6 py-4 card-header-premium d-flex align-center">
                <v-avatar color="purple lighten-5" size="36" class="mr-3">
                  <v-icon color="#8051FF">mdi-home-group</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold text--primary">
                    {{ filteredHouseholds.length }} household{{ filteredHouseholds.length === 1 ? '' : 's' }}
                  </div>
                  <div class="text-caption text--secondary">
                    Ordered by address
                  </div>
                </div>
                <v-spacer></v-spacer>
                <v-btn
                  v-if="!nav_bars"
                  text
                  small
                  color="#8051FF"
                  class="text-capitalize font-weight-medium"
                  @click="goTo('/officials/payments')"
                >
                  <v-icon left small>mdi-chart-bar</v-icon>
                  Payment summary
                </v-btn>
              </v-card-title>
              <v-divider></v-divider>

              <v-list class="pa-0">
                <template v-for="(h, i) in filteredHouseholds">
                  <v-list-item
                    :key="h.household_id"
                    class="py-4 px-4 px-sm-6 hover-row"
                    style="cursor: pointer;"
                    @click="openHousehold(h)"
                  >
                    <v-list-item-avatar
                      :color="isOfficial(h) ? '#7cb300' : '#8051FF'"
                      size="48"
                    >
                      <span class="white-space font-weight-bold" style="color: white;">
                        {{ initialsOf(h.primary_owner) }}
                      </span>
                    </v-list-item-avatar>

                    <v-list-item-content>
                      <div class="d-flex align-center flex-wrap" style="gap: 8px;">
                        <v-list-item-title class="font-weight-bold text--primary" style="font-size: 1rem;">
                          {{ h.primary_owner }}
                        </v-list-item-title>
                        <v-chip
                          v-if="isOfficial(h)"
                          x-small
                          label
                          color="#f3ffd9"
                          class="font-weight-bold"
                          style="color: #4d7c0f;"
                        >
                          <v-icon x-small left style="color: #4d7c0f;">mdi-shield-account</v-icon>
                          {{ h.official_role || 'Official' }}
                        </v-chip>
                        <v-chip
                          v-if="!isActive(h)"
                          x-small
                          label
                          color="grey lighten-3"
                          class="font-weight-medium"
                        >
                          Inactive
                        </v-chip>
                      </div>

                      <div class="d-flex flex-wrap align-center mt-1" style="gap: 8px;">
                        <v-chip x-small label color="grey lighten-3" class="font-weight-medium">
                          <v-icon x-small left>mdi-home</v-icon>
                          {{ h.house_number || 'No #' }}
                        </v-chip>
                        <v-chip x-small label color="purple lighten-5 purple--text" class="font-weight-medium">
                          {{ h.section }}
                        </v-chip>
                        <v-chip x-small label color="blue lighten-5 blue--text" class="font-weight-medium">
                          {{ h.court }}
                        </v-chip>
                        <v-chip x-small label color="green lighten-5 green--text" class="font-weight-medium">
                          {{ h.street }}
                        </v-chip>
                      </div>

                      <div class="d-flex flex-wrap mt-2" style="gap: 12px;">
                        <div class="d-flex align-center">
                          <v-icon x-small color="grey" class="mr-1">mdi-phone</v-icon>
                          <span class="text-caption grey--text text--darken-1">
                            {{ h.contact_number }}
                          </span>
                        </div>
                        <div class="d-flex align-center" v-if="h.residence_status">
                          <v-icon x-small color="grey" class="mr-1">mdi-account-switch</v-icon>
                          <span class="text-caption grey--text text--darken-1">
                            {{ h.residence_status }}
                          </span>
                        </div>
                        <div class="d-flex align-center" v-if="h.caretaker_name">
                          <v-icon x-small color="grey" class="mr-1">mdi-account-supervisor</v-icon>
                          <span class="text-caption grey--text text--darken-1">
                            {{ h.caretaker_name }}
                          </span>
                        </div>
                      </div>
                    </v-list-item-content>

                    <v-list-item-action class="ml-2">
                      <v-icon color="grey lighten-1">mdi-chevron-right</v-icon>
                    </v-list-item-action>
                  </v-list-item>
                  <v-divider v-if="i < filteredHouseholds.length - 1" :key="`d-${h.household_id}`" inset></v-divider>
                </template>
              </v-list>
            </v-card>
          </v-col>
        </v-row>

        <!-- Mobile FAB -->
        <v-btn
          v-if="nav_bars"
          fab
          fixed
          bottom
          right
          color="#8051FF"
          dark
          class="elevation-6"
          style="bottom: 84px; right: 20px; z-index: 200;"
          @click="openNewDialog"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-container>

      <!-- ============================================================ -->
      <!-- Household detail dialog                                       -->
      <!-- ============================================================ -->
      <v-dialog
        v-model="detailDialog"
        max-width="560"
        persistent
        content-class="detail-dialog-content"
      >
        <div v-if="selectedHousehold" class="detail-dialog-card">
          <!-- Sticky header -->
          <div class="detail-dialog-header">
            <v-avatar color="rgba(255,255,255,0.25)" size="44" class="mr-3">
              <span class="white--text font-weight-bold">
                {{ initialsOf(selectedHousehold.primary_owner) }}
              </span>
            </v-avatar>
            <div class="flex-grow-1" style="min-width: 0;">
              <div class="text-h6 font-weight-bold" style="color: white; line-height: 1.2;">
                {{ selectedHousehold.primary_owner }}
              </div>
              <div
                class="text-caption"
                style="color: rgba(255,255,255,0.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
              >
                {{ selectedHousehold.uid }}
              </div>
            </div>
            <v-btn icon dark @click="detailDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <!-- Scrollable body -->
          <div class="detail-dialog-body">
            <!-- Quick stats -->
            <v-row dense class="mb-4">
              <v-col cols="6">
                <v-card outlined elevation="0" class="rounded-xl pa-3">
                  <div class="text-caption text--secondary">Total Paid</div>
                  <div class="text-h6 font-weight-bold text--primary">
                    KES {{ formatNum(detailStats.total_paid) }}
                  </div>
                </v-card>
              </v-col>
              <v-col cols="6">
                <v-card
                  :color="detailStats.overdue > 0 ? '#ffebee' : '#e8f5e9'"
                  elevation="0"
                  class="rounded-xl pa-3"
                >
                  <div
                    class="text-caption"
                    :style="detailStats.overdue > 0 ? 'color: #c62828;' : 'color: #2e7d32;'"
                  >
                    {{ detailStats.overdue > 0 ? 'Overdue' : 'Prepaid' }}
                  </div>
                  <div
                    class="text-h6 font-weight-bold"
                    :style="detailStats.overdue > 0 ? 'color: #c62828;' : 'color: #2e7d32;'"
                  >
                    KES {{ formatNum(detailStats.overdue > 0 ? detailStats.overdue : detailStats.prepaid) }}
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <!-- Detail rows -->
            <v-list dense class="pa-0">
              <v-list-item class="px-0 py-2">
                <v-list-item-icon class="mr-3">
                  <v-icon small color="#8051FF">mdi-home</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-subtitle class="text-caption text--secondary">
                    House Number
                  </v-list-item-subtitle>
                  <v-list-item-title class="font-weight-medium">
                    {{ selectedHousehold.house_number || '—' }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-divider inset></v-divider>

              <v-list-item class="px-0 py-2">
                <v-list-item-icon class="mr-3">
                  <v-icon small color="#8051FF">mdi-map-marker</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-subtitle class="text-caption text--secondary">
                    Address
                  </v-list-item-subtitle>
                  <v-list-item-title class="font-weight-medium">
                    {{ selectedHousehold.section }} · {{ selectedHousehold.court }} · {{ selectedHousehold.street }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-divider inset></v-divider>

              <v-list-item class="px-0 py-2">
                <v-list-item-icon class="mr-3">
                  <v-icon small color="#8051FF">mdi-phone</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-subtitle class="text-caption text--secondary">
                    Contact
                  </v-list-item-subtitle>
                  <v-list-item-title class="font-weight-medium">
                    {{ selectedHousehold.contact_number }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-divider inset></v-divider>

              <v-list-item class="px-0 py-2">
                <v-list-item-icon class="mr-3">
                  <v-icon small color="#8051FF">mdi-account-switch</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-subtitle class="text-caption text--secondary">
                    Residence Status
                  </v-list-item-subtitle>
                  <v-list-item-title class="font-weight-medium">
                    {{ selectedHousehold.residence_status || '—' }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <template v-if="selectedHousehold.caretaker_name">
                <v-divider inset></v-divider>
                <v-list-item class="px-0 py-2">
                  <v-list-item-icon class="mr-3">
                    <v-icon small color="#8051FF">mdi-account-supervisor</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-subtitle class="text-caption text--secondary">
                      Caretaker
                    </v-list-item-subtitle>
                    <v-list-item-title class="font-weight-medium">
                      {{ selectedHousehold.caretaker_name }}
                      <span v-if="selectedHousehold.caretaker_contact" class="text-caption grey--text">
                        · {{ selectedHousehold.caretaker_contact }}
                      </span>
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-list>
          </div>

          <!-- Sticky footer -->
          <div class="detail-dialog-footer">
            <v-btn
              text
              rounded
              class="text-capitalize font-weight-medium flex-grow-1"
              @click="detailDialog = false"
            >
              Close
            </v-btn>
            <v-btn
              rounded
              depressed
              color="#8051FF"
              dark
              class="text-capitalize font-weight-bold flex-grow-1"
              @click="goToHouseholdDashboard(selectedHousehold)"
            >
              <v-icon left>mdi-view-dashboard</v-icon>
              View dashboard
            </v-btn>
          </div>
        </div>
      </v-dialog>

      <!-- ============================================================ -->
      <!-- Add household dialog                                          -->
      <!-- ============================================================ -->
      <v-dialog
        v-model="newDialog"
        max-width="440"
        content-class="detail-dialog-content"
      >
        <div class="detail-dialog-card">
          <div style="padding: 24px; text-align: center;">
            <v-avatar color="purple lighten-5" size="64" class="mb-3">
              <v-icon color="#8051FF" size="32">mdi-account-plus</v-icon>
            </v-avatar>
            <div class="text-h6 font-weight-bold text--primary">
              Add a household
            </div>
            <div class="text-body-2 text--secondary mt-2">
              Register a new household on behalf of a resident. They'll be approved immediately.
            </div>

            <!-- KEY: row layout, equal width buttons, no wrapping -->
            <div class="d-flex flex-row align-center mt-4" style="gap: 12px; flex-wrap: nowrap;">
              <v-btn
                rounded
                text
                class="text-capitalize flex-grow-1"
                style="min-width: 0;"
                @click="newDialog = false"
              >
                Cancel
              </v-btn>
              <v-btn
                rounded
                depressed
                color="#8051FF"
                dark
                class="text-capitalize font-weight-bold flex-grow-1"
                style="min-width: 0;"
                @click="goToRegister"
              >
                Continue
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
            size="28" class="mr-3"
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
  name: 'OfficialResidence',
  data() {
    return {
      nav_bars: false,
      activeTab: '/officials/residence',

      loading: false,
      uid: null,
      estateId: null,
      official: { full_name: '', role: '', estate_id: null },
      estate: { estate_name: '' },

      households: [],

      search: '',
      filterSection: null,
      filterCourt: null,
      filterStreet: null,

      detailDialog: false,
      selectedHousehold: null,
      detailStats: {
        total_paid: 0,
        overdue: 0,
        prepaid: 0,
      },

      newDialog: false,

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
      ];
    },
    bottomMenuItems() {
      return [
        { title: 'Home',      icon: 'mdi-view-dashboard', route: this.dashboardRoute },
        { title: 'Pending',   icon: 'mdi-account-clock',  route: '/officials/pending' },
        { title: 'Payments',  icon: 'mdi-currency-usd',   route: '/officials/payments' },
        { title: 'Settings',  icon: 'mdi-cog',            route: '/officials/settings' },
      ];
    },
    officialInitials() {
      const name = this.official.full_name || 'O';
      return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    },
    hasActiveFilters() {
      return !!(this.search || this.filterSection || this.filterCourt || this.filterStreet);
    },
    sectionOptions() {
      return [...new Set(this.households.map((h) => h.section).filter(Boolean))].sort();
    },
    courtOptions() {
      return [...new Set(this.households.map((h) => h.court).filter(Boolean))].sort();
    },
    streetOptions() {
      return [...new Set(this.households.map((h) => h.street).filter(Boolean))].sort();
    },
    filteredHouseholds() {
      const q = (this.search || '').trim().toLowerCase();
      return this.households.filter((h) => {
        if (this.filterSection && h.section !== this.filterSection) return false;
        if (this.filterCourt && h.court !== this.filterCourt) return false;
        if (this.filterStreet && h.street !== this.filterStreet) return false;
        if (!q) return true;
        return (
          (h.primary_owner || '').toLowerCase().includes(q) ||
          (h.contact_number || '').toLowerCase().includes(q) ||
          (h.house_number || '').toLowerCase().includes(q) ||
          (h.uid || '').toLowerCase().includes(q)
        );
      });
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
        await Promise.all([this.fetchEstate(), this.fetchHouseholds()]);
      }
      this.loading = false;
    },

    async fetchOfficial() {
      const that = this;
      try {
        const { data, status } = await axios.get(
          `${API}/officials/getOfficialById/${that.uid}`
        );
        if (status === 200) {
          that.official = {
            full_name: data.full_name || '',
            role: data.role || '',
            estate_id: data.estate_id || null,
          };
          that.estateId = data.estate_id;
        }
      } catch (error) {
        console.error('🔴 Official fetch failed:', error.response?.data || error.message);
      }
    },

    async fetchEstate() {
      const that = this;
      if (!that.estateId) return;
      try {
        const { data, status } = await axios.get(
          `${API}/estates/estate/${that.estateId}`
        );
        if (status === 200) {
          that.estate = { estate_name: data.estate_name || '' };
        }
      } catch (error) {
        console.warn('Estate fetch failed:', error.response?.data || error.message);
      }
    },

    async fetchHouseholds() {
      const that = this;
      if (!that.estateId) return;
      try {
        const url = `${API}/households/getBHsHldEstId/${that.estateId}`;
        const { data, status } = await axios.get(url);
        if (status === 200) {
          const list = Array.isArray(data) ? data : [];
          that.households = list.slice().sort((a, b) => {
            const sA = `${a.section || ''}|${a.court || ''}|${a.street || ''}|${a.house_number || ''}`;
            const sB = `${b.section || ''}|${b.court || ''}|${b.street || ''}|${b.house_number || ''}`;
            return sA.localeCompare(sB);
          });
        }
      } catch (error) {
        console.error('🔴 Households fetch failed:', error.response?.data || error.message);
        that.households = [];
      }
    },

    clearFilters() {
      this.search = '';
      this.filterSection = null;
      this.filterCourt = null;
      this.filterStreet = null;
    },

    async openHousehold(h) {
      this.selectedHousehold = h;
      this.detailDialog = true;
      this.detailStats = { total_paid: 0, overdue: 0, prepaid: 0 };
      await this.fetchDetailStats(h);
    },

    async fetchDetailStats(h) {
      const that = this;
      try {
        const url = `${API}/households/dashboard/pk/${h.household_id}?year=${new Date().getFullYear()}`;
        const { data, status } = await axios.get(url);
        if (status === 200) {
          that.detailStats = {
            total_paid: Number(data.total_paid) || 0,
            overdue: Number(data.overdue) || 0,
            prepaid: Number(data.prepaid) || 0,
          };
        }
      } catch (error) {
        console.warn('Detail stats failed:', error.response?.data || error.message);
      }
    },

    goToHouseholdDashboard(h) {
      this.detailDialog = false;
      this.goTo(`/officials/residence/${h.household_id}`);
    },

    openNewDialog() {
      this.newDialog = true;
    },
    goToRegister() {
      this.newDialog = false;
      this.goTo('/household/register');
    },

    initialsOf(name) {
      if (!name) return '?';
      return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    },
    isOfficial(h) {
      const v = h?.is_official;
      return v === 1 || v === '1' || v === true;
    },
    isActive(h) {
      const v = h?.active;
      return v === 1 || v === '1' || v === true;
    },
    formatNum(n) {
      return numeral(n || 0).format('0,0');
    },
    showSnackbar(text, color = 'success') {
      this.snackbar = { show: true, text, color };
    },
    logout() {
      if (this.$fire?.auth) this.$fire.auth.signOut();
      this.$router.push('/');
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

.hover-row { transition: background-color 0.2s ease; }
.hover-row:hover { background-color: #f8fafc !important; }

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

/* Vuetify dialog wrapper: constrain margins so dialog never overflows */
::v-deep .v-dialog {
  margin: 8px !important;
}

/* The Vuetify dialog content wrapper (applied via content-class) */
.detail-dialog-content {
  overflow: hidden !important;
  border-radius: 20px !important;
  margin: 16px auto !important;
  max-width: 560px !important;
  width: calc(100% - 32px) !important;
  /* KEY: constrain height so the card can scroll inside */
  max-height: calc(100vh - 32px) !important;
  /* KEY: allow flex child to shrink */
  display: flex !important;
  flex-direction: column !important;
}

/* The card itself */
.detail-dialog-card {
  display: flex;
  flex-direction: column;
  /* KEY: use 100% of the constrained parent instead of 88vh */
  max-height: 100%;
  min-height: 0; /* allows flex children to shrink properly */
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
  min-height: 0; /* KEY: required for scroll to work inside flex */
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

/* Small screens: tighten spacing */
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