import request from '@/utils/request'


// 查询商品分类分页列表
export function pageProductBrand(query) {
  return request({
    url: '/sqsm/product/brand/page',
    method: 'get',
    params: query
  })
}

// 查询商品分类列表
export function listProductBrand(query) {
  return request({
    url: '/sqsm/product/brand/list',
    method: 'get',
    params: query
  })
}


// 查询产品分类详细 (所有字段)
export function getProductBrand(id) {
  return request({
    url: '/sqsm/product/brand/get/' + id,
    method: 'get'
  })
}

// 新增产品分类
export function addProductBrand(data) {
  return request({
    url: '/sqsm/product/brand/',
    method: 'post',
    data: data
  })
}

// 修改产品分类
export function updateProductBrand(data) {
  return request({
    url: '/sqsm/product/brand/',
    method: 'put',
    data: data
  })
}

// 删除产品分类
export function delProductBrand(id) {
  return request({
    url: '/sqsm/product/brand/' + id,
    method: 'delete'
  })
}
