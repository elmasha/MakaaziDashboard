<template>
  <v-container fluid>
    <v-card elevation="0">
      <v-toolbar flat color="white">
        <v-toolbar-title>Estate Payments Summary</v-toolbar-title>
        <v-spacer />
        <v-btn icon @click="refresh">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-toolbar>

      <v-data-table
        :headers="headers"
        :items="paymentData"
        :items-per-page="10"
        class="elevation-0"
      >
        <!-- index column -->
        <template #item.index="{ item }">
          {{ item.index }}
        </template>

        <!-- overdue cell -->
        <template #item.overdue="{ item }">
          <span
            :class="{ 'red--text': item.overdue < 0, 'green--text': item.overdue >= 0 }"
          >
            {{  numeral(formatCurrency(item.overdue)).format('0,0.0')  }}
          </span>
        </template>

         <template #item.total_paid="{ item }">
          <span
            :class="{'blue--text': item.total_paid >= 0 }"
          >
            {{ numeral(formatCurrency(item.total_paid)).format('0,0.0') }}
          </span>
        </template>

        <!-- any month cell could use the default -->
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";
import numeral from "numeral";

export default {
  props: {
    estateId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      numeral,
      months: [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ],
      headers: [
        {
          text: "#",
          value: "index",
          width: 50,
        },
        {
          text: "Name",
          value: "name",
          width: 200,
        },
        {
          text: "B/F",
          value: "balance_bf",
          align: "right",
        },

        
        {
          text: "january",
          value: "january",
          align: "right",
        },
        {
          text: "february",
          value: "february",
          align: "right",
        },
        {
          text: "march",
          value: "march",
          align: "right",
        },
        {
          text: "april",
          value: "april",
          align: "right",
        },
        {
          text: "may",
          value: "may",
          align: "right",
        },
        {
          text: "june",
          value: "june",
          align: "right",
        },
        {
          text: "july",
          value: "july",
          align: "right",
        },
        {
          text: "august",
          value: "august",
          align: "right",
        },
        {
          text: "september",
          value: "september",
          align: "right",
        },

        {
          text: "october",
          value: "october",
          align: "right",
        },
        {
          text: "november",
          value: "november",
          align: "right",
        },
        {
          text: "december",
          value: "december",
          align: "right",
        },
        {
          text: "Total Paid",
          value: "total_paid",
          align: "right",
        },
        {
          text: "Due YTD",
          value: "due_year_to_date",
          align: "right",
        },
        {
          text: "Overdue/Prepaid",
          value: "overdue",
          align: "right",
        },
        {
          text: "Months Eq.",
          value: "months_equivalent",
          align: "right",
        },
      ],
      paymentData: [],
    };
  },
  created() {},
  mounted() {
    this.refresh();
    console.log("Estate ID:", this.estateId);
  },
  methods: {
    sum(field) {
      // return this.paymentData.reduce((sum, r) => sum + (r[field] || 0), 0);
    },
    async refresh() {
      try {
        const response = await axios.get(
          "https://web-production-27f796.up.railway.app/api/household-payments/year-by-estate/" + this.estateId
        );

        if (response.status === 200) {
          // Replace the data, don't push the whole array into another array
          this.paymentData = response.data;
          console.log("Data", this.paymentData);
        }
      } catch (e) {
        console.error(e);
      }
    },

    // async refresh() {
    //   // Make sure your API returns an array of objects like:
    //   // { name, balance_bf, january, february, …, total_paid, due_year_to_date, overdue, months_equivalent }
    //   await axios
    //     .get("http://localhost:5000/api/household-payments/yearly-summary")
    //     .then(function (response) {
    //       if (response.status == 200) {
    //         this.paymentData.push(response.data);
    //         console.log("Data", this.paymentData);
    //       }
    //     })
    //     .catch((e) => {
    //       console.error(e);
    //     });
    //   // add 1-based index
    // },
    formatCurrency(val) {
      return (val || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
      });
    },
  },
};
</script>

<style>
.red--text {
  color: #e53935 !important;
}

.green--text {
  color: #43a047 !important;
}
</style>
