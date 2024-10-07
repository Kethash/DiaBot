import { Entity, Schema } from "redis-om";

export class Music extends Entity {}

export const music = new Schema(Music, {
    group: { type: 'string' },
    title: { type: 'string' },
    audio_url: { type: 'string' },
    link: { type: 'string' },
    image_link: { type: 'string' },
    image_alt: { type: 'string' }
})


