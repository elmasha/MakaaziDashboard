<template>
  <div>
    <v-card color="white" elevation="0" >
      <v-app-bar color="white" light elevation="0">
        <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>

        <div
          class="d-flex"
          style="background-color: #b6ff00; border-radius: 120px; padding: 4px"
        >
          <v-avatar color="black" size="28">
            <span style="color: #b6ff00">El</span>
          </v-avatar>
          <v-toolbar-title style="color: black; margin-start: 8px; margin-right: 8px"
            >Intech</v-toolbar-title
          >
        </div>

        <v-spacer></v-spacer>
        <v-btn icon>
          <v-icon>mdi-bell</v-icon>
        </v-btn>
        <v-btn icon>
          <v-icon>mdi-logout</v-icon>
        </v-btn>
      </v-app-bar>

      <v-navigation-drawer v-model="drawer" absolute temporary height="100vh">
        <v-list nav dense>
          <v-list-item-group
            v-model="group"
            active-class="deep-purple--text text--accent-4"
          >
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-home</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Home</v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-account</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Account</v-list-item-title>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-navigation-drawer>

      <v-row justify="" align="" class="">
        <v-col cols="12" sm="12" md="12">
          <div class="container">
            <div class="">
              <v-btn
                color="black"
                rounded
                style="color: white; margin: 12px"
                to="/addEstate"
              >
                <v-icon left color="white"> mdi-plus </v-icon>
                Add new estate
              </v-btn>
              <br />
              <v-spacer></v-spacer>
            </div>
            <v-expand-transition>
              <v-row class="container" v-show="true">
                <v-col cols="6" sm="2" md="2">
                  <v-card color="#dadada" elevation="0">
                    <v-card-subtitle>
                      <h4>Total Estates</h4>
                    </v-card-subtitle>
                    <v-card-actions>
                      <h2>{{ totalEstate }}</h2>
                    </v-card-actions>
                  </v-card>
                </v-col>
                <v-col cols="6" sm="2" md="2">
                  <v-card color="#dadada" elevation="0">
                    <v-card-subtitle>
                      <h4>Total HouseHolds</h4>
                    </v-card-subtitle>
                    <v-card-actions>
                      <h2>{{ totalResidence }}</h2>
                    </v-card-actions>
                  </v-card>
                </v-col>
                <v-col cols="6" sm="2" md="2">
                  <v-card color="#dadada" elevation="0">
                    <v-card-subtitle>
                      <h4>Active Residents</h4>
                    </v-card-subtitle>
                    <v-card-actions>
                      <h2>{{ totalActiveResidence }}</h2>
                    </v-card-actions>
                  </v-card>
                </v-col>
                <v-col cols="6" sm="2" md="2">
                  <v-card color="#dadada" elevation="0">
                    <v-card-subtitle>
                      <h4>Pending payments</h4>
                    </v-card-subtitle>
                    <v-card-actions>
                      <h2>0</h2>
                    </v-card-actions>
                  </v-card>
                </v-col>
                <v-col cols="6" sm="2" md="2">
                  <v-card color="#dadada" elevation="0">
                    <v-card-subtitle>
                      <h4>Incidents</h4>
                    </v-card-subtitle>
                    <v-card-actions>
                      <h2>0</h2>
                    </v-card-actions>
                  </v-card>
                </v-col>
                <v-col cols="6" sm="2" md="2">
                  <v-card color="#dadada" elevation="0">
                    <v-card-subtitle>
                      <h4>Visitors</h4>
                    </v-card-subtitle>
                    <v-card-actions>
                      <h2>0</h2>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </v-expand-transition>
          </div>
        </v-col>

        <v-col cols="12" sm="6" md="6">
          <div class="container">
            <div class="d-flex" style="margin: 12px">
              <v-text-field
                width="200"
                style="margin: 12px"
                v-model="estates_search"
                @change="searchEstate(estates_search)"
                placeholder="Search for estates"
                filled
                rounded
                clearable
                dense
              >
              </v-text-field>
              <v-btn
                style="margin: 12px"
                fab
                x-small
                color="#b6ff00"
                @click="searchEstate(estates_search)"
              >
                <v-icon color="black"> mdi-magnify </v-icon>
              </v-btn>
              <v-spacer></v-spacer>
            </div>
            <v-container>
              <div class="row text--center" id="all_items">
                <div v-for="tag in estates" :key="tag.id" class="col-md-4">
                  <div class="container">
                    <v-card elevation="0">
                      <v-img
                        :src="tag.estate_image"
                        class="white--text align-end"
                        gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                        height="200px"
                      >
                        <v-avatar color="#8051FF" style="margin: 8px">
                          <v-img :src="tag.logo_url" contain alt="John" height="200" />
                        </v-avatar>
                      </v-img>
                      <div>
                        <div>
                          <v-card-text>
                            <h2 style="font-size: 1.2rem; margin: 0px">
                              {{ tag.estate_name }}
                            </h2>
                            <p style="font-size: 0.8rem; margin: 0px">
                              {{ tag.estate_urn }}
                            </p>
                            <p style="font-size: 0.6rem; margin: 0px">
                              {{ tag.estate_location }}
                            </p>
                          </v-card-text>
                        </div>
                        <div class="d-flex" style="margin: 12px">
                          <div>
                            <v-btn
                              icon
                              @click="
                                (dialog = true),
                                  (estate_name = tag.estate_name),
                                  (estate_urn = tag.estate_urn),
                                  (estate_id = tag.estate_id),
                                  Fetch_EstateOfficials(tag.estate_id)
                              "
                              color="black"
                            >
                              <div class="">
                                <!-- <v-icon large color="black">mdi-account-plus</v-icon> -->
                                <span style="margin-top: 4px; color: white">
                                  <strong>{{ tag.likes }}</strong>
                                </span>
                              </div> </v-btn
                            ><br />
                          </div>
                          <!-- <v-nuxt-link
                          style="text-decoration: none"
                          :to="`/post/${tag.id}`"
                        >

                        </v-nuxt-link> -->
                          <v-spacer></v-spacer>
                          <v-btn icon color="black" :to="`/estate/${tag.estate_id}`">
                            <v-icon color="black">mdi-arrow-right</v-icon>
                          </v-btn>
                        </div>
                      </div>
                    </v-card>
                  </div>
                </div>
              </div>
            </v-container>
          </div>
        </v-col>
        <v-col cols="12" sm="6" md="6" lg="6">
          <v-row>
            <v-col cols="12" sm="12" md="12">
              <v-subheader> <h4>Estate Map Location</h4> </v-subheader>
              <div class="container">
                <Map />
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="6" lg="6">
              <div>
                <div class="container">
                  <v-subheader>HouseHolds</v-subheader>
                  <div class="d-flex" style="margin: 12px">
                    <v-text-field
                      width="200"
                      style="margin: 12px"
                      v-model="pay_search"
                      @change="searchPayments(pay_search)"
                      placeholder="Search for payment"
                      filled
                      rounded
                      clearable
                      dense
                    >
                    </v-text-field>
                    <v-btn
                      style="margin: 12px"
                      fab
                      x-small
                      color="black"
                      @click="searchPayments(pay_search)"
                    >
                      <v-icon color="white"> mdi-magnify </v-icon>
                    </v-btn>
                    <v-spacer></v-spacer>
                  </div>
                </div>
                <div class="container" id="all_items">
                  <v-list subheader>
                    <v-list-item v-for="chat in houseHolds" :key="chat.primary_owner">
                      <v-list-item
                        @click="
                          (householdOwner = chat.primary_owner),
                            getToken(chat.household_id)
                        "
                      >
                        <v-list-item-avatar>
                          <v-avatar color="#b6ff00" size="56">{{
                            chat.primary_owner.substring(0, 2)
                          }}</v-avatar>
                        </v-list-item-avatar>

                        <v-list-item-content>
                          <v-list-item-title
                            v-text="chat.primary_owner"
                          ></v-list-item-title>
                        </v-list-item-content>

                        <v-list-item-icon>
                          <v-icon :color="chat.active ? 'blue' : 'grey'">
                            mdi-check-decagram
                          </v-icon>
                        </v-list-item-icon>
                      </v-list-item>
                    </v-list-item>
                  </v-list>
                </div>
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="6" lg="6">
              <div class="container">
                <div>
                  <v-subheader>Recent payments</v-subheader>
                  <div class="d-flex" style="margin: 12px">
                    <v-text-field
                      width="200"
                      style="margin: 12px"
                      v-model="pay_search"
                      @change="searchPayments(pay_search)"
                      placeholder="Search for payment"
                      filled
                      rounded
                      clearable
                      dense
                    >
                    </v-text-field>
                    <v-btn
                      style="margin: 12px"
                      fab
                      x-small
                      color="black"
                      @click="searchPayments(pay_search)"
                    >
                      <v-icon color="white"> mdi-magnify </v-icon>
                    </v-btn>
                    <v-spacer></v-spacer>
                  </div>
                </div>
                <div class="container" id="all_items">
                  <v-list subheader three-line>
                    <v-list-item-group active-class="pink--text" multiple>
                      <template v-for="(item, index) in payments">
                        <v-list-item :key="item.transaction_type">
                          <template v-slot:default="{ active }">
                            <v-list-item-content>
                              <v-list-item-title
                                v-text="item.estate_name"
                              ></v-list-item-title>

                              <v-list-item-subtitle
                                class="text--primary"
                                v-text="item.transaction_id"
                              ></v-list-item-subtitle>

                              <v-list-item-subtitle
                                v-text="item.transaction_type"
                              ></v-list-item-subtitle>
                            </v-list-item-content>

                            <v-list-item-action>
                              <v-list-item-action-text
                                v-text="item.total_paid"
                              ></v-list-item-action-text>
                            </v-list-item-action>
                          </template>
                        </v-list-item>

                        <v-divider
                          v-if="index < items.length - 1"
                          :key="index"
                        ></v-divider>
                      </template>
                    </v-list-item-group>
                  </v-list>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" sm="6" md="6" lg="6"> </v-col>
        <v-col cols="12" sm="6" md="6" lg="6">
          <div class="">
            <v-row>
              <v-col cols="12" sm="6" md="6"> </v-col>
              <v-col cols="12" sm="6" md="6"> </v-col>
            </v-row>
          </div>
        </v-col>
        <v-col cols="12" sm="12" md="12"> </v-col>
      </v-row>

      <v-snackbar
        color="primary accent-8"
        :timeout="6000"
        v-model="snackbar_s"
        centered
        bottom
      >
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
              <v-toolbar color="#b6ff00" light
                >Add Official/Agent
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
                  <v-select
                    v-model="role"
                    :items="roles"
                    label="Role"
                    flat
                    required
                  ></v-select>

                  <div class="">
                    <v-text-field
                      clearable
                      v-model="household_search"
                      @change="searchHouseholdsEstate(household_search)"
                      placeholder="Search households"
                      flat
                      rounded
                      style="background-color: beige; height: 50px"
                      required
                    ></v-text-field>
                  </div>
                </div>
                <div class="row text--center" id="all_items">
                  <!-- <div v-for="tag in houseHolds" :key="tag.id" class="col-md-6"></div> -->

                  <v-list subheader>
                    <v-subheader>Households</v-subheader>

                    <v-list-item v-for="hs in estate_houseHolds" :key="hs.title">
                      <v-list-item
                        @click="
                          (householdOwner = hs.primary_owner), getToken(hs.household_id)
                        "
                      >
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
                              <v-icon color="green" v-show="hs.is_official ? false : true"
                                >mdi-account-badge</v-icon
                              >
                            </v-card-actions>
                          </div>
                        </v-list-item-icon>

                        <v-list-item-action>
                          <div v-show="hs.is_official ? true : false">
                            <span style="font-size: 0.6rem">Assign official</span>

                            <v-btn
                              icon
                              color="orange"
                              v-show="hs.is_official ? true : false"
                              @click="
                                getToken(hs.household_id),
                                  assignOfficials(hs.household_id, hs.uid),
                                  (full_name = hs.primary_owner),
                                  (householdOwner = hs.primary_owner),
                                  (contact_number = hs.contact_number)
                              "
                              ><v-icon>mdi-account-network-outline</v-icon></v-btn
                            >
                          </div>
                          <div v-show="true">
                            <v-btn
                              style="margin: 4px"
                              icon
                              v-show="hs.is_official ? false : true"
                              @click="
                                assignOfficials2(hs.household_id),
                                  DeleteOfficial(hs.contact_number)
                              "
                            >
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
                <v-text-field
                  v-model="full_name"
                  label="Full Name"
                  outlined
                  required
                ></v-text-field>

                <v-select
                  v-model="role"
                  :items="roles"
                  label="Role"
                  outlined
                  required
                ></v-select>

                <v-text-field
                  v-model="contact_number"
                  label="Contact Number"
                  outlined
                  required
                ></v-text-field>

                <v-text-field
                  v-model="email"
                  label="Email Address"
                  outlined
                  required
                ></v-text-field>

                <v-btn color="#b6ff00" class="mt-4" type="submit" style="color: black"
                  >Submit</v-btn
                >
              </v-form>
            </v-card>
          </template>
        </v-dialog>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import CryptoJS from "crypto-js";
