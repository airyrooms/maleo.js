import fs from 'fs';
/** @private does the file exist */
export const fileExist = (folderPath, fileName: string) => {
  return !!fs.readdirSync(folderPath).filter((p) => !!~p.indexOf(fileName)).length;
};
