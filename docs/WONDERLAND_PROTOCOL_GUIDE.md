# Wonderland Protocol — Full Guide

This document covers the **concepts**, **on-chain mechanics**, and **complete frontend (UI) functionality** for the Wonderland protocol deployed on PulseChain. The UI is a React/Redux app and this guide traces every user-facing feature end-to-end.

---

## 1. Token Overview

| Token | Role | Decimals | Contract |
|-------|------|----------|----------|
| **TIME** | Base protocol token. New TIME is minted by the treasury when reserves are deposited (bonds). | 9 | `TimeERC20Token` |
| **MEMO** | Rebasing staking receipt (≈ sOHM in Olympus). Balance grows each epoch. | 9 | `MEMOries` |
| **wMEMO** | Non-rebasing wrapper around MEMO. Holds a fixed share; each wMEMO is redeemable for more MEMO as the index rises. | 18 | `wMEMO` |

### Olympus name equivalents

| Olympus v1 | Wonderland |
|------------|------------|
| OHM | TIME |
| sOHM | MEMO |
| gOHM | wMEMO |

---

## 2. Core Protocol Mechanics

### Epochs

- Time is divided into **epochs** (configured as 8 hours on PulseChain testnet).
- At the end of each epoch, `staking.rebase()` is called (triggered by the first stake/unstake/redeem after the epoch ends).
- `rebase()` calls `distributor.distribute()` which **mints new TIME** to the staking contract.
- The staking contract then updates `epoch.distribute` = surplus TIME available for the next rebase.

### Staking Rebase

```
stakingRebase = nextRewardFor(staking) / TIME.totalSupply()
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

`staking.index()` is a monotonically increasing number that tracks total cumulative rebase growth since launch. It is used to convert between MEMO ↔ wMEMO:
- `wMEMO → MEMO`: `memoAmount = wMemoAmount × index / 1e9`
- `MEMO → wMEMO`: `wMemoAmount = memoAmount × 1e9 / index`

---

## 3. Dashboard Page

**Route:** `/`  
**Redux slice:** `app-slice.ts`

The dashboard reads on-chain data for PulseChain testnet and displays:

| Field | Source | Formula |
|-------|--------|---------|
| **wMEMO Price** | `stakingContract.index()` × TIME price | `index × $1 = $1` at launch |
| **Market Cap** | `memoContract.totalSupply()` × TIME price | `supply × $1` |
| **TVL** | `memoContract.circulatingSupply()` × TIME price | `stakedMEMO × $1` |
| **Treasury Balance** | `treasuryContract.totalReserves()` | Formatted as 9-dec TIME units |
| **Backing per wMEMO** | On testnet: `0` (no RFV API) | mainnet uses external fund API |

**Data flow:**
1. `useWeb3Context` detects network and provider
2. `loadAppDetails({ networkID, provider })` thunk is dispatched
3. For `PULSE_TESTNET`: reads directly from staking, MEMO, treasury, and distributor contracts
4. State stored in Redux `app` slice, consumed by `TreasuryDashboard` component

---

## 4. Stake Page

**Route:** `/stake`  
**Redux slices:** `app-slice.ts`, `account-slice.ts`, `stake-slice.ts`

### What it shows

| Field | Value | Source |
|-------|-------|--------|
| APY | ~23,000% | `(1 + rebase)^1095 - 1` from `distributor.nextRewardFor` |
| TVL | circulatingSupply × $1 | `memoContract.circulatingSupply()` |
| Current Index | staking index | `stakingContract.index()` formatted in gwei |
| Your Balance | TIME in wallet | `time.balanceOf(address)` |
| Your Staked Balance | MEMO in wallet | `memo.balanceOf(address)` |
| Wrapped Balance | wMEMO in wallet | `wmemo.balanceOf(address)` |
| Exchange Rate | 1 wMEMO = N MEMO | `wmemo.wMEMOToMEMO(1e18)` |
| Next Reward Amount | Upcoming MEMO rebase | `epoch.distribute` from staking |
| Next Reward Yield | Next rebase % | `epoch.distribute / circulatingSupply` |
| ROI (5-Day Rate) | 5-day compounded return | `(1 + rebase)^15 - 1` |

### Stake tab (TIME → MEMO)

1. User enters TIME amount
2. Clicks **Approve** → `time.approve(stakingHelper, MaxUint256)`
3. Clicks **Stake TIME** → `stakingHelper.stake(amount, address)`
   - StakingHelper wraps stake + claim in one tx
   - TIME transfers to staking contract
   - MEMO minted to user

### Unstake tab (MEMO → TIME)

1. User enters MEMO amount
2. Clicks **Approve** → `memo.approve(staking, MaxUint256)`
3. Clicks **Unstake MEMO** → `staking.unstake(amount, rebase=false)`
   - MEMO burns
   - TIME returned to user

### Wrap / Unwrap (MEMO ↔ wMEMO)

Located below the main stake panel:

- **Wrap:** `memo.approve(wmemo)` → `wmemo.wrap(memoAmount)`
- **Unwrap:** `wmemo.unwrap(wMemoAmount)` → returns MEMO

---

## 5. Mint (Bond) Page

**Route:** `/mints`  
**Redux slices:** `bond-slice.ts`, `account-slice.ts`

### Bond List (ChooseBond)

Displays all active bonds. For each bond:

| Column | Description |
|--------|-------------|
| **Mint** | Token name + icon |
| **Price** | USD cost to receive 1 TIME via this bond |
| **ROI** | `(marketPrice − bondPrice) / bondPrice × 100` |
| **Purchased** | Treasury balance of this reserve token |

**Currently active bonds on PulseChain testnet:**

| Bond | Type | Contract |
|------|------|----------|
| USDC | StableBond (`BondDepository`) | `USDCBondDepository` |
| WPLS | CustomBond (`EthBondDepository`) | `EthBondDepository` |

### Bond Price Calculation

**USDC bond** (`BondDepository`):
```
bondPriceInUSD() = bondPrice() × 10^reserveDecimals / 100
                 = minimumPrice × 1e6 / 100
