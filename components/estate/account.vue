<template>
  <div class="account-page">
    <!-- ============================================================
         LOADING SKELETON
         ============================================================ -->
    <div v-if="initialLoading" class="hero-card">
      <v-skeleton-loader type="image" height="180" />
      <div class="hero-body" style="padding-top: 24px;">
        <v-skeleton-loader type="list-item-avatar-two-line" />
      </div>
    </div>

    <!-- ============================================================
         ESTATE HERO CARD
         ============================================================ -->
    <div v-else class="hero-card">
      <!-- Cover -->
      <div class="hero-cover" :style="coverStyle">
        <div class="hero-cover-overlay"></div>
        <div class="hero-cover-pattern"></div>

        <button
          class="hero-edit-btn"
          :class="{ 'hero-edit-btn-active': edit }"
          @click="edit = !edit"
        >
          <v-icon size="16">{{ edit ? 'mdi-close' : 'mdi-pencil' }}</v-icon>
          <span>{{ edit ? 'Cancel' : 'Edit' }}</span>
        </button>

        <div class="hero-cover-badge">
          <v-icon size="12" color="white">mdi-check-decagram</v-icon>
          <span>Verified</span>
        </div>
      </div>

      <!-- Body -->
      <div class="hero-body">
        <div class="hero-avatar-wrap">
          <div class="hero-avatar">
            <img v-if="logoUrl" :src="logoUrl" alt="logo" />
            <span v-else>{{ estateInitials }}</span>
          </div>
          <div class="hero-avatar-ring"></div>
        </div>

        <div class="hero-info">
          <h2 class="hero-name">{{ estateName || "Untitled Estate" }}</h2>

          <div class="hero-meta">
            <span class="hero-meta-chip">
              <v-icon size="13" color="#7c3aed">mdi-map-marker-outline</v-icon>
              {{ location || "No location set" }}
            </span>

            <button class="hero-meta-chip hero-meta-chip-copy" @click="copyURN">
              <v-icon size="13" color="#7c3aed">mdi-identifier</v-icon>
              <span class="hero-urn">{{ estateURN || "—" }}</span>
              <v-icon size="13" color="#9ca3af">mdi-content-copy</v-icon>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================
         EDIT MODE — upload zone
         ============================================================ -->
    <transition name="fade-slide">
      <div v-if="edit" class="edit-panel">
        <div class="section-head">
          <div class="section-title">
            <div class="section-icon">
              <v-icon size="16" color="white">mdi-image-multiple-outline</v-icon>
            </div>
            <span>Update imagery</span>
          </div>
          <div class="section-sub">
            Upload a new cover image and logo for your estate
          </div>
        </div>

        <div class="upload-grid">
          <!-- Logo -->
          <div class="upload-block">
            <div class="upload-label">Estate logo</div>
            <div class="logo-drop-zone">
              <dropzone
                ref="logoDropzone"
                :options="options"
                :maxFiles="1"
                @vdropzone-success="handleSuccess2"
                @vdropzone-error="handleError2"
                @vdropzone-complete="afterCompleteLogo"
              ></dropzone>
              <div v-if="!logoUploading" class="logo-drop-overlay">
                <div class="logo-drop-icon">
                  <v-icon size="22" color="#7c3aed">mdi-camera-plus-outline</v-icon>
                </div>
                <span>Drop logo</span>
                <span class="logo-drop-sub">PNG or SVG · 1 MB max</span>
              </div>
              <div v-else class="logo-drop-overlay">
                <v-progress-circular indeterminate size="24" color="#7c3aed" />
                <span>Uploading…</span>
              </div>
            </div>
          </div>

          <!-- Cover -->
          <div class="upload-block upload-block-wide">
            <div class="upload-label">Estate cover image</div>
            <div class="cover-drop-zone">
              <dropzone
                ref="coverDropzone"
                :options="options"
                :maxFiles="1"
                @vdropzone-success="handleSuccess"
                @vdropzone-error="handleError"
                @vdropzone-complete="afterCompletePoster"
              ></dropzone>
              <div v-if="!coverUploading" class="cover-drop-overlay">
                <div class="logo-drop-icon">
                  <v-icon size="22" color="#7c3aed">mdi-image-outline</v-icon>
                </div>
                <span>Drop cover image</span>
                <span class="logo-drop-sub">1600×600 recommended · JPG or PNG</span>
              </div>
              <div v-else class="logo-drop-overlay">
                <v-progress-circular indeterminate size="24" color="#7c3aed" />
                <span>Uploading…</span>
              </div>
            </div>
            <div class="upload-hint-row">
              <span class="upload-hint">
                <v-icon size="12">mdi-information-outline</v-icon>
                Large image works best
              </span>
              <button class="clear-btn" @click="clearDropzone">
                <v-icon size="14">mdi-close</v-icon>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- ============================================================
         ESTATE DETAILS FORM
         ============================================================ -->
    <div class="section-card" :class="{ 'section-card-editing': edit }">
      <div class="section-head">
        <div class="section-title">
          <div class="section-icon">
            <v-icon size="16" color="white">mdi-office-building-outline</v-icon>
          </div>
          <span>Estate details</span>
        </div>
        <div class="section-sub">
          Update basic information about your estate
        </div>
      </div>

      <v-form ref="form" @submit.prevent>
        <div class="field-grid">
          <div class="field">
            <label class="field-label">Estate name</label>
            <v-text-field
              v-model="estateName"
              dense
              outlined
              rounded
              hide-details
              placeholder="e.g. Galilie Estate"
              :disabled="!edit"
              @input="generateURN(estateName)"
            ></v-text-field>
          </div>

          <div class="field">
            <label class="field-label">Location</label>
            <v-text-field
              v-model="location"
              dense
              outlined
              rounded
              hide-details
              placeholder="e.g. Nairobi, Lavington"
              :disabled="!edit"
            ></v-text-field>
          </div>

          <div class="field field-span-2">
            <label class="field-label">
              Unique Reference (URN)
              <span class="field-label-hint">Auto-generated · readonly</span>
            </label>
            <div class="urn-wrap">
              <v-text-field
                v-model="estateURN"
                dense
                outlined
                rounded
                hide-details
                readonly
                class="urn-field"
              ></v-text-field>
              <button class="urn-copy" @click="copyURN" title="Copy URN">
                <v-icon size="16">mdi-content-copy</v-icon>
              </button>
            </div>
          </div>

          <div class="field field-span-2">
            <label class="field-label">Coordinates</label>
            <div class="coord-row">
              <v-text-field
                v-model="estateLat"
                dense
                outlined
                rounded
                hide-details
                type="number"
                placeholder="Latitude"
                prefix="Lat"
                :disabled="!edit"
              ></v-text-field>
              <v-text-field
                v-model="estateLng"
                dense
                outlined
                rounded
                hide-details
                type="number"
                placeholder="Longitude"
                prefix="Lng"
                :disabled="!edit"
              ></v-text-field>
            </div>
            <div class="coord-hint">
              <v-icon size="12">mdi-map-marker-radius-outline</v-icon>
              Used to place your estate on the resident map
            </div>
          </div>
        </div>
      </v-form>
    </div>

    <!-- ============================================================
         STICKY SAVE BAR
         ============================================================ -->
    <transition name="slide-up">
      <div v-if="edit" class="save-bar">
        <div class="save-bar-info">
          <v-icon size="16" color="#7c3aed">mdi-alert-circle-outline</v-icon>
          <span>You have unsaved changes</span>
        </div>
        <div class="save-bar-actions">
          <button class="save-btn save-btn-ghost" @click="cancelEdit">
            Cancel
          </button>
          <button
            class="save-btn save-btn-primary"
            :disabled="saving"
            @click="UploadEstate"
          >
            <v-progress-circular
              v-if="saving"
              indeterminate
              size="16"
              width="2"
              color="white"
            />
            <template v-else>
              <v-icon size="16">mdi-content-save</v-icon>
              Save changes
            </template>
          </button>
        </div>
      </div>
    </transition>

    <!-- ============================================================
         CONFIG SUMMARY
         ============================================================ -->
    <div v-if="!edit" class="section-card">
      <div class="section-head">
        <div class="section-title">
          <div class="section-icon">
            <v-icon size="16" color="white">mdi-tune-variant</v-icon>
          </div>
          <span>Address configuration</span>
        </div>
        <div class="section-sub">
          Which address fields are shown to residents
        </div>
      </div>

      <div class="config-grid">
        <div class="config-item" :class="estateStreet ? 'config-on' : 'config-off'">
          <div class="config-icon" :class="estateStreet ? 'icon-on' : 'icon-off'">
            <v-icon size="18" :color="estateStreet ? '#7c3aed' : '#9ca3af'">
              mdi-road-variant
            </v-icon>
          </div>
          <div class="config-body">
            <div class="config-label">Street</div>
            <div class="config-status">
              <span class="status-dot" :class="estateStreet ? 'dot-on' : 'dot-off'"></span>
              {{ estateStreet ? "Active" : "Hidden" }}
            </div>
          </div>
        </div>

        <div class="config-item" :class="estateSections ? 'config-on' : 'config-off'">
          <div class="config-icon" :class="estateSections ? 'icon-on' : 'icon-off'">
            <v-icon size="18" :color="estateSections ? '#7c3aed' : '#9ca3af'">
              mdi-map-marker-multiple
            </v-icon>
          </div>
          <div class="config-body">
            <div class="config-label">Section</div>
            <div class="config-status">
              <span class="status-dot" :class="estateSections ? 'dot-on' : 'dot-off'"></span>
              {{ estateSections ? "Active" : "Hidden" }}
            </div>
          </div>
        </div>

        <div class="config-item" :class="estateCourts ? 'config-on' : 'config-off'">
          <div class="config-icon" :class="estateCourts ? 'icon-on' : 'icon-off'">
            <v-icon size="18" :color="estateCourts ? '#7c3aed' : '#9ca3af'">
              mdi-home-city-outline
            </v-icon>
          </div>
          <div class="config-body">
            <div class="config-label">Court</div>
            <div class="config-status">
              <span class="status-dot" :class="estateCourts ? 'dot-on' : 'dot-off'"></span>
              {{ estateCourts ? "Active" : "Hidden" }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================
         LINKED ACCOUNTS
         ============================================================ -->
    <div v-if="!edit" class="section-card">
      <div class="section-head">
        <div class="section-title">
          <div class="section-icon">
            <v-icon size="16" color="white">mdi-link-variant</v-icon>
          </div>
          <span>Linked accounts</span>
        </div>
        <div class="section-sub">
          Connect third-party accounts for easy sign-in
        </div>
      </div>

      <div class="link-row">
        <div class="link-left">
          <div class="link-icon">
            <v-img :src="googleIcon" contain width="20" height="20" />
          </div>
          <div class="link-body">
            <div class="link-title">Google</div>
            <div class="link-sub">Not connected</div>
          </div>
        </div>
        <v-btn
          small
          rounded
          outlined
          class="text-capitalize"
          color="#7c3aed"
          disabled
        >
          Connect
        </v-btn>
      </div>
    </div>

    <!-- ============================================================
         SIGN OUT
         ============================================================ -->
    <div v-if="!edit" class="section-card">
      <div class="section-head">
        <div class="section-title">
          <div class="section-icon">
            <v-icon size="16" color="white">mdi-logout-variant</v-icon>
          </div>
          <span>Session</span>
        </div>
        <div class="section-sub">
          Sign out of your estate account on this device
        </div>
      </div>

      <div class="link-row">
        <div class="link-left">
          <div class="link-icon link-icon-signout">
            <v-icon size="20" color="#7c3aed">mdi-logout-variant</v-icon>
          </div>
          <div class="link-body">
            <div class="link-title">Sign out</div>
            <div class="link-sub">You'll need to sign in again to access this estate</div>
          </div>
        </div>
        <v-btn
          small
          rounded
          outlined
          color="#7c3aed"
          class="text-capitalize"
          :loading="signingOut"
          @click="confirmSignOut = true"
        >
          Sign out
        </v-btn>
      </div>
    </div>

    <!-- ============================================================
         DANGER ZONE
         ============================================================ -->
    <div v-if="!edit" class="section-card danger-card">
      <div class="section-head">
        <div class="section-title">
          <div class="section-icon section-icon-danger">
            <v-icon size="16" color="white">mdi-alert-outline</v-icon>
          </div>
          <span class="danger-text">Danger zone</span>
        </div>
        <div class="section-sub">
          Irreversible actions on your estate account
        </div>
      </div>

      <div class="danger-row">
        <div class="link-body">
          <div class="link-title">Delete this estate</div>
          <div class="link-sub">
            All household, payment, and configuration data will be lost permanently
          </div>
        </div>
        <v-btn
          small
          rounded
          outlined
          color="#ef4444"
          class="text-capitalize"
          @click="confirmDelete = true"
        >
          Delete
        </v-btn>
      </div>
    </div>

    <!-- ============================================================
         CONFIRM SIGN OUT DIALOG
         ============================================================ -->
    <v-dialog v-model="confirmSignOut" max-width="400" content-class="confirm-dialog">
      <div class="confirm-shell">
        <div class="confirm-icon confirm-icon-purple">
          <v-icon size="32" color="#7c3aed">mdi-logout-variant</v-icon>
        </div>
        <div class="confirm-title">Sign out?</div>
        <div class="confirm-text">
          You'll be signed out of <strong>{{ estateName }}</strong> on this device.
          You can sign in again at any time.
        </div>
        <div class="confirm-actions">
          <v-btn
            block
            rounded
            text
            class="text-capitalize flex-grow-1"
            @click="confirmSignOut = false"
          >
            Cancel
          </v-btn>
          <v-btn
            block
            rounded
            depressed
            color="#7c3aed"
            dark
            class="text-capitalize font-weight-bold flex-grow-1"
            :loading="signingOut"
            @click="signOut"
          >
            Sign out
          </v-btn>
        </div>
      </div>
    </v-dialog>

    <!-- ============================================================
         CONFIRM DELETE DIALOG
         ============================================================ -->
    <v-dialog v-model="confirmDelete" max-width="420" content-class="confirm-dialog">
      <div class="confirm-shell">
        <div class="confirm-icon">
          <v-icon size="32" color="#ef4444">mdi-alert-octagon-outline</v-icon>
        </div>
        <div class="confirm-title">Delete this estate?</div>
        <div class="confirm-text">
          This will permanently remove
          <strong>{{ estateName }}</strong> and all associated data. This action
          cannot be undone.
        </div>
        <div class="confirm-actions">
          <v-btn
            block
            rounded
            text
            class="text-capitalize flex-grow-1"
            @click="confirmDelete = false"
          >
            Cancel
          </v-btn>
          <v-btn
            block
            rounded
            depressed
            color="#ef4444"
            dark
            class="text-capitalize font-weight-bold flex-grow-1"
            disabled
          >
            Delete
          </v-btn>
        </div>
      </div>
    </v-dialog>

    <!-- Snackbars -->
    <v-snackbar v-model="snackbar" color="success" :timeout="2500" top rounded="pill">
      <div class="d-flex align-center">
        <v-icon color="white" small class="mr-2">mdi-check-circle</v-icon>
        <span>{{ snackbarText }}</span>
      </div>
    </v-snackbar>

    <v-snackbar v-model="snackbar2" color="error" :timeout="3500" top rounded="pill">
      <div class="d-flex align-center">
        <v-icon color="white" small class="mr-2">mdi-alert-circle</v-icon>
        <span>{{ snackbarText2 }}</span>
      </div>
    </v-snackbar>
  </div>
</template>

<script>
import Dropzone from "nuxt-dropzone";
import "nuxt-dropzone/dropzone.css";
import { uuid } from "vue-uuid";
import axios from "axios";

const API = "https://makaaziserver22.up.railway.app/api";

export default {
  name: "EstateAccount",
  props: {
    estateId: {
      type: Number,
      required: true,
    },
  },
  components: {
    Dropzone,
  },
  data() {
    return {
      edit: false,
      saving: false,
      confirmDelete: false,
      confirmSignOut: false,
      signingOut: false,
      logoUploading: false,
      coverUploading: false,
      initialLoading: true,

      // Estate
      estateName: "",
      estateURN: "",
      location: "",
      estateLat: 0.0,
      estateLng: 0.0,
      imageUrl: null,
      logoUrl: null,

      // Address config
      estateStreet: false,
      estateSections: false,
      estateCourts: false,

      // Assets
      googleIcon: require("@/assets/google.png"),

      options: {
        url: "http://httpbin.org/anything",
        acceptedFiles: "image/*",
        maxFilesize: 2,
      },

      // UI
      snackbar: false,
      snackbarText: "",
      snackbar2: false,
      snackbarText2: "",
    };
  },

  computed: {
    coverStyle() {
      if (this.imageUrl) {
        return { backgroundImage: `url(${this.imageUrl})` };
      }
      return {
        background:
          "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #6d28d9 100%)",
      };
    },
    estateInitials() {
      if (!this.estateName) return "?";
      return this.estateName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
    },
  },

  mounted() {
    this.bootstrap();
  },

  methods: {
    async bootstrap() {
      this.initialLoading = true;
      await Promise.allSettled([
        this.fetchEstate(),
        this.fetchAddressConfig(),
      ]);
      this.initialLoading = false;
    },

    // =========================================================
    // FETCH
    // =========================================================
    async fetchEstate() {
      try {
        const { data } = await axios.get(`${API}/estates/estate/${this.estateId}`);
        if (data && data.estate_id) {
          this.estateName = data.estate_name || "";
          this.estateURN = data.estate_urn || "";
          this.location = data.estate_location || "";
          this.estateLat = data.latitude || 0.0;
          this.estateLng = data.longitude || 0.0;
          this.imageUrl = data.estate_image || null;
          this.logoUrl = data.logo_url || null;
        }
      } catch (err) {
        console.warn("Estate fetch failed:", err.message);
        this.showError("Could not load estate details");
      }
    },

    async fetchAddressConfig() {
      try {
        const { data } = await axios.get(
          `${API}/address-config/estate/${this.estateId}`
        );
        if (data) {
          this.estateStreet = data.show_street === 1 || data.show_street === true;
          this.estateSections = data.show_section === 1 || data.show_section === true;
          this.estateCourts = data.show_court === 1 || data.show_court === true;
        }
      } catch (err) {
        console.warn("Address config fetch failed:", err.message);
      }
    },

    // =========================================================
    // URN
    // =========================================================
    generateURN(val) {
      if (!val) return;
      if (!this.edit) return;
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 100000);
      const formattedName = val.substring(0, 5).toUpperCase();
      this.estateURN = `${formattedName}-${timestamp}-${randomNum}`;
    },

    copyURN() {
      if (!this.estateURN) return;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.estateURN);
        this.showSuccess("URN copied to clipboard");
      }
    },

    // =========================================================
    // UPLOADS
    // =========================================================
    handleSuccess() {
      this.showSuccess("File uploaded");
    },

    handleError() {
      this.showError("File upload failed");
    },

    handleSuccess2() {
      this.showSuccess("Logo uploaded");
    },

    handleError2() {
      this.showError("Logo upload failed");
    },

    clearDropzone() {
      const ref = this.$refs.coverDropzone;
      if (ref && ref.dropzone) ref.dropzone.removeAllFiles();
      this.imageUrl = null;
    },

    async afterCompletePoster(upload) {
      if (!upload) return;
      this.coverUploading = true;
      try {
        const storageRef = this.$fire.storage.ref();
        const imageName = uuid.v1();
        const imageRef = storageRef.child(`posts/${imageName}.png`);
        await imageRef.put(upload, { contentType: "image/png" });
        const downloadURL = await imageRef.getDownloadURL();
        this.imageUrl = downloadURL;
        this.showSuccess("Cover uploaded");
      } catch (err) {
        console.error(err);
        this.showError("Cover upload failed");
      } finally {
        this.coverUploading = false;
      }
    },

    async afterCompleteLogo(upload) {
      if (!upload) return;
      this.logoUploading = true;
      try {
        const storageRef = this.$fire.storage.ref();
        const imageName = uuid.v1();
        const imageRef = storageRef.child(`posts/${imageName}.png`);
        await imageRef.put(upload, { contentType: "image/png" });
        const downloadURL = await imageRef.getDownloadURL();
        this.logoUrl = downloadURL;
        this.showSuccess("Logo uploaded");
      } catch (err) {
        console.error(err);
        this.showError("Logo upload failed");
      } finally {
        this.logoUploading = false;
      }
    },

    // =========================================================
    // SAVE
    // =========================================================
    async UploadEstate() {
      if (!this.estateName) return this.showError("Provide estate name");
      if (!this.location) return this.showError("Provide location");

      this.saving = true;
      try {
        await axios.patch(`${API}/estates/update_estate/${this.estateId}`, {
          estate_name: this.estateName,
          estate_urn: this.estateURN,
          estate_location: this.location,
          latitude: this.estateLat,
          longitude: this.estateLng,
          estate_image: this.imageUrl,
          logo_url: this.logoUrl,
        });
        this.showSuccess("Estate updated successfully");
        this.edit = false;
      } catch (err) {
        console.error(err);
        this.showError(err.response?.data?.error || "Update failed");
      } finally {
        this.saving = false;
      }
    },

    cancelEdit() {
      this.edit = false;
      this.bootstrap();
    },

    // =========================================================
    // SIGN OUT
    // =========================================================
    async signOut() {
      this.signingOut = true;
      try {
        if (this.$fire?.auth) {
          await this.$fire.auth.signOut();
        }
        this.confirmSignOut = false;
        this.$router.push("/login");
      } catch (err) {
        console.error("Sign out failed:", err);
        this.showError("Could not sign out. Please try again.");
        this.signingOut = false;
      }
    },

    // =========================================================
    // UI
    // =========================================================
    showSuccess(msg) {
      this.snackbar = true;
      this.snackbarText = msg;
    },

    showError(msg) {
      this.snackbar2 = true;
      this.snackbarText2 = msg;
    },
  },
};
</script>

