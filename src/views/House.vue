<template>
  <div class='house-root'>
    <!-- 顶部标题 -->
    <div class='header-card'>
      <h2>🏠 牛马人的一生之敌 — 房子那些事儿</h2>
    </div>

    <!-- 功能卡片区 -->
    <div class='card-row'>
      <!-- 房贷计算器 -->
      <div class='glass-card calculator-card'>
        <div class='card-header'>
          <span>🧮 房贷计算器</span>
        </div>

        <!-- 计算模式切换 -->
        <div class='calc-modes'>
          <div
            v-for='mode in calcModes'
            :key='mode.value'
            :class='[mode.value, { active: activeMode === mode.value }]'
            @click='activeMode = mode.value'
          >
            <el-icon><component :is='mode.icon' /></el-icon>
            <span>{{ mode.label }}</span>
          </div>
        </div>

        <!-- 模式1：标准计算 -->
        <div v-if='activeMode === 1' class='calc-form'>
          <div class='form-item full-width'>
            <label>🏠 房屋总价（万元）</label>
            <el-input-number
              v-model='stdCalc.housePrice'
              :min='10'
              :max='10000'
              :step='5'
              controls-position='right'
              class='calc-input'
            />
          </div>

          <div class='form-item'>
            <label>📝 首付比例</label>
            <el-slider
              v-model='stdCalc.downPaymentRatio'
              :min='10'
              :max='100'
              :step='5'
              show-stops
              :format-tooltip='(val: number) => val + "%"'
            />
            <span class='slider-value'>{{ stdCalc.downPaymentRatio }}%</span>
          </div>

          <div class='form-item'>
            <label>📅 贷款年限</label>
            <el-select v-model='stdCalc.loanYears' class='calc-select'>
              <el-option v-for='y in [5,10,15,20,25,30]' :key='y' :label='`${y}年`' :value='y' />
            </el-select>
          </div>

          <div class='form-item'>
            <label>🏦 贷款利率（%）</label>
            <el-input-number
              v-model='stdCalc.interestRate'
              :min='1'
              :max='10'
              :precision='2'
              :step='0.01'
              controls-position='right'
              class='calc-input'
            />
          </div>

          <div class='form-item full-width'>
            <label>💳 还款方式</label>
            <el-radio-group v-model='stdCalc.repaymentType' class='calc-radio'>
              <el-radio value='equal-payment'>等额本息</el-radio>
              <el-radio value='equal-principal'>等额本金</el-radio>
            </el-radio-group>
          </div>

          <div class='calc-summary'>
            <div class='summary-item'>
              <span class='summary-label'>首付金额</span>
              <span class='summary-value'>{{ formatCurrency(stdCalc.housePrice * stdCalc.downPaymentRatio / 100 * 10000) }}</span>
            </div>
            <div class='summary-item'>
              <span class='summary-label'>贷款金额</span>
              <span class='summary-value highlight'>{{ formatCurrency(stdCalc.housePrice * (100 - stdCalc.downPaymentRatio) / 100 * 10000) }}</span>
            </div>
          </div>

          <el-button type='primary' class='calc-btn' @click='calculateStandard'>
            💰 开始计算
          </el-button>

          <!-- 标准计算结果 -->
          <Transition name='slide'>
            <div v-if='stdResult' class='result-panel'>
              <div class='result-header'>
                <span>📊 计算结果</span>
                <el-tag :type='stdCalc.repaymentType === "equal-payment" ? "primary" : "success"' size='small'>
                  {{ stdCalc.repaymentType === 'equal-payment' ? '等额本息' : '等额本金' }}
                </el-tag>
              </div>
              <div class='result-grid'>
                <div class='result-item highlight'>
                  <span class='result-label'>每月月供</span>
                  <span class='result-value'>{{ formatCurrency(stdResult.monthlyPayment) }}</span>
                  <span v-if='stdCalc.repaymentType === "equal-principal"' class='result-tip'>首月最高</span>
                </div>
                <div class='result-item'>
                  <span class='result-label'>还款总额</span>
                  <span class='result-value secondary'>{{ formatCurrency(stdResult.totalPayment) }}</span>
                </div>
                <div class='result-item'>
                  <span class='result-label'>总利息</span>
                  <span class='result-value danger'>{{ formatCurrency(stdResult.totalInterest) }}</span>
                </div>
                <div class='result-item'>
                  <span class='result-label'>贷款本金</span>
                  <span class='result-value'>{{ formatCurrency(stdResult.principal) }}</span>
                </div>
              </div>

              <!-- 每月还款明细 -->
              <div class='detail-section'>
                <div class='detail-header' @click='showDetailTable = !showDetailTable'>
                  <span>📋 还款明细表</span>
                  <el-icon :class='{ rotate: showDetailTable }'><ArrowDown /></el-icon>
                </div>
                <Transition name='expand'>
                  <div v-if='showDetailTable' class='detail-table-wrapper'>
                    <table class='detail-table'>
                      <thead>
                        <tr>
                          <th>月份</th>
                          <th>月供</th>
                          <th>本金</th>
                          <th>利息</th>
                          <th>剩余本金</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for='item in stdResult.detailList' :key='item.month'>
                          <td>{{ item.month }}</td>
                          <td>{{ formatCurrency(item.payment) }}</td>
                          <td>{{ formatCurrency(item.principal) }}</td>
                          <td>{{ formatCurrency(item.interest) }}</td>
                          <td>{{ formatCurrency(item.remain) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Transition>
              </div>
            </div>
          </Transition>
        </div>

        <!-- 模式2：商贷 vs 公积金对比 -->
        <div v-if='activeMode === 2' class='calc-form'>
          <div class='form-item full-width'>
            <label>🏠 房屋总价（万元）</label>
            <el-input-number
              v-model='compareCalc.housePrice'
              :min='10'
              :max='10000'
              :step='5'
              controls-position='right'
              class='calc-input'
            />
          </div>

          <div class='form-item'>
            <label>📝 首付比例</label>
            <el-slider
              v-model='compareCalc.downPaymentRatio'
              :min='10'
              :max='100'
              :step='5'
              show-stops
              :format-tooltip='(val: number) => val + "%"'
            />
            <span class='slider-value'>{{ compareCalc.downPaymentRatio }}%</span>
          </div>

          <div class='form-item'>
            <label>📅 贷款年限</label>
            <el-select v-model='compareCalc.loanYears' class='calc-select'>
              <el-option v-for='y in [5,10,15,20,25,30]' :key='y' :label='`${y}年`' :value='y' />
            </el-select>
          </div>

          <div class='form-item'>
            <label>🏦 商业贷款利率（%）</label>
            <el-input-number
              v-model='compareCalc.commercialRate'
              :min='1'
              :max='10'
              :precision='2'
              :step='0.01'
              controls-position='right'
              class='calc-input'
            />
          </div>

          <div class='form-item'>
            <label>🏠 公积金利率（%）</label>
            <el-input-number
              v-model='compareCalc.fundRate'
              :min='1'
              :max='10'
              :precision='2'
              :step='0.01'
              controls-position='right'
              class='calc-input'
            />
          </div>

          <el-button type='primary' class='calc-btn' @click='calculateCompare'>
            💰 开始对比
          </el-button>

          <!-- 对比结果 -->
          <Transition name='slide'>
            <div v-if='compareResult' class='compare-panel'>
              <div class='compare-grid'>
                <div class='compare-card commercial'>
                  <div class='card-badge'>商业贷款</div>
                  <div class='compare-item'>
                    <span class='compare-label'>每月月供</span>
                    <span class='compare-value'>{{ formatCurrency(compareResult.commercial.monthlyPayment) }}</span>
                  </div>
                  <div class='compare-item'>
                    <span class='compare-label'>还款总额</span>
                    <span class='compare-value'>{{ formatCurrency(compareResult.commercial.totalPayment) }}</span>
                  </div>
                  <div class='compare-item'>
                    <span class='compare-label'>总利息</span>
                    <span class='compare-value danger'>{{ formatCurrency(compareResult.commercial.totalInterest) }}</span>
                  </div>
                </div>

                <div class='compare-card fund'>
                  <div class='card-badge'>公积金贷款</div>
                  <div class='compare-item'>
                    <span class='compare-label'>每月月供</span>
                    <span class='compare-value'>{{ formatCurrency(compareResult.fund.monthlyPayment) }}</span>
                  </div>
                  <div class='compare-item'>
                    <span class='compare-label'>还款总额</span>
                    <span class='compare-value'>{{ formatCurrency(compareResult.fund.totalPayment) }}</span>
                  </div>
                  <div class='compare-item'>
                    <span class='compare-label'>总利息</span>
                    <span class='compare-value success'>{{ formatCurrency(compareResult.fund.totalInterest) }}</span>
                  </div>
                </div>
              </div>

              <!-- 节省统计 -->
              <div class='save-stat'>
                <el-icon color='#27ae60'><CircleCheckFilled /></el-icon>
                <span>使用公积金贷款可节省</span>
                <span class='save-amount'>{{ formatCurrency(compareResult.savedInterest) }}</span>
                <span>利息！</span>
              </div>
            </div>
          </Transition>
        </div>

        <!-- 模式3：提前还款 -->
        <div v-if='activeMode === 3' class='calc-form'>
          <div class='form-item full-width'>
            <label>💰 原贷款金额（万元）</label>
            <el-input-number
              v-model='earlyCalc.loanAmount'
              :min='1'
              :max='10000'
              :step='5'
              controls-position='right'
              class='calc-input'
            />
          </div>

          <div class='form-item'>
            <label>📅 原贷款年限</label>
            <el-select v-model='earlyCalc.loanYears' class='calc-select'>
              <el-option v-for='y in [5,10,15,20,25,30]' :key='y' :label='`${y}年`' :value='y' />
            </el-select>
          </div>

          <div class='form-item'>
            <label>🏦 原利率（%）</label>
            <el-input-number
              v-model='earlyCalc.interestRate'
              :min='1'
              :max='10'
              :precision='2'
              :step='0.01'
              controls-position='right'
              class='calc-input'
            />
          </div>

          <div class='form-item full-width'>
            <label>⏰ 已还款期限</label>
            <div class='early-input-group'>
              <el-input-number
                v-model='earlyCalc.paidYears'
                :min='0'
                :max='earlyCalc.loanYears - 1'
                controls-position='right'
              />
              <span>年</span>
              <el-input-number
                v-model='earlyCalc.paidMonths'
                :min='0'
                :max='11'
                controls-position='right'
              />
              <span>月</span>
            </div>
          </div>

          <div class='form-item full-width'>
            <label>🎯 提前还款方式</label>
            <el-radio-group v-model='earlyCalc.repayType' class='calc-radio'>
              <el-radio value='partial'>部分还款</el-radio>
              <el-radio value='full'>全部还清</el-radio>
            </el-radio-group>
          </div>

          <div v-if='earlyCalc.repayType === "partial"' class='form-item full-width'>
            <label>💵 提前还款金额（万元）</label>
            <el-input-number
              v-model='earlyCalc.repayAmount'
              :min='1'
              :max='earlyCalc.loanAmount'
              :step='1'
              controls-position='right'
              class='calc-input'
            />
          </div>

          <div class='form-item full-width'>
            <label>📋 提前还款后</label>
            <el-radio-group v-model='earlyCalc.afterType' class='calc-radio'>
              <el-radio value='shorten'>缩短年限，月供不变</el-radio>
              <el-radio value='reduce'>减少月供，年限不变</el-radio>
            </el-radio-group>
          </div>

          <el-button type='primary' class='calc-btn' @click='calculateEarlyRepay'>
            💰 计算提前还款
          </el-button>

          <!-- 提前还款结果 -->
          <Transition name='slide'>
            <div v-if='earlyResult' class='early-result-panel'>
              <div class='result-header'>
                <span>📊 提前还款分析</span>
              </div>

              <div class='early-comparison'>
                <div class='early-before'>
                  <div class='early-title'>还款前</div>
                  <div class='early-item'>
                    <span>剩余本金</span>
                    <span>{{ formatCurrency(earlyResult.remainPrincipal) }}</span>
                  </div>
                  <div class='early-item'>
                    <span>剩余利息</span>
                    <span>{{ formatCurrency(earlyResult.remainInterest) }}</span>
                  </div>
                  <div class='early-item'>
                    <span>原月供</span>
                    <span>{{ formatCurrency(earlyResult.originalMonthly) }}</span>
                  </div>
                </div>

                <div class='early-arrow'>
                  <el-icon><Right /></el-icon>
                </div>

                <div class='early-after'>
                  <div class='early-title'>还款后</div>
                  <div class='early-item'>
                    <span>剩余本金</span>
                    <span class='highlight'>{{ formatCurrency(earlyResult.newPrincipal) }}</span>
                  </div>
                  <div class='early-item'>
                    <span>新月供</span>
                    <span class='highlight'>{{ formatCurrency(earlyResult.newMonthly) }}</span>
                  </div>
                  <div class='early-item'>
                    <span>剩余期限</span>
                    <span class='highlight'>{{ earlyResult.newMonths }}月</span>
                  </div>
                </div>
              </div>

              <div class='early-save'>
                <div class='save-card'>
                  <el-icon color='#27ae60'><TrendCharts /></el-icon>
                  <div class='save-content'>
                    <span class='save-label'>节省利息</span>
                    <span class='save-value'>{{ formatCurrency(earlyResult.savedInterest) }}</span>
                  </div>
                </div>
                <div class='save-card'>
                  <el-icon color='#3498db'><Clock /></el-icon>
                  <div class='save-content'>
                    <span class='save-label'>提前完结</span>
                    <span class='save-value'>{{ earlyResult.savedMonths }}个月</span>
                  </div>
                </div>
              </div>

              <div class='early-warning'>
                <el-icon><InfoFilled /></el-icon>
                <span>实际节省利息可能因银行违约金政策略有差异，请以银行计算为准</span>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- 房价走势图 -->
      <div class='glass-card chart-card'>
        <div class='card-header'>
          <span>📈 房价走势图</span>
          <el-select v-model='selectedHouse' placeholder='选择小区' clearable @change='fetchPriceData' style='width: 160px'>
            <el-option v-for='item in houseTargets' :key='item.id' :label='item.name' :value='item.communityId' />
          </el-select>
        </div>

        <div v-if='loadingChart' class='chart-skeleton'>
          <div class='skeleton-chart'></div>
        </div>
        <div v-else class='chart-wrapper'>
          <div ref='chartRef' class='echarts-container'></div>
        </div>
      </div>
    </div>

    <!-- 最低价格专区 -->
    <div class='card-row'>
      <div class='glass-card price-card'>
        <div class='card-header'>
          <span>💎 最低价格分析</span>
          <el-tag type='warning' effect='dark' size='small'>实时更新</el-tag>
        </div>

        <div class='price-stats'>
          <div class='stat-item'>
            <div class='stat-icon'>
              <el-icon><Bottom /></el-icon>
            </div>
            <div class='stat-content'>
              <span class='stat-label'>历史最低均价</span>
              <span class='stat-value'>{{ minPrice }} 元/㎡</span>
            </div>
          </div>
          <div class='stat-item'>
            <div class='stat-icon highlight'>
              <el-icon><Top /></el-icon>
            </div>
            <div class='stat-content'>
              <span class='stat-label'>历史最高均价</span>
              <span class='stat-value'>{{ maxPrice }} 元/㎡</span>
            </div>
          </div>
          <div class='stat-item'>
            <div class='stat-icon purple'>
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class='stat-content'>
              <span class='stat-label'>当前均价</span>
              <span class='stat-value'>{{ currentPrice }} 元/㎡</span>
            </div>
          </div>
          <div class='stat-item'>
            <div class='stat-icon green'>
              <el-icon><DataLine /></el-icon>
            </div>
            <div class='stat-content'>
              <span class='stat-label'>均价浮动</span>
              <span class='stat-value' :class='priceChangeClass'>
                {{ priceChangePercent }}
              </span>
            </div>
          </div>
        </div>

        <div class='price-tip'>
          <el-icon><InfoFilled /></el-icon>
          <span>数据仅供参考，实际房价因地段、配套等因素差异较大</span>
        </div>
      </div>
    </div>

    <!-- 房价监控目标 -->
    <div class='monitor-section'>
      <div class='section-header'>
        <div class='section-title'>
          <el-icon class='title-icon'><TrendCharts /></el-icon>
          <span>房价监控目标</span>
        </div>
        <div class='section-actions'>
          <el-button type='primary' :icon='Plus' @click='showAddTargetDialog'>添加小区</el-button>
          <el-button :icon='Refresh' @click='refreshTargets'>刷新</el-button>
          <el-button type='warning' :icon='DataLine' @click='triggerCrawl' :loading='crawlLoading'>手动抓取</el-button>
        </div>
      </div>

      <div class='monitor-grid' v-loading='targetLoading'>
        <el-empty v-if='!houseTargets.length' description='暂无监控目标,请添加小区' :image-size='60' />
        <div v-else class='target-list'>
          <div v-for='item in houseTargets' :key='item.id' class='target-item'>
            <div class='target-info'>
              <div class='target-name'>{{ item.name }}</div>
              <div class='target-meta'>
                <el-tag size='small' type='info'>{{ item.city }}</el-tag>
                <span class='target-id'>ID: {{ item.communityId }}</span>
              </div>
            </div>
            <div class='target-status'>
              <el-tag :type="item.status === 1 ? 'success' : 'info'" size='small'>
                {{ item.status === 1 ? '监控中' : '已暂停' }}
              </el-tag>
            </div>
            <el-button type='danger' link @click='deleteTarget(item)'>
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 添加目标弹窗 -->
  <el-dialog v-model='addTargetDialogVisible' title='添加房价监控目标' width='400px'>
    <el-form :model='targetForm' label-width='90px'>
      <el-form-item label='小区名称'>
        <el-input v-model='targetForm.name' placeholder='如：大正水晶森林1期' />
      </el-form-item>
      <el-form-item label='安居客ID'>
        <el-input v-model='targetForm.communityId' placeholder='如：1174281' />
      </el-form-item>
      <el-form-item label='城市'>
        <el-input v-model='targetForm.city' placeholder='如：郑州' />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click='addTargetDialogVisible = false'>取消</el-button>
      <el-button type='primary' @click='addTarget' :loading='targetSubmitting'>确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang='ts'>
import { ref, reactive, onMounted, computed, nextTick, shallowRef } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Bottom, Top, TrendCharts, DataLine, InfoFilled, ArrowDown, Right, CircleCheckFilled, Clock, Coin, Sort, Wallet, Plus, Refresh, Delete } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import http from '@/utils/http'

// ============ 计算模式切换 ============
const activeMode = ref(1)
const calcModes = [
  { value: 1, label: '标准计算', icon: Coin },
  { value: 2, label: '商贷vs公积金', icon: Sort },
  { value: 3, label: '提前还款', icon: Wallet }
]

// ============ 模式1：标准计算 ============
const stdCalc = reactive({
  housePrice: 100,
  downPaymentRatio: 30,
  loanYears: 30,
  interestRate: 4.1,
  repaymentType: 'equal-payment'
})
const stdResult = ref<any>(null)
const showDetailTable = ref(false)

const calculateStandard = () => {
  const principal = stdCalc.housePrice * (100 - stdCalc.downPaymentRatio) / 100 * 10000
  const monthlyRate = stdCalc.interestRate / 100 / 12
  const totalMonths = stdCalc.loanYears * 12
  const detailList: any[] = []

  let monthlyPayment: number, totalPayment: number, totalInterest: number

  if (stdCalc.repaymentType === 'equal-payment') {
    // 等额本息
    monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
                    (Math.pow(1 + monthlyRate, totalMonths) - 1)
    totalPayment = monthlyPayment * totalMonths
    totalInterest = totalPayment - principal

    // 生成每月明细
    let remain = principal
    for (let month = 1; month <= totalMonths; month++) {
      const interestPayment = remain * monthlyRate
      const principalPayment = monthlyPayment - interestPayment
      remain -= principalPayment
      detailList.push({
        month,
        payment: Math.round(monthlyPayment),
        principal: Math.round(principalPayment),
        interest: Math.round(interestPayment),
        remain: Math.round(Math.max(0, remain))
      })
    }
  } else {
    // 等额本金
    const monthlyPrincipal = principal / totalMonths
    monthlyPayment = monthlyPrincipal + principal * monthlyRate

    let totalInterestCalc = 0
    let remain = principal
    for (let month = 1; month <= totalMonths; month++) {
      const interestPayment = remain * monthlyRate
      totalInterestCalc += interestPayment
      const principalPayment = monthlyPrincipal
      remain -= principalPayment

      detailList.push({
        month,
        payment: Math.round(monthlyPrincipal + interestPayment),
        principal: Math.round(principalPayment),
        interest: Math.round(interestPayment),
        remain: Math.round(Math.max(0, remain))
      })

      // 每月递减
      monthlyPayment -= monthlyPrincipal * monthlyRate
    }
    totalPayment = principal + totalInterestCalc
    totalInterest = totalInterestCalc
  }

  stdResult.value = {
    monthlyPayment: Math.round(monthlyPayment),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    principal: Math.round(principal),
    detailList
  }
}

// ============ 模式2：商贷vs公积金对比 ============
const compareCalc = reactive({
  housePrice: 100,
  downPaymentRatio: 30,
  loanYears: 30,
  commercialRate: 4.1,
  fundRate: 3.1
})
const compareResult = ref<any>(null)

const calculateCompare = () => {
  const principal = compareCalc.housePrice * (100 - compareCalc.downPaymentRatio) / 100 * 10000
  const totalMonths = compareCalc.loanYears * 12

  // 商业贷款计算
  const commRate = compareCalc.commercialRate / 100 / 12
  const commMonthly = principal * (commRate * Math.pow(1 + commRate, totalMonths)) /
                     (Math.pow(1 + commRate, totalMonths) - 1)
  const commTotal = commMonthly * totalMonths
  const commInterest = commTotal - principal

  // 公积金贷款计算
  const fundRate = compareCalc.fundRate / 100 / 12
  const fundMonthly = principal * (fundRate * Math.pow(1 + fundRate, totalMonths)) /
                     (Math.pow(1 + fundRate, totalMonths) - 1)
  const fundTotal = fundMonthly * totalMonths
  const fundInterest = fundTotal - principal

  compareResult.value = {
    commercial: {
      monthlyPayment: Math.round(commMonthly),
      totalPayment: Math.round(commTotal),
      totalInterest: Math.round(commInterest)
    },
    fund: {
      monthlyPayment: Math.round(fundMonthly),
      totalPayment: Math.round(fundTotal),
      totalInterest: Math.round(fundInterest)
    },
    savedInterest: Math.round(commInterest - fundInterest)
  }
}

// ============ 模式3：提前还款 ============
const earlyCalc = reactive({
  loanAmount: 70,
  loanYears: 30,
  interestRate: 4.1,
  paidYears: 2,
  paidMonths: 0,
  repayType: 'partial',
  repayAmount: 10,
  afterType: 'shorten'
})
const earlyResult = ref<any>(null)

const calculateEarlyRepay = () => {
  const principal = earlyCalc.loanAmount * 10000
  const monthlyRate = earlyCalc.interestRate / 100 / 12
  const totalMonths = earlyCalc.loanYears * 12
  const paidMonths = earlyCalc.paidYears * 12 + earlyCalc.paidMonths

  // 计算已还本金和剩余本金
  // 使用等额本息计算
  const commMonthly = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
                     (Math.pow(1 + monthlyRate, totalMonths) - 1)

  let paidPrincipal = 0
  let remain = principal
  for (let i = 0; i < paidMonths; i++) {
    const interestPayment = remain * monthlyRate
    const principalPayment = commMonthly - interestPayment
    paidPrincipal += principalPayment
    remain -= principalPayment
  }

  const remainPrincipal = remain
  // 剩余利息 = 剩余本金 * 月利率 * 剩余月数
  const remainInterest = remainPrincipal * monthlyRate * (totalMonths - paidMonths)

  // 提前还款后的处理
  let newPrincipal: number, newMonthly: number, newMonths: number, savedInterest: number

  if (earlyCalc.repayType === 'full') {
    // 全部还清
    newPrincipal = 0
    newMonthly = 0
    newMonths = 0
    savedInterest = Math.round(remainInterest)
  } else {
    // 部分还款
    const repayAmount = earlyCalc.repayAmount * 10000

    if (earlyCalc.afterType === 'shorten') {
      // 缩短年限，月供不变
      newPrincipal = remainPrincipal - repayAmount
      // 重新计算新月供
      newMonthly = commMonthly
      // 倒推新月数
      newMonths = Math.log((newMonthly) / (newMonthly - newPrincipal * monthlyRate)) /
                  Math.log(1 + monthlyRate)
      newMonths = Math.ceil(newMonths)

      // 计算新方案下的总利息
      let newTotalInterest = 0
      let newRemain = newPrincipal
      for (let i = 0; i < newMonths; i++) {
        newTotalInterest += newRemain * monthlyRate
        newRemain -= (newMonthly - newRemain * monthlyRate)
      }

      savedInterest = Math.round(remainInterest - newTotalInterest)
    } else {
      // 减少月供，年限不变
      newPrincipal = remainPrincipal - repayAmount
      newMonths = totalMonths - paidMonths
      // 重新计算新月供
      newMonthly = newPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, newMonths)) /
                  (Math.pow(1 + monthlyRate, newMonths) - 1)

      // 新方案总利息
      let newTotalInterest = 0
      let newRemain = newPrincipal
      for (let i = 0; i < newMonths; i++) {
        newTotalInterest += newRemain * monthlyRate
        newRemain -= (newMonthly - newRemain * monthlyRate)
      }

      savedInterest = Math.round(remainInterest - newTotalInterest)
    }
  }

  // 节省月数
  const savedMonths = earlyCalc.repayType === 'full'
    ? totalMonths - paidMonths
    : Math.max(0, (totalMonths - paidMonths) - newMonths)

  earlyResult.value = {
    remainPrincipal: Math.round(remainPrincipal),
    remainInterest: Math.round(remainInterest),
    originalMonthly: Math.round(commMonthly),
    newPrincipal: Math.round(newPrincipal),
    newMonthly: Math.round(newMonthly),
    newMonths: Math.round(newMonths),
    savedInterest: Math.max(0, savedInterest),
    savedMonths: Math.round(savedMonths)
  }
}

