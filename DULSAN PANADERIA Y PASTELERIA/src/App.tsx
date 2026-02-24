import { useState, useEffect } from 'react';
import { useLocalData } from './hooks/useLocalData';
import type { Product } from './data/defaultData';

// ══════════════════════════════════════════
// APP PRINCIPAL - SIN REACT-ROUTER
// ══════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState<'menu' | 'admin-login' | 'admin'>('menu');
  const { config, images } = useLocalData();

  // Generar manifest dinámico con el logo de Firebase
  useEffect(() => {
    if (config.name && images.logoUrl) {
      // Crear manifest dinámico
      const manifest = {
        name: config.name,
        short_name: config.name,
        description: config.slogan || 'Menú digital',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#a87880',
        orientation: 'portrait',
        icons: [
          {
            src: images.logoUrl,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: images.logoUrl,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      };

      // Crear blob URL para el manifest
      const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
      const manifestUrl = URL.createObjectURL(manifestBlob);

      // Actualizar el link del manifest
      let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      if (!manifestLink) {
        manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        document.head.appendChild(manifestLink);
      }
      manifestLink.href = manifestUrl;

      // Actualizar meta tags
      const updateMeta = (name: string, content: string, property = false) => {
        const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
        let meta = document.querySelector(selector) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          if (property) {
            meta.setAttribute('property', name);
          } else {
            meta.name = name;
          }
          document.head.appendChild(meta);
        }
        meta.content = content;
      };

      // Apple touch icon
      let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
      if (!appleTouchIcon) {
        appleTouchIcon = document.createElement('link');
        appleTouchIcon.rel = 'apple-touch-icon';
        document.head.appendChild(appleTouchIcon);
      }
      appleTouchIcon.href = images.logoUrl;

      // Meta tags para PWA
      updateMeta('theme-color', '#a87880');
      updateMeta('apple-mobile-web-app-capable', 'yes');
      updateMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
      updateMeta('apple-mobile-web-app-title', config.name);
      updateMeta('application-name', config.name);
      updateMeta('og:title', config.name, true);
      updateMeta('og:description', config.slogan || 'Menú digital', true);
      updateMeta('og:image', images.logoUrl, true);

      console.log('✅ PWA Manifest actualizado con logo:', images.logoUrl?.substring(0, 50) + '...');
    }
  }, [config.name, config.slogan, images.logoUrl]);

  // Detectar hash para admin
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        setPage('admin-login');
      } else {
        setPage('menu');
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  if (page === 'admin-login') return <AdminLoginPage onSuccess={() => setPage('admin')} onBack={() => { window.location.hash = ''; setPage('menu'); }} />;
  if (page === 'admin') return <AdminPanelPage onLogout={() => { window.location.hash = ''; setPage('menu'); }} />;
  return <MenuPage onAdmin={() => { window.location.hash = 'admin'; setPage('admin-login'); }} />;
}

