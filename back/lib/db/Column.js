import { v4 } from 'uuid';

export default class Column {
  constructor(options = {}) {
    this.name = options.name || null;
    this.constraints = [];
    this.type = null;
    this.default = options.default || null;
    if(options.constraints) {
      this.setConstraints(options.constraints)
    }
    if(options.type) {
      this.setType(options.type)
    }
  }

  get string() {
    if (this.name === null || this.type === null) throw new Error("Column: no name or type specified")
    return `${this.name} ${this.type} ${this.constraints.join(' ')} ${this.default ? `DEFAULT ${this.default}` : ''}`
  }

  setName(name) {
    this.name = name;

    return this;
  }

  addConstraint(c) {
    const constraint = c.toUpperCase()
    const constraints = ['NOT NULL', 'UNIQUE', 'PRIMARY KEY', 'FOREIGN KEY', 'CHECK', 'EXCLUSION']

    if(constraints.includes(constraint) && !this.constraints.includes(constraint)) {
      this.constraints.push(constraint);
    } else throw new Error('Column: invalid constraint: "' + constraint + '"')

    return this;
  }

  setConstraints(constraints) {
    constraints.forEach(c => this.addConstraint(c))

    return this;
  }

  setType(t) {
    const type = t.toUpperCase()
    const types = ['BIGINT', 'ARRAY', 'BIGSERIAL', 'BIT', 'BIT VARYING', 'BOOLEAN', 'BOX', 'BYTEA', 'CHARACTER', 'CHARACTER VARYING', 'CIDR', 'CIRCLE', 'DATE', 'DOUBLE PRECISION', 'FLOAT8', 'INET', 'INTEGER', 'INVERVAL', 'JSON', 'JSONB', 'LINE', 'LSEG', 'MACADDR', 'MONEY', 'NUMERIC', 'PATH', 'PG_LSN', 'POINT', 'POLYGON', 'REAL', 'SMALLINT', 'SMALLSERIAL', 'SERIAL', 'TEXT', 'TIME', 'TIMETZ', 'TIMESTAMP', 'TIMESTAMP WITH TIME ZONE', 'TIMESTAMPTZ', 'TSQUERY', 'TSVECTOR', 'TXID_SNAPSHOT', 'UUID', 'XML']
    
    if(types.includes(type) || types.map(ty => ty + '[]').includes(type)) {
      this.type = type
    } else throw new Error('Column: invalid type: "' + type + '"')

    return this;
  }
}

export class IdColumn extends Column {
  constructor() {
    super({
      name: '_id',
      type: 'uuid',
      constraints: ['unique'],
      default: 'uuid_generate_v4()',
    })
  }
}

export class TsColumn extends Column {
  constructor() {
    super({
      name: '_ts',
      type: 'timestamptz',
      constraints: [],
      default: 'CURRENT_TIMESTAMP',
    })
  }
}