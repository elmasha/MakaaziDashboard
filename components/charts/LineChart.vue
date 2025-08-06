<template>
  <div>
    <line-chart :chart-data="datacollection" :options="chartOptions" />
  </div>
</template>

<script>
import { Line } from 'vue-chartjs'

export default {
  name: 'LineChart',
  components: {
    LineChart: Line
  },
  props: {
    datacollection: {
      type: Object,
      required: true
    },
    chartOptions: {
      type: Object,
      default: () => ({ responsive: true, maintainAspectRatio: false })
    }
  }
}
</script>
