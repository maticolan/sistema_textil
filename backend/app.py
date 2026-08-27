import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
import time

load_dotenv()

app = Flask(__name__)
CORS(app)

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD') or "",
            database=os.getenv('DB_NAME')
        )
        return connection
    except mysql.connector.Error as err:
        print(f"Error de conexión: {err}")
        return None
    
@app.route('/')
def home():
    return jsonify({
        "estado": "exito", 
        "mensaje": "¡Conexión exitosa a la base de datos Textil Rosas! 🎉"
    })

@app.route('/login', methods=['POST'])
def login():
    datos = request.json
    usuario_recibido = datos.get('username')
    password_recibida = datos.get('password')

    conn = get_db_connection()
    if conn and conn.is_connected():
        cursor = conn.cursor(dictionary=True)

        query = "SELECT * FROM usuario WHERE username = %s"
        cursor.execute(query, (usuario_recibido,))
        usuario_db = cursor.fetchone()

        cursor.close()
        conn.close()

        if usuario_db:
            es_password_valido = False

            if usuario_db['tipo'] == 'Admin':
                if check_password_hash(usuario_db['password'], password_recibida):
                    es_password_valido = True
            
            elif usuario_db['tipo'] == 'Trabajadora':
                if password_recibida == usuario_db['usuario_ingreso']:
                    es_password_valido = True
            
            if es_password_valido:
                return jsonify({
                    "estado": "exito",
                    "mensaje": "Login correcto",
                    "nombre": usuario_db['nombre'],
                    "rol": usuario_db['tipo'],
                    "user_id": usuario_db['user_id']
                })
            else:
                return jsonify({
                    "estado": "error",
                    "mensaje": "Contraseña incorrecta"
                }), 401
        else:
            return jsonify({
                "estado": "error",
                "mensaje": "Usuario no encontrado"
            }), 404
    else:
        return jsonify({
            "estado": "error",
            "mensaje": "Error de conexión a la base de datos"
        }), 500 

@app.route('/usuarios', methods=['POST'])
def crear_usuario():
    datos = request.json
    nombre = datos.get('nombre')
    username = datos.get('username')
    tipo = datos.get('tipo')
    usuario_ingreso = datos.get('usuario_ingreso')
    password_recibida = datos.get('password')

    if tipo == 'Admin':
        password_db = generate_password_hash(password_recibida)
    else:
        password_db = 'no_importa'
    
    conn = get_db_connection()
    if conn and conn.is_connected():
        cursor = conn.cursor()
        try:
            query = "INSERT INTO usuario (nombre, username, tipo, usuario_ingreso, password) VALUES (%s, %s, %s, %s, %s)"
            cursor.execute(query, (nombre, username, tipo, usuario_ingreso, password_db))
            conn.commit()
            return jsonify({
                "estado": "exito",
                "mensaje": f"Usuario {username} creado correctamente"
            })
        except mysql.connector.IntegrityError:
            return jsonify({
                "estado": "error",
                "mensaje": "Error: El nombre de usuario o DNI ya existe"
            }), 400
        except Exception as e:
            return jsonify({
                "estado": "error",
                "mensaje": f"Error al crear el usuario: {str(e)}"
            }), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({
            "estado": "error",
            "mensaje": "Error de conexión a la base de datos"
        }), 500

@app.route('/usuarios', methods=['GET'])
def obtener_usuarios():
    conn = get_db_connection()
    if conn and conn.is_connected():
        cursor = conn.cursor(dictionary=True)
        try:
            query = "SELECT user_id, nombre, username, tipo, usuario_ingreso FROM usuario WHERE tipo = 'Trabajadora'"
            cursor.execute(query)
            usuarios = cursor.fetchall()
            return jsonify({
                "estado": "exito",
                "usuarios": usuarios
            })
        except Exception as e:
            return jsonify({
                "estado": "error",
                "mensaje": f"Error al obtener los usuarios: {str(e)}"
            }), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({
            "estado": "error",
            "mensaje": "Error de conexión a la base de datos"
        }), 500

