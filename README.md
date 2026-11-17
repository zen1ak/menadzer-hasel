# Klucz — menedżer haseł

Demonstracyjna aplikacja Next.js z App Routerem i Tailwind CSS. Umożliwia
utworzenie lokalnego konta z własnym hasłem głównym lub odblokowanie sejfu
demonstracyjnego (`vault2025`), przeglądanie, wyszukiwanie, filtrowanie,
dodawanie i usuwanie profili oraz odkrywanie, kopiowanie i generowanie silnych
haseł. Przy dodawaniu profilu login jest wymagany, a hasło można pozostawić
puste i wygenerować później na jego karcie.

Profile są zapisywane w `localStorage` przeglądarki. To demonstracja interfejsu,
a nie bezpieczny menedżer haseł: zapisane profile i hasła nie są szyfrowane.
Hasło główne jest weryfikowane lokalnie przy użyciu PBKDF2. Konto nie jest
powiązane z serwerem i istnieje wyłącznie w bieżącej przeglądarce. Nie używaj
prawdziwych haseł.

## Uruchomienie

```bash
npm install
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000).

## Weryfikacja

```bash
npm run lint
npm run build
```
