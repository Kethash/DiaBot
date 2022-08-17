import connectToRedis from "../functions/connect-to-redis";
import { reportedlink } from "../models/diatabase";
import { Client as OmClient } from 'redis-om';
import { createClient } from 'redis';

export async function reportLink(guildId: string, messageContent: string, user: string, hRuser: string): Promise<string> {
    const [redis, om]: [ReturnType<typeof createClient>, OmClient] = await connectToRedis();
    const reportlinkrepository = om.fetchRepository(reportedlink);
    // saves the entity into the database
    const entity = reportlinkrepository.createEntity({
        guildId: guildId,
        messageContent: messageContent,
        reporter: user,
        reporterHread: hRuser
    });

    // disconnect properly
    const [res, close] = await Promise.all([
        reportlinkrepository.save(entity),
        om.close(),
    ]);
    return res;
}