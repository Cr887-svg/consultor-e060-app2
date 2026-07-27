/* ============================================================
   MOTOR DE BÚSQUEDA LOCAL — Consultor E.060 (modo offline)
   No usa internet. Busca directamente en el texto de la norma
   que ya está guardado dentro de la app (norma-data.json).
   ============================================================ */

let NORMA_PAGINAS = [];
let NORMA_CARGADA = false;

// Palabras muy comunes que no aportan al buscar (se ignoran)
const PALABRAS_VACIAS = new Set([
  "que","de","la","el","en","para","con","un","una","los","las","se","es",
  "del","al","no","por","como","su","sus","o","y","a","cual","cuales",
  "cuál","cuáles","es","son","debe","deben","mi","tu","este","esta",
  "esto","hay","tiene","tienen"
]);

async function cargarNorma() {
  if (NORMA_CARGADA) return;
  const res = await fetch('norma-data.json');
  NORMA_PAGINAS = await res.json();
  NORMA_CARGADA = true;
}

function quitarAcentos(txt) {
  return txt.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function tokenizar(texto) {
  const limpio = quitarAcentos(texto.toLowerCase());
  const palabras = limpio.match(/[a-z0-9']+/g) || [];
  return palabras.filter(p => p.length > 2 && !PALABRAS_VACIAS.has(p));
}

// Busca las páginas más relevantes para una pregunta
function buscarEnNorma(pregunta, maxResultados = 2) {
  const terminos = tokenizar(pregunta);
  if (terminos.length === 0) return [];

  const resultados = [];

  for (const pagina of NORMA_PAGINAS) {
    const textoNormalizado = quitarAcentos(pagina.texto.toLowerCase());
    let puntaje = 0;

    for (const termino of terminos) {
      const regex = new RegExp(termino, 'g');
      const coincidencias = (textoNormalizado.match(regex) || []).length;
      puntaje += coincidencias;
    }

    // Bono si aparecen dos o más términos juntos (más relevante)
    if (terminos.length >= 2) {
      const frase = terminos.slice(0, 3).join(' ');
      if (textoNormalizado.includes(frase)) puntaje += 5;
    }

    if (puntaje > 0) {
      resultados.push({ pagina: pagina.pagina, texto: pagina.texto, puntaje });
    }
  }

  resultados.sort((a, b) => b.puntaje - a.puntaje);
  return resultados.slice(0, maxResultados);
}

// Extrae un fragmento del texto centrado en la primera coincidencia
function extraerFragmento(texto, terminos, longitud = 380) {
  const textoNorm = quitarAcentos(texto.toLowerCase());
  let posicion = -1;

  for (const termino of terminos) {
    const idx = textoNorm.indexOf(termino);
    if (idx >= 0 && (posicion === -1 || idx < posicion)) posicion = idx;
  }

  if (posicion === -1) posicion = 0;

  const inicio = Math.max(0, posicion - 60);
  let fragmento = texto.substring(inicio, inicio + longitud).trim();

  fragmento = fragmento.replace(/\s+/g, ' ');
  if (inicio > 0) fragmento = '…' + fragmento;
  if (inicio + longitud < texto.length) fragmento = fragmento + '…';

  return fragmento;
}

// Resalta las palabras buscadas dentro de un fragmento
function resaltarTerminos(fragmento, terminos) {
  let resultado = fragmento;
  for (const termino of terminos) {
    if (termino.length < 3) continue;
    const regex = new RegExp(`(${termino})`, 'gi');
    resultado = resultado.replace(regex, '<strong>$1</strong>');
  }
  return resultado;
}

/* ============================================================
   Función principal: responde una pregunta usando SOLO
   lo que ya está guardado en el celular. Sin internet.
   ============================================================ */
async function consultarOffline(pregunta) {
  await cargarNorma();

  // 1) ¿Coincide con alguna pregunta frecuente ya preparada?
  const respuestaFAQ = buscarEnFAQ(pregunta);
  if (respuestaFAQ) return respuestaFAQ;

  // 2) Si no, buscar en el texto completo de la norma
  const terminos = tokenizar(pregunta);
  const resultados = buscarEnNorma(pregunta, 2);

  if (resultados.length === 0) {
    return `No encontré coincidencias claras para esa pregunta dentro del texto de la norma que tengo guardado. Intenta con otras palabras (por ejemplo, usa términos técnicos como "recubrimiento", "estribos", "f'c", "peralte", "empalme").`;
  }

  let respuesta = `Esto encontré en el texto de la Norma E.060 relacionado con tu pregunta:<br><br>`;

  resultados.forEach((r) => {
    const fragmento = extraerFragmento(r.texto, terminos);
    const resaltado = resaltarTerminos(fragmento, terminos);
    respuesta += `${resaltado}<br><span class="pag">📄 Ver página ${r.pagina}</span><br><br>`;
  });

  respuesta += `<span style="font-size:11px;color:var(--muted)">Fragmento textual de la norma. Para el análisis completo, revisa la página citada.</span>`;

  return respuesta;
}
