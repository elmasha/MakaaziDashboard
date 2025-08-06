<template>
  <div>
    <BarChart :chart-data="datacollection" :options="chartOptions" />
  </div>
</template>

<script>
import { Bar } from 'vue-chartjs'

export default {
  name: 'HouseholdBarChart',
  components: {
    BarChart: Bar
  },
  props: {
    payments: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    datacollection() {
      return {
        labels: this.payments.map(p => p.month),
        datasets: [
          {
            label: 'Household Payments (KES)',
            backgroundColor: '#42b883',
            borderColor: '#2c3e50',
            borderWidth: 1,
            data: this.payments.map(p => p.amount)
          }
        ]
      }
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        }
      }
    }
  }
}
</script>
