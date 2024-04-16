<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="分类名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入分类名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="商品品类状态" clearable>
          <el-option
            v-for="dict in dict.type.sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
          v-hasPermi="['sqsm:product:category:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-sort"
          size="mini"
          @click="toggleExpandAll"
        >展开/折叠</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="categoryList"
      row-key="id"
      :default-expand-all="isExpandAll"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="name" v-if="authOr('name',this.columns.list)" label="分类名称" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="productSum" v-if="authOr('product_sum',this.columns.list)" label="商品数量" align="center"></el-table-column>
      <el-table-column prop="status" v-if="authOr('status',this.columns.list)" label="是否显示" align="center">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column prop="sort" v-if="authOr('sort',this.columns.list)" label="排序" align="center"></el-table-column>
      <el-table-column prop="code" v-if="authOr('code',this.columns.list)" label="分类编码" align="center"></el-table-column>
      <el-table-column prop="createTime" v-if="authOr('create_time',this.columns.list)" label="创建时间" align="center">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['sqsm:product:category:add']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
            v-hasPermi="['sqsm:product:category:add']"
          >新增</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['sqsm:product:category:remove']"
          >停用</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改菜单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="680px" :before-close="closeDialog" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24" v-if="authOr('code',this.columns.add)">
            <el-form-item label="分类编码" prop="code">
              <el-input v-model="form.code" placeholder="请输入商品分类编码" />
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="authOr('name',this.columns.add)">
            <el-form-item label="分类名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入商品分类名称" />
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="authOr('parents_id',this.columns.add)">
            <el-form-item label="上级分类" prop="parentsId">
              <treeselect
                v-model="form.parentsId"
                :options="categoryOptions"
                :normalizer="normalizer"
                :show-count="true"
                placeholder="选择上级分类"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="authOr('sort',this.columns.add)">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="this.title =='编辑商品分类' && authOr('sort',this.columns.add)">
            <el-form-item label="事业部费用" prop="cost">
              <el-input v-model="form.cost" controls-position="right" type="number" step="0.01" :min="0" />
              <el-tooltip content="收取事业部的费用配置，此分类下每 kg 的费用" placement="bottom">
                <i class="el-icon-question">收取事业部的费用配置……</i>
              </el-tooltip>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="authOr('status',this.columns.add)">
            <el-form-item prop="status">
              <span slot="label">
                是否显示
              </span>
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
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listProductCategory,getProductCategory,addProductCategory,updateProductCategory,
  delProductCategory } from "@/api/rephone/sqsm/product/category";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "category",
  dicts: ['sys_show_hide', 'sys_normal_disable'],
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 品类分类表格树数据
      categoryList: [],
      // 菜单树选项
      categoryOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否展开，默认全部折叠
      isExpandAll: false,
      // 重新渲染表格状态
      refreshTable: true,
      // 查询参数
      queryParams: {
        name: undefined,
        visible: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "分类名称不能为空", trigger: "blur" }
        ],
        parentsId: [
          { required: true, message: "上级分类不能为空", trigger: "blur" }
        ],
        sort: [
          { required: true, message: "分类顺序不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "分类状态不能为空", trigger: "blur" }
        ]
      },
      // 权限判断
      columns: {
      }
    };
  },
  created() {
    this.getColumn();
    this.getList();
  },
  methods: {
    /** 查询品类列表 */
    getList() {
      this.loading = true;
      if (this.columns.list != null) {
        this.queryParams.row = this.columns.list;
      }
      listProductCategory(this.queryParams).then(response => {
        this.categoryList = this.handleTree(response.data, "id","parentsId");
        this.loading = false;
      });
    },
    /** 转换菜单数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id,
        label: node.name,
        children: node.children
      };
    },
    /** 查询菜单下拉树结构 */
    getTreeselect() {
      const query = {};
      if (this.columns.list != null) {
        query.row = this.columns.list;
      }
      listProductCategory(query).then(response => {
        this.categoryOptions = [];
        const category = { id: 0, name: '主类目', children: [] };
        category.children = this.handleTree(response.data, "id","parentsId");
        this.categoryOptions.push(category);
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
        menuId: undefined,
        parentId: 0,
        menuName: undefined,
        icon: undefined,
        menuType: "M",
        orderNum: undefined,
        isFrame: "1",
        isCache: "0",
        visible: "0",
        status: "0"
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset();
      this.getTreeselect();
      if (row != null && row.id) {
        this.form.parentsId = row.id;
      } else {
        this.form.parentsId = 0;
      }
      this.open = true;
      this.title = "添加分类";
    },
    /** 展开/折叠操作 */
    toggleExpandAll() {
      this.refreshTable = false;
      this.isExpandAll = !this.isExpandAll;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.getTreeselect();
      getProductCategory(row.id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "编辑商品分类";
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
            updateProductCategory(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addProductCategory(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除名称为"' + row.name + '"的数据项？').then(function() {
        return delProductCategory(row.id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 获取各个权限方法 */
    getColumn() {
      this.columns = {
        list: this.$store.state.user.columns['sqsm:product:category:list']?this.$store.state.user.columns['sqsm:product:category:list']:null,
        query: this.$store.state.user.columns['sqsm:product:category:query']?this.$store.state.user.columns['sqsm:product:category:query']:null,
        add: this.$store.state.user.columns['sqsm:product:category:add']?this.$store.state.user.columns['sqsm:product:category:add']:null,
        edit: this.$store.state.user.columns['sqsm:product:category:edit']?this.$store.state.user.columns['sqsm:product:category:edit']:null,
        remove: this.$store.state.user.columns['sqsm:product:category:remove']?this.$store.state.user.columns['sqsm:product:category:remove']:null
      }
      // if (this.columns.remove == null) {
      //   console.log(111);
      // } else {
      //   console.log(222);
      // }
    },
    /** 判断权限方法 */
    authOr(row,rows) {
      const list = rows.split(',');
      return list.includes(row);
    },
    /** 增强用户体验做的 loding */
    closeDialog() {
      this.$confirm('您还未保存，确定要关闭吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.open = false;
          this.reset();
        }).catch(() => {
        });
    }
  }
};
</script>
