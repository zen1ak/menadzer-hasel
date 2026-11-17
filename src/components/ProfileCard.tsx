"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import type { Profile } from "@/types/profile";

const colorStyles = [
  "bg-[#fce9e1] text-[#b75e40]",
  "bg-[#e9e7fb] text-[#665db1]",
  "bg-[#e2f2eb] text-[#398164]",
  "bg-[#fff1d9] text-[#b27a2d]",
  "bg-[#e5eef8] text-[#5277a2]",
  "bg-[#f9e6ed] text-[#a95674]",
];

export function ProfileCard({
  profile,
  index,
  onDelete,
  onUpdatePassword,
}: {
  profile: Profile;
  index: number;
  onDelete: (id: string) => void;
  onUpdatePassword: (id: string, password: string) => boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");

  function randomIndex(max: number) {
    const limit = Math.floor(256 / max) * max;
    const value = new Uint8Array(1);
    do {
      crypto.getRandomValues(value);
    } while (value[0] >= limit);
    return value[0] % max;
  }

  function generatePassword() {
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

    return characters.join("");
  }

  async function copyPassword() {
    if (!profile.password) return;
    try {
      await navigator.clipboard.writeText(profile.password);
      setCopyMessage("Hasło skopiowano do schowka");
    } catch (error) {
      console.error("Nie udało się skopiować hasła.", error);
      setCopyMessage("Kopiowanie niedostępne");
    }
  }

  async function generateAndCopyPassword() {
    let password: string;
    try {
      password = generatePassword();
    } catch (error) {
      console.error("Nie udało się wygenerować hasła.", error);
      setCopyMessage("Nie udało się wygenerować hasła");
      return;
    }

    if (!onUpdatePassword(profile.id, password)) {
      setCopyMessage("Nie udało się zapisać wygenerowanego hasła");
      return;
    }

    setRevealed(true);
    try {
      await navigator.clipboard.writeText(password);
      setCopyMessage("Wygenerowano i skopiowano nowe hasło");
    } catch (error) {
      console.error("Nie udało się skopiować wygenerowanego hasła.", error);
      setCopyMessage("Hasło zapisano, ale nie udało się go skopiować");
    }
  }

  return (
    <article className="group rounded-2xl border border-[#e9edea] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#dce6df] hover:shadow-[0_12px_30px_rgba(29,53,43,0.06)] sm:p-6">
      <div className="flex items-start justify-between">
        <div className="flex min-w-0 items-center gap-3.5">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${colorStyles[index % colorStyles.length]}`}
          >
            {profile.name.trim().charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-[#25342d]">
              {profile.name}
            </h3>
            <p className="mt-1 text-xs text-[#89958e]">{profile.category}</p>
          </div>
        </div>
        <button
          aria-label={`Usuń profil ${profile.name}`}
          className="rounded-lg p-2 text-[#a0aaa4] opacity-70 transition hover:bg-[#fff0ef] hover:text-[#ba514b] sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
          onClick={() => {
            if (window.confirm(`Czy na pewno usunąć profil „${profile.name}”?`)) {
              onDelete(profile.id);
            }
          }}
          title="Usuń profil"
          type="button"
        >
          <Icon name="trash" size={17} />
        </button>
      </div>

      <div className="mt-6 border-t border-[#f0f2f0] pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9aa49e]">
          Login
        </p>
        <p className="mt-1.5 truncate text-sm text-[#45544c]" title={profile.login}>
          {profile.login}
        </p>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9aa49e]">
            Hasło
          </p>
          <p
            className={`mt-1.5 truncate text-sm text-[#45544c] ${revealed ? "font-mono" : "tracking-[0.18em]"}`}
          >
            {profile.password
              ? revealed
                ? profile.password
                : "••••••••••••"
              : "Nie ustawiono hasła"}
          </p>
          {copyMessage && (
            <p
              className={`mt-1 text-[11px] ${
                copyMessage.includes("nie udało")
                  ? "text-[#b64343]"
                  : "text-[#397c63]"
              }`}
              role="status"
            >
              {copyMessage}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            aria-label={revealed ? "Ukryj hasło" : "Pokaż hasło"}
            className="rounded-lg p-2 text-[#829087] transition hover:bg-[#f2f6f2] hover:text-[#315c4d]"
            onClick={() => setRevealed(!revealed)}
            title={revealed ? "Ukryj hasło" : "Pokaż hasło"}
            disabled={!profile.password}
            type="button"
          >
            <Icon name={revealed ? "eyeOff" : "eye"} size={17} />
          </button>
          <button
            aria-label="Kopiuj hasło"
            className="rounded-lg p-2 text-[#829087] transition hover:bg-[#f2f6f2] hover:text-[#315c4d]"
            onClick={copyPassword}
            disabled={!profile.password}
            title="Kopiuj hasło"
            type="button"
          >
            <Icon name="copy" size={16} />
          </button>
        </div>
      </div>
      <button
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#dce8df] bg-[#f7faf6] px-3 py-2.5 text-xs font-semibold text-[#37654b] transition hover:border-[#b8d1bf] hover:bg-[#eff6ed] disabled:cursor-not-allowed disabled:opacity-60"
        onClick={generateAndCopyPassword}
        type="button"
      >
        <Icon name="sparkles" size={15} />
        Generuj i kopiuj silne hasło
      </button>
    </article>
  );
}
