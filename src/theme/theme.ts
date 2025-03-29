import { ITheme,IThemeStructure } from "../dataStructure/interfaces";

enum EPreDefinedThemes {
  NORMAL = "normal",
  BLUE = "blue",
  GREEN = "green",
  VIOLET = "violet"
}

export class ThemeManager {
  //define variables
  activeTheme!: IThemeStructure;
  predefinedThemes: ITheme = {}; //initally empty
  predefinedThemesJson: ITheme = {
    // normal: {
    //   primaryBgColor: "#f5faf7",
    //   secondaryBgColor: "#107C41",
    //   primaryBtnColor: "#40a061",
    //   secondaryBtnColor: "grey",
    // },
    // blue: {
    //   primaryBgColor: "blue",
    //   secondaryBgColor: "cyan",
    //   primaryBtnColor: "black",
    //   secondaryBtnColor: "white",
    // },
    green : {
      themeColor: "#1b8731",
      themeColorL1: "#32ae4c",
      themeColorL2: "#52ca69",
      themeColorL3: "#87e090",
      themeColorL4: "#d0eed4",
      themeColorL5: "#e1f8e4",
      themeColorD1:"#16772a",
      themeColorD2:"#155a23",
      themeColorD3:"#183a1f",
      themeColorD4:"#0a1e12",
      themeColorD5:"#060f0a"
    },
    blue : {
      themeColor: "#0176d5",
      themeColorL1: "#2b9ef9",
      themeColorL2: "#65b9ff",
      themeColorL3: "#9dd2fe",
      themeColorL4: "#d3eafc",
      themeColorL5: "#e7f4fc",
      themeColorD1:"#0e65c2",
      themeColorD2:"#094a9e",
      themeColorD3:"#0e306d",
      themeColorD4:"#061939",
      themeColorD5:"#040d1e"
    },
    violet : {
      themeColor: "#9a41ff",
      themeColorL1: "#b67ef9",
      themeColorL2: "#cca1fa",
      themeColorL3: "#ddc1fc",
      themeColorL4: "#ece2fa",
      themeColorL5: "#f4f0fe",
      themeColorD1:"#871eff",
      themeColorD2:"#6405d1",
      themeColorD3:"#430290",
      themeColorD4:"#25034d",
      themeColorD5:"#140522"
    }
  };

  constructor(initialTheme: EPreDefinedThemes = EPreDefinedThemes.VIOLET) {
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
      value ? document.documentElement.style.setProperty(`--${key}`, value) : '';
    });
  }
}
