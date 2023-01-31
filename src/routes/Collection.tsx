// @ts-nocheck
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ChartPrice from "../components/ChartPrice";
import ChartLiquidity from "../components/ChartLiquidity";
import LogoIcon from "../components/LogoIcon";
import { trim, getBondingDelta } from "../dataProcessing";
import LinkIcon from "../components/LinkIcon";
import { ZDK } from "@zoralabs/zdk";

// Types
type collectionDetail =
  | { state: "loading" }
  | { state: "error"; errorMessage: string }
  | { state: "loaded"; data: any[]; zoraData: any };

// Root -------------- //

export default function Collection() {
  // Global variables -------------- //
  const params = useParams();
  const collectionId = params.collectionId;
  const apiString =
    "https://flask-production-21d5.up.railway.app/collections/" + collectionId;

  // Get data from api
  const [collectionDetail, setcollectionDetail] = useState<collectionDetail>({
    state: "loading",
  });
  useEffect(() => {
    fetch(apiString)
      .then((response) => response.json())
      .then((data) => {
        const zdk = new ZDK();
        const args = {
          where: {
            collectionAddresses: collectionId,
          },
          includeFullDetails: false,
        };
        zdk.collections(args as any).then((response) => {
          setcollectionDetail({
            state: "loaded",
            data: data,
            zoraData: response.collections.nodes,
          });
        });
      })
      .catch((err) => {
        setcollectionDetail({ state: "error", errorMessage: err.message });
      });
  }, []);

  if (collectionDetail.state === "error") {
    return <div>{collectionDetail.errorMessage}</div>;
  } else if (collectionDetail.state === "loading") {
    return (
      <div className="loader">
        <div className="logo-box">
          <LogoIcon />
          {/* <div>Sudoswap analytics</div> */}
        </div>
      </div>
    );
  } else if (collectionDetail.state === "loaded") {
    let zoraCollectionData = collectionDetail.zoraData[0];

    let collectionPools = collectionDetail.data.pools;
    collectionPools.sort((a, b) => b.volume_eth - a.volume_eth);
    collectionPools = collectionPools.filter(
      (item) => item.offers_eth > 0.001 || item.listings_number > 0
    );
    const collectionTimeseries = collectionDetail.data.timeseries;
    const collectionMetadata = collectionDetail.data.collection;
    const collectionTimeseriesTrimmed = [];
    const collectionName =
      collectionMetadata.collection_name || zoraCollectionData.name;
    const collectionTicker =
      collectionMetadata.ticker || zoraCollectionData.symbol;

    checkWhetherToTrim: for (const key in collectionTimeseries) {
      if (collectionTimeseries[key].txn_price === null) {
        let isLeadingEmpty = true;
        let isTrailingEmpty = true;

        checkIfLeadingEmpty: for (let i = 0; i <= key; i++) {
          if (collectionTimeseries[i].txn_price != null) {
            isLeadingEmpty = false;
          }
        }

        checkIfTrailingEmpty: for (
          let i = key;
          i < collectionTimeseries.length;
          i++
        ) {
          if (collectionTimeseries[i].txn_price != null) {
            isTrailingEmpty = false;
          }
        }

        if (isLeadingEmpty || isTrailingEmpty) {
          continue checkWhetherToTrim;
        }
        collectionTimeseriesTrimmed.push(collectionTimeseries[key]);
      } else {
        collectionTimeseriesTrimmed.push(collectionTimeseries[key]);
      }
    }
    let latestDataPoint = collectionTimeseriesTrimmed.length - 1;
    let currentPrice =
      trim(3, collectionTimeseriesTrimmed[latestDataPoint].txn_price) + " ETH";
    let currentVolume =
      trim(3, collectionTimeseriesTrimmed[latestDataPoint].volume_eth) + " ETH";
    let currentListing =
      collectionTimeseriesTrimmed[latestDataPoint].listings_number + " items";
    let currentEthOffered =
      trim(3, collectionTimeseriesTrimmed[latestDataPoint].offers_eth) + " ETH";

    return (
      <div className="app">
        <Navbar />
        <div className="parent-container">
          <div className="chart-title-box">
            <div className="title-group">
              <h2 className="collection-name">{collectionName}</h2>
              <p className="collection-ticker">{collectionTicker}</p>
            </div>
            <div className="collection-external-group">
              <p className="collection-id">{params.collectionId}</p>
              <span className="external-link">
                <a
                  href={
                    "https://sudoswap.xyz/#/browse/buy/" + params.collectionId
                  }
                  target="_blank"
                >
                  <LinkIcon />
                </a>
              </span>
            </div>
          </div>
          <div className="chart-container">
            <div className="chart price-chart">
              <div className="chart-data-group">
                <p className="chart-data-label">Price: </p>
                <p className="chart-data-item">{currentPrice}</p>
                <p className="divider">/</p>
                <p className="chart-data-label">Volume: </p>
                <p className="chart-data-item">{currentVolume}</p>
              </div>
              <ChartPrice timeseries={collectionTimeseriesTrimmed} />
            </div>
            <div className="chart liquidity-chart">
              <div className="chart-data-group">
                <p className="chart-data-label">NFTs listed: </p>
                <p className="chart-data-item">{currentListing}</p>
                <p className="divider">/</p>
                <p className="chart-data-label">ETH offered: </p>
                <p className="chart-data-item">{currentEthOffered}</p>
              </div>
              <ChartLiquidity timeseries={collectionTimeseriesTrimmed} />
            </div>
          </div>
          <PoolList collectionPools={collectionPools} />
        </div>
      </div>
    );
  } else {
    throw new Error("this case should never happen");
  }
}

