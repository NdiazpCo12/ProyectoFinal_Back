# 🔧 **Problema de Routing - Solución**

## ❌ **Problema Identificado**

Los botones "View Details" y "Edit" en la lista de challenges redirigen al dashboard porque **faltan las rutas** en `App.tsx`.

### **Rutas Definidas Actualmente:**
```tsx
<Route path="/challenges" element={<ChallengeList />} />
```

### **Rutas Faltantes (que necesitan los botones):**
```tsx
<Route path="/challenges/:id" element={<ChallengeDetail />} />
<Route path="/challenges/:id/edit" element={<ChallengeEdit />} />
<Route path="/challenges/new" element={<ChallengeForm />} />
```

## ✅ **Solución - Actualizar App.tsx**

### **Archivo:** `frontend/src/App.tsx`

**Agregar estas importaciones:**
```tsx
import ChallengeDetail from './pages/challenges/ChallengeDetail'
import ChallengeEdit from './pages/challenges/ChallengeEdit'
import ChallengeForm from './pages/challenges/ChallengeForm'
```

**Agregar estas rutas dentro de las "Protected routes":**
```tsx
<Route
  path="/challenges/:id"
  element={
    <ProtectedRoute>
      <ChallengeDetail />
    </ProtectedRoute>
  }
/>

<Route
  path="/challenges/:id/edit"
  element={
    <ProtectedRoute>
      <ChallengeEdit />
    </ProtectedRoute>
  }
/>

<Route
  path="/challenges/new"
  element={
    <ProtectedRoute>
      <ChallengeForm />
    </ProtectedRoute>
  }
/>
```

## 📋 **Código Completo para App.tsx**

```tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/shared/ProtectedRoute'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/dashboard/Dashboard'
import ChallengeList from './pages/challenges/ChallengeList'
import ChallengeDetail from './pages/challenges/ChallengeDetail'
import ChallengeEdit from './pages/challenges/ChallengeEdit'
import ChallengeForm from './pages/challenges/ChallengeForm'
import './App.css'

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/challenges"
        element={
          <ProtectedRoute>
            <ChallengeList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/challenges/:id"
        element={
          <ProtectedRoute>
            <ChallengeDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/challenges/:id/edit"
        element={
          <ProtectedRoute>
            <ChallengeEdit />
          </ProtectedRoute>
        }
      />

      <Route
        path="/challenges/new"
        element={
          <ProtectedRoute>
            <ChallengeForm />
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
```

## ✅ **Verificación**

Después de aplicar estos cambios:

1. **"View Details"** → Debería ir a `/challenges/:id` y mostrar `ChallengeDetail`
2. **"Edit"** → Debería ir a `/challenges/:id/edit` y mostrar `ChallengeEdit`
3. **"Create Challenge"** → Debería ir a `/challenges/new` y mostrar `ChallengeForm`

## 📝 **Nota**

Asegúrate de que los componentes `ChallengeDetail`, `ChallengeEdit`, y `ChallengeForm` estén implementados y exportados correctamente desde sus respectivos archivos.