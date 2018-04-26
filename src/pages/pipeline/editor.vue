<template>
<div>
  <div class="page-content pipline">
    <div class="pipline__components-selector">
      <h3>模板区块</h3>
      <div class="components-selector__list">
        <div class="components-selector__item"
          v-for="component in templateComponents"
          :key="component.id">
          <el-button
            :type="getComponentSelectorButtonType(component)"
            size="small"
            icon="el-icon-menu"
            @click.native="selectComponent(component)">
            {{component.title}}
          </el-button>
        </div>
      </div>
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
    </div>
  </div>
</div>
</template>

<script>
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
      data: {},
      dataSchema: {},
      schemas: {},
      baseConfig: {},
      baseConfigSchema: {},
      baseConfigSchemaEarly: {},
      templateComponents: [],
      currentComponent: null,
      previewSrc: '',
      formName: 'pageBaseConfig',
      pageBaseUrl: '',
    };
  },
  methods: {
    async prepareFromTemplate() {
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
      const ret = await fetch(`${APIS.PIPLINE}/baseConfig`, {
        method: 'PUT',
        body: {
          pageId: this.pageId,
          baseConfig: this.baseConfig,
        },
      });

      this.refreshPreviewIframe();
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
    async putComponents() {
      const ret = await fetch(`${APIS.PIPLINE}/templateComponents`, {
        method: 'PUT',
        body: {
          pageId: this.pageId,
          templateComponents: this.templateComponents,
        },
      });

      this.refreshPreviewIframe();
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
    refreshPreviewIframe() {
      this.$refs.previewIframe.onload = this.iframeScrollToCurrentComponent;
      this.$refs.previewIframe.src = this.previewSrc;
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
      switch(tab.name) {
        case 'pageConfig':
          this.selectDefaultComponent();
          break;
        default:
          break;
      };
      this.formName = tab.name;
    },
    tabToPageConfig() {
      this.formName = 'pageConfig';
    },
    getComponentSelectorButtonType(component) {
      return (this.currentComponent && this.currentComponent.id === component.id) ? 'primary' : 'normal';
    },
  },
  async mounted() {
    this.templateId = this.$route.params.id;
    this.purpose = this.$route.query.purpose;

    await this.prepareFromTemplate();
    await this.getBaseConfigSchema();
    await this.getBaseConfig();
    // 用 baseConfigSchemaEarly 解决数据和约束不在一个 Vue 渲染周期内导致的校验报错
    this.baseConfigSchema = this.baseConfigSchemaEarly;
    await this.getComponentsSchema();
    await this.getTemplateComponents();
  },
  watch: {
    templateComponents(value, oldValue) {
      if (!this.currentComponent) {
        this.selectDefaultComponent();
      } else {
        const componentsWithId = value.filter((item) => item.id === this.currentComponent.id);
        if (componentsWithId.length > 0) {
          this.currentComponent = componentsWithId[0];
        } else {
          this.selectDefaultComponent();
        }
      }
    },
    currentComponent() {
      this.dataSchema = this.schemas[this.currentComponent.name];
      this.data = this.currentComponent.data;
      this.iframeScrollToCurrentComponent();
    },
    data(value, oldValue) {
      if (this.currentComponent.data === this.data) {
        return;
      }
      this.currentComponent.data = this.data;
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
  }
};
</script>
<style lang="less" scoped>
.pipline {
  display: flex;
  flex-direction: row;
  height: 100%;

  &__components-selector {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 15%;
    border-right: 1px solid #00000020;
  }

  &__preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 30%;
    border-right: 1px solid #00000020;
  }

  &__fill-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 55%;
    padding: 0 10px;
    overflow: auto;
  }
}

.components-selector {
  &__list {
    display: flex;
    flex-direction: column;
    margin: 10px 0 0;
  }

  &__item {
    margin: 5px 0 0;
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
