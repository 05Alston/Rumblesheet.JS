enum EPreDefinedThemes {
  NORMAL = "normal",
  BLUR = "blue",
}

interface IThemeStructure {
  primaryBgColor: string;
  secondaryBgColor: string;
  primaryBtnColor: string;
  secondaryBtnColor: string;
}

interface ITheme {
  [key: string]: IThemeStructure;
}

class ThemeManager {
  //define variables
  activeTheme!: IThemeStructure;
  predefinedThemes: ITheme = {};//initally empty
  predefinedThemesJson: ITheme =
    {
      normal: {
        primaryBgColor: "#f5faf7",
        secondaryBgColor: "#107C41",
        primaryBtnColor: "#40a061",
        secondaryBtnColor: "grey",
      },
      blue: {
        primaryBgColor: "blue",
        secondaryBgColor: "cyan",
        primaryBtnColor: "black",
        secondaryBtnColor: "white",
      },
    }

  constructor() {
    this.init();
  }

  init() {
    this.predefinedThemes = this.getPredefinedThemes();
    this.activeTheme = this.predefinedThemes[EPreDefinedThemes.NORMAL]
  }

  getPredefinedThemes(): ITheme {
    //gets the predefined themes and returns it
    //get logic for getting themes from json later currrently its stored here itself
    return this.predefinedThemesJson;
  }

  setActiveTheme(targetTheme: EPreDefinedThemes) {
    //sets the active theme to the one provided as argument
    this.activeTheme = this.predefinedThemes[targetTheme];
  }
}
