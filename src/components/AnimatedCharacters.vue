<template>
  <div class="animated-characters" ref="containerRef">
    <!-- Purple tall rectangle character - Back layer -->
    <div
      ref="purpleRef"
      class="character purple-character"
      :class="{ 'typing': isTyping, 'hiding-password': isHidingPassword }"
      :style="getPurpleStyle()"
    >
      <div class="eyes" :style="getPurpleEyesStyle()">
        <EyeBall
          :size="18"
          :pupilSize="7"
          :maxDistance="5"
          :isBlinking="isPurpleBlinking"
          :forceLookX="purpleForceX"
          :forceLookY="purpleForceY"
        />
        <EyeBall
          :size="18"
          :pupilSize="7"
          :maxDistance="5"
          :isBlinking="isPurpleBlinking"
          :forceLookX="purpleForceX"
          :forceLookY="purpleForceY"
        />
      </div>
    </div>

    <!-- Black tall rectangle character - Middle layer -->
    <div
      ref="blackRef"
      class="character black-character"
      :class="{ 'typing': isTyping, 'hiding-password': isHidingPassword }"
      :style="getBlackStyle()"
    >
      <div class="eyes" :style="getBlackEyesStyle()">
        <EyeBall
          :size="16"
          :pupilSize="6"
          :maxDistance="4"
          :isBlinking="isBlackBlinking"
          :forceLookX="blackForceX"
          :forceLookY="blackForceY"
        />
        <EyeBall
          :size="16"
          :pupilSize="6"
          :maxDistance="4"
          :isBlinking="isBlackBlinking"
          :forceLookX="blackForceX"
          :forceLookY="blackForceY"
        />
      </div>
    </div>

    <!-- Orange semi-circle character - Front left -->
    <div
      ref="orangeRef"
      class="character orange-character"
      :style="getOrangeStyle()"
    >
      <div class="pupils" :style="getOrangePupilsStyle()">
        <Pupil
          :size="12"
          :maxDistance="5"
          :forceLookX="orangeForceX"
          :forceLookY="orangeForceY"
        />
        <Pupil
          :size="12"
          :maxDistance="5"
          :forceLookX="orangeForceX"
          :forceLookY="orangeForceY"
        />
      </div>
    </div>

    <!-- Yellow tall rectangle character - Front right -->
    <div
      ref="yellowRef"
      class="character yellow-character"
      :style="getYellowStyle()"
    >
      <div class="pupils" :style="getYellowPupilsStyle()">
        <Pupil
          :size="12"
          :maxDistance="5"
          :forceLookX="yellowForceX"
          :forceLookY="yellowForceY"
        />
        <Pupil
          :size="12"
          :maxDistance="5"
          :forceLookX="yellowForceX"
          :forceLookY="yellowForceY"
        />
      </div>
      <div class="mouth" :style="getYellowMouthStyle()" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import EyeBall from './EyeBall.vue'
import Pupil from './Pupil.vue'

const props = defineProps<{
  isTyping?: boolean
  showPassword?: boolean
  passwordLength?: number
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const purpleRef = ref<HTMLDivElement | null>(null)
const blackRef = ref<HTMLDivElement | null>(null)
const orangeRef = ref<HTMLDivElement | null>(null)
const yellowRef = ref<HTMLDivElement | null>(null)

const mouseX = ref(0)
const mouseY = ref(0)
const isPurpleBlinking = ref(false)
const isBlackBlinking = ref(false)
const isLookingAtEachOther = ref(false)
const isPurplePeeking = ref(false)

const isHidingPassword = computed(() => props.passwordLength! > 0 && !props.showPassword)

// Mouse tracking
const handleMouseMove = (e: MouseEvent) => {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)

  // Purple blinking
  const schedulePurpleBlink = () => {
    const delay = Math.random() * 4000 + 3000
    setTimeout(() => {
      isPurpleBlinking.value = true
      setTimeout(() => {
        isPurpleBlinking.value = false
        schedulePurpleBlink()
      }, 150)
    }, delay)
  }
  schedulePurpleBlink()

  // Black blinking
  const scheduleBlackBlink = () => {
    const delay = Math.random() * 4000 + 3000
    setTimeout(() => {
      isBlackBlinking.value = true
      setTimeout(() => {
        isBlackBlinking.value = false
        scheduleBlackBlink()
      }, 150)
    }, delay)
  }
  scheduleBlackBlink()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})

