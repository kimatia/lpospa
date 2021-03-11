export default function message_me({ app ,redirect }) {
      app.$auth.reset();
      app.$auth.logout();
      redirect('/login')
}
self.addEventListener('message', (event) => {
	setTimeout(() => { 
      message_me();
	}, event.data);

})

