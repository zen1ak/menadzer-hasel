"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/Icon";

const DEMO_PASSWORD = "vault2025";
const ACCOUNT_STORAGE_KEY = "klucz-local-account";
const ACCOUNT_VAULT_KEY = "klucz-password-profiles-account";
const PBKDF2_ITERATIONS = 310_000;

export function LoginScreen({
  onLogin,
}: {
  onLogin: (vaultKey: string) => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [generatorMessage, setGeneratorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function randomIndex(max: number) {
    const limit = Math.floor(256 / max) * max;
    const value = new Uint8Array(1);
    do {
      crypto.getRandomValues(value);
    } while (value[0] >= limit);
    return value[0] % max;
  }

  async function generateAndCopyMasterPassword() {
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

    while (characters.length < 24) {
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
    setConfirmation(generatedPassword);
    setError("");

    try {
      await navigator.clipboard.writeText(generatedPassword);
      setGeneratorMessage("Wygenerowano i skopiowano hasło główne.");
    } catch (copyError) {
      console.error("Nie udało się skopiować hasła głównego.", copyError);
      setGeneratorMessage(
        "Hasło wygenerowano, ale nie udało się go skopiować. Skopiuj je ręcznie z pola.",
      );
    }
  }

  function toHex(bytes: Uint8Array) {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }

  function fromHex(value: string) {
    const bytes = new Uint8Array(new ArrayBuffer(value.length / 2));
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
    }
    return bytes;
  }

  async function createVerifier(
    secret: string,
    salt: Uint8Array<ArrayBuffer>,
  ) {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      "PBKDF2",
      false,
      ["deriveBits"],
    );
    const bits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: PBKDF2_ITERATIONS,
        hash: "SHA-256",
      },
      key,
      256,
    );
    return toHex(new Uint8Array(bits));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (mode === "register") {
        if (password.length < 8) {
          setError("Hasło główne musi mieć co najmniej 8 znaków.");
          return;
        }
        if (password !== confirmation) {
          setError("Hasła nie są takie same.");
          return;
        }
        if (window.localStorage.getItem(ACCOUNT_STORAGE_KEY)) {
          setError(
            "Konto jest już utworzone w tej przeglądarce. Zaloguj się swoim hasłem głównym.",
          );
          return;
        }

        const salt = crypto.getRandomValues(
          new Uint8Array(new ArrayBuffer(16)),
        );
        const verifier = await createVerifier(password, salt);
        window.localStorage.setItem(
          ACCOUNT_VAULT_KEY,
          JSON.stringify([]),
        );
        window.localStorage.setItem(
          ACCOUNT_STORAGE_KEY,
          JSON.stringify({
            version: 1,
            salt: toHex(salt),
            verifier,
          }),
        );
        onLogin(ACCOUNT_VAULT_KEY);
        return;
      }

      const savedAccount = window.localStorage.getItem(ACCOUNT_STORAGE_KEY);
      if (savedAccount) {
        const account: unknown = JSON.parse(savedAccount);
        if (
          account &&
          typeof account === "object" &&
          "version" in account &&
          account.version === 1 &&
          "salt" in account &&
          typeof account.salt === "string" &&
          "verifier" in account &&
          typeof account.verifier === "string"
        ) {
          const verifier = await createVerifier(
            password,
            fromHex(account.salt),
          );
          if (verifier === account.verifier) {
            onLogin(ACCOUNT_VAULT_KEY);
            return;
          }
        } else {
          throw new Error("Nieprawidłowy format danych konta.");
        }
      }

      if (password === DEMO_PASSWORD) {
        onLogin("klucz-password-profiles");
        return;
      }

      setError("To hasło nie pasuje. Spróbuj ponownie.");
    } catch (submitError) {
      console.error("Nie udało się utworzyć konta lub otworzyć sejfu.", submitError);
      setError(
        "Nie udało się zapisać konta w tej przeglądarce. Sprawdź jej ustawienia pamięci.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function changeMode(nextMode: "login" | "register") {
    setMode(nextMode);
    setPassword("");
    setConfirmation("");
    setError("");
    setGeneratorMessage("");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-5 py-12">
      <div className="grid w-full max-w-[960px] overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(27,44,40,0.10)] md:min-h-[590px] md:grid-cols-[1.05fr_0.95fr]">
        <section className="relative flex min-h-[260px] flex-col justify-between overflow-hidden bg-[#173b33] p-8 text-white md:p-11">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full border border-white/10" />
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c4f06f] text-[#173b33]">
              <Icon name="key" size={22} />
            </span>
            <span className="text-xl font-bold tracking-tight">klucz</span>
          </div>
          <div className="relative mt-14 max-w-[370px]">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-[#dce9e3]">
              <Icon name="shield" size={14} />
              Twoja prywatna przestrzeń
            </span>
            <h1 className="text-4xl font-semibold leading-[1.12] tracking-[-0.04em] md:text-[46px]">
              Wszystkie klucze.
              <br />
              Jedno miejsce.
            </h1>
            <p className="mt-4 max-w-[330px] text-sm leading-6 text-[#c2d4cd]">
              Uporządkuj swoje loginy i miej do nich dostęp wtedy, kiedy ich
              potrzebujesz.
            </p>
          </div>
          <p className="relative mt-10 text-xs text-[#b2c7bf]">
            Prosto. Przejrzyście. Po Twojemu.
          </p>
        </section>

        <section className="flex items-center justify-center px-7 py-10 md:px-12">
          <div className="w-full max-w-[340px]">
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff8e5] text-[#39753d]">
              <Icon name="lock" size={25} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#72927f]">
              {mode === "login" ? "Witaj ponownie" : "Nowe konto"}
            </p>
            <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-[#1d2b27]">
              {mode === "login" ? "Otwórz swój sejf" : "Utwórz konto"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#79847f]">
              {mode === "login"
                ? "Wpisz hasło główne, aby zobaczyć swoje zapisane profile."
                : "Ustaw hasło główne. Zostanie zapisane konto tylko w tej przeglądarce."}
            </p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <label
                className="block text-sm font-medium text-[#34443e]"
                htmlFor="master-password"
              >
                Hasło główne
              </label>
              <input
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                autoFocus
                className="w-full rounded-xl border border-[#e4e9e6] bg-[#fbfcfb] px-4 py-3.5 text-sm text-[#17211f] outline-none transition placeholder:text-[#aab3ae] focus:border-[#3d8870] focus:ring-4 focus:ring-[#3d8870]/10"
                id="master-password"
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                  setGeneratorMessage("");
                }}
                minLength={mode === "register" ? 8 : undefined}
                placeholder={
                  mode === "register"
                    ? "Ustaw hasło (min. 8 znaków)"
                    : "Wpisz swoje hasło"
                }
                required
                type="password"
                value={password}
              />
              {mode === "register" && (
                <div>
                  <button
                    className="flex items-center gap-2 text-xs font-semibold text-[#397c63] transition hover:text-[#173b33]"
                    onClick={generateAndCopyMasterPassword}
                    type="button"
                  >
                    <Icon name="sparkles" size={15} />
                    Generuj i kopiuj silne hasło
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
              )}
              {mode === "register" && (
                <label
                  className="block space-y-2 text-sm font-medium text-[#34443e]"
                  htmlFor="confirm-master-password"
                >
                  Powtórz hasło główne
                  <input
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-[#e4e9e6] bg-[#fbfcfb] px-4 py-3.5 text-sm text-[#17211f] outline-none transition placeholder:text-[#aab3ae] focus:border-[#3d8870] focus:ring-4 focus:ring-[#3d8870]/10"
                    id="confirm-master-password"
                    onChange={(event) => {
                      setConfirmation(event.target.value);
                      setError("");
                      setGeneratorMessage("");
                    }}
                    placeholder="Wpisz hasło ponownie"
                    required
                    type="password"
                    value={confirmation}
                  />
                </label>
              )}
              {error && (
                <p className="text-sm text-[#b64343]" role="alert">
                  {error}
                </p>
              )}
              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#173b33] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#235346] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d8870]"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting
                  ? "Chwila..."
                  : mode === "login"
                    ? "Otwórz sejf"
                    : "Utwórz konto"}
                {!isSubmitting && <Icon name="arrow" size={17} />}
              </button>
            </form>

            <button
              className="mt-5 w-full text-center text-sm font-medium text-[#397c63] transition hover:text-[#173b33]"
              onClick={() =>
                changeMode(mode === "login" ? "register" : "login")
              }
              type="button"
            >
              {mode === "login"
                ? "Nie masz konta? Utwórz je"
                : "Masz już konto? Zaloguj się"}
            </button>
            {mode === "login" && (
              <div className="mt-5 rounded-xl border border-[#e9eee9] bg-[#f8faf7] px-4 py-3">
                <p className="text-xs font-medium text-[#596760]">
                  Tryb demonstracyjny
                </p>
                <p className="mt-1 text-xs text-[#829089]">
                  Hasło testowe: <span className="font-mono">vault2025</span>
                </p>
              </div>
            )}
            <p className="mt-6 text-center text-[11px] leading-5 text-[#9aa39e]">
              Hasło główne jest weryfikowane lokalnie. Dane sejfu nie są
              szyfrowane — nie używaj prawdziwych haseł.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
