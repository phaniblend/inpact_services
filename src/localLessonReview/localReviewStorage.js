/** @type {string} */
const DB_NAME = 'inpact-local-lesson-review'
const DB_VERSION = 1
const STORE = 'draft'

/**
 * @typedef {{ id: string, track: string, lessonIndex: number, lessonNumber: number, lessonTitle: string, text: string, images: { mime: string, base64: string }[] }} ReviewComment
 * @typedef {{ version: number, comments: ReviewComment[] }} ReviewDraft
 */

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
  })
}

/** @returns {Promise<ReviewDraft | null>} */
export async function loadReviewDraft() {
  try {
    const db = await openDb()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const st = tx.objectStore(STORE)
      const g = st.get('current')
      g.onerror = () => reject(g.error)
      g.onsuccess = () => {
        db.close()
        resolve(g.result ?? null)
      }
    })
  } catch {
    return null
  }
}

/** @param {ReviewDraft} draft */
export async function saveReviewDraft(draft) {
  const db = await openDb()
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const st = tx.objectStore(STORE)
    const p = st.put(draft, 'current')
    p.onerror = () => reject(p.error)
    p.onsuccess = () => resolve()
    tx.oncomplete = () => db.close()
  })
}

export async function clearReviewDraft() {
  try {
    const db = await openDb()
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      const st = tx.objectStore(STORE)
      const p = st.delete('current')
      p.onerror = () => reject(p.error)
      p.onsuccess = () => resolve()
      tx.oncomplete = () => db.close()
    })
  } catch {
    /* ignore */
  }
}
