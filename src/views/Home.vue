<template>
  <el-container>
    <el-main>
      <el-row>
        <!-- 顶部标题卡片 -->
        <el-col class="baise" :span="24">
          <el-card>
            <h2>{{ titleMessage }}</h2>
          </el-card>
        </el-col>

        <!-- 左右卡片分隔 -->
        <div class="littleCard"></div>

        <!-- 左侧卡片：天气和留言板 -->
        <el-col :span="11">
          <el-card class="left-card">
            <!-- 天气信息 -->
            <div v-if="isLoadingWeather" class="loading-placeholder">
              <el-skeleton animated></el-skeleton>
            </div>
            <div v-else>
              <img v-if="weatherImg" :src="weatherImg" alt="天气图标" />
              <div v-else class="placeholder">天气图标加载失败</div>
              <p v-if="weatherData.LocalName">
                {{ weatherData.LocalName }}市现在{{
                  weatherData.WeatherReal
                }}，气温{{ weatherData.Temperature }}℃
              </p>
              <p>{{ suggestion }}</p>
            </div>

            <!-- 留言板 -->
            <div class="message-board">
              <span>留言：</span>
              <div>
                <el-radio v-model="radio" label="1">对管理员</el-radio>
                <el-radio v-model="radio" label="2">公开</el-radio>
              </div>
            </div>

            <!-- 输入框和提交按钮 -->
            <el-input
              class="input-message"
              v-model="input"
              type="textarea"
              :rows="4"
              placeholder="请输入留言内容..."
            ></el-input>

            <el-button
              class="submit-button"
              type="primary"
              @click="saveMessageBoard"
              :loading="isSavingMessage"
              :disabled="!input.trim()"
            >
              提交留言
            </el-button>

            <!-- 提交成功提示 -->
            <el-alert
              title="提交成功！感谢您的留言"
              type="success"
              :closable="false"
              v-show="messageSubmitted"
              class="message-success"
            ></el-alert>
          </el-card>
        </el-col>

        <!-- 中间分隔 -->
        <el-col :span="2"></el-col>

        <!-- 右侧卡片：日历 -->
        <el-col :span="11">
          <el-card class="calendar">
            <el-calendar v-model="value">
              <template #date-cell="{ data }">
                <div class="calendar-cell">
                  {{ data.day.split("-").slice(2).join("-") }}
                  <div
                    v-for="item in getDateEvents(data.day)"
                    :key="item.date"
                    class="event-item"
                  >
                    <div
                      class="event-dot"
                      :style="{ backgroundColor: item.color || '#409EFF' }"
                    ></div>
                    <span
                      class="event-text"
                      :style="{ color: item.color || '#409EFF' }"
                      >￥{{ item.content }}</span
                    >
                  </div>
                </div>
              </template>
            </el-calendar>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
import http from "../utils/http";
import axios from "axios";

function getUrl(url) {
  return import(/* @vite-ignore */ "/src/assets/weatherIco/" + url + "-1x.png");
}

