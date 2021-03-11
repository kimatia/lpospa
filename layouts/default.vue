<template>
  <v-app light>
    <v-navigation-drawer
      v-if="loggedIn"
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
      class="custom-color-three"
    >
      <template v-for="item in menus[0]" v-if="loggedIn">
          <v-list-group
            v-if="item.children"
            :key="item.text"
            :prepend-icon="item.model ? item.icon : item['icon-alt']"
            append-icon=""
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title style="color: white">
                  {{ item.text }}
                </v-list-item-title>
              </v-list-item-content>
            </template>
            <v-list-item v-for="(child, i) in item.children" :key="i" link :to="child.route">
              <v-list-item-action color="white" v-if="child.icon">
                <v-icon style="color: white">{{ child.icon }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title style="color: white">
                  {{ child.text }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
        </template>
        <template v-for="item in menus" v-if="loggedIn">
          <v-list-group
            v-if="item.children"
            :key="item.text"
            :prepend-icon="item.model ? item.icon : item['icon-alt']"
            append-icon=""
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title style="color: white">
                  {{ item.text }}
                </v-list-item-title>
              </v-list-item-content>
            </template>
            <v-list-item v-for="(child, i) in item.children" :key="i" link :to="child.route">
              <v-list-item-action color="white" v-if="child.icon">
                <v-icon style="color: white">{{ child.icon }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title style="color: white">
                  {{ child.text }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
        </template>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" fixed app class="custom-color-three" v-if="loggedIn">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-btn icon @click.stop="clipped = !clipped">
        <v-icon>mdi-application</v-icon>
      </v-btn>
      <v-spacer />
      <!-- dropdown -->
      <v-spacer></v-spacer>
        <v-btn text v-if="!loggedIn" :to="'/login'" nuxt> Login </v-btn>
      <v-btn v-if="loggedIn" @click="logout">
        <em>Hello {{ user.name }}</em>
      </v-btn>
      <!-- fropdown -->
    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
    <v-footer :absolute="!fixed" app class="3B8070" v-if="loggedIn">
      <span>Copyright &copy; {{ new Date().getFullYear() }} Cheques</span>
    </v-footer>
  </v-app>
</template>

<script>
  import { mapState } from 'vuex'
export default {
  data: () => ({
      clipped: true,
      drawer: true,
      fixed: true,
      miniVariant: false,
      right: true,
      rightDrawer: false,
   }),
  computed: {
     // menus() {
     //    return this.$store.state.menus.menu[0]
     //  },
    ...mapState('auth', ['loggedIn', 'user']),
    ...mapState({menus: state => state.menus.menu})
    },
    methods: {
      async logout() {
        await this.$auth.logout()
        localStorage.removeItem('nav')
        this.$store.commit('menus/resetState')
        this.$router.push('/login')
      }
    },
}
</script>