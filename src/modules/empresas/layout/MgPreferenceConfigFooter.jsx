import React from "react";

/** Footer padrão de configuração — draft local até clicar Ok (mesmo padrão da pesquisa). */
export default function MgPreferenceConfigFooter({
  onRestore,
  onOk,
  restoreLabel = "Restaurar",
  okLabel = "Ok",
  counter = null,
}) {
  return (
    <div className="mg-cards-config-menu__footer mg-search-dropdown__config-footer">
      <button
        type="button"
        className="ios-btn tb-btn tb-btn-labeled tb-btn-ghost mg-search-dropdown__config-action"
        onMouseDown={(event) => event.preventDefault()}
        onClick={onRestore}
      >
        {restoreLabel}
      </button>
      {counter ? (
        <span className="mg-search-dropdown__config-counter" aria-live="polite">
          {counter}
        </span>
      ) : (
        <span className="mg-search-dropdown__config-counter" aria-hidden="true" />
      )}
      <button
        type="button"
        className="ios-btn tb-btn tb-btn-labeled tb-btn-green mg-search-dropdown__config-action"
        onMouseDown={(event) => event.preventDefault()}
        onClick={onOk}
      >
        {okLabel}
      </button>
    </div>
  );
}
