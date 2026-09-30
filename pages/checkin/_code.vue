<template>
  <div class="checkin-page">
    <div class="checkin-shell">
      <!-- Loading -->
      <div v-if="loading" class="state-card">
        <v-progress-circular indeterminate color="#8051FF" size="42" />
        <div class="state-title">Loading your pass…</div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="state-card">
        <div class="state-icon state-icon-red">
          <v-icon size="32" color="#dc2626">mdi-alert-circle-outline</v-icon>
        </div>
        <div class="state-title">{{ error }}</div>
        <div class="state-sub">
          If you think this is a mistake, contact the person who invited you.
        </div>
      </div>

      <!-- Already checked in -->
      <div v-else-if="checkedIn" class="state-card">
        <div class="state-icon state-icon-green">
          <v-icon size="34" color="#065f46">mdi-check-circle-outline</v-icon>
        </div>
        <div class="state-title">You're checked in ✓</div>
        <div class="state-sub">
          {{ pass.host_name }} has been notified. You may proceed to the gate.
        </div>
        <div class="state-meta">
          Checked in at {{ formatTime(checkedAt) }}
        </div>
      </div>

      <!-- Pass details + check-in button -->
      <div v-else class="pass-card">
        <div class="pass-header">
          <div class="pass-estate">
            <v-icon size="18" color="white">mdi-home-city</v-icon>
            {{ pass.estate_name }}
          </div>
          <div class="pass-label">Visitor pass</div>
        </div>

        <div class="pass-body">
          <div class="pass-row">
            <div class="pass-key">Visiting</div>
            <div class="pass-val">{{ pass.host_name }}</div>
          </div>
          <div class="pass-row">
            <div class="pass-key">Guest</div>
            <div class="pass-val">{{ pass.visitor_name }}</div>
          </div>
          <div class="pass-row">
            <div class="pass-key">Valid until</div>
            <div class="pass-val">{{ formatTime(pass.valid_until) }}</div>
          </div>
          <div class="pass-row">
            <div class="pass-key">Code</div>
            <div class="pass-val mono">{{ pass.pass_code }}</div>
          </div>
        </div>

        <div v-if="!pass.can_checkin" class="pass-invalid">
          <v-icon size="16" color="#b45309" class="mr-1">mdi-alert</v-icon>
          This pass can no longer be used ({{ pass.status }}).
        </div>

        <button
          v-else
          class="checkin-btn"
          :disabled="submitting"
          @click="doCheckin"
        >
          <v-icon v-if="submitting" size="18" class="spin mr-2">mdi-loading</v-icon>
          <v-icon v-else size="18" class="mr-2">mdi-map-marker-check-outline</v-icon>
          {{ submitting ? 'Checking in…' : "I'm here" }}
        </button>

        <div class="pass-foot">
          Powered by <span class="brand">Makaazi</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API = 'https://makaaziserver22.up.railway.app/api';

export default {
  name: 'VisitorCheckin',
  layout: 'public',      // falls back to default if you don't have layouts/public.vue
  auth: false,

  data() {
    return {
      loading: true,
      submitting: false,
      error: '',
      pass: null,
      checkedIn: false,
      checkedAt: null,
    };
  },

  mounted() {
    this.fetchPass();
  },

  methods: {
    getCode() {
      return String(this.$route.params.code || '').toUpperCase().trim();
    },

    async fetchPass() {
      const code = this.getCode();
      if (!code) {
        this.error = 'No pass code in this link.';
        this.loading = false;
        return;
      }
      try {
        const { data } = await axios.get(`${API}/visitor-passes/public/${code}`);
        this.pass = data;
        if (data.status === 'Used') {
          this.checkedIn = true;
          this.checkedAt = data.used_at;
        }
      } catch (e) {
        const msg = e.response?.data?.error || 'This pass could not be found.';
        this.error = msg;
      } finally {
        this.loading = false;
      }
    },

    async doCheckin() {
      const code = this.getCode();
      this.submitting = true;
      try {
        const { data } = await axios.post(`${API}/visitor-passes/checkin/${code}`);
        this.checkedIn = true;
        this.checkedAt = data?.pass?.used_at || new Date().toISOString();
      } catch (e) {
        this.error = e.response?.data?.error || 'Check-in failed. Try again.';
      } finally {
        this.submitting = false;
      }
    },

    formatTime(d) {
      if (!d) return '—';
      try {
        return new Date(d).toLocaleString('en-GB', {
          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
        });
      } catch { return '—'; }
    },
  },
};
</script>

<style scoped>
/* ============================================================
   PAGE
   ============================================================ */
.checkin-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 20% 10%, rgba(128,81,255,0.12), transparent 60%),
    radial-gradient(circle at 80% 90%, rgba(182,255,0,0.10), transparent 60%),
    #f6f7fb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  font-family: inherit;
}
.checkin-shell {
  width: 100%;
  max-width: 440px;
}

/* ============================================================
   STATE CARDS
   ============================================================ */
.state-card {
  background: #ffffff;
  border-radius: 22px;
  padding: 36px 24px;
  text-align: center;
  box-shadow: 0 20px 48px -24px rgba(15, 13, 36, 0.25);
}
.state-icon {
  width: 76px; height: 76px;
  border-radius: 22px;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 18px;
}
.state-icon-red   { background: rgba(239, 68, 68, 0.1); }
.state-icon-green { background: rgba(122, 184, 0, 0.14); }
.state-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.4px;
}
.state-sub {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 8px;
  line-height: 1.55;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}
.state-meta {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 700;
  margin-top: 16px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

/* ============================================================
   PASS CARD
   ============================================================ */
.pass-card {
  background: #ffffff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 24px 60px -28px rgba(15, 13, 36, 0.35);
}
.pass-header {
  background: linear-gradient(140deg, #0a0a14 0%, #221047 55%, #2b1256 100%);
  padding: 22px 24px 26px;
  color: #ffffff;
  position: relative;
}
.pass-estate {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: -0.3px;
}
.pass-label {
  font-size: 0.66rem;
  letter-spacing: 2px;
  font-weight: 800;
  color: rgba(255,255,255,0.55);
  margin-top: 8px;
  text-transform: uppercase;
}

.pass-body {
  padding: 22px 24px 8px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.pass-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}
.pass-key {
  font-size: 0.68rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.9px;
}
.pass-val {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.2px;
  text-align: right;
}
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: 1px; }

.pass-invalid {
  margin: 12px 24px 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #b45309;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.checkin-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 24px 6px;
  padding: 16px 20px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.2px;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 14px 30px -14px rgba(128, 81, 255, 0.9);
  transition: transform 0.2s ease;
}
.checkin-btn:hover:not(:disabled) { transform: translateY(-2px); }
.checkin-btn:disabled { opacity: 0.7; cursor: not-allowed; }

.pass-foot {
  text-align: center;
  font-size: 0.68rem;
  color: #94a3b8;
  font-weight: 600;
  padding: 14px 24px 22px;
  letter-spacing: 0.3px;
}
.pass-foot .brand { color: #8051FF; font-weight: 800; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 1s linear infinite; }
</style>