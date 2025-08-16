<template>
<v-img :src="loginbg">
    <v-app-bar color="#ffffff00" light elevation="0">

        <div class="d-flex">

            <v-toolbar-title style="color: black; margin-start: 8px; margin-right: 8px">Makaazi</v-toolbar-title>
        </div>

        <v-spacer></v-spacer>

    </v-app-bar>
    <div class="container ">
        <v-progress-linear v-show="progress_bar" indeterminate color="green"></v-progress-linear>
        <div class="container">
            <v-card class="mx-auto text-center" max-width="354" style="padding: 10px;">

                <br>
                <v-card-actions>

                    <v-img contain :src="enter" height="50"></v-img>

                </v-card-actions>

                <v-card-subtitle>
                    <h3 style="font-size: 1.3rem; margin: 12px;"> Sign in with email</h3>

                    1,000 miles of wonder
                </v-card-subtitle>

                <div class="container">
                    <v-form ref="form" v-model="valid" lazy-validation>

                        <v-autocomplete v-model="select" :loading="loading" :items="items" :search-input.sync="search" cache-items @change="getEStateID(select)" class="mx-4" flat hide-no-data hide-details label="   Which estate are you from?   " solo></v-autocomplete>
                        <div>
                            <v-card-subtitle>
                                {{select}}
                            </v-card-subtitle>

                        </div>

                        <v-text-field v-model="auth.email" :rules="emailRules" label="E-mail" required></v-text-field>

                        <v-text-field v-model="auth.password" :counter="10" :rules="nameRules" label="Password" type="password"></v-text-field>

                        <v-checkbox v-model="checkbox" :rules="[v => !!v || 'You must agree to continue!']" label="Do you agree?" required></v-checkbox>

                        <v-btn rounded width="100%" style="color: aliceblue;" color="black" @click="login">
                            Get started
                        </v-btn>
                    </v-form>
                    <br>
                    <h4>
                        <p>Or sign in with</p>
                    </h4>
                    <br>
                    <div class="d-flex">
                        <a @click="signUpGoogle">
                            <v-card outlined class="mx-auto text-center" max-width="144">
                                <div class="container">
                                    <v-img contain :src="google" height="20"></v-img>
                                </div>

                            </v-card>
                        </a>
                        <v-spacer></v-spacer>
                        <a>
                            <v-card outlined class="mx-auto text-center" max-width="144">
                                <div class="container">
                                    <v-img contain :src="facebook" height="20"></v-img>
                                </div>

                            </v-card>
                        </a>

                    </div>

                </div>

            </v-card>

        </div>
        <v-snackbar color="white--text" :timeout="4000" v-model="snackbar" center>
            {{ snackbarText }}
        </v-snackbar>
        <v-snackbar color="red" :timeout="4000" v-model="snackbar2" outlined bottom center>
            {{ snackbarText2 }}
        </v-snackbar>
    </div>
</v-img>
</template>

<script>
import firebase from "firebase/compat/app";
import Vue from "vue";
import VueCountryCode from "vue-country-code";
import axios from "axios";

