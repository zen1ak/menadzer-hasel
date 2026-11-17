"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/Icon";
import type { ProfileCategory } from "@/types/profile";

const categories: ProfileCategory[] = [
  "Rozrywka",
  "Praca",
  "Finanse",
  "Social media",
  "Zakupy",
  "Inne",
];

export function AddProfileForm({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (profile: {
    name: string;
    login: string;
    password: string;
    category: ProfileCategory;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState<ProfileCategory>("Inne");
  const [showPassword, setShowPassword] = useState(false);
  const [generatorMessage, setGeneratorMessage] = useState("");

  function randomIndex(max: number) {
    const limit = Math.floor(256 / max) * max;
    const value = new Uint8Array(1);
    do {
      crypto.getRandomValues(value);
    } while (value[0] >= limit);
    return value[0] % max;
  }

  async function generateAndCopyPassword() {
    const characterSets = [
      "ABCDEFGHJKLMNPQRSTUVWXYZ",
      "abcdefghijkmnopqrstuvwxyz",
      "23456789",
      "!@#$%^&*-_=+?",
    ];
    const allCharacters = characterSets.join("");
    const characters = characterSets.map(
      (characterSet) => characterSet[randomIndex(characterSet.length)],
    );

    while (characters.length < 20) {
      characters.push(allCharacters[randomIndex(allCharacters.length)]);
    }

    for (let index = characters.length - 1; index > 0; index -= 1) {
      const swapIndex = randomIndex(index + 1);
      [characters[index], characters[swapIndex]] = [
        characters[swapIndex],
        characters[index],
      ];
    }

    const generatedPassword = characters.join("");
    setPassword(generatedPassword);
    setShowPassword(true);
    setGeneratorMessage("");

    try {
      await navigator.clipboard.writeText(generatedPassword);
      setGeneratorMessage("Wygenerowano i skopiowano hasło.");
    } catch (error) {
      console.error("Nie udało się skopiować wygenerowanego hasła.", error);
      setGeneratorMessage(
        "Hasło wygenerowano, ale nie udało się go skopiować. Możesz skopiować je z pola powyżej.",
      );
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAdd({ name: name.trim(), login: login.trim(), password, category });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#12231f]/45 px-4 py-8 backdrop-blur-[3px]"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="add-profile-title"
        aria-modal="true"
        className="w-full max-w-[480px] rounded-3xl bg-white p-6 shadow-[0_24px_80px_rgba(13,28,23,0.25)] sm:p-8"
        role="dialog"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eff8e5] text-[#39753d]">
              <Icon name="plus" size={22} />
            </span>
            <h2
              className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[#1d2b27]"
              id="add-profile-title"
            >
              Dodaj nowy profil
            </h2>
            <p className="mt-1 text-sm text-[#7b8982]">
              Zapisz dane logowania w swoim sejfie.
            </p>
          </div>
          <button
            aria-label="Zamknij okno"
            className="rounded-lg p-2 text-[#89948e] transition hover:bg-[#f2f5f2] hover:text-[#263831]"
            onClick={onClose}
            type="button"
          >
            <Icon name="close" size={19} />
          </button>
        </div>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2 text-sm font-medium text-[#34443e]">
            Nazwa serwisu
            <input
              autoFocus
              className="w-full rounded-xl border border-[#e4e9e6] bg-[#fbfcfb] px-4 py-3 text-sm outline-none transition placeholder:text-[#aab3ae] focus:border-[#3d8870] focus:ring-4 focus:ring-[#3d8870]/10"
              maxLength={60}
              onChange={(event) => setName(event.target.value)}
              placeholder="np. Disney+"
              required
              value={name}
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-[#34443e]">
            Login lub adres e-mail
            <input
              autoComplete="username"
              className="w-full rounded-xl border border-[#e4e9e6] bg-[#fbfcfb] px-4 py-3 text-sm outline-none transition placeholder:text-[#aab3ae] focus:border-[#3d8870] focus:ring-4 focus:ring-[#3d8870]/10"
              maxLength={120}
              onChange={(event) => setLogin(event.target.value)}
              placeholder="np. twoj@email.com"
              required
              value={login}
            />
            <span className="block text-xs font-normal text-[#89958e]">
              Login jest wymagany. Hasło możesz wygenerować później na karcie
              profilu.
            </span>
          </label>
          <label className="block space-y-2 text-sm font-medium text-[#34443e]">
            Hasło{" "}
            <span className="font-normal text-[#89958e]">(opcjonalnie)</span>
            <span className="relative block">
              <input
                autoComplete="new-password"
                className="w-full rounded-xl border border-[#e4e9e6] bg-[#fbfcfb] px-4 py-3 pr-12 text-sm outline-none transition placeholder:text-[#aab3ae] focus:border-[#3d8870] focus:ring-4 focus:ring-[#3d8870]/10"
                maxLength={200}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Wpisz hasło"
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <button
                aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-[#89948e] hover:text-[#315c4d]"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                <Icon name={showPassword ? "eyeOff" : "eye"} size={18} />
              </button>
            </span>
          </label>
          <div className="-mt-2">
            <button
              className="flex items-center gap-2 text-xs font-semibold text-[#397c63] transition hover:text-[#173b33]"
              onClick={generateAndCopyPassword}
              type="button"
            >
              <Icon name="sparkles" size={15} />
              Generuj silne hasło i kopiuj
            </button>
            {generatorMessage && (
              <p
                aria-live="polite"
                className="mt-2 text-xs leading-5 text-[#397c63]"
                role="status"
              >
                {generatorMessage}
              </p>
            )}
          </div>
          <label className="block space-y-2 text-sm font-medium text-[#34443e]">
            Kategoria
            <select
              className="w-full appearance-none rounded-xl border border-[#e4e9e6] bg-[#fbfcfb] px-4 py-3 text-sm outline-none transition focus:border-[#3d8870] focus:ring-4 focus:ring-[#3d8870]/10"
              onChange={(event) =>
                setCategory(event.target.value as ProfileCategory)
              }
              value={category}
            >
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              className="rounded-xl border border-[#e2e8e4] px-5 py-3 text-sm font-medium text-[#5e6d65] transition hover:bg-[#f7f9f7]"
              onClick={onClose}
              type="button"
            >
              Anuluj
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-xl bg-[#173b33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#235346]"
              type="submit"
            >
              <Icon name="plus" size={17} />
              Zapisz profil
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
