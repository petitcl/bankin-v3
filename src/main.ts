import { RawRecord, BankinV3 } from "./bankin-v3";
import { normalizeOpenBank } from "./openbank";
import { normalizeBanquePop } from "./banquepop";
import { TRANSACTION_SHEET_ID } from "./secrets";

(globalThis as any).onOpen = onOpen;
(globalThis as any).importBankTransactions = importBankTransactions;

export {
    importBankTransactions, onOpen
};

function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu("Accounting")
        .addItem("Import Transactions", "importBankTransactions")
        .addToUi();
}

interface SpreadSheetRef {
    id: string;
    name: string;
}

interface AppConfig {
    transactionsSheet: SpreadSheetRef;
    imports: {
        folderName: string;
        files: ImportConfig[];
    };
}

interface ImportConfig {
    fileName: string;
    bankName: string;
    normalize: (file: GoogleAppsScript.Drive.File) => RawRecord[];
}

const config: AppConfig = {
    transactionsSheet: {
        id: TRANSACTION_SHEET_ID,
        name: "Bankin V3 Data",
    },
    imports: {
        folderName: "Imports - tmp",
        files: [
            {
                fileName: "banquepop.csv",
                bankName: "Banque Populaire",
                normalize: normalizeBanquePop,
            },
            {
                fileName: "openbank.xlsx",
                bankName: "Open Bank",
                normalize: normalizeOpenBank,
            },
        ],
    }
};

function importBankTransactions(): void {
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
    const allTransactions: Record<string, any>[] = [];

    config.imports.files.forEach(({ fileName, bankName, normalize }) => {
        try {
            const fileIterator = folder.getFilesByName(fileName);
            if (!fileIterator.hasNext()) {
                throw new Error(`File "${fileName}" not found`);
            }

            const file = fileIterator.next();
            const normalized = normalize(file);
            allTransactions.push(...normalized);
            console.log(`Done importing ${normalized.length} transactions for bank ${bankName}`);
        } catch (err: any) {
            console.error(`Error importing ${bankName} "${fileName}": ${err.message}`);
        }
    });

    if (allTransactions.length > 0) {
        const values = BankinV3.Convert.rawRecordsToCsv(allTransactions);
        values.shift();
        sheet.getRange(sheet.getLastRow() + 1, 1, values.length, values[0].length).setValues(values);
        // add 5 blank lines
        sheet.getRange(sheet.getLastRow() + 1, 1, 5, values[0].length).setValues(Array(5).fill(Array(values[0].length).fill("")));
    }
}
