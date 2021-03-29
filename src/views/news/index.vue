<template>
  <div class="app-container">
    <!-- 数据检索区 -->
    <!-- <div class="filter-container">
            <el-input
                v-model="listQuery.keyword"
                placeholder="搜索"
                style="width: 200px; margin-right: 10px"
                class="filter-item"
                @keyup.enter.native="handleFilter"
            />
            <el-button
                class="filter-item"
                type="primary"
                icon="el-icon-search"
                @click="handleFilter"
            >
                搜索
            </el-button>
        </div> -->
    <div style="margin-bottom: 20px">
      <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-plus"
        @click="handleAdd"
      >添加</el-button>
    </div>
    <!-- 表格 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column label="ID" prop="id" align="center" width="240">
        <template slot-scope="scope">
          <span>{{ scope.row._id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" min-width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="封面" class-name="封面" width="240">
        <template slot-scope="scope">
          <img
            :src="scope.row.coverUrl"
            alt=""
            style="max-height: 80px; max-width: 100px"
          >
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="150px" align="center">
        <template slot-scope="{ row }">
          <span v-if="row.created_at">{{
            row.created_at | parseTime('{y}-{m}-{d} {h}:{i}')
          }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="150px" align="center">
        <template slot-scope="{ row }">
          <span v-if="row.updated_at">{{
            row.updated_at | parseTime('{y}-{m}-{d} {h}:{i}')
          }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        width="340"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row, $index }">
          <el-button
            type="text"
            size="mini"
            @click="showUpdateForm(row)"
          >
            编辑
          </el-button>
          <el-button
            size="mini"
            type="text"
            @click="handleDelete(row, $index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      :title="form.name ? '新增' : '修改'"
      :visible.sync="dialogFormVisible"
    >
      <el-form ref="dataForm" :model="form" :rules="rules">
        <el-form-item label="文章标题" label-width="100px">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancle">取 消</el-button>
        <el-button
          type="primary"
          @click="submit_f('dataForm')"
        >确 定</el-button>
      </div>
    </el-dialog>
    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { db } from '@/api/cloud'
// @TODO
// 默认化创建表单的值
// const defaultFormValue = {
//     _id: undefined,
//     name: '',
//     coverUrl: '',
//     content: '',
//     created_at: Date.now(),
//     updated_at: Date.now(),
// }

// @TODO
// 表单验证规则
const formRules = {
  name: [{ required: true, message: '资讯标题不可为空', trigger: 'blur' }]
}

export default {
  name: 'NewsListPage',
  components: { Pagination },
  // filters: {
  //   statusFilter(status) {
  //     status = status ?? 0
  //     // @TODO
  //     // 状态映射表
  //     const statusMap = {
  //       0: 'published'
  //     }
  //     return statusMap[status]
  //   }
  // },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        keyword: undefined
      },
      form: {
        name: '',
        coverUrl: '',
        content: '',
        created_at: Date.now(),
        updated_at: Date.now()
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: formRules,
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    cancle() {
      this.dialogFormVisible = false
      this.form.name = ''
    },
    showUpdateForm(row) {
      console.log(row)
      if (row.coverUrl) {
        // 编辑
        this.$router.push({ path: `/edit/newsEdit/${row._id}` })
      } else {
        this.$router.push({ path: `/add/newsAdd/${row._id}` })
      }
    },
    async submit_f() {
      // 资讯的首次添加  标题
      this.$refs['dataForm'].validate(async(valid) => {
        if (!valid) {
          return
        }
        this.form.created_at = Date.now()
        await db.collection('news').add({
          name: this.form.name,
          created_at: this.form.created_at
        })
        this.dialogFormVisible = false
        await this.getList()
        this.$message.success('添加成功')
        this.form.name = ''
        this.form.created_at = ''
      })
      // await db.collection('news').add({ name: this.form.name })
      // this.dialogFormVisible = false
      // this.$message.success('添加成功')
      // this.form.name = ''
    },
    handleAdd() {
      // 文章添加
      this.dialogFormVisible = true
    },
    /**
         * 获取数据列表
         */
    async getList() {
      this.listLoading = true

      // 拼装查询条件 by this.listQuery
      const { limit, page, keyword } = this.listQuery
      const query = {}
      if (keyword) {
        query['$or'] = [
          { name: db.RegExp({ regexp: `.*${keyword}.*` }) },
          { label: db.RegExp({ regexp: `.*${keyword}.*` }) },
          { description: db.RegExp({ regexp: `.*${keyword}.*` }) }
        ]
      }

      // 执行数据查询
      const res = await db
        .collection('news')
        .where(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .get()
        .catch(() => {
          this.listLoading = false
        })

      this.list = res.data

      // 获取数据总数
      const { total } = await db
        .collection('news')
        .where(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .count()
        .catch(() => {
          this.listLoading = false
        })

      this.total = total
      this.listLoading = false
    },
    // 搜索
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // // 显示创建表单
    // showCreateForm() {
    //   this.dialogStatus = 'create'
    //   this.dialogFormVisible = true
    //   this.$nextTick(() => {
    //     this.$refs['dataForm'].clearValidate()
    //   })
    // },
    // 创建请求
    handleCreate() {
      this.$refs['dataForm'].validate(async(valid) => {
        if (!valid) {
          return
        }
        // 执行创建请求
        const r = await db.collection('news').add(this.form)
        if (!r.id) {
          this.$notify({
            type: 'error',
            title: '操作失败',
            message: '创建失败！' + r.error
          })
          return
        }
        this.$notify({
          type: 'success',
          title: '操作成功',
          message: '创建成功！'
        })

        this.getList()
        this.dialogFormVisible = false
      })
    },
    // 显示更新表单
    goDetail(row) {
      this.$router.push({ path: `/news/edit/${row._id}` })
    },
    // 更新请求
    handleUpdate() {
      this.$refs['dataForm'].validate(async(valid) => {
        if (!valid) {
          return
        }

        // @TODO
        // 构建更新数据对象
        const data = {
          name: this.form.name,
          content: this.form.content,
          coverUrl: this.form.coverUrl,
          updated_at: Date.now()
        }

        // 执行更新请求
        const r = await db
          .collection('news')
          .where({ _id: this.form._id })
          .update(data)

        if (!r.ok) {
          this.$notify({
            type: 'error',
            title: '操作失败',
            message: '更新失败！' + r.error
          })
          return
        }

        this.$notify({
          type: 'success',
          title: '操作成功',
          message: '更新成功！'
        })

        this.getList()
        this.dialogFormVisible = false
      })
    },
    // 删除请求
    async handleDelete(row, index) {
      await this.$confirm('确认要删除此数据？', '删除确认')

      // 执行删除请求
      const r = await db
        .collection('news')
        .where({ _id: row._id })
        .remove()

      if (!r.ok) {
        this.$notify({
          type: 'error',
          title: '操作失败',
          message: '删除失败！' + r.error
        })
        return
      }

      this.$notify({
        type: 'success',
        title: '操作成功',
        message: '删除成功！'
      })

      this.list.splice(index, 1)
    },
    // 查看详情
    async handleShowDetail(row) {
      // @TODO
      // 跳转到详情页
      // this.$router.push(`news/${row._id}`)
    }
  }
}
</script>
