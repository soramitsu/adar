import { FPNumber } from '@sora-substrate/sdk';
import { BridgeAccountType } from '@sora-substrate/sdk/build/bridgeProxy/consts';
import { SubNetworkId, LiberlandAssetType } from '@sora-substrate/sdk/build/bridgeProxy/sub/consts';

import { SubAdapter } from '../substrate';

import type { CodecString } from '@sora-substrate/sdk';
import type { RegisteredAsset } from '@sora-substrate/sdk/build/assets/types';

export class LiberlandAdapter extends SubAdapter {
  protected override async getAssetDeposit(asset: RegisteredAsset): Promise<CodecString> {
    return await this.assetsAssetMinBalanceRequest(Number(asset.externalAddress));
  }

  protected override async getAccountAssetBalance(
    accountAddress: string,
    asset: RegisteredAsset
  ): Promise<CodecString> {
    return await this.assetsAccountRequest(accountAddress, Number(asset.externalAddress));
  }

  public override getTransferExtrinsic(asset: RegisteredAsset, recipient: string, amount: number | string) {
    const { externalAddress: address, externalDecimals: decimals } = asset;
    const value = new FPNumber(amount, decimals).toCodecString();

    const assetId = address ? { Asset: Number(address) } : LiberlandAssetType.LLD;

    return this.api.tx.soraBridgeApp.burn(
      // networkId
      SubNetworkId.Mainnet,
      // assetId
      assetId,
      // recipient
      { [BridgeAccountType.Sora]: recipient },
      // amount
      value
    );
  }

  /* Throws error until Substrate 5 migration */
  public override async getNetworkFee(asset: RegisteredAsset, sender: string, recipient: string): Promise<CodecString> {
    try {
      return await super.getNetworkFee(asset, sender, recipient);
    } catch (error) {
      // Hardcoded value for Liberland - 0.0106
      return '10600000000';
    }
  }
}
