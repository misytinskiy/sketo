export type EditorActionState = {
  status: "idle" | "success" | "error";
  message: string;
  version?: string;
  href?: string;
  fieldErrors?: Record<string, string>;
};

export const initialEditorActionState: EditorActionState = {
  status: "idle",
  message: "",
};
