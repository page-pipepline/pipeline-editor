<template>
  <div class="page-content">
    <topbar title="添加页面模板"
      subtitle=""/>
    <div class="template-container">
      <div class="template-form">
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-form-item prop="name" label="模板名称">
            <el-input v-model="form.name" placeholder="请输入模板名称"></el-input>
          </el-form-item>
          <el-form-item label="模板文件">
            <el-button size="small"
              @click="onChooseFile">
              <i class="el-icon-upload el-icon--right"></i>上传模板
            </el-button>
            <span class="template-file-name">{{uploadFileName}}</span>
          </el-form-item>
          <el-form-item prop="thumbnail" label="模板封面">
            <el-button size="small"
              @click="onChooseImage">
              <i class="el-icon-picture el-icon--right"></i>上传封面
            </el-button>
            <image-frame
              :src="form.thumbnail">
            </image-frame>
          </el-form-item>
          <el-form-item label="">
            <el-button type="primary" size="small" @click="onSubmit">添加</el-button>
            <el-button type="" size="small" @click="onBack">返回</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <form id="fileForm" enctype="multipart/form-data">
      <input style="display:none;"
        ref="tplPageFileInput"
        type="file" name="file"
        @change="getFile"/>
      <input style="display:none;"
        ref="tplPageImageInput"
        type="file" name="file"
        @change="getImage"/>
    </form>
  </div>
</template>

<script>
import { APIS } from 'comp/util/constants';
import fetch from 'comp/util/fetch';
import Topbar from 'comp/topbar';
import ImageFrame from 'comp/image-frame';

const defaultImage = 'https://avatars3.githubusercontent.com/u/38666040';
export default {
  name: 'template-add',
  components: {
    topbar: Topbar,
    'image-frame': ImageFrame,
  },
  data() {
    return {
      form: {
        name: '',
        thumbnail: defaultImage,
      },
      rules: {
        name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 16 个字符', trigger: 'blur' }
        ],
      },
      templateId: '',
      uploadFileName: '',
      uploadImageName: '',
    };
  },
  mounted() {
    this.templateId = this.$route.query.templateId;
    this.forEdit = /eidt$/.test(this.$route.path);
  },
  methods: {
    getFile(event) {
      const file = event.target.files[0];
      const fileName = file.name;

      if (!/zip$/.test(fileName)) {
        this.$refs.tplPageFileInput.value = null;
        return this.$message({
          message: '请选择模板压缩包(.zip).',
          type: 'warning',
        });
      }

      // 暂不支持上传超过 10M 的模板
      if (file.size > 1024 * 1024 * 10) {
        return this.$message({
          message: '暂不支持上传超过 10M 的模板.',
          type: 'warning',
        });
      }

      const formData = new FormData();
      formData.append('templateId', this.templateId);
      formData.append('file', file);

      fetch(`${APIS.FILE}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      }).then(() => {
        this.uploadFileName = fileName;
        this.$refs.tplPageFileInput.value = null;
        this.$message({
          message: '上传成功.',
          type: 'success',
        });
      }).catch(() => {
        this.$message({
          message: '上传失败, 请检查网络.',
          type: 'warning',
        });
        this.$refs.tplPageFileInput.value = null;
      });
    },
    getImage() {
      const file = event.target.files[0];
      const fileName = file.name;

      if (!/bmg|gif|jpg|jpeg|pic|png$/i.test(fileName)) {
        this.$refs.tplPageImageInput.value = null;
        return this.$message({
          message: '请选择图片.',
          type: 'warning',
        });
      }

      // 暂不支持上传超过 2M 的图片
      if (file.size > 1024 * 1024 * 2) {
        return this.$message({
          message: '暂不支持上传超过 2M 的图片.',
          type: 'warning',
        });
      }

      const formData = new FormData();
      formData.append('templateId', this.templateId);
      formData.append('file', file);

      this.form.thumbnail = URL.createObjectURL(file);
      fetch(`${APIS.FILE}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      }).then(() => {
        this.uploadImageName = fileName;
        this.$refs.tplPageImageInput.value = null;
        this.$message({
          message: '上传成功.',
          type: 'success',
        });
      }).catch(() => {
        this.form.thumbnail = defaultImage;
        this.$message({
          message: '上传失败, 请检查网络.',
          type: 'warning',
        });
        this.$refs.tplPageImageInput.value = null;
      });
    },
    async onSubmit() {
      const validate = await this.$refs.form.validate().catch(e => e);

      if (!validate) {
        this.$message({
          message: '请先填写表单数据.',
          type: 'warning',
        });
        return;
      }

      if (!this.uploadFileName) {
        this.$message({
          message: '请先上传模板资源文件.',
          type: 'warning',
        });
        return;
      }

      // 表单校验通过, 并且已经上传了模板
      if (validate) {
        fetch(`${APIS.TEMPLATE}`, {
          method: 'POST',
          body: {
            id: this.templateId,
            name: this.form.name,
            fileName: this.uploadFileName,
            imageName: this.uploadImageName,
          },
        }).then(() => {
          this.$message({
            message: '上传模板成功.',
            type: 'success',
          });
          this.clearFormData();
        }).catch((res) => {
          this.$message({
            message: res.errMsg || '上传失败, 请检查网络.',
            type: 'warning',
          });
        });
      }
    },
    onBack() {
      this.$router.replace({
        path: '/template/list',
      });
    },
    onChooseFile() {
      this.$refs.tplPageFileInput.click();
    },
    onChooseImage() {
      this.$refs.tplPageImageInput.click();
    },
    clearFormData() {
      this.form.name = '';
      this.form.thumbnail = '';
      this.uploadFileName = '';
      this.uploadImageName = '';
    },
  },
};
</script>

<style lang="less" scoped>
.page-content {
  height: 100%;
}

.template-container {
  display: flex;
  justify-content: center;
  padding-top: 50px;
}

.template-form {
  width: 600px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  margin: 30px 50px;
}

.template-file-name {
  padding: 0 0 0 10px;
}
</style>
