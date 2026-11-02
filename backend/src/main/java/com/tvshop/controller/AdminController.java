package com.tvshop.controller;

import com.tvshop.domain.OrderStatus;
import com.tvshop.dto.AdminStatsResponse;
import com.tvshop.dto.AuditLogResponse;
import com.tvshop.dto.CategoryRequest;
import com.tvshop.dto.CategoryResponse;
import com.tvshop.dto.CounterpartyResponse;
import com.tvshop.dto.DescriptionRequest;
import com.tvshop.dto.GuestOrderRequest;
import com.tvshop.dto.OrderResponse;
import com.tvshop.dto.OrderStatusUpdateRequest;
import com.tvshop.dto.OrderUpdateRequest;
import com.tvshop.dto.PageResponse;
import com.tvshop.dto.ParseRequest;
import com.tvshop.dto.ParseResponse;
import com.tvshop.dto.ProductRequest;
import com.tvshop.dto.ProductResponse;
import com.tvshop.dto.SubcategoryResponse;
import com.tvshop.dto.UserResponse;
import com.tvshop.repository.OrderRepository;
import com.tvshop.repository.ProductRepository;
import com.tvshop.repository.UserRepository;
import com.tvshop.service.AiService;
import com.tvshop.service.AuditService;
import com.tvshop.service.CategoryService;
import com.tvshop.service.OrderService;
import com.tvshop.service.ProductParserService;
import com.tvshop.service.ProductService;
import com.tvshop.service.UserService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ProductService productService;
    private final CategoryService categoryService;
    private final OrderService orderService;
    private final AiService aiService;
    private final AuditService auditService;
    private final ProductParserService productParserService;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public AdminController(ProductService productService,
                           CategoryService categoryService,
                           OrderService orderService,
                           AiService aiService,
                           AuditService auditService,
                           ProductParserService productParserService,
                           ProductRepository productRepository,
                           OrderRepository orderRepository,
                           UserRepository userRepository,
                           UserService userService) {
        this.productService = productService;
        this.categoryService = categoryService;
        this.orderService = orderService;
        this.aiService = aiService;
        this.auditService = auditService;
        this.productParserService = productParserService;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    private String actor(Authentication auth) {
        return auth != null && auth.getName() != null && !"anonymousUser".equals(auth.getName())
                ? auth.getName()
                : "system";
    }

    // ---- Products ----

    @GetMapping("/products")
    public PageResponse<ProductResponse> products(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String screenSize,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return productService.list(category, q, sort, page, size, false,
                brand, screenSize, null, null, null, null, null, null, null, null, null, null);
    }

    @GetMapping("/products/{id}")
    public ProductResponse getProduct(@PathVariable Long id) {
        return productService.getById(id);
    }

    @PostMapping("/products")
    public ProductResponse createProduct(Authentication auth, @Valid @RequestBody ProductRequest req) {
        ProductResponse p = productService.create(req);
        auditService.log(actor(auth), "CREATE", "PRODUCT", p.id(), p.name());
        return p;
    }

    @PutMapping("/products/{id}")
    public ProductResponse updateProduct(Authentication auth, @PathVariable Long id, @Valid @RequestBody ProductRequest req) {
        ProductResponse p = productService.update(id, req);
        auditService.log(actor(auth), "UPDATE", "PRODUCT", id, req.name());
        return p;
    }

    @DeleteMapping("/products/{id}")
    public void deleteProduct(Authentication auth, @PathVariable Long id) {
        productService.delete(id);
        auditService.log(actor(auth), "DELETE", "PRODUCT", id, null);
    }

    @PatchMapping("/products/{id}/active")
    public ProductResponse toggleActive(Authentication auth, @PathVariable Long id, @RequestParam boolean active) {
        ProductResponse p = productService.toggleActive(id, active);
        auditService.log(actor(auth), active ? "SHOW" : "HIDE", "PRODUCT", id, p.name());
        return p;
    }

    @PatchMapping("/products/{id}/price")
    public ProductResponse updatePrice(Authentication auth, @PathVariable Long id, @RequestBody Map<String, String> body) {
        BigDecimal price = new BigDecimal(body.get("price"));
        ProductResponse p = productService.updatePrice(id, price);
        auditService.log(actor(auth), "PRICE", "PRODUCT", id, p.name() + " -> " + price);
        return p;
    }

    @PostMapping("/products/batch")
    public void batch(Authentication auth, @RequestBody Map<String, Object> body) {
        List<?> raw = (List<?>) body.get("ids");
        List<Long> ids = raw.stream().map(o -> Long.valueOf(String.valueOf(o))).toList();
        String action = String.valueOf(body.get("action"));
        productService.batch(ids, action);
        auditService.log(actor(auth), "BATCH_" + action.toUpperCase(), "PRODUCT", null, "Товаров: " + ids.size());
    }

    @PostMapping("/products/import")
    public Map<String, Integer> importProducts(Authentication auth, @RequestBody Map<String, String> body) {
        int n = productService.importCsv(body.get("csv"));
        auditService.log(actor(auth), "IMPORT", "PRODUCT", null, "Импортировано: " + n);
        return Map.of("imported", n);
    }

    @PostMapping("/parse")
    public ParseResponse parseProduct(@Valid @RequestBody ParseRequest req) {
        return productParserService.parse(req.url());
    }

    // ---- Categories ----

    @GetMapping("/categories")
    public List<CategoryResponse> categories() {
        return categoryService.listAll();
    }

    @PostMapping("/categories")
    public CategoryResponse createCategory(Authentication auth, @RequestBody CategoryRequest req) {
        CategoryResponse c = categoryService.create(req.name(), req.slug(), req.icon());
        auditService.log(actor(auth), "CREATE", "CATEGORY", c.id(), c.name());
        return c;
    }

    @DeleteMapping("/categories/{id}")
    public void deleteCategory(Authentication auth, @PathVariable Long id) {
        categoryService.delete(id);
        auditService.log(actor(auth), "DELETE", "CATEGORY", id, null);
    }

    @PatchMapping("/categories/{id}/toggle-hidden")
    public CategoryResponse toggleCategoryHidden(Authentication auth, @PathVariable Long id) {
        CategoryResponse c = categoryService.toggleHidden(id);
        auditService.log(actor(auth), "TOGGLE_HIDDEN", "CATEGORY", id, c.name());
        return c;
    }

    @PostMapping("/categories/{id}/subcategories")
    public SubcategoryResponse addSubcategory(@PathVariable Long id, @RequestBody Map<String, String> data) {
        return categoryService.addSubcategory(id, data.get("title"), data.get("query"));
    }

    @PutMapping("/subcategories/{id}")
    public SubcategoryResponse updateSubcategory(@PathVariable Long id, @RequestBody Map<String, String> data) {
        return categoryService.updateSubcategory(id, data.get("title"), data.get("query"));
    }

    @DeleteMapping("/subcategories/{id}")
    public void deleteSubcategory(@PathVariable Long id) {
        categoryService.deleteSubcategory(id);
    }

    // ---- AI ----

    @PostMapping("/ai/description")
    public Map<String, String> generateDescription(@RequestBody DescriptionRequest req) {
        String description = aiService.generateDescription(req.name(), req.brand(), req.specs());
        return Map.of("description", description);
    }

    // ---- Orders ----

    @GetMapping("/orders")
    public PageResponse<OrderResponse> orders(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String address,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sort) {
        return orderService.allOrders(status, from, to, phone, address, id, page, size, sort);
    }

    @GetMapping("/orders/export")
    public ResponseEntity<String> exportOrders() {
        String csv = orderService.exportCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=orders.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body("\uFEFF" + csv);
    }

    @GetMapping("/counterparties")
    public List<CounterpartyResponse> counterparties() {
        return orderService.counterparties();
    }

    @PutMapping("/counterparties/{key}")
    public void updateCounterparty(@PathVariable String key, @RequestBody Map<String, String> data) {
        orderService.updateCounterparty(key, data.get("name"), data.get("phone"), data.get("email"));
    }

    @DeleteMapping("/counterparties/{key}")
    public void deleteCounterparty(@PathVariable String key) {
        orderService.deleteCounterparty(key);
    }

    // ---- Users ----

    @GetMapping("/users")
    public List<UserResponse> users() {
        return userService.list();
    }

    @PatchMapping("/users/{id}/toggle-active")
    public UserResponse toggleUserActive(Authentication auth, @PathVariable Long id) {
        UserResponse u = userService.toggleActive(id);
        auditService.log(actor(auth), "TOGGLE_ACTIVE", "USER", id, u.email());
        return u;
    }

    @PutMapping("/users/{id}/password")
    public void resetUserPassword(Authentication auth, @PathVariable Long id, @RequestBody Map<String, String> data) {
        userService.resetPassword(id, data.get("password"));
        auditService.log(actor(auth), "RESET_PASSWORD", "USER", id, null);
    }

    @PostMapping("/orders")
    public OrderResponse createOrder(Authentication auth, @Valid @RequestBody GuestOrderRequest req) {
        OrderResponse o = orderService.guestOrder(req);
        auditService.log(actor(auth), "CREATE", "ORDER", o.id(), o.fullName());
        return o;
    }

    @PatchMapping("/orders/{id}/status")
    public OrderResponse updateOrderStatus(Authentication auth, @PathVariable Long id,
                                           @Valid @RequestBody OrderStatusUpdateRequest req) {
        OrderResponse o = orderService.updateStatus(id, req.status());
        auditService.log(actor(auth), "STATUS", "ORDER", id, String.valueOf(req.status()));
        return o;
    }

    @PutMapping("/orders/{id}")
    public OrderResponse updateOrder(Authentication auth, @PathVariable Long id, @RequestBody OrderUpdateRequest req) {
        OrderResponse o = orderService.update(id, req);
        auditService.log(actor(auth), "UPDATE", "ORDER", id, null);
        return o;
    }

    @GetMapping("/orders/trash")
    public List<OrderResponse> trashOrders() {
        return orderService.trash();
    }

    @DeleteMapping("/orders/{id}")
    public void deleteOrder(Authentication auth, @PathVariable Long id) {
        orderService.softDelete(id);
        auditService.log(actor(auth), "TRASH", "ORDER", id, null);
    }

    @PatchMapping("/orders/{id}/restore")
    public OrderResponse restoreOrder(Authentication auth, @PathVariable Long id) {
        OrderResponse o = orderService.restore(id);
        auditService.log(actor(auth), "RESTORE", "ORDER", id, null);
        return o;
    }

    @DeleteMapping("/orders/{id}/permanent")
    public void permanentDeleteOrder(Authentication auth, @PathVariable Long id) {
        orderService.permanentDelete(id);
        auditService.log(actor(auth), "PERMANENT_DELETE", "ORDER", id, null);
    }

    // ---- Audit log ----

    @GetMapping("/audit")
    public List<AuditLogResponse> audit() {
        return auditService.list();
    }

    // ---- Stats ----

    @GetMapping("/stats")
    public AdminStatsResponse stats() {
        return new AdminStatsResponse(
                productRepository.count(),
                orderRepository.countByDeletedFalse(),
                orderRepository.sumRevenueExcluding(OrderStatus.CANCELLED),
                userRepository.count(),
                orderRepository.countByStatusAndDeletedFalse(OrderStatus.NEW));
    }
}
