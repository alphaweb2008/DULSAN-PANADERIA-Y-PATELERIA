import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../firebase/config';
import {
  doc, setDoc, deleteDoc, getDoc,
  collection, onSnapshot,
  type Unsubscribe
} from 'firebase/firestore';
import {
  type Product, type Category, type BusinessConfig, type ImagesConfig,
  type Reservation, type AboutConfig, type SocialConfig,
  defaultProducts, defaultCategories, defaultConfig, defaultImages,
  defaultAbout, defaultSocial
} from '../data/defaultData';

// ═══════════════════════════════════════
// STORAGE LOCAL (cache rápido)
// ═══════════════════════════════════════
const DATA_VERSION = '5.0'; // Cambiar cuando haya nuevos datos - VERSION 5.0 CON 12 CATEGORÍAS
const VERSION_KEY = 'dulsan_data_version';

const KEYS = {
  products: 'dulsan_products',
  categories: 'dulsan_categories',
  config: 'dulsan_config',
  images: 'dulsan_images',
  reservations: 'dulsan_reservations',
  about: 'dulsan_about',
  social: 'dulsan_social',
};

function load<T>(key: string, fallback: T): T {
  try {
    // Verificar versión
    const version = localStorage.getItem(VERSION_KEY);
    if (version !== DATA_VERSION) {
      console.log('🔄 Nueva versión detectada, limpiando caché...');
      Object.values(KEYS).forEach(k => localStorage.removeItem(k));
      localStorage.setItem(VERSION_KEY, DATA_VERSION);
      return fallback;
    }
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch {
    return fallback;
  }
}

function persist(key: string, data: unknown) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* storage full */ }
}