<style scoped>
.account-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1000px;
  padding-bottom: 100px;
}

/* ============================================================
   HERO CARD
   ============================================================ */
.hero-card {
  background: white;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid #e9e7f2;
  box-shadow: 0 1px 2px rgba(30, 27, 75, 0.04);
}

.hero-cover {
  position: relative;
  height: 200px;
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
    rgba(0, 0, 0, 0.45) 100%
  );
}

.hero-cover-pattern {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 20% 30%,
    rgba(255, 255, 255, 0.15),
    transparent 45%
  );
  pointer-events: none;
}

.hero-edit-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 10px;
  color: #1e1b4b;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px -4px rgba(0, 0, 0, 0.25);
}

.hero-edit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.35);
}

.hero-edit-btn-active {
  background: rgba(239, 68, 68, 0.95);
  color: white;
}

.hero-cover-badge {
  position: absolute;
  bottom: 14px;
  left: 14px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.9);
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  backdrop-filter: blur(6px);
}

.hero-body {
  position: relative;
  padding: 0 24px 22px;
}

.hero-avatar-wrap {
  position: relative;
  display: inline-block;
  margin-top: -40px;
  margin-bottom: 12px;
}

.hero-avatar {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  border: 4px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 800;
  font-size: 1.25rem;
  letter-spacing: 0.5px;
  overflow: hidden;
  box-shadow: 0 12px 28px -10px rgba(124, 58, 237, 0.6);
  position: relative;
  z-index: 2;
}

