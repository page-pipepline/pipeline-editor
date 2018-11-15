import Vue from 'vue';
import Router from 'vue-router';
import Pipeline from '@/pages/pipeline/editor';
import Schema from '@/pages/tools/schema';
import TemplateList from '@/pages/template/list';
import TemplateRouter from '@/pages/template/router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Template List',
      component: TemplateList,
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
    ...TemplateRouter
  ],
});
