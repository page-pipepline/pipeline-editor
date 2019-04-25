<template>
  <div class="image-frame-container" :style="style">
    <img :src="src" :style="imageStyle"/>
  </div>
</template>

<script>
export default {
  props: {
    src: {
      type: String,
      requied: true,
    },
    width: {
      type: Number,
      default: 250,
    },
    height: {
      type: Number,
      default: 250,
    }
  },
  data() {
    return {
      style: {
        width: `${this.width}px`,
        height: `${this.height}px`,
      },
      imageStyle: {
        maxWidth: `${this.width}px`,
        maxHeight: `${this.height}px`,
      }
    };
  },
};
</script>

<style lang="less" scoped>
.image-frame-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  border: 1px solid #55665580;
}
</style>