.hero-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e1b4b;
  margin: 0 0 10px;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hero-meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  background: #fafaff;
  border: 1px solid #e9e7f2;
  border-radius: 999px;
  font-size: 0.76rem;
  color: #4b5563;
  font-weight: 600;
}

.hero-meta-chip-copy {
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.hero-meta-chip-copy:hover {
  background: #f3eeff;
  border-color: #c7b8ff;
}

.hero-urn {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.72rem;
  letter-spacing: 0.3px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ============================================================
   SECTION CARD
   ============================================================ */
.section-card {
  background: white;
  border-radius: 18px;
  padding: 22px 24px;
  border: 1px solid #e9e7f2;
  box-shadow: 0 1px 2px rgba(30, 27, 75, 0.03);
  transition: border-color 0.2s ease;
}

.section-card-editing {
  border-color: #c7b8ff;
  box-shadow:
    0 1px 2px rgba(30, 27, 75, 0.03),
    0 0 0 4px rgba(124, 58, 237, 0.06);
}

.section-head {
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -0.2px;
}

.section-title span {
  font-size: 1rem;
}

.section-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 14px -6px rgba(124, 58, 237, 0.55);
  flex-shrink: 0;
}

.section-icon-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 6px 14px -6px rgba(239, 68, 68, 0.55);
}

