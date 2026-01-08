package com.ecommerce.controller;

import com.ecommerce.dto.ApiResponse;
import com.ecommerce.model.CartItem;
import com.ecommerce.model.Product;
import com.ecommerce.model.User;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<CartItem>> getCart(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(cartItemRepository.findByUser(user));
    }

    @PostMapping("/add/{productId}")
    public ResponseEntity<?> addToCart(@PathVariable Long productId, 
                                      @RequestParam(defaultValue = "1") Integer quantity,
                                      Authentication authentication) {
        User user = getCurrentUser(authentication);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStockQuantity() < quantity) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Insufficient stock"));
        }

        CartItem cartItem = cartItemRepository.findByUserAndProductId(user, productId)
                .map(existing -> {
                    existing.setQuantity(existing.getQuantity() + quantity);
                    return existing;
                })
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setUser(user);
                    newItem.setProduct(product);
                    newItem.setQuantity(quantity);
                    return newItem;
                });

        cartItemRepository.save(cartItem);
        return ResponseEntity.ok(ApiResponse.success("Product added to cart"));
    }

    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<?> updateCartItem(@PathVariable Long cartItemId,
                                           @RequestParam Integer quantity,
                                           Authentication authentication) {
        User user = getCurrentUser(authentication);
        
        return cartItemRepository.findById(cartItemId)
                .filter(cartItem -> cartItem.getUser().getId().equals(user.getId()))
                .map(cartItem -> {
                    if (cartItem.getProduct().getStockQuantity() < quantity) {
                        return ResponseEntity.badRequest()
                                .body(ApiResponse.error("Insufficient stock"));
                    }
                    cartItem.setQuantity(quantity);
                    cartItemRepository.save(cartItem);
                    return ResponseEntity.ok(ApiResponse.success("Cart updated"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long cartItemId,
                                           Authentication authentication) {
        User user = getCurrentUser(authentication);
        
        return cartItemRepository.findById(cartItemId)
                .filter(cartItem -> cartItem.getUser().getId().equals(user.getId()))
                .map(cartItem -> {
                    cartItemRepository.delete(cartItem);
                    return ResponseEntity.ok(ApiResponse.success("Item removed from cart"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(Authentication authentication) {
        User user = getCurrentUser(authentication);
        cartItemRepository.deleteByUser(user);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared"));
    }

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
