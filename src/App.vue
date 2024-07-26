<script setup lang="ts">
import signUp from './components/signUp.vue'
import HospitalSearch from './components/HospitalSearch.vue'
</script>

<template>
  <header>
    <div class="wrapper">
      <signUp></signUp>
      <h1>CareFinder</h1>
      <HospitalSearch></HospitalSearch>
    </div>
  </header>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