// ============ 房价走势图 ============
const loadingChart = ref(false)
const chartRef = ref<HTMLElement>()
let myChart: echarts.ECharts | null = null
const selectedHouse = ref<string>('')

const avgPriceData = ref<number[]>([])
const minPriceData = ref<number[]>([])
const dateListData = ref<string[]>([])

const fetchPriceData = async () => {
  loadingChart.value = true
  try {
    const params = selectedHouse.value ? `?house_id=${selectedHouse.value}` : ''
    const res = await http.get('/houseAvgPrice' + params)
    console.log('Full response:', res)
    console.log('res.data:', res.data)

    // 兼容不同返回格式
    const data = res.data.data || res.data
    console.log('Actual data:', data)

    dateListData.value = data.Date || data.date || []
    avgPriceData.value = data.AvgPrice || data.avgPrice || []
    minPriceData.value = data.MinPrice || data.minPrice || []
    console.log('日期列表:', dateListData.value)
    console.log('均价数据:', avgPriceData.value)
    console.log('最低价数据:', minPriceData.value)
  } catch (e) {
    console.error('获取房价数据失败:', e)
  } finally {
    loadingChart.value = false
    nextTick(() => {
      initChart()
    })
  }
}

const initChart = () => {
  console.log('initChart called, chartRef:', chartRef.value)
  console.log('dateList:', dateListData.value, 'avgPrice:', avgPriceData.value, 'minPrice:', minPriceData.value)
  if (!chartRef.value) {
    console.log('chartRef is null, returning')
    return
  }

  // 如果没有数据，显示暂无数据
  if (dateListData.value.length === 0) {
    console.log('No data available')
    myChart = echarts.init(chartRef.value)
    myChart.setOption({
      backgroundColor: 'transparent',
      title: {
        text: '暂无房价数据',
        left: 'center',
        top: 'center',
        textStyle: { color: '#999', fontSize: 14 }
      }
    })
    return
  }

  if (myChart) {
    myChart.dispose()
  }

  myChart = echarts.init(chartRef.value)
  console.log('ECharts initialized, setting option')

  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dateListData.value,
      axisLine: { lineStyle: { color: 'rgba(0,0,0,0.15)' } },
      axisLabel: { color: '#606266', fontSize: 11 },
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(0,0,0,0.08)' } },
      axisLabel: {
        color: '#606266',
        formatter: '{value}'
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: 'rgba(0,0,0,0.1)',
      textStyle: { color: '#333' },
      formatter: (params: any) => {
        let result = `${params[0].name}<br/>`
        params.forEach((item: any) => {
          result += `${item.seriesName}: <b>${item.value}</b> 元/㎡<br/>`
        })
        return result
      }
    },
    series: [
      {
        name: '均价',
        data: avgPriceData.value,
        type: 'line',
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
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(52, 152, 219, 0.25)' },
              { offset: 1, color: 'rgba(52, 152, 219, 0.05)' }
            ]
          }
        }
      },
      {
        name: '最低价',
        data: minPriceData.value,
        type: 'line',
        smooth: true,
        lineStyle: {
          color: '#27ae60',
          width: 2,
          type: 'dashed'
        },
        itemStyle: {
          color: '#27ae60'
        }
      }
    ]
  }

  myChart.setOption(option)
}

