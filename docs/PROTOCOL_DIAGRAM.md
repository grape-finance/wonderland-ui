# Wonderland Protocol — Diagram & Metric Formulas

## Token Lifecycle

```mermaid
flowchart TD
    subgraph User["User Actions"]
        BUY["Buy TIME\n(DEX / PulseX)"]
        STAKE["Stake TIME\n→ receive MEMO 1:1"]
        UNSTAKE["Unstake MEMO\n→ receive TIME 1:1"]
        WRAP["Wrap MEMO\n→ receive wMEMO"]
        UNWRAP["Unwrap wMEMO\n→ receive MEMO"]
        BOND["Bond Asset\n(USDC or WPLS)"]
        CLAIM["Claim vested TIME\n(after 5-day vest)"]
    end

    subgraph Tokens["Tokens"]
        TIME["TIME\n9 decimals\n(main token)"]
        MEMO["MEMO\n9 decimals\n(rebasing staked token)"]
        WMEMO["wMEMO\n18 decimals\n(index-adjusted wrapper)"]
        USDC["USDC / WPLS\n(bond principal)"]
    end

    subgraph Protocol["Protocol Contracts"]
        STAKING["Staking Contract\n(holds TIME, mints MEMO)"]
        DIST["Staking Distributor\n(mints TIME rewards)"]
        TREASURY["Treasury\n(holds reserves)"]
        BOND_DEP["Bond Depository\n(USDC / WPLS)"]
    end

    BUY --> TIME
    TIME --> STAKE --> STAKING
    STAKING -->|mint MEMO| MEMO
    MEMO --> WRAP --> WMEMO
    WMEMO --> UNWRAP --> MEMO
    MEMO --> UNSTAKE --> STAKING
    STAKING -->|return TIME| TIME

    USDC --> BOND --> BOND_DEP
    BOND_DEP -->|send principal| TREASURY
    TREASURY -->|mint discounted TIME| BOND_DEP
    BOND_DEP -->|vest 5 days| CLAIM
    CLAIM --> TIME

    DIST -->|mint reward TIME every epoch| STAKING
    STAKING -->|rebase MEMO supply| MEMO
```

---

## Token Relationship

```mermaid
flowchart LR
    TIME["TIME\n(price = P)"]
    MEMO["MEMO\n≈ TIME staked\n(1 MEMO ≈ 1 TIME at stake time)"]
    WMEMO["wMEMO\n1 wMEMO = index × TIME\nindex grows every rebase"]

    TIME -- "stake 1:1" --> MEMO
    MEMO -- "wrap: wMEMO = MEMO / index" --> WMEMO
    WMEMO -- "unwrap: MEMO = wMEMO × index" --> MEMO
    MEMO -- "unstake 1:1" --> TIME
```

---

## Rebase / Epoch Cycle

```mermaid
sequenceDiagram
    participant D as Distributor
    participant S as Staking Contract
    participant M as MEMO Token

    Note over S: Every epoch (~8 hrs)
    S->>D: rebase() called
    D->>S: nextRewardFor(staking) → nextReward TIME
    D-->>S: mint nextReward TIME to Staking
    S->>M: rebase() — increase MEMO totalSupply by nextReward
    Note over M: All MEMO holders' balances grow proportionally
    S->>S: index += index × rebaseRate
```

---

## Bonding Flow

```mermaid
sequenceDiagram
    participant U as User
    participant BD as Bond Depository
    participant T as Treasury
    participant V as Vesting (5 days)

    U->>BD: deposit(amount, maxPrice, recipient)
    BD->>T: deposit principal (USDC / WPLS)
    T-->>BD: mint TIME payout (at bond price)
    BD-->>V: lock payout for vesting period
    Note over V: Linear vest over 5 days
    V-->>U: redeem() → receive TIME
```

---

## Dashboard Metric Formulas

| Metric | Formula | Source |
|--------|---------|--------|
| **TIME Price** | `USDC reserve / TIME reserve` (from DEX LP) | `LpPair.getReserves()` |
| **wMEMO Price** | `timePrice × index` | `timePrice × staking.index()` |
| **Market Cap** | `wMEMO supply × wMEMO price`<br>*(or `MEMO supply × timePrice` when no wMEMO minted)* | `wMEMO.totalSupply() × wMemoPrice` |
| **TVL (Staking)** | `wMEMO circulation × wMEMO price`<br>*(or `MEMO circulating supply × timePrice` when no wMEMO minted)* | `wMEMO.totalSupply() × wMemoPrice` |
| **Treasury Balance** | `totalReserves / 1e9` | `treasury.totalReserves()` |
| **Backing per wMEMO** | `Treasury Balance (USD) / wMEMO circulation` | `total / effectiveWMemoCirc` |
| **Staking APY** | `(1 + rebaseRate)^(365 × 3) − 1` | rebases are 3×/day |
| **5-Day Rate** | `(1 + rebaseRate)^(5 × 3) − 1` | |
| **Rebase Rate** | `distributor.nextRewardFor(staking) / TIME.totalSupply()` | protocol-level rate |
| **Current Index** | `staking.index() / 1e9` | grows every rebase |
| **Bond Price** | `bondDepository.bondPriceInUSD()` | scaled to reserve decimals |
| **Bond Discount** | `(timePrice − bondPrice) / bondPrice` | negative = premium |
| **Bond ROI** | same as discount | |

---

## wMEMO: When Is It Minted?

wMEMO is **not** minted automatically. The user must explicitly wrap:

```
TIME  →  stake (Staking Contract)  →  MEMO
MEMO  →  wrap  (wMEMO Contract)    →  wMEMO
```

- **Mint:** User calls `wMEMO.wrap(memoAmount)` — MEMO is transferred to the wMEMO contract and wMEMO is minted at `wMEMO = MEMO / index`.
- **Burn:** User calls `wMEMO.unwrap(wMemoAmount)` — wMEMO is burned and MEMO is returned at `MEMO = wMEMO × index`.

Since the index grows with every rebase, holding wMEMO is equivalent to holding rebasing MEMO — you always unwrap into *more* MEMO than you wrapped.

> **Testnet note:** Until at least one user wraps MEMO into wMEMO, `wMEMO.totalSupply() = 0`. The UI falls back to MEMO-equivalent values (`MEMO.circulatingSupply() / index`) so that Market Cap, TVL, and Backing per wMEMO display correctly even before any wrapping has occurred.

---

## Index Growth Over Time

```
index_0  = 1.000  (genesis)
index_1  = index_0 × (1 + rebaseRate)
index_n  = (1 + rebaseRate)^n

rebaseRate ≈ 0.5% per rebase (3× daily → ~23,000% APY)
```

A user who wraps `100 MEMO` at `index = 1.0` holds `100 wMEMO`.  
After 1 year at 0.5% / rebase, `index ≈ 17.5`.  
Unwrapping returns `100 × 17.5 = 1,750 MEMO` — a 17.5× increase.
