import axios, { AxiosResponse } from 'axios';
import config from '../../challonge-config.json';

const CHALLONGE_BASE_URL = "https://api.challonge.com/v1/tournaments";
const API_KEY = config.challonge_api_key;

export async function createTournament(tournamentName: string, tournamentType: string): Promise<{success: boolean, data: any}> {
    
    return await axios.post(`${CHALLONGE_BASE_URL}.json`, {
        api_key: API_KEY,
        tournament: {
            name: tournamentName,
            tournament_type: tournamentType
        }
    }).then((value: AxiosResponse) => {
        return {
            success: true,
            data: value.data
        }
    }).catch((err) => {
        console.log(err);
        return {
            success: false,
            data: err
        }
    });
}

export async function addParticipants(url:string, participants: Array<{name: string}>) {
    return await axios.post(`${CHALLONGE_BASE_URL}/${url}/participants/bulk_add.json`,{ "participants": participants })
        .then((value: AxiosResponse) => true).catch(() => false);
}

export async function finishTournament(url: string): Promise<boolean> {
    return await axios.post(`${CHALLONGE_BASE_URL}/${url}/finalize.json`)
        .then((value: AxiosResponse) => {
            if (value.status === 200) return true;
            throw Error;
        }).catch(() => {
            return false;
    });
}

export async function deleteTournament(url: string): Promise<boolean> {
    return await axios.delete(`${CHALLONGE_BASE_URL}/${url}.json?api_key=${API_KEY}`)
        .then((value: AxiosResponse) => {
            if (value.status === 200) return true;
            throw Error;
        }).catch(() => {
            return false;
    });
}

export async function getTournamentByUrl(url: string): Promise<string> {
    return await axios.get(`${CHALLONGE_BASE_URL}/${url}.json?api_key=${API_KEY}`)
        .then((value: AxiosResponse) => value.data["tournament"]["name"])
        .catch((err) => {
            console.error(err)
            return "unknown";
        });
}

