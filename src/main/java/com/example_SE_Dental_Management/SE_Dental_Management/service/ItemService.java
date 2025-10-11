package com.service;

import com.dto.ItemRequest;
import com.dto.ItemResponse;
import com.exception.ItemNotFoundException;
import com.model.Item;
import com.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    // Quantity validation constants
    private static final int MAX_QUANTITY = 10000;
    private static final int MIN_QUANTITY = 0;

    public List<ItemResponse> getAllItems(String search, String status) {
        List<Item> items;

        if (search != null && !search.trim().isEmpty()) {
            items = itemRepository.findBySearch(search.trim());
        } else {
            items = itemRepository.findAll();
        }

        if ("low".equals(status)) {
            items = items.stream()
                    .filter(item -> item.getQuantity() > 0 && item.getQuantity() <= 5)
                    .collect(Collectors.toList());
        } else if ("out".equals(status)) {
            items = items.stream()
                    .filter(item -> item.getQuantity() == 0)
                    .collect(Collectors.toList());
        }

        return items.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public ItemResponse getItemById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ItemNotFoundException(id));
        return convertToResponse(item);
    }

    public ItemResponse createItem(ItemRequest request) {
        // Validate the entire request
        validateItemRequest(request);

        Item item = new Item();
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setQuantity(request.getQuantity() != null ? request.getQuantity() : 0);
        item.setCreatedAt(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());

        Item savedItem = itemRepository.save(item);
        return convertToResponse(savedItem);
    }

    public ItemResponse updateItem(Long id, ItemRequest request) {
        // Validate the entire request
        validateItemRequest(request);

        Item existingItem = itemRepository.findById(id)
                .orElseThrow(() -> new ItemNotFoundException(id));

        existingItem.setName(request.getName());
        existingItem.setDescription(request.getDescription());
        existingItem.setQuantity(request.getQuantity() != null ? request.getQuantity() : 0);
        existingItem.setUpdatedAt(LocalDateTime.now());

        Item updatedItem = itemRepository.update(existingItem);
        return convertToResponse(updatedItem);
    }

    public void deleteItem(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ItemNotFoundException(id));

        if (item.getQuantity() > 0) {
            throw new IllegalStateException("Cannot delete item with non-zero stock: " + item.getQuantity());
        }

        itemRepository.deleteById(id);
    }

    private ItemResponse convertToResponse(Item item) {
        ItemResponse response = new ItemResponse();
        response.setId(item.getId());
        response.setName(item.getName());
        response.setDescription(item.getDescription());
        response.setQuantity(item.getQuantity());
        response.setCreatedAt(item.getCreatedAt());
        response.setUpdatedAt(item.getUpdatedAt());

        int currentQty = item.getQuantity();
        if (currentQty == 0) {
            response.setStockStatus("OUT");
        } else if (currentQty <= 5) {
            response.setStockStatus("LOW");
        } else {
            response.setStockStatus("OK");
        }

        return response;
    }

    private void validateItemRequest(ItemRequest request) {
        // Name validation
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Item name is required");
        }

        String name = request.getName().trim();
        if (name.length() > 255) {
            throw new IllegalArgumentException("Item name cannot exceed 255 characters");
        }

        // Description validation (optional field)
        if (request.getDescription() != null && request.getDescription().length() > 1000) {
            throw new IllegalArgumentException("Description cannot exceed 1000 characters");
        }

        // Quantity validation
        Integer quantity = request.getQuantity() != null ? request.getQuantity() : 0;

        if (quantity < MIN_QUANTITY) {
            throw new IllegalArgumentException("Quantity cannot be negative");
        }

        if (quantity > MAX_QUANTITY) {
            throw new IllegalArgumentException("Quantity cannot exceed " + MAX_QUANTITY);
        }
    }

    // Helper method to get limits for frontend if needed
    public static int getMaxQuantity() {
        return MAX_QUANTITY;
    }

    public static int getMinQuantity() {
        return MIN_QUANTITY;
    }
}