export default {
  data() {
    return {
      value: new Date(),
      loverWord: "",
      calendarEvents: [],
      weatherData: {},
      suggestion: "",
      weatherImg: "",
      titleMessage: "",
      cityName: "",
      input: "",
      radio: "1",
      isLoadingCity: false,
      isLoadingWeather: false,
      isSavingMessage: false,
      messageSubmitted: false,
      locationError: false,
    };
  },

  async mounted() {
    this.isLoadingCity = true;
    try {
      await this.getCityName();
      this.isLoadingCity = false;

      // 并行加载天气和建议
      this.isLoadingWeather = true;
      await Promise.all([this.getWeather(), this.getSuggestion()]);
      this.isLoadingWeather = false;

      // 加载日历数据和标题
      this.fetchCalendarData();
      this.getTitleMessage();
    } catch (error) {
      console.error("初始化失败:", error);
      this.isLoadingCity = false;
      this.isLoadingWeather = false;
      this.locationError = true;
    }
  },

  methods: {
    // 获取城市定位
    async getCityName() {
      try {
        const response = await axios.get(
          "https://qifu-api.baidubce.com/ip/local/geo/v1/district"
        );
        if (response.data.code === "Success") {
          this.cityName = response.data.data.city;
          console.log("定位城市:", this.cityName);
        } else {
          throw new Error(`定位失败: ${response.data.message}`);
        }
      } catch (error) {
        this.cityName = "北京"; // 默认城市
        console.error("定位失败，使用默认城市:", error);
        this.$message.warning("无法获取您的位置，将使用默认城市");
      }
    },

    // 获取天气信息
    async getWeather() {
      if (!this.cityName) return;

      try {
        const response = await http.get(`/getWeather?city=${this.cityName}`);
        this.weatherData = response.data;

        if (this.weatherData.WeatherCode) {
          const weatherCode = this.weatherData.WeatherCode;
          const module = await getUrl(weatherCode);
          this.weatherImg = module.default;
        }
      } catch (error) {
        console.error("获取天气失败:", error);
        this.$message.error("获取天气信息失败");
      }
    },

    // 获取建议
    async getSuggestion() {
      if (!this.cityName) return;

      try {
        const response = await http.get(`/getSuggestion?city=${this.cityName}`);
        const { brief, details } = response.data;
        this.suggestion = details ? `${brief} ${details}` : brief;
      } catch (error) {
        console.error("获取建议失败:", error);
        this.suggestion = "今日无特殊建议，请保持好心情~";
      }
    },

    // 获取日历数据
    async fetchCalendarData() {
      try {
        const response = await http.get("/getExpend");
        this.calendarEvents = response.data || [];
      } catch (error) {
        console.error("获取日历数据失败:", error);
        this.$message.error("加载日历数据失败");
      }
    },

    // 保存留言
    async saveMessageBoard() {
      if (!this.input.trim()) {
        this.$message.warning("请输入留言内容");
        return;
      }

      this.isSavingMessage = true;

      try {
        // 组装留言数据
        const message = {
          message: this.input,
          msgType: this.radio,
        };

        await http.post("/saveMessage", message, {
          headers: { "Content-Type": "application/json" },
        });

        // 显示成功提示
        this.messageSubmitted = true;
        this.input = ""; // 清空输入框

        // 3秒后隐藏提示
        setTimeout(() => {
          this.messageSubmitted = false;
        }, 3000);
      } catch (error) {
        console.error("保存留言失败:", error);
        this.$message.error("留言提交失败，请稍后再试");
      } finally {
        this.isSavingMessage = false;
      }
    },

    // 获取某天的日历事件
    getDateEvents(dateString) {
      return this.calendarEvents.filter((item) => item.date === dateString);
    },

    // 获取标题消息
    async getTitleMessage() {
      this.titleMessage =
        "每一天都是新的开始，带着希望出发，微笑面对生活。困难只是暂时的，坚持终会迎来光明。相信自己，你比想象中更强大。保持热爱，奔赴山海，未来可期！💪✨" +
        "(内容由deepseek生成)";
    },
  },
};
</script>

<style scoped>
/* 基础布局样式 */
.baise {
  margin-bottom: 60px;
}
.littleCard {
  margin-top: 25px;
  margin-bottom: 35px;
}
.left-card {
  margin-bottom: 55px;
}
.el-header {
  background-color: #409eff;
  color: white;
  text-align: center;
  line-height: 60px;
}

/* 日历样式 */
:deep(.el-calendar-table .el-calendar-day) {
  height: 65px !important;
}
.calendar .el-card__body .el-calendar .el-calendar__body {
  padding: 12px 20px 0px;
}
.el-calendar {
  --el-calendar-cell-width: 50px;
}
.event-text {
  font-size: 10px;
}

/* 留言板样式 */
.message-board {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 20px;
}

/* 输入框样式 */
.input-message {
  margin-bottom: 20px;
}
::v-deep .input-message .el-textarea__inner {
  height: 120px;
  resize: none;
}

/* 提交按钮样式 */
.submit-button {
  width: 100%;
  margin-bottom: 15px;
}

/* 成功提示样式 */
.message-success {
  margin-top: 15px;
}

/* 加载占位符 */
.loading-placeholder {
  min-height: 200px;
}

/* 天气图标样式 */
.placeholder {
  color: #909399;
  font-size: 14px;
  padding: 20px 0;
  text-align: center;
}
</style>