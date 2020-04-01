<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="8" :lg="6" :xl="5" style="margin-bottom: 10px">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>个人信息</span>
          </div>
          <div>
            <div style="text-align: center">
              <el-upload
                :show-file-list="false"
                :on-success="handleSuccess"
                :on-error="handleError"
                :headers="headers"
                action="/system/resources"
                class="avatar-uploader"
              >
                <img :src="avatar ? avatar : Avatar" title="点击上传头像" class="avatar">
              </el-upload>
            </div>
            <ul class="user-info">
              <li>
                <div style="height: 100%">
                  <svg-icon icon-class="login"/>
                  登录账号
                  <div class="user-right">{{ userInfo.username }}</div>
                </div>
              </li>
              <li>
                <svg-icon icon-class="nick"/>
                用户昵称
                <div class="user-right">{{ userInfo.nickName }}</div>
              </li>
              <li>
                <svg-icon icon-class="phone"/>
                手机号码
                <div class="user-right">{{ userInfo.phone }}</div>
              </li>
              <li>
                <svg-icon icon-class="email"/>
                用户邮箱
                <div class="user-right">{{ userInfo.email }}</div>
              </li>
              <li>
                <svg-icon icon-class="anq"/>
                安全设置
                <div class="user-right">
                  <a @click="$refs.pass.dialog = true">修改密码</a>
                  <!--                  <a @click="$refs.email.dialog = true">修改邮箱</a>-->
                </div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="16" :lg="18" :xl="19">
        <!--    用户资料    -->
        <el-card class="box-card">
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="用户资料" name="first">
              <el-form ref="form" :model="form" :rules="rules" style="margin-top: 10px;" size="small"
                       label-width="65px">
                <el-form-item label="昵称" prop="nickName">
                  <el-input v-model="form.nickName" style="width: 35%"/>
                  <span style="color: #C0C0C0;margin-left: 10px;">用户昵称不作为登录使用</span>
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                  <el-input v-model="form.phone" style="width: 35%;"/>
                  <span style="color: #C0C0C0;margin-left: 10px;">手机号码不能重复</span>
                </el-form-item>
                <el-form-item label="性别">
                  <el-radio-group v-model="form.sex" style="width: 178px">
                    <el-radio label="男">男</el-radio>
                    <el-radio label="女">女</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="">
                  <el-button :loading="saveLoading" size="mini" type="primary" @click="doSubmit">保存配置</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <!--    操作日志    -->
            <!--            <el-tab-pane label="操作日志" name="second">-->
            <!--              <el-table v-loading="loading" :data="data" style="width: 100%;">-->
            <!--                <el-table-column prop="description" label="行为" />-->
            <!--                <el-table-column prop="requestIp" label="IP" />-->
            <!--                <el-table-column :show-overflow-tooltip="true" prop="address" label="IP来源" />-->
            <!--                <el-table-column prop="browser" label="浏览器" />-->
            <!--                <el-table-column prop="time" label="请求耗时" align="center">-->
            <!--                  <template slot-scope="scope">-->
            <!--                    <el-tag v-if="scope.row.time <= 300">{{ scope.row.time }}ms</el-tag>-->
            <!--                    <el-tag v-else-if="scope.row.time <= 1000" type="warning">{{ scope.row.time }}ms</el-tag>-->
            <!--                    <el-tag v-else type="danger">{{ scope.row.time }}ms</el-tag>-->
            <!--                  </template>-->
            <!--                </el-table-column>-->
            <!--                <el-table-column-->
            <!--                  align="right"-->
            <!--                >-->
            <!--                  <template slot="header">-->
            <!--                    <div style="display:inline-block;float: right;cursor: pointer" @click="init">创建日期<i class="el-icon-refresh" style="margin-left: 40px" /></div>-->
            <!--                  </template>-->
            <!--                  <template slot-scope="scope">-->
            <!--                    <span>{{ parseTime(scope.row.createTime) }}</span>-->
            <!--                  </template>-->
            <!--                </el-table-column>-->
            <!--              </el-table>-->
            <!--              &lt;!&ndash;分页组件&ndash;&gt;-->
            <!--              <el-pagination-->
            <!--                :total="total"-->
            <!--                :current-page="page + 1"-->
            <!--                style="margin-top: 8px;"-->
            <!--                layout="total, prev, pager, next, sizes"-->
            <!--                @size-change="sizeChange"-->
            <!--                @current-change="pageChange"-->
            <!--              />-->
            <!--            </el-tab-pane>-->
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
    <!--    <updateEmail ref="email" :email="user.email" />-->
    <updatePass ref="pass"/>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import updatePass from './center/updatePass'
  import store from '@/store'
  import {isvalidPhone} from '@/utils/validate'
  import {updateProfile, getById} from '@/api/system/user'
  import Avatar from '@/assets/avatar.jpg'

  export default {
    name: 'Center',
    components: {updatePass},
    data() {
      // 自定义验证
      const validPhone = (rule, value, callback) => {
        if (!value) {
          callback(new Error(this.$t('rules.require')))
        } else if (!isvalidPhone(value)) {
          callback(new Error(this.$t('rules.mobile')))
        } else {
          callback()
        }
      }
      return {
        Avatar: Avatar,
        activeName: 'first',
        saveLoading: false,
        headers: {
          Authorization: `bearer ${this.$store.getters.accessToken}`
        },
        form: {},
        rules: {
          nickName: [
            {required: true, message: this.$t('rules.require'), trigger: 'blur'},
            {min: 2, max: 20, message: this.$t('rules.range2to20'), trigger: 'blur'}
          ],
          phone: [
            {required: true, trigger: 'blur', validator: validPhone}
          ]
        },
        userInfo: {}
      }
    },
    computed: {
      ...mapGetters([
        'user',
        'avatar'
      ])
    },
    created() {
      this.getUser()
    },
    methods: {
      getUser() {
        getById(this.user.id)
          .then(res => {
            this.userInfo = res;
            this.form = {id: res.id, nickName: res.nickName, sex: res.sex, phone: res.phone}
          })
      },
      handleClick(tab, event) {
        if (tab.name === 'second') {
        }
      },
      handleSuccess(response, file, fileList) {

        updateProfile({id: this.user.id, avatar: response})
          .then(() => {
            this.$notify({
              title: '头像修改成功',
              type: 'success',
              duration: 2500
            })
            store.dispatch('user/updateAvatar', response)
          })
      },
      // 监听上传失败
      handleError(e, file, fileList) {
        this.$notify({
          title: e.message,
          type: 'error',
          duration: 2500
        })
      },
      doSubmit() {
        if (this.$refs['form']) {
          this.$refs['form'].validate((valid) => {
            if (valid) {
              this.saveLoading = true
              updateProfile(this.form).then(() => {
                this.$notify({
                  title: '编辑成功',
                  type: 'success',
                  duration: 2500
                })
                this.getUser()
                this.saveLoading = false
              }).catch(() => {
                this.saveLoading = false
              })
            }
          })
        }
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss">
  .avatar-uploader-icon {
    font-size: 28px;
    width: 120px;
    height: 120px;
    line-height: 120px;
    text-align: center
  }

  .avatar {
    width: 120px;
    height: 120px;
    display: block;
    border-radius: 50%
  }

  .user-info {
    padding-left: 0;
    list-style: none;

    li {
      border-bottom: 1px solid #F0F3F4;
      padding: 11px 0;
      font-size: 13px;
    }

    .user-right {
      float: right;

      a {
        color: #317EF3;
      }
    }
  }
</style>
