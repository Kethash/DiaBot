import { Entity, Schema } from "redis-om";

export class Music extends Entity {}

export const music = new Schema(Music, {
    group: { type: 'text' },
    title: { type: 'text' },
    audio_url: { type: 'text' },
    link: { type: 'text' },
    image_link: { type: 'text' },
    image_alt: { type: 'text' }
})


