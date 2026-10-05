<template>
  <div class="subs-page">
    <!-- ============================================================
         PAGE HEADER
         ============================================================ -->
    <div class="page-header">
      <div>
        <div class="page-title-row">
          <h1 class="page-title">Subscriptions</h1>
          <div class="count-pill">{{ filteredSubs.length }}</div>
        </div>
        <p class="page-sub">
          {{ subs.length }} estates · {{ activeCount }} subscribed ·
          {{ unsubscribedCount }} not subscribed · MRR KES {{ formatNumShort(mrr) }}
        </p>
      </div>
      <div class="page-actions">
        <v-btn
          text
          rounded
          class="text-capitalize manage-plans-btn"
          @click="openPlansDialog"
        >
          <v-icon left small>mdi-cog-outline</v-icon>
          Manage plans
        </v-btn>
        <v-btn
          text
          rounded
          class="text-capitalize refresh-btn"
          :loading="loading"
          @click="load"
        >
          <v-icon left small>mdi-refresh</v-icon>
          Refresh
        </v-btn>
        <v-btn
          color="#B6FF00"
          rounded
          depressed
          class="text-capitalize new-estate-btn"
          @click="openNewDialog"
        >
          <v-icon left small color="#0A0A14">mdi-plus</v-icon>
          <span style="color:#0A0A14; font-weight:700;">New subscription</span>
        </v-btn>
      </div>
    </div>

    <!-- ============================================================
         SUPPORT NOTICE
         ============================================================ -->
    <div v-if="isSupportAdmin" class="support-notice">
      <div class="support-notice-icon">
        <v-icon size="16" color="#8051FF">mdi-shield-alert-outline</v-icon>
      </div>
      <div class="support-notice-text">
        Billing changes (subscriptions and plans) require super-admin approval before they take effect.
      </div>
    </div>

    <!-- ============================================================
         SUMMARY CARDS
         ============================================================ -->
    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-icon summary-icon-lime">
          <v-icon size="18" color="#0A0A14">mdi-check-circle-outline</v-icon>
        </div>
        <div class="summary-body">
          <div class="summary-label">Active</div>
          <div class="summary-value">{{ activeCount }}</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon summary-icon-amber">
          <v-icon size="18" color="white">mdi-clock-alert-outline</v-icon>
        </div>
        <div class="summary-body">
          <div class="summary-label">Expiring soon</div>
          <div class="summary-value">{{ expiringCount }}</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon summary-icon-red">
          <v-icon size="18" color="white">mdi-close-circle-outline</v-icon>
        </div>
        <div class="summary-body">
          <div class="summary-label">Expired / cancelled</div>
          <div class="summary-value">{{ expiredCount }}</div>
        </div>
      </div>

      <div class="summary-card summary-card-highlight">
        <div class="summary-icon summary-icon-white">
          <v-icon size="18" color="#0A0A14">mdi-cash-multiple</v-icon>
        </div>
        <div class="summary-body">
          <div class="summary-label">Monthly revenue</div>
          <div class="summary-value">
            <span class="currency">KES</span>
            {{ formatNumShort(mrr) }}
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================
         FILTERS
         ============================================================ -->
    <div class="filters-card">
      <div class="search-wrap">
        <v-icon size="18" class="search-icon">mdi-magnify</v-icon>
        <input
          v-model="search"
          class="search-input"
          type="text"
          placeholder="Search by estate, plan, or reference"
        />
        <button v-if="search" class="search-clear" @click="search = ''">
          <v-icon size="16">mdi-close-circle</v-icon>
        </button>
      </div>

      <div class="filter-chips">
        <button
          v-for="s in statusOptions"
          :key="s.value"
          class="filter-chip"
          :class="{ 'filter-chip-active': statusFilter === s.value }"
          @click="statusFilter = s.value"
        >
          {{ s.label }}
        </button>
      </div>
    </div>

    <!-- ============================================================
         LOADING
         ============================================================ -->
    <div v-if="loading && !subs.length" class="loading-block">
      <v-skeleton-loader
        type="list-item-avatar-three-line, list-item-avatar-three-line, list-item-avatar-three-line"
      />
    </div>

    <!-- ============================================================
         EMPTY
         ============================================================ -->
    <div v-else-if="!filteredSubs.length" class="empty-card">
      <div class="empty-icon">
        <v-icon size="44" color="#8051FF">
          {{ hasActiveFilters ? 'mdi-filter-off' : 'mdi-credit-card-outline' }}
        </v-icon>
      </div>
      <div class="empty-title">
        {{ hasActiveFilters ? 'No matching subscriptions' : 'No estates yet' }}
      </div>
      <div class="empty-text">
        {{ hasActiveFilters
          ? 'Try clearing the filters or searching for something else.'
          : 'Create an estate first, then add a subscription.' }}
      </div>
      <button v-if="hasActiveFilters" class="empty-clear-btn" @click="clearFilters">
        <v-icon size="16" class="mr-1">mdi-close</v-icon>
        Clear filters
      </button>
      <button v-else class="empty-create-btn" @click="openNewDialog">
        <v-icon size="16" class="mr-1" color="#0A0A14">mdi-plus</v-icon>
        New subscription
      </button>
    </div>

    <!-- ============================================================
         LIST
         ============================================================ -->
    <div v-else class="subs-card">
      <div class="subs-header">
        <div class="col col-estate">Estate</div>
        <div class="col col-plan">Plan</div>
        <div class="col col-cycle">Cycle</div>
        <div class="col col-period">Period</div>
        <div class="col col-amount">Amount</div>
        <div class="col col-status">Status</div>
        <div class="col col-actions"></div>
      </div>

      <div
        v-for="s in filteredSubs"
        :key="s.id"
        class="sub-row"
        @click="openSub(s)"
      >
        <div class="col col-estate">
          <div class="estate-avatar" :class="avatarClass(s.status)">
            <span>{{ initialsOf(s.estate_name || s.estate_urn) }}</span>
          </div>
          <div class="estate-info">
            <div class="estate-name">{{ s.estate_name || 'Unknown estate' }}</div>
            <div class="estate-urn">{{ s.estate_urn || '—' }}</div>
          </div>
        </div>

        <div class="col col-plan">
          <div v-if="s.plan_name" class="plan-name">{{ s.plan_name }}</div>
          <div v-else class="plan-name plan-name-empty">No plan</div>
          <div class="plan-meta">{{ s.plan_code || '—' }}</div>
        </div>

        <div class="col col-cycle">
          <span class="cycle-badge" :class="cycleClass(s.billing_cycle)">
            {{ s.billing_cycle || '—' }}
          </span>
        </div>

        <div class="col col-period">
          <div class="period-main">{{ fmtDate(s.current_period_start) }}</div>
          <div class="period-arrow">
            <v-icon size="12">mdi-arrow-right</v-icon>
            {{ fmtDate(s.current_period_end) }}
          </div>
        </div>

        <div class="col col-amount">
          <template v-if="s.status === 'NotSubscribed'">
            <div class="amount-main amount-main-empty">—</div>
            <div class="amount-meta">No subscription</div>
          </template>
          <template v-else>
            <div class="amount-main">
              <span class="currency-sm">KES</span>
              {{ formatNum(s.amount) }}
            </div>
            <div class="amount-meta">{{ nextBillingLabel(s) }}</div>
          </template>
        </div>

        <div class="col col-status">
          <span class="status-pill" :class="statusClass(s.status)">
            <span class="status-dot"></span>
            {{ s.status }}
          </span>
        </div>

        <div class="col col-actions" @click.stop>
          <button class="icon-btn" @click="toggleMenu(s.id)">
            <v-icon size="18">mdi-dots-vertical</v-icon>
          </button>
          <transition name="menu-fade">
            <div v-if="openMenuId === s.id" class="row-menu">
              <button
                class="row-menu-item"
                :disabled="s.status === 'NotSubscribed'"
                @click="s.status !== 'NotSubscribed' && editSub(s)"
              >
                <v-icon size="16" class="mr-2">mdi-pencil-outline</v-icon>
                Edit
                <span v-if="isSupportAdmin" class="menu-tag">Approval</span>
              </button>
              <template v-if="s.status !== 'NotSubscribed'">
                <div class="row-menu-divider"></div>
                <button
                  v-if="s.status !== 'Active'"
                  class="row-menu-item row-menu-item-success"
                  @click="setStatus(s, 'Active')"
                >
                  <v-icon size="16" class="mr-2">mdi-check-circle-outline</v-icon>
                  Activate
                  <span v-if="isSupportAdmin" class="menu-tag">Approval</span>
                </button>
                <button
                  v-if="s.status !== 'Expired'"
                  class="row-menu-item row-menu-item-warn"
                  @click="setStatus(s, 'Expired')"
                >
                  <v-icon size="16" class="mr-2">mdi-clock-alert-outline</v-icon>
                  Mark expired
                  <span v-if="isSupportAdmin" class="menu-tag">Approval</span>
                </button>
                <button
                  v-if="s.status !== 'Cancelled'"
                  class="row-menu-item row-menu-item-danger"
                  @click="setStatus(s, 'Cancelled')"
                >
                  <v-icon size="16" class="mr-2">mdi-close-circle-outline</v-icon>
                  Cancel
                  <span v-if="isSupportAdmin" class="menu-tag menu-tag-danger">Approval</span>
                </button>
              </template>
              <template v-else>
                <div class="row-menu-divider"></div>
                <button
                  class="row-menu-item row-menu-item-success"
                  @click="createForEstate(s)"
                >
                  <v-icon size="16" class="mr-2">mdi-plus-circle-outline</v-icon>
                  Create subscription
                  <span v-if="isSupportAdmin" class="menu-tag">Approval</span>
                </button>
              </template>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- ============================================================
         NEW SUBSCRIPTION DIALOG
         ============================================================ -->
    <v-dialog
      v-if="newDialog"
      v-model="newDialog"
      max-width="520"
      content-class="sub-dialog-content"
    >
      <div class="sub-dialog-card">
        <div class="sub-dialog-header">
          <div>
            <div class="sub-dialog-title">
              {{ isSupportAdmin ? 'Request subscription' : 'New subscription' }}
            </div>
            <div class="sub-dialog-sub">
              {{ isSupportAdmin
                ? 'This will be sent to a super admin for approval'
                : 'Attach a billing plan to an estate' }}
            </div>
          </div>
          <button class="sub-dialog-close" @click="closeNewDialog">
            <v-icon size="20" color="white">mdi-close</v-icon>
          </button>
        </div>

        <div class="sub-dialog-body">
          <div class="form-row">
            <label class="form-label">Estate</label>
            <select v-model="form.estate_id" class="form-input">
              <option value="" disabled>Select an estate…</option>
              <option v-for="e in estates" :key="e.estate_id" :value="e.estate_id">
                {{ e.estate_name }} · {{ e.estate_urn }}
              </option>
            </select>
          </div>

          <div class="form-row">
            <label class="form-label">Plan</label>
            <select v-model="form.plan_id" class="form-input">
              <option value="" disabled>Select a plan…</option>
              <option v-for="p in plans" :key="p.plan_id" :value="p.plan_id">
                {{ p.plan_name }} — KES {{ formatNum(p.monthly_rate) }}/mo
              </option>
            </select>
            <div v-if="!plans.length" class="form-hint form-hint-warn">
              <v-icon size="14">mdi-alert-circle-outline</v-icon>
              No plans available. Click <strong>Manage plans</strong> to create one.
            </div>
          </div>

          <div class="form-grid">
            <div class="form-row">
              <label class="form-label">Start date</label>
              <input v-model="form.start_date" class="form-input" type="date" />
            </div>
            <div class="form-row">
              <label class="form-label">End date</label>
              <input v-model="form.end_date" class="form-input" type="date" />
            </div>
          </div>

          <div class="form-grid">
            <div class="form-row">
              <label class="form-label">Amount paid (KES)</label>
              <input
                v-model.number="form.amount_paid"
                class="form-input"
                type="number"
                min="0"
                placeholder="0"
              />
            </div>
            <div class="form-row">
              <label class="form-label">Payment status</label>
              <select v-model="form.payment_status" class="form-input">
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <label class="form-label">Payment method</label>
            <select v-model="form.payment_method" class="form-input">
              <option value="Mpesa">Mpesa</option>
              <option value="Bank">Bank</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <div v-if="isSupportAdmin" class="form-hint form-hint-info">
            <v-icon size="14">mdi-information-outline</v-icon>
            Submitting will send this to a super admin for approval.
          </div>
        </div>

        <div class="sub-dialog-footer">
          <button class="dialog-btn dialog-btn-ghost" @click="closeNewDialog">
            Cancel
          </button>
          <button
            class="dialog-btn dialog-btn-primary"
            :disabled="!canSubmit || submitting"
            @click="submitNew"
          >
            <v-icon v-if="submitting" size="16" class="mr-2 spin">mdi-loading</v-icon>
            {{ submitting
              ? 'Submitting…'
              : (isSupportAdmin ? 'Send for approval' : 'Create subscription')
            }}
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- ============================================================
         MANAGE PLANS DIALOG
         ============================================================ -->
    <v-dialog
      v-if="plansDialog"
      v-model="plansDialog"
      max-width="640"
      content-class="sub-dialog-content"
    >
      <div class="sub-dialog-card">
        <div class="sub-dialog-header">
          <div>
            <div class="sub-dialog-title">Manage subscription plans</div>
            <div class="sub-dialog-sub">
              <span v-if="isSupportAdmin">
                Changes will be sent to a super admin for approval
              </span>
              <span v-else>
                Create, edit, or remove plans. Estates subscribe to these.
              </span>
            </div>
          </div>
          <button class="sub-dialog-close" @click="plansDialog = false">
            <v-icon size="20" color="white">mdi-close</v-icon>
          </button>
        </div>

        <div class="sub-dialog-body">
          <!-- Create / edit form -->
          <div class="plan-form">
            <div class="plan-form-title">
              {{ planEdit.plan_id ? 'Edit plan' : 'New plan' }}
            </div>

            <div class="form-grid">
              <div class="form-row">
                <label class="form-label">Plan name</label>
                <input
                  v-model="planEdit.plan_name"
                  class="form-input"
                  placeholder="e.g. Band 5 (5000+)"
                />
              </div>
              <div class="form-row">
                <label class="form-label">Monthly rate (KES)</label>
                <input
                  v-model.number="planEdit.monthly_rate"
                  class="form-input"
                  type="number"
                  min="0"
                  placeholder="400"
                />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-row">
                <label class="form-label">Min households</label>
                <input
                  v-model.number="planEdit.min_households"
                  class="form-input"
                  type="number"
                  min="1"
                  placeholder="1"
                />
              </div>
              <div class="form-row">
                <label class="form-label">Max households (blank = no limit)</label>
                <input
                  v-model.number="planEdit.max_households"
                  class="form-input"
                  type="number"
                  min="1"
                  placeholder="100"
                />
              </div>
            </div>

            <div class="plan-form-actions">
              <button
                v-if="planEdit.plan_id"
                class="dialog-btn dialog-btn-ghost"
                @click="resetPlanForm"
              >
                Cancel edit
              </button>
              <button
                class="dialog-btn dialog-btn-primary"
                :disabled="!canSavePlan || savingPlan"
                @click="savePlan"
              >
                <v-icon v-if="savingPlan" size="16" class="mr-2 spin">mdi-loading</v-icon>
                {{
                  savingPlan
                    ? 'Submitting…'
                    : (planEdit.plan_id
                        ? (isSupportAdmin ? 'Send changes' : 'Save changes')
                        : (isSupportAdmin ? 'Send for approval' : 'Create plan'))
                }}
              </button>
            </div>
          </div>

          <!-- Existing plans -->
          <div class="plan-list-title">
            Existing plans ({{ plans.length }})
          </div>
          <div class="plan-list">
            <div v-if="plansLoading" class="plan-loading">
              <v-skeleton-loader type="list-item-two-line" />
              <v-skeleton-loader type="list-item-two-line" />
            </div>
            <div v-else-if="!plans.length" class="plan-empty">
              No plans yet — create one above
            </div>
            <div v-for="p in plans" :key="p.plan_id" class="plan-item">
              <div class="plan-item-body">
                <div class="plan-item-name">{{ p.plan_name }}</div>
                <div class="plan-item-meta">
                  {{ p.min_households }} – {{ p.max_households || '∞' }} households ·
                  KES {{ formatNum(p.monthly_rate) }}/mo
                </div>
              </div>
              <button class="plan-item-btn" @click="editPlan(p)" title="Edit">
                <v-icon size="15">mdi-pencil-outline</v-icon>
              </button>
              <button
                class="plan-item-btn plan-item-btn-danger"
                @click="askDeletePlan(p)"
                title="Delete"
              >
                <v-icon size="15">mdi-trash-can-outline</v-icon>
              </button>
            </div>
          </div>
        </div>

        <div class="sub-dialog-footer">
          <button class="dialog-btn dialog-btn-ghost" @click="plansDialog = false">
            Close
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- ============================================================
         DELETE PLAN CONFIRM DIALOG
         ============================================================ -->
    <v-dialog v-model="deletePlanDialog" max-width="440" persistent>
      <div class="confirm-card">
        <div class="confirm-icon confirm-icon-danger">
          <v-icon size="24" color="white">mdi-delete-alert</v-icon>
        </div>

        <div class="confirm-title">
          {{ isSupportAdmin ? 'Request plan removal?' : 'Delete this plan?' }}
        </div>

        <div class="confirm-text">
          <span v-if="isSupportAdmin">
            This will send a request to a super admin for approval.
            The plan stays active until they approve.
          </span>
          <span v-else>
            This will permanently delete the plan. Existing subscriptions
            that reference it may be affected. This cannot be undone.
          </span>
        </div>

        <div v-if="planToDelete" class="confirm-plan-preview">
          <div class="confirm-plan-name">{{ planToDelete.plan_name }}</div>
          <div class="confirm-plan-meta">
            {{ planToDelete.min_households }} – {{ planToDelete.max_households || '∞' }} households ·
            KES {{ formatNum(planToDelete.monthly_rate) }}/mo
          </div>
        </div>

        <div class="confirm-actions">
          <button
            class="action-btn action-btn-ghost"
            :disabled="deletingPlan"
            @click="deletePlanDialog = false"
          >
            Cancel
          </button>
          <button
            class="action-btn action-btn-danger"
            :disabled="deletingPlan"
            @click="confirmDeletePlan"
          >
            <v-icon size="14" class="mr-1">
              {{ deletingPlan ? 'mdi-loading' : (isSupportAdmin ? 'mdi-send' : 'mdi-delete') }}
            </v-icon>
            {{ deletingPlan
              ? 'Working…'
              : (isSupportAdmin ? 'Send for approval' : 'Delete plan')
            }}
          </button>
        </div>
      </div>
    </v-dialog>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3500"
      top
      rounded="pill"
    >
      <div class="d-flex align-center">
        <v-icon color="white" small class="mr-2">
          {{ snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
        </v-icon>
        <span>{{ snackbar.text }}</span>
      </div>
    </v-snackbar>
  </div>
</template>

<script>
import axios from 'axios';
import numeral from 'numeral';

const API = 'https://makaaziserver22.up.railway.app/api';

export default {
  name: 'AdminSubscriptions',
  layout: 'admin',

  data() {
    return {
      loading: false,
      submitting: false,

      subs: [],
      estates: [],
      plans: [],
      plansLoading: false,

      search: '',
      statusFilter: '',
      openMenuId: null,

      adminRole: null,

      newDialog: false,
      form: {
        estate_id: '',
        plan_id: '',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: '',
        amount_paid: 0,
        payment_status: 'Paid',
        payment_method: 'Mpesa',
      },

      // Plans management
      plansDialog: false,
      savingPlan: false,
      planEdit: {
        plan_id: null,
        plan_name: '',
        min_households: 1,
        max_households: 100,
        monthly_rate: 100,
      },

      // Plan deletion
      deletePlanDialog: false,
      planToDelete: null,
      deletingPlan: false,

      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    isSupportAdmin() {
      return this.adminRole === 'support';
    },
    isSuperAdmin() {
      return this.adminRole === 'super';
    },
    statusOptions() {
      return [
        { label: 'All', value: '' },
        { label: 'Active', value: 'Active' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Failed', value: 'Failed' },
        { label: 'Expired', value: 'Expired' },
        { label: 'Cancelled', value: 'Cancelled' },
        { label: 'Not subscribed', value: 'NotSubscribed' },
      ];
    },
    activeCount() {
      return this.subs.filter((s) => s.status === 'Active').length;
    },
    expiredCount() {
      return this.subs.filter(
        (s) => s.status === 'Expired' || s.status === 'Cancelled' || s.status === 'Failed'
      ).length;
    },
    expiringCount() {
      const now = Date.now();
      const week = 7 * 24 * 60 * 60 * 1000;
      return this.subs.filter((s) => {
        if (s.status !== 'Active' || !s.current_period_end) return false;
        const end = new Date(s.current_period_end).getTime();
        return end - now <= week && end - now >= 0;
      }).length;
    },
    unsubscribedCount() {
      return this.subs.filter((s) => s.status === 'NotSubscribed').length;
    },
    mrr() {
      return this.subs
        .filter((s) => s.status === 'Active' && s.monthly_rate != null)
        .reduce((sum, s) => sum + Number(s.monthly_rate), 0);
    },
    hasActiveFilters() {
      return !!(this.search || this.statusFilter);
    },
    filteredSubs() {
      const q = this.search.trim().toLowerCase();
      return this.subs.filter((s) => {
        if (this.statusFilter && s.status !== this.statusFilter) return false;
        if (!q) return true;
        return (
          (s.estate_name || '').toLowerCase().includes(q) ||
          (s.estate_urn || '').toLowerCase().includes(q) ||
          (s.plan_name || '').toLowerCase().includes(q) ||
          (s.reference || '').toLowerCase().includes(q)
        );
      });
    },
    canSubmit() {
      return !!(this.form.estate_id && this.form.plan_id && this.form.start_date);
    },
    canSavePlan() {
      return !!(
        this.planEdit.plan_name &&
        this.planEdit.min_households != null &&
        this.planEdit.monthly_rate != null
      );
    },
  },

  mounted() {
    try {
      this.adminRole = localStorage.getItem('admin_role') || null;
    } catch (e) {
      console.warn(e.message);
    }

    this.load();
    this.loadEstates();
    this.loadPlans();
    document.addEventListener('click', this.closeMenuOnClickOutside);
  },

  beforeDestroy() {
    document.removeEventListener('click', this.closeMenuOnClickOutside);
  },

  methods: {
    async getAuthHeaders() {
      try {
        const user = this.$fire?.auth?.currentUser;
        if (!user) return {};
        const token = await user.getIdToken();
        return { Authorization: `Bearer ${token}` };
      } catch (e) {
        console.warn('getIdToken failed:', e.message);
        return {};
      }
    },

    async load() {
      this.loading = true;
      try {
        const headers = await this.getAuthHeaders();
        const { data, status } = await axios.get(
          `${API}/admin/subscriptions`,
          { headers }
        );
        if (status === 200 && Array.isArray(data)) {
          this.subs = data;
        }
      } catch (err) {
        const s = err.response?.status;
        if (s === 401 || s === 403) {
          this.showSnackbar('Access denied — check admin account', 'error');
        } else if (s === 404) {
          this.subs = [];
        } else {
          console.warn('Subscriptions load failed:', err.message);
          this.showSnackbar('Could not load subscriptions', 'error');
          this.subs = [];
        }
      } finally {
        this.loading = false;
      }
    },

    async loadEstates() {
      try {
        const headers = await this.getAuthHeaders();
        const { data } = await axios.get(`${API}/admin/estates`, { headers });
        if (Array.isArray(data)) this.estates = data;
      } catch (e) {
        console.warn('Estates preload failed:', e.message);
      }
    },

    async loadPlans() {
      this.plansLoading = true;
      try {
        const headers = await this.getAuthHeaders();
        const { data, status } = await axios.get(
          `${API}/admin/subscription-plans`,
          { headers }
        );
        if (status === 200 && Array.isArray(data)) {
          this.plans = data;
        } else {
          this.plans = [];
        }
      } catch (err) {
        console.warn('Plans load failed:', err.message);
        this.plans = [];
      } finally {
        this.plansLoading = false;
      }
    },

    formatNum(n) {
      return numeral(n || 0).format('0,0');
    },
    formatNumShort(n) {
      const v = Number(n) || 0;
      if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
      if (v >= 1_000) return (v / 1_000).toFixed(0) + 'K';
      return numeral(v).format('0,0');
    },
    fmtDate(d) {
      if (!d) return '—';
      try {
        return new Date(d).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      } catch {
        return '—';
      }
    },
    nextBillingLabel(s) {
      if (s.status === 'Cancelled') return 'Cancelled';
      if (s.status === 'Expired') return 'Expired';
      if (s.status === 'Failed') return 'Payment failed';
      if (s.status === 'Pending') return 'Payment pending';
      if (!s.current_period_end) return '—';
      const days = Math.ceil(
        (new Date(s.current_period_end).getTime() - Date.now()) / 86400000
      );
      if (days < 0) return `Overdue by ${Math.abs(days)}d`;
      if (days === 0) return 'Due today';
      return `Due in ${days}d`;
    },
    initialsOf(name) {
      if (!name) return '?';
      return name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    },

    avatarClass(status) {
      const s = (status || '').toLowerCase();
      if (s === 'active') return 'avatar-active';
      if (s === 'pending') return 'avatar-pastdue';
      if (s === 'failed') return 'avatar-cancelled';
      if (s === 'expired') return 'avatar-pastdue';
      if (s === 'cancelled') return 'avatar-cancelled';
      if (s === 'notsubscribed') return 'avatar-notsubscribed';
      return 'avatar-paused';
    },
    statusClass(status) {
      const s = (status || '').toLowerCase().replace('_', '');
      return `status-${s}`;
    },
    cycleClass(cycle) {
      const c = (cycle || '').toLowerCase();
      return `cycle-${c}`;
    },

    clearFilters() {
      this.search = '';
      this.statusFilter = '';
    },

    openSub(s) {
      if (s.status === 'NotSubscribed') {
        this.createForEstate(s);
        return;
      }
    },
    editSub(s) {
      this.openMenuId = null;
      if (s.status === 'NotSubscribed') return;
      this.form = {
        estate_id: s.estate_id,
        plan_id: s.plan_id || '',
        start_date: s.current_period_start
          ? String(s.current_period_start).slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        end_date: s.current_period_end
          ? String(s.current_period_end).slice(0, 10)
          : '',
        amount_paid: s.amount || 0,
        payment_status: s.payment_status || 'Paid',
        payment_method: s.payment_method || 'Mpesa',
      };
      this.newDialog = true;
    },

    createForEstate(s) {
      this.openMenuId = null;
      this.form = {
        estate_id: s.estate_id,
        plan_id: '',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: '',
        amount_paid: 0,
        payment_status: 'Paid',
        payment_method: 'Mpesa',
      };
      this.newDialog = true;
    },

    toggleMenu(id) {
      this.openMenuId = this.openMenuId === id ? null : id;
    },
    closeMenuOnClickOutside() {
      this.openMenuId = null;
    },

    /* ============================================================
       STATUS CHANGE — dual response
       ============================================================ */
    async setStatus(s, status) {
      this.openMenuId = null;
      if (s.status === 'NotSubscribed') return;

      try {
        const headers = await this.getAuthHeaders();
        const { data, status: httpStatus } = await axios.post(
          `${API}/admin/subscriptions/${s.id}/status`,
          { status },
          { headers }
        );

        // Super admin: applied directly
        if (data?.direct === true || (httpStatus === 200 && !data?.queued)) {
          s.status = status;
          this.showSnackbar(`Subscription ${status.toLowerCase()}`, 'success');
        }
        // Support admin: queued
        else if (data?.queued === true) {
          this.showSnackbar(
            `Request #${data.request_id} sent to super admins`,
            'success'
          );
        }
        // Fallback: optimistic update on plain 200
        else if (httpStatus === 200) {
          s.status = status;
          this.showSnackbar(`Subscription ${status.toLowerCase()}`, 'success');
        }
      } catch (err) {
        console.warn('setStatus failed:', err.message);
        this.showSnackbar(
          err.response?.data?.error || 'Could not update status',
          'error'
        );
      }
    },

    openNewDialog() {
      this.submitting = false;
      this.form = {
        estate_id: '',
        plan_id: '',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: '',
        amount_paid: 0,
        payment_status: 'Paid',
        payment_method: 'Mpesa',
      };
      this.newDialog = true;
    },

    closeNewDialog() {
      this.form = {
        estate_id: '',
        plan_id: '',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: '',
        amount_paid: 0,
        payment_status: 'Paid',
        payment_method: 'Mpesa',
      };
      this.newDialog = false;
    },

    /* ============================================================
       SUBMIT NEW — dual response
       ============================================================ */
    async submitNew() {
      if (!this.canSubmit || this.submitting) return;
      this.submitting = true;
      try {
        const headers = await this.getAuthHeaders();
        const { data, status } = await axios.post(
          `${API}/admin/subscriptions`,
          {
            estate_id: this.form.estate_id,
            plan_id: this.form.plan_id,
            start_date: this.form.start_date,
            end_date: this.form.end_date || null,
            amount_paid: this.form.amount_paid,
            payment_status: this.form.payment_status,
            payment_method: this.form.payment_method,
            transaction_id: `ADMIN-${Date.now()}`,
            is_active: this.form.payment_status === 'Paid' ? 1 : 0,
          },
          { headers }
        );

        // Super admin: created immediately (201)
        if (data?.direct === true || (status === 201 && !data?.queued)) {
          this.closeNewDialog();
          this.$nextTick(() => {
            this.showSnackbar('Subscription saved', 'success');
          });
          await this.load();
        }
        // Support admin: queued for approval (202)
        else if (data?.queued === true || status === 202) {
          this.closeNewDialog();
          this.$nextTick(() => {
            this.showSnackbar(
              `Request #${data.request_id} sent to super admins`,
              'success'
            );
          });
        }
        // Fallback on plain 200
        else if (status === 200) {
          this.closeNewDialog();
          this.$nextTick(() => {
            this.showSnackbar('Subscription saved', 'success');
          });
          await this.load();
        }
      } catch (err) {
        console.warn('create subscription failed:', err.message);
        this.showSnackbar(
          err.response?.data?.error || 'Could not create subscription',
          'error'
        );
      } finally {
        this.submitting = false;
      }
    },

    // =========================================================
    // PLANS MANAGEMENT
    // =========================================================
    openPlansDialog() {
      this.plansDialog = true;
      this.resetPlanForm();
      this.loadPlans();
    },

    resetPlanForm() {
      this.planEdit = {
        plan_id: null,
        plan_name: '',
        min_households: 1,
        max_households: 100,
        monthly_rate: 100,
      };
    },

    editPlan(p) {
      this.planEdit = {
        plan_id: p.plan_id,
        plan_name: p.plan_name,
        min_households: Number(p.min_households),
        max_households:
          p.max_households == null ? null : Number(p.max_households),
        monthly_rate: Number(p.monthly_rate),
      };
    },

    /* ============================================================
       SAVE PLAN — dual response (create or update)
       ============================================================ */
    async savePlan() {
      if (!this.canSavePlan || this.savingPlan) return;
      this.savingPlan = true;
      try {
        const headers = await this.getAuthHeaders();
        const payload = {
          plan_name: this.planEdit.plan_name,
          min_households: Number(this.planEdit.min_households),
          max_households:
            this.planEdit.max_households === '' ||
            this.planEdit.max_households == null
              ? null
              : Number(this.planEdit.max_households),
          monthly_rate: Number(this.planEdit.monthly_rate),
        };

        let data, status;
        if (this.planEdit.plan_id) {
          ({ data, status } = await axios.patch(
            `${API}/admin/subscription-plans/${this.planEdit.plan_id}`,
            payload,
            { headers }
          ));
        } else {
          ({ data, status } = await axios.post(
            `${API}/admin/subscription-plans`,
            payload,
            { headers }
          ));
        }

        // Super admin: applied directly
        if (data?.direct === true || (status >= 200 && status < 300 && !data?.queued)) {
          this.showSnackbar(
            this.planEdit.plan_id ? 'Plan updated' : 'Plan created',
            'success'
          );
          this.resetPlanForm();
          await this.loadPlans();
          await this.load();
        }
        // Support admin: queued
        else if (data?.queued === true || status === 202) {
          this.showSnackbar(
            `Request #${data.request_id} sent to super admins`,
            'success'
          );
          this.resetPlanForm();
        }
      } catch (err) {
        console.error(err);
        this.showSnackbar(
          err.response?.data?.error || 'Could not save plan',
          'error'
        );
      } finally {
        this.savingPlan = false;
      }
    },

    /* ============================================================
       DELETE PLAN — dialog + dual response
       ============================================================ */
    askDeletePlan(p) {
      this.planToDelete = p;
      this.deletePlanDialog = true;
    },

    async confirmDeletePlan() {
      if (!this.planToDelete) return;
      const p = this.planToDelete;
      this.deletingPlan = true;

      try {
        const headers = await this.getAuthHeaders();
        const { data, status } = await axios.delete(
          `${API}/admin/subscription-plans/${p.plan_id}`,
          { headers }
        );

        // Super admin: deleted
        if (data?.direct === true || (status >= 200 && status < 300 && !data?.queued)) {
          this.showSnackbar('Plan deleted', 'success');
          await this.loadPlans();
        }
        // Support admin: queued
        else if (data?.queued === true || status === 202) {
          this.showSnackbar(
            `Request #${data.request_id} sent to super admins`,
            'success'
          );
        }
      } catch (err) {
        console.error(err);
        this.showSnackbar(
          err.response?.data?.error || 'Could not delete plan',
          'error'
        );
      } finally {
        this.deletingPlan = false;
        this.deletePlanDialog = false;
        this.planToDelete = null;
      }
    },

    showSnackbar(text, color = 'success') {
      this.snackbar = { show: true, text, color };
    },
  },
};
</script>

<style scoped>
/* ============================================================
   ROOT
   ============================================================ */
.subs-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* ============================================================
   PAGE HEADER
   ============================================================ */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 1.65rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.7px;
  margin: 0;
  line-height: 1.15;
}

.count-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(128, 81, 255, 0.12);
  color: #8051ff;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.3px;
}

.page-sub {
  font-size: 0.85rem;
  color: #64748b;
  margin: 6px 0 0;
  font-weight: 500;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.refresh-btn,
.manage-plans-btn {
  color: #475569 !important;
  font-weight: 700 !important;
  font-size: 0.72rem !important;
  letter-spacing: 0.8px !important;
  text-transform: uppercase !important;
}

.refresh-btn:hover,
.manage-plans-btn:hover {
  color: #0f0d24 !important;
  background: rgba(15, 13, 36, 0.05) !important;
}

.new-estate-btn {
  font-weight: 800 !important;
  font-size: 0.78rem !important;
  letter-spacing: 0.6px !important;
  text-transform: uppercase !important;
  box-shadow: 0 8px 20px -8px rgba(182, 255, 0, 0.65);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 18px !important;
}

.new-estate-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px -8px rgba(182, 255, 0, 0.8);
}

/* ============================================================
   SUPPORT NOTICE
   ============================================================ */
.support-notice {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(155, 108, 255, 0.08) 0%, rgba(128, 81, 255, 0.04) 100%);
  border: 1px solid rgba(128, 81, 255, 0.18);
  border-radius: 14px;
}

.support-notice-icon {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: rgba(128, 81, 255, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.support-notice-text {
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
  line-height: 1.5;
}

/* ============================================================
   SUMMARY GRID
   ============================================================ */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
  transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.22s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px -14px rgba(15, 13, 36, 0.14);
}

.summary-card-highlight {
  background: linear-gradient(140deg, #0a0a14 0%, #221047 55%, #2b1256 100%);
  border-color: transparent;
  box-shadow: 0 20px 40px -22px rgba(34, 16, 71, 0.55);
}

.summary-card-highlight .summary-label {
  color: rgba(255, 255, 255, 0.55);
}

.summary-card-highlight .summary-value {
  color: #ffffff;
}

.summary-card-highlight .currency {
  color: #b6ff00;
}

.summary-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.summary-icon-lime {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  box-shadow: 0 8px 20px -10px rgba(182, 255, 0, 0.7);
}

.summary-icon-amber {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 8px 20px -10px rgba(245, 158, 11, 0.6);
}

.summary-icon-red {
  background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
  box-shadow: 0 8px 20px -10px rgba(220, 38, 38, 0.6);
}

.summary-icon-white {
  background: #ffffff;
  box-shadow: 0 8px 20px -10px rgba(255, 255, 255, 0.5);
}

.summary-body { min-width: 0; }

.summary-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  margin-bottom: 5px;
}

.summary-value {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.8px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.currency {
  font-size: 0.72rem;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 0.4px;
}

/* ============================================================
   FILTERS
   ============================================================ */
.filters-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 16px;
  flex-wrap: wrap;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}

.search-wrap {
  position: relative;
  flex: 1;
  min-width: 220px;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 11px 36px 11px 38px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 0.85rem;
  font-weight: 500;
  color: #0f0d24;
  outline: none;
  transition: border-color 0.2s ease, background 0.2s ease;
  font-family: inherit;
}

.search-input::placeholder { color: #94a3b8; }
.search-input:focus { border-color: #8051ff; background: #ffffff; }

.search-clear {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 6px;
}

.search-clear:hover { color: #0f0d24; }

.filter-chips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-chip {
  padding: 7px 14px;
  border-radius: 999px;
  background: #f1f5f9;
  border: 1px solid transparent;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.filter-chip:hover { background: #e2e8f0; color: #0f0d24; }
.filter-chip-active { background: #0f0d24; color: #ffffff; border-color: #0f0d24; }

/* ============================================================
   LOADING / EMPTY
   ============================================================ */
.loading-block {
  padding: 8px;
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 18px;
}

.empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 24px;
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 18px;
  text-align: center;
}

.empty-icon {
  width: 84px;
  height: 84px;
  border-radius: 24px;
  background: rgba(128, 81, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.empty-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
}

.empty-text {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-top: 6px;
  max-width: 320px;
  line-height: 1.5;
}

.empty-create-btn,
.empty-clear-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 22px;
  padding: 11px 22px;
  border-radius: 999px;
  border: none;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  cursor: pointer;
  font-family: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.empty-create-btn {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  color: #0a0a14;
  box-shadow: 0 8px 20px -8px rgba(182, 255, 0, 0.6);
}

.empty-create-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 26px -10px rgba(182, 255, 0, 0.75);
}

.empty-clear-btn {
  background: transparent;
  color: #8051ff;
  border: 1px solid #e2e8f0;
  padding: 10px 20px;
}

.empty-clear-btn:hover {
  background: rgba(128, 81, 255, 0.06);
  border-color: #8051ff;
}

/* ============================================================
   TABLE
   ============================================================ */
.subs-card {
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}

.subs-header {
  display: flex;
  align-items: center;
  padding: 14px 22px;
  background: #f8fafc;
  border-bottom: 1px solid #e9edf3;
  font-size: 0.65rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.9px;
}

.col { padding: 0 8px; }
.col-estate { flex: 1 1 26%; min-width: 0; display: flex; align-items: center; gap: 12px; }
.col-plan { flex: 0 0 15%; min-width: 0; }
.col-cycle { flex: 0 0 10%; }
.col-period { flex: 0 0 16%; }
.col-amount { flex: 0 0 12%; }
.col-status { flex: 0 0 11%; }
.col-actions { flex: 0 0 5%; display: flex; justify-content: flex-end; }

.sub-row {
  display: flex;
  align-items: center;
  padding: 16px 22px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.15s ease;
}

.sub-row:last-child { border-bottom: none; }
.sub-row:hover { background: #fafbff; }

.estate-avatar {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.avatar-active {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 8px 20px -10px rgba(128, 81, 255, 0.65);
}

.avatar-pastdue {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 8px 20px -10px rgba(245, 158, 11, 0.55);
}

.avatar-cancelled {
  background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
  box-shadow: 0 8px 20px -10px rgba(220, 38, 38, 0.55);
}

.avatar-paused {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  box-shadow: 0 8px 20px -10px rgba(100, 116, 139, 0.5);
}

.avatar-notsubscribed {
  background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
  box-shadow: 0 8px 20px -10px rgba(148, 163, 184, 0.5);
}

.estate-info { min-width: 0; flex: 1; }

.estate-name {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.estate-urn {
  font-size: 0.68rem;
  color: #94a3b8;
  font-family: ui-monospace, SFMono-Regular, monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plan-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f0d24;
  letter-spacing: -0.2px;
}

.plan-name-empty {
  color: #94a3b8;
  font-weight: 600;
  font-style: italic;
}

.plan-meta {
  font-size: 0.68rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-top: 2px;
  font-weight: 700;
}

.cycle-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  background: rgba(148, 163, 184, 0.16);
  color: #475569;
}

.cycle-monthly { background: rgba(128, 81, 255, 0.1); color: #5b21b6; }
.cycle-quarterly { background: rgba(37, 99, 235, 0.1); color: #1d4ed8; }
.cycle-yearly { background: rgba(122, 184, 0, 0.14); color: #3f6b00; }
.cycle-custom { background: rgba(245, 158, 11, 0.14); color: #b45309; }

.period-main {
  font-size: 0.78rem;
  font-weight: 700;
  color: #334155;
}

.period-arrow {
  font-size: 0.7rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  font-weight: 500;
}

.amount-main {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f0d24;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.4px;
}

.amount-main-empty {
  color: #cbd5e1;
  font-weight: 700;
}

.currency-sm {
  font-size: 0.68rem;
  font-weight: 700;
  color: #94a3b8;
  margin-right: 3px;
}

.amount-meta {
  font-size: 0.68rem;
  color: #94a3b8;
  margin-top: 3px;
  font-weight: 600;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.status-active { background: rgba(122, 184, 0, 0.14); color: #3f6b00; }
.status-pending { background: rgba(245, 158, 11, 0.14); color: #b45309; }
.status-failed { background: rgba(239, 68, 68, 0.1); color: #b91c1c; }
.status-expired { background: rgba(245, 158, 11, 0.14); color: #b45309; }
.status-cancelled { background: rgba(239, 68, 68, 0.1); color: #b91c1c; }
.status-notsubscribed { background: rgba(148, 163, 184, 0.16); color: #64748b; }

.icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.icon-btn:hover { background: #f1f5f9; color: #0f0d24; }

.col-actions { position: relative; }

.row-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 6px;
  min-width: 220px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 20px 40px -16px rgba(15, 13, 36, 0.2);
  padding: 6px;
  z-index: 100;
}

.row-menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 9px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}

.row-menu-item:hover:not(:disabled) { background: #f1f5f9; color: #0f0d24; }
.row-menu-item:disabled { opacity: 0.4; cursor: not-allowed; }

.row-menu-item-success:hover { background: rgba(122, 184, 0, 0.1); color: #3f6b00; }
.row-menu-item-warn:hover { background: rgba(245, 158, 11, 0.1); color: #b45309; }
.row-menu-item-danger:hover { background: rgba(239, 68, 68, 0.08); color: #b91c1c; }

.menu-tag {
  margin-left: auto;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background: rgba(128, 81, 255, 0.12);
  color: #6d28d9;
}

.menu-tag-danger {
  background: rgba(220, 38, 38, 0.12);
  color: #b91c1c;
}

.row-menu-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 4px 6px;
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.menu-fade-enter,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ============================================================
   DIALOG
   ============================================================ */
::v-deep .sub-dialog-content {
  overflow: visible !important;
  border-radius: 20px !important;
  margin: 16px auto !important;
  max-width: 640px !important;
  width: calc(100% - 32px) !important;
  max-height: calc(100vh - 32px) !important;
  display: flex !important;
  flex-direction: column !important;
}

.sub-dialog-card {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  min-height: 0;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  width: 100%;
}

.sub-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #0f0d24 0%, #2b1256 100%);
  color: white;
  flex-shrink: 0;
}

.sub-dialog-title {
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.sub-dialog-sub {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.65);
  margin-top: 3px;
}

.sub-dialog-close {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.sub-dialog-close:hover { background: rgba(255, 255, 255, 0.2); }

.sub-dialog-body {
  padding: 22px 24px;
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-label {
  font-size: 0.7rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.form-input {
  padding: 11px 14px;
  border-radius: 11px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 0.88rem;
  font-weight: 500;
  color: #0f0d24;
  outline: none;
  transition: border-color 0.2s ease, background 0.2s ease;
  font-family: inherit;
  width: 100%;
}

.form-input:focus {
  border-color: #8051ff;
  background: #ffffff;
}

.form-hint {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 600;
  margin-top: 4px;
}

.form-hint-warn {
  color: #b45309;
}

.form-hint-info {
  color: #6d28d9;
  background: rgba(128, 81, 255, 0.06);
  border: 1px solid rgba(128, 81, 255, 0.18);
  border-radius: 10px;
  padding: 10px 12px;
  margin-top: 4px;
}

.sub-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 20px;
  border-top: 1px solid #f1f5f9;
  background: #ffffff;
  flex-shrink: 0;
}

.dialog-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 20px;
  border-radius: 11px;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: all 0.2s ease;
}

.dialog-btn-ghost { background: transparent; color: #64748b; }
.dialog-btn-ghost:hover { background: #f1f5f9; color: #0f0d24; }

.dialog-btn-primary {
  background: linear-gradient(135deg, #8051ff 0%, #9b6cff 100%);
  color: white;
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.7);
}

.dialog-btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px -10px rgba(128, 81, 255, 0.85);
}

.dialog-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.spin { animation: spin 1s linear infinite; }

@keyframes spin { to { transform: rotate(360deg); } }

/* ============================================================
   PLAN MANAGEMENT
   ============================================================ */
.plan-form {
  background: #fafaff;
  border: 1px solid #e9e7f2;
  border-radius: 14px;
  padding: 16px;
}

.plan-form-title {
  font-size: 0.72rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 14px;
}

.plan-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.plan-list-title {
  font-size: 0.72rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 10px;
}

.plan-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.plan-loading {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.plan-empty {
  text-align: center;
  padding: 24px;
  color: #94a3b8;
  font-size: 0.82rem;
  font-style: italic;
  background: #f8fafc;
  border: 1px dashed #e2e8f0;
  border-radius: 12px;
}

.plan-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 12px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.plan-item:hover {
  border-color: #c7b8ff;
  box-shadow: 0 8px 20px -14px rgba(128, 81, 255, 0.4);
}

.plan-item-body {
  flex: 1;
  min-width: 0;
}

.plan-item-name {
  font-size: 0.85rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plan-item-meta {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 3px;
  font-weight: 600;
}

.plan-item-btn {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: transparent;
  border: 1px solid #e9edf3;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.plan-item-btn:hover {
  background: #f1f5f9;
  color: #0f0d24;
  border-color: #cbd5e1;
}

.plan-item-btn-danger:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

/* ============================================================
   CONFIRM DIALOG (delete plan)
   ============================================================ */
.confirm-card {
  padding: 28px 26px 22px;
  background: #ffffff;
  border-radius: 22px;
  display: flex;
  flex-direction: column;
}

.confirm-icon {
  width: 52px;
  height: 52px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.confirm-icon-danger {
  background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
  box-shadow: 0 12px 26px -12px rgba(220, 38, 38, 0.7);
}

.confirm-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
  margin-bottom: 8px;
}

.confirm-text {
  font-size: 0.85rem;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 18px;
}

.confirm-plan-preview {
  padding: 12px 14px;
  background: #fafaff;
  border: 1px solid #f0eef8;
  border-radius: 12px;
  margin-bottom: 22px;
}

.confirm-plan-name {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f0d24;
}

.confirm-plan-meta {
  font-size: 0.74rem;
  color: #94a3b8;
  margin-top: 3px;
  font-weight: 600;
}

.confirm-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 14px;
  border-radius: 12px;
  border: none;
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn-ghost {
  background: #f6f7fb;
  color: #475569;
  border: 1px solid #eef1f6;
}

.action-btn-ghost:hover:not(:disabled) {
  background: #eef1f6;
}

.action-btn-danger {
  background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
  color: #ffffff;
  box-shadow: 0 12px 26px -14px rgba(220, 38, 38, 0.8);
}

.action-btn-danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px -14px rgba(220, 38, 38, 1);
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 1024px) {
  .col-plan, .col-cycle { display: none; }
  .col-estate { flex: 1 1 40%; }
  .col-period { flex: 0 0 22%; }
  .col-amount { flex: 0 0 18%; }
  .col-status { flex: 0 0 15%; }
}

@media (max-width: 767px) {
  .subs-page { gap: 18px; }
  .page-title { font-size: 1.35rem; }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }

  .page-actions {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .manage-plans-btn,
  .refresh-btn {
    width: 100%;
    margin: 0 !important;
    min-width: 0 !important;
    padding: 0 8px !important;
    font-size: 0.68rem !important;
    letter-spacing: 0.5px !important;
  }

  .new-estate-btn {
    grid-column: 1 / -1;
    width: 100%;
    margin: 0 !important;
    min-width: 0 !important;
    padding: 0 14px !important;
    font-size: 0.74rem !important;
  }

  .new-estate-btn span {
    white-space: nowrap;
    overflow: visible;
  }

  .support-notice {
    padding: 10px 12px;
    gap: 10px;
  }
  .support-notice-text { font-size: 0.76rem; }

  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .summary-card { padding: 14px 16px; gap: 10px; }
  .summary-icon { width: 36px; height: 36px; }
  .summary-value { font-size: 1.15rem; }

  .filters-card {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .search-wrap { min-width: 0; }

  .subs-header { display: none; }
  .sub-row { flex-wrap: wrap; padding: 14px 16px; gap: 10px; }
  .col-estate { flex: 1 1 100%; }
  .col-period, .col-amount, .col-status { flex: 0 0 auto; }
  .col-actions { margin-left: auto; }
  .col-plan, .col-cycle { display: none; }

  .form-grid { grid-template-columns: 1fr; }

  .confirm-card { padding: 22px 20px 18px; }
}
</style>