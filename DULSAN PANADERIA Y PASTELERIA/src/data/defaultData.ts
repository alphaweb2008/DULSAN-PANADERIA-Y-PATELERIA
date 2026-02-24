// Tipos para la aplicación
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  available: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface BusinessConfig {
  name: string;
  slogan: string;
  phone: string;
  address: string;
  schedule: string;
  adminPassword: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface AboutConfig {
  title: string;
  text: string;
}

export interface SocialConfig {
  facebook: string;
  instagram: string;
  whatsapp: string;
  tiktok: string;
}

export interface Reservation {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  people: number;
  notes: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface ImagesConfig {
  logoUrl: string;
  heroImage: string;
  aboutUsImage: string;
}

export interface AboutConfig {
  title: string;
  text: string;
}

export interface SocialConfig {
  facebook: string;
  instagram: string;
  whatsapp: string;
  tiktok: string;
}

// Datos por defecto del menú
export const defaultCategories: Category[] = [
  { id: 'desayunos', name: 'Desayunos', icon: '☀️' },
  { id: 'recargar-energia', name: 'Para recargar energía', icon: '⚡' },
  { id: 'saludable', name: 'Zona Saludable', icon: '🍏' },
  { id: 'golosos', name: 'Para los más golosos', icon: '🍬' },
  { id: 'bebidas-frias', name: 'Bebidas Frías', icon: '🧊' },
  { id: 'bebidas-calientes', name: 'Bebidas Calientes', icon: '☕' },
  { id: 'cafes-frios', name: 'Cafés Fríos', icon: '🌀' },
  { id: 'cafes-calientes', name: 'Cafés Calientes', icon: '🫖' },
  { id: 'bebidas-adicionales', name: 'Bebidas Adicionales', icon: '🥤' },
  { id: 'especial', name: 'Especial', icon: '👑' },
  { id: 'tortas', name: 'Tortas', icon: '🎂' },
  { id: 'otros', name: 'Otros', icon: '📦' },
];

export const defaultProducts: Product[] = [
  // Desayunos
  { id: '1', name: 'Huevos Revueltos', price: 85, description: 'Huevos revueltos con tocino y pan tostado', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400', category: 'desayunos', available: true },
  { id: '2', name: 'Hot Cakes', price: 95, description: '3 hot cakes con miel y mantequilla', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', category: 'desayunos', available: true },
  { id: '3', name: 'Chilaquiles', price: 110, description: 'Chilaquiles verdes con pollo y crema', image: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400', category: 'desayunos', available: true },
  { id: '4', name: 'Avena con Frutas', price: 75, description: 'Avena cocida con frutas frescas', image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400', category: 'desayunos', available: true },
  { id: '1b', name: 'Sándwich de Huevo', price: 90, description: 'Sándwich con huevo, jamón y queso', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400', category: 'desayunos', available: true },
  { id: '1c', name: 'Omelette', price: 100, description: 'Omelette con vegetales y queso', image: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400', category: 'desayunos', available: true },
  
  // Para recargar energía
  { id: 're1', name: 'Batido Energético', price: 85, description: 'Batido de plátano, avena y miel', image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400', category: 'recargar-energia', available: true },
  { id: 're2', name: 'Granola con Yogurt', price: 75, description: 'Granola casera con yogurt griego', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', category: 'recargar-energia', available: true },
  { id: 're3', name: 'Barra de Proteína', price: 45, description: 'Barra energética casera', image: 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=400', category: 'recargar-energia', available: true },
  { id: 're4', name: 'Bowl de Açaí', price: 120, description: 'Bowl de açaí con granola y frutas', image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400', category: 'recargar-energia', available: true },
  { id: 're5', name: 'Smoothie Verde', price: 80, description: 'Espinaca, plátano y leche de almendras', image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400', category: 'recargar-energia', available: true },
  { id: 're6', name: 'Tostadas con Aguacate', price: 95, description: 'Tostadas con aguacate y huevo pochado', image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400', category: 'recargar-energia', available: true },
  
  // Para los más golosos
  { id: 'go1', name: 'Brownie con Helado', price: 85, description: 'Brownie tibio con helado de vainilla', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', category: 'golosos', available: true },
  { id: 'go2', name: 'Cheesecake', price: 75, description: 'Cheesecake con frutos rojos', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400', category: 'golosos', available: true },
  { id: 'go3', name: 'Muffin de Chocolate', price: 50, description: 'Muffin tibio con chips de chocolate', image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400', category: 'golosos', available: true },
  { id: 'go4', name: 'Dona Glaseada', price: 35, description: 'Dona fresca con glaseado', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400', category: 'golosos', available: true },
  { id: 'go5', name: 'Cookie Gigante', price: 55, description: 'Cookie tibia con chips de chocolate', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400', category: 'golosos', available: true },
  
  // Bebidas Adicionales
  { id: 'ba1', name: 'Agua Mineral', price: 30, description: 'Agua mineral con gas', image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400', category: 'bebidas-adicionales', available: true },
  { id: 'ba2', name: 'Jugo Natural', price: 45, description: 'Jugo de naranja, piña o zanahoria', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', category: 'bebidas-adicionales', available: true },
  { id: 'ba3', name: 'Limonada', price: 40, description: 'Limonada fresca con menta', image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400', category: 'bebidas-adicionales', available: true },
  { id: 'ba4', name: 'Té Helado', price: 45, description: 'Té negro con limón y hielo', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', category: 'bebidas-adicionales', available: true },
  { id: 'ba5', name: 'Refresco', price: 35, description: 'Coca-Cola, Sprite o Fanta', image: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400', category: 'bebidas-adicionales', available: true },
  
  // Zona Saludable
  { id: '5', name: 'Ensalada de Frutas', price: 65, description: 'Mix de frutas frescas de temporada', image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400', category: 'saludable', available: true },
  { id: '6', name: 'Yogurt Parfait', price: 80, description: 'Yogurt con granola y miel', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', category: 'saludable', available: true },
  { id: '7', name: 'Bowl de Acai', price: 120, description: 'Bowl de acai con frutas y granola', image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400', category: 'saludable', available: true },
  { id: '8', name: 'Smoothie Verde', price: 75, description: 'Espinaca, plátano y leche de almendras', image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400', category: 'saludable', available: true },
  
  // Bebidas Frías
  { id: '9', name: 'Limonada Natural', price: 45, description: 'Limonada fresca con menta', image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400', category: 'bebidas-frias', available: true },
  { id: '10', name: 'Jugo de Naranja', price: 50, description: 'Jugo natural de naranja', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', category: 'bebidas-frias', available: true },
  { id: '11', name: 'Agua de Coco', price: 55, description: 'Agua de coco natural', image: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400', category: 'bebidas-frias', available: true },
  { id: '12', name: 'Milkshake de Chocolate', price: 75, description: 'Milkshake espeso de chocolate', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400', category: 'bebidas-frias', available: true },
  
  // Bebidas Calientes
  { id: '13', name: 'Chocolate Caliente', price: 55, description: 'Chocolate caliente con leche', image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400', category: 'bebidas-calientes', available: true },
  { id: '14', name: 'Té de Hierbas', price: 40, description: 'Selección de tés relajantes', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', category: 'bebidas-calientes', available: true },
  { id: '15', name: 'Leche con Miel', price: 45, description: 'Leche tibia con miel y canela', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', category: 'bebidas-calientes', available: true },
  
  // Cafés Fríos
  { id: '16', name: 'Iced Coffee', price: 60, description: 'Café frío con hielo y leche', image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400', category: 'cafes-frios', available: true },
  { id: '17', name: 'Cold Brew', price: 70, description: 'Café cold brew artesanal', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', category: 'cafes-frios', available: true },
  { id: '18', name: 'Frappuccino', price: 80, description: 'Bebida helada con café y crema', image: 'https://images.unsplash.com/photo-1585494156145-1c60a4fe952b?w=400', category: 'cafes-frios', available: true },
  
  // Cafés Calientes
  { id: '19', name: 'Café Negro', price: 35, description: 'Café negro tradicional', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', category: 'cafes-calientes', available: true },
  { id: '20', name: 'Café con Leche', price: 45, description: 'Café con leche caliente', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', category: 'cafes-calientes', available: true },
  { id: '21', name: 'Capuccino', price: 55, description: 'Café con espuma de leche', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', category: 'cafes-calientes', available: true },
  { id: '22', name: 'Latte', price: 60, description: 'Café latte con latte art', image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400', category: 'cafes-calientes', available: true },
  { id: '23', name: 'Moccachino', price: 65, description: 'Café con chocolate y crema', image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400', category: 'cafes-calientes', available: true },
  
  // Especial
  { id: '24', name: 'Café Irlandés', price: 95, description: 'Café con whiskey y crema', image: 'https://images.unsplash.com/photo-1545438102-799c3991ffb2?w=400', category: 'especial', available: true },
  { id: '25', name: 'Mocha Especial', price: 80, description: 'Café con chocolate y crema batida', image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400', category: 'especial', available: true },
  { id: '26', name: 'Matcha Latte', price: 85, description: 'Té matcha con leche', image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400', category: 'especial', available: true },
  
  // Tortas
  { id: '31', name: 'Torta de Chocolate', price: 120, description: 'Torta de chocolate con cobertura', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', category: 'tortas', available: true },
  { id: '32', name: 'Torta de Vainilla', price: 110, description: 'Torta de vainilla con crema', image: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=400', category: 'tortas', available: true },
  { id: '33', name: 'Torta de Zanahoria', price: 115, description: 'Torta de zanahoria con nueces', image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400', category: 'tortas', available: true },
  { id: '34', name: 'Torta de Tres Leches', price: 130, description: 'Torta tradicional de tres leches', image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400', category: 'tortas', available: true },
  
  // Otros
  { id: '27', name: 'Croissant', price: 45, description: 'Croissant recién horneado', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', category: 'otros', available: true },
  { id: '28', name: 'Muffin', price: 40, description: 'Muffin de chocolate o vainilla', image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400', category: 'otros', available: true },
  { id: '29', name: 'Galletas', price: 25, description: 'Galletas caseras', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400', category: 'otros', available: true },
  { id: '30', name: 'Brownie', price: 50, description: 'Brownie con chocolate', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', category: 'otros', available: true },
];

export const defaultConfig: BusinessConfig = {
  name: 'Dulsan Cafetería',
  slogan: 'Sabores que te conquistan',
  phone: '+52 555 123 4567',
  address: 'Av. Principal 123, Col. Centro',
  schedule: 'Lunes a Domingo: 7:00 AM - 10:00 PM',
  adminPassword: 'admin123',
  primaryColor: '#a87880',
  secondaryColor: '#5a949f',
};

export const defaultAbout: AboutConfig = {
  title: 'Sobre Nosotros',
  text: 'En Dulsan Cafetería creemos que cada taza de café cuenta una historia. Desde 2015 brindamos los mejores momentos de café a nuestra comunidad, con ingredientes frescos y un ambiente acogedor. Nuestro compromiso es ofrecerte no solo una bebida, sino una experiencia unforgettable.',
};

export const defaultSocial: SocialConfig = {
  facebook: 'https://facebook.com/dulsan',
  instagram: 'https://instagram.com/dulsan',
  whatsapp: 'https://wa.me/525551234567',
  tiktok: 'https://tiktok.com/@dulsan',
};

export const defaultImages: ImagesConfig = {
  logoUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200',
  heroImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
  aboutUsImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600',
};
