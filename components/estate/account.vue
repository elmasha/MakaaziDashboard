<template>
  <div class="account-page">
    <!-- ============================================================
         ESTATE HERO CARD
         ============================================================ -->
    <div class="hero-card">
      <!-- Cover image -->
      <div class="hero-cover" :style="coverStyle">
        <div class="hero-cover-overlay"></div>
        <button class="hero-edit-btn" @click="edit = !edit">
          <v-icon size="16">{{ edit ? 'mdi-close' : 'mdi-pencil' }}</v-icon>
          <span>{{ edit ? 'Cancel' : 'Edit' }}</span>
        </button>
      </div>

      <!-- Estate identity -->
      <div class="hero-body">
        <div class="hero-avatar-wrap">
          <div class="hero-avatar">
            <img v-if="logoUrl" :src="logoUrl" alt="logo" />
            <span v-else>{{ estateInitials }}</span>
          </div>
        </div>

        <div class="hero-info">
          <h2 class="hero-name">{{ estateName || "Untitled Estate" }}</h2>
          <div class="hero-meta">
            <span class="hero-meta-item">
              <v-icon size="14" color="#9ca3af">mdi-map-marker-outline</v-icon>
              {{ location || "No location set" }}
            </span>
            <span class="hero-meta-item">
              <v-icon size="14" color="#9ca3af">mdi-identifier</v-icon>
              <span class="hero-urn">{{ estateURN || "—" }}</span>
            </span>
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
            <v-icon size="18" color="#7c3aed">mdi-image-multiple-outline</v-icon>
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
                <v-icon size="22" color="#9ca3af">mdi-camera-plus-outline</v-icon>
                <span>Drop logo</span>
              </div>
              <div v-else class="logo-drop-overlay">
                <v-progress-circular indeterminate size="22" color="#7c3aed" />
              </div>
            </div>
            <div class="upload-hint">PNG or SVG, square, max 1MB</div>
          </div>

          <!-- Cover -->
          <div class="upload-block upload-block-wide">
            <div class="upload-label">Estate cover image</div>
            <dropzone
              ref="coverDropzone"
              :options="options"
              :maxFiles="1"
              @vdropzone-success="handleSuccess"
              @vdropzone-error="handleError"
              @vdropzone-complete="afterCompletePoster"
            ></dropzone>
            <div class="upload-hint-row">
              <span class="upload-hint">Recommended 1600×600, JPG or PNG</span>
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
    <div class="section-card">
      <div class="section-head">
        <div class="section-title">
          <v-icon size="18" color="#7c3aed">mdi-office-building-outline</v-icon>
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

          <div class="field">
            <label class="field-label">Unique Reference (URN)</label>
            <v-text-field
              v-model="estateURN"
              dense
              outlined
              rounded
              hide-details
              readonly
              class="urn-field"
            >
              <template v-slot:append>
                <v-icon
                  size="16"
                  color="#9ca3af"
                  style="cursor: pointer"
                  @click="copyURN"
                >
                  mdi-content-copy
                </v-icon>
              </template>
            </v-text-field>
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
          </div>
        </div>

        <!-- Action buttons (edit mode only) -->
        <transition name="fade-slide">
          <div v-if="edit" class="form-actions">
            <v-btn
              rounded
              large
              depressed
              color="#7c3aed"
              dark
              class="text-capitalize font-weight-bold"
              :loading="saving"
              @click="UploadEstate"
            >
              <v-icon left small>mdi-content-save</v-icon>
              Save changes
            </v-btn>
            <v-btn
              rounded
              large
              text
              class="text-capitalize"
              @click="cancelEdit"
            >
              Cancel
            </v-btn>
          </div>
        </transition>
      </v-form>
    </div>

    <!-- ============================================================
         CONFIG SUMMARY (visible when not editing)
         ============================================================ -->
    <div v-if="!edit" class="section-card">
      <div class="section-head">
        <div class="section-title">
          <v-icon size="18" color="#7c3aed">mdi-tune-variant</v-icon>
          <span>Address configuration</span>
        </div>
        <div class="section-sub">
          Which address fields are shown to residents
        </div>
      </div>

      <div class="config-grid">
        <div class="config-item">
          <div class="config-icon config-icon-street">
            <v-icon size="18" color="#7c3aed">mdi-road-variant</v-icon>
          </div>
          <div>
            <div class="config-label">Street</div>
            <div class="config-status">{{ estateStreet ? "Shown" : "Hidden" }}</div>
          </div>
        </div>

        <div class="config-item">
          <div class="config-icon config-icon-section">
            <v-icon size="18" color="#7c3aed">mdi-map-marker-multiple</v-icon>
          </div>
          <div>
            <div class="config-label">Section</div>
            <div class="config-status">{{ estateSections ? "Shown" : "Hidden" }}</div>
          </div>
        </div>

        <div class="config-item">
          <div class="config-icon config-icon-court">
            <v-icon size="18" color="#7c3aed">mdi-home-city-outline</v-icon>
          </div>
          <div>
            <div class="config-label">Court</div>
            <div class="config-status">{{ estateCourts ? "Shown" : "Hidden" }}</div>
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
          <v-icon size="18" color="#7c3aed">mdi-link-variant</v-icon>
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
          <div>
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
         DANGER ZONE
         ============================================================ -->
    <div v-if="!edit" class="section-card danger-card">
      <div class="section-head">
        <div class="section-title">
          <v-icon size="18" color="#ef4444">mdi-alert-outline</v-icon>
          <span class="danger-text">Danger zone</span>
        </div>
        <div class="section-sub">
          Irreversible actions on your estate account
        </div>
      </div>

      <div class="danger-row">
        <div>
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
      logoUploading: false,

      // Estate
      estateName: "",
      estateURN: "",
      location: "",
      estateLat: 0.0,
      estateLng: 0.0,
      imageUrl: null,
      logoUrl: null,

      // Address config (read-only display)
      estateStreet: false,
      estateSections: false,
      estateCourts: false,

      // Assets
      googleIcon: require("@/assets/google.png"),

      // Dropzone options
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
    this.fetchEstate();
    this.fetchAddressConfig();
  },

  methods: {
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
      // Only regenerate if user is editing and URN is empty
      if (!this.edit) return;
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 100000);
      const formattedName = val.substring(0, 5).toUpperCase();
      this.estateURN = `${formattedName}-${timestamp}-${randomNum}`;
    },

    copyURN() {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.estateURN);
        this.showSuccess("URN copied");
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
      // Reset to server values
      this.fetchEstate();
      this.fetchAddressConfig();
    },

    // =========================================================
    // UI HELPERS
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
}

