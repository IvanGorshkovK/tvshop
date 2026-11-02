package com.tvshop.service;

import com.tvshop.domain.SiteContent;
import com.tvshop.repository.SiteContentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.function.Consumer;

@Service
public class SiteContentService {

    private final SiteContentRepository repository;

    public SiteContentService(SiteContentRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public SiteContent get() {
        return repository.findById(1L).orElseGet(() -> {
            SiteContent c = new SiteContent();
            c.setId(1L);
            c.setHeroTitle("Кино и звук, ради которых стоит остаться дома");
            c.setHeroSubtitle("Телевизоры, саундбары и проекторы премиум-класса с доставкой, подбором диагонали под комнату и установкой прямо у вас дома.");
            c.setHeroImage("https://avatars.mds.yandex.net/i?id=9ea03a630ed2f54dfc288ed75a21e7a1_l-16971973-images-thumbs&n=13");
            c.setSlide1Tag("Интерьерные");
            c.setSlide1Title("Интерьерные телевизоры");
            c.setSlide1Text("Samsung The Frame, LG G6 и Hisense S7S — телевизор как предмет интерьера.");
            c.setSlide1Icon("🖼️");
            c.setSlide1Link("/catalog?category=televizory&collection=interior");
            c.setSlide2Tag("Максимальная детализация");
            c.setSlide2Title("Телевизоры с разрешением 8K UHD");
            c.setSlide2Text("Samsung 8K — невероятная чёткость и детализация изображения.");
            c.setSlide2Icon("📺");
            c.setSlide2Link("/catalog?category=televizory&collection=8k");
            c.setPhone("+7 977 740-25-66");
            c.setEmail("tv-space@mail.ru");
            c.setTelegram("tv_space_shop");
            c.setCity("Москва");
            c.setDeliveryText("Доставка по Москве и МО");
            return repository.save(c);
        });
    }

    @Transactional
    public SiteContent update(Map<String, String> data) {
        SiteContent c = get();
        set(data, "heroTitle", c::setHeroTitle);
        set(data, "heroSubtitle", c::setHeroSubtitle);
        set(data, "heroImage", c::setHeroImage);
        set(data, "slide1Tag", c::setSlide1Tag);
        set(data, "slide1Title", c::setSlide1Title);
        set(data, "slide1Text", c::setSlide1Text);
        set(data, "slide1Icon", c::setSlide1Icon);
        set(data, "slide1Link", c::setSlide1Link);
        set(data, "slide1Image", c::setSlide1Image);
        set(data, "slide2Tag", c::setSlide2Tag);
        set(data, "slide2Title", c::setSlide2Title);
        set(data, "slide2Text", c::setSlide2Text);
        set(data, "slide2Icon", c::setSlide2Icon);
        set(data, "slide2Link", c::setSlide2Link);
        set(data, "slide2Image", c::setSlide2Image);
        set(data, "phone", c::setPhone);
        set(data, "email", c::setEmail);
        set(data, "telegram", c::setTelegram);
        set(data, "city", c::setCity);
        set(data, "deliveryText", c::setDeliveryText);
        return repository.save(c);
    }

    private void set(Map<String, String> data, String key, Consumer<String> setter) {
        if (data.containsKey(key)) {
            setter.accept(data.get(key));
        }
    }
}
