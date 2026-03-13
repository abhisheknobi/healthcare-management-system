package com.healthcare.hms.service;

import com.healthcare.hms.dto.BillDto;
import com.healthcare.hms.dto.BillResponseDto;
import com.healthcare.hms.exception.ResourceNotFoundException;
import com.healthcare.hms.model.*;
import com.healthcare.hms.repository.AppointmentRepository;
import com.healthcare.hms.repository.BillRepository;
import com.healthcare.hms.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BillService {

    private final BillRepository billRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;

    @Transactional
    public BillResponseDto generateBill(Long appointmentId, BillDto billDto) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        double calculatedMedicationFee = 0.0;
        Prescription prescription = prescriptionRepository.findByAppointmentId(appointmentId).orElse(null);
        if (prescription != null) {
            for (PrescribedMedication pm : prescription.getMedications()) {
                if (pm.getMedication() != null && pm.getMedication().getPrice() != null && pm.getQuantity() != null) {
                    calculatedMedicationFee += pm.getMedication().getPrice() * pm.getQuantity();
                }
            }
        }

        // Use the calculated fee if the provided one is null or 0.0
        Double medicationFee = (billDto.getMedicationFee() != null && billDto.getMedicationFee() > 0) 
            ? billDto.getMedicationFee() 
            : calculatedMedicationFee;

        Double labFee = billDto.getLaboratoryFee() != null ? billDto.getLaboratoryFee() : 0.0;
        Double consultationFee = billDto.getConsultationFee() != null ? billDto.getConsultationFee() : 0.0;
        Double totalAmount = consultationFee + labFee + medicationFee;

        // Implement UPSERT for Bill to prevent duplicate key errors
        Bill bill = billRepository.findByAppointmentId(appointmentId).orElse(new Bill());
        
        if (bill.getId() == null) {
            bill.setAppointment(appointment);
        }
        
        bill.setConsultationFee(consultationFee);
        bill.setMedicationFee(medicationFee);
        bill.setLaboratoryFee(labFee);
        bill.setTotalAmount(totalAmount);
        bill.setStatus(BillStatus.UNPAID);

        bill = billRepository.save(bill);
        return mapToDto(bill);
    }

    @Transactional
    public BillResponseDto payBill(Long billId) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));

        bill.setStatus(BillStatus.PAID);
        bill = billRepository.save(bill);
        return mapToDto(bill);
    }

    public List<BillResponseDto> getPatientBills(Long patientUserId) {
        return billRepository.findByAppointmentPatientUserId(patientUserId).stream()
                .map(this::mapToDto)
                .toList();
    }

    public List<BillResponseDto> getAllBills() {
        return billRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    private BillResponseDto mapToDto(Bill bill) {
        return BillResponseDto.builder()
                .id(bill.getId())
                .appointmentId(bill.getAppointment().getId())
                .patientName(bill.getAppointment().getPatient().getUser().getFirstName() + " " +
                        bill.getAppointment().getPatient().getUser().getLastName())
                .consultationFee(bill.getConsultationFee())
                .medicationFee(bill.getMedicationFee())
                .laboratoryFee(bill.getLaboratoryFee())
                .totalAmount(bill.getTotalAmount())
                .status(bill.getStatus().name())
                .createdAt(bill.getCreatedAt())
                .updatedAt(bill.getUpdatedAt())
                .build();
    }
}
