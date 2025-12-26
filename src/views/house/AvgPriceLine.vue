<template>
  <div class="chart-container glass-effect">
    <h3 class="chart-title">房价走势图</h3>
    <div id="main" style="width: 100%; height: 350px;"></div>
  </div>
</template>

<script>
import http from "../../utils/http";
import * as echarts from "echarts";

export default {
  name: 'PriceChart',
  data() {
    return {
      avgPrice: [],
      dateList: [],
    };
  },
  mounted() {
    this.getAvgPrice();
  },
  methods: {
    async getAvgPrice() {
      try {
        const response = await http.get("/houseAvgPrice");
        const data = response.data;
        
        this.dateList = data.Date || [];
        this.avgPrice = data.AvgPrice || [];
        
        this.initChart();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    initChart() {
      var chartDom = document.getElementById("main");
      var myChart = echarts.init(chartDom);
      
      const option = {
        backgroundColor: 'transparent',
        textStyle: {
          color: '#333'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: "category",
          data: this.dateList,
          axisLine: {
            lineStyle: {
              color: 'rgba(0, 0, 0, 0.3)'
            }
          },
          axisLabel: {
            color: '#555'
          }
        },
        yAxis: {
          type: "value",
          axisLine: {
            lineStyle: {
              color: 'rgba(0, 0, 0, 0.3)'
            }
          },
          axisLabel: {
            color: '#555',
            formatter: '{value} 元'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        series: [
          {
            data: this.avgPrice,
            type: "line",
            smooth: true,
            lineStyle: {
              color: '#3498db',
              width: 3
            },
            itemStyle: {
              color: '#3498db',
              borderColor: '#fff',
              borderWidth: 2
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: 'rgba(52, 152, 219, 0.3)'
                }, {
                  offset: 1, color: 'rgba(52, 152, 219, 0.1)'
                }]
              }
            }
          },
        ],
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderColor: 'rgba(0, 0, 0, 0.1)',
          textStyle: {
            color: '#333'
          },
          formatter: function(params) {
            return `${params[0].name}<br/>均价: ${params[0].value} 元/㎡`;
          }
        }
      };

      myChart.setOption(option);
      
      // 响应式
      window.addEventListener('resize', () => {
        myChart.resize();
      });
    },
  },
};
</script>

<style scoped>
.chart-container {
  padding: 25px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.chart-title {
  text-align: center;
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
}

.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
</style>