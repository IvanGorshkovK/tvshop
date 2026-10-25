package com.tvshop.controller;

import com.tvshop.domain.OrderStatus;
import com.tvshop.dto.AdminStatsResponse;
import com.tvshop.dto.CategoryRequest;
import com.tvshop.dto.CategoryResponse;
import com.tvshop.dto.DescriptionRequest;
import com.tvshop.dto.OrderResponse;
import com.tvshop.dto.OrderStatusUpdateRequest;
import com.tvshop.dto.OrderUpdateRequest;
import com.tvshop.dto.PageResponse;
import com.tvshop.dto.ProductRequest;
import com.tvshop.dto.ProductResponse;
import com.tvshop.repository.OrderRepository;
import com.tvshop.repository.ProductRepository;
import com.tvshop.repository.UserRepository;
import com.tvshop.service.AiService;
import com.tvshop.service.CategoryService;
import com.tvshop.service.OrderService;
import com.tvshop.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
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
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public AdminController(ProductService productService,
                           CategoryService categoryService,
                           OrderService orderService,
                           AiService aiService,
                           ProductRepository productRepository,
                           OrderRepository orderRepository,
                           UserRepository userRepository) {
        this.productService = productService;
        this.categoryService = categoryService;
        this.orderService = orderService;
        this.aiService = aiService;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
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
            @RequestParam(defaultValue = "100") int size) {
        return productService.list(category, q, sort, page, size, false,
                brand, screenSize, null, null, null, null, null, null, null, null, null);
    }

    @GetMapping("/products/{id}")
    public ProductResponse getProduct(@PathVariable Long id) {
        return productService.getById(id);
    }

    @PostMapping("/products")
    public ProductResponse createProduct(@Valid @RequestBody ProductRequest req) {
        return productService.create(req);
    }

    @PutMapping("/products/{id}")
    public ProductResponse updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest req) {
        return productService.update(id, req);
    }

    @DeleteMapping("/products/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productService.delete(id);
    }

    @PatchMapping("/products/{id}/active")
    public ProductResponse toggleActive(@PathVariable Long id, @RequestParam boolean active) {
        return productService.toggleActive(id, active);
    }

    // ---- Categories ----

    @GetMapping("/categories")
    public List<CategoryResponse> categories() {
        return categoryService.list();
    }

    @PostMapping("/categories")
    public CategoryResponse createCategory(@RequestBody CategoryRequest req) {
        return categoryService.create(req.name(), req.slug(), req.icon());
    }

    @DeleteMapping("/categories/{id}")
    public void deleteCategory(@PathVariable Long id) {
        categoryService.delete(id);
    }

    // ---- AI ----

    @PostMapping("/ai/description")
    public Map<String, String> generateDescription(@RequestBody DescriptionRequest req) {
        String description = aiService.generateDescription(req.name(), req.brand(), req.specs());
        return Map.of("description", description);
    }

    // ---- Orders ----

    @GetMapping("/orders")
    public List<OrderResponse> orders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return orderService.allOrders(status, from, to);
    }

    @PatchMapping("/orders/{id}/status")
    public OrderResponse updateOrderStatus(@PathVariable Long id,
                                           @Valid @RequestBody OrderStatusUpdateRequest req) {
        return orderService.updateStatus(id, req.status());
    }

    @PutMapping("/orders/{id}")
    public OrderResponse updateOrder(@PathVariable Long id, @RequestBody OrderUpdateRequest req) {
        return orderService.update(id, req);
    }

    // ---- Stats ----

    @GetMapping("/stats")
    public AdminStatsResponse stats() {
        return new AdminStatsResponse(
                productRepository.count(),
                orderRepository.count(),
                orderRepository.sumRevenueExcluding(OrderStatus.CANCELLED),
                userRepository.count());
    }
}
