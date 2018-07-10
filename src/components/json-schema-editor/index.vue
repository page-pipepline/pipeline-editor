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
      <el-button type="primary" size="small"
        @click="comfirmObject">
          确认
      </el-button>
      <el-button type="warning" size="small"
        @click="resetObject">
          重置
      </el-button>
    </div>
    <div class="editor__button-group__right"
      v-if="showFormatButtons">
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

export default {
  props: {
    data: {
      required: true,
    },
    dataSchema: {
      type: Object,
      required: true,
    },
    showFormat: {
      type: String,
      default: 'showCode',
    },
    showFormatButtons: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      MonacoEditor: null,
      JsonEditor: null,
      primeData: {},
      primeDataSchema: {},
      schemaString: '',
      errorMessage: '',
      editorHeight: 0,
      isShowCode: this.showFormat === 'showBoth' || this.showFormat === 'showCode',
      isShowForm: this.showFormat === 'showBoth' || this.showFormat === 'showForm',
    };
  },
  async mounted() {
    this.primeData = this.dataRestorSpread(this.data);
    this.primeDataSchema = { ...this.dataSchema };
    this.schemaString = this.getSchemaString(this.dataSchema);

    // Initialize the editor
    const Monoco = await loadMonaco({
      toPath: 'vs',
    });
    this.MonacoEditor = this.initMonacoEditor(Monoco, this.$refs.monacoEditor);
    this.MonacoEditor.setValue(this.schemaString);
    this.MonacoEditor.onDidChangeModelContent(() => {
      this.schemaString = this.MonacoEditor.getValue();
    });

    this.JsonEditor = this.initJsonEditor(this.primeDataSchema, this.$refs.jsonEditor);

    // for resize detection
    this.editorHeight = this.$refs.editor.clientHeight;
  },
  methods: {
    initMonacoEditor(monoco, ele) {
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
        no_additional_properties: true,
        disable_array_add: true,
        disable_array_delete: true,
      });
      return editor;
    },
    getSchemaString(dataSchema) {
      return JSON5.stringify(dataSchema, null, 2);
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
        this.primeDataSchema = JSON5.parse(this.schemaString);
      } catch (e) {
        this.$message.error(e.toString());
        return;
      }

      try {
        new JSONEditor(document.createElement('div'), {
          schema: this.primeDataSchema,
        });
      } catch (e) {
        this.$message.error(e.toString());
        return;
      }

      this.$emit('update:dataSchema', this.primeDataSchema);
      this.$message.success('配置数据约束修改已确认');
    },
    resetObject() {
      this.schemaString = this.getSchemaString(this.dataSchema);
      this.MonacoEditor && this.MonacoEditor.setValue && this.MonacoEditor.setValue(this.schemaString);
      // TODO reset monaco editor size
    },
    recreateJsonEditor() {
      if (this.JsonEditor) {
        this.JsonEditor.destroy();
        this.JsonEditor = null;
      }
      this.JsonEditor = this.initJsonEditor(this.primeDataSchema, this.$refs.jsonEditor);
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
  },
  watch: {
    data() {
      this.primeData = this.dataRestorSpread(this.data);
    },
    dataSchema() {
      this.primeDataSchema = { ...this.dataSchema };
      this.resetObject();
    },
    schemaString(value) {
      try {
        this.primeDataSchema = JSON5.parse(value);
        this.errorMessage = '';
      } catch (e) {
        this.errorMessage = e.toString();
      }
    },
    primeDataSchema() {
      this.recreateJsonEditor();
      this.editorHeight = this.$refs.jsonEditor.clientHeight;
    },
    editorHeight(value, old) {
      if (old !== 0) {
        this.MonacoEditor && this.MonacoEditor.layout();
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import 'bootstrap/dist/css/bootstrap.min.css';

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
    max-height: 720px;
    flex-grow: 1;
    flex-basis: 60%;
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid blue;
  }
}

.error-line {
  font-size: 14px;
  color: red;
}
</style>
