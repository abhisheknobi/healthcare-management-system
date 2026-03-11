package com.healthcare.hms.service;

import com.healthcare.hms.dto.BillDto;
import com.healthcare.hms.exception.ResourceNotFoundException;
import com.healthcare.hms.model.Appointment;
import com.healthcare.hms.model.Bill;
import com.healthcare.hms.model.BillStatus;
import com.healthcare.hms.repository.AppointmentRepository;
import com.healthcare.hms.repository.BillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BillService {

    private final BillRepository billRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional
    public Bill generateBill(Long appointmentId, BillDto billDto) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        Double labFee = billDto.getLaboratoryFee() != null ? billDto.getLaboratoryFee() : 0.0;
        Double totalAmount = billDto.getConsultationFee() + labFee + billDto.getMedicationFee();

        Bill bill = Bill.builder()
                .appointment(appointment)
                .consultationFee(billDto.getConsultationFee())
                .medicationFee(billDto.getMedicationFee() + labFee)
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
