package com.repository;

import com.model.Item;
import com.util.DatabaseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class ItemRepository {

    @Autowired
    private DatabaseUtil dbUtil;

    public List<Item> findAll() {
        List<Item> items = new ArrayList<>();
        String sql = "SELECT id, name, description, quantity, created_at, updated_at FROM items ORDER BY id";

        try (Connection conn = dbUtil.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {

            while (rs.next()) {
                Item item = new Item();
                item.setId(rs.getLong("id"));
                item.setName(rs.getString("name"));
                item.setDescription(rs.getString("description"));
                item.setQuantity(rs.getInt("quantity"));
                item.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                Timestamp updatedTs = rs.getTimestamp("updated_at");
                item.setUpdatedAt(updatedTs != null ? updatedTs.toLocalDateTime() : null);
                items.add(item);
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error fetching all items", e);
        }

        return items;
    }

    public Optional<Item> findById(Long id) {
        String sql = "SELECT id, name, description, quantity, created_at, updated_at FROM items WHERE id = ?";

        try (Connection conn = dbUtil.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    Item item = new Item();
                    item.setId(rs.getLong("id"));
                    item.setName(rs.getString("name"));
                    item.setDescription(rs.getString("description"));
                    item.setQuantity(rs.getInt("quantity"));
                    item.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                    Timestamp updatedTs = rs.getTimestamp("updated_at");
                    item.setUpdatedAt(updatedTs != null ? updatedTs.toLocalDateTime() : null);
                    return Optional.of(item);
                }
                return Optional.empty();
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error fetching item with id " + id, e);
        }
    }

    public Item save(Item item) {
        try (Connection conn = dbUtil.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(
                     "INSERT INTO items (name, description, quantity, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
                     Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setString(1, item.getName());
            pstmt.setString(2, item.getDescription());
            pstmt.setInt(3, item.getQuantity());
            pstmt.setTimestamp(4, Timestamp.valueOf(item.getCreatedAt()));
            pstmt.setTimestamp(5, Timestamp.valueOf(item.getUpdatedAt()));
            pstmt.executeUpdate();

            try (ResultSet rs = pstmt.getGeneratedKeys()) {
                if (rs.next()) {
                    item.setId(rs.getLong(1));
                }
            }
            return item;

        } catch (SQLException e) {
            throw new RuntimeException("Error saving item", e);
        }
    }

    public Item update(Item item) {
        try (Connection conn = dbUtil.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(
                     "UPDATE items SET name = ?, description = ?, quantity = ?, updated_at = ? WHERE id = ?")) {

            pstmt.setString(1, item.getName());
            pstmt.setString(2, item.getDescription());
            pstmt.setInt(3, item.getQuantity());
            pstmt.setTimestamp(4, Timestamp.valueOf(LocalDateTime.now()));
            pstmt.setLong(5, item.getId());
            int rowsAffected = pstmt.executeUpdate();

            if (rowsAffected == 0) {
                throw new RuntimeException("Item not found with id: " + item.getId());
            }

            item.setUpdatedAt(LocalDateTime.now());
            return item;

        } catch (SQLException e) {
            throw new RuntimeException("Error updating item", e);
        }
    }

    public boolean deleteById(Long id) {
        try (Connection conn = dbUtil.getConnection();
             PreparedStatement pstmt = conn.prepareStatement("DELETE FROM items WHERE id = ?")) {

            pstmt.setLong(1, id);
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;

        } catch (SQLException e) {
            throw new RuntimeException("Error deleting item with id " + id, e);
        }
    }

    public List<Item> findBySearch(String search) {
        List<Item> items = new ArrayList<>();
        String sql = "SELECT id, name, description, quantity, created_at, updated_at FROM items " +
                "WHERE LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?) ORDER BY id";

        try (Connection conn = dbUtil.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            String searchPattern = "%" + search.toLowerCase() + "%";
            pstmt.setString(1, searchPattern);
            pstmt.setString(2, searchPattern);

            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    Item item = new Item();
                    item.setId(rs.getLong("id"));
                    item.setName(rs.getString("name"));
                    item.setDescription(rs.getString("description"));
                    item.setQuantity(rs.getInt("quantity"));
                    item.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                    Timestamp updatedTs = rs.getTimestamp("updated_at");
                    item.setUpdatedAt(updatedTs != null ? updatedTs.toLocalDateTime() : null);
                    items.add(item);
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error searching items", e);
        }

        return items;
    }
}