<template>
  <div>
    <slot :response="response" :loading="loading"></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

// require modules
const _ = require('lodash');

// For the preference
const Store = require('electron-store');
const store = new Store();

export default Vue.extend({
  props: ['project', 'token'],
  data() {
    return {
      response: null,
      loading: true,
    };
  },
  watch: {
    token: function changed() {
      this.loading = true;
      this.getLabels();
    },
    project: function changed() {
      this.loading = true;
      this.getLabels();
    },
  },
  methods: {
    getUrl() {
      if (store.has('pref')) {
        return store.get('pref').gitlabLabelUrl;
      }
      return 'https://git.mpi-cbg.de/api/v4/projects/577/labels';
    },
    getLabels() {
      const vm = this;
      const url = `${vm.getUrl()}?private_token=${this.token}`;

      if (this.token && !_.isEmpty(this.token)) {
        fetch(url)
          .then(response => response.json())
          .then((response) => {
            // console.log(response);
            setTimeout(() => {
              // console.log(response.web_url);
              /* eslint-disable */
              this.loading = false;

              // console.log(response);
              if (response && !_.isEmpty(response)) {
                this.response = _.flatMap(response, (n) => [{ text: n.name, style: 'background-color: ' + n.color }]);
              }
            }, 10);
          });
      }
    },
  },
  created() {
    this.getLabels();
  },
});
</script>
