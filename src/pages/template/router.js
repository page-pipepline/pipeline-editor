/*
 * template router
 * @Author: CntChen
 * @Date: 2018-11-14
 */

import List from './list';
import Add from './add';

export default [
  {
    path: '/template/list',
    name: 'Template List',
    component: List,
  },
  {
    path: '/template/add',
    name: 'Template Add',
    component: Add,
  },
];
