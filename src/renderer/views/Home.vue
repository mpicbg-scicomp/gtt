<template>
  <div class="min-h-screen flex-col p-8 text-black bg-white">
    <drop-down/>
    <h1 class="font-bold text-6l leading-none mb-8">Gitlab Time Tracker v{{version}}</h1>
    <form class="w-full max-w-md" v-on:submit.prevent="refresh">
      <div class="flex flex-wrap -mx-3 row mb-3">
        <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label class="w-1/5 col-form-label uppercase tracking-wide text-grey-darker text-xs font-bold mb-2">Project</label>
          <div class="w-1/5 input-div">
            <input class="mx-input" v-model="project"/>
          </div>
        </div>
        <div class="w-full md:w-1/2 px-3">
          <label class="w-1/5 col-form-label uppercase tracking-wide text-grey-darker text-xs font-bold mb-2">User</label>
          <div class="w-1/5 input-div">
            <input class="mx-input" v-model="user">
          </div>
        </div>
      </div>
      <div class="flex flex-wrap -mx-3 row mb-3">
        <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label class="w-1/5 col-form-label uppercase tracking-wide text-grey-darker text-xs font-bold mb-2">Date</label>
          <date-picker class="w-1/5" v-model="dateRange" range type="date" lang="en" :shortcuts="shortcuts" format="YYYY-MM-DD"></date-picker>
        </div>
        <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label class="w-1/5 col-form-label uppercase tracking-wide text-grey-darker text-xs font-bold mb-2">Labels</label>
          <div class="w-3/5 input-div">
          <fetch-labels :token="token">
            <template slot-scope="{ response, loading }">
              <div class="text-3l text-black leading-none mb-2" v-if="loading">Loading...</div>
              <div v-else>
                <tags-input v-model="labelTags" :autocomplete-items="response"/>
              </div>
            </template>
          </fetch-labels>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap -mx-3 row mb-3">
        <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <div class="w-1/5 mt-5">
            <button class="flex-no-shrink bg-teal hover:bg-teal-dark disabled:bg-dark border-teal hover:border-teal-dark text-sm border-4 text-white py-1 px-2 rounded" :disabled="running" type="submit">Refresh</button>          
          </div>
        </div>
        <div class="w-full md:w-1/2 px-3 mb-6">
        </div>
      </div>
    </form>

  <gtt-tabs ref="gttTabs" :user="user" :project="project" :token="token" :dateRange="dateRange" :tags="labelTags" :running.sync="running">
    </gtt-tabs>
    
    <!-- <links></links> -->
  </div>
</template>

<script>
import GttTabs from '@/components/GttTabs.vue';
import DatePicker from 'vue2-datepicker';
import FetchLabels from '@/components/FetchLabels.vue';
import TagsInput from '@/components/TagsInput.vue';
import DropDown from '@/components/Dropdown.vue';

const today = new Date();
const currentYear = today.getFullYear();
const previousYear = currentYear - 1;
const thisMonth = today.getMonth();
const thisDay = today.getDate();

export default {
  name: 'home',
  components: {
    GttTabs, DatePicker, FetchLabels, TagsInput, DropDown,
  },
  data() {
    return {
      version: '',
      user: '',
      project: '',
      token: '',
      dateRange: '',
      data: '',
      labelTag: '',
      running: false,
      labelTags: [],
      shortcuts: [
        {
          // eslint-disable-next-line
          text: previousYear + '\' 1/4 Q',
          onClick(self) {
            self.currentValue = [new Date(previousYear, 0, 1), new Date(previousYear, 2, 31)];
            self.updateDate(true);
          },
        },
        {
          // eslint-disable-next-line
          text: previousYear + '\' 2/4 Q',
          onClick(self) {
            self.currentValue = [new Date(previousYear, 3, 1), new Date(previousYear, 5, 30)];
            self.updateDate(true);
          },
        },
        {
          // eslint-disable-next-line
          text: previousYear + '\' 3/4 Q',
          onClick(self) {
            self.currentValue = [new Date(previousYear, 6, 1), new Date(previousYear, 8, 30)];
            self.updateDate(true);
          },
        },
        {
          // eslint-disable-next-line
          text: previousYear + '\' 4/4 Q',
          onClick(self) {
            self.currentValue = [new Date(previousYear, 9, 1), new Date(previousYear, 11, 31)];
            self.updateDate(true);
          },
        },
        {
          // eslint-disable-next-line
          text: currentYear + '\' 1/4 Q',
          onClick(self) {
            self.currentValue = [new Date(currentYear, 0, 1), new Date(currentYear, 2, 31)];
            self.updateDate(true);
          },
        },
        {
          // eslint-disable-next-line
          text: currentYear + '\' 2/4 Q',
          onClick(self) {
            self.currentValue = [new Date(currentYear, 3, 1), new Date(currentYear, 5, 30)];
            self.updateDate(true);
          },
        },
        {
          // eslint-disable-next-line
          text: currentYear + '\' 3/4 Q',
          onClick(self) {
            self.currentValue = [new Date(currentYear, 6, 1), new Date(currentYear, 8, 30)];
            self.updateDate(true);
          },
        },
        {
          // eslint-disable-next-line
          text: currentYear + '\' 4/4 Q',
          onClick(self) {
            self.currentValue = [new Date(currentYear, 9, 1), new Date(currentYear, 11, 31)];
            self.updateDate(true);
          },
        },
        {
          // eslint-disable-next-line
          text: 'Today',
          onClick(self) {
            self.currentValue = [new Date(currentYear, thisMonth, thisDay + 1), new Date(currentYear, thisMonth, thisDay + 2)];
            self.updateDate(true);
          },
        },
      ],
    };
  },
  computed: {
  },
  methods: {
    refresh() {
      this.$refs.gttTabs.refresh();
    },
  },
  watch: {
    project(newProject) {
      localStorage.project = newProject;
    },
    user(newUser) {
      localStorage.user = newUser;
    },
  },
  created() {
    this.version = this.$electron.remote.app.getVersion();

    if (localStorage.apiKey) {
      this.token = localStorage.apiKey;
    }

    if (localStorage.project) {
      this.project = localStorage.project;
    }

    if (localStorage.user) {
      this.user = localStorage.user;
    }
    // eslint-disable-next-line
    this.dateRange = [new Date(Date.now() - 3600 * 1000 * 24 * 30), new Date()];
  },
  mounted() {
    // this.refresh();
  },
};
</script>

<style scoped>
.input-div {
  position: relative;
  display: inline-block;
  width: 320px;
}

button:disabled {
  @apply text-white opacity-50 cursor-not-allowed
}
</style>
