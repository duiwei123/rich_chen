// SSE 连接管理
let eventSource: EventSource | null = null
let reconnectTimer: number | null = null
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 10
const RECONNECT_DELAY = 3000

// SSE 配置
const SSE_URL = '/sse'

// 消息类型
interface SSEMessage {
  type: string
  title: string
  content: string
  time: string
}

// 消息处理函数
type MessageHandler = (data: SSEMessage) => void
const messageHandlers: MessageHandler[] = []

// 添加消息处理器
export function addMessageHandler(handler: MessageHandler) {
  messageHandlers.push(handler)
}

// 移除消息处理器
export function removeMessageHandler(handler: MessageHandler) {
  const index = messageHandlers.indexOf(handler)
  if (index > -1) {
    messageHandlers.splice(index, 1)
  }
}

// 处理接收到的消息
function handleMessage(event: MessageEvent) {
  console.log('收到 SSE 消息:', event.data)

  try {
    const data: SSEMessage = JSON.parse(event.data)

    // 检查是否 token 失效
    if (data.type === 'error' && (data.content?.includes('未登录') || data.content?.includes('登录'))) {
      localStorage.removeItem('token')
      window.location.href = '/login?expired=1'
      return
    }

    // 调用所有消息处理器
    messageHandlers.forEach(handler => handler(data))
  } catch (e) {
    console.error('解析 SSE 消息失败:', e, event.data)
  }
}

// 检查连接状态
function checkConnection() {
  if (eventSource) {
    const state = eventSource.readyState
    console.log('SSE 连接状态:', state) // 0=connecting, 1=open, 2=closing, 3=closed
    return state === EventSource.OPEN
  }
  return false
}

// 连接 SSE
export function connectSSE() {
  // 如果已有连接且状态正常，不重复连接
  if (eventSource && checkConnection()) {
    console.log('SSE 已经连接')
    return
  }

  // 如果已有连接，先关闭
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }

  try {
    console.log('正在连接 SSE...')

    // 获取 token 并加到 URL 中
    const token = localStorage.getItem('token')
    const url = token ? `${SSE_URL}?token=${token}` : SSE_URL
    console.log('SSE URL:', url)

    eventSource = new EventSource(url, {
      withCredentials: true
    })

    // 连接建立时触发
    eventSource.onopen = (event) => {
      console.log('SSE 连接已建立', event)
      reconnectAttempts = 0

      // 清除重连定时器
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
    }

    // 接收消息
    eventSource.onmessage = (event) => {
      handleMessage(event)
    }

    // 连接错误
    eventSource.onerror = (error) => {
      console.error('SSE 连接错误:', error)
      console.log('SSE readyState:', eventSource?.readyState)

      eventSource?.close()
      eventSource = null

      // 尝试重连
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++
        console.log(`SSE 正在重连 (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`)
        reconnectTimer = window.setTimeout(() => {
          connectSSE()
        }, RECONNECT_DELAY)
      } else {
        console.error('SSE 重连次数已达上限')
      }
    }
  } catch (e) {
    console.error('创建 SSE 连接失败:', e)
  }
}

// 断开 SSE
export function disconnectSSE() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }

  if (eventSource) {
    eventSource.close()
    eventSource = null
  }

  reconnectAttempts = 0
  console.log('SSE 已断开')
}

// 获取连接状态
export function isSSEConnected() {
  return checkConnection()
}

// 发送测试消息（调用后端接口）
export async function sendTestNotification() {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/testSSE', {
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      credentials: 'include'
    })
    const result = await response.json()
    console.log('测试消息发送结果:', result)
    return result
  } catch (e) {
    console.error('发送测试消息失败:', e)
  }
}
