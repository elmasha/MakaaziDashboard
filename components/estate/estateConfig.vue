<template>
<div>
    <v-card elevation="0">
        <div class="">
            <v-card-actions>
                <v-card-title>
                    <h3>Estate Address Configration</h3>
                </v-card-title>
                <v-spacer></v-spacer>
                <!-- <v-btn icon>
                                <v-icon>mdi-account</v-icon>
                            </v-btn> -->
                <v-btn icon>
                    <v-icon>mdi-magnify</v-icon>
                </v-btn>
                <v-btn icon>
                    <v-icon>mdi-cog-outline</v-icon>
                </v-btn>
            </v-card-actions>
        </div>
    </v-card>
    <v-card color="#f0f0f0" elevation="0" class="" style="padding: 1rem;">
        <v-row >

            <v-col cols="12" sm="12" md="12" lg="12">
                <div>
                    <div class="container">
                        <v-card elevation="0">
                            <v-subheader></v-subheader>
                            <v-data-table :headers="headers" :items="houseHolds" :items-per-page="10" class="elevation-0">
                                <!-- index column -->
                                <template #item.index="{ item }">
                                    {{ item.index }}
                                </template>

                                <!-- overdue cell -->
                                <template #item.overdue="{ item }">
                                    <span :class="{ 'red--text': item.overdue < 0, 'green--text': item.overdue >= 0 }">
                                        {{ formatCurrency(item.overdue) }}
                                    </span>
                                </template>

                                <!-- any month cell could use the default -->
                            </v-data-table>

                        </v-card>

                    </div>

                </div>
            </v-col>

            <v-col cols="12" sm="12" md="12"> </v-col>
        </v-row>

        <v-snackbar color="primary accent-8" :timeout="6000" v-model="snackbar_s" centered bottom>
            {{ snackbarText_s }}
        </v-snackbar>
        <v-snackbar color="success" :timeout="2000" v-model="snackbar" outlined center>
            {{ snackbarText }}
        </v-snackbar>
        <v-snackbar color="error" :timeout="2500" v-model="snackbar2" outlined center>
            {{ snackbarText2 }}
        </v-snackbar>
    </v-card>
    <v-row justify="space-around">
        <v-col cols="auto">
            <v-dialog v-model="dialog" transition="dialog-top-transition" max-width="600">
                <!-- <template v-slot:activator="{ on, attrs }">
            <v-btn color="primary" v-bind="attrs" v-on="on">From the top</v-btn>
          </template> -->
                <template v-slot:default="dialog">
                    <v-card>
                        <v-toolbar color="#b6ff00" light>Add Official/Agent
                            <br />

                            <v-spacer></v-spacer>
                            <v-card-actions class="justify-end">
                                <v-btn text @click="dialog.value = false">Close</v-btn>
                            </v-card-actions>
                        </v-toolbar>
                        <v-card-text>
                            <div class="text-span pa-2">
                                <h2>{{ estate_name }}</h2>
                                <br />
                                <h3>{{ estate_urn }}</h3>
                            </div>
                        </v-card-text>

                        <div class="container">
                            <div class="">
                                <v-select v-model="role" :items="roles" label="Role" flat required></v-select>

                                <div class="">
                                    <v-text-field clearable v-model="household_search" @change="searchHouseholdsEstate(household_search)" placeholder="Search households" flat rounded style="background-color: beige; height: 50px" required></v-text-field>
                                </div>
                            </div>
                            <div class="row text--center" id="all_items">
                                <!-- <div v-for="tag in houseHolds" :key="tag.id" class="col-md-6"></div> -->

                                <v-list subheader>
                                    <v-subheader>Households</v-subheader>

                                    <v-list-item v-for="hs in estate_houseHolds" :key="hs.title">
                                        <v-list-item @click="
                          (householdOwner = hs.primary_owner), getToken(hs.household_id)
                        ">
                                            <v-list-item-avatar>
                                                <v-avatar color="#8051FF" size="48">
                                                    <span style="color: black">{{
                              hs.primary_owner.substring(0, 3)
                            }}</span>
                                                </v-avatar>
                                            </v-list-item-avatar>

                                            <v-list-item-content>
                                                <v-list-item-title>{{ hs.primary_owner }}</v-list-item-title>
                                            </v-list-item-content>
                                            <v-list-item-icon>
                                                <v-spacer></v-spacer>

                                                <div>
                                                    <v-card-actions>
                                                        <v-icon color="green" v-show="hs.is_official ? false : true">mdi-account-badge</v-icon>
                                                    </v-card-actions>
                                                </div>
                                            </v-list-item-icon>

                                            <v-list-item-action>
                                                <div v-show="hs.is_official ? true : false">
                                                    <span style="font-size: 0.6rem">Assign official</span>

                                                    <v-btn icon color="orange" v-show="hs.is_official ? true : false" @click="
                                getToken(hs.household_id),
                                  assignOfficials(hs.household_id, hs.uid),
                                  (full_name = hs.primary_owner),
                                  (householdOwner = hs.primary_owner),
                                  (contact_number = hs.contact_number)
                              ">
                                                        <v-icon>mdi-account-network-outline</v-icon>
                                                    </v-btn>
                                                </div>
                                                <div v-show="true">
                                                    <v-btn style="margin: 4px" icon v-show="hs.is_official ? false : true" @click="
                                assignOfficials2(hs.household_id),
                                  DeleteOfficial(hs.contact_number)
                              ">
                                                        <v-icon>mdi-close</v-icon>
                                                    </v-btn>
                                                    <span style="font-size: 0.6rem"></span>
                                                </div>
                                            </v-list-item-action>
                                            <v-icon style="margin: 4px" :color="hs.active ? 'grey' : 'blue'">
                                                mdi-check-decagram
                                            </v-icon>
                                        </v-list-item>
                                    </v-list-item>
                                </v-list>
                            </div>
                        </div>
                        <v-form v-show="false" @submit.prevent="AddOfficial">
                            <v-text-field v-model="full_name" label="Full Name" outlined required></v-text-field>

                            <v-select v-model="role" :items="roles" label="Role" outlined required></v-select>

                            <v-text-field v-model="contact_number" label="Contact Number" outlined required></v-text-field>

                            <v-text-field v-model="email" label="Email Address" outlined required></v-text-field>

                            <v-btn color="#b6ff00" class="mt-4" type="submit" style="color: black">Submit</v-btn>
                        </v-form>
                    </v-card>
                </template>
            </v-dialog>
        </v-col>
    </v-row>
