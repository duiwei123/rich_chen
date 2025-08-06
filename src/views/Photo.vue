<template>
  <div class="photo-manager-container">
    <!-- 页面标题和上传按钮 -->
    <div class="header-section">
      <h1 class="page-title">摄影参数档案</h1>
      <el-button 
        type="primary" 
        @click="dialogVisible = true"
        class="upload-btn"
      >
        <i class="el-icon-plus mr-2"></i>上传新照片
      </el-button>
    </div>

    <!-- 照片上传表单弹窗 -->
    <el-dialog
      title="添加照片参数"
      v-model="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
      :before-close="handleDialogClose"
    >
      <el-form 
        ref="formRef" 
        :model="form" 
        :rules="rules" 
        label-width="100px"
        class="photo-form"
      >
        <el-form-item label="作者" prop="author">
          <el-input 
            v-model="form.author" 
            autocomplete="off" 
            placeholder="请输入作者名称"
          />
        </el-form-item>
        
        <el-form-item label="光圈" prop="aperture">
          <el-input 
            v-model="form.aperture" 
            autocomplete="off" 
            placeholder="例如: f/1.8"
          />
        </el-form-item>
        
        <el-form-item label="快门" prop="shutter">
          <el-input 
            v-model="form.shutter" 
            autocomplete="off" 
            placeholder="例如: 1/1000s"
          />
        </el-form-item>
        
        <el-form-item label="ISO" prop="iso">
          <el-input-number
            v-model="form.iso"
            :min="1"
            :max="12800"
            :step="100"
            style="width: 100%"
            placeholder="请输入ISO值"
          />
        </el-form-item>
        
        <el-form-item label="照片" prop="imageName" class="upload-item">
          <el-upload
            class="upload-component"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="customUpload"
            :disabled="uploading"
          >
            <el-button 
              type="primary" 
              :loading="uploading"
              class="upload-button"
            >
              <i class="el-icon-upload mr-2"></i>{{ uploading ? '上传中...' : '选择图片' }}
            </el-button>
            <span
              v-if="form.imageRealName"
              class="upload-success"
            >
              <i class="el-icon-check-circle mr-1"></i>已上传: {{ form.imageRealName }}
            </span>
          </el-upload>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="submitForm"
          :loading="submitting"
        >
          确认提交
        </el-button>
      </template>
    </el-dialog>

    <!-- 照片展示区域 -->
    <div class="photos-section">
      <div class="section-title">
        <h2>照片预览</h2>
        <p class="section-desc">{{ photoList.length }} 张照片</p>
      </div>
      
      <!-- 空状态 -->
      <div v-if="photoList.length === 0 && !loading" class="empty-state">
        <div class="empty-icon">
          <i class="el-icon-picture-outline"></i>
        </div>
        <p class="empty-text">暂无照片数据</p>
        <el-button 
          type="primary" 
          @click="dialogVisible = true"
        >
          上传第一张照片
        </el-button>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <el-loading-spinner></el-loading-spinner>
        <p>加载中...</p>
      </div>
      
      <!-- 照片轮播（单张显示模式） -->
      <div v-if="photoList.length > 0 && !loading" class="carousel-wrapper">
        <el-carousel 
          :interval="5000" 
          height="600px"
          indicator-position="none"
          arrow="always"
          class="single-photo-carousel"
        >
          <el-carousel-item 
            v-for="(item, index) in photoList" 
            :key="item.id || index"
            class="single-carousel-item"
          >
            <div class="photo-container">
              <!-- 图片容器（适配不同比例图片） -->
              <div class="image-wrapper">
                <img 
                  :src="item.imageUrl" 
                  alt="摄影作品" 
                  class="carousel-image"
                  :class="{ 'image-loading': item.loading }"
                  @load="item.loading = false"
                />
              </div>
              
              <!-- 照片参数卡片 -->
              <div class="photo-info">
                <h3 class="photo-author">{{ item.author || '未知作者' }}</h3>
                <div class="photo-params">
                  <div class="param-item">
                    <span class="param-label">光圈</span>
                    <span class="param-value">{{ item.aperture || '未设置' }}</span>
                  </div>
                  <div class="param-item">
                    <span class="param-label">快门</span>
                    <span class="param-value">{{ item.shutter || '未设置' }}</span>
                  </div>
                  <div class="param-item">
                    <span class="param-label">ISO</span>
                    <span class="param-value">{{ item.iso || '未设置' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
        
   
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import http from "../utils/http";

// 弹窗控制
const dialogVisible = ref(false);
const uploading = ref(false);
const submitting = ref(false);
const loading = ref(false);
const currentIndex = ref(0); // 当前轮播索引

// 表单数据
const form = reactive({
  author: "",       // 作者
  aperture: "",     // 光圈
  shutter: "",      // 快门
  iso: null,        // ISO
  imageName: "",    // 服务器保存的文件名
  imageRealName: "" // 原始文件名
});

// 表单验证规则
const rules = {
  author: [
    { required: true, message: "请输入作者名称", trigger: "blur" }
  ],
  aperture: [
    { required: true, message: "请输入光圈参数", trigger: "blur" }
  ],
  shutter: [
    { required: true, message: "请输入快门参数", trigger: "blur" }
  ],
  iso: [
    { required: true, message: "请输入ISO值", trigger: "change" }
  ],
  imageName: [
    { required: true, message: "请上传照片", trigger: "change" }
  ]
};

// 照片列表
const photoList = ref([]);
const formRef = ref();
const carouselRef = ref(); // 轮播组件引用

// 页面加载时获取照片列表
onMounted(async () => {
  await fetchPhotoList();
});

// 监听弹窗关闭，重置表单
const handleDialogClose = () => {
  resetForm();
};

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields();
  form.imageName = "";
  form.imageRealName = "";
  uploading.value = false;
  submitting.value = false;
};

// 获取照片列表
const fetchPhotoList = async () => {
  loading.value = true;
  try {
    const res = await http.post("/getPhotoList");
    const data = res.data || [];
    
    // 处理照片数据，添加加载状态
    photoList.value = data.map(item => ({
      ...item,
      imageUrl: `http://115.190.91.146/preview/${item.imageName}`,
      loading: true
    }));
    currentIndex.value = 0; // 重置轮播索引
  } catch (error) {
    ElMessage.error("获取照片列表失败");
    console.error("获取照片列表错误:", error);
  } finally {
    loading.value = false;
  }
};

// 上传前校验
const beforeUpload = (file) => {
  // 校验文件类型
  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    ElMessage.error("只能上传图片文件（JPG、PNG等）");
    return false;
  }
  
  // 校验文件大小
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    ElMessage.error("图片大小不能超过5MB");
    return false;
  }
  
  return true;
};

