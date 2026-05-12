import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
from datetime import datetime

# Inicialización
cred = credentials.Certificate("scripts_python/serviceAccountKey.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

def cargar_jugadores_libres(ruta_csv):
    df = pd.read_csv(ruta_csv)
    col_ref = db.collection('jugadores_libres')
    
    print(f"🚀 Subiendo {len(df)} jugadores al mercado de libres...")

    for _, row in df.iterrows():
        jugador_data = {
            "nombre": str(row['nombre']),
            "pos": str(row['pos']).upper(),
            "exEquipo": str(row['exEquipo']),
            "valor": int(row['valor']),
            "tipo": str(row['tipo']),
            "fechaLiberacion": firestore.SERVER_TIMESTAMP # Esto pone la hora actual
        }
        col_ref.add(jugador_data)
        print(f"✅ Añadido: {jugador_data['nombre']}")

# Ejecución
cargar_jugadores_libres('scripts_python/libres.csv')