minimumPrice = 100 → $1/TIME
```

**WPLS bond** (`EthBondDepository`):
```
bondPriceInUSD() = bondPrice() × assetPrice(oracle) × 1e6
UI formula: raw / 1e16 = USD/TIME
minimumPrice = 100 × 1e8 / oraclePrice (calculated dynamically)
```

### Bond Detail Modal

Opened by clicking **Mint** on a bond row.

#### Header

| Field | Description |
|-------|-------------|
| Mint Price | Bond price in USD per TIME |
| wMEMO Price | Current wMEMO market price |
| TIME Price | Current TIME market price ($1 on testnet) |

#### Mint tab

1. User enters amount of reserve token (e.g. `10 USDC`)
2. UI calls `bondContract.payoutFor(amount)` to show **You Will Get** (TIME)
3. **Approve** button: `reserveToken.approve(bondAddress, MaxUint256)`
   - Only needed once per bond
4. **Mint** button: `bondContract.deposit(amount, maxPrice, address)`
   - `maxPrice` = `bondPrice() × (1 + slippage)` (default 0.5%)
   - Treasury receives reserves, mints TIME to bond depository
   - Your vesting position is recorded on-chain

**Validations:**
- Amount > `maxBondPriceToken`: "Try minting less" error
- Payout < 0.01 TIME: "Bond too small" error (contract minimum)

#### Redeem tab

Shows your **current vesting position** for that bond:

| Field | Description |
|-------|-------------|
| Pending Rewards | TIME earned so far (vested portion) |
| Claimable Rewards | TIME you can claim now |
| Time Until Fully Vested | Remaining vesting time |
| ROI | Discount you locked in at bond time |

- **Claim** button: `bondContract.redeem(address, autostake=false)`
  - Transfers vested TIME to wallet
- **Claim and Autostake** button: `bondContract.redeem(address, autostake=true)`
  - Claims + immediately stakes TIME → you receive MEMO

**Important:** The original deposited asset (USDC/WPLS) **cannot be retrieved**. It is permanently held by the treasury. You receive TIME in return.

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
| wMEMO Amount | Your wMEMO balance | How many wMEMO you hold |
| APY (%) | Current staking APY | Expected annual return |
| Days | Slider (1–365) | Projection horizon |

### Calculation

```
epochRate = (1 + APY)^(1/1095) - 1      // per-epoch rate from APY
initialMEMO = wMEMOAmount × wMEMOtoMEMORate  // convert to MEMO units

balance = initialMEMO
for each epoch in (days × 3):
    balance += balance × epochRate

