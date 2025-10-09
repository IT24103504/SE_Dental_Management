package com.smilecare.repository;

import com.smilecare.model.Appointment;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.*;

@Repository
public class AppointmentRepository {

    private Connection getConnection() throws SQLException {
        return DriverManager.getConnection(
                "jdbc:sqlserver://localhost:1433;databaseName=smilecare;encrypt=false;trustServerCertificate=true",
                "sa", "1234"
        );
    }

    public List<Appointment> findPending() {
        List<Appointment> appointments = new ArrayList<>();
        String sql = "SELECT * FROM Appointments WHERE Status = 'PENDING' ORDER BY AppointmentDateTime";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                appointments.add(mapResultSetToAppointment(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return appointments;
    }

    public List<Appointment> findAccepted() {
        List<Appointment> appointments = new ArrayList<>();
        String sql = "SELECT * FROM AcceptedAppointments WHERE Status = 'ACCEPTED' ORDER BY AppointmentDateTime";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                appointments.add(mapResultSetToAcceptedAppointment(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return appointments;
    }

    public List<Appointment> findAllAccepted() {
        List<Appointment> appointments = new ArrayList<>();
        String sql = "SELECT * FROM AcceptedAppointments ORDER BY AppointmentDateTime DESC";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                appointments.add(mapResultSetToAcceptedAppointment(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return appointments;
    }

    public List<Appointment> findRecent() {
        List<Appointment> appointments = new ArrayList<>();
        String sql = "SELECT TOP 4 * FROM AcceptedAppointments WHERE Status = 'COMPLETED' ORDER BY AppointmentDateTime DESC";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                appointments.add(mapResultSetToAcceptedAppointment(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return appointments;
    }

    public boolean updateStatus(String appointmentId, String status) {
        String sql = "UPDATE Appointments SET Status = ? WHERE AppointmentId = ?";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, status);
            stmt.setString(2, appointmentId);
            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean addToAcceptedAppointments(String appointmentId) {
        // First get the appointment details
        Appointment appointment = findAppointmentById(appointmentId);
        if (appointment == null) {
            return false;
        }

        String sql = "INSERT INTO AcceptedAppointments (AppointmentId, PatientName, PatientGender, PatientAge, PatientContact, Notes, AppointmentDateTime, DentistId, Status) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACCEPTED')";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, appointment.getAppointmentId());
            stmt.setString(2, appointment.getPatientName());
            stmt.setString(3, appointment.getPatientGender());
            stmt.setInt(4, appointment.getPatientAge());
            stmt.setString(5, appointment.getPatientContact());
            stmt.setString(6, appointment.getNotes());
            stmt.setTimestamp(7, Timestamp.valueOf(appointment.getAppointmentDateTime()));
            stmt.setInt(8, 1); // Dentist ID

            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean deleteAcceptedAppointment(String appointmentId) {
        String sql = "DELETE FROM AcceptedAppointments WHERE AppointmentId = ?";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, appointmentId);
            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    private Appointment findAppointmentById(String appointmentId) {
        String sql = "SELECT * FROM Appointments WHERE AppointmentId = ?";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, appointmentId);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToAppointment(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public Map<String, Integer> getStats() {
        Map<String, Integer> stats = new HashMap<>();
        String sql = "SELECT " +
                "(SELECT COUNT(*) FROM Appointments WHERE Status = 'PENDING') as pending, " +
                "(SELECT COUNT(*) FROM AcceptedAppointments WHERE Status = 'ACCEPTED') as accepted, " +
                "(SELECT COUNT(*) FROM AcceptedAppointments WHERE Status = 'COMPLETED') as recent";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            if (rs.next()) {
                stats.put("pending", rs.getInt("pending"));
                stats.put("accepted", rs.getInt("accepted"));
                stats.put("recent", rs.getInt("recent"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return stats;
    }

    private Appointment mapResultSetToAppointment(ResultSet rs) throws SQLException {
        Appointment appointment = new Appointment();
        appointment.setAppointmentId(rs.getString("AppointmentId"));
        appointment.setPatientName(rs.getString("PatientName"));
        appointment.setPatientGender(rs.getString("PatientGender"));
        appointment.setPatientAge(rs.getInt("PatientAge"));
        appointment.setPatientContact(rs.getString("PatientContact"));
        appointment.setNotes(rs.getString("Notes"));
        appointment.setAppointmentDateTime(rs.getTimestamp("AppointmentDateTime").toLocalDateTime());
        appointment.setStatus(rs.getString("Status"));
        appointment.setCreatedDate(rs.getTimestamp("CreatedDate").toLocalDateTime());
        return appointment;
    }

    private Appointment mapResultSetToAcceptedAppointment(ResultSet rs) throws SQLException {
        Appointment appointment = new Appointment();
        appointment.setAppointmentId(rs.getString("AppointmentId"));
        appointment.setPatientName(rs.getString("PatientName"));
        appointment.setPatientGender(rs.getString("PatientGender"));
        appointment.setPatientAge(rs.getInt("PatientAge"));
        appointment.setPatientContact(rs.getString("PatientContact"));
        appointment.setNotes(rs.getString("Notes"));
        appointment.setAppointmentDateTime(rs.getTimestamp("AppointmentDateTime").toLocalDateTime());
        appointment.setStatus(rs.getString("Status"));
        appointment.setCreatedDate(rs.getTimestamp("AcceptedDate").toLocalDateTime());
        return appointment;
    }
}