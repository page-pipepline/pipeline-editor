/**
 * use AMD loader to require monaco
 * https://github.com/Microsoft/monaco-editor/issues/18
 * @Author: CntChen
 * @Date: 2017-09-20
 */

let isLoadingAMD = false;

// TODO append as iframe?
export const loadMonaco = options => new Promise((resolve, reject) => {
  const {
    timeout = 5000,
    interval = 20,
    toPath = 'vs',
  } = options;

  const loadInterval = setInterval(() => {
    if (window.monaco) {
      clearInterval(loadInterval);
      resolve(window.monaco);
    }
  }, interval);

  const loadTimeout = setTimeout(() => {
    clearInterval(loadInterval);
    clearTimeout(loadTimeout);
    reject('load monaco timeout');
  }, timeout);

  const onGoAmdLoader = () => {
    if (window.monaco) {
      clearInterval(loadInterval);
      clearTimeout(loadTimeout);
      resolve(window.monaco);
    } else {
      window.require(['vs/editor/editor.main'], () => {
        clearInterval(loadInterval);
        clearTimeout(loadTimeout);
        resolve(window.monaco);
      });
    }
  };

  const insertScript = () => {
    if (!window.require && isLoadingAMD === false) {
      isLoadingAMD = true;
      const loaderScript = document.createElement('script');
      loaderScript.type = 'application/javascript';
      loaderScript.src = `./${toPath}/loader.js`.replace('//', '/');
      loaderScript.addEventListener('load', onGoAmdLoader);
      document.head.appendChild(loaderScript);
    } else if (window.require) {
      onGoAmdLoader();
    }
  };

  insertScript();
});

export default {
  loadMonaco,
};
