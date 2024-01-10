<template>
  <div>
    <div class="inline-block no-underline font-bold mb-4">
      <label for="Issue" class="mr-3">
        <input type="radio" id="Issue" value="Issue" v-model="selectedItem" checked>
        Issue
      </label>
      <label for="Person" class="mr-3">
        <input type="radio" id="Person" value="Person" v-model="selectedItem">
        Person
      </label>
      <button type="button" class="flex-no-shrink bg-blue hover:bg-blue-dark border-blue hover:border-blue-dark text-sm border-4 text-white py-1 px-2 rounded" @click="exportTsv">Export TSV</button>
      <!-- <label for="Lab">
        <input type="radio" id="Lab" value="Lab" v-model="selectedItem">
        Lab
      </label> -->
    </div>
  <table :id=id class="table table-striped table-bordered table-hover" width="100%"></table>
  </div>
</template>

<script>
  import { parseProjectTags, extractProjectTags, pad } from './js/Utils';

  const Store = require('electron-store');
  const store = new Store();
  let billingClassTable = {};
  let categoryTable = {};

  const _ = require('lodash');
  const $ = window.jQuery = require('jquery');
  require('./js/datatable');

  let table;

  function formatTime(d) {
    // `d` is the original data object for the row
    const { details } = d;

    const rows = [
      '<table class="dataTable row-border" cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">',
      '<tr><th>user</th><th>date</th><th>time</th><th>seconds</th></tr>',
      '<tbody>',
    ];

    details.forEach((time) => {
      rows.push('<tr><td>');
      rows.push(time.user);
      rows.push('</td><td>');
      rows.push(time.date);
      rows.push('</td><td>');
      rows.push(time.time);
      rows.push('</td><td>');
      rows.push(time.seconds);
      rows.push('</td></tr>');
    });

    rows.push('</tbody></table>');

    return rows.join('\n');
  }

  function formatIssue(vm, d) {
    // `d` is the original data object for the row
    const { details } = d;

    const rows = [
      '<table class="dataTable row-border" cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">',
      '<tr><th>Issue name</th><th>Spent time</th></tr>',
      '<tbody>',
    ];

    details.forEach((issue) => {
      rows.push('<tr><td>');
      rows.push(`<a class="url-issue-link" data-issue-id=${issue.issueId} data-project-web-url=${issue.projectWebUrl}>`);
      rows.push(`${issue.name}</a>${vm.createLabels(issue.labels)}`);
      rows.push('</td><td>');
      rows.push((issue.seconds / 3600).toFixed(1));
      rows.push('</td></tr>');
    });

    rows.push('</tbody></table>');

    return rows.join('\n');
  }

  export default {
    name: 'data-table',
    props: ['id', 'data', 'token', 'dateRange'],
    data() {
      return {
        selectedItem: 'Issue',
      };
    },
    watch: {
      selectedItem: function update(newValue) {
        const vm = this;

        switch (newValue) {
          case 'Person':
            vm.createPersonTable(vm.id, vm.data);
            break;
          case 'Lab':
            break;
          case 'Issue':
          default:
            vm.createTable(vm.id, vm.data);
        }
      },
    },
    methods: {
      getIssueUrl(projectWebUrl, issueId) {
        const url = `${projectWebUrl}/issues/${issueId}?private_token=${this.token}`;
        // eslint-disable-next-line
        require('electron').shell.openExternal(url);
      },
      getProjectUrl(projectWebUrl) {
        const url = `${projectWebUrl}?private_token=${this.token}`;
        // eslint-disable-next-line
        require('electron').shell.openExternal(url);
      },
      createLabels(labels) {
        const ret = [' '];
        _.forEach(labels, (d) => {
          if (d.toLowerCase() in categoryTable) {
            ret.push(`<span class="badge badge-pill badge-${categoryTable[d.toLowerCase()]}">`);
          } else {
            ret.push('<span class="badge badge-pill badge-default">');
          }
          ret.push(d);
          ret.push('</span>');
        });
        return ret.join('\n');
      },
      createPersonTable(id, data) {
        const vm = this;

        // Mutate data
        // {user: {projectId: {name, tags, issueId: {name, seconds} } }
        const personData = {};

        _.forEach(data, (d) => {
          const { projectId } = d;
          const issueId = d.id;

          _.forEach(d.details, (t) => {
            if (!(t.user in personData)) personData[t.user] = {};

            const personScope = personData[t.user];
            if (!(projectId in personScope)) {
              personScope[projectId] = {
                name: d.projectName,
                tags: d.projectTags,
                seconds: 0,
              };
            }

            const projectScope = personScope[projectId];
            if (!(issueId in projectScope)) {
              projectScope[issueId] =
              {
                name: d.title,
                projectWebUrl: d.projectWebUrl,
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

        const output = [];

        users.forEach((key) => {
          const projects = _.keys(personData[key]);
          projects.forEach((projectId) => {
            // Project holder
            const prj = personData[key][projectId];
            // Parsed information of project_tags
            const prjDetail = parseProjectTags(prj.tags);
            // Extract actual project tags
            const actualTags = extractProjectTags(prj.tags);
            // Project URL
            const prjUrl = prj.url;
            // Extract issue collection
            const issues = _.reduce(prj, (result, value, key) => {
              if (key === 'name' || key === 'tags' || key === 'seconds' || key === 'url') return result;
              result.push(value);
              return result;
            }, []);

            // Construct the person based table data
            output.push({
              projectId,
              user: _.capitalize(key),
              billingClass: billingClassTable[key],
              group: _.toUpper(prjDetail.group || 'unknown'),
              contact: prjDetail.contact || 'unknown',
              title: prjDetail.title || prj.name,
              intOrExt: prjDetail.intOrExt || 'unknown',
              costCenter: prjDetail.costCenter || 'unknown',
              projectWebUrl: prjUrl,
              tags: actualTags,
              totalSpent: Number((_.reduce(prj, (sum, value, key) => (key === 'seconds' ? sum + value : sum), 0) / 3600).toFixed(2)),
              details: issues,
            });
          });
        });

        _.forEach(output, (d) => {
          d.DT_RowID = `${d.user}/${d.title}`;
        });

        const columns = [
          {
            class: 'details-control',
            orderable: false,
            data: null,
            defaultContent: '',
          },
          {
            title: 'Team Member',
            data: 'user',
          },
          {
            title: 'Billing',
            data: 'billingClass',
          },
          {
            title: 'Group',
            data: 'group',
          },
          {
            title: 'User',
            data: 'contact',
          },
          {
            title: 'Project Title',
            data: 'title',
            fnCreatedCell: (nTd, sData, oData) => {
              $(nTd).html(`<a class="url-project-link">${oData.title}</a>${vm.createLabels(oData.tags)}`);
            },
          },
          {
            title: 'Cost Center',
            data: 'costCenter',
          },
          {
            title: 'Affiliation',
            data: 'intOrExt',
          },
          {
            title: 'Tags',
            data: 'tags',
            visible: false,
          },
          {
            title: 'Spent (hour)',
            data: 'totalSpent',
          },
        ];

        const nTableOptions = {
          columns,
          // aaSorting: [[ 0, 'asc' ]],
          paging: true,
          searching: true,
          info: true,
          data: output,
          order: [[1, 'asc'], [2, 'asc']],
          bDestroy: true, // Add this property to new setting
        };

        const tableId = `#${id}`;
        if (table) {
          table.destroy();
          $(tableId).empty();
        }

        table = $(tableId).DataTable(nTableOptions);

        const tableBody = `${tableId} tbody`;

        $(tableBody).on('click', 'tr td a.url-project-link', (e) => {
          const tr = $(e.target).parent().parent();
          const row = table.row(tr);
          vm.getProjectUrl(row.data().projectWebUrl);
        });

        $(tableBody).on('click', 'tr td a.url-issue-link', (e) => {
          const issue = $(e.target);
          vm.getIssueUrl(issue.data('projectWebUrl'), issue.data('issueId'));
        });

        const detailRows = [];

        $(tableBody).on('click', 'tr td.details-control', (e) => {
          const tr = $(e.target).parent();
          const row = table.row(tr);
          const idx = $.inArray(tr.attr('id'), detailRows);
  
          if (row.child.isShown()) {
            tr.removeClass('details');
            row.child.hide();

            // Remove from the 'open' array
            detailRows.splice(idx, 1);
          } else {
            tr.addClass('details');
            row.child(formatIssue(vm, row.data())).show();

            // Add to the 'open' array
            if (idx === -1) {
              detailRows.push(tr.attr('id'));
            }
          }
        });

        // On each draw, loop over the `detailRows` array and show any child rows
        table.on('draw', () => {
          $.each(detailRows, (i, id) => {
            $(`#${id} td.details-control`).trigger('click');
          });
        });
      },
      createTable(id, data) {
        const vm = this;

        _.forEach(data, (d) => {
          d.DT_RowID = `${d.projectId}/${d.id}`;
        });

        const columns = [
          {
            class: 'details-control',
            orderable: false,
            data: null,
            defaultContent: '',
          },
          {
            title: 'Project',
            data: 'projectName',
          },
          {
            title: 'Issue',
            data: 'id',
          },
          {
            title: 'Title',
            data: 'title',
            fnCreatedCell: (nTd, sData, oData) => {
              $(nTd).html(`<a class="url-link">${oData.title}</a>${vm.createLabels(oData.labels)}`);
            },
          },
          {
            title: 'Spent',
            data: 'totalSpent',
          },
        ];

        const nTableOptions = {
          columns,
          // aaSorting: [[ 0, 'asc' ]],
          paging: true,
          searching: true,
          info: true,
          data,
          order: [[1, 'asc'], [2, 'asc']],
          bDestroy: true, // Add this property to new setting
        };

        const tableId = `#${id}`;
        if (table) {
          table.destroy();
          $(tableId).empty();
        }

        table = $(tableId).DataTable(nTableOptions);

        const tableBody = `${tableId} tbody`;

        $(tableBody).on('click', 'tr td a.url-link', (e) => {
          const tr = $(e.target).parent().parent();
          const row = table.row(tr);
          vm.getIssueUrl(row.data().projectWebUrl, row.data().id);
        });

        const detailRows = [];

        $(tableBody).on('click', 'tr td.details-control', (e) => {
          const tr = $(e.target).parent();
          const row = table.row(tr);
          const idx = $.inArray(tr.attr('id'), detailRows);
  
          if (row.child.isShown()) {
            tr.removeClass('details');
            row.child.hide();

            // Remove from the 'open' array
            detailRows.splice(idx, 1);
          } else {
            tr.addClass('details');
            row.child(formatTime(row.data())).show();

            // Add to the 'open' array
            if (idx === -1) {
              detailRows.push(tr.attr('id'));
            }
          }
        });

        // On each draw, loop over the `detailRows` array and show any child rows
        table.on('draw', () => {
          $.each(detailRows, (i, id) => {
            $(`#${id} td.details-control`).trigger('click');
          });
        });
      },
      exportPersonData(data) {
        // Mutate data
        // {user: {projectId: {name, tags, issueId: {name, seconds} } }
        const personData = {};
        const dateRange = this.getDateRange();

        _.forEach(data, (d) => {
          const { projectId } = d;
          const issueId = d.id;

          _.forEach(d.details, (t) => {
            if (!(t.user in personData)) personData[t.user] = {};

            const personScope = personData[t.user];
            if (!(projectId in personScope)) {
              personScope[projectId] = {
                name: d.projectName, tags: d.projectTags, url: d.projectWebUrl, seconds: 0,
              };
            }

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

        const output = [];

        users.forEach((key) => {
          const projects = _.keys(personData[key]);
          projects.forEach((projectId) => {
            // Project holder
            const prj = personData[key][projectId];
            // Parsed information of project_tags
            const prjDetail = parseProjectTags(prj.tags);
            // Set up the prefix of url
            const prjUrl = prj.url;
            // Extract actual project tags
            // const actualTags = extractProjectTags(prj.tags);
            // Extract issue collection
            const issues = _.reduce(prj, (result, value, key) => {
              if (key === 'name' || key === 'tags' || key === 'seconds' || key === 'url') return result;
              const url = `${prjUrl}/issues/${value.issueId}`;
              result.push(`${Number((value.seconds / 3600).toFixed(2))}_${value.name} ${url};;;`);
              return result;
            }, []);

            // console.log(prj);
            // Construct the person based table data
            output.push({
              // projectId,
              'Team Member': _.capitalize(key),
              'Billing Class': billingClassTable[key],
              Group: _.toUpper(prjDetail.group || 'unknown'),
              User: prjDetail.contact || 'unknown',
              'Project Title': `${_.capitalize(key)} : ${prjDetail.title || prj.name}`,
              'Cost Center': prjDetail.costCenter || 'unknown',
              Affiliation: prjDetail.intOrExt,
              'Project URL': prjUrl,
              'Time Period': dateRange,
              'Billing Description Summary': issues,
              'Total Hours': Number((_.reduce(prj, (sum, value, key) => (key === 'seconds' ? sum + value : sum), 0) / 3600).toFixed(2)),
              'PPMS Comment': `Project: ${prjDetail.title || prj.name}; URL: ${prjUrl}, Team Member: ${_.capitalize(key)}; Time Period: ${dateRange}`,
            });
          });
        });

        return output;
      },
      getDateRange() {
        const vm = this;
        const { dateRange } = vm;
        if (!_.isEmpty(dateRange) && dateRange[0]) {
          // To include the spent time in the last day for the range
          const from = `${dateRange[0].getFullYear()}-${pad(dateRange[0].getMonth() + 1)}-${pad(dateRange[0].getDate())}`;
          const to = `${dateRange[1].getFullYear()}-${pad(dateRange[1].getMonth() + 1)}-${pad(dateRange[1].getDate())}`;
          return `${from} ~ ${to}`;
        }
        return '';
      },
      exportTsv() {
        const vm = this;
        require('@electron/remote').dialog.showSaveDialog({
          title: 'Please enter a file name',
          filters: [
            {
              name: 'Tab separated file',
              extensions: ['tsv'],
            },
          ],
        }).then((result) => {
          // console.log(result);
          const fs = require('fs');
          const tsv = require('tsv');

          fs.writeFile(result.filePath, tsv.stringify(vm.exportPersonData(vm.data)), 'utf8', () => {
            console.log('file written');
          });
        }).catch((err) => {
          console.error(err);
        });
      },
    },
    mounted() {
      const vm = this;

      if (store.has('pref')) {
        const pref = store.get('pref');

        billingClassTable = JSON.parse(pref.userGroups);
        categoryTable = JSON.parse(pref.tagColors.toLowerCase());
      }

      vm.createTable(vm.id, vm.data);
    },
  };
</script>

<style>
  @import url('~@/assets/datatable.css');

  table.dataTable.row-border > tbody > tr:first-child > th, 
  table.dataTable.row-border > tbody > tr:first-child > td, 
  table.dataTable.display > tbody > tr:first-child > th, 
  table.dataTable.display > tbody > tr:first-child > td {
    border-top: none;
  }

  table.dataTable.row-border > tbody > tr > th, 
  table.dataTable.row-border > tbody > tr > td, 
  table.dataTable.display > tbody > tr > th, 
  table.dataTable.display > tbody > tr > td {
    border-top: 1px solid #ddd;
  }

  table.dataTable > tbody > tr {
    background-color: #ffffff;
  }

  table.dataTable.row-border > tbody > tr:hover, 
  table.dataTable.display > tbody > tr:hover {
    background-color: #f6f6f6;
  }

  td.details-control {
    width: 20px;
    background: url('~@/assets/details_open.png') no-repeat center center;
    cursor: pointer;
  }
  tr.details td.details-control {
      background: url('~@/assets/details_close.png') no-repeat center center;
  }

  .badge-primary {
    background-color: #4285f4 !important;
    color: #fff !important;
  }
  .badge-success {
    background-color: #00c851 !important;
    color: #fff !important;
  }
  .badge-danger {
    background-color: #ff3547 !important;
    color: #fff !important;
  }
  .badge-warning {
    background-color: #fb3 !important;
    color: #fff !important;
  }
  .badge-info {
    color: #fff !important;
    background-color: #2bbbad !important;
  }
  .badge-dark {
    color: #fff !important;
    background-color: #343a40 !important;
  }
  .badge-default {
    background-color: #6c757d !important;
    color: #fff !important;
  }

  .badge-pill {
      -webkit-border-radius: 10rem;
      border-radius: 10rem;
      padding-right: .6em;
      padding-left: .6em;
  }
  .badge {
    display: inline-block;
    padding: .25em .4em;
    padding-right: 0.4em;
    padding-left: 0.4em;
    font-size: 75%;
    font-weight: 700;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: .25rem;
  }
</style>
