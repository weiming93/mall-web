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

          <rrOperation :crud="crud"/>
        </div>
        <crudOperation show="" :permission="permission"/>
      </div>
      <!--表单渲染-->
      <el-dialog
        append-to-body
        :close-on-click-modal="false"
        :before-close="crud.cancelCU"
        :visible.sync="crud.status.cu > 0"
        :title="crud.status.title"
        width="800px"
      >
        <el-form ref="form" :inline="false" :model="form" :rules="rules" size="small" label-width="200px">
          <el-form-item label="属性名称" prop="name">
            <el-input v-model="form.name"/>
          </el-form-item>
          <el-form-item label="商品类型">
            <el-select v-model="form.type.id" placeholder="请选择">
              <el-option
                v-for="item in types"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="分类筛选样式" prop="style">
            <el-radio-group v-model="form.style">
              <el-radio
                v-for="item in dict.style_group"
                :label="item.value"
              >{{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="能否进行检索" prop="searching">
            <el-radio-group v-model="form.searching">
              <el-radio
                v-for="item in dict.searching_group"
                :label="item.value"
              >{{ item.label }}
              </el-radio>
            </el-radio-group>
            <br/><span>不需要该属性成为检索商品条件的情况请选择不需要检索，<br/>需要该属性进行关键字检索商品时选择关键字检索。</span>
          </el-form-item>
          <el-form-item label="相同属性值的商品是否关联" prop="related">
            <el-radio-group v-model="form.related">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="属性是否可选" prop="selected">
            <el-radio-group v-model="form.selected">
              <el-radio
                v-for="item in dict.selected_group"
                :label="item.value"
              >{{ item.label }}
              </el-radio>
            </el-radio-group>
            <br/><span>选择"单选/多选属性"时，可以对商品该属性设置多个值，<br/>
            同时还能对不同属性值指定不同的价格加价，用户购买商品时需要选定具体的属性值。<br/>
            选择"唯一属性"时，商品的该属性值只能设置一个值，用户只能查看该值。</span>
          </el-form-item>

          <el-form-item label="该属性值的录入方式">
            <el-radio-group v-model="manual">
              <el-radio :label="true">手工录入</el-radio>
              <el-radio :label="false">从下面的列表中选择</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="属性值可选值列表" prop="optionals">
            <el-select
              v-model="form.optionals"
              :multiple-limit="form.selected == 'ONLY'?1:0"
              multiple
              filterable
              :allow-create="manual"
              default-first-option
              placeholder="可以创建并选中属性值">
              <el-option
                v-for="item in form.optionals"
                :key="item"
                :label="item"
                :value="item">
              </el-option>
            </el-select>
            <!-- TODO 优化成字典表中获取-->
          </el-form-item>
          <el-form-item label="是否支持手动新增" prop="added">
            <el-radio-group v-model="form.added">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="排序" prop="sort">
            <el-input-number
              v-model.number="form.sort"
              :min="0"
              controls-position="right"
              style="width: 178px;"
            />
          </el-form-item>
          <el-table-column v-if="columns.visible('createdAt')" prop="createdAt" label="创建日期" width="135px">
            <template slot-scope="{row}">
              <span>{{ row.createdAt }}</span>
            </template>
          </el-table-column>
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
        <el-table-column v-if="columns.visible('name')" :show-overflow-tooltip="true" prop="name" label="属性名称"/>
        <el-table-column
          v-if="columns.visible('type.name')"
          :show-overflow-tooltip="true"
          label="商品类型"
        >
          <template slot-scope="{row}">
            {{row.type.name}}
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.visible('style')"
          :show-overflow-tooltip="true"
          prop="style"
          label="分类筛选样式"
        >
          <template slot-scope="{row}">
            <span v-for="item in dict.style_group" v-if="item.value == row.style">{{item.label}}</span>
          </template>
        </el-table-column>

        <el-table-column
          v-if="columns.visible('searching')"
          :show-overflow-tooltip="true"
          prop="searching"
          label="能否进行检索"
        >
          <template slot-scope="{row}">
            <span v-for="item in dict.searching_group" v-if="item.value == row.searching">{{item.label}}</span>
          </template>
        </el-table-column>


        <el-table-column
          v-if="columns.visible('selected')"
          :show-overflow-tooltip="true"
          prop="selected"
          label="属性是否可选"
        >
          <template slot-scope="{row}">
            <span v-for="item in dict.selected_group" v-if="item.value == row.selected">{{item.label}}</span>
          </template>
        </el-table-column>


        <el-table-column
          v-if="columns.visible('newAdd')"
          :show-overflow-tooltip="true"
          prop="newAdd"
          label="是否支持手动新增"
        >
          <template slot-scope="{row}">
            {{row.added?'是':'否'}}
          </template>
        </el-table-column>

        <el-table-column
          v-if="columns.visible('sort')"
          :show-overflow-tooltip="true"
          prop="sort"
          label="排序"
        />
        <el-table-column
          v-permission="['admin','attribute:edit','attribute:del']"
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
      <pagination/>

    </el-row>
  </div>
</template>

<script>
  import crudApi from '@/api/goods/attribute'
  import { findAll } from '@/api/goods/type'
  import CRUD, {presenter, header, form, crud} from '@crud/crud'
  import rrOperation from '@crud/RR.operation'
  import crudOperation from '@crud/CRUD.operation'
  import udOperation from '@crud/UD.operation'
  import pagination from '@crud/Pagination'

  // crud交由presenter持有
  const defaultCrud = CRUD({title: '商品属性', url: '/goods/attribute', crudMethod: {...crudApi}})
  const defaultForm = {
    id: null,
    type: {id: ''},
    searching: 'NONE',
    related: true,
    sort: 999,
    selected: 'ONLY',
    optionals: [],
    style: 'NORMAL',
    added: true
  }
  export default {
    name: 'Attribute',
    components: {crudOperation, rrOperation, udOperation, pagination},
    mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
    // 数据字典
    dicts: ['enabled_status', 'selected_group', 'searching_group', 'style_group'],
    data() {
      return {
        permission: {
          add: ['admin', 'attribute:add'],
          edit: ['admin', 'attribute:edit'],
          del: ['admin', 'attribute:del']
        },

        rules: {
          name: [
            {required: true, message: this.$t('rules.require'), trigger: 'blur'},
            {min: 2, max: 20, message: this.$t('rules.range2to20'), trigger: 'blur'}
          ],
          optionals: [
            {required: true, message: this.$t('rules.require'), trigger: 'change'},
          ],
          sort: [
            {required: true, message: this.$t('rules.require'), trigger: 'blur', type: 'number'}
          ]
        },
        types: [],
        manual: true,
      }
    },


    methods: {
      // 开始新增前做的操作
      [CRUD.HOOK.beforeToAdd](crud) {
        const typeId = this.$route.query.typeId
        if (typeId) {
          this.crud.form.type.id = Number(typeId)
        }
      },
      // 开始新增与编辑前做的操作
      [CRUD.HOOK.beforeToCU](crud, form) {
        console.log(form)
        const that = this
        findAll().then(res => {
          that.types = res
        })
      },
      // 提交 - 之前
      [CRUD.HOOK.beforeSubmit](crud) {
        if (crud.form.selected == 'ONLY' && crud.form.optionals.length > 1){
          this.$message({
            message: '属性值只能选择一项',
            type: 'warning'
          })
          return false
        }
        return true
      },
    }
  }
</script>

<style scoped>
</style>
