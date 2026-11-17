"use client";

import { useMemo, useState } from "react";
import { AddProfileForm } from "@/components/AddProfileForm";
import { Icon } from "@/components/Icon";
import { LoginScreen } from "@/components/LoginScreen";
import { ProfileCard } from "@/components/ProfileCard";
import type { Profile, ProfileCategory } from "@/types/profile";

const STORAGE_KEY = "klucz-password-profiles";

const demoProfiles: Profile[] = [
  {
    id: "demo-netflix",
    name: "Netflix",
    login: "anna.nowak@email.com",
    password: "Netflix!2025",
    category: "Rozrywka",
  },
  {
    id: "demo-github",
    name: "GitHub",
    login: "anna.nowak",
    password: "gitHub$ecure24",
    category: "Praca",
  },
  {
    id: "demo-spotify",
    name: "Spotify",
    login: "anna.nowak@email.com",
    password: "Muzyka#7890",
    category: "Rozrywka",
  },
];

const filters = [
  "Wszystkie",
  "Rozrywka",
  "Praca",
  "Finanse",
  "Social media",
  "Zakupy",
  "Inne",
] as const;

type Filter = (typeof filters)[number];

function isProfile(value: unknown): value is Profile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Record<string, unknown>;
  return (
    typeof profile.id === "string" &&
    typeof profile.name === "string" &&
    typeof profile.login === "string" &&
    typeof profile.password === "string" &&
    typeof profile.category === "string"
  );
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [vaultStorageKey, setVaultStorageKey] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [storageError, setStorageError] = useState("");
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("Wszystkie");

  function openVault(storageKey: string) {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved === null) {
        const initialProfiles =
          storageKey === STORAGE_KEY ? demoProfiles : [];
        window.localStorage.setItem(
          storageKey,
          JSON.stringify(initialProfiles),
        );
        setProfiles(initialProfiles);
      } else {
        const parsed: unknown = JSON.parse(saved);
        if (!Array.isArray(parsed) || !parsed.every(isProfile)) {
          throw new Error("Nieprawidłowy format danych sejfu.");
        }
        setProfiles(parsed);
      }

      setStorageError("");
      setVaultStorageKey(storageKey);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Nie udało się wczytać sejfu z pamięci przeglądarki.", error);
      setStorageError(
        "Nie udało się wczytać lub utworzyć sejfu w tej przeglądarce. Sprawdź ustawienia pamięci.",
      );
    }
  }

  function saveProfiles(nextProfiles: Profile[]): boolean {
    if (!vaultStorageKey) return false;
    try {
      window.localStorage.setItem(
        vaultStorageKey,
        JSON.stringify(nextProfiles),
      );
      setProfiles(nextProfiles);
      setStorageError("");
      return true;
    } catch (error) {
      console.error("Nie udało się zapisać sejfu w pamięci przeglądarki.", error);
      setStorageError(
        "Nie udało się zapisać sejfu. Sprawdź dostępne miejsce w przeglądarce.",
      );
      return false;
    }
  }

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pl");
    return profiles.filter((profile) => {
      const matchesFilter =
        activeFilter === "Wszystkie" || profile.category === activeFilter;
      const matchesSearch =
        query.length === 0 ||
        profile.name.toLocaleLowerCase("pl").includes(query) ||
        profile.login.toLocaleLowerCase("pl").includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, profiles, search]);

  function addProfile(profile: {
    name: string;
    login: string;
    password: string;
    category: ProfileCategory;
  }) {
    saveProfiles([{ ...profile, id: crypto.randomUUID() }, ...profiles]);
    setIsAddFormOpen(false);
  }

  function deleteProfile(id: string) {
    saveProfiles(profiles.filter((profile) => profile.id !== id));
  }

  function updateProfilePassword(id: string, password: string) {
    return saveProfiles(
      profiles.map((profile) =>
        profile.id === id ? { ...profile, password } : profile,
      ),
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={openVault} />;
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#17211f]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[248px] flex-col bg-[#173b33] px-5 py-6 text-white lg:flex">
        <div className="flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c4f06f] text-[#173b33]">
            <Icon name="key" size={22} />
          </span>
          <span className="text-xl font-bold tracking-tight">klucz</span>
        </div>
        <p className="mb-3 mt-11 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#91b2a4]">
          Twoja przestrzeń
        </p>
        <nav className="space-y-1">
          <a
            className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-3 text-sm font-medium text-white"
            href="#sejf"
          >
            <Icon name="grid" size={18} className="text-[#c4f06f]" />
            Hasła
            <span className="ml-auto rounded-md bg-white/10 px-2 py-0.5 text-[11px] text-[#c1d3cb]">
              {profiles.length}
            </span>
          </a>
        </nav>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c4f06f]/15 text-[#c4f06f]">
            <Icon name="shield" size={19} />
          </span>
          <p className="mt-3 text-sm font-medium">Twoje dane, Twoja sprawa</p>
          <p className="mt-1 text-xs leading-5 text-[#a8c0b5]">
            Sejf jest zapisany lokalnie w tej przeglądarce.
          </p>
          <button
            className="mt-4 flex items-center gap-2 text-xs font-medium text-[#c4f06f] transition hover:text-white"
            onClick={() => {
              setIsLoggedIn(false);
              setVaultStorageKey(null);
            }}
            type="button"
          >
            <Icon name="logout" size={15} />
            Wyloguj
          </button>
        </div>
        <p className="px-2 pt-5 text-[10px] text-[#78998a]">
        </p>
      </aside>

      <main className="min-h-screen lg:ml-[248px]">
        <header className="sticky top-0 z-10 border-b border-[#e9edea] bg-[#f7f8fa]/90 px-5 py-4 backdrop-blur-md sm:px-8 lg:px-11">
          <div className="mx-auto flex max-w-[1220px] items-center justify-between gap-4">
            <a className="flex items-center gap-2.5 lg:hidden" href="#sejf">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#173b33] text-[#c4f06f]">
                <Icon name="key" size={20} />
              </span>
              <span className="font-bold tracking-tight text-[#20372e]">
                klucz
              </span>
            </a>
            <label className="relative hidden w-full max-w-[380px] sm:block">
              <Icon
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aa59f]"
                name="search"
                size={17}
              />
              <input
                aria-label="Szukaj profili"
                className="w-full rounded-xl border border-[#e7ece8] bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-[#aab3ae] focus:border-[#3d8870] focus:ring-4 focus:ring-[#3d8870]/10"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Szukaj w sejfie..."
                value={search}
              />
            </label>
            <div className="flex shrink-0 items-center gap-3">
              <span className="hidden text-right sm:block">
                <span className="block text-xs font-semibold text-[#35463d]">
                  Mój sejf
                </span>
                <span className="mt-0.5 block text-[10px] text-[#929d96]">

                </span>
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e6efe7] text-xs font-bold text-[#3d765b]">
                AN
              </span>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1220px] px-5 pb-12 pt-8 sm:px-8 sm:pt-10 lg:px-11">
          {storageError && (
            <p
              className="mb-6 rounded-xl border border-[#f1d8c8] bg-[#fff8f1] px-4 py-3 text-sm text-[#8b5734]"
              role="alert"
            >
              {storageError}
            </p>
          )}
          <section
            className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
            id="sejf"
          >
            <div>
              <p className="flex items-center gap-2 text-xs font-medium text-[#809087]">
                <Icon name="sparkles" size={15} className="text-[#72a35c]" />
                Dobrze Cię widzieć
              </p>
              <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.05em] text-[#1e2b25] sm:text-[36px]">
                Menadżer Haseł
              </h1>
              <p className="mt-1.5 text-sm text-[#7c8982]">
                Wszystkie ważne loginy w jednym, uporządkowanym miejscu.
              </p>
            </div>
            <button
              className="flex items-center justify-center gap-2 rounded-xl bg-[#173b33] px-4 py-3 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(23,59,51,0.14)] transition hover:bg-[#235346] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d8870]"
              onClick={() => setIsAddFormOpen(true)}
              type="button"
            >
              <Icon name="plus" size={18} />
              Dodaj profil
            </button>
          </section>

          <section
            aria-label="Podsumowanie sejfu"
            className="mt-8 grid gap-3 sm:grid-cols-3"
          >
            <article className="flex items-center gap-4 rounded-2xl border border-[#e9edea] bg-white p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e9f4e3] text-[#58834d]">
                <Icon name="key" size={20} />
              </span>
              <div>
                <p className="text-xs text-[#87938c]">Zapisane profile</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-[#25342d]">
                  {profiles.filter((profile) => profile.password.length > 0)
                    .length}
                </p>
              </div>
            </article>
            <article className="flex items-center gap-4 rounded-2xl border border-[#e9edea] bg-white p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f1f5] text-[#527d91]">
                <Icon name="lock" size={19} />
              </span>
              <div>
                <p className="text-xs text-[#87938c]">Hasła pod ochroną</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-[#25342d]">
                  {profiles.length}
                </p>
              </div>
            </article>
            <article className="flex items-center gap-4 rounded-2xl border border-[#e9edea] bg-white p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff2de] text-[#ae7c37]">
                <Icon name="shield" size={20} />
              </span>
              <div>
                <p className="text-xs text-[#87938c]">Przechowywanie</p>
                <p className="mt-1 text-sm font-semibold text-[#25342d]">
                  Lokalnie w przeglądarce
                </p>
              </div>
            </article>
          </section>

          <section className="mt-10">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-[#26342d]">
                  Zapisane profile
                </h2>
                <p className="mt-1 text-xs text-[#8a958e]">
                  Twoje dane logowania, zawsze pod ręką.
                </p>
              </div>
              <label className="relative sm:hidden">
                <Icon
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aa59f]"
                  name="search"
                  size={17}
                />
                <input
                  aria-label="Szukaj profili"
                  className="w-full rounded-xl border border-[#e7ece8] bg-white py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-[#aab3ae] focus:border-[#3d8870]"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Szukaj w sejfie..."
                  value={search}
                />
              </label>
            </div>
            <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
              {filters.map((filter) => (
                <button
                  aria-pressed={activeFilter === filter}
                  className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-medium transition ${
                    activeFilter === filter
                      ? "bg-[#173b33] text-white"
                      : "border border-[#e8ece9] bg-white text-[#718078] hover:border-[#cbd9d0] hover:text-[#2e5444]"
                  }`}
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  type="button"
                >
                  {filter}
                </button>
              ))}
            </div>

            {filteredProfiles.length > 0 ? (
              <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredProfiles.map((profile, index) => (
                  <ProfileCard
                    index={index}
                    key={profile.id}
                    onDelete={deleteProfile}
                    onUpdatePassword={updateProfilePassword}
                    profile={profile}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-dashed border-[#dbe3dd] bg-white px-6 py-14 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff5ed] text-[#6d8d64]">
                  <Icon name="search" size={21} />
                </span>
                <h3 className="mt-4 font-semibold text-[#34443c]">
                  {profiles.length === 0
                    ? "Brak zapisanych haseł"
                    : "Nie znaleziono profili"}
                </h3>
                <p className="mt-1 text-sm text-[#87938c]">
                  {profiles.length === 0
                    ? "Dodaj pierwszy profil, aby mieć swoje loginy pod ręką."
                    : "Zmień wyszukiwanie lub wybierz inną kategorię."}
                </p>
                {profiles.length === 0 && (
                  <button
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#173b33] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#235346]"
                    onClick={() => setIsAddFormOpen(true)}
                    type="button"
                  >
                    <Icon name="plus" size={17} />
                    Dodaj pierwszy profil
                  </button>
                )}
              </div>
            )}
          </section>

          <footer className="mt-10 flex flex-col gap-2 border-t border-[#e9edea] pt-5 text-[11px] leading-5 text-[#9aa49e] sm:flex-row sm:items-center sm:justify-between">
            <p>
            </p>
            <button
              className="flex items-center gap-1.5 self-start font-medium text-[#708078] transition hover:text-[#315c4d] sm:self-auto"
              onClick={() => {
                setIsLoggedIn(false);
                setVaultStorageKey(null);
              }}
              type="button"
            >
              <Icon name="logout" size={14} />
            </button>
          </footer>
        </div>
      </main>

      {isAddFormOpen && (
        <AddProfileForm
          onAdd={addProfile}
          onClose={() => setIsAddFormOpen(false)}
        />
      )}
    </div>
  );
}
