<template>
<div>
  <div class="editor"
    ref="editor">
    <div class="editor__monaco"
      @wheel.prevent
      v-show="isShowCode"
      ref="monacoEditor">
    </div>
    <div class="editor__json"
      @wheel="onWheel($event, $refs.jsonEditor)"
      @click="onJsonEditorClick($event)"
      v-show="isShowForm"
      ref="jsonEditor">
    </div>
  </div>
  <div class="error-line"
    v-if="errorMessage">
    <p>Eclipse: {{errorMessage}}</p>
  </div>
  <div class="editor__button-group">
    <div class="editor__button-group__left">
      <el-button
        size="small"
        icon="el-icon-upload"
        @click="comfirmObject">
        提交配置数据
      </el-button>
      <el-button
        class="element-hidden"
        type="warning"
        size="small"
        @click="resetObject">
        重置表单数据
      </el-button>
    </div>
    <div class="editor__button-group__right element-hidden">
      <el-button size="small"
        @click="showBoth">
        代码和表单
      </el-button>
      <el-button size="small"
        @click="showCode">
        只看代码
      </el-button>
      <el-button size="small"
        @click="showForm">
        只看表单
      </el-button>
    </div>
  </div>
</div>
</template>

<script>
import JSON5 from 'json5';
import JSONEditor from 'comp/json-editor-class';
import { loadMonaco } from 'comp/monaco-editor-loader';

((JSONEditorClass) => {
  JSONEditorClass.defaults.language = 'zh';
  JSONEditorClass.defaults.languages.zh = {
    button_collapse: '折叠',
    button_expand: '展开',
    button_move_down_title: '下移',
    button_move_up_title: '上移',
    button_add_row_title: '添加{{0}}',
    button_delete_row_title: '删除{{0}}',
    button_delete_last_title: '删除末尾{{0}}',
    button_delete_all_title: '删除全部',
    custom_set_image: '设置图片',
    custom_set_url: '设置链接',
  };
})(JSONEditor);

