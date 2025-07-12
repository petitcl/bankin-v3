import { Convert, RawRecord } from './convert';

class BankinV3App {
    Convert: Convert
    Transactions: Transactions

    constructor() {
        this.Convert      = new Convert();
        this.Transactions = new Transactions();
      }
}

const columns = {
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

const statuses = {
    VALID: 'VALID',
    IGNORED: 'IGNORED',
}

class Transactions {
    Columns: typeof columns
    Statuses: typeof statuses

    constructor() {
        this.Columns = columns;
        this.Statuses = statuses;
    }
}

const BankinV3 = new BankinV3App();

export { BankinV3, BankinV3App, RawRecord };
