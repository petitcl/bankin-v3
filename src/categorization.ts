import { RawRecord, TransactionColumn, TransactionColumns } from './bankin-v3';

export interface CategorizationRule {
    matcher: {
        label: string | string[];
    },
    action: Record<TransactionColumn, string>
}

export function applyCategorizationRules(
    rules: CategorizationRule[],
    transactions: RawRecord[]
): RawRecord[] {
    return transactions.map(transaction => {
        const matchedRule = rules.find(rule => {
            const label = transaction[TransactionColumns.CONCEPT] || "";
            if (Array.isArray(rule.matcher.label)) {
                return rule.matcher.label.some(matcher => label.toLowerCase().includes(matcher.toLowerCase()));
            }
            return label.toLowerCase().includes(rule.matcher.label.toLowerCase());
        });

        if (matchedRule) {
            const columnsToUpdate = Object.keys(matchedRule.action) as (keyof RawRecord)[];
            const updatedTransaction: RawRecord = { ...transaction };
            columnsToUpdate.forEach(column => {
                if (matchedRule.action[column]) {
                    updatedTransaction[column] = matchedRule.action[column];
                }
            });
            return updatedTransaction;
        }

        return transaction;
    });
}
