import { api, getCurrentIndexer, WALLET_CONSTS } from '@soramitsu/soraneo-wallet-web';
import { SubqueryIndexer } from '@soramitsu/soraneo-wallet-web/lib/services/indexer';
import { gql } from '@urql/core';

import type { HistoryItem } from '@sora-substrate/sdk';
import type { ConnectionQueryResponse } from '@soramitsu/soraneo-wallet-web/lib/services/indexer/subquery/types';

const { IndexerType } = WALLET_CONSTS;

const SubqueryStatsQuery = gql<ConnectionQueryResponse<any>>`
  query SubqueryHistoryElements(
    $first: Int = null
    $last: Int = null
    $offset: Int = null
    $after: Cursor = ""
    $before: Cursor = ""
    $orderBy: [HistoryElementsOrderBy!] = TIMESTAMP_DESC
    $filter: HistoryElementFilter
  ) {
    data: historyElements(
      first: $first
      last: $last
      offset: $offset
      before: $before
      after: $after
      orderBy: $orderBy
      filter: $filter
    ) {
      edges {
        node {
          id
          timestamp
          blockHash
          blockHeight
          module
          method
          address
          networkFee
          execution
          data
        }
      }
      pageInfo {
        ...PageInfoFragment
      }
      totalCount
    }
  }
  fragment PageInfoFragment on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
`;

export const historyElementsFilter = ({ address = '' }: any = {}): any => {
  const filter: any = {
    and: [],
  };

  filter.and.push({
    or: {
      module: {
        equalTo: 'liquidityProxy',
      },
      method: {
        equalTo: 'swapTransferBatch',
      },
    },
  });

  if (address) {
    filter.and.push({
      or: [
        {
          address: {
            equalTo: address,
          },
        },
      ],
    });
  }
  return filter;
};

export async function fetchData(address = ''): Promise<Array<HistoryItem>> {
  const indexer = getCurrentIndexer();
  if (indexer.type !== IndexerType.SUBQUERY) return [];
  let formattedAddress: string;
  if (address) {
    formattedAddress = address.startsWith('cn') ? address : api.formatAddress(address);
  } else {
    formattedAddress = '';
  }
  const filter = historyElementsFilter({
    address: formattedAddress,
  });

  const variables = {
    filter,
  };
  const subqueryIndexer = indexer as SubqueryIndexer;
  const parseData = async (txs: any) => {
    const result: Array<HistoryItem> = [];
    txs.forEach(async (tx) => {
      const parsedHistoryItem = await subqueryIndexer.services.dataParser.parseTransactionAsHistoryItem(tx);
      if (parsedHistoryItem) result.push(parsedHistoryItem);
    });
    return result;
  };
  const data = await subqueryIndexer.services.explorer.fetchAllEntities(SubqueryStatsQuery, { ...variables });
  const result = await parseData(data);
  return result || [];
}
