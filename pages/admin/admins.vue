<template>
  <div class="admins-page">
    <!-- ============================================================
         ACCESS GATE — only super admins may manage other admins
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
        You don't have permission to manage admin accounts. Ask a super admin
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
            <h1 class="page-title">Admin Users</h1>
            <div class="count-pill">{{ filteredAdmins.length }}</div>
          </div>
          <p class="page-sub">
            {{ admins.length }} total · {{ superCount }} super ·
            {{ supportCount }} support · {{ readonlyCount }} readonly
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
            rounded
            depressed
            class="text-capitalize add-btn"
            @click="openAdd"
          >
            <v-icon left small>mdi-plus</v-icon>
            Add admin
          </v-btn>
        </div>
      </div>

      <!-- SUMMARY CARDS -->
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-icon summary-icon-purple">
            <v-icon size="18" color="white">mdi-account-group-outline</v-icon>
          </div>
          <div class="summary-body">
            <div class="summary-label">Total admins</div>
            <div class="summary-value">{{ admins.length }}</div>
          </div>
        </div>

        <div class="summary-card summary-card-highlight">
          <div class="summary-icon summary-icon-white">
            <v-icon size="18" color="#0A0A14">mdi-shield-crown-outline</v-icon>
          </div>
          <div class="summary-body">
            <div class="summary-label">Super admins</div>
            <div class="summary-value">{{ superCount }}</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon summary-icon-lime">
            <v-icon size="18" color="#0A0A14">mdi-account-check-outline</v-icon>
          </div>
          <div class="summary-body">
            <div class="summary-label">Active</div>
            <div class="summary-value">{{ activeCount }}</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon summary-icon-amber">
            <v-icon size="18" color="white">mdi-account-off-outline</v-icon>
          </div>
          <div class="summary-body">
            <div class="summary-label">Disabled</div>
            <div class="summary-value">{{ disabledCount }}</div>
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
            placeholder="Search by name or email"
          />
          <button v-if="search" class="search-clear" @click="search = ''">
            <v-icon size="16">mdi-close-circle</v-icon>
          </button>
        </div>

        <div class="filter-chips">
          <button
            v-for="s in roleOptions"
            :key="s.value"
            class="filter-chip"
            :class="{ 'filter-chip-active': roleFilter === s.value }"
            @click="roleFilter = s.value"
          >
            {{ s.label }}
          </button>
        </div>
      </div>

      <!-- LOADING / EMPTY / LIST -->
      <div v-if="loading && !admins.length" class="loading-block">
        <v-skeleton-loader
          type="list-item-avatar-three-line, list-item-avatar-three-line, list-item-avatar-three-line"
        />
      </div>

      <div v-else-if="!filteredAdmins.length" class="empty-card">
        <div class="empty-icon">
          <v-icon size="44" color="#8051FF">
            {{ hasActiveFilters ? 'mdi-filter-off' : 'mdi-account-group-outline' }}
          </v-icon>
        </div>
        <div class="empty-title">
          {{ hasActiveFilters ? 'No matching admins' : 'No admin accounts yet' }}
        </div>
        <div class="empty-text">
          {{ hasActiveFilters
            ? 'Try clearing the filters or searching for something else.'
            : 'Add the first admin to get started.' }}
        </div>
        <button
          v-if="hasActiveFilters"
          class="empty-clear-btn"
          @click="clearFilters"
        >
          <v-icon size="16" class="mr-1">mdi-close</v-icon>
          Clear filters
        </button>
        <button
          v-else
          class="empty-clear-btn"
          @click="openAdd"
        >
          <v-icon size="16" class="mr-1">mdi-plus</v-icon>
          Add admin
        </button>
      </div>

      <div v-else class="admins-card">
        <div
          v-for="admin in filteredAdmins"
          :key="admin.id"
          class="admin-row"
        >
          <div class="admin-avatar" :class="avatarClass(admin)">
            <span>{{ initialsOf(admin.full_name || admin.email) }}</span>
          </div>

          <div class="admin-body">
            <div class="admin-title-row">
              <span class="admin-name">{{ admin.full_name || '(no name)' }}</span>
              <span class="role-pill" :class="roleClass(admin.role)">
                {{ roleLabel(admin.role) }}
              </span>
              <span v-if="!admin.active" class="disabled-tag">
                <v-icon size="11">mdi-account-off-outline</v-icon>
                Disabled
              </span>
              <span v-if="isSelf(admin)" class="self-tag">You</span>
            </div>
            <div class="admin-meta">
              <span class="meta-item">
                <v-icon size="12">mdi-email-outline</v-icon>
                {{ admin.email }}
              </span>
              <span v-if="admin.last_login_at" class="meta-dot">·</span>
              <span v-if="admin.last_login_at" class="meta-item">
                <v-icon size="12">mdi-login-variant</v-icon>
                Last login {{ fmtDate(admin.last_login_at) }}
              </span>
              <span class="meta-dot">·</span>
              <span class="meta-item">
                <v-icon size="12">mdi-calendar-plus-outline</v-icon>
                Added {{ fmtDate(admin.created_at) }}
              </span>
            </div>
          </div>

          <div class="admin-right">
            <button class="icon-btn" @click.stop="toggleMenu(admin.id)">
              <v-icon size="18">mdi-dots-vertical</v-icon>
            </button>
            <transition name="menu-fade">
              <div v-if="openMenuId === admin.id" class="row-menu">
                <button class="row-menu-item" @click="editAdmin(admin)">
                  <v-icon size="16" class="mr-2">mdi-pencil-outline</v-icon>
                  Edit
                </button>
                <button
                  class="row-menu-item"
                  @click="toggleActive(admin)"
                >
                  <v-icon size="16" class="mr-2">
                    {{ admin.active ? 'mdi-account-off-outline' : 'mdi-account-check-outline' }}
                  </v-icon>
                  {{ admin.active ? 'Disable' : 'Enable' }}
                </button>
                <button
                  class="row-menu-item row-menu-item-danger"
                  :disabled="isSelf(admin)"
                  @click="confirmRemove(admin)"
                >
                  <v-icon size="16" class="mr-2">mdi-trash-can-outline</v-icon>
                  Remove
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <!-- ADD / EDIT DIALOG -->
      <v-dialog v-model="editDialog.show" max-width="560" persistent>
        <div class="dialog-card">
          <div class="dialog-header">
            <div class="dialog-icon dialog-icon-purple">
              <v-icon size="20" color="white">
                {{ editDialog.mode === 'add' ? 'mdi-account-plus-outline' : 'mdi-account-edit-outline' }}
              </v-icon>
            </div>
            <div>
              <div class="dialog-title">
                {{ editDialog.mode === 'add' ? 'Add admin' : 'Edit admin' }}
              </div>
              <div class="dialog-sub">
                {{ editDialog.mode === 'add'
                  ? 'Pick an existing user or enter one manually'
                  : 'Update role, name, or status' }}
              </div>
            </div>
          </div>

          <div v-if="editDialog.mode === 'add'" class="dialog-tabs">
            <button
              class="dialog-tab"
              :class="{ 'dialog-tab-active': editDialog.tab === 'existing' }"
              @click="editDialog.tab = 'existing'"
            >
              <v-icon size="16">mdi-account-search-outline</v-icon>
              From existing users
            </button>
            <button
              class="dialog-tab"
              :class="{ 'dialog-tab-active': editDialog.tab === 'manual' }"
              @click="editDialog.tab = 'manual'"
            >
              <v-icon size="16">mdi-pencil-outline</v-icon>
              Manual entry
            </button>
          </div>

          <div v-if="editDialog.mode === 'add' && editDialog.tab === 'existing'">
            <div class="picker-search">
              <v-icon size="18" class="picker-search-icon">mdi-magnify</v-icon>
              <input
                v-model="editDialog.userSearch"
                class="picker-search-input"
                type="text"
                placeholder="Search by name, phone, or estate"
              />
            </div>

            <div v-if="editDialog.usersLoading" class="picker-loading">
              <v-progress-circular indeterminate size="22" color="#8051ff" />
              <span>Loading users…</span>
            </div>

            <div v-else-if="!eligibleUsersFiltered.length" class="picker-empty">
              <v-icon size="28" color="#cbd5e1">mdi-account-off-outline</v-icon>
              <div>No eligible users found</div>
              <div class="picker-empty-sub">
                All existing users may already be admins, or none match your search.
              </div>
            </div>

            <div v-else class="picker-list">
              <button
                v-for="u in eligibleUsersFiltered"
                :key="u.uid"
                class="picker-item"
                :class="{ 'picker-item-selected': editDialog.selectedUid === u.uid }"
                @click="pickExistingUser(u)"
              >
                <div class="picker-avatar">
                  {{ initialsOf(u.full_name || u.phone) }}
                </div>
                <div class="picker-body">
                  <div class="picker-name-row">
                    <span class="picker-name">{{ u.full_name || '(unnamed)' }}</span>
                    <span class="picker-source" :class="`picker-source-${u.source}`">
                      {{ u.source }}
                    </span>
                  </div>
                  <div class="picker-meta">
                    <span v-if="u.email">
                      <v-icon size="11">mdi-email-outline</v-icon>
                      {{ u.email }}
                    </span>
                    <span v-else class="picker-no-email">no email on file</span>
                    <span v-if="u.phone" class="meta-dot">·</span>
                    <span v-if="u.phone">
                      <v-icon size="11">mdi-phone-outline</v-icon>
                      {{ u.phone }}
                    </span>
                    <span v-if="u.estate_name" class="meta-dot">·</span>
                    <span v-if="u.estate_name">
                      <v-icon size="11">mdi-office-building-outline</v-icon>
                      {{ u.estate_name }}
                    </span>
                  </div>
                </div>
                <v-icon v-if="editDialog.selectedUid === u.uid" size="20" color="#8051ff">
                  mdi-check-circle
                </v-icon>
              </button>
            </div>

            <div v-if="editDialog.selectedUid" class="picker-role">
              <label class="field-label">Assign role</label>
              <select v-model="editDialog.form.role" class="field-input">
                <option value="super">Super admin</option>
                <option value="support">Support</option>
                <option value="readonly">Read-only</option>
              </select>
            </div>
          </div>

          <div v-if="editDialog.mode === 'add' && editDialog.tab === 'manual'" class="dialog-fields">
            <div class="field">
              <label class="field-label">Email</label>
              <input
                v-model="editDialog.form.email"
                class="field-input"
                type="email"
                placeholder="name@example.com"
              />
            </div>
            <div class="field">
              <label class="field-label">Full name</label>
              <input
                v-model="editDialog.form.full_name"
                class="field-input"
                type="text"
                placeholder="Jane Doe"
              />
            </div>
            <div class="field">
              <label class="field-label">Role</label>
              <select v-model="editDialog.form.role" class="field-input">
                <option value="super">Super admin</option>
                <option value="support">Support</option>
                <option value="readonly">Read-only</option>
              </select>
            </div>
          </div>

          <div v-if="editDialog.mode === 'edit'" class="dialog-fields">
            <div class="field">
              <label class="field-label">Email</label>
              <input
                v-model="editDialog.form.email"
                class="field-input"
                type="email"
                disabled
              />
            </div>
            <div class="field">
              <label class="field-label">Full name</label>
              <input
                v-model="editDialog.form.full_name"
                class="field-input"
                type="text"
              />
            </div>
            <div class="field">
              <label class="field-label">Role</label>
              <select v-model="editDialog.form.role" class="field-input">
                <option value="super">Super admin</option>
                <option value="support">Support</option>
                <option value="readonly">Read-only</option>
              </select>
            </div>
            <div class="field">
              <label class="field-label">Status</label>
              <select v-model="editDialog.form.active" class="field-input">
                <option :value="true">Active</option>
                <option :value="false">Disabled</option>
              </select>
            </div>
          </div>

          <div class="dialog-actions">
            <button class="dialog-cancel" @click="closeEditDialog">Cancel</button>
            <button
              class="dialog-proceed"
              :disabled="!canSaveEdit"
              @click="saveEdit"
            >
              {{ editDialog.mode === 'add' ? 'Add admin' : 'Save changes' }}
            </button>
          </div>
        </div>
      </v-dialog>

      <!-- REMOVE CONFIRM DIALOG -->
      <v-dialog v-model="removeDialog.show" max-width="440" persistent>
        <div class="confirm-card">
          <div class="confirm-icon">
            <v-icon size="26" color="#dc2626">mdi-alert-octagon-outline</v-icon>
          </div>
          <div class="confirm-title">
            Remove {{ removeDialog.admin?.full_name || removeDialog.admin?.email }}?
          </div>
          <div class="confirm-text">
            This will disable the admin account. They will lose access immediately.
            You can re-enable the account later if needed.
          </div>
          <div class="confirm-actions">
            <button class="confirm-cancel" @click="removeDialog.show = false">Cancel</button>
            <button class="confirm-proceed" @click="executeRemove">Remove</button>
          </div>
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
    </template>
  </div>
