package com.tvshop.config;

import com.tvshop.domain.Category;
import com.tvshop.domain.Product;
import com.tvshop.domain.Role;
import com.tvshop.domain.SpecEntry;
import com.tvshop.domain.User;
import com.tvshop.repository.CategoryRepository;
import com.tvshop.repository.ProductRepository;
import com.tvshop.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      CategoryRepository categoryRepository,
                      ProductRepository productRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedUsers();
        seedCategories();
        seedProducts();
    }

    private void seedUsers() {
        if (userRepository.count() > 0) {
            return;
        }
        User admin = new User();
        admin.setEmail("admin@tvspace.ru");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setFullName("Администратор");
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        User customer = new User();
        customer.setEmail("customer@tvspace.ru");
        customer.setPassword(passwordEncoder.encode("customer123"));
        customer.setFullName("Иван Петров");
        customer.setRole(Role.CUSTOMER);
        userRepository.save(customer);
    }

    private void seedCategories() {
        if (categoryRepository.count() > 0) {
            return;
        }
        categoryRepository.save(new Category("Телевизоры", "televizory", "📺"));
        categoryRepository.save(new Category("Аудио системы", "audio-sistemy", "🔊"));
        categoryRepository.save(new Category("Проекторы", "proektory", "📽️"));
        categoryRepository.save(new Category("Кронштейны", "kronshteyny", "🔩"));
    }

    private void seedProducts() {
        if (productRepository.count() > 0) {
            return;
        }
        Category tvs = categoryRepository.findBySlug("televizory").orElseThrow();
        Category audio = categoryRepository.findBySlug("audio-sistemy").orElseThrow();
        Category proj = categoryRepository.findBySlug("proektory").orElseThrow();

        // --- Телевизоры (Samsung, LG, Hisense, TCL) ---
        tv("Samsung QLED 55\" QE55Q60C 4K Smart TV", "samsung-qe55q60c", "64990", "74990",
                "Samsung", 55, "4K UHD", "QLED", 60, "HDR10+", "Tizen", 12, tvs,
                "QLED-телевизор Samsung с технологией Quantum Dot и платформой Tizen.");
        tv("Samsung Crystal UHD 75\" CU7170", "samsung-cu7170-75", "99990", "119990",
                "Samsung", 75, "4K UHD", "LED", 60, "HDR10+", "Tizen", 4, tvs,
                "Большой экран Crystal UHD с технологией PurColor.");
        tv("LG OLED 65\" OLED65C3 4K Smart TV", "lg-oled65c3", "129990", "149990",
                "LG", 65, "4K UHD", "OLED", 120, "Dolby Vision, HDR10", "webOS", 5, tvs,
                "OLED-панель с идеальным чёрным и процессором α9 Gen6.");
        tv("LG NanoCell 50\" 50NANO77 4K Smart TV", "lg-50nano77", "45990", "52990",
                "LG", 50, "4K UHD", "NanoCell", 60, "HDR10", "webOS", 9, tvs,
                "NanoCell-телевизор с чистыми цветами и WebOS.");
        tv("Hisense 50\" 50A6K 4K Smart TV", "hisense-50a6k", "29990", "34990",
                "Hisense", 50, "4K UHD", "LED", 60, "Dolby Vision, HDR10", "VIDAA", 15, tvs,
                "4K-телевизор Hisense с Dolby Vision и VIDAA OS.");
        tv("Hisense 65\" 65E7KQ QLED 4K Smart TV", "hisense-65e7kq", "64990", "74990",
                "Hisense", 65, "4K UHD", "QLED", 120, "Dolby Vision, HDR10+", "VIDAA", 7, tvs,
                "QLED-экран, поддержка 120 Гц и игровых режимов.");
        tv("TCL 55\" 55C645 QLED 4K Smart TV", "tcl-55c645", "42990", "49990",
                "TCL", 55, "4K UHD", "QLED", 60, "HDR10+, Dolby Vision", "Google TV", 11, tvs,
                "QLED-телевизор TCL на Google TV с HDR10+.");
        tv("TCL 43\" 43P635 4K Smart TV", "tcl-43p635", "24990", "28990",
                "TCL", 43, "4K UHD", "LED", 60, "HDR10", "Google TV", 18, tvs,
                "Компактный 4K-телевизор TCL для спальни или кухни.");

        // --- Hisense: серии A5S / E7S / E7S PRO / U7S / U7S PRO ---
        hisenseTv("Hisense 32A5S HD Smart TV", "hisense-32a5s", "16990", null,
                32, "HD", "LED", 60, "Нет", 10, 20, tvs,
                "Компактный HD-телевизор для кухни или дачи.");
        hisenseTv("Hisense 43E7S 4K UHD Smart TV", "hisense-43e7s", "24990", null,
                43, "4K UHD", "LED", 60, "HDR10", 20, 15, tvs,
                "4K-телевизор с Direct LED и VIDAA.");
        hisenseTv("Hisense 55E7S 4K UHD Smart TV", "hisense-55e7s", "34990", null,
                55, "4K UHD", "LED", 60, "HDR10", 20, 12, tvs,
                "4K-телевизор с Direct LED и VIDAA.");
        hisenseTv("Hisense 65E7S 4K UHD Smart TV", "hisense-65e7s", "44990", null,
                65, "4K UHD", "LED", 60, "HDR10", 20, 10, tvs,
                "4K-телевизор с Direct LED и VIDAA.");
        hisenseTv("Hisense 75E7S 4K UHD Smart TV", "hisense-75e7s", "59990", null,
                75, "4K UHD", "LED", 60, "HDR10", 20, 6, tvs,
                "Большой 4K-экран с Direct LED.");
        hisenseTv("Hisense 85E7S 4K UHD Smart TV", "hisense-85e7s", "79990", null,
                85, "4K UHD", "LED", 60, "HDR10", 20, 4, tvs,
                "Огромный 4K-экран для домашнего кинотеатра.");
        hisenseTv("Hisense 50E7S PRO QLED 4K Smart TV", "hisense-50e7s-pro", "36990", null,
                50, "4K UHD", "QLED", 60, "HDR10+, Dolby Vision", 20, 10, tvs,
                "QLED-экран с технологией Quantum Dot.");
        hisenseTv("Hisense 65E7S PRO QLED 4K Smart TV", "hisense-65e7s-pro", "54990", null,
                65, "4K UHD", "QLED", 60, "HDR10+, Dolby Vision", 20, 8, tvs,
                "QLED-экран с технологией Quantum Dot.");
        hisenseTv("Hisense 75E7S PRO QLED 4K Smart TV", "hisense-75e7s-pro", "74990", null,
                75, "4K UHD", "QLED", 60, "HDR10+, Dolby Vision", 20, 6, tvs,
                "QLED-экран с технологией Quantum Dot.");
        hisenseTv("Hisense 85E7S PRO QLED 4K Smart TV", "hisense-85e7s-pro", "99990", null,
                85, "4K UHD", "QLED", 60, "HDR10+, Dolby Vision", 20, 4, tvs,
                "QLED-экран с технологией Quantum Dot.");
        hisenseTv("Hisense 100E7Q PRO QLED 4K Smart TV", "hisense-100e7q-pro", "149990", null,
                100, "4K UHD", "QLED", 60, "HDR10+, Dolby Vision", 30, 3, tvs,
                "100-дюймовый QLED-экран для домашнего кино.");
        hisenseTv("Hisense 50U7S Mini-LED 4K 144Hz Smart TV", "hisense-50u7s", "49990", null,
                50, "4K UHD", "Mini-LED", 144, "Dolby Vision, HDR10+", 40, 8, tvs,
                "Mini-LED ULED-телевизор с частотой 144 Гц.");
        hisenseTv("Hisense 55U7S Mini-LED 4K 144Hz Smart TV", "hisense-55u7s", "59990", null,
                55, "4K UHD", "Mini-LED", 144, "Dolby Vision, HDR10+", 40, 7, tvs,
                "Mini-LED ULED-телевизор с частотой 144 Гц.");
        hisenseTv("Hisense 65U7S Mini-LED 4K 144Hz Smart TV", "hisense-65u7s", "79990", null,
                65, "4K UHD", "Mini-LED", 144, "Dolby Vision, HDR10+", 40, 6, tvs,
                "Mini-LED ULED-телевизор с частотой 144 Гц.");
        hisenseTv("Hisense 75U7S Mini-LED 4K 144Hz Smart TV", "hisense-75u7s", "109990", null,
                75, "4K UHD", "Mini-LED", 144, "Dolby Vision, HDR10+", 40, 4, tvs,
                "Mini-LED ULED-телевизор с частотой 144 Гц.");
        hisenseTv("Hisense 85U7S Mini-LED 4K 144Hz Smart TV", "hisense-85u7s", "139990", null,
                85, "4K UHD", "Mini-LED", 144, "Dolby Vision, HDR10+", 40, 3, tvs,
                "Mini-LED ULED-телевизор с частотой 144 Гц.");
        hisenseTv("Hisense 100U7Q Mini-LED 4K 144Hz Smart TV", "hisense-100u7q", "199990", null,
                100, "4K UHD", "Mini-LED", 144, "Dolby Vision, HDR10+", 60, 2, tvs,
                "100-дюймовый Mini-LED ULED-телевизор.");
        hisenseTv("Hisense 50U7S PRO Mini-LED 4K 144Hz Smart TV", "hisense-50u7s-pro", "59990", null,
                50, "4K UHD", "Mini-LED", 144, "Dolby Vision, HDR10+", 40, 6, tvs,
                "Mini-LED ULED с повышенной яркостью.");
        hisenseTv("Hisense 55U7S PRO Mini-LED 4K 144Hz Smart TV", "hisense-55u7s-pro", "69990", null,
                55, "4K UHD", "Mini-LED", 144, "Dolby Vision, HDR10+", 40, 5, tvs,
                "Mini-LED ULED с повышенной яркостью.");
        hisenseTv("Hisense 65U7S PRO Mini-LED 4K 144Hz Smart TV", "hisense-65u7s-pro", "89990", null,
                65, "4K UHD", "Mini-LED", 144, "Dolby Vision, HDR10+", 40, 4, tvs,
                "Mini-LED ULED с повышенной яркостью.");
        hisenseTv("Hisense 75U7S PRO Mini-LED 4K 144Hz Smart TV", "hisense-75u7s-pro", "119990", null,
                75, "4K UHD", "Mini-LED", 144, "Dolby Vision, HDR10+", 40, 3, tvs,
                "Mini-LED ULED с повышенной яркостью.");
        hisenseTv("Hisense 85U7S PRO Mini-LED 4K 144Hz Smart TV", "hisense-85u7s-pro", "159990", null,
                85, "4K UHD", "Mini-LED", 144, "Dolby Vision, HDR10+", 40, 2, tvs,
                "Mini-LED ULED с повышенной яркостью.");
        hisenseTv("Hisense 100U7Q PRO Mini-LED 4K 144Hz Smart TV", "hisense-100u7q-pro", "249990", null,
                100, "4K UHD", "Mini-LED", 144, "Dolby Vision, HDR10+", 60, 2, tvs,
                "Флагманский 100-дюймовый Mini-LED ULED.");

        // --- Аудио системы (LG, Samsung, Hisense) ---
        audio("Саундбар Samsung HW-B550", "samsung-hw-b550", "15990", "19990",
                "Samsung", 410, "2.1", audio, "Саундбар 2.1 с беспроводным сабвуфером и DTS Virtual:X.");
        audio("Саундбар LG SQC1", "lg-sqc1", "12990", "15990",
                "LG", 320, "2.1", audio, "Компактный саундбар LG с Bluetooth и AI Sound Pro.");
        audio("Саундбар Hisense HS205", "hisense-hs205", "8990", "10990",
                "Hisense", 60, "2.0", audio, "Доступный саундбар 2.0 с беспроводным сабвуфером.");
        audio("Домашний кинотеатр Samsung HW-Q700C", "samsung-hw-q700c", "39990", "45990",
                "Samsung", 320, "3.1.2", audio, "Система 3.1.2 с Dolby Atmos и беспроводным сабвуфером.");

        // --- Проекторы (Hisense) ---
        projector("Проектор Hisense 4K Laser Cinema LS5", "hisense-ls5-4k", "99990", "119990",
                "Hisense", "4K UHD", 2500, "Лазерный", "1 000 000:1", 3, proj,
                "Лазерный UST-проектор Hisense для домашнего кинотеатра.");
        projector("Проектор Hisense C1 4K", "hisense-c1-4k", "69990", "79990",
                "Hisense", "4K UHD", 1600, "Лазерный", "1 000 000:1", 5, proj,
                "Компактный 4K-лазерный проектор с HDR10+.");
        projector("Проектор Hisense PX1-PRO 4K UST", "hisense-px1-pro", "129990", null,
                "Hisense", "4K UHD", 2200, "Лазерный", "2 000 000:1", 2, proj,
                "Флагманский ультракороткофокусный 4K-проектор.");
        projector("Проектор Hisense Smart Mini 1080p", "hisense-smart-mini", "29990", "34990",
                "Hisense", "Full HD", 300, "DLP", "10 000:1", 10, proj,
                "Портативный смарт-проектор с Android TV.");

        // --- Кронштейны ---
        Category mounts = categoryRepository.findBySlug("kronshteyny").orElseThrow();
        Product m1 = base("Кронштейн наклонно-поворотный 32–65\"", "kronshteyn-naklonno-povorotny",
                "1990", "2490", "Onkron",
                "Настенный кронштейн с наклоном и поворотом, нагрузка до 45 кг.", mounts);
        m1.setSmartTv(false);
        m1.setImageUrl(image("Onkron"));
        m1.setSpecifications(specs(
                "Тип", "Наклонно-поворотный",
                "Совместимая диагональ", "32–65\"",
                "Максимальная нагрузка", "45 кг",
                "Бренд", "Onkron"));
        productRepository.save(m1);

        Product m2 = base("Кронштейн фиксированный 26–55\"", "kronshteyn-fiksirovanny",
                "890", null, "Onkron",
                "Простой фиксированный кронштейн для телевизоров до 55 дюймов.", mounts);
        m2.setSmartTv(false);
        m2.setImageUrl(image("Onkron"));
        m2.setSpecifications(specs(
                "Тип", "Фиксированный",
                "Совместимая диагональ", "26–55\"",
                "Максимальная нагрузка", "30 кг",
                "Бренд", "Onkron"));
        productRepository.save(m2);
    }

    private void tv(String name, String slug, String price, String oldPrice,
                    String brand, int size, String resolution, String technology,
                    int refreshHz, String hdr, String os, int stock,
                    Category category, String description) {
        Product p = base(name, slug, price, oldPrice, brand, description, category);
        p.setScreenSizeInches(size);
        p.setResolution(resolution);
        p.setTechnology(technology);
        p.setRefreshRateHz(refreshHz);
        p.setHdr(hdr);
        p.setOs(os);
        p.setSmartTv(true);
        p.setStock(stock);
        p.setImageUrl(image(brand + " " + size + "\""));

        p.setSpecifications(specs(
                "Диагональ экрана", size + "\"",
                "Разрешение", resolution,
                "Тип матрицы", technology,
                "Частота обновления", refreshHz + " Гц",
                "Поддержка HDR", hdr,
                "Smart TV", "Да",
                "Операционная система", os,
                "Процессор", processorFor(brand),
                "Мощность звука", "20 Вт",
                "Количество HDMI", "3",
                "Количество USB", "2",
                "Wi-Fi", "Да",
                "Bluetooth", "Да"));

        productRepository.save(p);
    }

    private void hisenseTv(String name, String slug, String price, String oldPrice,
                           int size, String resolution, String technology,
                           int refreshHz, String hdr, int soundPowerW, int stock,
                           Category category, String description) {
        Product p = base(name, slug, price, oldPrice, "Hisense", description, category);
        p.setScreenSizeInches(size);
        p.setResolution(resolution);
        p.setTechnology(technology);
        p.setRefreshRateHz(refreshHz);
        p.setHdr(hdr);
        p.setOs("VIDAA");
        p.setSmartTv(true);
        p.setStock(stock);
        p.setImageUrl(image("Hisense " + size + "\""));

        p.setSpecifications(specs(
                "Диагональ экрана", size + "\"",
                "Разрешение", resolution,
                "Тип матрицы", technology,
                "Частота обновления", refreshHz + " Гц",
                "Поддержка HDR", hdr,
                "Smart TV", "Да",
                "Операционная система", "VIDAA",
                "Процессор", "Hi-View Engine",
                "Мощность звука", soundPowerW + " Вт",
                "Количество HDMI", "3",
                "Количество USB", "2",
                "Wi-Fi", "Да",
                "Bluetooth", "Да"));

        productRepository.save(p);
    }

    private void audio(String name, String slug, String price, String oldPrice,
                       String brand, int powerW, String channels,
                       Category category, String description) {
        Product p = base(name, slug, price, oldPrice, brand, description, category);
        p.setPowerOutputW(powerW);
        p.setChannels(channels);
        p.setSmartTv(false);
        p.setImageUrl(image(brand));

        p.setSpecifications(specs(
                "Общая выходная мощность", powerW + " Вт",
                "Количество каналов", channels,
                "Сабвуфер", "Да (беспроводной)",
                "Dolby Atmos", "3.1.2".equals(channels) ? "Да" : "Нет",
                "Bluetooth", "Да",
                "Количество HDMI", "1",
                "Оптический вход", "Да"));

        productRepository.save(p);
    }

    private void projector(String name, String slug, String price, String oldPrice,
                           String brand, String resolution, int lumens,
                           String technology, String contrast, int stock,
                           Category category, String description) {
        Product p = base(name, slug, price, oldPrice, brand, description, category);
        p.setResolution(resolution);
        p.setLuminousFluxLm(lumens);
        p.setTechnology(technology);
        p.setContrast(contrast);
        p.setOs("Android TV");
        p.setSmartTv(true);
        p.setStock(stock);
        p.setImageUrl(image(brand));

        p.setSpecifications(specs(
                "Разрешение", resolution,
                "Световой поток", lumens + " лм",
                "Тип проектора", technology,
                "Контрастность", contrast,
                "Smart TV", "Да",
                "Операционная система", "Android TV",
                "Размер изображения", "80–150\"",
                "Поддержка HDR", "HDR10+"));

        productRepository.save(p);
    }

    private Product base(String name, String slug, String price, String oldPrice,
                         String brand, String description, Category category) {
        Product p = new Product();
        p.setName(name);
        p.setSlug(slug);
        p.setDescription(description);
        p.setPrice(new BigDecimal(price));
        p.setOldPrice(oldPrice != null ? new BigDecimal(oldPrice) : null);
        p.setBrand(brand);
        p.setStock(30);
        p.setActive(true);
        p.setCategory(category);
        return p;
    }

    private String image(String label) {
        String text = label.replace(" ", "+").replace("\"", "%22");
        return "https://placehold.co/600x400/111827/f9fafb?text=" + text + "&font=roboto";
    }

    private List<SpecEntry> specs(Object... pairs) {
        List<SpecEntry> list = new ArrayList<>();
        for (int i = 0; i < pairs.length; i += 2) {
            list.add(new SpecEntry((String) pairs[i], (String) pairs[i + 1]));
        }
        return list;
    }

    private String processorFor(String brand) {
        return switch (brand) {
            case "Samsung" -> "Quantum Processor 4K";
            case "LG" -> "α5 Gen6 AI Processor";
            case "Hisense" -> "Hi-View Engine";
            case "TCL" -> "AiPQ Engine 3.0";
            default -> "Процессор обработки изображения";
        };
    }
}
