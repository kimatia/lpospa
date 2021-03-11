<template>
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
</template>
<script>
	import { mapState } from 'vuex'
	export default {
	middleware: ['auth'],
    data: () => ({
 		mode: '',
	    color: '',
	    snackbar: false,
	    snackText: '',
	    timeout: 6000,
	  }),
	  computed: {
	   ...mapState('auth', ['loggedIn', 'user'])
	  },
	  head() {
	    return {
	      payee: 'Medfast | home',
	      meta: [
	        {
	          hid: 'description',
	          name: 'description',
	          content: 'Medfast home',
	        },
	      ],
	    }
	  },
  }
</script>
