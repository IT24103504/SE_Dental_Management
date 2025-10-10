package com.xraylab.repository;

import com.xraylab.model.EmergencyXRayRequest;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class EmergencyXRayRequestRepository {

    private Connection getConnection() throws SQLException {
        return DriverManager.getConnection(
                "jdbc:sqlserver://localhost:1433;databaseName=smilecare;encrypt=false;trustServerCertificate=true",
                "sa", "1234"
        );
    }

    public List<EmergencyXRayRequest> findAll() {
        List<EmergencyXRayRequest> requests = new ArrayList<>();
        String sql = "SELECT Id, PatientName, RequestDate, Type, Status, Notes, ImagePath, CreatedBy FROM EmergencyXRayRequests ORDER BY RequestDate DESC";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                EmergencyXRayRequest request = mapResultSetToRequest(rs);
                requests.add(request);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return requests;
    }

    public void create(EmergencyXRayRequest request) {
        String sql = "INSERT INTO EmergencyXRayRequests (PatientName, Type, Notes, ImagePath, CreatedBy) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, request.getPatientName());
            stmt.setString(2, request.getType());
            stmt.setString(3, request.getNotes());
            stmt.setString(4, request.getImagePath());
            stmt.setString(5, request.getCreatedBy());
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void delete(int id) {
        String sql = "DELETE FROM EmergencyXRayRequests WHERE Id = ?";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private EmergencyXRayRequest mapResultSetToRequest(ResultSet rs) throws SQLException {
        EmergencyXRayRequest request = new EmergencyXRayRequest();
        request.setId(rs.getInt("Id"));
        request.setPatientName(rs.getString("PatientName"));
        request.setRequestDate(rs.getTimestamp("RequestDate").toLocalDateTime());
        request.setType(rs.getString("Type"));
        request.setStatus(rs.getString("Status"));
        request.setNotes(rs.getString("Notes"));
        request.setImagePath(rs.getString("ImagePath"));
        request.setCreatedBy(rs.getString("CreatedBy"));
        return request;
    }
}