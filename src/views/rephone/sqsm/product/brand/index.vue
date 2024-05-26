<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--品牌信息列表-->
      <el-col :span="24" :xs="24">
        <!--品牌筛选框-->
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="品牌名称" prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入品牌名称"
              clearable
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="是否推荐" prop="recommend">
            <el-select
              v-model="queryParams.recommend"
              placeholder="是否推荐"
              clearable
              style="width: 240px"
            >
              <el-option
                v-for="dict in dict.type.sqsm_brand_recommend"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="类型" prop="type">
            <el-select
              v-model="queryParams.type"
              placeholder="品牌类型"
              clearable
              style="width: 240px"
            >
              <el-option
                v-for="dict in dict.type.sqsm_brand_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="商品品牌状态" clearable>
              <el-option
                v-for="dict in dict.type.sys_normal_disable"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="dateRange"
              style="width: 240px"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="primary"
              plain
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
              v-hasPermi="['sqsm:product:brand:add']"
            >新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              plain
              icon="el-icon-edit"
              size="mini"
              :disabled="single"
              @click="handleUpdate"
              v-hasPermi="['sqsm:product:brand:edit']"
            >修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              plain
              icon="el-icon-delete"
              size="mini"
              :disabled="multiple"
              @click="handleDelete"
              v-hasPermi="['sqsm:product:brand:remove']"
            >删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="info"
              plain
              icon="el-icon-upload2"
              size="mini"
              @click="handleImport"
              v-hasPermi="['sqsm:product:brand:import']"
            >导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="warning"
              plain
              icon="el-icon-download"
              size="mini"
              @click="handleExport"
              v-hasPermi="['sqsm:product:brand:export']"
            >导出</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :columns="selectColumns"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="brandList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="id" align="center" v-if="false" prop="id"/>
          <el-table-column label="品牌编号" align="center" prop="code" v-if="authOr('code',this.columns.list)" />
          <el-table-column label="品牌名称" align="center" prop="name" :show-overflow-tooltip="true" v-if="authOr('name',this.columns.list)" />
          <el-table-column label="品牌logo" align="center" prop="logo" v-if="authOr('logo',this.columns.list)" >
            <template slot-scope="scope">
              <el-image
                style="max-width: 100px; max-height: 100px"
                :src="scope.row.logo"
                fit="contain">
              </el-image>
            </template>
          </el-table-column>
          <el-table-column label="品牌网址" align="center" prop="webUrl" v-if="authOr('web_url',this.columns.list)" >
            <template slot-scope="scope">
              <el-link type="primary" :href="scope.row.webUrl" target="_blank">{{ scope.row.name }}品牌网址</el-link>
            </template>
          </el-table-column>
          <el-table-column label="品牌描述" align="center" prop="desc" v-if="authOr('desc',this.columns.list)" />
          <el-table-column label="排序" align="center" prop="sort" v-if="authOr('sort',this.columns.list)" />
          <el-table-column label="是否推荐" align="center" prop="recommend" v-if="authOr('recommend',this.columns.list)" >
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.recommend"
                active-value="0"
                inactive-value="1"
                @change="handleRecommendChange(scope.row)"
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="是否显示" align="center" v-if="authOr('status',this.columns.list)">
            <template slot-scope="scope">
              <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="160"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="scope" v-if="scope.row.userId !== 1">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
                v-hasPermi="['sqsm:product:brand:edit']"
              >修改</el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['sqsm:product:brand:remove']"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>

    <!-- 添加或修改品牌配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="品牌名称" prop="name" v-if="authOr('name',eidtOrSaveType())" >
              <el-input v-model="form.name" placeholder="请输入品牌昵称" maxlength="32" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品牌编码" prop="code" v-if="authOr('code',eidtOrSaveType())" >
              <el-input v-model="form.code" placeholder="请输入品牌编码" maxlength="64" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="品牌网址" prop="webUrl" v-if="authOr('web_url',eidtOrSaveType())" >
              <el-input v-model="form.webUrl" placeholder="请输入品牌网址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="描述" prop="desc" v-if="authOr('desc',eidtOrSaveType())" >
              <el-input v-model="form.desc" type="textarea" placeholder="请输入品牌描述"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort" v-if="authOr('sort',eidtOrSaveType())" >
              <el-input-number v-model="form.sort" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="是否推荐" prop="recommend" v-if="authOr('recommend',eidtOrSaveType())" >
              <el-select v-model="form.recommend" placeholder="请选择是否推荐">
                <el-option
                  v-for="dict in dict.type.sqsm_brand_recommend"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型" prop="type" v-if="authOr('type',eidtOrSaveType())" >
              <el-select v-model="form.type" placeholder="请选择类型">
                <el-option
                  v-for="dict in dict.type.sqsm_brand_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="logo图片" prop="logo" v-if="authOr('logo',eidtOrSaveType())" >
              <el-upload
                class="avatar-uploader"
                :action="this.brandUpload.url"
                :show-file-list="false"
                :headers="upload.headers"
                :on-success="handleLogoSuccess"
                :before-upload="beforeLogoUpload">
                <i v-if="isUpload(this.form.logo)" class="el-icon-plus avatar-uploader-icon"></i>
                <img v-else :src="this.form.logo" class="avatar">
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品图片" prop="img" v-if="authOr('img',eidtOrSaveType())" >
              <el-upload
                class="avatar-uploader"
                :action="this.brandUpload.url"
                :show-file-list="false"
                :headers="upload.headers"
                :on-success="handleImgSuccess"
                :before-upload="beforeImgUpload">
                <i v-if="isUpload(this.form.img)" class="el-icon-plus avatar-uploader-icon"></i>
                <img v-else :src="this.form.img" class="avatar">
              </el-upload>
              
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="品牌状态" prop="status" v-if="authOr('status',eidtOrSaveType())" >
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in dict.type.sys_normal_disable"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark" v-if="authOr('remark',eidtOrSaveType())" >
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <!-- <div class="el-upload__tip text-center" slot="tip">
          <div class="el-upload__tip" slot="tip">
            <el-checkbox v-model="upload.updateSupport" /> 是否更新已经存在的用户数据
          </div>
          <span>仅允许导入xls、xlsx格式文件。</span>
          <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">下载模板</el-link>
        </div> -->
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listProductBrand,pageProductBrand,addProductBrand,updateProductBrand,getProductBrand,delProductBrand } from "@/api/rephone/sqsm/product/brand";
import { brand } from "../product.json";
import { getToken } from "@/utils/auth";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "Brand",
  dicts: ['sqsm_brand_recommend', 'sqsm_brand_type', 'sys_normal_disable'],
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 品牌数据
      brandList: null,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 表单参数
      form: {},
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "sqsm/product/brand/importData"
      },
      // 用户上传产品图片参数
      brandUpload: {
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/sqsm/file/product/uploadBrand",
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        recommend: undefined,
        type: undefined,
        row: undefined,
        status: undefined
      },
      // 权限判断
      columns: {
      },
      // 表单校验
      rules: {
        name: [
          { required: true, message: "品牌名称不能为空", trigger: "blur" },
          { min: 1, max: 32, message: '品牌名称长度必须介于 1 和 32 之间', trigger: 'blur' }
        ],
        code: [
          { required: true, message: "品牌编码不能为空", trigger: "blur" },
          { min: 1, max: 64, message: '品牌编码长度必须介于 1 和 64 之间', trigger: 'blur' }
        ],
      },
      // 用户选择展示的列
      selectColumns: [

      ]
    };
  },
  watch: {
  },
  created() {
    this.initMethod();
    this.getList();
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      if (this.columns.list != null) {
        this.queryParams.row = this.columns.list;
      }
      pageProductBrand(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.brandList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 产品推荐
    handleRecommendChange(row) {
      let text = row.recommend === "0" ? "推荐" : "不推荐";
      if(this.columns.add) {
        row.row = this.columns.add;
      }
      this.$modal.confirm('确认要"' + text + '""' + row.name + '"品牌吗？').then(function() {
        return updateProductBrand(row);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function() {
        row.recommend = row.recommend === "0" ? "1" : "0";
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        name: undefined,
        code: undefined,
        webUrl: undefined,
        sort: 0,
        status: '0',
        recommend: undefined,
        type: undefined,
        desc: undefined,
        logo: undefined,
        img: undefined,
        remark: undefined
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "新增品牌";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getProductBrand(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改品牌";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if(this.columns.add) {
            this.form.row = this.columns.add;
          }
          if (this.form.id != undefined) {
            updateProductBrand(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addProductBrand(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.id || this.ids;
      this.$modal.confirm('是否确认删除品牌为"' + row.name + '"的数据项？').then(function() {
        return delProductBrand(id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      if (this.columns.list != null) {
        this.queryParams.row = this.columns.list;
      }
      this.download('sqsm/product/brand/export', {
        ...this.queryParams
      }, `brand${new Date().getTime()}.xlsx`)
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "用户导入";
      this.upload.open = true;
    },
    /** 下载模板操作 */
    // importTemplate() {
    //   this.download('system/user/importTemplate', {
    //   }, `user_template_${new Date().getTime()}.xlsx`)
    // },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
      this.getList();
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
    },
    /* 初始化方法 */
    initMethod() {
      /** 获取各个权限方法 */
      const deptId = this.$store.state.user.deptId;
      const columns = this.$store.state.user.columns;
      this.columns = {
        list: columns[deptId]['sqsm:product:brand:list']?columns[deptId]['sqsm:product:brand:list']:null,
        query: columns[deptId]['sqsm:product:brand:query']?columns[deptId]['sqsm:product:brand:query']:null,
        add: columns[deptId]['sqsm:product:brand:add']?columns[deptId]['sqsm:product:brand:add']:null,
        edit: columns[deptId]['sqsm:product:brand:edit']?columns[deptId]['sqsm:product:brand:edit']:null,
        remove: columns[deptId]['sqsm:product:brand:remove']?columns[deptId]['sqsm:product:brand:remove']:null
      }
      
      // 初始化筛选栏目中的内容
      this.queryParams.status = '0';
      this.columns.list.split(',').forEach(element => {
        if (brand[element]) {
          this.selectColumns.push({ key: element , label: brand[element] , visible:true })
        }
      });
    },
    // 上传logo成功后的返回
    handleLogoSuccess(res, file) {
      this.form.logo = res.imgUrl;
    },
    // 上传logo前的判断
    beforeLogoUpload(file) {
      let isType = false;
      if (file.type === 'image/jpeg') {
        isType = true;
      } else if (file.type === 'image/png') {
        isType = true;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isType) {
        this.$message.error('请上传 JPG 格式 或 PNG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB!');
      }
      return isType && isLt2M;
    },
    // 上传产品图片成功后的返回
    handleImgSuccess(res, file) {
      this.form.img = res.imgUrl;
    },
    // 上传产品图片前的判断
    beforeImgUpload(file) {
      let isType = false;
      if (file.type === 'image/jpeg') {
        isType = true;
      } else if (file.type === 'image/png') {
        isType = true;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      
      if (!isType) {
        this.$message.error('请上传 JPG 格式 或 PNG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB!');
      }
      return isType && isLt2M;
    },
    // 判断图片是否有上传方法
    isUpload(logo) {
      if (logo==null) {
        return true;
      } else {
        return false;
      }
    },
    // 判断当前的loading是新增还是更新
    eidtOrSaveType() {
      if (this.title == '新增品牌') {
        return this.columns.add;
      } else {
        return this.columns.edit;
      }
    },
    /** 判断相应的列显不显示，1、判断权限方法 2、判断用户是否有取消显示指定的列 */
    authOr(row,rows) {
      const list = rows.split(',');
      // 在前端设置的展示字段中查找是否有对应的字段
      const data = this.selectColumns.find(i=>{
        return row == i.key;
      });
      // 这里可能会出现，列表里有但是json字段里还没设定的情况
      const visible = data?data.visible:false;
      return list.includes(row) && visible;
    },
  },
};
</script>

<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 150px;
    height: 150px;
    line-height: 150px;
    text-align: center;
  }
  .avatar {
    width: 150px;
    height: 150px;
    display: block;
  }
</style>