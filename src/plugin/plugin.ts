import { FileUploader } from "./file/filehandler.js";
import { ExcelsHandler } from "../core/excelsHandler.js";
export class Plugin {
  excelsHandler: ExcelsHandler;
  currSheetObj: any;
  FileUploader: FileUploader;
  constructor(excelsHandler: ExcelsHandler) {
    this.excelsHandler = excelsHandler;
    this.FileUploader = new FileUploader(this);
  }

  handleFileUpload(): void {
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    const file = fileInput.files ? fileInput.files[0] : null;

    if (file) {
      // Call a function to process the CSV file
      this.FileUploader.handleCsvUpload(file);
    } else {
    }
  }
}
