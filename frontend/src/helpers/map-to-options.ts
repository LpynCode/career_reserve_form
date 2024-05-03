import { IKnowledgeMap } from "../shared/models/knowledge-map.interface"

interface Option {
    value: string | number;
    label: string;
    children?: Option[];
  }

export const mapToOptions = (map: IKnowledgeMap | null): Option[] => {
    if(!map) return []
    return map.map(({part, children_parts}) => ({value: part.id, label: part.name, children: mapToOptions(children_parts)}))
}