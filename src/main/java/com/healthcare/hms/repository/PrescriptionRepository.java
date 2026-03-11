package com.healthcare.hms.repository;

import com.healthcare.hms.model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByAppointmentDoctorUserId(Long doctorUserId);

    List<Prescription> findByAppointmentPatientUserId(Long patientUserId);
}
