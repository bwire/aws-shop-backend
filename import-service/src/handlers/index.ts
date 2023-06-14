import { ImportService } from "../service";
import { importCSVFile } from './importProductsFile';

const importService = new ImportService(); 
  
export const importProductsFile = importCSVFile(importService);