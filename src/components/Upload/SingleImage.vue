<template>
  <el-upload
    :multiple="false"
    :on-success="handleImageSuccess"
    :before-upload="beforeImageUpload"
    :on-remove="handleImageRemove"
    action="/system/resources"
    :headers="headers"
    :limit="1"
    :on-exceed="handleExceed"
    list-type="picture"
    :file-list="fileList"
  >
    <el-button size="small" type="primary">点击上传</el-button>
    <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过1M</div>
  </el-upload>
</template>

<script>

export default {
  name: 'SingleImageUpload',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      headers: {
        Authorization: `bearer ${this.$store.getters.accessToken}`
      }
    }
  },
  computed: {
    fileList() {
      return [{ name: '', url: this.value }]
    }
  },
  methods: {
    rmImage() {
      this.emitInput('')
    },
    emitInput(val) {
      this.$emit('input', val)
    },
    handleImageSuccess(res, file) {
      this.emitInput(res)
    },
    beforeImageUpload(file) {
      const isImage = file.type === ('image/jpeg' || 'image/png')
      const isLt1M = file.size / 1024 / 1024 < 1

      if (!isImage) {
        this.$message.error('上传头像图片只能是 JPG 或 PNG 格式!')
      }
      if (!isLt1M) {
        this.$message.error('上传头像图片大小不能超过 1MB!')
      }
      return isImage && isLt1M
    },
    handleImageRemove(file, fileList) {
      this.rmImage()
    },
    handleExceed() {
      this.$message.warning('只能上传一张图片')
    }
  }
}
</script>

<style lang="scss" scoped>
  .image-preview {
    width: 100%;
    height: 100%;
    display: block;
  }

</style>
