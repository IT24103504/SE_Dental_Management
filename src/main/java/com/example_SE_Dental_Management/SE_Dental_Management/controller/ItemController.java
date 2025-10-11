package com.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.dto.ApiResponse;
import com.dto.ItemRequest;
import com.dto.ItemResponse;
import com.exception.ItemNotFoundException;
import com.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ItemController {

    @Autowired
    private ItemService itemService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getAllItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {

        try {
            List<ItemResponse> items = itemService.getAllItems(search, status);
            return ResponseEntity.ok(ApiResponse.success(items, "Items retrieved successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<ItemResponse>>error("Failed to retrieve items: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemResponse>> getItemById(@PathVariable Long id) {
        try {
            ItemResponse item = itemService.getItemById(id);
            return ResponseEntity.ok(ApiResponse.success(item, "Item retrieved successfully"));
        } catch (ItemNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<ItemResponse>error("Item not found with id: " + id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<ItemResponse>error("Failed to retrieve item: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ItemResponse>> createItem(@RequestBody ItemRequest request) {
        try {
            // Basic validation
            if (request.getName() == null || request.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.<ItemResponse>error("Item name is required"));
            }

            ItemResponse item = itemService.createItem(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(item, "Item created successfully"));
        } catch (IllegalArgumentException e) {
            // Handle validation errors from service
            return ResponseEntity.badRequest()
                    .body(ApiResponse.<ItemResponse>error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<ItemResponse>error("Failed to create item: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemResponse>> updateItem(
            @PathVariable Long id,
            @RequestBody ItemRequest request) {

        try {
            // Basic validation
            if (request.getName() == null || request.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.<ItemResponse>error("Item name is required"));
            }

            ItemResponse item = itemService.updateItem(id, request);
            return ResponseEntity.ok(ApiResponse.success(item, "Item updated successfully"));
        } catch (ItemNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<ItemResponse>error("Item not found with id: " + id));
        } catch (IllegalArgumentException e) {
            // Handle validation errors from service
            return ResponseEntity.badRequest()
                    .body(ApiResponse.<ItemResponse>error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<ItemResponse>error("Failed to update item: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteItem(@PathVariable Long id) {
        try {
            itemService.deleteItem(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Item deleted successfully"));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<Void>error(e.getMessage()));
        } catch (ItemNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<Void>error("Item not found with id: " + id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Void>error("Failed to delete item: " + e.getMessage()));
        }
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv() {
        try {
            StringBuilder csv = new StringBuilder();
            csv.append("id,name,description,quantity\n");

            List<ItemResponse> items = itemService.getAllItems(null, null);

            for (ItemResponse item : items) {
                String nameEscaped = item.getName().replace("\"", "\"\"");
                String descEscaped = item.getDescription() != null ?
                        item.getDescription().replace("\"", "\"\"") : "";

                csv.append(String.format("%d,\"%s\",\"%s\",%d\n",
                        item.getId(),
                        nameEscaped,
                        descEscaped,
                        item.getQuantity()));
            }

            byte[] csvBytes = csv.toString().getBytes("UTF-8");
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "inventory.csv");
            headers.setContentLength(csvBytes.length);

            return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/localstorage")
    public ResponseEntity<String> localStorageSet(@RequestBody String jsonData) {
        System.out.println("=== LOCALSTORAGE SAVE STARTED ===");
        System.out.println("Received data length: " + jsonData.length());

        try {
            ObjectMapper mapper = new ObjectMapper();
            List<Map<String, Object>> itemsList = mapper.readValue(jsonData, new TypeReference<List<Map<String, Object>>>() {
            });

            System.out.println("Parsed " + itemsList.size() + " items to process");

            for (int i = 0; i < itemsList.size(); i++) {
                Map<String, Object> itemMap = itemsList.get(i);
                String itemName = (String) itemMap.get("name");
                Long itemId = itemMap.get("id") != null ? ((Number) itemMap.get("id")).longValue() : null;

                System.out.println("Processing item " + (i + 1) + ": " + itemName + " (ID: " + itemId + ")");

                try {
                    ItemRequest request = new ItemRequest();
                    request.setName(itemName);
                    request.setDescription((String) itemMap.get("description"));
                    Number quantityNum = (Number) itemMap.get("quantity");
                    request.setQuantity(quantityNum != null ? quantityNum.intValue() : 0);

                    if (itemId != null && itemId > 0) {
                        try {
                            System.out.println("  → Attempting to update item ID: " + itemId);
                            itemService.updateItem(itemId, request);
                            System.out.println("  → Item " + itemName + " updated successfully");
                        } catch (ItemNotFoundException e) {
                            System.out.println("  → Item ID " + itemId + " not found, creating new...");
                            ItemResponse newItem = itemService.createItem(request);
                            itemMap.put("id", newItem.getId());
                            System.out.println("  → Item " + itemName + " created with new ID: " + newItem.getId());
                        } catch (IllegalArgumentException e) {
                            System.err.println("  → VALIDATION ERROR for item " + itemName + ": " + e.getMessage());
                            // Skip this item due to validation error
                            continue;
                        }
                    } else {
                        System.out.println("  → Creating new item: " + itemName);
                        try {
                            ItemResponse newItem = itemService.createItem(request);
                            itemMap.put("id", newItem.getId());
                            System.out.println("  → Item " + itemName + " created with ID: " + newItem.getId());
                        } catch (IllegalArgumentException e) {
                            System.err.println("  → VALIDATION ERROR for item " + itemName + ": " + e.getMessage());
                            // Skip this item due to validation error
                            continue;
                        }
                    }

                } catch (Exception itemError) {
                    System.err.println("  → ERROR processing item " + itemName + ": " + itemError.getMessage());
                    itemError.printStackTrace();
                }
            }

            String updatedJson = mapper.writeValueAsString(itemsList);
            System.out.println("=== LOCALSTORAGE SAVE COMPLETED SUCCESSFULLY ===");
            return ResponseEntity.ok(updatedJson);

        } catch (Exception e) {
            System.err.println("=== LOCALSTORAGE SAVE FAILED ===");
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing localStorage data: " + e.getMessage());
        }
    }

    @GetMapping("/localstorage")
    public ResponseEntity<String> localStorageGet() {
        System.out.println("=== LOCALSTORAGE LOAD STARTED ===");
        try {
            List<ItemResponse> items = itemService.getAllItems(null, null);
            System.out.println("Found " + items.size() + " items in database");

            ObjectMapper mapper = new ObjectMapper();
            List<Map<String, Object>> formattedItems = new ArrayList<>();

            for (ItemResponse item : items) {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("id", item.getId());
                itemMap.put("name", item.getName());
                itemMap.put("description", item.getDescription());
                itemMap.put("quantity", item.getQuantity());
                formattedItems.add(itemMap);
            }

            String json = mapper.writeValueAsString(formattedItems);
            System.out.println("Returning " + formattedItems.size() + " items as JSON");
            System.out.println("=== LOCALSTORAGE LOAD COMPLETED ===");
            return ResponseEntity.ok(json);

        } catch (Exception e) {
            System.err.println("=== LOCALSTORAGE LOAD FAILED ===");
            e.printStackTrace();
            return ResponseEntity.ok("[]");
        }
    }

    // Optional: Endpoint to get validation limits for frontend
    @GetMapping("/validation-limits")
    public ResponseEntity<Map<String, Integer>> getValidationLimits() {
        Map<String, Integer> limits = new HashMap<>();
        limits.put("maxQuantity", ItemService.getMaxQuantity());
        limits.put("minQuantity", ItemService.getMinQuantity());
        return ResponseEntity.ok(limits);
    }
}