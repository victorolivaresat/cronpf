# 🔥 Configuración de Firebase

## 📋 Pasos para Configurar Firebase

### 1. Crear un proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto" o selecciona un proyecto existente
3. Sigue el asistente de configuración

### 2. Habilitar Authentication

1. En tu proyecto de Firebase, ve a **Authentication**
2. Haz clic en **Comenzar**
3. En la pestaña **Sign-in method**, habilita:
   - ✅ **Correo electrónico/contraseña**

### 3. Configurar Realtime Database

1. Ve a **Realtime Database**
2. Haz clic en **Crear base de datos**
3. Selecciona una ubicación (recomendado: us-central1)
4. Comienza en **modo de prueba** por ahora
5. Actualiza las reglas de seguridad según sea necesario

### 4. Obtener la configuración de tu app

1. Ve a **Configuración del proyecto** (ícono de engranaje ⚙️)
2. En la pestaña **General**, desplázate hasta **Tus apps**
3. Si no tienes una app web, haz clic en **Agregar app** y selecciona **Web** 🌐
4. Registra tu app con un nombre (ej: "CronPF Web App")
5. Copia los valores de configuración

### 5. Crear archivo de variables de entorno

1. Duplica el archivo `.env.local.example` y renómbralo a `.env.local`
2. Reemplaza los valores con los de tu configuración de Firebase:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://tu-proyecto-default-rtdb.firebaseio.com/
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

### 6. Reiniciar el servidor de desarrollo

```bash
npm run dev
```

## 🛡️ Configuración de Seguridad (Realtime Database)

Una vez que tengas usuarios registrados, actualiza las reglas de la Realtime Database:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "projects": {
      "$projectId": {
        ".read": "auth != null && (data.child('ownerId').val() === auth.uid || data.child('members').child(auth.uid).exists())",
        ".write": "auth != null && (data.child('ownerId').val() === auth.uid || data.child('members').child(auth.uid).exists())"
      }
    }
  }
}
```

## ❗ Problemas Comunes

### API Key Not Valid
- ✅ Verifica que copiaste correctamente la API key
- ✅ Asegúrate de que el archivo `.env.local` esté en la raíz del proyecto
- ✅ Reinicia el servidor de desarrollo después de crear el archivo

### Auth Domain Error
- ✅ Verifica que el authDomain termine en `.firebaseapp.com`
- ✅ No incluyas `https://` en el authDomain

### Database URL Error
- ✅ Verifica que la URL termine en `.firebaseio.com/`
- ✅ Incluye `https://` al inicio
- ✅ Incluye la `/` al final

## 📞 Soporte

Si sigues teniendo problemas:
1. Verifica que todas las variables de entorno estén configuradas
2. Comprueba que los servicios estén habilitados en Firebase Console
3. Revisa la consola del navegador para errores adicionales