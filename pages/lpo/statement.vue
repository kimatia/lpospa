<template>
  <div ref="content">
  <v-dialog v-model="cummulativeDialogue" persistent max-width="300px">
        <v-card class="px-4">
              <v-form ref="formstatement" v-model="valid" lazy-validation @submit.prevent>
              <v-card-text>
                <v-container>
                    <v-card-title>
                    <span class="headline">Bank statement</span>
                    <v-divider class="mx-4" inset vertical></v-divider>
                  <v-spacer></v-spacer>
                  </v-card-title> 
                  <v-row style="margin : 2px">
                  <v-col cols="12" sm="6" md="12">
                    <v-file-input
                        show-size
                        label="File input"
                        v-model="statement"
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
        'items-per-page-options': [5000,6000,7000,8000,9000,10000]
      }"
      :items-per-page="5000"
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
            <span>{{ item.serial_number }}</span>
          </td>
          <td>
            <span>{{ item.transaction_date }}</span>
          </td>
          <td>
            <span>{{ item.refference_no }}</span>
          </td>
          <td>
            <span>{{ item.payee }}</span>
          </td>
          <td>
            <span>{{ item.transaction_details }}</span>
          </td>
          <td>
            <span>{{ item.dr_amount }}</span>
          </td>
          <td>
            <span>{{ item.cr_amount }}</span>
          </td>
          <td>
            <span>{{ item.bank_balance }}</span>
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
  export default {
    middleware: ['auth'],
      variant: 'default',
    data: () => ({
      valid: true,
      mode: '',
      color: '',
      snackbar: false,
      snackText: '',
      timeout: 6000,
      cummulativeDialogue: false,
      dialogEdit: false,
      search: '',
      desserts: [],
      statement:'',
      serial_number:'',
      transaction_date: '',
      refference_no : '',
      payee:'',
      transaction_details: '',
      dr_amount : '',
      cr_amount : '',
      bank_balance:'',
      editedItem: {
        statement_id:'',
        serial_number:'',
        transaction_date: '',
        refference_no : '',
        payee:'',
        transaction_details: '',
        dr_amount : '',
        cr_amount : '',
        bank_balance:'',
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
          { text: 'serial number', value: 'serial_number' },
          { text: 'transaction_date', value: 'transaction_date' },
          { text: 'Refference No.', value: 'refference_no' },
          { text: 'Payee.', value: 'payee' },
          { text: 'Transaction details', value: 'transaction_details' },
          { text: 'Debit amount', value: 'dr_amount' },
          { text: 'Credit amount', value: 'cr_amount' },
          { text: 'bank_balance', value: 'bank_balance'},
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
      editstatement (event, id) {
        this.editedIndex = this.desserts.indexOf(event)
        this.editedItem = Object.assign({}, event)
        this.dialogEdit = true
        },
      formatDate(value) {
      return moment(value).format("DD MMM, YYYY")
      },
        async getStatement() {
          try {
            await this.$axios.get(
              '/api/v1/statement'
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

        },
        async submit(event) {
        if(this.$refs.formstatement.validate()) {
              try {
                  const formData = new FormData()
                   formData.append('statement', this.statement)
                  this.$axios.post('/api/v1/statement', formData,{
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                      })
                  .then(res =>{
                      this.cummulativeDialogue = false
                        this.snackText = 'Success bank record saved'
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
      title: 'Statement',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Statement',
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