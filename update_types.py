with open('types.ts', 'r') as f:
    content = f.read()

new_types = """
export type Denominations = '100' | '50' | '20' | '10' | '5' | '2' | '1' | '0.5' | '0.2' | '0.1';

export type DenominationCounts = {
  [key in Denominations]: number;
};

export interface TillCounts {
  open: DenominationCounts;
  close: DenominationCounts;
}

export interface TillReconciliation {
  expectedFloat: number;
  counts: TillCounts;
}

export interface SafeCounts {
  denominations: DenominationCounts;
  looseNotes: number;
  looseCoins: number;
  pettyCash: number;
  hoppers?: number;
  gamingTill?: number;
  banking?: number;
}

export interface CashUpRecord {
  id: string;
  date: string; // ISO date
  tills: {
    fb1: TillReconciliation;
    fb2: TillReconciliation;
    fb3: TillReconciliation;
    gaming: TillReconciliation;
    tab: TillReconciliation;
    crt: TillReconciliation;
  };
  safes: {
    officeOpen: { counts: SafeCounts, float: number, expectedTotal: number };
    gaming: { counts: SafeCounts, float: number, expectedTotal: number };
    tabOffice: { counts: SafeCounts, float: number, expectedTotal: number };
  };
  notes: {
    day: string;
    night: string;
  };
}
"""

if "export type Denominations" not in content:
    with open('types.ts', 'a') as f:
        f.write("\n" + new_types)
    print("Types added successfully.")
else:
    print("Types already exist.")