.section-sub {
  font-size: 0.78rem;
  color: #9ca3af;
  margin-top: 4px;
  padding-left: 42px;
}

.danger-text {
  color: #ef4444;
}

/* ============================================================
   EDIT PANEL
   ============================================================ */
.edit-panel {
  background: white;
  border-radius: 18px;
  padding: 22px 24px;
  border: 1px solid #c7b8ff;
  box-shadow:
    0 1px 2px rgba(30, 27, 75, 0.03),
    0 0 0 4px rgba(124, 58, 237, 0.06);
}

.upload-grid {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 20px;
}

.upload-block {
  display: flex;
  flex-direction: column;
}

.upload-label {
  font-size: 0.7rem;
  font-weight: 800;
  color: #4b5563;
  margin-bottom: 8px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.logo-drop-zone {
  position: relative;
  width: 160px;
  height: 160px;
  border-radius: 16px;
  overflow: hidden;
  border: 2px dashed #d8d4e8;
  background: #fafaff;
  transition: all 0.2s ease;
}

.logo-drop-zone:hover {
  border-color: #7c3aed;
  background: #f9f5ff;
}

.logo-drop-zone ::v-deep .dropzone {
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
  background: transparent !important;
  border: none !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  padding: 0 !important;
}

.logo-drop-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  pointer-events: none;
  color: #7c7a95;
  font-size: 0.72rem;
  font-weight: 700;
}