</div>
</template>

<script>
import MyBarChart from '@/components/charts/barChartPayment'
import CryptoJS from "crypto-js";
import axios from "axios";
import dayjs from "@nuxtjs/dayjs";
import moment from "moment";
import numeral from 'numeral';
import Map from "@/components/map.vue";

import HouseholdBarChart from '~/components/charts/HouseholdBarChart.vue'
import barChart from '@/components/charts/barChartTrends.vue'
import paymentSummary from "@/components/paymentSummary.vue";

import {
    uuid
} from "vue-uuid";

const keyValue = "fd85b4945YF'i"; // your key value (eg: key)
const ivKey = "smslt";

export default {
    name: "households",
    props: {
        estateId: {
            type: Number,
            required: true,
        },
    },
    mounted() {
        console.log("Estate ID:", this.estateId);
        this.Fetch_AddressSettings();
        // this.Fetch_ActiveHouseholds();
        // this.Fetch_PostAllEstates();
        // this.Fetch_AllPayments();
    },
    components: {
        Map,
        paymentSummary,
        HouseholdBarChart,
        MyBarChart,
        barChart
    },
    data() {
        return {
            numeral,
       
            headers: [
              
              
                {
                    text: "Street",
                    value: "street",
                    align: "right",
                },
                {
                    text: "Court",
                    value: "court",
                    align: "right",
                },

                {
                    text: "Section",
                    value: "section",
                    align: "right",
                },

            ],
            paymentData: [{
                    month: 'January',
                    amount: 1200
                },
                {
                    month: 'February',
                    amount: 950
                },
                {
                    month: 'March',
                    amount: 1600
                },
                {
                    month: 'April',
                    amount: 1100
                }
            ],
            roles: ["Chairman", "Secretary", "Treasurer"],
            dialog: false,
            totalEstate: 0,
            totalResidence: 0,
            totalActiveResidence: 0,
            estate_name: null,
            estate_urn: null,
            show: true,
            switch: false,
            drawer: false,
            group: null,
            estates_search: "",
            pay_search: "",
            household_search: "",
            search_estates: [],
            payments: [],
            houseHolds: [],
            estate_houseHolds: [],
            rules: [
                (value) => !!value || "Required.",
                (value) => (value || "").length <= 4 || "Max 4 characters",
            ],
            estates: [],
            deposit: true,
            depo_amount: "",
            depo_number: "",
            showB: false,
            pin_input: "",
            pin_input_deposit: "",
            cash_deposit_dialog: false,
            cash_refund_dialog: false,
            pin_set_dialog: false,
            pin_dialog: false,
            pin_dialog2: false,
            pin_view_bal_dialog: false,
            pin: null,
            pinbal: null,
            pin_transfer: null,
            pin_transact: null,
            refund: false,
            password_status: false,
            stk_push: false,
            verify_pin: null,
            auth_state: false,
            security_quiz: false,
            security_key: false,
            secretKey: null,
            set_Pin: false,
            pass_status: "",
            pin: null,
            verify_pin: null,
            b2c: false,
            bg: require("@/assets/bg.png"),
            logo: require("@/assets/logo.svg"),
            errorResponse: "",
            successResponse: "",
            Amount: "",
            Phone: null,
            UserName: "",
            snackbar_s: false,
            snackbarText_s: "",
            snackbar: false,
            snackbar2: false,
            snackbarText: "",
            snackbarText2: "",
            status: false,
            timerEnabled: false,
            show: false,
            show6: false,
            timerCount: 25,
            valid: true,
            name: "",
            nameRules: [
                (v) => !!v || "Name is required",
                (v) => (v && v.length <= 20) || "Name must be less than 10 characters",
            ],
            email: "",
            emailRules: [
                (v) => !!v || "E-mail is required",
                (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
            ],
            select: null,
            items: ["Item 1", "Item 2", "Item 3", "Item 4"],
            checkbox: false,
            CheckoutRequestID: "",
            balance: "0",
            transactions: [],
            show6: false,
            errorResponse: "",
            successResponse: "",
            timerEnabled3: false,
            timerCount3: 2,
            timerEnabled2: false,
            timerCount2: 2,
            uid: null,
            payment: false,
            full_name: null,
            role: null,
            contact_number: null,
            email: null,
            estate_urn: null,
            estate_id: null,
            payment_msg: "",
            deviceToken: "",
            title: "",
            body: "",
            householdOwner: "",
            totalPayment: 0,
            totalPendingPayment: 0,
            estateConfig:[]
        };
    },
    methods: {

        async Fetch_AddressSettings() {
            let that = this;
            that.estateConfig.splice(that.estateConfig);
            axios
                .get(`https://makaaziserverapi-production-252f.up.railway.app/api/estates-config/get_estates/${this.estateId}`, {})
                .then(function (response) {
                    if (response.status == 200) {
                        // that.snackbar = true;
                        // that.snackbarText = response.data;
                        that.estateConfig = response.data;
                        console.log("Estate config", that.estateConfig);
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

    created() {},
};
</script>

<style>
#all_items {
    --scrollbarBG: #00000000;
    --scrollbarBG: #b7ff005b;
    --thumbBG: #2f2c2c00;
    scrollbar-width: thin;
    scrollbar-color: var(--thumbBG) var(--scrollbarBG);
    overflow-y: scroll;
    width: 100%;
    align-items: start;
    bottom: 0;
    padding: 3px;
    height: 100vh;
    justify-content: start;
}

#all_items::-webkit-scrollbar {
    width: 8px;
}

#all_items::-webkit-scrollbar-track {
    background: var(--scrollbarBG);
}

#all_items::-webkit-scrollbar-thumb {
    background-color: var(--thumbBG);
    border-radius: 8px;
    border: 3px solid var(--scrollbarBG);
}

.blur {
    filter: blur(9px);
    /* Adjust the value (5px) to increase or decrease the blur intensity */
}

#charter {
    transition: 0.5s ease;
    background-image: url("@/assets/bg.png");
    background-attachment: fixed;
    background-position: center;
    background-size: contain;
    background-color: black;
    width: 100%;
    height: 260px;
}
</style>
