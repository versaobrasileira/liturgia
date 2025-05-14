const form      = document.getElementById('search-form');
const input     = document.getElementById('search-input');
const button    = document.getElementById('search-button');

// Desativa o botão ao carregar
button.disabled = true;

input.addEventListener('input', () => {
  // Só habilita se tiver ao menos 2 caracteres
  button.disabled = input.value.trim().length < 2;
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const query = input.value.trim();
  if (query.length < 2) return; // segurança extra
  console.log('Pesquisar por:', query);
  // ... seu redirecionamento ou lógica de busca
});
