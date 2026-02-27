import { useState, useEffect } from 'react';
import { useLocalData } from './hooks/useLocalData';
import { LoadingScreen } from './components/LoadingScreen';
import type { Product } from './data/defaultData';

// ══════════════════════════════════════════
// APP PRINCIPAL - SIN REACT-ROUTER
// ══════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState<'menu' | 'admin-login' | 'admin'>('menu');
  const [isLoading, setIsLoading] = useState(true);
  const { config, images } = useLocalData();

  // Pantalla de carga puramente estética: se muestra un instante y luego
  // deja pasar al contenido, independientemente de Firebase. Los datos
  // iniciales ya vienen de localStorage + defaults, así que nunca
  // quedará la app en blanco si Firebase tarda o falla.
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200); // ~1.2s para ver la animación de bolitas
    return () => clearTimeout(timer);
  }, []);

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
        background_color: '#FCE4EC',
        theme_color: '#D14D72',
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
      updateMeta('theme-color', '#D14D72');
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

  // Mostrar pantalla de carga
  if (isLoading) {
    return <LoadingScreen logoUrl={images.logoUrl} />;
  }

  if (page === 'admin-login') return <AdminLoginPage onSuccess={() => setPage('admin')} onBack={() => { window.location.hash = ''; setPage('menu'); }} />;
  if (page === 'admin') return <AdminPanelPage onLogout={() => { window.location.hash = ''; setPage('menu'); }} />;
  return <MenuPage onAdmin={() => { window.location.hash = 'admin'; setPage('admin-login'); }} />;
}

