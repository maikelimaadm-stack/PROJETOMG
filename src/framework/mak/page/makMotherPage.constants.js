/**
 * Identificadores e defaults da Tela Mãe Visual MAK.
 * Edite MakCadastroMotherPage.jsx / MakCadastroMotherLayout.jsx para alterar a UI global.
 */
export const MAK_MOTHER_PAGE_ID = "MakCadastroMotherPage";

export const MAK_MOTHER_PAGE_ROOT_CLASS = "mak-cadastro-mother-page";

export const MAK_MOTHER_PAGE_DEFAULT_METADATA = {
  listMode: "server",
  showToolbar: true,
  showTableStrip: true,
  showCardsStrip: true,
  showMobileViewBar: true,
  showDeleteDialog: true,
};

export const resolveMakMotherPageMetadata = (metadata = {}) => ({
  ...MAK_MOTHER_PAGE_DEFAULT_METADATA,
  ...(metadata.page ?? {}),
});
