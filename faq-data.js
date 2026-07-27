/* ============================================================
   PREGUNTAS FRECUENTES — Respuestas ya redactadas de antemano
   Verificadas contra el texto real de la Norma E.060 (227 pág.)
   No requieren búsqueda ni internet: se muestran al instante.
   ============================================================ */

const FAQ = [
  {
    disparadores: ["recubrimiento", "columna"],
    respuesta: `Según el <strong>numeral 7.7.2</strong> de la Norma E.060, para concreto no expuesto a la intemperie ni en contacto con el suelo:<br><br>
* <strong>Vigas y columnas — Refuerzo principal:</strong> 40 mm<br>
* <strong>Vigas y columnas — Estribos y espirales:</strong> 25 mm<br><br>
Si el concreto está en contacto permanente con el suelo o expuesto a la intemperie, el recubrimiento aumenta a 40-70 mm dependiendo del elemento.<br>
<span class="pag">📄 Ver página 50</span>`
  },
  {
    disparadores: ["agua", "cemento", "relacion agua"],
    respuesta: `La Norma E.060 (<strong>numeral 4.1, Capítulo 4</strong>) establece las relaciones agua-material cementante en las <strong>Tablas 4.2 y 4.4</strong>, según el tipo de exposición ambiental del concreto (humedad, ciclos de congelamiento, sulfatos, etc.).<br><br>
No existe un único valor "máximo" general — depende de la condición de exposición específica de tu elemento. Por ejemplo, para concreto expuesto a soluciones de sulfatos, la Tabla 4.4 exige una relación agua-cemento máxima que varía según la severidad de la exposición.<br>
<span class="pag">📄 Ver páginas 27, 29</span>`
  },
  {
    disparadores: ["resistencia minima", "f'c", "fc minimo", "resistencia minima f'c"],
    respuesta: `Según el <strong>numeral 5.1.1</strong> de la Norma E.060:<br><br>
<strong>"La resistencia mínima del concreto estructural, f'c, diseñado y construido de acuerdo con esta Norma no debe ser inferior a 17 MPa."</strong><br><br>
Para elementos que forman parte del sistema de resistencia sísmica (Capítulo 21), la resistencia mínima aumenta a <strong>21 MPa</strong>.<br><br>
* Un concreto con f'c = 175 kg/cm² (≈17 MPa) CUMPLE el mínimo general.<br>
* ALERTA: Ese mismo valor NO CUMPLE para elementos sismorresistentes, que exigen 21 MPa.<br>
<span class="pag">📄 Ver páginas 32, 184</span>`
  },
  {
    disparadores: ["empalme", "traslape"],
    respuesta: `La Norma E.060 (<strong>Capítulo 12.14</strong>) permite tres tipos de empalme: por traslape, soldados y mecánicos.<br><br>
* Los empalmes por traslape que no quedan en contacto entre sí no deben espaciarse transversalmente más de 1/5 de la longitud de empalme requerida, ni más de 150 mm.<br>
* Un <strong>empalme mecánico</strong> debe desarrollar en tracción o compresión al menos <strong>1,25 fy</strong> de la barra.<br>
* Un <strong>empalme soldado</strong> debe desarrollar al menos <strong>1,25 fy</strong> de la barra, cumpliendo con la norma AWS D1.4.<br>
<span class="pag">📄 Ver página 123</span>`
  },
  {
    disparadores: ["estribos", "espaciado estribos", "separacion estribos"],
    respuesta: `Para elementos sismorresistentes (<strong>Capítulo 21</strong>), el espaciamiento de los estribos cerrados de confinamiento no debe exceder el menor de:<br><br>
(a) d/4 (no es necesario que sea menor de 150 mm)<br>
(b) 8 a 10 veces el diámetro de la barra longitudinal más pequeña<br>
(c) 24 veces el diámetro de la barra del estribo<br>
(d) 300 mm<br><br>
Fuera de las zonas de confinamiento, el espaciado no debe exceder d/2.<br>
<span class="pag">📄 Ver páginas 187, 190</span>`
  },
  {
    disparadores: ["peralte minimo", "peralte viga", "altura minima viga"],
    respuesta: `Según la <strong>Tabla 9.1</strong> (Capítulo 9) para vigas o losas nervadas en una dirección, sin calcular deflexiones, el peralte mínimo se expresa como fracción de la luz libre (L):<br><br>
* Simplemente apoyada: <strong>L/16</strong><br>
* Con un extremo continuo: <strong>L/18,5</strong><br>
* Ambos extremos continuos: <strong>L/21</strong><br>
* En voladizo: <strong>L/8</strong><br><br>
Estos valores aplican para concreto de peso normal y acero con fy = 420 MPa.<br>
<span class="pag">📄 Ver página 66</span>`
  }
];

// Normaliza texto quitando acentos y pasando a minúsculas
function _normalizarFAQ(txt) {
  return txt.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Revisa si la pregunta coincide con alguna FAQ ya preparada
function buscarEnFAQ(pregunta) {
  const preguntaNorm = _normalizarFAQ(pregunta);

  for (const item of FAQ) {
    for (const disparador of item.disparadores) {
      if (preguntaNorm.includes(_normalizarFAQ(disparador))) {
        return item.respuesta;
      }
    }
  }
  return null;
}
