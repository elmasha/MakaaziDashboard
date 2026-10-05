<template>
  <div class="officials-page">
    <!-- ============================================================
         PAGE HEADER
         ============================================================ -->
    <div class="page-header">
      <div>
        <div class="page-title-row">
          <h1 class="page-title">Officials</h1>
          <div class="count-pill">{{ filteredOfficials.length }}</div>
        </div>
        <p class="page-sub">
          {{ officials.length }} officials · {{ chairmenCount }} chairmen ·
          {{ linkedCount }} linked to Firebase
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
          Refresh
        </v-btn>
        <v-btn
          color="#B6FF00"
          rounded
          depressed
          class="text-capitalize new-official-btn"
          @click="openNewDialog"
        >
          <v-icon left small color="#0A0A14">mdi-plus</v-icon>
          <span style="color:#0A0A14; font-weight:700;">New official</span>
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
        Creating, updating, or removing officials will be sent to a super admin for approval.
      </div>
    </div>

    <!-- ============================================================
         SUMMARY CARDS
         ============================================================ -->
    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-icon summary-icon-purple">
          <v-icon size="18" color="white">mdi-shield-account-outline</v-icon>
        </div>
        <div class="summary-body">
          <div class="summary-label">Total officials</div>
          <div class="summary-value">{{ officials.length }}</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon summary-icon-lime">
          <v-icon size="18" color="#0A0A14">mdi-crown-outline</v-icon>
        </div>
        <div class="summary-body">
          <div class="summary-label">Chairmen</div>
          <div class="summary-value">{{ chairmenCount }}</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon summary-icon-blue">
          <v-icon size="18" color="white">mdi-office-building-outline</v-icon>
        </div>
        <div class="summary-body">
          <div class="summary-label">Estates covered</div>
          <div class="summary-value">{{ estatesCovered }}</div>
        </div>
      </div>

      <div class="summary-card summary-card-highlight">
        <div class="summary-icon summary-icon-white">
          <v-icon size="18" color="#0A0A14">mdi-link-variant</v-icon>
        </div>
        <div class="summary-body">
          <div class="summary-label">Firebase-linked</div>
          <div class="summary-value">{{ linkedCount }}</div>
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
          placeholder="Search by name, phone, estate, or URN"
        />
        <button v-if="search" class="search-clear" @click="search = ''">
          <v-icon size="16">mdi-close-circle</v-icon>
        </button>
      </div>

      <select v-model="estateFilter" class="filter-select">
        <option value="">All estates</option>
        <option v-for="e in estates" :key="e.estate_id" :value="e.estate_id">
          {{ e.estate_name }}
        </option>
      </select>

      <div class="filter-chips">
        <button
          v-for="r in roleOptions"
          :key="r.value"
          class="filter-chip"
          :class="{ 'filter-chip-active': roleFilter === r.value }"
          @click="roleFilter = r.value"
        >
          {{ r.label }}
        </button>
      </div>
    </div>

    <!-- ============================================================
         LOADING
         ============================================================ -->
    <div v-if="loading && !officials.length" class="loading-block">
      <v-skeleton-loader
        type="list-item-avatar-three-line, list-item-avatar-three-line, list-item-avatar-three-line"
      />
    </div>

    <!-- ============================================================
         EMPTY
         ============================================================ -->
    <div v-else-if="!filteredOfficials.length" class="empty-card">
      <div class="empty-icon">
        <v-icon size="44" color="#8051FF">
          {{ hasActiveFilters ? 'mdi-filter-off' : 'mdi-shield-account-outline' }}
        </v-icon>
      </div>
      <div class="empty-title">
        {{ hasActiveFilters ? 'No matching officials' : 'No officials yet' }}
      </div>
      <div class="empty-text">
        {{ hasActiveFilters
          ? 'Try clearing the filters or searching for something else.'
          : 'Officials will appear here once estates are onboarded.' }}
      </div>
      <button v-if="hasActiveFilters" class="empty-clear-btn" @click="clearFilters">
        <v-icon size="16" class="mr-1">mdi-close</v-icon>
        Clear filters
      </button>
      <button v-else class="empty-create-btn" @click="openNewDialog">
        <v-icon size="16" class="mr-1" color="#0A0A14">mdi-plus</v-icon>
        Add official
      </button>
    </div>

    <!-- ============================================================
         LIST
         ============================================================ -->
    <div v-else class="officials-card">
      <div
        v-for="o in filteredOfficials"
        :key="o.official_id"
        class="official-row"
        @click="openOfficial(o)"
      >
        <div class="official-avatar" :class="avatarClass(o.role)">
          <span>{{ initialsOf(o.full_name) }}</span>
        </div>

        <div class="official-body">
          <div class="official-name-row">
            <span class="official-name">{{ o.full_name }}</span>
            <span class="role-pill" :class="roleClass(o.role)">
              <v-icon size="11">{{ roleIcon(o.role) }}</v-icon>
              {{ o.role || 'Official' }}
            </span>
            <span v-if="!o.uid" class="unlinked-tag">
              <v-icon size="11">mdi-link-variant-off</v-icon>
              Not linked
            </span>
          </div>
          <div class="official-meta">
            <span class="meta-item">
              <v-icon size="12">mdi-phone-outline</v-icon>
              {{ o.contact_number || '—' }}
            </span>
            <span class="meta-dot">·</span>
            <span class="meta-item">
              <v-icon size="12">mdi-office-building-outline</v-icon>
              {{ o.estate_name || 'Unknown estate' }}
            </span>
            <span v-if="o.estate_urn" class="meta-dot">·</span>
            <span v-if="o.estate_urn" class="estate-urn">{{ o.estate_urn }}</span>
          </div>
        </div>

        <div class="official-stats">
          <div class="official-stat">
            <div class="stat-label">Added</div>
            <div class="stat-value-sm">{{ fmtDate(o.created_at) }}</div>
          </div>
        </div>

        <div class="official-actions" @click.stop>
          <button class="icon-btn" @click="toggleMenu(o.official_id)">
            <v-icon size="18">mdi-dots-vertical</v-icon>
          </button>
          <transition name="menu-fade">
            <div v-if="openMenuId === o.official_id" class="row-menu">
              <button class="row-menu-item" @click="viewOfficial(o)">
                <v-icon size="16" class="mr-2">mdi-eye-outline</v-icon>
                View
              </button>
              <button class="row-menu-item" @click="editOfficial(o)">
                <v-icon size="16" class="mr-2">mdi-pencil-outline</v-icon>
                Edit
                <span v-if="isSupportAdmin" class="menu-tag">Approval</span>
              </button>
              <button class="row-menu-item" @click="callOfficial(o)">
                <v-icon size="16" class="mr-2">mdi-phone-outline</v-icon>
                Call
              </button>
              <button
                v-if="!o.uid"
                class="row-menu-item"
                @click="generateLink(o)"
              >
                <v-icon size="16" class="mr-2">mdi-link-plus</v-icon>
                Generate link
              </button>
              <div class="row-menu-divider"></div>
              <button
                class="row-menu-item row-menu-item-danger"
                @click="askRemoveOfficial(o)"
              >
                <v-icon size="16" class="mr-2">mdi-delete-outline</v-icon>
                Remove
                <span v-if="isSupportAdmin" class="menu-tag menu-tag-danger">Approval</span>
              </button>
            </div>
          </transition>
        </div>

        <v-icon size="18" class="official-chevron">mdi-chevron-right</v-icon>
      </div>
    </div>

    <!-- ============================================================
         NEW / EDIT OFFICIAL DIALOG
         ============================================================ -->
    <v-dialog
      v-if="dialog"
      v-model="dialog"
      max-width="520"
      content-class="off-dialog-content"
    >
      <div class="off-dialog-card">
        <div class="off-dialog-header">
          <div>
            <div class="off-dialog-title">
              {{ isSupportAdmin
                ? (editing ? 'Request official update' : 'Request new official')
                : (editing ? 'Edit official' : 'New official')
              }}
            </div>
            <div class="off-dialog-sub">
              {{ isSupportAdmin
                ? 'This will be sent to a super admin for approval'
                : (editing ? 'Update the official\'s details' : 'Add an official to an estate')
              }}
            </div>
          </div>
          <button class="off-dialog-close" @click="closeDialog">
            <v-icon size="20" color="white">mdi-close</v-icon>
          </button>
        </div>

        <div class="off-dialog-body">
          <div class="form-row">
            <label class="form-label">Estate</label>
            <select v-model="form.estate_id" class="form-input" :disabled="editing">
              <option value="" disabled>Select an estate…</option>
              <option v-for="e in estates" :key="e.estate_id" :value="e.estate_id">
                {{ e.estate_name }} · {{ e.estate_urn }}
              </option>
            </select>
          </div>

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

          <div v-if="isSupportAdmin" class="form-hint form-hint-info">
            <v-icon size="14">mdi-information-outline</v-icon>
            Submitting will send this to a super admin for approval.
          </div>
        </div>

        <div class="off-dialog-footer">
          <button class="dialog-btn dialog-btn-ghost" @click="closeDialog">
            Cancel
          </button>
          <button
            class="dialog-btn dialog-btn-primary"
            :disabled="!canSubmit || submitting"
            @click="submit"
          >
            <v-icon v-if="submitting" size="16" class="mr-2 spin">mdi-loading</v-icon>
            {{ submitting
              ? 'Submitting…'
              : (isSupportAdmin
                  ? 'Send for approval'
                  : (editing ? 'Save changes' : 'Create official'))
            }}
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- ============================================================
         LINK GENERATED DIALOG
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
            <div class="off-dialog-sub">Share this with the official to link their account</div>
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
            The official uses this link to sign up and bind their Firebase UID to their
            record. Once linked, they'll appear as <strong>Linked</strong> in the list.
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
    <v-dialog v-model="confirmDialog" max-width="440" persistent>
      <div class="confirm-card">
        <div class="confirm-icon confirm-icon-danger">
          <v-icon size="24" color="white">mdi-account-remove</v-icon>
        </div>

        <div class="confirm-title">
          {{ isSupportAdmin ? 'Request official removal?' : 'Remove this official?' }}
        </div>

        <div class="confirm-text">
          <span v-if="isSupportAdmin">
            This will send a request to a super admin for approval.
            The official stays in place until they approve.
          </span>
          <span v-else>
            <strong>{{ officialToRemove?.full_name }}</strong> will be removed from
            <strong>{{ officialToRemove?.estate_name || 'their estate' }}</strong>.
            This cannot be undone.
          </span>
        </div>

        <div v-if="officialToRemove" class="confirm-official-preview">
          <div class="confirm-official-avatar" :class="avatarClass(officialToRemove.role)">
            {{ initialsOf(officialToRemove.full_name) }}
          </div>
          <div class="confirm-official-info">
            <div class="confirm-official-name">{{ officialToRemove.full_name }}</div>
            <div class="confirm-official-meta">
              {{ officialToRemove.role || 'Official' }} ·
              {{ officialToRemove.estate_name || '—' }}
            </div>
          </div>
        </div>

        <div class="confirm-actions">
          <button
            class="action-btn action-btn-ghost"
            :disabled="removing"
            @click="confirmDialog = false"
          >
            Cancel
          </button>
          <button
            class="action-btn action-btn-danger"
            :disabled="removing"
            @click="confirmRemove"
          >
            <v-icon size="14" class="mr-1">
              {{ removing ? 'mdi-loading' : (isSupportAdmin ? 'mdi-send' : 'mdi-delete') }}
            </v-icon>
            {{ removing
              ? 'Working…'
              : (isSupportAdmin ? 'Send for approval' : 'Remove official')
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

const API = 'https://makaaziserver22.up.railway.app/api';

export default {
  name: 'AdminOfficials',
  layout: 'admin',

  data() {
    return {
      loading: false,
      submitting: false,

      officials: [],
      estates: [],

      search: '',
      roleFilter: '',
      estateFilter: '',
      openMenuId: null,

      adminRole: null,

      dialog: false,
      editing: false,
      editingId: null,
      form: {
        estate_id: '',
        full_name: '',
        contact_number: '',
        role: 'Chairman',
        uid: '',
      },

      linkDialog: false,
      generatedLink: '',

      // Remove confirmation
      confirmDialog: false,
      officialToRemove: null,
      removing: false,

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
    roleOptions() {
      return [
        { label: 'All', value: '' },
        { label: 'Chairman', value: 'Chairman' },
        { label: 'Secretary', value: 'Secretary' },
        { label: 'Treasurer', value: 'Treasurer' },
        { label: 'Caretaker', value: 'Caretaker' },
      ];
    },
    chairmenCount() {
      return this.officials.filter(
        (o) => (o.role || '').toLowerCase() === 'chairman'
      ).length;
    },
    linkedCount() {
      return this.officials.filter((o) => !!o.uid).length;
    },
    estatesCovered() {
      return new Set(this.officials.map((o) => o.estate_id).filter(Boolean)).size;
    },
    hasActiveFilters() {
      return !!(this.search || this.roleFilter || this.estateFilter);
    },
    filteredOfficials() {
      const q = this.search.trim().toLowerCase();
      return this.officials.filter((o) => {
        if (this.roleFilter && o.role !== this.roleFilter) return false;
        if (this.estateFilter && o.estate_id !== this.estateFilter) return false;
        if (!q) return true;
        return (
          (o.full_name || '').toLowerCase().includes(q) ||
          (o.contact_number || '').toLowerCase().includes(q) ||
          (o.estate_name || '').toLowerCase().includes(q) ||
          (o.estate_urn || '').toLowerCase().includes(q)
        );
      });
    },
    canSubmit() {
      return !!(this.form.estate_id && this.form.full_name && this.form.contact_number);
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
        const { data, status } = await axios.get(`${API}/admin/officials`, { headers });
        if (status === 200 && Array.isArray(data)) {
          this.officials = data;
        }
      } catch (err) {
        const s = err.response?.status;
        if (s === 401 || s === 403) {
          this.showSnackbar('Access denied — check admin account', 'error');
        } else if (s === 404) {
          this.officials = [];
        } else {
          console.warn('Officials load failed:', err.message);
          this.showSnackbar('Could not load officials', 'error');
          this.officials = [];
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

    clearFilters() {
      this.search = '';
      this.roleFilter = '';
      this.estateFilter = '';
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
    roleIcon(role) {
      const r = (role || '').toLowerCase();
      if (r === 'chairman') return 'mdi-crown';
      if (r === 'secretary') return 'mdi-note-text-outline';
      if (r === 'treasurer') return 'mdi-cash';
      if (r === 'caretaker') return 'mdi-key-outline';
      return 'mdi-account-outline';
    },

    openOfficial(o) {
      this.$router.push(`/admin/official/${o.official_id}`);
    },
    viewOfficial(o) {
      this.openMenuId = null;
      this.$router.push(`/admin/official/${o.official_id}`);
    },
    editOfficial(o) {
      this.openMenuId = null;
      this.submitting = false;
      this.editing = true;
      this.editingId = o.official_id;
      this.form = {
        estate_id: o.estate_id,
        full_name: o.full_name || '',
        contact_number: o.contact_number || '',
        role: o.role || 'Chairman',
        uid: o.uid || '',
      };
      this.dialog = true;
    },
    callOfficial(o) {
      this.openMenuId = null;
      if (o.contact_number) {
        window.location.href = `tel:${o.contact_number.replace(/\s+/g, '')}`;
      }
    },
    generateLink(o) {
      this.openMenuId = null;
      const token = btoa(
        JSON.stringify({ oid: o.official_id, ts: Date.now() })
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
    toggleMenu(id) {
      this.openMenuId = this.openMenuId === id ? null : id;
    },
    closeMenuOnClickOutside() {
      this.openMenuId = null;
    },

    /* ============================================================
       REMOVE — confirm dialog + dual response
       ============================================================ */
    askRemoveOfficial(o) {
      this.openMenuId = null;
      this.officialToRemove = o;
      this.confirmDialog = true;
    },

    async confirmRemove() {
      if (!this.officialToRemove) return;
      const o = this.officialToRemove;
      this.removing = true;

      try {
        const headers = await this.getAuthHeaders();
        const { data, status } = await axios.delete(
          `${API}/admin/officials/${o.official_id}`,
          { headers }
        );

        // Super admin: deleted
        if (data?.direct === true || (status >= 200 && status < 300 && !data?.queued)) {
          this.officials = this.officials.filter((x) => x.official_id !== o.official_id);
          this.showSnackbar(`"${o.full_name}" removed`, 'success');
        }
        // Support admin: queued
        else if (data?.queued === true || status === 202) {
          this.showSnackbar(
            `Request #${data.request_id} sent to super admins`,
            'success'
          );
        }
        // Fallback for plain 200
        else if (status === 200) {
          this.officials = this.officials.filter((x) => x.official_id !== o.official_id);
          this.showSnackbar(`"${o.full_name}" removed`, 'success');
        }
      } catch (err) {
        console.warn('removeOfficial failed:', err.message);
        this.showSnackbar(
          err.response?.data?.error || 'Could not remove official',
          'error'
        );
      } finally {
        this.removing = false;
        this.confirmDialog = false;
        this.officialToRemove = null;
      }
    },

    openNewDialog() {
      this.submitting = false;
      this.editing = false;
      this.editingId = null;
      this.form = {
        estate_id: '',
        full_name: '',
        contact_number: '',
        role: 'Chairman',
        uid: '',
      };
      this.dialog = true;
    },

    closeDialog() {
      this.form = {
        estate_id: '',
        full_name: '',
        contact_number: '',
        role: 'Chairman',
        uid: '',
      };
      this.editing = false;
      this.editingId = null;
      this.dialog = false;
    },

    /* ============================================================
       SUBMIT — dual response (create or update)
       ============================================================ */
    async submit() {
      if (!this.canSubmit || this.submitting) return;
      this.submitting = true;
      try {
        const headers = await this.getAuthHeaders();
        let data, status;

        if (this.editing) {
          ({ data, status } = await axios.patch(
            `${API}/admin/officials/${this.editingId}`,
            {
              full_name: this.form.full_name,
              contact_number: this.form.contact_number,
              role: this.form.role,
              uid: this.form.uid || null,
            },
            { headers }
          ));
        } else {
          ({ data, status } = await axios.post(
            `${API}/admin/estates/${this.form.estate_id}/first-official`,
            {
              full_name: this.form.full_name,
              contact_number: this.form.contact_number,
              role: this.form.role,
              uid: this.form.uid || null,
            },
            { headers }
          ));
        }

        // Super admin: applied directly
        if (data?.direct === true || (status >= 200 && status < 300 && !data?.queued)) {
          const message = this.editing ? 'Official updated' : 'Official created';
          this.closeDialog();
          this.$nextTick(() => {
            this.showSnackbar(message, 'success');
          });
          await this.load();
        }
        // Support admin: queued
        else if (data?.queued === true || status === 202) {
          this.closeDialog();
          this.$nextTick(() => {
            this.showSnackbar(
              `Request #${data.request_id} sent to super admins`,
              'success'
            );
          });
        }
      } catch (err) {
        console.warn('submit failed:', err.message);
        this.showSnackbar(
          err.response?.data?.error || 'Could not save official',
          'error'
        );
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
.officials-page {
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
}

.refresh-btn {
  color: #475569 !important;
  font-weight: 700 !important;
  font-size: 0.72rem !important;
  letter-spacing: 0.8px !important;
  text-transform: uppercase !important;
}

.refresh-btn:hover {
  color: #0f0d24 !important;
  background: rgba(15, 13, 36, 0.05) !important;
}

.new-official-btn {
  font-weight: 800 !important;
  font-size: 0.78rem !important;
  letter-spacing: 0.6px !important;
  text-transform: uppercase !important;
  box-shadow: 0 8px 20px -8px rgba(182, 255, 0, 0.65);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 18px !important;
}

.new-official-btn:hover {
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
}

/* ============================================================
   FILTERS
   ============================================================ */
.filters-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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
}

.search-clear:hover { color: #0f0d24; }

.filter-select {
  padding: 11px 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 0.82rem;
  font-weight: 600;
  color: #0f0d24;
  outline: none;
  font-family: inherit;
  cursor: pointer;
  min-width: 160px;
}

.filter-select:focus {
  border-color: #8051ff;
  background: #ffffff;
}

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
  max-width: 340px;
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
   LIST
   ============================================================ */
.officials-card {
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}

.official-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 16px 22px;
  cursor: pointer;
  transition: background 0.15s ease;
  border-bottom: 1px solid #f1f5f9;
}

.official-row:last-child { border-bottom: none; }
.official-row:hover { background: #fafbff; }

.official-avatar {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.6px;
  flex-shrink: 0;
}

.avatar-chairman {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  color: #0a0a14;
  box-shadow: 0 10px 22px -10px rgba(182, 255, 0, 0.7);
}

.avatar-secretary {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.65);
}

.avatar-treasurer {
  background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
  box-shadow: 0 10px 22px -10px rgba(37, 99, 235, 0.6);
}

.avatar-caretaker {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 10px 22px -10px rgba(245, 158, 11, 0.6);
}

.avatar-default {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  box-shadow: 0 10px 22px -10px rgba(100, 116, 139, 0.5);
}

.official-body {
  flex: 1;
  min-width: 0;
}

.official-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.official-name {
  font-size: 0.92rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
}

.role-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 0.6rem;
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

.unlinked-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.1);
  color: #b91c1c;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.official-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.72rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.meta-dot { color: #cbd5e1; }

.estate-urn {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.68rem;
  letter-spacing: 0.2px;
}

.official-stats {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;
}

.official-stat {
  text-align: right;
  min-width: 90px;
}

.stat-label {
  font-size: 0.62rem;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  margin-bottom: 3px;
}

.stat-value-sm {
  font-size: 0.82rem;
  font-weight: 700;
  color: #334155;
}

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

.official-actions {
  position: relative;
  flex-shrink: 0;
}

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
  transition: background 0.15s ease, color 0.15s ease;
}

.row-menu-item:hover { background: #f1f5f9; color: #0f0d24; }

.row-menu-item-danger:hover {
  background: rgba(239, 68, 68, 0.08);
  color: #b91c1c;
}

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

.official-chevron {
  flex-shrink: 0;
  color: #cbd5e1;
  opacity: 0.6;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.official-row:hover .official-chevron {
  opacity: 1;
  transform: translateX(2px);
  color: #8051ff;
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
}

.off-dialog-close:hover { background: rgba(255, 255, 255, 0.2); }

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

.form-hint {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 600;
  margin-top: 4px;
}

.form-hint-info {
  color: #6d28d9;
  background: rgba(128, 81, 255, 0.06);
  border: 1px solid rgba(128, 81, 255, 0.18);
  border-radius: 10px;
  padding: 10px 12px;
  margin-top: 4px;
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

.spin { animation: spin 1s linear infinite; }

@keyframes spin { to { transform: rotate(360deg); } }

/* ============================================================
   CONFIRM DIALOG
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

.confirm-official-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #fafaff;
  border: 1px solid #f0eef8;
  border-radius: 12px;
  margin-bottom: 22px;
}

.confirm-official-avatar {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.confirm-official-info { min-width: 0; }

.confirm-official-name {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f0d24;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.confirm-official-meta {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 600;
  margin-top: 2px;
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
@media (max-width: 900px) {
  .official-stats { display: none; }
}

@media (max-width: 767px) {
  .officials-page { gap: 18px; }
  .page-title { font-size: 1.35rem; }
  .page-actions { width: 100%; }
  .refresh-btn, .new-official-btn { flex: 1; }

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
  .filter-select { min-width: 0; }

  .official-row { padding: 14px 16px; gap: 14px; }
  .official-name { max-width: 160px; }
  .official-avatar { width: 42px; height: 42px; }

  .confirm-card { padding: 22px 20px 18px; }
}
</style>