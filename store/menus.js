let nav = localStorage.getItem('nav')
export const state = () => ({
  menu: nav ? JSON.parse(nav) : []
})

export const mutations = {
  add(state, text) {
    state.menu.push(text)
  },
  resetState(state)
	{
		state.menu = []
	}
}