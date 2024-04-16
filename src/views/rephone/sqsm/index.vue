<template>
  <div class="app-container">
    <p>这是首页</p>
  </div>
</template>

<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "SqsmIndex",
  dicts: ['sys_normal_disable'],
  components: { Treeselect },
  data() {
    return {
      
    };
  },
  created() {
  },
  methods: {
    
  }
};
</script>
