<template>
  <div class="single-approve-page">
    <!-- ============================================================
         ACCESS GATE
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
        You don't have permission to review approval requests.
      </div>
      <button class="no-access-btn" @click="$router.push('/admin')">
        <v-icon size="16" class="mr-1">mdi-arrow-left</v-icon>
        Back to dashboard
      </button>
    </div>

    <!-- ============================================================
         LOADING
         ============================================================ -->
    <div v-else-if="loading" class="state-block">
      <v-progress-circular indeterminate color="#8051FF" size="42" />
      <div class="state-title">Loading request…</div>
      <div class="state-ref mono">{{ ref }}</div>
    </div>

    <!-- ============================================================
         NOT FOUND
         ============================================================ -->
    <div v-else-if="error" class="state-block">
      <div class="state-icon state-icon-error">
        <v-icon size="32" color="white">mdi-alert-circle-outline</v-icon>
      </div>
      <div class="state-title">{{ error }}</div>
      <div class="state-sub">
        The reference may have been mistyped, or the request may have been
        deleted.
      </div>
      <div class="state-ref mono">{{ ref }}</div>
      <div class="state-actions">
        <button class="btn-ghost" @click="$router.push('/admin/approve')">
          <v-icon size="16" class="mr-1">mdi-format-list-bulleted</v-icon>
          Go to queue
        </button>
        <button class="btn-primary" @click="$router.push('/admin')">
          <v-icon size="16" class="mr-1">mdi-home-outline</v-icon>
          Dashboard
        </button>
      </div>
    </div>

    <!-- ============================================================
         THE REQUEST
         ============================================================ -->
    <template v-else-if="request">
      <!-- PAGE HEADER -->
      <div class="page-header">
        <button class="back-btn" @click="goBack">
          <v-icon size="18">mdi-arrow-left</v-icon>
        </button>
        <div class="header-text">
          <div class="page-title-row">
            <h1 class="page-title">Review request</h1>
            <div
              class="status-pill"
              :class="`status-${request.status.toLowerCase()}`"
            >
              <span class="status-dot"></span>
              {{ request.status }}
            </div>
          </div>
          <p class="page-sub">
            Reference
            <span class="mono sub-ref">{{ request.reference }}</span>
          </p>
        </div>
      </div>

      <!-- MAIN CARD -->
      <div class="request-card">
        <!-- Card head -->
        <div class="request-head">
          <div class="request-icon" :class="opClass(request.operation)">
            <v-icon size="22" color="white">{{ opIcon(request.operation) }}</v-icon>
          </div>
          <div class="request-head-text">
            <div class="request-op">{{ prettyOp(request.operation) }}</div>
            <div class="request-summary">{{ request.summary }}</div>
          </div>
        </div>

        <!-- Meta grid -->
        <div class="request-meta">
          <div class="meta-block">
            <div class="meta-label">Reference</div>
            <div class="meta-value mono">{{ request.reference }}</div>
          </div>
          <div class="meta-block">
            <div class="meta-label">Requested by</div>
            <div class="meta-value">{{ request.requested_email }}</div>
          </div>
          <div class="meta-block">
            <div class="meta-label">Submitted</div>
            <div class="meta-value">{{ fmtDateTime(request.created_at) }}</div>
          </div>
          <div v-if="request.target_id" class="meta-block">
            <div class="meta-label">Target</div>
            <div class="meta-value mono">
              {{ request.target_table }} #{{ request.target_id }}
            </div>
          </div>
          <div v-if="request.reviewed_email" class="meta-block">
            <div class="meta-label">Reviewed by</div>
            <div class="meta-value">{{ request.reviewed_email }}</div>
          </div>
          <div v-if="request.reviewed_at" class="meta-block">
            <div class="meta-label">Reviewed at</div>
            <div class="meta-value">{{ fmtDateTime(request.reviewed_at) }}</div>
          </div>
        </div>

        <!-- Rejection reason -->
        <div
          v-if="request.status === 'Rejected' && request.rejection_reason"
          class="reject-reason"
        >
          <v-icon size="16" color="#B91C1C" class="mr-2">mdi-information-outline</v-icon>
          <div>
            <div class="reject-reason-label">Rejection reason</div>
            <div class="reject-reason-text">{{ request.rejection_reason }}</div>
          </div>
        </div>

        <!-- Payload -->
        <div class="payload-block">
          <div class="payload-head">
            <v-icon size="14" class="mr-1">mdi-code-json</v-icon>
            Requested changes
          </div>
          <pre class="payload-pre">{{ prettyPayload(request.payload) }}</pre>
        </div>

        <!-- Actions -->
        <div v-if="request.status === 'Pending'" class="request-actions">
          <button
            class="action-btn action-btn-reject"
            :disabled="busy"
            @click="openReject"
          >
            <v-icon size="16" class="mr-2">mdi-close</v-icon>
            Reject request
          </button>
          <button
            class="action-btn action-btn-approve"
            :disabled="busy"
            @click="approve"
          >
            <v-icon size="16" class="mr-2">
              {{ busy ? 'mdi-loading' : 'mdi-check' }}
            </v-icon>
            {{ busy ? 'Approving…' : 'Approve & execute' }}
          </button>
        </div>

        <!-- Already-reviewed state -->
        <div
          v-else
          class="reviewed-banner"
          :class="`reviewed-${request.status.toLowerCase()}`"
        >
          <v-icon size="20" class="mr-2">
            {{ request.status === 'Approved'
              ? 'mdi-check-decagram-outline'
              : 'mdi-close-circle-outline' }}
          </v-icon>
          <div>
            <div class="reviewed-title">
              This request was {{ request.status.toLowerCase() }}
            </div>
            <div class="reviewed-sub">
              by {{ request.reviewed_email || 'a super admin' }}
              <template v-if="request.reviewed_at">
                · {{ fmtDateTime(request.reviewed_at) }}
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer hint -->
      <div class="footer-hint">
        <v-icon size="14" color="#94a3b8" class="mr-1">mdi-information-outline</v-icon>
        <span v-if="request.status === 'Pending'">
          Approving will execute this change immediately. Rejecting will notify
          the requester.
        </span>
        <span v-else>
          Reviewed requests cannot be re-opened. Open the queue for the full
          history.
        </span>
      </div>
    </template>

    <!-- ============================================================
         REJECT DIALOG
         ============================================================ -->
    <v-dialog v-model="rejectDialog" max-width="440" persistent>
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

        <div class="reject-preview">
          <span class="op-pill" :class="opClass(request?.operation || '')">
            {{ prettyOp(request?.operation || '') }}
          </span>
          <div class="reject-preview-summary">{{ request?.summary }}</div>
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
            class="reject-btn-cancel"
            :disabled="rejecting"
            @click="rejectDialog = false"
          >
            Cancel
          </button>
          <button
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

