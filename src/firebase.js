import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, onValue } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyBq4ZEn6EDVR5PIaZDBqE5NvKY70cWQBqw",
  authDomain: "mem-rberry---progress-tracking.firebaseapp.com",
  databaseURL: "https://mem-rberry---progress-tracking-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mem-rberry---progress-tracking",
  storageBucket: "mem-rberry---progress-tracking.firebasestorage.app",
  messagingSenderId: "796970567510",
  appId: "1:796970567510:web:cbc240412ba8c31e9078f7"
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

export function subscribeToChecked(callback) {
  const checkedRef = ref(db, 'roadmap/checked')
  return onValue(checkedRef, (snapshot) => {
    const data = snapshot.val()
    callback(data || {})
  })
}

export async function saveChecked(checked) {
  const checkedRef = ref(db, 'roadmap/checked')
  await set(checkedRef, checked)
}
