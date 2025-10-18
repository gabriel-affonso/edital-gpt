import { z } from "zod";

export const editalFormSchema = z.object({
  editalUrl: z
    .string()
    .url({ message: "URL inválida" })
    .max(2048, { message: "URL muito longa (máximo 2048 caracteres)" }),
  projectName: z
    .string()
    .min(3, { message: "Nome do projeto deve ter no mínimo 3 caracteres" })
    .max(200, { message: "Nome do projeto deve ter no máximo 200 caracteres" }),
  projectDescription: z
    .string()
    .min(10, { message: "Descrição deve ter no mínimo 10 caracteres" })
    .max(5000, { message: "Descrição deve ter no máximo 5000 caracteres" }),
  projectGoals: z
    .string()
    .min(10, { message: "Objetivos devem ter no mínimo 10 caracteres" })
    .max(2000, { message: "Objetivos devem ter no máximo 2000 caracteres" }),
  budget: z
    .string()
    .min(1, { message: "Orçamento é obrigatório" })
    .max(100, { message: "Orçamento muito longo" }),
});

export const projectSuggestionSchema = z.object({
  editalUrl: z
    .string()
    .url({ message: "URL inválida" })
    .max(2048, { message: "URL muito longa (máximo 2048 caracteres)" }),
  city: z
    .string()
    .min(2, { message: "Cidade deve ter no mínimo 2 caracteres" })
    .max(100, { message: "Cidade deve ter no máximo 100 caracteres" }),
  organizationName: z
    .string()
    .min(3, { message: "Nome da organização deve ter no mínimo 3 caracteres" })
    .max(200, { message: "Nome da organização deve ter no máximo 200 caracteres" }),
  organizationType: z
    .enum(["public_institution", "public_university", "ngo", "cso"], {
      errorMap: () => ({ message: "Selecione um tipo de organização válido" }),
    }),
});

export const authSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z
    .string()
    .min(6, { message: "Senha deve ter no mínimo 6 caracteres" })
    .max(100, { message: "Senha muito longa" }),
  fullName: z
    .string()
    .min(2, { message: "Nome deve ter no mínimo 2 caracteres" })
    .max(100, { message: "Nome muito longo" })
    .optional(),
});

export type EditalFormData = z.infer<typeof editalFormSchema>;
export type ProjectSuggestionData = z.infer<typeof projectSuggestionSchema>;
export type AuthData = z.infer<typeof authSchema>;
