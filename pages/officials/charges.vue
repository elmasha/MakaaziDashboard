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
                      Service Charges
                    </h1>
                    <v-chip
                      x-small
                      label
                      color="purple lighten-5 purple--text"
                      class="ml-2 font-weight-bold hidden-xs-only"
                    >
                      {{ charges.length }}
                    </v-chip>
                  </div>
                  <div class="d-flex align-center mt-1">
                    <span class="text-caption text--secondary">
                      What households in {{ estate.estate_name || 'your estate' }} pay
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
                @click="openAddDialog"
              >
                <v-icon left small>mdi-plus</v-icon>
                Add charge
              </v-btn>
              <v-avatar color="#8051FF" size="36">
                <span style="color: white;" class="font-weight-bold text-caption">{{ officialInitials }}</span>
              </v-avatar>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <v-container :fluid="nav_bars" class="px-4 px-sm-6 pt-2 pt-sm-4 pb-8">
        <!-- Info banner -->
        <v-row class="mb-4 reveal-card">
          <v-col cols="12">
            <v-card color="#ede9fe" class="rounded-2xl pa-4" elevation="0">
              <div class="d-flex align-center">
                <v-avatar color="#8051FF" size="40" class="mr-3">
                  <v-icon color="white" small>mdi-information-outline</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="font-weight-bold" style="color: #5b21b6;">
                    How charges work
                  </div>
                  <div class="text-caption" style="color: #6d28d9;">
                    All Monthly-frequency charges below are summed to compute each household's
                    monthly rate. Non-monthly charges are recorded but not automatically applied yet.
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Loading skeleton -->
        <div v-if="loading && !charges.length" class="pa-4">
          <v-skeleton-loader type="list-item-two-line, list-item-two-line, list-item-two-line" />
        </div>

        <!-- Empty state -->
        <v-row v-else-if="!charges.length" class="reveal-card">
          <v-col cols="12">
            <v-card class="rounded-2xl pa-12 text-center" elevation="0" outlined>
              <v-avatar color="purple lighten-5" size="72" class="mb-3">
                <v-icon size="44" color="#8051FF">mdi-tag-off-outline</v-icon>
              </v-avatar>
              <div class="text-h6 grey--text text--darken-2 mt-3">No charges yet</div>
              <div class="text-body-2 grey--text mt-1">
                Add your first service charge so residents can start paying.
              </div>
              <v-btn
                rounded
                depressed
                color="#8051FF"
                dark
                class="mt-4 text-capitalize font-weight-bold"
                @click="openAddDialog"
              >
                <v-icon left>mdi-plus</v-icon>
                Add first charge
              </v-btn>
            </v-card>
          </v-col>
        </v-row>

        <!-- Charges list -->
        <v-row v-else class="reveal-card">
          <v-col cols="12">
            <v-card class="rounded-2xl" elevation="0" outlined>
              <v-card-title class="px-4 px-sm-6 py-4 card-header-premium d-flex align-center">
                <v-avatar color="purple lighten-5" size="36" class="mr-3">
                  <v-icon color="#8051FF">mdi-tag-multiple</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold text--primary">Active charges</div>
                  <div class="text-caption text--secondary">
                    Total monthly: <strong>KES {{ formatNum(totalMonthly) }}</strong>
                  </div>
                </div>
              </v-card-title>
              <v-divider></v-divider>

              <v-list class="pa-0">
                <template v-for="(c, i) in charges">
                  <v-list-item
                    :key="c.charges_id"
                    class="py-4 px-4 px-sm-6"
                  >
                    <v-list-item-avatar
                      :color="chargeColor(c).bg"
                      size="48"
                    >
                      <v-icon :color="chargeColor(c).fg" small>
                        {{ chargeIcon(c) }}
                      </v-icon>
                    </v-list-item-avatar>

                    <v-list-item-content>
                      <div class="d-flex align-center flex-wrap" style="gap: 8px;">
                        <v-list-item-title class="font-weight-bold text--primary" style="font-size: 1rem;">
                          {{ c.charge_type }}
                        </v-list-item-title>
                        <v-chip
                          x-small
                          label
                          :color="c.frequency === 'Monthly' ? 'purple lighten-5 purple--text' : 'grey lighten-3'"
                          class="font-weight-medium"
                        >
                          {{ c.frequency }}
                        </v-chip>
                      </div>

                      <div class="mt-1">
                        <span class="text-h6 font-weight-bold" style="color: #8051FF;">
                          KES {{ formatNum(c.amount) }}
                        </span>
                        <span class="text-caption grey--text ml-2">
                          per {{ String(c.frequency || '').toLowerCase() }}
                        </span>
                      </div>

                      <div
                        v-if="c.frequency !== 'Monthly'"
                        class="text-caption grey--text mt-1"
                      >
                        <v-icon x-small color="warning">mdi-alert-circle-outline</v-icon>
                        Not included in the monthly rate yet.
                      </div>
                    </v-list-item-content>

                    <v-list-item-action class="ml-2">
                      <div class="d-flex flex-column align-center" style="gap: 4px;">
                        <v-btn
                          icon
                          small
                          class="action-btn-hover"
                          title="Edit"
                          @click.stop="openEditDialog(c)"
                        >
                          <v-icon small color="#8051FF">mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn
                          icon
                          small
                          class="action-btn-hover"
                          title="Delete"
                          @click.stop="openDeleteDialog(c)"
                        >
                          <v-icon small color="red">mdi-delete-outline</v-icon>
                        </v-btn>
                      </div>
                    </v-list-item-action>
                  </v-list-item>
                  <v-divider v-if="i < charges.length - 1" :key="`d-${c.charges_id}`" inset></v-divider>
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
          @click="openAddDialog"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-container>

      <!-- ============================================================ -->
      <!-- Add/Edit dialog — SCROLLABLE, appealing                      -->
      <!-- ============================================================ -->
      <v-dialog v-model="formDialog" max-width="520" persistent scrollable>
        <v-card class="dialog-card">
          <!-- Sticky header -->
          <v-card-title class="dialog-header">
            <div class="d-flex align-center" style="width: 100%;">
              <v-btn icon dark @click="closeFormDialog">
                <v-icon>mdi-close</v-icon>
              </v-btn>
              <div class="flex-grow-1 text-center">
                <div class="text-h6 font-weight-bold" style="color: white;">
                  {{ editing ? 'Edit charge' : 'Add service charge' }}
                </div>
              </div>
              <div style="width: 40px;"></div>
            </div>
          </v-card-title>

          <!-- Scrollable body -->
          <v-card-text class="dialog-body">
            <v-form ref="form" v-model="valid">
              <label class="field-label">Charge name</label>
              <v-text-field
                v-model="form.charge_type"
                placeholder="e.g. Security, Welfare, Garbage"
                outlined
                rounded
                dense
                hide-details="auto"
                class="mb-4"
                :rules="[(v) => !!v || 'Charge name is required']"
                required
              />

              <label class="field-label">Amount (KES)</label>
              <v-text-field
                v-model.number="form.amount"
                type="number"
                min="1"
                prefix="KES"
                placeholder="0"
                outlined
                rounded
                dense
                hide-details="auto"
                class="mb-4"
                :rules="[
                  (v) => v !== '' || 'Amount is required',
                  (v) => Number(v) > 0 || 'Amount must be greater than 0',
                ]"
                required
              />

              <label class="field-label">Frequency</label>
              <v-select
                v-model="form.frequency"
                :items="frequencies"
                placeholder="Select frequency"
                outlined
                rounded
                dense
                hide-details="auto"
                class="mb-4"
                :rules="[(v) => !!v || 'Frequency is required']"
                required
              />

              <v-alert
                v-if="form.frequency && form.frequency !== 'Monthly'"
                type="warning"
                dense
                text
                class="rounded-xl"
              >
                Only <strong>Monthly</strong> charges are summed into the household monthly rate
                right now. Other frequencies are recorded but not yet applied automatically.
              </v-alert>
            </v-form>
          </v-card-text>

          <!-- Sticky footer -->
          <v-card-actions class="dialog-footer">
            <v-btn
              text
              rounded
              class="text-capitalize font-weight-medium flex-grow-1"
              @click="closeFormDialog"
              :disabled="submitting"
            >
              Cancel
            </v-btn>
            <v-btn
              rounded
              depressed
              color="#8051FF"
              dark
              class="text-capitalize font-weight-bold flex-grow-1"
              :loading="submitting"
              :disabled="!valid"
              @click="submitForm"
            >
              <v-icon left>mdi-check</v-icon>
              {{ editing ? 'Save changes' : 'Add charge' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ============================================================ -->
      <!-- Delete confirmation                                          -->
      <!-- ============================================================ -->
      <v-dialog v-model="deleteDialog" max-width="440" persistent>
        <v-card class="rounded-2xl pa-2">
          <v-card-text class="text-center pa-6">
            <v-avatar color="red lighten-5" size="64" class="mb-3">
              <v-icon color="red darken-2" size="32">mdi-delete-outline</v-icon>
            </v-avatar>
            <div class="text-h6 font-weight-bold text--primary">Delete this charge?</div>
            <div class="text-body-2 text--secondary mt-2">
              <strong>{{ deleteTarget?.charge_type }}</strong> — KES {{ formatNum(deleteTarget?.amount) }}.
              This action can't be undone.
            </div>

            <div class="d-flex mt-5" style="gap: 8px;">
              <v-btn
                block
                text
                class="text-capitalize font-weight-medium"
                @click="closeDeleteDialog"
                :disabled="submitting"
              >
                Cancel
              </v-btn>
              <v-btn
                block
                rounded
                depressed
                color="red darken-2"
                dark
                class="text-capitalize font-weight-bold"
                :loading="submitting"
                @click="confirmDelete"
              >
                <v-icon left>mdi-delete</v-icon>
                Delete
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
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
  name: 'OfficialCharges',
  data() {
    return {
      nav_bars: false,
      activeTab: '/officials/charges',

      loading: false,
      submitting: false,
      uid: null,
      estateId: null,
      official: { full_name: '', role: '', estate_id: null },
      estate: { estate_name: '' },

      charges: [],

      frequencies: ['Monthly', 'Quarterly', 'Half yearly', 'Annual', 'Adhoc'],

      formDialog: false,
      editing: false,
      valid: true,
      form: {
        charges_id: null,
        charge_type: '',
        amount: '',
        frequency: 'Monthly',
      },

      deleteDialog: false,
      deleteTarget: null,

      snackbar: { show: false, text: '', color: 'success' },
    };
  },
  computed: {
    dashboardRoute() {
      return this.estateId ? `/officials/dashboard/${this.estateId}` : '/officials/dashboard';
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
    totalMonthly() {
      return this.charges
        .filter((c) => c.frequency === 'Monthly')
        .reduce((sum, c) => sum + Number(c.amount || 0), 0);
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
        await Promise.all([this.fetchEstate(), this.fetchCharges()]);
      }
      this.loading = false;
    },

    async fetchOfficial() {
      const that = this;
      try {
        const { data, status } = await axios.get(`${API}/officials/getOfficialById/${that.uid}`);
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
        const { data, status } = await axios.get(`${API}/estates/estate/${that.estateId}`);
        if (status === 200) that.estate = { estate_name: data.estate_name || '' };
      } catch (error) {
        console.warn('Estate fetch failed:', error.response?.data || error.message);
      }
    },

    async fetchCharges() {
      const that = this;
      if (!that.estateId) return;
      try {
        const url = `${API}/services/getEstateServiceCharges/${that.estateId}`;
        const { data, status } = await axios.get(url);
        if (status === 200) {
          that.charges = Array.isArray(data) ? data : [];
        }
      } catch (error) {
        console.error('🔴 Charges fetch failed:', error.response?.data || error.message);
        that.charges = [];
      }
    },

    openAddDialog() {
      this.editing = false;
      this.form = {
        charges_id: null,
        charge_type: '',
        amount: '',
        frequency: 'Monthly',
      };
      this.formDialog = true;
    },

    openEditDialog(c) {
      this.editing = true;
      this.form = {
        charges_id: c.charges_id,
        charge_type: c.charge_type,
        amount: Number(c.amount),
        frequency: c.frequency,
      };
      this.formDialog = true;
    },

    closeFormDialog() {
      this.formDialog = false;
      if (this.$refs.form) this.$refs.form.resetValidation();
    },

    async submitForm() {
      const that = this;
      if (!that.$refs.form.validate()) return;
      that.submitting = true;

      try {
        if (that.editing) {
          const url = `${API}/services/update/${that.form.charges_id}`;
          const { status } = await axios.put(url, {
            charge_type: that.form.charge_type,
            amount: Number(that.form.amount),
            frequency: that.form.frequency,
          });
          if (status === 200) {
            that.showSnackbar('Charge updated successfully', 'success');
            that.formDialog = false;
            await that.fetchCharges();
          }
        } else {
          const url = `${API}/services/addServiceCharge`;
          const { status } = await axios.post(url, {
            estate_id: that.estateId,
            charge_type: that.form.charge_type,
            amount: Number(that.form.amount),
            frequency: that.form.frequency,
          });
          if (status === 200) {
            that.showSnackbar('Charge added successfully', 'success');
            that.formDialog = false;
            await that.fetchCharges();
          }
        }
      } catch (error) {
        console.error('🔴 Save failed:', error.response?.data || error.message);
        that.showSnackbar(
          error.response?.data?.error || 'Could not save the charge',
          'error'
        );
      } finally {
        that.submitting = false;
      }
    },

    openDeleteDialog(c) {
      this.deleteTarget = c;
      this.deleteDialog = true;
    },

    closeDeleteDialog() {
      this.deleteDialog = false;
      this.deleteTarget = null;
    },

    async confirmDelete() {
      const that = this;
      if (!that.deleteTarget) return;
      that.submitting = true;

      try {
        const url = `${API}/services/delete/${that.deleteTarget.charges_id}`;
        const { status } = await axios.delete(url);
        if (status === 200) {
          that.showSnackbar('Charge deleted', 'success');
          that.closeDeleteDialog();
          await that.fetchCharges();
        }
      } catch (error) {
        console.error('🔴 Delete failed:', error.response?.data || error.message);
        that.showSnackbar(
          error.response?.data?.error || 'Could not delete the charge',
          'error'
        );
      } finally {
        that.submitting = false;
      }
    },

    chargeColor(c) {
      const t = String(c.charge_type || '').toLowerCase();
      if (t.includes('security')) return { bg: 'blue lighten-5', fg: 'blue darken-2' };
      if (t.includes('welfare')) return { bg: 'purple lighten-5', fg: '#8051FF' };
      if (t.includes('garbage') || t.includes('waste')) return { bg: 'green lighten-5', fg: 'green darken-2' };
      if (t.includes('water')) return { bg: 'cyan lighten-5', fg: 'cyan darken-2' };
      if (t.includes('electric')) return { bg: 'amber lighten-5', fg: 'amber darken-2' };
      return { bg: 'grey lighten-4', fg: 'grey darken-2' };
    },
    chargeIcon(c) {
      const t = String(c.charge_type || '').toLowerCase();
      if (t.includes('security')) return 'mdi-shield-home';
      if (t.includes('welfare')) return 'mdi-hand-heart';
      if (t.includes('garbage') || t.includes('waste')) return 'mdi-trash-can-outline';
      if (t.includes('water')) return 'mdi-water';
      if (t.includes('electric')) return 'mdi-lightning-bolt';
      return 'mdi-tag';
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
.tracking-wide { letter-spacing: 0.08em; }

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

.action-btn-hover { transition: all 0.2s ease; }
.action-btn-hover:hover { background: rgba(128, 81, 255, 0.1); }

.snackbar-premium ::v-deep .v-snackbar__content { padding: 12px 20px; }

.bottom-nav-premium {
  border-top: 1px solid #e2e8f0 !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(12px);
}
.mobile-nav-btn { min-width: 0 !important; }
.mobile-nav-label { font-size: 10px; margin-top: 2px; }

/* ============================================================ */
/* Dialog — clean, scrollable layout                             */
/* ============================================================ */
.dialog-card {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
  border-radius: 20px !important;
}

.dialog-header {
  background: #8051FF;
  color: white;
  padding: 12px 16px;
  flex-shrink: 0;
}

.dialog-body {
  padding: 24px !important;
  overflow-y: auto;
  flex: 1 1 auto;
}

.dialog-footer {
  padding: 16px 24px;
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  border-top: 1px solid #e2e8f0;
  background: #ffffff;
}

.field-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  margin-bottom: 6px;
}

@media (max-width: 599px) {
  .sticky-header-premium { padding-left: 12px; padding-right: 12px; }
  .reveal-card { animation-duration: 0.4s; }
}
</style>