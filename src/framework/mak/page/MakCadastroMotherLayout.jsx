import React, { memo } from "react";
import {
  MAK_MOTHER_PAGE_ID,
  MAK_MOTHER_PAGE_ROOT_CLASS,
} from "@/framework/mak/page/makMotherPage.constants.js";

/**
 * Layout visual oficial da Tela Mãe MAK.
 * Regiões estáveis — alterações aqui propagam para todos os módulos consumidores.
 *
 * Regiões:
 * - toolbar: MakActionBar (pesquisa, view modes, ações)
 * - panelStrip: filtros/config colunas (tabela ou cards)
 * - viewStack: form | cards | table
 * - mobileBar: navegação mobile
 * - dialogs: confirmações e extensões
 */
function MakCadastroMotherLayout({
  moduleId,
  toolbar = null,
  panelStrip = null,
  viewStack = null,
  mobileBar = null,
  dialogs = null,
  statusBanner = null,
}) {
  return (
    <div
      className={`${MAK_MOTHER_PAGE_ROOT_CLASS} cadastro-${moduleId}-scope mg-empresas-scope flex h-full min-h-0 flex-1 flex-col overflow-hidden`}
      data-mak-component={MAK_MOTHER_PAGE_ID}
      data-mak-module={moduleId}
      data-mak-layout="cadastro-mother"
    >
      <div className="mak-mother-page__chrome flex min-h-0 flex-1 flex-col overflow-hidden">
        {statusBanner ? (
          <div className="mak-mother-page__status" data-mak-region="status">
            {statusBanner}
          </div>
        ) : null}

        {toolbar ? (
          <div className="mak-mother-page__toolbar mg-subtoolbar-stack" data-mak-region="toolbar">
            {toolbar}
          </div>
        ) : null}

        {panelStrip ? (
          <div className="mak-mother-page__panel-strip" data-mak-region="panel-strip">
            {panelStrip}
          </div>
        ) : null}

        {viewStack ? (
          <div
            className="mak-mother-page__view-stack mg-view-stack flex min-h-0 flex-1 flex-col overflow-hidden"
            data-mak-region="view-stack"
          >
            {viewStack}
          </div>
        ) : null}
      </div>

      {mobileBar ? (
        <div className="mak-mother-page__mobile-bar" data-mak-region="mobile-bar">
          {mobileBar}
        </div>
      ) : null}

      {dialogs ? (
        <div className="mak-mother-page__dialogs" data-mak-region="dialogs">
          {dialogs}
        </div>
      ) : null}
    </div>
  );
}

export default memo(MakCadastroMotherLayout);
