<template>
   <div v-show="isActive"><slot></slot></div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    name: { type: String, required: true },
    selected: { default: false },
  },
  data() {
    return { isActive: false };
  },
  computed: {
    href(): string {
      return `#${this.name.toLowerCase().replace(/ /g, '-')}`;
    },
  },
  mounted() {
    this.isActive = this.selected;
  },
});
</script>