// 自定义上传逻辑
const customUpload = async (option) => {
  uploading.value = true;
  const formData = new FormData();
  formData.append("file", option.file);
  
  try {
    const res = await http.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    
    // 保存上传结果
    form.imageName = res.saved_name;
    form.imageRealName = res.original_name;
    ElMessage.success("图片上传成功");
    option.onSuccess(res);
  } catch (error) {
    ElMessage.error("图片上传失败，请重试");
    console.error("上传错误:", error);
    option.onError(error);
  } finally {
    uploading.value = false;
  }
};

// 提交表单
const submitForm = async () => {
  // 表单验证
  formRef.value.validate(async (valid) => {
    if (!valid) return;
    
    submitting.value = true;
    try {
      await http.post("/savePhoto", form);
      ElMessage.success("照片参数保存成功");
      dialogVisible.value = false;
      await fetchPhotoList(); // 重新获取列表
    } catch (error) {
      ElMessage.error("保存失败，请重试");
      console.error("保存错误:", error);
    } finally {
      submitting.value = false;
    }
  });
};

// 轮播控制方法
const prevSlide = () => {
  carouselRef.value.prev();
};

const nextSlide = () => {
  carouselRef.value.next();
};

// 监听轮播索引变化
watch(currentIndex, (newVal) => {
  // 可以在这里添加索引变化时的额外逻辑
});
</script>

<style scoped>
.photo-manager-container {
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;
}

/* 头部样式 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.upload-btn {
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
}

/* 表单样式 */
.photo-form {
  margin-top: 1rem;
}

.upload-item {
  margin-top: 0.5rem;
}