// Watch for typing state
import { watch } from 'vue'
watch(() => props.isTyping, (val) => {
  if (val) {
    isLookingAtEachOther.value = true
    setTimeout(() => {
      isLookingAtEachOther.value = false
    }, 800)
  }
})

// Purple peek when password is visible
watch(() => props.showPassword, (val) => {
  if (val && props.passwordLength! > 0) {
    const schedulePeek = () => {
      const delay = Math.random() * 3000 + 2000
      setTimeout(() => {
        isPurplePeeking.value = true
        setTimeout(() => {
          isPurplePeeking.value = false
        }, 800)
      }, delay)
    }
    schedulePeek()
  }
})

// Calculate positions
const calculatePosition = (ref: HTMLDivElement | null) => {
  if (!ref) return { faceX: 0, faceY: 0, bodySkew: 0 }

  const rect = ref.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 3

  const deltaX = mouseX.value - centerX
  const deltaY = mouseY.value - centerY

  const faceX = Math.max(-15, Math.min(15, deltaX / 20))
  const faceY = Math.max(-10, Math.min(10, deltaY / 30))
  const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120))

  return { faceX, faceY, bodySkew }
}

const purplePos = computed(() => calculatePosition(purpleRef.value))
const blackPos = computed(() => calculatePosition(blackRef.value))
const orangePos = computed(() => calculatePosition(orangeRef.value))
const yellowPos = computed(() => calculatePosition(yellowRef.value))

// Purple character styles
const getPurpleStyle = () => {
  const height = (props.isTyping || isHidingPassword.value) ? '440px' : '400px'
  let transform = `skewX(${purplePos.value.bodySkew}deg)`

  if (props.passwordLength! > 0 && props.showPassword) {
    transform = 'skewX(0deg)'
  } else if (props.isTyping || isHidingPassword.value) {
    transform = `skewX(${purplePos.value.bodySkew - 12}deg) translateX(40px)`
  }

  return {
    height,
    transform,
    left: '70px'
  }
}

const getPurpleEyesStyle = () => {
  let left = `${45 + purplePos.value.faceX}px`
  let top = `${40 + purplePos.value.faceY}px`

  if (props.passwordLength! > 0 && props.showPassword) {
    left = '20px'
    top = '35px'
  } else if (isLookingAtEachOther.value) {
    left = '55px'
    top = '65px'
  }

  return { left, top }
}

const purpleForceX = computed(() => {
  if (props.passwordLength! > 0 && props.showPassword) {
    return isPurplePeeking.value ? 4 : -4
  }
  return isLookingAtEachOther.value ? 3 : undefined
})

const purpleForceY = computed(() => {
  if (props.passwordLength! > 0 && props.showPassword) {
    return isPurplePeeking.value ? 5 : -4
  }
  return isLookingAtEachOther.value ? 4 : undefined
})

// Black character styles
const getBlackStyle = () => {
  let transform = `skewX(${blackPos.value.bodySkew}deg)`

  if (props.passwordLength! > 0 && props.showPassword) {
    transform = 'skewX(0deg)'
  } else if (isLookingAtEachOther.value) {
    transform = `skewX(${blackPos.value.bodySkew * 1.5 + 10}deg) translateX(20px)`
  } else if (props.isTyping || isHidingPassword.value) {
    transform = `skewX(${blackPos.value.bodySkew * 1.5}deg)`
  }

  return { transform }
}

const getBlackEyesStyle = () => {
  let left = `${26 + blackPos.value.faceX}px`
  let top = `${32 + blackPos.value.faceY}px`

  if (props.passwordLength! > 0 && props.showPassword) {
    left = '10px'
    top = '28px'
  } else if (isLookingAtEachOther.value) {
    left = '32px'
    top = '12px'
  }

  return { left, top }
}

const blackForceX = computed(() => {
  if (props.passwordLength! > 0 && props.showPassword) return 4  // 偷看，往右看
  return isLookingAtEachOther.value ? 0 : undefined
})

