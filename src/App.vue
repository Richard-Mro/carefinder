
<template>
  <div id="app">
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
// No need to import components directly here since we are using Vue Router
</script>

<style scoped>
/* Add your styles here */
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
header {
  background: #f5f5f5;
  padding: 10px;
  text-align: center;
}
nav {
  margin: 20px 0;
}
nav a {
  margin: 0 10px;
  text-decoration: none;
  color: #007bff;
}
nav a:hover {
  text-decoration: underline;
}
</style>
