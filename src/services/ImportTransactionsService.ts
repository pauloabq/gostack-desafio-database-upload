import csvParse from 'csv-parse';
import path from 'path';
import fs from 'fs';

import uploadConfig from '../config/uploads';

class ImportTransactionsService {
  async execute(filename: string): Promise<string[][]> {
    // tenho aqui o filename. precisa abrir, fazer o loop, e gravar
    const userFilePath = path.join(uploadConfig.directory, filename);

    const readCSVStream = fs.createReadStream(userFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });
    const parseCSV = readCSVStream.pipe(parseStream);
    const lines: string[][] = [];

    parseCSV.on('data', line => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });
    return lines;
  }
}

export default ImportTransactionsService;