/* ============================================================
   HERO CARD
   ============================================================ */
.hero-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow:
    0 1px 2px rgba(30, 27, 75, 0.04),
    0 12px 32px -16px rgba(30, 27, 75, 0.12);
  border: 1px solid #e9e7f2;
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
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.35));
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
  transition: all 0.2s ease;
  font-family: inherit;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px -4px rgba(0, 0, 0, 0.2);
}

.hero-edit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.3);
}

.hero-body {
  position: relative;
  padding: 0 24px 24px;
}

.hero-avatar-wrap {
  margin-top: -36px;
  margin-bottom: 12px;
}

.hero-avatar {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  border: 4px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
  overflow: hidden;
  box-shadow: 0 8px 24px -8px rgba(124, 58, 237, 0.5);
}

.hero-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-name {
  font-size: 1.4rem;
  font-weight: 800;
  color: #1e1b4b;
  margin: 0 0 8px;
  letter-spacing: -0.4px;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 0.82rem;
  color: #6b7280;
}

.hero-meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.hero-urn {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.78rem;
  color: #4b5563;
}

/* ============================================================
   SECTION CARDS
   ============================================================ */
.section-card {
  background: white;
  border-radius: 18px;
  padding: 24px;
  border: 1px solid #e9e7f2;
  box-shadow:
    0 1px 2px rgba(30, 27, 75, 0.03),
    0 8px 24px -16px rgba(30, 27, 75, 0.1);
}

