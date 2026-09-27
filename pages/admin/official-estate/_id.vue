<template>
  <div class="view-estate-page">
    <!-- ============================================================
         BACK LINK
         ============================================================ -->
    <button class="back-link" @click="goBack">
      <v-icon size="16">mdi-arrow-left</v-icon>
      <span>{{ backLabel }}</span>
    </button>

    <!-- ============================================================
         LOADING
         ============================================================ -->
    <div v-if="loading" class="loading-block">
      <v-skeleton-loader
        type="image, article, list-item-avatar-three-line"
      />
    </div>

    <!-- ============================================================
         ERROR
         ============================================================ -->
    <div v-else-if="error" class="empty-card">
      <div class="empty-icon">
        <v-icon size="44" color="#ef4444">mdi-alert-circle-outline</v-icon>
      </div>
      <div class="empty-title">Could not load estate</div>
      <div class="empty-text">{{ error }}</div>
      <button class="empty-clear-btn" @click="load">
        <v-icon size="16" class="mr-1">mdi-refresh</v-icon>
        Try again
      </button>
    </div>

    <!-- ============================================================
         CONTENT
         ============================================================ -->
    <template v-else-if="estate">
      <!-- ============ HERO CARD ============ -->
      <div class="hero-card">
        <div class="hero-cover" :style="coverStyle">
          <div class="hero-cover-overlay"></div>
        </div>

        <div class="hero-body">
          <div class="hero-avatar-wrap">
            <div class="hero-avatar">
              <img v-if="estate.logo_url" :src="estate.logo_url" alt="logo" />
              <span v-else>{{ estateInitials }}</span>
            </div>
          </div>

          <div class="hero-info">
            <div class="hero-name-row">
              <h1 class="hero-name">{{ estate.estate_name || 'Untitled Estate' }}</h1>
              <span class="status-pill" :class="estate.status === 'Active' ? 'status-active' : 'status-inactive'">
                <span class="status-dot"></span>
                {{ estate.status || 'Active' }}
              </span>
            </div>

            <div class="hero-meta">
              <span class="meta-item">
                <v-icon size="13" color="#8051ff">mdi-map-marker-outline</v-icon>
                {{ estate.estate_location || 'No location set' }}
              </span>
              <span class="meta-dot">·</span>
              <span class="meta-item hero-urn">
                <v-icon size="13" color="#8051ff">mdi-identifier</v-icon>
                {{ estate.estate_urn || '—' }}
              </span>
            </div>
          </div>

          <div class="hero-actions">
            <button class="hero-btn hero-btn-ghost" @click="goToEstateConsole">
              <v-icon size="15">mdi-open-in-new</v-icon>
              Console
            </button>
            <button class="hero-btn hero-btn-primary" @click="editEstate">
              <v-icon size="15">mdi-pencil-outline</v-icon>
              Edit
            </button>
          </div>
        </div>
      </div>

      <!-- ============ SUMMARY TILES ============ -->
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-icon summary-icon-purple">
            <v-icon size="18" color="white">mdi-home-group</v-icon>
          </div>
          <div class="summary-body">
            <div class="summary-label">Households</div>
            <div class="summary-value-sm">
              {{ formatNum(stats.household_count) }}
            </div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon summary-icon-amber">
            <v-icon size="18" color="white">mdi-clock-alert-outline</v-icon>
          </div>
          <div class="summary-body">
            <div class="summary-label">Pending</div>
            <div class="summary-value-sm">
              {{ formatNum(stats.pending_count) }}
            </div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon summary-icon-blue">
            <v-icon size="18" color="white">mdi-shield-account-outline</v-icon>
          </div>
          <div class="summary-body">
            <div class="summary-label">Officials</div>
            <div class="summary-value-sm">
              {{ formatNum(officials.length) }}
            </div>
          </div>
        </div>

        <div class="summary-card summary-card-highlight">
          <div class="summary-icon summary-icon-white">
            <v-icon size="18" color="#0A0A14">mdi-cash-multiple</v-icon>
          </div>
          <div class="summary-body">
            <div class="summary-label">Collected</div>
            <div class="summary-value-sm">
              <span class="currency">KES</span>
              {{ formatNum(stats.total_collected) }}
            </div>
          </div>
        </div>
      </div>

      <!-- ============ DETAILS ============ -->
      <div class="panel-card">
        <div class="panel-head">
          <div class="panel-icon panel-icon-purple">
            <v-icon size="18" color="white">mdi-information-outline</v-icon>
          </div>
          <div>
            <div class="panel-title">Estate details</div>
            <div class="panel-sub">Basic information and identifiers</div>
          </div>
        </div>

        <div class="detail-grid">
          <div class="detail-item">
            <div class="detail-label">Estate name</div>
            <div class="detail-value">{{ estate.estate_name || '—' }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">URN</div>
            <div class="detail-value mono">{{ estate.estate_urn || '—' }}</div>
          </div>

          <div class="detail-item detail-span-2">
            <div class="detail-label">Location</div>
            <div class="detail-value">{{ estate.estate_location || '—' }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">Latitude</div>
            <div class="detail-value mono">
              {{ estate.latitude != null ? estate.latitude : '—' }}
            </div>
          </div>

          <div class="detail-item">
            <div class="detail-label">Longitude</div>
            <div class="detail-value mono">
              {{ estate.longitude != null ? estate.longitude : '—' }}
            </div>
          </div>

          <div class="detail-item">
            <div class="detail-label">Estate ID</div>
            <div class="detail-value mono">#{{ estate.estate_id }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">Created</div>
            <div class="detail-value">{{ fmtDate(estate.created_at) }}</div>
          </div>
        </div>
      </div>

      <!-- ============ OFFICIALS ============ -->
      <div class="panel-card">
        <div class="panel-head">
          <div class="panel-icon panel-icon-lime">
            <v-icon size="18" color="#0A0A14">mdi-shield-account-outline</v-icon>
          </div>
          <div style="flex: 1">
            <div class="panel-title">Officials</div>
            <div class="panel-sub">
              {{ officials.length }}
              {{ officials.length === 1 ? 'official' : 'officials' }}
              managing this estate
            </div>
          </div>
        </div>

        <div v-if="!officials.length" class="empty-inline">
          <v-icon size="34" color="#cbd5e1">mdi-shield-account-outline</v-icon>
          <div class="empty-inline-title">No officials yet</div>
          <div class="empty-inline-sub">
            Assign a household to a role to create an official.
          </div>
        </div>

        <div v-else class="officials-list">
          <div
            v-for="o in officials"
            :key="o.official_id"
            class="official-row"
            @click="openOfficial(o)"
          >
            <div class="official-avatar" :class="avatarClass(o.role)">
              {{ initialsOf(o.full_name) }}
            </div>
            <div class="official-body">
              <div class="official-name">{{ o.full_name }}</div>
              <div class="official-meta">
                <span class="official-role" :class="roleClass(o.role)">
                  {{ o.role || 'Official' }}
                </span>
                <span v-if="o.contact_number" class="official-phone">
                  <v-icon size="11">mdi-phone-outline</v-icon>
                  {{ o.contact_number }}
                </span>
              </div>
            </div>
            <v-icon size="18" class="official-chevron">mdi-chevron-right</v-icon>
          </div>
        </div>
      </div>

      <!-- ============ SERVICE CHARGES ============ -->
      <div class="panel-card" v-if="charges.length">
        <div class="panel-head">
          <div class="panel-icon panel-icon-blue">
            <v-icon size="18" color="white">mdi-tag-multiple</v-icon>
          </div>
          <div>
            <div class="panel-title">Service charges</div>
            <div class="panel-sub">
              {{ charges.length }}
              {{ charges.length === 1 ? 'charge' : 'charges' }}
              configured
            </div>
          </div>
        </div>

        <div class="charges-list">
          <div
            v-for="c in charges"
            :key="c.charges_id"
            class="charge-row"
          >
            <div class="charge-icon">
              <v-icon size="16" color="#8051ff">mdi-tag-outline</v-icon>
            </div>
            <div class="charge-body">
              <div class="charge-name">{{ c.charge_type }}</div>
              <div class="charge-freq">{{ c.frequency }}</div>
            </div>
            <div class="charge-amount">
              <span class="currency">KES</span>
              {{ formatNum(c.amount) }}
            </div>
          </div>
        </div>
      </div>

      <!-- ============ ADDRESS CONFIG ============ -->
      <div class="panel-card" v-if="addressConfig">
        <div class="panel-head">
          <div class="panel-icon panel-icon-slate">
            <v-icon size="18" color="white">mdi-tune-variant</v-icon>
          </div>
          <div>
            <div class="panel-title">Address configuration</div>
            <div class="panel-sub">Which address fields are enabled</div>
          </div>
        </div>

        <div class="config-grid">
          <div class="config-item" :class="addressConfig.show_section ? 'config-on' : 'config-off'">
            <div class="config-icon">
              <v-icon size="18" :color="addressConfig.show_section ? '#8051ff' : '#9ca3af'">
                mdi-map-marker-multiple
              </v-icon>
            </div>
            <div class="config-body">
              <div class="config-label">Section</div>
              <div class="config-status">
                <span class="status-dot-sm" :class="addressConfig.show_section ? 'dot-on' : 'dot-off'"></span>
                {{ addressConfig.show_section ? 'Enabled' : 'Disabled' }}
              </div>
            </div>
          </div>

          <div class="config-item" :class="addressConfig.show_court ? 'config-on' : 'config-off'">
            <div class="config-icon">
              <v-icon size="18" :color="addressConfig.show_court ? '#8051ff' : '#9ca3af'">
                mdi-home-city-outline
              </v-icon>
            </div>
            <div class="config-body">
              <div class="config-label">Court</div>
              <div class="config-status">
                <span class="status-dot-sm" :class="addressConfig.show_court ? 'dot-on' : 'dot-off'"></span>
                {{ addressConfig.show_court ? 'Enabled' : 'Disabled' }}
              </div>
            </div>
          </div>

          <div class="config-item" :class="addressConfig.show_street ? 'config-on' : 'config-off'">
            <div class="config-icon">
              <v-icon size="18" :color="addressConfig.show_street ? '#8051ff' : '#9ca3af'">
                mdi-road-variant
              </v-icon>
            </div>
            <div class="config-body">
              <div class="config-label">Street</div>
              <div class="config-status">
                <span class="status-dot-sm" :class="addressConfig.show_street ? 'dot-on' : 'dot-off'"></span>
                {{ addressConfig.show_street ? 'Enabled' : 'Disabled' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ SUBSCRIPTION ============ -->
      <div class="panel-card" v-if="subscription">
        <div class="panel-head">
          <div class="panel-icon panel-icon-lime">
            <v-icon size="18" color="#0A0A14">mdi-credit-card-outline</v-icon>
          </div>
          <div>
            <div class="panel-title">Subscription</div>
            <div class="panel-sub">Current billing plan</div>
          </div>
        </div>

        <div class="detail-grid">
          <div class="detail-item">
            <div class="detail-label">Plan</div>
            <div class="detail-value">{{ subscription.plan_name || '—' }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">Monthly rate</div>
            <div class="detail-value mono">
              KES {{ formatNum(subscription.monthly_rate) }}
            </div>
          </div>

          <div class="detail-item">
            <div class="detail-label">Status</div>
            <div class="detail-value">
              <span
                class="status-pill"
                :class="subscription.is_active ? 'status-active' : 'status-inactive'"
              >
                <span class="status-dot"></span>
                {{ subscription.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>

          <div class="detail-item">
            <div class="detail-label">Payment status</div>
            <div class="detail-value">{{ subscription.payment_status || '—' }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">Start date</div>
            <div class="detail-value">{{ fmtDate(subscription.start_date) }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">End date</div>
            <div class="detail-value">{{ fmtDate(subscription.end_date) }}</div>
          </div>
        </div>
      </div>

      <!-- ============ ACTIONS ============ -->
      <div class="panel-card">
        <div class="panel-head">
          <div class="panel-icon panel-icon-purple">
            <v-icon size="18" color="white">mdi-lightning-bolt-outline</v-icon>
          </div>
          <div>
            <div class="panel-title">Actions</div>
            <div class="panel-sub">Manage this estate</div>
          </div>
        </div>

        <div class="action-list">
          <button class="action-row" @click="goToEstateConsole">
            <div class="action-icon action-icon-purple">
              <v-icon size="16" color="white">mdi-open-in-new</v-icon>
            </div>
            <div class="action-body">
              <div class="action-title">Open estate console</div>
              <div class="action-sub">Manage households, payments, and officials</div>
            </div>
            <v-icon size="16" class="action-chevron">mdi-chevron-right</v-icon>
          </button>

          <button class="action-row" @click="editEstate">
            <div class="action-icon action-icon-blue">
              <v-icon size="16" color="white">mdi-pencil-outline</v-icon>
            </div>
            <div class="action-body">
              <div class="action-title">Edit estate details</div>
              <div class="action-sub">Update name, location, or imagery</div>
            </div>
            <v-icon size="16" class="action-chevron">mdi-chevron-right</v-icon>
          </button>

          <button class="action-row" @click="goToSubscription">
            <div class="action-icon action-icon-lime">
              <v-icon size="16" color="#0A0A14">mdi-credit-card-outline</v-icon>
            </div>
            <div class="action-body">
              <div class="action-title">Manage subscription</div>
              <div class="action-sub">Change plan or check billing</div>
            </div>
            <v-icon size="16" class="action-chevron">mdi-chevron-right</v-icon>
          </button>
        </div>
      </div>
    </template>

    <!-- ============================================================
         SNACKBAR
         ============================================================ -->
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

const API = 'https://makaaziserver22.up.railway.app/api';

export default {
  name: 'AdminViewEstate',
  layout: 'admin',

  data() {
    return {
      loading: true,
      error: '',

      estate: null,
      addressConfig: null,
      charges: [],
      officials: [],
      sections: [],
      courts: [],
      streets: [],
      stats: {
        household_count: 0,
        pending_count: 0,
        total_collected: 0,
      },
      subscription: null,

      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    estateId() {
      return this.$route?.params?.id;
    },

    estateInitials() {
      const n = this.estate?.estate_name;
      if (!n) return '?';
      return n
        .split(' ')
        .map((w) => w[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    },

    coverStyle() {
      const img = this.estate?.estate_image;
      if (img) return { backgroundImage: `url(${img})` };
      return {
        background:
          'linear-gradient(135deg, #0a0a14 0%, #221047 55%, #2b1256 100%)',
      };
    },

    // ---- Back button label / destination ----
    backLabel() {
      const from = this.$route?.query?.from || '';
      if (from.startsWith('official-')) return 'Back to official';
      if (from === 'officials-list') return 'Back to officials';
      if (from === 'estates-list') return 'Back to estates';
      if (from === 'subscriptions-list') return 'Back to subscriptions';
      return 'Back';
    },
    backPath() {
      const from = this.$route?.query?.from || '';
      if (from.startsWith('official-')) {
        const officialId = from.replace('official-', '');
        return `/admin/officials/${officialId}`;
      }
      if (from === 'officials-list') return '/admin/officials';
      if (from === 'estates-list') return '/admin/estates';
      if (from === 'subscriptions-list') return '/admin/subscriptions';
      return '/admin/estates';
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
      if (!this.estateId) {
        this.error = 'Missing estate ID in URL';
        this.loading = false;
        return;
      }

      this.loading = true;
      this.error = '';

      try {
        const headers = await this.getAuthHeaders();
        const { data } = await axios.get(
          `${API}/admin/estates/${this.estateId}`,
          { headers }
        );

        if (!data || !data.estate) {
          this.error = `Estate #${this.estateId} not found`;
          return;
        }

        this.estate = data.estate;
        this.addressConfig = data.address_config || null;
        this.charges = Array.isArray(data.charges) ? data.charges : [];
        this.officials = Array.isArray(data.officials) ? data.officials : [];
        this.sections = Array.isArray(data.sections) ? data.sections : [];
        this.courts = Array.isArray(data.courts) ? data.courts : [];
        this.streets = Array.isArray(data.streets) ? data.streets : [];
        this.stats = data.stats || this.stats;
        this.subscription = data.subscription || null;
      } catch (err) {
        const s = err.response?.status;
        if (s === 401 || s === 403) {
          this.error = 'Access denied — check admin account';
        } else if (s === 404) {
          this.error = `Estate #${this.estateId} not found`;
        } else {
          this.error = err.response?.data?.error || err.message || 'Network error';
        }
        console.warn('load estate failed:', err.message);
      } finally {
        this.loading = false;
      }
    },

    // ---------- helpers ----------
    formatNum(n) {
      const v = Number(n) || 0;
      return v.toLocaleString('en-US');
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

    initialsOf(name) {
      if (!name) return '?';
      return name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    },

    avatarClass(role) {
      const r = (role || '').toLowerCase();
      if (r === 'chairman') return 'avatar-chairman';
      if (r === 'secretary') return 'avatar-secretary';
      if (r === 'treasurer') return 'avatar-treasurer';
      if (r === 'caretaker') return 'avatar-caretaker';
      return 'avatar-default';
    },

    roleClass(role) {
      const r = (role || '').toLowerCase().replace(/\s+/g, '-');
      return `role-${r}`;
    },

    // ---------- actions ----------
    goBack() {
      this.$router.push(this.backPath);
    },

    openOfficial(o) {
      // Navigate to the official detail page, and mark where we came from
      this.$router.push({
        path: `/admin/officials/${o.official_id}`,
        query: { from: `estate-${this.estateId}` },
      });
    },

    goToEstateConsole() {
      if (!this.estateId) return;
      // Opens the estate's own console (out of admin scope)
      window.open(`/officials/dashboard/${this.estateId}`, '_blank');
    },

    editEstate() {
      this.$router.push(`/admin/estates/${this.estateId}/edit`);
    },

    goToSubscription() {
      this.$router.push({
        path: '/admin/subscriptions',
        query: { estate: this.estateId },
      });
    },

    showSnackbar(text, color = 'success') {
      this.snackbar = { show: true, text, color };
    },
  },
};
</script>

<style scoped>
.view-estate-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
  max-width: 1100px;
}

/* ============================================================
   BACK LINK
   ============================================================ */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 10px;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.4px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  width: fit-content;
}
.back-link:hover {
  border-color: #8051ff;
  color: #8051ff;
  transform: translateX(-2px);
}

/* ============================================================
   LOADING / ERROR
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
  background: rgba(239, 68, 68, 0.08);
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
  max-width: 340px;
  line-height: 1.5;
}
.empty-clear-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 22px;
  padding: 10px 20px;
  border-radius: 999px;
  background: transparent;
  color: #8051ff;
  border: 1px solid #e2e8f0;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}
.empty-clear-btn:hover {
  background: rgba(128, 81, 255, 0.06);
  border-color: #8051ff;
}

/* ============================================================
   HERO CARD
   ============================================================ */
.hero-card {
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.04);
}
.hero-cover {
  position: relative;
  height: 180px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.hero-cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.35) 100%
  );
}
.hero-body {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 28px 24px;
  flex-wrap: wrap;
}
.hero-avatar-wrap {
  margin-top: -40px;
  margin-bottom: 0;
  flex-shrink: 0;
}
.hero-avatar {
  width: 88px;
  height: 88px;
  border-radius: 22px;
  background: linear-gradient(135deg, #8051ff 0%, #a855f7 100%);
  border: 4px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 800;
  font-size: 1.4rem;
  letter-spacing: 0.5px;
  overflow: hidden;
  box-shadow: 0 14px 30px -10px rgba(128, 81, 255, 0.6);
}
.hero-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-info {
  flex: 1;
  min-width: 0;
  padding-top: 12px;
}
.hero-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.hero-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.5px;
  margin: 0;
  line-height: 1.15;
}
.hero-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 0.82rem;
  color: #64748b;
  font-weight: 500;
}
.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.meta-dot {
  color: #cbd5e1;
}
.hero-urn {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.76rem;
  color: #8051ff;
  font-weight: 700;
}
.hero-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
  flex-wrap: wrap;
  padding-top: 12px;
}
.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 11px;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  border: none;
}
.hero-btn-ghost {
  background: #ffffff;
  color: #0f0d24;
  border: 1px solid #e9edf3;
}
.hero-btn-ghost:hover {
  border-color: #8051ff;
  color: #8051ff;
}
.hero-btn-primary {
  background: linear-gradient(135deg, #8051ff 0%, #9b6cff 100%);
  color: white;
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.7);
}
.hero-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px -10px rgba(128, 81, 255, 0.85);
}

/* ============================================================
   STATUS PILL
   ============================================================ */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.status-active {
  background: rgba(122, 184, 0, 0.14);
  color: #3f6b00;
}
.status-inactive {
  background: rgba(239, 68, 68, 0.1);
  color: #b91c1c;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* ============================================================
   SUMMARY TILES
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
  transition: transform 0.22s ease, box-shadow 0.22s ease;
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
.summary-card-highlight .summary-value-sm {
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
.summary-icon-purple {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 8px 20px -10px rgba(128, 81, 255, 0.65);
}
.summary-icon-lime {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  box-shadow: 0 8px 20px -10px rgba(182, 255, 0, 0.7);
}
.summary-icon-blue {
  background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
  box-shadow: 0 8px 20px -10px rgba(37, 99, 235, 0.6);
}
.summary-icon-amber {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 8px 20px -10px rgba(245, 158, 11, 0.6);
}
.summary-icon-white {
  background: #ffffff;
  box-shadow: 0 8px 20px -10px rgba(255, 255, 255, 0.5);
}
.summary-body {
  min-width: 0;
}
.summary-label {
  font-size: 0.62rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  margin-bottom: 4px;
}
.summary-value-sm {
  font-size: 0.98rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.4px;
  line-height: 1.2;
  word-break: break-word;
}
.currency {
  font-size: 0.7rem;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 0.4px;
  margin-right: 2px;
}

/* ============================================================
   PANEL CARDS
   ============================================================ */
.panel-card {
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}
.panel-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 22px;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
}
.panel-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.panel-icon-purple {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.7);
}
.panel-icon-lime {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  box-shadow: 0 10px 22px -10px rgba(182, 255, 0, 0.6);
}
.panel-icon-blue {
  background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
  box-shadow: 0 10px 22px -10px rgba(37, 99, 235, 0.6);
}
.panel-icon-slate {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  box-shadow: 0 10px 22px -10px rgba(100, 116, 139, 0.5);
}
.panel-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
}
.panel-sub {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 2px;
  font-weight: 500;
}

/* ============================================================
   DETAIL GRID
   ============================================================ */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  padding: 22px;
}
.detail-item {
  min-width: 0;
}
.detail-span-2 {
  grid-column: 1 / -1;
}
.detail-label {
  font-size: 0.62rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  margin-bottom: 6px;
}
.detail-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f0d24;
  letter-spacing: -0.2px;
  word-break: break-word;
  line-height: 1.4;
}
.detail-value.mono {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.82rem;
  color: #475569;
  font-weight: 600;
}

/* ============================================================
   OFFICIALS LIST
   ============================================================ */
.officials-list {
  display: flex;
  flex-direction: column;
}
.official-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 22px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.15s ease;
}
.official-row:last-child {
  border-bottom: none;
}
.official-row:hover {
  background: #fafbff;
}
.official-row:hover .official-chevron {
  opacity: 1;
  transform: translateX(2px);
  color: #8051ff;
}
.official-avatar {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}
.avatar-chairman {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  color: #0a0a14;
  box-shadow: 0 8px 20px -10px rgba(182, 255, 0, 0.7);
}
.avatar-secretary {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 8px 20px -10px rgba(128, 81, 255, 0.65);
}
.avatar-treasurer {
  background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
  box-shadow: 0 8px 20px -10px rgba(37, 99, 235, 0.6);
}
.avatar-caretaker {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 8px 20px -10px rgba(245, 158, 11, 0.6);
}
.avatar-default {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  box-shadow: 0 8px 20px -10px rgba(100, 116, 139, 0.5);
}
.official-body {
  flex: 1;
  min-width: 0;
}
.official-name {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.official-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  flex-wrap: wrap;
}
.official-role {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}
.role-chairman {
  background: rgba(122, 184, 0, 0.14);
  color: #3f6b00;
}
.role-secretary {
  background: rgba(128, 81, 255, 0.12);
  color: #5b21b6;
}
.role-treasurer {
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
}
.role-caretaker {
  background: rgba(245, 158, 11, 0.14);
  color: #b45309;
}
.role-committee-member {
  background: rgba(148, 163, 184, 0.16);
  color: #475569;
}
.official-phone {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 600;
}
.official-chevron {
  color: #cbd5e1;
  opacity: 0.6;
  flex-shrink: 0;
  transition: opacity 0.15s ease, transform 0.15s ease, color 0.15s ease;
}

