export type ProfileCategory =
  | "Rozrywka"
  | "Praca"
  | "Finanse"
  | "Social media"
  | "Zakupy"
  | "Inne";

export type Profile = {
  id: string;
  name: string;
  login: string;
  password: string;
  category: ProfileCategory;
};