// ═══════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════
export function useLocalData() {
  // Estado inicial desde localStorage (INSTANTÁNEO)
  const [products, setProducts] = useState<Product[]>(() => load(KEYS.products, defaultProducts));
  const [categories, setCategories] = useState<Category[]>(() => load(KEYS.categories, defaultCategories));
  const [config, setConfig] = useState<BusinessConfig>(() => load(KEYS.config, defaultConfig));
  const [images, setImages] = useState<ImagesConfig>(() => load(KEYS.images, defaultImages));
  const [about, setAbout] = useState<AboutConfig>(() => load(KEYS.about, defaultAbout));
  const [social, setSocial] = useState<SocialConfig>(() => load(KEYS.social, defaultSocial));
  const [reservations, setReservations] = useState<Reservation[]>(() => load(KEYS.reservations, []));
  const [loading] = useState(false);

  const unsubs = useRef<Unsubscribe[]>([]);
  const didSeed = useRef(false);

  // ═══ LISTENERS DE FIREBASE (tiempo real) ═══
  const setupListeners = useCallback(() => {
    // Config: business
    unsubs.current.push(onSnapshot(doc(db, 'config', 'business'), (snap) => {
      if (snap.exists()) {
        const d = snap.data() as BusinessConfig;
        setConfig(d);
        persist(KEYS.config, d);
      }
    }, (e) => console.warn('FB config:', e.message)));

    // Config: images
    unsubs.current.push(onSnapshot(doc(db, 'config', 'images'), (snap) => {
      if (snap.exists()) {
        const d = snap.data() as ImagesConfig;
        setImages(d);
        persist(KEYS.images, d);
      }
    }, (e) => console.warn('FB images:', e.message)));

    // Config: about
    unsubs.current.push(onSnapshot(doc(db, 'config', 'about'), (snap) => {
      if (snap.exists()) {
        const d = snap.data() as AboutConfig;
        setAbout(d);
        persist(KEYS.about, d);
      }
    }, (e) => console.warn('FB about:', e.message)));

    // Config: social
    unsubs.current.push(onSnapshot(doc(db, 'config', 'social'), (snap) => {
      if (snap.exists()) {
        const d = snap.data() as SocialConfig;
        setSocial(d);
        persist(KEYS.social, d);
      }
    }, (e) => console.warn('FB social:', e.message)));

    // Colección: productos
    unsubs.current.push(onSnapshot(collection(db, 'menuItems'), (snap) => {
      if (!snap.empty) {
        const d = snap.docs.map(x => ({ ...x.data(), id: x.id }) as Product);
        setProducts(d);
        persist(KEYS.products, d);
      }
    }, (e) => console.warn('FB products:', e.message)));

    // Colección: categorías
    unsubs.current.push(onSnapshot(collection(db, 'categories'), (snap) => {
      if (!snap.empty) {
        const d = snap.docs.map(x => ({ ...x.data(), id: x.id }) as Category);
        setCategories(d);
        persist(KEYS.categories, d);
      }
    }, (e) => console.warn('FB categories:', e.message)));

    // Colección: reservas (siempre actualizar, incluso si vacío)
    unsubs.current.push(onSnapshot(collection(db, 'reservations'), (snap) => {
      const d = snap.docs.map(x => ({ ...x.data(), id: x.id }) as Reservation);
      setReservations(d);
      persist(KEYS.reservations, d);
    }, (e) => console.warn('FB reservations:', e.message)));
  }, []);

  // ═══ INICIALIZACIÓN ═══
  useEffect(() => {
    const init = async () => {
      try {
        console.log('🔥 Iniciando conexión con Firebase...');
        console.log('📊 Categorías locales:', defaultCategories.length);
        console.log('📦 Productos locales:', defaultProducts.length);
        
        // Verificar si Firebase tiene datos
        const snap = await getDoc(doc(db, 'config', 'business'));
        console.log('🔍 Documento business existe:', snap.exists());

        if (!snap.exists() && !didSeed.current) {
          didSeed.current = true;
          console.log('🌱 Sembrando datos iniciales en Firebase...');

          // Sembrar datos de configuración (usar directamente los defaultData)
          console.log('📝 Guardando configuración...');
          await setDoc(doc(db, 'config', 'business'), { ...defaultConfig });
          await setDoc(doc(db, 'config', 'images'), { ...defaultImages });
          await setDoc(doc(db, 'config', 'about'), { ...defaultAbout });
          await setDoc(doc(db, 'config', 'social'), { ...defaultSocial });
          console.log('✅ Configuración guardada');

          // Sembrar categorías (usar directamente defaultCategories)
          console.log('📝 Guardando', defaultCategories.length, 'categorías...');
          for (const c of defaultCategories) {
            await setDoc(doc(db, 'categories', c.id), { name: c.name, icon: c.icon });
            console.log('  ✓ Categoría:', c.name);
          }
          console.log('✅ Categorías guardadas');

          // Sembrar productos (usar directamente defaultProducts)
          console.log('📝 Guardando', defaultProducts.length, 'productos...');
          for (const p of defaultProducts) {
            await setDoc(doc(db, 'menuItems', p.id), {
              name: p.name, price: p.price, description: p.description,
              image: p.image, category: p.category, available: p.available
            });
          }
          console.log('✅ Productos guardados');

          console.log('🎉 ¡Datos iniciales sembrados en Firebase correctamente!');
        } else if (snap.exists()) {
          console.log('ℹ️ Firebase ya tiene datos, omitiendo seed');
        }

        // Activar listeners en tiempo real
        setupListeners();
        console.log('🔥 Firebase conectado - Escuchando cambios en tiempo real');
      } catch (e: unknown) {
        const error = e as Error;
        console.error('❌ ERROR de Firebase:', error.message);
        console.error('Stack:', error.stack);
        // La app sigue funcionando con localStorage
      }
    };

    init();
    return () => { unsubs.current.forEach(u => u()); };
  }, [setupListeners]);

  // ═══════════════════════════════════════
  // FUNCIONES DE GUARDADO (Local + Firebase)
  // ═══════════════════════════════════════

  // Helper: guardar en Firebase (fire-and-forget)
  const fbWrite = (path: string, id: string, data: Record<string, unknown>) => {
    setDoc(doc(db, path, id), data).catch(e => console.warn('FB write:', e));
  };
  const fbRemove = (path: string, id: string) => {
    deleteDoc(doc(db, path, id)).catch(e => console.warn('FB delete:', e));
  };

  // ═══ CONFIG ═══
  const saveConfig = (c: BusinessConfig) => {
    setConfig(c);
    persist(KEYS.config, c);
    fbWrite('config', 'business', { ...c });
  };

  const saveImages = (i: ImagesConfig) => {
    setImages(i);
    persist(KEYS.images, i);
    fbWrite('config', 'images', { ...i });
  };

  const saveAbout = (a: AboutConfig) => {
    setAbout(a);
    persist(KEYS.about, a);
    fbWrite('config', 'about', { ...a });
  };

  const saveSocial = (s: SocialConfig) => {
    setSocial(s);
    persist(KEYS.social, s);
    fbWrite('config', 'social', { ...s });
  };

  // ═══ PRODUCTOS ═══
  const addProduct = (product: Omit<Product, 'id'>) => {
    const id = Date.now().toString();
    const np = { ...product, id };
    const updated = [...products, np];
    setProducts(updated);
    persist(KEYS.products, updated);
    fbWrite('menuItems', id, {
      name: product.name, price: product.price, description: product.description,
      image: product.image, category: product.category, available: product.available
    });
    return np;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const updated = products.map(p => p.id === id ? { ...p, ...updates } : p);
    setProducts(updated);
    persist(KEYS.products, updated);
    const found = updated.find(p => p.id === id);
    if (found) {
      fbWrite('menuItems', id, {
        name: found.name, price: found.price, description: found.description,
        image: found.image, category: found.category, available: found.available
      });
    }
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    persist(KEYS.products, updated);
    fbRemove('menuItems', id);
  };

  // ═══ CATEGORÍAS ═══
  const addCategory = (category: Omit<Category, 'id'>) => {
    const id = category.name.toLowerCase().replace(/\s+/g, '-');
    const nc = { ...category, id };
    const updated = [...categories, nc];
    setCategories(updated);
    persist(KEYS.categories, updated);
    fbWrite('categories', id, { name: category.name, icon: category.icon });
    return nc;
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    const updated = categories.map(c => c.id === id ? { ...c, ...updates } : c);
    setCategories(updated);
    persist(KEYS.categories, updated);
    const found = updated.find(c => c.id === id);
    if (found) {
      fbWrite('categories', id, { name: found.name, icon: found.icon });
    }
  };

  const deleteCategory = (id: string) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    persist(KEYS.categories, updated);
    fbRemove('categories', id);
  };

  // ═══ RESERVAS ═══
  const addReservation = (reservation: Omit<Reservation, 'id' | 'status' | 'createdAt'>) => {
    const id = Date.now().toString();
    const nr: Reservation = {
      ...reservation, id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    const updated = [...reservations, nr];
    setReservations(updated);
    persist(KEYS.reservations, updated);
    fbWrite('reservations', id, {
      name: nr.name, phone: nr.phone, date: nr.date, time: nr.time,
      people: nr.people, notes: nr.notes, status: nr.status, createdAt: nr.createdAt
    });
    return nr;
  };

  const updateReservation = (id: string, updates: Partial<Reservation>) => {
    const updated = reservations.map(r => r.id === id ? { ...r, ...updates } : r);
    setReservations(updated);
    persist(KEYS.reservations, updated);
    const found = updated.find(r => r.id === id);
    if (found) {
      fbWrite('reservations', id, {
        name: found.name, phone: found.phone, date: found.date, time: found.time,
        people: found.people, notes: found.notes, status: found.status, createdAt: found.createdAt
      });
    }
  };

  const deleteReservation = (id: string) => {
    const updated = reservations.filter(r => r.id !== id);
    setReservations(updated);
    persist(KEYS.reservations, updated);
    fbRemove('reservations', id);
  };

  // ═══ RESET ═══
  const resetData = () => {
    setProducts(defaultProducts); persist(KEYS.products, defaultProducts);
    setCategories(defaultCategories); persist(KEYS.categories, defaultCategories);
    setConfig(defaultConfig); persist(KEYS.config, defaultConfig);
    setImages(defaultImages); persist(KEYS.images, defaultImages);
    setReservations([]); persist(KEYS.reservations, []);
  };

  return {
    products, categories, config, images, about, social, reservations, loading,
    addProduct, updateProduct, deleteProduct,
    addCategory, updateCategory, deleteCategory,
    addReservation, updateReservation, deleteReservation,
    saveConfig, saveImages, saveAbout, saveSocial,
    setReservations, resetData,
  };
}
