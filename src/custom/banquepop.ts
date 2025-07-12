import { BankinV3, RawRecord } from "../bankin-v3";

function parseAmount(row: RawRecord) {
    const debit = row["Debit"] || "";
    const credit = row["Credit"] || "";

    let amount: number;
    if (debit) {
        amount = BankinV3.Convert.parseAmount(debit, ",", ".");
    } else if (credit) {
        amount = BankinV3.Convert.parseAmount(credit, ",", ".");
    } else {
        amount = 0;
    }
    return amount;
}

function normalizeBanquePop(file: GoogleAppsScript.Drive.File): RawRecord[] {
    const rawData = Utilities.parseCsv(file.getBlob().getDataAsString(), ";");
    Logger.log(`Raw data: ${JSON.stringify(rawData)}`);

    return mapBanquePop(rawData);
}

function mapBanquePop(rawData: string[][]) {
    const mapping = {
        name: "Banque Populaire",
        rules: [
            BankinV3.Convert.mapColumn(
                BankinV3.Transactions.Columns.DATE, 
                "Date de comptabilisation",
                (value: string) => {
                    const date = BankinV3.Convert.parseDateDDMMYYYY(value);
                    return date ? BankinV3.Convert.formatDateToYYYYMMDD(date) : "";
                },
            ),
            BankinV3.Convert.addComputedColumn(
                BankinV3.Transactions.Columns.MONTH,
                BankinV3.Transactions.Columns.DATE,
                (value: string) => {
                    const date = BankinV3.Convert.parseDateYYYYMMDD(value);
                    return value ? BankinV3.Convert.extractYearMonth(date) : "";
                },
            ),
            BankinV3.Convert.addConstantColumn(BankinV3.Transactions.Columns.STATUS, BankinV3.Transactions.Statuses.VALID),
            BankinV3.Convert.addConstantColumn(BankinV3.Transactions.Columns.CATEGORY, ""),
            BankinV3.Convert.addConstantColumn(BankinV3.Transactions.Columns.SUB_CATEGORY, ""),
            BankinV3.Convert.addColumn(BankinV3.Transactions.Columns.AMOUNT, (row: RawRecord) => {
                let amount: number = parseAmount(row);
                return amount.toString();
            }),
            BankinV3.Convert.addComputedColumn(
                BankinV3.Transactions.Columns.ABSOLUTE_AMOUNT,
                BankinV3.Transactions.Columns.AMOUNT,
                (value: string) => {
                    let amount: number = Math.abs(parseFloat(value));
                    return amount.toString();
            }),
            BankinV3.Convert.addConstantColumn(BankinV3.Transactions.Columns.BANK, "Banque Pop"),
            BankinV3.Convert.addColumn(BankinV3.Transactions.Columns.CONCEPT, (row: RawRecord) => {
                const label = row["Libelle simplifie"] || "";
                const details = row["Libelle operation"] || "";

                return `${label} ${details}`.trim();
            }),
        ]
    };

    const rawRecords = BankinV3.Convert.csvToRawRecords(rawData);
    console.log(`Raw records: ${JSON.stringify(rawRecords)}`);

    const result = BankinV3.Convert.normalizeData(rawRecords, mapping);
    console.log(`Normalized records: ${JSON.stringify(result)}`);
    return result;
}

export {
    normalizeBanquePop,
    mapBanquePop,
}
