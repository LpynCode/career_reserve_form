import { Cascader } from "antd"
import { useEffect, useState } from "react"
import { IKnowledgeMap } from "../../shared/models/knowledge-map.interface";
import { getKnowledgeMap } from "../../api/knowledge-map";
import { mapToOptions } from "../../helpers/map-to-options";


export const KnowledgeMapSelect = () => {
    const [map, setMap] = useState<IKnowledgeMap | null>(null);

    useEffect(() => {
        getKnowledgeMap().then((data) => setMap(data))
    }, [])
    return <Cascader
        options={mapToOptions(map)}
    />
}