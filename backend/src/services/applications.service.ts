import { toApplication } from "../mappers/application.mapper.ts";
import type { Application } from "../models/application.ts";
import type { User } from "../models/user.ts";
import type { ApplicationsRepository } from "../repositories/applications.repository.ts";
import { isStudent } from "./permissions.ts";
import { HttpError } from "../utils/httpError.ts";

const requireStudent = (viewer: User): void => {
  if (!isStudent(viewer)) {
    throw new HttpError(403, "FORBIDDEN", "Seuls les étudiants peuvent gérer leurs candidatures");
  }
};

export const createApplicationsService = (repository: ApplicationsRepository) => ({
  listApplications: (viewer: User): Application[] => {
    requireStudent(viewer);
    return repository.findByStudent(viewer.id).map(toApplication);
  },

  apply: (viewer: User, offerId: number, message: string | null): Application => {
    requireStudent(viewer);
    if (!repository.hasPublishedOffer(offerId)) {
      throw new HttpError(409, "OFFER_NOT_PUBLISHED", "Cette offre n'est pas publiée");
    }
    if (repository.hasActiveForOffer(offerId, viewer.id)) {
      throw new HttpError(409, "APPLICATION_EXISTS", "Vous avez déjà candidaté à cette offre");
    }
    return toApplication(repository.create(offerId, viewer.id, message));
  },

  withdraw: (viewer: User, applicationId: number): Application => {
    requireStudent(viewer);
    const application = repository.findByIdForStudent(applicationId, viewer.id);
    if (application === undefined) {
      throw new HttpError(404, "APPLICATION_NOT_FOUND", "Candidature introuvable");
    }
    if (application.status !== "IN_PROGRESS") {
      throw new HttpError(409, "APPLICATION_PROCESSED", "Cette candidature a déjà été traitée");
    }
    repository.withdraw(applicationId, viewer.id);
    return toApplication(repository.findByIdForStudent(applicationId, viewer.id)!);
  },
});

export type ApplicationsService = ReturnType<typeof createApplicationsService>;
