<template>
  <div class="min-h-screen flex-col p-8 text-black bg-white">
    <drop-down/>
    <h1 class="font-bold text-6l leading-none mb-8">Preferences</h1>
    <div id="content" >
      <button class="flex-no-shrink bg-teal hover:bg-teal-dark disabled:bg-dark border-teal hover:border-teal-dark text-sm border-4 text-white py-1 px-2 rounded" v-on:click.prevent="load">Load</button>
      <button class="flex-no-shrink bg-teal hover:bg-teal-dark disabled:bg-dark border-teal hover:border-teal-dark text-sm border-4 text-white py-1 px-2 rounded" v-on:click.prevent="save">Save</button>
      <hr/>
      <form>
      <div class="form-group">
        <label for="gitlab-url">Gitlab URL:</label>
        <input class="form-control" id="gitlab-url" type="text" v-model="gitlabUrl"/>
        <small id="gitlabUrlHelp" class="form-text text-muted">Enter the gitlab URL. (e.g. https://git.mpi-cbg.de/api/v4)</small>
      </div>
      <div class="form-group">
        <label for="gitlab-token">Gitlab Token:</label>
        <input class="form-control" id="gitlab-token" type="text" v-model="gitlabToken"/>
        <small id="gitlabUrlHelp" class="form-text text-muted">Enter the gitlab token.</small>
      </div>
      <div class="form-group">
        <label for="gitlab-label-url">Gitlab Label URL:</label>
        <input class="form-control" id="gitlab-label-url" type="text" v-model="gitlabLabelUrl"/>
        <small id="gitlabLabelUrlHelp" class="form-text text-muted">Please, pickup the project url for getting the tags.  (e.g. https://git.mpi-cbg.de/api/v4/projects/577/labels)</small>
      </div>
      <div class="form-group">
        <label for="user-groups">User Groups:</label>
        <textarea class="form-control" id="user-groups" rows="10" cols="50" v-model="userGroups">
        </textarea>
        <small id="userRolesHelp" class="form-text text-muted">Please, add your members in 'userID': 'Team name' format.</small>
      </div>

      <div class="form-group">
        <label for="tag-colors">Tag Colors:</label>
        <textarea class="form-control" id="tag-colors" rows="10" cols="50" v-model="tagColors">
        </textarea>
        <small id="formControlHelp" class="form-text text-muted">Please, add your tags in 'tag': 'class' format.</small>
      </div>

      </form>
    </div>
  </div>
</template>

<script>
import DropDown from '@/components/Dropdown.vue';

const Store = require('electron-store');
const store = new Store();

export default {
  name: 'preference',
  components: {
    DropDown,
  },
  data() {
    return {
      gitlabUrl: '',
      gitlabToken: '',
      gitlabLabelUrl: '',
      userGroups: '',
      tagColors: '',
    };
  },
  methods: {
    load() {
      const vm = this;

      const pref = store.get('pref');
      vm.gitlabUrl = pref.gitlabUrl;
      vm.gitlabToken = pref.gitlabToken;
      vm.gitlabLabelUrl = pref.gitlabLabelUrl;
      vm.userGroups = pref.userGroups;
      vm.tagColors = pref.tagColors;

      localStorage.apiKey = vm.gitlabToken;
    },
    save() {
      const vm = this;

      // Reading the file
      const pref = {
        gitlabUrl: vm.gitlabUrl, gitlabToken: vm.gitlabToken, gitlabLabelUrl: vm.gitlabLabelUrl, userGroups: vm.userGroups, tagColors: vm.tagColors,
      };
      store.set('pref', pref);

      localStorage.apiKey = vm.gitlabToken;
    },
  },
  mounted() {
    const vm = this;

    if (store.has('pref')) {
      // Loading the information from the store
      vm.load();
    } else {
      // Setup the default values
      vm.gitlabUrl = 'https://git.mpi-cbg.de/api/v4';
      vm.gitlabLabelUrl = 'https://git.mpi-cbg.de/api/v4/projects/577/labels';
      vm.gitlabToken = localStorage.apiKey;
      vm.userGroups = `{
  "userA": "A Team",
  "userB": "A Team"
}`;
      vm.tagColors = `{
  "bug": "danger",
  "confirmed": "danger",
  "critical": "danger",
  "discussion": "primary",
  "documentation": "warning",
  "enhancement": "success",
  "suggestion": "primary",
  "support": "warning",
  "Open": "info",
  "Close": "dark"
}`;
    }
  },
};
</script>

<style scoped>

</style>