<template>
  <div>
    <slot :response="response" :loading="loading" :running="running"></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { parseProjectTags } from './js/Utils';

// require modules
const _ = require('lodash');
const Config = require('gitlab-time-tracker/src/include/config');
const Report = require('gitlab-time-tracker/src/models/report');
const Owner = require('gitlab-time-tracker/src/models/owner');
const ReportCollection = require('gitlab-time-tracker/src/models/reportCollection');

// For the preference
const Store = require('electron-store');
const store = new Store();

export default Vue.extend({
  props: ['user', 'project', 'token', 'dateRange', 'tags', 'runningStatus'],
  watch: {
    dateRange: function changed(newVal) {
      if (!_.isEmpty(newVal)) {
        // this.loading = true;
        // this.checkProjectOrGroup(this.user, this.project, this.dateRange, this.tags);
      }
    },
    tags: function changed() {
      // this.loading = true;
      // this.checkProjectOrGroup(this.user, this.project, this.dateRange, this.tags);
    },
  },
  data() {
    return {
      response: [{}],
      loading: true,
      running: false,
    };
  },
  methods: {
    getUrl() {
      if (store.has('pref')) {
        return store.get('pref').gitlabUrl;
      }
      return 'https://git.mpi-cbg.de/api/v4';
    },
    checkProjectOrGroup(user, project, dateRange, tags) {
      const vm = this;
      const projects = project.split(',').map(item => item.trim());

      project = projects.shift();

      const prj = `${vm.getUrl()}/projects/${encodeURIComponent(project)}/?private_token=${this.token}`;
      const grp = `${vm.getUrl()}/groups/${encodeURIComponent(project)}/?private_token=${this.token}`;
      const userPrj = `${vm.getUrl()}/users/${encodeURIComponent(project)}/projects/?private_token=${this.token}`;

      fetch(prj, {
        method: 'head',
      })
        .then((response) => {
          if (!response.ok) {
            // the project with the given name does not exist
            throw response;
          }
          // call project
          this.makeProjectReport(user, project, dateRange, tags, projects);
        })
        .catch(() => {
          fetch(grp, {
            method: 'head',
          })
            .then((response) => {
              if (!response.ok) {
                // the group with the given name does not exist
                throw response;
              }
              // call group
              this.makeGroupReport(user, project, dateRange, tags, projects);
            })
            .catch(() => {
              fetch(userPrj, {
                method: 'get',
              })
                .then((response) => {
                  if (response.ok) {
                    // call projects
                    response.json().then((data) => {
                      data.forEach((p) => {
                        projects.push(p.path_with_namespace);
                      });
                      project = projects.shift();
                      this.makeProjectReport(user, project, dateRange, tags, projects);
                    });
                  } else {
                    this.running = false;
                    this.$emit('update:runningStatus', this.running);
                  }
                });
            });
        });
    },
    makeProjectReport(user, project, dateRange, tags, projects) {
      this.makeReport(user, true, project, dateRange, tags, projects);
    },
    makeGroupReport(user, project, dateRange, tags, projects) {
      this.makeReport(user, false, project, dateRange, tags, projects);
    },
    makeReport(user, isProject, project, dateRange, tags, additionalProjects) {
      const vm = this;

      // Check the input data
      if (_.isEmpty(project)) {
        console.error('Project is null');
        return;
      }

      if (_.isEmpty(this.token)) {
        console.error('Token is empty');
        return;
      }
      // create a default config
      const config = new Config();

      // set required parameters
      config.set('url', vm.getUrl());
      config.set('token', this.token);
      config.set('project', project);
      config.set('closed', 'true');

      if (isProject) {
        config.set('type', 'project');
      } else {
        config.set('type', 'group');
        config.set('subgroups', 'true');
      }

      function pad(number) {
        if (number < 10) {
          return `0${number}`;
        }
        return number;
      }

      if (!_.isEmpty(dateRange) && dateRange[0]) {
        const from = `${dateRange[0].getFullYear()}-${pad(dateRange[0].getMonth() + 1)}-${pad(dateRange[0].getDate())}`;
        const to = `${dateRange[1].getFullYear()}-${pad(dateRange[1].getMonth() + 1)}-${pad(dateRange[1].getDate())}`;
        // console.log(`${from} - ${to}`);
        config.set('from', from);
        config.set('to', to);
      }

      if (!_.isEmpty(tags)) {
        const t = _.flatMap(tags, n => n.text);
        // console.log(t);
        config.set('includeByLabels', t);
      }

      if (!_.isEmpty(user)) {
        config.set('user', user);
      }

      const reports = new ReportCollection(config);
      const master = new Report(config);
      const projectLabels = _.isArray(config.get('project')) ? config.get('project').join('", "') : config.get('project');
      const projects = _.isArray(config.get('project')) ? config.get('project') : [config.get('project')];
      const owner = new Owner(config);
      const projectTags = {};
      const projectUrls = {};

      new Promise((resolve, reject) => {
        owner.authorized()
          .catch(e => console.error('Invalid access token!', e))
          .then(() => owner.parallel(projects, (project, done) => {
            config.set('project', project);

            switch (config.get('type')) {
              case 'project': {
                const report = new Report(config);
                reports.push(report);
                report.getProject()
                  .then(() => done())
                  .catch(e => console.error(`Project not found or no access rights "${projectLabels}".`, e));
                break;
              }
              case 'group': {
                owner.getGroup()
                  .then(() => {
                    if (!config.get('subgroups')) return new Promise(r => r());
                    return owner.getSubGroups();
                  })
                  .then(() => owner.getProjectsByGroup()
                    .then(() => {
                      owner.projects.forEach(project => reports.push(new Report(config, project)));
                      done();
                    }))
                  .catch((e) => {
                    done(e);
                  });
                break;
              }
              default: {
                break;
              }
            }
          }))
          .catch(e => reject(e))
          .then(() => owner.parallel(additionalProjects, (project, done) => {
            config.set('project', project);

            const report = new Report(config);
            reports.push(report);
            report.getProject()
              .then(() => done())
              .catch(e => console.error(`Project not found or no access rights "${projectLabels}".`, e));
          }))
          .then(() => {
            config.set('project', projects);
            resolve();
          });
      })
        .then(() => console.log(`Selected projects: ${reports.reports.map(r => _.values(r.projects)[0]).join(', ')}`))
        .then(() => new Promise((resolve) => {
          reports
            .forEach((report, done) => {
              report.getIssues()
                .then(() => {
                  done();
                });
            })
            .catch(error => console.error('could not fetch issues.', error))
            .then(() => resolve());
        }))
        .then(() => new Promise((resolve) => {
          reports
            .forEach((report, done) => {
              projectTags[report.project.id] = report.project.data.tag_list;
              projectUrls[report.project.id] = report.project.data.web_url;
              master.merge(report);
              done();
            })
            .catch(error => console.error('could not merge reports.', error))
            .then(() => resolve());
        }))
        .then(() => new Promise((resolve) => {
          master.processIssues()
            .catch(error => console.error('could not process issues.', error))
            .then(() => resolve());
        }))
        .then(() => new Promise((resolve) => {
          const issues: {id, projectId, projectName, projectTags, projectWebUrl, title, totalSpent, labels, details}[] = [];

          master.issues.forEach((issue) => {
            const details: {user, date, time, seconds}[] = [];

            // If there is 'removed time spent' in the notes, it remembers and the id will be used for filtering.
            let lastRemoveTimeSpentId = 0;
            issue.notes.forEach((note) => {
              if (note.body === 'removed time spent') {
                lastRemoveTimeSpentId = note.id;
              }
            });

            // If there is lastRemoveTimeSpentId, we keep only times after the id
            issue.times.forEach((time) => {
              if (time.data.id > lastRemoveTimeSpentId) {
                details.push({
                  user: time.user,
                  date: time.date.format('YYYY-MM-DD'),
                  time: time.time,
                  seconds: time.seconds,
                });
              }
            });

            const prjDetail = parseProjectTags(projectTags[issue.project_id]);
            // time records on issue
            issues.push({
              id: issue.iid,
              projectId: issue.project_id,
              projectName: prjDetail.title || issue.project_namespace,
              projectTags: projectTags[issue.project_id],
              projectWebUrl: projectUrls[issue.project_id],
              title: issue.title,
              totalSpent: issue.spent,
              labels: issue.closed ? ['Close'].concat(issue.labels) : ['Open'].concat(issue.labels),
              details,
            });
          });

          this.response = issues;
          this.loading = false;
          this.running = false;
          this.$emit('update:runningStatus', this.running);
          resolve();
        }));
    },
    refresh() {
      this.response = [{}];
      this.loading = true;
      this.running = true;
      this.$emit('update:runningStatus', this.running);
      this.checkProjectOrGroup(this.user, this.project, this.dateRange, this.tags);
    },
  },
});
</script>
