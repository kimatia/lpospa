<template>
  <body>
    <div class="login-page">
    <div class="form">
      <form class="login-form">
        <h2 class="message">Login service</h2>
        <v-card-text class="px-4">
                  <v-form ref="loginForm" v-model="validLogin" lazy-validation>
                      <v-row>
                          <v-col cols="12">
                              <v-text-field prepend-icon="mdi-account" v-model="username" :rules="[rules.required]" label="Username" maxlength="20" required></v-text-field>
                          </v-col>
                          <v-col cols="12">
                              <v-text-field prepend-icon="mdi-lock" v-model="loginPassword" :append-icon="show1?'eye':'eye-off'" :rules="[rules.required, rules.min, validateError]" :type="show1 ? 'text' : 'password'" name="input-10-1" label="Password" hint="At least 6 characters"></v-text-field>
                          </v-col>
                          <v-col class="d-flex" cols="12" sm="6" xsm="12">
                          </v-col>
                          <v-spacer></v-spacer>

                              <v-card-actions>
                                <v-btn x-medium :disabled="!validLogin" color="success" @click="validateLogin"> Login </v-btn>
                              </v-card-actions>
                      </v-row>
                  </v-form>
              </v-card-text>
      </form>
    </div>
  </div>
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
  </body>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data: () => ({
    mode: '',
    color: '',
    snackbar: false,
    snackText: '',
    timeout: 6000,
    validLogin: true,
    username: "",
    email: "",
    password: "",
    verify: false,
    error: "",
    errMSG:"",
    loginPassword: "",
    emailRules: [
      v => !!v || "Required",
      v => /.+@.+\..+/.test(v) || "E-mail must be valid"
    ],

    show1: false,
    rules: {
      required: value => !!value || "Required.",
      min: v => (v && v.length >= 6) || "Min 6 characters"
    }
  }),
  middleware: 'guest',
  computed: {
    validateError() {
      return () => this.verify === false || this.errMSG;
    },
    ...mapState('auth', ['loggedIn', 'user'])
  },
  methods: {
    clicked() {
      const infoBtn = document.getElementsByClassName('info-btn')
      for (let i = 0; i < infoBtn.length; i++) {
        infoBtn[i].onclick = () => {
          document.querySelector('.container').classList.toggle('log-in')
        }
      }
    },
    async validateLogin(evt) {
      evt.preventDefault()
      if (this.$refs.loginForm.validate()) {
        try {
         await this.$auth.loginWith('local', {
          data: {
            "username": this.username,
            "password": this.loginPassword
          }
        })
        .then(res =>{
            // this.snackText = JSON.stringify(res.data.message)
            // this.color = 'success'
            // this.snackbar = true
          })
        .catch(err => {
            this.errMSG = JSON.stringify(err.response.data.errors.password[0]);
            this.verify = true
            this.$refs.loginForm.validate()
            this.verify = false
            setTimeout(() => {  this.$refs.loginForm.validate() }, 2000);
        })
        if (this.$auth.loggedIn) {
          var jwt = this.$auth.getToken('local')
          var token = jwt.split(".")
          var data = JSON.parse(atob(token[1]))
          var nav = data.menus
          localStorage.setItem('nav', JSON.stringify(nav));
          if (window.localStorage.getItem('nav')) {
            var items = window.localStorage.getItem('nav')
            if (this.$store.commit('menus/add', JSON.parse(items))) {
              this.$router.push('/')
            }
          }
          }
      } catch (err) {  
          this.snackText ='No control access permissions'
          this.color = 'error'
          this.snackbar = true
          this.$router.push('/login')
      }
      }
    },
     async validateReset(evt) {
      evt.preventDefault()
      if (this.$refs.registerForm.validate()) {
            try {
            await this.$axios.post('/api/v1/reset',{
              username: this.username,
              email: this.email,

            },config)
            .then(res =>{
              this.snackText = JSON.stringify(res.data.message)
              this.color = 'success'
              this.snackbar = true
              })
            .catch(err => {
                this.errMSG = JSON.stringify(err.response.data.errors.password[0])
                this.verify = true
                this.$router.push('/login')
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
            this.$router.push('/login')
          }
      }
    },
    async logout() {
      await this.$auth.logout()
      this.$router.push('/login')
    },
    reset() {
      this.$refs.form.reset();
    },
    resetValidation() {
      this.$refs.form.resetValidation();
    }
  },
  mounted(){
    this.$auth.reset();
    this.$router.push('/login')
  }
}
</script>

<style scoped>
body {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: blue;
  background: -webkit-linear-gradient(right, #F8F8FF, #DCDCDC);
  background: -moz-linear-gradient(right, #F8F8FF, #DCDCDC);
  background: -o-linear-gradient(right, #F8F8FF, #DCDCDC);
  background: linear-gradient(to left, #F8F8FF, #DCDCDC);
  font-family: "Roboto", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;      
  overflow: hidden;     
}
.login-page {
  width: 360px;
  padding: 8% 0 0;
  margin: auto;
}
.form {
  position: relative;
  z-index: 1;
  background: #FFFFFF;
  max-width: 360px;
  margin: 0 auto 100px;
  padding: 45px;
  text-align: center;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24);
}
.form input {
  font-family: "Roboto", sans-serif;
  outline: 0;
  background: #f2f2f2;
  width: 100%;
  border: 0;
  margin: 0 0 15px;
  padding: 15px;
  box-sizing: border-box;
  font-size: 14px;
}
.form .message {
  margin: 15px 0 0;
  color: blue;
  font-size: 17px;
}
</style>
