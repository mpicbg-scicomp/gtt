<template>
  <div id="app" class="antialiased leading-tight font-sans min-h-screen">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'gtt',
  };
</script>

<style>
@tailwind preflight;
@tailwind components;
@tailwind utilities;
</style>
