interface CategorizationRule {
    matcher: {
        label: string;
    },
    action: {
        category: string;
        subCategory?: string;
    }
}


export { CategorizationRule };
