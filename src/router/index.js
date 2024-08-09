import { createRouter, createWebHistory } from 'vue-router'
import Signup from '../views/signUp.vue'
import Login from '../views/Login.vue'
import HospitalSearch from '../views/HospitalSearch.vue'
import ShareHospitals from '../views/shareHospitals.vue'
import CreateHospitalEntry from '../views/CreateHospitalEntry.vue'
import ViewHospitalEntry from '../views/viewHospitalEntry.vue'
import NotAuthorized from '../views/NotAuthorized.vue'
import AdminPanel from '../views/AdminPanel.vue' // Import the AdminPanel component
import authMiddleware from '../authMiddleware' // Import the middleware
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
  {
    path: '/admin-panel', // New route for AdminPanel
    name: 'AdminPanel',
    component: AdminPanel,
    meta: { requiresAuth: true, requiresAdmin: true } // Protected route with admin check
  },
  { path: '/not-authorized', name: 'NotAuthorized', component: NotAuthorized },
  { path: '/', redirect: '/signup' } // Redirect to signup as default route
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard to protect routes based on authentication and roles
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin)
  const user = auth.currentUser

  if (requiresAuth && !user) {
    next('/login')
  } else if (requiresAuth && user) {
    try {
      if (requiresAdmin) {
        await authMiddleware(to, from, next) // Check if user is an admin
      } else {
        next()
      }
    } catch (error) {
      console.error('Middleware error:', error)
      next('/not-authorized') // Redirect to not authorized page in case of error
    }
  } else {
    next()
  }
})

export default router
