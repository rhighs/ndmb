import Denque from "denque";
import { YoutubeSong } from "./youtube";

class SongQueue {
    private deque: Denque<YoutubeSong>;

    public constructor(songs: string[]) {
        this.deque = new Denque();
    }

    public next(): YoutubeSong | null {
        if (this.deque.size() == 0) {
            return null;
        }

        return this.deque.shift();
    }
}