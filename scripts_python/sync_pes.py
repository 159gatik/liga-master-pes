import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
import os

# 1. Inicialización de Firebase
cred = credentials.Certificate("scripts_python/serviceAccountKey.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

def sincronizar_por_id_directo(carpeta_plantillas):
    print(f"🚀 Iniciando sincronización desde: {carpeta_plantillas}")
    
    # Listar archivos .csv en la subcarpeta específica
    if not os.path.exists(carpeta_plantillas):
        print(f"❌ La carpeta {carpeta_plantillas} no existe.")
        return

    archivos = [f for f in os.listdir(carpeta_plantillas) if f.endswith('.csv')]
    
    if not archivos:
        print("⚠️ No se encontraron archivos CSV en esta carpeta.")
        return

    for archivo in archivos:
        id_equipo = archivo.replace('.csv', '')
        ruta_completa = os.path.join(carpeta_plantillas, archivo)
        
        print(f"\n🔄 Procesando ID: {id_equipo}")
        
        try:
            # Referencias
            equipo_ref = db.collection('equipos').document(id_equipo)
            
            if not equipo_ref.get().exists:
                print(f"⚠️ El ID '{id_equipo}' no existe en la colección 'equipos'.")
                continue

            # Leer CSV
            df = pd.read_csv(ruta_completa)
            plantilla_ref = equipo_ref.collection('plantilla')

            # Limpiar plantilla vieja (Batch delete)
            batch = db.batch()
            docs = plantilla_ref.stream()
            for doc in docs:
                batch.delete(doc.reference)
            batch.commit()

            # Subir nuevos jugadores
            valor_total = 0
            for _, row in df.iterrows():
                jugador_data = {
                    "nombre": str(row['nombre']),
                    "pos": str(row['pos']).upper(),
                    "edad": int(row['edad']),
                    "dorsal": int(row['dorsal']),
                    "valor": int(row['valor'])
                }
                plantilla_ref.add(jugador_data)
                valor_total += jugador_data['valor']

            # Actualizar el valor de la plantilla en el documento del club
            equipo_ref.update({
                "valor_plantilla": valor_total,
                "division": "B" # Opcional: Esto ayuda a filtrar en el frontend
            })
            print(f"✅ Sincronizado con éxito. Valor Total: ${valor_total:,}")

        except Exception as e:
            print(f"❌ Error en {archivo}: {e}")

# --- EJECUCIÓN ---
# Para subir la División A usarías: 'scripts_python/plantillas/div_a'
# Para subir la División B usas:
sincronizar_por_id_directo('scripts_python/plantillas/div_b')