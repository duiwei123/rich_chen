<template>
  <div class="wall-root">
    <!-- 顶部 Banner -->
    <div class="banner-glass">
      <h1>📸 摄影留言墙</h1>
      <p>{{ dailySentence }}</p>
    </div>

    <!-- 三栏布局 -->
    <div class="main-grid">
      <!-- 左侧：动态气泡装饰 -->
      <aside class="left-deco">
        <div
          v-for="b in bubbles"
          :key="b.id"
          class="bubble"
          :style="b.style"
        />
      </aside>

      <!-- 中间：留言瀑布流 -->
      <section class="center-waterfall">
        <!-- 发布区 -->
        <div class="publish-glass">
          <div class="avatar-uploader" @click="openFile">
            <img v-if="myAvatar" :src="myAvatar" class="my-avatar" />
            <i v-else class="el-icon-plus avatar-icon" />
          </div>
          <el-input
            v-model="newMsg"
            type="textarea"
            :rows="3"
            placeholder="写下你的留言…"
            class="msg-input"
          />
          <el-button type="primary" round :loading="publishing" @click="publish">
            发射
          </el-button>
        </div>

        <!-- 瀑布流列表 -->
        <transition-group name="drop" tag="div" class="waterfall">
          <div
            v-for="item in wallList"
            :key="item.id"
            class="item-glass"
            :style="{ '--delay': item.id * 50 + 'ms' }"
          >
            <div class="header">
              <el-avatar :src="item.avatar" size="small" />
              <span class="name">{{ item.name }}</span>
              <span class="time">{{ item.time }}</span>
            </div>
            <div class="content">{{ item.content }}</div>
            <img
              v-if="item.img"
              :src="item.img"
              class="content-img"
              @click="previewImg(item.img)"
            />
            <div class="footer">
              <div class="like" @click="toggleLike(item)">
                <i
                  :class="item.liked ? 'el-icon-star-on' : 'el-icon-star-off'"
                />
                <span>{{ item.likeCount }}</span>
              </div>
              <div class="reply-btn" @click="toggleReply(item)">
                <i class="el-icon-chat-dot-square" />
                <span>{{ item.replyList.length }}</span>
              </div>
            </div>
            <transition name="slide">
              <div v-if="item.showReply" class="reply-glass">
                <div
                  v-for="rep in item.replyList"
                  :key="rep.id"
                  class="reply-item"
                >
                  <el-avatar :src="rep.avatar" size="mini" />
                  <div class="reply-right">
                    <span class="reply-name">{{ rep.name }}</span>
                    <span class="reply-con">{{ rep.content }}</span>
                  </div>
                </div>
                <div class="reply-publish">
                  <el-input
                    v-model="item.replyText"
                    placeholder="回复 TA…"
                    size="mini"
                  />
                  <el-button
                    size="mini"
                    type="primary"
                    :disabled="!item.replyText"
                    @click="sendReply(item)"
                  >
                    发送
                  </el-button>
                </div>
              </div>
            </transition>
          </div>
        </transition-group>

        <!-- 加载更多 -->
        <div class="load-more">
          <el-button
            v-if="hasMore"
            :loading="loading"
            round
            @click="loadMore"
          >
            加载更多
          </el-button>
          <span v-else class="no-more">已经到底啦 ~</span>
        </div>
      </section>

      <!-- 右侧：热门标签云 -->
      <aside class="right-cloud">
        <div class="cloud-title">热门标签</div>
        <div class="cloud-body">
          <span
            v-for="tag in hotTags"
            :key="tag.id"
            class="tag-glass"
            :style="tag.style"
            @click="filterByTag(tag.name)"
          >
            #{{ tag.name }}
          </span>
        </div>

        <!-- 今日榜 -->
        <div class="rank-glass">
          <div class="rank-title">🔥 今日点赞榜</div>
          <div
            v-for="(u, idx) in todayTop"
            :key="u.id"
            class="rank-item"
          >
            <span class="rank-num">{{ idx + 1 }}</span>
            <el-avatar :src="u.avatar" size="mini" />
            <span class="rank-name">{{ u.name }}</span>
            <span class="rank-like">{{ u.likeCount }}</span>
          </div>
        </div>
      </aside>
    </div>

    <!-- 图片预览 -->
    <el-image-viewer
      v-if="showViewer"
      :url-list="[viewerUrl]"
      @close="showViewer = false"
    />
  </div>
</template>

