<template>
  <v-app dark>

      <v-main>
        <Nuxt />
      </v-main>

  </v-app>
</template>

<script>
import { uuid } from "vue-uuid";
export default {
  name: "DefaultLayout",
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: "mdi-apps",
          title: "Welcome",
          to: "/",
        },
        {
          icon: "mdi-chart-bubble",
          title: "Inspire",
          to: "/inspire",
        },
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: "Charge24 Mpesa",
    };
  },
};
</script>
<style>
* {
  font-family: "Lato";
}

body {
  align-items: center;
  min-height: 100vh;
  background: #000;
}
.section {
  position: absolute;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2px;
  flex-wrap: wrap;
  overflow: hidden;
}
.section::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(#000, #0f0, #000);
  animation: animate 5s linear infinite;
}
@keyframes animate {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}
.section span {
  position: relative;
  display: block;
  width: calc(6.25vw - 2px);
  height: calc(6.25vw - 2px);
  background: #181818;
  z-index: 2;
  transition: 1.5s;
}
.section span:hover {
  background: #0f0;
  transition: 0s;
}

.section .signin {
  position: absolute;
  width: 80%;
  background: #222;
  z-index: 1000;
  justify-content: center;
  align-items: center;
  padding: 0px;
  border-radius: 4px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 9);
}

/* @media (max-width: 100%) {
  .section span {
    width: calc(10vw - 2px);
    height: calc(10vw - 2px);
  }
}
@media (max-width: 600px) {
  .section span {
    width: calc(20vw - 2px);
    height: calc(20vw - 2px);
  }
} */
</style>
