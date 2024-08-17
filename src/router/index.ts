import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Signup from '../views/signUp.vue'
import Login from '../views/Login.vue'
import HospitalSearch from '../views/HospitalSearch.vue'
import FilteredHospitals from '../views/FilteredHospitals.vue'
import HospitalDetail from '../views/HospitalDetail.vue'
import CreateHospitalEntry from '../views/CreateHospitalEntry.vue'
import NotAuthorized from '../views/NotAuthorized.vue'
import AdminPanel from '../views/AdminPanel.vue'
import RequestAdmin from '../views/RequestAdmin.vue'
import AdminRequests from '../views/AdminRequests.vue'
import AllHospitals from '../views/AllHospitals.vue'
import Home from '../views/Home.vue'
import authMiddleware from '../authMiddleware'
import { auth } from '../firebase'

const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'Home', component: Home },
  { path: '/signup', name: 'Signup', component: Signup },
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/hospital-search',
    name: 'HospitalSearch',
    component: HospitalSearch
  },
  {
    path: '/filtered-hospitals',
    name: 'FilteredHospitals',
    component: () => import('../views/FilteredHospitals.vue'),
    props: (route) => ({
      data: route.query.data ? JSON.parse(decodeURIComponent(route.query.data as string)) : []
    })
  },
  {
    path: '/create-hospital',
    name: 'CreateHospitalEntry',
    component: CreateHospitalEntry,
    meta: { requiresAuth: true }
  },
  {
    path: '/hospitals/:id',
    name: 'HospitalDetail',
    component: HospitalDetail,
    props: true
  },
  {
    path: '/admin-panel',
    name: 'AdminPanel',
    component: AdminPanel,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/request-admin',
    name: 'RequestAdmin',
    component: RequestAdmin,
    meta: { requiresAuth: true }
  },
  {
    path: '/all-hospitals',
    name: 'AllHospitals',
    component: AllHospitals
  },
  {
    path: '/admin-requests',
    name: 'AdminRequests',
    component: AdminRequests,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { path: '/not-authorized', name: 'NotAuthorized', component: NotAuthorized }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin)
  const user = auth.currentUser

  if (requiresAuth && !user) {
    next('/login')
  } else if (requiresAuth && user) {
    try {
      if (requiresAdmin) {
        await authMiddleware(to, from, next)
      } else {
        next()
      }
    } catch (error) {
      console.error('Middleware error:', error)
      next('/not-authorized')
    }
  } else {
    next()
  }
})

export default router