// ══════════════════════════════════════════
// PÁGINA PRINCIPAL - MENÚ
// ══════════════════════════════════════════
function MenuPage({ onAdmin }: { onAdmin: () => void }) {
  const { products, categories, config, images, about, social, reservations, addReservation } = useLocalData();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [showReserva, setShowReserva] = useState(false);
  const [reservaSent, setReservaSent] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', date: '', time: '', people: 2, notes: '' });

  const filteredProducts = products
    .filter(p => p.available)
    .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));

  const countCat = (id: string) => id === 'all' ? products.filter(p => p.available).length : products.filter(p => p.category === id && p.available).length;

  const handleReserva = (e: React.FormEvent) => {
    e.preventDefault();
    addReservation(form);
    setShowReserva(false);
    setForm({ name: '', phone: '', date: '', time: '', people: 2, notes: '' });
    setReservaSent(true);
    setTimeout(() => setReservaSent(false), 4000);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">

      {/* ── HEADER ── */}
      <header className="bg-gradient-to-br from-[#a87880] to-[#5a949f] text-white">
        <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col items-center text-center">
          {images.logoUrl && (
            <img src={images.logoUrl} alt="Logo" className="w-24 h-24 rounded-full object-cover border-4 border-white/30 shadow-xl mb-4" />
          )}
          <h1 className="text-4xl md:text-5xl font-playfair font-bold">{config.name}</h1>
          <p className="text-white/80 text-lg mt-2 italic">{config.slogan}</p>
        </div>
      </header>

      {/* ── RESERVA + BUSCAR ── */}
      <div className="max-w-4xl mx-auto px-4 -mt-5 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col sm:flex-row gap-3">
          <button onClick={() => setShowReserva(true)} className="flex-1 bg-[#5a949f] hover:bg-[#4a828c] text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform">
            📅 Hacer una Reserva
          </button>
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input type="text" placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#5a949f] focus:ring-2 focus:ring-[#5a949f]/20 outline-none" />
          </div>
        </div>
      </div>

      {reservaSent && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">✅ ¡Reserva enviada! Te contactaremos pronto.</div>
        </div>
      )}

      {/* ── MENÚ ── */}
      <section className="max-w-4xl mx-auto px-4 mt-8">
        <h2 className="text-2xl font-playfair font-bold text-gray-800 mb-4">Nuestro Menú</h2>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          <button onClick={() => setSelectedCategory('all')}
            className={`flex-shrink-0 px-4 py-2.5 rounded-full font-medium text-sm transition-all ${selectedCategory === 'all' ? 'bg-[#a87880] text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#a87880]'}`}>
            🍽️ Todo ({countCat('all')})
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-full font-medium text-sm transition-all ${selectedCategory === cat.id ? 'bg-[#a87880] text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#a87880]'}`}>
              {cat.icon} {cat.name} ({countCat(cat.id)})
            </button>
          ))}
        </div>

        {selectedCategory !== 'all' && (
          <h3 className="text-xl font-playfair font-bold text-[#a87880] mt-2 mb-4">
            {categories.find(c => c.id === selectedCategory)?.icon} {categories.find(c => c.id === selectedCategory)?.name}
          </h3>
        )}

        {/* Products */}
        <div className="mt-4 pb-8">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <span className="text-5xl block mb-3">🍽️</span>
              <p className="text-gray-400 text-lg">No hay productos en esta categoría</p>
            </div>
          )}
        </div>
      </section>

      {/* ── NOSOTROS ── */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-[#a87880]/5 to-[#5a949f]/5">
            <div className="md:flex">
              {images.aboutUsImage && (
                <div className="md:w-1/2">
                  <img src={images.aboutUsImage} alt="Nosotros" className="w-full h-72 md:h-full object-cover" />
                </div>
              )}
              <div className={`${images.aboutUsImage ? 'md:w-1/2' : 'w-full'} p-8 md:p-10 flex flex-col justify-center`}>
                <span className="text-[#5a949f] text-sm font-semibold tracking-widest uppercase mb-2">Conócenos</span>
                <h2 className="text-3xl font-playfair font-bold text-gray-800 mb-4">{about.title}</h2>
                <p className="text-gray-600 leading-relaxed">{about.text}</p>
                <div className="mt-6 flex gap-6">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-[#a87880]">+{products.length}</span>
                    <p className="text-xs text-gray-500 mt-1">Productos</p>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-[#5a949f]">{categories.length}</span>
                    <p className="text-xs text-gray-500 mt-1">Categorías</p>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-[#a87880]">{reservations.length}</span>
                    <p className="text-xs text-gray-500 mt-1">Reservas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {images.logoUrl && <img src={images.logoUrl} alt="Logo" className="w-12 h-12 rounded-full object-cover border-2 border-white/20" />}
                <h3 className="text-xl font-playfair font-bold">{config.name}</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">{config.slogan}</p>
              <div className="space-y-2 text-sm text-gray-400">
                {config.address && <p>📍 {config.address}</p>}
                {config.phone && <p>📞 {config.phone}</p>}
                {config.schedule && <p>🕐 {config.schedule}</p>}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Síguenos</h3>
              <div className="space-y-3">
                {social.facebook && <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-white"><span className="w-10 h-10 rounded-full bg-[#a87880]/20 hover:bg-[#a87880] flex items-center justify-center text-lg">📘</span> Facebook</a>}
                {social.instagram && <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-white"><span className="w-10 h-10 rounded-full bg-[#a87880]/20 hover:bg-[#a87880] flex items-center justify-center text-lg">📸</span> Instagram</a>}
                {social.whatsapp && <a href={social.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-white"><span className="w-10 h-10 rounded-full bg-[#5a949f]/20 hover:bg-[#5a949f] flex items-center justify-center text-lg">💬</span> WhatsApp</a>}
                {social.tiktok && <a href={social.tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-white"><span className="w-10 h-10 rounded-full bg-[#5a949f]/20 hover:bg-[#5a949f] flex items-center justify-center text-lg">🎵</span> TikTok</a>}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Ubicación</h3>
              {config.address && (
                <div className="bg-gray-800 rounded-xl p-4 mb-3">
                  <p className="text-gray-400 text-sm mb-3">{config.address}</p>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(config.address)}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#5a949f] hover:bg-[#4a828c] text-white text-sm px-4 py-2 rounded-lg">
                    🗺️ Ver en Google Maps
                  </a>
                </div>
              )}
              {config.schedule && (
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-gray-400 text-sm font-medium mb-1">Horario</p>
                  <p className="text-white text-sm">{config.schedule}</p>
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-6 text-center">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} {config.name}</p>
          </div>
        </div>
      </footer>

      {/* ── BOTÓN FLOTANTE ADMIN ── */}
      <button
        onClick={onAdmin}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#a87880] hover:bg-[#8a6670] text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center text-2xl z-40 transition-all hover:scale-110"
        title="Panel de Administración"
      >
        ⚙️
      </button>

      {/* ── MODAL RESERVA ── */}
      {showReserva && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowReserva(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-playfair font-bold text-gray-800">Nueva Reserva</h2>
                <p className="text-gray-500 text-sm mt-1">Completa los datos</p>
              </div>
              <button onClick={() => setShowReserva(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">✕</button>
            </div>
            <form onSubmit={handleReserva} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Nombre completo</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#5a949f] focus:ring-2 focus:ring-[#5a949f]/20 outline-none" placeholder="Tu nombre" />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Teléfono</label>
                <input type="tel" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#5a949f] focus:ring-2 focus:ring-[#5a949f]/20 outline-none" placeholder="Tu teléfono" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Fecha</label>
                  <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#5a949f] focus:ring-2 focus:ring-[#5a949f]/20 outline-none" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Hora</label>
                  <input type="time" required value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#5a949f] focus:ring-2 focus:ring-[#5a949f]/20 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Personas</label>
                <select value={form.people} onChange={e => setForm({ ...form, people: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#5a949f] focus:ring-2 focus:ring-[#5a949f]/20 outline-none">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Notas (opcional)</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#5a949f] focus:ring-2 focus:ring-[#5a949f]/20 outline-none resize-none" rows={3} placeholder="Alguna preferencia..." />
              </div>
              <button type="submit" className="w-full bg-[#a87880] hover:bg-[#956a6d] text-white py-3 px-6 rounded-xl font-semibold active:scale-95 transition-transform">
                ✅ Enviar Reserva
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
// TARJETA DE PRODUCTO
// ══════════════════════════════════════════
function ProductCard({ product }: { product: Product }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
      <div className="relative bg-gray-50 overflow-hidden">
        {!loaded && <div className="h-48 bg-gray-100 animate-pulse" />}
        <img src={product.image} alt={product.name}
          className={`w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500 ${loaded ? '' : 'hidden'}`}
          onLoad={() => setLoaded(true)} loading="lazy" />
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
          <span className="text-[#a87880] font-bold">${product.price}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-lg">{product.name}</h3>
        <p className="text-gray-500 text-sm mt-1">{product.description}</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// ADMIN LOGIN
// ══════════════════════════════════════════
function AdminLoginPage({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const { config } = useLocalData();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === config.adminPassword) {
      onSuccess();
    } else {
      setError('Contraseña incorrecta');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4 font-poppins">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#a87880]/10 flex items-center justify-center"><span className="text-3xl">🔐</span></div>
          <h1 className="text-2xl font-playfair font-bold text-gray-800">Panel de Admin</h1>
          <p className="text-gray-500 mt-2">Ingresa tu contraseña</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#5a949f] focus:ring-2 focus:ring-[#5a949f]/20 outline-none" />
          {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}
          <button type="submit" className="w-full bg-[#a87880] hover:bg-[#8a6670] text-white font-medium py-3 rounded-xl">Ingresar</button>
        </form>
        <button onClick={onBack} className="block mx-auto mt-6 text-sm text-[#5a949f] hover:underline">← Volver al menú</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// ADMIN PANEL
// ══════════════════════════════════════════
function AdminPanelPage({ onLogout }: { onLogout: () => void }) {
  const data = useLocalData();
  const [tab, setTab] = useState<'productos' | 'categorias' | 'config' | 'imagenes' | 'nosotros' | 'redes' | 'reservas'>('productos');

  const tabs = [
    { id: 'productos' as const, icon: '📦', label: 'Productos' },
    { id: 'categorias' as const, icon: '🏷️', label: 'Categorías' },
    { id: 'config' as const, icon: '⚙️', label: 'Negocio' },
    { id: 'imagenes' as const, icon: '🖼️', label: 'Imágenes' },
    { id: 'nosotros' as const, icon: '👥', label: 'Nosotros' },
    { id: 'redes' as const, icon: '📱', label: 'Redes' },
    { id: 'reservas' as const, icon: '📅', label: `Reservas (${data.reservations.length})` },
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-poppins">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-playfair font-bold text-gray-800">⚙️ Panel de Administración</h1>
          <button onClick={onLogout} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium">Cerrar Sesión</button>
        </div>
      </header>
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-3 py-3 font-medium whitespace-nowrap border-b-2 text-sm ${tab === t.id ? 'border-[#a87880] text-[#a87880]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {tab === 'productos' && <AdminProductos data={data} />}
        {tab === 'categorias' && <AdminCategorias data={data} />}
        {tab === 'config' && <AdminConfig data={data} />}
        {tab === 'imagenes' && <AdminImagenes data={data} />}
        {tab === 'nosotros' && <AdminNosotros data={data} />}
        {tab === 'redes' && <AdminRedes data={data} />}
        {tab === 'reservas' && <AdminReservas data={data} />}
      </div>
    </div>
  );
}

// ═══════ ADMIN: PRODUCTOS ═══════
function AdminProductos({ data }: { data: ReturnType<typeof useLocalData> }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', price: '', description: '', category: '', image: '', available: true });
  const fileRef = useFileInput();

  const openNew = () => { setEditId(null); setForm({ name: '', price: '', description: '', category: data.categories[0]?.id || '', image: '', available: true }); setShowForm(true); };
  const openEdit = (p: Product) => { setEditId(p.id); setForm({ name: p.name, price: p.price.toString(), description: p.description, category: p.category, image: p.image, available: p.available }); setShowForm(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = { name: form.name, price: Number(form.price), description: form.description, category: form.category, image: form.image, available: form.available };
    if (editId) { data.updateProduct(editId, productData); } else { data.addProduct(productData); }
    setShowForm(false);
  };

  const handleImage = () => {
    fileRef.pick((base64) => setForm({ ...form, image: base64 }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Productos ({data.products.length})</h2>
        <button onClick={openNew} className="px-4 py-2 bg-[#a87880] hover:bg-[#8a6670] text-white rounded-lg font-medium">+ Nuevo</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 mb-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="px-4 py-2 border rounded-lg" required />
            <input type="number" placeholder="Precio" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="px-4 py-2 border rounded-lg" required />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="px-4 py-2 border rounded-lg">
              {data.categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} /> Disponible</label>
          </div>
          <textarea placeholder="Descripción" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg" rows={2} />
          <div>
            <label className="block text-sm text-gray-600 mb-2">Imagen del producto</label>
            <div className="flex gap-3 items-start">
              <input type="text" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="flex-1 px-4 py-2 border rounded-lg text-sm" placeholder="URL de imagen" />
              <button type="button" onClick={handleImage} className="px-4 py-2 bg-[#5a949f] text-white text-sm rounded-lg hover:bg-[#4a7a86]">📁 Subir foto</button>
            </div>
            {form.image && <img src={form.image} alt="Preview" className="mt-2 h-24 rounded-lg object-cover" />}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-6 py-2 bg-[#5a949f] text-white rounded-lg">{editId ? 'Actualizar' : 'Guardar'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-gray-200 rounded-lg">Cancelar</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.products.map(p => (
          <div key={p.id} className={`bg-white rounded-xl p-4 shadow-sm ${!p.available ? 'opacity-60' : ''}`}>
            {p.image && <img src={p.image} alt={p.name} className="w-full h-32 object-contain rounded-lg mb-3 bg-gray-50" />}
            <h3 className="font-bold text-gray-800">{p.name}</h3>
            <p className="text-[#a87880] font-bold">${p.price}</p>
            <p className="text-gray-500 text-sm line-clamp-2">{p.description}</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => openEdit(p)} className="px-3 py-1 bg-[#5a949f] text-white text-sm rounded">Editar</button>
              <button onClick={() => { if (confirm('¿Eliminar?')) data.deleteProduct(p.id); }} className="px-3 py-1 bg-red-500 text-white text-sm rounded">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════ ADMIN: CATEGORÍAS ═══════
function AdminCategorias({ data }: { data: ReturnType<typeof useLocalData> }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', icon: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) { data.updateCategory(editId, form); } else { data.addCategory(form); }
    setShowForm(false);
    setForm({ name: '', icon: '' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Categorías ({data.categories.length})</h2>
        <button onClick={() => { setEditId(null); setForm({ name: '', icon: '' }); setShowForm(true); }} className="px-4 py-2 bg-[#a87880] text-white rounded-lg font-medium">+ Nueva</button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 mb-6 shadow-sm flex gap-4 items-end flex-wrap">
          <div><label className="block text-sm text-gray-600 mb-1">Icono</label><input type="text" placeholder="☕" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className="px-4 py-2 border rounded-lg w-20 text-center text-2xl" required /></div>
          <div className="flex-1"><label className="block text-sm text-gray-600 mb-1">Nombre</label><input type="text" placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="px-4 py-2 border rounded-lg w-full" required /></div>
          <button type="submit" className="px-6 py-2 bg-[#5a949f] text-white rounded-lg">{editId ? 'Actualizar' : 'Guardar'}</button>
          <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-gray-200 rounded-lg">Cancelar</button>
        </form>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.categories.map(c => (
          <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3"><span className="text-3xl">{c.icon}</span><span className="font-medium text-gray-800">{c.name}</span></div>
            <div className="flex gap-1">
              <button onClick={() => { setEditId(c.id); setForm({ name: c.name, icon: c.icon }); setShowForm(true); }} className="p-2 text-[#5a949f]">✏️</button>
              <button onClick={() => { if (confirm('¿Eliminar?')) data.deleteCategory(c.id); }} className="p-2 text-red-500">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════ ADMIN: CONFIG ═══════
function AdminConfig({ data }: { data: ReturnType<typeof useLocalData> }) {
  const [form, setForm] = useState({ ...data.config });
  const [saved, setSaved] = useState(false);
  useEffect(() => { setForm({ ...data.config }); }, [data.config]);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); data.saveConfig(form); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuración del Negocio</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        {[
          { label: 'Nombre', key: 'name' as const },
          { label: 'Slogan', key: 'slogan' as const },
          { label: 'Teléfono', key: 'phone' as const },
          { label: 'Dirección', key: 'address' as const },
          { label: 'Horario', key: 'schedule' as const },
          { label: 'Contraseña Admin', key: 'adminPassword' as const },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-sm text-gray-600 mb-1">{f.label}</label>
            <input type="text" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
          </div>
        ))}
        <button type="submit" className="px-6 py-2 bg-[#5a949f] text-white rounded-lg">{saved ? '✓ Guardado' : 'Guardar'}</button>
      </form>
    </div>
  );
}

// ═══════ ADMIN: IMÁGENES ═══════
function AdminImagenes({ data }: { data: ReturnType<typeof useLocalData> }) {
  const [form, setForm] = useState({ ...data.images });
  const [saved, setSaved] = useState(false);
  const fileRef = useFileInput();
  useEffect(() => { setForm({ ...data.images }); }, [data.images]);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); data.saveImages(form); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const fields = [
    { label: 'Logo (ícono de la PWA)', key: 'logoUrl' as const },
    { label: 'Imagen Hero (portada)', key: 'heroImage' as const },
    { label: 'Imagen "Nosotros"', key: 'aboutUsImage' as const },
  ];

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Imágenes</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-6">
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-sm text-gray-600 mb-2">{f.label}</label>
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <input type="text" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="URL de imagen" />
                <button type="button" onClick={() => fileRef.pick(base64 => setForm({ ...form, [f.key]: base64 }))}
                  className="mt-2 px-4 py-2 bg-[#5a949f] text-white text-sm rounded-lg hover:bg-[#4a7a86]">📁 Subir desde dispositivo</button>
              </div>
              {form[f.key] && <img src={form[f.key]} alt={f.label} className="w-20 h-20 object-cover rounded-lg border" />}
            </div>
          </div>
        ))}
        <button type="submit" className="px-6 py-2 bg-[#5a949f] text-white rounded-lg">{saved ? '✓ Guardado' : 'Guardar Imágenes'}</button>
      </form>
    </div>
  );
}

// ═══════ ADMIN: NOSOTROS ═══════
function AdminNosotros({ data }: { data: ReturnType<typeof useLocalData> }) {
  const [form, setForm] = useState({ ...data.about });
  const [saved, setSaved] = useState(false);
  useEffect(() => { setForm({ ...data.about }); }, [data.about]);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); data.saveAbout(form); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Sección "Sobre Nosotros"</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <div><label className="block text-sm text-gray-600 mb-1">Título</label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg" /></div>
        <div><label className="block text-sm text-gray-600 mb-1">Texto</label><textarea value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} className="w-full px-4 py-2 border rounded-lg" rows={6} /></div>
        <button type="submit" className="px-6 py-2 bg-[#5a949f] text-white rounded-lg">{saved ? '✓ Guardado' : 'Guardar'}</button>
      </form>
    </div>
  );
}

// ═══════ ADMIN: REDES ═══════
function AdminRedes({ data }: { data: ReturnType<typeof useLocalData> }) {
  const [form, setForm] = useState({ ...data.social });
  const [saved, setSaved] = useState(false);
  useEffect(() => { setForm({ ...data.social }); }, [data.social]);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); data.saveSocial(form); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Redes Sociales</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        {[
          { label: '📘 Facebook', key: 'facebook' as const },
          { label: '📸 Instagram', key: 'instagram' as const },
          { label: '💬 WhatsApp', key: 'whatsapp' as const },
          { label: '🎵 TikTok', key: 'tiktok' as const },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-sm text-gray-600 mb-1">{f.label}</label>
            <input type="url" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder={`https://${f.key}.com/...`} />
          </div>
        ))}
        <button type="submit" className="px-6 py-2 bg-[#5a949f] text-white rounded-lg">{saved ? '✓ Guardado' : 'Guardar'}</button>
      </form>
    </div>
  );
}

