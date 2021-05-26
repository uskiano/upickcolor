
    export function getIdCounter(): number {
        if (!(window as any).ConsecutiveId) {
            (window as any).ConsecutiveId = 0;
        }
        return (window as any).ConsecutiveId++;
    }

    export function newGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    export function newGuid8(): string {
        return 'xxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    export function idPrefixConseq(prefixNoDash: string, idsTaken: string[]): string {
        let max = Math.max(...idsTaken.concat(`${prefixNoDash}-0`).map(idTaken => parseInt(idTaken.split('-')[1])));
        return `${prefixNoDash}-${max + 1}`;
    }

    export function getNamePrefixTakenList(prefix: string, takenList: string[]) {
        if (!takenList || takenList.length === 0) return `${prefix}1`;

        let takenNumbers = takenList.map(p => extractNumberFromString(p));
        let max = Math.max(...takenNumbers);

        let value = max + 1;
        return `${prefix}${value}`;
    }

    export function extractNumberFromString(str:string): number {
        let result = str.match(/(\d+)(?!.*\d)/);
        if (!result || result.length == 0) {
            return 0;
        }
        else {
            return +result[0];
        }
    }
