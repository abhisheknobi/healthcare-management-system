package com.healthcare.hms.service;

import com.healthcare.hms.dto.*;
import com.healthcare.hms.exception.ResourceNotFoundException;
import com.healthcare.hms.model.*;
import com.healthcare.hms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final MedicationRepository medicationRepository;

    @Transactional
    public AppointmentResponseDto bookAppointment(Long patientUserId, AppointmentRequestDto request) {
        PatientProfile patient = patientProfileRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        DoctorProfile doctor = doctorProfileRepository.findByUserId(request.getDoctorUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        // Concurrency control / Double booking check
        LocalDateTime start = request.getAppointmentTime().withMinute(0).withSecond(0).withNano(0);
        LocalDateTime end = start.plusHours(1);

        List<Appointment> existing = appointmentRepository.findByDoctorIdAndAppointmentTimeBetween(doctor.getId(),
                start, end);
        if (!existing.isEmpty()) {
            throw new RuntimeException("Doctor is already booked for this time slot.");
        }

        Appointment appointment = Appointment.builder()
                .doctor(doctor)
                .patient(patient)
                .appointmentTime(request.getAppointmentTime())
                .status(AppointmentStatus.PENDING)
                .build();

        appointment = appointmentRepository.save(appointment);
        return mapToDto(appointment);
    }

    @Transactional
    public AppointmentResponseDto updateStatus(Long appointmentId, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        appointment.setStatus(status);
        // Hibernate throws OptimisticLockException if concurrent updates clash on
        // version
        appointment = appointmentRepository.save(appointment);
        return mapToDto(appointment);
    }

    @Transactional
    public Prescription addPrescription(Long appointmentId, PrescriptionDto dto) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Can only add prescription to COMPLETED appointments");
        }

        Prescription prescription = Prescription.builder()
                .appointment(appointment)
                .diagnosis(dto.getDiagnosis())
                .doctorNotes(dto.getDoctorNotes())
                .build();

        prescriptionRepository.save(prescription);

        if (dto.getMedications() != null && !dto.getMedications().isEmpty()) {
            for (com.healthcare.hms.dto.MedicationItemDto item : dto.getMedications()) {
                Medication medication = medicationRepository.findById(item.getMedicationId())
                        .orElseThrow(() -> new ResourceNotFoundException("Medication not found: " + item.getMedicationId()));

                if (medication.getStockQuantity() < item.getQuantity()) {
                    throw new RuntimeException("Insufficient stock for medication: " + medication.getName());
                }

                // Deduct stock
                medication.setStockQuantity(medication.getStockQuantity() - item.getQuantity());
                medicationRepository.save(medication);

                // Save link with quantity
                PrescribedMedication prescribedMedication = PrescribedMedication.builder()
                        .prescription(prescription)
                        .medication(medication)
                        .quantity(item.getQuantity())
                        .build();
                
                // Assuming we add a repository for PrescribedMedication or save via cascade
                prescription.getMedications().add(prescribedMedication);
            }
            prescriptionRepository.save(prescription);
        }

        return prescription;
    }

    public List<AppointmentResponseDto> getDoctorAppointments(Long doctorUserId) {
        return appointmentRepository.findByDoctorUserId(doctorUserId).stream()
                .map(this::mapToDto)
                .toList();
    }

    public List<AppointmentResponseDto> getPatientAppointments(Long patientUserId) {
        return appointmentRepository.findByPatientUserId(patientUserId).stream()
                .map(this::mapToDto)
                .toList();
    }

    private AppointmentResponseDto mapToDto(Appointment appointment) {
        return AppointmentResponseDto.builder()
                .id(appointment.getId())
                .doctorUserId(appointment.getDoctor().getUser().getId())
                .doctorName(appointment.getDoctor().getUser().getFirstName() + " "
                        + appointment.getDoctor().getUser().getLastName())
                .patientUserId(appointment.getPatient().getUser().getId())
                .patientName(appointment.getPatient().getUser().getFirstName() + " "
                        + appointment.getPatient().getUser().getLastName())
                .appointmentTime(appointment.getAppointmentTime())
                .status(appointment.getStatus().name())
                .build();
    }
}
