<template>
  <el-container>
    <el-main>
      <el-row>
        <el-col class="baise" :span="24">
          <el-card>
            <h2>
              欢迎使用 Vue 3 + Element Plus + ECharts + Axios + Vue Router
            </h2>
            <el-button type="primary" @click="goToUserManagement"
              >前往用户管理</el-button
            >
          </el-card>
        </el-col>
        <div class="littleCard"></div>
        <el-col :span="11">
          <el-card>
            <img :src="weatherImg" alt="Weather Image" />
            <p>{{ weatherData.LocalName }}市现在{{ weatherData.WeatherReal }}，气温{{ weatherData.Temperature }}℃</p>
            <p>{{ suggestion }}</p>
          </el-card>
        </el-col>
        <el-col :span="2"></el-col>
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
                      style="font-size: 10"
                      :style="{ color: item.color || '#409EFF' }"
                      class="event-text"
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

function getUrl(url) {
  return import(/* @vite-ignore */'/src/assets/weatherIco/'+ url +'-1x.png')
}
export default {
  data() {
    return {
      value: new Date(),
      loverWord: "",
      // 存储日历事件数据，改为数组类型
      calendarEvents: [],
      weatherData: {},
      suggestion: '',
      weatherImg: "",
    };
  },
  mounted() {
    this.fetchCalendarData();
    this.getWeather()
    this.getSuggestion()
  },
  methods: {
    goToUserManagement() {
      this.$router.push("/user-management");
    },
    testDate() {
      console.log(this.value);
    },
    getLoverWord() {
      try {
        const response = http.get("/getLoverWord");
        this.users = response.data;
        console.log(this.users);
      } catch (error) {
        console.error("获取用户数据失败", error);
      }
    },
    async getWeather() {
      const response = await http.get("/getWeather");
      this.weatherData = response.data;

      if (!this.weatherData.WeatherCode) {
        return;
      }
      const weatherCode = this.weatherData.WeatherCode;
      try {
        const module = await  getUrl(weatherCode)
        this.weatherImg = module.default;
      } catch (error) {
        console.error('加载图片出错:', error);
      }
    },
    async getSuggestion() {
      const response = await http.get("/getSuggestion")
      var suggest = response.data.brief 
      if(response.data.details) {
        suggest + response.data.details
      }
      this.suggestion = suggest
    },
    // 获取日历数据
    async fetchCalendarData() {
      try {
        const response = await http.get("/getExpend");
        console.log(response.data);
        // 假设 response.data 是数组
        this.calendarEvents = response.data;
      } catch (error) {
        console.error("获取日历数据失败", error);
      }
    },

    // 获取某天的事件
    getDateEvents(dateString) {
      return this.calendarEvents.filter(item => item.date === dateString);
    },
  },
};
</script>
  
  <style scoped>
  .calendar .el-card__body .el-calendar .el-calendar__body {
    padding: 12px 20px 0px;
  }
.el-calendar {
  --el-calendar-cell-width: 50px;
}
.baise {
  margin-bottom: 60px;
}
.littleCard {
  margin-top: 25px;
}
.el-header {
  background-color: #409eff;
  color: white;
  text-align: center;
  line-height: 60px;
}
.event-text {
  font-size: 10px;
}
</style>