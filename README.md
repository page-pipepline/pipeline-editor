# pipeline-editor
> 页面可视化搭建框架的 web 编辑器

## [Demo][pipeline-demo]
> https://page-pipepline.github.io/pipeline-editor/dist/#/

### 可视化编辑
![demo](https://user-images.githubusercontent.com/4598445/51877958-f7c6f580-23a8-11e9-9564-5bbf15b17f96.gif)

如动图所示, pipeline 的可视化编辑能力有: 
* 可视化修改页面全局配置, 如修改页面主题颜色.
* 可视化修改页面组件内容, 如修改组件的图片和替换组件文本.
* 实时预览页面编辑效果, 即刻获得搭建后的页面.
* 页面支持用户交互.

### 组件编辑
![dnd_demo](https://user-images.githubusercontent.com/4598445/51877984-0b725c00-23a9-11e9-90d4-cd88b4e5920e.gif)

如动图所示, pipeline 的组件编辑能力有:

* 动态增删页面组件.
* 可视化的组件拖拽, 拖拽组件库组件插入到页面组件列表中.
* 组件可以包含业务逻辑(网络请求和用户交互).

### 支持的前端框架

Pipeline 实现了编辑器和页面前端框架的分离, 可以支持不同的前端框架. 所谓支持的前端框架, 就是对某个前端框架按照 pipeline 的约束规则进行组件编辑方式和工程构建方式的改造, 使得前端框架页面可以在 pipeline 中可视化搭建.

目前已经支持 Vue, React, 和 Omi, 理论上可以支持任意前端框架.

![image](https://user-images.githubusercontent.com/4598445/51877997-12996a00-23a9-11e9-90f5-882b06533a56.png)

### 框架特点

* 开源页面可视化搭建框架.
* 自定义页面可配置字段.
* 组件动态增减, 组件拖拽.
* 从页面模板快速生成业务页面.
* 模板工程/编辑器/后台服务解偶.
* 模板工程前端框架无关: 支持 vue 和 react 等.
* 支持自由拓展页面组件, 不限制组件样式布局, 接口调用等.
* 前端工程约束少, 不限制使用其他技术(Redux, SSR, UI库等).


## Document

[pipeline-document](https://github.com/page-pipepline/pipeline-document)

[Sclient links]:#
[pipeline-demo]: https://user-images.githubusercontent.com/4598445/40279042-80fbf088-5c6e-11e8-80b2-9dcd980ecae8.gif

## EOF
