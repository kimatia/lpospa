<template>
  <div ref="content">
  <v-dialog v-model="payeeDialogue" persistent max-width="300px">
        <v-card class="px-4">
              <v-form ref="formstatement" v-model="valid" lazy-validation @submit.prevent>
              <v-card-text>
                <v-container>
                    <v-card-title>
                    <span class="headline">Payee details</span>
                    <v-divider class="mx-4" inset vertical></v-divider>
                  <v-spacer></v-spacer>
                  </v-card-title> 
                  <v-row style="margin : 2px">
                  <v-col cols="12" sm="6" md="12">
                    <v-text-field v-model="payee" label="Payee" :rules="inputRules"></v-text-field>
                  </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                 <v-btn class="mx-2" :disabled="!valid" small fab dark color="indigo" @click="submit">
                  <v-icon dark>mdi-check-underline-circle</v-icon>
                </v-btn>
                <v-btn class="mx-2" small fab dark color="red" @click="payeeDialogue = false">
                  <v-icon dark>mdi-close-outline</v-icon>
                </v-btn>
              </v-card-actions>               
              </v-form>
          </v-card>
      </v-dialog>
      <v-dialog v-model="dialogEdit" persistent max-width="300px">
        <v-card class="px-4">
              <v-card-title>
                  <span class="headline">Edit payee details</span>
              </v-card-title>
              <v-form ref="formUpdate" v-model="valid" lazy-validation @submit.prevent>
              <v-card-text>
                <v-container>
                  <v-row style="margin : 2px">
                  <v-col cols="12" sm="6" md="12">
                    <v-text-field v-model="editedItem.payee" label="payee" :rules="inputRules"></v-text-field>
                  </v-col>
                </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                 <v-btn class="mx-2" :disabled="!valid" small fab dark color="indigo" @click="payeeUpdate(editedItem.id)">
                  <v-icon dark>mdi-check-underline-circle</v-icon>
                </v-btn>
                <v-btn class="mx-2" small fab dark color="red" @click="dialogEdit = false">
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
        <v-btn class="mx-2" small fab dark color="indigo" @click="payeeDialogue = true">
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
          </td>
          <td>
            <span>{{ item.created_by }}</span>
          </td>
          <td>
            <span>{{ formatDate(item.created) }}</span>
          </td>
          <td>
            <v-btn class="mx-2" small dark color="indigo" @click="editPayee(item)">
             <v-icon>mdi-pencil</v-icon>
          </v-btn>
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
      payeeDialogue: false,
      dialogEdit: false,
      search: '',
      desserts: [],
      payee:'',
      editedItem: {
        payee:'',
      },
      inputRules: [
        v => !!v || 'This field is required',
      ],
    }),
    computed: {
      headers () {
        return [
          { text: '#', value: '#' },
          { text: 'payee', value: 'payee' },
          { text: 'created_by', value: 'created_by' },
          { text: 'Created at', value: 'created' },
          { text: 'Action', value: 'status' },
        ]
      },
      ...mapState('auth', ['loggedIn', 'user'])
    },
    mounted() {
      this.getPayee()
    },
    methods: {
      editPayee (event, id) {
        this.editedIndex = this.desserts.indexOf(event)
        this.editedItem = Object.assign({}, event)
        this.dialogEdit = true
        },
      formatDate(value) {
      return moment(value).format("DD MMM, YYYY")
      },
        async getPayee() {
          try {
            await this.$axios.get(
              '/api/v1/payee'
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
                  this.$axios.post('/api/v1/payee',{
                       payee : this.payee,
                      })
                  .then(res =>{
                       this.payeeDialogue = false
                        this.snackText = 'Success payee details saved'
                        this.color = 'success'
                        this.snackbar = true
                    })
                  .catch(err => {
                      this.snackText = 'Error while posting data'
                        this.color = 'error'
                        this.snackbar = true
                  })
                this.getPayee()

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
    async payeeUpdate(event, id) {
          if(this.$refs.formUpdate.validate()) {
            try {
                this.$axios.put(`/api/v1/payee/${event}`,{
                       payee : this.editedItem.payee,
                })
                .then(res =>{
                    this.dialogEdit = false
                    this.snackText = 'Success payee details updated'
                    this.color = 'success'
                    this.snackbar = true
                  })
                .catch(err => {
                    if (err.response.data.statusCode == 401) {
                    this.$auth.reset();
                    this.$router.push('/login')
                    }
                })
                this.getPayee()
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