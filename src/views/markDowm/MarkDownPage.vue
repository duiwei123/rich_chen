<template>
  <el-card
    class="reply-card bg-white rounded-md shadow-xs border border-gray-100 overflow-hidden"
    v-for="mark in page"
    :key="mark.id"
  >
    <span>{{ mark.title }}</span>
  </el-card>
</template>
<script>
import http from "../../utils/http";

export default {
  data() {
    return {
      page: [],
    };
  },
  mounted() {
    this.GetMarkDownPage();
  },
  methods: {
    async GetMarkDownPage() {
      const res = await http.get("/notePage");
      this.page = res.data;
    },
  },
};
</script>
<style scoped>
</style>
