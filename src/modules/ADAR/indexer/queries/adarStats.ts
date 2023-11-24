import { FPNumber } from '@sora-substrate/math';
import { Operation } from '@sora-substrate/util';
import { getCurrentIndexer, WALLET_CONSTS } from '@soramitsu/soraneo-wallet-web';
import { SubqueryIndexer, SubsquidIndexer } from '@soramitsu/soraneo-wallet-web/lib/services/indexer';
import { ModuleMethods, ModuleNames } from '@soramitsu/soraneo-wallet-web/lib/services/indexer/subsquid/types';
import { gql } from '@urql/core';

import type { SubqueryConnectionQueryResponse } from '@soramitsu/soraneo-wallet-web/lib/services/indexer/subquery/types';

const { IndexerType } = WALLET_CONSTS;

const SubqueryStatsQuery = gql<SubqueryConnectionQueryResponse<any>>`
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

export async function fetchData(address = ''): Promise<any> {
  const indexer = getCurrentIndexer();
  const filter = historyElementsFilter({
    address,
  });

  const variables = {
    filter,
  };
  const subqueryIndexer = indexer as SubqueryIndexer;
  const parseData = async (txs: any) => {
    const result: any = [];
    txs.forEach(async (tx) => {
      result.push(await subqueryIndexer.services.dataParser.parseTransactionAsHistoryItem(tx));
    });
    return result;
  };
  const data = await subqueryIndexer.services.explorer.fetchAllEntities(SubqueryStatsQuery, { ...variables });
  const result = await parseData(data);
  return result || [];
}
