import dotenv from "dotenv";

dotenv.config();

export const SMOKE_CLIENTE = String(
  process.env.SMOKE_CLIENTE || process.env.SEED_CLIENTE_CODIGO || "maike"
)
  .trim()
  .toLowerCase();

export const SMOKE_USUARIO = String(
  process.env.SMOKE_USUARIO || process.env.SEED_USUARIO_LOGIN || "maike"
)
  .trim()
  .toLowerCase();

export const SMOKE_SENHA = String(
  process.env.SMOKE_SENHA || process.env.SEED_USUARIO_SENHA || "123"
);

export const smokeLoginBody = (overrides = {}) => ({
  cliente: SMOKE_CLIENTE,
  usuario: SMOKE_USUARIO,
  senha: SMOKE_SENHA,
  ...overrides,
});
