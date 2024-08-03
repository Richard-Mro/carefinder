import { createRouter, createWebHistory } from 'vue-router'
import Signup from '../views/signUp.vue'
import Login from '../views/Login.vue'
import HospitalSearch from '../views/HospitalSearch.vue'
import ShareHospitals from '../components/shareHospitals.vue'
import { auth } from '../firebase'

const routes = [
  { path: '/signup', name: 'Signup', component: Signup },
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/hospital-search',
    name: 'HospitalSearch',
    component: HospitalSearch,
    meta: { requiresAuth: true }
  },
  {
    path: '/share',
    name: 'ShareHospitals',
    component: ShareHospitals
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const user = auth.currentUser
  if (requiresAuth && !user) {
    next('/login')
  } else {
    next()
  }
})

export default router
