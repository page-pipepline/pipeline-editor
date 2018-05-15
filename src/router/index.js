import Vue from 'vue';
import Router from 'vue-router';
import Pipeline from '@/pages/pipeline/editor';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Pipeline',
      component: HelloWorld,
    },
    {
      path: '/pipeline',
      name: 'Pipeline',
      component: Pipeline,
    },
  ],
});
