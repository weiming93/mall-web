<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--工具栏-->
      <div class="head-container">
        <div v-if="crud.props.searchToggle">
          <!-- 搜索 -->
          <el-input
            v-model="query.name"
            clearable
            size="small"
            placeholder="输入名称搜索"
            style="width: 200px;"
            class="filter-item"
            @keyup.enter.native="crud.toQuery"
          />

          <rrOperation :crud="crud" />
        </div>
        <crudOperation show="" :permission="permission" />
      </div>
      <!--表单渲染-->
      <el-dialog
        append-to-body
        :close-on-click-modal="false"
        :before-close="crud.cancelCU"
        :visible.sync="crud.status.cu > 0"
        :title="crud.status.title"
        width="570px"
      >
        <el-form ref="form" :inline="false" :model="form" :rules="rules" size="small" label-width="100px">
          <el-form-item label="品牌名称" prop="name">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="品牌首字母" prop="letter">
            <el-input v-model.number="form.letter" />
          </el-form-item>
          <el-form-item label="品牌LOGO" prop="logo">
            <Upload v-model="form.logo" />
          </el-form-item>
          <el-form-item label="品牌专区大图" prop="bigPic">
            <Upload v-model="form.bigPic" />
          </el-form-item>

          <el-form-item label="品牌故事" prop="brandStory">
            <el-input
              v-model="form.brandStory"
              type="textarea"
              :rows="3"
              placeholder="请输入内容"
            />
          </el-form-item>

          <el-form-item label="排序" prop="sort">
            <el-input-number
              v-model.number="form.sort"
              :min="0"
              controls-position="right"
              style="width: 178px;"
            />
          </el-form-item>

          <el-form-item label="是否显示:">
            <el-radio-group v-model="form.visibled">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="品牌制造商:">
            <el-radio-group v-model="form.brandFactory">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table
        ref="table"
        v-loading="crud.loading"
        :data="crud.data"
        style="width: 100%;"
        @selection-change="crud.selectionChangeHandler"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column v-if="columns.visible('name')" :show-overflow-tooltip="true" prop="name" label="品牌名称" />
        <el-table-column
          v-if="columns.visible('letter')"
          :show-overflow-tooltip="true"
          prop="letter"
          label="品牌首字母"
        />
        <el-table-column
          v-if="columns.visible('sort')"
          :show-overflow-tooltip="true"
          prop="sort"
          label="排序"
        />

        <el-table-column v-if="columns.visible('brandFactory')" label="品牌制造商" align="center" prop="brandFactory">
          <template slot-scope="{row}">
            <el-switch
              v-model="row.brandFactory"
              active-color="#409EFF"
              inactive-color="#F56C6C"
              @change="changeBrandFactory(row, row.brandFactory)"
            />
          </template>
        </el-table-column>

        <el-table-column v-if="columns.visible('visibled')" label="是否显示" align="center" prop="visibled">
          <template slot-scope="{row}">
            <el-switch
              v-model="row.visibled"
              active-color="#409EFF"
              inactive-color="#F56C6C"
              @change="changeVisibled(row, row.visibled)"
            />
          </template>
        </el-table-column>
        <el-table-column
          v-permission="['admin','brand:edit','brand:del']"
          label="操作"
          width="125"
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

    </el-row>
  </div>
</template>

<script>
import crudApi from '@/api/goods/brand'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import Upload from '@/components/Upload/SingleImage'

// crud交由presenter持有
const defaultCrud = CRUD({ title: '品牌', url: '/goods/brand', crudMethod: { ...crudApi }})
const defaultForm = {
  id: null,
  name: '',
  logo: '',
  letter: '',
  bigPic: '',
  sort: 999,
  brandStory: '',
  visibled: true,
  brandFactory: true
}
export default {
  name: 'Brand',
  components: { crudOperation, rrOperation, udOperation, pagination, Upload },
  mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
  // 数据字典
  dicts: ['enabled_status'],
  data() {
    return {
      permission: {
        add: ['admin', 'brand:add'],
        edit: ['admin', 'brand:edit'],
        del: ['admin', 'brand:del']
      },

      rules: {
        name: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' },
          { min: 2, max: 20, message: this.$t('rules.range2to20'), trigger: 'blur' }
        ],
        letter: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' },
          { min: 1, max: 1, message: '长度在 1 个字符', trigger: 'blur' }
        ],
        logo: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' }
        ],
        sort: [
          {required: true, message: this.$t('rules.require'), trigger: 'blur', type: 'number'}
        ]

      }
    }
  },

  created() {
    this.$nextTick(() => {
    })
  },
  mounted: function() {

  },
  methods: {
    // 改变展示状态
    changeVisibled(data, val) {
      this.$confirm('此操作将 "' + this.dict.label.enabled_status[val] + '" ' + data.name + ', 是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        crudApi.edit(data).then(res => {
          this.crud.notify(this.dict.label.enabled_status[val] + '成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
        }).catch(() => {
          data.visibled = !data.visibled
        })
      }).catch(() => {
        data.visibled = !data.visibled
      })
    },
    // 改变品牌制造商状态
    changeBrandFactory(data, val) {
      this.$confirm('此操作将 "' + this.dict.label.enabled_status[val] + '" 品牌制造商标记, 是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        crudApi.edit(data).then(res => {
          this.crud.notify(this.dict.label.enabled_status[val] + '成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
        }).catch(() => {
          data.brandFactory = !data.brandFactory
        })
      }).catch(() => {
        data.brandFactory = !data.brandFactory
      })
    }

  }
}
</script>

<style scoped>
</style>
