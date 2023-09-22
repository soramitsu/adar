import { FPNumber } from '@sora-substrate/util/build';
import { Asset, AccountAsset } from '@sora-substrate/util/build/assets/types';
import { api } from '@soramitsu/soraneo-wallet-web';
import { FiatPriceObject } from '@soramitsu/soraneo-wallet-web/lib/services/subquery/types';

import { Recipient } from './types';

import type { WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';

export default {
  validate(recipient: Recipient) {
    return (
      this.wallet(recipient.wallet) &&
      this.asset(recipient.asset) &&
      this.usd(recipient.usd) &&
      this.amount(recipient.amount)
    );
  },

  name(name: Nullable<string>) {
    return name;
  },

  wallet(wallet: string) {
    return api.validateAddress(wallet);
  },

  asset(asset: Asset | AccountAsset) {
    return asset;
  },

  usd(usd: FPNumber | string) {
    const testUsd = new FPNumber(usd);
    return testUsd && !testUsd.isNaN();
  },

  amount(amount?: FPNumber | string) {
    if (!amount) return false;
    const testAmount = new FPNumber(amount);
    return !testAmount.isNaN() && testAmount.isFinity();
  },
};

export function getTokenEquivalent(
  priceObject: FiatPriceObject,
  asset: Asset | AccountAsset | WhitelistArrayItem,
  usd: number | string
): FPNumber {
  return new FPNumber(usd).div(FPNumber.fromCodecValue(priceObject[asset.address], asset.decimals));
}

export function getAssetUSDPrice(asset, fiatPriceObject) {
  if (!asset) return FPNumber.ZERO;
  return FPNumber.fromCodecValue(fiatPriceObject[asset.address], asset.decimals);
}
