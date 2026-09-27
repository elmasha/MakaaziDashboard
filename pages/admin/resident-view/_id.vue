<template>
  <div class="resident-view-page">
    <!-- Back link -->
    <button class="back-link" @click="$router.push('/admin/residents')">
      <v-icon size="16">mdi-arrow-left</v-icon>
      All residents
    </button>

    <!-- Loading -->
    <div v-if="loading && !resident" class="loading-wrap">
      <v-skeleton-loader type="article, actions" />
    </div>

    <!-- Not found -->
    <div v-else-if="!resident" class="error-card">
      <v-icon size="48" color="#94a3b8">mdi-alert-circle-outline</v-icon>
      <div class="error-title">Resident not found</div>
      <div class="error-text">This household doesn't exist or has been removed.</div>
      <button class="error-back-btn" @click="$router.push('/admin/residents')">
        <v-icon size="16" class="mr-1">mdi-arrow-left</v-icon>
        Back to residents
      </button>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Hero header -->
      <div class="resident-hero">
        <div class="hero-avatar" :class="avatarClass(resident)">
          <span>{{ initialsOf(resident.primary_owner) }}</span>
        </div>
        <div class="hero-text">
          <div class="hero-name-row">
            <h1 class="hero-name">{{ resident.primary_owner }}</h1>
            <span class="status-pill" :class="statusClass(resident.status)">
              <span class="status-dot"></span>
              {{ resident.status }}
            </span>
            <span v-if="resident.is_official" class="official-tag">
              <v-icon size="12">mdi-shield-account</v-icon>
              {{ resident.official_role || 'Official' }}
            </span>
          </div>
          <div class="hero-meta">
            <span class="meta-item">
              <v-icon size="13">mdi-phone-outline</v-icon>
              {{ resident.contact_number }}
            </span>
            <span class="meta-dot">·</span>
            <span class="meta-item">
              <v-icon size="13">mdi-office-building-outline</v-icon>
              {{ resident.estate_name || 'Unknown estate' }}
            </span>
            <span v-if="resident.estate_urn" class="meta-dot">·</span>
            <span v-if="resident.estate_urn" class="estate-urn">{{ resident.estate_urn }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="hero-actions">
        <button class="hero-btn hero-btn-ghost" @click="callResident">
          <v-icon size="16" class="mr-2">mdi-phone-outline</v-icon>
          Call
        </button>
        <button class="hero-btn hero-btn-ghost" @click="copyUid">
          <v-icon size="16" class="mr-2">mdi-content-copy</v-icon>
          Copy UID
        </button>
        <button class="hero-btn hero-btn-ghost" @click="viewEstate">
          <v-icon size="16" class="mr-2">mdi-office-building-outline</v-icon>
          View estate
        </button>
      </div>

      <!-- Overview grid -->
      <div class="overview-grid">
        <div class="overview-main">
          <!-- Household -->
          <div class="panel-card">
            <div class="panel-head">
              <div class="panel-title">Household</div>
            </div>
            <div class="panel-body">
              <div class="detail-row">
                <div class="detail-label">Primary owner</div>
                <div class="detail-value">{{ resident.primary_owner }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Spouse</div>
                <div class="detail-value">{{ resident.spouse_name || '—' }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Caretaker</div>
                <div class="detail-value">{{ resident.caretaker_name || '—' }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Residence status</div>
                <div class="detail-value">{{ resident.residence_status || '—' }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">House number</div>
                <div class="detail-value mono">{{ resident.house_number || '—' }}</div>
              </div>
            </div>
          </div>

          <!-- Address -->
          <div class="panel-card">
            <div class="panel-head">
              <div class="panel-title">Address</div>
            </div>
            <div class="panel-body">
              <div class="detail-row">
                <div class="detail-label">Section</div>
                <div class="detail-value">{{ resident.section || '—' }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Court</div>
                <div class="detail-value">{{ resident.court || '—' }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Street</div>
                <div class="detail-value">{{ resident.street || '—' }}</div>
              </div>
            </div>
          </div>

          <!-- Payments (optional) -->
          <div class="panel-card">
            <div class="panel-head">
              <div class="panel-title">
                Recent payments
                <span class="panel-count">{{ payments.length }}</span>
              </div>
            </div>
            <div class="panel-body no-pad">
              <div v-if="!payments.length" class="panel-empty">
                No payments recorded for this household yet.
              </div>
              <div
                v-for="p in payments"
                :key="p.id || p.payment_id"
                class="payment-row"
              >
                <div class="payment-icon">
                  <v-icon size="16" color="#8051ff">mdi-cash</v-icon>
                </div>
                <div class="payment-body">
                  <div class="payment-amount">
                    KES {{ formatNum(p.amount_paid) }}
                  </div>
                  <div class="payment-meta">
                    {{ p.payment_method || 'Mpesa' }} ·
                    {{ fmtDate(p.payment_date) }} ·
                    {{ p.transaction_id || '—' }}
                  </div>
                </div>
                <div
                  class="payment-status"
                  :class="p.payment_status === 'Completed' ? 'status-active' : 'status-pending'"
                >
                  {{ p.payment_status }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="overview-side">
          <!-- Identity -->
          <div class="panel-card">
            <div class="panel-head">
              <div class="panel-title">Identity</div>
            </div>
            <div class="panel-body">
              <div class="detail-row compact">
                <div class="detail-label">Household ID</div>
                <div class="detail-value mono">{{ resident.household_id }}</div>
              </div>
              <div class="detail-row compact">
                <div class="detail-label">UID</div>
                <div class="detail-value mono">{{ resident.uid || '—' }}</div>
              </div>
              <div class="detail-row compact">
                <div class="detail-label">Active</div>
                <div class="detail-value">
                  <span class="toggle-state" :class="resident.active ? 'on' : 'off'">
                    {{ resident.active ? 'Yes' : 'No' }}
                  </span>
                </div>
              </div>
              <div class="detail-row compact">
                <div class="detail-label">Official</div>
                <div class="detail-value">
                  <span class="toggle-state" :class="resident.is_official ? 'on' : 'off'">
                    {{ resident.is_official ? 'Yes' : 'No' }}
                  </span>
                </div>
              </div>
              <div class="detail-row compact">
                <div class="detail-label">Joined</div>
                <div class="detail-value">{{ fmtDate(resident.created_at) }}</div>
              </div>
            </div>
          </div>

          <!-- Balance -->
          <div class="panel-card panel-card-highlight">
            <div class="panel-head">
              <div class="panel-title" style="color: white;">Take-on balance</div>
            </div>
            <div class="panel-body">
              <div class="balance-value">
                <span class="currency">KES</span>
                {{ formatNum(resident.take_on_balance) }}
              </div>
              <div class="balance-hint">
                Balance brought forward when this household was registered.
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

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
  </div>
</template>

<script>
import axios from 'axios';
import numeral from 'numeral';

const API = 'https://makaaziserver22.up.railway.app/api';

export default {
  name: 'AdminResidentView',
  layout: 'admin',

  data() {
    return {
      loading: true,
      resident: null,
      payments: [],
      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    residentId() {
      return this.$route.params.id;
    },
  },

  mounted() {
    this.load();
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

        // 1. Fetch all residents, then find by id
        try {
          const res = await axios.get(`${API}/admin/residents`, { headers });
          let list = [];
          if (Array.isArray(res.data)) list = res.data;
          else if (res.data?.residents) list = res.data.residents;
          else if (res.data?.data) list = res.data.data;

          this.resident = list.find(
            (r) => String(r.household_id) === String(this.residentId)
          ) || null;
        } catch (err) {
          console.error('Resident fetch failed:', err.response?.status, err.response?.data || err.message);
        }

        // 2. Fetch payments (optional — silently skip if endpoint doesn't exist)
        if (this.resident) {
          try {
            const res = await axios.get(
              `${API}/admin/residents/${this.residentId}/payments`,
              { headers }
            );
            if (Array.isArray(res.data)) {
              this.payments = res.data;
            }
          } catch (err) {
            console.warn('Payments fetch skipped:', err.response?.status || err.message);
          }
        }
      } finally {
        this.loading = false;
      }
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
    formatNum(n) {
      return numeral(n || 0).format('0,0');
    },
    avatarClass(r) {
      if (!r) return 'avatar-active';
      if (r.is_official) return 'avatar-official';
      if (r.status === 'Pending') return 'avatar-pending';
      if (r.status === 'Rejected') return 'avatar-rejected';
      if (!r.active) return 'avatar-inactive';
      return 'avatar-active';
    },
    statusClass(status) {
      return `status-${(status || '').toLowerCase()}`;
    },

    callResident() {
      if (this.resident?.contact_number) {
        window.location.href = `tel:${this.resident.contact_number.replace(/\s+/g, '')}`;
      }
    },
    async copyUid() {
      try {
        await navigator.clipboard.writeText(this.resident.uid || '');
        this.showSnackbar('UID copied', 'success');
      } catch {
        this.showSnackbar('Copy failed', 'error');
      }
    },
    viewEstate() {
      if (this.resident?.estate_id) {
        this.$router.push(`/admin/view-estate/${this.resident.estate_id}`);
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
.resident-view-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.loading-wrap { padding: 24px 0; }

.error-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 72px 24px;
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 20px;
  text-align: center;
}

.error-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f0d24;
  margin-top: 16px;
}

.error-text {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-top: 6px;
  max-width: 320px;
}

.error-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 22px;
  padding: 11px 22px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: transparent;
  color: #8051ff;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
}

.error-back-btn:hover {
  background: rgba(128, 81, 255, 0.06);
  border-color: #8051ff;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  cursor: pointer;
  padding: 4px 0;
  align-self: flex-start;
  font-family: inherit;
}

.back-link:hover { color: #8051ff; }

/* ============================================================
   HERO
   ============================================================ */
.resident-hero {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px;
  background: linear-gradient(135deg, #0f0d24 0%, #2b1256 100%);
  border-radius: 20px;
  color: white;
  box-shadow: 0 20px 40px -22px rgba(34, 16, 71, 0.55);
}

.hero-avatar {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.6px;
  flex-shrink: 0;
  box-shadow: 0 14px 28px -10px rgba(0, 0, 0, 0.5);
}

.avatar-active { background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%); }
.avatar-official { background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%); color: #0a0a14; }
.avatar-pending { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); }
.avatar-rejected { background: linear-gradient(135deg, #f87171 0%, #dc2626 100%); }
.avatar-inactive { background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%); }

.hero-text { min-width: 0; flex: 1; }

.hero-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.hero-name {
  font-size: 1.55rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.6px;
  margin: 0;
  line-height: 1.15;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 11px;
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.status-approved { background: rgba(182, 255, 0, 0.95); color: #3f6b00; }
.status-pending { background: #fbbf24; color: #0a0a14; }
.status-rejected { background: #f87171; color: #450a0a; }

.official-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 500;
  flex-wrap: wrap;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.meta-dot { color: rgba(255, 255, 255, 0.3); }

.estate-urn {
  font-family: ui-monospace, SFMono-Regular, monospace;
}

/* Actions */
.hero-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: 11px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.hero-btn-ghost {
  background: #ffffff;
  border-color: #e2e8f0;
  color: #334155;
}

.hero-btn-ghost:hover {
  border-color: #8051ff;
  color: #8051ff;
}

/* ============================================================
   OVERVIEW
   ============================================================ */
.overview-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 18px;
  align-items: start;
}

@media (max-width: 900px) {
  .overview-grid { grid-template-columns: 1fr; }
}

.overview-main,
.overview-side {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.panel-card {
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}

.panel-card-highlight {
  background: linear-gradient(140deg, #0a0a14 0%, #221047 55%, #2b1256 100%);
  border-color: transparent;
}

.panel-card-highlight .panel-head {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
}

.panel-title {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f0d24;
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-count {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(128, 81, 255, 0.12);
  color: #8051ff;
  font-size: 0.62rem;
  font-weight: 800;
}

.panel-body {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-body.no-pad { padding: 0; gap: 0; }

.panel-empty {
  font-size: 0.82rem;
  color: #94a3b8;
  font-weight: 500;
  padding: 20px;
  text-align: center;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 9px 0;
  border-bottom: 1px solid #f1f5f9;
}

.detail-row:last-child { border-bottom: none; }
.detail-row.compact { padding: 7px 0; }

.detail-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  flex-shrink: 0;
}

.detail-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f0d24;
  text-align: right;
  word-break: break-word;
}

.detail-value.mono {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.78rem;
}

.toggle-state {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.toggle-state.on { background: rgba(122, 184, 0, 0.14); color: #3f6b00; }
.toggle-state.off { background: rgba(148, 163, 184, 0.16); color: #64748b; }

/* Balance card */
.balance-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.8px;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.currency {
  font-size: 0.85rem;
  font-weight: 800;
  color: #b6ff00;
  letter-spacing: 0.4px;
}

.balance-hint {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.5;
}

/* Payments */
.payment-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.payment-row:last-child { border-bottom: none; }

.payment-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(128, 81, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.payment-body { flex: 1; min-width: 0; }

.payment-amount {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f0d24;
}

.payment-meta {
  font-size: 0.7rem;
  color: #94a3b8;
  font-weight: 500;
  margin-top: 2px;
}

.payment-status {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  flex-shrink: 0;
}

.status-active { background: rgba(122, 184, 0, 0.14); color: #3f6b00; }
.status-pending { background: rgba(245, 158, 11, 0.14); color: #b45309; }

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 767px) {
  .resident-view-page { gap: 18px; }
  .resident-hero { padding: 18px; flex-wrap: wrap; }
  .hero-avatar { width: 54px; height: 54px; }
  .hero-name { font-size: 1.25rem; }
  .balance-value { font-size: 1.4rem; }
}
</style>