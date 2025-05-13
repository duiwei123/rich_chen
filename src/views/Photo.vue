<template>
  <div>
    <el-button type="primary" @click="dialogVisible = true">上传</el-button>
    <el-dialog
      title="表单弹窗"
      v-model="dialogVisible"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="光圈" prop="f">
          <el-input v-model="form.f" autocomplete="off" />
        </el-form-item>
        <el-form-item label="快门" prop="s">
          <el-input v-model="form.s" autocomplete="off" />
        </el-form-item>
        <el-form-item label="ISO" prop="iso">
          <el-input-number
            v-model="form.iso"
            :min="1"
            :max="12000"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="照片" prop="photo">
          <el-upload
            class="upload-demo"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="customUpload"
            :disabled="uploading"
          >
            <el-button type="primary" :loading="uploading">选择文件</el-button>
            <span
              v-if="form.imageRealName"
              style="margin-left: 10px; color: #67c23a"
              >已上传: {{ form.imageRealName }}</span
            >
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>
    <div>
      <el-carousel :interval="4000" type="card" height="500px">
        <el-carousel-item v-for="(item, index) in photoList" :key="index">
          <img :src="item.imageName" alt="Photo" class="carousel-image" />
        </el-carousel-item>
      </el-carousel>
    </div>
  </div>
</template>
  
  <script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import http from "../utils/http";

const dialogVisible = ref(false);
const uploading = ref(false);

const form = reactive({
  f: "",
  s: "",
  iso: "",
  imageName: "", // 照片文件名
  imageRealName: "",
});

const rules = {
  imageName: [{ required: true, message: "请上传照片", trigger: "change" }],
};

const photoList = ref([]);

onMounted(async () => {
  await fetchPhotoList();
});

// 获取照片列表
const fetchPhotoList = async () => {
  try {
    const res = await http.post("/getPhotoList");
    photoList.value = res.data || [];
    photoList.value.forEach((m) => {
      m.imageName = "http://115.190.91.146/preview/" + m.imageName;
      console.log("imagesrc->" + m.imageName);
    });
  } catch (error) {
    ElMessage.error("获取照片列表失败");
    console.error(error);
  }
};

const formRef = ref();

// 上传前校验
function beforeUpload(file) {
  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    ElMessage.error("只能上传图片文件");
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    ElMessage.error("图片大小不能超过2MB!");
    return false;
  }
  return true;
}

// 使用自定义上传
async function customUpload(option) {
  uploading.value = true;
  const formData = new FormData();
  formData.append("file", option.file);
  try {
    const res = await http.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    form.imageName = res.saved_name;
    form.imageRealName = res.original_name;
    if (form.photo) {
      ElMessage.success("上传成功");
    }
    await fetchPhotoList();
    option.onSuccess(res);
  } catch (error) {
    ElMessage.error("上传失败");
    option.onError(error);
  } finally {
    uploading.value = false;
  }
}

function submitForm() {
  formRef.value.validate((valid) => {
    if (valid) {
      http.post("/savePhoto", form).then(() => {
        ElMessage.success("提交成功！");
        dialogVisible.value = false;
        // 清空表单
        form.name = "";
        form.email = "";
        form.age = null;
        form.photo = "";
      });
    } else {
      ElMessage.error("请填写完整表单");
      return false;
    }
  });
}
</script>
  
  <style scoped>
.upload-demo {
  display: flex;
  align-items: center;
}
</style>