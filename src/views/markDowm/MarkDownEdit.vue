<template>
  <div class="page-container">
    <h2>编辑笔记</h2>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const id = route.params.id
</script>

<style scoped>
.page-container {
  padding: 24px;
}
</style>
