// tema.js

const linkClaro = document.getElementById('tema-claro-css')
const btn       = document.getElementById('theme-toggle')

// on load: read localStorage, default to 'light'
let theme = localStorage.getItem('theme') || 'light'
applyTheme(theme)

// when the user clicks, toggle between light/dark
btn.addEventListener('click', () => {
  theme = theme === 'light' ? 'dark' : 'light'
  localStorage.setItem('theme', theme)
  applyTheme(theme)
})

function applyTheme(mode) {
  if (mode === 'light') {
    // habilita tema claro, mostra lua para indicar "claro está ativo"
    linkClaro.disabled = false
    btn.textContent     = '🌙'
  } else {
    // desabilita tema claro, volta ao dark, mostra sol
    linkClaro.disabled = true
    btn.textContent    = '☀️'
  }
}
