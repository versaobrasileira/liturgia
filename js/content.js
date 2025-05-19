// js/content.js
import { fontConfig }        from './fontConfig.js'
import { setupLangDropdown } from './lang.js'
import { fsMode, updateFsUI } from './fullscreen.js';

let currentFontSize = null

/**
 * Popula um container (div.lyrics-container) a partir de um array de linhas,
 * incluindo o parsing de <estrofe>…</estrofe> e geração de blocos e labels.
 */
function populateLyrics(container, lines) {
  container.innerHTML = ''
  let blockContainer = null

  lines.forEach(rawLine => {
    const line = rawLine.trim()

    
    const open = /^\s*<estrofe\s+r=(?:\[(.+?)\]|([^\]\s>]+))>\s*$/i.exec(line)
    if (open) {
      const labelText = open[1] || open[2]
      blockContainer = document.createElement('div')
      blockContainer.className = 'est-block'
      blockContainer.dataset.repeat = labelText

      const label = document.createElement('div')
      label.className = 'est-label'
      label.textContent = labelText
      blockContainer.append(label)

      container.append(blockContainer)
      return
    }

    // fecha bloco
    if (/^<\/estrofe>\s*$/i.test(line)) {
      blockContainer = null
      return
    }

    // linha normal
    const p = document.createElement('p')
    p.textContent = rawLine
    if (blockContainer) blockContainer.append(p)
    else               container.append(p)
  })
}

export async function loadContent(item) {
  const results = document.getElementById('results')
  const display = document.getElementById('content-display')

  document.body.classList.remove('content-open')
  results .innerHTML = ''
  display.innerHTML = ''
  display.classList.remove('visible');
  document.body.classList.add('content-open');

  // se já estamos em fullscreen, reaplique
  if (fsMode) document.body.classList.add('fullscreen-mode');

  // fetch
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

  // title-bar
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

  const controls      = document.createElement('div')
  controls.className  = 'controls'
  const btnDec        = createZoomButton('–','Diminuir fonte', -2)
  const btnInc        = createZoomButton('+','Aumentar fonte', +2)
  const langDropdown  = setupLangDropdown(item)
  controls.append(btnDec, btnInc, langDropdown)
  titleBar.append(titleText, controls)
  display.append(titleBar)

  // letras + metadata
  // monta container rolável + lyrics-container
  const scroll          = document.createElement('div')
  scroll.className      = 'content-scroll'
  const lyricsContainer = document.createElement('div')
  lyricsContainer.className = 'lyrics-container'

  // usa a função única
  populateLyrics(lyricsContainer, data.lyrics)

  scroll.append(lyricsContainer)
  display.append(scroll)

  display.classList.add('visible')
  document.body.classList.add('content-open')
  updateFsUI();
  adjustFontSize(lyricsContainer)
}


export function adjustFontSize(container = document.querySelector('.lyrics-container')) {
  const paras = Array.from(container.querySelectorAll('p'))
  if (!paras.length) return
  container.style.fontSize = ''
  const style      = getComputedStyle(container)
  const { fontFamily,fontWeight } = style
  const availableW = container.clientWidth
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

function createZoomButton(symbol, title, delta) {
  const btn = document.createElement('button')
  btn.type        = 'button'
  btn.textContent = symbol
  btn.title       = title
  btn.addEventListener('click', () => changeFontSize(delta))
  return btn
}

export function changeFontSize(delta) {
  const lyrics = document.querySelector('.lyrics-container')
  let size = currentFontSize || parseFloat(getComputedStyle(lyrics).fontSize)
  size = Math.max(fontConfig.minFontSize,
                  Math.min(fontConfig.maxFontSize, size + delta))
  lyrics.style.fontSize = `${size}px`
  currentFontSize = size
}

export function renderLyrics(lines) {
  const container = document.querySelector('.lyrics-container')
  populateLyrics(container, lines)
}

window.addEventListener('resize', () => {
  if (document.getElementById('content-display').classList.contains('visible')) {
    adjustFontSize()
  }
})
