package com.healthcare.hms.service;

import com.healthcare.hms.dto.BillDto;
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
    public Bill generateBill(Long appointmentId, BillDto billDto) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        double calculatedMedicationFee = 0.0;
        Prescription prescription = prescriptionRepository.findByAppointmentId(appointmentId).orElse(null);
        if (prescription != null) {
            for (PrescribedMedication pm : prescription.getMedications()) {
                calculatedMedicationFee += pm.getMedication().getPrice() * pm.getQuantity();
            }
        }

        // Use the calculated fee if the provided one is 0.0 or null
        Double medicationFee = (billDto.getMedicationFee() != null && billDto.getMedicationFee() > 0) 
            ? billDto.getMedicationFee() 
            : calculatedMedicationFee;

        Double labFee = billDto.getLaboratoryFee() != null ? billDto.getLaboratoryFee() : 0.0;
        Double totalAmount = billDto.getConsultationFee() + labFee + medicationFee;

        Bill bill = Bill.builder()
                .appointment(appointment)
                .consultationFee(billDto.getConsultationFee())
                .medicationFee(medicationFee)
                .laboratoryFee(labFee)
                .totalAmount(totalAmount)
                .status(BillStatus.UNPAID)
                .build();

        return billRepository.save(bill);
    }

    @Transactional
    public Bill payBill(Long billId) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));

        bill.setStatus(BillStatus.PAID);
        return billRepository.save(bill);
    }

    public List<Bill> getPatientBills(Long patientUserId) {
        return billRepository.findByAppointmentPatientUserId(patientUserId);
    }
}
