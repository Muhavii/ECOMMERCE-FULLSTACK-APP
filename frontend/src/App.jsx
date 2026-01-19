import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [authMode, setAuthMode] = useState('login') // 'login' or 'signup'
  const [adminProductForm, setAdminProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    discount: ''
  })
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    fullName: '',
    phoneNumber: '',
    address: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [adminOrders, setAdminOrders] = useState([])

  useEffect(() => {
    if (currentPage === 'products') {
      fetchProducts()
    } else if (currentPage === 'orders') {
      fetchOrders()
    } else if (currentPage === 'admin') {
      fetchAdminOrders()
      fetchProducts()
    }
  }, [currentPage])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('${API_URL}/api/products')
      const data = await response.json()
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    }
    setLoading(false)
  }

  const fetchAdminOrders = async () => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
      const response = await fetch('${API_URL}/api/admin/orders', { headers })
      const data = await response.json()
      setAdminOrders(data || [])
    } catch (error) {
      console.error('Error fetching admin orders:', error)
      setAdminOrders([])
    }
  }

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
      const response = await fetch('${API_URL}/api/orders', { headers })
      const data = await response.json()
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    }
    setLoading(false)
  }

  const handleAdminProductChange = (e) => {
    const { name, value } = e.target
    setAdminProductForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('${API_URL}/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: adminProductForm.name,
          description: adminProductForm.description,
          price: parseFloat(adminProductForm.price),
          stock: parseInt(adminProductForm.stock),
          discount: adminProductForm.discount ? parseInt(adminProductForm.discount) : 0
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Product added successfully!')
        setAdminProductForm({ name: '', description: '', price: '', stock: '', discount: '' })
        fetchProducts()
        setTimeout(() => setSuccess(''), 2000)
      } else {
        setError(data.message || 'Failed to add product')
      }
    } catch (error) {
      setError('Error adding product: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        setSuccess('Order status updated!')
        fetchAdminOrders()
        setTimeout(() => setSuccess(''), 2000)
      } else {
        setError('Failed to update order status')
      }
    } catch (error) {
      setError('Error updating order: ' + error.message)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('${API_URL}/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setToken(data.token)
        localStorage.setItem('token', data.token)
        setUser(data)
        setSuccess('Login successful!')
        setFormData({ email: '', password: '', username: '', fullName: '', phoneNumber: '', address: '' })
        setTimeout(() => {
          setCurrentPage('home')
          setSuccess('')
        }, 1500)
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (error) {
      setError('Error logging in: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('${API_URL}/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          address: formData.address
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Signup successful! You can now login.')
        setFormData({ email: '', password: '', username: '', fullName: '', phoneNumber: '', address: '' })
        setTimeout(() => {
          setAuthMode('login')
          setSuccess('')
        }, 1500)
      } else {
        setError(data.message || 'Signup failed')
      }
    } catch (error) {
      setError('Error signing up: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    setCurrentPage('home')
  }

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id)
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ))
    }
  }

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Navbar with gradient and animation */}
      <nav className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 shadow-2xl sticky top-0 z-50 backdrop-blur-lg bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-2xl">🛍️</span>
                </div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">ShopVibe</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {token ? (
                <>
                  <div className="text-white text-sm font-semibold">
                    {user?.email || 'User'}
                  </div>
                  {user?.role === 'ADMIN' && (
                    <button 
                      onClick={() => setCurrentPage('admin')}
                      className="px-6 py-2 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-all duration-300 transform hover:scale-105 font-bold">
                      Admin Panel
                    </button>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="px-6 py-2 text-sm font-medium text-white hover:bg-white hover:text-purple-600 rounded-lg transition-all duration-300 transform hover:scale-105">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setCurrentPage('auth')
                      setAuthMode('login')
                      setError('')
                      setSuccess('')
                    }}
                    className="px-6 py-2 text-sm font-medium text-white hover:bg-white hover:text-purple-600 rounded-lg transition-all duration-300 transform hover:scale-105">
                    Login
                  </button>
                  <button 
                    onClick={() => {
                      setCurrentPage('auth')
                      setAuthMode('signup')
                      setError('')
                      setSuccess('')
                    }}
                    className="px-6 py-2 bg-white text-purple-600 text-sm font-bold rounded-lg hover:bg-gradient-to-r hover:from-yellow-400 hover:to-orange-500 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {currentPage === 'home' ? (
            <>
              {/* Animated Hero */}
              <div className="text-center mb-12 animate-fade-in">
                <h2 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4 animate-pulse">
                  Welcome to ShopVibe
                </h2>
                <p className="text-xl text-gray-700 mb-8 animate-slide-up">
                  Your one-stop shop for everything you need ✨
                </p>
              </div>

              {/* Feature Cards with Hover Effects */}
              <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {/* Products Card */}
                <div 
                  onClick={() => setCurrentPage('products')}
                  className="group bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl p-8 transform hover:scale-105 hover:rotate-1 transition-all duration-300 cursor-pointer animate-slide-in-left">
                  <div className="text-6xl mb-4 transform group-hover:scale-125 transition-transform duration-300">
                    🛒
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-300 transition-colors">
                    Products
                  </h3>
                  <p className="text-white text-opacity-90">
                    Browse our amazing collection of products with exclusive deals
                  </p>
                  <div className="mt-4 w-12 h-1 bg-yellow-400 rounded-full group-hover:w-full transition-all duration-300"></div>
                </div>

                {/* Cart Card */}
                <div 
                  onClick={() => setCurrentPage('cart')}
                  className="group bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-8 transform hover:scale-105 hover:rotate-1 transition-all duration-300 cursor-pointer animate-slide-in-up relative">
                  <div className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    {cartCount}
                  </div>
                  <div className="text-6xl mb-4 transform group-hover:scale-125 transition-transform duration-300">
                    🛍️
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-300 transition-colors">
                    Shopping Cart
                  </h3>
                  <p className="text-white text-opacity-90">
                    View your cart and checkout with secure payment options
                  </p>
                  <div className="mt-4 w-12 h-1 bg-yellow-400 rounded-full group-hover:w-full transition-all duration-300"></div>
                </div>

                {/* Orders Card */}
                <div 
                  onClick={() => setCurrentPage('orders')}
                  className="group bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-xl p-8 transform hover:scale-105 hover:rotate-1 transition-all duration-300 cursor-pointer animate-slide-in-right">
                  <div className="text-6xl mb-4 transform group-hover:scale-125 transition-transform duration-300">
                    📦
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-300 transition-colors">
                    Orders
                  </h3>
                  <p className="text-white text-opacity-90">
                    Track your orders and view complete order history
                  </p>
                  <div className="mt-4 w-12 h-1 bg-yellow-400 rounded-full group-hover:w-full transition-all duration-300"></div>
                </div>
              </div>

              {/* Special Offers Section */}
              <div className="mt-16">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-8 flex items-center gap-2">
                  🎉 Special Offers
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {products.filter(p => p.discount && p.discount > 0).length > 0 ? (
                    products.filter(p => p.discount && p.discount > 0).slice(0, 4).map((product) => (
                      <div key={product.id} className="group bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl relative">
                        {/* Discount Badge */}
                        <div className="absolute top-3 right-3 bg-red-600 text-white rounded-full w-16 h-16 flex flex-col items-center justify-center font-bold shadow-lg z-10">
                          <span className="text-xs">Save</span>
                          <span className="text-lg">{product.discount}%</span>
                        </div>
                        
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 h-32 flex items-center justify-center">
                          <span className="text-5xl">⭐</span>
                        </div>
                        <div className="p-4">
                          <h4 className="text-lg font-bold text-white mb-2 line-clamp-2">
                            {product.name}
                          </h4>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <span className="text-2xl font-bold text-white">
                                ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                              </span>
                              <span className="text-sm text-white line-through ml-2 opacity-70">
                                ${product.price}
                              </span>
                            </div>
                          </div>
                          <button 
                            onClick={() => addToCart(product)}
                            className="w-full px-3 py-2 bg-white text-orange-600 font-bold rounded-lg hover:bg-yellow-300 transition-all duration-300 text-sm">
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl shadow-lg p-8 text-center">
                      <p className="text-lg text-gray-700">No special offers available at the moment</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : currentPage === 'products' ? (
            <div className="animate-fade-in">
              {/* Back Button */}
              <button 
                onClick={() => setCurrentPage('home')}
                className="mb-8 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                ← Back to Home
              </button>

              {/* Products Title */}
              <h2 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-8">
                Our Products
              </h2>

              {/* Loading State */}
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-700">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl shadow-xl p-12 text-center">
                  <p className="text-xl text-gray-700">No products available yet. Check back soon!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <div key={product.id} className="group bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 h-40 flex items-center justify-center">
                        <span className="text-6xl">📦</span>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-purple-600">
                            ${product.price}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            product.stock > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                          </span>
                        </div>
                        <button 
                          onClick={() => addToCart(product)}
                          className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : currentPage === 'cart' ? (
            <div className="animate-fade-in">
              {/* Back Button */}
              <button 
                onClick={() => setCurrentPage('home')}
                className="mb-8 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                ← Back to Home
              </button>

              {/* Cart Title */}
              <h2 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-8">
                Shopping Cart
              </h2>

              {cart.length === 0 ? (
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl shadow-xl p-12 text-center">
                  <p className="text-xl text-gray-700 mb-4">Your cart is empty</p>
                  <button 
                    onClick={() => setCurrentPage('products')}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Cart Items */}
                  <div className="lg:col-span-2">
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl shadow-lg p-6 flex gap-4 items-start hover:shadow-xl transition-all duration-300">
                          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg w-24 h-24 flex items-center justify-center flex-shrink-0">
                            <span className="text-4xl">📦</span>
                          </div>
                          <div className="flex-grow">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h3>
                            <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-purple-600">${item.price}</span>
                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
                                  −
                                </button>
                                <span className="font-semibold min-w-8 text-center">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold">
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cart Summary */}
                  <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-8 sticky top-20">
                      <h3 className="text-2xl font-bold text-white mb-6">Order Summary</h3>
                      <div className="space-y-3 mb-6 border-b border-white border-opacity-30 pb-6">
                        <div className="flex justify-between text-white">
                          <span>Subtotal:</span>
                          <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-white">
                          <span>Shipping:</span>
                          <span>$0.00</span>
                        </div>
                        <div className="flex justify-between text-white">
                          <span>Tax:</span>
                          <span>${(cartTotal * 0.1).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-white text-xl font-bold mb-6">
                        <span>Total:</span>
                        <span>${(cartTotal * 1.1).toFixed(2)}</span>
                      </div>
                      <button className="w-full px-6 py-3 bg-white text-purple-600 font-bold rounded-lg hover:bg-yellow-300 hover:text-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                        Proceed to Checkout
                      </button>
                      <button 
                        onClick={() => setCurrentPage('products')}
                        className="w-full mt-3 px-6 py-3 bg-white bg-opacity-30 text-white font-semibold rounded-lg hover:bg-opacity-50 transition-all duration-300">
                        Continue Shopping
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : currentPage === 'orders' ? (
            <div className="animate-fade-in">
              {/* Back Button */}
              <button 
                onClick={() => setCurrentPage('home')}
                className="mb-8 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                ← Back to Home
              </button>

              {/* Orders Title */}
              <h2 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-8">
                My Orders
              </h2>

              {/* Loading State */}
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-700">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl shadow-xl p-12 text-center">
                  <p className="text-xl text-gray-700 mb-4">No orders yet</p>
                  <button 
                    onClick={() => setCurrentPage('products')}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                      {/* Order Header */}
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-2xl font-bold mb-2">Order #{order.id}</h3>
                            <p className="opacity-90">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm opacity-90 mb-1">Status</p>
                            <span className={`px-4 py-2 rounded-full font-bold text-sm ${
                              order.status === 'PENDING' 
                                ? 'bg-yellow-400 text-gray-800'
                                : order.status === 'CONFIRMED'
                                ? 'bg-blue-400 text-white'
                                : order.status === 'SHIPPED'
                                ? 'bg-purple-400 text-white'
                                : 'bg-green-400 text-white'
                            }`}>
                              {order.status || 'PENDING'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="p-6 border-b border-gray-200">
                        <h4 className="font-bold text-gray-800 mb-4">Order Items</h4>
                        <div className="space-y-3">
                          {order.orderItems && order.orderItems.length > 0 ? (
                            order.orderItems.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                                <div>
                                  <p className="font-semibold text-gray-800">{item.productName || 'Product'}</p>
                                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-bold text-purple-600">${(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-600">No items in this order</p>
                          )}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="p-6 bg-gray-50">
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-gray-700">
                            <span>Subtotal:</span>
                            <span>${(order.totalAmount * 0.9).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-gray-700">
                            <span>Tax (10%):</span>
                            <span>${(order.totalAmount * 0.1).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-300">
                            <span>Total:</span>
                            <span className="text-purple-600">${order.totalAmount?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>
                        <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : currentPage === 'auth' ? (
            <div className="animate-fade-in max-w-md mx-auto">
              {/* Auth Container */}
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-8 text-white text-center">
                  <h2 className="text-3xl font-bold mb-2">
                    {authMode === 'login' ? 'Welcome Back!' : 'Join ShopVibe'}
                  </h2>
                  <p className="opacity-90">
                    {authMode === 'login' 
                      ? 'Login to your account to continue shopping' 
                      : 'Create your account to get started'}
                  </p>
                </div>

                {/* Form */}
                <div className="p-8">
                  {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg text-sm">
                      {success}
                    </div>
                  )}

                  <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-4">
                    {authMode === 'signup' && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                          <input 
                            type="text" 
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Choose a username"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                          <input 
                            type="text" 
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Your full name"
                            required
                          />
                        </div>
                      </>
                    )}

                    {authMode === 'login' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                        <input 
                          type="text" 
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Your username"
                          required
                        />
                      </div>
                    )}

                    {authMode === 'signup' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                      <input 
                        type="password" 
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    {authMode === 'signup' && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                          <input 
                            type="tel" 
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                          <input 
                            type="text" 
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Your address"
                          />
                        </div>
                      </>
                    )}

                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                      {loading ? 'Please wait...' : (authMode === 'login' ? 'Login' : 'Sign Up')}
                    </button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-center text-gray-700 mb-4">
                      {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                    </p>
                    <button 
                      onClick={() => {
                        setAuthMode(authMode === 'login' ? 'signup' : 'login')
                        setError('')
                        setSuccess('')
                      }}
                      className="w-full px-6 py-2 border-2 border-purple-600 text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-all duration-300">
                      {authMode === 'login' ? 'Sign Up Instead' : 'Login Instead'}
                    </button>
                  </div>

                  <button 
                    onClick={() => setCurrentPage('home')}
                    className="w-full mt-4 px-6 py-2 text-gray-600 hover:text-gray-800 font-semibold transition-colors">
                    ← Back to Home
                  </button>
                </div>
              </div>
            </div>
          ) : currentPage === 'admin' ? (
            <div className="animate-fade-in">
              {/* Admin Header */}
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h2>
                <button 
                  onClick={() => setCurrentPage('home')}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  ← Back
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">{error}</div>
              )}
              {success && (
                <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">{success}</div>
              )}

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Add Product Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    ➕ Add New Product
                  </h3>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={adminProductForm.name}
                        onChange={handleAdminProductChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter product name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <textarea 
                        name="description"
                        value={adminProductForm.description}
                        onChange={handleAdminProductChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter product description"
                        rows="3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Price ($)</label>
                        <input 
                          type="number" 
                          name="price"
                          value={adminProductForm.price}
                          onChange={handleAdminProductChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="0.00"
                          step="0.01"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Qty</label>
                        <input 
                          type="number" 
                          name="stock"
                          value={adminProductForm.stock}
                          onChange={handleAdminProductChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="0"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Discount (%)</label>
                      <input 
                        type="number" 
                        name="discount"
                        value={adminProductForm.discount}
                        onChange={handleAdminProductChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50">
                      {loading ? 'Adding...' : 'Add Product'}
                    </button>
                  </form>
                </div>

                {/* Products List Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">📦 All Products ({products.length})</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {products.length === 0 ? (
                      <p className="text-gray-600">No products yet</p>
                    ) : (
                      products.map((product) => (
                        <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-gray-800">{product.name}</h4>
                            {product.discount > 0 && (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">-{product.discount}%</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-purple-600">${product.price}</span>
                            <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              Stock: {product.stock}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Orders Management Section */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">📋 Manage Orders ({adminOrders.length})</h3>
                {adminOrders.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No orders to manage</p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {adminOrders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-lg text-gray-800">Order #{order.id}</h4>
                            <p className="text-sm text-gray-600">
                              Customer: {order.user?.fullName || 'N/A'} ({order.user?.email})
                            </p>
                            <p className="text-sm text-gray-600">
                              Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <p className="font-bold text-lg text-purple-600">${order.totalAmount?.toFixed(2)}</p>
                        </div>

                        <div className="mb-4 p-3 bg-gray-50 rounded">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Items:</p>
                          {order.orderItems?.map((item, idx) => (
                            <p key={idx} className="text-sm text-gray-600">
                              • {item.productName} x{item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          ))}
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleUpdateOrderStatus(order.id, status)}
                              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                                order.status === status
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-gradient-to-r from-purple-900 via-pink-900 to-blue-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm opacity-75">© 2026 ShopVibe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
