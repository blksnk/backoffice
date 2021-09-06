import Fetcher from '../fetch'

import {v4} from 'uuid';

export const tableName = (n, internal = false) => internal ? 'BACKOFFICE_INTERNAL_' + n : 'BACKOFFICE_' + n

export default class Table {
  constructor(options = {}) {
    this.name = options.name;
    this.columns = options.columns;
    this.internal = options.internal;
    this.rows = []
    this.needsUpdate = true;
    this.fetcher = new Fetcher()

    this.onLoad = options.onLoad || (() => null);

    this.init()
  }

  async init() {
    this.rows = await this.getAllRows()
  }

  get fullName() {
    return tableName(this.name, this.internal)
  }

  get routeName() {
    return this.internal ? '/internal/' + this.name : '/' + this.name
  }

  async getAllRows() {
    if(this.name === null) throw new Error('Table.getAllRows: no name provided.');
    const { data } = await this.fetcher.get(this.routeName);
    this.needsUpdate = false;
    this.onLoad(data)
    return data;
  }

  selectId(id) {
    if(!id) throw new Error('Table.selectId: no id provided.')
    return this.rows.find(r => r._id = id)
  }

  selectProp(prop, value) {
    if(!prop) throw new Error('Table.selectProp: no property provided.')
    if(!value) throw new Error('Table.selectProp: no value provided.')
    return this.rows.find(r => r[prop] === value);
  }

  findColumn(name) {
    if(!name) throw new Error('Table.findColumn: no name provided.')
    return this.columns.find(c => c.name === name)
  }

  async insertRow(newRow = {}) {
    if(!this.validate(newRow)) throw new Error('Table.insertRow: new row does not fit schema')

    const res = await this.fetcher.post(this.routeName, newRow)
    console.log(res)
    //fetch new rows
    this.needsUpdate = true;
    this.rows = await this.getAllRows()
    return newRow;
  }

  validate(newRow) {
    const rowProps = Object.keys(newRow)

    return this.columns.every(col => rowProps.includes(col.name) && !col.constraints.includes('NOT NULL'))
  }

  async updateRow(id, updates) {
    const names = this.columns.map(c => c.name);
    const props = Object.keys(updates);

    if(props.every(prop => names.includes(prop))) {
      const old = this.selectId(id)
      this.needsUpdate = true;

      const newRow = {
        ...old,
        ...updates
      }

      this.rows[this.rows.indexOf(old)] = newRow;

      await this.fetcher.put(this.routeName + '/' + id, updates)

      this.rows = await this.getAllRows()
      return newRow;
    } else {
      throw new Error('Table.update: unknown column specified')
    }
  }

  async deleteRow(id) {
    if(!id) throw new Error('Table.deleteRow: no id specified')
    this.rows.splice(this.rows.indexOf(this.selectId(id)))
    const res = await this.fetcher.delete(this.routeName + '/' + id)
  }
}