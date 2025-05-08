<template>
  <div class="container">
    <div>
      <h2>Visitors</h2>
      <p>Provide all the required fields</p>
    </div>
    <v-form>
      <v-container>
        <v-row>
          <v-col cols="12" md="6">
            <div class="d-flex">
              <v-text-field
                v-model="name"
                label="Search households"
                @change="searchHouseHolds(name)"
                required
              ></v-text-field>
              <v-btn icon>
                <v-icon color="green">mdi-magnify</v-icon>
              </v-btn>
            </div>
            <div class="container">
              <strong>{{ estateURN }}</strong>
            </div>
            <div class="container" id="all_items">
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

          <v-col cols="12" md="6">
            <v-text-field
              v-model="visitorName"
              label="Visitor name"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="ID" label="National id" required></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="phone"
              label="Phone number"
              required
              type="number"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="timeIn"
              label="Time in"
              required
              type="time"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="timeOut"
              label="Time out"
              required
              type="time"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="reasonForVisit"
              :items="reason"
              chips
              label="Your reason for visiting.."
              solo
            ></v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="6">
            <v-btn
              width="100%"
              color="black"
              class="text--white"
              style="color: white"
              @click="SendNotification"
              >Submit</v-btn
            >
          </v-col>
        </v-row>
      </v-container>
    </v-form>
    <v-snackbar color="success" :timeout="2000" v-model="snackbar" outlined center>
      {{ snackbarText }}
    </v-snackbar>
    <v-snackbar color="error" :timeout="2500" v-model="snackbar2" outlined center>
      {{ snackbarText2 }}
    </v-snackbar>
  </div>
</template>
<script>
import CryptoJS from "crypto-js";
import axios from "axios";
import dayjs from "@nuxtjs/dayjs";
import moment from "moment";
export default {
  data() {
    return {
      reason: ["Visitor", "Delivery"],
      deviceToken: null,
      reasonForVisit: null,
      search_house: "",
      houseNo: null,
      name: null,
      visitorName: null,
      ID: null,
      phone: null,
      timeIn: null,
      timeOut: null,
      signature: null,
      houseHolds: [],
      snackbar: false,
      snackbar2: false,
      snackbarText: "",
      snackbarText2: "",
      householdOwner: "",
      title: "",
      message: "",
    };
  },

  methods: {
    async SendNotification() {
      let that = this;
      axios
        .post(`https://makaazi-85b0afbcae5d.herokuapp.com/api/fcm/sendNotification`, {
          fcmToken: that.deviceToken,
          title: "Visitor at Your Estate",
          body: `Hello ${that.householdOwner} A visitor ${that.visitorName}  has arrived  at ${that.timeIn}\n ​Purpose of Visit: ${that.reasonForVisit}​`,
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
    async getToken(val) {
      let that = this;
      axios
        .get(`https://makaazi-85b0afbcae5d.herokuapp.com/api/fcm/get-token/${val}`, {})
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
    UploadVisitor() {
      let that = this;
      if (that.estateName == null) {
        that.snackbarText2 = "Provide estate name..";
        that.snackbar2 = true;
      } else if (that.location == null) {
        that.snackbarText2 = "Provide location.";
        that.snackbar2 = true;
      } else if (that.estateStreetName == null) {
        that.snackbarText2 = "Provide street name.";
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
          .post("https://makaazi-85b0afbcae5d.herokuapp.com/api/estates/create", {
            estate_name: that.estateName,
            estateURN: that.estateURN,
            location: that.location,
            estate_sections: Number(that.estateSections),
            estate_courts: Number(that.estateCourts),
            estate_streets: Number(that.estateStreet),
            estate_streetName: that.estateStreetName,
            estate_charges: that.serviceCharges,
            estate_welfare: that.estateWelfareModel,
            estate_welfareAmount: that.estateWelfareAmount,
            service_charges: that.serviceChargesAmount,
            estate_lat: that.estateLat,
            estate_lng: that.estateLng,
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

              that.SendNotification();
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
    searchHouseHolds(val) {
      if (val == "") {
      } else {
        let that = this;
        that.houseHolds.splice(that.houseHolds);
        axios
          .get(
            `https://makaazi-85b0afbcae5d.herokuapp.com/api/households/search/?query=${val}`,
            {}
          )
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
  },
};
</script>
<style></style>
