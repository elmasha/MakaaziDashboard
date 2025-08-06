<template>
  <div class="container">
    <v-card elevation="0" :loading="loading" class="mx-auto my-0">
      <v-card-actions>
        <v-chip style="margin: 10px; color: white" color="black" text :to="`/`" icon>
          <v-icon>mdi-arrow-left</v-icon>
        </v-chip>
      </v-card-actions>
      <template slot="progress">
        <v-progress-linear
          color="deep-purple"
          height="10"
          indeterminate
        ></v-progress-linear>
      </template>

      <v-img
        :src="estate_image"
        class="white--text align-end"
        gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
        height="200px"
      >
      </v-img>

      <v-card-text>
        <div class="d-flex">
          <v-avatar color="#8051FF" style="margin: 2px">
            <v-img :src="logo_url" contain alt="John" height="200" />
          </v-avatar>
          <div>
            <h2 style="color: black; font-size: 1.6rem; margin: 18px">
              {{ estate_name }}
            </h2>
          </div>
        </div>
        <div>
          {{ location }}
        </div>
        <div>
          {{ estateURN }}
        </div>
      </v-card-text>

      <div class="container">
        <v-row>
          <v-col cols="12" sm="6" md="6">
            <div class="container">
              <v-card-text>
                <v-chip-group
                  v-model="selection"
                  active-class="deep-purple accent-4 white--text"
                  column
                >
                  <v-chip color="black" style="color: white"
                    >Total households {{ totalHousehold }}</v-chip
                  >

                  <v-chip color="blue" style="color: white"
                    >Active households {{ totalHousehold }}</v-chip
                  >

                  <v-chip color="green" style="color: white"
                    >Total officials {{ totalHousehold }}</v-chip
                  >
                </v-chip-group>
              </v-card-text>
            </div>
          </v-col>
          <!-- <v-divider class="mx-4"></v-divider> -->
          <v-col cols="12" sm="6" md="6">
            <div class="container">
              <h4>Map Location</h4>
              <Map />
            </div>
          </v-col>
          <v-col cols="12" sm="6" md="6">
            <div class="container">
              <v-subheader>Estate HouseHolds</v-subheader>
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
                  icon
                  color="black"
                  @click="searchPayments(pay_search)"
                >
                  <v-icon medium color="black">mdi-magnify</v-icon>
                </v-btn>

                <v-spacer></v-spacer>
              </div>
            </div>
            <div class="container" id="all_items2">
              <v-list subheader>
                <v-list-item v-for="chat in houseHolds" :key="chat.primary_owner">
                  <v-list-item
                    @click="
                      (householdOwner = chat.primary_owner), getToken(chat.household_id)
                    "
                  >
                    <v-list-item-avatar>
                      <v-avatar color="#b6ff00" size="56">{{
                        chat.primary_owner.substring(0, 2)
                      }}</v-avatar>
                    </v-list-item-avatar>

                    <v-list-item-content>
                      <v-list-item-title v-text="chat.primary_owner"></v-list-item-title>
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
          </v-col>
          <v-col cols="12" sm="6" md="6"> </v-col>
          <v-col cols="12" sm="12" md="12">
            <v-row class="container" v-show="true">
              <v-col cols="6" sm="6" md="6">
                <v-card color="#dadada" elevation="0">
                  <v-card-subtitle>
                    <h4>Total Paid</h4>
                  </v-card-subtitle>
                  <v-card-actions>
                    <h2>{{ 0 }}</h2>
                  </v-card-actions>
                </v-card>
              </v-col>
              <v-col cols="6" sm="6" md="6">
                <v-card color="#dadada" elevation="0">
                  <v-card-subtitle>
                    <h4>Pending Payments</h4>
                  </v-card-subtitle>
                  <v-card-actions>
                    <h2>{{ 0 }}</h2>
                  </v-card-actions>
                </v-card>
              </v-col>

              <v-col cols="6" sm="6" md="6">
                <v-card color="#dadada" elevation="0">
                  <v-card-subtitle>
                    <h4>Prepaid</h4>
                  </v-card-subtitle>
                  <v-card-actions>
                    <h2 style="color: green">0</h2>
                  </v-card-actions>
                </v-card>
              </v-col>
              <v-col cols="6" sm="6" md="6">
                <v-card color="#dadada" elevation="0">
                  <v-card-subtitle>
                    <h4>Overdue</h4>
                  </v-card-subtitle>
                  <v-card-actions>
                    <h2 style="color: red">0</h2>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
            <div class="container">
              <div class="container">
                <h4>Households Payment Summary</h4>
              </div>
              <paymentSummary :estateId="estateId" />
              <v-simple-table v-show="false">
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">Name</th>
                      <th class="text-left" style="color: red">BAL B/F</th>
                      <th class="text-left">Jan 24</th>
                      <th class="text-left">Feb 24</th>
                      <th class="text-left">March 24</th>
                      <th class="text-left">Apr 24</th>
                      <th class="text-left">May 24</th>
                      <th class="text-left">Jun 24</th>
                      <th class="text-left">Jul 24</th>
                      <th class="text-left">Sep 24</th>
                      <th class="text-left">Oct 24</th>
                      <th class="text-left">Nov 24</th>
                      <th class="text-left">Dec 24</th>
                      <th class="text-left" style="color: blue">Total Paid</th>
                      <th class="text-left" style="color: orange">DUE TO DATE</th>
                      <th class="text-left">
                        <span style="color: red">OVERDUE</span
                        ><span style="margin: 2px">/</span
                        ><span style="color: green">PREPAID</span>
                      </th>
                      <th class="text-left">MONTH EQUIVALENT</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in desserts" :key="item.name">
                      <td>{{ item.name }}</td>
                      <td>{{ item.calories }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </div>
            <div class="container">
              <div class="">
                <v-subheader>Payments Receipts</v-subheader>
                <div class="d-flex">
                  <v-text-field
                    width="200"
                    v-model="pay_search"
                    @change="searchPayments(pay_search)"
                    placeholder="Search for payment"
                    filled
                    rounded
                    clearable
                    dense
                  >
                  </v-text-field>
                  <v-btn icon color="white" @click="searchPayments(pay_search)">
                    <v-icon color="black">mdi-magnify</v-icon>
                  </v-btn>
                  <v-spacer></v-spacer>
                </div>
              </div>
              <div class="container" id="all_items2">
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
                    </template>
                  </v-list-item-group>
                </v-list>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-card>
  </div>
</template>

<script>
import CryptoJS from "crypto-js";
import axios from "axios";
import dayjs from "@nuxtjs/dayjs";
import moment from "moment";
import Map from "@/components/mapEstate.vue";
import paymentSummary from "@/components/paymentSummary.vue";

export default {
  computed: {
    estateId() {
      return parseInt(this.$route.params.id);
    },
  },
  components: {
    Map,
    paymentSummary,
  },
  data() {
    return {
      totalHousehold: 0,
      desserts: [
        {
          name: "James Makau",
          calories: 159,
        },
        {
          name: "Alice wahome",
          calories: 237,
        },
        {
          name: "John gitau",
          calories: 262,
        },
      ],
      snackbar_s: false,
      snackbarText_s: "",
      snackbar: false,
      snackbar2: false,
      snackbarText: "",
      snackbarText2: "",
      title: "",
      body: "",
      description: "",
      image: null,
      likes: 0,
      estates: [],
      estate_image: "",
      estate_name: "",
      estate_streetName: "",
      location: "",
      logo_url: "",
      estateURN: "",
      logo_url: "",
      household_search: "",
      search_estates: [],
      payments: [],
      houseHolds: [],
    };
  },
  methods: {
    async Fetch_PostAllEstates() {
      let that = this;
      axios
        .get(`https://web-production-27f796.up.railway.app/api/estates/estate/${that.$route.params.id}`, {})
        .then(function (response) {
          if (response.status == 200) {
            // that.snackbar = true;
            // that.snackbarText = response.data;

            that.estate_name = response.data.estate_name;
            that.estate_streetName = response.data.estate_streetName;
            that.location = response.data.location;
            that.estateURN = response.data.estateURN;
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
    async Fetch_AllPayments() {
      let that = this;
      axios
        .get(
          `https://web-production-27f796.up.railway.app/api/payments/getByEstateId/${that.$route.params.id}`,
          {}
        )
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

    async Fetch_EstateOfficials() {
      let that = this;
      that.houseHolds.splice(that.houseHolds);
      axios
        .get(
          `https://web-production-27f796.up.railway.app/api/households/getBHsHldEstId/${that.$route.params.id}`,
          {}
        )
        .then(function (response) {
          if (response.status == 200) {
            // that.snackbar = true;
            // that.snackbarText = response.data;
            that.houseHolds = response.data;
            that.totalHousehold = response.data.length;
            console.log("Households", that.totalHousehold);
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
  created() {
    this.Fetch_EstateOfficials();
    this.Fetch_AllPayments();
    this.Fetch_PostAllEstates();
  },
  mounted() {},
};
</script>

<style>
#all_items2 {
  --scrollbarBG: #00000000;
  --thumbBG: #2f2c2c00;
  scrollbar-width: thin;
  scrollbar-color: var(--thumbBG) var(--scrollbarBG);
  overflow-y: scroll;
  width: 100%;
  align-items: start;
  bottom: 0;
  padding: 3px;
  max-height: 300px;
  justify-content: start;
}

#all_items2::-webkit-scrollbar {
  width: 8px;
}

#all_items2::-webkit-scrollbar-track {
  background: var(--scrollbarBG);
}

#all_items2::-webkit-scrollbar-thumb {
  background-color: var(--thumbBG);
  border-radius: 8px;
  border: 3px solid var(--scrollbarBG);
}
</style>
