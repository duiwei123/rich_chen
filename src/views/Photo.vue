<template>
  <div class="photo-page">
    <!-- 顶部标题区 -->
    <div class="header-card">
      <div class="header-content">
        <h1 class="title">🌍 地球观察日记</h1>
        <p class="subtitle">记录美好瞬间，定格精彩时刻</p>
      </div>
      <el-button type="primary" class="upload-btn" @click="dialogVisible = true">
        <el-icon><Plus /></el-icon>
        上传新照片
      </el-button>
    </div>

    <!-- 照片网格 -->
    <div class="photo-grid" v-loading="loading">
      <div
        v-for="(photo, index) in photoList"
        :key="photo.id"
        class="photo-card"
        :style="{ animationDelay: `${index * 0.05}s` }"
      >
        <div class="photo-wrapper">
          <!-- 骨架屏 -->
          <div v-if="!photo.loaded" class="photo-skeleton"></div>
          <img
            v-show="photo.loaded"
            :src="photo.filePath"
            :alt="photo.author"
            class="photo-img"
            loading="lazy"
            @load="photo.loaded = true"
            @click="openPhotoDetail(photo)"
          />
          <div class="photo-overlay">
            <div class="photo-info">
              <h3 class="author">{{ photo.author || '匿名' }}</h3>
              <div class="params" v-if="photo.aperture || photo.shutter || photo.iso">
                <span v-if="photo.aperture">📷 {{ photo.aperture }}</span>
                <span v-if="photo.shutter">⏱️ {{ photo.shutter }}</span>
                <span v-if="photo.iso">ISO {{ photo.iso }}</span>
              </div>
            </div>
          </div>
          <!-- 日期 -->
          <div class="photo-date">{{ formatDate(photo.createdAt) }}</div>
          <!-- 私密标识 -->
          <div v-if="!photo.isPublic" class="private-badge">
            <el-icon><Lock /></el-icon>
          </div>
          <!-- 删除按钮 -->
          <button class="delete-btn" @click.stop="deletePhoto(photo)" title="删除">
            <el-icon><Delete /></el-icon>
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="photoList.length === 0 && !loading" class="empty-state">
        <el-icon class="empty-icon"><Picture /></el-icon>
        <p>还没有照片记录</p>
        <el-button type="primary" @click="dialogVisible = true">上传第一张照片</el-button>
      </div>
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore && !loading" class="load-more">
      <el-button @click="loadMore" :loading="loadingMore">加载更多</el-button>
    </div>

    <!-- 上传弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加照片"
      width="520px"
      :close-on-click-modal="false"
      class="upload-dialog"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="作者" prop="author">
          <el-input v-model="form.author" placeholder="请输入作者名称" />
        </el-form-item>

        <el-form-item label="摄影参数" required>
          <div class="param-row">
            <el-form-item prop="aperture">
              <el-input v-model="form.aperture" placeholder="光圈 (如 f/1.8)">
                <template #prefix>📷</template>
              </el-input>
            </el-form-item>
            <el-form-item prop="shutter">
              <el-input v-model="form.shutter" placeholder="快门 (如 1/1000s)">
                <template #prefix>⏱️</template>
              </el-input>
            </el-form-item>
            <el-form-item prop="iso">
              <el-input v-model="form.iso" placeholder="ISO (如 400)">
                <template #prefix>🔆</template>
              </el-input>
            </el-form-item>
          </div>
        </el-form-item>

        <el-form-item label="照片" prop="file">
          <el-upload
            class="photo-uploader"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="customUpload"
            :disabled="uploading"
            drag
          >
            <img v-if="form.previewUrl" :src="form.previewUrl" class="preview-img" />
            <div v-else class="upload-placeholder">
              <el-icon class="upload-icon"><Upload /></el-icon>
              <div class="upload-text">
                <p>点击或拖拽上传照片</p>
                <span>支持 JPG、PNG 格式，最大 10MB</span>
              </div>
            </div>
          </el-upload>
        </el-form-item>

        <el-form-item label="是否公开">
          <el-switch
            v-model="form.isPublic"
            active-text="公开"
            inactive-text="私密"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting" :disabled="!form.fileName">
          确认提交
        </el-button>
      </template>
    </el-dialog>

    <!-- 照片详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      :show-close="true"
      width="800px"
      class="detail-dialog"
    >
      <div class="detail-content" v-if="currentPhoto">
        <img :src="currentPhoto.filePath" class="detail-img" />
        <div class="detail-info">
          <h2>{{ currentPhoto.author || '匿名作者' }}</h2>
          <div class="detail-params">
            <div class="param-item" v-if="currentPhoto.aperture">
              <span class="label">光圈</span>
              <span class="value">{{ currentPhoto.aperture }}</span>
            </div>
            <div class="param-item" v-if="currentPhoto.shutter">
              <span class="label">快门</span>
              <span class="value">{{ currentPhoto.shutter }}</span>
            </div>
            <div class="param-item" v-if="currentPhoto.iso">
              <span class="label">ISO</span>
              <span class="value">{{ currentPhoto.iso }}</span>
            </div>
          </div>
          <p class="detail-date">上传于 {{ formatDate(currentPhoto.createdAt) }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Lock, Picture, Upload, Delete } from '@element-plus/icons-vue'
