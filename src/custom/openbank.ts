import { BankinV3, RawRecord } from "../bankin-v3";
import { convertXlsToGoogleSheet } from "../xls";

function normalizeOpenBank(file: GoogleAppsScript.Drive.File): RawRecord[] {
    const tempSheet = convertXlsToGoogleSheet(file);
    const data = tempSheet.getDataRange()
        .getDataRegion()
        .getValues();
    DriveApp.getFileById(tempSheet.getParent().getId()).setTrashed(true);

    let headerRowIndex = -1;
    let headerColIndex = -1;

    // Find the cell with "Fecha Operación"
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            if (data[i][j] && data[i][j].toString().trim() === "Fecha Operación") {
                headerRowIndex = i;
                headerColIndex = j;
                break;
            }
        }
        if (headerRowIndex !== -1) break;
    }

    if (headerRowIndex === -1 || headerColIndex === -1) {
        throw new Error("No header cell found (looking for 'Fecha Operación')");
    }

    const rawData: string[][] = [];
    for (let i = headerRowIndex; i < data.length; i++) {
        const row = data[i].slice(headerColIndex); // Slice from the header column onward
        if (!row[0] || row[0].toString().trim() === "") break; // Stop at first empty 'Fecha Operación'
        rawData.push(row);
    }

    console.log(`Extracted rawData: ${JSON.stringify(rawData)}`);

    return mapOpenBank(rawData);
}

function isValidDateDDMMYYYY(str: string): boolean { 
    // Basic pattern: DD/MM/YYYY
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = str.match(regex);
    if (!match) return false;

    return true;
  }

function mapOpenBank(rawData: any[]): RawRecord[] {
    const mapping = {
        name: "Open Bank",
        rules: [
            BankinV3.Convert.mapColumn(
                BankinV3.Transactions.Columns.DATE, 
                "Fecha Operación",
                (value: any) => {
                    if (typeof value === "string" && isValidDateDDMMYYYY(value)) {
                        // If the date is in DD/MM/YYYY format, parse it directly
                        return BankinV3.Convert.formatDateToYYYYMMDD(BankinV3.Convert.parseDateDDMMYYYY(value));
                    }

                    // weird xlsx format handling, don't ask me why
                     if (typeof value === "object" && value instanceof Date) {
                        value = value.toISOString();
                    }
                    const date = new Date(value);
                    const day = date.getMonth() + 1;
                    const month = date.getDate();
                    const year = date.getFullYear();
                    const ddmmyyyy = `${day < 10 ? "0" + day : day}/${month < 10 ? "0" + month : month}/${year}`;

                    return BankinV3.Convert.formatDateToYYYYMMDD(BankinV3.Convert.parseDateDDMMYYYY(ddmmyyyy));
                }
            ),
            BankinV3.Convert.addComputedColumn(
                BankinV3.Transactions.Columns.MONTH,
                BankinV3.Transactions.Columns.DATE,
                (value: string) => {
                    const date = BankinV3.Convert.parseDateYYYYMMDD(value);
                    return date ? BankinV3.Convert.extractYearMonth(date) : "";
                },
            ),
            BankinV3.Convert.addConstantColumn(BankinV3.Transactions.Columns.STATUS, BankinV3.Transactions.Statuses.VALID),
            BankinV3.Convert.addConstantColumn(BankinV3.Transactions.Columns.CATEGORY, ""),
            BankinV3.Convert.addConstantColumn(BankinV3.Transactions.Columns.SUB_CATEGORY, ""),
            BankinV3.Convert.mapColumn(
                BankinV3.Transactions.Columns.AMOUNT,
                "Importe",
                (value: string) => {
                    let amount: number = BankinV3.Convert.parseAmount(value, ",", ".");
                    return amount.toString();
                }
            ),
            BankinV3.Convert.addComputedColumn(
                BankinV3.Transactions.Columns.ABSOLUTE_AMOUNT,
                BankinV3.Transactions.Columns.AMOUNT,
                (value: string) => {
                    let amount: number = Math.abs(parseFloat(value));
                    return amount.toString();
            }),
            BankinV3.Convert.addConstantColumn(BankinV3.Transactions.Columns.BANK, "OpenBank"),
            BankinV3.Convert.copyColumn(BankinV3.Transactions.Columns.CONCEPT, "Concepto"),
        ]
    };

    const rawRecords = BankinV3.Convert.csvToRawRecords(rawData);
    console.log(`Raw records: ${JSON.stringify(rawRecords)}`);

    const result = BankinV3.Convert.normalizeData(rawRecords, mapping);
    console.log(`Normalized records: ${JSON.stringify(result)}`);
    return result;
}

export {
    normalizeOpenBank,
    mapOpenBank,
}