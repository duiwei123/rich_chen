<template>
  <div class="calculator-container glass-effect">
    <h2 class="calculator-title">房贷计算器</h2>
    
    <div class="input-group">
      <label>贷款金额（万元）</label>
      <input 
        v-model.number="loanAmount" 
        type="number" 
        placeholder="请输入贷款金额"
        class="glass-input"
      >
    </div>

    <div class="input-group">
      <label>贷款年限</label>
      <select v-model.number="loanYears" class="glass-select">
        <option v-for="year in 30" :key="year" :value="year">{{ year }}年</option>
      </select>
    </div>

    <div class="input-group">
      <label>贷款利率（%）</label>
      <input 
        v-model.number="interestRate" 
        type="number" 
        step="0.01"
        placeholder="请输入年利率"
        class="glass-input"
      >
    </div>

    <!-- <div class="radio-group">
      <label>还款方式：</label>
      <div class="radio-options">
        <label class="radio-label">
          <input type="radio" v-model="repaymentType" value="equal-payment">
          等额本息
        </label>
        <label class="radio-label">
          <input type="radio" v-model="repaymentType" value="equal-principal">
          等额本金
        </label>
      </div>
    </div> -->

    <button @click="calculate" class="calculate-btn glass-button">计算</button>

    <div v-if="result" class="result-section">
      <div class="result-item">
        <span class="result-label">月供金额：</span>
        <span class="result-value">{{ formatCurrency(result.monthlyPayment) }}</span>
      </div>
      <div class="result-item">
        <span class="result-label">总利息：</span>
        <span class="result-value">{{ formatCurrency(result.totalInterest) }}</span>
      </div>
      <div class="result-item">
        <span class="result-label">还款总额：</span>
        <span class="result-value">{{ formatCurrency(result.totalPayment) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MortgageCalculator',
  data() {
    return {
      loanAmount: 70, // 万元
      loanYears: 30,
      interestRate: 4.1,
      repaymentType: 'equal-payment',
      result: null
    }
  },
  methods: {
    calculate() {
      const principal = this.loanAmount * 10000; // 转换为元
      const monthlyRate = this.interestRate / 100 / 12;
      const totalMonths = this.loanYears * 12;

      let monthlyPayment, totalPayment, totalInterest;

      if (this.repaymentType === 'equal-payment') {
        // 等额本息
        monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                        (Math.pow(1 + monthlyRate, totalMonths) - 1);
        totalPayment = monthlyPayment * totalMonths;
        totalInterest = totalPayment - principal;
      } else {
        // 等额本金
        const monthlyPrincipal = principal / totalMonths;
        let totalInterestCalc = 0;
        
        for (let month = 1; month <= totalMonths; month++) {
          const interestPayment = (principal - monthlyPrincipal * (month - 1)) * monthlyRate;
          totalInterestCalc += interestPayment;
        }
        
        monthlyPayment = monthlyPrincipal + principal * monthlyRate; // 首月还款
        totalInterest = totalInterestCalc;
        totalPayment = principal + totalInterest;
      }

      this.result = {
        monthlyPayment: Math.round(monthlyPayment),
        totalInterest: Math.round(totalInterest),
        totalPayment: Math.round(totalPayment)
      };
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'CNY'
      }).format(amount);
    }
  }
}
</script>

<style scoped>
.calculator-container {
  padding: 30px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  color: #333;
}

.calculator-title {
  text-align: center;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
}

.input-group {
  margin-bottom: 5px;
}

.input-group label {
  display: block;
  margin-bottom: 28px;
  font-weight: 500;
  color: #555;
}

.glass-input,
.glass-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  font-size: 16px;
  transition: all 0.3s ease;
}

.glass-input:focus,
.glass-select:focus {
  outline: none;
  border-color: #3498db;
  background: rgba(255, 255, 255, 0.3);
}

.radio-group {
  margin-bottom: 20px;
}

.radio-options {
  display: flex;
  gap: 20px;
  margin-top: 8px;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: normal;
}

.radio-label input[type="radio"] {
  margin-right: 6px;
}

.calculate-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.calculate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
}

.result-section {
  margin-top: 25px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 15px;
  backdrop-filter: blur(5px);
}

.result-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 8px 0;
}

.result-label {
  font-weight: 500;
  color: #555;
}

.result-value {
  font-weight: 600;
  color: #2c3e50;
  font-size: 18px;
}

.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
</style>