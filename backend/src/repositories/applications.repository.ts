import type { Db } from "../db/database.ts";
import type { ApplicationDbo } from "../models/application.ts";

interface StudentApplicationParams {
  studentId: number;
}

interface ApplicationKeyParams {
  id: number;
  studentId: number;
}

interface CreateApplicationParams {
  offerId: number;
  studentId: number;
  message: string | null;
}

interface OfferParams {
  offerId: number;
}

const applicationSelect = `
  SELECT a.id, a.offer_id, o.title AS offer_title, c.short_name AS company_short_name,
         ay.label AS academic_year_label, p.code AS period_code, a.student_id,
         a.message, a.status, a.applied_at
  FROM applications a
  JOIN offers o ON o.id = a.offer_id
  JOIN companies c ON c.id = o.company_id
  JOIN academic_years ay ON ay.id = o.academic_year_id
  JOIN periods p ON p.id = o.period_id
`;

export const createApplicationsRepository = (db: Db) => {
  const findByStudent = db.prepare<StudentApplicationParams, ApplicationDbo>(`
    ${applicationSelect}
    WHERE a.student_id = @studentId
    ORDER BY a.applied_at DESC, a.id DESC
  `);

  const findByIdForStudent = db.prepare<ApplicationKeyParams, ApplicationDbo>(`
    ${applicationSelect}
    WHERE a.id = @id AND a.student_id = @studentId
  `);

  const findPublishedOffer = db.prepare<OfferParams, { id: number }>(`
    SELECT id FROM offers WHERE id = @offerId AND status = 'PUBLISHED'
  `);

  const findActiveByOfferAndStudent = db.prepare<
    { offerId: number; studentId: number },
    { id: number }
  >(`
    SELECT id
    FROM applications
    WHERE offer_id = @offerId AND student_id = @studentId AND status <> 'WITHDRAWN'
  `);

  const insert = db.prepare<CreateApplicationParams>(`
    INSERT INTO applications (offer_id, student_id, message)
    VALUES (@offerId, @studentId, @message)
  `);

  const withdraw = db.prepare<ApplicationKeyParams>(`
    UPDATE applications
    SET status = 'WITHDRAWN'
    WHERE id = @id AND student_id = @studentId AND status = 'IN_PROGRESS'
  `);

  return {
    findByStudent: (studentId: number): ApplicationDbo[] => findByStudent.all({ studentId }),
    findByIdForStudent: (id: number, studentId: number): ApplicationDbo | undefined =>
      findByIdForStudent.get({ id, studentId }),
    hasPublishedOffer: (offerId: number): boolean =>
      findPublishedOffer.get({ offerId }) !== undefined,
    hasActiveForOffer: (offerId: number, studentId: number): boolean =>
      findActiveByOfferAndStudent.get({ offerId, studentId }) !== undefined,
    create: (offerId: number, studentId: number, message: string | null): ApplicationDbo => {
      const result = insert.run({ offerId, studentId, message });
      return findByIdForStudent.get({ id: Number(result.lastInsertRowid), studentId })!;
    },
    withdraw: (id: number, studentId: number): boolean =>
      withdraw.run({ id, studentId }).changes === 1,
  };
};

export type ApplicationsRepository = ReturnType<typeof createApplicationsRepository>;
