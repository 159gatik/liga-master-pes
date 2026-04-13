import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
import os

# 1. Rutas corregidas
cred = credentials.Certificate("scripts_python/serviceAccountKey.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

def sincronizar_por_id_directo(carpeta_plantillas):
    print("🚀 Iniciando sincronización por ID de documento...")
    
    # Listar archivos .csv
    archivos = [f for f in os.listdir(carpeta_plantillas) if f.endswith('.csv')]
    
    for archivo in archivos:
        # El ID es el nombre del archivo: 'HEQURpQsdS52vvXcL5Gg'
        id_equipo = archivo.replace('.csv', '')
        ruta_completa = os.path.join(carpeta_plantillas, archivo)
        
        print(f"\n🔄 Procesando ID: {id_equipo}")
        
        try:
            # Referencias
            equipo_ref = db.collection('equipos').document(id_equipo)
            
            # Verificar si el documento existe antes de seguir
            if not equipo_ref.get().exists:
                print(f"⚠️ El ID '{id_equipo}' no existe en Firebase. Revisá el nombre del archivo.")
                continue

            # Leer CSV
            df = pd.read_csv(ruta_completa)
            plantilla_ref = equipo_ref.collection('plantilla')

            # Limpiar plantilla vieja
            batch = db.batch()
            for doc in plantilla_ref.stream():
                batch.delete(doc.reference)
            batch.commit()

            # Subir nuevos
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

            # Actualizar presupuesto del club
            equipo_ref.update({"valor_plantilla": valor_total})
            print(f"✅ Sincronizado con éxito. Valor Total: ${valor_total:,}")

        except Exception as e:
            print(f"❌ Error en {archivo}: {e}")

# --- EJECUCIÓN ---
sincronizar_por_id_directo('scripts_python/plantillas')