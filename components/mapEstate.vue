<template>
  <div class="">
    <div class="">
      <div>
        <table v-show="add_routes" class="secondary--text">
          <tr>
            <th>Start</th>
            <th>
              <GmapAutocomplete @place_changed="setPlace" />
            </th>
            <th style="width: 50%">
              <button class="btn" @click="addMarker(0)">Add</button>
            </th>
          </tr>
          <tr>
            <th>End</th>
            <th>
              <GmapAutocomplete @place_changed="setPlace" />
            </th>
            <th style="width: 50%">
              <button class="btn" @click="addMarker(1)">Add</button>
            </th>
          </tr>
        </table>
      </div>

      <gmap-map
        :zoom="8"
        :options="options"
        :center="center"
        style="width: 100%; height: 300px; padding: 6px"
      >
      </gmap-map>
    </div>
  </div>
</template>

<script>
import { marker } from "leaflet";
import DirectionsRenderer from "/plugins/directionsRenderer.js";
import GmapCustomMarker from "vue2-gmap-custom-marker";

export default {
  components: {
    DirectionsRenderer,
    "gmap-custom-marker": GmapCustomMarker,
  },

  props: {
    routes: {
      type: Boolean,
    },
  },

  name: "map",
  data() {
    return {
      add_routes: false,
      farmCard: false,
      currentPlace: null,
      county: "",
      country: "",
      farmName: "",
      farmCategory: "",
      farmDescription: "",
      image: "",
      rating: 0,
      id: "",
      markers: [],
      images: [],
      userName: "",
      userImage: "",
      ads: [],
      reviews: [],
      options: {
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: true,
        fullscreenControl: true,
        disableDefaultUi: true,
        clickable: true,
        mapId: "5986e5adf7bceaab",
      },

      startLocation: {
        lat: 10.3157,
        lng: 123.8854,
      },
      coordinates: {
        0: {
          full_name: "Erich  Kunze",
          lat: "10.31",
          lng: "123.89",
        },
        1: {
          full_name: "Delmer Olson",
          lat: "10.32",
          lng: "123.89",
        },
      },
      infoPosition: null,
      infoContent: null,
      infoOpened: false,
      infoCurrentKey: null,
      infoOptions: {
        pixelOffset: {
          width: 0,
          height: -35,
        },
      },
      center: {
        lat: 0,
        lng: 0,
      },
      center2: [],
      dest: {
        lat: 0,
        lng: 0,
      },
      locationMarkers: [],
      locPlaces: [],
      existingPlace: null,
      locations: [],
      reviewsCount: 0,
      startLocation: 0,
      endLocation: 0,
    };
  },
  mounted() {
    this.locateGeoLocation();
    // this.FetchFarmsAround();
    ///this.CheckUser();
  },

  afterCreate(map) {
    this.$watch(
      () => [this.routes],
      () => {
        let { routes } = this;
        if (!routes) return;
      }
    );
  },

  methods: {
    CheckUser() {
      if (this.$fire.auth.currentUser != null) {
        if (this.$fire.auth.currentUser.uid != null) {
          console.log("User  logged in");
          this.FetchUser();
        } else {
          console.log("User no logged in");
        }
      } else {
        console.log("User no logged in");
      }
    },
    getPosition: function (marker) {
      return {
        lat: parseFloat(marker.lat),
        lng: parseFloat(marker.lng),
      };
    },
    toggleInfo: function (marker, key) {
      this.infoPosition = this.getPosition(marker);
      console.log("Marker___", this.infoContent);
      this.infoContent = marker.full_name;
      if (this.infoCurrentKey == key) {
        this.infoOpened = !this.infoOpened;
      } else {
        this.infoOpened = true;
        this.infoCurrentKey = key;
      }
    },
    showValueMap(val) {
      console.log("Marker", val);
    },
    setPlace(place) {
      this.currentPlace = place;
    },
    addMarker(index) {
      const marker = {
        lat: this.currentPlace.geometry.location.lat(),
        lng: this.currentPlace.geometry.location.lng(),
      };
      if (index === 0) this.startLocation = marker;
      if (index === 1) this.endLocation = marker;
      this.center = marker;
      console.log(this.startLocation, this.endLocation);
    },
    showImage(val) {
      if (val === null) {
        return this.user;
      } else {
        return val;
      }
    },
    FetchFarmsImages(val) {
      const db = this.$fire.firestore;
      this.images.splice(this.images);
      db.collection("i1-2Farm_Farms")
        .doc(val)
        .collection("Farm_Images")
        .limit(12)
        .get()
        .then((queryResult) => {
          queryResult.forEach((doc) => {
            console.log("Farms details", doc.data());
            const data = {
              image: doc.data().image,
            };
            this.images.push(data);
          });
        });
    },
    FetchFarmsReviews(val) {
      const db = this.$fire.firestore;
      this.images.splice(this.images);
      db.collection("i1-2Farm_Farms")
        .doc(val)
        .collection("Reviews")
        .limit(12)
        .get()
        .then((queryResult) => {
          queryResult.forEach((doc) => {
            this.reviewsCount = queryResult.size;
            console.log("R count", this.reviewsCount);
            const data = {
              image: doc.data().image,
            };
            this.images.push(data);
          });
        });
    },
    FetchFarms(val) {
      const db = this.$fire.firestore;
      db.collection("i1-2Farm_Farms")
        .where("user_id", "==", val)
        .get()
        .then((queryResult) => {
          queryResult.forEach((doc) => {
            console.log("Farms details", doc.data());

            this.farmCard = true;
            this.farmName = doc.data().farmName;
            this.image = doc.data().image;
            this.county = doc.data().County;
            this.country = doc.data().Country;
            this.rating = doc.data().rating;
            this.farmCategory = doc.data().farmCategory;
            this.farmDescription = doc.data().farmDescription;
          });
        });
    },
    FetchUser() {
      const db = this.$fire.firestore;
      var docRef = db.collection("skoolBas_User").doc(this.$fire.auth.currentUser.uid);
      docRef
        .get()
        .then((doc) => {
          if (doc.exists) {
          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
        })
        .catch((error) => {
          console.log("Error getting document:", error);
        });
    },
    loadId(val) {
      console.log("FARM ID", val);
    },
    FetchFarmsAround() {
      const db = this.$fire.firestore;
      this.farms_around.splice(this.farms_around);
      this.locations.splice(this.locations);
      db.collection("skoolBas_User")
        .where("category", "==", "Parents")
        .limit(10)
        .get()
        .then((queryResult) => {
          queryResult.forEach((doc) => {
            const data = {
              id: doc.id,
              farm: doc.data().Student_name,
              lat: doc.data().lat,
              lng: doc.data().lng,
            };

            this.locations.push(data);
            this.farms_around.push(data);
          });
        });
    },
    initMarker(loc) {
      this.existingPlace = loc;
      console.log(this.existingPlace);
    },
    addLocationMarker() {
      if (this.existingPlace) {
        const marker = {
          lat: this.existingPlace.geometry.location.lat(),
          lng: this.existingPlace.geometry.location.lng(),
        };
        this.locationMarkers.push({
          position: marker,
        });
        this.locPlaces.push(this.existingPlace);
        this.center = marker;
        this.existingPlace = null;
        console.log(this.locPlaces);
      }
    },
    locateGeoLocation: function () {
      navigator.geolocation.getCurrentPosition((res) => {
        this.center = {
          lat: res.coords.latitude,
          lng: res.coords.longitude,
        };
      });
    },
  },
};
</script>
