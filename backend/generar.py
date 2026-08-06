from werkzeug.security import generate_password_hash

hash_real = generate_password_hash("admin123")
print("Copia este texto largo:")
print(hash_real)