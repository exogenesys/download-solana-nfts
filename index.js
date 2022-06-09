const fs = require("fs");
const axios = require("axios");
const path = require("path");

const howRareId = "serumsurfers";

async function downloadImage(url, name) {
  if (!url || !name) {
    return;
  }
  console.log("Dowloading image: ", name);
  const imagePath = path.resolve(__dirname, "images", name + ".jpeg");
  const writer = fs.createWriteStream(imagePath);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function fetchMetadataFromHowRare(howRareId) {
  const res = await axios.get(
    "https://api.howrare.is/v0.1/collections/" + howRareId
  );

  return res.data.result.data.items;
}

async function main() {
  console.log("Dowloading metadata from how rare...");
  const nfts = await fetchMetadataFromHowRare(howRareId);
  const promises = nfts.map((nft) => {
    const imageUrl = nft.image;
    const name = nft.name;
    return downloadImage(imageUrl, name);
  });
  await Promise.all(promises);
  console.log("Dowloaded images successfully");
}

main();
