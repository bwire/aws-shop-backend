import { ImportService } from "../service";
import { importParser } from "./importFileParser";
import { importCSVFile } from './importProductsFile';

const importService = new ImportService(); 
  
export const importProductsFile = importCSVFile(importService);
export const importFileParser = importParser(importService);
