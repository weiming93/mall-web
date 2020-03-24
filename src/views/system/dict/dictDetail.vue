<template>
  <div>
    <div v-if="dictName === ''">
      <div class="my-code">点击字典查看详情</div>
    </div>
    <div v-else>
      <!--工具栏-->
      <div class="head-container" />

      <!--表单组件-->
      <el-dialog
        append-to-body
        :close-on-click-modal="false"
        :before-close="crud.cancelCU"
        :visible.sync="crud.status.cu > 0"
        :title="crud.status.title"
        width="580px"
      >
        <el-form ref="form" :inline="true" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="字典标签" prop="label">
            <el-input v-model="form.label" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="字典值" prop="value">
            <el-input v-model="form.value" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="排序" prop="sort">
            <el-input-number
              v-model.number="form.sort"
              :min="0"
              :max="999"
              controls-position="right"
              style="width: 370px;"
            />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>

      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" highlight-current-row style="width: 100%;" :data="crud.data">
        <el-table-column label="所属字典">
          {{ dictName }}
        </el-table-column>
        <el-table-column v-if="columns.visible('label')" prop="label" label="字典标签" />
        <el-table-column v-if="columns.visible('value')" prop="value" label="字典值" />
        <el-table-column v-if="columns.visible('sort')" prop="sort" label="排序" />
        <el-table-column
          v-permission="['admin','dictDetail:edit','dictDetail:del']"
          label="操作"
          width="130px"
          align="center"
          fixed="right"
        >
          <template slot-scope="{row}">
            <udOperation
              :data="row"
              :permission="permission"
            />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import crudDictDetail from '@/api/system/dictDetail'
import pagination from '@crud/Pagination'

// crud交由presenter持有
const defaultCrud = CRUD({
  title: '字典详情',
  url: '/system/dictDetail',
  crudMethod: { ...crudDictDetail },
  queryOnPresenterCreated: false
})
const defaultForm = { id: null, label: null, value: null, dict: { id: null }, sort: 999 }

export default {
  mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
  components: { crudOperation, rrOperation, udOperation, pagination },
  data() {
    return {
      permission: {
        add: ['admin', 'dictDetail:add'],
        edit: ['admin', 'dictDetail:edit'],
        del: ['admin', 'dictDetail:del']
      },
      dictName: '',
      rules: {
        label: [
          { required: true, message: '请输入字典标签', trigger: 'blur' }
        ],
        value: [
          { required: true, message: '请输入字典值', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '请输入序号', trigger: 'blur', type: 'number' }
        ]
      }
    }
  },

  methods: {
    [CRUD.HOOK.beforeRefresh](crud) {
      if (this.dictName) {
        this.query['dictName'] = this.dictName
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  /deep/ .el-input-number .el-input__inner {
    text-align: left;
  }
</style>