</template>

<script>
import axios from 'axios';

const API = 'https://makaaziserver22.up.railway.app/api';

export default {
  name: 'AdminAdmins',
  layout: 'admin',

  data() {
    return {
      // ── Access gate ──
      adminRole: null,
      roleReady: false,

      // ── Page state ──
      loading: false,
      admins: [],
      eligibleUsers: [],
      search: '',
      roleFilter: '',
      openMenuId: null,
      currentAdminId: null,

      editDialog: {
        show: false,
        mode: 'add',
        tab: 'existing',
        adminId: null,
        selectedUid: null,
        userSearch: '',
        usersLoading: false,
        form: {
          email: '',
          full_name: '',
          role: 'support',
          active: true,
        },
      },

      removeDialog: {
        show: false,
        admin: null,
      },

      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    isSuperAdmin() {
      return this.adminRole === 'super';
    },
    roleOptions() {
      return [
        { label: 'All', value: '' },
        { label: 'Super', value: 'super' },
        { label: 'Support', value: 'support' },
        { label: 'Read-only', value: 'readonly' },
      ];
    },
    superCount() {
      return this.admins.filter((a) => a.role === 'super').length;
    },
    supportCount() {
      return this.admins.filter((a) => a.role === 'support').length;
    },
    readonlyCount() {
      return this.admins.filter((a) => a.role === 'readonly').length;
    },
    activeCount() {
      return this.admins.filter((a) => a.active).length;
    },
    disabledCount() {
      return this.admins.filter((a) => !a.active).length;
    },
    hasActiveFilters() {
      return !!(this.search || this.roleFilter);
    },
    filteredAdmins() {
      const q = this.search.trim().toLowerCase();
      return this.admins.filter((a) => {
        if (this.roleFilter && a.role !== this.roleFilter) return false;
        if (!q) return true;
        return (
          (a.full_name || '').toLowerCase().includes(q) ||
          (a.email || '').toLowerCase().includes(q)
        );
      });
    },
    eligibleUsersFiltered() {
      const q = this.editDialog.userSearch.trim().toLowerCase();
      if (!q) return this.eligibleUsers;
      return this.eligibleUsers.filter((u) =>
        (u.full_name || '').toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q) ||
        (u.estate_name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      );
    },
    canSaveEdit() {
      const { mode, tab, selectedUid, form } = this.editDialog;

      if (mode === 'edit') {
        return true;
      }

      if (tab === 'existing') {
        return !!selectedUid;
      }

      return !!form.email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email);
    },
  },

  mounted() {
    // 1) Resolve role from localStorage
    try {
      this.adminRole = localStorage.getItem('admin_role') || null;
    } catch (e) {
      console.warn('[Admins] localStorage read failed:', e.message);
    }
    this.roleReady = true;

    // 2) Only load if authorized
    if (this.isSuperAdmin) {
      this.initLoad();
    }

    document.addEventListener('click', this.closeMenuOnClickOutside);
  },

  beforeDestroy() {
    document.removeEventListener('click', this.closeMenuOnClickOutside);
  },

  methods: {
    async initLoad() {
      const auth = this.$fire?.auth;
      if (!auth) {
        console.error('Firebase auth not available');
        return;
      }

      const unsub = auth.onAuthStateChanged(async (u) => {
        unsub();
        if (!u) {
          this.$router.push('/admin/login');
          return;
        }
        await this.load();
        await this.loadMe();
      });
    },

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
        const { data, status } = await axios.get(`${API}/admin/admins`, { headers });
        if (status === 200 && Array.isArray(data)) {
          this.admins = data;
        }
      } catch (err) {
        const s = err.response?.status;
        if (s === 401 || s === 403) {
          this.showSnackbar('Access denied — super admin required', 'error');
        } else {
          console.warn('Admins load failed:', err.message);
          this.showSnackbar('Could not load admins', 'error');
        }
      } finally {
        this.loading = false;
      }
    },

    async loadMe() {
      try {
        const headers = await this.getAuthHeaders();
        const { data } = await axios.get(`${API}/admin/me`, { headers });
        this.currentAdminId = data?.admin?.id || null;
      } catch (e) {
        console.warn('loadMe failed:', e.message);
      }
    },

    async loadEligibleUsers() {
      try {
        const headers = await this.getAuthHeaders();
        const { data } = await axios.get(`${API}/admin/admins/eligible-users`, { headers });
        this.eligibleUsers = Array.isArray(data) ? data : [];
      } catch (err) {
        console.warn('Eligible users load failed:', err.message);
        this.eligibleUsers = [];
      } finally {
        this.editDialog.usersLoading = false;
      }
    },

    isSelf(admin) {
      return this.currentAdminId != null && admin.id === this.currentAdminId;
    },

    async openAdd() {
      this.editDialog = {
        show: true,
        mode: 'add',
        tab: 'existing',
        adminId: null,
        selectedUid: null,
        userSearch: '',
        usersLoading: true,
        form: {
          email: '',
          full_name: '',
          role: 'support',
          active: true,
        },
      };
      await this.loadEligibleUsers();
    },

    pickExistingUser(u) {
      this.editDialog.selectedUid = u.uid;
      this.editDialog.form.email = u.email || '';
      this.editDialog.form.full_name = u.full_name || '';
    },

    editAdmin(admin) {
      this.openMenuId = null;
      this.editDialog = {
        show: true,
        mode: 'edit',
        tab: 'manual',
        adminId: admin.id,
        selectedUid: null,
        userSearch: '',
        usersLoading: false,
        form: {
          email: admin.email,
          full_name: admin.full_name || '',
          role: admin.role,
          active: !!admin.active,
        },
      };
    },

    closeEditDialog() {
      this.editDialog.show = false;
    },

    async saveEdit() {
      const { mode, adminId, form, selectedUid, tab } = this.editDialog;

      try {
        const headers = await this.getAuthHeaders();

        if (mode === 'add') {
          const payload = {
            email: (form.email || '').trim().toLowerCase(),
            full_name: form.full_name || null,
            role: form.role,
          };

          if (tab === 'existing' && selectedUid) {
            payload.firebase_uid = selectedUid;
          }

          if (!payload.email) {
            this.showSnackbar(
              'This user has no email on file — add one in Manual entry',
              'error'
            );
            return;
          }

          await axios.post(`${API}/admin/admins`, payload, { headers });
          this.showSnackbar('Admin added', 'success');
        } else {
          const payload = {
            full_name: form.full_name,
            role: form.role,
            active: form.active ? 1 : 0,
          };
          await axios.patch(`${API}/admin/admins/${adminId}`, payload, { headers });
          this.showSnackbar('Admin updated', 'success');
        }

        this.editDialog.show = false;
        await this.load();
      } catch (err) {
        const msg = err.response?.data?.error || err.message;
        this.showSnackbar(msg, 'error');
      }
    },

    async toggleActive(admin) {
      this.openMenuId = null;
      try {
        const headers = await this.getAuthHeaders();
        await axios.patch(
          `${API}/admin/admins/${admin.id}`,
          { active: admin.active ? 0 : 1 },
          { headers }
        );
        admin.active = !admin.active;
        this.showSnackbar(admin.active ? 'Admin enabled' : 'Admin disabled', 'success');
      } catch (err) {
        this.showSnackbar(err.response?.data?.error || 'Update failed', 'error');
      }
    },

    confirmRemove(admin) {
      this.openMenuId = null;
      if (this.isSelf(admin)) {
        this.showSnackbar('You cannot remove your own account', 'error');
        return;
      }
      this.removeDialog = { show: true, admin };
    },

    async executeRemove() {
      const admin = this.removeDialog.admin;
      if (!admin) return;
      try {
        const headers = await this.getAuthHeaders();
        await axios.delete(`${API}/admin/admins/${admin.id}`, { headers });
        this.showSnackbar('Admin removed', 'success');
        this.removeDialog.show = false;
        await this.load();
      } catch (err) {
        this.showSnackbar(err.response?.data?.error || 'Remove failed', 'error');
      }
    },

    toggleMenu(id) {
      this.openMenuId = this.openMenuId === id ? null : id;
    },

    closeMenuOnClickOutside() {
      this.openMenuId = null;
    },

    clearFilters() {
      this.search = '';
      this.roleFilter = '';
    },

    initialsOf(name) {
      if (!name) return '?';
      const parts = String(name).trim().split(/\s+/).slice(0, 2);
      return parts.map((w) => w[0]).join('').toUpperCase();
    },

    fmtDate(d) {
      if (!d) return '—';
      try {
        return new Date(d).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric',
        });
      } catch { return '—'; }
    },

    roleLabel(role) {
      if (role === 'super') return 'Super';
      if (role === 'support') return 'Support';
      if (role === 'readonly') return 'Read-only';
      return role || '—';
    },

    roleClass(role) {
      return `role-${role || 'default'}`;
    },

    avatarClass(admin) {
      if (!admin.active) return 'avatar-disabled';
      if (admin.role === 'super') return 'avatar-super';
      if (admin.role === 'support') return 'avatar-support';
      return 'avatar-readonly';
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
.admins-page { display: flex; flex-direction: column; gap: 22px; }

/* ============================================================
   ACCESS GATE
   ============================================================ */
.gate-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 24px;
  text-align: center;
}
.gate-sub {
  font-size: 0.82rem;
  color: #94a3b8;
  margin-top: 14px;
  font-weight: 500;
}

