import { FileUploader } from "./file/filehandler.js";
import { excelsHandler } from '../core/initiater.js';
export class Plugin {
    excelsHandler:excelsHandler;
    currSheetObj: any;
    FileUploader: FileUploader;
    constructor(excelsHandler:excelsHandler) {
        this.excelsHandler = excelsHandler;
        this.FileUploader = new FileUploader(this)
    }

    handleFileUpload(): void {
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        const file = fileInput.files ? fileInput.files[0] : null;
    
        if (file) {
            // Call a function to process the CSV file
            this.FileUploader.handleCsvUpload(file);
        } else {
        }
    }
}