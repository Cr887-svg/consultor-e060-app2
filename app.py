from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
from pypdf import PdfReader
import os

app = Flask(__name__)

# ============================================================
# 1) LEER LA CLAVE API
#    - En Render: la toma de una variable de entorno segura (GEMINI_API_KEY)
#    - En tu PC: si no existe esa variable, la lee del archivo CLAVE API.txt
# ============================================================
API_KEY = os.environ.get("GEMINI_API_KEY")

if not API_KEY:
    RUTA_CLAVE = os.path.join(os.path.dirname(__file__), "CLAVE API.txt")
    with open(RUTA_CLAVE, "r", encoding="utf-8") as f:
        API_KEY = f.read().strip()

genai.configure(api_key=API_KEY)
modelo = genai.GenerativeModel("gemini-flash-latest")

# ============================================================
# 2) LEER EL PDF DE LA NORMA E.060 UNA SOLA VEZ AL INICIAR
#    (queda en memoria, no se vuelve a leer en cada pregunta)
# ============================================================
RUTA_NORMA = os.path.join(
    os.path.dirname(__file__),
    "55 E.060 CONCRETO ARMADO DS N° 010-2009.pdf"
)

def cargar_texto_pdf(ruta):
    texto_completo = ""
    try:
        lector = PdfReader(ruta)
        for i, pagina in enumerate(lector.pages, start=1):
            texto = pagina.extract_text() or ""
            texto_completo += f"\n[PÁGINA {i}]\n{texto}"
        print(f"✅ PDF cargado correctamente: {len(lector.pages)} páginas")
    except Exception as e:
        print(f"⚠️ No se pudo leer el PDF: {e}")
    return texto_completo

TEXTO_NORMA = cargar_texto_pdf(RUTA_NORMA)

# Si el PDF es muy largo, lo recortamos para no exceder límites del modelo
MAX_CARACTERES = 900_000
if len(TEXTO_NORMA) > MAX_CARACTERES:
    TEXTO_NORMA = TEXTO_NORMA[:MAX_CARACTERES]

# ============================================================
# 3) RUTA PRINCIPAL - sirve la página
# ============================================================
@app.route('/')
def index():
    return render_template('index.html')

# ============================================================
# 4) RUTA /consultar - recibe la pregunta y responde con IA
# ============================================================
@app.route('/consultar', methods=['POST'])
def consultar():
    data = request.get_json(silent=True) or {}
    pregunta = (data.get('pregunta') or "").strip()

    if not pregunta:
        return jsonify({"respuesta": "Por favor escribe una pregunta."})

    prompt = f"""
Eres un consultor experto en la Norma Técnica Peruana E.060 - Concreto Armado.
Responde SIEMPRE basándote en el siguiente texto oficial de la norma (extraído del PDF).
Si la respuesta está en el texto, cita la página así: (Ver página X).
Si algo cumple o no cumple una condición que el usuario menciona, usa exactamente
las palabras CUMPLE, NO CUMPLE o ALERTA en mayúsculas donde corresponda.
Responde en español, de forma clara y directa, sin inventar datos que no estén en la norma.

--- TEXTO DE LA NORMA E.060 ---
{TEXTO_NORMA}
--- FIN DEL TEXTO ---

Pregunta del usuario: {pregunta}
"""

    try:
        respuesta_ia = modelo.generate_content(prompt)
        texto_respuesta = respuesta_ia.text
    except Exception as e:
        texto_respuesta = f"⚠️ Ocurrió un error al consultar la IA: {e}"

    return jsonify({"respuesta": texto_respuesta})

# ============================================================
if __name__ == '__main__':
    puerto = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=puerto)
