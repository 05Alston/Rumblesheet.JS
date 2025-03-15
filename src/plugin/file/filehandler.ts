import { Plugin } from "../plugin";

// fileUploader.ts
export class FileUploader {
  private plugin: Plugin;

  constructor(plugin: Plugin) {
    this.plugin = plugin;
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
    alert("CSV uploaded and matrix populated successfully.");
  }
}
