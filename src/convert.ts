import { TransactionColumns } from "./bankin-v3";

type RawRecord = Record<string, any>

type ColumnData = string

type ColumnMapper = (value: ColumnData, row: RawRecord) => ColumnData;

type ColumnAdder = (row: RawRecord) => ColumnData;
type ColumnmMapper = (value: ColumnData) => ColumnData;


interface MapColumnRule {
    from: string;
    to: string;
    source: 'input' | 'normalized';
    transform: ColumnMapper;
}

interface AddNewColumnRule {
    from: null;
    to: string;
    source: 'input';
    transform: ColumnMapper;
}

type ColumnMappingRule = MapColumnRule | AddNewColumnRule;

interface FormatMapping {
    name: string;
    rules: ColumnMappingRule[];
}

function formatEuropeanNumber(num: number): string {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  }

class Convert {
    mapColumn(to: string, from: string, mapper: ColumnmMapper): MapColumnRule {
        return {
            from,
            to,
            source: 'input',
            transform: (value: ColumnData, row: RawRecord) => {
                return mapper(value);
            }
        };
    }

    addColumn(to: string, adder: ColumnAdder): AddNewColumnRule {
        return {
            from: null,
            to,
            source: 'input',
            transform: (_: ColumnData, row: RawRecord) => {
                return adder(row);
            }
        };
    }

    addConstantColumn(to: string, value: ColumnData): AddNewColumnRule {
        return {
            from: null,
            to,
            source: 'input',
            transform: () => value
        };
    }

    addComputedColumn(to: string, from: string, mapper: ColumnMapper): MapColumnRule {
        return {
            from,
            to,
            source: 'normalized',
            transform: mapper,
        };
    }

    copyColumn(to: string, from: string): MapColumnRule {
        return {
            from,
            to,
            source: 'input',
            transform: (value: ColumnData, row: RawRecord) => {
                return value;
            },
        };
    }

    parseAmount(
        from: string,
        fromDecimalSeparator = '.',
        fromThousandSeparator = ','
    ): number {
        const sign = from.startsWith('-') ? -1 : 1;
        if (from[0] === '-' || from[0] === '+') {
            from = from.substring(1);
        }
        const normalized = from
            .replace(' ', '')
            .replace(new RegExp(`\\${fromThousandSeparator}`, 'g'), '')
            .replace(fromDecimalSeparator, '.');

        return sign * parseFloat(normalized);
    }

    csvToRawRecords(data: string[][]): RawRecord[] {
        if (data.length === 0) return [];

        const headers = data[0];
        const rows = data.slice(1);

        return rows.map(row => {
            const obj: RawRecord = {};
            headers.forEach((header, idx) => {
                obj[header] = row[idx] ?? "";
            });
            return obj;
        });
    }

    rawRecordsToGSheetCsv(records: RawRecord[]): string[][] {
        if (records.length === 0) return [[]];

        const headers = Object.keys(records[0]);
        const csvData: string[][] = [headers];

        const escapedColumns = [
            TransactionColumns.DATE,
            TransactionColumns.MONTH,
        ];

        const numberColumns = [
            TransactionColumns.AMOUNT,
            TransactionColumns.ABSOLUTE_AMOUNT,
        ];

        records.forEach(record => {
            // console.log(`Converting record: ${JSON.stringify(record)}`);
            const row: string[] = headers
                .map(header => {
                    let value = record[header] ?? "";
                    
                    if (escapedColumns.includes(header)) {
                        value = `'${value}`;
                    }
                    if (numberColumns.includes(header)) {
                        const amount = this.parseAmount(value);
                        value = formatEuropeanNumber(amount);
                    }
                    return value;
                });
            // console.log(`Converted row: ${JSON.stringify(row)}`);
            csvData.push(row);
        });

        return csvData;
    }



    parseDateDDMMYYYY(str: string): Date | null {
        const parts = str.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            return new Date(year, month, day);
        }
        return null;
    }

    parseDateYYYYMMDD(str: string): Date | null {
        const parts =
            str.split('-').map(part => parseInt(part, 10));
        if (parts.length === 3) {
            const year = parts[0];
            const month = parts[1] - 1;
            const day = parts[2];
            return new Date(year, month, day);
        }
        return null;
    }

    formatDateToYYYYMMDD(date: Date | null): string {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    extractYearMonth(date: Date | null): string {
        if (!date) return "";
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        return year.toString() + "-" + month.toString().padStart(2, '0');
    }

    normalizeData(
        rows: RawRecord[],
        mapping: FormatMapping
    ): RawRecord[] {
        return rows.map((row) => {
            const normalizedRow: RawRecord = {};
            for (const rule of mapping.rules) {
                const source = rule.source === 'input' ? row : normalizedRow;
                const rawValue = rule.from === null ? "" : source[rule.from] ?? "";

                const transformed = rule.transform
                    ? rule.transform(rawValue, row)
                    : rawValue;
                normalizedRow[rule.to] = transformed;
            }
            return normalizedRow;
        });
    }

}

export {
    Convert,
    ColumnMappingRule,
    FormatMapping,
    RawRecord,
    ColumnData,
    ColumnMapper as ColumnTransformer,
    ColumnAdder,
    ColumnmMapper
}
