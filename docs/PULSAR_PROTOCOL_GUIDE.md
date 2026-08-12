# Pulsar Protocol — Full Guide

This document covers the **concepts**, **on-chain mechanics**, and **complete frontend (UI) functionality** for the Pulsar protocol deployed on PulseChain. The UI is a React/Redux app and this guide traces every user-facing feature end-to-end.

---

## 1. Token Overview

| Token | Role | Decimals | Contract |
|-------|------|----------|----------|
| **PULSAR** | Base protocol token. New PULSAR is minted by the treasury when reserves are deposited (bonds). | 9 | `PulsarERC20Token` |
| **QUASAR** | Rebasing staking receipt (≈ sOHM in Olympus). Balance grows each epoch. | 9 | `QuasarToken` |
| **QUASAR** | Non-rebasing wrapper around QUASAR. Holds a fixed share; each QUASAR is redeemable for more QUASAR as the index rises. | 18 | `QUASAR` |

### Olympus name equivalents

| Olympus v1 | Pulsar |
|------------|------------|
| OHM | PULSAR |
| sOHM | QUASAR |
| gOHM | QUASAR |

---

## 2. Core Protocol Mechanics

### Epochs

- Time is divided into **epochs** (configured as 8 hours on PulseChain mainnet).
- At the end of each epoch, `staking.rebase()` is called (triggered by the first stake/unstake/redeem after the epoch ends).
- `rebase()` calls `distributor.distribute()` which **mints new PULSAR** to the staking contract.
- The staking contract then updates `epoch.distribute` = surplus PULSAR available for the next rebase.

### Staking Rebase

```
stakingRebase = nextRewardFor(staking) / PULSAR.totalSupply()
             = (totalSupply × rate / 1,000,000) / totalSupply
             = rate / 1,000,000
             = 5000 / 1,000,000 = 0.5% per epoch
```

### APY Formula

With 3 epochs per day (8-hour epochs):
```
APY = (1 + stakingRebase)^(365 × 3) - 1
    = (1.005)^1095 - 1 ≈ 23,000%
```

### Index

`staking.index()` is a monotonically increasing number that tracks total cumulative rebase growth since launch. It is used to convert between QUASAR ↔ QUASAR:
- `QUASAR → QUASAR`: `quasarAmount = wrappedQuasarAmount × index / 1e9`
- `QUASAR → QUASAR`: `wrappedQuasarAmount = quasarAmount × 1e9 / index`

---

## 3. Dashboard Page

**Route:** `/`  
**Redux slice:** `app-slice.ts`

The dashboard reads on-chain data for PulseChain mainnet and displays:

| Field | Source | Formula |
|-------|--------|---------|
| **QUASAR Price** | `stakingContract.index()` × PULSAR price | `index × $1 = $1` at launch |
| **Market Cap** | `quasarContract.totalSupply()` × PULSAR price | `supply × $1` |
| **TVL** | `quasarContract.circulatingSupply()` × PULSAR price | `stakedQuasar × $1` |
| **Treasury Balance** | `treasuryContract.totalReserves()` | Formatted as 9-dec PULSAR units |
| **Backing per QUASAR** | Treasury balances × live oracle prices | treasury value / circulating supply |

**Data flow:**
1. `useWeb3Context` detects network and provider
2. `loadAppDetails({ networkID, provider })` thunk is dispatched
3. For `PULSE` (chain 369): reads staking, QUASAR, treasury, distributor, LP, and AaveOracleFetch data
4. State stored in Redux `app` slice, consumed by `TreasuryDashboard` component

---

## 4. Stake Page

**Route:** `/stake`  
**Redux slices:** `app-slice.ts`, `account-slice.ts`, `stake-slice.ts`

### What it shows

| Field | Value | Source |
|-------|-------|--------|
| APY | ~23,000% | `(1 + rebase)^1095 - 1` from `distributor.nextRewardFor` |
| TVL | circulatingSupply × $1 | `quasarContract.circulatingSupply()` |
| Current Index | staking index | `stakingContract.index()` formatted in gwei |
| Your Balance | PULSAR in wallet | `pulsar.balanceOf(address)` |
| Your Staked Balance | QUASAR in wallet | `quasar.balanceOf(address)` |
| Wrapped Balance | QUASAR in wallet | `wrappedQuasar.balanceOf(address)` |
| Exchange Rate | 1 QUASAR = N QUASAR | wrapper conversion rate |
| Next Reward Amount | Upcoming QUASAR rebase | `epoch.distribute` from staking |
| Next Reward Yield | Next rebase % | `epoch.distribute / circulatingSupply` |
| ROI (5-Day Rate) | 5-day compounded return | `(1 + rebase)^15 - 1` |

### Stake tab (PULSAR → QUASAR)

