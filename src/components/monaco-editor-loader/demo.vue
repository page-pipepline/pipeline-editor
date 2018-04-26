<template>
 <div class="monaco-editor" ref="monacoEditor"></div>
</template>

<script>
import { loadMonaco } from './index';

export default {
  async mounted() {
    const Monaco = await loadMonaco({
      toPath: 'vs',
    });
    this.initEditor(Monaco);
  },
  methods: {
    initEditor(monoco) {
      const editor = monaco.editor.create(this.$refs.monacoEditor, {
        value: [
          'function x() {',
          '\tconsole.log("Hello world!");',
          '}'
        ].join('\n'),
        language: 'javascript'
      });
    },
  },
};
</script>

<style lang="less" scoped>
.monaco-editor {
  width: 600px;
  height: 300px;
  border: 1px solid red;
}
</style>