const blackForceY = computed(() => {
  if (props.passwordLength! > 0 && props.showPassword) return 3  // 稍微往下看
  return isLookingAtEachOther.value ? -4 : undefined
})

// Orange character styles
const getOrangeStyle = () => {
  const transform = props.passwordLength! > 0 && props.showPassword
    ? 'skewX(0deg)'
    : `skewX(${orangePos.value.bodySkew}deg)`
  return { transform }
}

const getOrangePupilsStyle = () => {
  let left = `${82 + orangePos.value.faceX}px`
  let top = `${90 + orangePos.value.faceY}px`

  if (props.passwordLength! > 0 && props.showPassword) {
    left = '50px'
    top = '85px'
  }

  return { left, top }
}

const orangeForceX = computed(() => {
  return props.passwordLength! > 0 && props.showPassword ? -5 : undefined
})

const orangeForceY = computed(() => {
  return props.passwordLength! > 0 && props.showPassword ? -4 : undefined
})

// Yellow character styles
const getYellowStyle = () => {
  const transform = props.passwordLength! > 0 && props.showPassword
    ? 'skewX(0deg)'
    : `skewX(${yellowPos.value.bodySkew}deg)`
  return { transform }
}

const getYellowPupilsStyle = () => {
  let left = `${52 + yellowPos.value.faceX}px`
  let top = `${40 + yellowPos.value.faceY}px`

  if (props.passwordLength! > 0 && props.showPassword) {
    left = '20px'
    top = '35px'
  }

  return { left, top }
}

const getYellowMouthStyle = () => {
  let left = `${40 + yellowPos.value.faceX}px`
  let top = `${88 + yellowPos.value.faceY}px`

  if (props.passwordLength! > 0 && props.showPassword) {
    left = '10px'
    top = '88px'
  }

  return { left, top }
}

const yellowForceX = computed(() => {
  return props.passwordLength! > 0 && props.showPassword ? -5 : undefined
})

const yellowForceY = computed(() => {
  return props.passwordLength! > 0 && props.showPassword ? -4 : undefined
})
</script>

<style scoped>
.animated-characters {
  position: relative;
  width: 550px;
  height: 400px;
}

.character {
  position: absolute;
  bottom: 0;
  transition: all 0.7s ease-in-out;
  /* 进场动画 */
  animation: dropIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}

/* 进场动画定义 */
@keyframes dropIn {
  from {
    opacity: 0;
    transform: translateY(-500px) scale(0.5);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 依次进场延迟 */
.purple-character {
  animation-delay: 0.1s;
}

.black-character {
  animation-delay: 0.25s;
}

.orange-character {
  animation-delay: 0.4s;
}

.yellow-character {
  animation-delay: 0.55s;
}

/* Purple character */
.purple-character {
  width: 180px;
  background-color: #6C3FF5;
  border-radius: 10px 10px 0 0;
  z-index: 1;
}

.purple-character .eyes {
  position: absolute;
  display: flex;
  gap: 32px;
  transition: all 0.7s ease-in-out;
}

/* Black character */
.black-character {
  left: 240px;
  width: 120px;
  height: 310px;
  background-color: #2D2D2D;
  border-radius: 8px 8px 0 0;
  z-index: 2;
}

.black-character .eyes {
  position: absolute;
  display: flex;
  gap: 24px;
  transition: all 0.7s ease-in-out;
}

/* Orange character */
.orange-character {
  width: 240px;
  height: 200px;
  background-color: #FF9B6B;
  border-radius: 120px 120px 0 0;
  z-index: 3;
}

.orange-character .pupils {
  position: absolute;
  display: flex;
  gap: 32px;
  transition: all 0.2s ease-out;
}

/* Yellow character */
.yellow-character {
  left: 310px;
  width: 140px;
  height: 230px;
  background-color: #E8D754;
  border-radius: 70px 70px 0 0;
  z-index: 4;
}

.yellow-character .pupils {
  position: absolute;
  display: flex;
  gap: 24px;
  transition: all 0.2s ease-out;
}

.yellow-character .mouth {
  position: absolute;
  width: 80px;
  height: 4px;
  background-color: #2D2D2D;
  border-radius: 20px;
  transition: all 0.2s ease-out;
}
</style>
