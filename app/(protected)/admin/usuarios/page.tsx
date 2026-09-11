'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface UsuarioAutorizado {
  id: string
  email: string
  nombre: string | null
  rol: string
  activo: boolean
  createdAt: string
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioAutorizado[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')
  const [rol, setRol] = useState('usuario')
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const cargarUsuarios = async () => {
    try {
      const res = await fetch('/api/admin/usuarios')
      if (res.ok) {
        const data = await res.json()
        setUsuarios(data)
      }
    } catch (error) {
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const agregarUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Email es requerido')
      return
    }

    setIsAdding(true)
    try {
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nombre, rol }),
      })

      if (res.ok) {
        toast.success('Usuario agregado')
        setEmail('')
        setNombre('')
        setRol('usuario')
        cargarUsuarios()
      } else {
        const error = await res.json()
        toast.error(error.message || 'Error al agregar usuario')
      }
    } catch (error) {
      toast.error('Error al agregar usuario')
    } finally {
      setIsAdding(false)
    }
  }

  const desactivarUsuario = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/usuarios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: false }),
      })

      if (res.ok) {
        toast.success('Usuario desactivado')
        cargarUsuarios()
      } else {
        toast.error('Error al desactivar usuario')
      }
    } catch (error) {
      toast.error('Error al desactivar usuario')
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">👥 Gestionar Usuarios Autorizados</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario para agregar usuario */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Agregar Usuario</h2>
          <form onSubmit={agregarUsuario} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="usuario@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre para Mostrar
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre del usuario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="usuario">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isAdding}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              {isAdding ? 'Agregando...' : 'Agregar Usuario'}
            </button>
          </form>
        </div>

        {/* Lista de usuarios */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Usuarios Autorizados ({usuarios.length})
          </h2>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {usuarios.length === 0 ? (
              <p className="text-gray-600 text-sm">No hay usuarios agregados aún</p>
            ) : (
              usuarios.map((usuario) => (
                <div
                  key={usuario.id}
                  className={`p-3 rounded-lg border ${
                    usuario.activo
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {usuario.nombre || usuario.email}
                      </p>
                      <p className="text-xs text-gray-600">{usuario.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Rol: <span className="font-medium">{usuario.rol}</span>
                      </p>
                    </div>
                    {usuario.activo && (
                      <button
                        onClick={() => desactivarUsuario(usuario.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Desactivar
                      </button>
                    )}
                  </div>
                  {!usuario.activo && (
                    <p className="text-xs text-red-600 font-medium">DESACTIVADO</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