const API = 'https://makaaziserver22.up.railway.app/api';

export default {
  name: 'AdminApproveSingle',
  layout: 'admin',

  data() {
    return {
      adminRole: null,
      roleReady: false,

      ref: null,
      request: null,
      loading: true,
      error: '',

      busy: false,

      rejectDialog: false,
      rejectReason: '',
      rejecting: false,

      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    isSuperAdmin() {
      return this.adminRole === 'super';
    },
  },

  mounted() {
    try {
      this.adminRole = localStorage.getItem('admin_role') || null;
    } catch (e) {
      console.warn('[Approve] localStorage read failed:', e.message);
    }
    this.roleReady = true;

    this.ref = this.$route.params.ref || null;

    if (this.isSuperAdmin && this.ref) {
      this.fetchRequest();
    } else if (!this.ref) {
      this.loading = false;
      this.error = 'No reference provided';
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

    async fetchRequest() {
      this.loading = true;
      this.error = '';
      try {
        const headers = await this.getAuthHeaders();
        const { data } = await axios.get(
          `${API}/admin/approvals/${encodeURIComponent(this.ref)}`,
          { headers }
        );
        if (!data || !data.id) {
          this.error = 'Request not found';
          return;
        }
        this.request = data;
      } catch (err) {
        const s = err.response?.status;
        if (s === 401 || s === 403) {
          this.$router.push('/admin/login');
          return;
        }
        if (s === 404) {
          this.error = 'This request no longer exists';
        } else {
          console.warn('[Approve] fetch failed:', err.message);
          this.error = err.response?.data?.error || 'Failed to load request';
        }
      } finally {
        this.loading = false;
      }
    },

    /* ============================================================
       APPROVE
       ============================================================ */
    async approve() {
      if (!this.request || this.busy) return;
      this.busy = true;
      try {
        const headers = await this.getAuthHeaders();
        await axios.post(
          `${API}/admin/approvals/${this.request.id}/approve`,
          {},
          { headers }
        );

        // Reflect the new state locally — no need to refetch
        this.request.status = 'Approved';
        this.request.reviewed_email =
          localStorage.getItem('admin_email') || 'super admin';
        this.request.reviewed_at = new Date().toISOString();

        this.showSnackbar('Request approved', 'success');

        if (this.$nuxt && this.$nuxt.$emit) {
          this.$nuxt.$emit('approvals-changed');
        }
      } catch (err) {
        console.error('[Approve] approve failed:', err);
        this.showSnackbar(
          err.response?.data?.error || 'Approve failed',
          'error'
        );
      } finally {
        this.busy = false;
      }
    },

    /* ============================================================
       REJECT
       ============================================================ */
    openReject() {
      this.rejectReason = '';
      this.rejectDialog = true;
    },

    async confirmReject() {
      if (!this.request) return;
      this.rejecting = true;
      try {
        const headers = await this.getAuthHeaders();
        await axios.post(
          `${API}/admin/approvals/${this.request.id}/reject`,
          { reason: this.rejectReason },
          { headers }
        );

        this.request.status = 'Rejected';
        this.request.rejection_reason = this.rejectReason || null;
        this.request.reviewed_email =
          localStorage.getItem('admin_email') || 'super admin';
        this.request.reviewed_at = new Date().toISOString();

        this.showSnackbar('Request rejected', 'success');
        this.rejectDialog = false;

        if (this.$nuxt && this.$nuxt.$emit) {
          this.$nuxt.$emit('approvals-changed');
        }
      } catch (err) {
        console.error('[Approve] reject failed:', err);
        this.showSnackbar(
          err.response?.data?.error || 'Reject failed',
          'error'
        );
      } finally {
        this.rejecting = false;
      }
    },

    /* ============================================================
       NAVIGATION
       ============================================================ */
    goBack() {
      // If the user came from the SMS with no history in this tab,
      // send them to the queue. Otherwise, use browser history.
      if (window.history.length > 1) {
        this.$router.back();
      } else {
        this.$router.push('/admin/approve');
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
      if (!op) return 'op-default';
      if (op.startsWith('estate.'))       return 'op-estate';
      if (op.startsWith('admin.'))        return 'op-admin';
      if (op.startsWith('plan.') || op.startsWith('subscription.')) return 'op-billing';
      if (op.startsWith('official.') || op.startsWith('charge.'))   return 'op-official';
      return 'op-default';
    },

    opIcon(op) {
      if (!op) return 'mdi-help-circle-outline';
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
.single-approve-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
  max-width: 720px;
  margin: 0 auto;
  padding: 4px 0 8px;
}

/* ============================================================
   ACCESS GATE + STATE BLOCKS
   ============================================================ */
.gate-state,
.state-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
}
.gate-sub {
  font-size: 0.82rem; color: #94a3b8; margin-top: 14px; font-weight: 500;
}

.state-icon {
  width: 68px; height: 68px; border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 18px;
}
.state-icon-error {
  background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
  box-shadow: 0 12px 26px -12px rgba(220, 38, 38, 0.6);
}

.state-title {
  font-size: 1.1rem; font-weight: 800; color: #0f0d24;
  letter-spacing: -0.3px;
}
.state-sub {
  font-size: 0.85rem; color: #94a3b8; margin-top: 6px;
  max-width: 360px; line-height: 1.55;
}
.state-ref {
  margin-top: 14px;
  padding: 6px 14px;
  background: #f1f5f9;
  border-radius: 999px;
  color: #8051ff;
  font-weight: 800;
  letter-spacing: 0.5px;
}
.mono { font-family: ui-monospace, SFMono-Regular, monospace; }

.state-actions {
  display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap;
  justify-content: center;
}

.no-access {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 80px 24px; text-align: center;
  background: #ffffff; border: 1px solid #e9edf3; border-radius: 18px;
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
  display: flex; align-items: flex-start; gap: 14px;
}
.back-btn {
  width: 40px; height: 40px; border-radius: 12px;
  background: #ffffff; border: 1px solid #e2e8f0;
  color: #475569; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: all 0.2s ease; flex-shrink: 0; margin-top: 2px;
}
.back-btn:hover {
  border-color: #8051ff; color: #8051ff;
  transform: translateX(-2px);
}
.header-text { min-width: 0; flex: 1; }
.page-title-row {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
}
.page-title {
  font-size: 1.65rem; font-weight: 800; color: #0f0d24;
  letter-spacing: -0.7px; margin: 0; line-height: 1.15;
}
.page-sub {
  font-size: 0.82rem; color: #64748b; margin: 6px 0 0; font-weight: 500;
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
}
.sub-ref {
  color: #8051ff; font-weight: 800; letter-spacing: 0.4px;
}

.status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 999px;
  font-size: 0.62rem; font-weight: 800;
  letter-spacing: 0.5px; text-transform: uppercase;
}
.status-dot {
  width: 5px; height: 5px; border-radius: 50%; background: currentColor;
}
.status-pending  { background: rgba(245, 158, 11, 0.16); color: #92400e; }
.status-approved { background: rgba(122, 184, 0, 0.14); color: #3f6b00; }
.status-rejected { background: rgba(239, 68, 68, 0.1); color: #b91c1c; }

/* ============================================================
   REQUEST CARD
   ============================================================ */
.request-card {
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
  overflow: hidden;
}

.request-head {
  display: flex; align-items: center; gap: 14px;
  padding: 22px 24px;
  background: linear-gradient(135deg, #0f0d24 0%, #2b1256 100%);
  color: #ffffff;
}
.request-icon {
  width: 44px; height: 44px; border-radius: 12px;
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
.request-head-text { flex: 1; min-width: 0; }
.request-op {
  font-size: 0.7rem; font-weight: 800; color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.8px; text-transform: uppercase;
  margin-bottom: 6px;
}
.request-summary {
  font-size: 1rem; font-weight: 800;
  letter-spacing: -0.2px; line-height: 1.35;
  word-break: break-word;
}

/* Meta */
.request-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 18px;
  padding: 20px 24px;
  background: #fafaff;
  border-bottom: 1px solid #f0eef8;
}
.meta-block { min-width: 0; }
.meta-label {
  font-size: 0.62rem; font-weight: 800; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.8px;
  margin-bottom: 5px;
}
.meta-value {
  font-size: 0.85rem; font-weight: 700; color: #0f0d24;
  word-break: break-word;
}

/* Reject reason */
.reject-reason {
  display: flex; align-items: flex-start;
  padding: 14px 24px;
  background: #fef2f2;
  border-bottom: 1px solid #fecaca;
  color: #b91c1c;
}
.reject-reason-label {
  font-size: 0.62rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.8px;
  margin-bottom: 3px;
  opacity: 0.75;
}
.reject-reason-text {
  font-size: 0.85rem; font-weight: 600; line-height: 1.5;
}

/* Payload */
.payload-block {
  padding: 20px 24px;
}
.payload-head {
  display: inline-flex; align-items: center;
  font-size: 0.68rem; font-weight: 800; color: #8051ff;
  text-transform: uppercase; letter-spacing: 0.8px;
  margin-bottom: 10px;
}
.payload-pre {
  margin: 0; padding: 16px 18px;
  background: #0a0a14; color: #c4b5fd;
  border-radius: 12px;
  font-size: 0.75rem;
  font-family: ui-monospace, SFMono-Regular, monospace;
  line-height: 1.6;
  overflow-x: auto;
  max-height: 380px; overflow-y: auto;
}

/* Actions */
.request-actions {
  display: flex; gap: 10px;
  padding: 20px 24px;
  border-top: 1px solid #f1f5f9;
  background: #fafbfc;
}
.action-btn {
  flex: 1;
  display: inline-flex; align-items: center; justify-content: center;
  padding: 14px 18px; border-radius: 12px;
  border: none; font-family: inherit;
  font-size: 0.85rem; font-weight: 800;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.action-btn:disabled { opacity: 0.55; cursor: not-allowed; }

.action-btn-reject {
  background: #fee2e2; color: #b91c1c;
}
.action-btn-reject:hover:not(:disabled) { background: #fecaca; }

.action-btn-approve {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  box-shadow: 0 14px 30px -16px rgba(128, 81, 255, 0.9);
}
.action-btn-approve:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 36px -16px rgba(128, 81, 255, 1);
}

/* Reviewed banner */
.reviewed-banner {
  display: flex; align-items: center;
  padding: 18px 24px;
  border-top: 1px solid #f1f5f9;
}
.reviewed-approved {
  background: rgba(122, 184, 0, 0.08);
  color: #3f6b00;
}
.reviewed-rejected {
  background: rgba(220, 38, 38, 0.06);
  color: #b91c1c;
}
.reviewed-title {
  font-size: 0.9rem; font-weight: 800;
}
.reviewed-sub {
  font-size: 0.75rem; margin-top: 2px;
  opacity: 0.85; font-weight: 600;
}

/* Footer hint */
.footer-hint {
  display: flex; align-items: flex-start;
  font-size: 0.78rem; color: #94a3b8;
  line-height: 1.55;
  padding: 0 4px;
}

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
.op-pill {
  display: inline-flex; align-items: center;
  padding: 3px 9px; border-radius: 999px;
  font-size: 0.6rem; font-weight: 800;
  letter-spacing: 0.5px; text-transform: uppercase;
}
.op-pill.op-estate   { background: #ede9fe; color: #5b21b6; }
.op-pill.op-admin    { background: #fef3c7; color: #92400e; }
.op-pill.op-billing  { background: #d1fae5; color: #065f46; }
.op-pill.op-official { background: #dbeafe; color: #1e40af; }
.op-pill.op-default  { background: #f1f5f9; color: #475569; }

.reject-preview-summary {
  font-size: 0.82rem; font-weight: 700; color: #0f0d24;
  line-height: 1.4; margin-top: 8px;
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

/* Shared button used in states */
.btn-ghost,
.btn-primary {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 6px;
  padding: 11px 20px; border-radius: 12px;
  border: none; font-family: inherit;
  font-size: 0.8rem; font-weight: 800;
  letter-spacing: 0.3px; cursor: pointer;
  transition: all 0.2s ease;
}
.btn-ghost {
  background: #f6f7fb; color: #475569; border: 1px solid #eef1f6;
}
.btn-ghost:hover { background: #eef1f6; }
.btn-primary {
  background: linear-gradient(135deg, #8051ff 0%, #9b6cff 100%);
  color: #ffffff;
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.7);
}
.btn-primary:hover { transform: translateY(-1px); }

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 767px) {
  .single-approve-page { gap: 18px; }

  .page-title { font-size: 1.35rem; }
  .back-btn { width: 36px; height: 36px; }

  .request-head { padding: 18px 20px; gap: 12px; }
  .request-summary { font-size: 0.9rem; }

  .request-meta {
    padding: 16px 20px;
    gap: 14px;
    grid-template-columns: 1fr 1fr;
  }

  .payload-block { padding: 16px 20px; }
  .payload-pre { padding: 14px 14px; font-size: 0.72rem; }

  .request-actions {
    flex-direction: column-reverse;
    padding: 16px 20px;
  }
  .action-btn { padding: 13px 16px; }

  .reviewed-banner { padding: 16px 20px; }

  .reject-card { padding: 20px; }
}
</style>