import { importBankTransactions as doImportBankTransactions } from "./bankin-v3";
import { config } from "./custom/config";

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

function importBankTransactions() {
    doImportBankTransactions(config);
}
