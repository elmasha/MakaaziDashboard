<template>
  <div class="approvals-page">
    <!-- ============================================================
         ACCESS GATE — only super admins may see the queue
         ============================================================ -->
    <div v-if="!roleReady" class="gate-state">
      <v-progress-circular indeterminate color="#8051FF" size="42" />
      <div class="gate-sub">Checking access…</div>
    </div>

    <div v-else-if="!isSuperAdmin" class="no-access">
      <div class="no-access-icon">
        <v-icon size="48" color="#8051FF">mdi-lock-outline</v-icon>
      </div>
      <div class="no-access-title">Super admin access required</div>
      <div class="no-access-text">
        You don't have permission to view the approval queue. Ask a super admin
        if you think this is a mistake.
      </div>
      <button class="no-access-btn" @click="$router.push('/admin')">
        <v-icon size="16" class="mr-1">mdi-arrow-left</v-icon>
        Back to dashboard
      </button>
    </div>

    <!-- ============================================================
         FULL PAGE — visible only to super admins
         ============================================================ -->
    <template v-else>
      <!-- PAGE HEADER -->
      <div class="page-header">
        <div>
          <div class="page-title-row">
            <h1 class="page-title">Approvals</h1>
            <div class="count-pill">{{ filteredItems.length }}</div>
          </div>
          <p class="page-sub">
            {{ items.length }} total · {{ pendingCount }} pending ·
            {{ approvedCount }} approved · {{ rejectedCount }} rejected
          </p>
        </div>
        <div class="page-actions">
          <v-btn
            text
            rounded
            class="text-capitalize refresh-btn"
            :loading="loading"
            @click="fetchQueue"
          >
            <v-icon left small>mdi-refresh</v-icon>
            Refresh
          </v-btn>
        </div>
      </div>

      <!-- SUMMARY CARDS -->
      <div class="summary-grid">
        <div class="summary-card summary-card-highlight">
          <div class="summary-icon summary-icon-white">
            <v-icon size="18" color="#0A0A14">mdi-clock-outline</v-icon>
          </div>
          <div class="summary-body">
            <div class="summary-label">Pending</div>
            <div class="summary-value">{{ pendingCount }}</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon summary-icon-lime">
            <v-icon size="18" color="#0A0A14">mdi-check-circle-outline</v-icon>
          </div>
          <div class="summary-body">
            <div class="summary-label">Approved</div>
            <div class="summary-value">{{ approvedCount }}</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon summary-icon-amber">
            <v-icon size="18" color="white">mdi-close-circle-outline</v-icon>
          </div>
          <div class="summary-body">
            <div class="summary-label">Rejected</div>
            <div class="summary-value">{{ rejectedCount }}</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon summary-icon-purple">
            <v-icon size="18" color="white">mdi-clipboard-list-outline</v-icon>
          </div>
          <div class="summary-body">
            <div class="summary-label">Total</div>
            <div class="summary-value">{{ items.length }}</div>
          </div>
        </div>
      </div>

      <!-- FILTERS -->
      <div class="filters-card">
        <div class="search-wrap">
          <v-icon size="18" class="search-icon">mdi-magnify</v-icon>
          <input
            v-model="search"
            class="search-input"
            type="text"
            placeholder="Search by summary, requester, reference, or operation"
          />
          <button v-if="search" class="search-clear" @click="search = ''">
            <v-icon size="16">mdi-close-circle</v-icon>
          </button>
        </div>

        <select v-model="operationFilter" class="filter-select">
          <option value="">All operations</option>
          <option value="estate.create">Estate — create</option>
          <option value="estate.update">Estate — update</option>
          <option value="estate.delete">Estate — delete</option>
          <option value="estate.address_config">Estate — address config</option>
          <option value="admin.create">Admin — add</option>
          <option value="admin.update">Admin — update</option>
          <option value="admin.delete">Admin — remove</option>
          <option value="subscription.upsert">Subscription — upsert</option>
          <option value="subscription.status">Subscription — status</option>
          <option value="plan.create">Plan — create</option>
          <option value="plan.update">Plan — update</option>
          <option value="plan.delete">Plan — delete</option>
          <option value="official.create">Official — create</option>
          <option value="official.update">Official — update</option>
          <option value="official.delete">Official — remove</option>
          <option value="charge.add">Charge — add</option>
          <option value="charge.delete">Charge — remove</option>
        </select>

        <div class="filter-chips">
          <button
            v-for="s in statusOptions"
            :key="s.value"
            class="filter-chip"
            :class="{ 'filter-chip-active': statusFilter === s.value }"
            @click="setStatus(s.value)"
          >
            {{ s.label }}
            <span v-if="s.value === 'Pending' && pendingCount > 0" class="chip-count">
              {{ pendingCount }}
            </span>
          </button>
        </div>
      </div>

      <!-- LOADING / EMPTY / LIST -->
      <div v-if="loading && !items.length" class="loading-block">
        <v-skeleton-loader
          type="list-item-avatar-three-line, list-item-avatar-three-line, list-item-avatar-three-line"
        />
      </div>

      <div v-else-if="!filteredItems.length" class="empty-card">
        <div class="empty-icon">
          <v-icon size="44" color="#8051FF">
            {{ hasActiveFilters ? 'mdi-filter-off' : 'mdi-shield-check-outline' }}
          </v-icon>
        </div>
        <div class="empty-title">
          {{ hasActiveFilters ? 'No matching requests' : 'All caught up' }}
        </div>
        <div class="empty-text">
          {{ hasActiveFilters
            ? 'Try clearing the filters or searching for something else.'
            : statusFilter === 'Pending'
              ? 'No pending requests waiting for approval.'
              : `No ${statusFilter.toLowerCase()} requests to show.` }}
        </div>
        <button
          v-if="hasActiveFilters"
          class="empty-clear-btn"
          @click="clearFilters"
        >
          <v-icon size="16" class="mr-1">mdi-close</v-icon>
          Clear filters
        </button>
      </div>

      <div v-else class="approvals-card">
        <div
          v-for="item in filteredItems"
          :key="item.reference"
          :ref="'row-' + item.reference"
          class="approval-row"
          :class="{ 'approval-row-focus': isFocused(item) }"
          role="button"
          tabindex="0"
          @click="openRow(item)"
          @keydown.enter="openRow(item)"
          @keydown.space.prevent="openRow(item)"
        >
          <!-- Op icon -->
          <div class="approval-icon" :class="opClass(item.operation)">
            <v-icon size="20" color="white">{{ opIcon(item.operation) }}</v-icon>
          </div>

          <!-- Body -->
          <div class="approval-body">
            <div class="approval-title-row">
              <span class="approval-summary">{{ item.summary }}</span>
              <span class="op-pill" :class="opClass(item.operation)">
                {{ prettyOp(item.operation) }}
              </span>
              <span
                v-if="item.status !== 'Pending'"
                class="status-pill"
                :class="`status-${item.status.toLowerCase()}`"
              >
                {{ item.status }}
              </span>
            </div>
            <div class="approval-meta">
              <span class="meta-item mono">
                <v-icon size="12">mdi-pound</v-icon>
                {{ item.reference }}
              </span>
              <span class="meta-dot">·</span>
              <span class="meta-item">
                <v-icon size="12">mdi-account-outline</v-icon>
                {{ item.requested_email }}
              </span>
              <span v-if="item.target_id" class="meta-dot">·</span>
              <span v-if="item.target_id" class="meta-item mono">
                <v-icon size="12">mdi-tag-outline</v-icon>
                #{{ item.target_id }}
              </span>
              <span class="meta-dot">·</span>
              <span class="meta-item">
                <v-icon size="12">mdi-clock-outline</v-icon>
                {{ relativeTime(item.created_at) }}
              </span>
              <template v-if="item.reviewed_email">
                <span class="meta-dot">·</span>
                <span class="meta-item">
                  <v-icon size="12">mdi-check-decagram-outline</v-icon>
                  by {{ item.reviewed_email }}
                </span>
              </template>
            </div>
          </div>

          <!-- Right: actions or status -->
          <div class="approval-right" @click.stop>
            <template v-if="item.status === 'Pending'">
              <button
                class="row-btn row-btn-ghost"
                :disabled="busyId === item.id"
                title="View payload"
                @click="openDetails(item)"
              >
                <v-icon size="16">mdi-code-json</v-icon>
              </button>
              <button
                class="row-btn row-btn-reject"
                :disabled="busyId === item.id"
                @click="openReject(item)"
              >
                <v-icon size="14" class="mr-1">mdi-close</v-icon>
                Reject
              </button>
              <button
                class="row-btn row-btn-approve"
                :disabled="busyId === item.id"
                @click="approve(item)"
              >
                <v-icon size="14" class="mr-1">
                  {{ busyId === item.id ? 'mdi-loading' : 'mdi-check' }}
                </v-icon>
                {{ busyId === item.id ? 'Approving…' : 'Approve' }}
              </button>
            </template>

            <template v-else>
              <button
                class="row-btn row-btn-ghost"
                title="View payload"
                @click="openDetails(item)"
              >
                <v-icon size="16">mdi-code-json</v-icon>
              </button>
              <span class="status-stamp" :class="`stamp-${item.status.toLowerCase()}`">
                <v-icon size="14" class="mr-1">
                  {{ item.status === 'Approved' ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
                {{ item.status }}
              </span>
            </template>
          </div>

          <!-- Click-to-open chevron -->
          <v-icon size="20" class="approval-chevron">mdi-chevron-right</v-icon>
        </div>
      </div>

      <!-- ============================================================
           DETAIL DIALOG
           ============================================================ -->
      <v-dialog
        v-model="detailDialog"
        max-width="620"
        content-class="approval-dialog-content"
        @keydown.esc="closeDetail"
        @click:outside="closeDetail"
      >
        <div v-if="selected" class="detail-card">
          <div class="detail-header">
            <div class="detail-icon" :class="opClass(selected.operation)">
              <v-icon size="20" color="white">{{ opIcon(selected.operation) }}</v-icon>
            </div>
            <div class="detail-header-text">
              <div class="detail-title">{{ selected.summary }}</div>
              <div class="detail-sub">
                <span class="op-pill" :class="opClass(selected.operation)">
                  {{ prettyOp(selected.operation) }}
                </span>
              </div>
            </div>
            <button
              type="button"
              class="detail-close"
              aria-label="Close"
              @click="closeDetail"
            >
              <v-icon size="18">mdi-close</v-icon>
            </button>
          </div>

          <div class="detail-body">
            <div class="detail-row">
              <span class="detail-key">Reference</span>
              <span class="detail-val mono">{{ selected.reference }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-key">Status</span>
              <span class="status-pill" :class="`status-${selected.status.toLowerCase()}`">
                {{ selected.status }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-key">Requested by</span>
              <span class="detail-val">{{ selected.requested_email }}</span>
            </div>
            <div v-if="selected.target_id" class="detail-row">
              <span class="detail-key">Target ID</span>
              <span class="detail-val mono">#{{ selected.target_id }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-key">Created</span>
              <span class="detail-val">{{ fmtDateTime(selected.created_at) }}</span>
            </div>
            <div v-if="selected.reviewed_email" class="detail-row">
              <span class="detail-key">Reviewed by</span>
              <span class="detail-val">{{ selected.reviewed_email }}</span>
            </div>
            <div v-if="selected.reviewed_at" class="detail-row">
              <span class="detail-key">Reviewed at</span>
              <span class="detail-val">{{ fmtDateTime(selected.reviewed_at) }}</span>
            </div>

            <div
              v-if="selected.status === 'Rejected' && selected.rejection_reason"
              class="detail-reject-reason"
            >
              <v-icon size="14" color="#B91C1C" class="mr-1">mdi-information-outline</v-icon>
              <span><strong>Reason:</strong> {{ selected.rejection_reason }}</span>
            </div>

            <div class="detail-payload-block">
              <div class="detail-payload-label">
                <v-icon size="14" class="mr-1">mdi-code-json</v-icon>
                Payload
              </div>
              <pre class="detail-pre">{{ prettyPayload(selected.payload) }}</pre>
            </div>
          </div>

          <div class="detail-actions">
            <button
              type="button"
              class="detail-btn-ghost"
              @click="closeDetail"
            >
              Close
            </button>
            <template v-if="selected.status === 'Pending'">
              <button
                type="button"
                class="detail-btn-reject"
                :disabled="busyId === selected.id"
                @click="openRejectFromDetail"
              >
                <v-icon size="14" class="mr-1">mdi-close</v-icon>
                Reject
              </button>
              <button
                type="button"
                class="detail-btn-approve"
                :disabled="busyId === selected.id"
                @click="approveFromDetail"
              >
                <v-icon size="14" class="mr-1">
                  {{ busyId === selected.id ? 'mdi-loading' : 'mdi-check' }}
                </v-icon>
                {{ busyId === selected.id ? 'Approving…' : 'Approve' }}
              </button>
            </template>
          </div>
        </div>
      </v-dialog>

      <!-- ============================================================
           REJECT DIALOG  (no longer `persistent` — ESC & outside-click work)
           ============================================================ -->
      <v-dialog
        v-model="rejectDialog"
        max-width="440"
        @keydown.esc="closeReject"
        @click:outside="closeReject"
      >
        <div class="reject-card">
          <div class="reject-header">
            <div class="reject-icon">
              <v-icon size="22" color="white">mdi-close-circle</v-icon>
            </div>
            <div>
              <div class="reject-title">Reject this request?</div>
              <div class="reject-sub">
                The requester will be notified with your reason.
              </div>
            </div>
          </div>

          <div v-if="currentReject" class="reject-preview">
            <span class="op-pill" :class="opClass(currentReject.operation)">
              {{ prettyOp(currentReject.operation) }}
            </span>
            <div class="reject-preview-summary">{{ currentReject.summary }}</div>
            <div class="reject-preview-ref">{{ currentReject.reference }}</div>
          </div>

          <label class="reject-label">Reason (optional)</label>
          <textarea
            v-model="rejectReason"
            rows="4"
            class="reject-textarea"
            placeholder="e.g. Duplicate URN, wrong plan tier, missing config…"
          ></textarea>

          <div class="reject-actions">
            <button
              type="button"
              class="reject-btn-cancel"
              :disabled="rejecting"
              @click="closeReject"
            >
              Cancel
            </button>
            <button
              type="button"
              class="reject-btn-proceed"
              :disabled="rejecting"
              @click="confirmReject"
            >
              <v-icon size="14" class="mr-1">
                {{ rejecting ? 'mdi-loading' : 'mdi-close' }}
              </v-icon>
              {{ rejecting ? 'Rejecting…' : 'Reject request' }}
            </button>
          </div>
        </div>
      </v-dialog>

      <!-- Snackbar -->
      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        :timeout="3000"
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
    </template>
  </div>
</template>

<script>
import axios from 'axios';

const API = 'https://makaaziserver22.up.railway.app/api';

export default {
  name: 'AdminApprove',
  layout: 'admin',

  data() {
    return {
      // Access gate
      adminRole: null,
      roleReady: false,

      // Data
      loading: true,
      items: [],
      search: '',
      statusFilter: 'Pending',
      operationFilter: '',
      busyId: null,

      statusOptions: [
        { label: 'All',      value: '' },
        { label: 'Pending',  value: 'Pending' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Rejected', value: 'Rejected' },
      ],

      // Detail modal
      detailDialog: false,
      selected: null,

      // Reject flow
      rejectDialog: false,
      rejectReason: '',
      rejecting: false,
      currentReject: null,

      // Deep-link focus
      focusedRef: null,

      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    isSuperAdmin() {
      return this.adminRole === 'super';
    },
    pendingCount() {
      return this.items.filter((i) => i.status === 'Pending').length;
    },
    approvedCount() {
      return this.items.filter((i) => i.status === 'Approved').length;
    },
    rejectedCount() {
      return this.items.filter((i) => i.status === 'Rejected').length;
    },
    hasActiveFilters() {
      return !!(this.search || this.statusFilter || this.operationFilter);
    },
    filteredItems() {
      const q = this.search.trim().toLowerCase();
      return this.items.filter((i) => {
        if (this.statusFilter && i.status !== this.statusFilter) return false;
        if (this.operationFilter && i.operation !== this.operationFilter) return false;
        if (!q) return true;
        return (
          (i.summary || '').toLowerCase().includes(q) ||
          (i.requested_email || '').toLowerCase().includes(q) ||
          (i.operation || '').toLowerCase().includes(q) ||
          (i.reviewed_email || '').toLowerCase().includes(q) ||
          (i.reference || '').toLowerCase().includes(q)
        );
      });
    },
  },

  mounted() {
    try {
      this.adminRole = localStorage.getItem('admin_role') || null;
    } catch (e) {
      console.warn('[Approve] localStorage read failed:', e.message);
    }
    this.roleReady = true;

    if (this.isSuperAdmin) {
      this.focusedRef = this.$route.params.ref || null;
      this.fetchQueue();
    } else {
      this.loading = false;
    }
  },

  methods: {
    async getAuthHeaders() {
      try {
        const user = this.$fire?.auth?.currentUser;
        if (!user) return {};
        const token = await user.getIdToken();
        return { Authorization: `Bearer ${token}` };
      } catch (e) {
        console.warn('[Approve] getIdToken failed:', e.message);
        return {};
      }
    },

    async fetchQueue() {
      this.loading = true;
      try {
        const headers = await this.getAuthHeaders();
        const params = {};
        if (this.operationFilter) params.operation = this.operationFilter;

        const { data } = await axios.get(`${API}/admin/approvals`, { headers, params });
        this.items = Array.isArray(data) ? data : [];
      } catch (err) {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          this.$router.push('/admin/login');
          return;
        }
        console.warn('[Approve] fetch failed:', err.message);
        this.items = [];
        this.showSnackbar(err.response?.data?.error || 'Failed to load queue', 'error');
      } finally {
        this.loading = false;
        this.$nextTick(this.scrollToFocused);
      }
    },

    scrollToFocused() {
      if (!this.focusedRef) return;
      const el = this.$refs['row-' + this.focusedRef];
      const node = Array.isArray(el) ? el[0] : el;
      const target = node?.$el || node;
      if (target?.scrollIntoView) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },

    setStatus(val) {
      if (this.statusFilter === val) return;
      this.statusFilter = val;
    },

    clearFilters() {
      this.search = '';
      this.statusFilter = '';
      this.operationFilter = '';
    },

    isFocused(item) {
      return this.focusedRef && item.reference === this.focusedRef;
    },

    /* ============================================================
       ROW CLICK → open the single-request page
       ============================================================ */
    openRow(item) {
      if (!item?.reference) return;
      const path = `/admin/approve/${item.reference}`;
      if (this.$route.path === path) return;

      const result = this.$router.push(path);
      if (result && typeof result.catch === 'function') {
        result.catch((err) => {
          if (err && err.name !== 'NavigationDuplicated') {
            console.error('Nav error:', err);
          }
        });
      }
    },

    /* ============================================================
       DIALOG OPEN / CLOSE — all close paths converge here
       ============================================================ */
    openDetails(item) {
      this.selected = item;
      this.detailDialog = true;
    },

    closeDetail() {
      // Flip the model first so Vuetify starts the leave transition
      this.detailDialog = false;
      // Then clear the payload after the transition has had time to render
      this.$nextTick(() => {
        setTimeout(() => { this.selected = null; }, 250);
      });
    },

    openReject(item) {
      this.currentReject = item;
      this.rejectReason = '';
      this.rejectDialog = true;
    },

    closeReject() {
      if (this.rejecting) return; // don't allow closing mid-submit
      this.rejectDialog = false;
      this.$nextTick(() => {
        setTimeout(() => {
          this.currentReject = null;
          this.rejectReason = '';
        }, 250);
      });
    },

    /* ============================================================
       APPROVE
       ============================================================ */
    async approve(item) {
      this.busyId = item.id;
      try {
        const headers = await this.getAuthHeaders();
        await axios.post(`${API}/admin/approvals/${item.id}/approve`, {}, { headers });

        this.items = this.items.filter((i) => i.id !== item.id);
        this.showSnackbar(`Approved · ${this.prettyOp(item.operation)}`, 'success');

        if (this.focusedRef === item.reference) this.focusedRef = null;

        if (this.$nuxt && this.$nuxt.$emit) {
          this.$nuxt.$emit('approvals-changed');
        }
        return true;
      } catch (err) {
        console.error('[Approve] approve failed:', err);
        const msg = err.response?.data?.error || 'Approve failed';
        this.showSnackbar(msg, 'error');
        return false;
      } finally {
        this.busyId = null;
      }
    },

    async approveFromDetail() {
      if (!this.selected) return;
      const item = this.selected;
      const ok = await this.approve(item);
      // Close regardless of success so the user isn't stuck with a stale modal
      this.closeDetail();
    },

    openRejectFromDetail() {
      if (!this.selected) return;
      const item = this.selected;
      // Close the detail dialog first, then open reject after the leave transition
      this.detailDialog = false;
      this.$nextTick(() => {
        setTimeout(() => {
          this.selected = null;
          this.openReject(item);
        }, 250);
      });
    },

    /* ============================================================
       REJECT
       ============================================================ */
    async confirmReject() {
      if (!this.currentReject) return;
      this.rejecting = true;
      try {
        const headers = await this.getAuthHeaders();
        await axios.post(
          `${API}/admin/approvals/${this.currentReject.id}/reject`,
          { reason: this.rejectReason },
          { headers }
        );

        this.items = this.items.filter((i) => i.id !== this.currentReject.id);
        this.showSnackbar('Request rejected', 'success');

        if (this.focusedRef === this.currentReject.reference) this.focusedRef = null;

        // Close via the standard close path so state is cleaned up consistently
        this.rejecting = false;
        this.closeReject();

        if (this.$nuxt && this.$nuxt.$emit) {
          this.$nuxt.$emit('approvals-changed');
        }
      } catch (err) {
        console.error('[Approve] reject failed:', err);
        this.showSnackbar(err.response?.data?.error || 'Reject failed', 'error');
        this.rejecting = false;
      }
    },

    /* ============================================================
       Display helpers
       ============================================================ */
    prettyOp(op) {
      const map = {
        'estate.create':         'Create estate',
        'estate.update':         'Update estate',
        'estate.delete':         'Delete estate',
        'estate.address_config': 'Address config',
        'admin.create':          'Add admin',
        'admin.update':          'Update admin',
        'admin.delete':          'Remove admin',
        'subscription.upsert':   'Subscription',
        'subscription.status':   'Sub status',
        'plan.create':           'New plan',
        'plan.update':           'Update plan',
        'plan.delete':           'Delete plan',
        'official.create':       'New official',
        'official.update':       'Update official',
        'official.delete':       'Remove official',
        'charge.add':            'Add charge',
        'charge.delete':         'Remove charge',
      };
      return map[op] || op;
    },

    opClass(op) {
      if (op.startsWith('estate.'))       return 'op-estate';
      if (op.startsWith('admin.'))        return 'op-admin';
      if (op.startsWith('plan.') || op.startsWith('subscription.')) return 'op-billing';
      if (op.startsWith('official.') || op.startsWith('charge.'))   return 'op-official';
      return 'op-default';
    },

    opIcon(op) {
      if (op.startsWith('estate.'))       return 'mdi-office-building-outline';
      if (op.startsWith('admin.'))        return 'mdi-shield-account-outline';
      if (op.startsWith('plan.'))         return 'mdi-credit-card-outline';
      if (op.startsWith('subscription.')) return 'mdi-credit-card-sync-outline';
      if (op.startsWith('official.'))     return 'mdi-badge-account-outline';
      if (op.startsWith('charge.'))       return 'mdi-cash-multiple';
      return 'mdi-help-circle-outline';
    },

    prettyPayload(p) {
      try {
        const obj = typeof p === 'string' ? JSON.parse(p) : p;
        return JSON.stringify(obj, null, 2);
      } catch {
        return String(p);
      }
    },

    fmtDateTime(d) {
      if (!d) return '—';
      try {
        return new Date(d).toLocaleString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        });
      } catch { return '—'; }
    },

    relativeTime(d) {
      if (!d) return '—';
      const t = new Date(d).getTime();
      const now = Date.now();
      const diff = Math.max(0, now - t);

      const sec = Math.floor(diff / 1000);
      if (sec < 60) return 'just now';
      const min = Math.floor(sec / 60);
      if (min < 60) return `${min}m ago`;
      const hr = Math.floor(min / 60);
      if (hr < 24) return `${hr}h ago`;
      const day = Math.floor(hr / 24);
      if (day < 7) return `${day}d ago`;

      return new Date(d).toLocaleString('en-GB', {
        day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit',
      });
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
.approvals-page { display: flex; flex-direction: column; gap: 22px; }

/* ============================================================
   ACCESS GATE
   ============================================================ */
.gate-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 100px 24px; text-align: center;
}
.gate-sub { font-size: 0.82rem; color: #94a3b8; margin-top: 14px; font-weight: 500; }

.no-access {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 80px 24px; text-align: center;
  background: #ffffff; border: 1px solid #e9edf3; border-radius: 18px;
  margin-top: 12px; box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}
.no-access-icon {
  width: 84px; height: 84px; border-radius: 24px;
  background: rgba(128, 81, 255, 0.08);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 18px;
}
.no-access-title {
  font-size: 1.1rem; font-weight: 800; color: #0f0d24; letter-spacing: -0.3px;
}
.no-access-text {
  font-size: 0.85rem; color: #94a3b8; margin-top: 6px;
  max-width: 360px; line-height: 1.6;
}
.no-access-btn {
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 22px; padding: 11px 22px; border-radius: 999px;
  background: linear-gradient(135deg, #8051ff 0%, #9b6cff 100%);
  color: #ffffff; border: none; font-family: inherit;
  font-size: 0.8rem; font-weight: 800; letter-spacing: 0.4px;
  cursor: pointer;
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.7);
  transition: all 0.2s ease;
}
.no-access-btn:hover { transform: translateY(-1px); }

/* ============================================================
   PAGE HEADER
   ============================================================ */
.page-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; flex-wrap: wrap;
}
.page-title-row { display: flex; align-items: center; gap: 12px; }
.page-title {
  font-size: 1.65rem; font-weight: 800; color: #0f0d24;
  letter-spacing: -0.7px; margin: 0; line-height: 1.15;
}
.count-pill {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 28px; height: 24px; padding: 0 10px; border-radius: 999px;
  background: rgba(128, 81, 255, 0.12); color: #8051ff;
  font-size: 0.72rem; font-weight: 800;
}
.page-sub {
  font-size: 0.85rem; color: #64748b; margin: 6px 0 0; font-weight: 500;
}
.page-actions { display: flex; align-items: center; gap: 10px; }
.refresh-btn {
  color: #475569 !important; font-weight: 700 !important;
  font-size: 0.72rem !important; letter-spacing: 0.8px !important;
  text-transform: uppercase !important;
}
.refresh-btn:hover {
  color: #0f0d24 !important; background: rgba(15, 13, 36, 0.05) !important;
}

/* ============================================================
   SUMMARY CARDS
   ============================================================ */
.summary-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
}
.summary-card {
  display: flex; align-items: center; gap: 14px;
  padding: 18px 20px; background: #ffffff; border: 1px solid #e9edf3;
  border-radius: 16px; box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
  transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.22s ease;
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
.summary-card-highlight .summary-label { color: rgba(255, 255, 255, 0.55); }
.summary-card-highlight .summary-value { color: #ffffff; }
.summary-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.summary-icon-purple {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 8px 20px -10px rgba(128, 81, 255, 0.65);
}
.summary-icon-lime {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  box-shadow: 0 8px 20px -10px rgba(182, 255, 0, 0.7);
}
.summary-icon-amber {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 8px 20px -10px rgba(245, 158, 11, 0.6);
}
.summary-icon-white {
  background: #ffffff; box-shadow: 0 8px 20px -10px rgba(255, 255, 255, 0.5);
}
.summary-body { min-width: 0; }
.summary-label {
  font-size: 0.68rem; font-weight: 800; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.9px; margin-bottom: 5px;
}
.summary-value {
  font-size: 1.4rem; font-weight: 800; color: #0f0d24;
  letter-spacing: -0.8px; line-height: 1; font-variant-numeric: tabular-nums;
}

/* ============================================================
   FILTERS
   ============================================================ */
.filters-card {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 14px 18px; background: #ffffff;
  border: 1px solid #e9edf3; border-radius: 16px; flex-wrap: wrap;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}
.search-wrap {
  position: relative; flex: 1; min-width: 220px;
  display: flex; align-items: center;
}
.search-icon { position: absolute; left: 12px; color: #94a3b8; pointer-events: none; }
.search-input {
  width: 100%; padding: 11px 36px 11px 38px; border-radius: 12px;
  border: 1px solid #e2e8f0; background: #f8fafc; font-size: 0.85rem;
  font-weight: 500; color: #0f0d24; outline: none; font-family: inherit;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.search-input::placeholder { color: #94a3b8; }
.search-input:focus { border-color: #8051ff; background: #ffffff; }
.search-clear {
  position: absolute; right: 10px; background: none; border: none;
  cursor: pointer; color: #94a3b8; display: flex; align-items: center;
  justify-content: center; padding: 4px;
}
.search-clear:hover { color: #0f0d24; }

.filter-select {
  padding: 11px 14px; border-radius: 12px; border: 1px solid #e2e8f0;
  background: #f8fafc; font-size: 0.82rem; font-weight: 600;
  color: #0f0d24; outline: none; font-family: inherit; cursor: pointer;
  min-width: 180px;
}
.filter-select:focus { border-color: #8051ff; background: #ffffff; }

.filter-chips { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.filter-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 999px; background: #f1f5f9;
  border: 1px solid transparent; color: #475569; font-size: 0.78rem;
  font-weight: 700; cursor: pointer; font-family: inherit;
  transition: all 0.2s ease;
}
.filter-chip:hover { background: #e2e8f0; color: #0f0d24; }
.filter-chip-active { background: #0f0d24; color: #ffffff; border-color: #0f0d24; }
.filter-chip-active:hover { background: #0f0d24; color: #ffffff; }

.chip-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  font-size: 0.62rem; font-weight: 800;
}
.filter-chip:not(.filter-chip-active) .chip-count {
  background: rgba(220, 38, 38, 0.12);
  color: #b91c1c;
}

/* ============================================================
   LOADING / EMPTY
   ============================================================ */
.loading-block {
  padding: 8px; background: #ffffff; border: 1px solid #e9edf3; border-radius: 18px;
}
.empty-card {
  display: flex; flex-direction: column; align-items: center;
  padding: 64px 24px; background: #ffffff; border: 1px solid #e9edf3;
  border-radius: 18px; text-align: center;
}
.empty-icon {
  width: 84px; height: 84px; border-radius: 24px;
  background: rgba(128, 81, 255, 0.08);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 18px;
}
.empty-title {
  font-size: 1.05rem; font-weight: 800; color: #0f0d24; letter-spacing: -0.3px;
}
.empty-text {
  font-size: 0.85rem; color: #94a3b8; margin-top: 6px;
  max-width: 340px; line-height: 1.5;
}
.empty-clear-btn {
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 22px; padding: 11px 22px; border-radius: 999px;
  background: transparent; color: #8051ff; border: 1px solid #e2e8f0;
  font-size: 0.78rem; font-weight: 800; letter-spacing: 0.5px;
  cursor: pointer; font-family: inherit; transition: all 0.2s ease;
}
.empty-clear-btn:hover {
  background: rgba(128, 81, 255, 0.06); border-color: #8051ff;
}

/* ============================================================
   LIST — row based
   ============================================================ */
.approvals-card {
  background: #ffffff; border: 1px solid #e9edf3; border-radius: 18px;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}

.approval-row:first-child {
  border-top-left-radius: 17px;
  border-top-right-radius: 17px;
}
.approval-row:last-child {
  border-bottom-left-radius: 17px;
  border-bottom-right-radius: 17px;
}

.approval-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 22px;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s ease, box-shadow 0.2s ease;
  cursor: pointer;
}
.approval-row:last-child { border-bottom: none; }
.approval-row:hover { background: #fafbff; }

.approval-row:focus-visible {
  outline: 2px solid #8051ff;
  outline-offset: -2px;
}

.approval-row-focus {
  border-color: #8051ff;
  animation: focusPulse 2.4s ease-out;
  z-index: 2;
}

@keyframes focusPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(128, 81, 255, 0.55),
                0 1px 2px rgba(15, 13, 36, 0.03);
  }
  50% {
    box-shadow: 0 0 0 12px rgba(128, 81, 255, 0),
                0 20px 40px -20px rgba(128, 81, 255, 0.5);
  }
  100% {
    box-shadow: 0 0 0 3px rgba(128, 81, 255, 0.22),
                0 20px 40px -20px rgba(128, 81, 255, 0.45);
  }
}

/* Op icon */
.approval-icon {
  width: 42px; height: 42px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.op-estate  {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 8px 20px -10px rgba(128, 81, 255, 0.65);
}
.op-admin   {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 8px 20px -10px rgba(245, 158, 11, 0.6);
}
.op-billing {
  background: linear-gradient(135deg, #34d399 0%, #059669 100%);
  box-shadow: 0 8px 20px -10px rgba(5, 150, 105, 0.6);
}
.op-official {
  background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
  box-shadow: 0 8px 20px -10px rgba(37, 99, 235, 0.6);
}
.op-default {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  box-shadow: 0 8px 20px -10px rgba(100, 116, 139, 0.5);
}

/* Body */
.approval-body { flex: 1; min-width: 0; }
.approval-title-row {
  display: flex; align-items: center; gap: 10px;
  flex-wrap: wrap; margin-bottom: 5px;
}
.approval-summary {
  font-size: 0.9rem; font-weight: 800; color: #0f0d24;
  letter-spacing: -0.25px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 340px;
}
.op-pill {
  display: inline-flex; align-items: center;
  padding: 3px 9px; border-radius: 999px;
  font-size: 0.6rem; font-weight: 800;
  letter-spacing: 0.5px; text-transform: uppercase;
}
.op-pill.op-estate,
.op-pill.op-admin,
.op-pill.op-billing,
.op-pill.op-official {
  background: transparent;
  box-shadow: none;
}
.op-pill.op-estate   { background: #ede9fe; color: #5b21b6; }
.op-pill.op-admin    { background: #fef3c7; color: #92400e; }
.op-pill.op-billing  { background: #d1fae5; color: #065f46; }
.op-pill.op-official { background: #dbeafe; color: #1e40af; }
.op-pill.op-default  { background: #f1f5f9; color: #475569; }

.status-pill {
  display: inline-flex; align-items: center;
  padding: 3px 9px; border-radius: 999px;
  font-size: 0.6rem; font-weight: 800;
  letter-spacing: 0.5px; text-transform: uppercase;
}
.status-pending  { background: rgba(245, 158, 11, 0.16); color: #92400e; }
.status-approved { background: rgba(122, 184, 0, 0.14); color: #3f6b00; }
.status-rejected { background: rgba(239, 68, 68, 0.1); color: #b91c1c; }

.approval-meta {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.72rem; color: #94a3b8;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  font-weight: 500;
}
.meta-item { display: inline-flex; align-items: center; gap: 3px; }
.meta-item.mono { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.7rem; }
.meta-dot { color: #cbd5e1; }

/* Right side — inline actions */
.approval-right {
  display: flex; align-items: center; gap: 8px;
  flex-shrink: 0;
}

.row-btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 8px 14px; border-radius: 10px;
  border: none; font-family: inherit;
  font-size: 0.76rem; font-weight: 800;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.row-btn:disabled { opacity: 0.55; cursor: not-allowed; }

.row-btn-ghost {
  width: 34px; height: 34px; padding: 0;
  background: transparent; color: #94a3b8;
  border: 1px solid #eef1f6;
}
.row-btn-ghost:hover:not(:disabled) {
  background: #f1f5f9; color: #0f0d24; border-color: #cbd5e1;
}

.row-btn-approve {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  box-shadow: 0 10px 22px -14px rgba(128, 81, 255, 0.85);
}
.row-btn-approve:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px -14px rgba(128, 81, 255, 1);
}

.row-btn-reject {
  background: #fee2e2; color: #b91c1c;
}
.row-btn-reject:hover:not(:disabled) { background: #fecaca; }

.status-stamp {
  display: inline-flex; align-items: center;
  padding: 7px 12px; border-radius: 999px;
  font-size: 0.68rem; font-weight: 800;
  letter-spacing: 0.4px; text-transform: uppercase;
}
.stamp-approved { background: rgba(122, 184, 0, 0.14); color: #3f6b00; }
.stamp-rejected { background: rgba(220, 38, 38, 0.12); color: #b91c1c; }

/* Chevron — the "click to open" affordance */
.approval-chevron {
  flex-shrink: 0;
  color: #cbd5e1;
  opacity: 0.7;
  transition: opacity 0.15s ease, transform 0.15s ease, color 0.15s ease;
}
.approval-row:hover .approval-chevron {
  opacity: 1;
  transform: translateX(2px);
  color: #8051ff;
}

/* ============================================================
   DETAIL MODAL
   ============================================================ */
::v-deep .approval-dialog-content {
  border-radius: 20px !important;
  overflow: visible !important;
  margin: 16px auto !important;
  width: calc(100% - 32px) !important;
  max-height: calc(100vh - 32px) !important;
  display: flex !important;
  flex-direction: column !important;
}

.detail-card {
  display: flex; flex-direction: column;
  background: #ffffff; border-radius: 20px;
  overflow: hidden; max-height: 100%; min-height: 0;
}

.detail-header {
  display: flex; align-items: center; gap: 14px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #0f0d24 0%, #2b1256 100%);
  color: #ffffff;
  flex-shrink: 0;
}
.detail-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.detail-header-text { flex: 1; min-width: 0; }
.detail-title {
  font-size: 0.95rem; font-weight: 800;
  letter-spacing: -0.2px; line-height: 1.35;
  word-break: break-word;
}
.detail-sub { margin-top: 6px; }
.detail-sub .op-pill {
  background: rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.9);
}
.detail-close {
  width: 32px; height: 32px; border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: none; cursor: pointer; color: #fff;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s ease;
  flex-shrink: 0;
}
.detail-close:hover { background: rgba(255, 255, 255, 0.2); }

.detail-body {
  padding: 20px 24px;
  display: flex; flex-direction: column; gap: 12px;
  overflow-y: auto; flex: 1 1 auto; min-height: 0;
}

.detail-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 14px; padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}
.detail-row:last-child { border-bottom: none; padding-bottom: 0; }
.detail-key {
  font-size: 0.68rem; font-weight: 800; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.8px;
  flex-shrink: 0;
}
.detail-val {
  font-size: 0.85rem; font-weight: 700; color: #0f0d24;
  text-align: right; word-break: break-all;
}
.detail-val.mono { font-family: ui-monospace, SFMono-Regular, monospace; }

.detail-reject-reason {
  display: flex; align-items: flex-start; gap: 6px;
  padding: 10px 12px; background: #fef2f2;
  border: 1px solid #fecaca; border-radius: 10px;
  color: #b91c1c; font-size: 0.78rem; line-height: 1.5;
}

.detail-payload-block {
  display: flex; flex-direction: column; gap: 8px;
  padding-top: 12px; border-top: 1px solid #f1f5f9;
}
.detail-payload-label {
  display: inline-flex; align-items: center;
  font-size: 0.7rem; font-weight: 800; color: #8051ff;
  text-transform: uppercase; letter-spacing: 0.7px;
}
.detail-pre {
  margin: 0; padding: 14px 16px;
  background: #0a0a14; color: #c4b5fd;
  border-radius: 12px;
  font-size: 0.74rem;
  font-family: ui-monospace, SFMono-Regular, monospace;
  line-height: 1.6;
  overflow-x: auto; max-height: 320px; overflow-y: auto;
}

.detail-actions {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 14px 24px 20px;
  border-top: 1px solid #f1f5f9;
  background: #ffffff;
  flex-shrink: 0;
}

.detail-btn-ghost,
.detail-btn-reject,
.detail-btn-approve {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 10px 18px; border-radius: 11px;
  border: none; font-family: inherit;
  font-size: 0.8rem; font-weight: 800;
  letter-spacing: 0.3px; cursor: pointer;
  transition: all 0.2s ease;
}
.detail-btn-ghost {
  background: transparent; color: #64748b; border: 1px solid #eef1f6;
}
.detail-btn-ghost:hover { background: #f1f5f9; color: #0f0d24; }
.detail-btn-reject {
  background: #fee2e2; color: #b91c1c;
}
.detail-btn-reject:hover:not(:disabled) { background: #fecaca; }
.detail-btn-approve {
  background: linear-gradient(135deg, #8051ff 0%, #9b6cff 100%);
  color: #ffffff;
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.7);
}
.detail-btn-approve:hover:not(:disabled) { transform: translateY(-1px); }
.detail-btn-approve:disabled,
.detail-btn-reject:disabled { opacity: 0.55; cursor: not-allowed; }

/* ============================================================
   REJECT DIALOG
   ============================================================ */
.reject-card {
  padding: 24px; background: #ffffff; border-radius: 20px;
  display: flex; flex-direction: column;
}
.reject-header {
  display: flex; align-items: center; gap: 14px; margin-bottom: 18px;
}
.reject-icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
  box-shadow: 0 10px 22px -10px rgba(220, 38, 38, 0.65);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.reject-title {
  font-size: 1.05rem; font-weight: 800; color: #0f0d24;
  letter-spacing: -0.3px;
}
.reject-sub {
  font-size: 0.78rem; color: #64748b; margin-top: 2px;
  font-weight: 500; line-height: 1.4;
}
.reject-preview {
  padding: 12px 14px; background: #fafaff;
  border: 1px solid #f0eef8; border-radius: 12px;
  margin-bottom: 16px;
}
.reject-preview-summary {
  font-size: 0.82rem; font-weight: 700; color: #0f0d24;
  line-height: 1.4; margin-top: 8px;
}
.reject-preview-ref {
  font-size: 0.7rem;
  color: #8051ff;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-weight: 800;
  letter-spacing: 0.5px;
  margin-top: 6px;
}
.reject-label {
  font-size: 0.68rem; font-weight: 800; color: #475569;
  text-transform: uppercase; letter-spacing: 0.9px;
  margin-bottom: 6px;
}
.reject-textarea {
  width: 100%; padding: 12px 14px;
  border: 1.5px solid #eef1f6; border-radius: 12px;
  background: #f8fafc; font-family: inherit;
  font-size: 0.85rem; font-weight: 600; color: #0f0d24;
  resize: vertical; outline: none; margin-bottom: 18px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.reject-textarea:focus {
  border-color: #8051ff; background: #ffffff;
  box-shadow: 0 0 0 3px rgba(128, 81, 255, 0.1);
}
.reject-textarea::placeholder { color: #94a3b8; font-weight: 500; }

.reject-actions { display: flex; gap: 10px; }
.reject-btn-cancel,
.reject-btn-proceed {
  flex: 1;
  display: inline-flex; align-items: center; justify-content: center;
  padding: 11px 14px; border-radius: 12px;
  border: none; font-family: inherit;
  font-size: 0.8rem; font-weight: 800;
  letter-spacing: 0.3px; cursor: pointer;
  transition: all 0.2s ease;
}
.reject-btn-cancel {
  background: #f6f7fb; color: #475569; border: 1px solid #eef1f6;
}
.reject-btn-cancel:hover:not(:disabled) { background: #eef1f6; }
.reject-btn-proceed {
  background: #fee2e2; color: #b91c1c;
}
.reject-btn-proceed:hover:not(:disabled) { background: #fecaca; }
.reject-btn-cancel:disabled,
.reject-btn-proceed:disabled { opacity: 0.55; cursor: not-allowed; }

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 900px) {
  .approval-summary { max-width: 260px; }
}

@media (max-width: 767px) {
  .approvals-page { gap: 18px; }

  .page-title { font-size: 1.35rem; }
  .page-actions { width: 100%; }
  .refresh-btn { flex: 1; }

  .summary-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .summary-card { padding: 14px 16px; gap: 10px; }
  .summary-icon { width: 36px; height: 36px; }
  .summary-value { font-size: 1.15rem; }

  .filters-card {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .search-wrap { min-width: 0; }
  .filter-select { min-width: 0; }

  .approval-row { padding: 14px 16px; gap: 12px; }
  .approval-icon { width: 38px; height: 38px; }
  .approval-summary { max-width: 100%; white-space: normal; }

  .approval-right {
    flex-direction: column;
    gap: 6px;
    align-items: flex-end;
  }
  .row-btn { padding: 8px 12px; font-size: 0.72rem; }
  .row-btn-ghost { width: 32px; height: 32px; }

  .detail-header { padding: 16px 18px; }
  .detail-body { padding: 16px 18px; }
  .detail-actions { padding: 12px 18px 16px; }
  .detail-row { flex-direction: column; align-items: flex-start; gap: 4px; }
  .detail-val { text-align: left; }

  .reject-card { padding: 20px; }
  .no-access { padding: 60px 20px; }
}
</style>