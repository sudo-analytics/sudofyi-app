import "./App.css";
import "./mobile.css";
import { Link } from "react-router-dom";
import LinkIcon from "./components/LinkIcon";
import { ZDK } from "@zoralabs/zdk";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import LogoIcon from "./components/LogoIcon";
import {
  trim,
  toPercentage,
  completeMetadata,
  getNamelessCollections,
} from "./dataProcessing";

type Collections =
  | { state: "loading" }
  | { state: "error"; errorMessage: string }
  | { state: "loaded"; data: any[]; zoraData: any };

const App = () => {
  const [collections, setCollections] = useState<Collections>({
    state: "loading",
  });

  useEffect(() => {
    fetch("https://flask-production-21d5.up.railway.app/collections")
      .then((response) => response.json())
      .then((data) => {
        let allCollections = [...data].filter(
          (collection) =>
            collection.listings_number > 0 && collection.offers_eth > 0.01
        );
        let namelessCollections = getNamelessCollections(allCollections);
        const zdk = new ZDK();
        const args = {
          where: {
            collectionAddresses: namelessCollections,
          },
          includeFullDetails: false,
        };
        zdk.collections(args as any).then((response) => {
          setCollections({
            state: "loaded",
            data: allCollections,
            zoraData: response.collections.nodes,
          });
        });
      })
      .catch((err) => {
        setCollections({ state: "error", errorMessage: err.message });
      });
  }, []);

  if (collections.state === "error") {
    return <div>{collections.errorMessage}</div>;
  } else if (collections.state === "loading") {
    return (
      <div className="loader">
        <div className="logo-box">
          <LogoIcon />
          {/* <div>Sudoswap analytics</div> */}
        </div>
      </div>
    );
  } else if (collections.state === "loaded") {
    let zoraCollectionMapping = collections.zoraData;
    let allCollections = collections.data;
    console.log(allCollections);
    allCollections.sort((a, b) => b.volume_eth - a.volume_eth);
    allCollections = completeMetadata(zoraCollectionMapping, allCollections);
    let topMoverCollections = [...collections.data].sort(
      (a, b) => a.mover_rank - b.mover_rank
    );
    topMoverCollections = topMoverCollections.slice(0, 4);

    return (
      <div className="app">
        <Navbar />
        <div className="parent-container">
          <section className="top-mover-group">
            <div className="list-title">
              <h2>Top movers</h2>
              <h2>24h</h2>
            </div>
            <TopMoverList topMoverCollections={topMoverCollections} />
          </section>

          <section className="collection-group">
            <div className="list-title">
              <h2>All Collection</h2>
            </div>
            <CollectionList allCollections={allCollections} />
          </section>
        </div>
      </div>
    );
  } else {
    throw new Error("this case should never happen");
  }
};

const CollectionList = (props: any) => {
  const collectionItems = props.allCollections.map((collection: any) => (
    <Link to={`/${collection.collection_id}`} key={collection.collection_id}>
      <Collection collection={collection} />
    </Link>
  ));

  return (
    <section className="collection-list">
      <div className="table-head">
        <div className="title-group">Collection</div>
        <div className="data-group">
          <div className="price-group">Floor / Offer</div>
          <div className="delta">24h delta</div>
          <div className="volume">Volume</div>
          <div className="tvl-group">Items / Offers</div>
        </div>
      </div>
      {collectionItems}
    </section>
  );
};

const CollectionName = (props: any) => {
  if (props.collection.collection_name == null) {
    return (
      <div className="title-group">
        <div className="collection-name address">
          {props.collection.collection_id}
        </div>
        <div className="ticker">-</div>
        {/* <div className='nft-preview-list'>{listItems}</div> */}
      </div>
    );
  }
  return (
    <div className="title-group">
      <div className="collection-name address">
        {props.collection.collection_name}
      </div>
      <div className="ticker">{props.collection.ticker}</div>
      {/* <div className='nft-preview-list'>{listItems}</div> */}
    </div>
  );
};

const Collection = (props: any) => {
  // const listItems = props.collection.topImages.map((image:any) =>
  //   <img className='nft-preview' src={image}></img>
  // );
  const floor_price = trim(3, props.collection.floor_price);
  const best_offer = trim(3, props.collection.best_offer);
  const volume_eth = trim(3, props.collection.volume_eth);
  const listings_number = trim(0, props.collection.listings_number);
  const offers_eth = trim(3, props.collection.offers_eth);
  const delta_percentage = toPercentage(props.collection.delta_percentage);
  return (
    <div className="collection">
      <CollectionName collection={props.collection} />
      <div className="data-group">
        <div className="price-group">
          <div>{floor_price + " ETH"}</div>
          <div className="divider">/</div>
          <div>{best_offer + " ETH"}</div>
        </div>
        <div
          className={
            delta_percentage.includes("+")
              ? "delta positive"
              : delta_percentage.includes("-")
              ? "delta negative"
              : "delta neutral"
          }
        >
          {delta_percentage}
        </div>
        <div className="volume">{volume_eth + " ETH"}</div>
        <div className="tvl-group">
          <div>{listings_number}</div>
          <div className="divider">/</div>
          <div>{offers_eth + " ETH"}</div>
        </div>
        <div className="external-link">
          <a href={props.collection.url} target="_blank">
            <LinkIcon />
          </a>
        </div>
      </div>
    </div>
  );
};

const TopMoverList = (props: any) => {
  const collectionItems = props.topMoverCollections.map((collection: any) => (
    <Link to={`/${collection.collection_id}`} key={collection.collection_id}>
      <TopMover collection={collection} />
    </Link>
  ));
  return <section className="top-mover-list">{collectionItems}</section>;
};

const TopMover = (props: any) => {
  // const listItems = props.collection.topImages.map((image:any) =>
  //   <img className='nft-preview' src={image}></img>
  // );

  const floor_price = trim(3, props.collection.floor_price);
  const best_offer = trim(3, props.collection.best_offer);
  const volume_eth = trim(3, props.collection.volume_eth);
  const delta_percentage = toPercentage(props.collection.delta_percentage);

  return (
    <div className="top-mover">
      <CollectionName collection={props.collection} />
      <div className="card-data-group">
        <div>{floor_price + " ETH"}</div>
        <div
          className={
            delta_percentage.includes("+")
              ? "delta positive"
              : delta_percentage.includes("-")
              ? "delta negative"
              : "delta neutral"
          }
        >
          {delta_percentage}
        </div>
      </div>
    </div>
  );
};

export default App;