Vue.use(VueCountryCode);
export default {
    data() {
        return {
            estates: [],
            estate_image: "",
            estate_name: "",
            estate_streetName: "",
            location: "",
            logo_url: "",
            estateURN: "",
            logo_url: "",
            household_search: "",
            loading: false,
            items: [],
            search: null,
            select: null,
            states: [],
            facebook: require("@/assets/facebook.png"),
            google: require("@/assets/google.png"),
            loginbg: require("@/assets/login_bg.png"),
            enter: require("@/assets/enter.png"),
            logo: require("@/assets/logo.svg"),
            intput_username: "",
            intput_email: "",
            intput_farmName: "",
            register: false,
            code_stateR: false,
            progress_bar: false,
            showauth: true,
            showRegister2: false,
            snackbar: false,
            snackbarText: "No error message",
            snackbar2: false,
            showLogin: false,
            snackbarText2: "",
            viewItemDialog: false,
            user_name: "",
            phone_number: "",
            county: "",
            landMark: "",
            email: "",
            auth: {
                email: "",
                password: "",
            },
            loader: null,
            loading: false,
            loading2: false,
            user_state: "",
            progress_bar: false,
            code_state: false,
            phone_no_r: "",
            code_no_r: "",
            request_no: null,
            appVerifier2: null,
            appVerifier2_r: null,
            confirmation_Result: null,
            confirmation_Result_r: null,
            phone: "",
            county: "",
            progress_bar_r: false,
            progress_bar: false,
            progress_bar2: false,
            snackbar: false,
            snackbarText: "No error message",
            snackbar2: false,
            showLogin: false,
            snackbarText2: "",
            new_account: true,
            new_account1: false,
            user_name: "",
            user_name_dis: "",
            email: "",
            user_uid: null,
            user_uid_dis: null,
            verified: false,
            user_image: "",
            password: "",
            auth: {
                email: "",
                password: "",
            },
            image: null,
            estates: [],
            estate_id:0,
            s: false,
            timerCount: 30,
            timerEnabled: false,
            snackbar_login_text: "",
            snackbar_login: true,
            show66: false,
            s: false,
            to_screen: false,
        };
    },
    mounted() {
        this.Fetch_PostAllEstates();
    },
    watch: {
        search(val) {
            val && val !== this.select && this.querySelections(val)
        },
    },
    methods: {
        async getEStateID(val) {
            let that = this;
            axios
                .get(`https://web-production-27f796.up.railway.app/api/estates/estateName/${val}`, {})
                .then(function (response) {
                    if (response.status == 200) {
                        // that.snackbar = true;
                        // that.snackbarText = response.data;

                        that.estate_name = response.data.estate_name;
                        that.estate_id = response.data.estate_id;
                        that.estate_streetName = response.data.estate_streetName;
                        that.location = response.data.location;
                        that.estateURN = response.data.estateURN;
                        that.estate_image = response.data.estate_image;
                        that.logo_url = response.data.logo_url;
                        console.log("Estates search", response.data);
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
        async Fetch_PostAllEstates() {
            let that = this;
            that.estates.splice(that.estates);
            that.states.splice(that.states);
            axios
                .get("https://web-production-27f796.up.railway.app/api/estates/getall", {})
                .then(function (response) {
                    if (response.status == 200) {
                        // that.snackbar = true;
                        // that.snackbarText = response.data;
                        that.estates = response.data;
                        that.states = that.estates.map((item) => item.estate_name);
                        console.log("Estates", that.estates);
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
        querySelections(v) {
            this.loading = true
            // Simulated ajax query
            setTimeout(() => {
                this.items = this.states.filter(e => {
                    return (e || '').toLowerCase().indexOf((v || '').toLowerCase()) > -1
                })
                this.loading = false
            }, 500)
        },
        configureRecaptcha() {
            window.recaptchaVerifier = new this.$fireModule.auth.RecaptchaVerifier(
                "recaptcha-container", {
                    size: "visible",
                    callback: (response) => {
                        console.log(response);
                    },
                }
            );
        },
        configureRecaptcha2() {
            window.recaptchaVerifier = new this.$fireModule.auth.RecaptchaVerifier(
                "recaptcha-container2", {
                    size: "visible",
                    callback: (response) => {
                        console.log(response);
                    },
                }
            );
        },
        // handle otpsend
        sendOtpForVerification() {
            if (this.phone_no == "") {
                this.snackbar2 = true;
                this.snackbarText2 = "Provide phone number";
            } else {
                this.progress_bar = true;
                this.configureRecaptcha();
                const phoneNumber = "+254" + this.phone_no; //user phone number
                this.appVerifier2 = window.recaptchaVerifier;
                console.log("init SMS", this.appVerifier2, "\n", phoneNumber);
                firebase.auth().languageCode = "en";
                firebase
                    .auth()
                    .signInWithPhoneNumber(phoneNumber, this.appVerifier2)
                    .then((confirmationResult) => {
                        // SMS sent. Prompt user to type the code from the message, then sign the
                        // user in with confirmationResult.confirm(code).

                        window.confirmationResult = confirmationResult;
                        this.confirmation_Result = confirmationResult;
                        this.code_state = true;
                        this.progress_bar = false;
                        this.timerEnabled = true;
                        console.log("Result", this.confirmation_Result, "OTP sent");
                        this.snackbar = true;
                        this.snackbarText = "OTP was successfully";
                        //this.$toast.success("Otp sent successfully");
                    })
                    .catch((error) => {
                        // Error; SMS not sent
                        this.progress_bar = false;
                        console.log("Error", error);
                        this.snackbar2 = true;
                        this.snackbarText2 = error;
                    });
            }
        },

        ConfirmCode() {
            console.log("Code sent to you.", this.code_no);

            var credential = firebase.auth.PhoneAuthProvider.credential(
                this.confirmation_Result.verificationId,
                this.code_no
            );
            if ((this.code_no = "")) {
                this.snackbar2 = true;
                this.snackbarText2 = "Provide Code sent to you";
                console.log("Provide Code sent to you");
            } else {
                console.log("Verify Code", this.code_no);
                this.progress_bar = true;
                firebase
                    .auth()
                    .signInWithCredential(credential)
                    .then((user) => {
                        // SMS sent. Prompt user to type the code from the message, then sign the
                        // user in with confirmationResult.confirm(code).
                        //this.$toast.success("Otp sent successfully");
                        this.$router.push("/accounts");
                    })
                    .catch((error) => {
                        this.progress_bar = false;
                        // Error; SMS not sent
                        console.log("Error", error);
                        this.snackbar2 = true;
                        this.snackbarText2 = error;
                    });
            }
        },

        checkUser() {
            if (this.$fire.auth.currentUser != null) {
                this.s = true;
            } else {
                this.s = false;
            }
        },
        signUpGoogle() {
          if (this.select == null) {
                this.snackbar2 = true;
                this.snackbarText2 = "Provide your estate";
            }  else {
            let that = this;
            const provider = new that.$fireModule.auth.GoogleAuthProvider();
            that.$fire.auth
                .signInWithPopup(provider)
                .catch((error) => {
                    console.log(error);
                    that.snackbar2 = true;
                    that.snackbarText2 = error;
                })
                .then((user) => {
                    that.snackbar = true;
                    that.snackbarText = "Sign up success";
                    that.showauth = true;
                    that.showLogin = true;
                    that.auth_state = true;
                    that.$router.push(`/estate/${that.estate_id}`);
                });
              }
        },
        login() {
           if (this.select == null) {
                this.snackbar2 = true;
                this.snackbarText2 = "Provide your estate";
            }  else {
            let that = this;
            that.progress_bar = true;
            const mAuth = this.$fire.auth;
            mAuth
                .signInWithEmailAndPassword(that.auth.email, that.auth.password)
                .catch(function (error) {
                    that.snackbarText = error.message;
                    that.snackbar = true;
                    that.progress_bar = false;
                })
                .then((user) => {
                    that.progress_bar = false;
                    //we are signed in
                    that.$router.push(`/estate/${that.estate_id}`);
                });
              }
        },
        signUp() {
            if (this.auth.email == "") {
                this.snackbar2 = true;
                this.snackbarText2 = "Provide email address";
            } else if (this.auth.password == "") {
                this.snackbar2 = true;
                this.snackbarText2 = "Provide password";
            } else {
                const mAuth = this.$fire.auth;
                this.progress_bar2 = true;
                // if (this.password === this.registrationPassword) {
                mAuth
                    .createUserWithEmailAndPassword(this.auth.email, this.auth.password)
                    .catch((error) => {
                        console.log(error);
                        this.snackbar2 = true;
                        this.snackbarText2 = error;
                        this.progress_bar2 = false;
                    })
                    .then((user) => {
                        this.$router.push("/905/admin");
                    });
            }
        },
    },
    created() {
        this.checkUser();
    },
};
</script>

<style></style>
