import { TournamentObject } from "../types/redisJsonTypes";

export class Tournament {
    name: string;
    host: string;
    participants: string[];

    constructor(name: string, host: string, participants: string[]) {
        this.name = name;
        this.host = host;
        this.participants = participants;
    }

    toCsv(): Buffer {
        const csvStringArray: string[] = [
            "name,host,participants",
            `${this.name},${this.host},${this.participants.toString()}`
        ];
        return Buffer.from(csvStringArray.join('\n')); 
    }

    toTxt(): Buffer {
        const txtArray: string[] = [
            `name: ${this.name}`,
            `host: ${this.host}`,
            `participants: ${this.participants.join('\n')}`
        ];
        return Buffer.from(txtArray.join('\n'));
    }

    toJSON(): Buffer {
        const jsonobject = {
            name: this.name,
            host: this.host,
            participants: this.participants
        }

        return Buffer.from(JSON.stringify(jsonobject));
    }
}