@app.route('/usuarios/<int:user_id>', methods=['PUT'])
def editar_usuario(user_id):
    datos = request.json
    nombre = datos.get('nombre')
    username = datos.get('username')
    usuario_ingreso = datos.get('usuario_ingreso')

    conn = get_db_connection()
    if conn and conn.is_connected():
        cursor = conn.cursor()
        try:
            query = """
                UPDATE usuario
                SET nombre = %s, username = %s, usuario_ingreso = %s
                WHERE user_id = %s AND tipo = 'Trabajadora'
            """
            cursor.execute(query, (nombre, username, usuario_ingreso, user_id))
            conn.commit()

            return jsonify({
                "estado": "exito",
                "mensaje": f"Usuario {username} actualizado correctamente"
            })
        except mysql.connector.IntegrityError:
            return jsonify({
                "estado": "error",
                "mensaje": "Error: El nombre de usuario o DNI ya existe"
            }), 400
        except Exception as e:
            return jsonify({
                "estado": "error",
                "mensaje": f"Error al actualizar el usuario: {str(e)}"
            }), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({
            "estado": "error",
            "mensaje": "Error de conexión a la base de datos"
        }), 500
    
@app.route('/usuarios/<int:user_id>', methods=['DELETE'])
def eliminar_usuario(user_id):
    conn = get_db_connection()
    if conn and conn.is_connected():
        cursor = conn.cursor()
        try:
            query = "DELETE FROM usuario WHERE user_id = %s AND tipo = 'Trabajadora'"
            cursor.execute(query, (user_id,))
            conn.commit()

            if cursor.rowcount > 0:
                return jsonify({
                    "estado": "exito",
                    "mensaje": f"Usuario con ID {user_id} eliminado correctamente"
                })
            else:
                return jsonify({
                    "estado": "error",
                    "mensaje": f"Usuario no encontrado o no es una trabajadora"
                }), 404
        except Exception as e:
            return jsonify({
                "estado": "error",
                "mensaje": f"Error al eliminar el usuario: {str(e)}"
            }), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({
            "estado": "error",
            "mensaje": "Error de conexión a la base de datos"
        }), 500

@app.route('/areas', methods=['GET'])
def obtener_areas():
    conn = get_db_connection()
    if conn and conn.is_connected():
        cursor = conn.cursor(dictionary=True)
        try:
            query = "SELECT area_id, nombre FROM area"
            cursor.execute(query)
            areas = cursor.fetchall()
            return jsonify({
                "estado": "exito",
                "areas": areas
            })
        except Exception as e:
            return jsonify({
                "estado": "error",
                "mensaje": f"Error al obtener las áreas: {str(e)}"
            }), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({
            "estado": "error",
            "mensaje": "Error de conexión a la base de datos"
        }), 500
    
@app.route('/areas', methods=['POST'])
def crear_area():
    data = request.get_json()
    nombre = data.get('nombre')

    if not nombre:
        return jsonify({
            "estado": "error",
            "mensaje": "El nombre del área es requerido"
        }), 400

    conn = get_db_connection()
    if conn and conn.is_connected():
        cursor = conn.cursor()
        try:
            query = "INSERT INTO area (nombre, estado) VALUES (%s, 'Activo')"
            cursor.execute(query, (nombre,))
            conn.commit()

            return jsonify({
                "estado": "exito",
                "mensaje": f"Área '{nombre}' creada correctamente"
            })
        except mysql.connector.IntegrityError:
            return jsonify({
                "estado": "error",
                "mensaje": "Error: Esta área ya existe"
            }), 400
        except Exception as e:
            return jsonify({
                "estado": "error",
                "mensaje": f"Error al crear el área: {str(e)}"
            }), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({
            "estado": "error",
            "mensaje": "Error de conexión a la base de datos"
        }), 500

@app.route('/tipos_prendas', methods=['GET'])
def obtener_tipos_prendas():
    conn = get_db_connection()
    if conn and conn.is_connected():
        cursor = conn.cursor(dictionary=True)
        try:
            query = "SELECT tipo_id, nombre, cod_prefijo FROM tipo_prenda"
            cursor.execute(query)
            tipos = cursor.fetchall()
            return jsonify({
                "estado": "exito",
                "tipos_prendas": tipos
            })
        except Exception as e:
            return jsonify({
                "estado": "error",
                "mensaje": f"Error al obtener los tipos de prendas: {str(e)}"
            }), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({
            "estado": "error",
            "mensaje": "Error de conexión a la base de datos"
        }), 500
    
