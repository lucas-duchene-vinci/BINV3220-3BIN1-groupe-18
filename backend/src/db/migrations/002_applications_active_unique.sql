CREATE UNIQUE INDEX applications_active_offer_student
  ON applications (offer_id, student_id)
  WHERE status <> 'WITHDRAWN';
