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
            <el-button @click="getWeather"></el-button>
          </el-card>
        </el-col>
        <el-col :span="2"></el-col>
        <el-col :span="11">
          <el-card>
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
                    <span style="font-size: 10;" :style="{ color: item.color || '#409EFF' }" class="event-text">￥{{ item.content }}</span>
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
export default {
  data() {
    return {
      value: new Date(),
      loverWord: "",
      // 存储日历事件数据
      calendarEvents: {},
      // 示例数据格式：
      // {
      //   "2023-10-01": [
      //     { date: "2023-10-01", content: "国庆节", color: "#f00" }
      //   ]
      // }
    };
  },
  mounted() {
    this.fetchCalendarData();
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
    getWeather() {
      http.get("/getWeather");
    }, // 获取日历数据
    // 获取日历数据
    async fetchCalendarData() {
      try {
        const response = await http.get("/getExpend"); // 修改为你的实际接口
        console.log(response.data)
        var list = [response.data] 
        this.processCalendarData(list);
      } catch (error) {
        console.error("获取日历数据失败", error);
      }
    },

    // 处理原始数据
    processCalendarData(rawData) {
      this.calendarEvents = rawData.reduce((acc, item) => {
        console.log(item)
        const dateKey = item.date; // 确保接口返回的日期字段为date
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(item);
        return acc;
      }, {});
    },

    // 获取某天的事件
    getDateEvents(dateString) {
      return this.calendarEvents[dateString] || [];
    },
  },
};
</script>
  
  <style scoped>
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
.event-text{
  font-size: 10px;
}
</style>