@app.route('/tipos_prendas', methods=['POST'])
def crear_tipo_prenda():
    data = request.get_json()
    nombre = data.get('nombre')
    cod_prefijo = data.get('cod_prefijo')

    if not nombre or not cod_prefijo:
        return jsonify({
            "estado": "error",
            "mensaje": "El nombre y el código prefijo son requeridos"
        }), 400
    
    conn = get_db_connection()
    if conn and conn.is_connected():
        cursor = conn.cursor()
        try:
            query = "INSERT INTO tipo_prenda (nombre, cod_prefijo) VALUES (%s, %s)"
            cursor.execute(query, (nombre, cod_prefijo))
            conn.commit()

            return jsonify({
                "estado": "exito",
                "mensaje": f"Tipo de prenda '{nombre}' creado correctamente"
            })
        except mysql.connector.IntegrityError:
            return jsonify({
                "estado": "error",
                "mensaje": "Error: El nombre o prefijo ya existen"
            }), 400
        except Exception as e:
            return jsonify({
                "estado": "error",
                "mensaje": f"Error al crear el tipo de prenda: {str(e)}"
            }), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({
            "estado": "error",
            "mensaje": "Error de conexión a la base de datos"
        }), 500

@app.route('/modelos_prendas', methods=['GET'])
def obtener_modelos_prendas():
    conn = get_db_connection()
    if conn and conn.is_connected():
        cursor = conn.cursor(dictionary=True)
        try:
            query = """
                SELECT m.modelo_id, m.nombre AS modelo_nombre, m.tipo_id, t.nombre AS tipo_nombre
                FROM modelo_prenda m
                JOIN tipo_prenda t ON m.tipo_id = t.tipo_id
            """
            cursor.execute(query)
            modelos = cursor.fetchall()
            return jsonify({
                "estado": "exito",
                "modelos_prendas": modelos
            })
        except Exception as e:
            return jsonify({
                "estado": "error",
                "mensaje": f"Error al obtener los modelos: {str(e)}"
            }), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({
            "estado": "error",
            "mensaje": "Error de conexión a la base de datos"
        }), 500
    
@app.route('/modelos_prendas', methods=['POST'])
def crear_modelo_prenda():
    data = request.get_json()
    nombre = data.get('nombre')
    tipo_id = data.get('tipo_id')

    if not nombre or not tipo_id:
        return jsonify({
            "estado": "error",
            "mensaje": "El nombre y el tipo de prenda son requeridos"
        }), 400
    
    conn = get_db_connection()
    if conn and conn.is_connected():
        cursor = conn.cursor()
        try:
            query = "INSERT INTO modelo_prenda (nombre, tipo_id) VALUES (%s, %s)"
            cursor.execute(query, (nombre, tipo_id))
            conn.commit()

            return jsonify({
                "estado": "exito",
                "mensaje": f"Modelo '{nombre}' creado correctamente"
            })
        except mysql.connector.IntegrityError:
            return jsonify({
                "estado": "error",
                "mensaje": "Error: Ya existe un modelo con ese nombre"
            }), 400
        except Exception as e:
            return jsonify({
                "estado": "error",
                "mensaje": f"Error al crear el modelo: {str(e)}"
            }), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({
            "estado": "error",
            "mensaje": "Error de conexión a la base de datos"
        }), 500

@app.route('/combinaciones_prendas', methods=['GET'])
def obtener_combinaciones_prendas():
    conn = get_db_connection()
    if conn and conn.is_connected():
        cursor = conn.cursor(dictionary=True)
        try:
            query = """
                SELECT c.combina_id AS combinacion_id, c.nombre AS nombre, c.modelo_id, 
                       m.nombre AS modelo_nombre, t.nombre AS tipo_nombre, t.cod_prefijo
                FROM combinacion_prenda c
                JOIN modelo_prenda m ON c.modelo_id = m.modelo_id
                JOIN tipo_prenda t ON m.tipo_id = t.tipo_id
            """
            cursor.execute(query)
            combinaciones = cursor.fetchall()
            return jsonify({
                "estado": "exito",
                "combinaciones_prendas": combinaciones
            })
        except Exception as e:
            return jsonify({
                "estado": "error",
                "mensaje": f"Error al obtener las combinaciones: {str(e)}"
            }), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({
            "estado": "error",
            "mensaje": "Error de conexión a la base de datos"
        }), 500
    
