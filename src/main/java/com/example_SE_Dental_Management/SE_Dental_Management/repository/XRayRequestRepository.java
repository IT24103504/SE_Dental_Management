package com.xraylab.repository;

import com.xraylab.model.XRayRequest;
import org.springframework.stereotype.Repository;

import java.sql.*;
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

    public List<XRayRequest> findPending() {
        List<XRayRequest> requests = new ArrayList<>();
        String sql = "SELECT Id, PatientName, RequestDate, DentistName, Status, Notes FROM XRayRequests WHERE Status = 'Pending' ORDER BY RequestDate DESC";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                XRayRequest request = mapResultSetToRequest(rs);
                requests.add(request);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return requests;
    }

    // NEW: Method to get processed requests
    public List<XRayRequest> findProcessed() {
        List<XRayRequest> requests = new ArrayList<>();
        String sql = "SELECT Id, PatientName, RequestDate, DentistName, Status, Notes FROM XRayRequests WHERE Status = 'Processed' ORDER BY RequestDate DESC";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                XRayRequest request = mapResultSetToRequest(rs);
                requests.add(request);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return requests;
    }

    public void create(XRayRequest request) {
        String sql = "INSERT INTO XRayRequests (PatientName, DentistName, Notes) VALUES (?, ?, ?)";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, request.getPatientName());
            stmt.setString(2, request.getDentistName());
            stmt.setString(3, request.getNotes());
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void update(int id, String notes, String status, String imagePath) {
        String updateRequestSql = "UPDATE XRayRequests SET Notes = ?, Status = ? WHERE Id = ?";

        try (Connection conn = getConnection()) {
            conn.setAutoCommit(false);

            try (PreparedStatement stmt = conn.prepareStatement(updateRequestSql)) {
                stmt.setString(1, notes);
                stmt.setString(2, status);
                stmt.setInt(3, id);
                stmt.executeUpdate();
            }

            if (imagePath != null) {
                String insertImageSql = "INSERT INTO XRayImages (RequestId, ImagePath, Notes, Status) VALUES (?, ?, ?, 'Uploaded')";
                try (PreparedStatement stmt = conn.prepareStatement(insertImageSql)) {
                    stmt.setInt(1, id);
                    stmt.setString(2, imagePath);
                    stmt.setString(3, notes);
                    stmt.executeUpdate();
                }
            }

            conn.commit();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void delete(int id) {
        String sql = "DELETE FROM XRayRequests WHERE Id = ?";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public List<String> getImagesForRequest(int requestId) {
        List<String> imagePaths = new ArrayList<>();
        String sql = "SELECT ImagePath FROM XRayImages WHERE RequestId = ? ORDER BY UploadDate DESC";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, requestId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                imagePaths.add(rs.getString("ImagePath"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return imagePaths;
    }

    private XRayRequest mapResultSetToRequest(ResultSet rs) throws SQLException {
        XRayRequest request = new XRayRequest();
        request.setId(rs.getInt("Id"));
        request.setPatientName(rs.getString("PatientName"));
        request.setRequestDate(rs.getTimestamp("RequestDate").toLocalDateTime());
        request.setDentistName(rs.getString("DentistName"));
        request.setStatus(rs.getString("Status"));
        request.setNotes(rs.getString("Notes"));
        request.setImagePath(null);
        return request;
    }
}