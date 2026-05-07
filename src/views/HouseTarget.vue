<template>
  <div class="house-target-page">
    <el-header>
      <div class="header-content">
        <el-button @click="$router.back()" :icon="ArrowLeft" circle />
        <h2>房价监控目标管理</h2>
        <el-button type="primary" @click="showAddDialog">+ 添加小区</el-button>
      </div>
    </el-header>

    <el-main>
      <el-table :data="targets" v-loading="loading" stripe>
        <el-table-column prop="name" label="小区名称" min-width="120" />
        <el-table-column prop="communityId" label="安居客ID" width="120" />
        <el-table-column prop="city" label="城市" width="100" />
        <el-table-column prop="url" label="URL" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editTarget(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteTarget(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-main>

    <!-- 添加/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑小区' : '添加小区'" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="小区名称" prop="name">
          <el-input v-model="form.name" placeholder="如：大正水晶森林1期" />
        </el-form-item>
        <el-form-item label="安居客ID" prop="communityId">
          <el-input v-model="form.communityId" placeholder="如：1174281" />
        </el-form-item>
        <el-form-item label="城市" prop="city">
          <el-select v-model="form.city" placeholder="选择城市">
            <el-option label="郑州" value="zhengzhou" />
            <el-option label="北京" value="beijing" />
            <el-option label="上海" value="shanghai" />
            <el-option label="广州" value="guangzhou" />
            <el-option label="深圳" value="shenzhen" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" rows="2" placeholder="可选填写" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { houseTargetApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const targets = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()

const form = reactive({
  id: null,
  name: '',
  communityId: '',
  city: 'zhengzhou',
  status: 1,
  remark: ''
})

const rules = {
  name: [{ required: true, message: '请输入小区名称', trigger: 'blur' }],
  communityId: [{ required: true, message: '请输入安居客ID', trigger: 'blur' }],
  city: [{ required: true, message: '请选择城市', trigger: 'change' }]
}

const fetchTargets = async () => {
  loading.value = true
  try {
    const res = await houseTargetApi.getList()
    targets.value = res.data?.data || []
  } catch (error) {
    console.error('获取列表失败:', error)
  } finally {
    loading.value = false
  }
}

const showAddDialog = () => {
  isEdit.value = false
  form.id = null
  form.name = ''
  form.communityId = ''
  form.city = 'zhengzhou'
  form.status = 1
  form.remark = ''
  dialogVisible.value = true
}

const editTarget = (row) => {
  isEdit.value = true
  form.id = row.id
  form.name = row.name
  form.communityId = row.communityId
  form.city = row.city
  form.status = row.status
  form.remark = row.remark || ''
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate()

  submitting.value = true
  try {
    if (isEdit.value) {
      await houseTargetApi.update(form.id, form)
      ElMessage.success('更新成功')
    } else {
      await houseTargetApi.add(form)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchTargets()
  } catch (error) {
    console.error('操作失败:', error)
  } finally {
    submitting.value = false
  }
}

const deleteTarget = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除 "${row.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await api.delete(`/houseTargets/${row.id}`)
    ElMessage.success('删除成功')
    fetchTargets()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

onMounted(fetchTargets)
</script>

<style scoped>
.house-target-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.el-header {
  background-color: #409EFF;
  color: white;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 16px;
}

.header-content h2 {
  margin: 0;
  font-size: 18px;
}

.el-main {
  padding: 16px;
}
</style>