<script>
/* ============== 纯前端假数据 ============== */
export default {
  data() {
    return {
      myAvatar: '',
      newMsg: '',
      publishing: false,
      loading: false,
      hasMore: true,
      showViewer: false,
      viewerUrl: '',
      dailySentence: '玻璃风，圆角毛玻璃，才是浪漫的开始 ~',
      wallList: [],
      bubbles: [],
      hotTags: [],
      todayTop: [],
    };
  },
  mounted() {
    this.seedWall();
    this.seedBubbles();
    this.seedTags();
    this.seedRank();
  },
  methods: {
    /* -------- 假数据 -------- */
    seedWall() {
      const fake = (i) => ({
        id: i,
        avatar: `https://picsum.photos/200/200?random=${i}`,
        name: `用户${i}`,
        time: `${i} 分钟前`,
        content:
          '玻璃风真的太好看啦！' +
          (i % 3 === 0 ? '顺便贴张图~' : '') +
          (i % 5 === 0
            ? '玻璃风真的太好看啦！顺便贴张图~玻璃风真的太好看啦！顺便贴张图~'
            : ''),
        img: i % 3 === 0 ? `https://picsum.photos/400/300?random=${i}` : '',
        likeCount: Math.floor(Math.random() * 99) + 1,
        liked: false,
        showReply: false,
        replyText: '',
        replyList:
          i % 2 === 0
            ? [
                {
                  id: i * 10 + 1,
                  avatar: `https://picsum.photos/200/200?random=${i + 100}`,
                  name: `回复者${i}`,
                  content: '赞同！颜值即正义',
                },
              ]
            : [],
      });
      for (let i = 1; i <= 12; i++) this.wallList.push(fake(i));
    },
    seedBubbles() {
      // 左侧气泡
      for (let i = 0; i < 20; i++) {
        this.bubbles.push({
          id: i,
          style: {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 40 + 20}px`,
            height: `${Math.random() * 40 + 20}px`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${Math.random() * 10 + 10}s`,
          },
        });
      }
    },
    seedTags() {
      const tags = ['玻璃风', '毛玻璃', '圆角', '悬浮动效', '玻璃风', '全屏沉浸', '瀑布流', '点赞', '回复', '加载更多'];
      this.hotTags = tags.map((t, i) => ({
        id: i,
        name: t,
        style: {
          fontSize: `${Math.random() * 12 + 12}px`,
          color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        },
      }));
    },
    seedRank() {
      for (let i = 0; i < 5; i++) {
        this.todayTop.push({
          id: i,
          avatar: `https://picsum.photos/200/200?random=${i + 300}`,
          name: `用户${i + 1}`,
          likeCount: Math.floor(Math.random() * 200) + 100,
        });
      }
    },

    /* -------- 业务逻辑 -------- */
    openFile() {
      this.myAvatar = `https://picsum.photos/200/200?random=${Date.now()}`;
    },
    publish() {
      if (!this.newMsg.trim()) return;
      this.publishing = true;
      setTimeout(() => {
        const item = {
          id: Date.now(),
          avatar: this.myAvatar || `https://picsum.photos/200/200?random=${Date.now()}`,
          name: '我',
          time: '刚刚',
          content: this.newMsg,
          img: '',
          likeCount: 0,
          liked: false,
          showReply: false,
          replyText: '',
          replyList: [],
        };
        this.wallList.unshift(item);
        this.newMsg = '';
        this.publishing = false;
        this.$message.success('留言已发射 ~');
      }, 600);
    },
    toggleLike(item) {
      item.liked = !item.liked;
      item.likeCount += item.liked ? 1 : -1;
    },
    toggleReply(item) {
      item.showReply = !item.showReply;
    },
    sendReply(item) {
      if (!item.replyText.trim()) return;
      item.replyList.push({
        id: Date.now(),
        avatar: this.myAvatar || `https://picsum.photos/200/200?random=${Date.now()}`,
        name: '我',
        content: item.replyText,
      });
      item.replyText = '';
      this.$message.success('回复已发送 ~');
    },
    previewImg(url) {
      this.viewerUrl = url;
      this.showViewer = true;
    },
    loadMore() {
      this.loading = true;
      setTimeout(() => {
        const more = [];
        const base = this.wallList.length;
        for (let i = 1; i <= 8; i++) {
          more.push({
            id: base + i,
            avatar: `https://picsum.photos/200/200?random=${base + i}`,
            name: `用户${base + i}`,
            time: `${base + i} 分钟前`,
            content: '玻璃风真的太好看啦！',
            img: '',
            likeCount: Math.floor(Math.random() * 99) + 1,
            liked: false,
            showReply: false,
            replyText: '',
            replyList: [],
          });
        }
        this.wallList.push(...more);
        this.loading = false;
        if (this.wallList.length >= 50) this.hasMore = false;
      }, 800);
    },
  },
};
</script>

<style scoped>
/* **************** 玻璃风统一变量 **************** */
:root{
  --glass-bg:rgba(255,255,255,.45);
  --glass-border:rgba(255,255,255,.35);
  --glass-shadow:0 8px 32px rgba(31,38,135,.15);
  --active:#409EFF;
}

/* **************** 整体舞台 **************** */
.wall-root{
  min-height:100vh;
  padding:24px;
  background:linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%);
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif;
}

/* 顶部Banner */
.banner-glass{
  margin:0 auto 24px;max-width:1200px;padding:24px 32px;border-radius:16px;
  background:var(--glass-bg);backdrop-filter:blur(10px);
  box-shadow:var(--glass-shadow);border:1px solid var(--glass-border);
  text-align:center;color:#303133;
}
.banner-glass h1{margin:0;font-size:1.8rem}
.banner-glass p{margin:4px 0 0;font-size:1rem;opacity:.8}

