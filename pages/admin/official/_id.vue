<template>
  <div class="off-view-page">
    <!-- ============================================================
         BACK LINK
         ============================================================ -->
    <button class="back-link" @click="goBack">
      <v-icon size="16">mdi-arrow-left</v-icon>
      <span>All officials</span>
    </button>

    <!-- ============================================================
         LOADING
         ============================================================ -->
    <div v-if="loading" class="loading-block">
      <v-skeleton-loader
        type="article, list-item-avatar-three-line, list-item-three-line"
      />
    </div>

    <!-- ============================================================
         ERROR
         ============================================================ -->
    <div v-else-if="error" class="empty-card">
      <div class="empty-icon">
        <v-icon size="44" color="#ef4444">mdi-alert-circle-outline</v-icon>
      </div>
      <div class="empty-title">Could not load official</div>
      <div class="empty-text">{{ error }}</div>
      <button class="empty-clear-btn" @click="load">
        <v-icon size="16" class="mr-1">mdi-refresh</v-icon>
        Try again
      </button>
    </div>

    <!-- ============================================================
         CONTENT
         ============================================================ -->
    <template v-else-if="official">
      <!-- ============ HERO CARD ============ -->
      <div class="hero-card">
        <div class="hero-left">
          <div class="hero-avatar" :class="avatarClass(official.role)">
            <span>{{ initialsOf(official.full_name) }}</span>
          </div>
          <div class="hero-body">
            <div class="hero-name-row">
              <h1 class="hero-name">{{ official.full_name }}</h1>
              <span class="role-pill" :class="roleClass(official.role)">
                <v-icon size="12">{{ roleIcon(official.role) }}</v-icon>
                {{ official.role || 'Official' }}
              </span>
            </div>
            <div class="hero-meta">
              <span class="meta-item">
                <v-icon size="13">mdi-phone-outline</v-icon>
                {{ official.contact_number || '—' }}
              </span>
              <span class="meta-dot">·</span>
              <span class="meta-item">
                <v-icon size="13">mdi-office-building-outline</v-icon>
                {{ official.estate_name || 'Unknown estate' }}
              </span>
              <template v-if="official.estate_urn || official.estate_urn_full">
                <span class="meta-dot">·</span>
                <span class="meta-item hero-urn">
                  {{ official.estate_urn || official.estate_urn_full }}
                </span>
              </template>
            </div>
            <div class="hero-chips">
              <span v-if="official.uid" class="chip chip-success">
                <v-icon size="11">mdi-check-circle</v-icon>
                Firebase linked
              </span>
              <span v-else class="chip chip-warn">
                <v-icon size="11">mdi-link-variant-off</v-icon>
                Not linked
              </span>
              <span v-if="official.created_at" class="chip chip-muted">
                <v-icon size="11">mdi-calendar-outline</v-icon>
                Added {{ fmtDate(official.created_at) }}
              </span>
            </div>
          </div>
        </div>

        <div class="hero-actions">
          <button class="hero-btn hero-btn-ghost" @click="callOfficial">
            <v-icon size="15">mdi-phone-outline</v-icon>
            Call
          </button>
          <button class="hero-btn hero-btn-primary" @click="editOfficial">
            <v-icon size="15">mdi-pencil-outline</v-icon>
            Edit
          </button>
        </div>
      </div>

      <!-- ============ SUMMARY TILES ============ -->
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-icon summary-icon-purple">
            <v-icon size="18" color="white">mdi-shield-account-outline</v-icon>
          </div>
          <div class="summary-body">
            <div class="summary-label">Role</div>
            <div class="summary-value-sm">{{ official.role || '—' }}</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon summary-icon-blue">
            <v-icon size="18" color="white">mdi-office-building-outline</v-icon>
          </div>
          <div class="summary-body">
            <div class="summary-label">Estate</div>
            <div class="summary-value-sm">{{ official.estate_name || '—' }}</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon summary-icon-lime">
            <v-icon size="18" color="#0A0A14">mdi-account-check-outline</v-icon>
          </div>
          <div class="summary-body">
            <div class="summary-label">Account</div>
            <div class="summary-value-sm">
              {{ official.uid ? 'Linked' : 'Unlinked' }}
            </div>
          </div>
        </div>

        <div class="summary-card summary-card-highlight">
          <div class="summary-icon summary-icon-white">
            <v-icon size="18" color="#0A0A14">mdi-calendar-clock-outline</v-icon>
          </div>
          <div class="summary-body">
            <div class="summary-label">Added</div>
            <div class="summary-value-sm">{{ fmtDate(official.created_at) }}</div>
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
            <div class="panel-title">Official details</div>
            <div class="panel-sub">Identity and contact information</div>
          </div>
        </div>

        <div class="detail-grid">
          <div class="detail-item">
            <div class="detail-label">Full name</div>
            <div class="detail-value">{{ official.full_name || '—' }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">Role</div>
            <div class="detail-value">{{ official.role || '—' }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">Phone number</div>
            <div class="detail-value mono">{{ official.contact_number || '—' }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">Firebase UID</div>
            <div class="detail-value mono">
              {{ official.uid || '— not linked —' }}
            </div>
          </div>

          <div class="detail-item detail-span-2">
            <div class="detail-label">Estate</div>
            <div class="detail-value">
              {{ official.estate_name || '—' }}
              <span
                v-if="official.estate_urn || official.estate_urn_full"
                class="detail-sub mono"
              >
                · {{ official.estate_urn || official.estate_urn_full }}
              </span>
            </div>
          </div>

          <div class="detail-item">
            <div class="detail-label">Official ID</div>
            <div class="detail-value mono">#{{ official.official_id }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">Estate ID</div>
            <div class="detail-value mono">
              {{ official.estate_id ? '#' + official.estate_id : '—' }}
            </div>
          </div>
        </div>
      </div>

      <!-- ============ ACTIONS ============ -->
      <div class="panel-card">
        <div class="panel-head">
          <div class="panel-icon panel-icon-lime">
            <v-icon size="18" color="#0A0A14">mdi-lightning-bolt-outline</v-icon>
          </div>
          <div>
            <div class="panel-title">Actions</div>
            <div class="panel-sub">Manage this official's account</div>
          </div>
        </div>

        <div class="action-list">
          <button class="action-row" @click="callOfficial">
            <div class="action-icon action-icon-purple">
              <v-icon size="16" color="white">mdi-phone-outline</v-icon>
            </div>
            <div class="action-body">
              <div class="action-title">Call official</div>
              <div class="action-sub">
                Dial {{ official.contact_number || 'their number' }}
              </div>
            </div>
            <v-icon size="16" class="action-chevron">mdi-chevron-right</v-icon>
          </button>

          <button class="action-row" @click="editOfficial">
            <div class="action-icon action-icon-blue">
              <v-icon size="16" color="white">mdi-pencil-outline</v-icon>
            </div>
            <div class="action-body">
              <div class="action-title">Edit details</div>
              <div class="action-sub">Update name, role, or phone</div>
            </div>
            <v-icon size="16" class="action-chevron">mdi-chevron-right</v-icon>
          </button>

          <button class="action-row" @click="goToEstate">
            <div class="action-icon action-icon-slate">
              <v-icon size="16" color="white">mdi-office-building-outline</v-icon>
            </div>
            <div class="action-body">
              <div class="action-title">Open estate</div>
              <div class="action-sub">
                View the estate this official belongs to
              </div>
            </div>
            <v-icon size="16" class="action-chevron">mdi-chevron-right</v-icon>
          </button>

          <button
            v-if="!official.uid"
            class="action-row"
            @click="generateLink"
          >
            <div class="action-icon action-icon-lime">
              <v-icon size="16" color="#0A0A14">mdi-link-plus</v-icon>
            </div>
            <div class="action-body">
              <div class="action-title">Generate onboarding link</div>
              <div class="action-sub">
                Send this to the official to link their account
              </div>
            </div>
            <v-icon size="16" class="action-chevron">mdi-chevron-right</v-icon>
          </button>

          <button class="action-row action-row-danger" @click="confirmRemove">
            <div class="action-icon action-icon-red">
              <v-icon size="16" color="white">mdi-delete-outline</v-icon>
            </div>
            <div class="action-body">
              <div class="action-title">Remove official</div>
              <div class="action-sub">
                Permanently delete this official from the estate
              </div>
            </div>
            <v-icon size="16" class="action-chevron">mdi-chevron-right</v-icon>
          </button>
        </div>
      </div>
    </template>

    <!-- ============================================================
         EDIT DIALOG
         ============================================================ -->
    <v-dialog
      v-if="editDialog"
      v-model="editDialog"
      max-width="520"
      content-class="off-dialog-content"
    >
      <div class="off-dialog-card">
        <div class="off-dialog-header">
          <div>
            <div class="off-dialog-title">Edit official</div>
            <div class="off-dialog-sub">Update the official's details</div>
          </div>
          <button class="off-dialog-close" @click="editDialog = false">
            <v-icon size="20" color="white">mdi-close</v-icon>
          </button>
        </div>

        <div class="off-dialog-body">
          <div class="form-row">
            <label class="form-label">Full name</label>
            <input
              v-model="form.full_name"
              class="form-input"
              type="text"
              placeholder="e.g. Jane Wanjiku"
            />
          </div>

          <div class="form-row">
            <label class="form-label">Phone number</label>
            <input
              v-model="form.contact_number"
              class="form-input"
              type="tel"
              placeholder="e.g. 0712 345 678"
            />
          </div>

          <div class="form-row">
            <label class="form-label">Role</label>
            <select v-model="form.role" class="form-input">
              <option value="Chairman">Chairman</option>
              <option value="Secretary">Secretary</option>
              <option value="Treasurer">Treasurer</option>
              <option value="Committee Member">Committee Member</option>
              <option value="Caretaker">Caretaker</option>
            </select>
          </div>

          <div class="form-row">
            <label class="form-label">
              Firebase UID
              <span class="label-hint">optional</span>
            </label>
            <input
              v-model="form.uid"
              class="form-input"
              type="text"
              placeholder="Paste the Firebase UID if known"
            />
          </div>
        </div>

        <div class="off-dialog-footer">
          <button class="dialog-btn dialog-btn-ghost" @click="editDialog = false">
            Cancel
          </button>
          <button
            class="dialog-btn dialog-btn-primary"
            :disabled="!canSubmit || submitting"
            @click="submitEdit"
          >
            <v-icon v-if="submitting" size="16" class="mr-2 spin">mdi-loading</v-icon>
            {{ submitting ? 'Saving…' : 'Save changes' }}
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- ============================================================
         LINK DIALOG
         ============================================================ -->
    <v-dialog
      v-if="linkDialog"
      v-model="linkDialog"
      max-width="460"
      content-class="off-dialog-content"
    >
      <div class="off-dialog-card">
        <div class="off-dialog-header">
          <div>
            <div class="off-dialog-title">Onboarding link</div>
            <div class="off-dialog-sub">
              Share this with the official to link their account
            </div>
          </div>
          <button class="off-dialog-close" @click="linkDialog = false">
            <v-icon size="20" color="white">mdi-close</v-icon>
          </button>
        </div>

        <div class="off-dialog-body">
          <div class="link-box">
            <code>{{ generatedLink }}</code>
          </div>
          <div class="link-hint">
            Once the official uses this link, their Firebase UID will be bound to
            this record and they'll show as <strong>Linked</strong>.
          </div>
        </div>

        <div class="off-dialog-footer">
          <button class="dialog-btn dialog-btn-ghost" @click="linkDialog = false">
            Close
          </button>
          <button class="dialog-btn dialog-btn-primary" @click="copyLink">
            <v-icon size="16" class="mr-2">mdi-content-copy</v-icon>
            Copy link
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- ============================================================
         REMOVE CONFIRM DIALOG
         ============================================================ -->
    <v-dialog
      v-model="confirmDialog"
      max-width="440"
      content-class="off-dialog-content"
    >
      <div class="off-dialog-card">
        <div
          class="off-dialog-header"
          style="background: linear-gradient(135deg, #b91c1c 0%, #ef4444 100%);"
        >
          <div>
            <div class="off-dialog-title">Remove official</div>
            <div class="off-dialog-sub">This action cannot be undone</div>
          </div>
          <button class="off-dialog-close" @click="confirmDialog = false">
            <v-icon size="20" color="white">mdi-close</v-icon>
          </button>
        </div>

        <div class="off-dialog-body">
          <p style="margin: 0; font-size: 0.9rem; color: #334155; line-height: 1.6;">
            You're about to remove
            <strong>{{ official?.full_name }}</strong> as
            <strong>{{ official?.role }}</strong> of
            <strong>{{ official?.estate_name }}</strong>. Their access to the estate
            console will be revoked immediately.
          </p>
        </div>

        <div class="off-dialog-footer">
          <button class="dialog-btn dialog-btn-ghost" @click="confirmDialog = false">
            Cancel
          </button>
          <button
            class="dialog-btn dialog-btn-danger"
            :disabled="removing"
            @click="removeOfficial"
          >
            <v-icon v-if="removing" size="16" class="mr-2 spin">mdi-loading</v-icon>
            {{ removing ? 'Removing…' : 'Remove official' }}
          </button>
        </div>
      </div>
    </v-dialog>

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
  name: 'AdminOfficialView',
  layout: 'admin',

  data() {
    return {
      loading: true,
      error: '',

      official: null,

      // Edit dialog
      editDialog: false,
      submitting: false,
      form: {
        full_name: '',
        contact_number: '',
        role: 'Chairman',
        uid: '',
      },

      // Link dialog
      linkDialog: false,
      generatedLink: '',

      // Remove dialog
      confirmDialog: false,
      removing: false,

      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    officialId() {
      return this.$route?.params?.id;
    },
    canSubmit() {
      return !!(this.form.full_name && this.form.contact_number);
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

    /**
     * Fetch a single official using the dedicated endpoint.
     * Falls back to list + filter if the single endpoint is unavailable.
     */
    async load() {
      if (!this.officialId) {
        this.error = 'Missing official ID in URL';
        this.loading = false;
        return;
      }

      this.loading = true;
      this.error = '';

      try {
        const headers = await this.getAuthHeaders();

        // Try the dedicated single endpoint first
        try {
          const { data } = await axios.get(
            `${API}/admin/officials/${this.officialId}`,
            { headers }
          );
          if (data && data.official_id) {
            this.official = data;
            return;
          }
        } catch (singleErr) {
          // If it's a 404 or 500, fall back to list-and-filter
          const code = singleErr.response?.status;
          if (code !== 404 && code !== 500) throw singleErr;
          console.warn(
            'GET /admin/officials/:id failed — falling back to list'
          );
        }

        // Fallback: fetch all and filter
        const { data } = await axios.get(`${API}/admin/officials`, { headers });
        if (!Array.isArray(data)) throw new Error('Unexpected response shape');

        const found = data.find(
          (o) => String(o.official_id) === String(this.officialId)
        );

        if (!found) {
          this.error = `No official found with ID ${this.officialId}`;
          this.official = null;
        } else {
          this.official = found;
        }
      } catch (err) {
        const s = err.response?.status;
        if (s === 401 || s === 403) {
          this.error = 'Access denied — check admin account';
        } else if (s === 404) {
          this.error = `No official found with ID ${this.officialId}`;
        } else {
          this.error = err.response?.data?.error || err.message || 'Network error';
        }
        console.warn('load official failed:', err.message);
      } finally {
        this.loading = false;
      }
    },

    // ---------- helpers ----------
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

    roleIcon(role) {
      const r = (role || '').toLowerCase();
      if (r === 'chairman') return 'mdi-crown';
      if (r === 'secretary') return 'mdi-note-text-outline';
      if (r === 'treasurer') return 'mdi-cash';
      if (r === 'caretaker') return 'mdi-key-outline';
      return 'mdi-account-outline';
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

    // ---------- actions ----------
    goBack() {
      this.$router.push('/admin/officials');
    },

    callOfficial() {
      const phone = this.official?.contact_number;
      if (phone) window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
    },

    goToEstate() {
  const id = this.official?.estate_id;
  if (!id) {
    this.showSnackbar('No estate linked to this official', 'error');
    return;
  }
  const path = `/admin/official-estate/${this.official.official_id}`;
  this.$router.push(path).catch((err) => {
    if (err && err.name !== 'NavigationDuplicated') {
      console.error('Navigation failed:', err);
      this.showSnackbar('Could not open estate page', 'error');
    }
  });
},

    editOfficial() {
      if (!this.official) return;
      this.form = {
        full_name: this.official.full_name || '',
        contact_number: this.official.contact_number || '',
        role: this.official.role || 'Chairman',
        uid: this.official.uid || '',
      };
      this.editDialog = true;
    },

    async submitEdit() {
      if (!this.canSubmit || this.submitting) return;
      this.submitting = true;
      try {
        const headers = await this.getAuthHeaders();
        await axios.patch(
          `${API}/admin/officials/${this.official.official_id}`,
          {
            full_name: this.form.full_name,
            contact_number: this.form.contact_number,
            role: this.form.role,
            uid: this.form.uid || null,
          },
          { headers }
        );

        this.official = {
          ...this.official,
          full_name: this.form.full_name,
          contact_number: this.form.contact_number,
          role: this.form.role,
          uid: this.form.uid || null,
        };

        this.editDialog = false;
        this.showSnackbar('Official updated', 'success');
      } catch (err) {
        console.warn('edit failed:', err.message);
        this.showSnackbar(
          err.response?.data?.error || 'Could not save changes',
          'error'
        );
      } finally {
        this.submitting = false;
      }
    },

    generateLink() {
      if (!this.official) return;
      const token = btoa(
        JSON.stringify({ oid: this.official.official_id, ts: Date.now() })
      ).replace(/=+$/, '');
      this.generatedLink = `${window.location.origin}/official/claim?token=${token}`;
      this.linkDialog = true;
    },

    async copyLink() {
      try {
        await navigator.clipboard.writeText(this.generatedLink);
        this.showSnackbar('Link copied', 'success');
      } catch {
        this.showSnackbar('Could not copy — copy manually', 'error');
      }
    },

    confirmRemove() {
      this.confirmDialog = true;
    },

    async removeOfficial() {
      if (!this.official || this.removing) return;
      this.removing = true;
      try {
        const headers = await this.getAuthHeaders();
        await axios.delete(
          `${API}/admin/officials/${this.official.official_id}`,
          { headers }
        );
        this.confirmDialog = false;
        this.showSnackbar('Official removed', 'success');
        setTimeout(() => this.goBack(), 600);
      } catch (err) {
        console.warn('remove failed:', err.message);
        this.showSnackbar(
          err.response?.data?.error || 'Could not remove official',
          'error'
        );
      } finally {
        this.removing = false;
      }
    },

    showSnackbar(text, color = 'success') {
      this.snackbar = { show: true, text, color };
    },
  },
};
</script>

<style scoped>
.off-view-page {
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
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 28px;
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.04);
  flex-wrap: wrap;
}
.hero-left {
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 0;
  flex: 1;
}
.hero-avatar {
  width: 80px;
  height: 80px;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: 1px;
  flex-shrink: 0;
}
.avatar-chairman {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  color: #0a0a14;
  box-shadow: 0 14px 30px -12px rgba(182, 255, 0, 0.75);
}
.avatar-secretary {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 14px 30px -12px rgba(128, 81, 255, 0.7);
}
.avatar-treasurer {
  background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
  box-shadow: 0 14px 30px -12px rgba(37, 99, 235, 0.65);
}
.avatar-caretaker {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 14px 30px -12px rgba(245, 158, 11, 0.65);
}
.avatar-default {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  box-shadow: 0 14px 30px -12px rgba(100, 116, 139, 0.55);
}
.hero-body {
  min-width: 0;
  flex: 1;
}
.hero-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.hero-name {
  font-size: 1.55rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.6px;
  margin: 0;
  line-height: 1.15;
}
.role-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.5px;
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
.hero-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 0.82rem;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 12px;
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
.hero-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}
.chip-success {
  background: rgba(122, 184, 0, 0.14);
  color: #3f6b00;
}
.chip-warn {
  background: rgba(245, 158, 11, 0.14);
  color: #b45309;
}
.chip-muted {
  background: #f1f5f9;
  color: #475569;
}

.hero-actions {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  flex-shrink: 0;
  flex-wrap: wrap;
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
.detail-sub {
  font-size: 0.78rem;
  color: #94a3b8;
  font-weight: 600;
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
.action-row-danger:hover {
  background: rgba(239, 68, 68, 0.04);
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
.action-icon-slate {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  box-shadow: 0 8px 18px -8px rgba(100, 116, 139, 0.5);
}
.action-icon-lime {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  box-shadow: 0 8px 18px -8px rgba(182, 255, 0, 0.6);
}
.action-icon-red {
  background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
  box-shadow: 0 8px 18px -8px rgba(220, 38, 38, 0.55);
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
.action-row-danger:hover .action-chevron {
  color: #dc2626;
}

/* ============================================================
   DIALOG
   ============================================================ */
::v-deep .off-dialog-content {
  overflow: visible !important;
  border-radius: 20px !important;
  margin: 16px auto !important;
  max-width: 520px !important;
  width: calc(100% - 32px) !important;
  max-height: calc(100vh - 32px) !important;
  display: flex !important;
  flex-direction: column !important;
}
.off-dialog-card {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  min-height: 0;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  width: 100%;
}
.off-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #0f0d24 0%, #2b1256 100%);
  color: white;
  flex-shrink: 0;
}
.off-dialog-title {
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: -0.3px;
}
.off-dialog-sub {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.65);
  margin-top: 3px;
}
.off-dialog-close {
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
  flex-shrink: 0;
}
.off-dialog-close:hover {
  background: rgba(255, 255, 255, 0.2);
}
.off-dialog-body {
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
.form-label {
  font-size: 0.7rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.label-hint {
  font-size: 0.62rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: none;
  letter-spacing: 0;
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
.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.off-dialog-footer {
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
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: all 0.2s ease;
}
.dialog-btn-ghost {
  background: transparent;
  color: #64748b;
}
.dialog-btn-ghost:hover {
  background: #f1f5f9;
  color: #0f0d24;
}
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
.dialog-btn-danger {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  color: white;
  box-shadow: 0 10px 22px -10px rgba(220, 38, 38, 0.7);
}
.dialog-btn-danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px -10px rgba(220, 38, 38, 0.85);
}
.dialog-btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}
.link-box {
  padding: 14px 16px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 11px;
  word-break: break-all;
}
.link-box code {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.78rem;
  color: #0f0d24;
}
.link-hint {
  font-size: 0.78rem;
  color: #64748b;
  line-height: 1.5;
}
.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 767px) {
  .off-view-page {
    gap: 18px;
  }
  .hero-card {
    padding: 20px;
  }
  .hero-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
  .hero-avatar {
    width: 64px;
    height: 64px;
    border-radius: 18px;
    font-size: 1.15rem;
  }
  .hero-name {
    font-size: 1.25rem;
  }
  .hero-actions {
    width: 100%;
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
  .action-row {
    padding: 12px 18px;
    gap: 12px;
  }
  .action-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
  }
  .action-title {
    font-size: 0.82rem;
  }
  .action-sub {
    font-size: 0.7rem;
  }
}
</style>