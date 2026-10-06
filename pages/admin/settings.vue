<template>
  <div class="settings-page">
    <!-- ============================================================
         PAGE HEADER
         ============================================================ -->
    <div class="page-header">
      <div>
        <div class="page-title-row">
          <h1 class="page-title">Settings</h1>
          <div class="count-pill">{{ activeSectionCount }}</div>
        </div>
        <p class="page-sub">
          Platform configuration · {{ dirty ? 'Unsaved changes' : 'All changes saved' }}
        </p>
      </div>
      <div class="page-actions">
        <v-btn
          text
          rounded
          class="text-capitalize refresh-btn"
          :loading="loading"
          @click="load"
        >
          <v-icon left small>mdi-refresh</v-icon>
          Reload
        </v-btn>
        <v-btn
          rounded
          depressed
          class="text-capitalize save-btn"
          :loading="saving"
          :disabled="!dirty"
          @click="saveAll"
        >
          <v-icon left small>mdi-content-save-outline</v-icon>
          Save changes
        </v-btn>
      </div>
    </div>

    <!-- ============================================================
         LAYOUT — SIDEBAR NAV + PANELS
         ============================================================ -->
    <div class="settings-layout">
      <!-- Sidebar nav -->
      <aside class="settings-nav">
        <button
          v-for="s in sections"
          :key="s.key"
          class="settings-nav-item"
          :class="{ 'settings-nav-item-active': activeSection === s.key }"
          @click="activeSection = s.key"
        >
          <v-icon size="18">{{ s.icon }}</v-icon>
          <span>{{ s.label }}</span>
          <span v-if="sectionDirty(s.key)" class="dirty-dot"></span>
        </button>
      </aside>

      <!-- Panel -->
      <section class="settings-panel">
        <!-- ====================================================
             PLATFORM
             ==================================================== -->
        <div v-if="activeSection === 'platform'" class="panel-block">
          <div class="panel-header">
            <div class="panel-icon panel-icon-purple">
              <v-icon size="20" color="white">mdi-office-building-outline</v-icon>
            </div>
            <div>
              <div class="panel-title">Platform profile</div>
              <div class="panel-sub">Name, branding, and support contacts</div>
            </div>
          </div>

          <div class="panel-grid">
            <div class="field">
              <label class="field-label">Platform name</label>
              <input v-model="form.platform_name" class="field-input" type="text" />
            </div>
            <div class="field">
              <label class="field-label">Support email</label>
              <input v-model="form.support_email" class="field-input" type="email" />
            </div>
            <div class="field">
              <label class="field-label">Support phone</label>
              <input v-model="form.support_phone" class="field-input" type="tel" />
            </div>
            <div class="field">
              <label class="field-label">Currency</label>
              <select v-model="form.currency" class="field-input">
                <option value="KES">KES — Kenyan Shilling</option>
                <option value="NGN">NGN — Nigerian Naira</option>
                <option value="USD">USD — US Dollar</option>
                <option value="TZS">TZS — Tanzanian Shilling</option>
                <option value="UGX">UGX — Ugandan Shilling</option>
              </select>
            </div>
            <div class="field">
              <label class="field-label">Timezone</label>
              <select v-model="form.timezone" class="field-input">
                <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div class="field">
              <label class="field-label">Date format</label>
              <select v-model="form.date_format" class="field-input">
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>

        <!-- ====================================================
             SMS PROVIDER (Advanta)
             ==================================================== -->
        <div v-else-if="activeSection === 'sms'" class="panel-block">
          <div class="panel-header">
            <div class="panel-icon panel-icon-amber">
              <v-icon size="20" color="white">mdi-message-text-outline</v-icon>
            </div>
            <div>
              <div class="panel-title">SMS provider</div>
              <div class="panel-sub">Advanta Bulk SMS gateway credentials</div>
            </div>
          </div>

          <div class="panel-grid">
            <div class="field">
              <label class="field-label">Provider</label>
              <select v-model="form.sms_provider" class="field-input">
                <option value="advanta">Advanta Bulk SMS</option>
                <option value="none">Disabled</option>
              </select>
            </div>
            <div class="field">
              <label class="field-label">Shortcode / Sender ID</label>
              <input v-model="form.sms_sender_id" class="field-input" type="text" placeholder="INTEC" />
            </div>
            <div class="field">
              <label class="field-label">Partner ID</label>
              <input v-model="form.sms_partner_id" class="field-input" type="text" placeholder="4510" />
            </div>
            <div class="field field-full">
              <label class="field-label">API key</label>
              <input
                v-model="form.sms_api_key"
                class="field-input"
                :type="showSecrets.sms ? 'text' : 'password'"
                placeholder="••••••••••••••••"
              />
              <button class="field-toggle" @click="showSecrets.sms = !showSecrets.sms">
                <v-icon size="14">{{ showSecrets.sms ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}</v-icon>
              </button>
              <div class="field-hint">
                Leave blank to keep the current key. Enter a new value to replace it.
              </div>
            </div>
            <div class="field field-full">
              <label class="field-label">API base URL</label>
              <input
                v-model="form.sms_api_base"
                class="field-input"
                type="text"
                placeholder="https://quicksms.advantasms.com"
              />
              <div class="field-hint">
                Advanta base URL. Leave blank to use the default.
              </div>
            </div>
            <div class="field field-full">
              <label class="field-label">Default SMS template (household approval)</label>
              <textarea
                v-model="form.sms_template_approval"
                class="field-input field-textarea"
                rows="3"
                :placeholder="'Hi {{name}}, your registration at {{estate}} has been approved. Your account number is {{account}}. Welcome to Makaazi!'"
              ></textarea>
              <div class="field-hint" v-pre>
                Available tokens: <code>{{name}}</code> <code>{{estate}}</code> <code>{{account}}</code> <code>{{phone}}</code>
              </div>
            </div>
            <div class="field field-full">
              <label class="field-label">Payment confirmation template</label>
              <textarea
                v-model="form.sms_template_payment"
                class="field-input field-textarea"
                rows="3"
                :placeholder="'Hi {{name}}, we have received your payment of KES {{amount}} for {{estate}}. Receipt: {{receipt}}. {{balance_line}} - Makaazi'"
              ></textarea>
              <div class="field-hint" v-pre>
                Available tokens: <code>{{name}}</code> <code>{{amount}}</code> <code>{{estate}}</code> <code>{{receipt}}</code> <code>{{balance_line}}</code>
              </div>
              <div class="field-hint">
                <code>{{balance_line}}</code> renders "You are fully paid up." or
                "Outstanding: KES X." Leave it out if you don't want that sentence.
              </div>
            </div>
          </div>

          <div class="panel-actions">
            <v-btn text rounded class="test-btn" @click="testSms">
              <v-icon left small>mdi-send-outline</v-icon>
              Send test SMS
            </v-btn>
            <v-btn text rounded class="test-btn" @click="checkBalance">
              <v-icon left small>mdi-wallet-outline</v-icon>
              Check balance
            </v-btn>
            <span v-if="balanceInfo" class="balance-pill" :class="{ 'balance-ok': balanceInfo.ok }">
              <v-icon size="14">{{ balanceInfo.ok ? 'mdi-check-circle' : 'mdi-alert-circle' }}</v-icon>
              {{ balanceInfo.text }}
            </span>
          </div>
        </div>

        <!-- ====================================================
             EMAIL / SMTP
             ==================================================== -->
        <div v-else-if="activeSection === 'email'" class="panel-block">
          <div class="panel-header">
            <div class="panel-icon panel-icon-blue">
              <v-icon size="20" color="white">mdi-email-outline</v-icon>
            </div>
            <div>
              <div class="panel-title">Email / SMTP</div>
              <div class="panel-sub">Outbound mail for notifications</div>
            </div>
          </div>

          <div class="panel-grid">
            <div class="field">
              <label class="field-label">SMTP host</label>
              <input v-model="form.smtp_host" class="field-input" type="text" placeholder="smtp.gmail.com" />
            </div>
            <div class="field">
              <label class="field-label">SMTP port</label>
              <input v-model.number="form.smtp_port" class="field-input" type="number" placeholder="587" />
            </div>
            <div class="field">
              <label class="field-label">Username</label>
              <input v-model="form.smtp_user" class="field-input" type="text" />
            </div>
            <div class="field">
              <label class="field-label">Password</label>
              <input
                v-model="form.smtp_pass"
                class="field-input"
                :type="showSecrets.email ? 'text' : 'password'"
                placeholder="••••••••••••••••"
              />
              <button class="field-toggle" @click="showSecrets.email = !showSecrets.email">
                <v-icon size="14">{{ showSecrets.email ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}</v-icon>
              </button>
              <div class="field-hint">
                Leave blank to keep the current password.
              </div>
            </div>
            <div class="field">
              <label class="field-label">From name</label>
              <input v-model="form.mail_from_name" class="field-input" type="text" placeholder="Makaazi" />
            </div>
            <div class="field">
              <label class="field-label">From email</label>
              <input v-model="form.mail_from_email" class="field-input" type="email" placeholder="no-reply@makaazi.app" />
            </div>
            <div class="field field-full">
              <label class="field-label">Encryption</label>
              <select v-model="form.smtp_encryption" class="field-input">
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>

          <div class="panel-actions">
            <v-btn text rounded class="test-btn" @click="testEmail">
              <v-icon left small>mdi-email-fast-outline</v-icon>
              Send test email
            </v-btn>
          </div>
        </div>

        <!-- ====================================================
             FEES / CHARGES
             ==================================================== -->
        <div v-else-if="activeSection === 'fees'" class="panel-block">
          <div class="panel-header">
            <div class="panel-icon panel-icon-lime">
              <v-icon size="20" color="#0A0A14">mdi-cash-multiple</v-icon>
            </div>
            <div>
              <div class="panel-title">Fees &amp; charges</div>
              <div class="panel-sub">Default amounts applied to new estates</div>
            </div>
          </div>

          <div class="panel-grid">
            <div class="field">
              <label class="field-label">Default monthly service fee</label>
              <input v-model.number="form.default_service_fee" class="field-input" type="number" min="0" step="0.01" />
            </div>
            <div class="field">
              <label class="field-label">Default security levy</label>
              <input v-model.number="form.default_security_levy" class="field-input" type="number" min="0" step="0.01" />
            </div>
            <div class="field">
              <label class="field-label">Default garbage fee</label>
              <input v-model.number="form.default_garbage_fee" class="field-input" type="number" min="0" step="0.01" />
            </div>
            <div class="field">
              <label class="field-label">Late payment penalty (%)</label>
              <input v-model.number="form.late_penalty_pct" class="field-input" type="number" min="0" max="100" step="0.1" />
            </div>
            <div class="field">
              <label class="field-label">Grace period (days)</label>
              <input v-model.number="form.grace_period_days" class="field-input" type="number" min="0" />
            </div>
            <div class="field">
              <label class="field-label">Payment reminder lead (days)</label>
              <input v-model.number="form.reminder_lead_days" class="field-input" type="number" min="0" />
            </div>
          </div>
        </div>

        <!-- ====================================================
             SECURITY
             ==================================================== -->
        <div v-else-if="activeSection === 'security'" class="panel-block">
          <div class="panel-header">
            <div class="panel-icon panel-icon-purple">
              <v-icon size="20" color="white">mdi-shield-lock-outline</v-icon>
            </div>
            <div>
              <div class="panel-title">Security</div>
              <div class="panel-sub">Sessions, MFA, and access rules</div>
            </div>
          </div>

          <div class="toggle-list">
            <div class="toggle-row">
              <div>
                <div class="toggle-title">Require MFA for super admins</div>
                <div class="toggle-sub">Enforce a second factor on every login</div>
              </div>
              <button
                class="toggle-switch"
                :class="{ 'toggle-on': form.require_mfa_super }"
                @click="form.require_mfa_super = !form.require_mfa_super"
              >
                <span class="toggle-knob"></span>
              </button>
            </div>

            <div class="toggle-row">
              <div>
                <div class="toggle-title">Require MFA for all admins</div>
                <div class="toggle-sub">Include estate-level admins</div>
              </div>
              <button
                class="toggle-switch"
                :class="{ 'toggle-on': form.require_mfa_all }"
                @click="form.require_mfa_all = !form.require_mfa_all"
              >
                <span class="toggle-knob"></span>
              </button>
            </div>

            <div class="toggle-row">
              <div>
                <div class="toggle-title">IP allowlist for super admins</div>
                <div class="toggle-sub">Only allow listed IPs to access super routes</div>
              </div>
              <button
                class="toggle-switch"
                :class="{ 'toggle-on': form.ip_allowlist_enabled }"
                @click="form.ip_allowlist_enabled = !form.ip_allowlist_enabled"
              >
                <span class="toggle-knob"></span>
              </button>
            </div>
          </div>

          <div class="panel-grid" style="margin-top: 18px;">
            <div class="field">
              <label class="field-label">Session idle timeout (minutes)</label>
              <input v-model.number="form.session_idle_minutes" class="field-input" type="number" min="5" max="1440" />
            </div>
            <div class="field">
              <label class="field-label">Max failed logins before lockout</label>
              <input v-model.number="form.max_failed_logins" class="field-input" type="number" min="3" max="20" />
            </div>
            <div class="field field-full">
              <label class="field-label">IP allowlist (one CIDR or IP per line)</label>
              <textarea
                v-model="form.ip_allowlist"
                class="field-input field-textarea"
                rows="4"
                :placeholder="'196.201.214.0/24' + String.fromCharCode(10) + '41.90.64.10'"
              ></textarea>
              <div class="field-hint field-hint-warn">
                ⚠️ Enabling this with the wrong range will lock you out. Add your current IP first.
              </div>
            </div>
          </div>
        </div>

        <!-- ====================================================
             DANGER ZONE
             ==================================================== -->
        <div v-else-if="activeSection === 'danger'" class="panel-block panel-block-danger">
          <div class="panel-header">
            <div class="panel-icon panel-icon-red">
              <v-icon size="20" color="white">mdi-alert-octagon-outline</v-icon>
            </div>
            <div>
              <div class="panel-title">Danger zone</div>
              <div class="panel-sub">Irreversible operations — proceed with care</div>
            </div>
          </div>

          <div class="danger-list">
            <div class="danger-row">
              <div>
                <div class="danger-title">Clear all SMS logs</div>
                <div class="danger-sub">Removes every record from the SMS logs table</div>
              </div>
              <button class="danger-btn" @click="confirmDanger('clear_sms_logs')">
                Clear
              </button>
            </div>

            <div class="danger-row">
              <div>
                <div class="danger-title">Clear audit logs</div>
                <div class="danger-sub">Permanently delete all audit trail entries</div>
              </div>
              <button class="danger-btn" @click="confirmDanger('clear_audit_logs')">
                Clear
              </button>
            </div>

            <div class="danger-row">
              <div>
                <div class="danger-title">Deactivate all estate admins</div>
                <div class="danger-sub">Sets every non-super admin to inactive</div>
              </div>
              <button class="danger-btn" @click="confirmDanger('deactivate_estate_admins')">
                Deactivate
              </button>
            </div>
          </div>
        </div>

        <!-- Fallback (never shown) -->
        <div v-else class="panel-block">
          <div class="panel-title">Unknown section</div>
        </div>
      </section>
    </div>

    <!-- ============================================================
         DANGER CONFIRM DIALOG
         ============================================================ -->
    <v-dialog v-model="dangerDialog.show" max-width="440" persistent>
      <div class="confirm-card">
        <div class="confirm-icon">
          <v-icon size="26" color="#dc2626">mdi-alert-octagon-outline</v-icon>
        </div>
        <div class="confirm-title">{{ dangerDialog.title }}</div>
        <div class="confirm-text">{{ dangerDialog.text }}</div>
        <div class="confirm-actions">
          <button class="confirm-cancel" @click="dangerDialog.show = false">Cancel</button>
          <button
            class="confirm-proceed"
            :disabled="!!dangerDialog.confirmText && dangerDialog.input !== dangerDialog.confirmText"
            @click="executeDanger"
          >
            {{ dangerDialog.actionLabel }}
          </button>
        </div>
        <input
          v-if="dangerDialog.confirmText"
          v-model="dangerDialog.input"
          class="field-input"
          style="margin-top: 12px;"
          :placeholder="'Type ' + dangerDialog.confirmText + ' to confirm'"
        />
      </div>
    </v-dialog>

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

const DEFAULT_FORM = () => ({
  // platform
  platform_name: 'Makaazi',
  support_email: '',
  support_phone: '',
  currency: 'KES',
  timezone: 'Africa/Nairobi',
  date_format: 'DD/MM/YYYY',

  // sms (Advanta)
  sms_provider: 'advanta',
  sms_sender_id: 'INTEC',
  sms_partner_id: '4510',
  sms_api_key: '',
  sms_api_base: 'https://quicksms.advantasms.com',
  sms_template_approval: '',
  sms_template_payment: '',

  // email
  smtp_host: '',
  smtp_port: 587,
  smtp_user: '',
  smtp_pass: '',
  smtp_encryption: 'tls',
  mail_from_name: '',
  mail_from_email: '',

  // fees
  default_service_fee: 0,
  default_security_levy: 0,
  default_garbage_fee: 0,
  late_penalty_pct: 0,
  grace_period_days: 0,
  reminder_lead_days: 0,

  // security
  require_mfa_super: false,
  require_mfa_all: false,
  ip_allowlist_enabled: false,
  ip_allowlist: '',
  session_idle_minutes: 60,
  max_failed_logins: 5,
});

// Which form fields belong to which sidebar section
const SECTION_FIELDS = {
  platform: [
    'platform_name', 'support_email', 'support_phone',
    'currency', 'timezone', 'date_format',
  ],
  sms: [
    'sms_provider', 'sms_sender_id', 'sms_partner_id', 'sms_api_key',
    'sms_api_base', 'sms_template_approval', 'sms_template_payment',
  ],
  email: [
    'smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass',
    'smtp_encryption', 'mail_from_name', 'mail_from_email',
  ],
  fees: [
    'default_service_fee', 'default_security_levy', 'default_garbage_fee',
    'late_penalty_pct', 'grace_period_days', 'reminder_lead_days',
  ],
  security: [
    'require_mfa_super', 'require_mfa_all', 'ip_allowlist_enabled',
    'ip_allowlist', 'session_idle_minutes', 'max_failed_logins',
  ],
  danger: [],
};

export default {
  name: 'AdminSettings',
  layout: 'admin',

  data() {
    return {
      loading: false,
      saving: false,
      activeSection: 'platform',
      form: DEFAULT_FORM(),
      original: DEFAULT_FORM(),
      showSecrets: { sms: false, email: false },
      sections: [
        { key: 'platform', label: 'Platform', icon: 'mdi-office-building-outline' },
        { key: 'sms', label: 'SMS provider', icon: 'mdi-message-text-outline' },
        { key: 'email', label: 'Email / SMTP', icon: 'mdi-email-outline' },
        { key: 'fees', label: 'Fees & charges', icon: 'mdi-cash-multiple' },
        { key: 'security', label: 'Security', icon: 'mdi-shield-lock-outline' },
        { key: 'danger', label: 'Danger zone', icon: 'mdi-alert-octagon-outline' },
      ],
      dangerDialog: {
        show: false,
        action: '',
        title: '',
        text: '',
        actionLabel: 'Proceed',
        confirmText: '',
        input: '',
      },
      balanceInfo: null,
      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    dirty() {
      return JSON.stringify(this.form) !== JSON.stringify(this.original);
    },
    activeSectionCount() {
      return this.sections.length;
    },
  },

  mounted() {
    const auth = this.$fire?.auth;
    if (!auth) {
      console.error('Firebase auth not available');
      return;
    }

    const unsub = auth.onAuthStateChanged(async (user) => {
      unsub();
      if (!user) {
        this.$router.push('/admin/login');
        return;
      }
      await this.load();
    });
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
        const { data, status } = await axios.get(`${API}/admin/settings`, { headers });
        if (status === 200 && data && typeof data === 'object') {
          const merged = { ...DEFAULT_FORM(), ...data };
          this.form = merged;
          this.original = JSON.parse(JSON.stringify(merged));
        }
      } catch (err) {
        const s = err.response?.status;
        if (s === 401 || s === 403) {
          this.showSnackbar('Access denied — check admin account', 'error');
        } else {
          console.warn('Settings load failed:', err.message);
          this.showSnackbar('Could not load settings', 'error');
        }
      } finally {
        this.loading = false;
      }
    },

    async saveAll() {
      this.saving = true;
      try {
        const headers = await this.getAuthHeaders();
        const { status } = await axios.put(`${API}/admin/settings`, this.form, { headers });
        if (status === 200) {
          this.original = JSON.parse(JSON.stringify(this.form));
          this.showSnackbar('Settings saved', 'success');
        }
      } catch (err) {
        const s = err.response?.status;
        if (s === 401 || s === 403) {
          this.showSnackbar('Access denied', 'error');
        } else {
          console.warn('Settings save failed:', err.message);
          this.showSnackbar(
            err.response?.data?.error || 'Could not save settings',
            'error'
          );
        }
      } finally {
        this.saving = false;
      }
    },

    sectionDirty(key) {
      const fields = SECTION_FIELDS[key] || [];
      return fields.some(
        (f) => JSON.stringify(this.form[f]) !== JSON.stringify(this.original[f])
      );
    },

    async testSms() {
      try {
        const headers = await this.getAuthHeaders();
        const { data } = await axios.post(
          `${API}/admin/settings/test-sms`,
          {},
          { headers }
        );
        if (data?.ok) {
          this.showSnackbar(`Test SMS sent to ${data.to}`, 'success');
        } else {
          this.showSnackbar(data?.error || 'Test SMS failed', 'error');
        }
      } catch (err) {
        console.warn('Test SMS failed:', err.message);
        this.showSnackbar(
          err.response?.data?.error || 'Test SMS failed',
          'error'
        );
      }
    },

    async testEmail() {
      try {
        const headers = await this.getAuthHeaders();
        await axios.post(`${API}/admin/settings/test-email`, {}, { headers });
        this.showSnackbar('Test email dispatched', 'success');
      } catch (err) {
        console.warn('Test email failed:', err.message);
        this.showSnackbar(
          err.response?.data?.error || 'Test email failed',
          'error'
        );
      }
    },

    async checkBalance() {
      this.balanceInfo = { ok: true, text: 'Checking…' };
      try {
        const headers = await this.getAuthHeaders();
        const { data } = await axios.get(`${API}/admin/sms-balance`, { headers });
        if (data && data.ok) {
          const b = Number(data.balance) || 0;
          this.balanceInfo = {
            ok: true,
            text: `${b.toLocaleString('en-KE')} ${data.currency || 'KES'}`,
          };
        } else {
          this.balanceInfo = {
            ok: false,
            text: data?.error || 'Balance unavailable',
          };
        }
      } catch (err) {
        this.balanceInfo = {
          ok: false,
          text: err.response?.data?.error || err.message,
        };
      }
    },

    confirmDanger(action) {
      const map = {
        clear_sms_logs: {
          title: 'Clear all SMS logs?',
          text: 'Every SMS log record will be permanently removed. This cannot be undone.',
          actionLabel: 'Clear SMS logs',
          confirmText: 'DELETE SMS',
        },
        clear_audit_logs: {
          title: 'Clear all audit logs?',
          text: 'The entire audit trail will be permanently deleted. You will lose all history.',
          actionLabel: 'Clear audit logs',
          confirmText: 'DELETE AUDIT',
        },
        deactivate_estate_admins: {
          title: 'Deactivate all estate admins?',
          text: 'Every non-super admin will be set to inactive and logged out.',
          actionLabel: 'Deactivate admins',
          confirmText: 'DEACTIVATE',
        },
      };
      this.dangerDialog = {
        show: true,
        action,
        input: '',
        ...map[action],
      };
    },

    async executeDanger() {
      const { action, input } = this.dangerDialog;
      try {
        const headers = await this.getAuthHeaders();
        await axios.post(
          `${API}/admin/settings/danger`,
          { action, confirm: input },
          { headers }
        );
        this.dangerDialog.show = false;
        this.showSnackbar('Operation completed', 'success');
      } catch (err) {
        console.warn('Danger action failed:', err.message);
        this.showSnackbar(
          err.response?.data?.error || 'Operation failed',
          'error'
        );
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
.settings-page { display: flex; flex-direction: column; gap: 22px; }

/* Header */
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
.page-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.refresh-btn {
  color: #475569 !important; font-weight: 700 !important;
  font-size: 0.72rem !important; letter-spacing: 0.8px !important;
  text-transform: uppercase !important;
}
.refresh-btn:hover {
  color: #0f0d24 !important; background: rgba(15, 13, 36, 0.05) !important;
}
.save-btn {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%) !important;
  color: #ffffff !important;
  font-weight: 800 !important; font-size: 0.74rem !important;
  letter-spacing: 0.6px !important; text-transform: uppercase !important;
  box-shadow: 0 10px 24px -12px rgba(128, 81, 255, 0.7) !important;
}
.save-btn:disabled {
  background: #e2e8f0 !important; color: #94a3b8 !important;
  box-shadow: none !important;
}

/* Layout */
.settings-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 18px;
  align-items: start;
}

/* Sidebar nav */
.settings-nav {
  display: flex; flex-direction: column; gap: 4px;
  padding: 10px; background: #ffffff; border: 1px solid #e9edf3;
  border-radius: 16px; position: sticky; top: 20px;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}
.settings-nav-item {
  position: relative;
  display: flex; align-items: center; gap: 10px;
  padding: 11px 12px; border-radius: 10px;
  background: transparent; border: none; cursor: pointer;
  color: #475569; font-size: 0.82rem; font-weight: 700;
  font-family: inherit; text-align: left;
  transition: background 0.15s ease, color 0.15s ease;
}
.settings-nav-item:hover { background: #f1f5f9; color: #0f0d24; }
.settings-nav-item-active {
  background: rgba(128, 81, 255, 0.1) !important;
  color: #8051ff !important;
}
.dirty-dot {
  margin-left: auto;
  width: 7px; height: 7px; border-radius: 50%;
  background: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
}

/* Panel */
.settings-panel {
  background: #ffffff; border: 1px solid #e9edf3;
  border-radius: 18px; padding: 22px;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}
.panel-block { display: flex; flex-direction: column; gap: 20px; }
.panel-block-danger { border-top: 1px solid #fee2e2; padding-top: 18px; }

.panel-header { display: flex; align-items: center; gap: 14px; }
.panel-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.panel-icon-purple {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 8px 20px -10px rgba(128, 81, 255, 0.65);
}
.panel-icon-amber {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 8px 20px -10px rgba(245, 158, 11, 0.6);
}
.panel-icon-lime {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  box-shadow: 0 8px 20px -10px rgba(182, 255, 0, 0.7);
}
.panel-icon-blue {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  box-shadow: 0 8px 20px -10px rgba(59, 130, 246, 0.6);
}
.panel-icon-red {
  background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
  box-shadow: 0 8px 20px -10px rgba(220, 38, 38, 0.55);
}
.panel-title {
  font-size: 1rem; font-weight: 800; color: #0f0d24;
  letter-spacing: -0.3px;
}
.panel-sub { font-size: 0.78rem; color: #94a3b8; margin-top: 2px; font-weight: 500; }

/* Fields */
.panel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.field { display: flex; flex-direction: column; gap: 6px; position: relative; }
.field-full { grid-column: 1 / -1; }
.field-label {
  font-size: 0.68rem; font-weight: 800; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.9px;
}
.field-input {
  padding: 11px 14px; border-radius: 12px;
  border: 1px solid #e2e8f0; background: #f8fafc;
  font-size: 0.85rem; font-weight: 500; color: #0f0d24;
  outline: none; font-family: inherit; width: 100%;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.field-input:focus { border-color: #8051ff; background: #ffffff; }
.field-textarea { resize: vertical; min-height: 80px; line-height: 1.5; }
.field-hint {
  font-size: 0.72rem; color: #94a3b8; margin-top: 2px;
}
.field-hint-warn {
  color: #b45309;
  font-weight: 700;
}
.field-hint code {
  background: #f1f5f9; padding: 1px 6px; border-radius: 4px;
  font-size: 0.7rem; color: #8051ff; font-weight: 700;
  margin-right: 2px;
}
.field-toggle {
  position: absolute; right: 10px; top: 32px;
  background: none; border: none; cursor: pointer; color: #94a3b8;
  padding: 4px;
}
.field-toggle:hover { color: #0f0d24; }

/* Toggles */
.toggle-list { display: flex; flex-direction: column; gap: 14px; }
.toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; padding: 14px 16px;
  background: #f8fafc; border: 1px solid #e9edf3; border-radius: 12px;
}
.toggle-title { font-size: 0.85rem; font-weight: 800; color: #0f0d24; }
.toggle-sub { font-size: 0.74rem; color: #94a3b8; margin-top: 2px; font-weight: 500; }
.toggle-switch {
  position: relative; width: 44px; height: 24px; border-radius: 999px;
  background: #cbd5e1; border: none; cursor: pointer;
  transition: background 0.2s ease; flex-shrink: 0;
}
.toggle-switch.toggle-on {
  background: linear-gradient(135deg, #9b6cff, #8051ff);
  box-shadow: 0 4px 12px -4px rgba(128, 81, 255, 0.6);
}
.toggle-knob {
  position: absolute; top: 2px; left: 2px;
  width: 20px; height: 20px; border-radius: 50%; background: #ffffff;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 6px rgba(15, 13, 36, 0.15);
}
.toggle-switch.toggle-on .toggle-knob { transform: translateX(20px); }

/* Panel actions */
.panel-actions {
  display: flex; align-items: center; justify-content: flex-start;
  gap: 10px; flex-wrap: wrap;
  padding-top: 6px; border-top: 1px solid #f1f5f9;
}
.test-btn {
  color: #8051ff !important; font-weight: 700 !important;
  font-size: 0.76rem !important; letter-spacing: 0.4px !important;
  text-transform: uppercase !important;
}
.test-btn:hover { background: rgba(128, 81, 255, 0.06) !important; }

.balance-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 999px;
  background: rgba(239, 68, 68, 0.1); color: #b91c1c;
  font-size: 0.72rem; font-weight: 800;
  letter-spacing: 0.3px;
}
.balance-pill.balance-ok {
  background: rgba(122, 184, 0, 0.14); color: #3f6b00;
}

/* Danger */
.danger-list { display: flex; flex-direction: column; gap: 12px; }
.danger-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; padding: 16px 18px;
  background: #fff5f5; border: 1px solid #fee2e2; border-radius: 12px;
}
.danger-title { font-size: 0.85rem; font-weight: 800; color: #991b1b; }
.danger-sub { font-size: 0.74rem; color: #b91c1c; margin-top: 2px; font-weight: 500; opacity: 0.8; }
.danger-btn {
  padding: 9px 18px; border-radius: 999px;
  background: #ffffff; color: #dc2626;
  border: 1px solid #fecaca;
  font-size: 0.74rem; font-weight: 800;
  letter-spacing: 0.4px; text-transform: uppercase;
  cursor: pointer; font-family: inherit;
  transition: all 0.2s ease; flex-shrink: 0;
}
.danger-btn:hover {
  background: #dc2626; color: #ffffff; border-color: #dc2626;
  box-shadow: 0 8px 20px -10px rgba(220, 38, 38, 0.7);
}

/* Confirm dialog */
.confirm-card {
  background: #ffffff; border-radius: 18px; padding: 24px;
  box-shadow: 0 24px 48px -20px rgba(15, 13, 36, 0.4);
}
.confirm-icon {
  width: 52px; height: 52px; border-radius: 14px;
  background: #fff5f5; display: flex;
  align-items: center; justify-content: center; margin-bottom: 14px;
}
.confirm-title {
  font-size: 1.05rem; font-weight: 800; color: #0f0d24;
  letter-spacing: -0.3px;
}
.confirm-text {
  font-size: 0.85rem; color: #64748b; margin-top: 6px; line-height: 1.55;
}
.confirm-actions {
  display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;
}
.confirm-cancel {
  padding: 10px 20px; border-radius: 999px;
  background: transparent; border: 1px solid #e2e8f0;
  color: #475569; font-size: 0.78rem; font-weight: 800;
  letter-spacing: 0.4px; cursor: pointer; font-family: inherit;
  text-transform: uppercase;
}
.confirm-cancel:hover { background: #f8fafc; }
.confirm-proceed {
  padding: 10px 20px; border-radius: 999px;
  background: #dc2626; color: #ffffff; border: none;
  font-size: 0.78rem; font-weight: 800;
  letter-spacing: 0.4px; cursor: pointer; font-family: inherit;
  text-transform: uppercase;
  box-shadow: 0 10px 24px -12px rgba(220, 38, 38, 0.7);
  transition: all 0.2s ease;
}
.confirm-proceed:hover:not(:disabled) { background: #b91c1c; }
.confirm-proceed:disabled {
  background: #e2e8f0; color: #94a3b8; box-shadow: none; cursor: not-allowed;
}

/* Responsive */
@media (max-width: 900px) {
  .settings-layout { grid-template-columns: 1fr; }
  .settings-nav {
    position: static; flex-direction: row; overflow-x: auto;
    gap: 6px; padding: 8px;
  }
  .settings-nav-item { white-space: nowrap; padding: 9px 12px; font-size: 0.76rem; }
}
@media (max-width: 767px) {
  .settings-page { gap: 18px; }
  .page-title { font-size: 1.35rem; }
  .page-actions { width: 100%; }
  .save-btn, .refresh-btn { flex: 1; }
  .panel-grid { grid-template-columns: 1fr; }
  .settings-panel { padding: 18px; }
}
</style>