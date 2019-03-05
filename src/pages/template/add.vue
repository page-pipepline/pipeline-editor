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
              <i class="el-icon-upload el-icon--right"></i>上传
            </el-button>
            <span class="template-file-name">{{uploadFileName}}</span>
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
        @change="getFile"
        id="tplPageFileInput"/>
    </form>
  </div>
</template>

<script>
import { APIS } from 'comp/util/constants';
import fetch from 'comp/util/fetch';
import Topbar from 'comp/topbar';

export default {
  name: 'template-add',
  components: {
    topbar: Topbar,
  },
  data() {
    return {
      form: {
        name: '',
      },
      rules: {
        name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 16 个字符', trigger: 'blur' }
        ],
      },
      templateId: '',
      uploadFileName: '',
    };
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
      formData.append('file', file);

      fetch(`${APIS.FILE}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      }).then(res => {
        this.templateId = res.templateId;
        this.uploadFileName = fileName;
        this.$refs.tplPageFileInput.value = null;
      }).catch(e => {
        this.$message({
          message: '上传失败, 请检查网络.',
          type: 'warning',
        });
        this.$refs.tplPageFileInput.value = null;
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

      if (!this.templateId) {
        this.$message({
          message: '请先上传模板资源文件.',
          type: 'warning',
        });
        return;
      }

      // 表单校验通过, 并且已经上传了模板
      if (validate && this.templateId) {
        // TODO 添加模板
        fetch(`${APIS.TEMPLATE}`, {
          method: 'POST',
          body: {
            id: this.templateId,
            name: this.form.name,
            fileName: this.uploadFileName,
          },
        }).then(res => {
          this.$message({
            message: '上传模板成功.',
            type: 'success',
          });
          this.clearFormData();
        }).catch(e => {
          this.$message({
            message: '上传失败, 请检查网络.',
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
      document.getElementById("tplPageFileInput").click();
    },
    clearFormData() {
      this.form.name = '';
      this.uploadFileName = '';
      this.templateId = '';
    }
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