// ══════════════════════════════════════════
// PÁGINA PRINCIPAL - MENÚ
// ══════════════════════════════════════════
function MenuPage({ onAdmin }: { onAdmin: () => void }) {
  const { products, categories, config, images, about, social, addReservation } = useLocalData();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [showReserva, setShowReserva] = useState(false);
  const [reservaSent, setReservaSent] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', date: '', time: '', people: 2, notes: '' });

  const filteredProducts = products
    .filter(p => p.available)
    .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));

  const handleReserva = (e: React.FormEvent) => {
    e.preventDefault();
    addReservation(form);
    setShowReserva(false);
    setForm({ name: '', phone: '', date: '', time: '', people: 2, notes: '' });
    setReservaSent(true);
    setTimeout(() => setReservaSent(false), 4000);
  };

  return (
    <div className="min-h-screen bg-[#FFE3ED] font-poppins text-[#4A4A4A]">

      {/* ── HEADER ── */}
      <header className="bg-[#FFE3ED] py-4 md:py-6 shadow-sm border-b border-pink-100">
        <div className="w-full max-w-5xl mx-auto px-4 flex flex-col items-center text-center">
          {/* Imagen del encabezado: primero desde Firebase (heroImage), luego fallback local de Dulsan */}
          <img
            src={images.heroImage || '/dulsan-header.png'}
            alt="Dulsan Pastelería y Panadería by Sandy Pérez"
            className="w-full h-auto max-h-[260px] md:max-h-[360px] object-contain object-center"
          />

          {/* Slogan grande debajo de la imagen */}
          <div className="flex flex-col items-center text-center mt-4">
            <p className="text-2xl md:text-3xl font-playfair italic font-semibold text-[#b3536f] tracking-wide drop-shadow-sm">
              {config.slogan || 'Somos el toque dulce para tu vida'}
            </p>
          </div>
        </div>
      </header>

      {/* ── RESERVA + BUSCAR ── */}
      <div className="max-w-4xl mx-auto px-4 mt-4 md:mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-4 flex flex-col sm:flex-row gap-3 border border-pink-100">
          <button onClick={() => setShowReserva(true)} className="flex-1 bg-[#D14D72] hover:bg-[#b03a5c] text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md">
            📅 Hacer una Reserva
          </button>
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300">🔍</span>
            <input type="text" placeholder="Buscar antojitos..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-pink-100 focus:border-[#D14D72] focus:ring-2 focus:ring-[#D14D72]/20 outline-none text-gray-600 placeholder-pink-200" />
          </div>
        </div>
      </div>

      {reservaSent && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="bg-white border-l-4 border-[#D14D72] text-[#D14D72] px-6 py-4 rounded-r-xl shadow-md flex items-center gap-2">
            ✅ <span className="font-medium">¡Reserva enviada con éxito!</span>
          </div>
        </div>
      )}

      {/* ── MENÚ ── */}
      <section className="max-w-4xl mx-auto px-4 mt-10">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-playfair font-bold text-[#D14D72] inline-block border-b-2 border-[#D14D72]/30 pb-1">Nuestro Menú</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide px-1">
          <button onClick={() => setSelectedCategory('all')}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full font-medium text-sm transition-all shadow-sm ${selectedCategory === 'all' ? 'bg-[#D14D72] text-white shadow-pink-200' : 'bg-white text-[#D14D72] border border-pink-100 hover:border-[#D14D72]'}`}>
            🍽️ Todo
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full font-medium text-sm transition-all shadow-sm ${selectedCategory === cat.id ? 'bg-[#D14D72] text-white shadow-pink-200' : 'bg-white text-[#D14D72] border border-pink-100 hover:border-[#D14D72]'}`}>
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Category Title */}
        {selectedCategory !== 'all' && (
          <div className="bg-[#D14D72] text-white py-2 px-6 rounded-r-full rounded-tl-full inline-block mt-4 mb-6 shadow-md">
            <h3 className="text-lg font-playfair font-bold flex items-center gap-2">
              {categories.find(c => c.id === selectedCategory)?.icon} {categories.find(c => c.id === selectedCategory)?.name}
            </h3>
          </div>
        )}

        {/* Products */}
        <div className="mt-2 pb-12">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-pink-200">
              <span className="text-6xl block mb-4 opacity-50">🍰</span>
              <p className="text-[#D14D72] text-lg font-medium">No hay productos aquí todavía</p>
            </div>
          )}
        </div>
      </section>

      {/* ── NOSOTROS ── */}
      <section className="bg-white py-16 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FCE4EC] rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#D14D72]/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="md:flex gap-10 items-center">
            {images.aboutUsImage && (
              <div className="md:w-1/2 mb-8 md:mb-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#D14D72] rounded-3xl rotate-3 opacity-20"></div>
                  <img src={images.aboutUsImage} alt="Nosotros" className="w-full h-72 md:h-80 object-cover rounded-3xl shadow-xl relative -rotate-2 hover:rotate-0 transition-transform duration-500" />
                </div>
              </div>
            )}
            <div className={`${images.aboutUsImage ? 'md:w-1/2' : 'w-full'} text-center md:text-left`}>
              <span className="text-[#D14D72] text-sm font-bold tracking-widest uppercase mb-2 block">Nuestra Historia</span>
              <h2 className="text-4xl font-playfair font-bold text-gray-800 mb-6">{about.title}</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-8">{about.text}</p>
              
              <div className="grid grid-cols-3 gap-4 border-t border-pink-100 pt-6">
                <div>
                  <span className="text-3xl font-bold text-[#D14D72] block mb-1">+{products.length}</span>
                  <span className="text-xs uppercase text-gray-400 font-semibold">Delicias</span>
                </div>
                <div>
                  <span className="text-3xl font-bold text-[#D14D72] block mb-1">{categories.length}</span>
                  <span className="text-xs uppercase text-gray-400 font-semibold">Variedades</span>
                </div>
                <div>
                  <span className="text-3xl font-bold text-[#D14D72] block mb-1">∞</span>
                  <span className="text-xs uppercase text-gray-400 font-semibold">Amor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#D14D72] text-white pt-16 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start gap-2 mb-6 text-white">
              {config.name && (
                <h3 className="text-2xl font-playfair font-bold leading-tight">{config.name}</h3>
              )}
              {config.slogan && (
                <p className="text-sm font-medium text-white/80 italic">{config.slogan}</p>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-6 border-b border-white/20 pb-2 inline-block">Contacto</h3>
              <div className="space-y-4 text-white/90">
                {config.address && (
                  <p className="flex items-start gap-3 justify-center md:justify-start">
                    <span className="text-xl">📍</span> <span className="text-sm">{config.address}</span>
                  </p>
                )}
                {config.phone && (
                  <p className="flex items-center gap-3 justify-center md:justify-start">
                    <span className="text-xl">📞</span> <span className="text-sm">{config.phone}</span>
                  </p>
                )}
                {config.schedule && (
                  <p className="flex items-center gap-3 justify-center md:justify-start">
                    <span className="text-xl">🕐</span> <span className="text-sm">{config.schedule}</span>
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-6 border-b border-white/20 pb-2 inline-block">Síguenos</h3>
              <div className="flex justify-center md:justify-start gap-4">
                {social.facebook && <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/20 hover:bg-white hover:text-[#D14D72] flex items-center justify-center transition-all text-xl">📘</a>}
                {social.instagram && <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/20 hover:bg-white hover:text-[#D14D72] flex items-center justify-center transition-all text-xl">📸</a>}
                {social.whatsapp && <a href={social.whatsapp} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/20 hover:bg-white hover:text-[#D14D72] flex items-center justify-center transition-all text-xl">💬</a>}
                {social.tiktok && <a href={social.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/20 hover:bg-white hover:text-[#D14D72] flex items-center justify-center transition-all text-xl">🎵</a>}
              </div>
              
              {config.address && (
                 <a href={`https://maps.google.com/?q=${encodeURIComponent(config.address)}`} target="_blank" rel="noopener noreferrer"
                 className="inline-block mt-8 bg-white text-[#D14D72] hover:bg-pink-50 px-6 py-2 rounded-full font-semibold text-sm transition-colors shadow-lg">
                 🗺️ Ver mapa
               </a>
              )}
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-12 pt-8 text-center">
            <p className="text-white/60 text-xs">© {new Date().getFullYear()} {config.name}. Hecho con mucho 💖.</p>
          </div>
        </div>
      </footer>

      {/* ── BOTÓN FLOTANTE ADMIN ── */}
      <button
        onClick={onAdmin}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#D14D72] hover:bg-[#b03a5c] text-white rounded-full shadow-lg hover:shadow-pink-300 flex items-center justify-center text-2xl z-40 transition-all hover:scale-110 hover:rotate-90"
        title="Panel de Administración"
      >
        ⚙️
      </button>

      {/* ── MODAL RESERVA ── */}
      {showReserva && (
        <div className="fixed inset-0 bg-[#D14D72]/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowReserva(false)}>
          <div className="bg-white rounded-3xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-pink-50" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-playfair font-bold text-[#D14D72]">Nueva Reserva</h2>
                <p className="text-gray-400 text-sm mt-1">¡Te esperamos con gusto!</p>
              </div>
              <button onClick={() => setShowReserva(false)} className="w-8 h-8 rounded-full bg-pink-50 text-[#D14D72] hover:bg-pink-100 flex items-center justify-center font-bold">✕</button>
            </div>
            <form onSubmit={handleReserva} className="space-y-4">
              <div>
                <label className="block text-gray-600 text-sm font-semibold mb-1 ml-1">Nombre completo</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-pink-50 focus:border-[#D14D72] focus:ring-0 outline-none transition-colors bg-pink-50/30" placeholder="Ej. María Pérez" />
              </div>
              <div>
                <label className="block text-gray-600 text-sm font-semibold mb-1 ml-1">Teléfono</label>
                <input type="tel" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-pink-50 focus:border-[#D14D72] focus:ring-0 outline-none transition-colors bg-pink-50/30" placeholder="Para confirmar" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 text-sm font-semibold mb-1 ml-1">Fecha</label>
                  <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-pink-50 focus:border-[#D14D72] focus:ring-0 outline-none transition-colors bg-pink-50/30" />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm font-semibold mb-1 ml-1">Hora</label>
                  <input type="time" required value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-pink-50 focus:border-[#D14D72] focus:ring-0 outline-none transition-colors bg-pink-50/30" />
                </div>
              </div>
              <div>
                <label className="block text-gray-600 text-sm font-semibold mb-1 ml-1">Personas</label>
                <select value={form.people} onChange={e => setForm({ ...form, people: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-pink-50 focus:border-[#D14D72] focus:ring-0 outline-none transition-colors bg-pink-50/30">
                  {[1,2,3,4,5,6,7,8,9,10,15,20].map(n => <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-600 text-sm font-semibold mb-1 ml-1">Notas especiales</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-pink-50 focus:border-[#D14D72] focus:ring-0 outline-none resize-none bg-pink-50/30" rows={3} placeholder="Cumpleaños, alergias..." />
              </div>
              <button type="submit" className="w-full bg-[#D14D72] hover:bg-[#b03a5c] text-white py-3.5 px-6 rounded-xl font-bold active:scale-95 transition-all shadow-lg shadow-pink-200 mt-2">
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
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-pink-50 overflow-hidden hover:shadow-xl hover:shadow-pink-100 transition-all duration-300 group hover:-translate-y-1">
      <div className="relative bg-[#FFF0F5] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-52 object-contain p-4 group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-pink-100">
          <span className="text-[#D14D72] font-bold text-lg">${product.price}</span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-playfair font-bold text-gray-800 text-xl mb-1">{product.name}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{product.description}</p>
        <button className="mt-4 w-full py-2 rounded-xl border border-[#D14D72] text-[#D14D72] font-semibold text-sm hover:bg-[#D14D72] hover:text-white transition-colors">
          Ver detalle
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// ADMIN LOGIN
// ══════════════════════════════════════════
function AdminLoginPage({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const { config, images } = useLocalData();
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
    <div className="min-h-screen flex items-center justify-center bg-[#FCE4EC] px-4 font-poppins">
      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md border-4 border-white ring-1 ring-pink-100">
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            {images.logoUrl ? (
              <img
                src={images.logoUrl}
                alt={config.name || 'Logo del negocio'}
                className="w-28 h-28 rounded-3xl object-contain border-2 border-pink-100 shadow-sm bg-white"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-[#D14D72] text-2xl font-bold">
                {config.name?.charAt(0) || 'D'}
              </div>
            )}
          </div>
          {config.name && (
            <h1 className="text-2xl font-bold text-[#D14D72]">{config.name}</h1>
          )}
          {config.slogan && (
            <p className="text-xs text-[#b3536f] italic mt-1">{config.slogan}</p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="Contraseña..."
            className="w-full px-5 py-4 rounded-xl border-2 border-pink-50 focus:border-[#D14D72] focus:ring-0 outline-none bg-pink-50/30 text-center text-lg tracking-widest" />
          {error && <div className="bg-red-50 text-red-500 px-4 py-3 rounded-xl text-sm text-center font-medium">{error}</div>}
          <button type="submit" className="w-full bg-[#D14D72] hover:bg-[#b03a5c] text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-200 transition-all active:scale-95">INGRESAR</button>
        </form>
        <button onClick={onBack} className="block mx-auto mt-8 text-sm text-gray-400 hover:text-[#D14D72] transition-colors">← Volver al menú</button>
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
    <div className="min-h-screen bg-gray-50 font-poppins text-gray-800">
      <header className="bg-white shadow-sm sticky top-0 z-20 border-b border-pink-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-[#D14D72] text-white p-2 rounded-lg text-xl">⚙️</span>
            <h1 className="text-xl font-bold text-gray-800">Administración</h1>
          </div>
          <button onClick={onLogout} className="px-5 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-600 rounded-lg font-medium transition-colors">Cerrar Sesión</button>
        </div>
      </header>
      
      <div className="bg-white border-b border-gray-200 shadow-sm overflow-x-auto">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 min-w-max">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${tab === t.id ? 'border-[#D14D72] text-[#D14D72] bg-pink-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                <span className="text-lg">{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-fade-in">
           {/* Se mantienen los componentes admin igual pero con colores ajustados */}
          {tab === 'productos' && <AdminProductos data={data} />}
          {tab === 'categorias' && <AdminCategorias data={data} />}
          {tab === 'config' && <AdminConfig data={data} />}
          {tab === 'imagenes' && <AdminImagenes data={data} />}
          {tab === 'nosotros' && <AdminNosotros data={data} />}
          {tab === 'redes' && <AdminRedes data={data} />}
          {tab === 'reservas' && <AdminReservas data={data} />}
        </div>
      </div>
    </div>
  );
}

// ═══════ ADMIN: PRODUCTOS (Estilos actualizados) ═══════
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
        <button onClick={openNew} className="px-5 py-2.5 bg-[#D14D72] hover:bg-[#b03a5c] text-white rounded-xl font-bold shadow-md shadow-pink-200">+ Nuevo Producto</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-[#D14D72]">{editId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div><label className="text-xs font-bold text-gray-500 uppercase">Nombre</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:border-[#D14D72] outline-none" required /></div>
              <div><label className="text-xs font-bold text-gray-500 uppercase">Precio</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:border-[#D14D72] outline-none" required /></div>
              <div><label className="text-xs font-bold text-gray-500 uppercase">Categoría</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:border-[#D14D72] outline-none">
                {data.categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select></div>
              <div className="flex items-end pb-3"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} className="w-5 h-5 accent-[#D14D72]" /> <span className="font-medium">Disponible para venta</span></label></div>
            </div>
            <div className="mb-4"><label className="text-xs font-bold text-gray-500 uppercase">Descripción</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:border-[#D14D72] outline-none" rows={3} /></div>
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Imagen</label>
              <div className="flex gap-3 items-start">
                {form.image ? <img src={form.image} alt="Preview" className="w-24 h-24 rounded-lg object-cover border" /> : <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 border border-dashed border-gray-300">Sin foto</div>}
                <div className="flex-1">
                   <button type="button" onClick={handleImage} className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 w-full mb-2">📂 Subir desde dispositivo</button>
                   <p className="text-xs text-gray-400">O pega una URL:</p>
                   <input type="text" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="w-full px-3 py-1.5 border rounded text-xs mt-1" placeholder="https://..." />
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button type="submit" className="px-8 py-2 bg-[#D14D72] text-white rounded-lg hover:bg-[#b03a5c] font-bold">Guardar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {data.products.map(p => (
          <div key={p.id} className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${!p.available ? 'opacity-60 bg-gray-50' : ''}`}>
            <div className="relative aspect-square mb-3 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
               {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-contain" /> : <span className="text-4xl">🍰</span>}
               {!p.available && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">AGOTADO</span></div>}
            </div>
            <h3 className="font-bold text-gray-800 truncate" title={p.name}>{p.name}</h3>
            <p className="text-[#D14D72] font-bold">${p.price}</p>
            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-50">
              <button onClick={() => openEdit(p)} className="flex-1 py-1.5 bg-blue-50 text-blue-600 text-sm rounded-lg hover:bg-blue-100">Editar</button>
              <button onClick={() => { if (confirm('¿Eliminar?')) data.deleteProduct(p.id); }} className="flex-1 py-1.5 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100">Borrar</button>
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
        <button onClick={() => { setEditId(null); setForm({ name: '', icon: '' }); setShowForm(true); }} className="px-4 py-2 bg-[#D14D72] text-white rounded-lg font-medium">+ Nueva</button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 mb-6 shadow-md border border-pink-100 flex gap-4 items-end flex-wrap">
          <div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Icono</label><input type="text" placeholder="☕" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className="px-4 py-2 border rounded-lg w-20 text-center text-2xl focus:border-[#D14D72] outline-none" required /></div>
          <div className="flex-1"><label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nombre Categoría</label><input type="text" placeholder="Ej. Postres" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="px-4 py-2 border rounded-lg w-full focus:border-[#D14D72] outline-none" required /></div>
          <button type="submit" className="px-6 py-2 bg-[#D14D72] text-white rounded-lg font-medium hover:bg-[#b03a5c]">{editId ? 'Actualizar' : 'Guardar'}</button>
          <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-gray-100 rounded-lg">Cancelar</button>
        </form>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.categories.map(c => (
          <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between group hover:border-pink-200 transition-colors">
            <div className="flex items-center gap-3"><span className="text-3xl bg-pink-50 w-12 h-12 flex items-center justify-center rounded-full">{c.icon}</span><span className="font-bold text-gray-700">{c.name}</span></div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setEditId(c.id); setForm({ name: c.name, icon: c.icon }); setShowForm(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded">✏️</button>
              <button onClick={() => { if (confirm('¿Eliminar?')) data.deleteCategory(c.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded">🗑️</button>
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
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Datos del Negocio</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: 'Nombre del Negocio', key: 'name' as const },
          { label: 'Slogan / Frase', key: 'slogan' as const },
          { label: 'Teléfono', key: 'phone' as const },
          { label: 'Dirección', key: 'address' as const },
          { label: 'Horario de Atención', key: 'schedule' as const },
          { label: 'Contraseña Admin', key: 'adminPassword' as const },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{f.label}</label>
            <input type="text" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:border-[#D14D72] outline-none" />
          </div>
        ))}
        <div className="md:col-span-2 pt-4">
           <button type="submit" className={`w-full py-3 rounded-xl font-bold text-white transition-all ${saved ? 'bg-green-500' : 'bg-[#D14D72] hover:bg-[#b03a5c]'}`}>{saved ? '✅ CAMBIOS GUARDADOS' : 'GUARDAR CAMBIOS'}</button>
        </div>
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
    { label: 'Logo Principal (También ícono de App)', key: 'logoUrl' as const, desc: 'Recomendado: Cuadrado, fondo transparente o blanco' },
    { label: 'Imagen de encabezado', key: 'heroImage' as const, desc: 'Se mostrará en el encabezado principal (usa aquí tu imagen de Dulsan Pastelería y Panadería)' },
    { label: 'Imagen Sección "Nosotros"', key: 'aboutUsImage' as const, desc: 'Foto del local o del equipo' },
  ];

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Imágenes del Sitio</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map(f => (
          <div key={f.key} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <label className="block text-lg font-bold text-gray-800 mb-1">{f.label}</label>
            <p className="text-sm text-gray-400 mb-4">{f.desc}</p>
            
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {form[f.key] ? (
                 <div className="relative group">
                    <img src={form[f.key]} alt={f.label} className="w-32 h-32 object-cover rounded-xl border-2 border-gray-100 shadow-sm" />
                    <button type="button" onClick={() => setForm({...form, [f.key]: ''})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center shadow">✕</button>
                 </div>
              ) : (
                <div className="w-32 h-32 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-300">Sin imagen</div>
              )}
              
              <div className="flex-1 w-full">
                <button type="button" onClick={() => fileRef.pick(base64 => setForm({ ...form, [f.key]: base64 }))}
                  className="w-full px-4 py-3 bg-[#f8f9fa] border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-100 flex items-center justify-center gap-2 mb-3">
                  📁 Subir imagen desde dispositivo
                </button>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🌐</span>
                  <input type="text" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} 
                    className="w-full pl-8 pr-3 py-2 border rounded-lg text-xs text-gray-500 focus:border-[#D14D72] outline-none" placeholder="O pega un enlace directo..." />
                </div>
              </div>
            </div>
          </div>
        ))}
        <button type="submit" className={`px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${saved ? 'bg-green-500' : 'bg-[#D14D72] hover:bg-[#b03a5c]'}`}>{saved ? '✅ GUARDADO' : 'GUARDAR TODAS LAS IMÁGENES'}</button>
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
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Contenido "Sobre Nosotros"</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-6">
        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Título Principal</label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:border-[#D14D72] outline-none font-playfair text-xl" /></div>
        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Historia / Descripción</label><textarea value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} className="w-full px-4 py-3 border rounded-lg focus:border-[#D14D72] outline-none leading-relaxed" rows={8} /></div>
        <button type="submit" className={`px-8 py-3 rounded-xl font-bold text-white transition-all ${saved ? 'bg-green-500' : 'bg-[#D14D72] hover:bg-[#b03a5c]'}`}>{saved ? '✅ GUARDADO' : 'GUARDAR CONTENIDO'}</button>
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Enlaces a Redes Sociales</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-5">
        {[
          { label: '📘 Facebook', key: 'facebook' as const },
          { label: '📸 Instagram', key: 'instagram' as const },
          { label: '💬 WhatsApp (Link completo)', key: 'whatsapp' as const },
          { label: '🎵 TikTok', key: 'tiktok' as const },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{f.label}</label>
            <input type="url" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:border-[#D14D72] outline-none bg-gray-50" placeholder="https://..." />
          </div>
        ))}
        <button type="submit" className={`w-full py-3 rounded-xl font-bold text-white transition-all ${saved ? 'bg-green-500' : 'bg-[#D14D72] hover:bg-[#b03a5c]'}`}>{saved ? '✅ GUARDADO' : 'GUARDAR ENLACES'}</button>
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Reservas</h2>
      {data.reservations.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-300">
          <span className="text-4xl block mb-2 opacity-30">📅</span>
          <p className="text-gray-500 font-medium">No hay reservas registradas aún</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-[#D14D72] mb-4 flex items-center gap-2"><span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-sm">⏳</span> Pendientes ({pending.length})</h3>
            <div className="space-y-4">
              {pending.length === 0 && <p className="text-sm text-gray-400 italic">No hay reservas pendientes.</p>}
              {pending.map(r => (
                <div key={r.id} className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-orange-400 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800 text-lg">{r.name}</h4>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">Reciente</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1 mb-4">
                    <p>📅 <span className="font-medium">{r.date}</span> a las <span className="font-medium">{r.time}</span></p>
                    <p>👥 <span className="font-medium">{r.people} personas</span></p>
                    <p>📞 <a href={`tel:${r.phone}`} className="text-blue-600 hover:underline">{r.phone}</a></p>
                    {r.notes && <p className="bg-yellow-50 p-2 rounded text-yellow-800 text-xs mt-2 border border-yellow-100">📝 {r.notes}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => data.updateReservation(r.id, { status: 'confirmed' })} className="flex-1 py-2 bg-green-500 text-white text-sm rounded-lg font-bold hover:bg-green-600 shadow-sm">✓ CONFIRMAR</button>
                    <button onClick={() => { if (confirm('¿Rechazar y eliminar reserva?')) data.deleteReservation(r.id); }} className="px-4 py-2 bg-gray-100 text-gray-500 text-sm rounded-lg hover:bg-red-50 hover:text-red-500 font-medium">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-[#D14D72] mb-4 flex items-center gap-2"><span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-sm">✅</span> Confirmadas ({confirmed.length})</h3>
            <div className="space-y-4">
              {confirmed.length === 0 && <p className="text-sm text-gray-400 italic">No hay reservas confirmadas.</p>}
              {confirmed.map(r => (
                <div key={r.id} className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500 opacity-80 hover:opacity-100 transition-opacity">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800">{r.name}</h4>
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded font-bold">LISTO</span>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1 mb-3">
                    <p>📅 {r.date} · ⏰ {r.time}</p>
                    <p>👥 {r.people} pax · 📞 {r.phone}</p>
                  </div>
                  <button onClick={() => { if (confirm('¿Eliminar del historial?')) data.deleteReservation(r.id); }} className="text-xs text-red-400 hover:text-red-600 underline">Eliminar historial</button>
                </div>
              ))}
            </div>
          </div>
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