.logo-drop-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(124, 58, 237, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-drop-sub {
  font-size: 0.62rem;
  color: #9ca3af;
  font-weight: 600;
}

.cover-drop-zone {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  border: 2px dashed #d8d4e8;
  background: #fafaff;
  min-height: 160px;
  transition: all 0.2s ease;
}

.cover-drop-zone:hover {
  border-color: #7c3aed;
  background: #f9f5ff;
}

.cover-drop-zone ::v-deep .dropzone {
  border-radius: 12px !important;
  border: none !important;
  background: transparent !important;
  min-height: 160px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.cover-drop-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  pointer-events: none;
  color: #7c7a95;
  font-size: 0.76rem;
  font-weight: 700;
}

.upload-hint-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.upload-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: #9ca3af;
}

.clear-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  background: transparent;
  border: 1px solid #fecaca;
  color: #ef4444;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  border-radius: 999px;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: #fef2f2;
}

/* ============================================================
   FIELDS
   ============================================================ */
.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 20px;
}

.field {
  display: flex;
  flex-direction: column;
}

.field-span-2 {
  grid-column: 1 / -1;
}

.field-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.7rem;
  font-weight: 800;
  color: #4b5563;
  margin-bottom: 7px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.field-label-hint {
  font-size: 0.62rem;
  color: #9ca3af;
  font-weight: 600;
  letter-spacing: 0.2px;
  text-transform: none;
}

