import Vue from 'vue';
import Router from 'vue-router';
import HelloWorld from '@/pages/HelloWorld';
import Pipeline from '@/pages/pipeline/editor';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld,
    },
    {
      path: '/pipeline',
      name: 'Pipeline',
      component: Pipeline,
    },
  ],
});
