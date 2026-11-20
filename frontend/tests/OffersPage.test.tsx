import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OffersPage from "../src/pages/OffersPage.tsx";
import { adminUser, contactUser, stubFetch, studentUser } from "./helpers/fetchMock.ts";

const offers = [
  {
    id: 2,
    title: "Refonte du portail client",
    companyShortName: "Lumen Digital",
    academicYear: "2026-2027",
    period: "P2",
    status: "SUBMITTED",
  },
  {
    id: 5,
    title: "Tableau de bord de qualité des données",
    companyShortName: "Lumen Data",
    academicYear: "2026-2027",
    period: "OTHER",
    status: "ASSIGNED",
  },
];

describe("OffersPage", () => {
  it("affiche les offres avec leurs libellés français", async () => {
    const fetchMock = stubFetch({ "/api/offers": () => Response.json(offers) });

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={vi.fn()} />);

    expect(fetchMock).toHaveBeenCalledWith("/api/offers", expect.anything());
    expect(await screen.findByText("Refonte du portail client")).toBeInTheDocument();
    expect(screen.getByText("Soumise")).toBeInTheDocument();
    expect(screen.getByText("Attribuée")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Autre" })).toBeInTheDocument();
    expect(screen.getByText("2 offres")).toBeInTheDocument();
    expect(screen.getByText("Les offres que vous avez déposées.")).toBeInTheDocument();
  });

  it("transmet la période sélectionnée à l'API", async () => {
    const fetchMock = stubFetch({ "/api/offers": () => Response.json(offers) });

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={vi.fn()} />);
    await screen.findByText("Refonte du portail client");

    fireEvent.change(screen.getByLabelText("Période"), { target: { value: "P1" } });

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("/api/offers?period=P1", expect.anything()),
    );
  });

  it("prévoit une recherche par mot-clé combinée à la période", async () => {
    const fetchMock = stubFetch({ "/api/offers": () => Response.json(offers) });

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByLabelText("Rechercher par mot-clé")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Période"), { target: { value: "P2" } });
    fireEvent.change(screen.getByLabelText("Rechercher par mot-clé"), {
      target: { value: "  portail client  " },
    });

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/offers?period=P2&q=portail+client",
        expect.anything(),
      ),
    );
  });

  it("prévoit un message adapté pour une liste vide issue d'une recherche", async () => {
    stubFetch({ "/api/offers": () => Response.json([]) });

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByText("Aucune offre à afficher.")).toBeInTheDocument();
    expect(
      screen.queryByText("Aucune offre ne correspond à la recherche."),
    ).not.toBeInTheDocument();

    fireEvent.change(await screen.findByLabelText("Rechercher par mot-clé"), {
      target: { value: "inexistant" },
    });
    expect(
      await screen.findByText("Aucune offre ne correspond à la recherche."),
    ).toBeInTheDocument();
  });

  it("soumet une candidature avec son message puis ferme le formulaire", async () => {
    const fetchMock = stubFetch({
      "/api/offers": () => Response.json(offers),
      "/api/applications": () =>
        Response.json({
          id: 8,
          offerId: 2,
          offerTitle: "Refonte du portail client",
          companyShortName: "Lumen Digital",
          academicYear: "2026-2027",
          period: "P2",
          message: "Mon expérience React",
          status: "IN_PROGRESS",
          appliedAt: "2026-11-17 15:00:00",
        }),
    });

    render(<OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />);
    await screen.findByText("Refonte du portail client");

    fireEvent.click(screen.getAllByRole("button", { name: "Candidater" })[0]!);
    fireEvent.change(screen.getByLabelText("Message (facultatif)"), {
      target: { value: "Mon expérience React" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer ma candidature" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/applications",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ offerId: 2, message: "Mon expérience React" }),
        }),
      ),
    );
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Candidater" })).toBeNull());
  });

  it("adapte la description au profil", async () => {
    stubFetch({ "/api/offers": () => Response.json([]) });

    const { unmount } = render(
      <OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />,
    );
    expect(screen.getByText("Les offres publiées.")).toBeInTheDocument();
    expect(await screen.findByText("Aucune offre à afficher.")).toBeInTheDocument();
    unmount();

    render(<OffersPage user={adminUser} token="jeton" onUnauthorized={vi.fn()} />);
    expect(screen.getByText("Toutes les offres, tous statuts confondus.")).toBeInTheDocument();
  });

  it("affiche un refus d'accès renvoyé par le backend", async () => {
    stubFetch({ "/api/offers": () => new Response(null, { status: 403 }) });

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("statut 403");
  });

  it("signale une session expirée", async () => {
    stubFetch({ "/api/offers": () => new Response(null, { status: 401 }) });
    const onUnauthorized = vi.fn();

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={onUnauthorized} />);

    await waitFor(() => expect(onUnauthorized).toHaveBeenCalled());
  });
});
