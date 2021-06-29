<template>
  <div class="upload-container">
    <el-button
      :style="{ background: color, borderColor: color }"
      icon="el-icon-upload"
      size="mini"
      type="primary"
      @click="dialogVisible = true"
    >
      upload
    </el-button>
    <el-dialog :visible.sync="dialogVisible">
      <el-upload
        class="editor-slide-upload"
        action=""
        :http-request="upload"
        list-type="picture-card"
      >
        <el-button size="small" type="primary">
          Click upload
        </el-button>
      </el-upload>
      <el-button @click="dialogVisible = false"> Cancel </el-button>
      <el-button type="primary" @click="handleSubmit">
        Confirm
      </el-button>
    </el-dialog>
  </div>
</template>

<script>
// import { getToken } from 'api/qiniu'
import { cloud } from '@/api/cloud'

export default {
  name: 'EditorSlideUpload',
  props: {
    color: {
      type: String,
      default: '#1890ff'
    }
  },
  data() {
    return {
      dialogVisible: false,
      fileList: []
    }
  },
  methods: {
    async upload(event) {
      console.log(event)
      const res = await cloud.uploadFile(event.file)
      console.log(res, 111)
      console.log(this.fileList)
      this.fileList.push({
        name: res.data.filename,
        url: res.data.path
      })
    },
    handleSubmit() {
      this.$emit('successCBK', this.fileList)
      this.fileList = []
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.editor-slide-upload {
    margin-bottom: 20px;
    ::v-deep .el-upload--picture-card {
        width: 100%;
    }
}
</style>
