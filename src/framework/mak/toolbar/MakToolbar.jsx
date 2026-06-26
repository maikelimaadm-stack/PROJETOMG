import { memo } from "react";
import MgActionBar from "@/framework/mak/layout/MgActionBar";

/** Toolbar MAK — alias memoizado de MgActionBar. */
const MakToolbar = memo(MgActionBar);
MakToolbar.displayName = "MakToolbar";

export default MakToolbar;
