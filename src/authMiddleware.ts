import { auth, db } from './firebase'
import { doc, getDoc } from 'firebase/firestore'

const authMiddleware = async (to: any, from: any, next: any) => {
  const user = auth.currentUser
  if (user) {
    console.log('Current User UID:', user.uid)
    const userDocRef = doc(db, 'users', user.uid)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      console.log('User Document Data:', userDoc.data())
      const userData = userDoc.data()
      if (userData?.role === 'admin') {
        next()
      } else {
        console.log('User is not an admin. Redirecting to /not-authorized')
        next('/not-authorized')
      }
    } else {
      console.log('User document not found. Redirecting to /not-authorized')
      next('/not-authorized')
    }
  } else {
    console.log('No user authenticated. Redirecting to /login')
    next('/login')
  }
}

export default authMiddleware