.coord-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.coord-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  color: #9ca3af;
  margin-top: 8px;
  font-weight: 500;
}

.urn-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.urn-wrap ::v-deep .v-input__slot {
  padding-right: 44px !important;
}

.urn-copy {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(124, 58, 237, 0.08);
  border: 1px solid #e9e0ff;
  color: #7c3aed;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.urn-copy:hover {
  background: #f3eeff;
  border-color: #c7b8ff;
}

.urn-field ::v-deep input {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.82rem;
  letter-spacing: 0.5px;
  color: #4b5563;
}

::v-deep .theme--light.v-text-field--outlined fieldset {
  border-radius: 12px !important;
  border-color: #e9e7f2 !important;
}

::v-deep .theme--light.v-text-field--outlined:not(.v-input--is-focused):hover fieldset {
  border-color: #c7b8ff !important;
}

::v-deep .theme--light.v-text-field--outlined.v-input--is-focused fieldset {
  border-color: #7c3aed !important;
  border-width: 2px !important;
}

/* ============================================================
   STICKY SAVE BAR
   ============================================================ */
.save-bar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px 12px 20px;
  background: white;
  border: 1px solid #e9e7f2;
  border-radius: 999px;
  box-shadow: 0 20px 40px -16px rgba(30, 27, 75, 0.3);
  max-width: calc(100% - 32px);
}

