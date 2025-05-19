// js/app.js

// 1) Configuração de fonte (é um módulo que só carrega o JSON e expõe fontConfig)
import './fontConfig.js';

// 2) Content module (exporta loadContent, adjustFontSize, etc.)
import './content.js';

// 3) Search UI module (antes chamado search.js, agora separado em utils/engine/ui)
import './search-ui.js';

import './tema.js';

import './fullscreen.js';

import './share.js'; 

import './lang.js';
