<template>
  <div class="app-container">
    <div class="filter-container">
      <el-dialog
        title="请选择需要显示的字段"
        :visible.sync="dialogVisible"
        width="50%"
        :before-close="handleClose">
        <el-transfer v-model="selectedFields" :data="allFields"       :titles="['未选择字段', '已选择显示字段']"
                     :button-texts="['到左边', '到右边']" ></el-transfer>
        <span slot="footer" class="dialog-footer">
       <el-button @click="dialogVisible = false">取 消</el-button>
       <el-button type="primary" @click="confirm">确 定</el-button>
       </span>
      </el-dialog>
      <el-select v-model="listQuery.field" placeholder="点击选择要搜索的字段" clearable style="width: 200px" class="filter-item">
        <el-option v-for="(v,k,i) in fieldOptions" :key="i" :label="k" :value="v" />
      </el-select>
      <el-input v-model="listQuery.text" :placeholder="''===listQuery.field?'请先选择字段再输入值':'请输入'+lookUp[listQuery.field]+'的值'" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.sort" style="width: 200px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button v-waves class="filter-item" type="success" icon="el-icon-news" @click="dialogVisible=true">
        过滤显示字段
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增联系分组
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')" v-if="canIdisplay('guid')">
        <template slot-scope="{row}">
          <span>{{ row.guid }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分组名称" v-if="canIdisplay('name')" prop="wechat" width="100" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建(导入)时间" v-if="canIdisplay('importtime')" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.importtime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建人" prop="wechat" v-if="canIdisplay('creator')" width="100" align="center">
        <template slot-scope="{row}">
          <span>{{ row.creator }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="150px" v-if="canIdisplay('updatetime')" align="center">
        <template slot-scope="{row}">
          <span v-if="null===row.updatetime">无更新</span>
          <span>{{ row.updatetime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新者" prop="updator" v-if="canIdisplay('updator')" width="100" align="center">
        <template slot-scope="{row}">
          <span>{{ null===row.updator?'无更新':row.updator }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分组人数" prop="email" width="200" v-if="canIdisplay('total')"  align="center">
        <template slot-scope="{row}">
          <span>{{ row.total +'人'}}</span>
        </template>
      </el-table-column>
      <el-table-column label="分组条件" width="130" v-if="canIdisplay('con')" align="center">
        <template slot-scope="{row}">
          <span>{{ row.con }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="300" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
<!--          <router-link :to="'/contact/table/'+row.guid">-->
          <el-button type="success" size="mini" @click="forwardRouting(row)">
            分组联系人
          </el-button>
<!--          </router-link>-->
          <el-button  size="mini" type="danger" @click="handleDelete(row,$index)">
           删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" :page-sizes="[3,6,8,10,12]" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="分组名" prop="name" label-width="100px">
          <el-input v-model="temp.name" />
        </el-form-item>
        <div v-if="dialogStatus==='create'">
          <el-form-item label="创建者" prop="creator" label-width="100px">
            <el-input v-model="temp.creator" />
          </el-form-item>
        </div>
        <div v-else>
          <el-form-item label="更新者" prop="updator" label-width="100px">
            <el-input v-model="temp.updator" />
          </el-form-item>
        </div>
        <el-form-item label="筛选条件:" prop="source" label-width="100px">
          <div style="display: flex;flex-direction: row;width: 500px" :style="{'margin-top':1!==i?'30px':'0px'}" v-for="i in conditionNumber" :key="i">
            <el-select v-model="fucker[i-1].lvalue" style="width: 200px" class="filter-item" @change="fucker[i-1].operator=operatorOptions(fucker[i-1].lvalue)[0]">
              <el-option v-for="(v,k) in conditionOptions" :key="k" :label="v" :value="k" />
            </el-select>
            <el-select v-model="fucker[i-1].operator" style="width: 200px" class="filter-item">
              <el-option v-for="item in operatorOptions(fucker[i-1].lvalue)" :key="item" :label="item" :value="item" />
            </el-select>
          <el-input v-model="fucker[i-1].rvalue" v-if="fucker[i-1].lvalue==='source'"/>
            <el-date-picker v-model="fucker[i-1].rvalue" v-else type="date" placeholder="选择日期" />
            <el-button style="margin-left: 30px" type="success" v-if="i===conditionNumber&&3!==i" icon="el-icon-circle-plus" circle @click="addCondition"></el-button>
            <el-button style="margin-left: 30px" type="danger" v-else icon="el-icon-remove" circle @click="removeCondition(i)"></el-button>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认保存
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">确认保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, deleteGroup,updateGroup,saveGroup } from '@/api/group'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]
const conditionOptions=
  {
    "source":"来源",
    "birthday":"生日"
  }
const fieldOptions = { '分组名称': 'name','分组条件': 'con', '创建者': 'creator', '更新者': 'updator' }
// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      conditionNumber:1,
      fucker:[{
        lvalue:'source',
        operator:'包含',
        rvalue:''
      }],
      pendingVisitRoute:{
        fullPath:'',
        meta:{
          affix:false,
          icon:'edit',
          title:''
        },
        name:'',
        path:'',
        title:''
      },
      conditionOptions,
      fieldOptions,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      selectedFields:['name','guid','updatetime','importtime','total'],
      listQuery: {
        page: 1,
        limit: 3,
        field: '',
        text: '',
        sort: '+id'
      },
      filterFields:['name','guid','updatetime','importtime','total'],
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: '按照ID升序展示', key: '+id' }, { label: '按照ID降序展示', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        creator:undefined,
        updator:undefined,
        name:undefined,
        con:undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑联系人分组',
        create: '创建联系人分组'
      },
      dialogVisible: false,
      dialogPvVisible:false,
      pvData: [],
      rules: {
        name: [{ required: true, message: '分组名不能为空', trigger: 'blur' }],
        creator: [{ required: true, message: '创建者必须specify', trigger: 'blur' }],
        updator: [{ required: true, message: '更新者必须specify', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  computed: {
    lookUp() {
      const o = {}
      Object.keys(this.fieldOptions).forEach(key => {
        const k = this.fieldOptions[key]
        o[k] = key
      })
      return o
    },
    allFields() {
      const fields=[];
     Object.keys(this.fieldOptions).forEach(l=>{
       if('分组条件'!==l)
       fields.push({
         key:this.fieldOptions[l],
         label:l,
         disabled:l!=='分组名称'?false:true
       });
     })
      fields.push({
        key:'guid',
        label:'分组ID',
        disabled:true
      })
      fields.push({
        key:'importtime',
        label:'导入时间',
        disabled:false
      })
      fields.push({
        key:'updatetime',
        label:'更新时间',
        disabled:false
      })
      fields.push({
        key:'total',
        label:'分组人数',
        disabled:true
      })
      return fields;
    }
  },
  created() {
    this.getList()
  },
  watch:{
  },
  methods: {
    removeCondition(index){
      const fucker=JSON.parse(JSON.stringify(this.fucker));
      fucker.splice(index-1,1);
      this.conditionNumber--;
      this.fucker=fucker;
    },
    addCondition(){
      this.fucker.push(
      {
        lvalue:'source',
          operator:'包含',
        rvalue:''
      })
      this.conditionNumber++;
    },
    operatorOptions(key){
      if(key==='source'){
        return ["包含"];
      }else{
        return ['大于','小于']
      }
    },
    forwardRouting(row){
      let obj=Object.assign(this.pendingVisitRoute,{
        fullPath:'/contact/table/'+row.guid,
        name:'联系人分组:'+row.name,
        path:'/contact/table/'+row.guid,
        title:'联系人分组:'+row.name
      });
      obj['meta'].title='联系人分组:'+row.name
      this.$store.dispatch('tagsView/addVisitedView',obj);
      this.$router.push('/contact/table/'+row.guid);
    },
    confirm(){
      this.dialogVisible=false;
      this.filterFields=this.selectedFields;
    },
    handleClose(){
      this.dialogVisible=false;
    },
    canIdisplay(columnName) {
      let flag=false;
      this.filterFields.forEach(field=>{
        if(field===columnName){
          flag=true;
        }
      });
      return flag;
    },
    getList() {
      this.listLoading = true
      const k = this.listQuery['field']
      const v = this.listQuery['text']
      const listQuery = Object.assign({}, this.listQuery)
      listQuery[k] = v
      fetchList(listQuery).then(response => {
        this.list = response.items
        this.total = response.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
          creator:undefined,
          updator:undefined,
          creator:undefined,
          name:undefined,
          con:undefined
      }
      this.conditionNumber=1;
      this.fucker=[{
        lvalue:'source',
        operator:'包含',
        rvalue:''
      }];
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          let temp = Object.assign({},this.temp);
          let fucker=this.fucker.filter(item=>item.rvalue&&''!==item.rvalue);
          fucker=JSON.parse(JSON.stringify(fucker));
         let con= fucker.reduce((last,curr,index)=>{
           if(curr.lvalue==='birthday'){
             curr.rvalue= +new Date(curr.rvalue)
           }
           let str=Object.values(curr).join("")
           let result=last+";"+str;
           if(index===fucker.length-1){
             result=result.substring(1);
           }
           return result;
         },"");
         temp.con=con;
          saveGroup(temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '成功添加联系人分组为:'+temp.name+'的记录',
              type: 'success',
              duration: 2000
            })
            this.getList()
          }).catch(()=>{
            this.$notify({
              title: '错误',
              message: '无法添加联系人分组:'+temp.name,
              type: 'error',
              duration: 2000
            })
          })
        }
      })
    },
    composeFuck(group){
      if(!group.con||''===group.con){
       return [{
          lvalue:'source',
          operator:'包含',
          rvalue:''
        }];
      }
      let fucker=[];
      console.log(group.con)
      group.con.split(";").forEach(key=>{
        console.log(key)
        if(key.includes("birthday")){
          if(key.includes("大于")){
            fucker.push({
              lvalue:'birthday',
              operator:'大于',
              rvalue:new Date(Number(key.substring(key.indexOf("于")+1)))
            })
          }else{
            fucker.push({
              lvalue:'birthday',
              operator:'小于',
              rvalue:new Date(Number(key.substring(key.indexOf("于")+1)))
            })
          }
        }else if(key.includes("source")){
          fucker.push({
            lvalue:'source',
            operator:'包含',
            rvalue:key.substring(key.indexOf("含")+1)
          })
        }
      })
      return fucker;
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      let fucker=this.composeFuck(row);
      this.fucker=fucker;
      this.conditionNumber=fucker.length;
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          let temp = Object.assign({},this.temp);
          let fucker=this.fucker.filter(item=>item.rvalue&&''!==item.rvalue);
          fucker=JSON.parse(JSON.stringify(fucker));
          let con= fucker.reduce((last,curr,index)=>{
            if(curr.lvalue==='birthday'){
              curr.rvalue= +new Date(curr.rvalue)
            }
            let str=Object.values(curr).join("")
            let result=last+";"+str;
            if(index===fucker.length-1){
              result=result.substring(1);
            }
            return result;
          },"");
          temp.con=con;
          updateGroup(temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功！',
              type: 'success',
              duration: 2000
            })
            this.getList();
          }).catch(()=>{
            this.$notify({
              title: '错误',
              message: '无法更新分组信息:'+this.temp.name+'请联系管理员！',
              type: 'error',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      deleteGroup(row.guid).then(()=>{
        this.$notify({
          title: '成功',
          message: '成功删除联系分组:'+row.name,
          type: 'success',
          duration: 2000
        })
        this.getList();
      }).catch(()=>{
        this.$notify({
          title: '错误',
          message: '无法删除联系分组:'+row.name+'请联系管理员！',
          type: 'error',
          duration: 2000
        })
      })
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
