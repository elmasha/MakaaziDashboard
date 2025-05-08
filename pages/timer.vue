<template>
<div style="background-color:black">
    <v-container>

        <v-row>
            <v-col cols="12" sm="12" md="12">
                <v-toolbar color="black" elevation="0" extension-height="90">

                    <nuxt-link class="nuxt-link" to="/">
                        <v-img style="margin-top:10px" :src="logo" contain height="100" max-width="150"> </v-img>
                    </nuxt-link>

                    <v-spacer></v-spacer>

                    <div style="margin-top:50px">
                        <v-btn text small>
                            <v-icon>mdi-cash-clock</v-icon><span>Payment timer</span>
                        </v-btn>
                        <br>
                        <p class="text-center" style="font-size:0.7rem; color:rgb(122, 122, 120)">
                            <br /></p>
                    </div>

                </v-toolbar>

            </v-col>
            <v-col cols="12" sm="6" md="6">

                <div class="d-flex">
                    <v-spacer />
                    <v-btn icon @click="refresh()">
                        <v-icon color="green">mdi-refresh-circle</v-icon>
                    </v-btn>
                    <v-spacer />
                </div>
                <br>

                <div class="text-center">
                    <div class="text-center">
                        <h3>Charge timer</h3>
                        <br>
                        <v-progress-circular :rotate="270" :size="150" :width="8" :value="progress_val" color="green">

                            <div>
                                <h1>{{ value }}</h1>
                            </div>

                        </v-progress-circular>

                    </div>
                    <br>
                    <div class="text-center">
                        <div class="text-center">
                            <p><strong class="text-black" style="color:black">Below is the currently time in {{ hr_min }} since you picked the rental powerbank.</strong></p>
                        </div>
                        <div class="text-center">
                            <div class="text-center">
                                <h3><strong>
                                        <v-icon medium color="green">mdi-clock-outline</v-icon> {{getMinToHr(minutes) }}
                                    </strong></h3>
                            </div>
                            <div class="text-center">
                                <h3><strong>
                                        <v-icon medium color="green">mdi-cash</v-icon> {{ amount.toFixed(0) }} ksh
                                    </strong></h3>
                            </div>
                        </div>
                    </div>

                    <div>

                    </div>
                    <br>

                </div>

            </v-col>

            <v-col cols="12" sm="6" md="6">
                <v-card color="black" flat height="200px"  elevation="0">
                    <div id="charter" style="padding:3rem">
                        <div>

                            <v-icon>mdi-cash-clock</v-icon> Deposit date: <strong>{{ $dayjs(new Date(start_timer)).format('YYYY/MM/DD HH:mm:ss') }}</strong>
                        </div>
                        <div>
                            <strong>{{ $moment(start_timer).fromNow() }}</strong>
                        </div>
                        <br>
                        <div>
                            <p style="font-size:medium">
                                You made the deposit in order to use our power bank, we will refund <strong>Ksh {{(deposit - amount).toFixed(0)}}</strong> from the deposit you made. This is only refundable once you return the powerbank to the charge24 station. <br>

                                <br>
                                <strong>Deposit Amount: Ksh {{ deposit }} </strong><br>
                                <strong>Refundable Amount: Ksh {{(deposit - amount).toFixed(0)}}</strong><br>
                                <!-- Your deposit will be refundable upon the return of the power bank in good condition and within the agreed-upon timeframe. -->
                            </p>
                        </div>

                        <div style="background-color:black">
                            <v-btn v-show="auth_state" text @click="cash_refund = !cash_refund">
                                <v-icon color="green">mdi-cash-refund</v-icon>
                                Request Cash Refund  {{(deposit - amount).toFixed(0) }}
                            </v-btn>


                            <div v-show="cash_refund" class="" >

                              <div class="">
                                <p class="text-start"><v-icon color="orange">mdi-alert-octagram</v-icon> Please note that your money will be reserved once power bank is returned. </p>

                              </div>

                                <div>

                                    <div class="text-center">
                                        <div class="col-md-12">
                                             <v-btn v-show="auth_state" style="colo:#fff" absolute :disabled="btn_disabled" class="text--white" color="green" @click="mpesaB2c()">
                                                Request Refund, Ksh{{(deposit - amount).toFixed(0) }}
                                            </v-btn>
                                        </div>


                                    </div>


                                </div>

                            </div>
                        </div>
                    </div>

                </v-card>
            </v-col>
        </v-row>
    </v-container>
    <v-snackbar color="green accent-8" :timeout="2000" v-model="snackbar" bottom outlined>
        {{ snackbarText }}
    </v-snackbar>
    <v-snackbar color="red accent-8" :timeout="2000" v-model="snackbar2" centered outlined>
        {{ snackbarText2 }}
    </v-snackbar>
