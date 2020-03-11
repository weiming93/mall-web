<template>
<div class="app-container">
<!--工具栏-->
<div class="head-container">
  <!-- 搜索 -->
  <el-input v-model="listQuery.name" clearable placeholder="模糊搜索" style="width: 200px;" class="filter-item"
            @keyup.enter.native="handleFilter"/>
  <el-date-picker
    v-model="listQuery.date"
    type="daterange"
    range-separator=":"
    class="el-range-editor--small filter-item"
    style="height: 30.5px;width: 220px"
    value-format="yyyy-MM-dd HH:mm:ss"
    start-placeholder="开始日期"
    end-placeholder="结束日期"/>
  <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="handleFilter">搜索
  </el-button>
  <!-- 新增 -->
  <div v-permission="['admin','menu:add']" style="display: inline-block;margin: 0px 2px;">
    <el-button
      class="filter-item"
      size="mini"
      type="primary"
      icon="el-icon-plus"
      @click="handleCreate">新增
    </el-button>
  </div>
</div>
<!--表单组件-->
<eForm ref="form" :is-add="isAdd"/>
<!--表格渲染-->
<el-table v-loading="loading" :data="list" :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
          :default-expand-all="expand" row-key="id" size="small">
  <el-table-column :show-overflow-tooltip="true" label="菜单名称" width="125px" prop="name"/>
  <el-table-column prop="icon" label="图标" align="center" width="60px">
    <template slot-scope="{row}">
      <svg-icon :icon-class="row.icon"/>
    </template>
  </el-table-column>
  <el-table-column prop="sort" align="center" label="排序">
    <template slot-scope="{row}">
      {{ row.sort }}
    </template>
  </el-table-column>
  <el-table-column :show-overflow-tooltip="true" prop="path" label="路由地址"/>
  <el-table-column :show-overflow-tooltip="true" prop="permission" label="权限标识"/>
  <!--<el-table-column :show-overflow-tooltip="true" prop="componentName" label="组件名称"/>-->
  <el-table-column :show-overflow-tooltip="true" prop="component" label="组件路径"/>
  <el-table-column prop="iframe" label="外链" width="75px">
    <template slot-scope="{row}">
      <span v-if="row.iframe">是</span>
      <span v-else>否</span>
    </template>
  </el-table-column>
  <el-table-column prop="iframe" label="缓存" width="75px">
    <template slot-scope="{row}">
      <span v-if="row.cache">是</span>
      <span v-else>否</span>
    </template>
  </el-table-column>
  <el-table-column prop="iframe" label="可见" width="75px">
    <template slot-scope="{row}">
      <span v-if="row.hidden">否</span>
      <span v-else>是</span>
    </template>
  </el-table-column>
  <el-table-column prop="createTime" label="创建日期" width="135px">
    <template slot-scope="{row}">
      <span>{{ row.createTime }}</span>
    </template>
  </el-table-column>
  <el-table-column v-if="checkPermission(['admin','menu:edit','menu:del'])" label="操作" width="130px" align="center"
                   fixed="right">
    <template slot-scope="{row}">
      <el-button v-permission="['admin','menu:edit']" size="mini" type="primary" icon="el-icon-edit"
                 @click="handleUpdate(row)"/>
      <el-popconfirm
        v-permission="['admin','menu:del']"
        icon="el-icon-info"
        iconColor="red"
        title="确定删除吗,如果存在下级节点则一并删除，此操作不能撤销！"
      >
        <div style="text-align: right; margin: 0">
          <el-button size="mini" type="text">取消</el-button>
          <el-button type="primary" size="mini" @click="handleDelete(row.id)">确定
          </el-button>
        </div>
        <el-button slot="reference" type="danger" icon="el-icon-delete" size="mini"/>
      </el-popconfirm>
    </template>
  </el-table-column>
</el-table>
</div>
</template>

<script>
import checkPermission from '@/utils/permission' // 权限判断函数
import eForm from './form'

export default {
    name: 'Menu',
    components: {eForm},
    data() {
        return {
            list: null,
            total: 0,
            loading: true,
            expand: false,
            listQuery: {
                page: 1,
                limit: 20,
                sort: 'id,desc',
                name: '',
                startTime: '',
                endTime: ''
            }
        }
    },
    created() {
        this.getList()
    },
    methods: {
        checkPermission,
        handleFilter() {
            this.listQuery.page = 1
            this.getList()
        },
        getList() {
            this.loading = true
            if (this.listQuery.date) {
                this.listQuery['startTime'] = this.listQuery.date[0]
                this.listQuery['endTime'] = this.listQuery.date[1]
            }
            this.$get("/user/menu/page",this.listQuery).then(response => {
                this.list = response.data.items
                this.total = response.data.total
                this.loading = false
            })
        },
        handleDelete(value) {
            this.loading = true
            this.$delete("/user/menu").then(res => {
                this.getList()
                this.loading = false
                this.$notify({
                    title: '删除成功',
                    type: 'success'
                })
            }).catch(err => {
                this.loading = false
                console.log(err.response)
            })
        },

        handleCreate() {
            this.isAdd = true
            this.$refs.form.getMenus()
            this.$refs.form.dialogFormVisible = true
        },
        handleUpdate(data) {
            this.isAdd = false
            const _this = this.$refs.form
            _this.getMenus()
            _this.form = {
                id: data.id,
                component: data.component,
                componentName: data.componentName,
                name: data.name,
                sort: data.sort,
                pid: data.pid,
                path: data.path,
                iframe: data.iframe.toString(),
                roles: [],
                icon: data.icon,
                cache: data.cache,
                hidden: data.hidden,
                type: data.type,
                permission: data.permission
            }
            _this.dialogFormVisible = true
        }
    }
}
</script>

<style scoped>

</style>
