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

export class ThemeManager {
  //define variables
  activeTheme!: IThemeStructure;
  predefinedThemes: ITheme = {}; //initally empty
  predefinedThemesJson: ITheme = {
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
  };

  constructor(initialTheme: EPreDefinedThemes = EPreDefinedThemes.NORMAL) {
    this.init(initialTheme);
  }

  init(initialTheme: EPreDefinedThemes) {
    this.predefinedThemes = this.getPredefinedThemes();
    this.updateTheme(initialTheme);
  }

  getPredefinedThemes(): ITheme {
    //gets the predefined themes and returns it
    //get logic for getting themes from json later currrently its stored here itself
    return this.predefinedThemesJson;
  }

  updateTheme(targetTheme: string | IThemeStructure) {
    //sets the active theme to the one provided as argument
    if (typeof targetTheme === "string" && this.predefinedThemes[targetTheme]) {
      this.activeTheme = this.predefinedThemes[targetTheme];
    } else if (typeof targetTheme === "object") {
      this.activeTheme = targetTheme;
    }
    this.setTheme(this.activeTheme);
  }

  setTheme(targetTheme: IThemeStructure) {
    Object.entries(targetTheme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  }
}