@app.route('/combinaciones_prendas', methods=['POST'])
def crear_combinacion_prenda():
    data = request.get_json()
    nombre = data.get('nombre')
    modelo_id = data.get('modelo_id')

    if not nombre or not modelo_id:
        return jsonify({
            "estado": "error",
            "mensaje": "Todos los campos son requeridos"
        }), 400
    
    conn = get_db_connection()
    if conn and conn.is_connected():
        cursor = conn.cursor()
        try:
            query = "INSERT INTO combinacion_prenda (nombre, modelo_id) VALUES (%s, %s)"
            cursor.execute(query, (nombre, modelo_id))
            conn.commit()

            return jsonify({
                "estado": "exito",
                "mensaje": f"Combinación '{nombre}' creada correctamente"
            })
        except mysql.connector.IntegrityError:
            return jsonify({
                "estado": "error",
                "mensaje": "Error: Ya existe este código para este modelo específico"
            }), 400
        except Exception as e:
            return jsonify({
                "estado": "error",
                "mensaje": f"Error al crear la combinación: {str(e)}"
            }), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({
            "estado": "error", 
            "mensaje": "Error de conexión a la base de datos"
        }), 500

@app.route('/lotes_activos', methods=['GET'])
def obtener_lotes_activos():
    conn = get_db_connection()
    if conn and conn.is_connected():
        cursor = conn.cursor(dictionary=True)
        try:
            query = """
                SELECT l.lote_id, l.codigo, l.cantidad_solici, l.cantidad_despa,
                    c.nombre AS combinacion_nombre, m.nombre AS modelo_nombre, t.nombre AS tipo_nombre
                FROM lote l
                JOIN combinacion_prenda c ON l.combina_id = c.combina_id
                JOIN modelo_prenda m ON c.modelo_id = m.modelo_id
                JOIN tipo_prenda t ON m.tipo_id = t.tipo_id
                WHERE l.estado = 'Activo'
            """
            cursor.execute(query)
            lotes = cursor.fetchall()
            return jsonify({
                "estado": "exito",
                "lotes_activos": lotes
            })
        except Exception as e:
            return jsonify({
                "estado": "error",
                "mensaje": f"Error al obtener los lotes activos: {str(e)}"
            }), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({
            "estado": "error",
            "mensaje": "Error de conexión a la base de datos"
        }), 500
    
@app.route('/registro_produccion', methods=['POST'])
def registrar_produccion():
    try:
        data = request.get_json()
        numero_tarjeta = data.get('numero_tarjeta')
        combinacion_id = data.get('combinacion_id')
        area_id = data.get('area_id')
        user_id = data.get('user_id')
        cantidad_aprob = data.get('cantidad_aprob', 0)
        cantidad_recha = data.get('cantidad_recha', 0)
        es_remetido = data.get('es_remetido', False)

        conn = get_db_connection()
        if conn and conn.is_connected():
            cursor = conn.cursor()
            
            # Verificar si el área es Tejido
            cursor.execute("SELECT nombre FROM area WHERE area_id = %s", (area_id,))
            area_row = cursor.fetchone()
            es_tejido = area_row and 'tejido' in area_row[0].lower()

            # Autogenerar número de tarjeta para tejido si no viene especificado
            if not numero_tarjeta:
                if es_tejido:
                    numero_tarjeta = f"T-{int(time.time())}"
                else:
                    return jsonify({
                        "estado": "error",
                        "mensaje": "El número de tarjeta es obligatorio para esta área"
                    }), 400

            # 1. Verificar o crear el lote
            cursor.execute("SELECT lote_id FROM lote WHERE codigo = %s", (numero_tarjeta,))
            lote_existente = cursor.fetchone()

            if lote_existente:
                lote_id = lote_existente[0]
            else:
                cursor.execute("SELECT orden_id FROM orden_produccion WHERE estado = 'Activo' LIMIT 1")
                orden_info = cursor.fetchone()
                orden_activa_id = orden_info[0] if orden_info else 1

                cursor.execute("""
                    INSERT INTO lote (orden_id, combina_id, cantidad_solici, cantidad_despa, codigo, estado) 
                    VALUES (%s, %s, 0, 0, %s, 'Activo')
                """, (orden_activa_id, combinacion_id, numero_tarjeta))
                lote_id = cursor.lastrowid

            # 2. Insertar el registro de producción
            cursor.execute("""
                INSERT INTO registro_prod (lote_id, area_id, user_id, fecha_hora, cantidad_aprob, cantidad_recha) 
                VALUES (%s, %s, %s, NOW(), %s, %s)
            """, (lote_id, area_id, user_id, cantidad_aprob, cantidad_recha))
            
            conn.commit()
            
            mensaje_exito = f"Remetido registrado (Tarjeta: {numero_tarjeta})" if es_remetido else f"Producción registrada: {cantidad_aprob} un. (Tarjeta: {numero_tarjeta})"
            
            return jsonify({
                "estado": "exito",
                "mensaje": mensaje_exito
            }), 200

    except Exception as e:
        if 'conn' in locals() and conn.is_connected():
            conn.rollback()
        return jsonify({
            "estado": "error",
            "mensaje": f"Error: {str(e)}"
        }), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()
    
