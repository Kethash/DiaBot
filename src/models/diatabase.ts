import { Entity, Schema } from "redis-om";

export interface ServerConfigSchema {
    guildId: string,
    guildName: string,
    loveleaveChannelId: string,
	loveleaveTime: number
}
export class ServerConfigSchema extends Entity {
    get _loveleaveTime(): number {
        return this.loveleaveTime;
    }

    get _loveleaveChannelId(): string {
        return this.loveleaveChannelId;
    }

    setLoveLeaveTime(newLLtime: number) {
        this.loveleaveTime = newLLtime;
    }

    setloveleaveChannelId(newChannelId: string) {
        this.loveleaveChannelId = newChannelId;
    }

    get loveleaveChannelSetup(): Boolean {
        return this.loveleaveChannelId != '';
    }
}
export const serverconfig = new Schema(ServerConfigSchema, {
	guildId: { type: 'string' },
    guildName: { type: 'string' },
	loveleaveChannelId: { type: 'string' },
	loveleaveTime: { type: 'number' },
    botroles: { type: 'string[]' }
});

export interface QuizzSchema {
    name: string,
    guildID: string,
    players: string[]
}
export class QuizzSchema extends Entity {
    addPlayer(playerID: string): void {
        this.players.push(playerID);
    }

    get quizzPlayers(): string[] {
        return this.players;
    }

    get nbPlayers(): number {
        return this.players.length;
    }
}
export const quizz = new Schema(QuizzSchema, {
    name: { type: 'string' },
    guildID: { type: 'string' },
    players: { type: 'string[]' }
});

export interface QuizzPlayerSchema {
    name: string,
    quizzID: string,
    score: number
}
export class QuizzPlayerSchema extends Entity {
    increment() {
        this.score += 1;
    }
}
export const quizzplayer = new Schema(QuizzPlayerSchema, {
    name: { type: 'string' },
    quizzID: { type: 'string' },
    score: { type: 'number' }
});

export class AutoQuizz extends Entity {}
export const autoquizz = new Schema(AutoQuizz, {
    questions: {type: 'string'}, // Stringified JSON
    player: {type: 'string'}
})


// export class QuestionSchema extends Entity {}
// export const question = new Schema(QuestionSchema, {
//     id: { type: 'string' },

// });