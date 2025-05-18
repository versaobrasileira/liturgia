// js/content.js
import { fontConfig }          from './fontConfig.js'
import { setupLangDropdown }   from './lang.js'

let currentFontSize = null

/**
 * Carrega e exibe o conteúdo de um item (música).
 */
export async function loadContent(item) {
  const results = document.getElementById('results')
  const display = document.getElementById('content-display')

  // Garante que o <h1> volte a aparecer
  document.body.classList.remove('content-open')

  // Limpa e esconde
  results .innerHTML = ''
  display.innerHTML = ''
  display.classList.remove('visible')

  // 1) Fetch do JSON
  let data
  try {
    const res = await fetch(`./content/${item.file}`)
    if (!res.ok) throw new Error(res.status)
    data = await res.json()
  } catch (err) {
    console.error(err)
    display.textContent = `Erro ao carregar "${item.title}".`
    display.classList.add('visible')
    return
  }

  // 2) Monta a title-bar
  const titleBar   = document.createElement('div')
  titleBar.className = 'title-bar'

  const titleText  = document.createElement('div')
  titleText.className = 'title-text'
  const h2         = document.createElement('h2')
  h2.textContent   = data.title
  const sub        = document.createElement('div')
  sub.className    = 'subtitle'
  sub.textContent  = `pg. ${data.page}`
  titleText.append(h2, sub)

  // 3) Controles de zoom + idioma
  const controls   = document.createElement('div')
  controls.className = 'controls'

  // botões de zoom
  const btnDec     = createZoomButton('–', 'Diminuir fonte', -2)
  const btnInc     = createZoomButton('+', 'Aumentar fonte', +2)

  // dropdown de idioma
  const langDropdown = setupLangDropdown(item)

  // ANEXA na ordem: [zoom–, zoom+, idioma]
  controls.append(btnDec, btnInc, langDropdown)

  // 4) Anexa title-text e controls à title-bar, e title-bar ao display
  titleBar.append(titleText, controls)
  display.append(titleBar)

  // 5) Monta o container rolável com as letras
  const scroll           = document.createElement('div')
  scroll.className       = 'content-scroll'
  const lyricsContainer  = document.createElement('div')
  lyricsContainer.className = 'lyrics-container'
  data.lyrics.forEach(line => {
    const p = document.createElement('p')
    p.textContent = line
    lyricsContainer.append(p)
  })
  scroll.append(lyricsContainer)
  display.append(scroll)

  // 6) Exibe tudo e aplica ajuste de fonte
  display.classList.add('visible')
  document.body.classList.add('content-open')
  adjustFontSize(lyricsContainer)
}

/**
 * Ajusta font-size para que a maior linha ocupe toda a largura.
 */
export function adjustFontSize(container = document.querySelector('.lyrics-container')) {
  const paras = Array.from(container.querySelectorAll('p'))
  if (!paras.length) return
  container.style.fontSize = ''

  const style       = getComputedStyle(container)
  const { fontFamily, fontWeight } = style
  const availableW  = container.clientWidth
  const { minFontSize: minFS, maxFontSize: maxFS } = fontConfig

  const cvs = document.createElement('canvas')
  const ctx = cvs.getContext('2d')
  ctx.font = `${fontWeight} ${maxFS}px ${fontFamily}`

  let maxTextW = 0
  paras.forEach(p => {
    maxTextW = Math.max(maxTextW, ctx.measureText(p.textContent).width)
  })
  if (!maxTextW) return

  let newSize = maxFS * (availableW / maxTextW)
  newSize = Math.max(minFS, Math.min(maxFS, newSize))
  container.style.fontSize = `${newSize}px`
  currentFontSize = newSize
}

/**
 * Cria um botão de zoom que altera o tamanho da fonte em `delta` pixels.
 */
function createZoomButton(symbol, title, delta) {
  const btn = document.createElement('button')
  btn.type    = 'button'
  btn.textContent = symbol
  btn.title   = title
  btn.addEventListener('click', () => changeFontSize(delta))
  return btn
}

/**
 * Aumenta/diminui a fonte em `delta` pixels.
 */
export function changeFontSize(delta) {
  const lyrics = document.querySelector('.lyrics-container')
  let size = currentFontSize || parseFloat(getComputedStyle(lyrics).fontSize)
  size = Math.max(fontConfig.minFontSize,
                  Math.min(fontConfig.maxFontSize, size + delta))
  lyrics.style.fontSize = `${size}px`
  currentFontSize = size
}

/** Re-renderiza as linhas na mesma .lyrics-container */
export function renderLyrics(lines) {
  const cont = document.querySelector('.lyrics-container')
  cont.innerHTML = ''
  lines.forEach(l => {
    const p = document.createElement('p')
    p.textContent = l
    cont.append(p)
  })
}

// Reaplica ajuste de fonte ao redimensionar a janela
window.addEventListener('resize', () => {
  if (document.getElementById('content-display').classList.contains('visible')) {
    adjustFontSize()
  }
})
