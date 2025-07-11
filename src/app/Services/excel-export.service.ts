// src/app/services/excel-export.service.ts
import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import * as FileSaver from 'file-saver';

@Injectable({
  providedIn: 'root',
})

export class ExcelExportService {
  exportAsExcelFile(data: any[], fileName: string, headers: string[]): void {
    
    const replacedHeaders = headers.map(caption=> caption.replace("_"," "));
        
    // Create a worksheet from the data array
    const datawithHeaders = [replacedHeaders, ...data];
    
  //  console.log(datawithHeaders);
    
    const worksheet = XLSX.utils.aoa_to_sheet(datawithHeaders);

    headers.forEach((_, colIndex) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIndex });
    const cell = worksheet[cellRef];

    if (cell && !cell.s) {
      cell.s = {}; // ensure style object exists
    }

    // Apply bold font
    if (cell) {
      cell.s = {
        font: {
          bold: true
        }
      };
    }
  });

  // Step 3: Create workbook and write file
const workbook: XLSX.WorkBook = {
  Sheets: { Sheet1: worksheet },
  SheetNames: ['Sheet1']
};

const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', cellStyles: true });
const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
FileSaver.saveAs(blob, `${fileName}.xlsx`);
    
    // // Create a new workbook and append the worksheet
    // const workbook = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    // // Generate buffer
    // const excelBuffer: any = XLSX.write(workbook, {
    //   bookType: 'xlsx',
    //   type: 'array',
    // });
    
    // // Create a Blob from the buffer and trigger the download
    // const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    // saveAs(blob, `${fileName}.xlsx`);
  }
}
