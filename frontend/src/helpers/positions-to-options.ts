import { BaseOptionType } from "antd/es/select";
import { IPosition } from "../shared/models/position.interface";


export const positionsToOptions = (positions: IPosition[]): BaseOptionType[] => {
    return positions.map((position) => ({value: position.id, label: position.name}))
}