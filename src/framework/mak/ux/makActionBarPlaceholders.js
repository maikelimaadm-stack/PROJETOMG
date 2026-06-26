import {
  createMakHistoryPlaceholder as createMakHistoryPlaceholderBase,
  createMakPrintPlaceholder as createMakPrintPlaceholderBase,
} from "./makPlaceholderActions.js";
import { showInfo } from "@/shared/feedback";

export const createMakPrintPlaceholder = (onPrint) =>
  createMakPrintPlaceholderBase(onPrint, showInfo);

export const createMakHistoryPlaceholder = (onHistory) =>
  createMakHistoryPlaceholderBase(onHistory, showInfo);
