import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { OFFER, STUDENT } from "../src/db/seed/seedIds.ts";
import { createTestApp, tokenFor } from "./helpers/testApp.ts";

let app: ReturnType<typeof createTestApp>;

beforeEach(() => {
  app = createTestApp();
});

const asStudent = (id: number) => tokenFor("STUDENT", id);

describe("POST /applications", () => {
  it("crée une candidature avec un message facultatif", async () => {
    const response = await request(app)
      .post("/applications")
      .set("Authorization", asStudent(STUDENT.LUCAS_DUPONT))
      .send({ offerId: OFFER.INTERNAL_CHATBOT, message: "  Mon message  " });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      offerId: OFFER.INTERNAL_CHATBOT,
      message: "Mon message",
      status: "IN_PROGRESS",
    });
  });

  it("accepte une candidature sans message et refuse une offre non publiée", async () => {
    const created = await request(app)
      .post("/applications")
      .set("Authorization", asStudent(STUDENT.LUCAS_DUPONT))
      .send({ offerId: OFFER.DATA_QUALITY });
    expect(created.status).toBe(201);
    expect(created.body.message).toBeNull();

    const unpublished = await request(app)
      .post("/applications")
      .set("Authorization", asStudent(STUDENT.LUCAS_DUPONT))
      .send({ offerId: OFFER.CLIENT_PORTAL });
    expect(unpublished.status).toBe(409);
    expect(unpublished.body.error.code).toBe("OFFER_NOT_PUBLISHED");
  });

  it("refuse un message qui dépasse la limite autorisée", async () => {
    const response = await request(app)
      .post("/applications")
      .set("Authorization", asStudent(STUDENT.LUCAS_DUPONT))
      .send({ offerId: OFFER.DATA_QUALITY, message: "x".repeat(1001) });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_BODY");
  });

  it("refuse une seconde candidature active sur la même offre", async () => {
    const response = await request(app)
      .post("/applications")
      .set("Authorization", asStudent(STUDENT.LUCAS_DUPONT))
      .send({ offerId: OFFER.FLEET_APP });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("APPLICATION_EXISTS");
  });
});

describe("GET /applications", () => {
  it("ne retourne que les candidatures de l'étudiant connecté", async () => {
    const lucas = await request(app)
      .get("/applications")
      .set("Authorization", asStudent(STUDENT.LUCAS_DUPONT));
    const ines = await request(app)
      .get("/applications")
      .set("Authorization", asStudent(STUDENT.INES_HADDAD));

    expect(lucas.status).toBe(200);
    expect(ines.status).toBe(200);
    expect(lucas.body).toHaveLength(1);
    expect(lucas.body[0]).toMatchObject({
      id: 1,
      offerId: OFFER.FLEET_APP,
      status: "IN_PROGRESS",
    });
    expect(ines.body).toHaveLength(2);
    expect(ines.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 2, status: "IN_PROGRESS" }),
        expect.objectContaining({ id: 5, status: "WITHDRAWN" }),
      ]),
    );
    expect(ines.body.every((application: { id: number }) => application.id !== 1)).toBe(true);
  });

  it("retourne les statuts métier d'une candidature", async () => {
    const selected = await request(app)
      .get("/applications")
      .set("Authorization", asStudent(STUDENT.MATEUSZ_KOWALSKI));
    const rejected = await request(app)
      .get("/applications")
      .set("Authorization", asStudent(STUDENT.LEA_MERTENS));

    expect(selected.body).toEqual([
      expect.objectContaining({ id: 3, status: "SELECTED" }),
    ]);
    expect(rejected.body).toEqual([
      expect.objectContaining({ id: 4, status: "REJECTED" }),
    ]);
  });

  it("retourne une liste vide pour un étudiant sans candidature", async () => {
    const response = await request(app)
      .get("/applications")
      .set("Authorization", asStudent(STUDENT.DMYTRO_KOVALENKO));

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});

describe("DELETE /applications/:id", () => {
  it("retire une candidature en cours", async () => {
    const response = await request(app)
      .delete("/applications/1")
      .set("Authorization", asStudent(STUDENT.LUCAS_DUPONT));

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("WITHDRAWN");
  });

  it("refuse le retrait d'une candidature déjà traitée", async () => {
    const response = await request(app)
      .delete("/applications/3")
      .set("Authorization", asStudent(STUDENT.MATEUSZ_KOWALSKI));

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("APPLICATION_PROCESSED");
  });

  it("refuse le retrait d'une candidature appartenant à un autre étudiant", async () => {
    const response = await request(app)
      .delete("/applications/2")
      .set("Authorization", asStudent(STUDENT.LUCAS_DUPONT));

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("APPLICATION_NOT_FOUND");
  });

  it("autorise une nouvelle candidature après retrait", async () => {
    await request(app)
      .delete("/applications/1")
      .set("Authorization", asStudent(STUDENT.LUCAS_DUPONT));

    const response = await request(app)
      .post("/applications")
      .set("Authorization", asStudent(STUDENT.LUCAS_DUPONT))
      .send({ offerId: OFFER.FLEET_APP });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("IN_PROGRESS");
  });
});
