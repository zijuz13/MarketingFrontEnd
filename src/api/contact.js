import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: process.env.VUE_APP_BASE_ADDRESS + 'contacter/contact',
    method: 'get',
    params: query
  })
}

export function fetchContacter(id) {
  return request({
    url: process.env.VUE_APP_BASE_ADDRESS + 'contacter/contact/' + id,
    method: 'get'
  })
}

export function deleteContacter(id) {
  return request({
    url: process.env.VUE_APP_BASE_ADDRESS + 'contacter/contact/' + id,
    method: 'delete'
  })
}

export function updateContacter(data) {
  return request({
    url: process.env.VUE_APP_BASE_ADDRESS + 'contacter/contact',
    method: 'put',
    data
  })
}

export function saveContacter(data) {
  return request({
    url: process.env.VUE_APP_BASE_ADDRESS + 'contacter/contact',
    method: 'post',
    data
  })
}
