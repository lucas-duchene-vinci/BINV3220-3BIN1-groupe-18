import { expect, test } from '@playwright/test';

// Ces tests ne créent, ne modifient ni ne suppriment de données. Ils s'appuient
// sur les quatre offres publiées du seed de démonstration; chaque test se
// reconnecte et repart d'une page neuve, indépendamment de l'ordre d'exécution.

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Louis Claes', exact: true }).click();
  await page.getByRole('link', { name: 'Offres', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Offres de stage', exact: true })).toBeVisible();
});

test('Scénario 1 — recherche avec résultat nominal', async ({ page }) => {
  const table = page.getByRole('table');
  await expect(table).toBeVisible();
  // Le tableau comprend une ligne d'en-tête et quatre lignes d'offres.
  await expect(table.getByRole('row')).toHaveCount(5);
  await expect(
    table.getByRole('cell', { name: 'Application React de gestion de flotte', exact: true }),
  ).toBeVisible();
  await expect(
    table.getByRole('cell', { name: 'API REST de facturation', exact: true }),
  ).toBeVisible();
  await expect(
    table.getByRole('cell', { name: 'Tableau de bord de qualité des données', exact: true }),
  ).toBeVisible();
  await expect(
    table.getByRole('cell', { name: 'Assistant conversationnel interne', exact: true }),
  ).toBeVisible();

  await page.getByLabel('Rechercher par mot-clé').fill('APPLICATION');

  await expect(page.getByText('1 offre', { exact: true })).toBeVisible();
  await expect(table.getByRole('row')).toHaveCount(2);
  await expect(
    table.getByRole('row', { name: /Application React de gestion de flotte/ }),
  ).toBeVisible();
  await expect(
    table.getByRole('cell', { name: 'Application React de gestion de flotte', exact: true }),
  ).toBeVisible();
  await expect(
    table.getByRole('cell', { name: "Migration d'une application vers le cloud", exact: true }),
  ).toHaveCount(0);
  await expect(
    table.getByRole('cell', { name: 'API REST de facturation', exact: true }),
  ).toHaveCount(0);
});

test('Scénario 2 — recherche sans résultat puis effacement', async ({ page }) => {
  const table = page.getByRole('table');
  const search = page.getByLabel('Rechercher par mot-clé');

  await expect(table).toBeVisible();
  await expect(table.getByRole('row')).toHaveCount(5);

  await search.fill('blockchain');

  await expect(
    page.getByText('Aucune offre ne correspond à la recherche.', { exact: true }),
  ).toBeVisible();
  await expect(table).toHaveCount(0);
  await expect(page.getByText(/^\d+ offre(?:s)?$/)).toHaveCount(0);

  await search.fill('');

  await expect(table).toBeVisible();
  await expect(page.getByText('4 offres', { exact: true })).toBeVisible();
  await expect(table.getByRole('row')).toHaveCount(5);
});
