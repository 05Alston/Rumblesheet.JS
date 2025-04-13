//* Enums

export enum ECanvasType {
  horizontal = "horizontal",
  vertical = "vertical",
  spreadsheet = "spreadsheet",
}

export enum ETextAlign {
  center = "center",
  left = "left",
  right = "right",
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
  Lobster = "'Lobster', cursive"
}

export enum ETextBaseLine {
  middle = "middle",
  top = "top",
  bottom = "bottom",
}

export enum ETextWrapping {
  wrap = "wrap",
  clip = "clip",
}

export enum ERibbonDataActions {
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
  fontFamily = "fontFamily",
  textBaselineTop = "textBaselineTop",
  textBaselineMiddle = "textBaselineMiddle",
  textBaselineBottom = "textBaselineBottom",
}

export enum ETabList {
  file = "File",
  home = "Home",
  graph = "Graph",
  operations = "Operations",
  format = "Format",
}
