
function convertXlsToGoogleSheet(file: GoogleAppsScript.Drive.File): GoogleAppsScript.Spreadsheet.Sheet {
    const blob = file.getBlob();
    const resource = {
        title: file.getName(),
        mimeType: MimeType.GOOGLE_SHEETS
    };

    const importedFile = Drive.Files.create(resource, blob, {
        convert: true
    });

    const importedSheet = SpreadsheetApp.openById(importedFile.id!).getSheets()[0];
    return importedSheet;
}

function isXlsFile(file: GoogleAppsScript.Drive.File): boolean {
    const mimeType = file.getMimeType();
    return mimeType === MimeType.MICROSOFT_EXCEL || file.getName().endsWith(".xls") || file.getName().endsWith(".xlsx");
}

export { convertXlsToGoogleSheet, isXlsFile };
 