.save-bar-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #1e1b4b;
}

.save-bar-actions {
  display: flex;
  gap: 8px;
}

.save-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  border: none;
  transition: all 0.2s ease;
}

.save-btn-ghost {
  background: #f3f4f6;
  color: #4b5563;
}

.save-btn-ghost:hover {
  background: #e9e7f2;
}

.save-btn-primary {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  box-shadow: 0 8px 18px -6px rgba(124, 58, 237, 0.55);
}

.save-btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px -6px rgba(124, 58, 237, 0.75);
}

.save-btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ============================================================
   CONFIG
   ============================================================ */
.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.config-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid #e9e7f2;
  border-radius: 14px;
  background: #fafaff;
  transition: all 0.2s ease;
}

.config-item.config-on {
  background: linear-gradient(135deg, #faf8ff 0%, #f3eeff 100%);
  border-color: #e0d4ff;
}

.config-icon {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.config-icon.icon-on {
  background: white;
  border: 1px solid #e0d4ff;
  box-shadow: 0 4px 10px -4px rgba(124, 58, 237, 0.2);
}

.config-icon.icon-off {
  background: white;
  border: 1px solid #e9e7f2;
}

.config-body {
  min-width: 0;
}

.config-label {
  font-size: 0.82rem;
  font-weight: 800;
  color: #1e1b4b;
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

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-on  { background: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15); }
.dot-off { background: #cbd5e1; }

/* ============================================================
   LINK / DANGER ROWS
   ============================================================ */
.link-row,
.danger-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid #e9e7f2;
  border-radius: 14px;
  background: #fafaff;
}

.link-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.link-icon {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: white;
  border: 1px solid #e9e7f2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.link-icon-signout {
  background: #f3eeff;
  border-color: #e0d4ff;
}

.link-body {
  min-width: 0;
}

.link-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: #1e1b4b;
}

.link-sub {
  font-size: 0.74rem;
  color: #7c7a95;
  margin-top: 3px;
  line-height: 1.4;
}

/* Danger card */
.danger-card {
  border-color: #fecaca;
  background: linear-gradient(180deg, #fff 0%, #fff5f5 100%);
}

.danger-card .danger-row {
  background: white;
  border-color: #fecaca;
}

/* ============================================================
   CONFIRM DIALOGS
   ============================================================ */
::v-deep .confirm-dialog {
  border-radius: 20px !important;
  overflow: hidden !important;
  margin: 16px auto !important;
  max-width: 420px !important;
  width: calc(100% - 32px) !important;
}

.confirm-shell {
  background: white;
  padding: 28px 24px 20px;
  text-align: center;
}

.confirm-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #fef2f2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.confirm-icon-purple {
  background: #f3eeff;
}

.confirm-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -0.3px;
  margin-bottom: 8px;
}

