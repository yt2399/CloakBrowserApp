/**
 * CDP 连接测试脚本
 * 用法: node scripts/test-cdp.mjs <cdp地址>
 *
 * 支持两种地址格式:
 *   - WebSocket: ws://127.0.0.1:9222/devtools/browser/xxxxx
 *   - HTTP: http://127.0.0.1:9222
 */

const cdpUrl = process.argv[2]

if (!cdpUrl) {
  console.error('请提供 CDP 地址作为参数')
  console.error('示例: node scripts/test-cdp.mjs ws://127.0.0.1:9222/devtools/browser/xxxxx')
  process.exit(1)
}

const isWebSocket = cdpUrl.startsWith('ws://') || cdpUrl.startsWith('wss://')

console.log(`测试 CDP 地址: ${cdpUrl}`)
console.log(`地址类型: ${isWebSocket ? 'WebSocket' : 'HTTP'}`)
console.log('---')

async function testWithWebSocket(url) {
  console.log('1. 测试 WebSocket 连接...')

  const ws = new WebSocket(url)
  let messageId = 1

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      ws.close()
      reject(new Error('WebSocket 连接超时 (3秒)'))
    }, 3000)

    ws.onopen = () => {
      clearTimeout(timeout)
      console.log('   WebSocket 连接成功!')

      // 发送 Runtime.evaluate 命令测试
      const id = messageId++
      ws.send(JSON.stringify({
        id,
        method: 'Runtime.evaluate',
        params: { expression: 'navigator.userAgent' }
      }))
    }

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.id === 1) {
        const ua = msg.result?.result?.value
        if (ua) {
          console.log(`   浏览器 UA: ${ua.slice(0, 80)}...`)
        }
        console.log('   CDP 命令执行成功!')
        ws.close()
        resolve()
      }
    }

    ws.onerror = () => {
      clearTimeout(timeout)
      reject(new Error('WebSocket 连接失败'))
    }
  })
}

async function testWithHttp(url) {
  // 1. 测试 /json/version
  console.log('1. 测试 /json/version 端点...')
  try {
    const resp = await fetch(`${url}/json/version`)
    if (!resp.ok) {
      console.error(`   失败: HTTP ${resp.status}`)
      return false
    }
    const version = await resp.json()
    console.log(`   成功! 浏览器: ${version.Browser}`)
    console.log(`   WebSocket: ${version.webSocketDebuggerUrl}`)
  } catch (err) {
    console.error(`   失败: ${err.message}`)
    return false
  }

  // 2. 测试 /json
  console.log('\n2. 测试 /json 端点 (列出所有 tab)...')
  try {
    const resp = await fetch(`${url}/json`)
    if (!resp.ok) {
      console.error(`   失败: HTTP ${resp.status}`)
      return false
    }
    const tabs = await resp.json()
    console.log(`   成功! 找到 ${tabs.length} 个 tab:`)
    tabs.forEach((tab, i) => {
      console.log(`   [${i}] ${tab.title || '(无标题)'}`)
      console.log(`       URL: ${tab.url}`)
    })
  } catch (err) {
    console.error(`   失败: ${err.message}`)
    return false
  }

  return true
}

async function main() {
  if (isWebSocket) {
    await testWithWebSocket(cdpUrl)
  } else {
    const ok = await testWithHttp(cdpUrl)
    if (!ok) return false
  }
  return true
}

main().then((ok) => {
  console.log('\n---')
  if (ok) {
    console.log('✓ CDP 地址验证通过!')
  } else {
    console.log('✗ CDP 地址验证失败')
    process.exit(1)
  }
})