import axios from "axios";
import dayjs from "@nuxtjs/dayjs";
import moment from "moment";
import Map from "@/components/map.vue";

import { uuid } from "vue-uuid";

const keyValue = "fd85b4945YF'i"; // your key value (eg: key)
const ivKey = "smslt";

export default {
  name: "index",

  mounted() {
    this.Fetch_AllOfficials();
    // this.Fetch_ActiveHouseholds();
    this.Fetch_PostAllEstates();
    this.Fetch_AllPayments();
  },
  components: {
    Map,
  },
  data() {
    return {
       
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
    };
  },
  methods: {
    async getToken(val) {
      let that = this;
      axios
        .get(`https://web-production-27f796.up.railway.app/api/fcm/get-token/${val}`, {})
        .then(function (response) {
          if (response.status == 200) {
            that.deviceToken = response.data.fcm_token;
            console.log("fcm_token", that.deviceToken, "user name", that.householdOwner);
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
    async SendNotification() {
      let that = this;

      axios
        .post(`https://web-production-27f796.up.railway.app/api/fcm/sendNotification`, {
          fcmToken: that.deviceToken,
          title: that.title,
          body: that.body,
        })
        .then(function (response) {
          if (response.status == 200) {
            that.snackbar = true;
            that.snackbarText = response.data;
            console.log("Notification sent");
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
    async checkOfficial(val) {
      if (val == 1) {
        return false;
      } else if (val == 0) {
        return true;
      }
    },
    async searchHouseholdsEstate(val) {
      let that = this;
      if (val == null) {
        that.Fetch_EstateOfficials(that.estate_id);
      } else {
        that.estate_houseHolds.splice(that.estate_houseHolds);
        axios
          .get(
            `https://web-production-27f796.up.railway.app/api/households/search/${that.estate_id}?query=${val}`,
            {}
          )
          .then(function (response) {
            if (response.status == 200) {
              // that.snackbar = true;
              // that.snackbarText = response.data;
              that.estate_houseHolds = response.data;
              console.log("Households", that.estate_houseHolds);
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
    async searchPayments(val) {
      if (val == "") {
        this.Fetch_AllPayments();
      } else {
        let that = this;
        that.payments.splice(that.payments);
        axios
          .get(`https://web-production-27f796.up.railway.app/api/payments/searchAll/?query=${val}`, {})
          .then(function (response) {
            if (response.status == 200) {
              // that.snackbar = true;
              // that.snackbarText = response.data;
              that.payments = response.data;
              console.log("Search payments", that.payments);
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
    async searchEstate(val) {
      if (val == "") {
        this.Fetch_PostAllEstates();
      } else {
        let that = this;
        that.estates.splice(that.estates);
        axios
          .get(`https://web-production-27f796.up.railway.app/api/estates/search/?query=${val}`, {})
          .then(function (response) {
            if (response.status == 200) {
              // that.snackbar = true;
              // that.snackbarText = response.data;
              that.estates = response.data;
              console.log("Search estates", that.estates);
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
    async searchHouseholds(val) {
      if (val == "") {
        this.Fetch_AllOfficials();
      } else {
        let that = this;
        that.houseHolds.splice(that.houseHolds);
        axios
          .get(`https://web-production-27f796.up.railway.app/api/households/search/?query=${val}`, {})
          .then(function (response) {
            if (response.status == 200) {
              // that.snackbar = true;
              // that.snackbarText = response.data;
              that.houseHolds = response.data;
              console.log("Households", that.houseHolds);
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
    async assignOfficials(val, val1) {
      let that = this;

      if (that.role == null) {
        that.snackbar2 = true;
        that.snackbarText2 = "Select a role";
      } else {
        axios
          .patch(`https://web-production-27f796.up.railway.app/api/households/update_household/${val}`, {
            is_official: 0,
            official_role: that.role,
          })
          .then(function (response) {
            if (response.status == 200) {
              that.snackbar = true;
              that.snackbarText = response.data;
              that.AddOfficial(val1);
              console.log("Official assigned");
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
    async assignOfficials2(val) {
      let that = this;
      axios
        .patch(`https://web-production-27f796.up.railway.app/api/households/update_household/${val}`, {
          is_official: 1,
          official_role: "none",
        })
        .then(function (response) {
          if (response.status == 200) {
            that.snackbar = true;
            that.snackbarText = response.data;
            that.Fetch_EstateOfficials(that.estate_id);
            console.log("Official assigned");
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
    async DeleteOfficial(val) {
      let that = this;
      axios
        .put(`https://web-production-27f796.up.railway.app/api/officials/delete_official/${val}`, {})
        .then(function (response) {
          if (response.status == 200) {
            that.snackbar = true;
            that.snackbarText = response.data;
            that.Fetch_EstateOfficials(that.estate_id);
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
    async AddOfficial(val) {
      let that = this;
      that.title = "Verification";
      that.body =
        "Hi! " +
        that.householdOwner +
        " your account has been verified welcome to makaazi App";
      axios
        .post(`https://web-production-27f796.up.railway.app/api/officials/addOfficial`, {
          full_name: that.full_name,
          estate_id: that.estate_id,
          role: that.role,
          contact_number: that.contact_number,
          estate_urn: that.estate_urn,
          uid: val,
        })
        .then(function (response) {
          if (response.status == 200) {
            that.snackbar = true;
            that.snackbarText = response.data;
            that.SendNotification();
            that.Fetch_EstateOfficials(that.estate_id);
            console.log("Official added");
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
    async Search_estates(val) {
      if (val == "") {
        this.Fetch_PostAll();
      } else {
        let that = this;
        axios
          .get(
            `https://node-mysql-5c19e7a5ca18.herokuapp.com/estates/searchestates?query=${val}`,
            {}
          )
          .then(function (response) {
            if (response.status == 200) {
              // that.snackbar = true;
              // that.snackbarText = response.data;
              that.estates = response.data;
              console.log("Search estates", that.estates);
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
    async Fetch_AllPayments() {
      let that = this;
      axios
        .get("https://web-production-27f796.up.railway.app/api/payments/getAll", {})
        .then(function (response) {
          if (response.status == 200) {
            // that.snackbar = true;
            // that.snackbarText = response.data;
            that.payments = response.data;
            console.log("Payments", that.payments);
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
    async Fetch_ActiveHouseholds() {
      let that = this;
      axios
        .get("https://web-production-27f796.up.railway.app/api/households/getActiveHouseHolds/0", {})
        .then(function (response) {
          if (response.status == 200) {
            // that.snackbar = true;
            // that.snackbarText = response.data;

            that.totalActiveResidence = response.data.length;
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
    async Fetch_AllOfficials() {
      let that = this;
      that.houseHolds.splice(that.houseHolds);
      axios
        .get("https://web-production-27f796.up.railway.app/api/households/getall/", {})
        .then(function (response) {
          if (response.status == 200) {
            // that.snackbar = true;
            // that.snackbarText = response.data;
            that.houseHolds = response.data;
            that.totalResidence = response.data.length;
            console.log("Households", that.houseHolds);
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
    async Fetch_EstateOfficials(val) {
      let that = this;
      that.estate_houseHolds.splice(that.estate_houseHolds);
      axios
        .get(`https://web-production-27f796.up.railway.app/api/households/getBHsHldEstId/${val}`, {})
        .then(function (response) {
          if (response.status == 200) {
            // that.snackbar = true;
            // that.snackbarText = response.data;
            that.estate_houseHolds = response.data;
            console.log("Households", that.estate_houseHolds);
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
      axios
        .get("https://web-production-27f796.up.railway.app/api/estates/getall", {})
        .then(function (response) {
          if (response.status == 200) {
            // that.snackbar = true;
            // that.snackbarText = response.data;
            that.estates = response.data;
            that.totalEstate = response.data.length;
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
    loginAnonymously() {
      this.$fire.auth
        .signInAnonymously()
        .catch(function (error) {
          this.snackbarText = error.message;
          this.snackbar = true;
          this.showLogin = false;
        })
        .then((user) => {
          //we are signed in
          let ID = uuid.v1();
          console.log(uuid.v1());
          const db = this.$fire.firestore;
          let uid = user.user.uid;
          console.log("user uid", uid);
        });
    },
    CheckPhone() {
      this.pin_dialog = true;
      this.pin_transfer = null;
    },
    checkColor(val) {
      if (val == "Deposit") {
        return "green2";
      } else if (val == "Withdraw") {
        return "red";
      } else if (val == "Tips") {
        return "blue";
      }
    },
    checkType(val) {
      if (val == "Deposit") {
        return "arrow-up";
      } else if (val == "Withdraw") {
        return "arrow-down";
      } else if (val == "Tips") {
        return "hand-coin";
      }
    },

    verifyPin24(val) {
      if (this.decrypteData(this.pin) === this.decrypteData(val)) {
        console.log("PIn match");
        this.FetchBalance();
        this.pin_status = "";
        this.showB = true;
        this.pin_view_bal_dialog = false;
      } else {
        console.log("PIn not match");
        this.pin_status = "Invalid pin. \nProvide a valid pin number";
        this.snackbar2 = true;
        this.snackbarText2 = "Please enter a valid pin number";
      }
    },
    verifyPin22(val) {
      if (this.decrypteData(this.pin) === this.decrypteData(val)) {
        console.log("PIn match");
        this.MpesaPaymentStk();
        this.pin_status = "";
        this.pin_dialog = false;
      } else {
        console.log("PIn not match");
        this.pin_status = "Invalid pin. \nProvide a valid pin number";
        this.snackbar2 = true;
        this.snackbarText2 = "Invalid pin. \nProvide a valid pin number";
      }
    },
    verifyPin2(val) {
      if (this.decrypteData(this.pin) === this.decrypteData(val)) {
        console.log("PIn match");
        this.mpesaB2c();
        this.pin_status = "";
        this.pin_dialog = false;
        this.pin_transfer = null;
      } else {
        console.log("PIn not match");
        this.pin_status = "Invalid pin. \nProvide a valid pin number";
        this.snackbar2 = true;
        this.snackbarText2 = "Invalid pin. \nProvide a valid pin number";
      }
    },
    encrypteData(data) {
      if (this.secretKey == null) {
        this.pass_status = "UnAble detect key";
      } else {
        if (data != null) {
          const key = CryptoJS.PBKDF2(this.secretKey, "salt", {
            keySize: 256 / 32,
            iterations: 1000,
          });
          const iv = CryptoJS.enc.Utf8.parse(ivKey); // Convert string to WordArray
          const encrypted = CryptoJS.AES.encrypt(data, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
          });

          this.encryptedText = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
          return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
        }
      }
    },
    decrypteData(data) {
      if (this.secretKey == null) {
        this.pass_status = "UnAble detect key";
      } else {
        if (data) {
          const key = CryptoJS.PBKDF2(this.secretKey, "salt", {
            keySize: 256 / 32,
            iterations: 1000,
          });
          const iv = CryptoJS.enc.Utf8.parse(ivKey);
          const decrypted = CryptoJS.AES.decrypt(
            {
              ciphertext: CryptoJS.enc.Hex.parse(data),
            },
            key,
            {
              iv: iv,
              mode: CryptoJS.mode.CBC,
            }
          );
          return decrypted.toString(CryptoJS.enc.Utf8);
        }
      }
    },
    CheckPassword(val, val2) {
      if (val == val2) {
        this.pass_status = "Password matches";
        return true;
      } else {
        this.pass_status = "Password does not match";
        return false;
      }
    },
    ConfirmCode2() {
      console.log("Code sent to you.", this.code_no2);

      var credential = firebase.auth.PhoneAuthProvider.credential(
        this.confirmation_Result.verificationId,
        this.code_no2
      );
      if ((this.code_no2 = "")) {
        this.snackbar2 = true;
        this.snackbarText2 = "Provide Code sent to you";
        console.log("Provide Code sent to you");
      } else {
        console.log("Verify Code", this.code_no2);
        this.progress_bar = true;
        firebase
          .auth()
          .signInWithCredential(credential)
          .then((user) => {
            // SMS sent. Prompt user to type the code from the message, then sign the
            // user in with confirmationResult.confirm(code).
            //this.$toast.success("Otp sent successfully");
            window.location.reload(true);
            this.FetchUserPin();
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
    logout() {
      this.$fire.auth.signOut();
      window.location.reload(true);
    },
    mpesaB2cQuery() {
      axios
        .post("https://chargeb2c-78a6d3d19f7e.herokuapp.com/result_url", {})
        .then(function (response) {
          console.log(response);
          if (response.status == 200) {
            this.snackbar = true;
            this.snackbarText = response.data;
            this.show6 = false;
            this.b2c = false;
          } else if (response.status == 400) {
            this.snackbar2 = true;
            this.snackbarText2 = response.data;
            this.errorMessage = response.data;
            this.show6 = false;
            this.b2c = false;
          }
        })
        .catch(function (error) {
          console.log(error);
          this.snackbarText = error;
          this.snackbar = true;
          this.btn_disabled = false;
        })
        .then(function () {
          // this.timerEnabled = true;
        });
    },
    mpesaB2c() {
      let that = this;
      if (that.Phone == null) {
        that.snackbarText2 = "Provide Phone number..";
        that.snackbar2 = true;
      } else if (that.Amount == "") {
        that.snackbarText2 = "Provide amount.";
        that.snackbar2 = true;
      } else if (that.Amount > 3000) {
        that.snackbarText2 = "amount cannot exceed 1000.";
        that.snackbar2 = true;
      } else {
        that.b2c = true;
        that.show6 = true;
        axios
          .post("https://chargeb2c-78a6d3d19f7e.herokuapp.com/b2c", {
            Phonenumber: that.Phone,
            amount: that.Amount,
            uid: that.$fire.auth.currentUser.uid,
          })
          .then(function (response) {
            console.log(response);
            if (response.status == 200) {
              if (response.data.ResponseCode == "0") {
              } else {
              }

              if (response.data.errorCode == "400.002.02") {
                that.snackbar2 = true;
                that.snackbarText2 = response.data.errorMessage;
                that.show6 = false;
                that.b2c = false;
                that.pin_transfer = null;
              } else if (response.data.errorCode == "500.001.1001") {
                that.snackbar2 = true;
                that.snackbarText2 = response.data.errorMessage;
                that.show6 = false;
                that.b2c = false;
                that.pin_transfer = null;
              } else {
                that.successResponse = response.data.CustomerMessage;
                that.CheckoutRequestID = response.data.CheckoutRequestID;
                console.log(response.data);
                that.b2c = false;
                that.FetchBalance();
                that.pin_dialog = false;
                that.show6 = false;
                that.timerEnabled3 = true;
                that.pin_transfer = null;
              }
            } else if (response.status == 400) {
              that.snackbar2 = true;
              that.snackbarText2 = response.data;
              that.errorMessage = response.data;
              that.show6 = false;
              that.b2c = false;
              that.pin_transfer = null;
            }
          })
          .catch(function (error) {
            console.log(error);
            that.snackbarText = error;
            that.snackbar = true;
            that.btn_disabled = false;
            that.show6 = false;
            that.pin_transfer = null;
          });
      }
    },
    validate() {
      this.$refs.form.validate();
    },
    reset() {
      this.$refs.form.reset();
    },
    resetValidation() {
      this.$refs.form.resetValidation();
    },
    MpesaPaymentStk() {
      let that = this;
      if (that.depo_number == null) {
        that.snackbarText2 = "Provide phone number..";
        that.snackbar2 = true;
      } else if (this.depo_amount == "") {
        that.snackbarText2 = "Provide amount.";
        that.snackbar2 = true;
      } else {
        that.show6 = true;
        axios
          .post("https://chargeb2c-78a6d3d19f7e.herokuapp.com/stk_shop", {
            Phonenumber: that.depo_number,
            amount: that.depo_amount,
          })
          .then(function (response) {
            console.log(response);
            if (response.status == 200) {
              if (response.data.errorCode == "400.002.02") {
                that.snackbar2 = true;
                that.snackbarText2 = response.data.errorMessage;
                that.show6 = false;
                that.pin_transact = null;
              } else if (response.data.errorCode == "500.001.1001") {
                that.snackbar2 = true;
                that.snackbarText2 = response.data.errorMessage;
                that.show6 = false;
                that.pin_transact = null;
              } else {
                that.snackbar = true;
                that.snackbarText = response.data.CustomerMessage;
                that.successResponse = response.data.CustomerMessage;
                that.CheckoutRequestID = response.data.CheckoutRequestID;
                console.log(that.CheckoutRequestID);
                that.FetchBalance();
                that.timerEnabled = true;
                that.pin_dialog2 = false;

                that.pin_transact = null;
              }
            } else if (response.status == 400) {
              that.snackbar2 = true;
              that.snackbarText2 = response.data;
              that.errorMessage = response.data;
              that.show6 = false;
              that.pin_transact = null;
            }
          })
          .catch(function (error) {
            console.log(error);
            that.snackbarText2 = error;
            that.snackbar2 = true;
            that.show6 = false;
            that.pin_transact = null;
          });
      }
    },
    ////Stk Query////
    StkQuery() {
      let that = this;
      that.snackbar_s = true;
      that.snackbarText_s = "Checking payment status...";
      axios
        .post("https://chargeb2c-78a6d3d19f7e.herokuapp.com/stk_shop/query", {
          checkoutRequestId: that.CheckoutRequestID,
        })
        .then(function (response) {
          console.log("StkPush Query", response.data);
          that.show6 = false;

          if (response.status == 200) {
            if (response.dsata.errorCode == "400.002.02") {
              that.snackbar2 = true;
              that.snackbarText2 = response.data.errorMessage;
              that.errorResponse = response.data.errorMessage;
              that.timerCount = 25;
              that.timerEnabled = false;
              that.pin_view_bal_dialog = false;
            } else if (response.data.errorCode == "500.001.1001") {
              that.snackbar2 = true;
              that.snackbarText2 = response.data.errorMessage;
              that.errorResponse = response.data.errorMessage;
              that.timerCount = 25;
              that.timerEnabled = false;
              that.pin_view_bal_dialog = false;
            } else {
              if (response.data.ResultCode == "0") {
                that.FetchBalance();
                that.snackbar = true;
                that.snackbarText = response.data.ResultDesc;
                that.successResponse = response.data.ResultDesc;
                that.timerEnabled = false;
                that.timerCount = 25;
                that.pin_view_bal_dialog = false;
              } else if (response.data.ResultCode == "1032") {
                that.snackbar2 = true;
                that.snackbarText2 = "Request was cancelled";
                that.errorResponse = "Request was cancelled";
                that.timerCount = 25;
                that.timerEnabled = false;
                that.pin_view_bal_dialog = false;
              } else if (response.data.ResultCode == "2001") {
                that.snackbar2 = true;
                that.snackbarText2 = "You entered a wrong pin";
                that.errorResponse = "You entered a wrong pin";
                that.timerCount = 25;
                that.timerEnabled = false;
                that.pin_view_bal_dialog = false;
              } else {
                that.snackbar2 = true;
                that.snackbarText2 = response.data.ResultDesc;
                that.errorResponse = response.data.ResultDesc;
                that.timerEnabled = false;
                that.timerCount = 25;
                that.pin_view_bal_dialog = false;
              }
            }
          } else if (response.status == 400) {
            that.snackbar2 = true;
            that.snackbarText2 = response.data;
            that.timerCount = 25;
            that.timerEnabled = false;
            that.pin_view_bal_dialog = false;
          }
        })
        .catch(function (error) {
          that.pin_view_bal_dialog = false;
          that.snackbar2 = true;
          that.snackbarText2 = error;
          that.timerCount = 25;
          that.timerEnabled = false;
          that.show6 = false;
        });
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
          const start_time = this.$dayjs(new Date()).format("YYYY/MM/DD HH:mm:ss");
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
              phone_no: this.Phone,
            })
            .then((docRef) => {
              console.log("User logged in");
              this.snackbar = true;
              this.snackbarText = "Process Successfully completed";
              this.$router.push({
                path: "/timer",
              });
            })
            .catch((error) => {
              console.log("Error adding document: ", error);
            });
        });
    },
    uploadDetails(val) {
      const db = this.$fire.firestore;
      const start_timer = this.$dayjs(new Date()).format("YYYY/MM/DD HH:mm:ss");
      let ID = uuid.v1();
      console.log(uuid.v1());
      db.collection("charge24_users")
        .doc(val)
        .set({
          user_id: val,
          start_time: start_timer,
          ref: ID,
          active: true,
        })
        .then(() => {
          console.log("User logged in");
          this.$router.push({
            path: "/timer",
          });
        })
        .catch(function (error) {
          console.log("Error adding document: ", error);
        });
    },
    logout() {
      this.$fire.auth.signOut();
      window.location.reload(true);
    },
    checkUser() {
      if (this.$fire.auth.currentUser != null) {
        this.secretKey = this.$fire.auth.currentUser.uid;
        this.uid = this.$fire.auth.currentUser.uid;
        this.FetchUserPin(this.$fire.auth.currentUser.uid);
        console.log(this.secretKey, "keys");
      } else {
        this.auth_state = false;
        console.log("No user logged in");
      }
    },
    generateRandomNumber() {
      const digits = "DY*1234FA6789";
      let randomNumber = "";
      const length = 9;

      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        randomNumber += digits[randomIndex];
      }

      this.randomNineDigitNumber = randomNumber;

      return randomNumber;
    },
    checkPin(val) {
      console.log(val);
    },
    setPin() {
      if (this.password_status == false) {
        this.snackbar2 = true;
        this.snackbarText2 = "Password does not match";
      } else {
        this.progress_bar = true;
        const db = this.$fire.firestore;
        const docRef = db
          .collection("charge24_admin_user")
          .doc(this.$fire.auth.currentUser.uid);

        const newData = {
          pin: this.encrypteData(this.verify_pin),
          Account_id: this.encrypteData(this.$fire.auth.currentUser.uid),
          user_uid: this.$fire.auth.currentUser.uid,
          // Add more fields as needed
        };

        db.runTransaction(async (transaction) => {
          transaction.set(docRef, newData);
        })
          .then((docRef) => {
            console.log("Pin set Successfully ");
            this.snackbar = true;
            this.snackbarText = "Pin set Successfully ";
            this.progress_bar = false;
            this.FetchUserPin();
          })
          .catch((error) => {
            this.snackbar2 = true;
            this.snackbarText2 = error;
            this.progress_bar = false;
            console.error("Error adding listing: ", error);
          });
      }
    },
    resetPin2() {
      const db = this.$fire.firestore;
      console.log("Reset pin", uuid.v1());
      db.collection("charge24_admin_user")
        .doc(this.$fire.auth.currentUser.uid)
        .update({
          payment: false,
        })
        .then(() => {
          that.show6 = false;
          this.timerCount2 = 2;
          this.timerCount3 = 2;
        })
        .catch(function (error) {
          console.log("Error adding document: ", error);
        });
    },
  },

  created() {},
};
</script>

<style>
#all_items {
  --scrollbarBG: #00000000;
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
