<template>
<div class="page-content pipline">
  <div class="pipline__library-components">
    <h3>组件库</h3>
    <ul id="library-components__list"
      ref="library-components__list"
      class="library-components__list">
      <li class="library-components__item"
        v-for="(component, key) in libraryComponentsInfo"
        :data-component-name="key"
        :key="key">
        <el-button
          size="small"
          @dblclick.native="onLibraryComponentDblclick(key)"
          icon="el-icon-star-on">
          {{component.pipeline.title}}
        </el-button>
      </li>
    </ul>
    <p>(拖拽或双击)</p>
  </div>
  <div class="pipline__components-selector">
    <h3>模板组件</h3>
    <ul id="components-selector__list"
      ref="components-selector__list"
      class="components-selector__list">
      <li class="components-selector__item"
        v-for="(component, index) in templateComponents"
        :key="component.id">
        <el-button
          :type="getComponentSelectorButtonType(component)"
          size="small"
          icon="el-icon-menu"
          @click.native="selectComponent(component)">
          {{Object.keys(libraryComponentsInfo).length && libraryComponentsInfo[component.name].pipeline.title}}
        </el-button>
        <div
          class="components-selector__button-group"
          v-show="currentComponent && currentComponent.id === component.id">
          <el-button size="mini" type="success"
            :disabled="index === 0"
            @click="componentUp(component, index)">
            <i class="el-icon-sort-up"></i>
          </el-button>
          <el-button size="mini" type="success"
            :disabled="index === (templateComponents.length - 1)"
            @click="componentDown(component, index)">
            <i class="el-icon-sort-down"></i>
          </el-button>
          <el-button size="mini" type="danger"
            @click="componentDelete(component, index)">
            <i class="el-icon-delete"></i>
          </el-button>
        </div>
      </li>
    </ul>
  </div>
  <div class="pipline__preview">
    <h3>页面预览</h3>
    <div class="preview__button-group">
      <el-button
        size="small"
        icon="el-icon-refresh"
        @click.native="refreshPreviewIframe">
        刷新
      </el-button>
      <el-button
        size="small"
        icon="el-icon-news"
        @click.native="previewInNewPage">
        新页面预览
      </el-button>
    </div>
    <div class="preview__page-title">
      {{baseConfig.title}}
    </div>
    <iframe
      class="preview__iframe"
      ref="previewIframe"
      :src="previewSrc"/>
  </div>
  <div class="pipline__fill-info">
    <h3>页面配置</h3>
    <div class="fill-info__form">
      <el-tabs
        type="border-card"
        @tab-click="onTabClick"
        :value="formName">
        <el-tab-pane
          name="pageInfo"
          label="页面信息">
          <div class="page-info">
            <el-form ref="pageInfo" :model="pageInfo" :rules="PageInfoRules" label-width="80px">
              <el-form-item prop="name" label="页面名称">
                <el-input v-model="pageInfo.name" placeholder="请输入页面名称"></el-input>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane
          name="pageBaseConfig"
          label="页面基本配置">
          <div class="form-json-editor">
            <json-editor
              :data.sync="baseConfig"
              :dataSchema.sync="baseConfigSchema"/>
          </div>
        </el-tab-pane>
        <el-tab-pane
          name="pageConfig"
          label="页面内容配置">
          <div class="form-json-editor">
            <json-editor
              :data.sync="data"
              :dataSchema.sync="dataSchema"/>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="pipeline__button_group">
      <el-button size="small"
        @click="generatePage">
        <i class="el-icon-document el-icon--right"></i> 生成页面
      </el-button>
    </div>
  </div>
</div>
</template>

<script>
import Sortable from 'sortablejs';
import { APIS } from 'comp/util/constants';
import fetch from 'comp/util/fetch';
import JsonEditor from 'comp/json-editor';