potentialWealth = balance × wMEMOPrice   // convert back to USD
```

### Outputs

| Field | Description |
|-------|-------------|
| Current Wealth | `wMEMOAmount × wMEMOPrice` |
| Potential Wealth | Projected USD value after compounding |
| Potential Lambos | `floor(potentialWealth / 220,000)` |

---

## 7. Wrap / Unwrap Page

**Route:** `/wrap` (if enabled)

Standalone interface for MEMO ↔ wMEMO conversion.

- **Wrap:** Enter MEMO → approve → `wmemo.wrap(amount)` → receive wMEMO
- **Unwrap:** Enter wMEMO → `wmemo.unwrap(amount)` → receive MEMO

Exchange rate displayed: `1 wMEMO = N MEMO` (increases over time as index grows).

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
│   ├── blockchain.ts         ← Network IDs (PULSE=369, PULSE_TESTNET=943)
│   └── view.ts               ← Feature flags per network (mints, farm, etc.)
│
├── helpers/bond/
│   ├── bond.ts               ← Bond base class (isLP, isEthBond, reserveDecimals)
│   └── index.ts              ← Bond instances + exports (usdcBond, wplsBond, ...)
│
├── store/slices/
│   ├── app-slice.ts          ← Global metrics (APY, TVL, wMEMO price, treasury)
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

Feature availability per network is controlled in `constants/view.ts`:
```typescript
// view.ts example for PULSE_TESTNET
[Networks.PULSE_TESTNET]: {
    mints: true,    // bonding enabled
    stake: true,
    farm: false,    // no farm contract
    ...
}
```

---

## 9. PulseChain Testnet vs Mainnet

| Feature | Mainnet | PulseChain Testnet |
|---------|---------|-------------------|
| TIME price | From DEX LP (PulseX) | Hardcoded `$1` |
| APY source | `epoch.distribute / circ` | `distributor.nextRewardFor / totalSupply` |
| Treasury data | Zapper API + on-chain | `treasury.totalReserves()` on-chain only |
| Bonds | Legacy MIM, AVAX, LP | USDC + WPLS |
| Oracles | Live DEX prices | Mock fixed-price oracles |
| Farm | Enabled | Disabled |
| wMEMO backing | RFV from fund API | `0` |

---

## 10. Contract Addresses (PulseChain Testnet)

| Contract | Address |
|----------|---------|
| TIME | `0xb0e21e5D5fceC4870332c7f0D0eB6641FaD16Ea1` |
| MEMO | `0x86D77b0A5bf68ADbb5Eb1A9a99695FA5d61EFc41` |
| wMEMO | `0x5B88d6Ca0e66b6E0B7e0c0a9aE5dF344d10e4a66` |
| MockUSDC | `0x9131d71A23e0cdd8F0086ea525D1076B72a749eD` |
| WPLS | `0x70499adEBB11Efd915E3b69E700c331778628707` |
| Treasury | `0xB2Aa7B8f75E6faD5d3a855fC49a6E7Acf07EeCD` |
| Staking | `0x8F0A50b0a43E9fFC0Bd1F0FD39dE26AF8D2FbC33` |
| StakingHelper | `0x4BAEA2dE7ACb649e20F5Bd53F9d3c3AEBcA62B6e` |
| Distributor | `0xD629612fed09BC583Ac22a0f57De49A89b953A59` |
| BondingCalculator | `0xB8E56B78ED6AC27A28DF7b32Ab2bDE8E2d0e6C6c` |
| USDCBondDepository | `0xC3da889bE5899F5f7c1f85147AA09a8bC6505fF1` |
| EthBondDepository (WPLS) | `0x422198AD5C252a4fe38d430f4cBD29687Ea51A3c` |
| PLSOracle | Deployed via `FixedPLSPriceOracle` |

---

## 11. Common Issues & Solutions

| Symptom | Cause | Fix |
|---------|-------|-----|
| APY shows 0% | `epoch.distribute` stale (pre-epoch) | Use `distributor.nextRewardFor` for display |
| APY shows astronomical number | Very few tokens staked (per-staker rate explodes) | Divide by `totalSupply` not `circulatingSupply` |
| Bond price wrong | Stale `minimumPrice` on contract | Run `scripts/setMinPrice.js` |
| "Bond too small" error | Payout < 0.01 TIME minimum | Enter larger amount (need ≥ 0.01 TIME payout) |
| "Approve" button stuck | Allowance not picked up after tx | Hard refresh; account-slice re-reads allowance |
| wMEMO price = $10 | Old hardcoded TIME price | Set `timePrice = 1` in `app-slice.ts` |
| LP ROI negative | LP pool has wrong ratio (10:1 vs 1:1) | Run `scripts/fixLP.js` or adjust `minimumPrice` |
