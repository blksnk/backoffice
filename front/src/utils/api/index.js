
import Fetcher from '../fetch.js'
import Table from './Table.js'

import { writable } from 'svelte/store'

export default class Api {
  constructor() {
    this.tables = [];
    this.url = 'http://localhost:3000';

    this.fetcher = new Fetcher();

    this.loaded = false;

    this.init();
  }

  async init() {
    this.tables = await this.fetchTables()
  }

  onLoaded() {
    this.loaded = true;
    console.log("LOADED ")
  }

  async fetchTables() {
    // get all tables & composition from db
    const { data } = await this.fetcher.get('/_table');

    // furnish all tables with stored content
    this.tables = data.map(t => new Table(t));

    // check for initial load of all tables
    const intervalId = setInterval(() => {
      if(this.tables.every(t => t.needsUpdate === false)) {
        window.clearInterval(intervalId)
        this.onLoaded()
      }
    }, 200)
    console.log(tables)
    return tables;
  }

  async fetchTableContent(table) {
    const routeName = table.internal ? '/internal/' + table.name : '/'+ table.name
    const { data } = await this.fetcher.get(routeName);
    console.log(routeName, data);
    return data;
  }

  async hydrateTable(table) {
    const rows = await this.fetchTableContent(table);
    const t = {...table, rows}

    return t;
  }
}
