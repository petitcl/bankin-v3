import { normalizeOpenBank } from "./openbank";
import { normalizeBanquePop } from "./banquepop";
import { TRANSACTION_SHEET_ID } from "./secrets";
import { AppConfig, TransactionColumns, TransactionStatuses } from "../bankin-v3";
import { CategorizationRule } from "../categorization";

const categorizationRules: CategorizationRule[] = [
    {
        matcher: { label: "COMPRA EN MARKET QUEVEDO" },
        action: {
            [TransactionColumns.CATEGORY]: "Food",
            [TransactionColumns.SUB_CATEGORY]: "Groceries"
        }
    },
    {
        matcher: { label: "COMPRA EN CARREFOUR MARKET QUEVEDO" },
        action: {
            [TransactionColumns.CATEGORY]: "Food",
            [TransactionColumns.SUB_CATEGORY]: "Groceries"
        }
    },
    {
        matcher: { label: "COMPRA EN LIDL" },
        action: {
            [TransactionColumns.CATEGORY]: "Food",
            [TransactionColumns.SUB_CATEGORY]: "Groceries"
        }
    },
    {
        matcher: { label: "COMPRA EN NETFLIX.COM" },
        action: {
            [TransactionColumns.CATEGORY]: "Bills",
            [TransactionColumns.SUB_CATEGORY]: "Online Services"
        }
    },
    {
        matcher: { label: "RECIBO CRUZ ROJA" },
        action: {
            [TransactionColumns.CATEGORY]: "Misc",
            [TransactionColumns.SUB_CATEGORY]: "Charity"
        }
    },
    {
        matcher: { label: "Renta C/ Cisneros 51 3er int dra" },
        action: {
            [TransactionColumns.CATEGORY]: "Home",
            [TransactionColumns.SUB_CATEGORY]: "Rent"
        }
    },
    {
        matcher: { label: "RETENCION HACIENDA ABONO DE DEVOLUCION RECIBOS PRINCIPALES" },
        action: {
            [TransactionColumns.CATEGORY]: "Bank / Tax",
            [TransactionColumns.SUB_CATEGORY]: "Income Tax"
        }
    },
    {
        matcher: { label: "BONIFICACION SOBRE EL IMPORTE DE RECIBOS DOMICILIADOS Y PAGADOS" },
        action: {
            [TransactionColumns.CATEGORY]: "Incomes",
            [TransactionColumns.SUB_CATEGORY]: "Other"
        }
    },
    {
        matcher: { label: "COMPRA EN ALDI" },
        action: {
            [TransactionColumns.CATEGORY]: "Food",
            [TransactionColumns.SUB_CATEGORY]: "Groceries"
        }
    },
    {
        matcher: { label: "COMPRA EN Google YouTubePremium" },
        action: {
            [TransactionColumns.CATEGORY]: "Bills",
            [TransactionColumns.SUB_CATEGORY]: "Online Services"
        }
    },
    {
        matcher: { label: "RECIBO SIMYO" },
        action: {
            [TransactionColumns.CATEGORY]: "Bills",
            [TransactionColumns.SUB_CATEGORY]: "Phone / Internet"
        }
    },
    {
        matcher: { label: "RECIBO IBERDROLA" },
        action: {
            [TransactionColumns.CATEGORY]: "Home",
            [TransactionColumns.SUB_CATEGORY]: "Electricity"
        }
    },
    {
        matcher: { label: "COMISION POR COMPRAS REALIZADAS EN MONEDA NO EURO" },
        action: {
            [TransactionColumns.CATEGORY]: "Bank / Tax",
            [TransactionColumns.SUB_CATEGORY]: "Bank Fees"
        }
    },
    {
        matcher: { label: "COMPRA EN CAFETERIA L'EUROPE" },
        action: {
            [TransactionColumns.CATEGORY]: "Entertainment",
            [TransactionColumns.SUB_CATEGORY]: "Bars / Clubs"
        }
    },
    {
        matcher: { label: "PRLV SEPA FREE MOBILE" },
        action: {
            [TransactionColumns.CATEGORY]: "Bills",
            [TransactionColumns.SUB_CATEGORY]: "Phone / Internet"
        }
    },
    {
        matcher: { label: "COTIS VISA CLASSIC" },
        action: {
            [TransactionColumns.CATEGORY]: "Bank / Tax",
            [TransactionColumns.SUB_CATEGORY]: "Bank Fees"
        }
    },
    {
        matcher: { label: "VIR PETIT CLEMENT GILLESInternal Transfer" },
        action: {
            [TransactionColumns.CATEGORY]: "Incomes",
            [TransactionColumns.SUB_CATEGORY]: "Internal Transfer"
        }
    },
    {
        matcher: { label: "FRAIS MENSUEL TENUE" },
        action: {
            [TransactionColumns.CATEGORY]: "Bank / Tax",
            [TransactionColumns.SUB_CATEGORY]: "Bank Fees"
        }
    },
    {
        matcher: { label: "VIR ActivImmoActivImmo" },
        action: {
            [TransactionColumns.CATEGORY]: "Incomes",
            [TransactionColumns.SUB_CATEGORY]: "Investments"
        }
    },
    {
        matcher: { label: "PRLV SEPA LA CROIX ROUGE" },
        action: {
            [TransactionColumns.CATEGORY]: "Misc",
            [TransactionColumns.SUB_CATEGORY]: "Charity"
        }
    },
    {
        matcher: { label: "PRLV SEPA FEDERAL FINANCE" },
        action: {
            [TransactionColumns.CATEGORY]: "Bank / Tax",
            [TransactionColumns.SUB_CATEGORY]: "Loans"
        }
    },
    {
        matcher: { label: "Naturgy" },
        action: {
            [TransactionColumns.CATEGORY]: "Home",
            [TransactionColumns.SUB_CATEGORY]: "Gas"
        }
    },
    {
        matcher: { label: "COMPRA EN Riot*" },
        action: {
            [TransactionColumns.CATEGORY]: "Entertainment",
            [TransactionColumns.SUB_CATEGORY]: "Video Games"
        }
    },
    {
        matcher: { label: "COMPRA EN UBER *TRIP" },
        action: {
            [TransactionColumns.CATEGORY]: "Transport",
            [TransactionColumns.SUB_CATEGORY]: "Taxis"
        }
    },
    {
        matcher: { label: "COMPRA EN METRO DE MADRID S.A" },
        action: {
            [TransactionColumns.CATEGORY]: "Transport",
            [TransactionColumns.SUB_CATEGORY]: "Public Transportation"
        }
    },
    {
        matcher: { label: "PRLV SEPA Croix-Rouge francaise" },
        action: {
            [TransactionColumns.CATEGORY]: "Misc",
            [TransactionColumns.SUB_CATEGORY]: "Charity"
        }
    },
    {
        matcher: { label: "FRAIS VIRT INSTANTANE" },
        action: {
            [TransactionColumns.CATEGORY]: "Bank / Tax",
            [TransactionColumns.SUB_CATEGORY]: "Bank Fees"
        }
    },
    {
        matcher: { label: "COMPRA EN SGB SANTA ENGRACIA" },
        action: {
            [TransactionColumns.CATEGORY]: "Food",
            [TransactionColumns.SUB_CATEGORY]: "Cofee Shops"
        }
    },
    {
        matcher: { label: "STARBUKS" },
        action: {
            [TransactionColumns.CATEGORY]: "Food",
            [TransactionColumns.SUB_CATEGORY]: "Cofee Shops"
        }
    },
    {
        matcher: { label: "COMPRA EN REGMA" },
        action: {
            [TransactionColumns.CATEGORY]: "Food",
            [TransactionColumns.SUB_CATEGORY]: "Cofee Shops"
        }
    },
    {
        matcher: { label: "COMPRA EN RELIGION SPECIALITY COFFE" },
        action: {
            [TransactionColumns.CATEGORY]: "Food",
            [TransactionColumns.SUB_CATEGORY]: "Cofee Shops"
        }
    },
    {
        matcher: { label: "TRANSFERENCIA DE DATADOG CLOUD SPAIN" },
        action: {
            [TransactionColumns.CATEGORY]: "Incomes",
            [TransactionColumns.SUB_CATEGORY]: "Salary"
        }
    },
    {
        matcher: { label: "YOUTUBEPREMIUM" },
        action: {
            [TransactionColumns.CATEGORY]: "Bills",
            [TransactionColumns.SUB_CATEGORY]: "Online Services"
        }
    },
    {
        matcher: { label: "VIR ActivImmo" },
        action: {
            [TransactionColumns.CATEGORY]: "Incomes",
            [TransactionColumns.SUB_CATEGORY]: "Investments",
        }
    },
    {
        matcher: { 
            label: [
                "Virement de M CLEMENT PETIT",
                "M CLEMENT PETIT VIR M CLEMENT PETIT",
                "TRANSFERENCIA A FAVOR DE Clément Petit CONCEPTO: Internal transfer",
                "Internal Transfer",
                "VIREMENT DUOPLUS ALLER",
                "VIR INST CLEMENT PETIT OPENBANK",
            ],                
        },
        action: {
            [TransactionColumns.CATEGORY]: "Incomes",
            [TransactionColumns.SUB_CATEGORY]: "Internal Transfer",
            [TransactionColumns.STATUS]: TransactionStatuses.IGNORED,
        }
    }
];

export const config: AppConfig = {
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
                fileName: "openbank.xls",
                bankName: "Open Bank",
                normalize: normalizeOpenBank,
            },
        ],
    },
    categorizationRules: categorizationRules,
};
