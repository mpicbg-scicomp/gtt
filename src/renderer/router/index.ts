import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home.vue';
import Preferences from '@/views/Preferences.vue';

Vue.use(Router);

export default new Router({
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/preferences',
      name: 'preferences',
      component: Preferences,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});
