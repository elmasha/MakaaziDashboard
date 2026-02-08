<template>
<div class="container">
    <br />
    <div class="container">
        <nuxt-link style="text-decoration: none; color: red" to="/superAdmin">
            <v-chip class="ma-2" color="#b6ff00">
                <v-icon color="black">mdi-chevron-left</v-icon>
            </v-chip>
        </nuxt-link>
    </div>
    <v-card elevation="0">
        <v-card-title class="container" style="color: grey">
            <h1>Upload Estate</h1>
        </v-card-title>
        <div class="">
            <v-card elevation="0" class="mb-4">
                <v-stepper v-model="step" elevation="0">

                    <v-stepper-header color="black">
                        <v-stepper-step color="black" :complete="step > 1" step="1">Estate details</v-stepper-step>
                        <v-divider></v-divider>
                        <v-stepper-step color="black" :complete="step > 2" step="2">Estate address configuration</v-stepper-step>
                        <v-divider></v-divider>

                    </v-stepper-header>

                    <v-stepper-items>

                    </v-stepper-items>
                </v-stepper>
            </v-card>

        </div>

        <v-row v-show="!estateConfig">

            <v-col cols="12" md="6" lg="6" class="text-center">
                <div class="">
                    <div class="container">
                        <div class="container">
                            <strong>Upload estate logo</strong>
                        </div>
                        <div>
                            <v-avatar color="black" size="140">
                                <dropzone id="foo" ref="el" style="border-radius: 360px" @vdropzone-success="handleSuccess2" :options="options"  @vdropzone-complete="afterCompleteLogo"></dropzone>
                            </v-avatar>
                        </div>
                    </div>
                    <strong style="margin: 13px">Upload estate Image</strong>
                    <br />
                    <dropzone style="background-color: black; border-radius: 20px" id="foo" ref="el" @vdropzone-success="handleSuccess" :options="options" :height="600"  @vdropzone-complete="afterCompletePoster"></dropzone>
                </div>
                <div class="d-flex" style="margin: 12px">
                    <v-btn icon @click="clearDropzone">
                        <div class="d-flex">
                            <v-icon small color="red">mdi-close</v-icon>
                        </div>
                    </v-btn>
                    <span @click="clearDropzone" style="margin-top: 4px; color: red">
                        Clear Drop Zone</span>
                    <!-- <v-btn icon>
                          <v-icon small color="white">mdi-share-variant</v-icon>
                        </v-btn> -->
                </div>
            </v-col>
            <v-col cols="12" md="12" lg="12" class="text-start">
                <div class="container">
                    <v-form>
                        <v-container>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="estateName" label="Estate Name" @change="generateURN(estateName)" required></v-text-field>
                                    <div class="container">
                                        <strong>{{ estateURN }}</strong>
                                    </div>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <div class="d-flex">
                                        <v-text-field v-model="location" label="Estate location" required></v-text-field>

                                    </div>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="estateLng" label="Estate longitute" required type="number">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="estateLat" label="Estate latitude" required type="number"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="12">
                                    <div>
                                        <div class="">
                                            <v-chip-group>
                                                <v-chip v-if="estateStreet" value="true" outlined color="grey" class="text--white">{{ estateName }} Estate has streets</v-chip>
                                                <v-chip v-if="estateCourts" value="true" outlined color="grey" class="text--white">{{ estateName }} Estate has courts</v-chip>
                                                <v-chip v-if="estateSections" value="true" outlined color="grey" class="text--white">{{ estateName }} Estate has sections</v-chip>
                                            </v-chip-group>
                                        </div>
                                    </div>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-row style="border-radius: 14px;background-color: aliceblue;">
                                        <v-col cols="6" md="4">
                                            <p style="font-size: 0.8rem;">Switch if Estate has Sections</p>
                                            <v-switch v-model="estateSections" label="Estate section" required type="number"></v-switch>
                                        </v-col>
                                        <v-col cols="6" md="4">
                                            <p style="font-size: 0.8rem;">Switch if Estate has Courts</p>
                                            <v-switch v-model="estateCourts" label="Estate courts" required type="number"></v-switch>
                                        </v-col>
                                        <v-col cols="6" md="4">
                                            <p style="font-size: 0.8rem;">Switch if Estate has Streets</p>
                                            <v-switch v-model="estateStreet" label="Estate streets" required type="number"></v-switch>
                                        </v-col>
                                    </v-row>
                                </v-col>

                            </v-row>
                            <v-row>
                                <v-col cols="12" md="4">
                                    <v-btn width="100%" color="black" class="text--white" style="color: white" @click="UploadEstate">Next <v-icon>mdi-arrow-right</v-icon>
                                    </v-btn>
                                </v-col>
                                
                            </v-row>
                        </v-container>
                    </v-form>
                </div>
            </v-col>
        </v-row>
        <v-row v-show="estateConfig">
            <v-col cols="12" md="12" lg="12" class="text-start">
                <div class="container">
                    <h3>Configure Estate Address</h3>
                    <div>
                        <div class="">
                            <v-chip-group>
                                <v-chip v-if="estateStreet" value="true" outlined color="grey" class="text--white">{{ estateName }} Estate has streets</v-chip>
                                <v-chip v-if="estateCourts" value="true" outlined color="grey" class="text--white">{{ estateName }} Estate has courts</v-chip>
                                <v-chip v-if="estateSections" value="true" outlined color="grey" class="text--white">{{ estateName }} Estate has sections</v-chip>
                            </v-chip-group>
                        </div>
                    </div>
                    <v-form>
                        <v-container>
                            <v-row>

                                <v-col cols="12" md="6" v-show="estateSections">
                                    <div class="d-flex">
                                        <v-text-field v-model="estateSections_input" label="Estate sections" required type="alphanumeric"></v-text-field>

                                        <v-btn color="black" @click="UploadEstatSection">
                                            <div class="d-flex">
                                                <v-icon small color="white">mdi-plus</v-icon>
                                            </div>
                                        </v-btn>
                                    </div>
                                </v-col>
                                <v-col cols="12" md="6" v-show="estateStreet">
                                    <div class="d-flex">
                                        <v-text-field v-model="estateStreet_input" label="Estate streets" required type="alphanumeric">
                                        </v-text-field>
                                        <v-btn color="black" @click="UploadEstateStreet">
                                            <div class="d-flex">
                                                <v-icon small color="white">mdi-plus</v-icon>
                                            </div>
                                        </v-btn>
                                    </div>

                                </v-col>
                                <v-col cols="12" md="6" v-show="estateCourts">
                                    <div class="d-flex">
                                        <v-text-field v-model="estateCourts_input" label="Estate courts" required type="alphanumeric"></v-text-field>
                                        <v-btn color="black">
                                            <div class="d-flex">
                                                <v-icon small color="white" @click="UploadEstateCourt">mdi-plus</v-icon>
                                            </div>
                                        </v-btn>
                                    </div>

                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-btn width="100%" color="black" class="text--white" style="color: white" to="/superadmin">Finish</v-btn>
                                </v-col>

                            </v-row>

                        </v-container>
                    </v-form>
                </div>
            </v-col>
        </v-row>
    </v-card>
    <v-snackbar color="primary accent-8" :timeout="6000" v-model="snackbar_s" centered bottom>
        {{ snackbarText_s }}
    </v-snackbar>
    <v-snackbar color="success" :timeout="2000" v-model="snackbar" outlined center>
        {{ snackbarText }}
    </v-snackbar>
    <v-snackbar color="error" :timeout="2500" v-model="snackbar2" outlined center>
        {{ snackbarText2 }}
    </v-snackbar>
