<template>
  <div class="home-root">
    <!-- 顶部标题 -->
    <div class="header-card">
      <h2>{{ titleMessage }}</h2>
    </div>

    <!-- 第一排：天气 / 留言 / 日历 -->
    <div class="card-row">
      <!-- 天气 -->
      <div class="glass-card weather">
        <div v-if="isLoadingWeather" class="skeleton"/>
        <div v-else class="weather-body">
          <img v-if="weatherImg" :src="weatherImg" alt="天气" class="weather-icon">
          <div v-else class="icon-fail">图标加载失败</div>
          <div class="weather-info">
            <p class="city">{{ weatherData.LocalName }}市</p>
            <p class="temp">{{ weatherData.WeatherReal }}，{{ weatherData.Temperature }}℃</p>
            <p class="suggest">{{ suggestion }}</p>
          </div>
        </div>
      </div>

      <!-- 留言 -->
      <div class="glass-card message">
        <div class="card-header">
          <span>留言板</span>
          <div class="radio-wrap">
            <el-radio v-model="radio" label="1" size="small">对管理员</el-radio>
            <el-radio v-model="radio" label="2" size="small">公开</el-radio>
          </div>
        </div>

        <el-input
          v-model="input"
          type="textarea"
          :rows="3"
          placeholder="请输入留言内容..."
          class="msg-input" />

          <el-alert
          v-if="messageSubmitted"
          title="提交成功！感谢您的留言"
          type="success"
          :closable="false"
          class="msg-success"/>
          
        <el-button
          type="primary"
          size="small"
          :loading="isSavingMessage"
          :disabled="!input.trim()"
          class="msg-btn"
          @click="saveMessageBoard">
          提交留言
        </el-button>

        
      </div>

      <!-- 日历 -->
      <div class="glass-card calendar">
        <div class="card-header">日历</div>
        <el-calendar v-model="value" :first-day-of-week="1" class="compact-cal">
          <template #date-cell="{ data }">
            <div class="cal-cell">
              {{ data.day.split('-')[2] }}
              <div v-for="item in getDateEvents(data.day)" :key="item.date" class="event">
                <div class="dot" :style="{background:item.color||'#409EFF'}"/>
                <span class="txt">￥{{ item.content }}</span>
              </div>
            </div>
          </template>
        </el-calendar>
      </div>
    </div>

    <!-- 第二排：占位 -->
    <div class="card-row">
      <div v-for="i in 3" :key="i" class="glass-card placeholder">
        <i class="el-icon-placehoder"/>
        <p>功能开发中</p>
      </div>
    </div>
  </div>
</template>

<script>
/* ========== 以下逻辑完全不变 ========== */
import http from "../utils/http";
import axios from "axios";
function getUrl(url){ return import(/* @vite-ignore */ "/src/assets/weatherIco/"+url+"-1x.png") }

