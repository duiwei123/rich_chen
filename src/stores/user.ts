import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('')
  const name = ref<string>('')
  const headPhoto = ref<string>('')

  const initUser = () => {
    token.value = localStorage.getItem('token') || ''
    name.value = localStorage.getItem('name') || ''
    headPhoto.value = localStorage.getItem('headPhoto') || '/src/assets/default-avatar.png'
  }

  const setUser = (userToken: string, userName: string, photo: string) => {
    token.value = userToken
    name.value = userName
    headPhoto.value = photo
    localStorage.setItem('token', userToken)
    localStorage.setItem('name', userName)
    localStorage.setItem('headPhoto', photo)
  }

  const clearUser = () => {
    token.value = ''
    name.value = ''
    headPhoto.value = ''
  }

  return {
    token,
    name,
    headPhoto,
    initUser,
    setUser,
    clearUser
  }
})