</div>
</template>

<script>
import Dropzone from "nuxt-dropzone";
import "nuxt-dropzone/dropzone.css";
import {
    uuid
} from "vue-uuid";
import axios from "axios";

export default {
    components: {
        Dropzone,
    },
    name: "InspirePage",
    data() {
        return {
            estateCourts_input: null,
            estateSections_input: null,
            estateStreet_input: null,
            estateConfig: false,
            step: 1,
            snackbar_s: false,
            snackbarText_s: "",
            snackbar: false,
            snackbar2: false,
            snackbarText: "",
            snackbarText2: "",
            estateName: null,
            estateURN: null,
            location: null,
            estateSections: null,
            estateCourts: null,
            estateStreet: null,
            estateStreetName: null,
            estateCharges: ["Monthly", "Quarterly", " Half yearly", "Annual", "Adhoc"],
            estateWelfare: ["Mandatory", "Optional"],
            estateWelfareValue: false,
            estateWelfareModel: null,
            estateWelfareAmount: null,
            estateImage: null,
            serviceCharges: null,
            serviceChargesAmount: null,
            estateLat: 0.0,
            estateLng: 0.0,
            imageUrl: null,
            logoUrl: null,
            estate_id: null,
            // See https://rowanwins.github.io/vue-dropzone/docs/dist/index.html#/props
            options: {
                url: "http://httpbin.org/anything",
            },
        };
    },
    methods: {
        checkWelFare(val) {
            if ((val = "Mandatory")) {
                this.estateWelfareValue = true;
            } else if ((val = "Optional")) {
                this.estateWelfareValue = false;
            }
        },
        generateURN(val) {
            const timestamp = Date.now(); // Current timestamp in milliseconds
            const randomNum = Math.floor(Math.random() * 100000); // Random 5-digit number
            // Remove any special characters or spaces from the name and convert to uppercase
            const formattedName = val.substring(0, 5).toUpperCase();
            this.estateURN = `${formattedName}-${timestamp}-${randomNum}`;
            return `${formattedName}-${timestamp}-${randomNum}`;
        },
        handleError(file, errorMessage, xhr) {
            // Handle error event here
            console.error("Error uploading file:");
            this.snackbar2 = true;
            this.snackbarText2 = "Error uploading file";
        },
        handleSuccess(file, response) {
            // Handle success event here
            console.log("File uploaded successfully!", response);
            this.snackbar = true;
            this.snackbarText = "File uploaded";
        },
        handleError2(file, errorMessage, xhr) {
            // Handle error event here
            console.error("Error uploading file:");
            this.snackbar2 = true;
            this.snackbarText2 = "Error uploading file";
        },
        handleSuccess2(file, response) {
            // Handle success event here
            console.log("File uploaded successfully!", response);
            this.snackbar = true;
            this.snackbarText = "File uploaded";
        },
        clearDropzone() {
            this.$refs.el.dropzone.removeAllFiles();
        },
        async afterCompletePoster(upload2) {
            const storageRef = this.$fire.storage.ref();
            var imageNameP = uuid.v1();
            try {
                //save image
                let file = upload2;
                var metadata = {
                    contentType: "image/png",
                };
                var imageRef = storageRef.child(`posts/${imageNameP}.png`);
                await imageRef.put(file, metadata);
                var downloadURLP = await imageRef.getDownloadURL();

                this.imageUrl = downloadURLP;
                console.log("image url", downloadURLP);
                this.snackbar = true;
                this.snackbarText = "Image Uploaded";
            } catch (error) {
                this.snackbar2 = true;
                this.snackbarText2 = error;
                console.log(error);
            }
        },
        async afterCompleteLogo(upload2) {
            const storageRef = this.$fire.storage.ref();
            var imageNameP = uuid.v1();
            try {
                //save image
                let file = upload2;
                var metadata = {
                    contentType: "image/png",
                };
                var imageRef = storageRef.child(`posts/${imageNameP}.png`);
                await imageRef.put(file, metadata);
                var downloadURLP = await imageRef.getDownloadURL();

                this.logoUrl = downloadURLP;
                console.log("image url", downloadURLP);
                this.snackbar = true;
                this.snackbarText = "Image Uploaded";
            } catch (error) {
                this.snackbar2 = true;
                this.snackbarText2 = error;
                console.log(error);
            }
        },
        UploadEstate() {
            let that = this;
            if (that.estateName == null) {
                that.snackbarText2 = "Provide estate name..";
                that.snackbar2 = true;
            } else if (that.location == null) {
                that.snackbarText2 = "Provide location.";
                that.snackbar2 = true;
            } else if (that.imageUrl == null) {
                that.snackbarText2 = "Provide image.";
                that.snackbar2 = true;
            } else if (that.logoUrl == null) {
                that.snackbarText2 = "Provide logo.";
                that.snackbar2 = true;
            } else {
                that.show6 = true;
                const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
                axios
                    .post("https://makaaziserverapi-production-252f.up.railway.app/api/estates/create", {
                        estate_name: that.estateName + " Estate",
                        estate_urn: that.estateURN,
                        estate_location: that.location,
                        street: that.estateStreet || 0,
                        section: that.estateSections || 0,
                        court: that.estateCourts || 0,
                        latitude: that.estateLat,
                        longitude: that.estateLng,
                        estate_image: that.imageUrl,
                        logo_url: that.logoUrl,
                        created_at: created_at,
                        updated_at: created_at,
                    })
                    .then(function (response) {
                        console.log(response);

                      
                        that.estate_id = response.data.estate_id;
                        that.step = 2;
                        that.estateConfig = true;
                        that.UploadEstateConfig(that.estate_id);
                    })
                    .catch(function (error) {
                        console.log(error);
                        that.snackbarText2 = error;
                        that.snackbar2 = true;
                    });
            }
        },
        UploadEstateConfig(val) {
            let that = this;
            axios
                .post("https://makaaziserverapi-production-252f.up.railway.app/api/estates-config/create", {
                    estate_id: val,
                    show_street: that.estateStreet || 0,
                    show_section: that.estateSections || 0,
                    show_court: that.estateCourts || 0,

                })
                .then(function (response) {
                    console.log(response);
                    if (response.status == 200) {
                        that.snackbar = true;
                        that.snackbarText = response.data;
                        that.step = 2;
                        that.estateConfig = true;
                    } else if (response.status == 400) {
                        that.snackbar2 = true;
                        that.snackbarText2 = response.data;
                    }
                })
                .catch(function (error) {
                    console.log(error);
                    that.snackbarText2 = error;
                    that.snackbar2 = true;
                });

        },
        UploadEstatSection() {
            let that = this;
            axios
                .post("https://makaaziserverapi-production-252f.up.railway.app/api/estates-config/add-section", {
                    estate_id: that.estate_id,
                    section_name: that.estateSections_input,

                })
                .then(function (response) {
                    console.log(response);
                    if (response.status == 200) {
                        that.snackbar = true;
                        that.snackbarText = response.data;
                        that.estateSections_input = null;
                    } else if (response.status == 400) {
                        that.snackbar2 = true;
                        that.snackbarText2 = response.data;
                    }
                })
                .catch(function (error) {
                    console.log(error);
                    that.snackbarText2 = error;
                    that.snackbar2 = true;
                });

        },
        UploadEstateStreet() {
            let that = this;
            axios
                .post("https://makaaziserverapi-production-252f.up.railway.app/api/estates-config/add-street", {
                    estate_id: that.estate_id,
                    street_name: that.estateStreet_input,

                })
                .then(function (response) {
                    console.log(response);
                    if (response.status == 200) {
                        that.snackbar = true;
                        that.snackbarText = response.data;
                        that.estateStreet_input = null;
                    } else if (response.status == 400) {
                        that.snackbar2 = true;
                        that.snackbarText2 = response.data;
                    }
                })
                .catch(function (error) {
                    console.log(error);
                    that.snackbarText2 = error;
                    that.snackbar2 = true;
                });

        },
        UploadEstateCourt() {
            let that = this;
            axios
                .post("https://makaaziserverapi-production-252f.up.railway.app/api/estates-config/add-court", {
                    estate_id: that.estate_id,
                    court_name: that.estateCourts_input,

                })
                .then(function (response) {
                    console.log(response);
                    if (response.status == 200) {
                        that.snackbar = true;
                        that.snackbarText = response.data;
                        that.estateCourts_input = null;
                    } else if (response.status == 400) {
                        that.snackbar2 = true;
                        that.snackbarText2 = response.data;
                    }
                })
                .catch(function (error) {
                    console.log(error);
                    that.snackbarText2 = error;
                    that.snackbar2 = true;
                });
        },
    },

    mounted() {
        // Everything is mounted and you can access the dropzone instance
        const instance = this.$refs.el.dropzone;
    },
};
</script>
