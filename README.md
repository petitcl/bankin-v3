# Bankin v3

A Google Apps Script application for importing and categorizing bank transactions in Google Sheets. This tool automates the process of converting bank data from various formats into a standardized transaction format with automatic categorization.

## Overview

The application provides:
- **Transaction Import**: Converts bank data from multiple formats into a standardized Google Sheets format
- **Auto-categorization**: Applies configurable rules to automatically categorize transactions
- **Google Sheets Integration**: Adds a custom menu to Google Sheets for easy access
- **Multi-bank Support**: Handles different bank export formats through configurable converters

## Project Structure

```
src/
├── main.ts              # Entry point - Google Sheets menu integration
├── bankin-v3.ts         # Core transaction processing logic
├── convert.ts           # Bank data format conversion
├── categorization.ts    # Transaction categorization rules
├── xls.ts              # Excel file handling utilities
└── custom/             # Configuration files
```

## Development

### Prerequisites
- Node.js and npm
- Google Apps Script CLI (`@google/clasp`)

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure CLASP (Google Apps Script CLI):
   ```bash
   cp clasp.example.json .clasp.json
   # Edit .clasp.json with your Google Apps Script project ID
   ```

### Available Commands

- **Build**: Compile TypeScript and bundle for Google Apps Script
  ```bash
  npm run build
  ```

- **Test**: Run Jest test suite
  ```bash
  npm run test
  ```

- **Deploy**: Push to Google Apps Script (requires CLASP setup)
  ```bash
  npx clasp push
  ```

- **View Logs**: Monitor Google Apps Script execution
  ```bash
  npx clasp logs
  ```

## Configuration

The application uses configuration files in the `src/custom/` directory to define:
- Bank-specific data conversion rules
- Transaction categorization rules
- Column mappings and data transformations

## Usage

1. Build and deploy the application to Google Apps Script
2. Open a Google Sheets document
3. Use the "Accounting" → "Import Transactions" menu item
4. The script will process and categorize your bank transaction data

## Testing

The project includes Jest tests for core functionality. Tests are located in the `__tests__/` directory and cover transaction processing and bank-specific parsing logic.