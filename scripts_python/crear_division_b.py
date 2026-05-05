import firebase_admin
from firebase_admin import credentials, firestore

# Mantenemos la ruta que ya usás
cred = credentials.Certificate("scripts_python/serviceAccountKey.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

equipos_b = ["Nombre 1", "Nombre 2", "Nombre 3", "Nombre 4", "Nombre 5", 
             "Nombre 6", "Nombre 7", "Nombre 8", "Nombre 9", "Nombre 10"]

def crear_equipos():
    for nombre in equipos_b:
        nuevo_equipo = {
            "dt": "Libre", 
            "dtUid": None, 
            "escudo": "/img/escudos/default.jpg",
             "estado": "Libre", 
             "pj": 0, "pg": 0, "pe": 0, "pp": 0, # Estadísticas de liga
            "gf": 0, "gc": 0,  
            "nombre": nombre,
           "grupo": "A",
            "division": "B",       
            "juego": "pes6",
             "presupuesto": 250000000,
            "puntos": 0,
             "valor_plantilla": 0  
        }
        # Guardamos y obtenemos el ID generado
        _, doc_ref = db.collection('equipos').add(nuevo_equipo)
        print(f"✅ Creado: {nombre} - ID: {doc_ref.id}")

crear_equipos()