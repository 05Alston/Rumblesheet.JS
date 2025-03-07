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
  rowValue: number;
  colValue: number;
  value: any;
  nextRow: ICell | undefined;
  nextCol: ICell | undefined;
  prevRow: ICell | undefined;
  prevCol: ICell | undefined;
  styles?: ICellStyles;
}

export interface ICellStyles {
  textAlign?: string;
  textBaseline?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  fill?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  textIndent?: number;
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

//* Enums

export enum ETextAlign {
  center = "center",
  left = "left",
  right = "right",
}

export enum EFontFamilies {
  arial = "Arial",
  timesNewRoman= "Times new Roman",
  roboto = "Roboto",
  openSans = "Opan Sans",
  rubik = "Rubik"
}

export enum ETextBaseLine{
  middle = "middle",
  top = "top",
  bottom = "bottom"

}

export enum ribbonDataActions {
  paste = "paste",
  cut = "cut",
  copy = "copy",
  increaseFont = "increaseFont",
  decreaseFont = "decreaseFont",
  bold = "bold",
  italic = "italic",
  underline = "underline",
  fillColor = "fillColor",
  textColor = "textColor",
  alignLeft = "alignLeft",
  alignCenter = "alignCenter",
  alignRight = "alignRight",
  decreaseIndent = "decreaseIndent",
  increaseIndent = "increaseIndent",
  fontSize = "fontSize",
  fontFamily = "fontFamily"
}
