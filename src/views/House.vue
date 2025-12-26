<template>
  <div class="main-container">
    <div class="content-wrapper">
      <div class="left-panel">
        <PriceChart />
      </div>
      <div class="right-panel">
        <MortgageCalculator />
      </div>
    </div>
  </div>
</template>

<script>
import PriceChart from './house/AvgPriceLine.vue';
import MortgageCalculator from './house/MortgageCalculator.vue';

export default {
  name: 'MainPage',
  components: {
    PriceChart,
    MortgageCalculator
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.main-container {
  padding: 40px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  align-items: start;
}

.left-panel,
.right-panel {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }
}
</style>