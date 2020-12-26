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
        新增联系人
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-upload" @click="openList">
        批量新增联系人
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
      <el-table-column label="微信号" v-if="canIdisplay('wechat')" prop="wechat" width="100" align="center">
        <template slot-scope="{row}">
          <span>{{ row.wechat }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系人姓名" v-if="canIdisplay('name')" prop="wechat" width="100" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="生日" v-if="canIdisplay('birthday')"  width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.birthday | parseTime('{y}-{m}-{d}') }}</span>
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
      <el-table-column label="电子邮件" prop="email" width="200" v-if="canIdisplay('email')"  align="center">
        <template slot-scope="{row}">
          <span>{{ row.email }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号码" width="130" v-if="canIdisplay('phone')" align="center">
        <template slot-scope="{row}">
          <span>{{ row.phone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="来源" width="100" v-if="canIdisplay('source')" align="center">
        <template slot-scope="{row}">
          <span>{{ row.source }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系人地址" width="150" v-if="canIdisplay('location')" align="center">
        <template slot-scope="{row}">
          <span>{{ row.location }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button  size="mini" type="danger" @click="handleDelete(row,$index)">
           删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" :page-sizes="[3,6,8,10,12]" @pagination="getList" />
     <el-dialog title="" :visible.sync="listCreateVisible">
       <p>请按照数据模板的格式准备要导入的数据。 点击下载：</p> 	<a href="http://file.huajun.com/contact_list.csv">《联系人模板CSV版》</a>
     </el-dialog>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="微信号" prop="wechat" label-width="100px">
          <el-input v-model="temp.wechat" />
        </el-form-item>
        <el-form-item label="电子邮件" prop="email" label-width="100px">
          <el-input v-model="temp.email" />
        </el-form-item>
        <el-form-item label="联系人姓名" prop="name" label-width="100px">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="生日" prop="birthday" label-width="100px">
          <el-date-picker v-model="temp.birthday" type="date" placeholder="请选择一个日期" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone" label-width="100px">
          <el-input v-model="temp.phone" />
        </el-form-item>
        <el-form-item label="地址" prop="location" label-width="100px">
          <el-input v-model="temp.location" />
        </el-form-item>
        <el-form-item label="来源" prop="source" label-width="100px">
          <el-input v-model="temp.source" />
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
import { fetchList, fetchContacter, updateContacter, deleteContacter, saveContacter } from '@/api/contact'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

const fieldOptions = { '姓名': 'name', '电话': 'phone', '地址': 'location', '来源': 'source', '创建者': 'creator', '更新者': 'updator', '微信号': 'wechat' }
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
      fieldOptions,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      selectedFields:['name','wechat','guid','location','email','phone','birthday','importtime'],
      listQuery: {
        page: 1,
        limit: 3,
        field: '',
        text: '',
        sort: '+id',
        groupId:0
      },
      listCreateVisible:false,
      filterFields:['name','wechat','guid','location','email','phone','birthday','importtime'],
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: '按照ID升序展示', key: '+id' }, { label: '按照ID降序展示', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        wechat:undefined,
        email:undefined,
        phone:undefined,
        location:undefined,
        birthday:undefined,
        creator:undefined,
        updator:undefined,
        name:undefined,
        source:undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑联系人',
        create: '创建联系人'
      },
      dialogVisible: false,
      dialogPvVisible:false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'blur' }],
        email: [{ required: true, message: 'email字段必填', trigger: 'blur' }],
        wechat: [{ required: true, message: 'wechat字段必填', trigger: 'blur' }],
        phone: [{ required: true, message: 'phone字段必填', trigger: 'blur' }],
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
       fields.push({
         key:this.fieldOptions[l],
         label:l,
         disabled:l==='姓名'?true:false
       });
     })
      fields.push({
        key:'birthday',
        label:'生日',
        disabled:false
      })
      fields.push({
        key:'updatetime',
        label:'更新时间',
        disabled:false
      })
      fields.push({
        key:'importtime',
        label:'导入时间',
        disabled:false
      })
      fields.push({
        key:'guid',
        label:'联系人ID',
        disabled:true
      })
      fields.push({
        key:'email',
        label:'电子邮件',
        disabled:true
      })
      return fields;
    }
  },
  created() {
    console.log(this.$route.params.id)
    if(this.$route.params&&':id'!=this.$route.params.id){
      this.listQuery.groupId=this.$route.params.id;
    }
    this.getList()
  },
  watch:{
  },
  methods: {
    openList(){
      this.listCreateVisible=true;
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
          wechat:undefined,
          email:undefined,
          phone:undefined,
          location:undefined,
          birthday:undefined,
          creator:undefined,
          updator:undefined,
          creator:undefined,
          name:undefined
      }
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
          temp.birthday = +new Date(temp.birthday)
          saveContacter(temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '成功添加联系人为:'+temp.name+'的记录',
              type: 'success',
              duration: 2000
            })
            this.getList()
          }).catch(()=>{
            this.$notify({
              title: '错误',
              message: '无法添加联系人:'+temp.name,
              type: 'error',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.birthday = new Date(Number(this.temp.birthday))
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.birthday = +new Date(tempData.birthday) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateContacter(tempData).then(() => {
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
              message: '无法更新联系人:'+this.temp.name+'请联系管理员！',
              type: 'error',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      deleteContacter(row.guid).then(()=>{
        this.$notify({
          title: '成功',
          message: '成功删除联系人:'+row.name,
          type: 'success',
          duration: 2000
        })
        this.getList();
      }).catch(()=>{
        this.$notify({
          title: '错误',
          message: '无法删除联系人:'+row.name+'请联系管理员！',
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
