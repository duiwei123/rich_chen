<template>
  <button
    class="interactive-button"
    :class="{ 'full-width': fullWidth }"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <span class="button-text">{{ text }}</span>
    <div class="button-icon">
      <slot name="icon">
        <svg v-if="showArrow" class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </slot>
    </div>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  text?: string
  fullWidth?: boolean
  disabled?: boolean
  showArrow?: boolean
}>(), {
  text: 'Button',
  fullWidth: true,
  disabled: false,
  showArrow: true
})
</script>

<style scoped>
.interactive-button {
  position: relative;
  overflow: hidden;
  border-radius: 9999px;
  border: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-color, #fff);
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
}

.interactive-button.full-width {
  width: 100%;
}

.interactive-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-text {
  display: inline-block;
  transition: all 0.3s ease;
}

.interactive-button:hover:not(:disabled) .button-text {
  transform: translateX(20px);
  opacity: 0;
}

.button-icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: all 0.3s ease;
  color: #fff;
}

.interactive-button:hover:not(:disabled) .button-icon {
  opacity: 1;
}

.arrow-icon {
  width: 16px;
  height: 16px;
}
</style>
