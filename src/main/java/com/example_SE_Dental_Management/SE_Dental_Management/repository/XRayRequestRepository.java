package com.smilecare.repository;

import com.smilecare.model.XRayRequest;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
public class XRayRequestRepository {

    private Connection getConnection() throws SQLException {
        return DriverManager.getConnection(
                "jdbc:sqlserver://localhost:1433;databaseName=smilecare;encrypt=false;trustServerCertificate=true",
                "sa", "1234"
        );
    }

    public void create(XRayRequest request) {
        String sql = "INSERT INTO XRayRequests (PatientName, DentistName, RequestDate, Status, Notes) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, request.getPatientName());
            stmt.setString(2, request.getDentistName());
            stmt.setTimestamp(3, Timestamp.valueOf(LocalDateTime.now()));
            stmt.setString(4, "Pending");
            stmt.setString(5, request.getNotes());

            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to create X-ray request", e);
        }
    }

    public List<XRayRequest> findAll() {
        List<XRayRequest> requests = new ArrayList<>();
        String sql = "SELECT * FROM XRayRequests ORDER BY RequestDate DESC";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                requests.add(mapResultSetToRequest(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return requests;
    }

    private XRayRequest mapResultSetToRequest(ResultSet rs) throws SQLException {
        XRayRequest request = new XRayRequest();
        request.setId(rs.getInt("Id"));
        request.setPatientName(rs.getString("PatientName"));
        request.setDentistName(rs.getString("DentistName"));
        request.setRequestDate(rs.getTimestamp("RequestDate").toLocalDateTime());
        request.setStatus(rs.getString("Status"));
        request.setNotes(rs.getString("Notes"));
        return request;
    }
}