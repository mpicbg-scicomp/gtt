<template>
  <div>
    <h3 class="text-center text-2xl font-bold">Time spent in days</h3>
    <div ref="dailyChart" class='chart mb-16'></div>

    <h3 class="text-center text-2xl font-bold">Spent time in projects</h3>
    <div ref="projectChart" class='chart'></div>
    <div id="legenddiv" class='legend'></div>

    <h3 class="text-center text-2xl font-bold">Spent time in labs</h3>
    <div ref="labChart" class='chart'></div>
    <div id="legend-pie-div" class='legend'></div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { parseProjectTags } from './js/Utils';

const am4core = require('@amcharts/amcharts4/core');
const am4charts = require('@amcharts/amcharts4/charts');
const am4themesAnimated = require('@amcharts/amcharts4/themes/animated').default;
// const am4themes_material = require('@amcharts/amcharts4/themes/material').default

// Themes begin
am4core.useTheme(am4themesAnimated);
// am4core.useTheme(am4themes_material);
// Themes end

const _ = require('lodash');
const moment = require('moment');

export default Vue.extend({
  name: 'GttChart',
  props: ['json', 'data', 'dateRange'],
  methods: {
    test() {
      const vm = this;
      // { moon : {date, seconds} }
      // console.log(vm.data);
      const chartData = {};

      vm.data.forEach((element) => {
        element.details.forEach((time) => {
          const id = time.user;
          const dateString = time.date;
          if (!(id in chartData)) chartData[id] = {};

          if (dateString in chartData[id]) chartData[id][dateString] += time.seconds;
          else chartData[id][dateString] = time.seconds;
        });
      });

      const keys = _.keys(chartData);
      // console.log(keys);

      keys.forEach((key) => {
        const series: {date, value}[] = [];
        const dic = chartData[key];
        _.forEach(dic, (val, key) => {
          series.push({ date: key, value: val / 3600 });
        });
        chartData[key] = series;
      });

      // console.log(chartData);
    },
    drawChart() {
      const vm = this;

      const chart = am4core.create(vm.$refs.dailyChart, am4charts.XYChart);
      chart.colors.step = 2;

      // Create axes
      const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      // dateAxis.renderer.grid.template.location = 0;
      // dateAxis.renderer.minGridDistance = 20;

      const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.title.text = 'Spent (Hour)';

      let totalSeries;

      // Construct chart data
      const chartData = {};

      if (vm.data.length === 0) return;

      vm.data.forEach((element) => {
        element.details.forEach((time) => {
          const id = time.user;
          const dateString = time.date;

          if (!(id in chartData)) chartData[id] = {};

          if (dateString in chartData[id]) chartData[id][dateString] += time.seconds;
          else chartData[id][dateString] = time.seconds;

          // Total time:
          const total = 'total';
          if (!(total in chartData)) chartData[total] = {};

          if (dateString in chartData[total]) chartData[total][dateString] += time.seconds;
          else chartData[total][dateString] = time.seconds;
        });
      });

      const keys = _.keys(chartData);
      // console.log(keys);

      // Set up the range of days to be reported
      let firstDate = new Date();
      let days = 30;
      firstDate.setDate(firstDate.getDate() - days);
      firstDate.setHours(0, 0, 0, 0);

      if (!_.isEmpty(vm.dateRange) && vm.dateRange[0]) {
        const date1 = moment(vm.dateRange[0]);
        const date2 = moment(vm.dateRange[1]);
        days = date2.diff(date1, 'days') + 1;
        firstDate = vm.dateRange[0];
      }

      keys.forEach((key) => {
        let seriesData: {date, value}[] = [];
        const dic = chartData[key];

        for (let i = 0; i < days; i += 1) {
          const newDate = new Date(firstDate);
          newDate.setDate(newDate.getDate() + i);

          const dateString = newDate.toISOString().slice(0, 10);
          if (dateString in dic) seriesData.push({ date: dateString, value: dic[dateString] / 3600 });
          else seriesData.push({ date: dateString, value: 0 });
        }

        seriesData = _.orderBy(seriesData, ['date'], ['asc']);
        chartData[key] = seriesData;

        // console.log(seriesData);

        const series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.valueY = 'value';
        series.dataFields.dateX = 'date';
        series.strokeWidth = 2;
        series.yAxis = valueAxis;
        series.name = key;
        series.tooltipText = '{name}: [bold]{valueY}[/]';
        series.tensionX = 0.77;
        series.minBulletDistance = 30;
        series.data = seriesData;
        if (key === 'total') {
          series.hidden = true;
          totalSeries = series;
        }

        const bullet = series.bullets.push(new am4charts.CircleBullet());
        bullet.circle.strokeWidth = 2;
        bullet.circle.radius = 4;
        bullet.circle.fill = am4core.color('#fff');
      });

      // Add legend
      chart.legend = new am4charts.Legend();

      // Make a panning cursor
      chart.cursor = new am4charts.XYCursor();
      // chart.cursor.behavior = 'panX';
      chart.cursor.xAxis = dateAxis;
      // chart.cursor.snapToSeries = series;

      // Create vertical scrollbar and place it before the value axis
      // chart.scrollbarY = new am4core.Scrollbar();
      // chart.scrollbarY.parent = chart.leftAxesContainer;
      // chart.scrollbarY.toBack();

      // Create a horizontal scrollbar with previe and place it underneath the date axis
      chart.scrollbarX = new am4charts.XYChartScrollbar();
      chart.scrollbarX.series.push(totalSeries);
      chart.scrollbarX.parent = chart.bottomAxesContainer;

      // chart.events.on('ready', () => {
      //   dateAxis.zoom({ start: 0.79, end: 1 });
      // });

      chart.exporting.menu = new am4core.ExportMenu();
    },
    drawPieChart() {
      const vm = this;

      const chart = am4core.create(vm.$refs.projectChart, am4charts.PieChart);

      const chartData = {};

      vm.data.forEach((element) => {
        const { projectName } = element;
        if (!(projectName in chartData)) chartData[projectName] = 0;

        element.details.forEach((time) => {
          chartData[projectName] += time.seconds;
        });
      });

      const series: { project, hours }[] = [];
      _.forEach(chartData, (val, key) => {
        // eslint-disable-next-line
        series.push({ project: key.substring(key.lastIndexOf('/') + 1), hours: +(val / 3600).toFixed(1) });
      });
      // console.log(series);
      chart.data = _.orderBy(series, ['hours'], ['desc']);

      const pieSeries = chart.series.push(new am4charts.PieSeries());
      pieSeries.dataFields.value = 'hours';
      pieSeries.dataFields.category = 'project';

      // chart.innerRadius = am4core.percent(40);
      // Add a legend
      chart.legend = new am4charts.Legend();
      chart.legend.labels.template.text = '{category}:';
      chart.legend.valueLabels.template.text = '{value} hours ({value.percent.formatNumber("#.0")}%)';

      const legendContainer = am4core.create('legenddiv', am4core.Container);
      legendContainer.width = am4core.percent(100);
      legendContainer.height = am4core.percent(100);
      chart.legend.parent = legendContainer;

      function resizeLegend() {
        const el: HTMLElement | null = document.getElementById('legenddiv');
        if (el) {
          // eslint-disable-next-line
          const newHeight = chart.legend.contentHeight + 'px';
          if (el.style.height !== newHeight) {
            el.style.height = newHeight;
            setTimeout(() => {
              chart.legend.labels.template.width = am4core.percent(100);
            }, 100);
          }
        }
      }

      chart.legend.events.on('sizechanged', resizeLegend);
      chart.legend.events.on('datavalidated', resizeLegend);
      // chart.legend.labels.template.truncate = true;
      // chart.legend.labels.template.fullWords = false;
      // chart.legend.itemContainers.template.width = am4core.percent(100);
      // chart.legend.labels.template.width = am4core.percent(100);
    },
    drawLabPieChart() {
      const vm = this;

      const chart = am4core.create(vm.$refs.labChart, am4charts.PieChart);

      const personData = {};

      _.forEach(vm.data, (d) => {
        const { projectId } = d;
        const issueId = d.id;

        _.forEach(d.details, (t) => {
          if (!(t.user in personData)) personData[t.user] = {};

          const personScope = personData[t.user];
          if (!(projectId in personScope)) personScope[projectId] = { name: d.projectName, tags: d.projectTags, seconds: 0 };

          const projectScope = personScope[projectId];
          if (!(issueId in projectScope)) {
            projectScope[issueId] =
            {
              name: d.title,
              projectId,
              issueId,
              labels: d.labels,
              seconds: 0,
            };
          }

          const issueScope = projectScope[issueId];
          // eslint-disable-next-line
          issueScope.seconds += t.seconds;
          projectScope.seconds += t.seconds;
        });
      });

      const users = _.keys(personData);

      const chartData = {};

      users.forEach((key) => {
        const projects = _.keys(personData[key]);
        projects.forEach((projectId) => {
          // Project holder
          const prj = personData[key][projectId];

          // Parsed information of project_tags
          const prjDetail = parseProjectTags(prj.tags);
          const group = _.toUpper(prjDetail.group || 'unknown');

          if (!(group in chartData)) {
            chartData[group] = 0;
          }

          chartData[group] += prj.seconds;
        });
      });

      const series: { group, hours }[] = [];
      _.forEach(chartData, (val, key) => {
        // eslint-disable-next-line
        series.push({ group: key, hours: +(val / 3600).toFixed(1) });
      });
      // console.log(series);
      chart.data = _.orderBy(series, ['hours'], ['desc']);

      const pieSeries = chart.series.push(new am4charts.PieSeries());
      pieSeries.dataFields.value = 'hours';
      pieSeries.dataFields.category = 'group';

      // chart.innerRadius = am4core.percent(40);
      // Add a legend
      chart.legend = new am4charts.Legend();
      chart.legend.labels.template.text = '{category}:';
      chart.legend.valueLabels.template.text = '{value} hours ({value.percent.formatNumber("#.0")}%)';

      const legendContainer = am4core.create('legend-pie-div', am4core.Container);
      legendContainer.width = am4core.percent(100);
      legendContainer.height = am4core.percent(100);
      chart.legend.parent = legendContainer;

      function resizeLegend() {
        const el: HTMLElement | null = document.getElementById('legend-pie-div');
        if (el) {
          // eslint-disable-next-line
          const newHeight = chart.legend.contentHeight + 'px';
          if (el.style.height !== newHeight) {
            el.style.height = newHeight;
            setTimeout(() => {
              chart.legend.labels.template.width = am4core.percent(100);
            }, 100);
          }
        }
      }

      chart.legend.events.on('sizechanged', resizeLegend);
      chart.legend.events.on('datavalidated', resizeLegend);
      // chart.legend.labels.template.truncate = true;
      // chart.legend.labels.template.fullWords = false;
      // chart.legend.itemContainers.template.width = am4core.percent(100);
      // chart.legend.labels.template.width = am4core.percent(100);
    },
  },
  mounted() {
    this.drawChart();
    this.drawPieChart();
    this.drawLabPieChart();
    // this.test();
  },
});
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

.chart {
  width: 100%;
  height: 500px;
}

.legend {
  width: 100%;
  border: 1px dotted #c99;
  margin: 1em 0;
}

</style>
