import http from '@/utils/http'

export interface HouseTarget {
  id?: number
  name: string
  communityId: string
  city: string
  url?: string
  status: number
  remark?: string
}

export const houseTargetApi = {
  // 获取监控目标列表
  getList: () => http.get('/houseTargets'),

  // 添加监控目标
  add: (data: HouseTarget) => http.post('/houseTargets', data),

  // 更新监控目标
  update: (id: number, data: HouseTarget) => http.put(`/houseTargets/${id}`, data),

  // 删除监控目标
  delete: (id: number) => http.delete(`/houseTargets/${id}`)
}
