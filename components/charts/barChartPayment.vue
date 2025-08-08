<template>
  <div>
    <div>
      <div class="d-flex">
        <v-btn icon @click="prepareChartData"> 
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
      <bar-chart
        class="chart-container"
        :chart-data="chartData"
        :options="chartOptions"
        ref="barChart"
      ></bar-chart>
    </div>
  </div>
</template>

<script>
import { Bar } from "vue-chartjs";
import { Line } from "vue-chartjs";
import axios from "axios";

export default {
  name: "UserInteractionsChart",
  props: {
    estateId: {
      type: Number,
      required: true,
    },
  },
  components: {
    BarChart: {
      extends: Line,
      props: ["chartData", "options"],
      mounted() {
        this.renderChart(this.chartData, this.options);
      },
    },
  },
  data() {
    return {
      user_total: 10000,
      ex3: { label: "Users prediction", val: 10000 + "views", color: "green" },
      totalViews: 0,
      plays: 864,
      user: 10000,
      selectedDayType: "good",
      selectedDate: "2023-08-01", // Default date
      goodDayInteractions: 18000,
      badDayInteractions: 10000,
      userInteractions: [
        { date: "Jan", interactions: 180 },
        { date: "Feb", interactions: 390 },
        { date: "Mar", interactions: 200 },
        { date: "Apr", interactions: 800 },
        { date: "May", interactions: 650 },
        { date: "Jun", interactions: 1450 },
        // Add more data points for each day in June
        { date: "Jul", interactions: 950 },
         { date: "Aug", interactions: 200 },
        { date: "Sep", interactions: 800 },
        { date: "Oct", interactions: 650 },
        { date: "Nov", interactions: 1450 },
        // Add more data points for each day in June
        { date: "Dec", interactions: 950 },
      ],
      chartData: {
      labels: [],
      datasets: [
        {
          label: 'Monthy Payments trends',
          backgroundColor: '#b7ff0086',
          data: []
        }
      ]
    },
    chartOptions: {
      responsive: true,
      maintainAspectRatio: false
    },
      messageBad: "",
      messageGood: "",
      messageState: false,
      data:null,
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
      months2: [
        
      ],
    };
  },
  mounted() {
    this.calculateTotalViews2();
  },
  created() {
    this.prepareChartData();

  },
  methods: {
    async prepareChartData() {
      let that = this;
       await axios.get(`https://web-production-27f796.up.railway.app/api/charts/monthly-estate-summary/?estate_id=`+that.estateId+`&year=`+2025,{})
                .then(function (response) {
                    if (response.status == 200) {
                        // that.snackbar = true;
                        // that.snackbarText = response.data;
                       that.data = response.data;
                       console.log("Total per month",response.data[0].january)

                       that.months2 = [`${response.data[0].january}`,`${response.data[0].february}`,`${response.data[0].march}`,`${response.data[0].april}`,`${response.data[0].may}`,
                       `${response.data[0].june}`,`${response.data[0].july}`,`${response.data[0].august}`,
                       `${response.data[0].september}`,`${response.data[0].october}`,`${response.data[0].november}`,`${response.data[0].december}`]
          
                       
                         that.chartData.labels = that.months;
      that.chartData.datasets[0].data = that.months2;
      that.$refs.barChart.renderChart(that.chartData, that.chartOptions);
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
      
  // this.chartData.labels = this.userInteractions.map((item) => item.month);
  // this.chartData.datasets[0].data = this.userInteractions.map((item) => item.total_registrations);

 

    },
    changeTotal(val) {
      this.user_total = Intl.NumberFormat().format(val);
      return;
    },
    calculateAverageViews() {
      return this.totalViews / this.users;
    },
    calculateTotalViews(val) {
      if (val < 7000) {
        this.messageBad = "Bad days";
        this.messageState = false;
      } else if (val > 7000) {
        this.messageGood = "Good days";
        this.messageState = true;
      }
      this.totalViews = this.plays * val;
      return this.totalViews;
    },
    calculateTotalViews2() {
      this.totalViews = this.plays * 10000;
      return this.totalViews;
    },
    selectDayType(dayType) {
      this.selectedDayType = dayType;
      this.updateChartData();
    },
    selectDate(date) {
      this.selectedDate = date;
      this.updateChartData();
    },
    updateChartData() {
      const interactions =
        this.selectedDayType === "good"
          ? this.goodDayInteractions
          : this.badDayInteractions;
      this.chartData.datasets[0].data = [interactions];
      this.$refs.barChart.renderChart(this.chartData, this.chartOptions);
    },
  },
};
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  /* color: #b6ff00; */
}
</style>