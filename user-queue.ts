import Denque from "denque";
import { AudioPlayer } from "@discordjs/voice";

interface UserQueue {
    player: AudioPlayer | null,
    queue: UrlQueue 
};

interface UserQueueByGuildId {
    [key: string]: UserQueue
};

type MediaUrl = string;

class UrlQueue {
    private deque: Denque<MediaUrl> = new Denque();

    public next(): MediaUrl | null {
        if (this.deque.size() == 0) {
            return null;
        }

        let item = this.deque.shift();

        return item !== undefined ? item : null;
    }

    public push(song: MediaUrl): void {
        this.deque.push(song);
    }

    public skipN(n: number): MediaUrl | null {
        if (n - 1 >= this.deque.size()) {
            return null;
        }

        this.deque.splice(0, n - 1);
        let popped = this.deque.shift();

        return popped ? popped : null;
    }

    public clear(): void {
        this.deque.clear();
    }
}

export {
    UserQueueByGuildId,
    UrlQueue
}