@app.route('/orden_anual', methods=['POST'])
def crear_orden_anual():
    data = request.get_json()
    combinacion_id = data.get('combinacion_id')
    cantidad = data.get('cantidad')

    if not combinacion_id or not cantidad:
        return jsonify({
            "estado": "error",
            "mensaje": "La combinación y la cantidad son requeridas"
        }), 400
    
    conn = get_db_connection()
    if conn and conn.is_connected():
        cursor = conn.cursor()
        try:
            # Lógica para insertar o actualizar la meta anual
            query = """
                INSERT INTO orden_anual (combina_id, cantidad, anio) 
                VALUES (%s, %s, YEAR(CURDATE()))
                ON DUPLICATE KEY UPDATE cantidad = %s
            """
            cursor.execute(query, (combinacion_id, cantidad, cantidad))
            conn.commit()

            return jsonify({
                "estado": "exito",
                "mensaje": "Meta anual fijada correctamente"
            })
        except Exception as e:
            return jsonify({
                "estado": "error",
                "mensaje": f"Error al fijar la meta: {str(e)}"
            }), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({
            "estado": "error",
            "mensaje": "Error de conexión a la base de datos"
        }), 500

@app.route('/dashboard', methods=['GET'])
def obtener_dashboard():
    conn = get_db_connection()
    if conn and conn.is_connected():
        cursor = conn.cursor(dictionary=True)
        try:
            # 1. Producción Diaria (Tejido) - Solo lo de hoy
            query_tejido_hoy = """
                SELECT COALESCE(SUM(rp.cantidad_aprob), 0) AS total_tejido_hoy
                FROM registro_prod rp
                JOIN area a ON rp.area_id = a.area_id
                WHERE a.nombre LIKE '%Tejido%' AND DATE(rp.fecha_hora) = CURDATE()
            """
            cursor.execute(query_tejido_hoy)
            tejido_hoy = cursor.fetchone()['total_tejido_hoy']

            # 2. Avance Semanal (Planta) - Últimos 7 días agrupado por área
            query_semanal = """
                SELECT a.nombre AS area, COALESCE(SUM(rp.cantidad_aprob), 0) AS total
                FROM registro_prod rp
                JOIN area a ON rp.area_id = a.area_id
                WHERE DATE(rp.fecha_hora) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                GROUP BY a.nombre
            """
            cursor.execute(query_semanal)
            avance_semanal = cursor.fetchall()

            # 3. Rendimiento por Trabajadora (Aprobadas vs Rechazadas)
            query_trabajadoras = """
                SELECT u.nombre AS trabajadora, 
                       COALESCE(SUM(rp.cantidad_aprob), 0) AS aprobadas, 
                       COALESCE(SUM(rp.cantidad_recha), 0) AS rechazadas
                FROM registro_prod rp
                JOIN usuario u ON rp.user_id = u.user_id
                GROUP BY u.nombre
                ORDER BY aprobadas DESC
            """
            cursor.execute(query_trabajadoras)
            rendimiento_trabajadoras = cursor.fetchall()

            return jsonify({
                "estado": "exito",
                "data": {
                    "tejido_hoy": int(tejido_hoy),
                    "avance_semanal": avance_semanal,
                    "rendimiento_trabajadoras": rendimiento_trabajadoras
                }
            })
        except Exception as e:
            return jsonify({
                "estado": "error",
                "mensaje": f"Error al obtener datos del dashboard: {str(e)}"
            }), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({
            "estado": "error",
            "mensaje": "Error de conexión a la base de datos"
        }), 500

