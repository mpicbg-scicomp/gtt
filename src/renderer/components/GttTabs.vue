<template>
    <gtt-command ref="gttCommand" :user="user" :project="project" :token="token" :dateRange="dateRange" :tags="tags" :runningStatus.sync="currentRunning">
      <template slot-scope="{ response, loading, running }">
        <div class="text-3l text-black leading-none mb-2" v-if="loading && !running"></div>
        <div v-else>         
          <div class="text-3l text-black leading-none mb-2" v-if="loading">Loading...</div>
          <div v-else>
            <tabs>
              <tab name="Table" selected="true">
                <data-table id='dataTable' :data='response' :token="token"/>
              </tab>
              <tab name="Charts">
                <gtt-chart msg="Timeline Chart" :data='response' :dateRange="dateRange"/>
              </tab>
            </tabs>
          </div>
        </div>
      </template>
    </gtt-command>
</template>

<script>
import GttCommand from './GttCommand.vue';
import Tabs from './Tabs.vue';
import Tab from './Tab.vue';
import GttChart from './GttChart.vue';
import DataTable from './DataTable.vue';

export default {
  components: {
    GttCommand, Tabs, Tab, GttChart, DataTable,
  },
  props: ['project', 'user', 'token', 'dateRange', 'tags', 'running'],
  data() {
    return { currentRunning: this.running };
  },
  methods: {
    refresh() {
      this.$refs.gttCommand.refresh();
    },
  },
  watch: {
    currentRunning(value) {
      this.$emit('update:running', value);
    },
  },
};
</script>
