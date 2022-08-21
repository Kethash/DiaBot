import { Entity, Schema } from "redis-om";

export class ServerConfigSchema extends Entity {}
export const serverconfig = new Schema(ServerConfigSchema, {
	guildId: { type: 'string' },
    guildName: { type: 'string' },
	loveleaveChannelId: { type: 'string' },
	loveleaveTime: { type: 'number' }
});

export class ReportedLinkSchema extends Entity {}
export const reportedlink = new Schema(ReportedLinkSchema, {
    guildId: { type: 'string' },
    messageContent: { type: 'text' },
    reporter: { type: 'string'},
    reporterHread: { type: 'string'}
});
