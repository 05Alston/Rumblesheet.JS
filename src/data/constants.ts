import {
  EFontFamilies,
  ERibbonDataActions,
  ETextAlign,
  ETextBaseLine,
  ETextWrapping,
} from "./enums.js";
import { ICellStyles } from "./interfaces.js";

//* constants for all canvas
export const DEFAULT_HORIZONTAL_CANVAS_HEIGHT = 20;
export const DEFAULT_VERTICAL_CANVAS_WIDTH = 30;
export const DEFAULT_CANVAS_LINES_COLOR = "#000000";
export const DEFAULT_CANVAS_TEXT_COLOR = "#000000";
export const DEFAULT_CANVAS_FONT_FAMILY = EFontFamilies.Arial;
export const DEFAULT_CANVAS_LINE_WIDTH = 1;
export const DEFAULT_CANVAS_TEXT_ALIGN = ETextAlign.left;
export const DEFAULT_CANVAS_TEXT_BASELINE = ETextBaseLine.middle;
export const DEFAULT_CANVAS_TEXT_WRAPPING = ETextWrapping.clip;

//* constants used in sparseMatrix cells
export const DEFAULT_FONT_SIZE = 14;
export const DEFAULT_LINE_HEIGHT_FONT_SIZE_DIFF = 4;
export const DEFAULT_CELL_FONT_COLOR = "#000000";
export const DEFAULT_FONT_FAMILY = EFontFamilies.Arial;
export const DEFAULT_CELL_BG_COLOR = "#ffffff";
export const DEFAULT_CELL_INDENT = 0;
export const DEFAULT_CELL_WIDTH = 120;
export const DEFAULT_CELL_HEIGHT = 40;

export const DEFAULT_CELL_STYLES: ICellStyles = {
  textAlign: DEFAULT_CANVAS_TEXT_ALIGN,
  textBaseline: DEFAULT_CANVAS_TEXT_BASELINE,
  fontSize: DEFAULT_FONT_SIZE,
  fontFamily: DEFAULT_CANVAS_FONT_FAMILY,
  color: DEFAULT_CELL_FONT_COLOR,
  textIndent: DEFAULT_CELL_INDENT,
  textWrapping: DEFAULT_CANVAS_TEXT_WRAPPING,
};

export const DEFAULT_MIN_PADDING_IN_CELL = 8;

//* constants for highlight

export const DEFAULT_HIGHLIGHT_BORDER_COLOR = "green";
export const DEFAULT_HIGHLIGHT_LINE_WIDTH = 4;
export const DEFAULT_HIGHLIGHT_FILL_COLOR = "rgb(131,242,143,0.6)";
export const DEFAULT_HIGHLIGHT_HEADER_LINE_WIDTH = 4;
export const DEFAULT_HIGHLIGHT_HEADER_FILL_COLOR = "rgb(131,242,143,0.3)";
export const DEFAULT_HIGHLIGHT_HEADER_BORDER_COLOR = "green";

//*ribbon details constants
export const DEFAULT_FONT_SIZE_CHANGE_VALUE = 1;
export const INDENT_VALUE_CHANGE_VALUE = 4;

export const FONT_SIZES_ARRAY: number[] = [
  8, 9, 10, 11, 12, 13, 50, 14, 16, 18, 20,
];
export const FONT_FAMILY_ARRAY: EFontFamilies[] = Object.values(EFontFamilies);

export const activePossibleActions = [
  ERibbonDataActions.bold,
  ERibbonDataActions.italic,
  ERibbonDataActions.underline,
];
export const alignmentActions = [
  ERibbonDataActions.alignCenter,
  ERibbonDataActions.alignLeft,
  ERibbonDataActions.alignRight,
];

export const textBaseLineActions = [
  ERibbonDataActions.textBaselineBottom,
  ERibbonDataActions.textBaselineMiddle,
  ERibbonDataActions.textBaselineTop,
];
export const indentActions = [
  ERibbonDataActions.increaseIndent,
  ERibbonDataActions.decreaseIndent,
];
export const instantActions = [
  ERibbonDataActions.increaseFont,
  ERibbonDataActions.decreaseFont,
  ERibbonDataActions.copy,
  ERibbonDataActions.paste,
  ERibbonDataActions.cut,
];
