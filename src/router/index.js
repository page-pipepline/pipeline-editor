import Vue from 'vue';
import Router from 'vue-router';
import Pipeline from '@/pages/pipeline/editor';
import Schema from '@/pages/tools/schema';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Pipeline',
      component: Pipeline,
    },
    {
      path: '/pipeline',
      name: 'Pipeline',
      component: Pipeline,
    },
    {
      path: '/schema',
      name: 'Schema',
      component: Schema,
    },
  ],
});
