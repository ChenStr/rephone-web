import request from '@/utils/request'

// 查询商品分类列表
export function listProductCategory(query) {
  return request({
    url: '/sqsm/product/category/list',
    method: 'get',
    params: query
  })
}


// 查询产品分类详细 (所有字段)
export function getProductCategory(id) {
  return request({
    url: '/sqsm/product/category/get/' + id,
    method: 'get'
  })
}

// 新增产品分类
export function addProductCategory(data) {
  return request({
    url: '/sqsm/product/category/',
    method: 'post',
    data: data
  })
}

// 修改产品分类
export function updateProductCategory(data) {
  return request({
    url: '/sqsm/product/category/',
    method: 'put',
    data: data
  })
}

// 删除产品分类
export function delProductCategory(id) {
  return request({
    url: '/sqsm/product/category/' + id,
    method: 'delete'
  })
}

