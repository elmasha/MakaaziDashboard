<template>
<div class="container">

    <v-card elevation="0">
        <v-card-title class="container" style="color: black">
            <h2>Account</h2>
            <v-spacer></v-spacer>
            <v-btn icon @click="edit = !edit">
                <v-icon>mdi-image-edit-outline</v-icon>
            </v-btn>
        </v-card-title>
        <v-row>
            <v-col class="container">
                <div class="container">
                    <v-card elevation="0" :loading="loading" class="mx-auto my-0">

                        <template slot="progress">
                            <v-progress-linear color="deep-purple" height="10" indeterminate></v-progress-linear>
                        </template>

                        <v-img :src="estateImage" class="white--text align-end" gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)" height="220px">
                        </v-img>

                        <v-card-text>
                            <div class="d-flex">
                                <v-avatar color="#8051FF" style="margin: 2px">
                                    <v-img :src="logoUrl" contain alt="John" height="300" />
                                </v-avatar>
                                <div>
                                    <h2 style="color: black; font-size: 1.6rem; margin: 18px">
                                        {{ estateName }}
                                    </h2>
                                </div>
                                <div class="d-flex" style="margin-top: 12px;">
                                    <v-btn color="black" outlined text @click="edit = !edit">
                                                <span style="color: blue;">Upload</span>
                                            </v-btn>
                                            <v-btn color="black" outlined text>
                                                <span>Remove</span>
                                            </v-btn>
                                  </div>
                            </div>
                            <div>
                                {{ location }}
                            </div>
                            <div>
                                {{ estateURN }}
                            </div>
                        </v-card-text>

                    </v-card>
                    <div v-show="edit">
                        <v-avatar color="black" size="140">
                            <dropzone id="foo" ref="el" style="border-radius: 360px" @vdropzone-success="handleSuccess2" :options="options" @vdropzone-error="handleError2" @vdropzone-complete="afterCompleteLogo"></dropzone>
                        </v-avatar>
                    </div>
                    <div class="container" v-show="edit">
                        <strong>Edit estate logo</strong>
                    </div>
                </div>
            </v-col>
            <v-col cols="12" md="6" lg="6" class="text-center" v-show="edit">
                <div class="">
                    <dropzone style="background-color: black; border-radius: 20px" id="foo" ref="el" @vdropzone-success="handleSuccess" :options="options" :height="600" @vdropzone-error="handleError" @vdropzone-complete="afterCompletePoster"></dropzone>
                    <strong style="margin: 13px">Upload Estate Cover Image</strong>
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
                    <v-form class="">
                        <v-row class="container">
                            <v-col cols="12" md="6">
                                <v-text-field rounded outlined v-model="estateName" label="Estate Name" @change="generateURN(estateName)" required></v-text-field>
                                <div class="container">
                                    <strong>{{ estateURN }}</strong>
                                </div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <v-text-field rounded outlined v-model="location" label="Estate location" required></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field rounded outlined v-model="estateLng" label="Estate longitute" required type="number">
                                </v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field rounded outlined v-model="estateLat" label="Estate latitude" required type="number"></v-text-field>
                            </v-col>
                            <hr>
                            <v-col cols="12" md="12" v-show="!edit">
                                <v-card elevation="0" color="#f0f0f0">
                                    <div class="container">
                                        <v-card-title>
                                            Link Accounts
                                        </v-card-title>
                                        <v-card-text>
                                            We use this to let you sign and populate profile infornmation
                                        </v-card-text>
                                        <div class="d-flex" style="margin: 10px;">
                                            <div class="d-flex">
                                                <v-avatar size="30">
                                                    <v-img :src="googleIcon" contain />
                                                </v-avatar>

                                                <h4 style="color: grey; margin-top: 6px;margin-left: 10px;">Sign in with google</h4>
                                            </div>
                                            <v-spacer></v-spacer>
                                            <v-btn color="black" outlined text>
                                                <span>Connect</span>
                                            </v-btn>

                                        </div>
                                    </div>

                                </v-card>
                            </v-col>

                            <v-col cols="12" md="12" v-show="!edit">
                                <v-card elevation="0" color="#f0f0f0">
                                    <div class="container">
                                        <v-card-title>
                                            Delete Account
                                        </v-card-title>
                                        <v-card-text>
                                            By deleteing your account you will lose all your data.
                                        </v-card-text>
                                        <div class="d-flex" style="margin: 10px;">
                                            <div class="d-flex">

                                                <h4 style="color: grey; margin-top: 6px;margin-left: 10px;"></h4>
                                            </div>
                                            <v-spacer></v-spacer>
                                            <v-btn color="red" outlined text>
                                                <span>Delete this account</span>
                                            </v-btn>

                                        </div>
                                    </div>

                                </v-card>
                            </v-col>

                        </v-row>
                        <v-row v-show="edit">
                            <v-col cols="12" md="4">
                                <v-btn width="100%" color="black" class="text--white" style="color: white" @click="UploadEstate">Save Changes</v-btn>
                            </v-col>
                            <v-col cols="12" md="4"></v-col>
                            <v-col cols="12" md="4">
                                <div class="d-flex">
                                    Street-
                                    {{ estateStreet }}
                                    section-
                                    {{ estateSections }}
                                    Courts-
                                    {{ estateCourts }}
                                </div>
                            </v-col>
                        </v-row>
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
    props: {
        estateId: {
            type: Number,
            required: true,
        },
    },
    components: {
        Dropzone,
    },
    name: "InspirePage",
    data() {
        return {
            loading:false,
            edit: false,
            snackbar_s: false,
            snackbarText_s: "",
            snackbar: false,
            snackbar2: false,
            snackbarText: "",
            snackbarText2: "",
            googleIcon: require("@/assets/google.png"),
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
            // See https://rowanwins.github.io/vue-dropzone/docs/dist/index.html#/props
            options: {
                url: "http://httpbin.org/anything",
            },
        };
    },
    methods: {
        async Fetch_PostAllEstates() {
            let that = this;
            axios
                .get(`https://makaaziserverapi-production-252f.up.railway.app/api/estates/estate/${that.$route.params.id}`, {})
                .then(function (response) {
                    if (response.status == 200) {
                        // that.snackbar = true;
                        // that.snackbarText = response.data;

                        that.estateName = response.data.estate_name;
                        that.estate_streetName = response.data.estate_streetName;
                        that.location = response.data.estate_location;
                        that.estateURN = response.data.estate_urn;
                        that.estate_image = response.data.estate_image;
                        that.logo_url = response.data.logo_url;
                        console.log("Estates", response.data);
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
                axios
                    .post("https://makaaziserverapi-production-252f.up.railway.app/api/estates/create", {
                        estate_name: that.estateName,
                        estate_urn: that.estateURN,
                        estate_location: that.location,
                        street: false,
                        section: false,
                        court: false,
                        latitude: that.estateLat,
                        longitude: that.estateLng,
                        estate_image: that.imageUrl,
                        logo_url: that.logoUrl,
                        created_at: new Date(),
                        updated_at: new Date(),
                    })
                    .then(function (response) {
                        console.log(response);
                        if (response.status == 200) {
                            that.snackbar = true;
                            that.snackbarText = response.data;
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
            }
        },
        UploadEstateConfig(val) {
            let that = this;
            axios
                .post("https://makaaziserverapi-production-252f.up.railway.app/api/estates/create", {
                    estate_id: val,
                    show_street: that.estateStreet,
                    show_section: that.estateSections,
                    show_court: Number(that.estateCourts),

                })
                .then(function (response) {
                    console.log(response);
                    if (response.status == 200) {
                        that.snackbar = true;
                        that.snackbarText = response.data;
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
        this.Fetch_PostAllEstates()
    },
};
</script>
