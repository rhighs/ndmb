import Denque from "denque";

type MediaUrl = string;

class SongQueue {
    private deque: Denque<MediaUrl>;

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
        return this.deque.shift();
    }

    public clear(): void {
        this.deque.clear();
    }
}

export {
    SongQueue
}