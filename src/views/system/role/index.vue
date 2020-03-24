<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.name" size="small" clearable placeholder="输入名称搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <el-date-picker
          v-model="query.createdAt"
          :default-time="['00:00:00','23:59:59']"
          type="daterange"
          range-separator=":"
          size="small"
          class="date-item"
          value-format="yyyy-MM-dd HH:mm:ss"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
        <rrOperation :crud="crud" />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!-- 表单渲染 -->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="520px">
      <el-form ref="form" :inline="true" :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" style="width: 145px;" />
        </el-form-item>
        <el-form-item label="角色权限" prop="permission">
          <el-input v-model="form.permission" style="width: 145px;" />
        </el-form-item>
        <el-form-item label="角色级别" prop="level">
          <el-input-number v-model.number="form.level" :min="1" controls-position="right" style="width: 145px;" />
        </el-form-item>
        <el-form-item v-if="form.dataScope === '自定义'" label="数据权限" prop="depts">
          <treeselect v-model="form.depts" :options="depts" multiple style="width: 380px" placeholder="请选择" />
        </el-form-item>
        <el-form-item label="描述信息" prop="remark">
          <el-input v-model="form.remark" style="width: 380px;" rows="5" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="crud.cancelCU">取消</el-button>
        <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div>
    </el-dialog>
    <el-row :gutter="15">
      <!--角色管理-->
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="17" style="margin-bottom: 10px">
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span class="role-span">角色列表</span>
          </div>
          <el-table ref="table" v-loading="crud.loading" highlight-current-row style="width: 100%;" :data="crud.data" @selection-change="crud.selectionChangeHandler" @current-change="handleCurrentChange">
            <el-table-column :selectable="checkboxT" type="selection" width="55" />
            <el-table-column v-if="columns.visible('name')" prop="name" label="名称" />
            <el-table-column v-if="columns.visible('permission')" prop="permission" label="角色权限" />
            <el-table-column v-if="columns.visible('level')" prop="level" label="角色级别" />
            <el-table-column v-if="columns.visible('remark')" :show-overflow-tooltip="true" prop="remark" label="描述" />
            <el-table-column v-if="columns.visible('createdAt')" :show-overflow-tooltip="true" width="135px" prop="createdAt" label="创建日期">
              <template slot-scope="{row}">
                <span>{{ row.createdAt }}</span>
              </template>
            </el-table-column>
            <el-table-column v-permission="['admin','role:edit','role:del']" label="操作" width="130px" align="center" fixed="right">
              <template slot-scope="{row}">
                <udOperation
                  v-if="row.level >= level"
                  :data="row"
                  :permission="permission"
                />
              </template>
            </el-table-column>
          </el-table>
          <!--分页组件-->
          <pagination />
        </el-card>
      </el-col>
      <!-- 菜单授权 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="7">
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <el-tooltip class="item" effect="dark" content="选择指定角色分配菜单" placement="top">
              <span class="role-span">菜单分配</span>
            </el-tooltip>
            <el-button
              v-permission="['admin','role:edit']"
              :disabled="!showButton"
              :loading="menuLoading"
              icon="el-icon-check"
              size="mini"
              style="float: right; padding: 6px 9px"
              type="primary"
              @click="saveMenu"
            >保存</el-button>
          </div>
          <el-tree
            ref="menu"
            :data="menus"
            :default-checked-keys="menuIds"
            :props="defaultProps"
            check-strictly
            accordion
            show-checkbox
            node-key="id"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import crudRoles from '@/api/system/role'
import { getMenuTree } from '@/api/system/menu'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

// crud交由presenter持有
const defaultCrud = CRUD({ title: '角色', url: '/system/role', sort: 'level,asc', crudMethod: { ...crudRoles }})
const defaultForm = { id: null, name: null, remark: null, level: 3, permission: null }
export default {
  name: 'Role',
  components: { Treeselect, pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
  data() {
    return {
      defaultProps: { children: 'children', label: 'label' },
      level: 3,
      currentId: 0, menuLoading: false, showButton: false,
      menus: [], menuIds: [],
      permission: {
        add: ['admin', 'role:add'],
        edit: ['admin', 'role:edit'],
        del: ['admin', 'role:del']
      },
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        permission: [
          { required: true, message: '请输入权限', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getMenus()
    crudRoles.getLevel().then(data => {
      this.level = data
    })
  },
  methods: {
    [CRUD.HOOK.afterRefresh]() {
      this.$refs.menu.setCheckedKeys([])
    },

    // 获取所有菜单
    getMenus() {
      getMenuTree().then(res => {
        this.menus = res
      })
    },
    // 触发单选
    handleCurrentChange(val) {
      if (val) {
        const _this = this
        // 清空菜单的选中
        this.$refs.menu.setCheckedKeys([])
        // 保存当前的角色id
        this.currentId = val.id
        this.showButton = this.level <= val.level
        // 初始化
        this.menuIds = []
        // 菜单数据需要特殊处理
        val.menus.forEach(function(data, index) {
          _this.menuIds.push(data.id)
        })
      }
    },
    // 保存菜单
    saveMenu() {
      this.menuLoading = true
      const role = { id: this.currentId, menus: [] }
      // 得到半选的父节点数据，保存起来
      this.$refs.menu.getHalfCheckedNodes().forEach(function(data, index) {
        const menu = { id: data.id }
        role.menus.push(menu)
      })
      // 得到已选中的 key 值
      this.$refs.menu.getCheckedKeys().forEach(function(data, index) {
        const menu = { id: data }
        role.menus.push(menu)
      })
      crudRoles.editMenu(role).then(res => {
        this.crud.notify('保存成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
        this.menuLoading = false
        this.update()
      }).catch(err => {
        this.menuLoading = false
        console.log(err.response)
      })
    },
    // 改变数据
    update() {
      // 无刷新更新 表格数据
      crudRoles.get(this.currentId).then(res => {
        for (let i = 0; i < this.crud.data.length; i++) {
          if (res.id === this.crud.data[i].id) {
            this.crud.data[i] = res
            break
          }
        }
      })
    },

    checkboxT(row, rowIndex) {
      return row.level >= this.level
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
  .role-span {
    font-weight: bold;color: #303133;
    font-size: 15px;
  }
</style>

<style rel="stylesheet/scss" lang="scss" scoped>
  /deep/ .el-input-number .el-input__inner {
    text-align: left;
  }
</style>
