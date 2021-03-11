<template>
  <div ref="content">
     <v-dialog v-model="dialogDownload" persistent max-width="500px">
      <v-card>
         <v-card-title>
          <span class="headline">Search payee</span>
        </v-card-title>  
         <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
              <v-card-text>
                <v-container>
                  <v-select
                      :items="contractor"
                      v-model="payee"
                      :rules="inputRules"
                      item-text="payee"
                      item-value="id"
                      label="Select payee"
                    >
                    </v-select>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                 <v-btn class="mx-2" :disabled="!valid" small fab dark color="indigo" @click="excelDownload">
                  <v-icon dark>mdi-filter</v-icon>
                </v-btn>
               <v-btn class="mx-2" small fab dark color="red" @click="dialogDownload = false">
                  <v-icon dark>mdi-close-outline</v-icon>
                </v-btn>
              </v-card-actions>               
              </v-form>
      </v-card>
    </v-dialog>
    <v-dialog v-model="cummulativeDialogue" persistent max-width="300px">
        <v-card class="px-4">
              <v-form ref="formBills" v-model="valid" lazy-validation @submit.prevent>
              <v-card-text>
                <v-container>
                    <v-card-title>
                    <span class="headline">Select file</span>
                    <v-divider class="mx-4" inset vertical></v-divider>
                  <v-spacer></v-spacer>
                  </v-card-title> 
                  <v-row style="margin : 2px">
                  <v-col cols="12" sm="6" md="12">
                    <v-file-input
                        show-size
                        label="File input"
                        v-model="bills"
                      ></v-file-input>
                  </v-col>
                </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                 <v-btn class="mx-2" :disabled="!valid" small fab dark color="indigo" @click="submit">
                  <v-icon dark>mdi-check-underline-circle</v-icon>
                </v-btn>
                <v-btn class="mx-2" small fab dark color="red" @click="cummulativeDialogue = false">
                  <v-icon dark>mdi-close-outline</v-icon>
                </v-btn>
              </v-card-actions>               
              </v-form>
          </v-card>
      </v-dialog>
    <v-data-table
      :headers="headers"
      :items="desserts"
      item-key="name"
      :footer-props="{
        'items-per-page-options': [1000, 2000,3000,4000,5000,10000]
      }"
      :items-per-page="1000"
      class="elevation-1"
      multi-sort
      :search="search"
      ref="cont"
    >
      <template v-slot:top>
      <v-toolbar flat color="white">
        <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-btn class="mx-2" small fab dark color="indigo" @click="dialogDownload = true">
          <v-icon dark>mdi-arrow-down-bold-box</v-icon>
        </v-btn>
        <v-btn class="mx-2" small fab dark color="indigo" @click="cummulativeDialogue = true">
          <v-icon dark>mdi-plus</v-icon>
        </v-btn>
      </v-toolbar>
    </template>
      <template v-slot:body="props".append>
       <tbody>
        <tr v-for="item, index in props.items" row wrap :class="`pa-3 project ${item.status}`">
          <td>
            <span>{{ index + 1 }}</span>
          </td>
          <td>
            <span>{{ item.payee }}</span>
          </td>
          <td>
            <span>{{ item.category }}</span>
          </td>
          <td>
            <span>{{ item.work_details }}</span>
          </td>
          <td>
            <span>{{ item.lpo_number }}</span>
          </td>
          <td>
            <span>{{ item.plo_sum }}</span>
          </td>
          <td>
            <span>{{ item.invoice_number }}</span>
          </td>
          <td>
            <span>{{ item.date_recorded }}</span>
          </td>
          <td>
            <span>{{ item.start_date }}</span>
          </td>
          <td>
            <span>{{ item.end_date }}</span>
          </td>
          <td>
            <span>{{ item.completion_status }}</span>
          </td>
          <td>
            <span>{{ item.cumulative_amount_invoiced }}</span>
          </td>
          <td>
            <span>{{ item.amount_paid }}</span>
          </td>
          <td>
            <span>{{ item.outstanding_amount }}</span>
          </td>
          <td>
            <span>{{ item.verified }}</span>
          </td>
          <td>
            <span>{{ item.comments }}</span>
          </td>
          <td>
            <span>{{ item.support_documents }}</span>
          </td>
          <td>
            <span>{{ item.created_by }}</span>
          </td>
          <td>
            <span>{{ formatDate(item.created) }}</span>
          </td>
        </tr>
       </tbody>
      </template>
    </v-data-table>
    <v-snackbar
      v-model="snackbar"
      :color="color"
      :right="'right'"
      :timeout="timeout"
      :top="'top'"
    >
      {{ snackText }}

      <template v-slot:action="{ attrs }">
        <v-btn
          dark
          text
          v-bind="attrs"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
  import moment from 'moment'
  import { format, parseISO } from 'date-fns'
  import axios from 'axios'
  import { mapState } from 'vuex'
  import VueCropper from 'vue-cropperjs'
  import 'cropperjs/dist/cropper.css'
  export default {
    components: { VueCropper },
    props: ['image_name'],
    name: 'Cheques',
    middleware: ['auth'],
      variant: 'default',
    data: () => ({
      valid: true,
      mode: '',
      color: '',
      snackbar: false,
      dialogDownload: false,
      snackText: '',
      timeout: 6000,
      cummulativeDialogue: false,
      dialogEdit: false,
      menu: false,
      menu1: false,
      menu2: false,
      search: '',
      desserts: [],
      contractor: [],
      cat: ['Recurrent', 'Development'],
      complete: ['Complete', 'Unknown'],
      verify: ['Original', 'Complete'],
      docs: ['Yes', 'No'],
      bills: '',
      payee:'',
      category: '',
      work_details : '',
      lpo_number : '',
      plo_sum:'',
      invoice_number: '',
      date_recorded : '',
      start_date : '',
      end_date:'',
      completion_status: '',
      cumulative_amount_invoiced : '',
      amount_paid : '',
      outstanding_amount:'',
      verified: '',
      comments : '',
      support_documents : '',
      editedItem: {
        bills_id:'',
        payee:'',
        category: '',
        work_details : '',
        lpo_number : '',
        plo_sum:'',
        invoice_number: '',
        date_recorded : '',
        start_date : '',
        end_date:'',
        completion_status: '',
        cumulative_amount_invoiced : '',
        amount_paid : '',
        outstanding_amount:'',
        verified: '',
        comments : '',
        support_documents : '',
      },
      inputRules: [
        v => !!v || 'This field is required',
      ],
      amountRules: [
        v => !!v || 'This field is required',
        v => /^\d*$/.test(v) || "Amount must be an integer"
      ],
    }),
    computed: {
      headers () {
        return [
          { text: '#', value: '#' },
          { text: 'Payee', value: 'payee' },
          { text: 'Category', value: 'category' },
          { text: 'Details', value: 'work_details' },
          { text: 'LPO No.', value: 'lpo_number' },
          { text: 'LPO sum', value: 'plo_sum' },
          { text: 'Invoice No.', value: 'invoice_number' },
          { text: 'Date', value: 'date_recorded' },
          { text: 'Start date', value: 'start_date' },
          { text: 'End date', value: 'end_date' },
          { text: 'Completion', value: 'completion_status' },
          { text: 'Invoiced Amt', value: 'cumulative_amount_invoiced' },
          { text: 'Paid Amt', value: 'amount_paid' },
          { text: 'Outstanding Amt', value: 'outstanding_amount' },
          { text: 'Verified', value: 'verified' },
          { text: 'Comments', value: 'comments' },
          { text: 'Documents', value: 'support_documents' },
          { text: 'created_by', value: 'created_by' },
          { text: 'Created at', value: 'created' },
        ]
      },
      ...mapState('auth', ['loggedIn', 'user'])
    },
    mounted() {
      this.getStatement()
    },
    methods: {
      editBills (event, id) {
        this.editedIndex = this.desserts.indexOf(event)
        this.editedItem = Object.assign({}, event)
        this.dialogEdit = true
        },
      formatDate(value) {
      return moment(value).format("DD MMM, YYYY")
      },
      excelDownload() {
          this.$axios({
            url: `api/v1/bills/export/${this.payee}`,
            method: 'GET',
            responseType: 'blob',
          })
          .then((response) => {
            if (!window.navigator.msSaveOrOpenBlob){
              const url = window.URL.createObjectURL(new Blob([response.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'bills.xlsx');
              document.body.appendChild(link);
              link.click();
            }else{
              const url = window.navigator.msSaveOrOpenBlob(new Blob([response.data]),"bills.xlsx");
            }
          })
          .catch(err => {
            this.snackText = err
            this.color = 'error'
            this.snackbar = true
          })
          this.$axios({
            url: `api/v1/bills/download/${this.payee}`,
            method: 'GET',
            responseType: 'blob',
          })
          .then((response) => {
            if (!window.navigator.msSaveOrOpenBlob){
              const url = window.URL.createObjectURL(new Blob([response.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'statement.xlsx');
              document.body.appendChild(link);
              link.click();
            }else{
              const url = window.navigator.msSaveOrOpenBlob(new Blob([response.data]),"statement.xlsx");
            }
          })
          .catch(err => {
            this.snackText = err
            this.color = 'error'
            this.snackbar = true
          })
        },
        async getStatement() {
          try {
            await this.$axios.get(
              '/api/v1/bills'
            )
            .then(res =>{
                this.desserts = res.data.data.dataModels
               })
            .catch(err => {
              if (err.response.data.statusCode == 401) {
              this.$auth.reset();
              this.$router.push('/login')
              }
            })
          } catch (err) {
              this.snackText = err
              this.color = 'error'
              this.snackbar = true
          }
          try {
            await this.$axios.get(
              '/api/v1/payee'
            )
            .then(res =>{
                this.contractor = res.data.data.dataModels
               })
            .catch(err => {
              if (err.response.data.statusCode == 401) {
              this.$auth.reset();
              this.$router.push('/login')
              }
            })
          } catch (err) {
              this.snackText = err
              this.color = 'error'
              this.snackbar = true
          }

        },
        async submit(event) {
        if(this.$refs.formBills.validate()) {
              try {
                   const formData = new FormData()
                   formData.append('bills', this.bills)
                  this.$axios.post('/api/v1/bills', formData,{
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                      })
                  .then(res =>{
                      this.cummulativeDialogue = false
                        this.snackText = 'Success bill record saved'
                        this.color = 'success'
                        this.snackbar = true
                    })
                  .catch(err => {
                      this.snackText = 'Error while posting data'
                        this.color = 'error'
                        this.snackbar = true
                  })
                this.getStatement()

            } catch (err) {
             if (err.response) {
                      this.snackText = 'response error ' + err.response
                      this.color = 'error'
                      this.snackbar = true
                  } else if (err.request) {
                      this.snackText = 'request error ' + err.request
                      this.color = 'error'
                      this.snackbar = true
                  } else {
                      this.snackText = 'error ' + err
                      this.color = 'error'
                      this.snackbar = true
                  }
            }
        }
    },
    },
  head() {
    return {
      title: 'Bills',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Bills',
        },
      ],
    }
  },
  }
  
</script>
<style>
.user {
  width: 90%;
  height: 240px;
  border: 3px solid #2e7d32;
  position: relative;
  margin-left: 5%;
}
.profile-img {
  height: 100%;
  width: 100%;
}
.icon {
  position: absolute;
  top: 10px;
  right: 0;
  background: #e2e2e2;
  border-radius: 100%;
  width: 30px;
  height: 30px;
  line-height: 30px;
  vertical-align: middle;
  text-align: center;
  color: #0000ff;
  font-size: 14px;
  cursor: pointer;
}

</style>