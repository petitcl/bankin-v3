import { mapOpenBank } from '../src/custom/openbank';

describe("mapOpenBank", () => {
    const rows = [
        ["Fecha Operación", "", "Fecha Valor", "", "Concepto", "", "Importe", "", "Saldo"],
        ["30/05/2025", "", "30/05/2025", "", "sample debit 1", "", "-1.000,00", "", "1001,01"],
        ["2025-12-05T08:00:00.000Z", "", "2025-12-05T08:00:00.000Z", "", "sample credit 1", "", "1.234,56", "", "1001,01"]
    ];

    test("map open bank correctly", () => {
        const result = mapOpenBank(rows);
        expect(result).toHaveLength(2);
        const row0 = result[0];
        expect(row0).toEqual({
            "Absolute Amount": "1000",
            "Amount": "-1000",
            "Bank": "OpenBank",
            "Category": "",
            "Concept": "sample debit 1",
            "Date": "2025-05-30",
            "Month": "2025-05",
            "Status": "VALID",
            "Sub Category": "",
        });

        const row1 = result[1];
        expect(row1).toEqual({
            "Absolute Amount": "1234.56",
            "Amount": "1234.56",
            "Bank": "OpenBank",
            "Category": "",
            "Concept": "sample credit 1",
            "Date": "2025-05-12",
            "Month": "2025-05",
            "Status": "VALID",
            "Sub Category": "",
        });
    });
});
