import { excelsHandler } from './initiater.js';
// eventManager.ts
export class EventManager {
    excelsHandler: excelsHandler;
    helper: any;

    constructor(excelsHandler: excelsHandler){
        this.excelsHandler = excelsHandler;
        this.helper = this.excelsHandler.currSheetObj;
        this.setupEvent()
    }

    
    private setupEvent(): void {
        const uploadButton = document.getElementById('uploadButton') as HTMLButtonElement;
        if (uploadButton) {
            uploadButton.addEventListener('click', this.excelsHandler.plug.handleFileUpload.bind(this.excelsHandler.plug));
        } else {
            console.error('Upload button not found.');
        }
    }

    handleFileUpload(): void {
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        const file = fileInput.files ? fileInput.files[0] : null;

        if (file) {
            this.handleCsvUpload(file);
        } else {
            // console.log("No file selected.");
        }
    }

    public async handleCsvUpload(file: File): Promise<void> {
        const fileData = await file.text();
        const rows: string[][] = fileData
            .split("\n")
            .map((line) => line.split(",").map((value) => value.trim()));
        
        this.excelsHandler.currSheetObj.instance.helper.setValue(rows);
        alert("CSV uploaded and matrix populated successfully.");
    }


}
  