import { BankinV3, RawRecord } from "./bankin-v3";
import { convertXlsToGoogleSheet } from "./xls";

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

function mapOpenBank(rawData: any[]): RawRecord[] {
    //[["Fecha Operación","","Fecha Valor","","Concepto","","Importe","","Saldo"],
    // ["30/05/2025","","30/05/2025","","TRANSFERENCIA A FAVOR DE Clément Petit CONCEPTO: Internal transfer","","-3.000,00","","6.366,76"],["30/05/2025","","30/05/2025","","TRANSFERENCIA DE DATADOG CLOUD SPAIN, SL, CONCEPTO NOMINA/PID/05/B88259379000","","4.242,76","","9.366,76"],["30/05/2025","","30/05/2025","","TRANSFERENCIA A FAVOR DE Maria Del Carmen Moreno Gutier CONCEPTO: Renta C/ Cisneros 51 3er int dra","","-1.000,00","","5.124,00"],["29/05/2025","","29/05/2025","","Google pay: COMPRA EN MARKET QUEVEDO, CON LA TARJETA : 5489133178424402 EL 2025-05-29","","-3,23","","6.124,00"],["29/05/2025","","29/05/2025","","Google pay: COMPRA EN Honest Greens Serrano, CON LA TARJETA : 5489133178424402 EL 2025-05-27","","-15,40","","6.127,23"],["29/05/2025","","29/05/2025","","Google pay: COMPRA EN STAR, CON LA TARJETA : 5489133178424402 EL 2025-05-29","","-12,00","","6.142,63"],["29/05/2025","","29/05/2025","","RECIBO Simyo Nº RECIBO 0073 0100 755 CLCMVSH REF. MANDATO 35939607540750257124","","-28,99","","6.154,63"],["29/05/2025","","29/05/2025","","Google pay: COMPRA EN SAMSARA, CON LA TARJETA : 5489133178424402 EL 2025-05-29","","-22,00","","6.183,62"],["26/05/2025","","26/05/2025","","Google pay: COMPRA EN KALUA HELADOS, CON LA TARJETA : 5489133178424402 EL 2025-05-26","","-4,30","","6.205,62"],["26/05/2025","","26/05/2025","","COMPRA EN TIMELEFT SUBSCRIPTION, CON LA TARJETA : 5489133178424402 EL 2025-05-23","","-19,99","","6.209,92"],["26/05/2025","","26/05/2025","","COMPRA EN YOUTUBEPREMIUM, CON LA TARJETA : 5489133178424402 EL 2025-05-22","","-23,99","","6.229,91"],
    const mapping = {
        name: "Open Bank",
        rules: [
            BankinV3.Convert.copyColumn(BankinV3.Transactions.Columns.DATE, "Fecha Operación"),
            BankinV3.Convert.addComputedColumn(
                BankinV3.Transactions.Columns.MONTH,
                BankinV3.Transactions.Columns.DATE,
                (value: string) => {
                    const date = BankinV3.Convert.parseDateDDMMYYYY(value);
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

    return BankinV3.Convert.normalizeData(rawRecords, mapping);;
}

export {
    normalizeOpenBank,
    mapOpenBank,
}