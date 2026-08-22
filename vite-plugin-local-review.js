import fs from 'node:fs/promises'
import path from 'node:path'
import { Buffer } from 'node:buffer'
import process from 'node:process'

function extFromMime(mime) {
  const m = (mime || '').toLowerCase()
  if (m === 'image/jpeg' || m === 'image/jpg') return 'jpg'
  if (m === 'image/png') return 'png'
  if (m === 'image/gif') return 'gif'
  if (m === 'image/webp') return 'webp'
  return 'png'
}

function slugTrack(track) {
  return String(track || 'track').replace(/[^a-z0-9-]+/gi, '-').replace(/^-|-$/g, '') || 'track'
}

/** Dev-only: POST JSON { comments } → writes `reviews/review.txt` and `reviews/images/`. */
export function vitePluginLocalReview() {
  return {
    name: 'vite-plugin-local-review',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] || ''
        if (url !== '/__local-review/submit' || req.method !== 'POST') {
          return next()
        }
        const raw = await new Promise((resolve, reject) => {
          const chunks = []
          req.on('data', (c) => chunks.push(c))
          req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
          req.on('error', reject)
        })
        try {
          const payload = JSON.parse(raw)
          const comments = payload.comments
          if (!Array.isArray(comments)) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Invalid payload: comments array required' }))
            return
          }
          const root = path.join(process.cwd(), 'reviews')
          const imgDir = path.join(root, 'images')
          await fs.mkdir(imgDir, { recursive: true })

          const countByKey = {}
          const lines = []
          lines.push('# PALL-INPACT — local lesson review')
          lines.push(`Exported: ${new Date().toISOString()}`)
          lines.push('')
          lines.push(
            'Optional: include the phrase "see the screenshot" in a note when you want to explicitly tie wording to an image; image filenames are always listed below when attached.',
          )
          lines.push('')

          for (const c of comments) {
            const key = `${c.track}:${c.lessonNumber}`
            countByKey[key] = (countByKey[key] || 0) + 1
            const ci = countByKey[key]
            const L = Number(c.lessonNumber)
            const tslug = slugTrack(c.track)
            const imgs = Array.isArray(c.images) ? c.images : []
            const relNames = []
            for (let j = 0; j < imgs.length; j++) {
              const im = imgs[j]
              const ext = extFromMime(im.mime)
              const base =
                imgs.length === 1
                  ? `${tslug}_lesson${L}_${ci}.${ext}`
                  : `${tslug}_lesson${L}_${ci}_${j + 1}.${ext}`
              const absPath = path.join(imgDir, base)
              const b64 = String(im.base64 || '').replace(/\s/g, '')
              await fs.writeFile(absPath, Buffer.from(b64, 'base64'))
              relNames.push(`images/${base}`)
            }
            lines.push(`## ${c.track} — Lesson ${L}: ${c.lessonTitle || ''}`)
            lines.push('')
            lines.push(String(c.text || '').trim() || '(no text)')
            lines.push('')
            if (relNames.length) {
              lines.push(`Files: ${relNames.join(', ')}`)
              if (/\bsee the screenshot\b/i.test(String(c.text || ''))) {
                lines.push('(Note references screenshots — filenames above match attachment order.)')
              }
            }
            lines.push('')
            lines.push('---')
            lines.push('')
          }

          await fs.writeFile(path.join(root, 'review.txt'), lines.join('\n'), 'utf8')
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              ok: true,
              message: 'Wrote reviews/review.txt and reviews/images/',
            }),
          )
        } catch (e) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: String(e?.message || e) }))
        }
      })
    },
  }
}
