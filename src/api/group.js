import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: process.env.VUE_APP_BASE_ADDRESS + 'contacter/group',
    method: 'get',
    params: query
  })
}

// export function fetchGroup(id) {
//   return request({
//     url: process.env.VUE_APP_BASE_ADDRESS + 'contacter/group/' + id,
//     method: 'get'
//   })
// }

export function deleteGroup(id) {
  return request({
    url: process.env.VUE_APP_BASE_ADDRESS + 'contacter/group/' + id,
    method: 'delete'
  })
}

export function updateGroup(data) {
  return request({
    url: process.env.VUE_APP_BASE_ADDRESS + 'contacter/group',
    method: 'put',
    data
  })
}

export function saveGroup(data) {
  return request({
    url: process.env.VUE_APP_BASE_ADDRESS + 'contacter/group',
    method: 'post',
    data
  })
}
