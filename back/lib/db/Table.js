import Column, {TsColumn, IdColumn} from './Column.js';
import { q, tableName } from './index.js'

export default class Table {
  constructor(options) {
    this.name = options.name || null;
    this.ifNotExists = options.ifNotExists || false;
    this.internal = options.internal || false;
    this.columns = [
      new TsColumn(),
      new IdColumn(),
    ];
    if(options.columns) {
      options.columns.forEach(col => this.addColumn(col));
    }
  }

  get fullName() {
    return tableName(this.name, this.internal)
  }

  create() {
    if(this.name === null) throw new Error('Table.create: no name provided.');
    return q(`CREATE TABLE${this.ifNotExists ? ' IF NOT EXISTS' : ''} "${this.fullName}" (${this.columns.map((c) => c.string).join(', ')}, PRIMARY KEY(_id));`)
  }
  
  setName(name) {
    this.name = name;
    return this;
  }
  
  setInternal(bool) {
    this.internal = bool;
    return this;
  }
  
  addColumn(col) {
    if(col instanceof Column && !this.columns.find(c => c.name === col.name)) {
      this.columns.push(col);
    }
    return this;
  }
  
  getAllRows() {
    if(this.name === null) throw new Error('Table.getAllRows: no name provided.');
    return q(`SELECT * from "${this.fullName}"`)
  }

  selectId(id) {
    if(!id) throw new Error('Table.selectId: no id provided.')
    return q(`SELECT * from "${this.fullName}" WHERE _id = '${id}'`)
  }

  selectProp(prop, value) {
    if(!prop) throw new Error('Table.selectProp: no property provided.')
    if(!value) throw new Error('Table.selectProp: no value provided.')
    return q(`SELECT * from "${this.fullName}" WHERE ${prop} = '${value}'`)
  }

  // check if new row contains all required properties
  validate(newRow) {
    const rowProps = Object.keys(newRow)
    for (let col of this.columns) {
      console.log(col)
      if(!rowProps.includes(col.name) && col.constraints.includes('NOT NULL')) {
        return false
      }
    }
    return true;
  }

  formatValue(val, col) {
    switch(col.type) {
      case 'TEXT': 
        return `'${val}'`
      default:
        return val
    }
  }

  findColumn(name) {
    return this.columns.find(c => c.name === name)
  }

  insert(data = {}) {
    const props = Object.keys(data);
    const vals = Object.values(data).map((v, i) => this.formatValue(v, this.findColumn(props[i])))
    return q(`INSERT INTO "${this.fullName}" (${props.join(', ')}) VALUES (${vals.join(', ')})`)
  }

  update(id, data) {
    const names = this.columns.map(c => c.name);
    const props = Object.keys(data);

    if(props.every(prop => names.includes(prop))) {
      const updates = Object.entries(data).map(([key, val]) => key + " = " + this.formatValue(val, this.findColumn(key))).join(', ')
      const s = `UPDATE "${this.fullName}" SET ${updates} WHERE _id = '${id}'`

      return q(s);
    } else {
      throw new Error('Table.update: unknown column specified')
    }
  }

}