import {
  Config,
  getMarketByBaseSymbolAndKind,
  GroupConfig,
  MangoClient,
} from '../src';
import { Commitment, Connection } from '@solana/web3.js';
import configFile from '../src/ids.json';

async function snapshotOrderbook() {
  // setup client
  const config = new Config(configFile);
  const groupConfig = config.getGroupWithName('mainnet.1') as GroupConfig;
  const connection = new Connection(
    config.cluster_urls[groupConfig.cluster],
    'processed' as Commitment,
  );
  const client = new MangoClient(connection, groupConfig.mangoProgramId);

  // load group & market
  const perpMarketConfig = getMarketByBaseSymbolAndKind(
    groupConfig,
    'BTC',
    'perp',
  );
  const mangoGroup = await client.getMangoGroup(groupConfig.publicKey);
  const perpMarket = await mangoGroup.loadPerpMarket(
    connection,
    perpMarketConfig.marketIndex,
    perpMarketConfig.baseDecimals,
    perpMarketConfig.quoteDecimals,
  );

  // load bids
  const bids = await perpMarket.loadBids(connection);

  // print L2 orderbook data
  for (const [price, size] of bids.getL2(20)) {
    console.log(price, size);
  }

  // print L3 orderbook data
  for (const order of bids) {
    console.log(
      order.owner.toBase58(),
      order.orderId.toString('hex'),
      order.price,
      order.size,
      order.side,
    );
  }
}

snapshotOrderbook();
