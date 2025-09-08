<template>
  <div class="photo-root">
    <!-- 顶部操作区 -->
    <div class="header-glass">
      <h1 class="page-title">摄影参数档案</h1>
      <el-button
        type="primary"
        @click="dialogVisible = true"
        class="upload-btn"
      >
        <i class="el-icon-plus mr-2"></i>上传新照片
      </el-button>
    </div>

    <!-- 上传弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加照片参数"
      width="500px"
      :close-on-click-modal="false"
      :before-close="handleDialogClose"
      class="upload-dialog"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="作者" prop="author">
          <el-input v-model="form.author" placeholder="请输入作者名称" />
        </el-form-item>
        <el-form-item label="光圈" prop="aperture">
          <el-input v-model="form.aperture" placeholder="例如: f/1.8" />
        </el-form-item>
        <el-form-item label="快门" prop="shutter">
          <el-input v-model="form.shutter" placeholder="例如: 1/1000s" />
        </el-form-item>
        <el-form-item label="ISO" prop="iso">
          <el-input v-model="form.iso" placeholder="请输入ISO值" />
        </el-form-item>
        <el-form-item label="照片" prop="imageName">
          <el-upload
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="customUpload"
            :disabled="uploading"
          >
            <el-button :loading="uploading">
              <i class="el-icon-upload mr-2"></i
              >{{ uploading ? "上传中..." : "选择图片" }}
            </el-button>
            <span v-if="form.imageRealName" class="upload-tip">
              <i class="el-icon-check-circle mr-1"></i>已上传:
              {{ form.imageRealName }}
            </span>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting"
          >确认提交</el-button
        >
      </template>
    </el-dialog>

    <!-- 照片轮播展示区 -->
    <div class="carousel-glass">
      <div class="section-header">
        <h2>照片预览</h2>
        <span class="count">{{ photoList.length }} 张</span>
      </div>

      <!-- 空状态 -->
      <div v-if="photoList.length === 0 && !loading" class="empty-glass">
        <i class="el-icon-picture-outline"></i>
        <p>暂无照片数据</p>
        <el-button type="primary" @click="dialogVisible = true"
          >上传第一张照片</el-button
        >
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="loading-glass">
        <el-loading-spinner></el-loading-spinner>
        <p>加载中...</p>
      </div>

      <!-- 轮播 -->
      <div v-if="photoList.length > 0 && !loading" class="carousel-wrap">
        <el-carousel
          ref="carouselRef"
          :interval="5000"
          height="600px"
          arrow="always"
          indicator-position="none" 
          @change="handleCarouselChange"
        >
          <el-carousel-item
            v-for="(item, index) in photoList"
            :key="item.id || index"
          >
            <div class="photo-card">
              <img
                :src="item.imageUrl"
                alt="摄影作品"
                class="photo-img"
                :class="{ 'img-loading': item.loading }"
                @load="item.loading = false"
              />
              <div class="photo-info">
                <h3 class="author">{{ item.author || "未知作者" }}</h3>
                <div class="params">
                  <div class="param">
                    <span class="label">光圈</span>
                    <span class="value">{{ item.aperture || "—" }}</span>
                  </div>
                  <div class="param">
                    <span class="label">快门</span>
                    <span class="value">{{ item.shutter || "—" }}</span>
                  </div>
                  <div class="param">
                    <span class="label">ISO</span>
                    <span class="value">{{ item.iso || "—" }}</span>
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
/* ===================== 逻辑零改动 ===================== */
import { ref, reactive, onMounted, nextTick } from "vue";
import { ElMessage } from "element-plus";
import http from "@/utils/http";

const dialogVisible = ref(false);
const uploading = ref(false);
const submitting = ref(false);
const loading = ref(false);
const currentIndex = ref(0);
const carouselRef = ref(null);
const formRef = ref(null);

const form = reactive({
  author: "",
  aperture: "",
  shutter: "",
  iso: "I100",
  imageName: "",
  imageRealName: "",
});

const rules = {
  author: [{ required: true, message: "请输入作者名称", trigger: "blur" }],
  aperture: [{ required: true, message: "请输入光圈参数", trigger: "blur" }],
  shutter: [{ required: true, message: "请输入快门参数", trigger: "blur" }],
  iso: [{ required: true, message: "请输入ISO值", trigger: "change" }],
  imageName: [{ required: true, message: "请上传照片", trigger: "change" }],
};

const photoList = ref([]);

onMounted(() => fetchPhotoList(true));

const handleCarouselChange = (index) => (currentIndex.value = index);

const handleDialogClose = () => resetForm();

const resetForm = () => {
  formRef.value?.resetFields();
  form.imageName = "";
  form.imageRealName = "";
  uploading.value = false;
  submitting.value = false;
};

