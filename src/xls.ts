
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

    // Assuming "Fecha Operación" is column A or find it dynamically if needed
    // Format the entire column where dates are located as plain text to avoid auto-date conversion
    importedSheet.getRange("A:A").setNumberFormat("@STRING@");

    return importedSheet;
}

function isXlsFile(file: GoogleAppsScript.Drive.File): boolean {
    const mimeType = file.getMimeType();
    return mimeType === MimeType.MICROSOFT_EXCEL || file.getName().endsWith(".xls") || file.getName().endsWith(".xlsx");
}

export { convertXlsToGoogleSheet, isXlsFile };
 