// ============ 最低价格分析 ============
const minPrice = ref(0)
const maxPrice = ref(0)
const currentPrice = ref(0)

const priceChangeClass = computed(() => {
  const change = currentPrice.value - minPrice.value
  return change > 0 ? 'up' : 'down'
})

const priceChangePercent = computed(() => {
  if (!minPrice.value) return '0%'
  const change = ((currentPrice.value - minPrice.value) / minPrice.value * 100).toFixed(1)
  return `${change}%`
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const fetchMinPrice = async () => {
  try {
    const res = await http.get('/houseMinPrice')
    console.log('MinPrice response:', res)
    const data = res.data.data || res.data
    console.log('MinPrice data:', data)
    minPrice.value = data.minPrice || data.min_price || 0
    maxPrice.value = data.maxPrice || data.max_price || 0
    currentPrice.value = data.currentPrice || data.current_price || 0
    console.log('minPrice:', minPrice.value, 'maxPrice:', maxPrice.value, 'currentPrice:', currentPrice.value)
  } catch (e) {
    console.error('获取最低价格失败:', e)
  }
}

// ============ 监控目标管理 ============
const houseTargets = ref<any[]>([])
const targetLoading = ref(false)
const addTargetDialogVisible = ref(false)
const targetSubmitting = ref(false)
const targetForm = reactive({
  name: '',
  communityId: '',
  city: 'zhengzhou',
  remark: ''
})

const fetchTargets = async () => {
  targetLoading.value = true
  try {
    const res = await http.get('/houseTargets')
    houseTargets.value = res.data?.data || []
  } catch (e) {
    console.error('获取监控目标失败:', e)
  } finally {
    targetLoading.value = false
  }
}

const showAddTargetDialog = () => {
  targetForm.name = ''
  targetForm.communityId = ''
  targetForm.city = 'zhengzhou'
  targetForm.remark = ''
  addTargetDialogVisible.value = true
}

const addTarget = async () => {
  if (!targetForm.name || !targetForm.communityId) {
    ElMessage.warning('请填写小区名称和安居客ID')
    return
  }
  targetSubmitting.value = true
  try {
    await http.post('/houseTargets', targetForm)
    ElMessage.success('添加成功')
    addTargetDialogVisible.value = false
    fetchTargets()
  } catch (e) {
    console.error('添加失败:', e)
  } finally {
    targetSubmitting.value = false
  }
}

const deleteTarget = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定删除 "${row.name}" 吗？`, '提示', { type: 'warning' })
    await http.delete(`/houseTargets/${row.id}`)
    ElMessage.success('删除成功')
    fetchTargets()
  } catch (e) {
    if (e !== 'cancel') console.error('删除失败:', e)
  }
}

const refreshTargets = () => {
  fetchTargets()
  ElMessage.success('已刷新')
}

const crawlLoading = ref(false)

const triggerCrawl = async () => {
  crawlLoading.value = true
  try {
    await http.get('/saveHouse')
    ElMessage.success('抓取任务已触发，请稍后刷新查看数据')
  } catch (e) {
    console.error('触发抓取失败:', e)
    ElMessage.error('触发失败')
  } finally {
    crawlLoading.value = false
  }
}

onMounted(async () => {
  await fetchPriceData()
  await fetchMinPrice()
  await fetchTargets() // 获取监控目标

  nextTick(() => {
    initChart()
  })

  window.addEventListener('resize', () => {
    myChart?.resize()
  })
})
</script>

<style scoped>
.house-root {
  padding: var(--space-lg);
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100%;
}

/* 头部标题 */
.header-card {
  margin-bottom: var(--space-lg);
  padding: var(--space-md) var(--space-xl);
  border-radius: 12px;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  box-shadow: 0 4px 16px rgba(231, 76, 60, 0.3);
}

.header-card h2 {
  margin: 0;
  font-size: 16px;
  color: #fff;
  font-weight: 500;
}

/* 卡片行 */
.card-row {
  display: flex;
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.card-row:first-of-type {
  flex-direction: column;
}

.card-row:first-of-type .calculator-card {
  flex: none;
}

.card-row:first-of-type .chart-card {
  flex: none;
  height: 280px;
}

@media (max-width: 992px) {
  .card-row { flex-direction: column; }
}

/* 玻璃卡片 */
.glass-card {
  flex: 1;
  padding: var(--space-lg);
  border-radius: 12px;
  background: #fff;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.glass-card:hover {
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
}

.card-header .el-icon {
  color: #909399;
  cursor: pointer;
}

/* ============ 计算模式切换 ============ */
.calc-modes {
  display: flex;
  gap: 8px;
  margin-bottom: var(--space-lg);
  background: #f5f7fa;
  padding: 4px;
  border-radius: 10px;
}

.calc-modes > div {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 8px;
  border-radius: 8px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
}

.calc-modes > div:hover {
  background: #e8f4fc;
  color: #3498db;
}

.calc-modes > div.active {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: #fff;
  font-weight: 500;
}

.calc-modes .el-icon {
  font-size: 16px;
}

/* ============ 房贷计算器表单 ============ */
.calc-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item.full-width {
  grid-column: 1 / -1;
}

.form-item label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.calc-input,
.calc-select {
  width: 100%;
}

.calc-input :deep(.el-input__wrapper),
.calc-select :deep(.el-input__wrapper) {
  border-radius: 8px;
}

/* 滑块数值显示 */
.slider-value {
  font-size: 14px;
  font-weight: 600;
  color: #3498db;
  text-align: right;
}

.calc-radio {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.calc-radio :deep(.el-radio__label) {
  font-size: 13px;
}

/* 计算摘要 */
.calc-summary {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md);
  background: linear-gradient(135deg, #f8f9fa 0%, #e8f4fc 100%);
  border-radius: 10px;
  margin-top: var(--space-sm);
}

.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.summary-label {
  font-size: 12px;
  color: #909399;
}

.summary-value {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.summary-value.highlight {
  color: #3498db;
}

.calc-btn {
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border: none;
  font-size: 15px;
  font-weight: 600;
  margin-top: var(--space-sm);
  transition: all 0.3s;
}

.calc-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
}

/* 结果面板 */
.result-panel {
  margin-top: var(--space-lg);
  padding: var(--space-md);
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px dashed #e0e0e0;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.result-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: var(--space-sm);
  background: #fff;
  border-radius: 8px;
  position: relative;
}

.result-item.highlight {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

.result-item.highlight .result-label,
.result-item.highlight .result-value {
  color: #fff;
}

.result-tip {
  font-size: 10px;
  color: rgba(255,255,255,0.8);
  position: absolute;
  top: 4px;
  right: 4px;
}

.result-label {
  font-size: 12px;
  color: #909399;
}

.result-value {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
}

.result-value.secondary {
  color: #3498db;
}

.result-value.danger {
  color: #e74c3c;
}

/* 还款明细表 */
.detail-section {
  margin-top: var(--space-md);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #606266;
}

.detail-header:hover {
  background: #f5f7fa;
}

.detail-header .el-icon {
  transition: transform 0.3s;
}

.detail-header .el-icon.rotate {
  transform: rotate(180deg);
}

.detail-table-wrapper {
  max-height: 300px;
  overflow-y: auto;
  margin-top: var(--space-sm);
  border-radius: 8px;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.detail-table th,
.detail-table td {
  padding: 8px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.detail-table th {
  background: #f5f7fa;
  color: #606266;
  font-weight: 500;
  position: sticky;
  top: 0;
}

.detail-table td {
  color: #2c3e50;
}

/* ============ 商贷vs公积金对比 ============ */
.compare-panel {
  margin-top: var(--space-lg);
}

.compare-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.compare-card {
  position: relative;
  padding: var(--space-md);
  border-radius: 12px;
  background: #f8f9fa;
}

.compare-card.commercial {
  border: 2px solid #3498db;
}

.compare-card.fund {
  border: 2px solid #27ae60;
}

.card-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
}

.commercial .card-badge {
  background: #3498db;
}

.fund .card-badge {
  background: #27ae60;
}

.compare-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed #eee;
}

.compare-item:last-child {
  border-bottom: none;
}

.compare-label {
  font-size: 12px;
  color: #909399;
}

.compare-value {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.compare-value.danger {
  color: #e74c3c;
}

.compare-value.success {
  color: #27ae60;
}

/* 节省统计 */
.save-stat {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: var(--space-md);
  padding: var(--space-md);
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.1) 0%, rgba(39, 174, 96, 0.05) 100%);
  border-radius: 10px;
  font-size: 13px;
  color: #27ae60;
}

.save-amount {
  font-size: 18px;
  font-weight: 700;
  color: #27ae60;
}

/* ============ 提前还款 ============ */
.early-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.early-input-group .el-input-number {
  width: 80px !important;
}

.early-input-group span {
  font-size: 13px;
  color: #606266;
}

.early-result-panel {
  margin-top: var(--space-lg);
  padding: var(--space-md);
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px dashed #e0e0e0;
}

.early-comparison {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.early-before,
.early-after {
  flex: 1;
  padding: var(--space-md);
  background: #fff;
  border-radius: 10px;
}

.early-title {
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: var(--space-sm);
  padding-bottom: 8px;
  border-bottom: 2px solid #3498db;
}

.early-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 12px;
}

.early-item span:first-child {
  color: #909399;
}

.early-item span:last-child {
  color: #2c3e50;
  font-weight: 500;
}

.early-item .highlight {
  color: #3498db;
  font-weight: 600;
}

.early-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #3498db;
  border-radius: 50%;
  color: #fff;
}

.early-save {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.save-card {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: #fff;
  border-radius: 10px;
}

.save-content {
  display: flex;
  flex-direction: column;
}

.save-label {
  font-size: 12px;
  color: #909399;
}

.save-value {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.early-warning {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: rgba(243, 156, 18, 0.1);
  border-radius: 8px;
  color: #f39c12;
  font-size: 12px;
}

/* ============ 房价走势图 ============ */
.chart-card {
  flex: 1.5;
}

.city-select {
  width: 120px;
}

.city-select :deep(.el-input__wrapper) {
  border-radius: 8px;
}

.chart-skeleton {
  height: 300px;
}

.skeleton-chart {
  height: 100%;
  background: linear-gradient(90deg, #f0f2f5 25%, #e6e8eb 50%, #f0f2f5 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 8px;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.chart-wrapper {
  height: 100%;
}

.echarts-container {
  width: 100%;
  height: 100%;
}

/* ============ 最低价格分析 ============ */
.price-card {
  flex: 1;
}

.price-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: #f8f9fa;
  border-radius: 10px;
  transition: all 0.2s;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(231, 76, 60, 0.12);
  color: #e74c3c;
}

.stat-icon.highlight {
  background: rgba(52, 152, 219, 0.12);
  color: #3498db;
}

.stat-icon.purple {
  background: rgba(155, 89, 182, 0.12);
  color: #9b59b6;
}

.stat-icon.green {
  background: rgba(39, 174, 96, 0.12);
  color: #27ae60;
}

.stat-icon .el-icon {
  font-size: 22px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
}

.stat-value.up {
  color: #e74c3c;
}

.stat-value.down {
  color: #27ae60;
}

.price-tip {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: rgba(243, 156, 18, 0.1);
  border-radius: 8px;
  color: #f39c12;
  font-size: 12px;
}

/* ============ 房价监控目标 ============ */
.monitor-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 20px;
  margin-top: var(--space-lg);
}

.monitor-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.monitor-section .section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.monitor-section .title-icon {
  font-size: 22px;
}

.monitor-section .section-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.monitor-section .monitor-grid {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 16px;
  min-height: 120px;
}

.monitor-section .target-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.monitor-section .target-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.monitor-section .target-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.monitor-section .target-info {
  flex: 1;
  min-width: 0;
}

.monitor-section .target-name {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.monitor-section .target-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.monitor-section .target-id {
  font-size: 12px;
  color: #909399;
}

.monitor-section .target-status {
  flex-shrink: 0;
}

.price-tip .el-icon {
  flex-shrink: 0;
}

/* 动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 300px;
}
</style>