@app.route('/orden_anual', methods=['GET'])
def obtener_ordenes_anuales():
    conn = get_db_connection()
    if conn and conn.is_connected():
        cursor = conn.cursor(dictionary=True)
        try:
            # Traemos la orden con el nombre de la combinación
            query = """
                SELECT o.anio, o.cantidad, c.nombre AS combinacion_nombre
                FROM orden_anual o
                JOIN combinacion_prenda c ON o.combina_id = c.combina_id
                ORDER BY o.anio DESC, c.nombre ASC
            """
            cursor.execute(query)
            ordenes = cursor.fetchall()
            return jsonify({
                "estado": "exito",
                "ordenes_anuales": ordenes
            })
        except Exception as e:
            return jsonify({
                "estado": "error",
                "mensaje": f"Error al obtener las metas anuales: {str(e)}"
            }), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({
            "estado": "error",
            "mensaje": "Error de conexión a la base de datos"
        }), 500

@app.route('/orden_activa_detalle', methods=['POST'])
def crear_detalle_orden():
    data = request.get_json()
    metas = data.get('metas') 
    orden_id = data.get('orden_id') # <--- RECIBIMOS EL ID DE LA ORDEN

    if not metas or not isinstance(metas, list):
        return jsonify({"estado": "error", "mensaje": "Se requiere una lista de metas válida"}), 400
    
    if not orden_id:
        return jsonify({"estado": "error", "mensaje": "Debe seleccionar una orden activa"}), 400
    
    conn = get_db_connection()
    if conn and conn.is_connected():
        cursor = conn.cursor(dictionary=True)
        try:
            # 2. Procesar las metas guardándolas en "lote" asociadas a la orden elegida
            for meta in metas:
                comb_id = meta.get('combinacion_id')
                cantidad = meta.get('cantidad')
                if comb_id and cantidad:
                    cursor.execute("SELECT lote_id FROM lote WHERE orden_id = %s AND combina_id = %s", (orden_id, comb_id))
                    lote_existente = cursor.fetchone()
                    
                    if lote_existente:
                        cursor.execute("UPDATE lote SET cantidad_solici = %s WHERE lote_id = %s", (cantidad, lote_existente['lote_id']))
                    else:
                        codigo_meta = f"META-O{orden_id}-C{comb_id}"
                        cursor.execute("""
                            INSERT INTO lote (orden_id, combina_id, cantidad_solici, cantidad_despa, codigo, estado) 
                            VALUES (%s, %s, %s, 0, %s, 'Activo')
                        """, (orden_id, comb_id, cantidad, codigo_meta))
            
            conn.commit()
            return jsonify({"estado": "exito", "mensaje": f"{len(metas)} metas asignadas correctamente"})
        except Exception as e:
            conn.rollback() 
            return jsonify({"estado": "error", "mensaje": f"Error: {str(e)}"}), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({"estado": "error", "mensaje": "Error de conexión"}), 500
    
@app.route('/orden_activa_detalle', methods=['GET'])
def obtener_detalles_orden():
    conn = get_db_connection()
    if conn and conn.is_connected():
        cursor = conn.cursor(dictionary=True)
        try:
            # 1. Obtener TODAS las órdenes activas (removido el LIMIT 1)
            cursor.execute("SELECT orden_id, numero_orden, anio FROM orden_produccion WHERE estado = 'Activo'")
            ordenes_info = cursor.fetchall()

            if not ordenes_info:
                return jsonify({"estado": "error", "mensaje": "No hay órdenes activas"}), 404

            # 2. Obtener los detalles de todas las órdenes activas
            query = """
                SELECT op.orden_id, op.numero_orden, op.anio, l.cantidad_solici AS cantidad, 
                       CONCAT(t.cod_prefijo, m.nombre, '-', c.nombre) AS combinacion_nombre
                FROM lote l
                JOIN orden_produccion op ON l.orden_id = op.orden_id
                JOIN combinacion_prenda c ON l.combina_id = c.combina_id
                JOIN modelo_prenda m ON c.modelo_id = m.modelo_id
                JOIN tipo_prenda t ON m.tipo_id = t.tipo_id
                WHERE op.estado = 'Activo'
                ORDER BY op.numero_orden ASC, t.cod_prefijo ASC, m.nombre ASC, c.nombre ASC
            """
            cursor.execute(query)
            detalles = cursor.fetchall()
            
            return jsonify({
                "estado": "exito", 
                "ordenes_activas": ordenes_info,
                "detalles_orden": detalles
            })
        except Exception as e:
            return jsonify({"estado": "error", "mensaje": f"Error: {str(e)}"}), 500
        finally:
            cursor.close()
            conn.close()
    return jsonify({"estado": "error", "mensaje": "Error de conexión"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)