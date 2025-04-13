//* Enums

export enum ECanvasType {
  Horizontal = "horizontal",
  Vertical = "vertical",
  Spreadsheet = "spreadsheet",
}

export enum ETextAlign {
  Center = "center",
  Left = "left",
  Right = "right",
}

export enum EFontFamilies {
  // System Fonts
  Arial = "Arial, sans-serif",
  Georgia = "Georgia, serif",
  CourierNew = "'Courier New', monospace",
  Verdana = "Verdana, sans-serif",
  TimesNewRoman = "'Times New Roman', serif",
  Tahoma = "Tahoma, sans-serif",

  // Google Fonts (commonly used)
  Roboto = "'Roboto', sans-serif",
  OpenSans = "'Open Sans', sans-serif",
  Lato = "'Lato', sans-serif",
  Montserrat = "'Montserrat', sans-serif",
  Poppins = "'Poppins', sans-serif",
  Inter = "'Inter', sans-serif",
  Lobster = "'Lobster', cursive",
}

export enum ETextBaseLine {
  Middle = "middle",
  Top = "top",
  Bottom = "bottom",
}

export enum ETextWrapping {
  Wrap = "wrap",
  Clip = "clip",
}

export enum ERibbonDataActions {
  Paste = "paste",
  Cut = "cut",
  Copy = "copy",
  IncreaseFont = "increaseFont",
  DecreaseFont = "decreaseFont",
  Bold = "bold",
  Italic = "italic",
  Underline = "underline",
  FillColor = "fillColor",
  TextColor = "textColor",
  AlignLeft = "alignLeft",
  AlignCenter = "alignCenter",
  AlignRight = "alignRight",
  DecreaseIndent = "decreaseIndent",
  IncreaseIndent = "increaseIndent",
  FontSize = "fontSize",
  FontFamily = "fontFamily",
  TextBaselineTop = "textBaselineTop",
  TextBaselineMiddle = "textBaselineMiddle",
  TextBaselineBottom = "textBaselineBottom",
}

export enum ETabList {
  File = "File",
  Home = "Home",
  Graph = "Graph",
  Operations = "Operations",
  Format = "Format",
}