const fetchPhotoList = async (shouldRestoreIndex = false) => {
  loading.value = true;
  try {
    const res = await http.post("/getPhotoList");
    photoList.value = (res.data || []).map((item) => ({
      ...item,
      imageUrl: `http://115.190.91.146/preview/${item.imageName}`,
      loading: true,
    }));
    if (shouldRestoreIndex) {
      await nextTick();
      const target =
        photoList.value.length > currentIndex.value ? currentIndex.value : 0;
      carouselRef.value?.setActiveItem(target);
    }
  } catch (e) {
    ElMessage.error("获取照片列表失败");
  } finally {
    loading.value = false;
  }
};

const beforeUpload = (file) => {
  if (!file.type.startsWith("image/")) {
    ElMessage.error("只能上传图片文件");
    return false;
  }
  if (file.size / 1024 / 1024 > 5) {
    ElMessage.error("图片大小不能超过5MB");
    return false;
  }
  return true;
};

const customUpload = async (option) => {
  uploading.value = true;
  const fd = new FormData();
  fd.append("file", option.file);
  try {
    const res = await http.post("/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    form.imageName = res.saved_name;
    form.imageRealName = res.original_name;
    ElMessage.success("图片上传成功");
    option.onSuccess(res);
  } catch (e) {
    ElMessage.error("图片上传失败");
    option.onError(e);
  } finally {
    uploading.value = false;
  }
};

const submitForm = async () => {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  try {
    await http.post("/savePhoto", form);
    ElMessage.success("照片参数保存成功");
    dialogVisible.value = false;
    await fetchPhotoList(true);
  } catch (e) {
    ElMessage.error("保存失败，请重试");
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
/* **************** 玻璃风统一变量 **************** */
:root {
  --glass-bg: rgba(255, 255, 255, 0.45);
  --glass-border: rgba(255, 255, 255, 0.35);
  --glass-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  --active: #409eff;
}

/* **************** 整体舞台 **************** */
.photo-root {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif;
}

/* 顶部操作区 */
.header-glass {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0px;
  border-radius: 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  box-shadow: var(--glass-shadow);
  border: 1px solid var(--glass-border);
}
.page-title {
  margin: 0;
  font-size: 1.8rem;
  color: #303133;
}
.upload-btn {
  border-radius: 8px;
}

/* 上传弹窗 */
.upload-dialog {
  border-radius: 12px;
}
.upload-tip {
  margin-left: 8px;
  color: #67c23a;
  font-size: 12px;
}

/* 轮播展示区 */
.carousel-glass {
  padding: 24px 32px;
  border-radius: 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  box-shadow: var(--glass-shadow);
  border: 1px solid var(--glass-border);
}
.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.section-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #303133;
}
.count {
  font-size: 0.9rem;
  color: #606266;
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 8px;
  border-radius: 12px;
}

/* 空 & 加载 */
.empty-glass,
.loading-glass {
  text-align: center;
  padding: 4rem 0;
  color: #909399;
}
.empty-glass i {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.loading-glass p {
  margin-top: 1rem;
}

/* 轮播卡片 */
.carousel-wrap {
  max-width: 1000px;
  margin: 0 auto;
}
.photo-card {
  position: relative;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background: #fff;
}
.photo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: opacity 0.5s, transform 0.3s;
}
.photo-img:hover {
  transform: scale(1.01);
}
.img-loading {
  opacity: 0.6;
}

/* 参数覆盖层 */
.photo-info {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: #fff;
  padding: 1.5rem 2rem;
  backdrop-filter: blur(2px);
}
.author {
  font-size: 1.2rem;
  margin: 0 0 0.8rem;
}
.params {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}
.param {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.param .label {
  font-size: 0.75rem;
  opacity: 0.8;
}
.param .value {
  font-size: 1rem;
  font-weight: 500;
  margin-top: 2px;
}

/* 指示器 & 箭头 */
:deep(.el-carousel__indicator) {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ddd;
  margin: 0 6px;
  transition: all 0.3s;
}
:deep(.el-carousel__indicator.is-active) {
  width: 30px;
  border-radius: 5px;
  background: var(--active);
}
:deep(.el-carousel__arrow) {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  opacity: 0.7;
  transition: all 0.3s;
}
:deep(.el-carousel__arrow:hover) {
  opacity: 1;
  background: rgba(0, 0, 0, 0.5);
}

/* 响应式 */
@media (max-width: 768px) {
  .photo-root {
    padding: 16px;
  }
  .header-glass {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
  }
  .carousel-glass {
    padding: 16px;
  }
  .photo-info {
    padding: 1rem;
  }
  .params {
    gap: 1rem;
  }
}

</style>