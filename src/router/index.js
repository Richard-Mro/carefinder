import { createRouter, createWebHistory } from 'vue-router'
import Signup from '../views/signUp.vue'
import Login from '../views/Login.vue'
import HospitalSearch from '../views/HospitalSearch.vue'
import ShareHospitals from '../components/shareHospitals.vue'
import CreateHospitalEntry from '../views/CreateHospitalEntry.vue'
import ViewHospitalEntry from '../views/viewHospitalEntry.vue'
import { auth } from '../firebase'

const routes = [
  { path: '/signup', name: 'Signup', component: Signup },
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/hospital-search',
    name: 'HospitalSearch',
    component: HospitalSearch,
    meta: { requiresAuth: true } // Protected route
  },
  {
    path: '/share',
    name: 'ShareHospitals',
    component: ShareHospitals
  },
  {
    path: '/create-hospital',
    name: 'CreateHospitalEntry',
    component: CreateHospitalEntry,
    meta: { requiresAuth: true } // Protected route
  },
  {
    path: '/hospitals/:id',
    name: 'ViewHospitalEntry',
    component: ViewHospitalEntry,
    meta: { requiresAuth: true }, // Protected route
    props: true // Pass route params as props to the component
  },
  { path: '/', redirect: '/login' } // Redirect to login as default route
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard to protect routes based on authentication
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
