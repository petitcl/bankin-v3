import { applyCategorizationRules, CategorizationRule } from './categorization';
import { Convert, RawRecord } from './convert';

export { RawRecord };

export type TransactionColumn = typeof TransactionColumns[keyof typeof TransactionColumns];

export const TransactionColumns = {
    DATE: 'Date',
    MONTH: 'Month',
    STATUS: 'Status',
    CATEGORY: 'Category',
    SUB_CATEGORY: 'Sub Category',
    AMOUNT: 'Amount',
    ABSOLUTE_AMOUNT: 'Absolute Amount',
    BANK: 'Bank',
    CONCEPT: 'Concept'
}

export type TransactionStatus = typeof TransactionStatuses[keyof typeof TransactionStatuses];

export const TransactionStatuses = {
    VALID: 'VALID',
    IGNORED: 'IGNORED',
} as const;

class Transactions {
    Columns: typeof TransactionColumns
    Statuses: typeof TransactionStatuses

    constructor() {
        this.Columns = TransactionColumns;
        this.Statuses = TransactionStatuses;
    }
}

export class BankinV3App {
    Convert: Convert
    Transactions: Transactions

    constructor() {
        this.Convert      = new Convert();
        this.Transactions = new Transactions();
      }
}

export const BankinV3 = new BankinV3App();

export interface SpreadSheetRef {
    id: string;
    name: string;
}

export interface AppConfig {
    transactionsSheet: SpreadSheetRef;
    imports: {
        folderName: string;
        files: ImportConfig[];
    };
    categorizationRules: CategorizationRule[];
}

export interface ImportConfig {
    fileName: string;
    bankName: string;
    normalize: (file: GoogleAppsScript.Drive.File) => RawRecord[];
}

export function importBankTransactions(config: AppConfig): void {
    const transactionsSheet = config.transactionsSheet;
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(transactionsSheet.name);

    if (!sheet) {
        throw new Error(`Sheet ${transactionsSheet.name} not found in spreadsheet with ID ${transactionsSheet.id}`);
    }

    const folderIterator = DriveApp.getFoldersByName(config.imports.folderName);
    if (!folderIterator.hasNext()) {
        throw new Error(`Folder "${config.imports.folderName}" not found in Google Drive.`);
    }

    const folder = folderIterator.next();
    let allTransactions: Record<string, any>[] = [];

    config.imports.files.forEach(({ fileName, bankName, normalize }) => {
        try {
            const fileIterator = folder.getFilesByName(fileName);
            if (!fileIterator.hasNext()) {
                throw new Error(`File "${fileName}" not found`);
            }

            const file = fileIterator.next();
            const normalized = normalize(file);
            allTransactions.push(...normalized);

            console.log(`Transactions: ${JSON.stringify(normalized)}`);
            console.log(`Done importing ${normalized.length} transactions for bank ${bankName}`);
        } catch (err: any) {
            console.error(`Error importing ${bankName} "${fileName}": ${err.message}`);
            console.error("Stack trace:", err.stack ?? "<stack trace not available>");
        }
    });

    allTransactions = applyCategorizationRules(config.categorizationRules, allTransactions);

    if (allTransactions.length > 0) {
        const values = BankinV3.Convert.rawRecordsToGSheetCsv(allTransactions);
        values.shift();
    

        const templateRow = 2;

        // append the values to the sheet, 5 empty rows 
        sheet.getRange(sheet.getLastRow() + 6, 1, values.length, values[0].length).setValues(values);

        // Copy formatting & validation from template row to new rows
        const sourceRange = sheet.getRange(templateRow, 1, 1, sheet.getLastColumn());
        const targetRange = sheet.getRange(sheet.getLastRow() - values.length + 1, 1, values.length, sheet.getLastColumn());
  
        // Copy formatting and data validation only
        sourceRange.copyTo(targetRange, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
        sourceRange.copyTo(targetRange, SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false);
    }
}
