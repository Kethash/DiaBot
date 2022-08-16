import { Message, PartialMessage } from "discord.js";

export default function countReactions(message: Message<boolean> | PartialMessage) {
    return message.reactions.cache.reduce(
        (previousValue, currentValue) => previousValue + currentValue.count,0
    );
}