.confirm-text {
  font-size: 0.85rem;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 20px;
}

.confirm-text strong {
  color: #1e1b4b;
}

.confirm-actions {
  display: flex;
  gap: 8px;
}

/* ============================================================
   TRANSITIONS
   ============================================================ */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter,
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 900px) {
  .upload-grid {
    grid-template-columns: 1fr;
  }

  .logo-drop-zone {
    width: 100%;
    height: 160px;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }

  .field-span-2 {
    grid-column: auto;
  }
}

@media (max-width: 599px) {
  .account-page {
    padding-bottom: 120px;
  }

  .hero-cover {
    height: 160px;
  }

  .hero-body {
    padding: 0 18px 18px;
  }

  .hero-avatar {
    width: 70px;
    height: 70px;
    border-radius: 18px;
    font-size: 1.05rem;
    margin-top: -34px;
  }

  .hero-avatar-wrap {
    margin-top: -34px;
  }

  .hero-name {
    font-size: 1.25rem;
  }

  .hero-urn {
    max-width: 130px;
  }

  .section-card,
  .edit-panel {
    padding: 18px;
    border-radius: 16px;
  }

  .section-sub {
    padding-left: 0;
  }

  .coord-row {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .save-bar {
    flex-direction: column;
    padding: 12px;
    border-radius: 20px;
    width: calc(100% - 24px);
    left: 12px;
    transform: none;
  }

  .save-bar-actions {
    width: 100%;
  }

  .save-btn {
    flex: 1;
  }

  .slide-up-enter,
  .slide-up-leave-to {
    transform: translateY(20px);
  }

  .config-grid {
    grid-template-columns: 1fr;
  }

  .link-row,
  .danger-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}
</style>