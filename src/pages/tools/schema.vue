<template>
<div>
  <h2 class="page-title">配置数据校验助手</h2>
  <div class="page-content tools-schema">
    <div class="json-schema-container">
      <h3>配置数据约束</h3>
      <json-schema-editor
        :data.sync="data"
        :dataSchema.sync="dataSchema"
        :showFormatButtons="false"/>
    </div>
    <div class="json-container">
      <h3>配置数据</h3>
      <json-editor
        :data.sync="data"
        :dataSchema.sync="dataSchema"
        showFormat="showBoth"
        :showFormatButtons="false"/>
    </div>
  </div>
  <h4 class="page-footer">首先编辑配置数据约束，然后点击“确认”；再编辑配置数据，然后点击“提交配置数据”，此时提示”配置数据修改已确认“，则配置数据校验成功。</h4>
</div>
</template>

<script>
import JSONEditorClass from 'comp/json-editor-class';
import JsonSchemaEditor from 'comp/json-schema-editor';
import JsonEditor from 'comp/json-editor';

export default {
  components: {
    'json-schema-editor': JsonSchemaEditor,
    'json-editor': JsonEditor,
  },
  data() {
    return {
      data: {
        imagedemo: 'https://avatars3.githubusercontent.com/u/38666040',
        colordemo: '#199002',
        urldemo: 'https://github.com/page-pipepline',
        arraydemo: [{
          name: 'hello',
          word: 'pipeline',
        }, {
          name: 'hello',
          word: 'world',
        }],
      },
      dataSchema: {
        title: '组件配置示例',
        type: 'object',
        properties: {
          imagedemo: {
            type: 'string',
            description: '自定义图片',
            default: 'https://avatars3.githubusercontent.com/u/38666040',
          },
          colordemo: {
            type: 'string',
            description: '自定义颜色',
            default: '#199002',
            format: 'color',
          },
          urldemo: {
            type: 'string',
            description: '自定义链接',
            default: 'https://github.com/page-pipepline',
          },
          arraydemo: {
            type: 'array',
            description: '数组类型数据',
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                },
                word: {
                  type: 'string',
                },
              },
            },
            default: [],
          },
        },
      },
    };
  },
  methods: {
    dataValidate(data, dataSchema) {
      const editor = new JSONEditorClass(document.createElement('div'), {
        schema: dataSchema,
        required_by_default: true,
        no_additional_properties: true,
      });
      const error = editor.validate(data);
      if (error && error.length) {
        const errorMessage = error.map(item => `${item.path} ==> ${item.message}`).join('<br/>');
        this.$message.error(errorMessage);
        return false;
      }
      return true;
    },
  },
};
</script>

<style lang="less" scoped>
.page-title {
  margin: 0 auto;
  padding: 15px;
  text-align: center;
}
.tools-schema {
  padding: 0 20px;
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.json-schema-container {
  min-width: 500px;
  margin-right: 40px;
}
.json-container {
  flex-grow: 1;
  min-width:600px;
  max-width: 1200px;
}
.page-footer {
  margin: 0 auto;
  padding-bottom: 20px;
  text-align: center;
}
</style>