export default {
  data(){
    return {
      value: new Date(),
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
    }
  },
  async mounted(){
    this.isLoadingCity = true;
    try{
      await this.getCityName(); this.isLoadingCity = false;
      this.isLoadingWeather = true;
      await Promise.all([this.getWeather(), this.getSuggestion()]);
      this.isLoadingWeather = false;
      this.fetchCalendarData(); this.getTitleMessage();
    }catch(e){
      console.error("初始化失败:",e);
      this.isLoadingCity = this.isLoadingWeather = false;
      this.locationError = true;
    }
  },
  methods:{
    async getCityName(){
      try{
        const res = await axios.get("https://qifu-api.baidubce.com/ip/local/geo/v1/district");
        if(res.data.code==="Success") this.cityName = res.data.data.city;
        else throw new Error(`定位失败:${res.data.message}`);
      }catch(e){
        this.cityName = "北京";
        console.error("定位失败，使用默认城市:",e);
        this.$message.warning("无法获取您的位置，将使用默认城市");
      }
    },
    async getWeather(){
      if(!this.cityName) return;
      try{
        const res = await http.get(`/getWeather?city=${this.cityName}`);
        this.weatherData = res.data;
        if(this.weatherData.WeatherCode){
          const mod = await getUrl(this.weatherData.WeatherCode);
          this.weatherImg = mod.default;
        }
      }catch(e){ console.error("获取天气失败:",e); this.$message.error("获取天气信息失败"); }
    },
    async getSuggestion(){
      if(!this.cityName) return;
      try{
        const res = await http.get(`/getSuggestion?city=${this.cityName}`);
        const {brief,details} = res.data;
        this.suggestion = details ? `${brief} ${details}` : brief;
      }catch(e){ console.error("获取建议失败:",e); this.suggestion="今日无特殊建议，请保持好心情~"; }
    },
    async fetchCalendarData(){
      try{
        const res = await http.get("/getExpend");
        this.calendarEvents = res.data||[];
      }catch(e){ console.error("获取日历数据失败:",e); this.$message.error("加载日历数据失败"); }
    },
    async saveMessageBoard(){
      if(!this.input.trim()){ this.$message.warning("请输入留言内容"); return; }
      this.isSavingMessage = true;
      try{
        await http.post("/saveMessage",{message:this.input,msgType:this.radio},{headers:{"Content-Type":"application/json"}});
        this.messageSubmitted = true; this.input = "";
        setTimeout(()=>this.messageSubmitted=false,3000);
      }catch(e){ console.error("保存留言失败:",e); this.$message.error("留言提交失败，请稍后再试"); }
      finally{ this.isSavingMessage = false; }
    },
    getDateEvents(dateString){ return this.calendarEvents.filter(item=>item.date===dateString); },
    async getTitleMessage(){
      this.titleMessage = "每一天都是新的开始，带着希望出发，微笑面对生活。困难只是暂时的，坚持终会迎来光明。相信自己，你比想象中更强大。保持热爱，奔赴山海，未来可期！💪✨(内容由deepseek生成)";
    }
  }
}
</script>

<style scoped>

/* ---------------- 基础舞台 ---------------- */
.home-root{
  padding:24px;
  background:linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif;
}

/* 顶部标题 */
.header-card{
  margin-bottom:24px;
  padding:20px 32px;
  border-radius:16px;
  background:rgba(255,255,255,.6);
  backdrop-filter:blur(10px);
  box-shadow:0 8px 32px rgba(31,38,135,.15);
}
.header-card h2{
  margin:0;
  font-size:20px;
  color:#303133;
  letter-spacing:1px;
}

/* 卡片行 */
.card-row{
  display:flex;
  gap:20px;
  margin-bottom:20px;
}
@media(max-width:992px){
  .card-row{flex-direction:column}
}

/* 玻璃卡片通用 */
.glass-card{
  flex:1;
  padding:20px;
  border-radius:16px;
  background:rgba(255,255,255,.5);
  backdrop-filter:blur(10px);
  box-shadow:0 8px 32px rgba(31,38,135,.15);
  border:1px solid rgba(255,255,255,.3);
  transition:transform .3s;
}
.glass-card:hover{transform:translateY(-4px)}

/* 卡片头 */
.card-header{
  font-size:16px;
  font-weight:600;
  margin-bottom:12px;
  display:flex;
  justify-content:space-between;
  align-items:center;
}

/* 天气 */
.weather{display:flex;align-items:center;gap:12px}
.weather-icon{width:60px;height:60px}
.weather-info .city{font-size:15px;font-weight:500;margin-bottom:4px}
.weather-info .temp{font-size:14px;color:#606266;margin-bottom:4px}
.weather-info .suggest{font-size:12px;color:#909399;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.icon-fail{font-size:12px;color:#909399}

/* 留言 */
.radio-wrap{display:flex;gap:8px}
.msg-input{margin-bottom:10px}
.msg-btn{width:100%}
.msg-success{margin-top:8px}

/* 日历 */
.compact-cal{--el-calendar-cell-width:30px;font-size:11px}
.cal-cell{text-align:center;height:100%;padding:2px 0}
.event{display:flex;align-items:center;justify-content:center;margin-top:2px}
.dot{width:3px;height:3px;border-radius:50%;margin-right:2px}
.txt{font-size:9px}

/* 占位 */
.placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;color:#c0c4cc}
.placeholder i{font-size:28px;margin-bottom:8px}
.placeholder p{font-size:13px;margin:0}

/* 骨架屏 */
.skeleton{height:150px}

/* 统一 element 覆盖 */
:deep(.el-textarea__inner){resize:none;font-size:12px;padding:8px; min-height: 230px !important;}
:deep(.el-radio){margin:0}
:deep(.el-radio__label){font-size:12px}
</style>