1. User enters PULSAR amount
2. Clicks **Approve** → `pulsar.approve(stakingHelper, MaxUint256)`
3. Clicks **Stake PULSAR** → `stakingHelper.stake(amount, address)`
   - StakingHelper wraps stake + claim in one tx
   - PULSAR transfers to staking contract
   - QUASAR minted to user

### Unstake tab (QUASAR → PULSAR)

1. User enters QUASAR amount
2. Clicks **Approve** → `quasar.approve(staking, MaxUint256)`
3. Clicks **Unstake QUASAR** → `staking.unstake(amount, rebase=false)`
   - QUASAR burns
   - PULSAR returned to user

### Wrap / Unwrap (QUASAR ↔ QUASAR)

Located below the main stake panel:

- **Wrap:** `quasar.approve(wrapper)` → `wrapper.wrap(quasarAmount)`
- **Unwrap:** `wrapper.unwrap(wrappedQuasarAmount)` → returns QUASAR

---

## 5. Mint (Bond) Page

**Route:** `/mints`  
**Redux slices:** `bond-slice.ts`, `account-slice.ts`

### Bond List (ChooseBond)

Displays all active bonds. For each bond:

| Column | Description |
|--------|-------------|
| **Mint** | Token name + icon |
| **Price** | USD cost to receive 1 PULSAR via this bond |
| **ROI** | `(marketPrice − bondPrice) / bondPrice × 100` |
| **Purchased** | Treasury balance of this reserve token |

**Active bonds on PulseChain mainnet:**

| Bond | Type | Contract |
|------|------|----------|
| USDC | Reserve bond (`BondDepository`) | `USDCBondDepository` |
| WPLS | Reserve bond (`BondDepository`) | `WPLSBondDepository` |
| pDAI | Reserve bond (`BondDepository`) | `PDAIBondDepository` |

### Bond Price Calculation

All three reserve bonds use the same USD/PULSAR price scale:
```
bondPriceInUSD() = bondPrice() × 10^reserveDecimals / 100
minimumPrice = discounted PULSAR USD price in cents
```

Before calculating payout, Treasury converts the deposited principal to USD:
```
valueOf(principal, amount)
  = amount × AaveOracleFetch.getAssetPrice(realPriceAsset)
  = 9-decimal USD reserve value
```

This applies equally to real tokens and mocks; mock tokens map to the real
USDC, WPLS, or pDAI address for oracle lookup.

### Bond Detail Modal

Opened by clicking **Mint** on a bond row.

#### Header

| Field | Description |
|-------|-------------|
| Mint Price | Bond price in USD per PULSAR |
| QUASAR Price | Current QUASAR market price |
| PULSAR Price | Current PULSAR/pDAI LP market price |

#### Mint tab

1. User enters amount of reserve token (e.g. `10 USDC`)
2. UI calls `bondContract.payoutFor(amount)` to show **You Will Get** (PULSAR)
3. **Approve** button: `reserveToken.approve(bondAddress, MaxUint256)`
   - Only needed once per bond
4. **Mint** button: `bondContract.deposit(amount, maxPrice, address)`
   - `maxPrice` = `bondPrice() × (1 + slippage)` (default 0.5%)
   - Treasury receives reserves, mints PULSAR to bond depository
   - Your vesting position is recorded on-chain

**Validations:**
- Amount > `maxBondPriceToken`: "Try minting less" error
- Payout < 0.01 PULSAR: "Bond too small" error (contract minimum)

#### Redeem tab

Shows your **current vesting position** for that bond:

| Field | Description |
|-------|-------------|
| Pending Rewards | PULSAR earned so far (vested portion) |
| Claimable Rewards | PULSAR you can claim now |
| Time Until Fully Vested | Remaining vesting time |
| ROI | Discount you locked in at bond time |

- **Claim** button: `bondContract.redeem(address, autostake=false)`
  - Transfers vested PULSAR to wallet
- **Claim and Autostake** button: `bondContract.redeem(address, autostake=true)`
  - Claims + immediately stakes PULSAR → you receive QUASAR

**Important:** The deposited USDC, WPLS, or pDAI is transferred to Treasury. You receive vested PULSAR in return.

### Bond Vesting

Vesting is linear over `vestingTerm` seconds (5 days = 432,000 seconds):
```
percentVested = (currentTime - bondCreationTime) / vestingTerm × 10,000
claimable = totalPayout × percentVested / 10,000
```

---

## 6. Calculator Page

**Route:** `/calculator`

A simulation tool for projecting staking returns. **Not a guarantee.**

### Inputs

| Field | Default | Description |
|-------|---------|-------------|
| QUASAR Amount | Your QUASAR balance | How many QUASAR you hold |
| APY (%) | Current staking APY | Expected annual return |
| Days | Slider (1–365) | Projection horizon |

### Calculation

```
epochRate = (1 + APY)^(1/1095) - 1      // per-epoch rate from APY
initialQuasar = quasarAmount × quasarConversionRate

balance = initialQuasar
for each epoch in (days × 3):
    balance += balance × epochRate

potentialWealth = balance × quasarPrice
```