export default {
  name: 'pipline-editor',
  components: {
    'json-editor': JsonEditor,
  },
  data() {
    return {
      templateTypeList: [],
      pageTypeList: [],
      purpose: '',
      templateId: '',
      template: null,
      pageId: '',
      pageInfo: {},
      data: {},
      dataSchema: {},
      schemas: {},
      baseConfig: {},
      baseConfigSchema: {},
      baseConfigSchemaEarly: {},
      templateComponents: [],
      libraryComponentsInfo: {},
      componentsDefaultData: {},
      currentComponent: null,
      previewSrc: '',
      formName: 'pageBaseConfig',
      pageBaseUrl: '',
      PageInfoRules: {
        name: [
          { required: true, message: '请输入页面名称', trigger: 'blur' },
          { min: 3, max: 32, message: '长度在 3 到 32 个字符', trigger: 'blur' },
        ],
      },
    };
  },
  methods: {
    async prepareFromTemplate() {
      // default template id '1'
      this.templateId = this.$route.query.templateId || '1';
      const ret = await fetch(`${APIS.PIPLINE}/prepareFromTemplate`, {
        method: 'POST',
        body: {
          templateId: this.templateId,
        },
      });
      this.pageId = ret.pageId;
      this.previewSrc = `${APIS.ROOT}/public/pipelines/${this.pageId}/server/dist/index.html`;
    },
    async getPageBaseUrl() {
      const ret = await fetch(`${APIS.PIPLINE}/pageBaseUrl`, {
      });
      return ret;
    },
    async getBaseConfig() {
      const ret = await fetch(`${APIS.PIPLINE}/baseConfig`, {
        body: {
          pageId: this.pageId,
        },
      });
      this.baseConfig = ret;
    },
    async putBaseConfig() {
      await fetch(`${APIS.PIPLINE}/baseConfig`, {
        method: 'PUT',
        body: {
          pageId: this.pageId,
          baseConfig: this.baseConfig,
        },
      });

      await this.refreshPreviewIframe();
      await this.getBaseConfig();
    },
    async getBaseConfigSchema() {
      const ret = await fetch(`${APIS.PIPLINE}/baseConfigSchema`, {
        body: {
          pageId: this.pageId,
        },
      });
      this.baseConfigSchemaEarly = ret;
    },
    async getTemplateComponents() {
      const ret = await fetch(`${APIS.PIPLINE}/templateComponents`, {
        body: {
          pageId: this.pageId,
        },
      });
      this.templateComponents = ret;
    },
    async getLibraryComponentsInfo() {
      const ret = await fetch(`${APIS.PIPLINE}/libraryComponentsInfo`, {
        body: {
          pageId: this.pageId,
        },
      });
      this.libraryComponentsInfo = ret;
    },
    async getComponentsDefaultData() {
      const ret = await fetch(`${APIS.PIPLINE}/componentsDefaultData`, {
        body: {
          pageId: this.pageId,
        },
      });
      this.componentsDefaultData = ret;
    },
    async putComponents() {
      await fetch(`${APIS.PIPLINE}/templateComponents`, {
        method: 'PUT',
        body: {
          pageId: this.pageId,
          templateComponents: this.templateComponents,
        },
      });

      await this.refreshPreviewIframe();
      await this.getTemplateComponents();
    },
    async getComponentsSchema() {
      const ret = await fetch(`${APIS.PIPLINE}/componentsSchema`, {
        body: {
          pageId: this.pageId,
        },
      });
      this.schemas = ret;
    },
    selectComponent(component) {
      this.currentComponent = component;
      this.tabToPageConfig();
    },
    selectDefaultComponent() {
      if (this.currentComponent === null
        && this.templateComponents.length > 0) {
        this.currentComponent = this.templateComponents[0];
        return true;
      }
      return false;
    },
    async refreshPreviewIframe() {
      const onLoadPromise = new Promise((resolve) => {
        this.$refs.previewIframe.onload = () => {
          this.iframeScrollToCurrentComponent();
          resolve();
        };
      });

      this.$refs.previewIframe.src = this.previewSrc;
      await onLoadPromise;
    },
    iframeScrollToCurrentComponent() {
      this.$refs.previewIframe.contentWindow.postMessage({
        currentComponent: this.currentComponent,
      }, '*');
    },
    previewInNewPage() {
      window.open(this.previewSrc);
    },
    onTabClick(tab) {
      switch (tab.name) {
        case 'pageConfig':
          this.selectDefaultComponent();
          break;
        default:
          break;
      }
      this.formName = tab.name;
    },
    onLibraryComponentDblclick(componentName) {
      // 双击组件库组件， 将该组件插入到模板组件列表中
      const templateComponentsLength = this.templateComponents.length;
      this.templateComponents.splice(templateComponentsLength, 0, {
        id: `${componentName}-${+new Date()}`,
        name: componentName,
        data: this.componentsDefaultData[componentName],
      });
      this.currentComponent = this.templateComponents[templateComponentsLength];
      this.putComponents();
    },
    tabToPageConfig() {
      this.formName = 'pageConfig';
    },
    getComponentSelectorButtonType(component) {
      return (this.currentComponent && this.currentComponent.id === component.id) ? 'primary' : 'normal';
    },
    async componentDown(component, index) {
      this.$set(this.templateComponents, index, this.templateComponents[index + 1]);
      this.$set(this.templateComponents, index + 1, component);
      await this.putComponents();
    },
    async componentUp(component, index) {
      this.$set(this.templateComponents, index, this.templateComponents[index - 1]);
      this.$set(this.templateComponents, index - 1, component);
      await this.putComponents();
    },
    async componentDelete(component, index) {
      this.$confirm('', '是否删除该组件?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        center: true,
      }).then(async () => {
        this.templateComponents.splice(index, 1);
        this.currentComponent = null;
        await this.putComponents();
      }).catch(() => {
      });
    },
    async generatePage() {
      this.formName = 'pageInfo';

      const validate = await this.$refs.pageInfo.validate().catch(e => e);

      if (!validate) {
        this.$message({
          message: '请先填写页面信息.',
          type: 'warning',
        });
        return;
      }

      const body = {
        pageId: this.pageId,
        templateId: this.templateId,
        name: this.pageInfo.name,
      };
      fetch(`${APIS.PAGE}`, {
        method: 'POST',
        body,
      }).then(() => {
        this.$message({
          message: '生成页面成功.',
          type: 'success',
        });
        // TODO 跳转到页面
      }).catch(() => {
        this.$message({
          message: '生成页面失败.',
          type: 'warning',
        });
      });
    },
  },
  async mounted() {
    this.templateId = this.$route.params.id;
    this.purpose = this.$route.query.purpose;

    await this.prepareFromTemplate();
    await this.getBaseConfigSchema();
    await this.getLibraryComponentsInfo();
    await this.getBaseConfig();
    // 用 baseConfigSchemaEarly 解决数据和约束不在一个 Vue 渲染周期内导致的校验报错
    this.baseConfigSchema = this.baseConfigSchemaEarly;
    await this.getComponentsSchema();
    await this.getTemplateComponents();
    await this.getComponentsDefaultData();

    // 组件拖拽实现
    this.$nextTick(() => {
      Sortable.create(this.$refs['library-components__list'], {
        group: {
          name: 'library-components__list',
          pull: 'clone',
        },
        sort: false,
      });
      Sortable.create(this.$refs['components-selector__list'], {
        group: {
          name: 'components-selector__list',
          put: 'library-components__list',
        },
        sort: false,
        onAdd: (evt) => {
          // 还原 sortablejs 的 DOM 操作, 转而直接操作 viewModel 数据
          const insertComponentName = evt.item.getAttribute('data-component-name');
          const insertComponentIndex = evt.newIndex;
          const clonedElement = evt.from.children[evt.oldIndex];

          evt.from.insertBefore(evt.item, clonedElement);
          evt.from.removeChild(clonedElement);

          this.templateComponents.splice(insertComponentIndex, 0, {
            id: `${insertComponentName}-${+new Date()}`,
            name: insertComponentName,
            data: this.componentsDefaultData[insertComponentName],
          });
          this.currentComponent = this.templateComponents[insertComponentIndex];
          this.putComponents();
        },
      });
    });
  },
  watch: {
    templateComponents(value) {
      if (!this.currentComponent) {
        this.selectDefaultComponent();
      } else {
        const componentsWithId = value.filter(item => item.id === this.currentComponent.id);
        if (componentsWithId.length > 0) {
          this.currentComponent = componentsWithId[0];
        } else {
          this.selectDefaultComponent();
        }
      }
    },
    currentComponent(value) {
      if (value === null) {
        this.dataSchema = {};
        this.data = {};
        return;
      }

      this.dataSchema = this.schemas[value.name];
      this.data = value.data;

      this.iframeScrollToCurrentComponent();
    },
    data(value) {
      if (!this.currentComponent || this.currentComponent.data === value) {
        return;
      }
      this.currentComponent.data = value;
      this.putComponents();
    },
    baseConfig(value, oldValue) {
      if (JSON.stringify(oldValue) === JSON.stringify({})
        || JSON.stringify(value) === JSON.stringify(oldValue)) {
        return;
      }
      this.baseConfig = value;
      this.putBaseConfig();
    },
  },
};
</script>

