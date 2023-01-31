import collectionsMetadata from "./data/data-collectionsMetadata.json";
import { ZDK } from "@zoralabs/zdk";

const zdk = new ZDK();

export function completeMetadata(
  zoraCollectionMapping: any,
  collections: any[]
) {
  let colletionsCompleted: any[] = [];

  for (const key in collections) {
    let thisCollection = collections[key];
    let thisCollectionSudoUrl =
      "https://sudoswap.xyz/#/browse/buy/" + thisCollection.collection_id;
    thisCollection.url = thisCollectionSudoUrl;

    if (thisCollection.collection_name == null) {
      // check if zora has the data
      for (const key in zoraCollectionMapping) {
        if (
          zoraCollectionMapping[key].address.toLowerCase() ===
          thisCollection.collection_id.toLowerCase()
        ) {
          thisCollection.collection_name = zoraCollectionMapping[key].name;
          thisCollection.ticker = zoraCollectionMapping[key].symbol;
        }
      }
      // if zora doesn't have it, check if local data available
      if (thisCollection.collection_name == null) {
        const localName = collectionsMetadata.find(
          ({ collection_id }) =>
            collection_id.toLowerCase() ===
            thisCollection.collection_id.toLowerCase()
        );
        if (localName != undefined) {
          thisCollection.collection_name = localName.collection_name;
          thisCollection.ticker = localName.ticker;
        }
      }
    }
    colletionsCompleted.push(thisCollection);
  }

  return colletionsCompleted;
}

export function getNamelessCollections(collections: any[]) {
  let namelessCollections: any[] = [];
  for (const key in collections) {
    let thisCollection = collections[key];
    if (thisCollection.collection_name == null) {
      namelessCollections.push(thisCollection.collection_id);
    }
  }
  return namelessCollections;
}

export function trim(to: number, input: any) {
  if (typeof input === "number") {
    input = input.toFixed(to);
    return input;
  }
  return "0.00";
}

export function getBondingDelta(pool: any) {
  if (pool.bonding_curve == "linear") {
    return pool.bonding_delta + " ETH";
  } else {
    return pool.bonding_delta?.toLocaleString(undefined, {
      style: "percent",
      minimumFractionDigits: 2,
    });
  }
}

export function toPercentage(numb: any) {
  if (typeof numb === "number") {
    const percent = numb.toLocaleString(undefined, {
      style: "percent",
      minimumFractionDigits: 2,
    });
    if (numb > 0) {
      return "+" + percent;
    } else {
      return percent;
    }
  }
  return "0.00%";
}
