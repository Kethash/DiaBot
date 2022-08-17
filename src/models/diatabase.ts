import { Entity, Schema } from "redis-om";

class ServerConfigSchema extends Entity {}
export const serverconfig = new Schema(ServerConfigSchema, {
	guildId: { type: 'string' },
	loveleaveChannelId: { type: 'string' },
	loveleaveTime: { type: 'number' }
});

class ReportedLinkSchema extends Entity {}
export const reportedlink = new Schema(ReportedLinkSchema, {
    guildId: { type: 'string' },
    messageContent: { type: 'text' },
    reporter: { type: 'string'},
    reporterHread: { type: 'string'}
});
