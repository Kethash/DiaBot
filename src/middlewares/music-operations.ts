import axios, { AxiosResponse } from "axios";

export async function getMusicbyTitle(searchedTitle: string) {
    const res: AxiosResponse = await axios.get(`http://diaflask:5000/find/${searchedTitle.replace(' ','_')}`, { responseType: "json" });
    return res.data;
}
