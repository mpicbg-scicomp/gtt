<template>
  <div>
    <slot :response="response" :loading="loading"></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: ['url'],
  data() {
    return {
      response: '',
      loading: true,
    };
  },
  created() {
    fetch(this.url)
      .then(response => response.json())
      .then((response) => {
        setTimeout(() => {
          this.response = JSON.stringify(response);
          this.loading = false;
        }, 10);
      });
  },
});
</script>