<style lang="less" scoped>
.page-content {
  height: 100%;
}

.pipline {
  display: flex;
  flex-direction: row;

  &__library-components {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 10%;
    border-right: 1px solid #00000020;
  }

  &__components-selector {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 14%;
    border-right: 1px solid #00000020;
  }

  &__preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 26%;
    border-right: 1px solid #00000020;
  }

  &__fill-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 50%;
    padding: 0 10px;
    overflow: auto;
  }

  &__button_group {
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: center;
  }
}

.page-info {
  height: 457px;
}

.library-components {
  &__list {
    display: flex;
    flex-direction: column;
    margin: 10px 0 0;
    list-style: none;
    padding-left: 0;
    overflow-y: auto;
  }

  &__item {
    margin: 5px 0 0;
  }
}

.components-selector {
  &__list {
    display: flex;
    flex-direction: column;
    margin: 10px 0 0;
    list-style: none;
    padding-left: 0;
    overflow-y: auto;
  }

  &__item {
    margin: 5px 0 0;
  }

  &__button-group {
    display: inline-block;

    .el-button {
      margin-left: 0;
      padding-left: 5px;
      padding-right: 5px;
    }
  }
}

.preview {
  &__page-title {
    margin: 12px 0 2px;
    font-size: 18px;
    font-weight: bold;
  }

  &__iframe {
    margin: 0px 0 0;
    border: 1px solid black;
    width: 375px;
    height: 667px;
  }
}

.fill-info {
  &__form {
    width: 100%;
    margin: 0 0 10px 0;
  }

  &__thumbnail-item {
    display: flex;
    align-items: center;
  }

  &__thumbnail-container {
    border: 1px solid #00000020;
    text-align: center;
    line-height: 175px;
    width: 175px;
    height: 175px;
  }

  &__thumbnail {
    max-width: 175px;
    max-height: 175px;
  }

  &__upload-thumbnail {
    margin: 0 0 0 10px;
  }

  /* 模仿 bootstrap 中的按钮样式 */
  &__upload-button {
    font-size: 14px;
    color: #ffffff;
    background-color: #5bc0de;
    border-color: #46b8da;
  }

  &__button {
    margin: 10px;
  }
}

.form {
  &-json-editor {
    width: 100%;
  }
}
</style>
