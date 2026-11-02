import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../api/client.js'

const SiteContext = createContext(null)

const DEFAULTS = {
  heroTitle: 'Кино и звук, ради которых стоит остаться дома',
  heroSubtitle:
    'Телевизоры, саундбары и проекторы премиум-класса с доставкой, подбором диагонали под комнату и установкой прямо у вас дома.',
  heroImage:
    'https://avatars.mds.yandex.net/i?id=9ea03a630ed2f54dfc288ed75a21e7a1_l-16971973-images-thumbs&n=13',
  slide1Tag: 'Интерьерные',
  slide1Title: 'Интерьерные телевизоры',
  slide1Text: 'Samsung The Frame, LG G6 и Hisense S7S — телевизор как предмет интерьера.',
  slide1Icon: '🖼️',
  slide1Link: '/catalog?category=televizory&collection=interior',
  slide1Image: '',
  slide2Tag: 'Максимальная детализация',
  slide2Title: 'Телевизоры с разрешением 8K UHD',
  slide2Text: 'Samsung 8K — невероятная чёткость и детализация изображения.',
  slide2Icon: '📺',
  slide2Link: '/catalog?category=televizory&collection=8k',
  slide2Image: '',
  phone: '+7 977 740-25-66',
  email: 'tv-space@mail.ru',
  telegram: 'tv_space_shop',
  city: 'Москва',
  deliveryText: 'Доставка по Москве и МО',
}

export function SiteProvider({ children }) {
  const [site, setSite] = useState(DEFAULTS)

  const refresh = useCallback(async () => {
    try {
      const data = await api.get('/site')
      setSite({ ...DEFAULTS, ...data })
    } catch {
      /* остаёмся на дефолтах */
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return <SiteContext.Provider value={{ site, refresh }}>{children}</SiteContext.Provider>
}

export const useSite = () => useContext(SiteContext)
