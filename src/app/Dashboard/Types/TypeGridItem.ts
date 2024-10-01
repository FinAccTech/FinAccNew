import { TypeItem } from "../Classes/ClsItems";
import { TypePurity } from "../Classes/ClsPurities";

export interface TypeGridItem{
    Item: TypeItem;    
    Qty: number;
    Gross_Wt: number;
    Stone_Wt: number;
    Nett_Wt: number;
    Purity: TypePurity;    
    Item_Value: number;
    Remarks: string;
}