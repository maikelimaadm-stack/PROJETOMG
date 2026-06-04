import ToggleSwitch from "@/shared/components/ToggleSwitch";

export default function CadToggle({ checked, onChange, disabled, className = "" }) {
  return (
    <ToggleSwitch
      checked={!!checked}
      onChange={onChange}
      disabled={disabled}
      className={`cad-form-toggle-switch emp-form-toggle-switch ${className}`.trim()}
      checkedClassName="cad-form-toggle-switch-on emp-form-toggle-switch-on"
    />
  );
}
