<template>
<div class="">
    <v-row v-resize="onResize">
        <v-col cols="12" sm="8" md="8">
            <div class="container">
                <v-row>

                    <br />
                    <v-col cols="12" sm="6" md="6">
                        <div class="container">
                            <h2 style="color: grey">Choose a plan</h2>
                            <p>
                                Choose your preferred payment plan to manage your household services. Select our monthly plan and enjoy seamless service access.
                            </p>

                            <br>
                            <v-card elevation="0" color="black" dark v-show="shallowReactive">
                                <div class="container">
                                    <div class="d-flex" style="padding: 10px;">
                                        <strong style="color: greenyellow;" v-show="active">Active</strong>
                                        <strong style="color:  red;" v-show="!active">InActive</strong>
                                    </div>

                                    <p style="padding: 10px;">{{ message }}</p>
                                </div>
                            </v-card>
                        </div>
                    </v-col>
                    <v-col cols="12" sm="6" md="6"></v-col>

                    <v-col cols="12" v-show="d_1" sm="6" md="6" class="">
                        <v-card class="mx-auto" color="black" dark>
                            <v-card-action>
                                <div class="container">
                                    <div class="d-flex">
                                        <p class="text-h5 text--white">Band 1 </p>
                                        <v-spacer></v-spacer> <b style="margin-top: 8px;margin-left: 4px;">Monthly</b>
                                    </div>

                                </div>
                            </v-card-action>

                            <v-card-text>

                                <p>Subscribe to our monthly plan</p>
                                <div class="d-flex">
                                    <p class="text-h6 text--white">Upto - 20 </p>
                                    <p class="text--white text-b" style="margin-top: 7px;margin-left: 4px;">Households</p>
                                </div>

                                <div class="text--white ">
                                    <p class="text-h5 text--white">Ksh/• {{ '2000' }}</p>

                                </div>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn :disabled="active" style="margin: 8px; color: #8051FF" rounded color="white" class="text-white" @click="

                      (paymentForm = true), (duration = 'Monthly')
                    ">
                                    Start Plan
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-col>
                    <v-col cols="12" v-show="d_2" sm="6" md="6" class="">
                        <v-card class="mx-auto" color="black" dark>
                            <v-card-action>
                                <div class="container">
                                    <div class="d-flex">
                                        <p class="text-h5 text--white">Band 2 </p>
                                        <v-spacer></v-spacer> <b style="margin-top: 8px;margin-left: 4px;">Monthly</b>
                                    </div>

                                </div>
                            </v-card-action>

                            <v-card-text>

                                <p>Subscribe to our monthly plan</p>
                                <div class="d-flex">
                                    <p class="text-h6 text--white">20 - 50 </p>
                                    <p class="text--white text-b" style="margin-top: 7px;margin-left: 4px;">Households</p>
                                </div>

                                <div class="text--white ">
                                    <p class="text-h5 text--white">Ksh/• {{ '2500' }}</p>

                                </div>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn :disabled="active" style="margin: 8px; color: #8051FF" rounded color="white" class="text-white" @click="

                      (paymentForm = true), (duration = 'Monthly')
                    ">
                                    Start Plan
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-col>
                    <v-col cols="12" v-show="d_3" sm="6" md="6" class="">
                        <v-card class="mx-auto" color="black" dark>
                            <v-card-action>
                                <div class="container">
                                    <div class="d-flex">
                                        <p class="text-h5 text--white">Band 3 </p>
                                        <v-spacer></v-spacer> <b style="margin-top: 8px;margin-left: 4px;">Monthly</b>
                                    </div>

                                </div>
                            </v-card-action>

                            <v-card-text>

                                <p>Subscribe to our monthly plan</p>
                                <div class="d-flex">
                                    <p class="text-h6 text--white">50 - 100 </p>
                                    <p class="text--white text-b" style="margin-top: 7px;margin-left: 4px;">Households</p>
                                </div>

                                <div class="text--white ">
                                    <p class="text-h5 text--white">Ksh/• {{ '2000' }}</p>

                                </div>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn :disabled="active" style="margin: 8px; color: #8051FF" rounded color="white" class="text-white" @click="

                      (paymentForm = true), (duration = 'Monthly')
                    ">
                                    Start Plan
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-col>
                    <v-col cols="12" v-show="d_4" sm="6" md="6" class="">
                        <v-card class="mx-auto" color="black" dark>
                            <v-card-action>
                                <div class="container">
                                    <div class="d-flex">
                                        <p class="text-h5 text--white">Band 4 </p>
                                        <v-spacer></v-spacer> <b style="margin-top: 8px;margin-left: 4px;">Monthly</b>
                                    </div>

                                </div>
                            </v-card-action>

                            <v-card-text>

                                <p>Subscribe to our monthly plan</p>
                                <div class="d-flex">
                                    <p class="text-h6 text--white">100 and  Above </p>
                                    <p class="text--white text-b" style="margin-top: 7px;margin-left: 4px;">Households</p>
                                </div>

                                <div class="text--white ">
                                    <p class="text-h5 text--white">Ksh/• {{ '2000' }}</p>

                                </div>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn :disabled="active" style="margin: 8px; color: #8051FF" rounded color="white" class="text-white" @click="

                      (paymentForm = true), (duration = 'Monthly')
                    ">
                                    Start Plan
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-col>

                    <v-col cols="12" sm="4" md="4"></v-col>
                    <v-col cols="12" sm="4" md="4"></v-col>
                    <v-col cols="12" sm="12" md="12" v-show="paymentForm">
                        <div class="container">
                            <v-card dark color="white" elevation="0">
                                <div>
                                    <v-progress-linear v-show="progress_bar" indeterminate color="white"></v-progress-linear>
                                </div>
                                <div class="container">
                                    <v-card-text>
                                        <div class="">
                                            <div class="d-flex">
                                                <span>Mpesa Payment</span>
                                                <v-avatar style="margin: 10px" color="primary" size="30">
                                                    <img alt="Avatar" :src="mpesaIcon" />
                                                </v-avatar>
                                                <v-spacer></v-spacer>
                                                <v-btn icon @click="paymentForm = false">
                                                    <v-icon color="red">mdi-close</v-icon>
                                                </v-btn>
                                            </div>
                                            <div class="">
                                                <div class="d-flex">
                                                    <v-text-field active-class="green" outlined hint="254767**456*" v-model="phone" type="number" label="Provide mpesa number"></v-text-field>
                                                    < </div> <p class="text-h4" style="color: white">Ksh/{{ numeral(amount).format('0,0') }}</p>
                                                        <p>{{ "   -- " }}{{ duration }}</p>
                                                </div>
                                            </div>
                                    </v-card-text>

                                    <v-btn ref="button" style="margin: 10px; font-size: 1.2rem; color: red" color="black" class="white--text" @click="StkPush()">Initiate Stk Push</v-btn>
                                    <v-spacer />
                                </div>
                            </v-card>
                        </div>
                    </v-col>
                </v-row>
            </div>
        </v-col>
        <v-col cols="12" sm="4" md="4" v-show="!showSide">
            <v-card elevation="0" color="#8051FF" height="100vh">
                <v-card-title>
                    <h1 style="margin: 30px; color: white; font-size: 2.2rem">Estate Billing</h1>
                </v-card-title>
                <v-img style="margin: 10px" :src="walletIcon" contain height="400"> </v-img>
            </v-card>
        </v-col>
    </v-row>

    <v-snackbar color="primary accent-8" :timeout="6000" v-model="snackbar_s" centered bottom>
        {{ snackbarText_s }}
    </v-snackbar>
    <v-snackbar color="success" :timeout="2000" v-model="snackbar" outlined center>
        {{ snackbarText }}
    </v-snackbar>
    <v-snackbar color="error" :timeout="4000" v-model="snackbarError" outlined center>
        {{ snackbarTextError }}
    </v-snackbar>
