document.getElementById('search-form').addEventListener('submit', e => {
  e.preventDefault();
  const query = document.getElementById('search-input').value.trim();
  if (!query) return;
  // Aqui você pode redirecionar para resultados estáticos ou
  // implementar busca cliente-side. Exemplo:
  // window.location.href = `resultados.html?q=${encodeURIComponent(query)}`;
  console.log('Pesquisar por:', query);
});
