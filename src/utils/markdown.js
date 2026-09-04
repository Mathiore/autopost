function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function renderInline(text) {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

export function renderMarkdown(source) {
  const html = []
  const items = []

  function flushList() {
    if (!items.length) return
    html.push(`<ul>${items.map((item) => `<li>${renderInline(item)}</li>`).join('')}</ul>`)
    items.length = 0
  }

  for (const rawLine of String(source || '').replace(/\r\n/g, '\n').split('\n')) {
    const line = rawLine.trimEnd()
    const trimmed = line.trim()

    if (!trimmed) {
      flushList()
      continue
    }

    if (trimmed.startsWith('### ')) {
      flushList()
      html.push(`<h3>${renderInline(trimmed.slice(4))}</h3>`)
      continue
    }

    if (trimmed.startsWith('## ')) {
      flushList()
      html.push(`<h2>${renderInline(trimmed.slice(3))}</h2>`)
      continue
    }

    if (trimmed.startsWith('# ')) {
      flushList()
      html.push(`<h1>${renderInline(trimmed.slice(2))}</h1>`)
      continue
    }

    if (trimmed.startsWith('* ')) {
      items.push(trimmed.slice(2))
      continue
    }

    flushList()
    html.push(`<p>${renderInline(trimmed)}</p>`)
  }

  flushList()
  return html.join('\n')
}
