// Собирает список характеристик товара для отображения (как таблица характеристик).
export function productSpecs(p) {
  const specs = []
  const add = (label, value) => {
    if (value !== null && value !== undefined && value !== '') {
      specs.push({ label, value })
    }
  }

  add('Бренд', p.brand)
  add('Диагональ', p.screenSizeInches ? `${p.screenSizeInches}″` : null)
  add('Разрешение', p.resolution)
  add('Тип технологии', p.technology)
  add('Smart TV', p.smartTv != null ? (p.smartTv ? 'Да' : 'Нет') : null)
  add('Частота обновления', p.refreshRateHz ? `${p.refreshRateHz} Гц` : null)
  add('HDR', p.hdr)
  add('Операционная система', p.os)
  add('Общая выходная мощность', p.powerOutputW ? `${p.powerOutputW} Вт` : null)
  add('Количество каналов', p.channels)
  add('Световой поток', p.luminousFluxLm ? `${p.luminousFluxLm} лм` : null)
  add('Контрастность', p.contrast)

  return specs
}
