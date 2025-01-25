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
  nextRow: ICell | undefined,
  nextCol: ICell | undefined,
  prevRow: ICell | undefined,
  prevCol: ICell | undefined,
  textAlign: string;
  textBaseline: string;
  fontSize: number;
  fontFamily: string;
  color: string;
}

export interface IThemeStructure {
  themeColor?: string;
  themeColorL1?: string;
  themeColorL2?: string;
  themeColorL3?: string;
  themeColorL4?: string;
  themeColorL5?: string;
  themeColorD1?:string;
  themeColorD2?:string;
  themeColorD3?:string;
  themeColorD4?:string;
  themeColorD5?:string;
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