<template>
    <div>
      <el-button type="primary" @click="dialogVisible = true">打开表单弹窗</el-button>
      <el-dialog
        title="表单弹窗"
        v-model="dialogVisible"
        width="400px"
        :close-on-click-modal="false"
      >
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="80px"
        >
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" autocomplete="off" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" autocomplete="off" />
          </el-form-item>
          <el-form-item label="年龄" prop="age">
            <el-input-number v-model="form.age" :min="1" :max="120" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="照片" prop="photo">
            <el-upload
              class="upload-demo"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :before-upload="beforeUpload"
              :http-request="customUpload"
              :disabled="uploading"
            >
              <el-button type="primary" :loading="uploading">选择文件</el-button>
              <span v-if="form.photo" style="margin-left:10px;color: #67C23A;">已上传: {{ form.photo }}</span>
            </el-upload>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  import { ElMessage } from 'element-plus'
  import http from "../utils/http"
  
  const dialogVisible = ref(false)
  const uploading = ref(false)
  
  const form = reactive({
    name: '',
    email: '',
    age: null,
    photo: '', // 照片文件名
  })
  
  const rules = {
    name: [
      { required: true, message: '请输入姓名', trigger: 'blur' },
    ],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
    ],
    age: [
      { required: true, message: '请输入年龄', trigger: 'blur' },
      { type: 'number', min: 1, max: 120, message: '年龄范围 1-120', trigger: 'blur' }
    ],
    photo: [
      { required: true, message: '请上传照片', trigger: 'change' }
    ]
  }
  
  const formRef = ref()
  
  // 上传前校验
  function beforeUpload(file) {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      ElMessage.error('只能上传图片文件')
      return false
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      ElMessage.error('图片大小不能超过2MB!')
      return false
    }
    return true
  }
  
  // 使用自定义上传
  async function customUpload(option) {
    uploading.value = true
    const formData = new FormData()
    formData.append('file', option.file)
    try {
      const res = await http.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      handleUploadSuccess(res, option.file)
      option.onSuccess(res)
    } catch (error) {
      ElMessage.error('上传失败')
      option.onError(error)
    } finally {
      uploading.value = false
    }
  }
  
  // 上传成功回调
  function handleUploadSuccess(response, file) {
    // 假设接口返回 { fileName: "xxx.jpg" }
    form.photo = response.saved_name
    if (form.photo) {
      ElMessage.success('上传成功')
    }
  }
  
  function submitForm() {
    formRef.value.validate((valid) => {
      if (valid) {
        http.post("/savePhoto", form).then(() => {
          ElMessage.success('提交成功！')
          dialogVisible.value = false
          // 清空表单
          form.name = ''
          form.email = ''
          form.age = null
          form.photo = ''
        })
      } else {
        ElMessage.error('请填写完整表单')
        return false
      }
    })
  }
  </script>
  
  <style scoped>
  .upload-demo {
    display: flex;
    align-items: center;
  }
  </style>