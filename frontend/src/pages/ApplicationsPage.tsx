import ErrorState from "../components/ErrorState.tsx";
import EmptyState from "../components/EmptyState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import StatusBadge from "../components/StatusBadge.tsx";
import { useState } from "react";
import { useApplications } from "../hooks/useApplications.ts";
import { withdrawApplication } from "../services/applications.service.ts";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_TONES,
  PERIOD_LABELS,
} from "../utils/labels.ts";
import { isUnauthorized } from "../utils/api.ts";

interface ApplicationsPageProps {
  token: string;
  onUnauthorized: () => void;
}

const ApplicationsPage = ({ token, onUnauthorized }: ApplicationsPageProps) => {
  const { applications, isLoading, error, reload } = useApplications(token, onUnauthorized);
  const [actionError, setActionError] = useState<string | null>(null);

  if (error) return <ErrorState message={error} />;
  if (isLoading) return <LoadingState />;
  if (applications.length === 0) return <EmptyState message="Aucune candidature." />;

  return (
    <section>
      <h1>Mes candidatures</h1>
      {actionError && <ErrorState message={actionError} />}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Offre</th>
              <th>Entreprise</th>
              <th>Période</th>
              <th>Statut</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application.id}>
                <td>{application.offerTitle}</td>
                <td>{application.companyShortName}</td>
                <td>{PERIOD_LABELS[application.period]}</td>
                <td>
                  <StatusBadge
                    label={APPLICATION_STATUS_LABELS[application.status]}
                    tone={APPLICATION_STATUS_TONES[application.status]}
                  />
                </td>
                <td>
                  {application.status === "IN_PROGRESS" && (
                    <button
                      type="button"
                      className="button button-light"
                      onClick={() => {
                        setActionError(null);
                        withdrawApplication(token, application.id)
                          .then(reload)
                          .catch((reason: unknown) => {
                            if (isUnauthorized(reason)) onUnauthorized();
                            else {
                              setActionError(
                                reason instanceof Error
                                  ? reason.message
                                  : "Retrait de la candidature impossible",
                              );
                            }
                          });
                      }}
                    >
                      Retirer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ApplicationsPage;