import http from '@/utils/http'

interface Photo {
  id: number
  fileName: string
  filePath: string
  author: string
  aperture: string
  shutter: string
  iso: string
  isPublic: boolean
  createdAt: string
  loaded: boolean
}

const loading = ref(false)
const loadingMore = ref(false)
const photoList = ref<Photo[]>([])
const dialogVisible = ref(false)
const detailVisible = ref(false)
const currentPhoto = ref<Photo | null>(null)
const uploading = ref(false)
const submitting = ref(false)
const formRef = ref()
const pageNum = ref(1)
const pageSize = ref(12)
const hasMore = ref(true)

const form = reactive({
  author: '',
  aperture: '',
  shutter: '',
  iso: '',
  isPublic: true,
  fileName: '',
  previewUrl: '',
  uploadFile: null as File | null
})

const rules = {
  author: [{ required: true, message: '请输入作者名称', trigger: 'blur' }]
}

const fetchPhotoList = async (reset = false) => {
  if (reset) {
    pageNum.value = 1
    photoList.value = []
    hasMore.value = true
  }

  loading.value = true
  try {
    const res = await http.post('/getPhotoList', {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      showAll: 'true'
    })

    const newPhotos = (res.data.data.records || []).map((item: any) => ({
      ...item,
      loaded: false
    }))

    if (reset) {
      photoList.value = newPhotos
    } else {
      photoList.value.push(...newPhotos)
    }

    hasMore.value = newPhotos.length >= pageSize.value
  } catch (e) {
    ElMessage.error('获取照片列表失败')
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  pageNum.value++
  loadingMore.value = true
  await fetchPhotoList()
  loadingMore.value = false
}

const beforeUpload = (file: File) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (file.size / 1024 / 1024 > 10) {
    ElMessage.error('图片大小不能超过10MB')
    return false
  }
  return true
}

const customUpload = async (option: any) => {
  uploading.value = true
  // 这里只上传文件，不保存到数据库
  // 文件会暂存在前端，等用户点击确认才提交
  form.fileName = option.file.name
  form.previewUrl = URL.createObjectURL(option.file)
  form.uploadFile = option.file
  uploading.value = false
}

const submitForm = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  if (!form.uploadFile) {
    ElMessage.warning('请上传照片')
    return
  }

  submitting.value = true
  try {
    const fd = new FormData()
    fd.append('file', form.uploadFile)
    fd.append('author', form.author)
    fd.append('aperture', form.aperture)
    fd.append('shutter', form.shutter)
    fd.append('iso', form.iso)
    fd.append('isPublic', form.isPublic ? 'true' : 'false')

    await http.post('/savePhoto', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    ElMessage.success('照片保存成功')
    dialogVisible.value = false
    await fetchPhotoList(true)
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败，请重试')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
  form.author = ''
  form.aperture = ''
  form.shutter = ''
  form.iso = ''
  form.isPublic = true
  form.fileName = ''
  form.previewUrl = ''
  form.uploadFile = null
}

const openPhotoDetail = (photo: Photo) => {
  currentPhoto.value = photo
  detailVisible.value = true
}

const deletePhoto = async (photo: Photo) => {
  try {
    await ElMessageBox.confirm('确定要删除这张照片吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await http.get('/deletePhoto', { params: { id: photo.id } })
    ElMessage.success('删除成功')
    await fetchPhotoList(true)
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchPhotoList(true)
})
</script>

<style scoped>
.photo-page {
  padding: var(--space-lg);
  min-height: 100%;
}

/* 顶部标题区 */
.header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg) var(--space-xl);
  margin-bottom: var(--space-lg);
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.35);
}