export default {
  components: {
  },
  props: {
    data: {
      required: true,
    },
    dataSchema: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      MonacoEditor: null,
      JsonEditor: null,
      primeData: {},
      primeDataSchema: {},
      dataString: '',
      errorMessage: '',
      editorHeight: 0,
      jsonEditorDefaultString: '',
      isShowCode: false,
      isShowForm: true,
      currentEditorPath: '',
      currentUploadImgUrl: '',
      showUploadImgDialog: false,
      currentUploadSrcURL: '',
      showUploadSrcDialog: false,
    };
  },
  async mounted() {
    this.primeData = this.dataRestorSpread(this.data);
    this.primeDataSchema = { ...this.dataSchema };
    this.dataString = this.getDataString(this.primeData);

    // Initialize the editor
    const Monaco = await loadMonaco({
      toPath: 'vs',
    });
    this.MonacoEditor = this.initMonacoEditor(Monaco, this.$refs.monacoEditor);
    this.MonacoEditor.setValue(this.dataString);
    this.MonacoEditor.onDidChangeModelContent(() => {
      this.dataString = this.MonacoEditor.getValue();
    });

    this.JsonEditor = this.initJsonEditor(this.primeDataSchema, this.$refs.jsonEditor);
    this.setJsonEditorValue(this.primeData);
    this.jsonEditorDefaultString = JSON.stringify(this.JsonEditor.getValue());
    this.JsonEditor && this.JsonEditor.on('change', this.jsonEditorChangeHandler);

    // for resize detection
    this.editorHeight = this.$refs.editor.clientHeight;
  },
  methods: {
    initMonacoEditor(monaco, ele) {
      const editor = monaco.editor.create(ele, {
        language: 'java',
        scrollBeyondLastLine: false,
        minimap: {
          enabled: false,
        },
      });
      return editor;
    },
    initJsonEditor(schema, ele) {
      if (!this.schemaValidate(schema)) {
        this.$message.error(this.errorMessage);
        return null;
      }

      ele.innerHTML = '';
      const editor = new JSONEditor(ele, {
        schema,
        theme: 'bootstrap3',
        disable_edit_json: true,
        disable_properties: true,
        no_additional_properties: true,
      });
      return editor;
    },
    jsonEditorChangeHandler() {
      if (!this.JsonEditor || !this.JsonEditor.getValue) {
        return;
      }
      const newData = this.JsonEditor.getValue();
      if (!this.dataValidate(newData)) {
        return;
      }
      // ${newData} pass validation
      // ${primeData} validated change will always change this.JsonEditor value
      // so if ${primeData} pass validation, ${newData} is a patch change from ${primeData}, can directly set to ${primeData}
      if (this.dataValidate(this.primeData)) {
        // fixbug: array `move down`/`move up`, primeData become newData immediately
        this.primeData = JSON.parse(JSON.stringify(newData));
      } else if( JSON.stringify(newData) !== this.JsonEditorDefaultString) {
        this.$message.error('在表单中编辑数据前, 请在代码中的配置数据编辑到与数据约束匹配.');
      }
      this.jsonEditorDefaultString = newData;
    },
    getDataString(data) {
      return JSON5.stringify(data, null, 2);
    },
    getJsonEditorValueByPath(path) {
      const name = this.JsonEditor && this.JsonEditor.getEditor(path);
      if (name) {
        return name.getValue();
      }
      return null;
    },
    setJsonEditorValueByPath(path, value) {
      const name = this.JsonEditor && this.JsonEditor.getEditor(path);
      if (name) {
        name.setValue(value);
        return true;
      }
      return false;
    },
    setJsonEditorValue(value) {
      if (this.dataValidate(value)
        && this.JsonEditor
        && this.JsonEditor.getValue
        && JSON.stringify(value) !== JSON.stringify(this.JsonEditor.getValue())) {
        this.JsonEditor.setValue(value);
        return true;
      }
      return false;
    },
    setMonacoEditorValue(value) {
      if (!this.MonacoEditor) return false;

      const position = this.MonacoEditor.getPosition && this.MonacoEditor.getPosition();

      if (this.MonacoEditor.getValue && this.MonacoEditor.getValue() !== this.dataString) {
        this.MonacoEditor.setValue && this.MonacoEditor.setValue(this.dataString);
        // keep cursor position
        this.MonacoEditor.setPosition && this.MonacoEditor.setPosition(position);
        return true;
      }
      return false;
    },
    dataValidate(value) {
      const editor = new JSONEditor(document.createElement('div'), {
        schema: this.primeDataSchema,
        required_by_default: true,
        no_additional_properties: true,
      });
      const error = editor.validate(value);
      if (error && error.length) {
        this.errorMessage = error.map(item => `${item.path} ==> ${item.message}`).join('<br/>');
        return false;
      }
      return true;
    },
    schemaValidate(schema) {
      try {
        new JSONEditor(document.createElement('div'), { schema });
        this.errorMessage = '';
        return true;
      } catch (e) {
        this.errorMessage = e.toString();
        return false;
      }
    },
    comfirmObject() {
      try {
        this.primeData = JSON5.parse(this.dataString);
      } catch (e) {
        this.$message.error(e.toString());
        return;
      }

      if (!this.dataValidate(this.primeData)) {
        this.$message.error(this.errorMessage);
        return;
      }

      this.$emit('update:data', this.primeData);
      this.$message.success('配置数据修改已确认.');
    },
    resetObject() {
      this.primeData = this.dataRestorSpread(this.data);
      this.dataString = this.getDataString(this.primeData);
      this.setMonacoEditorValue(this.dataString);
      this.setJsonEditorValue(this.primeData);
      // TODO reset monaco editor size
    },
    reCreateJsonEditor() {
      if(!this.JsonEditor) return;
      this.JsonEditor.off('change', this.jsonEditorChangeHandler);
      this.JsonEditor.destroy();
      this.JsonEditor = null;
      this.JsonEditor = this.initJsonEditor(this.primeDataSchema, this.$refs.jsonEditor);
      this.setJsonEditorValue(this.primeData);
      this.JsonEditor && this.JsonEditor.on('change', this.jsonEditorChangeHandler);
    },
    dataRestorSpread(source) {
      if (source instanceof Array) return [ ...source ];
      if (source instanceof Object) return { ...source };
      return source;
    },
    showBoth() {
      // force code div relayout, otherwise the CSS flex layout fail, I don't know why...
      this.$refs.monacoEditor.style.width = '0px';
      this.isShowCode = true;
      this.isShowForm = true;
      setTimeout(() => {
        this.MonacoEditor.layout();
      }, 200);
    },
    showCode() {
      this.isShowForm = false;
      this.isShowCode = true;
      setTimeout(() => {
        this.MonacoEditor.layout();
      }, 200);
    },
    showForm() {
      this.isShowCode = false;
      this.isShowForm = true;
      setTimeout(() => {
        this.MonacoEditor.layout();
      }, 200);
    },
    onWheel(event, target) {
      event.stopPropagation();
      if ((event.wheelDeltaY > 0 && target.scrollTop <= 0)
        || (event.wheelDeltaY < 0 && (target.clientHeight + target.scrollTop >= target.scrollHeight))) {
        event.preventDefault();
      }
    },
    onJsonEditorClick(event) {
      if (!event.srcElement.className.split(' ').includes('custom-button')) {
        return;
      }

      const inputFormat = event.srcElement.getAttribute('data-format');
      const inputPath = event.srcElement.getAttribute('data-path');

      // 清空当前编辑字段路径
      this.currentEditorPath = '';
      switch (inputFormat) {
        case 'custom-image':
          console.log(inputFormat, inputPath);
          this.currentEditorPath = inputPath;
          this.showUploadImgDialog = true;
          this.currentUploadImgUrl = this.getJsonEditorValueByPath(inputPath);
          break;
        case 'custom-url':
          console.log(inputFormat, inputPath);
          this.currentEditorPath = inputPath;
          this.currentUploadSrcURL = this.getJsonEditorValueByPath(inputPath);
          this.showUploadSrcDialog = true;
          break;
        default:
          break;
      }
    },
    getUploadImg(img) {
      this.setJsonEditorValueByPath(this.currentEditorPath, img.url);
    },
    getUploadSrcURL(url) {
      this.setJsonEditorValueByPath(this.currentEditorPath, url);
    },
  },
  watch: {
    dataSchema() {
      this.primeDataSchema = { ...this.dataSchema };
      this.reCreateJsonEditor();
    },
    data() {
      this.primeData = this.dataRestorSpread(this.data);
    },
    dataString(value) {
      this.errorMessage = '';
      try {
        this.primeData = JSON5.parse(value);
      } catch (e) {
        this.errorMessage = e.toString();
      }
    },
    primeData(value, oldValue) {
      if (JSON.stringify(value) === JSON.stringify(oldValue)) {
        this.dataValidate(value);
        return value;
      }
      this.dataString = this.getDataString(value);
      this.setJsonEditorValue(value);
      this.setMonacoEditorValue(this.dataString);
      this.editorHeight = this.$refs.jsonEditor.clientHeight;
    },
    editorHeight(value, old) {
      if (old !== 0) {
        this.MonacoEditor.layout();
      }
    },
  },
};
</script>

<style lang="less" scoped>
/* 局部化, 避免全局污染 */
.editor /deep/ .editor__json {
  @import '~bootstrap/less/bootstrap.less';

  /* 用 less 做局部化要做一点修复, 原因不明 */
  .row {
    margin: 0;
  }
}

.editor {
  &__button-group {
    display: flex;
    justify-content: space-between;
    margin: 15px 0 10px;
  }
  &__button-group--right {
    justify-content: flex-end;
  }
}

.editor {
  display: flex;
  min-height: 400px;
  box-sizing: border-box;

  &__monaco {
    flex-basis: 40%;
    flex-grow: 1;
    box-sizing: border-box;
    border: 1px solid red;
  }
  &__json {
    overflow: auto;
    max-height: 700px;
    flex-basis: 60%;
    flex-grow: 1;
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid #0000FF50;
  }
}

.element-hidden {
  display: none;
}

.error-line {
  font-size: 14px;
  color: red;
}
</style>
