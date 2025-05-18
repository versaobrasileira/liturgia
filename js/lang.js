// js/lang.js

import { renderLyrics, adjustFontSize } from './content.js'

/**
 * Cada “bandeirinha” em HTML string
 */
const FLAG_SVGS = {
  default: `<span class="lang-default">TL</span>`,
  hebrew: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 32 22">
      <rect width="32" height="22" fill="#fff"/>
      <rect y="1" width="32" height="4" fill="#005eb8"/>
      <rect y="17" width="32" height="4" fill="#005eb8"/>
      <polygon points="16,7 20,14 12,14" fill="none" stroke="#005eb8" stroke-width="1.5"/>
      <polygon points="16,15 20,8 12,8" fill="none" stroke="#005eb8" stroke-width="1.5"/>
    </svg>
  `,
  portuguese: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 32 22">
      <rect width="32" height="22" fill="#3eae46"/>
      <polygon points="16,3 29,11 16,19 3,11" fill="#ffd700"/>
      <ellipse cx="16" cy="11" rx="6" ry="6.5" fill="#2f3789"/>
      <path d="M10.8 12c2-1.2 8.3-1.4 10.4 0" stroke="#fff" stroke-width="1.2" fill="none"/>
    </svg>
  `
}

/**
 * Cria e devolve o dropdown de idiomas.
 * Injetar onde for (ex: dentro de .controls).
 */
export function setupLangDropdown(item) {
  const dropdown = document.createElement('div')
  dropdown.className = 'lang-dropdown'

  dropdown.innerHTML = `
    <button class="lang-btn" title="Idioma">
      ${FLAG_SVGS.default}
    </button>
    <ul class="lang-list" hidden>
      <li data-lang="default">${FLAG_SVGS.default}</li>
      ${item.hebrew     ? `<li data-lang="hebrew">${FLAG_SVGS.hebrew} </li>`       : ''}
      ${item.portuguese ? `<li data-lang="portuguese">${FLAG_SVGS.portuguese}</li>` : ''}
    </ul>
  `

  const btn  = dropdown.querySelector('.lang-btn')
  const list = dropdown.querySelector('.lang-list')

  // guarda o SVG atual
  let currentSVG = FLAG_SVGS.default

  function openDropdown() {
    list.hidden = false
    // esconde só visualmente o botão
    btn.style.visibility = 'hidden'
    dropdown.classList.add('open')
  }

  function closeDropdown() {
    list.hidden = true
    btn.style.visibility = ''      // volta a ficar visível
    btn.innerHTML = currentSVG     // restaura o SVG selecionado
    dropdown.classList.remove('open')
  }

  // toggle ao clicar no botão
  btn.addEventListener('click', e => {
    e.stopPropagation()
    if (list.hidden) openDropdown()
    else            closeDropdown()
  })

  // fecha se clicar fora
  document.addEventListener('click', e => {
    if (!dropdown.contains(e.target)) {
      closeDropdown()
    }
  })

  // ao escolher uma opção
  list.addEventListener('click', async e => {
    const li = e.target.closest('li')
    if (!li) return

    const sel = li.dataset.lang
    closeDropdown()

    // atualiza ícone do botão
    currentSVG = FLAG_SVGS[sel] || FLAG_SVGS.default
    btn.innerHTML = currentSVG

    // escolhe qual arquivo carregar
    let fname = item.file
    if (sel === 'hebrew')      fname = item.hebrew
    else if (sel === 'portuguese') fname = item.portuguese

    try {
      const res  = await fetch(`./content/${fname}`)
      const data = await res.json()
      renderLyrics(data.lyrics)
      adjustFontSize()
    } catch (err) {
      console.error('Erro ao trocar idioma:', err)
    }
  })

  return dropdown
}
