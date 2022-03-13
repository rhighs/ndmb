import Denque from "denque";

class SongQueue {
    private deque: Denque<string>;

    public constructor(songs: string[]) {
        this.deque = new Denque();
    }

    public next(): string | null {
        if (this.deque.size() > 0) {
            return this.deque.shift();
        }

        return ;
    }
}