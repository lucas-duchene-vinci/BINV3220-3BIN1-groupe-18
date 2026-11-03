import { Router } from "express";
import { toApplicationDto } from "../mappers/application.mapper.ts";
import { getCurrentUser } from "../middlewares/authenticate.ts";
import { authorize } from "../middlewares/authorize.ts";
import type { ApplicationsService } from "../services/applications.service.ts";
import { canManageApplications } from "../services/permissions.ts";
import { HttpError } from "../utils/httpError.ts";

const MAX_MESSAGE_LENGTH = 1000;

const parseOfferId = (value: unknown): number => {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new HttpError(400, "INVALID_BODY", "offerId doit être un entier positif");
  }
  return value;
};

const parseApplicationId = (value: unknown): number => {
  if (typeof value !== "string") {
    throw new HttpError(400, "INVALID_PARAM", "L'identifiant de candidature est invalide");
  }
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "INVALID_PARAM", "L'identifiant de candidature est invalide");
  }
  return id;
};

const parseMessage = (value: unknown): string | null => {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") {
    throw new HttpError(400, "INVALID_BODY", "message doit être une chaîne de caractères");
  }
  const message = value.trim();
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new HttpError(
      400,
      "INVALID_BODY",
      `message ne peut pas dépasser ${MAX_MESSAGE_LENGTH} caractères`,
    );
  }
  return message === "" ? null : message;
};

export const createApplicationsRouter = (applicationsService: ApplicationsService) => {
  const router = Router();

  router.get("/", authorize(canManageApplications), (req, res) => {
    res.json(
      applicationsService
        .listApplications(getCurrentUser(req))
        .map(toApplicationDto),
    );
  });

  router.post("/", authorize(canManageApplications), (req, res) => {
    if (typeof req.body !== "object" || req.body === null || Array.isArray(req.body)) {
      throw new HttpError(400, "INVALID_BODY", "Le corps de la requête est invalide");
    }
    const application = applicationsService.apply(
      getCurrentUser(req),
      parseOfferId(req.body.offerId),
      parseMessage(req.body.message),
    );
    res.status(201).json(toApplicationDto(application));
  });

  router.delete("/:id", authorize(canManageApplications), (req, res) => {
    const application = applicationsService.withdraw(
      getCurrentUser(req),
      parseApplicationId(req.params.id),
    );
    res.json(toApplicationDto(application));
  });

  return router;
};
