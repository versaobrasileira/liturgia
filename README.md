# Liturgia • Busca

> Um buscador offline de cânticos litúrgicos, rápido, inteligente e responsivo.


---

## 🔍 Visão Geral

Liturgia • Busca é uma Progressive Web App (PWA) que permite:
- **Buscar páginas ou termos** em um índice de cânticos litúrgicos.
- **Fuzzy search** com tolerância a erros de digitação, janelas de fragmento e sinônimos.
- **Filtro de relevância**: Filtro inteligente que encontra resultados mais relevântes.
- **Suporte offline** via Service Worker, com cache de ativos estáticos e conteúdo dinâmico.
- **Temas personalizáveis**: light, dark, light-invert e dark-invert, com inversão CSS para imagens.
- **Compartilhamento nativo** (Web Share API) ou fallback para WhatsApp.
- **Responsivo**: funciona bem em desktops, tablets e smartphones.

---

## ⚙️ Tecnologias

- **Vanilla JS** (ESModules)
- **CSS custom properties** para temas
- **Service Worker** (Cache API)
- **Web Share API** e fallback WhatsApp
- **Levenshtein**, janelas mínimas e regras de penalidade — tudo em módulos orientados a objeto

---

<p align="center">
  <img src="https://github.com/user-attachments/assets/3404c98f-f6f7-4734-b602-1c34aeb99677" alt="Default Theme" />
</p>


## 🚀 Instalação e Uso

1. **Clone o repositório**
   ```bash
   git clone https://github.com/SEU_USUARIO/liturgia-busca.git
   cd liturgia-busca
