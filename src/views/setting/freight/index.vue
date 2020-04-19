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
        width="450px"
      >
        <el-form ref="form" :inline="false" :model="form" :rules="rules" size="small" label-width="100px">
          <el-form-item label="模板名称" prop="name">
            <el-input v-model="form.name" style="width: 250px;"/>
          </el-form-item>

          <el-form-item label="费用计算方式">
            <el-radio-group v-model="form.costCalculation">
              <el-radio
                v-for="item in costCalculation"
                :label="item.value"
              >{{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="首重(KG)" prop="firstWeight">
            <el-input-number v-model.number="form.firstWeight" :min="0" controls-position="right" :precision="3" style="width: 145px;"/>
          </el-form-item>

          <el-form-item label="首费(元)" prop="firstCost">
            <el-input-number v-model.number="form.firstCost" :min="0" controls-position="right" :precision="2" style="width: 145px;"/>
          </el-form-item>

          <el-form-item label="续重(KG)" prop="increaseWeight">
            <el-input-number v-model.number="form.increaseWeight" :min="0"  controls-position="right" :precision="3" style="width: 145px;"/>
          </el-form-item>

          <el-form-item label="续费(元)" prop="increaseCost">
            <el-input-number v-model.number="form.increaseCost" :min="0" controls-position="right" :precision="2" style="width: 145px;"/>
          </el-form-item>

          <el-form-item label="目的地" prop="destination">
            <el-cascader :options="cities" :props="props" v-model="form.destination">
            </el-cascader>
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
        <el-table-column v-if="columns.visible('name')" :show-overflow-tooltip="true" prop="name" label="模板名称"/>
        <el-table-column label="默认模板" v-if="columns.visible('costCalculation')" >
          <template slot-scope="{row}" >
            <span v-for="item in costCalculation" v-if="item.value == row.costCalculation">{{item.label}}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columns.visible('firstWeight')" prop="firstWeight" label="首重(kg)"/>
        <el-table-column v-if="columns.visible('firstCost')" prop="firstCost" label="首费(元)"/>
        <el-table-column v-if="columns.visible('increaseWeight')" prop="increaseWeight" label="续重(kg)"/>
        <el-table-column v-if="columns.visible('increaseCost')" prop="increaseCost" label="续费(元)"/>
        <el-table-column v-if="columns.visible('destination')" prop="destination" label="地区"/>
        <el-table-column v-if="columns.visible('enabled')" label="状态" align="center" prop="enabled">
          <template slot-scope="{row}">
            <el-switch
              v-model="row.enabled"
              active-color="#409EFF"
              inactive-color="#F56C6C"
              @change="changeEnabled(row, row.enabled)"
            />
          </template>
        </el-table-column>
        <el-table-column v-if="columns.visible('createdAt')" prop="createdAt" label="创建日期" :show-overflow-tooltip="true" width="135px"></el-table-column>
        <el-table-column
          v-permission="['admin','freight:edit','freight:del']"
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
  import crudApi from '@/api/setting/freight'
  import CRUD, {presenter, header, form, crud} from '@crud/crud'
  import rrOperation from '@crud/RR.operation'
  import crudOperation from '@crud/CRUD.operation'
  import udOperation from '@crud/UD.operation'
  import pagination from '@crud/Pagination'
  import {getProvince} from '@/api/setting/area'

  // crud交由presenter持有
  const defaultCrud = CRUD({title: '运费模板', url: '/setting/freight', crudMethod: {...crudApi}})
  const defaultForm = {
    id: null,
    name: '',
    costCalculation: 'WEIGHT',
    firstWeight: 0,
    firstCost: 0,
    increaseWeight: 0,
    increaseCost: 0,
    destination: '',
    enabled: true
  }
  const costCalculation = [
    { value: 'WEIGHT', label: '按重量计算' },
    { value: 'PIECES', label: '按商品件数计算' }
  ]

  export default {
    name: 'Freight',
    components: {crudOperation, rrOperation, udOperation, pagination},
    mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
    // 数据字典
    dicts: ['enabled_status'],
    data() {
      return {
        permission: {
          add: ['admin', 'freight:add'],
          edit: ['admin', 'freight:edit'],
          del: ['admin', 'freight:del']
        },

        rules: {
          name: [
            {required: true, message: this.$t('rules.require'), trigger: 'blur'},
            {min: 2, max: 20, message: this.$t('rules.range2to20'), trigger: 'blur'}
          ]
        },
        props: {multiple: true, emitPath: false, value:'label'},
        cities: [],
        costCalculation
      }
    },

    methods: {
      // 开始新增与编辑前做的操作
      [CRUD.HOOK.beforeToCU](crud, form) {
        const that = this
        getProvince().then(res => {
          that.cities = res
        })
      },
      // 改变状态
      changeEnabled(data, val) {
        this.$confirm('此操作将 "' + this.dict.label.enabled_status[val] + '" ' + data.username + ', 是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          crudApi.edit(data).then(res => {
            this.crud.notify(this.dict.label.enabled_status[val] + '成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
          }).catch(() => {
            data.enabled = !data.enabled
          })
        }).catch(() => {
          data.enabled = !data.enabled
        })
      },
    }
  }
</script>

<style scoped>
</style>
