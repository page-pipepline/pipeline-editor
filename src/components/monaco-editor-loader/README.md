# monaco-editor-loader for vue 
in browser use AMD loader to require monaco-editor

## Prepare
> https://github.com/Microsoft/monaco-editor/issues/18

* install monaco-editor
```
npm install monaco-eidtor --save-dev
```

* copy files to dist
```
new CopyWebpackPlugin([
  {
    from: 'path/to/node_modules/monaco-editor/min/vs',
    to: 'vs',
  }
]),
```
directory `vs` will use in `loadMonaco`.

## Usage
* import loader function
```
import { loadMonaco } from 'path/to/monaco-editor-loader/index.js';
```

* get `monaco` and use it as it's document say
```js
export default {
  async mounted() {
    const monaco = await loadMonaco({
      toPath: 'vs',
    });
  },
};
```

## Demo
import deom as vue component and use it
```js
import MonacoEditor from 'path/to/monaco-editor-loader/demo.vue';
export default {
  components: {
    'monaco-editor': MonacoEditor,
  },
};
```

```html
<template>
  <div>
    <monaco-editor />
  </div>
</template>
```

## EOF