/* 三栏网格 */
.main-grid{
  display:grid;grid-template-columns:200px 1fr 240px;gap:24px;max-width:1200px;margin:0 auto;
}
@media(max-width:1024px){.main-grid{grid-template-columns:1fr}}

/* 左侧气泡装饰 */
.left-deco{position:relative;height:70vh;overflow:hidden}
.bubble{
  position:absolute;border-radius:50%;
  background:linear-gradient(135deg,var(--active),#7cb305);opacity:.15;
  animation:bubble 15s infinite ease-in-out;
}
@keyframes bubble{
  0%,100%{transform:translateY(0) scale(1)}
  50%{transform:translateY(-40px) scale(1.1)}
}

/* 中间瀑布流 */
.center-waterfall{height:70vh;overflow-y:auto;scrollbar-width:none}
.center-waterfall::-webkit-scrollbar{width:0}

.publish-glass{
  display:flex;gap:12px;align-items:flex-start;
  margin-bottom:24px;padding:16px;border-radius:16px;
  background:var(--glass-bg);backdrop-filter:blur(10px);
  box-shadow:var(--glass-shadow);border:1px solid var(--glass-border);
}
.avatar-uploader{
  width:48px;height:48px;border-radius:50%;overflow:hidden;
  background:rgba(255,255,255,.6);cursor:pointer;
  display:flex;align-items:center;justify-content:center;
}
.avatar-icon{font-size:20px;color:#909399}
.my-avatar{width:100%;height:100%;object-fit:cover}
.msg-input{flex:1}
.publish .el-button{border-radius:20px}

.waterfall{display:flex;flex-direction:column;gap:16px}

.item-glass{
  border-radius:16px;background:var(--glass-bg);backdrop-filter:blur(10px);
  box-shadow:var(--glass-shadow);border:1px solid var(--glass-border);
  animation:drop .6s ease-out backwards;animation-delay:var(--delay);
}
@keyframes drop{
  from{opacity:0;transform:translateY(-30px)}
  to{opacity:1;transform:translateY(0)}
}

.header{display:flex;align-items:center;gap:8px;padding:12px 16px 0}
.name{font-size:14px;font-weight:500;color:#303133}
.time{font-size:12px;color:#909399;margin-left:auto}

.content{padding:12px 16px;font-size:15px;color:#606266;line-height:1.8}
.content-img{
  width:100%;max-height:300px;object-fit:cover;border-radius:8px;margin-top:8px;cursor:pointer;
  transition:transform .3s;
}
.content-img:hover{transform:scale(1.02)}

.footer{
  display:flex;justify-content:space-between;align-items:center;
  padding:8px 16px 12px;border-top:1px solid var(--glass-border);
}
.like,.reply-btn{display:flex;align-items:center;gap:4px;cursor:pointer;font-size:13px;color:#606266;transition:color .3s}
.like:hover,.reply-btn:hover{color:var(--active)}
.like.liked{color:#f56c6c}

.reply-glass{
  margin:12px 16px 4px;padding:12px;border-radius:12px;
  background:rgba(255,255,255,.3);border:1px solid var(--glass-border);
}
.reply-item{
  display:flex;gap:8px;align-items:flex-start;margin-bottom:8px;
}
.reply-right{flex:1}
.reply-name{font-size:12px;font-weight:500;color:#303133;margin-right:6px}
.reply-con{font-size:13px;color:#606266;line-height:1.6}
.reply-publish{
  display:flex;gap:8px;margin-top:8px;
}
.reply-publish .el-input{flex:1}
.reply-publish .el-button{border-radius:12px}

/* 右侧标签云 & 排行 */
.right-cloud{height:70vh;display:flex;flex-direction:column;gap:24px}
.cloud-title,.rank-title{font-size:16px;font-weight:500;color:#303133;margin-bottom:12px}
.cloud-body{display:flex;flex-wrap:wrap;gap:8px}
.tag-glass{
  padding:4px 10px;border-radius:12px;
  background:var(--glass-bg);backdrop-filter:blur(10px);
  border:1px solid var(--glass-border);cursor:pointer;
  transition:all .3s;
}
.tag-glass:hover{transform:scale(1.05);box-shadow:var(--glass-shadow)}

.rank-glass{
  flex:1;padding:16px;border-radius:16px;
  background:var(--glass-bg);backdrop-filter:blur(10px);
  border:1px solid var(--glass-border);
}
.rank-item{
  display:flex;align-items:center;gap:8px;margin-bottom:10px;
}
.rank-num{width:20px;text-align:center;font-size:12px;color:#909399}
.rank-name{flex:1;font-size:13px;color:#303133}
.rank-like{font-size:12px;color:#f56c6c}

/* 加载更多 */
.load-more{text-align:center;margin:32px 0 16px}
.load-more .el-button{border-radius:20px}
.no-more{font-size:13px;color:#909399}

/* 图片预览 */
:deep(.el-image-viewer__wrapper){backdrop-filter:blur(8px)}

/* 移动端 */
@media(max-width:768px){
  .wall-root{padding:16px}
  .banner-glass{padding:16px}
  .left-deco,.right-cloud{display:none}
  .center-waterfall{height:75vh}
}
</style>