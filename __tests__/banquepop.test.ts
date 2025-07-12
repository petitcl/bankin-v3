import { mapBanquePop } from "../src/banquepop";

describe("mapBanquePop", () => {
    const rows = [
        ["Date de comptabilisation","Libelle simplifie","Libelle operation","Reference","Informations complementaires","Type operation","Categorie","Sous categorie","Debit","Credit","Date operation","Date de valeur","Pointage operation"],
        ["30/05/2025","libel simpl 1","label one","","","Carte bancaire","Transaction exclue","Transaction differee","-65,99","","30/05/2025","30/05/2025","0"],
        ["28/05/2025","libel simpl 2","libel 2","0FDMWLI","redacted","Prelevement","Logement - maison","Internet et telephonie","2,00","","28/05/2025","28/05/2025","0"]
    ];

    test("map banque pop correctly", () => {
        const result = mapBanquePop(rows);
        expect(result).toHaveLength(2);
        const row0 = result[0];
        expect(row0).toEqual({
            "Absolute Amount": "65.99",
            "Amount": "-65.99",
            "Bank": "Banque Pop",
            "Category": "",
            "Concept": "libel simpl 1 label one",
            "Date": "30/05/2025",
            "Month": "2025/05",
            "Status": "VALID",
            "Sub Category": "",
        });

        const row1 = result[1];
        expect(row1).toEqual({
            "Absolute Amount": "2",
            "Amount": "2",
            "Bank": "Banque Pop",
            "Category": "",
            "Concept": "libel simpl 2 libel 2",
            "Date": "28/05/2025",
            "Month": "2025/05",
            "Status": "VALID",
            "Sub Category": "",
        });
    });
});
