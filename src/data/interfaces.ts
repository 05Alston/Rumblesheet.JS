import { SheetMaker } from "../excel/controllers/sheetMaker";
import {
  EFontFamilies,
  ETextAlign,
  ETextBaseLine,
  ETextWrapping,
} from "./enums";

export interface ISheetObj {
  name: string;
  instance: SheetMaker;
}

export interface IGridHeaderCell {
  x: number;
  y: number;
  width: number;
  height: number;
  value: string | number;
  row: number;
  col: number;
}

export interface ICell {
  firstColumnHeaderCell: IGridHeaderCell| undefined;
  lastColumnHeaderCell: IGridHeaderCell| undefined;
  firstRowHeaderCell: IGridHeaderCell| undefined;
  lastRowHeaderCell: IGridHeaderCell| undefined;
  rowValue: number;
  colValue: number;
  value: any;
  nextRow?: ICell | undefined;
  nextCol?: ICell | undefined;
  prevRow?: ICell | undefined;
  prevCol?: ICell | undefined;
  styles: ICellStyles;
  mergedTo?: ICell | undefined;
}

export interface ISelectedCell {
  column: IGridHeaderCell | undefined;
  row: IGridHeaderCell | undefined;
  cell: ICell | null;
}

export interface ICellStyles {
  textAlign?: ETextAlign;
  textBaseline?: ETextBaseLine;
  fontSize?: number;
  fontFamily?: EFontFamilies;
  color?: string;
  fill?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  textIndent?: number;
  textWrapping?: ETextWrapping;
}

export interface IThemeStructure {
  themeColor?: string;
  themeColorL1?: string;
  themeColorL2?: string;
  themeColorL3?: string;
  themeColorL4?: string;
  themeColorL5?: string;
  themeColorD1?: string;
  themeColorD2?: string;
  themeColorD3?: string;
  themeColorD4?: string;
  themeColorD5?: string;
  bgColor?: string;
  ribbonBgColor?: string;
  tablistContainerBgColor?: string;
  tablistItemBgColor?: string;
  tablistItemActiveBgColor?: string;
  tablistItemTextColor?: string;
  tablistItemActiveBorderColor?: string;
  ribbonFocusZoneBgColor?: string;
  ribbonFocusBtnBgColor?: string;
  ribbonFocusBtnActiveBgColor?: string;
  ribbonFocusBtnIconColor?: string;
  ribbonFocusBtnActiveTextColor?: string;
  ribbonFocusInputBgColor?: string;
  ribbonFocusSeperatorBgColor?: string;
  excelPrimaryBgColor?: string;
  excelHorizontalCanvasBgColor?: string;
  excelVerticalCanvasBgColor?: string;
  sheetBgColor?: string;
  scrollbarTrackColor?: string;
  scrollbarThumbColor?: string;
  scrollbarThumbHoverColor?: string;
  footerBgColor?: string;
  footerAddBtnBgColor?: string;
  footerAddBtnTextColor?: string;
  footerSheetBtnBgColor?: string;
  footerSheetBtnTextColor?: string;
}

export interface ITheme {
  [key: string]: IThemeStructure;
}