</div>
</template>

<script>
import axios from "axios";

import {
    Timestamp
} from '@firebase/firestore';
import dayjs from '@nuxtjs/dayjs';
import moment from 'moment';

import {
    uuid
} from "vue-uuid";
export default {
    data() {
        return {
            btn_disabled:false,
            logo: require('@/assets/logo.svg'),
            bg: require('@/assets/bg.png'),
            snackbar: false,
            cash_refund: false,
            snackbarText: "",
            snackbar2: false,
            deposit:50,
            snackbarText2: "",
            interval: {},
            interval_amount: {},
            value: 0,
            value: 0,
            progress_val: 0,
            auth_state:false,
            minutes: 0,
            amount: 0,
            max_mins: 60,
            start_timer: "",
            charge_per_min: 1.67,
            date1: new Date(), // Replace with your first date
            date2: new Date('2023-10-16T10:30:00'),
            time_diff: "",
            startDate: new Date('2023-10-21T10:00:00'),
            endDate: new Date('2023-10-22T06:30:00'),
            timeDifference: null,
            nanoSeconds: 1000000000, // 1 second in nanoseconds
            milliSeconds: 1000,
            total_hours: 0,
            init_time: null,
            hr_min: null,
            refundable_number: null,
            refundable_amount: 0,
            mpesa_code : null,
            timerEnabled: false,
            show6: false,
            timerCount: 6,

        }
    },
    created() {
        this.timeDifference = this.timeDifferenceFormatted;

    },
    // beforeDestroy () {
    //   clearInterval(this.interval)
    // },
    computed: {
        timeDifferenceFormatted() {

            const diffMilliseconds = this.endDate - this.start_timer;
            const diffMinutes = Math.floor(diffMilliseconds / (1000 * 60));
            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;
            return `${hours} hours and ${minutes} minutes`;
        },
    },
    mounted() {


        this.checkUserID(),
            this.interval = setInterval(() => {
                if (this.value === 60) {
                    this.minutes += 1;
                    this.progress_val = this.value;
                    this.amount = this.minutes * this.charge_per_min;
                    if (this.amount === 2500) {
                        clearInterval(this.interval);
                        return (this.value = 0), this.progress_val = 0;
                    }
                    return (this.value = 0), this.progress_val = 0;
                }
                this.value += 1
                this.progress_val += 1.7

            }, 1000)
    },
    methods: {
        mpesaB2c() {
          this.btn_disabled = true;
            let that = this;
            if (this.refundable_number == null) {
                that.snackbarText2 = "Provide mpesa code..";
                that.snackbar2 = true;
            }  else {
                that.show6 = true;
                axios
                    .post("https://chargenowmpesaapi-077f3b4b044f.herokuapp.com/b2c", {
                      Phonenumber: this.refundable_number,
                      amount: (this.deposit - this.amount).toFixed(0),
                      uid: this.$fire.auth.currentUser.uid ,
                    })
                    .then(function (response) {
                        console.log(response);
                        if (response.status == 200) {
                            if (response.data.errorCode == "400.002.02") {
                                that.snackbar2 = true;
                                that.snackbarText2 = response.data.errorMessage;
                                that.show6 = false;

                            } else if (response.data.errorCode == "500.001.1001") {
                                that.snackbar2 = true;
                                that.snackbarText2 = response.data.errorMessage;
                                that.show6 = false;
                            } else {
                                that.timerEnabled = true;
                                that.snackbar = true;
                                that.snackbarText = response.data.CustomerMessage;
                                that.successResponse = response.data.CustomerMessage;
                                that.CheckoutRequestID = response.data.CheckoutRequestID;
                                console.log(that.CheckoutRequestID);
                            }
                        } else if (response.status == 400) {
                            that.snackbar2 = true;
                            that.snackbarText2 = response.data;
                            that.errorMessage = response.data;
                            that.show6 = false;

                        }
                    })
                    .catch(function (error) {
                        console.log(error);
                        that.snackbarText = error;
                        that.snackbar = true;
                        that.btn_disabled = false;

                    })
                    .then(function () {
                        //---- always executed
                        that.timerEnabled = true;
                    });
            }
        },

        FetchPhone(val) {
            const db = this.$fire.firestore;
            db.collection("Charge24_users")
                .where("user_id", "==", val)
                .get()
                .then((queryResult) => {
                    queryResult.forEach((doc) => {
                      this.timerEnabled = false;
                        this.refundable_number = doc.data().phone_no;
                        this.getPhone();
                        console.log("Members phone details", doc.data());
                    });
                });
        },
        getPhone(){
          const db = this.$fire.firestore;
                    db.collection("Charge24_users")
                        .doc(this.$fire.auth.currentUser.uid)
                        .delete()
                        .then(() => {
                          this.logout();
                        })
                        .catch((error) => {
                            console.log("Error adding document: ", error);

                        });
        },
      mpesaReversal() {
            let that = this;
            if (this.mpesa_code == null) {
                that.snackbarText2 = "Provide mpesa code..";
                that.snackbar2 = true;
            }  else {
                that.show6 = true;
                axios
                    .post("https://chargenowmpesaapi-077f3b4b044f.herokuapp.com/reverse", {
                      mpesaCode: this.mpesa_code,
                    })
                    .then(function (response) {
                        console.log(response);
                        if (response.status == 200) {
                            if (response.data.errorCode == "400.002.02") {
                                that.snackbar2 = true;
                                that.snackbarText2 = response.data.errorMessage;
                                that.show6 = false;

                            } else if (response.data.errorCode == "500.001.1001") {
                                that.snackbar2 = true;
                                that.snackbarText2 = response.data.errorMessage;
                                that.show6 = false;
                            } else {
                                that.timerEnabled = true;
                                that.snackbar = true;
                                that.snackbarText = response.data.CustomerMessage;
                                that.successResponse = response.data.CustomerMessage;
                                that.CheckoutRequestID = response.data.CheckoutRequestID;
                                console.log(that.CheckoutRequestID);
                            }
                        } else if (response.status == 400) {
                            that.snackbar2 = true;
                            that.snackbarText2 = response.data;
                            that.errorMessage = response.data;
                            that.show6 = false;

                        }
                    })
                    .catch(function (error) {
                        console.log(error);
                        that.snackbarText = error;
                        that.snackbar = true;

                    })
                    .then(function () {
                        //---- always executed
                    });
            }
        },
        refresh() {
            if (this.$fire.auth.currentUser != null) {

                this.FetchUser(this.$fire.auth.currentUser.uid);

            } else {
                console.log("User no logged in");

            }
        },
        getDuration(val) {
            var dateNow = new Date();
            var duration = this.$moment(val).startOf('minute').fromNow();
            var min = this.$moment(val).minutes(); // Number
            var hr = this.$moment(val).fromNow(); // Number
            var minNow = this.$moment(dateNow).minute(); // Number

            var ms = this.$moment(val).diff(this.$moment(dateNow));

            const startMoment = moment(val);
            const endMoment = moment(dateNow);

            const diffInHours = endMoment.diff(startMoment, 'hours');
            const diffInMins = endMoment.diff(startMoment, 'minutes');

            this.total_hours = diffInHours;
            this.minutes = diffInMins;

            var totHr = (diffInMins / 60);
            this.amount = diffInMins * this.charge_per_min;

            this.refundable_amount = (this.deposit - this.amount).toFixed(0);

            this.init_time = totHr.toFixed(0);

            console.log("dif hr", this.init_time, "min", diffInMins);

            var d = this.$moment.duration(ms);

        },
        FetchUser(val) {
            const db = this.$fire.firestore;
            db.collection("Charge24_users")
                .where("user_id", "==", val)
                .get()
                .then((queryResult) => {
                    queryResult.forEach((doc) => {
                        this.start_timer = doc.data().start_time;
                        this.refundable_number = doc.data().phone_no;
                        this.getDuration(this.start_timer);
                        console.log("Members details", doc.data());

                    });
                });
        },

        formatDate(time) {
            const date = new Date(time);

            // Get year, month, and day part from the date
            const year = date.toLocaleString("default", {
                year: "numeric"
            });
            const month = date.toLocaleString("default", {
                month: "2-digit"
            });
            const day = date.toLocaleString("default", {
                day: "2-digit"
            });

            return `${year}/${month}/${day}`;
        },

        getMinToHr(val) {
            if (val > 120) {
                var totHr = (val / 60);
                this.hr_min ="hrs";
                return Math.floor(totHr.toFixed(0)) + " hrs";
            } else {
                var totHr = (val / 60);
                this.hr_min ="minutes";
                return Math.floor(totHr.toFixed(0)) + " minutes";
            }
        },
        loginAnonymously1() {

            this.$fire.auth
                .signInAnonymously()
                .catch(function (error) {
                    this.snackbarText = error.message;
                    this.snackbar = true;
                    this.showLogin = false;
                })
                .then((user) => {
                    //we are signed in
                    const start_time = this.$dayjs(new Date()).format('YYYY/MM/DD HH:mm:ss');
                    let ID = uuid.v1();
                    console.log(uuid.v1());
                    const db = this.$fire.firestore;
                    db.collection("Charge24_users")
                        .doc(user.user.uid)
                        .set({
                            user_id: user.user.uid,
                            start_time: start_time,
                            ref: ID,
                            active: true,
                        })
                        .then((docRef) => {
                            console.log("User logged in");
                        })
                        .catch((error) => {
                            console.log("Error adding document: ", error);

                        });
                });

        },
        checkUserID() {
            if (this.$fire.auth.currentUser != null) {
                if (this.$fire.auth.currentUser.uid != null) {


                    console.log("User logged in", this.$fire.auth.currentUser.uid);
                    this.FetchUser(this.$fire.auth.currentUser.uid);
                    this.auth_state = true;


                } else {
                    console.log("User no logged in");
                    this.auth_state = false;

                }
            } else {
                console.log("User no logged in");
                this.$router.push({
                        path: "/"
                    });
                //this.loginAnonymously1();
            }
        },
        logout() {
            this.$fire.auth.signOut();
            window.location.reload(true);
        },
    },
    watch: {
        timerEnabled(value) {
            if (value) {
                setTimeout(() => {
                    this.timerCount--;
                }, 1000);
            }
        },
        timerCount: {
            handler(value) {
                if (value > 0 && this.timerEnabled) {
                    setTimeout(() => {
                        this.timerCount--;
                    }, 1000);
                } else if (value == 0) {
                    console.log("Done");
                    this.FetchPhone(this.$fire.auth.currentUser.uid);
                }
            },
            immediate: true, // This ensures the watcher is triggered upon creation
        },
      }
}
</script>

<style>
strong {
    color: green;
}

#charter {
  transition: 0.5s ease;
  background-image: url("@/assets/bg.png");
  background-attachment: fixed;
  background-position: center;
  background-size: contain;

  width: 100%;
  height: 80vh;
}
</style>
