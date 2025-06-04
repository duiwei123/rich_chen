<template>
  <div class="message-board-container max-w-4xl mx-auto px-4 py-6">
    <!-- 留言列表 -->
    <div class="space-y-4">
      <el-card
        class="message-card bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden"
        v-for="message in messageList"
        :key="message.id"
      >
        <!-- 留言头部：用户信息和时间 -->
        <template #header>
          <div class="items-center">
            <el-avatar
              :src="message.profilePhoto || 'https://picsum.photos/200/200'"
              size="middle"
              :shape="shape"
              class="border-2 border-gray-100"
            ></el-avatar>
            <div>
            {{ message.name }}
            </div>
            
          </div>
        </template>

        <!-- 留言内容 -->
        <div class="message-content text-gray-700 leading-relaxed p-0">
          <p>{{ message.message }}</p>
        </div>

        <!-- 底部操作区 -->
        <div
          class="flex justify-between items-center mt-4 pt-3 border-t border-gray-100"
        >
          <el-button
            size="small"
            type="text"
            @click="handleReplyClick(message.id)"
            :loading="activeReplyId === message.id && isReplying"
            class="hover:text-primary transition-colors duration-200"
          >
            <i class="el-icon-reply mr-1"></i> 回复
          </el-button>

          <!-- 回复数量和折叠/展开按钮 -->
          <el-button
            size="small"
            type="text"
            v-if="message.replies && message.replies.length > 0"
            @click="toggleReplies(message.id)"
            class="hover:text-primary transition-colors duration-200"
          >
            <i
              :class="[
                'el-icon-arrow-down',
                { 'el-icon-arrow-up': message.showReplies },
              ]"
            ></i>
            {{ message.replies.length }} 条回复
          </el-button>
        </div>

        <!-- 折叠/展开的回复列表 -->
        <div
          v-show="message.showReplies"
          class="mt-4 pt-4 border-t border-gray-100 bg-gray-50/50"
        >
          <div class="space-y-3">
            <el-card
              class="reply-card bg-white rounded-md shadow-xs border border-gray-100 overflow-hidden"
              v-for="reply in message.replies"
              :key="reply.id"
            >
              <template #header>
                <div class="flex items-center">
                  <el-avatar
                    :src="reply.avatar || 'https://picsum.photos/200/200'"
                    size="mini"
                    :shape="shape"
                    class="border border-gray-100"
                  ></el-avatar>
                  <div class="ml-2">
                    <div class="flex items-center">
                      <span class="font-medium text-gray-800 text-sm">{{
                        reply.username
                      }}</span>
                      <span
                        class="ml-2 text-gray-500 text-xs px-1 py-0.5 bg-gray-100 rounded"
                      >
                        <!-- {{ formatUserType(reply.userType) }} -->
                      </span>
                    </div>
                    <span
                      class="text-gray-500 text-xs flex items-center mt-0.5"
                    >
                      <i class="el-icon-time mr-1"></i>
                      <!-- {{ formatTime(reply.createTime) }} -->
                    </span>
                  </div>
                </div>
              </template>
              <div class="reply-content text-gray-700 text-sm p-0 mt-2">
                <p>{{ reply.content }}</p>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 回复输入框 -->
        <div v-if="activeReplyId === message.id" class="mt-4">
          <el-input
            v-model="replyContent"
            type="textarea"
            :rows="3"
            placeholder="写下你的回复..."
            class="border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
          ></el-input>
          <div class="flex justify-end mt-2">
            <el-button
              size="small"
              @click="cancelReply"
              class="hover:text-gray-700 transition-colors duration-200"
            >
              取消
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="submitReply(message.id)"
              :loading="isReplying"
              :disabled="!replyContent.trim()"
              class="hover:bg-primary/90 transition-colors duration-200"
            >
              发送
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 加载更多 -->
    <div class="text-center mt-8">
      <el-button
        @click="loadMore"
        :loading="isLoading"
        :disabled="isLoading || hasMoreData === false"
        class="px-6 py-2 border border-gray-200 hover:bg-gray-50 transition-colors duration-200 rounded-md"
      >
        {{ hasMoreData === false ? "没有更多数据" : "加载更多" }}
      </el-button>
    </div>
  </div>
</template>

<script>
import http from "../utils/http";

export default {
  data() {
    return {
      messageList: [],
    };
  },
  mounted() {
    this.getMessageList();
  },
  methods: {
    async getMessageList() {
      const response = await http.post("/messageList?pageSize=10&pageNum=1");
      this.messageList = response.data;
    },
  },
};
</script>

<style scoped>
.message-board-container {
  height: 863px;
}

.font-medium {
  height: 45px;
  line-height: 45px;
}
.items-center{
    display: flex;
    align-items: center;
}

.el-card + .el-card {
    margin-top: 10px;
}
</style>