import { promises as fs } from "fs";

const readHTML = async (path) => {
  try {
    const html = await fs.readFile(path, { encoding: "utf-8" });
    return html;
  } catch (err) {
    console.error(err);
    throw new Error("There was an error");
  }
};

export default readHTML;
