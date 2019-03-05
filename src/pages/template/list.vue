<template>
  <div class="page-content">
    <topbar title="支持的前端框架模板列表"
      subtitle="pipeline 支持不同前端框架开发的页面模板, 无缝对接业务现有前端技术栈."/>
    <div class="template-container">
      <div class="template-list">
        <div class="template-item"
          v-for="(item) in templateList"
          :key="item.id">
          <div class="template-item__thumbnail">
            <img class="template-item__img" :src="item.thumbnail" />
          </div>
          <div class="template-item__name">{{item.name}}</div>
          <div class="template-item__button-group">
            <div class="template-item__button"
              @click="useTemplate(item)">使用</div>
          </div>
        </div>
        <div class="template-item template-item--add">
            <div class="template-item__button"
              @click="addTemplate">新增模板</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { APIS } from 'comp/util/constants';
import fetch from 'comp/util/fetch';
import Topbar from 'comp/topbar';

export default {
  name: 'template-list',
  components: {
    topbar: Topbar,
  },
  data() {
    return {
      templateList: [],
    };
  },
  methods: {
    async getTemplates() {
      const ret = await fetch(`${APIS.TEMPLATE}`, {
      });
      return ret;
    },
    useTemplate(template) {
      this.$router.push({
        path: `/pipeline?templateId=${template.id}`,
      });
    },
    addTemplate() {
      this.$router.push({
        path: `/template/add`,
      });
    },
  },
  async mounted() {
    this.templateList = await this.getTemplates();
  },
};
</script>

<style lang="less" scoped>
.page-content {
  height: 100%;
}

.template-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  margin: 10px 50px;
}

.template-item {
  display: flex;
  flex-direction: column;
  padding: 10px 20px 30px;

  &__thumbnail {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 196px;
    height: 196px;
    border: 1px solid#66666640;
  }

  &__img {
    max-width: 100%;
    max-height: 100%;
  }

  &__name {
    text-align: center;
    font-weight: bold;
  }

  &__button-group {
    display: flex;
    justify-content: center;
    margin: 2px 0 0;
  }

  &__button {
    background-color: #557e2a;
    color: #FFFFFF;
    border-radius: 3px;
    padding: 1px 8px;
    margin: 0 10px;
    cursor: pointer;
  }
}

.template-item--add {
  justify-content: center;
}
</style>