.upload-component {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.upload-button {
  min-width: 140px;
}

.upload-success {
  color: #67c23a;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
}

/* 照片展示区域 */
.photos-section {
  margin-top: 2rem;
}

.section-title {
  margin-bottom: 1.5rem;
}

.section-title h2 {
  font-size: 1.5rem;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.section-desc {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background-color: #fafafa;
  border-radius: 8px;
}

.empty-icon {
  font-size: 3rem;
  color: #c0c4cc;
  margin-bottom: 1rem;
}

.empty-text {
  color: #909399;
  margin-bottom: 1.5rem;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-state p {
  margin-top: 1rem;
  color: #666;
}

/* 轮播样式（单张显示模式） */
.carousel-wrapper {
  position: relative;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.single-photo-carousel {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.single-carousel-item {
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-container {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 图片容器 - 适配不同比例图片 */
.image-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  box-sizing: border-box;
}

.carousel-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* 保持图片比例，不会裁剪 */
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: opacity 0.5s ease, transform 0.3s ease;
}

.carousel-image:hover {
  transform: scale(1.01);
}

.image-loading {
  opacity: 0.6;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M20 5l-8 8h6v14h4V13h6l-8-8z' fill='%23ccc'/%3E%3C/svg%3E") center center no-repeat;
}

/* 照片信息卡片 */
.photo-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 1.5rem;
  backdrop-filter: blur(2px);
}

.photo-author {margin: 0 0 1rem 0;
font-size: 1.2rem;
font-weight: 500;
}

.photo-params {
display: flex;
gap: 2rem;
flex-wrap: wrap;
}

.param-item {
display: flex;
align-items: center;
}

.param-label {
color: #ddd;
margin-right: 0.5rem;
font-size: 0.9rem;
}

.param-value {
font-size: 1rem;
font-weight: 500;
}

/* 轮播导航 */
.carousel-navigation {
display: flex;
justify-content: center;
align-items: center;
gap: 1rem;
margin-top: 1.5rem;
}

.current-index {
color: #666;
font-size: 0.95rem;
padding: 0.3rem 0.8rem;
border-radius: 12px;
background-color: #f0f0f0;
}

.carousel-controls {
display: flex;
gap: 0.5rem;
}

.nav-button {
width: 36px;
height: 36px;
border-radius: 50%;
padding: 0;
display: flex;
align-items: center;
justify-content: center;
background-color: white;
border: 1px solid #e0e0e0;
transition: all 0.2s ease;
}

.nav-button:hover {
background-color: #f5f5f5;
transform: scale(1.05);
}

/* 轮播指示器样式优化 */
::v-deep .single-photo-carousel .el-carousel__indicators--outside {
bottom: -40px;
}

::v-deep .single-photo-carousel .el-carousel__indicator {
width: 10px;
height: 10px;
border-radius: 50%;
background-color: #ddd;
margin: 0 6px;
transition: all 0.3s ease;
}

::v-deep .single-photo-carousel .el-carousel__indicator.is-active {
width: 30px;
border-radius: 5px;
background-color: #409eff;
}

/* 轮播箭头样式 */
::v-deep .single-photo-carousel .el-carousel__arrow {
width: 48px;
height: 48px;
border-radius: 50%;
background-color: rgba (0, 0, 0, 0.3);
color: white;
opacity: 0.7;
transition: all 0.3s ease;
}

::v-deep .single-photo-carousel .el-carousel__arrow:hover {
opacity: 1;
background-color: rgba(0, 0, 0, 0.5);
}

::v-deep .single-photo-carousel .el-carousel__arrow--left {
left: 10px;
}

::v-deep .single-photo-carousel .el-carousel__arrow--right {
right: 10px;
}

/* 响应式调整 */
@media (max-width: 768px) {
.photo-manager-container {
padding: 1rem;
}

.header-section {
flex-direction: column;
align-items: flex-start;
gap: 1rem;
}

.single-photo-carousel {
height: 400px;
}

.photo-params {
gap: 1rem;
}

::v-deep .single-photo-carousel .el-carousel__arrow {
width: 36px;
height: 36px;
}
}

@media (max-width: 480px) {
.single-photo-carousel {
height: 300px;
}

.photo-info {
padding: 1rem;
}

.photo-author {
font-size: 1rem;
margin-bottom: 0.5rem;
}

.param-label, .param-value {
font-size: 0.85rem;
}
}
</style>