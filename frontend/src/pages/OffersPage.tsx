import { useState } from "react";
import EmptyState from "../components/EmptyState.tsx";
import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import OfferTable from "../components/OfferTable.tsx";
import { useOffers } from "../hooks/useOffers.ts";
import { createApplication } from "../services/applications.service.ts";
import { isUnauthorized } from "../utils/api.ts";
import { PERIOD_CODES, type PeriodCode } from "../models/offer.ts";
import type { User } from "../models/user.ts";

interface OffersPageProps {
  user: User;
  token: string;
  onUnauthorized: () => void;
}

const DESCRIPTIONS = {
  ADMIN: "Toutes les offres, tous statuts confondus.",
  STUDENT: "Les offres publiées.",
  CONTACT: "Les offres que vous avez déposées.",
} as const;

const OffersPage = ({ user, token, onUnauthorized }: OffersPageProps) => {
  const [period, setPeriod] = useState<PeriodCode | undefined>();
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [applicationError, setApplicationError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const { offers, isLoading, error } = useOffers(token, period, onUnauthorized);

  const renderContent = () => {
    if (error) return <ErrorState message={error} />;
    if (isLoading) return <LoadingState />;
    if (offers.length === 0) return <EmptyState message="Aucune offre à afficher." />;
    return (
      <>
        <p className="result-count">
          {offers.length} offre{offers.length > 1 ? "s" : ""}
        </p>
        <OfferTable
          offers={offers}
          onApply={user.kind === "STUDENT" ? (offer) => {
            setSelectedOfferId(offer.id);
            setApplicationError(null);
          } : undefined}
        />
        {selectedOfferId !== null && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setIsApplying(true);
              setApplicationError(null);
              createApplication(token, selectedOfferId, message)
                .then(() => {
                  setSelectedOfferId(null);
                  setMessage("");
                })
                .catch((reason: unknown) => {
                  if (isUnauthorized(reason)) onUnauthorized();
                  else if (reason instanceof Error) setApplicationError(reason.message);
                  else setApplicationError("Envoi de la candidature impossible");
                })
                .finally(() => setIsApplying(false));
            }}
          >
            <h2>Candidater</h2>
            <label>
              <span>Message (facultatif)</span>
              <textarea
                value={message}
                maxLength={1000}
                onChange={(event) => setMessage(event.target.value)}
              />
            </label>
            {applicationError && <ErrorState message={applicationError} />}
            <button type="submit" className="button button-light" disabled={isApplying}>
              {isApplying ? "Envoi…" : "Envoyer ma candidature"}
            </button>
          </form>
        )}
      </>
    );
  };

  return (
    <section>
      <h1>Offres de stage</h1>
      <p>{DESCRIPTIONS[user.kind]}</p>
      <label>
        <span>Période</span>
        <select
          aria-label="Période"
          value={period ?? ""}
          onChange={(event) =>
            setPeriod(event.target.value === "" ? undefined : (event.target.value as PeriodCode))
          }
        >
          <option value="">Toutes les périodes</option>
          {PERIOD_CODES.map((code) => (
            <option key={code} value={code}>
              {code === "OTHER" ? "Autre" : code}
            </option>
          ))}
        </select>
      </label>
      {renderContent()}
    </section>
  );
};

export default OffersPage;