.header-content .title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 6px 0;
}

.header-content .subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

.upload-btn {
  background: #fff;
  color: #667eea;
  border: none;
  font-weight: 600;
}

.upload-btn:hover {
  background: #f0f0ff;
  transform: translateY(-2px);
}

/* 照片网格 */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  min-height: 300px;
}

.photo-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  animation: fadeInUp 0.5s ease backwards;
  background: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.photo-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.25);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.photo-wrapper {
  position: relative;
  aspect-ratio: 16/10;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.photo-card:hover .photo-img {
  transform: scale(1.12);
}

/* 骨架屏加载 */
.photo-skeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 照片遮罩 */
.photo-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0) 40%,
    rgba(0, 0, 0, 0.6) 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.photo-card:hover .photo-overlay {
  opacity: 1;
}

/* 右下角删除按钮 */
.delete-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
  color: #f56c6c;
  font-size: 14px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  z-index: 10;
  pointer-events: auto;
}

.photo-card:hover .delete-btn {
  opacity: 1;
  transform: translateY(0);
}

.delete-btn:hover {
  background: #f56c6c;
  color: #fff;
  transform: scale(1.1);
}

/* 照片信息 */
.photo-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  transform: translateY(10px);
  transition: transform 0.3s ease;
}

.photo-card:hover .photo-info {
  transform: translateY(0);
}

.photo-info .author {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.photo-info .params {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

.photo-info .params span {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 4px 10px;
  border-radius: 20px;
}

.photo-date {
  position: absolute;
  top: 16px;
  left: 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  padding: 6px 12px;
  border-radius: 20px;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

.photo-card:hover .photo-date {
  opacity: 1;
  transform: translateY(0);
}

/* 私密标识 */
.private-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  z-index: 10;
  transition: all 0.3s ease;
}

.photo-card:hover .private-badge {
  background: rgba(102, 126, 234, 0.8);
}

/* 空状态 */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #909399;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  border-radius: 20px;
  margin-top: 20px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  color: #c8d1dc;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.empty-state p {
  margin: 0 0 24px 0;
  font-size: 16px;
  color: #909399;
}

/* 加载更多 */
.load-more {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.load-more .el-button {
  padding: 12px 32px;
  border-radius: 25px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.load-more .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

/* 上传表单 */
.param-row {
  display: flex;
  gap: 12px;
}

.param-row .el-form-item {
  flex: 1;
  margin-bottom: 0;
}

.photo-uploader {
  width: 100%;
}

.photo-uploader :deep(.el-upload-dragger) {
  width: 100%;
  height: 200px;
  border: 2px dashed #dcdfe6;
  border-radius: 12px;
  background: #fafafa;
  transition: all 0.3s;
}

.photo-uploader :deep(.el-upload-dragger:hover) {
  border-color: #667eea;
  background: #f5f7ff;
}

.preview-img {
  width: 100%;
  height: 200px;
  object-fit: contain;
  border-radius: 8px;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.upload-icon {
  font-size: 40px;
  color: #909399;
  margin-bottom: 12px;
}

.upload-text p {
  margin: 0 0 6px 0;
  font-size: 14px;
  color: #606266;
}

.upload-text span {
  font-size: 12px;
  color: #909399;
}

/* 详情弹窗 */
.detail-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.detail-content {
  display: flex;
  flex-direction: column;
}

.detail-img {
  width: 100%;
  max-height: 500px;
  object-fit: contain;
  background: #000;
}

.detail-info {
  padding: var(--space-lg);
}

.detail-info h2 {
  font-size: 20px;
  margin: 0 0 var(--space-md) 0;
  color: #303133;
}

.detail-params {
  display: flex;
  gap: var(--space-lg);
  margin-bottom: var(--space-md);
}

.param-item {
  display: flex;
  flex-direction: column;
}

.param-item .label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.param-item .value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.detail-date {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .header-card {
    flex-direction: column;
    text-align: center;
    gap: var(--space-md);
  }

  .photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--space-md);
  }

  .param-row {
    flex-direction: column;
  }
}
</style>