/* ============================================================
   EMPTY INLINE
   ============================================================ */
.empty-inline {
  padding: 40px 22px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.empty-inline-title {
  font-size: 0.92rem;
  font-weight: 800;
  color: #0f0d24;
  margin-top: 8px;
}
.empty-inline-sub {
  font-size: 0.78rem;
  color: #94a3b8;
  max-width: 300px;
  line-height: 1.5;
}

/* ============================================================
   CHARGES LIST
   ============================================================ */
.charges-list {
  display: flex;
  flex-direction: column;
}
.charge-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 22px;
  border-bottom: 1px solid #f1f5f9;
}
.charge-row:last-child {
  border-bottom: none;
}
.charge-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(128, 81, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.charge-body {
  flex: 1;
  min-width: 0;
}
.charge-name {
  font-size: 0.86rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.2px;
}
.charge-freq {
  font-size: 0.7rem;
  color: #94a3b8;
  font-weight: 600;
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.charge-amount {
  font-size: 0.9rem;
  font-weight: 800;
  color: #0f0d24;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

/* ============================================================
   CONFIG GRID
   ============================================================ */
.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  padding: 22px;
}
.config-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid #e9edf3;
  border-radius: 14px;
  background: #fafaff;
  transition: all 0.2s ease;
}
.config-on {
  background: linear-gradient(135deg, #faf8ff 0%, #f3eeff 100%);
  border-color: #e0d4ff;
}
.config-icon {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: #ffffff;
  border: 1px solid #e9edf3;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.config-on .config-icon {
  border-color: #e0d4ff;
  box-shadow: 0 4px 10px -4px rgba(128, 81, 255, 0.2);
}
.config-body {
  min-width: 0;
}
.config-label {
  font-size: 0.82rem;
  font-weight: 800;
  color: #0f0d24;
}
.config-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  color: #7c7a95;
  margin-top: 3px;
  font-weight: 600;
}
.status-dot-sm {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-on {
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}
.dot-off {
  background: #cbd5e1;
}

/* ============================================================
   ACTION LIST
   ============================================================ */
.action-list {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
}
.action-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 22px;
  background: transparent;
  border: none;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: background 0.15s ease;
  width: 100%;
}
.action-row:last-child {
  border-bottom: none;
}
.action-row:hover {
  background: #fafbff;
}
.action-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.action-icon-purple {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 8px 18px -8px rgba(128, 81, 255, 0.7);
}
.action-icon-blue {
  background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
  box-shadow: 0 8px 18px -8px rgba(37, 99, 235, 0.6);
}
.action-icon-lime {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  box-shadow: 0 8px 18px -8px rgba(182, 255, 0, 0.6);
}
.action-body {
  flex: 1;
  min-width: 0;
}
.action-title {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.2px;
  line-height: 1.2;
}
.action-sub {
  font-size: 0.74rem;
  color: #94a3b8;
  margin-top: 2px;
  font-weight: 500;
}
.action-chevron {
  color: #cbd5e1;
  opacity: 0.7;
  flex-shrink: 0;
  transition: opacity 0.15s ease, transform 0.15s ease, color 0.15s ease;
}
.action-row:hover .action-chevron {
  opacity: 1;
  transform: translateX(2px);
  color: #8051ff;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 767px) {
  .view-estate-page {
    gap: 18px;
  }
  .hero-cover {
    height: 140px;
  }
  .hero-body {
    padding: 0 18px 18px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .hero-avatar {
    width: 72px;
    height: 72px;
    border-radius: 18px;
    font-size: 1.15rem;
  }
  .hero-avatar-wrap {
    margin-top: -34px;
  }
  .hero-name {
    font-size: 1.25rem;
  }
  .hero-actions {
    width: 100%;
    padding-top: 0;
  }
  .hero-btn {
    flex: 1;
    justify-content: center;
  }
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .summary-card {
    padding: 14px 16px;
    gap: 10px;
  }
  .summary-icon {
    width: 36px;
    height: 36px;
  }
  .summary-value-sm {
    font-size: 0.86rem;
  }
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 18px;
  }
  .config-grid {
    grid-template-columns: 1fr;
    padding: 18px;
  }
  .official-row,
  .charge-row,
  .action-row {
    padding: 12px 18px;
    gap: 12px;
  }
}
</style>