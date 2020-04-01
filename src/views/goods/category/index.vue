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
          <el-button
            v-if="$route.query.pid > 0"
            class="filter-item"
            type="info"
            icon="el-icon-back"
            size="mini"
            @click="back"
          >
            返回上级
          </el-button>
        </div>

        <crudOperation  :permission="permission"/>

      </div>
      <!--表单渲染-->
      <el-dialog
        append-to-body
        :close-on-click-modal="false"
        :before-close="crud.cancelCU"
        :visible.sync="crud.status.cu > 0"
        :title="crud.status.title"
        width="650px"
      >
        <el-form ref="form" :inline="false" :model="form" :rules="rules" size="small" label-width="130px">
          <el-form-item label="分类名称" prop="name">
            <el-input v-model="form.name"/>
          </el-form-item>

          <el-form-item label="上级分类" prop="pid">
            <el-select v-model="form.pid" placeholder="请选择" clearable >
              <el-option
                v-for="item in firstLevel"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
            <br/><span>不选择分类默认为顶级分类</span>
          </el-form-item>

          <el-form-item label="数量单位" prop="unit">
            <el-input v-model="form.unit"/>
          </el-form-item>

          <el-form-item label="是否显示" prop="visibled">
            <el-radio-group v-model="form.visibled">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="是否显示在导航栏" prop="navigation">
            <el-radio-group v-model="form.navigation">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="分类图标" prop="icon">
            <Upload v-model="form.icon"/>
          </el-form-item>

          <el-form-item label="筛选属性" prop="attributes">
            <el-cascader :options="cascaderAttributes" :props="props" v-model="attributeIds">
            </el-cascader>
          </el-form-item>

          <el-form-item label="菜单排序" prop="sort">
            <el-input-number
              v-model.number="form.sort"
              :min="0"
              controls-position="right"
              style="width: 178px;"
            />
          </el-form-item>
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="form.keyword"/>
          </el-form-item>

          <el-form-item label="描述" prop="description">
            <el-input v-model="form.description"/>
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
        <el-table-column v-if="columns.visible('name')" :show-overflow-tooltip="true" prop="name" label="分类名称"/>
        <el-table-column v-if="columns.visible('pid')" :show-overflow-tooltip="true" label="级别">
          <template slot-scope="{row}">
            {{row.pid == 0? '一级': '二级'}}
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

        <el-table-column v-if="columns.visible('navigation')" label="导航栏" align="center" prop="navigation">
          <template slot-scope="{row}">
            <el-switch
              v-model="row.navigation"
              active-color="#409EFF"
              inactive-color="#F56C6C"
              @change="changeNavigation(row, row.navigation)"
            />
          </template>
        </el-table-column>
        <el-table-column v-if="columns.visible('unit')" :show-overflow-tooltip="true" prop="unit" label="数量单位"/>
        <el-table-column v-if="columns.visible('sort')" :show-overflow-tooltip="true" prop="sort" label="排序"/>
        <el-table-column
          v-permission="['admin','category:list','category:edit']"
          label="设置"
          width="200"
          align="center"
          fixed="right"
        >
          <template slot-scope="{row}">
            <el-button v-if="row.pid == 0" size="mini" type="text" @click="addNextLevel(row.id)">新增下级</el-button>
            <router-link v-if="row.pid == 0" :to="{name: 'Category', query: {pid: row.id}}">
              <el-button size="mini" type="text">查看下级</el-button>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column v-if="columns.visible('createdAt')" prop="createdAt" label="创建日期" width="135px">
          <template slot-scope="{row}">
            <span>{{ row.createdAt }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-permission="['admin','category:edit','category:del']"
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
  import crudApi from '@/api/goods/category'
  import {getCascaderAttribute} from '@/api/goods/type'
  import CRUD, {presenter, header, form, crud} from '@crud/crud'
  import rrOperation from '@crud/RR.operation'
  import crudOperation from '@crud/CRUD.operation'
  import udOperation from '@crud/UD.operation'
  import pagination from '@crud/Pagination'
  import Upload from '@/components/Upload/SingleImage'
  import {getFirstLevel} from "../../../api/goods/category";

  // crud交由presenter持有
  const defaultCrud = CRUD({title: '商品分类', url: '/goods/category', crudMethod: {...crudApi}})
  const defaultForm = {
    id: null,
    name: '',
    pid: '',
    unit: '',
    sort: 999,
    visibled: true,
    navigation: true,
    icon: '',
    attributes: [],
    keyword: '',
    description: ''
  }
  export default {
    name: 'Category',
    components: {crudOperation, rrOperation, udOperation, pagination, Upload},
    mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
    // 数据字典
    dicts: ['enabled_status'],
    beforeRouteUpdate (to, from, next) {

      next()
      this.crud.refresh()
    },
    data() {
      return {
        permission: {
          add: ['admin', 'category:add'],
          edit: ['admin', 'category:edit'],
          del: ['admin', 'category:del']
        },

        rules: {
          name: [
            {required: true, message: this.$t('rules.require'), trigger: 'blur'},
            {min: 2, max: 20, message: this.$t('rules.range2to20'), trigger: 'blur'}
          ],
          attributes: [
            { required: true, message: this.$t('rules.require'), trigger: 'change' },
          ],
          sort: [
            {required: true, message: this.$t('rules.require'), trigger: 'blur', type: 'number'}
          ]
        },
        firstLevel: [],
        cascaderAttributes: [],
        props: {multiple: true, emitPath: false, value:'id'},
        attributeIds : []
      }
    },

    methods: {
// 改变显示状态
      changeVisibled(data, val) {
        this.$confirm('此操作将 "' + this.dict.label.enabled_status[val] + '" ' + data.name + '显示, 是否继续？', '提示', {
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
      // 改变导航栏显示状态
      changeNavigation(data, val) {
        this.$confirm('此操作将 "' + this.dict.label.enabled_status[val] + '" ' + data.name + '导航栏显示, 是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          crudApi.edit(data).then(res => {
            this.crud.notify(this.dict.label.enabled_status[val] + '成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
          }).catch(() => {
            data.navigation = !data.visibled
          })
        }).catch(() => {
          data.navigation = !data.visibled
        })
      },

      // 刷新 - 之前
      [CRUD.HOOK.beforeRefresh](crud) {
        const pid = this.$route.query.pid
        if(pid){
          this.query.pid = pid
        }else{
          this.query.pid = 0
        }

      },


      // 开始新增与编辑前做的操作
      [CRUD.HOOK.beforeToCU](crud, form) {
        const that = this
        form.pid = this.$route.query.pid
        getCascaderAttribute().then(res => {
          that.cascaderAttributes = res
        })

        crudApi.getFirstLevel().then(res =>{
          that.firstLevel = res
        })
      },
      // 提交 - 之前
      [CRUD.HOOK.beforeSubmit](crud) {
        crud.form.attributes = []
        this.attributeIds.forEach(data => {
          crud.form.attributes.push({id: data})
        })
      },
      // 编辑 - 之后
      [CRUD.HOOK.afterToEdit](crud,form) {
        const that = this
        that.attributeIds = []
        form.attributes.forEach(data =>{
          that.attributeIds.push(data.id)
        })

      },
      addNextLevel(pid){
        this.crud.toAdd()
        this.crud.form.pid = pid
      },
      back(){
        this.$router.go(-1)
      }
    }
  }
</script>

<style scoped>
</style>