### Outputs

| Field | Description |
|-------|-------------|
| Current Wealth | `quasarAmount × quasarPrice` |
| Potential Wealth | Projected USD value after compounding |
| Potential Lambos | `floor(potentialWealth / 220,000)` |

---

## 7. Wrap / Unwrap Page

**Route:** `/wrap` (if enabled)

Standalone interface for QUASAR ↔ QUASAR conversion.

- **Wrap:** Enter QUASAR → approve → `wrapper.wrap(amount)` → receive QUASAR
- **Unwrap:** Enter QUASAR → `wrapper.unwrap(amount)` → receive QUASAR

Exchange rate displayed: `1 QUASAR = N QUASAR` (increases over time as index grows).

---

## 8. Frontend Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 4 |
| UI components | Material UI v5 |
| State | Redux Toolkit |
| Blockchain | ethers.js v5 |
| Wallet | Web3Modal / MetaMask |

### Key Files

```
src/
├── constants/
│   ├── addresses.ts          ← Contract addresses per network
│   ├── blockchain.ts         ← PulseChain mainnet network ID (PULSE=369)
│   └── view.ts               ← Feature flags per network (mints, farm, etc.)
│
├── helpers/bond/
│   ├── bond.ts               ← Bond base class (isLP, isEthBond, reserveDecimals)
│   └── index.ts              ← Bond instances + exports (usdcBond, wplsBond, ...)
│
├── store/slices/
│   ├── app-slice.ts          ← Global metrics (APY, TVL, QUASAR price, treasury)
│   ├── account-slice.ts      ← Per-address balances + allowances + bond positions
│   ├── bond-slice.ts         ← Bond price, quote, discount calculation + deposit/redeem
│   ├── stake-slice.ts        ← Stake / unstake / wrap / unwrap actions
│   └── wrap-slice.ts         ← Wrap conversion rates
│
├── views/
│   ├── TreasuryDashboard/    ← Dashboard page
│   ├── Stake/                ← Stake + Wrap page
│   ├── Bond/                 ← Bond detail modal (BondPurchase + BondRedeem)
│   ├── ChooseBond/           ← Bond list + BondRow cards
│   └── Calculator/           ← Calculator page
│
└── abi/                      ← Contract ABIs (JSON)
```

### Network Detection

`useWeb3Context` hook detects the connected wallet network. All Redux thunks receive `networkID` and `provider` to select the correct contract addresses from `constants/addresses.ts`.

Feature availability is controlled in `constants/view.ts` for PulseChain mainnet:
```typescript
[Networks.PULSE]: {
    mints: true,    // bonding enabled
    stake: true,
    farm: false,    // no farm contract
    ...
}
```

---

## 9. PulseChain Mainnet Deployment

The application supports PulseChain mainnet (chain 369) only. A deployment can
use the real USDC, WPLS, and pDAI contracts or deploy mock principal tokens when
`USE_MOCK_TOKENS=true`. In both modes, USD prices come from the live
`AaveOracleFetch` contract; mock principal tokens are mapped to the corresponding
real asset address for price discovery.

The deployment and LP scripts write fresh addresses to
`wonderland-contract/deployments/pulse.json`. Run `npm run sync-frontend:mainnet`
from the contract repository to copy those addresses into the frontend's
`.env.local` file.

---

## 10. Mainnet Price Sources

| Item | Value |
|------|-------|
| AaveOracleFetch | `0x0f907F1D586302AD04283f5739bA20f28fD7cBC6` |
| WPLS price asset | `0xA1077a294dDE1B09bB078844df40758a5D0f9a27` |
| USDC price asset | `0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07` |
| pDAI price asset | `0x6B175474E89094C44Da98b954EedeAC495271d0F` |
| Oracle unit | 8 decimals (`BASE_CURRENCY_UNIT = 1e8`) |

---

## 11. Common Issues & Solutions

| Symptom | Cause | Fix |
|---------|-------|-----|
| APY shows 0% | `epoch.distribute` stale (pre-epoch) | Use `distributor.nextRewardFor` for display |
| APY shows astronomical number | Very few tokens staked (per-staker rate explodes) | Divide by `totalSupply` not `circulatingSupply` |
| Bond price wrong | Live oracle asset mapping or LP reserves are wrong | Check synced price-asset addresses and LP reserves |
| "Bond too small" error | Payout < 0.01 PULSAR minimum | Enter larger amount (need ≥ 0.01 PULSAR payout) |
| "Approve" button stuck | Allowance not picked up after tx | Hard refresh; account-slice re-reads allowance |
| QUASAR price = 0 | Missing/empty frontend deployment addresses or unavailable oracle/LP | Run the frontend sync script and check the PulseChain RPC |
| LP ROI negative | LP pool has wrong ratio (10:1 vs 1:1) | Run `scripts/fixLP.js` or adjust `minimumPrice` |
