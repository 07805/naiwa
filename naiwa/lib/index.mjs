import { readFile } from 'node:fs/promises'
import { join, normalize, sep } from 'node:path'

export const name = 'dsh-naiwa-entrance'
export const inject = ['webServer']

// 这一半只做两件事：把打包进来的文件发给页面；往开机 HTML 里插一行 <script>。
// 不读会话、不碰账号。
const BASE = '/dsh-naiwa-entrance'
const ASSETS_PATH = BASE + '/assets'
const BOOT_PATH = BASE + '/boot.js'

const TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.js': 'text/javascript',
}

function safeRelative(pathname) {
  const prefix = ASSETS_PATH + '/'
  if (!pathname.startsWith(prefix)) return null
  let rel
  try { rel = decodeURIComponent(pathname.slice(prefix.length)) } catch { return null }
  const norm = normalize(rel).replace(new RegExp('^([/\\\\])+'), '')
  if (!norm || norm.startsWith('..') || norm.includes('..' + sep)) return null
  return norm
}

function sendScript(res, text) {
  res.writeHead(200, {
    'Content-Type': 'text/javascript; charset=utf-8',
    'Content-Length': Buffer.byteLength(text),
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  })
  res.end(text)
}

export function apply(ctx) {
  ctx.inject(['webServer'], (webCtx) => {
    const server = webCtx.webServer ?? webCtx.get?.('webServer')
    if (!server?.register) return

    // 1) 静态素材（图片）
    webCtx.effect(() => server.register({
      kind: 'prefix',
      path: ASSETS_PATH,
      handler: async (req, res) => {
        if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return }
        let pathname
        try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname) }
        catch { res.writeHead(400); res.end(); return }

        const relative = safeRelative(pathname)
        if (!relative) { res.writeHead(403); res.end(); return }

        try {
          const data = await readFile(join(import.meta.dirname, 'assets', relative))
          const dot = relative.lastIndexOf('.')
          const type = dot >= 0 ? TYPES[relative.slice(dot).toLowerCase()] : undefined
          res.writeHead(200, {
            'Content-Type': type ?? 'application/octet-stream',
            'Content-Length': data.length,
            'Cache-Control': 'no-cache',
            'X-Content-Type-Options': 'nosniff',
          })
          res.end(req.method === 'HEAD' ? undefined : data)
        } catch { res.writeHead(404); res.end() }
      },
    }), 'dsh-naiwa-entrance: assets')

    // 2) 开机脚本：直接读 lib/boot.js（由 tools/build-boot.cjs 从 client.js 生成）
    webCtx.effect(() => server.register({
      kind: 'prefix',
      path: BOOT_PATH,
      handler: async (req, res) => {
        try { sendScript(res, await readFile(join(import.meta.dirname, 'boot.js'), 'utf8')) }
        catch { res.writeHead(404); res.end() }
      },
    }), 'dsh-naiwa-entrance: boot script')

    // 3) 开机 HTML 注入：
    //    应用入口是 type="module"（默认 defer），而这一行插在 <body> 开始处，
    //    所以它会先于整个应用执行 → 真正做到「一打开就显示」。
    webCtx.effect(() => webCtx.on('webserver/index-inject', (table) => {
      table.push({
        kind: 'html',
        placement: 'head',
        html: `<link rel="preload" as="image" href="${ASSETS_PATH}/hero.png">`,
      })
      table.push({ kind: 'script-src', placement: 'body', src: BOOT_PATH })
    }), 'dsh-naiwa-entrance: index injection')
  })
}
