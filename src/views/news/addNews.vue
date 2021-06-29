<template>
  <div style="background-color: white; padding: 20px">
    <el-form
      ref="formData"
      :model="info"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="标题:" prop="name">
        <el-input
          v-model="info.name"
          maxlength="200"
          type="text"
          placeholder="请输入资讯标题"
        />
      </el-form-item>
      <el-form-item label="首页资讯封面" prop="coverUrl">
        <single-upload
          :value="info.coverIdxUrl"
          @input="(value) => (info.coverIdxUrl = value)"
        />
      </el-form-item>
      <el-form-item label="内页封面" prop="coverUrl">
        <single-upload
          :value="info.coverUrl"
          @input="(value) => (info.coverUrl = value)"
        />
      </el-form-item>
      <el-form-item label="资讯内容:" prop="content">
        <tinymce v-model="info.content" height="500" />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="submitForm('formData')"
        >提交</el-button>
        <el-button @click="$router.go(-1)">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import singleUpload from '@/components/singleUpload'
import tinymce from '@/components/Tinymce'
import { db } from '@/api/cloud'
export default {
  components: {
    singleUpload,
    tinymce
  },
  data() {
    return {
      info: {
        name: '',
        coverUrl: '',
        content: '',
        created_at: '',
        updated_at: '',
        coverIdxUrl: ''
      },
      rules: {
        name: [
          {
            required: true,
            message: '资讯标题不可为空',
            trigger: 'blur'
          }
        ],
        // coverUrl: [
        //     {
        //         required: true,
        //         message: '资讯封面不可为空',
        //         trigger: 'blur',
        //     },
        // ],
        content: [
          {
            required: true,
            message: '资讯内容不可为空',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  computed: {},
  async created() {
    const result = await db
      .collection('news')
      .where({ _id: this.$route.params.id })
      .get()
    for (const key in this.info) {
      this.info[key] = result.data[0][key]
    }
    console.log(result)
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(async(valid) => {
        if (!valid) return
        this.info.updated_at = Date.now()
        console.log(this.info)
        await db
          .collection('news')
          .where({ _id: this.$route.params.id })
          .update(this.info)
        const reg = /^\/add/g
        if (reg.test(this.$route.path)) {
          this.$message.success('添加成功')
        } else {
          this.$message.success('修改成功')
        }

        this.resetForm(formName)
        this.$router.go(-1)
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>
<style scoped>
</style>
