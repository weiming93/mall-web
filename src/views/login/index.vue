<template>
  <div class="login-container">
    <div class="login-info">
      <div class="title">Mall Cloud</div>
<!--      <div class="sub-title">{{ $t('common.system') }}</div>-->
<!--      <div class="desc">1. {{ $t('common.desc.a') }}</div>-->
<!--      <div class="desc">2. {{ $t('common.desc.b') }}</div>-->
<!--      <div class="desc">3. {{ $t('common.desc.c') }}</div>-->
<!--      <div class="desc">4. {{ $t('common.desc.d') }}</div>-->
<!--      <div class="desc">5. {{ $t('common.desc.e') }}</div>-->
<!--      <div class="desc">6. {{ $t('common.desc.f') }}</div>-->
<!--      <div class="desc">7. {{ $t('common.desc.g') }}</div>-->
<!--      <div class="desc">8. {{ $t('common.desc.h') }}</div>-->
    </div>
    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="rules"
      class="login-form"
      autocomplete="off"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">
          Mall Cloud 系统登录
        </h3>
      </div>
      <span v-if="login.type === 'up'">
        <el-form-item prop="username">
          <el-input
            ref="username"
            v-model="loginForm.username"
            placeholder="账号"
            prefix-icon="el-icon-user"
            name="username"
            type="text"
            autocomplete="off"
            @keyup.enter.native="handleLogin"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            ref="password"
            v-model="loginForm.password"
            prefix-icon="el-icon-key"
            type="password"
            placeholder="密码"
            name="password"
            autocomplete="off"
            :show-password="true"
            @keyup.enter.native="handleLogin"
          />
        </el-form-item>
        <el-form-item prop="code" class="code-input">
          <el-input
            ref="code"
            v-model="loginForm.code"
            prefix-icon="el-icon-lock"
            placeholder="验证码"
            name="code"
            type="text"
            autocomplete="off"
            style="width: 75%"
            @keyup.enter.native="handleLogin"
          />
        </el-form-item>
        <img :src="imageCode" alt="codeImage" class="code-image" @click="getCodeImage">
        <el-button
          :loading="loading"
          type="primary"
          style="width:100%;margin-bottom:14px;"
          @click.native.prevent="handleLogin"
        >
          立即登录
        </el-button>
      </span>
    </el-form>
    <span class="login-footer" />
  </div>
</template>

<script>
import { randomNum } from '@/utils'
import axios from 'axios'
import request from '@/utils/request'
export default {
  name: 'Login',
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error(this.$t('rules.noLessThan6')))
      } else {
        callback()
      }
    }
    return {
      tabActiveName: 'bindLogin',
      codeUrl: `/auth/captcha`,
      login: {
        type: 'up'
      },
      loginForm: {
        username: '',
        password: ''
      },
      rules: {
        username: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        password: { required: true, message: this.$t('rules.require'), trigger: 'blur', validator: validatePassword },
        code: { required: true, message: this.$t('rules.require'), trigger: 'blur' }
      },
      authUser: null,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {},
      randomId: randomNum(24, 16),
      imageCode: '',
      page: {
        width: window.screen.width * 0.5,
        height: window.screen.height * 0.5
      }
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.$store.dispatch('user/clean')
    this.getCodeImage()
  },
  methods: {
    getCodeImage() {
      axios({
        method: 'GET',
        url: `${this.codeUrl}?key=${this.randomId}`,
        responseType: 'arraybuffer'
      }).then(res => {
        return 'data:image/png;base64,' + btoa(
          new Uint8Array(res.data)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
        )
      }).then((res) => {
        this.imageCode = res
      }).catch((e) => {
        if (e.toString().indexOf('429') !== -1) {
          this.$message({
            message: '获取验证码过于频繁，请稍后再试',
            type: 'error'
          })
        } else {
          this.$message({
            message: '获取图形验证码失败',
            type: 'error'
          })
        }
      })
    },

    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          const that = this
          request.login('/auth/oauth/token', {
            ...that.loginForm,
            key: this.randomId
          }).then((data) => {
            this.$store.dispatch('user/saveLoginData', data)
            this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
            this.loading = false
          }).catch((error) => {
            that.loading = false
            that.getCodeImage()
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
  }
}
</script>

<style lang="scss">
  @import "login";
</style>
<style lang="scss" scoped>
  @import "login-scoped";
</style>