// ═══════ ADMIN: RESERVAS ═══════
function AdminReservas({ data }: { data: ReturnType<typeof useLocalData> }) {
  const pending = data.reservations.filter(r => r.status === 'pending');
  const confirmed = data.reservations.filter(r => r.status === 'confirmed');

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Reservas</h2>
      {data.reservations.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center"><p className="text-gray-500">No hay reservas aún</p></div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-orange-600 mb-3">⏳ Pendientes ({pending.length})</h3>
              <div className="space-y-3">
                {pending.map(r => (
                  <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-400">
                    <div className="flex justify-between items-start flex-wrap gap-3">
                      <div>
                        <h4 className="font-bold text-gray-800">{r.name}</h4>
                        <p className="text-gray-600 text-sm">📞 {r.phone} · 📅 {r.date} · ⏰ {r.time} · 👥 {r.people}</p>
                        {r.notes && <p className="text-gray-500 text-sm mt-1">📝 {r.notes}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => data.updateReservation(r.id, { status: 'confirmed' })} className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600">✓ Confirmar</button>
                        <button onClick={() => { if (confirm('¿Eliminar?')) data.deleteReservation(r.id); }} className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">Eliminar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {confirmed.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-green-600 mb-3">✅ Confirmadas ({confirmed.length})</h3>
              <div className="space-y-3">
                {confirmed.map(r => (
                  <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-400">
                    <div className="flex justify-between items-start flex-wrap gap-3">
                      <div>
                        <h4 className="font-bold text-gray-800">{r.name}</h4>
                        <p className="text-gray-600 text-sm">📞 {r.phone} · 📅 {r.date} · ⏰ {r.time} · 👥 {r.people}</p>
                      </div>
                      <button onClick={() => { if (confirm('¿Eliminar?')) data.deleteReservation(r.id); }} className="px-3 py-1 bg-red-500 text-white text-sm rounded">Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════ HOOK: FILE INPUT ═══════
function useFileInput() {
  const pick = (onResult: (base64: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => { onResult(reader.result as string); };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };
  return { pick };
}
