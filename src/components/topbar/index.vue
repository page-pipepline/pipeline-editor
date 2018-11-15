<template>
  <div class="topbar">
    <div class="topbar__title">{{title}}</div>
    <div v-if="subtitle" class="topbar__subtitle">{{subtitle}}</div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      requied: true,
    },
    subtitle: {
      type: String,
    },
  },
  data() {
    return {};
  },
};
</script>

<style lang="less" scoped>
.topbar {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  border-bottom: 1px solid #55665580;

  &__title {
    height: 48px;
    line-height: 48px;
    font-size: 24px;
  }

  &__subtitle {
    padding-bottom: 8px;
  }
}
</style>
