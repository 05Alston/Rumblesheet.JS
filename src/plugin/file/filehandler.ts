import { plug } from "../plugin";

// fileUploader.ts
export class FileUploader {
  private plug: plug;

  constructor(plug: plug) {
    this.plug = plug;
  }

  /**
   * Handles the CSV upload logic.
   * @param file - The uploaded CSV file.
   */
  public async handleCsvUpload(file: File): Promise<void> {
    const fileData = await file.text();
    const rows: string[][] = fileData
      .split("\n")
      .map((line) => line.split(",").map((value) => value.trim()));
      console.log(this.plug.excelsHandler)
    this.plug.excelsHandler.currSheetObj.instance.helper.setValue(rows)
    alert("CSV uploaded and matrix populated successfully.");
  }
}
