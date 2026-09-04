const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/watch\?.*\bv=([a-zA-Z0-9_-]{11})/,
]

const IFRAME_API_SRC = 'https://www.youtube.com/iframe_api'

let youtubeApiPromise

export function extractYouTubeId(url) {
  const value = String(url || '').trim()
  if (!value) return null

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = pattern.exec(value)
    if (match?.[1]) return match[1]
  }

  return null
}

export function isValidYouTubeUrl(url) {
  return Boolean(extractYouTubeId(url))
}

export function getYouTubeThumbnail(videoId) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

export function getYouTubeWatchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`
}

export function getYouTubeEmbedUrl(videoId, startSeconds = 0, endSeconds = 0) {
  const start = Math.max(0, Math.floor(startSeconds))
  const params = new URLSearchParams({
    start: String(start),
    rel: '0',
  })

  const end = Math.floor(endSeconds)
  if (end > start) {
    params.set('end', String(end))
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`
}

function loadYouTubeIframeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (youtubeApiPromise) return youtubeApiPromise

  youtubeApiPromise = new Promise((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady

    window.onYouTubeIframeAPIReady = () => {
      previousReady?.()
      resolve(window.YT)
    }

    if (!document.querySelector(`script[src="${IFRAME_API_SRC}"]`)) {
      const script = document.createElement('script')
      script.src = IFRAME_API_SRC
      script.async = true
      script.onerror = () => {
        youtubeApiPromise = null
        reject(new Error('Falha ao carregar a API do YouTube.'))
      }
      document.head.appendChild(script)
    }
  })

  return youtubeApiPromise
}

export async function fetchYouTubeOEmbed(videoId) {
  const watchUrl = getYouTubeWatchUrl(videoId)
  const endpoints = [
    `https://noembed.com/embed?url=${encodeURIComponent(watchUrl)}`,
    `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`,
  ]

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint)
      if (!response.ok) continue
      const data = await response.json()
      if (data?.title) return data
    } catch {
      // A public metadata endpoint may be blocked; try the next one.
    }
  }

  return null
}

export async function fetchYouTubeDuration(videoId) {
  const YT = await loadYouTubeIframeApi()

  return new Promise((resolve, reject) => {
    const host = document.createElement('div')
    host.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden'
    document.body.appendChild(host)

    let settled = false
    let player

    const finish = (handler, value) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      try {
        player?.destroy()
      } catch {
        // The hidden player may already have been replaced by the API.
      }
      host.remove()
      handler(value)
    }

    const timer = window.setTimeout(() => {
      finish(reject, new Error('Tempo esgotado ao ler a duração do YouTube.'))
    }, 12000)

    player = new YT.Player(host, {
      videoId,
      width: 1,
      height: 1,
      playerVars: { autoplay: 0, controls: 0 },
      events: {
        onReady(event) {
          const duration = Math.floor(event.target.getDuration() || 0)
          if (duration > 0) {
            finish(resolve, duration)
            return
          }
          finish(reject, new Error('O YouTube não retornou a duração.'))
        },
        onError() {
          finish(reject, new Error('Não foi possível acessar este vídeo do YouTube.'))
        },
      },
    })
  })
}

export async function fetchYouTubeMeta(videoId) {
  const meta = {
    title: `YouTube · ${videoId}`,
    thumbnail: getYouTubeThumbnail(videoId),
    durationSeconds: 0,
  }

  const [oembedResult, durationResult] = await Promise.allSettled([
    fetchYouTubeOEmbed(videoId),
    fetchYouTubeDuration(videoId),
  ])

  if (oembedResult.status === 'fulfilled' && oembedResult.value) {
    meta.title = oembedResult.value.title || meta.title
    meta.thumbnail = oembedResult.value.thumbnail_url || meta.thumbnail
  }

  if (durationResult.status === 'fulfilled') {
    meta.durationSeconds = durationResult.value
  }

  return meta
}
