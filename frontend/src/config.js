// Центральные настройки магазина.
// Меняйте значения здесь — они подхватятся по всему сайту.
export const SITE = {
  name: 'TV Space',
  tagline: 'Телевизоры · Аудио · Проекторы',
  city: 'Москва',
  // TODO: укажите реальную почту
  email: 'info@tvspace.ru',
  // TODO: укажите реальный телефон
  phone: '8 (800) 000-00-00',
  deliveryText: 'Доставка по Москве и МО',
}

export const MAIN_SECTIONS = [
  {
    title: 'Телевизоры',
    slug: 'televizory',
    icon: '📺',
    desc: 'Samsung, LG, Hisense, TCL — 4K, OLED, QLED',
    accent: 'tv',
    image: 'https://avatars.mds.yandex.net/i?id=e3ca9c42f5bb840fcd8d34f88f43eb89_l-17742983-images-thumbs&n=13',
    subcategories: [
      { title: 'Все телевизоры', q: 'category=televizory' },
      { title: 'OLED', q: 'category=televizory&technology=OLED' },
      { title: 'QLED / Neo QLED', q: 'category=televizory&technology=QLED' },
      { title: 'Mini-LED', q: 'category=televizory&technology=Mini-LED' },
      { title: 'NanoCell', q: 'category=televizory&technology=NanoCell' },
      { title: 'LED', q: 'category=televizory&technology=LED' },
    ],
  },
  {
    title: 'Аудиосистемы',
    slug: 'audio-sistemy',
    icon: '🔊',
    desc: 'Саундбары и домашние кинотеатры LG, Samsung, Hisense',
    accent: 'audio',
    image: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=900&q=80',
    subcategories: [
      { title: 'Все аудиосистемы', q: 'category=audio-sistemy' },
      { title: 'Samsung', q: 'category=audio-sistemy&brand=Samsung' },
      { title: 'LG', q: 'category=audio-sistemy&brand=LG' },
      { title: 'Hisense', q: 'category=audio-sistemy&brand=Hisense' },
    ],
  },
  {
    title: 'Проекторы',
    slug: 'proektory',
    icon: '📽️',
    desc: '4K-проекторы Hisense для домашнего кино',
    accent: 'proj',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&q=80',
    subcategories: [
      { title: 'Все проекторы', q: 'category=proektory' },
      { title: '4K UHD', q: 'category=proektory&resolution=4K%20UHD' },
      { title: 'Full HD', q: 'category=proektory&resolution=Full%20HD' },
    ],
  },
  {
    title: 'Подборки',
    slug: 'podborki',
    icon: '✨',
    desc: 'Готовые подборки телевизоров',
    accent: 'collections',
    navOnly: true,
    href: '/catalog?category=televizory&collection=interior',
    subcategories: [
      { title: 'Интерьерные телевизоры', q: 'category=televizory&collection=interior' },
      { title: 'Телевизоры с разрешением 8K UHD', q: 'category=televizory&collection=8k' },
    ],
  },
]

// Фильтры каталога по категориям.
// type: 'checkbox' — список значений; 'range' — «от/до».
export const FILTER_CONFIG = {
  televizory: [
    { key: 'brand', label: 'Производитель', type: 'checkbox', options: ['Samsung', 'LG', 'Hisense', 'TCL'] },
    { key: 'price', label: 'Цена, ₽', type: 'range' },
    { key: 'screenSize', label: 'Диагональ', type: 'checkbox', options: ['32', '43', '50', '55', '65', '75', '85', '100'] },
    { key: 'technology', label: 'Тип технологии', type: 'checkbox', options: ['QLED', 'OLED', 'LED', 'NanoCell', 'Mini-LED'] },
    { key: 'resolution', label: 'Разрешение экрана', type: 'checkbox', options: ['HD', 'Full HD', '4K UHD', '8K'] },
  ],
  'audio-sistemy': [
    { key: 'brand', label: 'Производитель', type: 'checkbox', options: ['Samsung', 'LG', 'Hisense'] },
    { key: 'price', label: 'Цена, ₽', type: 'range' },
    { key: 'powerOutput', label: 'Общая выходная мощность, Вт', type: 'range' },
    { key: 'channels', label: 'Количество каналов', type: 'checkbox', options: ['2.0', '2.1', '3.1.2'] },
  ],
  proektory: [
    { key: 'brand', label: 'Производитель', type: 'checkbox', options: ['Hisense'] },
    { key: 'price', label: 'Цена, ₽', type: 'range' },
    { key: 'luminousFlux', label: 'Световой поток, лм', type: 'range' },
    { key: 'resolution', label: 'Разрешение', type: 'checkbox', options: ['4K UHD', 'Full HD'] },
  ],
}
