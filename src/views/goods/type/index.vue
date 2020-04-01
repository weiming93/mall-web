<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--工具栏-->
      <div class="head-container">
        <crudOperation show="" :permission="permission"/>
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
          <el-form-item label="类型名称" prop="name">
            <el-input v-model="form.name"/>
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
        <el-table-column type="selection" width="55"/>
        <el-table-column v-if="columns.visible('name')" :show-overflow-tooltip="true" prop="name" label="类型名称"/>
        <el-table-column label="属性数量">
          <template slot-scope="{row}">
            {{row.attributes?row.attributes.length:0}}
          </template>
        </el-table-column>

        <el-table-column label="参数数量">
          <template slot-scope="{row}">
            {{row.parameters?row.parameters.length:0}}
          </template>
        </el-table-column>
        <el-table-column
          v-permission="['admin','attribute:list','parameter:list']"
          label="操作"
          width="200"
          align="center"
          fixed="right"
        >
          <template slot-scope="{row}">
            <router-link :to="{name: 'Attribute', query: {typeId: row.id}}"  v-permission="['admin','attribute:list']">
              <el-button  size="mini" type="text">属性列表
              </el-button>
            </router-link>
            <router-link :to="{name: 'Parameter', query: {typeId: row.id}}" v-permission="['admin','parameter:list']">
              <el-button  size="mini" type="text">参数列表
              </el-button>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column v-if="columns.visible('createdAt')" prop="createdAt" label="创建日期" width="135px">
          <template slot-scope="{row}">
            <span>{{ row.createdAt }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-permission="['admin','type:edit','type:del']"
          label="操作"
          width="200"
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
      <pagination/>

    </el-row>
  </div>
</template>

<script>
  import crudApi from '@/api/goods/type'
  import CRUD, {presenter, header, form, crud} from '@crud/crud'
  import rrOperation from '@crud/RR.operation'
  import crudOperation from '@crud/CRUD.operation'
  import udOperation from '@crud/UD.operation'
  import pagination from '@crud/Pagination'

  // crud交由presenter持有
  const defaultCrud = CRUD({title: '商品分类', url: '/goods/type', crudMethod: {...crudApi}})
  const defaultForm = {
    id: null,
    name: '',
  }
  export default {
    name: 'Type',
    components: {crudOperation, rrOperation, udOperation, pagination},
    mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
    data() {
      return {
        permission: {
          add: ['admin', 'type:add'],
          edit: ['admin', 'type:edit'],
          del: ['admin', 'type:del']
        },

        rules: {
          name: [
            {required: true, message: this.$t('rules.require'), trigger: 'blur'},
            {min: 2, max: 20, message: this.$t('rules.range2to20'), trigger: 'blur'}
          ]
        }
      }
    },

    methods: {

    }
  }
</script>

<style scoped>
</style>