.no-access {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 18px;
  margin-top: 12px;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}
.no-access-icon {
  width: 84px;
  height: 84px;
  border-radius: 24px;
  background: rgba(128, 81, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}
.no-access-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f0d24;
  letter-spacing: -0.3px;
}
.no-access-text {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-top: 6px;
  max-width: 360px;
  line-height: 1.6;
}
.no-access-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 22px;
  padding: 11px 22px;
  border-radius: 999px;
  background: linear-gradient(135deg, #8051ff 0%, #9b6cff 100%);
  color: #ffffff;
  border: none;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  cursor: pointer;
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.7);
  transition: all 0.2s ease;
}
.no-access-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px -10px rgba(128, 81, 255, 0.85);
}

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
.add-btn {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%) !important;
  color: #ffffff !important;
  font-weight: 800 !important; font-size: 0.74rem !important;
  letter-spacing: 0.6px !important; text-transform: uppercase !important;
  box-shadow: 0 10px 24px -12px rgba(128, 81, 255, 0.7) !important;
}

/* Summary grid */
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

/* Filters */
.filters-card {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 14px 18px; background: #ffffff;
  border: 1px solid #e9edf3; border-radius: 16px; flex-wrap: wrap;
  box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}
.search-wrap {
  position: relative; flex: 1; min-width: 220px; display: flex; align-items: center;
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
.filter-chips { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.filter-chip {
  padding: 7px 14px; border-radius: 999px; background: #f1f5f9;
  border: 1px solid transparent; color: #475569; font-size: 0.78rem;
  font-weight: 700; cursor: pointer; font-family: inherit;
  transition: all 0.2s ease;
}
.filter-chip:hover { background: #e2e8f0; color: #0f0d24; }
.filter-chip-active { background: #0f0d24; color: #ffffff; border-color: #0f0d24; }

/* Loading / Empty */
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
  display: flex; align-items: center; justify-content: center; margin-bottom: 18px;
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

/* List */
.admins-card {
  background: #ffffff; border: 1px solid #e9edf3; border-radius: 18px;
  overflow: hidden; box-shadow: 0 1px 2px rgba(15, 13, 36, 0.03);
}
.admin-row {
  position: relative; display: flex; align-items: center; gap: 16px;
  padding: 16px 22px; border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s ease;
}
.admin-row:last-child { border-bottom: none; }
.admin-row:hover { background: #fafbff; }

.admin-avatar {
  width: 46px; height: 46px; border-radius: 13px;
  display: flex; align-items: center; justify-content: center;
  color: #ffffff; font-size: 0.78rem; font-weight: 800;
  letter-spacing: 0.6px; flex-shrink: 0;
}
.avatar-super {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 10px 22px -10px rgba(128, 81, 255, 0.65);
}
.avatar-support {
  background: linear-gradient(135deg, #d4ff4a 0%, #b6ff00 100%);
  color: #0a0a14;
  box-shadow: 0 10px 22px -10px rgba(182, 255, 0, 0.7);
}
.avatar-readonly {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  box-shadow: 0 10px 22px -10px rgba(100, 116, 139, 0.5);
}
.avatar-disabled {
  background: #e2e8f0; color: #94a3b8;
  box-shadow: none;
}

.admin-body { flex: 1; min-width: 0; }
.admin-title-row {
  display: flex; align-items: center; gap: 10px;
  flex-wrap: wrap; margin-bottom: 4px;
}
.admin-name {
  font-size: 0.92rem; font-weight: 800; color: #0f0d24;
  letter-spacing: -0.3px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 240px;
}
.role-pill {
  display: inline-flex; align-items: center;
  padding: 3px 9px; border-radius: 999px;
  font-size: 0.6rem; font-weight: 800;
  letter-spacing: 0.5px; text-transform: uppercase;
}
.role-super    { background: rgba(128, 81, 255, 0.14); color: #5b21b6; }
.role-support  { background: rgba(122, 184, 0, 0.16); color: #3f6b00; }
.role-readonly { background: #f1f5f9; color: #475569; }
.role-default  { background: #f1f5f9; color: #475569; }

.disabled-tag {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 3px 8px; border-radius: 999px;
  background: rgba(239, 68, 68, 0.1); color: #b91c1c;
  font-size: 0.6rem; font-weight: 800;
  letter-spacing: 0.4px; text-transform: uppercase;
}
.self-tag {
  display: inline-flex; align-items: center;
  padding: 3px 8px; border-radius: 999px;
  background: rgba(59, 130, 246, 0.14); color: #1d4ed8;
  font-size: 0.6rem; font-weight: 800;
  letter-spacing: 0.4px; text-transform: uppercase;
}

.admin-meta {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.72rem; color: #94a3b8;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  font-weight: 500;
}
.meta-item { display: inline-flex; align-items: center; gap: 3px; }
.meta-dot { color: #cbd5e1; }

.admin-right {
  position: relative; display: flex; align-items: center; gap: 16px; flex-shrink: 0;
}
.icon-btn {
  width: 34px; height: 34px; border-radius: 10px;
  background: transparent; border: none; cursor: pointer;
  color: #94a3b8; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s ease;
}
.icon-btn:hover { background: #f1f5f9; color: #0f0d24; }

.row-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 6px;
  min-width: 180px;
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
.row-menu-item:hover:not(:disabled) { background: #f1f5f9; color: #0f0d24; }
.row-menu-item:disabled { opacity: 0.4; cursor: not-allowed; }
.row-menu-item-danger { color: #b91c1c; }
.row-menu-item-danger:hover:not(:disabled) { background: #fee2e2; color: #991b1b; }

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.menu-fade-enter,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Dialog */
.dialog-card {
  background: #ffffff; border-radius: 18px; padding: 24px;
  box-shadow: 0 24px 48px -20px rgba(15, 13, 36, 0.4);
}
.dialog-header {
  display: flex; align-items: center; gap: 14px; margin-bottom: 20px;
}
.dialog-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.dialog-icon-purple {
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  box-shadow: 0 8px 20px -10px rgba(128, 81, 255, 0.65);
}
.dialog-title {
  font-size: 1.05rem; font-weight: 800; color: #0f0d24;
  letter-spacing: -0.3px;
}
.dialog-sub { font-size: 0.78rem; color: #94a3b8; margin-top: 2px; font-weight: 500; }

/* Dialog tabs */
.dialog-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #f1f5f9;
  border-radius: 12px;
  margin-bottom: 16px;
}
.dialog-tab {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}
.dialog-tab:hover { color: #0f0d24; }
.dialog-tab-active {
  background: #ffffff;
  color: #8051ff;
  box-shadow: 0 1px 3px rgba(15, 13, 36, 0.08);
}

/* Picker */
.picker-search {
  position: relative;
  margin-bottom: 12px;
}
.picker-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}
.picker-search-input {
  width: 100%;
  padding: 11px 14px 11px 38px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 0.85rem;
  font-weight: 500;
  color: #0f0d24;
  outline: none;
  font-family: inherit;
}
.picker-search-input:focus {
  border-color: #8051ff;
  background: #ffffff;
}

.picker-loading,
.picker-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 16px;
  color: #94a3b8;
  font-size: 0.82rem;
  text-align: center;
}
.picker-loading {
  flex-direction: row;
  gap: 10px;
}
.picker-empty-sub {
  font-size: 0.72rem;
  color: #cbd5e1;
  max-width: 280px;
}

.picker-list {
  max-height: 320px;
  overflow-y: auto;
  border: 1px solid #e9edf3;
  border-radius: 12px;
  background: #ffffff;
}
.picker-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  background: transparent;
  border: none;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: background 0.15s ease;
}
.picker-item:last-child { border-bottom: none; }
.picker-item:hover { background: #fafbff; }
.picker-item-selected {
  background: rgba(128, 81, 255, 0.08) !important;
}

.picker-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}
.picker-body { flex: 1; min-width: 0; }
.picker-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 3px;
}
.picker-name {
  font-size: 0.85rem;
  font-weight: 800;
  color: #0f0d24;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}
.picker-source {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}
.picker-source-household {
  background: rgba(122, 184, 0, 0.14);
  color: #3f6b00;
}
.picker-source-official {
  background: rgba(128, 81, 255, 0.12);
  color: #5b21b6;
}
.picker-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.68rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}
.picker-meta .meta-dot { color: #cbd5e1; }
.picker-meta > span {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.picker-no-email {
  color: #b45309;
  font-weight: 700;
}

.picker-role {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Fields */
.dialog-fields { display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; }
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
.field-input:disabled { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; }

.dialog-actions {
  display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px;
}
.dialog-cancel {
  padding: 10px 20px; border-radius: 999px;
  background: transparent; border: 1px solid #e2e8f0;
  color: #475569; font-size: 0.78rem; font-weight: 800;
  letter-spacing: 0.4px; cursor: pointer; font-family: inherit;
  text-transform: uppercase;
}
.dialog-cancel:hover { background: #f8fafc; }
.dialog-proceed {
  padding: 10px 20px; border-radius: 999px;
  background: linear-gradient(135deg, #9b6cff 0%, #8051ff 100%);
  color: #ffffff; border: none;
  font-size: 0.78rem; font-weight: 800;
  letter-spacing: 0.4px; cursor: pointer; font-family: inherit;
  text-transform: uppercase;
  box-shadow: 0 10px 24px -12px rgba(128, 81, 255, 0.7);
  transition: all 0.2s ease;
}
.dialog-proceed:hover:not(:disabled) { transform: translateY(-1px); }
.dialog-proceed:disabled {
  background: #e2e8f0; color: #94a3b8; box-shadow: none; cursor: not-allowed;
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
}
.confirm-proceed:hover { background: #b91c1c; }

/* Responsive */
@media (max-width: 767px) {
  .admins-page { gap: 18px; }
  .page-title { font-size: 1.35rem; }
  .page-actions { width: 100%; }
  .add-btn, .refresh-btn { flex: 1; }
  .summary-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .summary-card { padding: 14px 16px; gap: 10px; }
  .summary-icon { width: 36px; height: 36px; }
  .summary-value { font-size: 1.15rem; }
  .filters-card { flex-direction: column; align-items: stretch; gap: 12px; }
  .search-wrap { min-width: 0; }
  .admin-row { padding: 14px 16px; gap: 14px; }
  .admin-name { max-width: 160px; }
  .no-access { padding: 60px 20px; }
}
</style>