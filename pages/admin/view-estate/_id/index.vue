<template>
  <div class="view-estate-page">
    <!-- ============================================================
         LOADING
         ============================================================ -->
    <div v-if="loading && !estate" class="loading-wrap">
      <v-skeleton-loader type="article, actions" />
    </div>

    <!-- ============================================================
         ERROR
         ============================================================ -->
    <div v-else-if="!estate" class="error-card">
      <v-icon size="48" color="#94a3b8">mdi-alert-circle-outline</v-icon>
      <div class="error-title">Estate not found</div>
      <div class="error-text">The estate you're looking for doesn't exist or has been removed.</div>
      <button class="error-back-btn" @click="$router.push('/admin/estates')">
        <v-icon size="16" class="mr-1">mdi-arrow-left</v-icon>
        Back to estates
      </button>
    </div>

    <!-- ============================================================
         CONTENT
         ============================================================ -->
    <template v-else>
      <!-- Back link -->
      <button class="back-link" @click="$router.push('/admin/estates')">
        <v-icon size="16">mdi-arrow-left</v-icon>
        All estates
      </button>

      <!-- Hero header -->
      <div class="estate-hero">
        <div class="hero-cover" :style="coverStyle">
          <div class="hero-overlay"></div>
          <div class="hero-content">
            <div class="hero-avatar">
              <span>{{ initialsOf(estate.estate_name) }}</span>
            </div>
            <div class="hero-text">
              <div class="hero-name-row">
                <h1 class="hero-name">{{ estate.estate_name }}</h1>
                <span v-if="sub" class="hero-badge" :class="subStatusClass(sub.status)">
                  {{ sub.status }}
                </span>
                <span v-else class="hero-badge badge-inactive">Not subscribed</span>
              </div>
              <div class="hero-meta">
                <span class="hero-urn">
                  <v-icon size="13">mdi-identifier</v-icon>
                  {{ estate.estate_urn }}
                </span>
                <span class="hero-dot">·</span>
                <span class="hero-loc">
                  <v-icon size="13">mdi-map-marker-outline</v-icon>
                  {{ estate.estate_location || 'No location' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="hero-actions">
          <button class="hero-btn hero-btn-ghost" @click="openEdit">
            <v-icon size="16" class="mr-2">mdi-pencil-outline</v-icon>
            Edit
          </button>
          <button class="hero-btn hero-btn-ghost" @click="copyUrn">
            <v-icon size="16" class="mr-2">mdi-content-copy</v-icon>
            Copy URN
          </button>
          <button class="hero-btn hero-btn-danger" @click="removeEstate">
            <v-icon size="16" class="mr-2">mdi-delete-outline</v-icon>
            Remove
          </button>
        </div>
      </div>

      <!-- KPI grid -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon kpi-icon-purple">
            <v-icon size="18" color="white">mdi-home-group</v-icon>
          </div>
          <div class="kpi-body">
            <div class="kpi-label">Households</div>
            <div class="kpi-value">{{ residents.length }}</div>
            <div class="kpi-sub">{{ pendingResidents }} pending</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-icon-lime">
            <v-icon size="18" color="#0A0A14">mdi-shield-account-outline</v-icon>
          </div>
          <div class="kpi-body">
            <div class="kpi-label">Officials</div>
            <div class="kpi-value">{{ officials.length }}</div>
            <div class="kpi-sub">{{ chairmenCount }} chairmen</div>
          </div>
        </div>

        <div class="kpi-card kpi-card-highlight">
          <div class="kpi-icon kpi-icon-white">
            <v-icon size="18" color="#0A0A14">mdi-cash-multiple</v-icon>
          </div>
          <div class="kpi-body">
            <div class="kpi-label">Total collected</div>
            <div class="kpi-value">
              <span class="currency">KES</span>
              {{ formatNumShort(stats.total_collected) }}
            </div>
            <div class="kpi-sub">Lifetime</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-icon-blue">
            <v-icon size="18" color="white">mdi-credit-card-outline</v-icon>
          </div>
          <div class="kpi-body">
            <div class="kpi-label">Subscription</div>
            <div class="kpi-value">{{ sub ? sub.plan_name || 'Custom' : '—' }}</div>
            <div class="kpi-sub">
              {{ sub ? `KES ${sub.monthly_rate || 0}/mo` : 'No plan' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-wrap">
        <button
          v-for="t in tabs"
          :key="t.id"
          class="tab-btn"
          :class="{ 'tab-btn-active': activeTab === t.id }"
          @click="activeTab = t.id"
        >
          <v-icon size="16" class="mr-2">{{ t.icon }}</v-icon>
          {{ t.label }}
          <span v-if="t.count != null" class="tab-count">{{ t.count }}</span>
        </button>
      </div>

      <!-- ============================================================
           TAB: OVERVIEW
           ============================================================ -->
      <div v-if="activeTab === 'overview'" class="tab-panel">
        <div class="overview-grid">
          <div class="overview-main">
            <div class="panel-card">
              <div class="panel-head">
                <div class="panel-title">About this estate</div>
              </div>
              <div class="panel-body">
                <div class="detail-row">
                  <div class="detail-label">Estate name</div>
                  <div class="detail-value">{{ estate.estate_name }}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">URN</div>
                  <div class="detail-value mono">{{ estate.estate_urn }}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Location</div>
                  <div class="detail-value">{{ estate.estate_location || '—' }}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Latitude</div>
                  <div class="detail-value mono">{{ estate.latitude || '—' }}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Longitude</div>
                  <div class="detail-value mono">{{ estate.longitude || '—' }}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Created</div>
                  <div class="detail-value">{{ fmtDate(estate.created_at) }}</div>
                </div>
              </div>
            </div>

            <div class="panel-card">
              <div class="panel-head">
                <div class="panel-title">Officials</div>
                <button class="panel-action" @click="activeTab = 'officials'">
                  Manage
                  <v-icon size="14">mdi-arrow-right</v-icon>
                </button>
              </div>
              <div class="panel-body">
                <div v-if="!officials.length" class="panel-empty">
                  No officials added yet.
                </div>
                <div
                  v-for="o in officials.slice(0, 4)"
                  :key="o.official_id"
                  class="mini-row"
                >
                  <div class="mini-avatar" :class="avatarClass(o.role)">
                    {{ initialsOf(o.full_name) }}
                  </div>
                  <div class="mini-info">
                    <div class="mini-name">{{ o.full_name }}</div>
                    <div class="mini-sub">{{ o.role }} · {{ o.contact_number }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="overview-side">
            <div class="panel-card">
              <div class="panel-head">
                <div class="panel-title">Subscription</div>
              </div>
              <div class="panel-body">
                <div v-if="!sub" class="panel-empty">
                  No subscription attached to this estate.
                </div>
                <template v-else>
                  <div class="sub-status" :class="subStatusClass(sub.status)">
                    <span class="sub-status-dot"></span>
                    {{ sub.status }}
                  </div>
                  <div class="detail-row compact">
                    <div class="detail-label">Plan</div>
                    <div class="detail-value">{{ sub.plan_name || '—' }}</div>
                  </div>
                  <div class="detail-row compact">
                    <div class="detail-label">Monthly</div>
                    <div class="detail-value">KES {{ sub.monthly_rate || 0 }}</div>
                  </div>
                  <div class="detail-row compact">
                    <div class="detail-label">Amount paid</div>
                    <div class="detail-value">KES {{ formatNum(sub.amount_paid || 0) }}</div>
                  </div>
                  <div class="detail-row compact">
                    <div class="detail-label">Period</div>
                    <div class="detail-value">
                      {{ fmtDate(sub.start_date) }} → {{ fmtDate(sub.end_date) }}
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <div class="panel-card">
              <div class="panel-head">
                <div class="panel-title">Address fields</div>
              </div>
              <div class="panel-body">
                <div class="toggle-row">
                  <span>Show section</span>
                  <span class="toggle-state" :class="cfg.show_section ? 'on' : 'off'">
                    {{ cfg.show_section ? 'On' : 'Off' }}
                  </span>
                </div>
                <div class="toggle-row">
                  <span>Show court</span>
                  <span class="toggle-state" :class="cfg.show_court ? 'on' : 'off'">
                    {{ cfg.show_court ? 'On' : 'Off' }}
                  </span>
                </div>
                <div class="toggle-row">
                  <span>Show street</span>
                  <span class="toggle-state" :class="cfg.show_street ? 'on' : 'off'">
                    {{ cfg.show_street ? 'On' : 'Off' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================
           TAB: RESIDENTS
           ============================================================ -->
      <div v-if="activeTab === 'residents'" class="tab-panel">
        <div class="panel-card">
          <div class="panel-head">
            <div class="panel-title">
              Residents
              <span class="panel-count">{{ residents.length }}</span>
            </div>
            <div class="panel-tools">
              <input
                v-model="resSearch"
                class="mini-search"
                type="text"
                placeholder="Search…"
              />
              <select v-model="resStatus" class="mini-select">
                <option value="">All</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div class="panel-body no-pad">
            <div v-if="loading && !residents.length" class="panel-loading">
              <v-skeleton-loader type="list-item-avatar-two-line" />
              <v-skeleton-loader type="list-item-avatar-two-line" />
            </div>

            <div v-else-if="!residents.length" class="panel-empty">
              No households registered for this estate yet.
            </div>

            <div v-else-if="!filteredResidents.length" class="panel-empty">
              No residents match this filter.
            </div>

            <div
              v-else
              v-for="r in filteredResidents"
              :key="r.household_id"
              class="resident-row"
            >
              <div class="resident-avatar" :class="residentAvatarClass(r)">
                {{ initialsOf(r.primary_owner) }}
              </div>
              <div class="resident-body">
                <div class="resident-name-row">
                  <span class="resident-name">{{ r.primary_owner }}</span>
                  <span
                    class="status-pill"
                    :class="`status-${(r.status || '').toLowerCase()}`"
                  >
                    {{ r.status }}
                  </span>
                  <span v-if="r.is_official" class="official-mini-tag">
                    {{ r.official_role || 'Official' }}
                  </span>
                </div>
                <div class="resident-meta">
                  {{ r.contact_number }} · {{ r.house_number || '—' }} ·
                  {{ [r.section, r.court, r.street].filter(Boolean).join(' · ') }}
                </div>
              </div>
              <div class="resident-joined">{{ fmtDate(r.created_at) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================
           TAB: OFFICIALS
           ============================================================ -->
      <div v-if="activeTab === 'officials'" class="tab-panel">
        <div class="panel-card">
          <div class="panel-head">
            <div class="panel-title">
              Officials
              <span class="panel-count">{{ officials.length }}</span>
            </div>
            <button class="panel-action primary" @click="openNewOfficial">
              <v-icon size="14" class="mr-1">mdi-plus</v-icon>
              Add official
            </button>
          </div>
          <div class="panel-body no-pad">
            <div v-if="!officials.length" class="panel-empty">
              No officials added yet.
            </div>
            <div
              v-for="o in officials"
              :key="o.official_id"
              class="official-row"
            >
              <div class="official-avatar" :class="avatarClass(o.role)">
                {{ initialsOf(o.full_name) }}
              </div>
              <div class="official-body">
                <div class="official-name-row">
                  <span class="official-name">{{ o.full_name }}</span>
                  <span class="role-pill" :class="roleClass(o.role)">
                    {{ o.role }}
                  </span>
                </div>
                <div class="official-meta">
                  <v-icon size="12">mdi-phone-outline</v-icon>
                  {{ o.contact_number || '—' }}
                </div>
              </div>
              <button class="row-icon-btn" @click="removeOfficial(o)">
                <v-icon size="16">mdi-delete-outline</v-icon>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================
           TAB: SETTINGS
           ============================================================ -->
      <div v-if="activeTab === 'settings'" class="tab-panel">
        <div class="settings-grid">
          <div class="panel-card">
            <div class="panel-head">
              <div class="panel-title">Address fields</div>
            </div>
            <div class="panel-body">
              <div class="setting-row">
                <div>
                  <div class="setting-label">Show Section</div>
                  <div class="setting-sub">Residents enter their section</div>
                </div>
                <button
                  class="switch"
                  :class="{ 'switch-on': localCfg.show_section }"
                  @click="localCfg.show_section = !localCfg.show_section"
                >
                  <span class="switch-knob"></span>
                </button>
              </div>
              <div class="setting-row">
                <div>
                  <div class="setting-label">Show Court</div>
                  <div class="setting-sub">Residents enter their court</div>
                </div>
                <button
                  class="switch"
                  :class="{ 'switch-on': localCfg.show_court }"
                  @click="localCfg.show_court = !localCfg.show_court"
                >
                  <span class="switch-knob"></span>
                </button>
              </div>
              <div class="setting-row">
                <div>
                  <div class="setting-label">Show Street</div>
                  <div class="setting-sub">Residents enter their street</div>
                </div>
                <button
                  class="switch"
                  :class="{ 'switch-on': localCfg.show_street }"
                  @click="localCfg.show_street = !localCfg.show_street"
                >
                  <span class="switch-knob"></span>
                </button>
              </div>
              <button
                class="save-btn"
                :disabled="savingCfg"
                @click="saveAddressConfig"
              >
                <v-icon v-if="savingCfg" size="14" class="mr-2 spin">mdi-loading</v-icon>
                Save address config
              </button>
            </div>
          </div>

          <div class="panel-card">
            <div class="panel-head">
              <div class="panel-title">
                Service charges
                <span class="panel-count">{{ charges.length }}</span>
              </div>
            </div>
            <div class="panel-body">
              <div v-if="!charges.length" class="panel-empty">No charges configured.</div>
              <div v-for="c in charges" :key="c.charges_id" class="charge-row">
                <div>
                  <div class="charge-type">{{ c.charge_type }}</div>
                  <div class="charge-sub">
                    {{ c.frequency }} · KES {{ formatNum(c.amount) }}
                  </div>
                </div>
                <button class="row-icon-btn" @click="removeCharge(c)">
                  <v-icon size="16">mdi-delete-outline</v-icon>
                </button>
              </div>
              <div class="add-form">
                <input v-model="newCharge.type" class="form-input-sm" placeholder="Type" />
                <input
                  v-model="newCharge.amount"
                  class="form-input-sm"
                  type="number"
                  placeholder="Amount"
                />
                <select v-model="newCharge.frequency" class="form-input-sm">
                  <option>Monthly</option>
                  <option>Quarterly</option>
                  <option>Yearly</option>
                  <option>One-time</option>
                </select>
                <button
                  class="save-btn inline"
                  :disabled="!canAddCharge"
                  @click="addCharge"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div class="panel-card">
            <div class="panel-head">
              <div class="panel-title">
                Sections
                <span class="panel-count">{{ sections.length }}</span>
              </div>
            </div>
            <div class="panel-body">
              <div v-if="!sections.length" class="panel-empty">No sections.</div>
              <div class="tag-wrap">
                <span v-for="s in sections" :key="s.id" class="tag">
                  {{ s.section_name }}
                  <button class="tag-remove" @click="removeSection(s)">×</button>
                </span>
              </div>
              <div class="add-form">
                <input v-model="newSection" class="form-input-sm" placeholder="Section name" />
                <button
                  class="save-btn inline"
                  :disabled="!newSection"
                  @click="addSection"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div class="panel-card">
            <div class="panel-head">
              <div class="panel-title">
                Courts
                <span class="panel-count">{{ courts.length }}</span>
              </div>
            </div>
            <div class="panel-body">
              <div v-if="!courts.length" class="panel-empty">No courts.</div>
              <div class="tag-wrap">
                <span v-for="c in courts" :key="c.id" class="tag">
                  {{ c.court_name }}
                  <button class="tag-remove" @click="removeCourt(c)">×</button>
                </span>
              </div>
              <div class="add-form">
                <input v-model="newCourt" class="form-input-sm" placeholder="Court name" />
                <button
                  class="save-btn inline"
                  :disabled="!newCourt"
                  @click="addCourt"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div class="panel-card">
            <div class="panel-head">
              <div class="panel-title">
                Streets
                <span class="panel-count">{{ streets.length }}</span>
              </div>
            </div>
            <div class="panel-body">
              <div v-if="!streets.length" class="panel-empty">No streets.</div>
              <div class="tag-wrap">
                <span v-for="s in streets" :key="s.id" class="tag">
                  {{ s.street_name }}
                  <button class="tag-remove" @click="removeStreet(s)">×</button>
                </span>
              </div>
              <div class="add-form">
                <input v-model="newStreet" class="form-input-sm" placeholder="Street name" />
                <button
                  class="save-btn inline"
                  :disabled="!newStreet"
                  @click="addStreet"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================
           EDIT DIALOG
           ============================================================ -->
      <v-dialog
        v-if="editDialog"
        v-model="editDialog"
        max-width="520"
        content-class="est-dialog-content"
      >
        <div class="est-dialog-card">
          <div class="est-dialog-header">
            <div>
              <div class="est-dialog-title">Edit estate</div>
              <div class="est-dialog-sub">Update the estate details</div>
            </div>
            <button class="est-dialog-close" @click="closeEdit">
              <v-icon size="20" color="white">mdi-close</v-icon>
            </button>
          </div>

          <div class="est-dialog-body">
            <div class="form-row">
              <label class="form-label">Estate name</label>
              <input v-model="editForm.estate_name" class="form-input" type="text" />
            </div>
            <div class="form-row">
              <label class="form-label">Location</label>
              <input v-model="editForm.estate_location" class="form-input" type="text" />
            </div>
            <div class="form-grid">
              <div class="form-row">
                <label class="form-label">Latitude</label>
                <input v-model="editForm.latitude" class="form-input" type="text" />
              </div>
              <div class="form-row">
                <label class="form-label">Longitude</label>
                <input v-model="editForm.longitude" class="form-input" type="text" />
              </div>
            </div>
            <div class="form-row">
              <label class="form-label">Logo URL</label>
              <input v-model="editForm.logo_url" class="form-input" type="text" />
            </div>
            <div class="form-row">
              <label class="form-label">Cover image URL</label>
              <input v-model="editForm.estate_image" class="form-input" type="text" />
            </div>
          </div>

          <div class="est-dialog-footer">
            <button class="dialog-btn ghost" @click="closeEdit">Cancel</button>
            <button class="dialog-btn primary" :disabled="savingEdit" @click="saveEdit">
              <v-icon v-if="savingEdit" size="14" class="mr-2 spin">mdi-loading</v-icon>
              Save changes
            </button>
          </div>
        </div>
      </v-dialog>

      <!-- ============================================================
           NEW OFFICIAL DIALOG
           ============================================================ -->
      <v-dialog
        v-model="officialDialog"
        max-width="520"
        content-class="est-dialog-content"
        persistent
      >
        <div class="est-dialog-card">
          <div class="est-dialog-header">
            <div>
              <div class="est-dialog-title">New official</div>
              <div class="est-dialog-sub">Add an official to this estate</div>
            </div>
            <button class="est-dialog-close" @click="officialDialog = false">
              <v-icon size="20" color="white">mdi-close</v-icon>
            </button>
          </div>

          <div class="est-dialog-body">
            <div class="form-row">
              <label class="form-label">Full name</label>
              <input v-model="newOfficial.full_name" class="form-input" type="text" />
            </div>
            <div class="form-row">
              <label class="form-label">Phone number</label>
              <input v-model="newOfficial.contact_number" class="form-input" type="tel" />
            </div>
            <div class="form-row">
              <label class="form-label">Role</label>
              <select v-model="newOfficial.role" class="form-input">
                <option>Chairman</option>
                <option>Secretary</option>
                <option>Treasurer</option>
                <option>Committee Member</option>
                <option>Caretaker</option>
              </select>
            </div>
            <div class="form-row">
              <label class="form-label">Firebase UID <span class="label-hint">optional</span></label>
              <input v-model="newOfficial.uid" class="form-input" type="text" />
            </div>
          </div>

          <div class="est-dialog-footer">
            <button class="dialog-btn ghost" @click="officialDialog = false">Cancel</button>
            <button
              class="dialog-btn primary"
              :disabled="!canAddOfficial || savingOfficial"
              @click="saveNewOfficial"
            >
              <v-icon v-if="savingOfficial" size="14" class="mr-2 spin">mdi-loading</v-icon>
              Add official
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
import numeral from 'numeral';

const API = 'https://makaaziserver22.up.railway.app/api';

export default {
  name: 'AdminViewEstate',
  layout: 'admin',

  data() {
    return {
      loading: true,
      estate: null,
      addressConfig: null,
      charges: [],
      officials: [],
      sections: [],
      courts: [],
      streets: [],
      stats: {},
      residents: [],
      subscription: null,

      activeTab: 'overview',
      resSearch: '',
      resStatus: '',

      localCfg: { show_section: true, show_court: true, show_street: true },
      savingCfg: false,

      newCharge: { type: '', amount: '', frequency: 'Monthly' },
      newSection: '',
      newCourt: '',
      newStreet: '',

      editDialog: false,
      editForm: {
        estate_name: '',
        estate_location: '',
        latitude: '',
        longitude: '',
        logo_url: '',
        estate_image: '',
      },
      savingEdit: false,

      officialDialog: false,
      newOfficial: {
        full_name: '',
        contact_number: '',
        role: 'Chairman',
        uid: '',
      },
      savingOfficial: false,

      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    estateId() {
      return this.$route.params.id;
    },
    sub() {
      return this.subscription;
    },
    cfg() {
      return {
        show_section: this.addressConfig ? !!this.addressConfig.show_section : true,
        show_court: this.addressConfig ? !!this.addressConfig.show_court : true,
        show_street: this.addressConfig ? !!this.addressConfig.show_street : true,
      };
    },
    coverStyle() {
      const img = this.estate?.estate_image;
      if (!img) {
        return { background: 'linear-gradient(135deg, #0f0d24 0%, #2b1256 100%)' };
      }
      return {
        backgroundImage: `url(${img})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    },
    tabs() {
      return [
        { id: 'overview', label: 'Overview', icon: 'mdi-view-dashboard-outline' },
        { id: 'residents', label: 'Residents', icon: 'mdi-home-group', count: this.residents.length },
        { id: 'officials', label: 'Officials', icon: 'mdi-shield-account-outline', count: this.officials.length },
        { id: 'settings', label: 'Settings', icon: 'mdi-cog-outline' },
      ];
    },
    chairmenCount() {
      return this.officials.filter((o) => (o.role || '').toLowerCase() === 'chairman').length;
    },
    pendingResidents() {
      return this.residents.filter((r) => r.status === 'Pending').length;
    },
    filteredResidents() {
      const q = (this.resSearch || '').trim().toLowerCase();
      return this.residents.filter((r) => {
        if (this.resStatus && r.status !== this.resStatus) return false;
        if (!q) return true;
        return (
          (r.primary_owner || '').toLowerCase().includes(q) ||
          (r.contact_number || '').toLowerCase().includes(q) ||
          (r.house_number || '').toLowerCase().includes(q)
        );
      });
    },
    canAddCharge() {
      return !!(this.newCharge.type && this.newCharge.amount);
    },
    canAddOfficial() {
      return !!(this.newOfficial.full_name && this.newOfficial.contact_number);
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

        try {
          const res = await axios.get(`${API}/admin/estates/${this.estateId}`, { headers });
          if (res.status === 200 && res.data) {
            const d = res.data;
            this.estate = d.estate || null;
            this.addressConfig = d.address_config || null;
            this.charges = d.charges || [];
            this.officials = d.officials || [];
            this.sections = d.sections || [];
            this.courts = d.courts || [];
            this.streets = d.streets || [];
            this.stats = d.stats || {};

            if (this.addressConfig) {
              this.localCfg = {
                show_section: !!this.addressConfig.show_section,
                show_court: !!this.addressConfig.show_court,
                show_street: !!this.addressConfig.show_street,
              };
            }
          }
        } catch (err) {
          console.error('[ViewEstate] estate fetch failed:', err.response?.status, err.response?.data || err.message);
        }

        try {
          const res = await axios.get(`${API}/admin/residents`, { headers });
          let list = [];
          if (Array.isArray(res.data)) list = res.data;
          else if (res.data?.residents) list = res.data.residents;
          else if (res.data?.data) list = res.data.data;

          this.residents = list.filter(
            (r) => String(r.estate_id) === String(this.estateId)
          );
        } catch (err) {
          console.error('[ViewEstate] residents fetch failed:', err.response?.status, err.response?.data || err.message);
          this.residents = [];
        }

        try {
          const res = await axios.get(`${API}/admin/subscriptions`, { headers });
          if (Array.isArray(res.data)) {
            this.subscription =
              res.data.find((s) => String(s.estate_id) === String(this.estateId)) || null;
          }
        } catch (err) {
          console.warn('[ViewEstate] subscription fetch failed:', err.message);
          this.subscription = null;
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
    formatNumShort(n) {
      const v = Number(n) || 0;
      if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
      if (v >= 1_000) return (v / 1_000).toFixed(0) + 'K';
      return numeral(v).format('0,0');
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
      return `role-${(role || '').toLowerCase().replace(/\s+/g, '-')}`;
    },
    residentAvatarClass(r) {
      if (r.is_official) return 'r-avatar-official';
      if (r.status === 'Pending') return 'r-avatar-pending';
      if (r.status === 'Rejected') return 'r-avatar-rejected';
      return 'r-avatar-active';
    },
    subStatusClass(status) {
      const s = (status || '').toLowerCase().replace('_', '');
      return `sub-${s}`;
    },

    async copyUrn() {
      try {
        await navigator.clipboard.writeText(this.estate.estate_urn);
        this.showSnackbar('URN copied', 'success');
      } catch {
        this.showSnackbar('Copy failed', 'error');
      }
    },

    openEdit() {
      this.savingEdit = false;
      this.editForm = {
        estate_name: this.estate?.estate_name || '',
        estate_location: this.estate?.estate_location || '',
        latitude: this.estate?.latitude || '',
        longitude: this.estate?.longitude || '',
        logo_url: this.estate?.logo_url || '',
        estate_image: this.estate?.estate_image || '',
      };
      this.editDialog = true;
    },

    closeEdit() {
      this.editForm = {
        estate_name: '',
        estate_location: '',
        latitude: '',
        longitude: '',
        logo_url: '',
        estate_image: '',
      };
      this.editDialog = false;
    },

    async saveEdit() {
      this.savingEdit = true;
      try {
        const headers = await this.getAuthHeaders();
        await axios.patch(
          `${API}/admin/estates/${this.estateId}`,
          this.editForm,
          { headers }
        );
        this.estate = { ...this.estate, ...this.editForm };

        this.closeEdit();

        this.$nextTick(() => {
          this.showSnackbar('Estate updated', 'success');
        });
      } catch (err) {
        console.warn('saveEdit failed:', err.message);
        this.showSnackbar(
          err.response?.data?.error || 'Could not save changes',
          'error'
        );
      } finally {
        this.savingEdit = false;
      }
    },

    async removeEstate() {
      const ok = window.confirm(
        `Remove "${this.estate.estate_name}"? This cannot be undone.`
      );
      if (!ok) return;
      try {
        const headers = await this.getAuthHeaders();
        await axios.delete(`${API}/admin/estates/${this.estateId}`, { headers });
        this.showSnackbar('Estate removed', 'success');
        setTimeout(() => this.$router.push('/admin/estates'), 600);
      } catch (err) {
        console.warn('removeEstate failed:', err.message);
        this.showSnackbar('Could not remove estate', 'error');
      }
    },

    async saveAddressConfig() {
      this.savingCfg = true;
      try {
        const headers = await this.getAuthHeaders();
        await axios.post(
          `${API}/admin/estates/${this.estateId}/address-config`,
          this.localCfg,
          { headers }
        );
        this.addressConfig = { ...this.addressConfig, ...this.localCfg };
        this.showSnackbar('Address config saved', 'success');
      } catch (err) {
        console.warn('saveAddressConfig failed:', err.message);
        this.showSnackbar('Could not save config', 'error');
      } finally {
        this.savingCfg = false;
      }
    },

    async addCharge() {
      if (!this.canAddCharge) return;
      try {
        const headers = await this.getAuthHeaders();
        const { data } = await axios.post(
          `${API}/admin/estates/${this.estateId}/charges`,
          {
            charge_type: this.newCharge.type,
            frequency: this.newCharge.frequency,
            amount: Number(this.newCharge.amount),
          },
          { headers }
        );
        this.charges.push({
          charges_id: data.charges_id,
          charge_type: this.newCharge.type,
          frequency: this.newCharge.frequency,
          amount: Number(this.newCharge.amount),
        });
        this.newCharge = { type: '', amount: '', frequency: 'Monthly' };
        this.showSnackbar('Charge added', 'success');
      } catch (err) {
        console.warn('addCharge failed:', err.message);
        this.showSnackbar('Could not add charge', 'error');
      }
    },
    async removeCharge(c) {
      if (!window.confirm(`Remove "${c.charge_type}" charge?`)) return;
      try {
        const headers = await this.getAuthHeaders();
        await axios.delete(`${API}/admin/charges/${c.charges_id}`, { headers });
        this.charges = this.charges.filter((x) => x.charges_id !== c.charges_id);
        this.showSnackbar('Charge removed', 'success');
      } catch (err) {
        console.warn('removeCharge failed:', err.message);
        this.showSnackbar('Could not remove charge', 'error');
      }
    },

    async addSection() {
      if (!this.newSection) return;
      try {
        const headers = await this.getAuthHeaders();
        const { data } = await axios.post(
          `${API}/admin/estates/${this.estateId}/sections`,
          { section_name: this.newSection },
          { headers }
        );
        this.sections.push({ id: data.id, section_name: this.newSection });
        this.newSection = '';
        this.showSnackbar('Section added', 'success');
      } catch (err) {
        this.showSnackbar(
          err.response?.data?.error || 'Could not add section',
          'error'
        );
      }
    },
    async removeSection(s) {
      if (!window.confirm(`Remove section "${s.section_name}"?`)) return;
      try {
        const headers = await this.getAuthHeaders();
        await axios.delete(`${API}/admin/sections/${s.id}`, { headers });
        this.sections = this.sections.filter((x) => x.id !== s.id);
        this.showSnackbar('Section removed', 'success');
      } catch (err) {
        this.showSnackbar('Could not remove section', 'error');
      }
    },

    async addCourt() {
      if (!this.newCourt) return;
      try {
        const headers = await this.getAuthHeaders();
        const { data } = await axios.post(
          `${API}/admin/estates/${this.estateId}/courts`,
          { court_name: this.newCourt },
          { headers }
        );
        this.courts.push({ id: data.id, court_name: this.newCourt });
        this.newCourt = '';
        this.showSnackbar('Court added', 'success');
      } catch (err) {
        this.showSnackbar(
          err.response?.data?.error || 'Could not add court',
          'error'
        );
      }
    },
    async removeCourt(c) {
      if (!window.confirm(`Remove court "${c.court_name}"?`)) return;
      try {
        const headers = await this.getAuthHeaders();
        await axios.delete(`${API}/admin/courts/${c.id}`, { headers });
        this.courts = this.courts.filter((x) => x.id !== c.id);
        this.showSnackbar('Court removed', 'success');
      } catch (err) {
        this.showSnackbar('Could not remove court', 'error');
      }
    },

    async addStreet() {
      if (!this.newStreet) return;
      try {
        const headers = await this.getAuthHeaders();
        const { data } = await axios.post(
          `${API}/admin/estates/${this.estateId}/streets`,
          { street_name: this.newStreet },
          { headers }
        );
        this.streets.push({ id: data.id, street_name: this.newStreet });
        this.newStreet = '';
        this.showSnackbar('Street added', 'success');
      } catch (err) {
        this.showSnackbar(
          err.response?.data?.error || 'Could not add street',
          'error'
        );
      }
    },
    async removeStreet(s) {
      if (!window.confirm(`Remove street "${s.street_name}"?`)) return;
      try {
        const headers = await this.getAuthHeaders();
        await axios.delete(`${API}/admin/streets/${s.id}`, { headers });
        this.streets = this.streets.filter((x) => x.id !== s.id);
        this.showSnackbar('Street removed', 'success');
      } catch (err) {
        this.showSnackbar('Could not remove street', 'error');
      }
    },

    openNewOfficial() {
      this.newOfficial = {
        full_name: '',
        contact_number: '',
        role: 'Chairman',
        uid: '',
      };
      this.officialDialog = true;
    },
    async saveNewOfficial() {
      if (!this.canAddOfficial || this.savingOfficial) return;
      this.savingOfficial = true;
      try {
        const headers = await this.getAuthHeaders();
        await axios.post(
          `${API}/admin/estates/${this.estateId}/first-official`,
          {
            full_name: this.newOfficial.full_name,
            contact_number: this.newOfficial.contact_number,
            role: this.newOfficial.role,
            uid: this.newOfficial.uid || null,
          },
          { headers }
        );
        this.officialDialog = false;
        this.showSnackbar('Official added', 'success');
        await this.load();
      } catch (err) {
        this.showSnackbar(
          err.response?.data?.error || 'Could not add official',
          'error'
        );
      } finally {
        this.savingOfficial = false;
      }
    },
    async removeOfficial(o) {
      if (!window.confirm(`Remove official "${o.full_name}"?`)) return;
      try {
        const headers = await this.getAuthHeaders();
        await axios.delete(`${API}/admin/officials/${o.official_id}`, { headers });
        this.officials = this.officials.filter((x) => x.official_id !== o.official_id);
        this.showSnackbar('Official removed', 'success');
      } catch (err) {
        this.showSnackbar('Could not remove official', 'error');
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
.view-estate-page {
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
  letter-spacing: 0.5px;
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
  transition: color 0.2s ease;
}

.back-link:hover { color: #8051ff; }

.estate-hero {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.hero-cover {
  position: relative;
  min-height: 160px;
  padding: 24px;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  box-shadow: 0 20px 40px -22px rgba(34, 16, 71, 0.55);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(15, 13, 36, 0.85) 0%, rgba(43, 18, 86, 0.7) 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 18px;
  width: 100%;
}

.hero-avatar {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  color: #0a0a14;
  font-size: 1.1rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.6px;
  flex-shrink: 0;
  box-shadow: 0 14px 28px -10px rgba(182, 255, 0, 0.75);
}

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

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 11px;
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.badge-inactive {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.75);
}

.sub-active { background: #b6ff00; color: #0a0a14; }
.sub-pending { background: #fbbf24; color: #0a0a14; }
.sub-expired { background: #fbbf24; color: #0a0a14; }
.sub-cancelled { background: #f87171; color: #450a0a; }
.sub-failed { background: #f87171; color: #450a0a; }

.hero-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 500;
  flex-wrap: wrap;
}

.hero-urn,
.hero-loc {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: ui-monospace, SFMono-Regular, monospace;
}

.hero-dot { color: rgba(255, 255, 255, 0.3); }

.hero-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
  border-radius: 11px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.3px;
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

.hero-btn-danger {
  background: rgba(239, 68, 68, 0.08);
  color: #b91c1c;
}

.hero-btn-danger:hover {
  background: rgba(239, 68, 68, 0.16);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
}

.kpi-card {
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

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px -14px rgba(15, 13, 36, 0.14);
}

.kpi-card-highlight {
  background: linear-gradient(140deg, #0a0a14 0%, #221047 55%, #2b1256 100%);
  border-color: transparent;
  box-shadow: 0 20px 40px -22px rgba(34, 16, 71, 0.55);
}

.kpi-card-highlight .kpi-label { color: rgba(255, 255, 255, 0.55); }
.kpi-card-highlight .kpi-value { color: #ffffff; }
.kpi-card-highlight .kpi-sub { color: rgba(255, 255, 255, 0.45); }
.kpi-card-highlight .currency { color: #b6ff00; }

.kpi-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-icon-purple {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 8px 20px -10px rgba(128, 81, 255, 0.65);
}

.kpi-icon-lime {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  box-shadow: 0 8px 20px -10px rgba(182, 255, 0, 0.7);
}

.kpi-icon-blue {
  background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
  box-shadow: 0 8px 20px -10px rgba(37, 99, 235, 0.6);
}

.kpi-icon-white {
  background: #ffffff;
  box-shadow: 0 8px 20px -10px rgba(255, 255, 255, 0.5);
}

.kpi-body { min-width: 0; }

.kpi-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  margin-bottom: 5px;
}

.kpi-value {
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.7px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.currency {
  font-size: 0.72rem;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 0.4px;
}

.kpi-sub {
  font-size: 0.68rem;
  color: #94a3b8;
  margin-top: 4px;
  font-weight: 600;
}

.tabs-wrap {
  display: flex;
  gap: 4px;
  padding: 5px;
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 14px;
  overflow-x: auto;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: 10px;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.tab-btn:hover { color: #0f0d24; background: #f1f5f9; }

.tab-btn-active {
  background: #0f0d24 !important;
  color: #ffffff !important;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 6px;
  margin-left: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  font-size: 0.62rem;
  font-weight: 800;
}

.tab-btn:not(.tab-btn-active) .tab-count {
  background: rgba(15, 13, 36, 0.08);
  color: #475569;
}

.tab-panel { animation: fadeIn 0.2s ease; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

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
  letter-spacing: -0.2px;
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

.panel-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: #8051ff;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.panel-action:hover { background: rgba(128, 81, 255, 0.08); }

.panel-action.primary {
  background: linear-gradient(135deg, #8051ff 0%, #9b6cff 100%);
  color: white;
  padding: 8px 14px;
  box-shadow: 0 8px 18px -8px rgba(128, 81, 255, 0.7);
}

.panel-action.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 22px -8px rgba(128, 81, 255, 0.85);
}

.panel-body {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-body.no-pad { padding: 0; gap: 0; }

.panel-loading { padding: 14px 20px; }

.panel-empty {
  font-size: 0.82rem;
  color: #94a3b8;
  font-weight: 500;
  padding: 20px;
  text-align: center;
}

.panel-tools {
  display: flex;
  gap: 8px;
  align-items: center;
}

.mini-search,
.mini-select {
  padding: 8px 12px;
  border-radius: 9px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 0.78rem;
  font-family: inherit;
  color: #0f0d24;
  outline: none;
  transition: border-color 0.2s ease;
}

.mini-search { min-width: 160px; }

.mini-search:focus,
.mini-select:focus {
  border-color: #8051ff;
  background: #ffffff;
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

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
}

.toggle-state {
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 999px;
}

.toggle-state.on {
  background: rgba(122, 184, 0, 0.14);
  color: #3f6b00;
}

.toggle-state.off {
  background: rgba(148, 163, 184, 0.16);
  color: #64748b;
}

.mini-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.mini-avatar {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.mini-info { min-width: 0; flex: 1; }

.mini-name {
  font-size: 0.84rem;
  font-weight: 700;
  color: #0f0d24;
}

.mini-sub {
  font-size: 0.7rem;
  color: #94a3b8;
  font-weight: 600;
  margin-top: 2px;
}

.sub-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.sub-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.sub-active { background: rgba(122, 184, 0, 0.14); color: #3f6b00; }
.sub-pending { background: rgba(245, 158, 11, 0.14); color: #b45309; }
.sub-expired { background: rgba(245, 158, 11, 0.14); color: #b45309; }
.sub-cancelled { background: rgba(239, 68, 68, 0.1); color: #b91c1c; }
.sub-failed { background: rgba(239, 68, 68, 0.1); color: #b91c1c; }

.resident-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.resident-row:last-child { border-bottom: none; }

.resident-avatar {
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

.r-avatar-active {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 8px 18px -10px rgba(128, 81, 255, 0.6);
}

.r-avatar-official {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  color: #0a0a14;
  box-shadow: 0 8px 18px -10px rgba(182, 255, 0, 0.65);
}

.r-avatar-pending {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 8px 18px -10px rgba(245, 158, 11, 0.6);
}

.r-avatar-rejected {
  background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
  box-shadow: 0 8px 18px -10px rgba(220, 38, 38, 0.55);
}

.resident-body { flex: 1; min-width: 0; }

.resident-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 3px;
}

.resident-name {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f0d24;
}

.status-pill {
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.status-approved { background: rgba(122, 184, 0, 0.14); color: #3f6b00; }
.status-pending { background: rgba(245, 158, 11, 0.14); color: #b45309; }
.status-rejected { background: rgba(239, 68, 68, 0.1); color: #b91c1c; }

.official-mini-tag {
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(128, 81, 255, 0.12);
  color: #5b21b6;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.resident-meta {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 500;
}

.resident-joined {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 600;
  flex-shrink: 0;
}

.official-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.official-row:last-child { border-bottom: none; }

.official-avatar {
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

.avatar-chairman {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  color: #0a0a14;
}

.avatar-secretary {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
}

.avatar-treasurer {
  background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
}

.avatar-caretaker {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
}

.avatar-default {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
}

.official-body { flex: 1; min-width: 0; }

.official-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 3px;
  flex-wrap: wrap;
}

.official-name {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f0d24;
}

.role-pill {
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.role-chairman { background: rgba(122, 184, 0, 0.14); color: #3f6b00; }
.role-secretary { background: rgba(128, 81, 255, 0.12); color: #5b21b6; }
.role-treasurer { background: rgba(37, 99, 235, 0.1); color: #1d4ed8; }
.role-caretaker { background: rgba(245, 158, 11, 0.14); color: #b45309; }
.role-committee-member { background: rgba(148, 163, 184, 0.16); color: #475569; }

.official-meta {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.row-icon-btn {
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

.row-icon-btn:hover {
  background: rgba(239, 68, 68, 0.08);
  color: #b91c1c;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 18px;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.setting-row:last-of-type { border-bottom: none; }

.setting-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f0d24;
}

.setting-sub {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 2px;
  font-weight: 500;
}

.switch {
  position: relative;
  width: 44px;
  height: 24px;
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
  width: 20px;
  height: 20px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(15, 13, 36, 0.2);
  transition: transform 0.2s ease;
}

.switch-on .switch-knob { transform: translateX(20px); }

.save-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 11px 16px;
  margin-top: 12px;
  border-radius: 11px;
  border: none;
  background: linear-gradient(135deg, #8051ff 0%, #9b6cff 100%);
  color: white;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  box-shadow: 0 8px 18px -8px rgba(128, 81, 255, 0.6);
}

.save-btn.inline {
  width: auto;
  padding: 10px 20px;
  margin-top: 0;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 22px -8px rgba(128, 81, 255, 0.85);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.charge-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
}

.charge-row:last-child { border-bottom: none; }

.charge-type {
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f0d24;
}

.charge-sub {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 2px;
  font-weight: 600;
}

.add-form {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
}

.form-input-sm {
  flex: 1;
  min-width: 90px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 0.78rem;
  font-weight: 500;
  color: #0f0d24;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s ease;
}

.form-input-sm:focus {
  border-color: #8051ff;
  background: #ffffff;
}

.tag-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(128, 81, 255, 0.08);
  color: #5b21b6;
  font-size: 0.72rem;
  font-weight: 700;
}

.tag-remove {
  background: transparent;
  border: none;
  color: inherit;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
  opacity: 0.7;
  font-family: inherit;
}

.tag-remove:hover { opacity: 1; }

::v-deep .est-dialog-content {
  overflow: visible !important;
  border-radius: 20px !important;
  margin: 16px auto !important;
  max-width: 520px !important;
  width: calc(100% - 32px) !important;
  max-height: calc(100vh - 32px) !important;
  display: flex !important;
  flex-direction: column !important;
}

.est-dialog-card {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  min-height: 0;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  width: 100%;
}

.est-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #0f0d24 0%, #2b1256 100%);
  color: white;
  flex-shrink: 0;
}

.est-dialog-title {
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.est-dialog-sub {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.65);
  margin-top: 3px;
}

.est-dialog-close {
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

.est-dialog-close:hover { background: rgba(255, 255, 255, 0.2); }

.est-dialog-body {
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

.est-dialog-footer {
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

.dialog-btn.ghost {
  background: transparent;
  color: #64748b;
}

.dialog-btn.ghost:hover {
  background: #f1f5f9;
  color: #0f0d24;
}

.dialog-btn.primary {
  background: linear-gradient(135deg, #8051ff 0%, #9b6cff 100%);
  color: white;
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.7);
}

.dialog-btn.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px -10px rgba(128, 81, 255, 0.85);
}

.dialog-btn.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.spin { animation: spin 1s linear infinite; }

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 767px) {
  .view-estate-page { gap: 18px; }

  .hero-name { font-size: 1.25rem; }
  .hero-cover { padding: 18px; min-height: 140px; }
  .hero-avatar { width: 54px; height: 54px; }

  .kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .kpi-card { padding: 14px 16px; gap: 10px; }
  .kpi-icon { width: 36px; height: 36px; }
  .kpi-value { font-size: 1.15rem; }

  .panel-tools { flex-direction: column; align-items: stretch; width: 100%; }
  .mini-search, .mini-select { width: 100%; min-width: 0; }

  .form-grid { grid-template-columns: 1fr; }

  .resident-joined { display: none; }
}
</style>