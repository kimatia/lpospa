<template>
  <v-row>
  <v-col cols="12" sm="6" md="3">
  </v-col>
  <v-col cols="12" sm="6" md="6">
    <v-card>
    <v-card-text>
    <v-form ref="changeForm" v-model="valid" lazy-validation>
        <v-row>
          <v-col cols="12">
                <v-text-field v-model="oldPassword" :rules="[rules.required, rules.min]" :type="show1 ? 'text' : 'password'" label="Old password" hint="At least 6 characters"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-text-field v-model="newPassword" :rules="[rules.required, rules.min, rules.reg]" :type="show1 ? 'text' : 'password'" label="New password" hint="At least 6 characters"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-text-field block v-model="retypePassword" :rules="[rules.required, passwordMatch]" :type="show1 ? 'text' : 'password'" label="Confirm password"></v-text-field>
            </v-col>
        </v-row>
        <v-card-actions>
        <v-spacer></v-spacer>
       <v-btn class="mx-2" color="red" @click="reset">
          <v-icon dark>mdi-account-reactivate</v-icon>
        </v-btn>
        <v-btn class="mx-2" :disabled="!valid" color="success" @click="validate">
          <v-icon dark>mdi-check-underline-circle</v-icon>
        </v-btn>
      </v-card-actions> 
    </v-form>
</v-card-text>
</v-card>
  </v-col>
  <v-col cols="12" sm="6" md="3">
  </v-col>
  </v-col>
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
</v-row>
</template>
<script>
  import { mapState } from 'vuex'
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/
  export default{
  middleware: ['auth'],
  data: () => ({
    mode: '',
    color: '',
    snackbar: false,
    snackText: '',
    timeout: 6000,
    valid: true,
    oldPassword:"",
    newPassword: "",
    retypePassword: "",
    rules: {
      required: value => !!value || "Required.",
      reg: v => (v && pattern.test(v)) || "Min. 6 characters with at least one capital letter, a number and a special character."
    }
  }),
  computed: {
    passwordMatch() {
      return () => this.newPassword === this.retypePassword || "Password must match";
    },
    ...mapState('auth', ['loggedIn', 'user'])
  },
  methods: {
    validate() {
      if (this.$refs.changeForm.validate()) {
            try {
                var jwt = this.$auth.getToken('local')
                var token = jwt.split(".")
                var data = JSON.parse(atob(token[1]))
                // alert(data.jti)

                this.$axios.post('/api/v1/auth/change',{
                  oldPassword: this.oldPassword,
                  newPassword: this.newPassword,
                  retypePassword: this.retypePassword,
                })
                .then(res =>{
                    this.snackText = 'Success password changed'
                    this.color = 'success'
                    this.snackbar = true
                    this.$auth.reset();
                    this.$router.push('/login')
                  })
                .catch(err => {
                    if (err.response.data.statusCode == 401) {
                    this.$auth.reset();
                    this.$router.push('/login')
                    }else if (err.response.data.statusCode == 422) {
                    this.snackText = err.response.data.errors
                    this.color = 'error'
                    this.snackbar = true
                    }else{
                    this.snackText = 'encountered error with password change'
                    this.color = 'error'
                    this.snackbar = true
                    }
                })
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
      }
    },
    reset() {
      this.$refs.changeForm.reset();
    },
  head() {
    return {
      title: 'Password',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Drozone cheque',
        },
      ],
    }
  },

  }
</script>