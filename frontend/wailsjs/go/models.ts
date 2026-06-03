export namespace main {
	
	export class Config {
	    favoriteIds: number[];
	    lastLayout: string;
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.favoriteIds = source["favoriteIds"];
	        this.lastLayout = source["lastLayout"];
	    }
	}

}

