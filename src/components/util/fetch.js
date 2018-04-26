import stringify from 'qs/lib/stringify';

export default (api, options = {}) => {
  let url = api;
  // 跨域
  options.credentials = 'include';
  // 处理hearder
  options.headers = options.headers || {};
  if (!options.headers['Content-Type']) {
    options.headers['Content-Type'] = 'application/json';
  }

  // 处理post
  if (options.method && /^POST|PUT|DELETE$/i.test(options.method)) {
    const params = options.body;
    if (options.headers['Content-Type'] === 'application/json') {
      options.body = JSON.stringify(params);
    } else if (options.headers['Content-Type'] === 'multipart/form-data') {
      delete options.headers['Content-Type'];
    } else {
      // 解决多层嵌套数据的问题
      options.body = stringify(params, { arrayFormat: 'brackets', skipNulls: true });
    }
  }

  // 处理get，默认get
  if ((options.method && /^GET$/i.test(options.method)) || options.method === undefined) {
    const params = options.params || options.body || {};
    url += `?${stringify(params, { arrayFormat: 'brackets', skipNulls: true })}`;
    // 解决某些浏览器下请求报错的问题 body not allowed for get or head requests
    options.body = undefined;
  }

  return fetch(url, options)
    .then((response) => {
      if (response.status === 200) {
        return response.json()
          .then((json) => {
            if (json.ret === '0') {
              return Promise.resolve(json.data);
            }
            return Promise.reject({
              status: response.status,
              ...json,
            });
          });
      }
      return Promise.reject({
        status: response.status,
      });
    });
};
