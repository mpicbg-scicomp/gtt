<template>
   <div>
      <div class="tabs is-boxed">
        <ul>
          <li v-for="tab in tabs" :key="tab.name" :class="{ 'is-active': tab.isActive }">
            <a :href="tab.href" @click="selectTab(tab)">{{ tab.name }}</a>
          </li>
        </ul>
      </div>

      <div class="tabs-details">
        <slot></slot>
      </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  data() {
    return { tabs: [{}] };
  },
  created() {
    this.tabs = this.$children;
  },
  methods: {
    selectTab(selectedTab) {
      this.tabs.forEach((tab) => {
        const x = tab as {name, isActive};
        x.isActive = (x.name === selectedTab.name);
      });
    },
  },
});
</script>

<style>

tabs-details {
    width: 100%;
    height: 100%;
}

</style>