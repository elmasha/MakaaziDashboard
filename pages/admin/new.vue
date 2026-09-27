<template>
  <div class="new-estate-page">
    <!-- Back link -->
    <button class="back-link" @click="$router.push('/admin/estates')">
      <v-icon size="16">mdi-arrow-left</v-icon>
      All estates
    </button>

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Create a new estate</h1>
        <p class="page-sub">
          Onboard an estate onto the platform. You can add officials, charges, and sections after.
        </p>
      </div>
    </div>

    <!-- Step indicator -->
    <div class="steps-wrap">
      <div
        v-for="(s, i) in steps"
        :key="s.id"
        class="step-item"
        :class="{ 'step-item-active': step === i + 1, 'step-item-done': step > i + 1 }"
      >
        <div class="step-circle">
          <v-icon v-if="step > i + 1" size="16" color="white">mdi-check</v-icon>
          <span v-else>{{ i + 1 }}</span>
        </div>
        <div class="step-label">{{ s.label }}</div>
      </div>
    </div>

    <!-- ============================================================
         STEP 1 — Basic details
         ============================================================ -->
    <div v-if="step === 1" class="step-panel">
      <div class="panel-card">
        <div class="panel-head">
          <div class="panel-title">
            <v-icon size="18" color="#8051FF" class="mr-2">mdi-office-building-outline</v-icon>
            Basic details
          </div>
        </div>
        <div class="panel-body">
          <div class="form-row">
            <label class="form-label">Estate name <span class="required">*</span></label>
            <input
              v-model="form.estate_name"
              class="form-input"
              type="text"
              placeholder="e.g. Lenana Estate"
              @input="suggestUrnPrefix"
            />
          </div>

          <div class="form-row">
            <label class="form-label">Location</label>
            <input
              v-model="form.estate_location"
              class="form-input"
              type="text"
              placeholder="e.g. Nairobi, Ngong Road"
            />
          </div>

          <div class="form-grid">
            <div class="form-row">
              <label class="form-label">Latitude</label>
              <input
                v-model="form.latitude"
                class="form-input"
                type="text"
                placeholder="e.g. -1.2921"
              />
            </div>
            <div class="form-row">
              <label class="form-label">Longitude</label>
              <input
                v-model="form.longitude"
                class="form-input"
                type="text"
                placeholder="e.g. 36.8219"
              />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label">
              URN prefix
              <span class="label-hint">auto-generated from estate name</span>
            </label>
            <input
              v-model="form.urn_prefix"
              class="form-input form-input-readonly"
              type="text"
              placeholder="Auto-generated"
              readonly
              tabindex="-1"
            />
            <div class="urn-preview">
              <span class="urn-preview-label">Will generate:</span>
              <span class="urn-preview-value">{{ urnPreview }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================
         STEP 2 — Images
         ============================================================ -->
    <div v-if="step === 2" class="step-panel">
      <div class="panel-card">
        <div class="panel-head">
          <div class="panel-title">
            <v-icon size="18" color="#8051FF" class="mr-2">mdi-image-multiple-outline</v-icon>
            Estate visuals
          </div>
        </div>
        <div class="panel-body">
          <div class="form-row">
            <label class="form-label">Cover image</label>
            <div class="upload-area" :class="{ 'upload-area-filled': form.estate_image }">
              <img v-if="form.estate_image" :src="form.estate_image" class="upload-preview" />
              <div v-else class="upload-placeholder">
                <v-icon size="32" color="#94a3b8">mdi-image-outline</v-icon>
                <div class="upload-hint">Upload a cover photo of the estate</div>
              </div>
              <div class="upload-overlay">
                <label class="upload-btn">
                  <v-icon size="16" class="mr-1">
                    {{ form.estate_image ? 'mdi-pencil' : 'mdi-plus' }}
                  </v-icon>
                  {{ form.estate_image ? 'Change' : 'Choose file' }}
                  <input
                    type="file"
                    accept="image/*"
                    @change="(e) => handleFile(e, 'estate_image')"
                    hidden
                  />
                </label>
                <button
                  v-if="form.estate_image"
                  class="upload-btn upload-btn-danger"
                  @click="form.estate_image = ''"
                >
                  <v-icon size="16" class="mr-1">mdi-close</v-icon>
                  Remove
                </button>
              </div>
            </div>
            <div v-if="uploadingImage === 'estate_image'" class="upload-progress">
              <v-icon size="14" class="mr-2 spin">mdi-loading</v-icon>
              Uploading…
            </div>
          </div>

          <div class="form-row">
            <label class="form-label">Logo</label>
            <div class="upload-area upload-area-logo" :class="{ 'upload-area-filled': form.logo_url }">
              <img v-if="form.logo_url" :src="form.logo_url" class="upload-preview upload-preview-logo" />
              <div v-else class="upload-placeholder">
                <v-icon size="28" color="#94a3b8">mdi-shield-outline</v-icon>
                <div class="upload-hint">Estate logo</div>
              </div>
              <div class="upload-overlay">
                <label class="upload-btn">
                  <v-icon size="16" class="mr-1">
                    {{ form.logo_url ? 'mdi-pencil' : 'mdi-plus' }}
                  </v-icon>
                  {{ form.logo_url ? 'Change' : 'Choose file' }}
                  <input
                    type="file"
                    accept="image/*"
                    @change="(e) => handleFile(e, 'logo_url')"
                    hidden
                  />
                </label>
                <button
                  v-if="form.logo_url"
                  class="upload-btn upload-btn-danger"
                  @click="form.logo_url = ''"
                >
                  <v-icon size="16" class="mr-1">mdi-close</v-icon>
                  Remove
                </button>
              </div>
            </div>
            <div v-if="uploadingImage === 'logo_url'" class="upload-progress">
              <v-icon size="14" class="mr-2 spin">mdi-loading</v-icon>
              Uploading…
            </div>
          </div>

          <div class="hint-box">
            <v-icon size="16" color="#8051FF" class="mr-2">mdi-information-outline</v-icon>
            Images are uploaded to Firebase Storage and linked to the estate. Accepted formats: JPG, PNG, WebP.
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================
         STEP 3 — Address fields
         ============================================================ -->
    <div v-if="step === 3" class="step-panel">
      <div class="panel-card">
        <div class="panel-head">
          <div class="panel-title">
            <v-icon size="18" color="#8051FF" class="mr-2">mdi-map-marker-multiple-outline</v-icon>
            Address fields
          </div>
        </div>
        <div class="panel-body">
          <p class="panel-desc">
            Choose which address fields residents must fill in when they self-register.
          </p>

          <div class="setting-row">
            <div>
              <div class="setting-label">Section</div>
              <div class="setting-sub">e.g. Lower, Upper, Phase 2</div>
            </div>
            <button
              class="switch"
              :class="{ 'switch-on': form.address_config.show_section }"
              @click="form.address_config.show_section = !form.address_config.show_section"
            >
              <span class="switch-knob"></span>
            </button>
          </div>

          <div class="setting-row">
            <div>
              <div class="setting-label">Court</div>
              <div class="setting-sub">e.g. Court 23, Dam Court</div>
            </div>
            <button
              class="switch"
              :class="{ 'switch-on': form.address_config.show_court }"
              @click="form.address_config.show_court = !form.address_config.show_court"
            >
              <span class="switch-knob"></span>
            </button>
          </div>

          <div class="setting-row">
            <div>
              <div class="setting-label">Street</div>
              <div class="setting-sub">e.g. G1, Ngina, 122</div>
            </div>
            <button
              class="switch"
              :class="{ 'switch-on': form.address_config.show_street }"
              @click="form.address_config.show_street = !form.address_config.show_street"
            >
              <span class="switch-knob"></span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================
         STEP 4 — First official (optional)
         ============================================================ -->
    <div v-if="step === 4" class="step-panel">
      <div class="panel-card">
        <div class="panel-head">
          <div class="panel-title">
            <v-icon size="18" color="#8051FF" class="mr-2">mdi-shield-account-outline</v-icon>
            First official
            <span class="label-hint ml-2">optional</span>
          </div>
        </div>
        <div class="panel-body">
          <p class="panel-desc">
            Add a chairman or secretary to this estate. You can also do this later from the estate page.
          </p>

          <div class="form-row">
            <label class="form-label">Full name</label>
            <input
              v-model="form.first_official.full_name"
              class="form-input"
              type="text"
              placeholder="e.g. Jane Wanjiku"
            />
          </div>

          <div class="form-grid">
            <div class="form-row">
              <label class="form-label">Phone number</label>
              <input
                v-model="form.first_official.contact_number"
                class="form-input"
                type="tel"
                placeholder="e.g. 0712 345 678"
              />
            </div>
            <div class="form-row">
              <label class="form-label">Role</label>
              <select v-model="form.first_official.role" class="form-input">
                <option>Chairman</option>
                <option>Secretary</option>
                <option>Treasurer</option>
                <option>Committee Member</option>
                <option>Caretaker</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================
         STEP 5 — Review
         ============================================================ -->
    <div v-if="step === 5" class="step-panel">
      <div class="panel-card">
        <div class="panel-head">
          <div class="panel-title">
            <v-icon size="18" color="#8051FF" class="mr-2">mdi-check-circle-outline</v-icon>
            Review and create
          </div>
        </div>
        <div class="panel-body">
          <div class="review-grid">
            <div class="review-item">
              <div class="review-label">Estate name</div>
              <div class="review-value">{{ form.estate_name || '—' }}</div>
            </div>
            <div class="review-item">
              <div class="review-label">URN prefix</div>
              <div class="review-value mono">{{ effectiveUrnPrefix }}</div>
            </div>
            <div class="review-item">
              <div class="review-label">Location</div>
              <div class="review-value">{{ form.estate_location || '—' }}</div>
            </div>
            <div class="review-item">
              <div class="review-label">Coordinates</div>
              <div class="review-value mono">
                {{ form.latitude || '—' }}, {{ form.longitude || '—' }}
              </div>
            </div>
            <div class="review-item">
              <div class="review-label">Address fields</div>
              <div class="review-value">
                {{ addressFieldSummary }}
              </div>
            </div>
            <div class="review-item">
              <div class="review-label">First official</div>
              <div class="review-value">
                {{ form.first_official.full_name || 'Not set' }}
              </div>
            </div>
          </div>

          <div v-if="form.estate_image || form.logo_url" class="review-images">
            <div v-if="form.estate_image" class="review-image-wrap">
              <div class="review-image-label">Cover</div>
              <img :src="form.estate_image" class="review-image" />
            </div>
            <div v-if="form.logo_url" class="review-image-wrap">
              <div class="review-image-label">Logo</div>
              <img :src="form.logo_url" class="review-image review-image-logo" />
            </div>
          </div>

          <div v-if="error" class="error-box">
            <v-icon size="16" color="#b91c1c" class="mr-2">mdi-alert-circle-outline</v-icon>
            {{ error }}
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================
         Nav bar
         ============================================================ -->
    <div class="nav-bar">
      <button
        class="nav-btn nav-btn-ghost"
        :disabled="step === 1"
        @click="step -= 1"
      >
        <v-icon size="16" class="mr-1">mdi-arrow-left</v-icon>
        Back
      </button>

      <div class="nav-bar-center">
        Step {{ step }} of {{ steps.length }}
      </div>

      <button
        v-if="step < steps.length"
        class="nav-btn nav-btn-primary"
        :disabled="!canAdvance"
        @click="step += 1"
      >
        Next
        <v-icon size="16" class="ml-1">mdi-arrow-right</v-icon>
      </button>
      <button
        v-else
        class="nav-btn nav-btn-success"
        :disabled="!canCreate || submitting"
        @click="submit"
      >
        <v-icon v-if="submitting" size="16" class="mr-1 spin">mdi-loading</v-icon>
        <v-icon v-else size="16" class="mr-1">mdi-check</v-icon>
        {{ submitting ? 'Creating…' : 'Create estate' }}
      </button>
    </div>

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
  </div>
</template>

<script>
import axios from 'axios';

const API = 'https://makaaziserver22.up.railway.app/api';

export default {
  name: 'AdminNewEstate',
  layout: 'admin',

  data() {
    return {
      step: 1,
      submitting: false,
      uploadingImage: null,
      error: '',

      // Frozen at page load so the URN preview doesn't jitter on re-render
      urnPreviewSeed: Date.now(),
      urnPreviewRand: Math.floor(Math.random() * 99999).toString().padStart(5, '0'),

      steps: [
        { id: 'basic', label: 'Basic details' },
        { id: 'images', label: 'Images' },
        { id: 'address', label: 'Address fields' },
        { id: 'official', label: 'First official' },
        { id: 'review', label: 'Review' },
      ],

      form: {
        estate_name: '',
        estate_location: '',
        latitude: '',
        longitude: '',
        urn_prefix: '',
        estate_image: '',
        logo_url: '',
        address_config: {
          show_section: true,
          show_court: true,
          show_street: true,
        },
        first_official: {
          full_name: '',
          contact_number: '',
          role: 'Chairman',
        },
      },

      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    canAdvance() {
      if (this.step === 1) return !!this.form.estate_name.trim();
      return true;
    },
    canCreate() {
      return !!this.form.estate_name.trim();
    },
    addressFieldSummary() {
      const c = this.form.address_config;
      const on = [];
      if (c.show_section) on.push('Section');
      if (c.show_court) on.push('Court');
      if (c.show_street) on.push('Street');
      return on.length ? on.join(' · ') : 'None';
    },

    /**
     * The prefix that will actually be sent to the backend.
     * Derived from `form.urn_prefix` (which is auto-filled) with a
     * fallback to the same derivation rule if it's ever blank.
     */
    effectiveUrnPrefix() {
      const raw = (this.form.urn_prefix || '').trim();
      if (raw) {
        return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5) || 'EST';
      }

      const name = (this.form.estate_name || '').trim();
      if (!name) return 'EST';

      const words = name
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .split(/\s+/)
        .filter(Boolean);

      if (words.length >= 2) {
        return words.map((w) => w[0]).join('').toUpperCase().slice(0, 5);
      }

      return name.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 5) || 'EST';
    },

    /**
     * Stable preview URN — frozen timestamp + random so it doesn't re-render
     * on every keystroke.
     */
    urnPreview() {
      return `${this.effectiveUrnPrefix}-${this.urnPreviewSeed}-${this.urnPreviewRand}`;
    },
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
     * Auto-fill the URN prefix from the estate name.
     * Always reflects the current name — user cannot override it.
     */
    suggestUrnPrefix() {
      const name = (this.form.estate_name || '').trim();

      if (!name) {
        this.form.urn_prefix = '';
        return;
      }

      const words = name
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .split(/\s+/)
        .filter(Boolean);

      if (words.length >= 2) {
        this.form.urn_prefix = words
          .map((w) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 5);
        return;
      }

      const stripped = name.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 5);
      this.form.urn_prefix = stripped || '';
    },

    /* ---------------- Image upload ---------------- */
    async handleFile(event, field) {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        this.showSnackbar('Only image files are allowed', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.showSnackbar('Image must be under 5MB', 'error');
        return;
      }

      this.uploadingImage = field;
      try {
        const storage = this.$fire?.storage;
        if (!storage) {
          throw new Error('Firebase Storage not available');
        }

        const ext = file.name.split('.').pop();
        const path = `estates/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const ref = storage.ref().child(path);

        const snapshot = await ref.put(file);
        const url = await snapshot.ref.getDownloadURL();
        this.form[field] = url;
        this.showSnackbar('Image uploaded', 'success');
      } catch (err) {
        console.error('upload failed:', err);
        this.showSnackbar(err.message || 'Upload failed', 'error');
      } finally {
        this.uploadingImage = null;
        event.target.value = '';
      }
    },

    /* ---------------- Submit ---------------- */
    async submit() {
      if (!this.canCreate || this.submitting) return;
      this.submitting = true;
      this.error = '';

      try {
        const headers = await this.getAuthHeaders();

        const payload = {
          estate_name: this.form.estate_name.trim(),
          estate_location: this.form.estate_location.trim() || null,
          latitude: this.form.latitude ? Number(this.form.latitude) : null,
          longitude: this.form.longitude ? Number(this.form.longitude) : null,
          urn_prefix: this.effectiveUrnPrefix,
          estate_image: this.form.estate_image || null,
          logo_url: this.form.logo_url || null,
          address_config: {
            show_section: this.form.address_config.show_section ? 1 : 0,
            show_court: this.form.address_config.show_court ? 1 : 0,
            show_street: this.form.address_config.show_street ? 1 : 0,
          },
        };

        const { data: created } = await axios.post(
          `${API}/admin/estates`,
          payload,
          { headers }
        );

        const estateId = created.estate_id;

        // Create the first official if provided
        const fo = this.form.first_official;
        if (fo.full_name.trim() && fo.contact_number.trim()) {
          try {
            await axios.post(
              `${API}/admin/estates/${estateId}/first-official`,
              {
                full_name: fo.full_name.trim(),
                contact_number: fo.contact_number.trim(),
                role: fo.role,
              },
              { headers }
            );
          } catch (err) {
            console.warn('first official creation failed:', err.message);
          }
        }

        this.showSnackbar('Estate created successfully', 'success');

        setTimeout(() => {
          this.$router.push(`/admin/view-estate/${estateId}`);
        }, 800);
      } catch (err) {
        console.error('create estate failed:', err);
        const msg = err.response?.data?.error || err.message || 'Could not create estate';
        this.error = msg;
        this.showSnackbar(msg, 'error');
      } finally {
        this.submitting = false;
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
.new-estate-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
  max-width: 820px;
  margin: 0 auto;
}

/* ============================================================
   BACK LINK
   ============================================================ */
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
  transition: color 0.2s ease;
}

.back-link:hover { color: #8051ff; }

/* ============================================================
   HEADER
   ============================================================ */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-title {
  font-size: 1.55rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.6px;
  margin: 0;
  line-height: 1.2;
}

.page-sub {
  font-size: 0.85rem;
  color: #64748b;
  margin: 6px 0 0;
  font-weight: 500;
  max-width: 520px;
}

/* ============================================================
   STEPS
   ============================================================ */
.steps-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
  overflow-x: auto;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.step-item-active,
.step-item-done {
  opacity: 1;
}

.step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 800;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.step-item-active .step-circle {
  background: #8051ff;
  color: #ffffff;
  box-shadow: 0 6px 16px -6px rgba(128, 81, 255, 0.65);
}

.step-item-done .step-circle {
  background: #b6ff00;
  color: #0a0a14;
}

.step-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #64748b;
  white-space: nowrap;
}

.step-item-active .step-label { color: #0f0d24; }
.step-item-done .step-label { color: #3f6b00; }

.step-item:not(:last-child)::after {
  content: "";
  display: block;
  width: 12px;
  height: 2px;
  background: #e2e8f0;
  margin-left: 6px;
  border-radius: 1px;
}

/* ============================================================
   PANEL
   ============================================================ */
.step-panel {
  animation: slideIn 0.25s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.panel-card {
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}

.panel-head {
  padding: 18px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.panel-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
  display: flex;
  align-items: center;
}

.panel-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.panel-desc {
  font-size: 0.82rem;
  color: #64748b;
  margin: 0 0 4px;
  line-height: 1.55;
}

/* ============================================================
   FORM
   ============================================================ */
.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-label {
  font-size: 0.72rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.required {
  color: #dc2626;
  font-weight: 800;
}

.label-hint {
  font-size: 0.64rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: none;
  letter-spacing: 0;
}

.form-input {
  padding: 12px 14px;
  border-radius: 11px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 0.9rem;
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
  box-shadow: 0 0 0 3px rgba(128, 81, 255, 0.08);
}

/* Locked / auto-generated field */
.form-input-readonly {
  background: #f1f5f9;
  color: #475569;
  cursor: not-allowed;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.form-input-readonly:focus {
  border-color: #e2e8f0;
  background: #f1f5f9;
  box-shadow: none;
}

.urn-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 0.72rem;
}

.urn-preview-label {
  color: #94a3b8;
  font-weight: 600;
}

.urn-preview-value {
  font-family: ui-monospace, SFMono-Regular, monospace;
  color: #475569;
  font-weight: 700;
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 6px;
}

/* ============================================================
   UPLOAD
   ============================================================ */
.upload-area {
  position: relative;
  min-height: 180px;
  border: 2px dashed #cbd5e1;
  border-radius: 14px;
  background: #f8fafc;
  overflow: hidden;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.upload-area:hover {
  border-color: #8051ff;
  background: rgba(128, 81, 255, 0.03);
}

.upload-area-filled {
  border-style: solid;
  border-color: #e2e8f0;
  background: #ffffff;
}

.upload-area-logo { min-height: 140px; }

.upload-preview {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.upload-preview-logo {
  height: 140px;
  object-fit: contain;
  padding: 20px;
  background: #f8fafc;
}

.upload-placeholder {
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.upload-area-logo .upload-placeholder { min-height: 140px; }

.upload-hint {
  font-size: 0.78rem;
  color: #94a3b8;
  font-weight: 600;
}

.upload-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 6px;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  border-radius: 9px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #334155;
  font-size: 0.72rem;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px -4px rgba(15, 13, 36, 0.15);
}

.upload-btn:hover {
  border-color: #8051ff;
  color: #8051ff;
}

.upload-btn-danger {
  background: rgba(239, 68, 68, 0.08);
  border-color: transparent;
  color: #b91c1c;
  box-shadow: none;
}

.upload-btn-danger:hover {
  background: rgba(239, 68, 68, 0.16);
  color: #b91c1c;
}

.upload-progress {
  display: flex;
  align-items: center;
  font-size: 0.76rem;
  color: #8051ff;
  font-weight: 700;
  margin-top: 6px;
}

.hint-box {
  display: flex;
  align-items: flex-start;
  padding: 12px 14px;
  border-radius: 11px;
  background: rgba(128, 81, 255, 0.06);
  font-size: 0.78rem;
  color: #475569;
  font-weight: 500;
  line-height: 1.55;
}

/* ============================================================
   SETTINGS (switches)
   ============================================================ */
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid #f1f5f9;
}

.setting-row:last-child { border-bottom: none; }

.setting-label {
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f0d24;
}

.setting-sub {
  font-size: 0.74rem;
  color: #94a3b8;
  margin-top: 3px;
  font-weight: 500;
}

.switch {
  position: relative;
  width: 46px;
  height: 26px;
  background: #cbd5e1;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.switch-on { background: #8051ff; }

.switch-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 22px;
  height: 22px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(15, 13, 36, 0.2);
  transition: transform 0.2s ease;
}

.switch-on .switch-knob { transform: translateX(20px); }

/* ============================================================
   REVIEW
   ============================================================ */
.review-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.review-item {
  padding: 12px 14px;
  background: #f8fafc;
  border-radius: 11px;
  border: 1px solid #f1f5f9;
}

.review-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  margin-bottom: 4px;
}

.review-value {
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f0d24;
  word-break: break-word;
}

.review-value.mono {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.78rem;
}

.review-images {
  display: flex;
  gap: 14px;
  margin-top: 4px;
}

.review-image-wrap {
  flex: 1;
  min-width: 0;
}

.review-image-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  margin-bottom: 6px;
}

.review-image {
  width: 100%;
  height: 110px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #e9edf3;
  display: block;
}

.review-image-logo {
  object-fit: contain;
  background: #f8fafc;
  padding: 12px;
}

.error-box {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  border-radius: 11px;
  background: rgba(239, 68, 68, 0.08);
  color: #b91c1c;
  font-size: 0.82rem;
  font-weight: 600;
  margin-top: 4px;
}

/* ============================================================
   NAV BAR
   ============================================================ */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
  position: sticky;
  bottom: 20px;
}

.nav-bar-center {
  font-size: 0.72rem;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
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

.nav-btn-ghost {
  background: transparent;
  color: #64748b;
}

.nav-btn-ghost:hover:not(:disabled) {
  background: #f1f5f9;
  color: #0f0d24;
}

.nav-btn-primary {
  background: linear-gradient(135deg, #8051ff 0%, #9b6cff 100%);
  color: #ffffff;
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.7);
}

.nav-btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px -10px rgba(128, 81, 255, 0.85);
}

.nav-btn-success {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  color: #0a0a14;
  box-shadow: 0 10px 22px -10px rgba(182, 255, 0, 0.7);
}

.nav-btn-success:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px -10px rgba(182, 255, 0, 0.85);
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.spin { animation: spin 1s linear infinite; }

@keyframes spin { to { transform: rotate(360deg); } }

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 767px) {
  .new-estate-page { gap: 18px; }
  .page-title { font-size: 1.25rem; }

  .steps-wrap { padding: 12px 14px; }
  .step-label { display: none; }
  .step-item:not(:last-child)::after { width: 8px; }

  .panel-body { padding: 18px; }
  .form-grid { grid-template-columns: 1fr; }
  .review-grid { grid-template-columns: 1fr; }
  .review-images { flex-direction: column; }

  .nav-bar { padding: 12px 14px; }
  .nav-btn { padding: 10px 16px; font-size: 0.76rem; }
  .nav-bar-center { display: none; }
}
</style>