const PoolList = (props: any) => {
  const poolItems = props.collectionPools.map((pool: any) => (
    <Pool pool={pool} />
  ));

  return (
    <section className="pool-list">
      <div className="table-head">
        <div className="title-group">Pool address</div>
        <div className="data-group">
          <div className="price-group">Floor / Offer</div>
          <div className="bonding-group">Bonding curve</div>
          <div className="volume">Volume</div>
          <div className="tvl-group">Items / Offers</div>
        </div>
      </div>
      {poolItems}
    </section>
  );
};

const Pool = (props: any) => {
  // const listItems = props.allCollections.topImages.map((image:any) =>
  //   <img className='nft-preview' src={image}></img>
  // );

  const volume_eth = trim(3, props.pool.volume_eth);
  const offers_eth = trim(3, props.pool.offers_eth);
  const floor_price = trim(3, props.pool.floor_price);
  const best_offer = trim(3, props.pool.best_offer);
  const listings_number = trim(0, props.pool.listings_number);
  const bonding_curve = props.pool.bonding_curve;
  const bonding_delta = getBondingDelta(props.pool);
  const pool_link = "https://sudoswap.xyz/#/manage/" + props.pool.pool_address;

  return (
    <div className="pool">
      <div className="title-group">
        <div className="address">{props.pool.pool_address}</div>
        {/* <div className='nft-preview-list'>
          {listItems}
        </div> */}
      </div>
      <div className="data-group">
        <div className="price-group">
          <div>{floor_price + " ETH"}</div>
          <div className="divider">/</div>
          <div>{best_offer + " ETH"}</div>
        </div>
        <div className="bonding-group">
          {" "}
          {bonding_delta && (
            <>
              <div className="bonding-curve">{bonding_curve}</div>
              <div className="divider">@</div>
              <div className="bonding-delta">{bonding_delta}</div>
            </>
          )}
        </div>
        <div className="volume">{volume_eth + " ETH"}</div>
        <div className="tvl-group">
          <div>{listings_number}</div>
          <div className="divider">/</div>
          <div>{offers_eth + " ETH"}</div>
        </div>
        <div className="external-link">
          <a href={pool_link} target="_blank">
            <LinkIcon />
          </a>
        </div>
      </div>
    </div>
  );
};
