<template>
  <div>
    <el-upload
      action=""
      :http-request="upload"
      list-type="picture"
      :multiple="false"
      :show-file-list="showFileList"
      :file-list="fileList"
      :before-upload="beforeUpload"
      :on-remove="handleRemove"
      :on-preview="handlePreview"
    >
      <el-button size="small" type="primary">点击上传</el-button>
      <div slot="tip" class="el-upload__tip">
        只能上传jpg/png文件，且不超过10MB
      </div>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="fileList[0].url" alt="">
    </el-dialog>
  </div>
</template>
<script>
// import { policy } from '@/api/oss'
import { cloud } from '@/api/cloud'
export default {
  name: 'SingleUpload',
  props: {
    // eslint-disable-next-line vue/require-default-prop
    value: String
  },
  data() {
    return {
      dialogVisible: false
      // headers: { ////////???????/
      //     Authorization: "Bearer " + store.getters.access_token,
      // },
    }
  },
  computed: {
    imageUrl() {
      return this.value
    },
    imageName() {
      if (this.value != null && this.value !== '') {
        return this.value.substr(this.value.lastIndexOf('/') + 1)
      } else {
        return null
      }
    },
    fileList() {
      return [
        {
          name: this.imageName,
          url: this.imageUrl
        }
      ]
    },
    showFileList: {
      get: function() {
        return (
          this.value !== null &&
                    this.value !== '' &&
                    this.value !== undefined
        )
      },
      set: function(newValue) {}
    }
  },
  methods: {
    async upload(event) {
      console.log(event)
      const res = await cloud.uploadFile(event.file)
      console.log(res)
      this.showFileList = true
      this.fileList.pop()
      this.fileList.push({
        name: res.data.filename,
        url: res.data.path
      })
      this.emitInput(this.fileList[0].url)
    },
    emitInput(val) {
      this.$emit('input', val)
    },
    handleRemove(file, fileList) {
      this.emitInput('')
    },
    handlePreview(file) {
      this.dialogVisible = true
    },
    beforeUpload(file) {
      // const _self = this
      // return new Promise((resolve, reject) => {
      //   policy().then(response => {
      //     _self.dataObj.policy = response.data.policy
      //     _self.dataObj.signature = response.data.signature
      //     _self.dataObj.ossaccessKeyId = response.data.accessKeyId
      //     _self.dataObj.key = response.data.dir + '/${filename}'
      //     _self.dataObj.dir = response.data.dir
      //     _self.dataObj.host = response.data.host
      //     // _self.dataObj.callback = response.data.callback;
      //     resolve(true)
      //   }).catch(err => {
      //     console.log(err)
      //     reject(false)
      //   })
      // })
    },
    handleUploadSuccess(res, file) {
      console.log(res)
      this.showFileList = true
      this.fileList.pop()
      this.fileList.push({ name: res.data.fileName, url: res.data.url })
      this.emitInput(this.fileList[0].url)
    }
  }
}
</script>
<style>
</style>

