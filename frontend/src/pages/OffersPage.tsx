import { useState } from "react";
import EmptyState from "../components/EmptyState.tsx";
import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import OfferTable from "../components/OfferTable.tsx";
import { useOffers } from "../hooks/useOffers.ts";
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
        <OfferTable offers={offers} />
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