</div>
</template>

<script>
import axios from "axios";
import numeral from "numeral";
import {
    shallowReactive
} from "vue";

import * as easings from "vuetify/lib/services/goto/easing-patterns";

export default {
    props: {
        estateId: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {
            showBillState: false,
            numeral,
            active: false,
            plan_name: "",
            message: '',
            total_households_count: 0,
            plan_amount: 0,
            d_1: true,
            d_2: true,
            d_3: true,
            d_4: true,
            d_5: true,
            type: "number",
            number: 9999,
            selector: "#third",
            selections: ["#first"],
            selected: "Button",
            elements: ["Button"],
            duration: 300,
            offset: 0,
            easing: "easeInOutCubic",
            easings: Object.keys(easings),
            progress_bar: false,
            duration: "",
            paymentForm: false,
            windowSize: {
                x: window.innerHeight,
                y: window.innerWidth,
            },
            supplier: {
                month: "70",
                year: "700",
            },
            retailer: {
                month: "50",
                year: "500",
            },
            amountMonth: "0",
            // mpesaIcon: require("@/assets/mpesa.png"),
            walletIcon: require("@/assets/billing.svg"),
            amountYear: "0",
            showSide: true,
            phone: null,
            amount: 0,
            snackbar_s: false,
            snackbarText_s: "",
            snackbar: false,
            snackbarError: false,
            snackbarText: "",
            snackbarTextError: "",
            uid: null,
            UserType: null,
            UserName: null,
            shopName: null,
            payment: false,
            paymentDate: null,
            mpesaReceipt: null,
            subscription: null,
            subscriptionType: null,
            subscriptionAmount: 0,
            timerEnabled: false,
            show6: false,
            timerCount: 25,
            successResponse: "",
            errorResponse: "",
            CheckoutRequestID: null,
            CheckoutResponseID: null,
            CheckoutRequestDate: null,
            CheckoutResponseDate: null,
            timestamp2: new Date(),
            title: "",
            body: "",
            from: "",
            to: "",
            status: "",
            houseHoldCount: 0,
        };
    },
    methods: {
        show(val) {
            if (val === 2000) {
                this.d_1 = true;
                this.d_2 = false;
                this.d_3 = false;
                this.d_4 = false;
            } else if (val = 2500) {
                this.d_1 = false;
                this.d_2 = true;
                this.d_3 = false;
                this.d_4 = false;
            } else if (val = 3000) {
                this.d_1 = false;
                this.d_2 = false;
                this.d_3 = true;
                this.d_4 = false;
            } else if (val = 4000) {
                this.d_1 = false;
                this.d_2 = false;
                this.d_3 = false;
                this.d_4 = true;
            }
        },
        async Check_Billing() {
            let that = this;
            axios
                .get("https://web-production-27f796.up.railway.app/api/estates/estate-due-disable/" + this.estateId, {})
                .then(function (response) {
                    if (response.status == 200) {
                        that.snackbar = true;
                        that.snackbarText = response.data;
                        that.active = response.data.is_active;

                        if (response.data.payment_status === 'Due') {
                            that.d_5 = true;
                            that.d_5 = false;
                        } else {
                            that.d_5 = false;
                            that.d_5 = true;
                        }
                        console.log("Check billing", response.data);
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
        ////Stk Query////
        StkQuery() {
            let that = this;
            that.snackbar_s = true;
            that.snackbarText_s = "Checking payment status...";
            axios
                .post("https://web-production-27f796.up.railway.app/payment/stk_push_subscription/query", {
                    checkoutRequestId: that.CheckoutRequestID,
                })
                .then(function (response) {
                    console.log("StkPush Query", response.data);
                    that.show6 = false;

                    if (response.status == 200) {
                        that.progress_bar = false;
                        that.paymentForm = true;
                        that.snackbar = true;
                        that.snackbarText = response.data.ResultDesc;
                        that.timerCount = 25;
                        that.timerEnabled = false;

                    }
                })
                .catch(function (error) {
                    that.paymentForm = true;
                    that.snackbarError = true;
                    that.snackbarTextError = error;
                    that.timerCount = 25;
                    that.timerEnabled = false;
                    that.show6 = false;
                    that.progress_bar = false;
                });
        },
        getBilling() {
            let that = this;
            axios
                .post("https://web-production-27f796.up.railway.app/api/estates/subscription", {
                    estate_id: this.estate_id,

                })
                .then(function (response) {
                    console.log(response);
                    if (response.status == 200) {

                        that.amount = response.data.billing_rate;
                        that.plan_amount = response.data.billing_rate;
                        if (response.data.billing_rate < 2500) {
                            that.plan_name = "Band 1";
                        } else if (response.data.billing_rate > 25000) {

                        }
                        if (response.data.billing_rate < 2500) {
                            that.plan_name = "Band 1";
                        } else if (response.data.billing_rate > 25000) {

                        }

                        console.log('Billing', that.amount, that.houseHoldCount);
                        that.show(response.data.billing_rate)

                        that.successResponse = response.data;
                    } else if (response.status == 400) {
                        // this.snackbarError = true;
                        // this.snackbarTextError = response.data;
                    }
                })
                .catch(function (error) {
                    console.log(error);
                    // this.snackbarTextError = error;
                    // this.snackbarError = true;
                });
        },
        async Fetch_MessageSubs() {
            let that = this;
            axios
                .get("https://web-production-27f796.up.railway.app/api/estates/estate-sub-msg/" + this.estateId, {})
                .then(function (response) {
                    if (response.status == 200) {
                        that.snackbar = true;
                        that.snackbarText = response.data;
                        that.message = response.data.message;
                        // if(response.data.payment_status === 'Paid'){
                        //     that.d_5 = false;
                        // }else{
                        //     that.d_5 = true;
                        // }
                        console.log("Estates sub msg", response.data);
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
        async Fetch_EstateHouseHolds() {
            let that = this;
            axios
                .get(
                    `https://web-production-27f796.up.railway.app/api/households/getBHsHldEstId/${this.estateId}`, {}
                )
                .then(function (response) {
                    if (response.status == 200) {
                        // that.snackbar = true;
                        // that.snackbarText = response.data;
                        that.houseHoldCount = response.data.length;
                        if (that.houseHoldCount == 0) {
                            that.shallowReactive = false;
                        } else {
                            that.shallowReactive = true;
                        }
                        console.log("Households count", that.houseHoldCount);
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
        async Fetch_ActiveSubs() {
            let that = this;
            axios
                .get("https://web-production-27f796.up.railway.app/api/estates/estate-sub/" + this.estateId, {})
                .then(function (response) {
                    if (response.status == 200) {
                        // that.snackbar = true;
                        // that.snackbarText = response.data;

                        // if (response.data.payment_status === 'Paid') {
                        //     that.d_5 = false;
                        // } else {
                        //     that.d_5 = true;
                        // }
                        that.active = response.data.is_active;
                        console.log("Estates sub", response.data);
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
        UploadNotification() {
            this.title = this.duration + " subscription updated";
            this.body = `You have successfully a paid ksh/${this.amount} for your ${this.duration} plan.`;
            this.from = this.$fire.auth.currentUser.uid;
            this.to = this.$fire.auth.currentUser.uid;
            this.status = "unseen";
            this.uid = this.$fire.auth.currentUser.uid;
            axios
                .put("https://web-production-27f796.up.railway.app/notification/addNotification", {
                    title: this.title,
                    body: this.body,
                    from_user: this.from,
                    uid: this.$fire.auth.currentUser.uid,
                    to_user: this.to,
                    status: this.status,
                    payment_date: new Date(),
                    timestamp: new Date(),
                })
                .then(function (response) {
                    console.log(response);
                    if (response.status == 200) {} else if (response.status == 400) {
                        // this.snackbarError = true;
                        // this.snackbarTextError = response.data;
                    }
                })
                .catch(function (error) {
                    console.log(error);
                    // this.snackbarTextError = error;
                    // this.snackbarError = true;
                });
        },
        onResize() {
            this.windowSize = {
                x: window.innerWidth,
                y: window.innerHeight,
            };
            console.log("size", this.windowSize.x);
            if (this.windowSize.x < 950) {
                this.showSide = true;
            } else {
                this.showSide = false;
            }
            return this.windowSize;
        },
        FetchUser() {
            let that = this;
            axios
                .get(`https://web-production-27f796.up.railway.app/user/getUser/${that.$fire.auth.currentUser.uid}`, {})
                .then(function (response) {
                    console.log("Payment page", response.data[0]);
                    if (response.status == 200) {
                        // that.snackbar = true;
                        // that.snackbarText = response.data;
                        that.UserName = response.data[0].shopName;
                        that.UserType = response.data[0].userCategory;
                        that.UserName = response.data[0].username;
                        that.paymentDate = response.data[0].payment_date;
                        that.subscriptionType = response.data[0].subscriptionType;
                        that.subscriptionAmount = response.data[0].subscriptionAmount;
                        that.mpesaReceipt = response.data[0].mpesaReceipt;

                        if (that.UserType == "retailer") {
                            that.amountMonth = that.retailer.month;
                            that.amountYear = that.retailer.year;
                        } else if (that.UserType == "supplier") {
                            that.amountMonth = that.supplier.month;
                            that.amountYear = that.supplier.year;
                        }

                        if (response.data[0].mpesaReceipt == null) {
                            that.snackbarError = true;
                            that.snackbarTextError = "Please pay for subscription";
                            that.payment_status = "Please pay for subscription";
                            that.payment_state = true;
                        } else {
                            that.payment_status = "";
                            that.payment_state = false;
                        }
                    } else if (response.status == 400) {
                        that.snackbarError = true;
                        that.snackbarTextError = response.data;
                    }
                })
                .catch(function (error) {
                    console.log(error);
                    that.snackbarTextError = error;
                    that.snackbarError = true;
                });
        },
        StkPush() {
            let that = this;
            if (that.phone == null) {
                that.snackbarTextError = "Provide phone..";
                that.snackbarError = true;
            } else {
                axios
                    .post("https://web-production-27f796.up.railway.app/payment/stk_push_subscription", {
                        phone_number: that.phone,
                        estate_id: this.estateId,
                    })
                    .then(function (response) {
                        console.log(response);
                        if (response.status == 200) {
                            that.snackbar = true;
                            that.progress_bar = true;
                            that.snackbarText = response.data;
                            that.CheckoutRequestID = response.data.CheckoutRequestID;
                            that.timerEnabled = true;
                        } else if (response.status == 400) {
                            that.snackbarError = true;
                            that.snackbarTextError = response.data;
                        }
                    })
                    .catch(function (error) {
                        console.log(error);
                        that.snackbarTextError = error;
                        that.snackbarError = true;
                        that.progress_bar = false;
                    });
            }
            Error;
        },
    },
    created() {
        // this.getBilling();
        // this.Check_Billing();
        this.Fetch_ActiveSubs();
        this.Fetch_MessageSubs();
        this.Fetch_EstateHouseHolds();
        // this.FetchUser();
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
                    this.StkQuery();
                    this.timerCount = 25;
                }
            },
            immediate: true, // This ensures the watcher is triggered upon creation
        },
    },
    computed: {
        target() {
            const value = this[this.type];
            if (!isNaN(value)) return Number(value);
            else return value;
        },
        options() {
            return {
                duration: this.duration,
                offset: this.offset,
                easing: this.easing,
            };
        },
        element() {
            if (this.selected === "Button") return this.$refs.button;
            else return null;
        },
    },
};
</script>

<style>
/* From Uiverse.io by Yaya12085 */
.cardPay {
    margin-left: -1rem;
    margin-right: -1rem;
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    margin-bottom: 2rem;
    width: 320px;
    display: flex;
    flex-direction: column;
    border-radius: 0.25rem;
    background-color: rgba(17, 24, 39, 1);
    padding: 1.5rem;
}

.header {
    display: flex;
    flex-direction: column;
}

.title {
    font-size: 1.5rem;
    line-height: 2rem;
    font-weight: 700;
    color: #fff;
}

.price {
    font-size: 3.75rem;
    line-height: 1;
    font-weight: 700;
    color: #fff;
}

.desc {
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
    line-height: 1.625;
    color: rgba(156, 163, 175, 1);
}

.lists {
    margin-bottom: 1.5rem;
    flex: 1 1 0%;
    color: rgba(156, 163, 175, 1);
}

.lists .list {
    margin-bottom: 0.5rem;
    display: flex;
    margin-left: 0.5rem;
}

.lists .list svg {
    height: 1.5rem;
    width: 1.5rem;
    flex-shrink: 0;
    margin-right: 0.5rem;
    color: rgba(167, 139, 250, 1);
}

.action {
    border: none;
    outline: none;
    display: inline-block;
    border-radius: 0.25rem;
    background-color: rgba(167, 139, 250, 1);
    padding-left: 1.25rem;
    padding-right: 1.25rem;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    text-align: center;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: rgba(17, 24, 39, 1);
}
</style>
