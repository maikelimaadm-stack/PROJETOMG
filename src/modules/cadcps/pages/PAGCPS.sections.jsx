import React from "react";
import SankhyaListToolbar from "@/framework/cadastro/toolbars/EmpListToolbar";
import EmpSplitToolbarLayout from "@/framework/cadastro/layouts/EmpSplitToolbarLayout";
import FORMCPS from "@/modules/cadcps/components/FORMCPS";
import TBLCPS from "@/modules/cadcps/components/TBLCPS";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import SaveProgressOverlay from "@/shared/components/SaveProgressOverlay";

export const CamposFormPanel = ({ showForm, formProps, saveProgress }) => {
  if (!showForm) return null;
  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 overflow-hidden">
      <SaveProgressOverlay active={saveProgress?.active} message={saveProgress?.message} />
      <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
        <FORMCPS {...formProps} />
      </div>
    </div>
  );
};

export const CamposTablePanel = ({ hidden, toolbarProps, tableProps }) => (
  <EmpSplitToolbarLayout
    className={
      hidden
        ? "hidden"
        : "emp-table-view flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden"
    }
    contentClassName="emp-table-card"
    toolbar={<SankhyaListToolbar {...toolbarProps} showUtilityActions={false} />}
  >
    <div className="emp-table-panel flex min-h-0 flex-1 flex-col overflow-hidden">
      <TBLCPS {...tableProps} />
    </div>
  </EmpSplitToolbarLayout>
);

export const CamposDialogs = ({ confirmDeleteProps }) => (
  <ConfirmDialog {...confirmDeleteProps} />
);
