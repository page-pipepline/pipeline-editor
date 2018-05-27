// 后台接口集合
const APIS = {
  ROOT: `${location.protocol}//172.106.33.34/pipeline-node`,
  // Bypassing "Mixed Content" Error in Github Pages
  PIPLINE: `https://cors-anywhere.herokuapp.com/http://172.106.33.34/pipeline-node/pipeline`,
  // ROOT: 'http://localhost:7001',
  // PIPLINE: 'http://localhost:7001/pipeline',
};

export {
  APIS,
};