.section-head {
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -0.2px;
}

.section-title span {
  font-size: 0.98rem;
}

.section-sub {
  font-size: 0.78rem;
  color: #9ca3af;
  margin-top: 4px;
  padding-left: 26px;
}

.danger-text {
  color: #ef4444;
}

/* ============================================================
   EDIT PANEL (uploads)
   ============================================================ */
.edit-panel {
  background: white;
  border-radius: 18px;
  padding: 24px;
  border: 1px solid #e9e7f2;
  box-shadow:
    0 1px 2px rgba(30, 27, 75, 0.03),
    0 8px 24px -16px rgba(30, 27, 75, 0.1);
}

.upload-grid {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 20px;
}

@media (max-width: 600px) {
  .upload-grid {
    grid-template-columns: 1fr;
  }
}

.upload-block {
  display: flex;
  flex-direction: column;
}

.upload-block-wide {
  min-width: 0;
}

.upload-label {
  font-size: 0.74rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 8px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

/* Logo drop zone */
.logo-drop-zone {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 16px;
  overflow: hidden;
  border: 2px dashed #d8d4e8;
  background: #fafaff;
  transition: border-color 0.2s ease;
}

.logo-drop-zone:hover {
  border-color: #c7b8ff;
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
  color: #9ca3af;
  font-size: 0.72rem;
  font-weight: 600;
}

.upload-hint {
  font-size: 0.7rem;
  color: #9ca3af;
  margin-top: 8px;
}

.upload-hint-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: transparent;
  border: none;
  color: #ef4444;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.clear-btn:hover {
  background: #fef2f2;
}

/* Cover dropzone */
.section-card ::v-deep .dropzone,
.edit-panel ::v-deep .dropzone {
  border-radius: 14px !important;
  border: 2px dashed #d8d4e8 !important;
  background: #fafaff !important;
  min-height: 140px !important;
  transition: border-color 0.2s ease !important;
}

.section-card ::v-deep .dropzone:hover,
.edit-panel ::v-deep .dropzone:hover {
  border-color: #c7b8ff !important;
}

/* ============================================================
   FORM FIELDS
   ============================================================ */
.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 20px;
}

@media (max-width: 700px) {
  .field-grid {
    grid-template-columns: 1fr;
  }
  .field-span-2 {
    grid-column: auto !important;
  }
}

.field {
  display: flex;
  flex-direction: column;
}

.field-span-2 {
  grid-column: 1 / -1;
}

.field-label {
  font-size: 0.74rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 6px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.coord-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
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

.urn-field ::v-deep input {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.82rem;
  letter-spacing: 0.5px;
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}

/* ============================================================
   CONFIG SUMMARY
   ============================================================ */
.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.config-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid #e9e7f2;
  border-radius: 12px;
  background: #fafaff;
}

.config-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: white;
  border: 1px solid #e9e7f2;
}

.config-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #1e1b4b;
}

.config-status {
  font-size: 0.72rem;
  color: #7c7a95;
  margin-top: 2px;
}

/* ============================================================
   LINKED ACCOUNTS
   ============================================================ */
.link-row,
.danger-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px;
  border: 1px solid #e9e7f2;
  border-radius: 12px;
  background: #fafaff;
}

.link-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.link-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: white;
  border: 1px solid #e9e7f2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.link-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1e1b4b;
}

.link-sub {
  font-size: 0.75rem;
  color: #7c7a95;
  margin-top: 2px;
}

/* Danger card */
.danger-card {
  border-color: #fecaca;
}

/* ============================================================
   CONFIRM DELETE DIALOG
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
   Transitions
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
</style>