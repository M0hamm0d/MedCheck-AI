import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  {
    path: '/search',
    name: 'MedicineSearch',
    component: () => import('../views/MedicineSearch.vue'),
  },
  {
    path: '/safety',
    name: 'MedicineSafetyReview',
    component: () => import('../views/MedicineSafetyReview.vue'),
  },
  {
    path: '/prescription',
    name: 'PrescriptionExplainer',
    component: () => import('../views/PrescriptionExplainer.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
