import { IWorldOptions, setWorldConstructor, World } from '@cucumber/cucumber';
import type { AxiosResponse } from 'axios';


export class AgifyWorld extends World {
public response!: AxiosResponse;
public names: string[] = [];


constructor(options: IWorldOptions) {
super(options);
}
}


setWorldConstructor(AgifyWorld);