<template>
  <div class="min-h-screen flex flex-col justify-between">
    <links></links>
    <div>
      <slot></slot>
    </div>
    <links></links>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Links from '@/components/Links.vue';

export default Vue.extend({
  components: {
    Links,
  },
});
</script>
