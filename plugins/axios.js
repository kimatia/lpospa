export default function ({ $axios, app ,redirect}) {
  $axios.onError(error => {
    const code = parseInt(error.response && error.response.status)

    if ([401, 403].includes(code)) {
    	app.$auth.reset();
      app.$auth.logout();
      redirect('/login')
    }

    return Promise.reject(error);
  })
}